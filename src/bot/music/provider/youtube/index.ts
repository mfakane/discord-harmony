import * as Ytdl from 'ytdl-core'
import Provider from '../'
import YoutubeTrack from './track'

export default class YoutubeProvider implements Provider {
  initialize () {
    return process.env.YOUTUBE_ENABLED === 'y'
  }

  async findSingleTrack (query: string) {
    if (query.indexOf('https://www.youtube.com/watch?') !== 0 &&
        query.indexOf('https://youtu.be/') !== 0) return null
    const videoInfo = await Ytdl.getInfo(query)
    return new YoutubeTrack(videoInfo)
  }
}
