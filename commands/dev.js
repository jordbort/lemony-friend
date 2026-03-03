const BOT_USERNAME = process.env.BOT_USERNAME

const { settings } = require(`../config`)
const { lemonyFresh, users, mods, commonNicknames, startingLemons, hangmanWins, joinedChatrooms } = require(`../data`)

const { getSubs } = require(`./help`)
const { rollFunNumber } = require(`./funNumber`)
const { handleJoin, handlePart } = require(`./joinPart`)
const { updateEventSubs, apiGetEventSubs } = require(`./twitch`)
const { logMessage, printMemory, pluralize, getContextEmote, getToUser, arrToList } = require(`../utils`)
const { printWebSockets, closeWebSocket, removeClosedWebSockets, forceTrimWebSocket, createWebSocket, checkWebSockets } = require(`../events/webSockets`)
const { apiCreateConduit, apiGetConduits, apiUpdateConduit, apiDeleteConduit, apiGetConduitShards, apiUpdateConduitShard } = require(`../events/conduits`)

function checkPoints(props) {
    const { bot, chatroom, channel } = props
    logMessage([`> checkPoints(chatroom: ${chatroom})`])

    users[BOT_USERNAME].channels?.[channel].points || users[BOT_USERNAME].channels?.[channel].points === 0
        ? bot.say(chatroom, `I have ${pluralize(users[BOT_USERNAME].channels[channel].points, `point`, `points`)}!`)
        : bot.say(chatroom, `I don't know how many points I have!`)
}

module.exports = {
    'joined': (props) => { console.log(joinedChatrooms.length, joinedChatrooms) },
    'create': (props) => {
        const { bot, chatroom, args } = props
        const num = !args.length || isNaN(args[0]) ? null : args[0]
        if (num === null) {
            bot.say(chatroom, `shardCount needed`)
            return
        }
        apiCreateConduit(num)
    },
    'get': async (props) => {
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
    'delete': (props) => {
        const { bot, chatroom } = props
        if (!settings.conduitId) {
            bot.say(chatroom, `No conduit ID`)
            return
        }
        apiDeleteConduit(settings.conduitId)
    },
    'getshards': async (props) => {
        const { bot, chatroom, channel } = props
        if (!settings.conduitId) {
            bot.say(chatroom, `No conduit ID`)
            return
        }
        const data = await apiGetConduitShards(settings.conduitId)
        checkWebSockets(data)
    },
    'updateshard': (props) => {
        const { bot, chatroom, args } = props
        const num = !args.length || isNaN(args[0]) ? null : args[0]
        if (num === null) {
            bot.say(chatroom, `1st arg 'shardId' needed`)
            return
        }
        const webSocketSessionId = args[1]
        if (!webSocketSessionId) {
            bot.say(chatroom, `2nd arg 'webSocketSessionId' needed`)
            return
        }
        apiUpdateConduitShard(settings.conduitId, num, webSocketSessionId)
    },
    'getsubs': async (props) => {
        const { bot, args, chatroom } = props
        const twitchData = await apiGetEventSubs()
        if (args[0] === `-v`) {
            bot.say(chatroom, pluralize(twitchData.total, `EventSub`, `EventSubs`))
            console.log(twitchData.total)
            console.log(twitchData.data.length, twitchData.data.map(obj => `${`broadcaster_user_id` in obj.condition
                ? `${Object.keys(lemonyFresh).filter(key => lemonyFresh[key].id === Number(obj.condition.broadcaster_user_id))[0]}`
                : `global`}, ${obj.type}, ${obj.status}`
            ))
            console.log(twitchData.pagination)
            if (`cursor` in twitchData.pagination) {
                const moreData = await apiGetEventSubs(twitchData.pagination.cursor)
                console.log(moreData.data.length, moreData.data.map(obj => `${`broadcaster_user_id` in obj.condition
                    ? `${Object.keys(lemonyFresh).filter(key => lemonyFresh[key].id === Number(obj.condition.broadcaster_user_id))[0]}`
                    : `global`}, ${obj.type}, ${obj.status}`
                ))
            }
        } else {
            const eventSubs = {}
            for (const obj of twitchData.data) {
                const channel = Object.keys(lemonyFresh).filter(key => lemonyFresh[key].id === Number(obj.condition.broadcaster_user_id))[0] || `global`
                if (!(channel in eventSubs)) { eventSubs[channel] = {} }
                eventSubs[channel][obj.type] = obj.status
            }
            console.log(twitchData.total)
            for (const channel in eventSubs) {
                console.log(channel, Object.keys(eventSubs[channel]).length)
                console.log(channel, eventSubs[channel])
            }
            const reply = arrToList(Object.keys(eventSubs).map(key => pluralize(Object.keys(eventSubs[key]).length, `${key} EventSub`, `${key} EventSubs`)))
            bot.say(chatroom, reply)
        }
    },
    'all': (props) => {
        printWebSockets()
    },
    '_crash': function kms(props) { throw Error(`Error${props.args.length ? ` with value${props.args.length === 1 ? `` : `s`} '${props.args.join(`', '`)}'` : ``}`) },
    '_shutdown': async (props) => {
        const { bot, chatroom, channel } = props
        await printMemory(bot.channels)

        const byeEmote = getContextEmote(`bye`, channel)
        bot.say(chatroom, `Bye for now! ${byeEmote}`)

        await logMessage([`> Done`])
        process.exit(0)
    },
    'open': (props) => {
        const { bot, chatroom, args, channel } = props
        if (args.length) {
            if (args[0] === `all`) {
                for (const streamer of bot.channels) { createWebSocket(bot, streamer, streamer.substring(1)) }
            } else {
                for (const arg of args) {
                    const streamer = getToUser(arg)
                    if (streamer in lemonyFresh) { createWebSocket(bot, `#${streamer}`, streamer) }
                }
            }
        } else { createWebSocket(bot, chatroom, channel) }
    },
    'close': (props) => {
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
    'update': (props) => {
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
    'cleanup': (props) => {
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
    'trim': (props) => {
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
