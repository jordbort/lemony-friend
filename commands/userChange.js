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
        const { bot, chatroom, tags, self, channel, user, userNickname } = props
        const subStatus = tags.subscriber
        logMessage([`> handleSubChange(chatroom: '${chatroom}', userNickname: '${userNickname}', subStatus: ${subStatus})`])

        user[channel].sub = subStatus
        const positiveEmote = getContextEmote(`positive`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)

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
        const { bot, chatroom, tags, self, channel, username, user, userNickname } = props
        const modStatus = tags.mod
        logMessage([`> handleModChange(chatroom: '${chatroom}', userNickname: '${userNickname}', modStatus: ${modStatus})`])

        user[channel].mod = modStatus
        const positiveEmote = getContextEmote(`positive`, channel)

        if (modStatus) {
            self
                ? setTimeout(() => bot.say(chatroom, `Thank you for modding me! ${positiveEmote}`)
                    , 2000)
                : bot.say(chatroom, `Wow, ${userNickname} became a mod! ${positiveEmote}`)
        } else {
            while (mods[username].isModIn.includes(chatroom)) {
                mods[username].isModIn.splice(mods[username].isModIn.indexOf(chatroom), 1)
            }
        }
    },
    handleVIPChange(props) {
        const { bot, chatroom, tags, self, channel, user, userNickname } = props
        const vipStatus = !!tags.vip || !!tags.badges?.vip
        logMessage([`> handleVIPChange(chatroom: '${chatroom}', userNickname: '${userNickname}', vipStatus: ${vipStatus})`])

        user[channel].vip = vipStatus
        const positiveEmote = getContextEmote(`positive`, channel)

        if (vipStatus) {
            self
                ? setTimeout(() => bot.say(chatroom, `Thank you for giving me VIP! ${positiveEmote}`)
                    , 2000)
                : bot.say(chatroom, `Wow, ${userNickname} became a VIP! ${positiveEmote}`)
        }
    }
}
