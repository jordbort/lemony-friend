const BOT_USERNAME = process.env.BOT_USERNAME
const OAUTH_TOKEN = process.env.OAUTH_TOKEN

// Import global settings
const { resetTxt, boldTxt, grayTxt, yellowBg, chatColors, settings } = require(`./config`)

// Import data
const { lemonyFresh, users, tempCmds } = require(`./data`)

// Create bot client
const tmi = require('tmi.js')
const opts = {
    identity: {
        username: BOT_USERNAME,
        password: OAUTH_TOKEN
    },
    channels: lemonyFresh.channels
}
const client = new tmi.client(opts)

const numbers = [
    `zero`,
    `one`,
    `two`,
    `three`,
    `four`,
    `five`,
    `six`,
    `seven`,
    `eight`,
    `nine`,
    `ten`,
    `eleven`,
    `twelve`,
    `thirteen`,
    `fourteen`,
    `fifteen`,
    `sixteen`,
    `seventeen`,
    `eighteen`,
    `nineteen`,
    `twenty`,
    `twenty-one`,
    `twenty-two`,
    `twenty-three`,
    `twenty-four`,
    `twenty-five`,
    `twenty-six`,
    `twenty-seven`,
    `twenty-eight`,
    `twenty-nine`,
    `thirty`,
    `thirty-one`,
    `thirty-two`,
    `thirty-three`,
    `thirty-four`,
    `thirty-five`,
    `thirty-six`,
    `thirty-seven`,
    `thirty-eight`,
    `thirty-nine`,
    `forty`,
    `forty-one`,
    `forty-two`,
    `forty-three`,
    `forty-four`,
    `forty-five`,
    `forty-six`,
    `forty-seven`,
    `forty-eight`,
    `forty-nine`,
]

// Helper functions
async function handleUncaughtException(errMsg, location) {
    return lemonyFresh.channels.forEach((channel) => {
        talk(channel, `Oops, I just crashed! ${users[BOT_USERNAME]?.sclarf?.sub ? `sclarfDead` : `>(`} ${errMsg} ${location}`)
    })
}

function sayGoals(chatroom, args) {
    if (settings.debug) { console.log(`${boldTxt}> sayGoals(chatroom: ${chatroom}, args: ${args})${resetTxt}`) }
    if (chatroom === `#sclarf`) {
        const subs = Number(args[0])
        const sclarfGoals = {
            25: `sclarf will play 3d pinball!`,
            50: `sclarf will make a food tirr list!`,
            75: `sclarf will have a fight club movie night!`,
            100: `sclarf will play hello kitty island adventure!`,
            125: `sclarf will play a 400-in-1 games console!`,
            150: `chat decidecs speedrun`,
            175: `sclarf will play just dance!`,
            200: `sclarf will do a cosplay!`,
            225: `lemony fresh stream???`,
            250: `sclarf will play Pokemon Soul Link!`,
            275: `mezcal tasting when pp`,
            300: `bianca stream`,
            325: `bianca cosplay`,
            350: `sclarf will do an art stream!`,
            375: `sclarf will have a casino night!`,
            400: `sclarf will play Pokemon Infinite fusion`,
            425: `chat pick cosplay`,
            450: `sclarf will game give away`,
            475: `big collab`,
            500: `sclarf will make a server in minecraft!`,
            525: `sclarf will play Dream Daddy or another dating sim!`,
            550: `LEGO STREAM`,
            575: `cooking adjacent goal`,
            600: `sclarf will END STREAM IMMEDIATELY`,
            625: `sclarf will Call shannon wonderwall`,
            650: `sclarf will taco bell irl stream?`,
            675: `sclarf will sexc sclarf corp calendar`,
            700: `sclarf will go see trom!`
        }
        if (!isNaN(subs) && subs in sclarfGoals) { talk(chatroom, `At ${subs} subs, ${sclarfGoals[subs]}`) }
    } else if (chatroom === `#domonintendo1`) {
        const dollars = Number(args[0])
        const domoGoals = {
            50: `domo will do a 12-hour stream!`,
            100: `domo will do a 12-hour stream + read a children's book in Japanese!`,
            150: `domo will play Pokemon Fire Red in Japanese until we beat it!`
        }
        if (!isNaN(dollars) && dollars in domoGoals) { talk(chatroom, `At $${dollars}, ${domoGoals[dollars]}`) }
    } else { console.log(`${grayTxt}${chatroom.substring(1)} has no goals${resetTxt}`) }
}

function sayRebootMsg(chatroom) {
    if (settings.debug) { console.log(`${boldTxt}> sayRebootMsg(chatroom: ${chatroom})${resetTxt}`) }
    const channel = chatroom.substring(1)
    const onlineMsgs = [
        `Let's see how long before I crash`,
        `${users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Lemfresh` : `🍋️`}`,
        `don't mind me`,
        `(just rebooting again)`,
        `(Windows 95 startup sound plays)`,
        `I'm onl`,
        `reconnecting...`,
        `I have ${Object.keys(users).length <= 50 ? `${numbers[Object.keys(users).length]} (${Object.keys(users).length})` : Object.keys(users).length} friend${Object.keys(users).length === 1 ? `` : `s`}! :D`,
        `(there ${Object.keys(tempCmds).length === 1 ? `is` : `are`} ${Object.keys(tempCmds).length} temporary command${Object.keys(tempCmds).length === 1 ? `` : `s`})`,
        `Debug mode is currently ${settings.debug ? `ON` : `OFF`}! :)`,
        `Let's play Hangman! :)`,
        `nowHasPattern has been updated to /now ha(?:s|ve) \[*(\d*)/i which makes use of capturing and non-capturing groups :)`,
        `${channel} has ${lemonyFresh[channel].emotes.length} emote${lemonyFresh[channel].emotes.length === 1 ? `` : `s`}!`,
        `It has been ${Date.now()} milliseconds since January 1, 1970, UTC ${users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Lemfresh ` : `🍋️`}`,
        `${BOT_USERNAME in users
            ? `I have ${users[BOT_USERNAME].lemons} lemon${users[BOT_USERNAME].lemons === 1 ? `` : `s`}! ${users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Lemfresh` : `🍋️`}`
            : `${users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Lemfresh` : `🍋️`}`}`
    ]
    const rebootMsg = onlineMsgs[Math.floor(Math.random() * onlineMsgs.length)]
    settings.sayOnlineMsg = false
    lemonyFresh.channels.forEach((channel) => { talk(channel, rebootMsg) })
}

function sayFriends(chatroom) {
    if (settings.debug) { console.log(`${boldTxt}> sayFriends(chatroom: ${chatroom})${resetTxt}`) }
    talk(chatroom, `I have ${Object.keys(users).length <= 50 ? `${numbers[Object.keys(users).length]} (${Object.keys(users).length})` : Object.keys(users).length} friend${Object.keys(users).length === 1 ? `` : `s`}! :D`)
}

function sayCommands(chatroom) {
    if (settings.debug) { console.log(`${boldTxt}> sayCommands(chatroom: ${chatroom})${resetTxt}`) }
    talk(chatroom, `Commands: !greet => Say hi to one or more people, !bye => Say goodnight to someone, !hangman => Start a game of Hangman, !rps => Play me in Rock, Paper, Scissors (move optional), !yell => Chat across Lemony Fresh ${users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Lemfresh ` : `🍋️`}, !away => (Optionally add an away message), !tempcmd => Make your own command! :)`)
}

function toggleDebugMode(chatroom, args) {
    const initialDebugState = settings.debug
    if (args[0]?.toLowerCase() === `on`) { settings.debug = true }
    else if (args[0]?.toLowerCase() === `off`) { settings.debug = false }
    else { settings.debug = !settings.debug }
    settings.debug === initialDebugState
        ? talk(chatroom, `Debug mode is currently ${settings.debug ? `ON` : `OFF`}! :)`)
        : talk(chatroom, `Debug mode is now ${settings.debug ? `ON` : `OFF`}! :)`)
}

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

function yell(user, msg) {
    for (const chatroom of lemonyFresh.channels) {
        talk(chatroom, `${user.displayName} says: ${msg.substring(6)}`)
    }
}

function getColor(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> getColor(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    user.color in chatColors
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

function handleTempCmd(chatroom, username, args) {
    if (settings.debug) { console.log(`${boldTxt}> handleTempCmd(chatroom: ${chatroom}, args: ${args})${resetTxt}`) }
    if (!args[1]) { return talk(chatroom, `Hey ${users[username].displayName}, use this command like: !tempcmd [commandname] [response...]! :)`) }
    if (args[0].toLowerCase() === `delete`) {
        if (args[1].toLowerCase() in tempCmds) {
            delete tempCmds[args[1].toLowerCase()]
            return talk(chatroom, `Command "${args[1].toLowerCase()}" has been deleted! :)`)
        } else {
            return talk(chatroom, `No command "${args[1].toLowerCase()}" was found! :(`)
        }
    }
    else if (args[0].toLowerCase() in tempCmds) {
        tempCmds[args[0].toLowerCase()] = args.slice(1).join(` `)
        return talk(chatroom, `Command "${args[0].toLowerCase()}" has been edited! :)`)
    } else {
        tempCmds[args[0].toLowerCase()] = args.slice(1).join(` `)
        return talk(chatroom, `Temporary command "${args[0].toLowerCase()}" has been added! :)`)
    }
}

function delayListening() {
    const delayTime = 30
    console.log(`${boldTxt}> delayListening() ${delayTime} seconds...${resetTxt}`)
    settings.listening = false
    setTimeout(() => {
        settings.listening = true
        console.log(`${boldTxt}> Listening for streaks again!${resetTxt}`)
    }, delayTime * 1000)
}

function ping(arr) {
    for (const [i, str] of arr.entries()) {
        setTimeout(() => { talk(str, `hi :)`) }, 1000 * i)
    }
}

function getToUser(str) {
    let toUser = str
    while (toUser.startsWith(`@`)) { toUser = toUser.substring(1) }
    return toUser
}

function printLemon() {
    const noSq = `  `
    const bkSq = `\x1b[40m  \x1b[0m`
    const gnSq = `\x1b[42m  \x1b[0m`
    const ywSq = `\x1b[43m  \x1b[0m`
    const whSq = `\x1b[47m  \x1b[0m`
    const lemonyFriendTitleSpacedOutTopTextYayyyy = `${yellowBg}${boldTxt}L e m o n y ${resetTxt}`
    const lemonyFriendTitleSpacedOutBottomTextYay = `${yellowBg}${boldTxt}F r i e n d ${resetTxt}`
    console.log(noSq + noSq + noSq + noSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + gnSq + bkSq + noSq + noSq + noSq + noSq + bkSq + bkSq + bkSq + bkSq + bkSq + bkSq + bkSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + bkSq + gnSq + gnSq + bkSq + bkSq + bkSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq + bkSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + bkSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + bkSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + bkSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + bkSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + bkSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + bkSq + gnSq + gnSq + gnSq + gnSq + bkSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + gnSq + bkSq + noSq + noSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + lemonyFriendTitleSpacedOutTopTextYayyyy + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + gnSq + bkSq + noSq + noSq + noSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + lemonyFriendTitleSpacedOutBottomTextYay + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + bkSq + bkSq + noSq + noSq + noSq + noSq + noSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + bkSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + bkSq + bkSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq + bkSq + bkSq + bkSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + bkSq + bkSq + bkSq + bkSq + bkSq)
}

function talk(chatroom, msg) {
    const time = new Date().toLocaleTimeString()
    client.say(chatroom, msg)
    console.log(`${yellowBg}[${time}] <${chatroom.slice(1)}> ${BOT_USERNAME}: ${msg}${resetTxt}`)
}

module.exports = {
    client,
    handleUncaughtException,
    sayGoals,
    sayRebootMsg,
    sayFriends,
    sayCommands,
    toggleDebugMode,
    getLastMessage,
    getMessageCount,
    yell,
    getColor,
    getRandomUser,
    getRandomChannelMessage,
    handleTempCmd,
    delayListening,
    ping,
    getToUser,
    printLemon,
    talk
}
