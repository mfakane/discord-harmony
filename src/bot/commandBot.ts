import * as Discord from 'discord.js'
import Bot from './'
import DiscordBot from '../discordBot'

export default abstract class CommandBot implements Bot {
  commands: Map<string, {
    command: Function,
    description: string
  }> = new Map()

  constructor (protected bot: DiscordBot) {
    for (const name in this) {
      const value = this[name] as any
      if (!(value instanceof CommandDefinition)) continue
      this.commands.set(name, value)
    }
  }

  protected get client () {
    return this.bot.client
  }

  protected static command (description: string) {
    return (target: Bot, propertyKey: string, descriptor: PropertyDescriptor) => {
      descriptor.enumerable = true
      descriptor.value = new CommandDefinition(descriptor.value, description)
    }
  }

  initialize (bot: DiscordBot) {
    return true
  }

  async invokeCommand (source: Discord.Message, commandName: string, ...args: string[]) {
    const command = this.commands.get(commandName)
    if (!command) return false
    try {
      const rt = command.command.call(this, source, ...args)
      if (rt instanceof Promise) {
        await rt
      }
    } catch (ex) {
      source.channel.send(`⚠️ ｜コマンドの実行に失敗しました: \`${ex}\``)
    }
    return true
  }

  help () {
    return ''
  }

  protected getHelpText () {
    const commands: string[] = []
    for (const command of this.commands) {
      commands.push(`**${command[0]}** ${command[1].description}`)
    }
    return commands.join('\n')
  }
}

class CommandDefinition {
  constructor (public command: Function, public description: string) {
  }
}
