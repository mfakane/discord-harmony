import * as Discord from 'discord.js'
import CommandBot from '../commandBot'
import DiscordBot from '../../discordBot'

export default class SystemBot extends CommandBot {
  help () {
    return `ℹ️ | 基本機能:\n${this.getHelpText()}`
  }

  @CommandBot.command('`2d6` のような記法でダイスを投げます。')
  private dice (source: Discord.Message, dice: string) {
    if (!dice) return
    const messages: string[] = []
    const countAndFaces = dice.split('d')
    const faces = parseInt(countAndFaces.pop() || '6', 10)
    const count = countAndFaces.length ? parseInt(countAndFaces.pop() || '1', 10) : 1
    let total = 0

    for (let i = 0; i < count; i++) {
      const value = Math.floor(Math.random() * faces + 1)
      messages.push(`**${value}**`)
      total += value
    }

    source.channel.send(`🎲 | \`${dice}\` の結果: ${messages.join(', ')}, 合計: **${total}**`)
  }
}
