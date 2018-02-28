import * as Discord from 'discord.js'
import * as PlayMusic from 'playmusic'
import PlayMusicClient from './client'
import TrackBase from '../../trackBase'

export default class PlayMusicTrack extends TrackBase {
  constructor (private playMusic: PlayMusicClient, private track: PlayMusic.Track) {
    super()
  }

  get title () {
    return this.track.title
  }

  get artist () {
    return this.track.artist
  }

  get album () {
    return this.track.album
  }

  get thumbnailUrl () {
    return this.track.albumArtRef && this.track.albumArtRef.length && this.track.albumArtRef[0].url || null
  }

  get length () {
    return new Date(0, 0, 0, 0, 0, 0, Number(this.track.durationMillis))
  }

  get source () {
    return 'Play Music'
  }

  async play (voiceConnection: Discord.VoiceConnection, options: Discord.StreamOptions) {
    const id = this.track.id || this.track.storeId
    if (!id) return null
    const stream = await this.playMusic.getStream(id)
    return voiceConnection.playStream(stream, options)
  }
}
