const BOT_USERNAME = process.env.BOT_USERNAME

const { settings } = require(`../config`)
const { lemonyFresh, users, mods, commonNicknames, startingLemons, hangmanWins, joinedChatrooms } = require(`../data`)

const { getSubs } = require(`./help`)
const { rollFunNumber } = require(`./funNumber`)
const { handleJoin, handlePart } = require(`./joinPart`)
const { updateEventSubs, apiGetEventSubs } = require(`./twitch`)
const { logMessage, printMemory, pluralize, getContextEmote, getToUser } = require(`../utils`)
const { apiCreateConduit, apiGetConduits, apiUpdateConduit, apiDeleteConduit, apiGetConduitShards } = require(`../events/conduits`)
const { printWebSockets, closeWebSocket, removeClosedWebSockets, forceTrimWebSocket, createWebSocket, checkWebSockets } = require(`../events/webSockets`)

function checkPoints(props) {
    const { bot, chatroom, channel } = props
    logMessage([`> checkPoints(chatroom: ${chatroom})`])

    users[BOT_USERNAME].channels?.[channel].points || users[BOT_USERNAME].channels?.[channel].points === 0
        ? bot.say(chatroom, `I have ${pluralize(users[BOT_USERNAME].channels[channel].points, `point`, `points`)}!`)
        : bot.say(chatroom, `I don't know how many points I have!`)
}

module.exports = {
    // For conduits
    'createconduit': (props) => {
        const { bot, chatroom, args } = props
        const num = !args.length || isNaN(args[0]) ? null : args[0]
        if (num === null) {
            bot.say(chatroom, `shardCount needed`)
            return
        }
        apiCreateConduit(num)
    },
    'getconduit': async (props) => {
        const { bot, chatroom } = props
        if (!settings.conduitId) {
            bot.say(chatroom, `No conduit ID`)
            return
        }
        const data = await apiGetConduits()
        if (data) { bot.say(chatroom, `${pluralize(data[0].shard_count, `shard`, `shards`)}`) }
    },
    'shardcount': (props) => {
        const { bot, chatroom, args } = props
        if (!settings.conduitId) {
            bot.say(chatroom, `No conduit ID`)
            return
        }
        const num = !args.length || isNaN(args[0]) ? null : args[0]
        if (num === null) {
            bot.say(chatroom, `Number needed`)
            return
        }
        apiUpdateConduit(settings.conduitId, num)
    },
    'deleteconduit': (props) => {
        const { bot, chatroom } = props
        if (!settings.conduitId) {
            bot.say(chatroom, `No conduit ID`)
            return
        }
        apiDeleteConduit(settings.conduitId)
    },
    'getshards': async (props) => {
        const { bot, chatroom } = props
        if (!settings.conduitId) {
            bot.say(chatroom, `No conduit ID`)
            return
        }
        const data = await apiGetConduitShards(settings.conduitId)
        checkWebSockets(data)
    },
    'joined': () => { console.log(joinedChatrooms.length, joinedChatrooms) },

    // For WebSockets
    'ws': printWebSockets,
    'getsubs': async (props) => {
        const { bot, args, chatroom } = props
        const reply = []
        if (!args.length) {
            for (const channel of joinedChatrooms.map(chatroom => chatroom.substring(1))) {
                if (channel in lemonyFresh) {
                    const twitchData = await apiGetEventSubs(lemonyFresh[channel].id)
                    const enabled = twitchData.data.filter(el => el.status === `enabled`).map(el => el.type)
                    const disabled = twitchData.data.filter(el => el.status !== `enabled`).map(el => el.type)
                    console.log(`${channel} ENABLED:`, enabled)
                    console.log(`${channel} DISABLED:`, disabled)
                    reply.push(`${channel}:${enabled.length ? ` ${enabled.length} enabled` : ``}${disabled.length ? ` ${disabled.length} disabled` : ``}${!enabled.length && !disabled.length ? ` No EventSubs` : ``}`)
                }
            }
        } else {
            for (const arg of args) {
                if (arg in lemonyFresh) {
                    const twitchData = await apiGetEventSubs(lemonyFresh[arg].id)
                    const enabled = twitchData.data.filter(el => el.status === `enabled`).map(el => el.type)
                    const disabled = twitchData.data.filter(el => el.status !== `enabled`).map(el => el.type)
                    console.log(`${arg} ENABLED:`, enabled)
                    console.log(`${arg} DISABLED:`, disabled)
                    reply.push(`${arg}:${enabled.length ? ` ${enabled.length} enabled` : ``}${disabled.length ? ` ${disabled.length} disabled` : ``}${!enabled.length && !disabled.length ? ` No EventSubs` : ``}`)
                }
            }
        }
        if (!reply.length) { return }
        bot.say(chatroom, reply.join(`, `))
    },
    'openws': (props) => {
        const { bot, args, channel } = props
        if (args.length) {
            if (args[0] === `all`) {
                for (const chatroom of bot.channels) { createWebSocket(bot, chatroom.substring(1)) }
            } else {
                for (const arg of args) {
                    const streamer = getToUser(arg)
                    if (streamer in lemonyFresh) { createWebSocket(bot, streamer) }
                }
            }
        } else { createWebSocket(bot, channel) }
    },
    'closews': (props) => {
        const { bot, args, channel } = props
        if (args.length) {
            if (args[0] === `all`) {
                for (const chatroom of bot.channels) {
                    if (chatroom.substring(1) in lemonyFresh) { closeWebSocket(bot, chatroom.substring(1)) }
                }
            } else {
                for (const arg of args) {
                    const streamer = getToUser(arg)
                    if (streamer in lemonyFresh) { closeWebSocket(bot, streamer) }
                }
            }
        } else { closeWebSocket(bot, channel) }
    },
    'updatesubs': (props) => {
        const { bot, args, channel } = props
        if (args.length) {
            if (args[0] === `all`) {
                for (const chatroom of bot.channels) {
                    if (chatroom.substring(1) in lemonyFresh) { updateEventSubs(chatroom.substring(1)) }
                }
            } else {
                for (const arg of args) {
                    const streamer = getToUser(arg)
                    if (streamer in lemonyFresh) { updateEventSubs(streamer) }
                }
            }
        } else { updateEventSubs(channel) }
    },
    'cleanupws': (props) => {
        const { bot, args, channel } = props
        if (args.length) {
            if (args[0] === `all`) {
                for (const chatroom of bot.channels) {
                    if (chatroom.substring(1) in lemonyFresh) { removeClosedWebSockets(chatroom.substring(1)) }
                }
            } else {
                for (const arg of args) {
                    const streamer = getToUser(arg)
                    if (streamer in lemonyFresh) { removeClosedWebSockets(streamer) }
                }
            }
        } else { removeClosedWebSockets(channel) }
    },
    'trimws': (props) => {
        const { bot, args, channel } = props
        if (args.length) {
            if (args[0] === `all`) {
                for (const chatroom of bot.channels) {
                    if (chatroom.substring(1) in lemonyFresh) { forceTrimWebSocket(chatroom.substring(1)) }
                }
            } else {
                for (const arg of args) {
                    const streamer = getToUser(arg)
                    if (streamer in lemonyFresh) { forceTrimWebSocket(streamer) }
                }
            }
        } else { forceTrimWebSocket(channel) }
    },

    // For saving memory file
    '_shutdown': async (props) => {
        const { bot, chatroom, channel } = props
        await printMemory(bot.channels)

        const byeEmote = getContextEmote(`bye`, channel)
        bot.say(chatroom, `Bye for now! ${byeEmote}`)

        await logMessage([`> Done`])
        process.exit(0)
    },
    '_print': async (props) => { await printMemory(props.bot.channels) },
    '_crash': function kms(props) { throw Error(`Error${props.args.length ? ` with value${props.args.length === 1 ? `` : `s`} '${props.args.join(`', '`)}'` : ``}`) },

    // Unclaimed old nicknames, lemons, and Hangman wins
    'unknown': () => {
        console.log(Object.keys(commonNicknames).length, `unapplied nicknames:`, commonNicknames)
        console.log(Object.keys(startingLemons).length, `unclaimed lemons:`, startingLemons)
        console.log(Object.keys(hangmanWins).length, `unapplied Hangman wins:`, hangmanWins)
    },

    // For individual data
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
    'tags': (props) => { console.log(props.tags) },
    'settings': () => { console.log(settings) },
    'channels': (props) => { console.log(props.bot.channels) },

    // For messaging across all channels
    '!broadcast': (props) => {
        const { bot, message } = props
        for (const chatroom of bot.channels) {
            if (chatroom.substring(1) in lemonyFresh) { bot.say(chatroom, `${message.substring(11)}`) }
        }
    },

    // For stream-friendly log view
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

    // For testing funCumber outcomes
    'test': (props) => { if (!isNaN(props.args[0])) { rollFunNumber(props, Number(props.args[0])) } },

    '!test': checkPoints,
    '!subs': getSubs,
    '!join': handleJoin,
    '!part': handlePart
}
