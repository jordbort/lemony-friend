const { settings, grayTxt, resetTxt } = require(`../config`)
const { lemonyFresh } = require(`../data`)
const { resetCooldownTimer } = require(`../utils`)

module.exports = {
    catchPokemon(props) {
        const { bot, chatroom, channel } = props
        if (settings.debug) { console.log(`${grayTxt}> catchPokemon(channel: '${channel}')${resetTxt}`) }

        if (lemonyFresh[channel].timers[`!pokecatch`].listening) {
            resetCooldownTimer(channel, `!pokecatch`)

            bot.say(chatroom, `!pokecatch`)
        } else if (settings.debug) { console.log(`${grayTxt}-> Timer in ${channel} '!pokecatch' is not currently listening${resetTxt}`) }
    },
    retryCatchPokemon(props) {
        const { bot, chatroom, channel } = props
        if (settings.debug) { console.log(`${grayTxt}> retryCatchPokemon(channel: '${channel}')${resetTxt}`) }

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
