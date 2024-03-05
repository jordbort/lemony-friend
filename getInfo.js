// Import global settings
const { resetTxt, boldTxt, chatColors, settings } = require(`./config`)

// Import data
const { users } = require(`./data`)

// Import emotes
const { getNegativeEmote } = require(`./getEmotes`)

// Import helper functions
const { talk } = require(`./utils`)

function getLastMessage(chatroom, user, room) {
    if (settings.debug) { console.log(`${boldTxt}> getLastMessage(chatroom: ${chatroom}, user: ${user.displayName}, room: ${room})${resetTxt}`) }
    if (!(chatroom.slice(1) in user)) { return }
    room in user
        ? talk(chatroom, `${user.displayName} last said: "${user[room].lastMessage}" in ${room}'s chat!`)
        : talk(chatroom, `${user.displayName} last said: "${user[chatroom.slice(1)].lastMessage}" in ${chatroom.slice(1)}'s chat!`)
}

function getMessageCount(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> getMessageCount(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    let response = `${user.displayName} has sent `
    const rooms = []
    for (const room in user) {
        if (user[room]?.msgCount) {
            rooms.push(`${user[room].msgCount} ${user[room].msgCount === 1 ? `message` : `messages`} in ${room}'s chat`)
        }
    }
    if (rooms.length > 1) {
        const lastRoom = rooms[rooms.length - 1].slice()
        rooms[rooms.length - 1] = `and ${lastRoom}`
    }
    response += `${rooms.join(`, `)}!`
    talk(chatroom, response)
}

function getColor(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> getColor(chatroom: ${chatroom}, user.color: ${user.color})${resetTxt}`) }
    const channel = chatroom.substring(1)
    !user.color
        ? talk(chatroom, `I can't tell what ${user.displayName}'s chat color is! ${getNegativeEmote(channel)}`)
        : user.color in chatColors
            ? talk(chatroom, `${user.displayName}'s chat color is ${chatColors[user.color].name}!`)
            : talk(chatroom, `${user.displayName}'s chat color is hex code ${user.color}`)
}

function getRandomUser() {
    const arr = Object.keys(users)
    const randomUser = arr[Math.floor(Math.random() * arr.length)]
    if (settings.debug) { console.log(`${boldTxt}> getRandomUser() picked: ${randomUser}${resetTxt}`) }
    return randomUser
}

function getRandomChannelMessage(user) {
    if (settings.debug) { console.log(`${boldTxt}> getRandomChannelMessage(user: ${user.displayName})${resetTxt}`) }
    const allKeys = Object.keys(user)
    let channelKey = Math.floor(Math.random() * allKeys.length)
    while (![
        `lemony_friend`,
        `jpegstripes`,
        `sclarf`,
        `e1ectroma`,
        `domonintendo1`,
        `ppuyya`
    ].includes(allKeys[channelKey])) { channelKey = Math.floor(Math.random() * allKeys.length) }
    if (settings.debug) { console.log(`${boldTxt}...from ${allKeys[channelKey]}'s channel${resetTxt}`) }
    const randomMessage = user[allKeys[channelKey]].lastMessage
    return randomMessage
}

module.exports = {
    getLastMessage,
    getMessageCount,
    getColor,
    getRandomUser,
    getRandomChannelMessage
}
