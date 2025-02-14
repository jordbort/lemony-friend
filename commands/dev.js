const BOT_USERNAME = process.env.BOT_USERNAME

const { settings } = require(`../config`)
const { lemonyFresh, users, mods, commonNicknames, startingLemons, hangmanWins } = require(`../data`)

const { getSubs } = require(`./help`)
const { logMessage, dumpMemory } = require(`../utils`)
const { rollFunNumber } = require(`./funNumber`)
const { handleJoin, handlePart } = require(`./joinPart`)

function checkPoints(props) {
    const { bot, chatroom, args, channel } = props
    logMessage([`> checkPoints(chatroom: ${chatroom}, args:`, args, `)`])

    users[BOT_USERNAME]?.[channel].points || users[BOT_USERNAME]?.[channel].points === 0
        ? bot.say(chatroom, `I have ${users[BOT_USERNAME][channel].points} point${users[BOT_USERNAME][channel].points === 1 ? `` : `s`}!`)
        : bot.say(chatroom, `I don't know how many points I have!`)
}

module.exports = {
    '_crash': function kms(props) { throw Error(`Error${props.args.length ? ` with value${props.args.length === 1 ? `` : `s`} '${props.args.join(`', '`)}'` : ``}`) },
    'dump': dumpMemory,
    '!test': checkPoints,
    'tags': (props) => { console.log(props.tags) },

    'unknown': () => {
        console.log(`unapplied nicknames:`, commonNicknames)
        console.log(`unclaimed lemons:`, startingLemons)
        console.log(`unapplied Hangman wins:`, hangmanWins)
    },

    'channel': (props) => {
        const { channel, toUser } = props
        toUser in lemonyFresh
            ? console.log(lemonyFresh[toUser])
            : console.log(lemonyFresh[channel])
    },

    'user': (props) => {
        const { username, toUser } = props
        toUser in users
            ? console.log(users[toUser])
            : console.log(users[username])
    },

    'mod': (props) => {
        const { username, toUser } = props
        toUser in mods
            ? console.log(mods[toUser])
            : console.log(mods[username])
    },

    'viewers': (props) => {
        const { channel, toUser } = props
        toUser in lemonyFresh
            ? console.log(lemonyFresh[toUser].viewers)
            : console.log(lemonyFresh[channel].viewers)
    },

    'channels': (props) => { console.log(props.bot.channels) },

    'test': (props) => { if (!isNaN(props.args[0])) { rollFunNumber(props, Number(props.args[0])) } },

    '!broadcast': (props) => {
        const { bot, message } = props
        for (const chatroom of bot.channels) {
            bot.say(chatroom, `${message.substring(11)}`)
        }
    },

    '!streamon': (props) => {
        const { bot, chatroom } = props
        settings.hideNonDevChannel = true
        settings.highlightBotMessage = false
        settings.logTime = false
        settings.debug = false
        bot.say(chatroom, `/me Settings hideNonDevChannel: ${settings.hideNonDevChannel}, highlightBotMessage: ${settings.highlightBotMessage}, logTime: ${settings.logTime}, debug: ${settings.debug}`)
    },
    '!streamoff': (props) => {
        const { bot, chatroom } = props
        settings.hideNonDevChannel = false
        settings.highlightBotMessage = true
        settings.logTime = true
        settings.debug = true
        bot.say(chatroom, `/me Settings hideNonDevChannel: ${settings.hideNonDevChannel}, highlightBotMessage: ${settings.highlightBotMessage}, logTime: ${settings.logTime}, debug: ${settings.debug}`)
    },

    '!subs': getSubs,
    '!join': handleJoin,
    '!part': handlePart
}
