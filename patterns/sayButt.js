const { getDumbEmote } = require(`../utils`)

module.exports = {
    sayButt(props, splitMessage) {
        const { bot, chatroom, channel } = props

        const suffix = splitMessage[1].toLowerCase()
        const dumbEmote = getDumbEmote(channel)
        bot.say(chatroom, `But${suffix}? More like BUTT-${suffix} ${dumbEmote}`)
    }
}
