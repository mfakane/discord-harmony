import * as Discord from 'discord.js'
import DiscordBot from '../discordBot'

export default interface Bot {
  commands: Map<string, {
    command: Function,
    description: string
  }>

  initialize (bot: DiscordBot): boolean
  invokeCommand (source: Discord.Message, commandName: string, ...args: string[]): Promise<boolean>
}
