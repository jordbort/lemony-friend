module.exports = {
    sayButt(props, splitMessage) {
        const { bot, chatroom } = props

        const suffix = splitMessage.slice(1).join(``)
        bot.say(chatroom, `But${suffix}? More like BUTT-${suffix}`)
    }
}
