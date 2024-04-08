const { users } = require(`../data`)
const { resetTxt, grayTxt, chatColors, settings } = require(`../config`)

const { getLemonEmote, getDumbEmote, pluralize, getNeutralEmote, getToUser } = require(`../utils`)

module.exports = {
    sayOnlineTime(props) {
        const { bot, chatroom, channel } = props
        if (settings.debug) { console.log(`${grayTxt}> sayOnlineTime(channel: '${channel}')${resetTxt}`) }

        const neutralEmote = getNeutralEmote(channel)
        bot.say(chatroom, `I have been online since ${settings.startTime}! ${neutralEmote}`)
    },
    getLastMessage(props) {
        const { bot, chatroom, args, channel, username, user, userNickname, toUser, target, targetNickname } = props
        const otherChannel = getToUser(args[1])
        const userObj = target || user
        const userObjNickname = targetNickname || userNickname
        if (settings.debug) { console.log(`${grayTxt}> getLastMessage(chatroom: '${chatroom}', userObj: '${target ? toUser : username}, otherChannel: '${otherChannel}')${resetTxt}`) }

        otherChannel in userObj
                ? bot.say(chatroom, `${userObjNickname} last said: "${userObj[otherChannel].lastMessage}" in ${otherChannel}'s chat!`)
                : bot.say(chatroom, `${userObjNickname} last said: "${userObj[channel].lastMessage}" in ${channel}'s chat!`)
    },
    getMessageCount(props) {
        const { bot, chatroom, username, user, userNickname, toUser, target, targetNickname } = props
        const userObj = target || user
        if (settings.debug) { console.log(`${grayTxt}> getMessageCount(chatroom: '${chatroom}', userObj: '${target ? toUser : username}')${resetTxt}`) }

        let response = `${targetNickname || userNickname} has sent `
        const channels = Object.keys(userObj)
            .filter(channel => typeof userObj[channel] === `object`)
            .map(channel => `${pluralize(userObj[channel].msgCount, `message`, `messages`)} in ${channel}'s chat`)

        if (channels.length > 1) {
            channels[channels.length - 1] = `and ${channels[channels.length - 1]}`
        }
        response += `${channels.length > 2 ? channels.join(`, `) : channels.join(` `)}!`
        bot.say(chatroom, response)
    },
    getColor(props) {
        const { bot, chatroom, channel, user, target } = props
        const userObj = target || user
        if (settings.debug) { console.log(`${grayTxt}> getColor(chatroom: ${chatroom}, userObj: ${userObj.displayName})${resetTxt}`) }

        !userObj.color
            ? bot.say(chatroom, `I can't tell what ${userObj.displayName}'s chat color is! ${getDumbEmote(channel)}`)
            : userObj.color in chatColors
                ? bot.say(chatroom, `${userObj.displayName}'s chat color is ${chatColors[userObj.color].name}!`)
                : bot.say(chatroom, `${userObj.displayName}'s chat color is hex code ${userObj.color}`)
    },
    getRandomUser(arrExclude) {
        if (settings.debug) { console.log(`${grayTxt}> getRandomUser(arrExclude:`, arrExclude, `${grayTxt})${resetTxt}`) }

        const arr = Object.keys(users)
        for (const name of arrExclude) {
            if (arr.includes(name)) { arr.splice(arr.indexOf(name), 1) }
        }
        const randomUser = arr[Math.floor(Math.random() * arr.length)]

        if (settings.debug) { console.log(`${grayTxt}-> username: ${randomUser}${resetTxt}`) }
        return randomUser
    },
    getRandomChannelMessage(user) {
        if (settings.debug) { console.log(`${grayTxt}> getRandomChannelMessage(user: ${user.displayName})${resetTxt}`) }
        const channels = Object.keys(user).filter(channel => typeof user[channel] === `object`)
        const channel = channels[Math.floor(Math.random() * channels.length)]
        if (settings.debug) { console.log(`${grayTxt}-> channel: ${channel}${resetTxt}`) }
        const randomMessage = user[channel].lastMessage
        return randomMessage
    },
    sayFriends(props) {
        const { bot, chatroom, channel } = props
        if (settings.debug) { console.log(`${grayTxt}> sayFriends(chatroom: ${chatroom})${resetTxt}`) }

        const numUsers = Object.keys(users).length
        const dumbEmote = getDumbEmote(channel)
        const neutralEmote = getNeutralEmote(channel)
        const positiveEmote = getPositiveEmote(channel)
        const hypeEmote = getHypeEmote(channel)

        bot.say(
            chatroom,
            `I have ${numUsers <= 999
                ? `${numbers[numUsers]} (${numUsers}) friend${numUsers === 1 ? `` : `s`}`
                : pluralize(numUsers, `friend`, `friends`)}! ${numUsers === 0
                    ? dumbEmote
                    : numUsers < 25
                        ? neutralEmote
                        : numUsers < 50
                            ? positiveEmote
                            : hypeEmote}`
        )
    },
    getLemons(props) {
        const { bot, chatroom, username, user, toUser, target } = props
        if (settings.debug) { console.log(`${grayTxt}> getLemons(chatroom: '${chatroom}', username: '${username}', toUser: '${toUser}')${resetTxt}`) }

        const lemonEmote = getLemonEmote()
        target
            ? bot.say(chatroom, `${target.displayName} has ${target.lemons} lemon${target.lemons === 1 ? `` : `s`}! ${lemonEmote}`)
            : bot.say(chatroom, `${user.displayName} has ${user.lemons} lemon${user.lemons === 1 ? `` : `s`}! ${lemonEmote}`)
    }
}
