const { lemonyFresh } = require(`../data`)
const { getContextEmote, logMessage, resetCooldownTimer } = require(`../utils`)

module.exports = {
    sayButt(props, splitMessage) {
        const { bot, chatroom, channel } = props
        logMessage([`> sayButt(channel: '${channel}', splitMessage: '${splitMessage}')`])

        if (lemonyFresh[channel].timers[`say-butt`].listening) {
            resetCooldownTimer(channel, `say-butt`)

            const suffix = splitMessage[1].toLowerCase()
            const dumbEmote = getContextEmote(`dumb`, channel)
            bot.say(chatroom, `But${suffix}? More like BUTT-${suffix} ${dumbEmote}`)

        } else { logMessage([`-> Timer in ${channel} 'say-butt' is not currently listening`]) }
    }
}
