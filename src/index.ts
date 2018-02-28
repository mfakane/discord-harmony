import DiscordBot from './discordBot'

require('dotenv-safe').config({ allowEmptyValues: true })

const bot = new DiscordBot()
bot.start()
