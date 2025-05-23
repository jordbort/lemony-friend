const BOT_USERNAME = process.env.BOT_USERNAME
const { users } = require(`../data`)
const { catchPokemon, buyPokeballs, acknowledgeCaughtPokemon } = require(`./pokemon`)
const { getContextEmote, logMessage } = require(`../utils`)

function handleGivenPoints(props, splitMessage) {
    const { bot, chatroom, message, channel } = props

    const pointsNum = Number(splitMessage[1])
    const givingUser = message.split(` `)[0].toLowerCase()
    const nickname = users[givingUser].nickname || users[givingUser].displayName
    logMessage([`> handleGivenPoints(channel: '${channel}', givingUser: '${givingUser}', pointsNum: ${pointsNum}, current points: ${users[BOT_USERNAME][channel]?.points})`])

    const greetingEmote = getContextEmote(`greeting`, channel)
    bot.say(chatroom, `Thank you for the points, ${nickname}! ${greetingEmote}`)

    // Add points and check if undefined
    if (`points` in users[BOT_USERNAME][channel]) {
        users[BOT_USERNAME][channel].points += pointsNum
    } else {
        const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME ? 1000 : 2000
        setTimeout(() => bot.say(chatroom, `!points`), delay)
    }

    logMessage([`-> New points:`, `points` in users[BOT_USERNAME][channel] ? users[BOT_USERNAME][channel].points : `(waiting for reply...)`])
}

function handleSetPoints(props, splitMessage) {
    const { bot, chatroom, channel } = props

    const pointsNum = Number(splitMessage[1])
    logMessage([`> handleSetPoints(channel: '${channel}', pointsNum: ${pointsNum}, current points: ${users[BOT_USERNAME][channel]?.points})`])

    const hypeEmote = getContextEmote(`hype`, channel)
    const upsetEmote = getContextEmote(`upset`, channel)
    if (`points` in users[BOT_USERNAME][channel]) {
        if (pointsNum > users[BOT_USERNAME][channel].points) { bot.say(chatroom, hypeEmote) }
        if (pointsNum < users[BOT_USERNAME][channel].points) { bot.say(chatroom, upsetEmote) }
    }
    users[BOT_USERNAME][channel].points = pointsNum

    logMessage([`-> New points:`, users[BOT_USERNAME][channel].points])
}

function handleLoseAllPoints(props) {
    const { bot, chatroom, channel } = props
    users[BOT_USERNAME][channel].points = 0
    logMessage([`> handleLoseAllPoints(channel: '${channel}', current points: ${users[BOT_USERNAME][channel].points})`])

    const upsetEmote = getContextEmote(`upset`, channel)
    bot.say(chatroom, `${upsetEmote}`)
}

function subtractPoints(props, splitMessage) {
    const { bot, chatroom, channel } = props
    const pointsNum = Number(splitMessage[1])

    logMessage([`> subtractPoints(channel: '${channel}', pointsNum: ${pointsNum}, current points: ${users[BOT_USERNAME][channel]?.points})`])

    // Check points if undefined
    !isNaN(users[BOT_USERNAME][channel].points)
        ? users[BOT_USERNAME][channel].points -= pointsNum
        : bot.say(chatroom, `!points`)

    logMessage([`-> New points:`, users[BOT_USERNAME][channel].points])
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
