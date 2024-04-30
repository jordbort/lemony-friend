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

        bot.say(chatroom, `!pokeshop pokeball 10`)
    },
    acknowledgeCaughtPokemon(props) {
        const { bot, chatroom, channel } = props
        logMessage([`> acknowledgeCaughtPokemon(channel: '${channel}')`])

        const hypeEmote = getHypeEmote(channel)
        bot.say(chatroom, `${hypeEmote}`)
    }
}
