import Track from './track'

export default class Playlist extends Array<Track> {
  get current () {
    return this.length ? this[0] : null
  }

  clear () {
    this.splice(0, this.length)
  }
}
