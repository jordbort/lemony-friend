const BOT_USERNAME = process.env.BOT_USERNAME

const { lemonyFresh, users, mods } = require(`../data`)
const { settings, grayTxt, resetTxt } = require(`../config`)

const { rollFunNumber } = require(`./funNumber`)
const { getSubs } = require("./help")
const { handleJoin, handlePart } = require("./joinPart")

function checkPoints(props) {
    const { bot, chatroom, args, channel } = props
    if (settings.debug) { console.log(`${grayTxt}> checkPoints(chatroom: ${chatroom}, args: ${args})${resetTxt}`) }

    users[BOT_USERNAME]?.[channel].points || users[BOT_USERNAME]?.[channel].points === 0
        ? bot.say(chatroom, `I have ${users[BOT_USERNAME][channel].points} point${users[BOT_USERNAME][channel].points === 1 ? `` : `s`}!`)
        : bot.say(chatroom, `I don't know how many points I have!`)
}

module.exports = {
    '!test': checkPoints,
    'tags': (props) => { console.log(props.tags) },

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
