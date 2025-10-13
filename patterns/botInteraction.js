const BOT_USERNAME = process.env.BOT_USERNAME
const { users } = require(`../data`)
const { catchPokemon, buyPokeballs, acknowledgeCaughtPokemon } = require(`./pokemon`)
const { getContextEmote, logMessage } = require(`../utils`)
const { contextReact } = require(`../commands/conversation`)

function handleGivenPoints(props, splitMessage) {
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
}

function handleSetPoints(props, splitMessage) {
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
}

function handleLoseAllPoints(props) {
    const { channel } = props
    const botChannel = users[BOT_USERNAME].channels[channel]
    botChannel.points = 0
    logMessage([`> handleLoseAllPoints(channel: '${channel}', current points: ${botChannel.points})`])
    contextReact(props, `upset`)
}

function subtractPoints(props, splitMessage) {
    const { bot, chatroom, channel } = props
    const botChannel = users[BOT_USERNAME].channels[channel]
    const pointsNum = Number(splitMessage[1])
    logMessage([`> subtractPoints(channel: '${channel}', pointsNum: ${pointsNum}, current points: ${botChannel?.points})`])

    // Check points if undefined
    !isNaN(botChannel.points)
        ? botChannel.points -= pointsNum
        : bot.say(chatroom, `!points`)

    logMessage([`-> New points:`, botChannel.points])
}

function acceptDuel(props) {
    const { bot, chatroom } = props
    logMessage([`> acceptDuel(chatroom: '${chatroom}')`])
    bot.say(chatroom, `!accept`)
}

module.exports = {
    [/lost (every|it)/i]: handleLoseAllPoints,
    [/now ha(?:s|ve) \[*(\d*)/i]: handleSetPoints,
    [/lemony_friend has ([^a-z]\d*)/i]: handleSetPoints,
    [/set lemony_friend .* to /i]: handleSetPoints,
    [/^@?lemony_friend, you only have ([^a-z]\d*)/i]: handleSetPoints,
    [/^(?!lemony_friend).* gave (\d*)/i]: handleGivenPoints,
    [/lemony_friend gave ([^a-z]\d*)/i]: subtractPoints,
    [/^@?lemony_friend, .* wants to duel you/i]: acceptDuel,

    [/Purchase successful!/i]: catchPokemon,
    [/You don't own that ball. Check the extension to see your items/i]: buyPokeballs,
    [/has been caught by/i]: acknowledgeCaughtPokemon,
}
