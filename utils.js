const fs = require(`fs`)
const BOT_USERNAME = process.env.BOT_USERNAME
const OAUTH_TOKEN = process.env.OAUTH_TOKEN
const BOT_ACCESS_TOKEN = process.env.BOT_ACCESS_TOKEN
const JPEGSTRIPES_ACCESS_TOKEN = process.env.JPEGSTRIPES_ACCESS_TOKEN
const JPEGSTRIPES_REFRESH_TOKEN = process.env.JPEGSTRIPES_REFRESH_TOKEN
const SCLARF_ACCESS_TOKEN = process.env.SCLARF_ACCESS_TOKEN
const SCLARF_REFRESH_TOKEN = process.env.SCLARF_REFRESH_TOKEN
const E1ECTROMA_ACCESS_TOKEN = process.env.E1ECTROMA_ACCESS_TOKEN
const E1ECTROMA_REFRESH_TOKEN = process.env.E1ECTROMA_REFRESH_TOKEN
const DOMONINTENDO1_ACCESS_TOKEN = process.env.DOMONINTENDO1_ACCESS_TOKEN
const DOMONINTENDO1_REFRESH_TOKEN = process.env.DOMONINTENDO1_REFRESH_TOKEN
const PPUYYA_ACCESS_TOKEN = process.env.PPUYYA_ACCESS_TOKEN
const PPUYYA_REFRESH_TOKEN = process.env.PPUYYA_REFRESH_TOKEN

// Import global settings
const { resetTxt, boldTxt, grayTxt, yellowBg, chatColors, settings } = require(`./config`)

// Import data
const { lemonyFresh, users, tempCmds } = require(`./data`)

// Import emotes
const { getLemonEmote, getHypeEmote, getPositiveEmote, getNegativeEmote, getGreetingEmote } = require(`./getEmotes`)

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
    return lemonyFresh.channels.forEach((chatroom) => {
        talk(chatroom, `Oops, I just crashed! ${users[BOT_USERNAME]?.jpegstripes?.sub
            ? `jpegstBroken`
            : users[BOT_USERNAME]?.sclarf?.sub
                ? `sclarfDead`
                : users[BOT_USERNAME]?.e1ectroma?.sub
                    ? `e1ectr4Heat`
                    : users[BOT_USERNAME]?.domonintendo1?.sub
                        ? `domoni6Sneeze`
                        : `>(`
            } ${errMsg} ${location}`)
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
    const lemonEmote = getLemonEmote()
    const hypeEmote = getHypeEmote(channel)
    const positiveEmote = getPositiveEmote()
    const greetingEmote = getGreetingEmote(channel)
    const numUsers = Object.keys(users).length
    const numTempCmds = Object.keys(tempCmds).length
    const onlineMsgs = [
        `Let's see how long before I crash`,
        `don't mind me`,
        `${greetingEmote} (just rebooting again)`,
        `(Windows 95 startup sound plays)`,
        `I'm onl`,
        `I have ${numUsers <= 50 ? `${numbers[numUsers]} (${numUsers})` : numUsers} friend${numUsers === 1 ? `` : `s`}! ${hypeEmote}`,
        `(there ${numTempCmds === 1 ? `is` : `are`} ${numTempCmds} temporary command${numTempCmds === 1 ? `` : `s`})`,
        `Debug mode is currently ${settings.debug ? `ON` : `OFF`}! ${positiveEmote}`,
        `Let's play Hangman! ${positiveEmote}`,
        `nowHasPattern has been updated to /now ha(?:s|ve) \[*(\d*)/i which makes use of capturing and non-capturing groups ${positiveEmote}`,
        'const sanitizedMsg = msg.replace(/[\\{`}%^|]/g, ``)',
        `${channel} has ${lemonyFresh[channel].emotes.length} emote${lemonyFresh[channel].emotes.length === 1 ? `` : `s`}!`,
        `It has been ${Date.now()} milliseconds since January 1, 1970, UTC ${lemonEmote}`,
        `${BOT_USERNAME in users
            ? `I have ${users[BOT_USERNAME].lemons} lemon${users[BOT_USERNAME].lemons === 1 ? `` : `s`}! ${lemonEmote}`
            : `${lemonEmote}`}`
    ]
    const rebootMsg = onlineMsgs[Math.floor(Math.random() * onlineMsgs.length)]
    settings.sayOnlineMsg = false
    lemonyFresh.channels.forEach((channel) => { talk(channel, rebootMsg) })
}

function sayFriends(chatroom) {
    if (settings.debug) { console.log(`${boldTxt}> sayFriends(chatroom: ${chatroom})${resetTxt}`) }
    const channel = chatroom.substring(1)
    talk(chatroom, `I have ${Object.keys(users).length <= 50 ? `${numbers[Object.keys(users).length]} (${Object.keys(users).length})` : Object.keys(users).length} friend${Object.keys(users).length === 1 ? `` : `s`}! ${getHypeEmote(channel)}`)
}

function sayCommands(chatroom) {
    if (settings.debug) { console.log(`${boldTxt}> sayCommands(chatroom: ${chatroom})${resetTxt}`) }
    const channel = chatroom.substring(1)
    talk(chatroom, `Commands: !greet => Say hi to one or more people, !bye => Say goodnight to someone, !hangman => Start a game of Hangman, !rps => Play me in Rock, Paper, Scissors (move optional), !yell => Chat across Lemony Fresh ${users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Lemfresh ` : `🍋️`}, !away => (Optionally add an away message), !tempcmd => Make your own command! ${getPositiveEmote(channel)}`)
}

function toggleDebugMode(chatroom, args) {
    const initialDebugState = settings.debug
    const positiveEmote = getPositiveEmote(chatroom.substring(1))
    if (args[0]?.toLowerCase() === `on`) { settings.debug = true }
    else if (args[0]?.toLowerCase() === `off`) { settings.debug = false }
    else { settings.debug = !settings.debug }
    settings.debug === initialDebugState
        ? talk(chatroom, `Debug mode is currently ${settings.debug ? `ON` : `OFF`}! ${positiveEmote}`)
        : talk(chatroom, `Debug mode is now ${settings.debug ? `ON` : `OFF`}! ${positiveEmote}`)
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

function yell(user, message) {
    for (const chatroom of lemonyFresh.channels) {
        talk(chatroom, `${user.displayName} says: ${message}`)
    }
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

function handleTempCmd(chatroom, username, args) {
    if (settings.debug) { console.log(`${boldTxt}> handleTempCmd(chatroom: ${chatroom}, args: ${args})${resetTxt}`) }
    const channel = chatroom.substring(1)
    const positiveEmote = getPositiveEmote(channel)
    if (!args[1]) { return talk(chatroom, `Hey ${users[username].displayName}, use this command like: !tempcmd [commandname] [response...]! :)`) }

    if (args[0].toLowerCase() === `delete`) {
        if (args[1].toLowerCase() in tempCmds) {
            delete tempCmds[args[1].toLowerCase()]
            return talk(chatroom, `Command "${args[1].toLowerCase()}" has been deleted! ${positiveEmote}`)
        } else {
            return talk(chatroom, `No command "${args[1].toLowerCase()}" was found! ${getNegativeEmote(channel)}`)
        }
    }
    else if (args[0].toLowerCase() in tempCmds) {
        tempCmds[args[0].toLowerCase()] = args.slice(1).join(` `)
        return talk(chatroom, `Command "${args[0].toLowerCase()}" has been edited! ${positiveEmote}`)
    } else {
        tempCmds[args[0].toLowerCase()] = args.slice(1).join(` `)
        return talk(chatroom, `Temporary command "${args[0].toLowerCase()}" has been added! ${positiveEmote}`)
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

function chant(chatroom, args) {
    if (settings.debug) { console.log(`${boldTxt}> chant(chatroom: ${chatroom}, args: ${args})${resetTxt}`) }
    const chant = args.map((word) => {
        return !lemonyFresh.jpegstripes.emotes.includes(word) && !lemonyFresh.sclarf.emotes.includes(word) && !lemonyFresh.e1ectroma.emotes.includes(word) && !lemonyFresh.domonintendo1.emotes.includes(word) && !lemonyFresh.ppuyya.emotes.includes(word)
            ? word.toUpperCase()
            : word
    })
    const response = Array(settings.chantCount).fill(`${chant.join(` `)} ${settings.chantEmote}`)
    return talk(chatroom, `:mega: ${response.join(` `)}`)
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
    const time = new Date().toLocaleTimeString(settings.timeLocale, settings.timeZone)
    client.say(chatroom, msg)
    console.log(`${yellowBg}[${time}] <${chatroom.slice(1)}> ${BOT_USERNAME}: ${msg}${resetTxt}`)
}

const startTime = new Date().toLocaleString(`en-US`, { timeZone: `EST` })
function makeLogs() {
    let log = `🍋️ LEMONY LOGS 🍋️\n`
    log += `Session started: ${startTime}\n\n`

    const anyTokenChange = lemonyFresh.botAccessToken !== BOT_ACCESS_TOKEN || lemonyFresh.jpegstripes.accessToken !== JPEGSTRIPES_ACCESS_TOKEN || lemonyFresh.jpegstripes.refreshToken !== JPEGSTRIPES_REFRESH_TOKEN || lemonyFresh.sclarf.accessToken !== SCLARF_ACCESS_TOKEN || lemonyFresh.sclarf.refreshToken !== SCLARF_REFRESH_TOKEN || lemonyFresh.e1ectroma.accessToken !== E1ECTROMA_ACCESS_TOKEN || lemonyFresh.e1ectroma.refreshToken !== E1ECTROMA_REFRESH_TOKEN || lemonyFresh.domonintendo1.accessToken !== DOMONINTENDO1_ACCESS_TOKEN || lemonyFresh.domonintendo1.refreshToken !== DOMONINTENDO1_REFRESH_TOKEN || lemonyFresh.ppuyya.accessToken !== PPUYYA_ACCESS_TOKEN || lemonyFresh.ppuyya.refreshToken !== PPUYYA_REFRESH_TOKEN
    if (anyTokenChange) { log += `${Array(50).fill(`*`).join(` `)}\n` }
    if (lemonyFresh.botAccessToken !== BOT_ACCESS_TOKEN) { log += `BOT_ACCESS_TOKEN changed, update to: '${lemonyFresh.botAccessToken}'\n` }
    if (lemonyFresh.jpegstripes.accessToken !== JPEGSTRIPES_ACCESS_TOKEN) { log += `JPEGSTRIPES_ACCESS_TOKEN changed, update to: '${lemonyFresh.jpegstripes.accessToken}'\n` }
    if (lemonyFresh.jpegstripes.refreshToken !== JPEGSTRIPES_REFRESH_TOKEN) { log += `JPEGSTRIPES_REFRESH_TOKEN changed, update to: '${lemonyFresh.jpegstripes.refreshToken}'\n` }
    if (lemonyFresh.sclarf.accessToken !== SCLARF_ACCESS_TOKEN) { log += `SCLARF_ACCESS_TOKEN changed, update to: '${lemonyFresh.sclarf.accessToken}'\n` }
    if (lemonyFresh.sclarf.refreshToken !== SCLARF_REFRESH_TOKEN) { log += `SCLARF_REFRESH_TOKEN changed, update to: '${lemonyFresh.sclarf.refreshToken}'\n` }
    if (lemonyFresh.e1ectroma.accessToken !== E1ECTROMA_ACCESS_TOKEN) { log += `E1ECTROMA_ACCESS_TOKEN changed, update to: '${lemonyFresh.e1ectroma.accessToken}'\n` }
    if (lemonyFresh.e1ectroma.refreshToken !== E1ECTROMA_REFRESH_TOKEN) { log += `E1ECTROMA_REFRESH_TOKEN changed, update to: '${lemonyFresh.e1ectroma.refreshToken}'\n` }
    if (lemonyFresh.domonintendo1.accessToken !== DOMONINTENDO1_ACCESS_TOKEN) { log += `DOMONINTENDO1_ACCESS_TOKEN changed, update to: '${lemonyFresh.domonintendo1.accessToken}'\n` }
    if (lemonyFresh.domonintendo1.refreshToken !== DOMONINTENDO1_REFRESH_TOKEN) { log += `DOMONINTENDO1_REFRESH_TOKEN changed, update to: '${lemonyFresh.domonintendo1.refreshToken}'\n` }
    if (lemonyFresh.ppuyya.accessToken !== PPUYYA_ACCESS_TOKEN) { log += `PPUYYA_ACCESS_TOKEN changed, update to: '${lemonyFresh.ppuyya.accessToken}'\n` }
    if (lemonyFresh.ppuyya.refreshToken !== PPUYYA_REFRESH_TOKEN) { log += `PPUYYA_REFRESH_TOKEN changed, update to: '${lemonyFresh.ppuyya.refreshToken}'\n` }
    if (anyTokenChange) { log += `${Array(50).fill(`*`).join(` `)}\n\n` }

    function renderObj(obj, objName, indentation = ``) {
        const tab = `${indentation}\t`
        const data = [`${objName}: {`]
        if (Object.keys(obj).length) {
            const keys = `\n${Object.keys(obj).map((key) => {
                return typeof obj[key] === `string`
                    ? `${tab}${key}: '${obj[key]}'`
                    : typeof obj[key] === `object`
                        ? Array.isArray(obj[key])
                            ? `${tab}${key}: [${obj[key].length
                                ? obj[key].map((val) => { return typeof val === `string` ? `'${val}'` : val }).join(`, `)
                                : ``
                            }]`
                            : `${tab}${renderObj(obj[key], key, tab)}`
                        : `${tab}${key}: ${obj[key]}`
            }).join(`,\n`)}`
            data.push(keys)
        }
        data.push(`\n${indentation}}`)
        return data.join(``)
    }
    log += `${renderObj(lemonyFresh, `lemonyFresh`)}\n\n${renderObj(users, `users`)}\n\n${renderObj(tempCmds, `tempCmds`)}\n`

    if (anyTokenChange) { log += `\n${Array(50).fill(`*`).join(` `)}\n` }
    if (lemonyFresh.botAccessToken !== BOT_ACCESS_TOKEN) { log += `BOT_ACCESS_TOKEN changed, update to: '${lemonyFresh.botAccessToken}'\n` }
    if (lemonyFresh.jpegstripes.accessToken !== JPEGSTRIPES_ACCESS_TOKEN) { log += `JPEGSTRIPES_ACCESS_TOKEN changed, update to: '${lemonyFresh.jpegstripes.accessToken}'\n` }
    if (lemonyFresh.jpegstripes.refreshToken !== JPEGSTRIPES_REFRESH_TOKEN) { log += `JPEGSTRIPES_REFRESH_TOKEN changed, update to: '${lemonyFresh.jpegstripes.refreshToken}'\n` }
    if (lemonyFresh.sclarf.accessToken !== SCLARF_ACCESS_TOKEN) { log += `SCLARF_ACCESS_TOKEN changed, update to: '${lemonyFresh.sclarf.accessToken}'\n` }
    if (lemonyFresh.sclarf.refreshToken !== SCLARF_REFRESH_TOKEN) { log += `SCLARF_REFRESH_TOKEN changed, update to: '${lemonyFresh.sclarf.refreshToken}'\n` }
    if (lemonyFresh.e1ectroma.accessToken !== E1ECTROMA_ACCESS_TOKEN) { log += `E1ECTROMA_ACCESS_TOKEN changed, update to: '${lemonyFresh.e1ectroma.accessToken}'\n` }
    if (lemonyFresh.e1ectroma.refreshToken !== E1ECTROMA_REFRESH_TOKEN) { log += `E1ECTROMA_REFRESH_TOKEN changed, update to: '${lemonyFresh.e1ectroma.refreshToken}'\n` }
    if (lemonyFresh.domonintendo1.accessToken !== DOMONINTENDO1_ACCESS_TOKEN) { log += `DOMONINTENDO1_ACCESS_TOKEN changed, update to: '${lemonyFresh.domonintendo1.accessToken}'\n` }
    if (lemonyFresh.domonintendo1.refreshToken !== DOMONINTENDO1_REFRESH_TOKEN) { log += `DOMONINTENDO1_REFRESH_TOKEN changed, update to: '${lemonyFresh.domonintendo1.refreshToken}'\n` }
    if (lemonyFresh.ppuyya.accessToken !== PPUYYA_ACCESS_TOKEN) { log += `PPUYYA_ACCESS_TOKEN changed, update to: '${lemonyFresh.ppuyya.accessToken}'\n` }
    if (lemonyFresh.ppuyya.refreshToken !== PPUYYA_REFRESH_TOKEN) { log += `PPUYYA_REFRESH_TOKEN changed, update to: '${lemonyFresh.ppuyya.refreshToken}'\n` }
    if (anyTokenChange) { log += `${Array(50).fill(`*`).join(` `)}\n` }

    fs.writeFile(`lemony_logs.txt`, log, (err) => {
        if (err) { console.log(`Error writing logs:`, err) }
    })
}

function handleRaid(chatroom) {
    if (settings.debug) { console.log(`${boldTxt}> handleRaid(chatroom: ${chatroom})${resetTxt}`) }

    const channel = chatroom.substring(1)
    const subRaidMessage = lemonyFresh[channel].subRaidMessage
    const noSubRaidMessage = lemonyFresh[channel].noSubRaidMessage
    const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip ? 1000 : 2000
    const appendEmote = users[BOT_USERNAME][channel].sub ? subRaidMessage.split(` `)[0] : getPositiveEmote(channel)

    if (subRaidMessage) { talk(channel, subRaidMessage) }
    if (noSubRaidMessage) {
        setTimeout(() => {
            talk(channel, noSubRaidMessage)
        }, delay)
        setTimeout(() => {
            talk(channel, `Thanks for sticking around for the raid! If you're subscribed to the channel, you can use the first raid message, otherwise you can use the second raid message! ${appendEmote}`)
        }, delay * 2)
    }
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
    chant,
    printLemon,
    talk,
    makeLogs,
    handleRaid
}
