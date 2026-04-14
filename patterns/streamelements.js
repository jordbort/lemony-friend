const BOT_USERNAME = process.env.BOT_USERNAME

const { users } = require(`../data`)
const { getContextEmote, logMessage } = require(`../utils`)

const { contextReact } = require(`../commands/conversation`)

module.exports = {
    handleSetPoints(props, splitMessage) {
        const { channel } = props
        const botChannel = users[BOT_USERNAME].channels[channel]
        const pointsNum = Number(splitMessage[1].replace(`!`, ``))
        logMessage([`> handleSetPoints(channel: '${channel}', pointsNum: ${pointsNum}, current points: ${botChannel?.points})`])

        if (`points` in botChannel) {
            if (pointsNum > botChannel.points) { contextReact(props, `hype`) }
            if (pointsNum < botChannel.points) { contextReact(props, `upset`) }
        }
        botChannel.points = pointsNum

        logMessage([`-> New points:`, botChannel.points])
    },
    handleGivenPoints(props, splitMessage) {
        const { bot, chatroom, message, channel } = props
        const botChannel = users[BOT_USERNAME].channels[channel]
        const pointsNum = Number(splitMessage[1])
        const givingUser = message.split(` `)[0].toLowerCase()
        const nickname = users[givingUser].nickname || users[givingUser].displayName
        logMessage([`> handleGivenPoints(channel: '${channel}', givingUser: '${givingUser}', pointsNum: ${pointsNum}, current points: ${botChannel?.points})`])

        const greetingEmote = getContextEmote(`greeting`, channel)
        bot.say(chatroom, `Thank you for the points, ${nickname}! ${greetingEmote}`)

        // Add points and check if undefined
        if (`points` in botChannel) {
            botChannel.points += pointsNum
        } else {
            const delay = botChannel.mod || botChannel.vip || channel === BOT_USERNAME ? 1000 : 2000
            setTimeout(() => bot.say(chatroom, `!points`), delay)
        }

        logMessage([`-> New points:`, `points` in botChannel ? botChannel.points : `(waiting for reply...)`])
    },
    subtractPoints(props, splitMessage) {
        const { bot, chatroom, channel } = props
        const botChannel = users[BOT_USERNAME].channels[channel]
        const pointsNum = Number(splitMessage[1])
        logMessage([`> subtractPoints(channel: '${channel}', pointsNum: ${pointsNum}, current points: ${botChannel?.points})`])

        // Check points if undefined
        !isNaN(botChannel.points)
            ? botChannel.points -= pointsNum
            : bot.say(chatroom, `!points`)

        logMessage([`-> New points:`, botChannel.points])
    },
    handleLoseAllPoints(props) {
        const { channel } = props
        const botChannel = users[BOT_USERNAME].channels[channel]
        botChannel.points = 0
        logMessage([`> handleLoseAllPoints(channel: '${channel}', current points: ${botChannel.points})`])
        contextReact(props, `upset`)
    },
    acceptDuel(props) {
        const { bot, chatroom } = props
        logMessage([`> acceptDuel(chatroom: '${chatroom}')`])
        bot.say(chatroom, `!accept`)
    }
}
