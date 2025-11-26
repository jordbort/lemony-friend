const CLIENT_ID = process.env.CLIENT_ID
const BOT_USERNAME = process.env.BOT_USERNAME

const WebSocket = require(`ws`)

const { settings } = require(`./config`)
const { users, mods, lemonyFresh } = require(`./data`)
const { logMessage, getContextEmote, updateMod, pluralize, arrToList, renderObj } = require(`./utils`)

const batch = {}
for (const channel in lemonyFresh) {
    batch[channel] = {
        follows: { timer: 0, names: [] },
        subs: { timer: 0, names: [] },
        giftedSubs: { timer: 0, total: 0, gifters: [], names: [] }
    }
}
function resetChannelBatch(type, channel) {
    batch[channel][type].timer = 0
    batch[channel][type].names = []
    if (type === `giftedSubs`) {
        batch[channel][type].total = 0
        batch[channel][type].gifters = []
    }
}

const webSockets = {}
for (const channel in lemonyFresh) { webSockets[channel] = [] }

function getWebSocket(channel, reconnection = false) {
    logMessage([`> getWebSocket(channel: '${channel}', length: ${webSockets[channel]?.length})`])
    if (webSockets[channel]) {
        if (webSockets[channel].length === 0) {
            logMessage([`* WARNING: No WebSocket exists for '${channel}'`])
            return
        } else if (webSockets[channel].length >= 2) {
            if (webSockets[channel].length > 2 || !reconnection) {
                logMessage([`* WARNING: ${webSockets[channel].length} WebSockets exist for '${channel}'`])
            }
        }
        return webSockets[channel][webSockets[channel].length - 1]
    } else { logMessage([`* Error: No WebSocket in webSockets{} for '${channel}'`]) }
}

function openWebSocket(channel, path) {
    logMessage([`> openWebSocket(channel: '${channel}', path: '${path}')`])
    webSockets[channel].push(new WebSocket(path))
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
    else if (type === `channel.subscription.gift`) { handleChannelGiftSub(bot, chatroom, channel, event) }
    else if (type === `channel.subscription.message`) { handleChannelSubscriptionMessage(bot, chatroom, channel, event) }
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
    if (event.user_login === BOT_USERNAME) {
        logMessage([`-> Not thanking self for following`])
        return
    }
    const obj = batch[channel].follows

    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const followerName = event.user_login in users
        ? users[event.user_login].nickname || users[event.user_login].displayName
        : event.user_name

    obj.names.push(followerName)
    const greetingEmote = getContextEmote(`greeting`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)

    if (!obj.timer) {
        obj.timer = Number(setTimeout(() => {
            bot.say(chatroom, `Thank you ${arrToList(obj.names)} for following ${streamer}! ${obj.names >= 3 ? hypeEmote : greetingEmote}`)
            resetChannelBatch(`follows`, channel)
        }, 1000))
    } else {
        clearTimeout(obj.timer)
        obj.timer = Number(setTimeout(() => {
            bot.say(chatroom, `Thank you ${arrToList(obj.names)} for following ${streamer}! ${obj.names >= 3 ? hypeEmote : greetingEmote}`)
            resetChannelBatch(`follows`, channel)
        }, 1000))
    }

    logMessage([`> handleChannelFollow(channel: '${channel}', timer: ${obj.timer}, names: '${obj.names.join(`', '`)}')`])
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

    const subscriberName = username === BOT_USERNAME
        ? `me`
        : username in users
            ? users[username].nickname || users[username].displayName
            : event.user_name

    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)

    if (event.is_gift) {
        const obj = batch[channel].giftedSubs
        obj.names.push(subscriberName)
        if (!obj.timer) {
            obj.timer = Number(setTimeout(() => {
                bot.say(chatroom, `${arrToList(obj.gifters)} gifted ${obj.names.length === 1 ? `a ${streamer} sub` : `${streamer} subs`} to ${arrToList(obj.names)}! ${obj.names >= 5 ? hypeEmote : positiveEmote}`)
                resetChannelBatch(`giftedSubs`, channel)
            }, 1000))
        } else {
            clearTimeout(obj.timer)
            obj.timer = Number(setTimeout(() => {
                bot.say(chatroom, `${arrToList(obj.gifters)} gifted ${obj.names.length === 1 ? `a ${streamer} sub` : `${streamer} subs`} to ${arrToList(obj.names)}! ${obj.names >= 5 ? hypeEmote : positiveEmote}`)
                resetChannelBatch(`giftedSubs`, channel)
            }, 1000))
        }
        logMessage([`> handleChannelSubscription(channel: '${channel}', gift: ${event.is_gift}, timer: ${obj.timer}, gifters: '${obj.gifters.join(`', '`)}'), names: '${obj.names.join(`', '`)}')`])
    } else {
        const obj = batch[channel].subs
        obj.names.push(subscriberName)
        if (!obj.timer) {
            obj.timer = Number(setTimeout(() => {
                bot.say(chatroom, `${arrToList(obj.names)} just subscribed to ${streamer}! ${obj.names >= 3 ? hypeEmote : positiveEmote}`)
                resetChannelBatch(`subs`, channel)
            }, 1000))
        } else {
            clearTimeout(obj.timer)
            obj.timer = Number(setTimeout(() => {
                bot.say(chatroom, `${arrToList(obj.names)} just subscribed to ${streamer}! ${obj.names >= 3 ? hypeEmote : positiveEmote}`)
                resetChannelBatch(`subs`, channel)
            }, 1000))
        }
        logMessage([`> handleChannelSubscription(channel: '${channel}', gift: ${event.is_gift}, timer: ${obj.timer}, names: '${obj.names.join(`', '`)}')`])
    }
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

function handleChannelGiftSub(bot, chatroom, channel, event) {
    const obj = batch[channel].giftedSubs

    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const gifter = event.is_anonymous
        ? `an anonymous user`
        : event.user_login in users
            ? users[event.user_login].nickname || users[event.user_login].displayName
            : event.user_name

    obj.total += event.total
    obj.gifters.push(gifter)
    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)

    if (!obj.timer) {
        obj.timer = Number(setTimeout(() => {
            if (obj.total !== obj.names.length) { console.log(`TOTAL NAMES CHECK FAILED :(`) }
            else { console.log(`TOTAL NAMES CHECK PASSED :)`) }
            bot.say(chatroom, `${arrToList(obj.gifters)} gifted ${obj.names.length === 1 ? `a ${streamer} sub` : `${streamer} subs`} to ${arrToList(obj.names)}! ${obj.names >= 5 ? hypeEmote : positiveEmote}`)
            resetChannelBatch(`giftedSubs`, channel)
        }, 1000))
    } else {
        clearTimeout(obj.timer)
        obj.timer = Number(setTimeout(() => {
            if (obj.total !== obj.names.length) { console.log(`TOTAL NAMES CHECK FAILED :(`) }
            else { console.log(`TOTAL NAMES CHECK PASSED :)`) }
            bot.say(chatroom, `${arrToList(obj.gifters)} gifted ${obj.names.length === 1 ? `a ${streamer} sub` : `${streamer} subs`} to ${arrToList(obj.names)}! ${obj.names >= 5 ? hypeEmote : positiveEmote}`)
            resetChannelBatch(`giftedSubs`, channel)
        }, 1000))
    }

    logMessage([`> handleChannelGiftSub(channel: '${channel}', timer: ${obj.timer}, gifters: '${obj.gifters.join(`', '`)}'), names: '${obj.names.join(`', '`)}')`])
}

function handleChannelSubscriptionMessage(bot, chatroom, channel, event) {
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

    const yearCount = Math.floor(event.cumulative_months / 12)
    const monthCount = event.cumulative_months % 12
    const duration = `${yearCount ? `${pluralize(yearCount, `year`, `years`)}${monthCount ? ` and ` : ``}` : ``}${monthCount ? pluralize(monthCount, `month`, `months`) : ``}`

    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)
    const reply = yearCount && !monthCount
        ? `${subscriberName} has subscribed to ${streamer} for ${duration}! ${hypeEmote}`
        : `${subscriberName} has subscribed to ${streamer} for ${duration}! ${positiveEmote}`
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
        if (ws) {
            ws.close()
            webSockets[channel].splice(webSockets[channel].length - 1, 1)
            lemonyFresh[channel].webSocketSessionId = ``
        } else {
            console.log(`* Error: No web socket to close for '${channel}'`)
        }
    },
    removeClosedWebSockets(channel, code) {
        logMessage([`> removeClosedWebSockets(channel: '${channel}', code: ${code})`])
        for (let i = webSockets[channel].length - 1; i >= 0; i--) {
            if (webSockets[channel][i]._closeFrameReceived || code === 1006) {
                if (!webSockets[channel][i]._closeFrameReceived) { console.log(`* Error: WebSocket for '${channel}' at index ${i} is not closed yet, splicing anyway`) }
                webSockets[channel].splice(i, 1)
            }
        }
    },
    handleReconnect(channel) {
        logMessage([`> handleReconnect(channel: '${channel}')`])
        if (webSockets[channel].length === 2) {
            webSockets[channel][0].close()
        } else {
            console.log(`* WARNING: ${pluralize(webSockets[channel].length), `web socket exists`, `web sockets exist`} instead of 2!`)
        }
    },
    handleMessage(channel, message) {
        if (`subscription` in message.payload) {
            const streamer = message.payload.event.broadcaster_user_name
            const fromStreamer = message.payload.event.from_broadcaster_user_name
            const displayName = message.payload.event.user_name
            switch (message.payload.subscription.type) {
                case `stream.online`:
                    logMessage([`* ONLINE: ${streamer} started streaming`])
                    break
                case `stream.offline`:
                    logMessage([`* OFFLINE: ${streamer} stopped streaming`])
                    break
                case `channel.follow`:
                    logMessage([`* NEW FOLLOWER: ${streamer} was followed by ${displayName}`])
                    break
                case `channel.vip.add`:
                    logMessage([`* ADD VIP: ${streamer} added ${displayName} as a VIP`])
                    break
                case `channel.vip.remove`:
                    logMessage([`* REMOVE VIP: ${streamer} removed ${displayName} as a VIP`])
                    break
                case `channel.moderator.add`:
                    logMessage([`* ADD MODERATOR: ${streamer} added ${displayName} as a mod`])
                    break
                case `channel.moderator.remove`:
                    logMessage([`* REMOVE MODERATOR: ${streamer} removed ${displayName} as a mod`])
                    break
                case `channel.shoutout.receive`:
                    logMessage([`* SHOUTOUT: ${streamer} received a shoutout from ${fromStreamer}`])
                    break
                case `channel.subscribe`:
                    logMessage([`* SUB: ${displayName} just subscribed to ${streamer}`])
                    break
                case `channel.subscription.end`:
                    logMessage([`* SUB END: ${displayName}'s ${message.payload.event.is_gift ? `gift ` : ``}sub to ${streamer} expired`])
                    break
                case `channel.subscription.gift`:
                    logMessage([`* GIFT SUB: ${displayName || `An anonymous user`} gifted ${pluralize(message.payload.event.total), `sub`, `subs`} to ${streamer}`])
                    break
                case `channel.subscription.message`:
                    logMessage([`* SUB MESSAGE: ${displayName} resubscribed to ${streamer}`])
                    break
                case `channel.cheer`:
                    logMessage([`* BITS: ${displayName || `An anonymous user`} cheered ${pluralize(message.payload.event.bits), `bit`, `bits`} to ${streamer}`])
                    break
                case `channel.hype_train.begin`:
                    logMessage([`* HYPE TRAIN: A hype train started for ${streamer}`])
                    break
                default:
                    logMessage([renderObj(message, `WebSocket message for ${channel}`)])
            }
        } else {
            switch (message.metadata.message_type) {
                case `session_welcome`:
                    logMessage([`* WELCOME '${channel}' status: ${message.payload.session.status}`])
                    break
                case `session_reconnect`:
                    logMessage([`* RECONNECT '${channel}' status: ${message.payload.session.status}, reconnect_url: ${message.payload.session.reconnect_url}`])
                    break
                case `session_keepalive`:
                    break
                case `revocation`:
                    logMessage([`* REVOKED '${channel}' status: ${message.payload.session.status}`])
                    break
                default:
                    logMessage([renderObj(message, `WebSocket message for ${channel}`)])
            }
        }
    }
}
