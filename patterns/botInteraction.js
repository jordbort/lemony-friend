const BOT_USERNAME = process.env.BOT_USERNAME
const { users } = require(`../data`)
const { resetTxt, grayTxt, settings } = require(`../config`)
const { getHypeEmote, getUpsetEmote, getGreetingEmote } = require(`../utils`)

function handleGivenPoints(props, splitMessage) {
    const { bot, chatroom, message, channel } = props

    const pointsNum = Number(splitMessage[1])
    const givingUser = message.split(` `)[0].toLowerCase()
    const nickname = users[givingUser].nickname || users[givingUser].displayName
    if (settings.debug) { console.log(`${grayTxt}> handleGivenPoints(channel: '${channel}', givingUser: '${givingUser}', pointsNum: ${pointsNum}, current points: ${users[BOT_USERNAME][channel]?.points})${resetTxt}`) }

    bot.say(chatroom, `Thank you for the points, ${nickname}! ${getGreetingEmote(channel)}`)

    // Add points and check if undefined
    if (`points` in users[BOT_USERNAME][channel]) {
        users[BOT_USERNAME][channel].points += pointsNum
    } else {
        const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME ? 1000 : 2000
        setTimeout(() => bot.say(chatroom, `!points`), delay)
    }

    if (settings.debug) { console.log(`${grayTxt}-> New points:${resetTxt}`, `points` in users[BOT_USERNAME][channel] ? users[BOT_USERNAME][channel].points : `(waiting for reply...)`) }
}

function handleSetPoints(props, splitMessage) {
    const { bot, chatroom, channel } = props

    const pointsNum = Number(splitMessage[1])
    if (settings.debug) { console.log(`${grayTxt}> handleSetPoints(channel: '${channel}', pointsNum: ${pointsNum}, current points: ${users[BOT_USERNAME][channel]?.points})${resetTxt}`) }

    const hypeEmote = getHypeEmote(channel)
    const upsetEmote = getUpsetEmote(channel)
    if (`points` in users[BOT_USERNAME][channel]) {
        if (pointsNum > users[BOT_USERNAME][channel].points) { bot.say(chatroom, hypeEmote) }
        if (pointsNum < users[BOT_USERNAME][channel].points) { bot.say(chatroom, upsetEmote) }
    }
    users[BOT_USERNAME][channel].points = pointsNum

    if (settings.debug) { console.log(`${grayTxt}-> New points:${resetTxt}`, users[BOT_USERNAME][channel].points) }
}

function handleLoseAllPoints(props) {
    const { bot, chatroom, channel } = props
    users[BOT_USERNAME][channel].points = 0
    if (settings.debug) { console.log(`${grayTxt}> handleLoseAllPoints(channel: '${channel}', current points: ${users[BOT_USERNAME][channel].points})${resetTxt}`) }

    const upsetEmote = getUpsetEmote(channel)
    bot.say(chatroom, `${upsetEmote}`)
}

function subtractPoints(props, splitMessage) {
    const { bot, chatroom, channel } = props
    const pointsNum = Number(splitMessage[1])

    if (settings.debug) { console.log(`${grayTxt}> subtractPoints(channel: '${channel}', pointsNum: ${pointsNum}, current points: ${users[BOT_USERNAME][channel]?.points})${resetTxt}`) }

    // Check points if undefined
    !isNaN(users[BOT_USERNAME][channel].points)
        ? users[BOT_USERNAME][channel].points -= pointsNum
        : bot.say(chatroom, `!points`)

    if (settings.debug) { console.log(`${grayTxt}-> New points:${resetTxt}`, users[BOT_USERNAME][channel].points) }
}

function buyPokeballs(props) {
    const { bot, chatroom, channel } = props
    if (settings.debug) { console.log(`${grayTxt}> buyPokeballs(channel: '${channel}')${resetTxt}`) }

    bot.say(chatroom, `!pokeshop pokeball 10`)
}

function acknowledgeCaughtPokemon(props) {
    const { bot, chatroom, channel } = props
    if (settings.debug) { console.log(`${grayTxt}> acknowledgeCaughtPokemon(channel: '${channel}')${resetTxt}`) }

    const hypeEmote = getHypeEmote(channel)
    bot.say(chatroom, `${hypeEmote}`)
}

module.exports = {
    [/lost (every|it)/i]: handleLoseAllPoints,
    [/now ha(?:s|ve) \[*(\d*)/i]: handleSetPoints,
    [/ lemony_friend has ([^a-z]\d*)/i]: handleSetPoints,
    [/set lemony_friend .* to /i]: handleSetPoints,
    [/^@?lemony_friend, you only have ([^a-z]\d*)/i]: handleSetPoints,
    [/^(?!lemony_friend).* gave (\d*)/i]: handleGivenPoints,
    [/lemony_friend gave ([^a-z]\d*)/i]: subtractPoints,

    [/You don't own that ball. Check the extension to see your items/i]: buyPokeballs,
    [/has been caught by/i]: acknowledgeCaughtPokemon,
}
