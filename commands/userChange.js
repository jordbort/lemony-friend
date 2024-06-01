const { chatColors } = require(`../config`)
const { getPositiveEmote, getNegativeEmote, getNeutralEmote, getDumbEmote, logMessage } = require(`../utils`)

module.exports = {
    handleColorChange(props) {
        const { bot, chatroom, tags, channel, user, userNickname } = props
        const newColor = tags.color || ``
        logMessage([`> handleColorChange(chatroom: '${chatroom}', user: '${userNickname}', newColor: '${newColor}')`])

        user.color = newColor
        const neutralEmote = getNeutralEmote(channel)
        newColor in chatColors
            ? bot.say(chatroom, `${userNickname} is ${chatColors[newColor].name} now! ${neutralEmote}`)
            : bot.say(chatroom, `Acknowledging ${userNickname}'s color change ${neutralEmote}`)
    },
    handleTurboChange(props) {
        const { bot, chatroom, tags, channel, user, userNickname } = props
        const turboStatus = tags.turbo
        logMessage([`> handleTurboChange(chatroom: '${chatroom}', user: '${userNickname}', turboStatus: ${turboStatus})`])

        user.turbo = turboStatus
        const positiveEmote = getPositiveEmote(channel)
        const dumbEmote = getDumbEmote(channel)
        if (turboStatus) { bot.say(chatroom, `Wow, ${userNickname} got Turbo? ${positiveEmote}`) }
        // for debugging why this might change to false
        else {
            logMessage([`-> TURBO BECAME FALSE? Status: ${turboStatus} - tags:`, tags])
            console.log(tags)
            bot.say(chatroom, `Ask jpeg why it looks like ${userNickname}'s Turbo status is ${turboStatus} now ${dumbEmote}`)
        }
    },
    handleSubChange(props) {
        const { bot, chatroom, tags, self, channel, user, userNickname } = props
        const subStatus = tags.subscriber
        logMessage([`> handleSubChange(chatroom: '${chatroom}', userNickname: '${userNickname}', subStatus: ${subStatus})`])

        user[channel].sub = subStatus
        const positiveEmote = getPositiveEmote(channel)
        const negativeEmote = getNegativeEmote(channel)

        if (self) {
            setTimeout(() => subStatus
                ? bot.say(chatroom, `Thank you for the gift sub! ${positiveEmote}`)
                : bot.say(chatroom, `Aww, did I lose my sub? ${negativeEmote}`)
                , 2000)
        } else if (subStatus) {
            bot.say(chatroom, `Wow, ${userNickname} is subbed now! ${positiveEmote}`)
        }
    },
    handleModChange(props) {
        const { bot, chatroom, tags, self, channel, user, userNickname } = props
        const modStatus = tags.mod
        logMessage([`> handleModChange(chatroom: '${chatroom}', userNickname: '${userNickname}', modStatus: ${modStatus})`])

        user[channel].mod = modStatus
        const positiveEmote = getPositiveEmote(channel)

        if (modStatus) {
            self
                ? setTimeout(() => bot.say(chatroom, `Thank you for modding me! ${positiveEmote}`)
                    , 2000)
                : bot.say(chatroom, `Wow, ${userNickname} became a mod! ${positiveEmote}`)
        }
    },
    handleVIPChange(props) {
        const { bot, chatroom, tags, self, channel, user, userNickname } = props
        const vipStatus = !!tags.vip || !!tags.badges?.vip
        logMessage([`> handleVIPChange(chatroom: '${chatroom}', userNickname: '${userNickname}', vipStatus: ${vipStatus})`])

        user[channel].vip = vipStatus
        const positiveEmote = getPositiveEmote(channel)

        if (vipStatus) {
            self
                ? setTimeout(() => bot.say(chatroom, `Thank you for giving me VIP! ${positiveEmote}`)
                    , 2000)
                : bot.say(chatroom, `Wow, ${userNickname} became a VIP! ${positiveEmote}`)
        }
    }
}
