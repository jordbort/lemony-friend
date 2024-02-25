const BOT_USERNAME = process.env.BOT_USERNAME

// Import data
const { users } = require(`./data`)

// Import global settings
const { resetTxt, boldTxt, redBg, settings } = require(`./config`)

// Import emotes
const { getHypeEmote, getUpsetEmote, getGreetingEmote } = require(`./getEmotes`)

// Import helper functions
const { talk } = require(`./utils`)

function handleGivenPoints(chatroom, givingUser, pointsNum) {
    if (settings.debug) { console.log(`${boldTxt}> handleGivenPoints(chatroom: ${chatroom}, givingUser: ${givingUser}, pointsNum: ${pointsNum})${resetTxt}`) }
    if (isNaN(pointsNum)) { console.log(`${redBg}${boldTxt}WARNING: pointsNum isn't a number!${resetTxt}`) }
    const channel = chatroom.substring(1)
    talk(chatroom, `Thank you for the points, ${givingUser}! ${getGreetingEmote(channel)}`)
    if (`points` in Object(users[BOT_USERNAME][channel])) {
        users[BOT_USERNAME][channel].points += Number(pointsNum)
    }
    else {
        const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME ? 1000 : 2000
        setTimeout(() => talk(chatroom, `!points`), delay)
    }
    if (settings.debug) { console.log(`${boldTxt}> New points:${resetTxt}`, `points` in Object(users[BOT_USERNAME][channel]) ? users[BOT_USERNAME][channel].points : `(waiting for reply...)`) }
}

function handleSetPoints(chatroom, pointsNum) {
    if (settings.debug) { console.log(`${boldTxt}> handleSetPoints(chatroom: ${chatroom}, pointsNum: ${pointsNum})${resetTxt}`) }
    if (isNaN(pointsNum)) { console.log(`${redBg}${boldTxt}WARNING: pointsNum isn't a number!${resetTxt}`) }
    const channel = chatroom.substring(1)
    const hypeEmote = getHypeEmote(channel)
    const upsetEmote = getUpsetEmote(channel)
    if (`points` in users[BOT_USERNAME][channel]) {
        if (pointsNum > users[BOT_USERNAME][channel].points) { talk(chatroom, `${hypeEmote}`) }
        if (pointsNum < users[BOT_USERNAME][channel].points) { talk(chatroom, `${upsetEmote}`) }
    }
    users[BOT_USERNAME][channel].points = pointsNum
    if (settings.debug) { console.log(`${boldTxt}> New points:${resetTxt}`, users[BOT_USERNAME][channel].points) }
}

function handleLoseAllPoints(chatroom) {
    if (settings.debug) { console.log(`${boldTxt}> handleLoseAllPoints(chatroom: ${chatroom})${resetTxt}`) }
    const channel = chatroom.substring(1)
    users[BOT_USERNAME][channel].points = 0
    console.log(`> Gambled ALL, LOST ALL, new amount:`, 0)
    talk(chatroom, `${getUpsetEmote(channel)}`)
    if (settings.debug) { console.log(`${boldTxt}> New points:${resetTxt}`, users[BOT_USERNAME][channel].points) }
}

module.exports = {
    handleGivenPoints,
    handleSetPoints,
    handleLoseAllPoints
}
