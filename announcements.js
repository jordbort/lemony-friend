const BOT_USERNAME = process.env.BOT_USERNAME

// Import global settings
const { resetTxt, boldTxt, settings } = require(`./config`)

// Import data
const { lemonyFresh, users, tempCmds } = require(`./data`)

// Import helper functions
const { talk } = require(`./utils`)

// Import emotes
const { getLemonEmote, getHypeEmote, getPositiveEmote, getGreetingEmote, } = require(`./getEmotes`)

function sayCommands(chatroom) {
    if (settings.debug) { console.log(`${boldTxt}> sayCommands(chatroom: ${chatroom})${resetTxt}`) }
    const channel = chatroom.substring(1)
    talk(chatroom, `Commands: !greet => Say hi to one or more people, !bye => Say goodnight to someone, !hangman => Start a game of Hangman, !rps => Play me in Rock, Paper, Scissors (move optional), !yell => Chat across Lemony Fresh ${users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Lemfresh ` : `🍋️`}, !away => (Optionally add an away message), !tempcmd => Make your own command! ${getPositiveEmote(channel)}`)
}

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
        `(Windows 98 startup sound plays)`,
        `I'm onl`,
        `I have ${numUsers <= 50 ? `${numbers[numUsers]} (${numUsers})` : numUsers} friend${numUsers === 1 ? `` : `s`}! ${hypeEmote}`,
        `(there ${numTempCmds === 1 ? `is` : `are`} ${numTempCmds} temporary command${numTempCmds === 1 ? `` : `s`})`,
        `Let's play Hangman! ${positiveEmote}`,
        `nowHasPattern has been updated to /now ha(?:s|ve) \[*(\d*)/i which makes use of capturing and non-capturing groups ${positiveEmote}`,
        'const sanitizedMsg = msg.replace(/[\\{`}%^|]/g, ``)',
        `${channel} has ${lemonyFresh[channel].emotes.length} emote${lemonyFresh[channel].emotes.length === 1 ? `` : `s`}!`,
        `It has been ${Date.now().toLocaleString(`en-US`)} milliseconds since January 1, 1970, 12:00:00 AM UTC ${lemonEmote}`,
        `Mods can now let me make announcements in their name! ${positiveEmote}`,
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

module.exports = { sayRebootMsg, sayFriends, sayCommands }
