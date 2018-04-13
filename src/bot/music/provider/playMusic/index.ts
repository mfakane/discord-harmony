import PlayMusicClient from './client'
import PlayMusicTrack from './track'
import Provider from '../'

export default class PlayMusicProvider implements Provider {
  private playMusic: PlayMusicClient

  constructor () {
    this.playMusic = new PlayMusicClient({
      email: process.env.PLAYMUSIC_EMAIL,
      password: process.env.PLAYMUSIC_PASSWORD,
      androidId: process.env.PLAYMUSIC_ANDROIDID,
      masterToken: process.env.PLAYMUSIC_MASTERTOKEN
    })
  }

  initialize () {
    return process.env.PLAYMUSIC_ENABLED === 'y'
  }

  async findSingleTrack (query: string) {
    const track = await this.playMusic.searchTrack(query)
    return track ? new PlayMusicTrack(this.playMusic, track) : null
  }
}
