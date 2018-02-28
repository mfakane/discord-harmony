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

  @CommandBot.command('Let the bot join the current user\'s voice channel.')
  private async summon (source: Discord.Message) {
    const voiceChannel = source.member.voiceChannel
    if (!voiceChannel) return

    const player = this.getPlayer(source)
    await player.join(voiceChannel)

    await source.react('👌')
  }

  @CommandBot.command('Leaves the current voice channel.')
  private async leave (source: Discord.Message) {
    const player = this.getPlayer(source)
    player.leave()

    await source.react('👌')
  }

  @CommandBot.command('Search for a track.')
  private async search (source: Discord.Message, ...query: string[]) {
    const track = await this.findSingleTrack(query.join(' '))
    if (!track) {
      source.channel.send('No tracks found for query: `' + query + '`')
      return
    }
    source.channel.send(track.toRichEmbed())
  }

  @CommandBot.command('Search for a track and add it to playlist.')
  private async play (source: Discord.Message, ...query: string[]) {
    const player = this.getPlayer(source)
    if (!player.voiceConnection && source.member.voiceChannel) await player.join(source.member.voiceChannel)
    if (!query.length) {
      if (!player.playlist.length) {
        source.channel.send('Playlist is empty! Use `play <query>` to add some tracks.')
        return
      }
      await player.play()
      return
    }

    const wasEmpty = !player.playlist.length
    const track = await this.findSingleTrack(query.join(' '))
    if (!track) {
      source.channel.send('No tracks found for query: `' + query + '`')
      return
    }

    await player.enqueue(track)

    if (!wasEmpty || !player.voiceConnection) await source.channel.send(`Enqueued ${track.toFormattedString()} at position ${player.playlist.length}.`)

    source.channel.send(track.toRichEmbed())
  }

  private async findSingleTrack (query: string) {
    for (const provider of this.providers) {
      const track = await provider.findSingleTrack(query)
      if (track) return track
    }
    return null
  }

  @CommandBot.command('Show what track is playing now.')
  private async np (source: Discord.Message) {
    const player = this.getPlayer(source)
    const track = player.current

    if (!track) {
      source.channel.send('Playing nothing right now!')
      return
    }

    await source.channel.send(`Now playing: ${track.toFormattedString()}`)
    await source.channel.send(track.toRichEmbed())
  }

  @CommandBot.command('Skip current playing track.')
  private skip (source: Discord.Message) {
    const player = this.getPlayer(source)
    const track = player.current
    if (!track) return
    source.channel.send(`Skipping ${track.toFormattedString()}...`)
    player.skip()
  }

  @CommandBot.command('Stop playing tracks.')
  private async stop (source: Discord.Message) {
    const player = this.getPlayer(source)
    player.stop()

    await source.react('👌')
  }

  @CommandBot.command('Clear the whole playlist.')
  private async clear (source: Discord.Message) {
    const player = this.getPlayer(source)
    player.clear()

    await source.react('👌')
  }

  @CommandBot.command('Shows the playlist.')
  private async list (source: Discord.Message) {
    const player = this.getPlayer(source)
    if (!player.playlist.length) {
      source.channel.send('Playlist empty!')
      return
    }

    const message = player.playlist.map((track, index) => `${index + 1}. ${track.toFormattedString()}${player.isPlaying && index === 0 ? ' (Now Playing)' : ''}`).join('\n')
    await source.channel.send(message)
  }

  @CommandBot.command('Set the volume for music.')
  private async volume (source: Discord.Message, volume?: string) {
    const player = this.getPlayer(source)
    if (!volume) {
      source.channel.send(`Current volume: \`${player.volume}\``)
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

    this.notifyChannel(`Now playing: ${track.toFormattedString()}`)

    const stream = await track.play(this.voiceConnection, { volume: this.volume })

    if (!stream) throw new Error('Failed to play track')

    stream.on('end', reason => {
      (this.voiceConnection as any).setSpeaking(false)

      if (reason === 'userstop') return

      this.playlist.shift()
      if (!this.playlist.length) {
        this.notifyChannel('Nothing to play next!')
        return
      }

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
