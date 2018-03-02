import * as Discord from 'discord.js'
import CommandBot from '../commandBot'
import DiscordBot from '../../discordBot'

export default class SystemBot extends CommandBot {
  @CommandBot.command('Shows a help.')
  private help (source: Discord.Message) {
    const commands: string[] = []

    for (const bot of this.bot.bots) {
      if (!(bot instanceof CommandBot)) continue

      for (const command of bot.commands) {
        commands.push(`**${command[0]}** ${command[1].description}`)
      }
    }

    source.channel.send(`Available commands:\n${commands.join('\n')}`)
  }

  @CommandBot.command('Throws a dice by `2d6` syntax.')
  private dice (source: Discord.Message, dice: string) {
    if (!dice) return
    const messages: string[] = []
    const countAndFaces = dice.split('d')
    const faces = parseInt(countAndFaces.pop() || '6', 10)
    const count = countAndFaces.length ? parseInt(countAndFaces.pop() || '1', 10) : 1
    let total = 0

    for (let i = 0; i < count; i++) {
      const value = Math.floor(Math.random() * faces + 1)
      messages.push(value.toString())
      total += value
    }

    source.channel.send(`${messages.join(', ')}, Total: ${total}`)
  }
}
