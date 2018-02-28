import * as Discord from 'discord.js'
import Track from './track'

export default abstract class TrackBase implements Track {
  abstract get title (): string
  abstract get artist (): string | null
  abstract get album (): string | null
  abstract get thumbnailUrl (): string | null
  abstract get length (): Date
  abstract get source (): string

  async prepare () {
    // noop
  }

  abstract play (voiceConnection: Discord.VoiceConnection, options: Discord.StreamOptions): Promise<Discord.StreamDispatcher | null>

  toString () {
    return `${this.title} - ${this.artist}`
  }

  toFormattedString (): string {
    return `**${this.title}** - *${this.artist}*`
  }

  toRichEmbed (): Discord.RichEmbed {
    const embed = new Discord.RichEmbed()
      .setTitle(this.title)
      .setAuthor(this.artist)
      .addField('Length', `${('0' + this.length.getHours()).slice(-2)}:${('0' + this.length.getMinutes()).slice(-2)}:${('0' + this.length.getSeconds()).slice(-2)}`, true)
      .setFooter(this.source)

    if (this.thumbnailUrl) embed.setThumbnail(this.thumbnailUrl)
    if (this.album) embed.addField('Album', this.album)

    return embed
  }
}
