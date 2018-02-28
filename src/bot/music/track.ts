import * as Discord from 'discord.js'

export default interface Track {
  title: string
  artist: string | null
  thumbnailUrl: string | null
  length: Date
  source: string

  prepare (): Promise<void>
  play (voiceConnection: Discord.VoiceConnection, options: Discord.StreamOptions): Promise<Discord.StreamDispatcher | null>
  toString (): string
  toFormattedString (): string
  toRichEmbed (): Discord.RichEmbed
}
