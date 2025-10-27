const { lemonyFresh, users } = require(`../data`)
const { chatColors, settings } = require(`../config`)
const numbers = require(`../numbers`)
const { getContextEmote, pluralize, getToUser, logMessage, arrToList } = require(`../utils`)

module.exports = {
    sayOnlineTime(props) {
        const { bot, chatroom, channel } = props
        logMessage([`> sayOnlineTime(channel: '${channel}')`])

        const newFeatures = [
            `Implemented {noun}, {verb}, and {adj} variables in lemon commands`,
            `Message streak checks only apply to messages sent within a recent amount of time`,
            `Added Urban Dictionary definitions`,
            `Implemented {message} variable in lemon commands`,
            `Extended numbers list to 9999`,
            `Added new uses for lemons`
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
        const reply = `I've been online since ${settings.startDate.toLocaleDateString(settings.timeLocale, dateOptions)} at ${settings.startDate.toLocaleTimeString(settings.timeLocale, timeOptions)}! ${neutralEmote}${newFeatures.length
            ? ` Updates: ${newFeatures.join(`, `)}`
            : ``}`
        bot.say(chatroom, reply)
    },
    getLastMessage(props) {
        const { bot, chatroom, args, currentTime, channel, username, user, userNickname, toUser, target, targetNickname } = props
        const otherChannel = getToUser(args[1])
        const userChannels = target ? target.channels : user.channels
        const userObjNickname = targetNickname || userNickname
        logMessage([`> getLastMessage(chatroom: '${chatroom}', userChannels: '${target ? toUser : username}, otherChannel: '${otherChannel}')`])

        const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel
        const otherChannelNickname = otherChannel in lemonyFresh
            ? users[otherChannel]?.nickname || users[otherChannel]?.displayName || otherChannel
            : null

        const timeDiff = otherChannel in userChannels
            ? currentTime - userChannels[otherChannel]?.sentAt
            : currentTime - userChannels[channel]?.sentAt

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((timeDiff / (1000 * 60)) % 60)
        const seconds = Math.floor((timeDiff / 1000) % 60)

        const duration = []
        if (days) { duration.push(pluralize(days, `day`, `days`)) }
        if (hours) { duration.push(pluralize(hours, `hour`, `hours`)) }
        if (minutes) { duration.push(pluralize(minutes, `minute`, `minutes`)) }
        if (seconds) { duration.push(pluralize(seconds, `second`, `seconds`)) }

        otherChannel in lemonyFresh
            ? otherChannel in userChannels
                ? bot.say(chatroom, `${userObjNickname} last said: "${userChannels[otherChannel].lastMessage}" in ${otherChannelNickname}'s chat ${arrToList(duration)}${!duration.length ? `just now` : ` ago`}!`)
                : bot.say(chatroom, `${userObjNickname} hasn't spoken in ${otherChannelNickname}'s chat!`)
            : channel in userChannels
                ? bot.say(chatroom, `${userObjNickname} last said: "${userChannels[channel].lastMessage}" in ${channelNickname}'s chat ${arrToList(duration)}${!duration.length ? `just now` : ` ago`}!`)
                : bot.say(chatroom, `${userObjNickname} hasn't spoken in ${channelNickname}'s chat!`)
    },
    getMessageCount(props) {
        const { bot, chatroom, username, user, userNickname, toUser, target, targetNickname } = props
        const userChannels = target ? target.channels : user.channels
        logMessage([`> getMessageCount(chatroom: '${chatroom}', userChannels: '${target ? toUser : username}')`])

        let response = `${targetNickname || userNickname} has sent `
        const channels = Object.keys(userChannels).map(channel => `${pluralize(userChannels[channel].msgCount, `message`, `messages`)} in ${channel}'s chat`)

        if (channels.length > 1) { channels[channels.length - 1] = `and ${channels[channels.length - 1]}` }
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
        const channels = Object.keys(user.channels)
        const channel = channels[Math.floor(Math.random() * channels.length)]
        logMessage([`-> channel: ${channel}`])
        const randomMessage = user.channels[channel].lastMessage
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
            `I have ${numUsers < numbers.length
                ? `${numbers[numUsers]} (${numUsers.toLocaleString(settings.timeLocale)}) friend${numUsers === 1 ? `` : `s`}`
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
