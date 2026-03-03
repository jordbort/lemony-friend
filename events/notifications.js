const BOT_USERNAME = process.env.BOT_USERNAME

const { lemonyFresh, mods, users, joinedChannels } = require(`../data`)

const { apiGetTwitchChannel } = require(`../commands/twitch`)
const { logMessage, getContextEmote, updateMod, pluralize, arrToList } = require(`../utils`)

const batch = {}
function resetChannelBatch(type, channel) {
    batch[channel][type].timer = 0
    batch[channel][type].names = []
    if (type === `giftedSubs`) {
        batch[channel][type].total = 0
        batch[channel][type].gifters = []
    }
}

async function handleStreamOnline(bot, channel) {
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const greetingEmote = getContextEmote(`greeting`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)

    const announcements = [
        `${streamer} is now live, have a great stream! ${hypeEmote}`,
        `${streamer} has gone live! ${hypeEmote}`,
        `Hi ${streamer} nation ${greetingEmote}`,
        `first`
    ]

    const channelData = await apiGetTwitchChannel(lemonyFresh[channel].id)
    if (channelData) {
        announcements.push(
            `Have fun ${channelData.game_name
                ? channelData.game_name === `Just Chatting`
                    ? `chatting with viewers`
                    : `playing ${channelData.game_name}`
                : `doing nothing`
            }, ${streamer}! ${greetingEmote}`
        )
    }

    const reply = announcements[announcements.length - 1]

    bot.say(`#${channel}`, reply)
}

function handleStreamOffline(bot, channel) {
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

    bot.say(`#${channel}`, reply)
}

function handleChannelFollow(bot, channel, event) {
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
            bot.say(`#${channel}`, `Thank you ${arrToList(obj.names)} for following ${streamer}! ${obj.names >= 3 ? hypeEmote : greetingEmote}`)
            resetChannelBatch(`follows`, channel)
        }, 1000))
    } else {
        clearTimeout(obj.timer)
        obj.timer = Number(setTimeout(() => {
            bot.say(`#${channel}`, `Thank you ${arrToList(obj.names)} for following ${streamer}! ${obj.names >= 3 ? hypeEmote : greetingEmote}`)
            resetChannelBatch(`follows`, channel)
        }, 1000))
    }

    logMessage([`> handleChannelFollow(channel: '${channel}', timer: ${obj.timer}, names: '${obj.names.join(`', '`)}')`])
}

function handleChannelAddVIP(bot, channel, event) {
    const username = event.user_login
    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].vip = true
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
    bot.say(`#${channel}`, reply)
}

function handleChannelRemoveVIP(channel, event) {
    const username = event.user_login
    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].vip = false
    }
}

function handleChannelAddModerator(bot, channel, event) {
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
    updateMod(`#${channel}`, { 'user-id': event.user_id }, self, username)

    const reply = self
        ? `Thanks for adding me as a moderator, ${streamer}! ${positiveEmote}`
        : `${streamer} added ${modName} as a moderator! ${positiveEmote}`
    bot.say(`#${channel}`, reply)
}

function handleChannelRemoveModerator(channel, event) {
    const username = event.user_login
    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].mod = false
    }
    if (username in mods) {
        while (mods[username].isModIn.includes(`#${channel}`)) {
            mods[username].isModIn.splice(mods[username].isModIn.indexOf(`#${channel}`), 1)
        }
    }
}

function handleChannelReceiveShoutout(bot, channel, event) {
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel
    const fromStreamer = event.from_broadcaster_user_login in users
        ? users[event.from_broadcaster_user_login].nickname || users[event.from_broadcaster_user_login].displayName
        : event.from_broadcaster_user_name
    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)
    const reply = `${streamer} just got a shoutout from ${fromStreamer} to ${pluralize(event.viewer_count, `viewer`, `viewers`)}! ${event.viewer_count >= 20 ? hypeEmote : positiveEmote}`
    bot.say(`#${channel}`, reply)
}

function handleChannelSubscription(bot, channel, event) {
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
                bot.say(`#${channel}`, `${arrToList(obj.gifters)} gifted ${obj.names.length === 1 ? `a sub` : `subs`} to ${arrToList(obj.names)}! ${obj.names >= 5 ? hypeEmote : positiveEmote}`)
                resetChannelBatch(`giftedSubs`, channel)
            }, 1000))
        } else {
            clearTimeout(obj.timer)
            obj.timer = Number(setTimeout(() => {
                bot.say(`#${channel}`, `${arrToList(obj.gifters)} gifted ${obj.names.length === 1 ? `a sub` : `subs`} to ${arrToList(obj.names)}! ${obj.names >= 5 ? hypeEmote : positiveEmote}`)
                resetChannelBatch(`giftedSubs`, channel)
            }, 1000))
        }
        logMessage([`> handleChannelSubscription(channel: '${channel}', gift: ${event.is_gift}, timer: ${obj.timer}, gifters: '${obj.gifters.join(`', '`)}', names: '${obj.names.join(`', '`)}')`])
    } else {
        const obj = batch[channel].subs
        obj.names.push(subscriberName)
        if (!obj.timer) {
            obj.timer = Number(setTimeout(() => {
                bot.say(`#${channel}`, `${arrToList(obj.names)} just subscribed to ${streamer}! ${obj.names >= 3 ? hypeEmote : positiveEmote}`)
                resetChannelBatch(`subs`, channel)
            }, 1000))
        } else {
            clearTimeout(obj.timer)
            obj.timer = Number(setTimeout(() => {
                bot.say(`#${channel}`, `${arrToList(obj.names)} just subscribed to ${streamer}! ${obj.names >= 3 ? hypeEmote : positiveEmote}`)
                resetChannelBatch(`subs`, channel)
            }, 1000))
        }
        logMessage([`> handleChannelSubscription(channel: '${channel}', gift: ${event.is_gift}, timer: ${obj.timer}, names: '${obj.names.join(`', '`)}')`])
    }
}

function handleChannelSubscriptionEnd(bot, channel, event) {
    const username = event.user_login
    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].sub = false
    }
    if (username === BOT_USERNAME) {
        const negativeEmote = getContextEmote(`negative`, channel)
        const reply = `Aww, did I lose my sub? ${negativeEmote}`
        bot.say(`#${channel}`, reply)
    }
}

function handleChannelGiftSub(bot, channel, event) {
    const obj = batch[channel].giftedSubs

    const gifter = event.is_anonymous
        ? `an anonymous user`
        : event.user_login in users
            ? users[event.user_login].nickname || users[event.user_login].displayName
            : event.user_name

    obj.total += event.total
    if (!obj.gifters.includes(gifter)) { obj.gifters.push(gifter) }
    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)

    clearTimeout(obj.timer)
    obj.timer = Number(setTimeout(() => {
        bot.say(`#${channel}`, `${arrToList(obj.gifters)} gifted ${obj.names.length === 1 ? `a sub` : `subs`} to ${arrToList(obj.names)}! ${obj.names >= 5 ? hypeEmote : positiveEmote}`)
        resetChannelBatch(`giftedSubs`, channel)
    }, 1000))

    logMessage([`> handleChannelGiftSub(channel: '${channel}', timer: ${obj.timer}, gifters: '${obj.gifters.join(`', '`)}', names: '${obj.names.join(`', '`)}')`])
}

function handleChannelSubscriptionMessage(bot, channel, event) {
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
    bot.say(`#${channel}`, reply)
}

function handleChannelCheer(bot, channel, event) {
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
    bot.say(`#${channel}`, reply)
}

function handleChannelHypeTrainBegin(bot, channel, event) {
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const contributors = event.top_contributions.map(obj => obj.user_login in users
        ? users[obj.user_login].nickname || users[obj.user_login].displayName
        : obj.user_name
    )

    const hypeEmote = getContextEmote(`hype`, channel)
    const reply = `A hype train just started for ${streamer}, thanks to ${arrToList(contributors.filter((str, idx) => idx === contributors.indexOf(str)))}! ${hypeEmote}`
    bot.say(`#${channel}`, reply)
}

module.exports = {
    addToBatch(channel) {
        if (!(channel in batch)) {
            batch[channel] = {
                follows: { timer: 0, names: [] },
                subs: { timer: 0, names: [] },
                giftedSubs: { timer: 0, total: 0, gifters: [], names: [] }
            }
        }
    },
    handleNotification(bot, payload) {
        const { subscription, event } = payload
        const channel = Object.keys(lemonyFresh).filter(key => lemonyFresh[key].id === Number(subscription.condition.broadcaster_user_id))[0]
        const streamer = event.broadcaster_user_name
        const fromStreamer = event.from_broadcaster_user_name
        const displayName = event.user_name

        switch (subscription.type) {
            case `conduit.shard.disabled`:
                // channel will be undefined
                const disabledChatroom = joinedChannels[Number(payload.event.shard_id)]
                console.log(`* conduit.shard.disabled`, disabledChatroom, `web socket disabled, shardId:`, shardId)
                logMessage([`* conduit.shard.disabled`, disabledChatroom, `web socket disabled, shardId:`, shardId])
                break
            case `stream.online`:
                logMessage([`* ONLINE: ${streamer} started streaming`])
                handleStreamOnline(bot, channel)
                break
            case `stream.offline`:
                logMessage([`* OFFLINE: ${streamer} stopped streaming`])
                handleStreamOffline(bot, channel)
                break
            case `channel.follow`:
                logMessage([`* NEW FOLLOWER: ${streamer} was followed by ${displayName}`])
                handleChannelFollow(bot, channel, event)
                break
            case `channel.vip.add`:
                logMessage([`* ADD VIP: ${streamer} added ${displayName} as a VIP`])
                handleChannelAddVIP(bot, channel, event)
                break
            case `channel.vip.remove`:
                logMessage([`* REMOVE VIP: ${streamer} removed ${displayName} as a VIP`])
                handleChannelRemoveVIP(channel, event)
                break
            case `channel.moderator.add`:
                logMessage([`* ADD MODERATOR: ${streamer} added ${displayName} as a mod`])
                handleChannelAddModerator(bot, channel, event)
                break
            case `channel.moderator.remove`:
                logMessage([`* REMOVE MODERATOR: ${streamer} removed ${displayName} as a mod`])
                handleChannelRemoveModerator(channel, event)
                break
            case `channel.shoutout.receive`:
                logMessage([`* SHOUTOUT: ${streamer} received a shoutout from ${fromStreamer}`])
                handleChannelReceiveShoutout(bot, channel, event)
                break
            case `channel.subscribe`:
                logMessage([`* SUB: ${displayName} just subscribed to ${streamer}`])
                handleChannelSubscription(bot, channel, event)
                break
            case `channel.subscription.end`:
                logMessage([`* SUB END: ${displayName}'s ${event.is_gift ? `gift ` : ``}sub to ${streamer} expired`])
                handleChannelSubscriptionEnd(bot, channel, event)
                break
            case `channel.subscription.gift`:
                logMessage([`* GIFT SUB: ${displayName || `An anonymous user`} gifted ${pluralize(event.total, `sub`, `subs`)} to ${streamer}`])
                handleChannelGiftSub(bot, channel, event)
                break
            case `channel.subscription.message`:
                logMessage([`* SUB MESSAGE: ${displayName} resubscribed to ${streamer}`])
                handleChannelSubscriptionMessage(bot, channel, event)
                break
            case `channel.cheer`:
                logMessage([`* BITS: ${displayName || `An anonymous user`} cheered ${pluralize(event.bits), `bit`, `bits`} to ${streamer}`])
                handleChannelCheer(bot, channel, event)
                break
            case `channel.hype_train.begin`:
                logMessage([`* HYPE TRAIN: A hype train started for ${streamer} thanks to ${arrToList(event.top_contributions.map(obj => obj.user_login))}`])
                handleChannelHypeTrainBegin(bot, channel, event)
                break
            default:
                logMessage([`* '${channel}' ${subscription.type} is not a recognized EventSub`])
        }
    }
}
