const { getDumbEmote, logMessage } = require(`../utils`)

module.exports = {
    sayButt(props, splitMessage) {
        const { bot, chatroom, channel } = props
        logMessage([`> sayButt(channel: '${channel}', splitMessage: '${splitMessage}')`])

        const suffix = splitMessage[1].toLowerCase()
        const dumbEmote = getDumbEmote(channel)
        bot.say(chatroom, `But${suffix}? More like BUTT-${suffix} ${dumbEmote}`)
    }
}
