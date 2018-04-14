import * as Discord from 'discord.js'
import * as PlayMusic from 'playmusic'
import * as Ytdl from 'ytdl-core'
import TrackBase from '../../trackBase'

export default class YoutubeTrack extends TrackBase {
  constructor (private videoInfo: Ytdl.videoInfo) {
    super()
  }

  get title () {
    return this.videoInfo.title
  }

  get artist () {
    return this.videoInfo.author.name
  }

  get album () {
    return null
  }

  get thumbnailUrl () {
    return this.videoInfo.thumbnail_url
  }

  get length () {
    return new Date(Number(this.videoInfo.length_seconds) * 1000)
  }

  get source () {
    return 'Youtube'
  }

  async play (voiceConnection: Discord.VoiceConnection, options: Discord.StreamOptions) {
    const stream = await Ytdl.downloadFromInfo(this.videoInfo)
    return voiceConnection.playStream(stream, options)
  }
}
