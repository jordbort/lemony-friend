const CLIENT_ID = process.env.CLIENT_ID
const BOT_USERNAME = process.env.BOT_USERNAME

const WebSocket = require(`ws`)

const { users, mods, lemonyFresh } = require(`./data`)

const { apiRefreshToken, apiGetTokenScope } = require(`./commands/twitch`)
const { logMessage, renderObj, getContextEmote, updateMod, pluralize } = require(`./utils`)

async function createWebSocket(bot, chatroom, channel, path = `wss://eventsub.wss.twitch.tv/ws`) {
    logMessage([`> createWebSocket(channel: '${channel}', path: '${path}')`])
    const arrScope = await apiGetTokenScope(channel)
    if (!arrScope) {
        logMessage([`-> Unable to determine ${channel}'s token scope`])
        return
    }
    const ws = new WebSocket(path)

    ws.onopen = () => logMessage([`-> WebSocket connection established for ${channel}`])

    ws.onmessage = async (event) => {
        // Log messages other than 'keepalive'
        const message = JSON.parse(event.data)
        if (message.metadata.message_type === `session_keepalive`) { return }
        logMessage([renderObj(message, `WebSocket message for ${channel}`)])

        // If welcome message, save session ID and create event subs
        if (message.metadata.message_type === `session_welcome`) {
            lemonyFresh[channel].websocketSessionId = message.payload.session.id
            await createEventSubs(channel, arrScope)
        }

        // Handle events
        if (`subscription` in message.payload) { handleEvent(bot, chatroom, channel, message.payload.subscription.type, message.payload.event) }

        // Handle reconnection
        if (message.metadata.message_type === `session_reconnect`) {
            console.log(message) // for debugging, because session_reconnect message didn't log?
            lemonyFresh[channel].websocketSessionId = ``
            // ws.close() // wait until we figure out if the new session ID is the same or different
            // we need to figure out if we need to store a second session ID
            createWebSocket(bot, chatroom, channel, event.payload.session.reconnect_url)
        }
    }

    ws.onclose = (event) => {
        const { code, reason, wasClean } = event
        wasClean
            ? logMessage([`-> WebSocket connection for ${channel} closed with code ${code}: '${reason}'`])
            : logMessage([`-> WebSocket connection for ${channel} died unexpectedly with code ${code}${reason ? `: '${reason}'` : ``}`])
        lemonyFresh[channel].websocketSessionId = ``
        if (![1000, 4003, 4004].includes(code)) { // Not on purpose, unused, or from reconnection
            logMessage([`> reconnectWebSocket(channel: '${channel}')`])
            createWebSocket(bot, chatroom, channel)
        }
    }

    ws.onerror = (error) => logMessage([`WebSocket Error:`, error])
}

async function createEventSub(channel, type, version, attempt = 1) {
    logMessage([`> createEventSub(channel: '${channel}', type: '${type}', version: '${version}', attempt: ${attempt})`])
    const streamer = lemonyFresh[channel]

    const endpoint = `https://api.twitch.tv/helix/eventsub/subscriptions`

    const requestBody = {
        type: type,
        version: version,
        condition: {
            broadcaster_user_id: `${streamer.id}`
        },
        transport: {
            method: `websocket`,
            session_id: streamer.websocketSessionId
        }
    }
    if ([
        `channel.follow`,
        `channel.shoutout.receive`
    ].includes(type)) {
        requestBody.condition.moderator_user_id = `${streamer.id}`
    }

    const options = {
        method: `POST`,
        headers: {
            authorization: `Bearer ${streamer.accessToken}`,
            'Client-Id': CLIENT_ID,
            'Content-Type': `application/json`
        },
        body: JSON.stringify(requestBody)
    }
    const response = await fetch(endpoint, options)

    if (response.status !== 202) {
        const twitchData = await response.json()
        logMessage([`createEventSub`, response.status, renderObj(twitchData, `twitchData`)])
        if (response.status === 401) {
            if (attempt < 3) {
                logMessage([`-> Failed to create '${type}' EventSub for ${channel}, attempting to get new access token...`])
                const retry = await apiRefreshToken(channel, streamer.refreshToken)
                if (retry) {
                    attempt++
                    return createEventSub(channel, type, version, attempt)
                }
            } else {
                logMessage([`-> Failed to create '${type}' EventSub for ${channel} after ${pluralize(attempt, `attempt`, `attempts`)}`])
                return null
            }
        } else if (response.status === 403) {
            return false
        }
    }
}

async function createEventSubs(channel, arrScope) {
    await createEventSub(channel, `stream.online`, `1`)
    await createEventSub(channel, `stream.offline`, `1`)
    if (arrScope.includes(`moderator:read:followers`)) {
        await createEventSub(channel, `channel.follow`, `2`)
    }
    if (arrScope.includes(`channel:manage:vips`)) {
        await createEventSub(channel, `channel.vip.add`, `1`)
        await createEventSub(channel, `channel.vip.remove`, `1`)
    }
    if (arrScope.includes(`moderation:read`)) {
        await createEventSub(channel, `channel.moderator.add`, `1`)
        await createEventSub(channel, `channel.moderator.remove`, `1`)
    }
    if (arrScope.includes(`moderator:manage:shoutouts`)) {
        await createEventSub(channel, `channel.shoutout.receive`, `1`)
    }
    if (arrScope.includes(`channel:read:subscriptions`)) {
        await createEventSub(channel, `channel.subscribe`, `1`)
        await createEventSub(channel, `channel.subscription.end`, `1`)
        await createEventSub(channel, `channel.subscription.gift`, `1`)
    }
    if (arrScope.includes(`bits:read`)) {
        await createEventSub(channel, `channel.cheer`, `1`)
    }
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
}

async function handleStreamOnline(bot, chatroom, channel) {
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const stream = await apiGetTwitchChannel(lemonyFresh[channel].id)
    const playingGame = stream.game_name
        ? stream.game_name === `Just Chatting`
            ? `chatting with viewers`
            : `playing ${stream.game_name}`
        : `doing nothing`

    const greetEmote = getContextEmote(`greet`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)

    const announcements = [
        `Have fun ${playingGame}, ${streamer}! ${greetEmote}`,
        `${streamer} is now live, have a great stream! ${hypeEmote}`,
        `${streamer} has gone live! ${hypeEmote}`,
        `Hi ${streamer} nation ${greetEmote}`,
        `first`
    ]
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

    const greetEmote = getContextEmote(`greet`, channel)

    const reply = `Thank you for following ${streamer}, ${followerName}! ${greetEmote}`
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

async function apiGetEventSubs(channel, attempt = 1) {
    logMessage([`> apiGetEventSubs(channel: '${channel}', attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/eventsub/subscriptions`
    const options = {
        headers: {
            authorization: `Bearer ${lemonyFresh[channel].accessToken}`,
            'Client-Id': CLIENT_ID,
            'Content-Type': `application/json`
        }
    }
    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    if (response.status !== 200) { logMessage([`apiGetEventSubs`, response.status, renderObj(twitchData, `twitchData`)]) }

    if (response.status === 200) {
        return twitchData
    } else if (response.status === 401) {
        if (attempt < 3) {
            logMessage([`-> Failed to get ${channel}'s event subscriptions, attempting to get new access token...`])
            const retry = await apiRefreshToken(channel, lemonyFresh[channel].refreshToken)
            if (retry) {
                attempt++
                return apiGetEventSubs(channel, attempt)
            }
        } else {
            logMessage([`-> Failed to get ${channel}'s event subscriptions after ${pluralize(attempt, `attempt`, `attempts`)}`])
            return null
        }
    }
}

async function apiDeleteEventSub(channel, id, attempt = 1) {
    const streamer = lemonyFresh[channel]
    const endpoint = `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`
    const options = {
        method: `DELETE`,
        headers: {
            authorization: `Bearer ${streamer.accessToken}`,
            'Client-Id': CLIENT_ID
        }
    }
    const response = await fetch(endpoint, options)
    if (response.status !== 204) {
        const twitchData = await response.json()
        logMessage([renderObj(twitchData, `twitchData`)])
        if (response.status === 401) {
            if (attempt < 3) {
                logMessage([`-> Failed to delete EventSub for ${channel}, attempting to get new access token...`])
                const retry = await apiRefreshToken(channel, streamer.refreshToken)
                if (retry) {
                    attempt++
                    return apiDeleteEventSub(channel, id, attempt)
                }
            } else {
                logMessage([`-> Failed to delete EventSub for ${channel} after ${pluralize(attempt, `attempt`, `attempts`)}`])
                return null
            }
        } else if (response.status === 403) {
            return false
        }
    }
}

async function refreshEventSubs(channel) {
    const arrScope = await apiGetTokenScope(channel)
    if (!arrScope) {
        logMessage([`-> Unable to determine ${channel}'s token scope`])
        return
    }

    const obj = await apiGetEventSubs(channel)
    if (obj && `data` in obj) {
        const enabled = obj.data.filter(obj => obj.status === `enabled`).map(obj => obj.type)
        const disabled = obj.data.filter(obj => obj.status !== `enabled`)
        if (disabled.length) {
            console.log(`channel:`, channel)
            console.log(`enabled:`, enabled.length, enabled)
            console.log(`disabled:`, disabled.length, disabled.map(obj => obj.type))
        }
        if (disabled.length) {
            for (const el of disabled) {
                logMessage([`> Deleting ${channel} ${el.type} (${el.status})`])
                await apiDeleteEventSub(channel, el.id)
            }
        }

        if (!enabled.includes(`stream.online`)) { await createEventSub(channel, `stream.online`, `1`) }
        if (!enabled.includes(`stream.offline`)) { await createEventSub(channel, `stream.offline`, `1`) }
        if (arrScope.includes(`moderator:read:followers`)) {
            if (!enabled.includes(`channel.follow`)) { await createEventSub(channel, `channel.follow`, `2`) }
        }
        if (arrScope.includes(`channel:manage:vips`)) {
            if (!enabled.includes(`channel.vip.add`)) { await createEventSub(channel, `channel.vip.add`, `1`) }
            if (!enabled.includes(`channel.vip.remove`)) { await createEventSub(channel, `channel.vip.remove`, `1`) }
        }
        if (arrScope.includes(`moderation:read`)) {
            if (!enabled.includes(`channel.moderator.add`)) { await createEventSub(channel, `channel.moderator.add`, `1`) }
            if (!enabled.includes(`channel.moderator.remove`)) { await createEventSub(channel, `channel.moderator.remove`, `1`) }
        }
        if (arrScope.includes(`moderator:manage:shoutouts`)) {
            if (!enabled.includes(`channel.shoutout.receive`)) { await createEventSub(channel, `channel.shoutout.receive`, `1`) }
        }
        if (arrScope.includes(`channel:read:subscriptions`)) {
            if (!enabled.includes(`channel.subscribe`)) { await createEventSub(channel, `channel.subscribe`, `1`) }
            if (!enabled.includes(`channel.subscription.end`)) { await createEventSub(channel, `channel.subscription.end`, `1`) }
            if (!enabled.includes(`channel.subscription.gift`)) { await createEventSub(channel, `channel.subscription.gift`, `1`) }
        }
        if (arrScope.includes(`bits:read`)) {
            if (!enabled.includes(`channel.cheer`)) { await createEventSub(channel, `channel.cheer`, `1`) }
        }
    }
}

module.exports = {
    createWebSocket,
    async refreshAllChannels() {
        for (const channel in lemonyFresh) {
            if (lemonyFresh[channel].accessToken && lemonyFresh[channel].refreshToken) {
                await refreshEventSubs(channel)
            }
        }
    },
    async deleteEventSubs(channel) {
        const obj = await apiGetEventSubs(channel)
        if (obj && `data` in obj) {
            if (obj.data.length) {
                for (const el of obj.data) {
                    logMessage([`-> Deleting ${channel} '${el.type}' EventSub (${el.status})`])
                    await apiDeleteEventSub(channel, el.id)
                }
            }
        }
    }
}
