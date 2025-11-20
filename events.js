const CLIENT_ID = process.env.CLIENT_ID
const BOT_USERNAME = process.env.BOT_USERNAME

const WebSocket = require(`ws`)

const { settings } = require(`./config`)
const { users, mods, lemonyFresh } = require(`./data`)
const webSockets = {}
for (const channel in lemonyFresh) { webSockets[channel] = [] }

function getWebSocket(channel, reconnection = false) {
    if (webSockets[channel]) {
        logMessage([`> getWebSocket(channel: '${channel}', reconnection: ${reconnection}, length: ${webSockets[channel].length})`])
        if (webSockets[channel].length === 0) {
            logMessage([`* WARNING: No WebSocket exists for '${channel}'${reconnection ? ` reconnection = ${reconnection}` : ``}`])
            return
        } else if (webSockets[channel].length !== 1 && reconnection) {
            logMessage([`* WARNING: Reconnecting, ${webSockets[channel].length} WebSockets exist for '${channel}'`])
        } else if (webSockets[channel].length >= 2) {
            reconnection
                ? logMessage([`> Reconnecting, ${pluralize(webSockets[channel].length, `WebSocket exists`, `WebSockets exist`)} for '${channel}', returning newest one to apply event listeners`])
                : logMessage([`* WARNING: ${webSockets[channel].length} WebSockets exist for '${channel}'`])
        }
        return webSockets[channel][webSockets[channel].length - 1]
    } else { logMessage([`> getWebSocket(channel: '${channel}') - Error: No WebSocket in webSockets{} for '${channel}'`]) }
}

function openWebSocket(channel, path = `wss://eventsub.wss.twitch.tv/ws`) {
    logMessage([`> openWebSocket(channel: '${channel}', path: '${path}')`])
    console.log(`BEFORE:`, channel, webSockets[channel].length, webSockets[channel].map(obj => obj?._closeFrameReceived === undefined ? `undefined?` : obj._closeFrameReceived ? `closed` : `open`))
    webSockets[channel].push(new WebSocket(path))
    console.log(`AFTER:`, channel, webSockets[channel].length, webSockets[channel].map(obj => obj?._closeFrameReceived === undefined ? `undefined?` : obj._closeFrameReceived ? `closed` : `open`))
}

function handleEvent(bot, chatroom, channel, type, event) {
    if (type === `stream.online`) { handleStreamOnline(bot, chatroom, channel) }
    else if (type === `stream.offline`) { handleStreamOffline(bot, chatroom, channel) }
    else if (type === `channel.follow`) { handleChannelFollow(bot, chatroom, channel, event) }
    else if (type === `channel.vip.add`) { handleChannelAddVIP(bot, chatroom, channel, event) }
    else if (type === `channel.vip.remove`) { handleChannelRemoveVIP(channel, event) }
    else if (type === `channel.moderator.add`) { handleChannelAddModerator(bot, chatroom, channel, event) }
    else if (type === `channel.moderator.remove`) { handleChannelRemoveModerator(chatroom, event) }
    else if (type === `channel.shoutout.receive`) { handleChannelReceiveShoutout(bot, chatroom, channel, event) }
    else if (type === `channel.subscribe`) { handleChannelSubscription(bot, chatroom, channel, event) }
    else if (type === `channel.subscription.end`) { handleChannelSubscriptionEnd(bot, chatroom, channel, event) }
    else if (type === `channel.subscription.gift`) { handleChannelGiftSubs(bot, chatroom, channel, event) }
    else if (type === `channel.cheer`) { handleChannelCheer(bot, chatroom, channel, event) }
    else if (type === `channel.hype_train.begin`) { handleChannelHypeTrainBegin(bot, chatroom, channel, event) }
}

async function handleStreamOnline(bot, chatroom, channel) {
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const endpoint = `https://api.twitch.tv/helix/channels?broadcaster_id=${lemonyFresh[channel].id}`
    const options = {
        headers: {
            authorization: `Bearer ${settings.botAccessToken}`,
            'Client-Id': CLIENT_ID
        }
    }
    const response = await fetch(endpoint, options)
    const twitchData = await response.json()

    const greetingEmote = getContextEmote(`greeting`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)

    const announcements = [
        `${streamer} is now live, have a great stream! ${hypeEmote}`,
        `${streamer} has gone live! ${hypeEmote}`,
        `Hi ${streamer} nation ${greetingEmote}`,
        `first`
    ]
    if (twitchData?.data?.[0]) {
        announcements.push(
            `Have fun ${twitchData.data[0].game_name
                ? twitchData.data[0].game_name === `Just Chatting`
                    ? `chatting with viewers`
                    : `playing ${twitchData.data[0].game_name}`
                : `doing nothing`
            }, ${streamer}! ${greetingEmote}`
        )
    }
    const reply = announcements[Math.floor(Math.random() * announcements.length)]

    bot.say(chatroom, reply)
}

function handleStreamOffline(bot, chatroom, channel) {
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const byeEmote = getContextEmote(`bye`, channel)
    const neutralEmote = getContextEmote(`neutral`, channel)

    const announcements = [
        `${streamer} has gone offline! ${byeEmote}`,
        `${streamer} has gone offline! ${byeEmote}`,
        `${streamer} has gone offline! ${byeEmote}`,
        `Bye ${streamer} and chat ${byeEmote}`,
        `Bye ${streamer} and chat ${byeEmote}`,
        `Bye ${streamer} and chat ${byeEmote}`,
        `Hope you had a good stream, ${streamer} ${neutralEmote}`,
        `Hope you had a good stream, ${streamer} ${neutralEmote}`,
        `last`
    ]
    const reply = announcements[Math.floor(Math.random() * announcements.length)]

    bot.say(chatroom, reply)
}

function handleChannelFollow(bot, chatroom, channel, event) {
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const followerName = event.user_login in users
        ? users[event.user_login].nickname || users[event.user_login].displayName
        : event.user_name

    const greetingEmote = getContextEmote(`greeting`, channel)

    const reply = `Thank you for following ${streamer}, ${followerName}! ${greetingEmote}`
    bot.say(chatroom, reply)
}

function handleChannelAddVIP(bot, chatroom, channel, event) {
    const username = event.user_login
    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].sub = true
    }
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const vipName = username in users
        ? users[username].nickname || users[username].displayName
        : event.user_name

    const positiveEmote = getContextEmote(`positive`, channel)

    const reply = username === BOT_USERNAME
        ? `Thanks for adding me as a VIP, ${streamer}! ${positiveEmote}`
        : `${streamer} added ${vipName} as a VIP! ${positiveEmote}`
    bot.say(chatroom, reply)
}

function handleChannelRemoveVIP(channel, event) {
    const username = event.user_login
    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].vip = false
    }
}

function handleChannelAddModerator(bot, chatroom, channel, event) {
    const username = event.user_login
    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].mod = true
    }
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const modName = username in users
        ? users[username].nickname || users[username].displayName
        : event.user_name

    const positiveEmote = getContextEmote(`positive`, channel)

    const self = username === BOT_USERNAME
    updateMod(chatroom, { 'user-id': event.user_id }, self, username)

    const reply = self
        ? `Thanks for adding me as a moderator, ${streamer}! ${positiveEmote}`
        : `${streamer} added ${modName} as a moderator! ${positiveEmote}`
    bot.say(chatroom, reply)
}

function handleChannelRemoveModerator(chatroom, event) {
    const username = event.user_login
    if (username in mods) {
        while (mods[username].isModIn.includes(chatroom)) {
            mods[username].isModIn.splice(mods[username].isModIn.indexOf(chatroom), 1)
        }
    }
}

function handleChannelReceiveShoutout(bot, chatroom, channel, event) {
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel
    const fromStreamer = event.from_broadcaster_user_login in users
        ? users[event.from_broadcaster_user_login].nickname || users[event.from_broadcaster_user_login].displayName
        : event.from_broadcaster_user_name
    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)
    const reply = `${streamer} just got a shoutout from ${fromStreamer} to ${pluralize(event.viewer_count, `viewer`, `viewers`)}! ${event.viewer_count >= 20 ? hypeEmote : positiveEmote}`
    bot.say(chatroom, reply)
}

function handleChannelSubscription(bot, chatroom, channel, event) {
    const username = event.user_login
    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].sub = true
    }

    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const subscriberName = username in users
        ? users[username].nickname || users[username].displayName
        : event.user_name

    const positiveEmote = getContextEmote(`positive`, channel)
    const reply = `${subscriberName} just subscribed to ${streamer}! ${positiveEmote}`
    bot.say(chatroom, reply)
}

function handleChannelSubscriptionEnd(bot, chatroom, channel, event) {
    const username = event.user_login
    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].sub = false
    }
    if (username === BOT_USERNAME) {
        const negativeEmote = getContextEmote(`negative`, channel)
        const reply = `Aww, did I lose my sub? ${negativeEmote}`
        bot.say(chatroom, reply)
    }
}

function handleChannelGiftSubs(bot, chatroom, channel, event) {
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel
    const gifter = event.user_login in users
        ? users[event.user_login].nickname || users[event.user_login].displayName
        : event.user_name
    const positiveEmote = getContextEmote(`positive`, channel)
    const reply = `${gifter} just gifted ${event.total === 1 ? `a sub` : `${event.total} subs`} to ${streamer}! ${positiveEmote}`
    bot.say(chatroom, reply)
}

function handleChannelCheer(bot, chatroom, channel, event) {
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel
    const subscriberName = event.is_anonymous
        ? `An anonymous user`
        : event.user_login in users
            ? users[event.user_login].nickname || users[event.user_login].displayName
            : event.user_name
    const positiveEmote = getContextEmote(`positive`, channel)
    const reply = `${subscriberName} just cheered ${pluralize(event.bits, `bit`, `bits`)} to ${streamer}! ${positiveEmote}`
    bot.say(chatroom, reply)
}

function handleChannelHypeTrainBegin(bot, chatroom, channel, event) {
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const contributors = event.top_contributions.map(obj => obj.user_login in users
        ? users[obj.user_login].nickname || users[obj.user_login].displayName
        : obj.user_name
    )

    const hypeEmote = getContextEmote(`hype`, channel)
    const reply = `A hype train just started for ${streamer}, thanks to ${arrToList(contributors)}! ${hypeEmote}`
    bot.say(chatroom, reply)
}

module.exports = {
    openWebSocket,
    handleEvent,
    getWebSocket,
    logWebsockets(channel) {
        if (channel in webSockets) {
            console.log(channel, webSockets[channel].length, webSockets[channel].map(obj => obj?._closeFrameReceived === undefined ? `undefined?` : obj._closeFrameReceived ? `closed` : `open`))
        } else { console.log(channel, `not in webSockets{}`) }
    },
    examineWebsockets(channel) {
        if (channel in webSockets) {
            console.log(channel, webSockets[channel].length, webSockets[channel].map(obj => obj?._closeFrameReceived === undefined ? `undefined?` : obj._closeFrameReceived ? `closed` : `open`))
            console.log(webSockets[channel])
        } else { console.log(channel, `not in webSockets{}`) }
    },
    handleStreamOffline,
    closeWebSocket(channel) {
        logMessage([`> closeWebSocket(channel: '${channel}')`])
        if (!lemonyFresh[channel].webSocketSessionId) { logMessage([`* WARNING: No webSocketSessionId for '${channel}'`]) }
        const ws = getWebSocket(channel)
        console.log(`BEFORE:`, channel, webSockets[channel].length, webSockets[channel].map(obj => obj?._closeFrameReceived === undefined ? `undefined?` : obj._closeFrameReceived ? `closed` : `open`))
        if (ws) {
            ws.close()
            webSockets[channel].splice(webSockets[channel].length - 1, 1)
            lemonyFresh[channel].webSocketSessionId = ``
        } else {
            console.log(`* Error: No web socket to close for '${channel}'`)
        }
        console.log(`AFTER:`, channel, webSockets[channel].length, webSockets[channel].map(obj => obj?._closeFrameReceived === undefined ? `undefined?` : obj._closeFrameReceived ? `closed` : `open`))
    },
    removeClosedWebSocket(channel) {
        logMessage([`> removeClosedWebSocket(channel: '${channel}')`])
        if (webSockets[channel][0]?._closeFrameReceived) { webSockets[channel].shift() }
        else { logMessage([`-> Error: No WebSocket removed`]) }
        console.log(`After removing closed web socket:`, channel, webSockets[channel].length, webSockets[channel].map(obj => obj?._closeFrameReceived === undefined ? `undefined?` : obj._closeFrameReceived ? `closed` : `open`))
    },
    handleReconnect(channel) {
        logMessage([`> handleReconnect(channel: '${channel}')`])
        console.log(`BEFORE:`, channel, webSockets[channel].length, webSockets[channel].map(obj => obj?._closeFrameReceived === undefined ? `undefined?` : obj._closeFrameReceived ? `closed` : `open`))
        if (webSockets[channel].length === 2) {
            webSockets[channel][0].close()
        } else {
            logMessage([`* WARNING: The wrong number of web sockets exist to handle reconnecting`])
        }
        console.log(`AFTER:`, channel, webSockets[channel].length, webSockets[channel].map(obj => obj?._closeFrameReceived === undefined ? `undefined?` : obj._closeFrameReceived ? `closed` : `open`))
    }
}
