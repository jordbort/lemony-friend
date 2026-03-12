const BOT_USERNAME = process.env.BOT_USERNAME

const { settings } = require(`../config`)
const { lemonyFresh, users, mods, commonNicknames, startingLemons, hangmanWins, joinedChatrooms } = require(`../data`)

const { getSubs } = require(`./help`)
const { rollFunNumber } = require(`./funNumber`)
const { handleJoin, handlePart } = require(`./joinPart`)
const { updateEventSubs, apiGetEventSubs } = require(`./twitch`)
const { initWebSocket, closeWebSocket, checkWebSockets } = require(`../events/webSockets`)
const { logMessage, printMemory, pluralize, getContextEmote, getToUser } = require(`../utils`)
const { apiCreateConduit, apiGetConduits, apiUpdateConduit, apiDeleteConduit, apiGetConduitShards } = require(`../events/conduits`)

function createConduit(props) {
    const { bot, chatroom, args } = props
    const num = !args.length || isNaN(args[0]) ? null : args[0]
    if (num === null) {
        bot.say(chatroom, `shardCount needed`)
        return
    }
    apiCreateConduit(num)
}

async function getConduit(props) {
    const { bot, chatroom } = props
    if (!settings.conduitId) {
        bot.say(chatroom, `No conduit ID`)
        return
    }
    const data = await apiGetConduits()
    if (data) {
        bot.say(chatroom, `${pluralize(data[0].shard_count, `shard`, `shards`)}`)
    }
}

function updateConduitShardCount(props) {
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
}

function deleteConduit(props) {
    const { bot, chatroom } = props
    if (!settings.conduitId) {
        bot.say(chatroom, `No conduit ID`)
        return
    }
    apiDeleteConduit(settings.conduitId)
}

async function getConduitShards(props) {
    const { bot, chatroom } = props
    if (!settings.conduitId) {
        bot.say(chatroom, `No conduit ID`)
        return
    }
    const data = await apiGetConduitShards(settings.conduitId)
    checkWebSockets(data)
}

function logJoinedChatrooms() {
    console.log(joinedChatrooms.length, joinedChatrooms)
}

async function getEventSubs(props) {
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
}

function connectWebSocket(props) {
    const { bot, args, channel } = props
    if (args.length) {
        if (args[0] === `all`) {
            for (const chatroom of bot.channels) { initWebSocket(bot, chatroom.substring(1)) }
        } else {
            for (const arg of args) {
                const streamer = getToUser(arg)
                if (streamer in lemonyFresh) { initWebSocket(bot, streamer) }
            }
        }
    } else { initWebSocket(bot, channel) }
}

function disconnectWebSocket(props) {
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
}

function refreshEventSubs(props) {
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
}

async function shutdown(props) {
    const { bot, chatroom, channel } = props
    await printMemory(bot.channels)

    const byeEmote = getContextEmote(`bye`, channel)
    bot.say(chatroom, `Bye for now! ${byeEmote}`)

    await logMessage([`> Done`])
    process.exit(0)
}

async function writeMemoryFile(props) {
    await printMemory(props.bot.channels)
}

function kms(props) {
    const message = `Error${props.args.length
        ? ` with value${props.args.length === 1
            ? ``
            : `s`} '${props.args.join(`', '`)}'`
        : ``}`
    throw Error(message)
}

function logOldMemoryTables() {
    console.log(Object.keys(commonNicknames).length, `unapplied nicknames:`, commonNicknames)
    console.log(Object.keys(startingLemons).length, `unclaimed lemons:`, startingLemons)
    console.log(Object.keys(hangmanWins).length, `unapplied Hangman wins:`, hangmanWins)
}

function logChannelInfo(props) {
    const { channel, toUser } = props
    toUser in lemonyFresh
        ? console.log(lemonyFresh[toUser])
        : console.log(lemonyFresh[channel])
}

function logUserInfo(props) {
    const { username, toUser } = props
    toUser in users
        ? console.log(users[toUser])
        : console.log(users[username])
}

function logModInfo(props) {
    const { username, toUser } = props
    toUser in mods
        ? console.log(mods[toUser])
        : console.log(mods[username])
}

function logChannelViewers(props) {
    const { channel, toUser } = props
    toUser in lemonyFresh
        ? console.log(lemonyFresh[toUser].viewers)
        : console.log(lemonyFresh[channel].viewers)
}

function logTags(props) {
    console.log(props.tags)
}

function logSettings() {
    console.log(settings)
}

function logBotChannels(props) {
    console.log(props.bot.channels)
}

function yellAcrossChannels(props) {
    const { bot, message } = props
    for (const chatroom of bot.channels) {
        if (chatroom.substring(1) in lemonyFresh) { bot.say(chatroom, `${message.substring(11)}`) }
    }
}

function streamFriendlyOn(props) {
    const { bot, chatroom } = props
    settings.hideNonDevChannel = true
    settings.highlightBotMessage = false
    settings.logTime = false
    settings.debug = false
    bot.say(chatroom, `/me Settings hideNonDevChannel: ${settings.hideNonDevChannel}, highlightBotMessage: ${settings.highlightBotMessage}, logTime: ${settings.logTime}, debug: ${settings.debug}`)
}

function streamFriendlyOff(props) {
    const { bot, chatroom } = props
    settings.hideNonDevChannel = false
    settings.highlightBotMessage = true
    settings.logTime = true
    settings.debug = true
    bot.say(chatroom, `/me Settings hideNonDevChannel: ${settings.hideNonDevChannel}, highlightBotMessage: ${settings.highlightBotMessage}, logTime: ${settings.logTime}, debug: ${settings.debug}`)
}

function testFunNumber(props) {
    const { args } = props
    if (!isNaN(args[0])) {
        rollFunNumber(props, Number(args[0]))
    }
}

function checkPoints(props) {
    const { bot, chatroom, channel } = props
    logMessage([`> checkPoints(chatroom: ${chatroom})`])

    users[BOT_USERNAME].channels?.[channel].points || users[BOT_USERNAME].channels?.[channel].points === 0
        ? bot.say(chatroom, `I have ${pluralize(users[BOT_USERNAME].channels[channel].points, `point`, `points`)}!`)
        : bot.say(chatroom, `I don't know how many points I have!`)
}

module.exports = {
    // For conduits
    'createconduit': createConduit,
    'getconduit': getConduit,
    'shardcount': updateConduitShardCount,
    'deleteconduit': deleteConduit,
    'getshards': getConduitShards,
    'joined': logJoinedChatrooms,

    // For WebSockets
    'getsubs': getEventSubs,
    'openws': connectWebSocket,
    'closews': disconnectWebSocket,
    'updatesubs': refreshEventSubs,

    // For saving memory file
    '_shutdown': shutdown,
    '_print': writeMemoryFile,
    '_crash': kms,

    // Unclaimed old nicknames, lemons, and Hangman wins
    'unknown': logOldMemoryTables,

    // For individual data
    'channel': logChannelInfo,
    'user': logUserInfo,
    'mod': logModInfo,
    'viewers': logChannelViewers,
    'tags': logTags,
    'settings': logSettings,
    'channels': logBotChannels,

    // For messaging across all channels
    '!broadcast': yellAcrossChannels,

    // For stream-friendly log view
    '!streamon': streamFriendlyOn,
    '!streamoff': streamFriendlyOff,

    // For testing funCumber outcomes
    'test': testFunNumber,

    'sepoints': checkPoints,
    '!subs': getSubs,
    '!join': handleJoin,
    '!part': handlePart
}
