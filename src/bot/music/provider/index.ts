import Track from '../track'

export default interface Provider {
  initialize (): boolean
  findSingleTrack (query: string): Promise<Track | null>
}
