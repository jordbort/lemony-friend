const { mods } = require(`../data`)
const { chatColors } = require(`../config`)
const { getContextEmote, logMessage } = require(`../utils`)

module.exports = {
    handleColorChange(props) {
        const { bot, chatroom, tags, channel, user, userNickname } = props
        const newColor = tags.color || ``
        logMessage([`> handleColorChange(chatroom: '${chatroom}', user: '${userNickname}', newColor: '${newColor}')`])
        user.color = newColor

        const neutralEmote = getContextEmote(`neutral`, channel)
        newColor in chatColors
            ? bot.say(chatroom, `${userNickname} is ${chatColors[newColor].name} now! ${neutralEmote}`)
            : bot.say(chatroom, `Acknowledging ${userNickname}'s color change ${neutralEmote}`)
    },
    handleSubChange(props) {
        const { bot, chatroom, tags, channel, userChannel, userNickname } = props
        const subStatus = tags.subscriber
        logMessage([`> handleSubChange(chatroom: '${chatroom}', userNickname: '${userNickname}', subStatus: ${subStatus})`])
        userChannel.sub = subStatus

        const positiveEmote = getContextEmote(`positive`, channel)
        if (subStatus) {
            bot.say(chatroom, `Wow, ${userNickname} is subbed now! ${positiveEmote}`)
        }
    },
    handleModChange(props) {
        const { bot, chatroom, tags, channel, username, userChannel, userNickname } = props
        const modStatus = tags.mod
        logMessage([`> handleModChange(chatroom: '${chatroom}', userNickname: '${userNickname}', modStatus: ${modStatus})`])
        userChannel.mod = modStatus

        const positiveEmote = getContextEmote(`positive`, channel)
        if (modStatus) {
            bot.say(chatroom, `Wow, ${userNickname} became a mod! ${positiveEmote}`)
        } else {
            while (mods[username].isModIn.includes(chatroom)) {
                mods[username].isModIn.splice(mods[username].isModIn.indexOf(chatroom), 1)
            }
        }
    },
    handleVIPChange(props) {
        const { bot, chatroom, tags, channel, userChannel, userNickname } = props
        const vipStatus = !!tags.vip || !!tags.badges?.vip
        logMessage([`> handleVIPChange(chatroom: '${chatroom}', userNickname: '${userNickname}', vipStatus: ${vipStatus})`])
        userChannel.vip = vipStatus

        const positiveEmote = getContextEmote(`positive`, channel)
        if (vipStatus) {
            bot.say(chatroom, `Wow, ${userNickname} became a VIP! ${positiveEmote}`)
        }
    }
}
