const BOT_USERNAME = process.env.BOT_USERNAME

const { settings } = require(`../config`)
const { lemonyFresh, users, mods, commonNicknames, startingLemons, hangmanWins } = require(`../data`)

const { getSubs } = require(`./help`)
const { rollFunNumber } = require(`./funNumber`)
const { handleJoin, handlePart } = require(`./joinPart`)
const { logMessage, dumpMemory, getContextEmote, printMemory, pluralize } = require(`../utils`)
const { deleteEventSubs, createWebSocket, refreshChannels } = require(`../events`)

function checkPoints(props) {
    const { bot, chatroom, channel } = props
    logMessage([`> checkPoints(chatroom: ${chatroom})`])

    users[BOT_USERNAME].channels?.[channel].points || users[BOT_USERNAME].channels?.[channel].points === 0
        ? bot.say(chatroom, `I have ${pluralize(users[BOT_USERNAME].channels[channel].points, `point`, `points`)}!`)
        : bot.say(chatroom, `I don't know how many points I have!`)
}

module.exports = {
    '_crash': function kms(props) { throw Error(`Error${props.args.length ? ` with value${props.args.length === 1 ? `` : `s`} '${props.args.join(`', '`)}'` : ``}`) },
    '_shutdown': async (props) => {
        const { bot, chatroom, channel } = props
        for (const streamer of bot.channels) {
            if (lemonyFresh[streamer.substring(1)].webSocketSessionId) {
                await deleteEventSubs(streamer.substring(1))
                closeWebSocket(streamer.substring(1))
                lemonyFresh[streamer.substring(1)].webSocketSessionId = ``
            }
        }
        await printMemory(bot.channels)
        const byeEmote = getContextEmote(`bye`, channel)
        bot.say(chatroom, `Bye for now! ${byeEmote}`)
        await logMessage([`> Done`])
        process.exit(0)
    },
    '_print': async (props) => { await printMemory(props.bot.channels) },
    '_connect': async (props) => {
        const { bot, chatroom } = props
        for (const channel in lemonyFresh) {
            if (lemonyFresh[channel].accessToken && lemonyFresh[channel].refreshToken) {
                lemonyFresh[channel].websocketSessionId = ``
                await createWebSocket(bot, chatroom, channel)
            }
        }
    },
    '!refresh': refreshChannels,
    'dump': dumpMemory,
    '!test': checkPoints,
    'tags': (props) => { console.log(props.tags) },

    'unknown': () => {
        console.log(Object.keys(commonNicknames).length, `unapplied nicknames:`, commonNicknames)
        console.log(Object.keys(startingLemons).length, `unclaimed lemons:`, startingLemons)
        console.log(Object.keys(hangmanWins).length, `unapplied Hangman wins:`, hangmanWins)
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

    'settings': () => { console.log(settings) },

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
