import * as Discord from 'discord.js'
import CommandBot from '../commandBot'
import DiscordBot from '../../discordBot'
import Playlist from './playlist'
import PlayMusicProvider from './provider/playMusic'
import Provider from './provider'
import Track from './track'

export default class MusicBot extends CommandBot {
  private players = new Map<Discord.Snowflake, Player>()
  private providers = [
    new PlayMusicProvider()
  ]

  initialize (bot: DiscordBot) {
    return process.env.MUSICBOT_ENABLED === 'y'
        && super.initialize(bot)
  }

  @CommandBot.command('現在ユーザがいる音声チャンネルに呼び出します。')
  private async summon (source: Discord.Message) {
    const voiceChannel = source.member.voiceChannel
    if (!voiceChannel) return

    const player = this.getPlayer(source)
    await player.join(voiceChannel)

    await source.react('👌')
  }

  @CommandBot.command('現在入っている音声チャンネルから退出します。')
  private async leave (source: Discord.Message) {
    const player = this.getPlayer(source)
    player.leave()

    await source.react('👌')
  }

  @CommandBot.command('指定された楽曲を検索します。')
  private async search (source: Discord.Message, ...query: string[]) {
    const track = await this.findSingleTrack(query.join(' '))
    if (!track) {
      source.channel.send('🔍 | `' + query + '` に関する楽曲が見つかりませんでした。')
      return
    }
    source.channel.send(track.toRichEmbed())
  }

  @CommandBot.command('プレイリストにある楽曲を再生するか、指定された楽曲を検索しプレイリストに追加します。')
  private async play (source: Discord.Message, ...query: string[]) {
    const player = this.getPlayer(source)
    if (!player.voiceConnection && source.member.voiceChannel) await player.join(source.member.voiceChannel)
    if (!query.length) {
      if (!player.playlist.length) {
        source.channel.send('🎵 ｜プレイリストは空です。`play <検索文字列>` を使用して再生したい楽曲を追加してください。')
        return
      }
      await player.play()
      return
    }

    const wasEmpty = !player.playlist.length
    const track = await this.findSingleTrack(query.join(' '))
    if (!track) {
      source.channel.send('🔍 | `' + query + '` に関する楽曲が見つかりませんでした。')
      return
    }

    await player.enqueue(track)

    if (!wasEmpty || !player.voiceConnection) await source.channel.send(`🎵 | ${player.playlist.length} 番目の楽曲としてプレイリストに追加しました: ${track.toFormattedString()}`)

    source.channel.send(track.toRichEmbed())
  }

  private async findSingleTrack (query: string) {
    for (const provider of this.providers) {
      const track = await provider.findSingleTrack(query)
      if (track) return track
    }
    return null
  }

  @CommandBot.command('再生中の楽曲を表示します。')
  private async np (source: Discord.Message) {
    const player = this.getPlayer(source)
    const track = player.current

    if (!track) {
      source.channel.send('⏹️ | 現在再生中の楽曲はありません。')
      return
    }

    await source.channel.send(`▶️ | 再生中: ${track.toFormattedString()}`)
    await source.channel.send(track.toRichEmbed())
  }

  @CommandBot.command('再生中の楽曲をスキップします。')
  private skip (source: Discord.Message) {
    const player = this.getPlayer(source)
    const track = player.current
    if (!track) return
    source.channel.send(`⏭️ | ${track.toFormattedString()} をスキップします...`)
    player.skip()
  }

  @CommandBot.command('楽曲の再生を停止します。')
  private async stop (source: Discord.Message) {
    const player = this.getPlayer(source)
    player.stop()

    await source.react('👌')
  }

  @CommandBot.command('プレイリストをクリアします。')
  private async clear (source: Discord.Message) {
    const player = this.getPlayer(source)
    player.clear()

    await source.react('👌')
  }

  @CommandBot.command('プレイリストにある楽曲を一覧します。')
  private async list (source: Discord.Message) {
    const player = this.getPlayer(source)
    if (!player.playlist.length) {
      source.channel.send('🎵 | プレイリストは空です。')
      return
    }

    const list = player.playlist.map((track, index) => `${index + 1}. ${track.toFormattedString()}${player.isPlaying && index === 0 ? ' (再生中)' : ''}`).join('\n')
    const totalLength = new Date(player.playlist.reduce((time, track) => time + track.length.valueOf(), 0))
    await source.channel.send(`🎵 | プレイリストには楽曲が **${player.playlist.length}** 件あり、合計時間は **${totalLength.toUTCString().split(' ')[4]}** です。\n` + list)
  }

  @CommandBot.command('現在の音量を表示もしくは新しい音量を設定します。')
  private async volume (source: Discord.Message, volume?: string) {
    const player = this.getPlayer(source)
    if (!volume) {
      source.channel.send(`🔈 | 現在の音量: **${player.volume}**`)
      return
    }
    const volumeAmount = Math.max(0, Math.min(Number(volume), 1))
    player.volume = volumeAmount

    await source.react('👌')
  }

  private getPlayer (source: Discord.Message) {
    let player = this.players.get(source.guild.id)
    if (!player) this.players.set(source.guild.id, player = new Player(source.guild))

    player.setNotificationChannel(source.channel)

    return player
  }
}

class Player {
  playlist = new Playlist()
  private client: Discord.Client
  private guild: Discord.Guild
  private internalVolume = 0.1
  private notifyChannel: (message: string) => void

  constructor (guild: Discord.Guild) {
    this.client = guild.client
    this.guild = guild
    this.notifyChannel = _ => { /* noop */ }
  }

  get volume () {
    return this.internalVolume
  }

  set volume (volume: number) {
    this.internalVolume = volume
    if (this.isPlaying) this.stream.setVolume(volume)
  }

  get isPlaying () {
    return !!(this.voiceConnection && this.stream && this.playlist.current)
  }

  get voiceConnection () {
    return this.guild.voiceConnection
  }

  get stream () {
    return this.voiceConnection.dispatcher
  }

  get current () {
    return this.isPlaying ? this.playlist.current : null
  }

  async join (voiceChannel: Discord.VoiceChannel) {
    this.leave()
    await voiceChannel.join()
  }

  setNotificationChannel (channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel) {
    this.notifyChannel = message => channel.send(message)
  }

  leave () {
    if (!this.voiceConnection) return
    this.stop()
    this.voiceConnection.disconnect()
  }

  async enqueue (...tracks: Track[]) {
    tracks.forEach(track => track.prepare())
    this.playlist.push(...tracks)

    if (!this.isPlaying) await this.play()
  }

  async play () {
    if (!this.playlist.current) return

    const track = this.playlist.current

    this.notifyChannel(`▶️ | 再生中: ${track.toFormattedString()}`)

    const stream = await track.play(this.voiceConnection, { volume: this.volume })

    if (!stream) throw new Error('⚠️ | 楽曲の再生に失敗しました。')

    stream.on('end', reason => {
      (this.voiceConnection as any).setSpeaking(false)

      if (reason === 'userstop') return

      this.playlist.shift()
      if (!this.playlist.length) return

      this.play()
    })
  }

  skip () {
    if (!this.isPlaying) return
    this.stream.end()
  }

  stop () {
    if (!this.isPlaying) return
    this.stream.end('userstop')
  }

  clear () {
    this.stop()
    this.playlist.clear()
  }
}
