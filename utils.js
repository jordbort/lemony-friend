const COMMON_NICKNAMES = process.env.COMMON_NICKNAMES

// Import global settings
const { resetTxt, boldTxt, grayTxt, yellowBg, settings, timers } = require(`./config`)

// Import data
const { lemonyFresh, users, tempCmds } = require(`./data`)

// Import emotes
const { getPositiveEmote, getNegativeEmote } = require(`./getEmotes`)

// Create bot client
const tmi = require('tmi.js')
const BOT_USERNAME = process.env.BOT_USERNAME
const OAUTH_TOKEN = process.env.OAUTH_TOKEN

const opts = {
    identity: {
        username: BOT_USERNAME,
        password: OAUTH_TOKEN
    },
    channels: lemonyFresh.channels
}
const client = new tmi.client(opts)

// Helper functions
function talk(chatroom, msg) {
    const time = new Date().toLocaleTimeString(settings.timeLocale, settings.timeZone)
    client.say(chatroom, msg)
    console.log(`${yellowBg}[${time}] <${chatroom.slice(1)}> ${BOT_USERNAME}: ${msg}${resetTxt}`)
}

function yell(user, message) {
    for (const chatroom of lemonyFresh.channels) {
        talk(chatroom, `${user.displayName} says: ${message}`)
    }
}

async function handleUncaughtException(errMsg, location) {
    if (settings.debug) { console.log(`${boldTxt}> handleUncaughtException(errMsg: ${errMsg}, location: ${location})${resetTxt}`) }
    const emote = users[BOT_USERNAME]?.jpegstripes?.sub ? `jpegstBroken` : users[BOT_USERNAME]?.sclarf?.sub ? `sclarfDead` : users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Heat` : users[BOT_USERNAME]?.domonintendo1?.sub ? `domoni6Sneeze` : `>(`
    return lemonyFresh.channels.forEach((chatroom) => { talk(chatroom, `Oops, I just crashed! ${emote} ${errMsg} ${location}`) })
}

function applyNicknames(chatroom) {
    if (settings.debug) { console.log(`${boldTxt}> applyNicknames(chatroom: ${chatroom})${resetTxt}`) }
    const nicknames = COMMON_NICKNAMES.split(`,`)
    const updatedUsers = []
    const skippedUsers = []
    const unknownUsers = []
    for (const [i, name] of nicknames.entries()) {
        if (i % 2 === 0) {
            const nickname = nicknames[i + 1]
            if (name in users) {
                if (users[name].displayName !== nickname) {
                    users[name].displayName = nickname
                    updatedUsers.push(nickname)
                } else { skippedUsers.push(nickname) }
            } else { unknownUsers.push(name) }
        }
    }
    const response = []
    if (updatedUsers.length) {
        console.log(`${grayTxt}updatedUsers: ${updatedUsers.join(`, `)}${resetTxt}`)
        response.push(`${updatedUsers.length} updated`)
    }
    if (skippedUsers.length) {
        console.log(`${grayTxt}skippedUsers: ${skippedUsers.join(`, `)}${resetTxt}`)
        response.push(`${skippedUsers.length} skipped`)
    }
    if (unknownUsers.length) {
        console.log(`${grayTxt}unknownUsers: ${unknownUsers.join(`, `)}${resetTxt}`)
        response.push(`${unknownUsers.length} not known yet`)
    }
    talk(chatroom, `> ${response.join(`, `)}`)
}

function resetCooldownTimer(command) {
    if (settings.debug && timers[command].cooldown) { console.log(`${boldTxt}> resetCooldownTimer('${command}') ${timers[command].cooldown / 1000} second${timers[command].cooldown / 1000 === 1 ? `` : `s`}...${resetTxt}`) }
    timers[command].listening = false
    clearTimeout(timers[command].timerId)
    timers[command].timerId = Number(setTimeout(() => {
        timers[command].listening = true
        if (timers[command].cooldown) { console.log(`${boldTxt}> Listening for '${command}' again!${resetTxt}`) }
    }, timers[command].cooldown))
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

function chant(chatroom, args) {
    if (settings.debug) { console.log(`${boldTxt}> chant(chatroom: ${chatroom}, args: ${args})${resetTxt}`) }
    const chant = args.map((word) => {
        return !lemonyFresh.jpegstripes.emotes.includes(word) && !lemonyFresh.sclarf.emotes.includes(word) && !lemonyFresh.e1ectroma.emotes.includes(word) && !lemonyFresh.domonintendo1.emotes.includes(word) && !lemonyFresh.ppuyya.emotes.includes(word)
            ? word.toUpperCase()
            : word
    })
    const response = Array(settings.chantCount).fill(`${chant.join(` `)} ${settings.chantEmote}`)
    return talk(chatroom, `📣️ ${response.join(` `)}`)
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
    talk,
    yell,
    handleUncaughtException,
    applyNicknames,
    resetCooldownTimer,
    toggleDebugMode,
    handleTempCmd,
    chant,
    handleRaid
}
