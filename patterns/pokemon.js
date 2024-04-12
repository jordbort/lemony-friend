const { settings, grayTxt, resetTxt } = require(`../config`)

module.exports = {
    catchPokemon(props) {
        const { bot, chatroom, channel } = props
        if (settings.debug) { console.log(`${grayTxt}> catchPokemon(channel: '${channel}')${resetTxt}`) }

        bot.say(chatroom, `!pokecatch`)
    },
    buyPokeballs(props) {
        const { bot, chatroom, channel } = props
        if (settings.debug) { console.log(`${grayTxt}> buyPokeballs(channel: '${channel}')${resetTxt}`) }

        bot.say(chatroom, `!pokeshop pokeball 10`)
    },
    acknowledgeCaughtPokemon(props) {
        const { bot, chatroom, channel } = props
        if (settings.debug) { console.log(`${grayTxt}> acknowledgeCaughtPokemon(channel: '${channel}')${resetTxt}`) }

        const hypeEmote = getHypeEmote(channel)
        bot.say(chatroom, `${hypeEmote}`)
    }
}
