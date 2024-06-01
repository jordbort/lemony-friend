const { getHypeEmote, logMessage } = require(`../utils`)

module.exports = {
    catchPokemon(props) {
        const { bot, chatroom, channel, username } = props
        logMessage([`> catchPokemon(channel: '${channel}', username: '${username}')`])

        if (username !== `pokemoncommunitygame`) {
            logMessage([`-> Message not from PokemonCommunityGame, ignoring`])
            return
        }

        bot.say(chatroom, `!pokecatch`)
    },
    buyPokeballs(props) {
        const { bot, chatroom, channel } = props
        logMessage([`> buyPokeballs(channel: '${channel}')`])

        bot.say(chatroom, `!pokeshop pokeball 100`)
    },
    acknowledgeCaughtPokemon(props) {
        const { bot, chatroom, message, channel } = props
        logMessage([`> acknowledgeCaughtPokemon(channel: '${channel}')`])

        const hypeEmote = getHypeEmote(channel)
        const regex = /\(SHINY/

        regex.test(message)
            ? bot.say(chatroom, `Shiny hype! ${hypeEmote}`)
            : bot.say(chatroom, `${hypeEmote}`)
    }
}
