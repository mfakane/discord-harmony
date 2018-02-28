import * as PlayMusic from 'playmusic'
import * as Util from 'util'

class PlayMusicClient {
  private client: PlayMusic | null = null

  constructor (private credentials: PlayMusicClient.Credentials) {
  }

  async searchTrack (query: string) {
    const searchResults = await this.withClient(client => client.search, query, 1)

    if (!searchResults.entries) return null
    for (const entry of searchResults.entries) {
      if (!entry.track) continue
      return entry.track
    }

    return null
  }

  async searchStation (query: string) {
    const searchResults = await this.withClient(client => client.search, query, 1)

    if (!searchResults.entries) return null
    for (const entry of searchResults.entries) {
      if (!entry.station) continue
      return entry.station
    }

    return null
  }

  getStream (id: string) {
    return this.withClient(client => client.getStream, id)
  }

  private async withClient<TResult> (action: (client: PlayMusic) => (callback: (err: Error, result: TResult) => void) => void): Promise<TResult>
  private async withClient<T1, TResult> (action: (client: PlayMusic) => (arg1: T1, callback: (err: Error, result: TResult) => void) => void, arg1: T1): Promise<TResult>
  private async withClient<T1, T2, TResult> (action: (client: PlayMusic) => (arg1: T1, arg2: T2, callback: (err: Error, result: TResult) => void) => void, arg1: T1, arg2: T2): Promise<TResult>
  private async withClient (action: (client: PlayMusic) => Function, ...args: any[]) {
    try {
      const client = await this.getClient()
      return await Util.promisify(action(client).bind(client))(...args)
    } catch {
      const client = await this.getClient(true)
      const result = await Util.promisify(action(client).bind(client))(...args)
      return result
    }
  }

  private async getClient (force = false) {
    if (!this.client || force) {
      this.client = new PlayMusic()
      await Util.promisify(this.client.init.bind(this.client))(this.credentials)
    }
    return this.client
  }
}

namespace PlayMusicClient {
  export interface Credentials {
    email?: string
    password?: string
    androidId?: string
    masterToken?: string
  }
}

export default PlayMusicClient
