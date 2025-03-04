const { lemonyFresh, users } = require(`../data`)
const { chatColors, settings } = require(`../config`)
const { numbers, getContextEmote, pluralize, getToUser, logMessage, arrToList } = require(`../utils`)

module.exports = {
    sayOnlineTime(props) {
        const { bot, chatroom, channel } = props
        logMessage([`> sayOnlineTime(channel: '${channel}')`])

        const newFeatures = [
            `Added "!list help" to provide a list of all methods`,
            `Restricted permissions for !list add, edit, delete, swap/switch, move, name/rename, clear, reset`,
            `Added a CLI setting to enable/disable playing PokemonCommunityGame`,
            `Added !multitwitch to generate a MultiTwitch stream link for multiple users`,
            `Hangman players who use !play after the signup window are now told whose turn they're after`,
            `Number of Hangman victories now preserved between resets`
        ]

        const timeOptions = {
            hour: `numeric`,
            minute: `numeric`,
            second: `numeric`,
            timeZone: settings.timeZone,
            timeZoneName: `short`
        }

        const dateOptions = {
            weekday: `long`,
            month: `long`,
            day: `numeric`,
            year: `numeric`,
            timeZone: settings.timeZone
        }

        const neutralEmote = getContextEmote(`neutral`, channel)
        bot.say(chatroom, `I've been online since ${settings.startDate.toLocaleDateString(settings.timeLocale, dateOptions)} at ${settings.startDate.toLocaleTimeString(settings.timeLocale, timeOptions)}! ${neutralEmote}${newFeatures.length ? ` Updates: ${newFeatures.join(`, `)}` : ``}`)
    },
    getLastMessage(props) {
        const { bot, chatroom, args, channel, username, user, userNickname, toUser, target, targetNickname } = props
        const otherChannel = getToUser(args[1])
        const userObj = target || user
        const userObjNickname = targetNickname || userNickname
        logMessage([`> getLastMessage(chatroom: '${chatroom}', userObj: '${target ? toUser : username}, otherChannel: '${otherChannel}')`])

        const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel
        const otherChannelNickname = otherChannel in lemonyFresh
            ? users[otherChannel]?.nickname || users[otherChannel]?.displayName || otherChannel
            : null

        otherChannel in userObj
            ? bot.say(chatroom, `${userObjNickname} last said: "${userObj[otherChannel].lastMessage}" in ${otherChannelNickname}'s chat!`)
            : channel in userObj
                ? bot.say(chatroom, `${userObjNickname} last said: "${userObj[channel].lastMessage}" in ${channelNickname}'s chat!`)
                : bot.say(chatroom, `${userObjNickname} hasn't spoken in ${channelNickname}'s chat!`)
    },
    getMessageCount(props) {
        const { bot, chatroom, username, user, userNickname, toUser, target, targetNickname } = props
        const userObj = target || user
        logMessage([`> getMessageCount(chatroom: '${chatroom}', userObj: '${target ? toUser : username}')`])

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
        const { bot, chatroom, channel, username, user, userNickname, toUser, target, targetNickname } = props
        const userObj = target || user
        const userObjNickname = targetNickname || userNickname
        const dumbEmote = getContextEmote(`dumb`, channel)
        logMessage([`> getColor(chatroom: ${chatroom}, userObj: '${target ? toUser : username})`])

        !userObj.color
            ? bot.say(chatroom, `I can't tell what ${userObjNickname}'s chat color is! ${dumbEmote}`)
            : userObj.color in chatColors
                ? bot.say(chatroom, `${userObjNickname}'s chat color is ${chatColors[userObj.color].name}!`)
                : bot.say(chatroom, `${userObjNickname}'s chat color is hex code ${userObj.color}`)
    },
    getRandomUser(arrExclude) {
        logMessage([`> getRandomUser(arrExclude:`, arrExclude.join(`, `), `)`])

        const arr = Object.keys(users)
        for (const name of arrExclude) {
            if (arr.includes(name)) { arr.splice(arr.indexOf(name), 1) }
        }
        const randomUser = arr[Math.floor(Math.random() * arr.length)]

        logMessage([`-> username: ${randomUser}`])
        return randomUser
    },
    getRandomChannelMessage(user) {
        logMessage([`> getRandomChannelMessage(user: ${user.displayName})`])
        const channels = Object.keys(user).filter(channel => typeof user[channel] === `object`)
        const channel = channels[Math.floor(Math.random() * channels.length)]
        logMessage([`-> channel: ${channel}`])
        const randomMessage = user[channel].lastMessage
        return randomMessage
    },
    sayFriends(props) {
        const { bot, chatroom, channel } = props
        logMessage([`> sayFriends(chatroom: ${chatroom})`])

        const numUsers = Object.keys(users).length
        const dumbEmote = getContextEmote(`dumb`, channel)
        const neutralEmote = getContextEmote(`neutral`, channel)
        const positiveEmote = getContextEmote(`positive`, channel)
        const hypeEmote = getContextEmote(`hype`, channel)

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
        const { bot, chatroom, channel, username, user, toUser, target } = props
        logMessage([`> getLemons(chatroom: '${chatroom}', username: '${username}', toUser: '${toUser}')`])

        const lemonEmote = getContextEmote(`lemon`, channel)
        target
            ? bot.say(chatroom, `${target.displayName} has ${target.lemons} lemon${target.lemons === 1 ? `` : `s`}! ${lemonEmote}`)
            : bot.say(chatroom, `${user.displayName} has ${user.lemons} lemon${user.lemons === 1 ? `` : `s`}! ${lemonEmote}`)
    }
}
