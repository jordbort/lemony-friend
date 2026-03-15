const BOT_USERNAME = process.env.BOT_USERNAME
const { settings } = require(`../config`)
const { getContextEmote, logMessage } = require(`../utils`)

module.exports = {
    catchPokemon(props) {
        const { bot, chatroom, channel } = props
        logMessage([`> catchPokemon(channel: '${channel}', playPCG: ${settings.playPCG})`])

        if (!settings.playPCG) {
            logMessage([`-> Playing PokemonCommunityGame is disabled, ignoring`])
            return
        }

        const reply = `!pokecatch ${settings.usedPokeball}`
        bot.say(chatroom, reply)
    },
    buyPokeballs(props) {
        const { bot, chatroom, channel } = props
        logMessage([`> buyPokeballs(channel: '${channel}')`])

        const reply = `!pokeshop pokeball ${settings.pokeballQuantity}`
        bot.say(chatroom, reply)
    },
    acknowledgeCaughtPokemon(props) {
        const { bot, chatroom, message, channel } = props
        logMessage([`> acknowledgeCaughtPokemon(channel: '${channel}')`])

        const hypeEmote = getContextEmote(`hype`, channel)
        const regex = /\(SHINY/

        regex.test(message)
            ? bot.say(chatroom, `Shiny hype! ${hypeEmote}`)
            : bot.say(chatroom, `${hypeEmote}`)
    }
}
