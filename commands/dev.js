const BOT_USERNAME = process.env.BOT_USERNAME

const { settings } = require(`../config`)
const { lemonyFresh, users, mods, commonNicknames, startingLemons, hangmanWins } = require(`../data`)

const { getSubs } = require(`./help`)
const { rollFunNumber } = require(`./funNumber`)
const { handleJoin, handlePart } = require(`./joinPart`)
const { deleteAllEventSubs, updateEventSubs, apiGetEventSubs } = require(`./twitch`)
const { logMessage, printMemory, pluralize, getContextEmote, getToUser } = require(`../utils`)
const { initWebSocket, logWebsockets, examineWebsockets, closeWebSocket } = require(`../events`)

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
                await deleteAllEventSubs(streamer.substring(1))
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
    'ws': (props) => {
        const { bot, args } = props
        if (args.length) {
            for (const arg of args) {
                const streamer = getToUser(arg)
                if (streamer in lemonyFresh) { logWebsockets(streamer) }
            }
        } else {
            for (const chatroom of bot.channels) {
                if (chatroom.substring(1) in lemonyFresh) { logWebsockets(chatroom.substring(1)) }
            }
        }
    },
    'look': async (props) => {
        const { bot, args, channel } = props
        if (args.length) {
            if (args[0] === `all`) {
                for (const chatroom of bot.channels) {
                    if (chatroom.substring(1) in lemonyFresh) {
                        const obj = await apiGetEventSubs(chatroom.substring(1))
                        console.log(chatroom.substring(1), lemonyFresh[chatroom.substring(1)].webSocketSessionId)
                        if (obj && `data` in obj) { obj.data.forEach(el => console.log(`'${chatroom.substring(1)}' ${el.type} (${el.status}) - ${el.transport.session_id} ${lemonyFresh[chatroom.substring(1)].webSocketSessionId === el.transport.session_id ? `MATCH` : `NO MATCH`}`)) }
                        else { console.log(`Failed to get EventSubs for '${chatroom.substring(1)}'`) }
                    }
                }
            } else {
                for (const arg of args) {
                    const streamer = getToUser(arg)
                    if (streamer in lemonyFresh) {
                        const obj = await apiGetEventSubs(streamer)
                        console.log(streamer, lemonyFresh[streamer].webSocketSessionId)
                        if (obj && `data` in obj) { obj.data.forEach(el => console.log(`'${streamer}' ${el.type} (${el.status}) - ${el.transport.session_id} ${lemonyFresh[streamer].webSocketSessionId === el.transport.session_id ? `MATCH` : `NO MATCH`}`)) }
                        else { console.log(`Failed to get EventSubs for '${streamer}'`) }
                    }
                }
            }
        } else {
            const obj = await apiGetEventSubs(channel)
            console.log(channel, lemonyFresh[channel].webSocketSessionId)
            if (obj && `data` in obj) { obj.data.forEach(el => console.log(`'${channel}' ${el.type} (${el.status}) - ${el.transport.session_id} ${lemonyFresh[channel].webSocketSessionId === el.transport.session_id ? `MATCH` : `NO MATCH`}`)) }
            else { console.log(`Failed to get EventSubs for '${channel}'`) }
        }
    },
    'examine': (props) => {
        const { bot, args, channel } = props
        if (args.length) {
            if (args[0] === `all`) {
                for (const chatroom of bot.channels) {
                    if (chatroom.substring(1) in lemonyFresh) { examineWebsockets(chatroom.substring(1)) }
                }
            } else {
                for (const arg of args) {
                    const streamer = getToUser(arg)
                    if (streamer in lemonyFresh) { examineWebsockets(streamer) }
                }
            }
        } else { examineWebsockets(channel) }
    },
    'close': (props) => {
        const { bot, chatroom, args, channel } = props
        if (args.length) {
            if (args[0] === `all`) {
                for (const chatroom of bot.channels) {
                    if (chatroom.substring(1) in lemonyFresh) { closeWebSocket(bot, chatroom, chatroom.substring(1)) }
                }
            } else {
                for (const arg of args) {
                    const streamer = getToUser(arg)
                    if (streamer in lemonyFresh) { closeWebSocket(bot, chatroom, streamer) }
                }
            }
        } else { closeWebSocket(bot, chatroom, channel) }
    },
    'update': (props) => {
        const { bot, args, channel } = props
        if (args.length) {
            if (args[0] === `all`) {
                for (const chatroom of bot.channels) {
                    if (chatroom.substring(1) in lemonyFresh) { updateEventSubs(chatroom.substring(1), true) }
                }
            } else {
                for (const arg of args) {
                    const streamer = getToUser(arg)
                    if (streamer in lemonyFresh) { updateEventSubs(streamer, true) }
                }
            }
        } else { updateEventSubs(channel, true) }
    },
    'init': (props) => {
        const { bot, chatroom, args, channel } = props
        if (args.length) {
            if (args[0] === `all`) {
                for (const streamer of bot.channels) { initWebSocket(bot, streamer, streamer.substring(1)) }
            } else {
                for (const arg of args) {
                    const streamer = getToUser(arg)
                    if (streamer in lemonyFresh) { initWebSocket(bot, `#${streamer}`, streamer) }
                }
            }
        } else { initWebSocket(bot, chatroom, channel) }
    },
    '_print': async (props) => { await printMemory(props.bot.channels) },
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
            if (chatroom.substring(1) in lemonyFresh) { bot.say(chatroom, `${message.substring(11)}`) }
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
