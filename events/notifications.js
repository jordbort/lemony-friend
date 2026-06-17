const BOT_USERNAME = process.env.BOT_USERNAME

const { lemonyFresh, mods, users, joinedChatrooms } = require(`../data`)
const { logMessage, getContextEmote, updateMod, pluralize, arrToList } = require(`../utils`)

const { getStreamBttvEmotes } = require(`../commands/external`)
const { apiGetTwitchChannel, getStreamTwitchEmotes } = require(`../commands/twitch`)

const batch = {}
function resetChannelBatch(type, channel) {
    batch[channel][type].timer = 0
    batch[channel][type].names = []
    if (type === `giftedSubs`) {
        batch[channel][type].total = 0
        batch[channel][type].gifters = []
    }
}

async function handleStreamOnline(bot, event) {
    const { broadcaster_user_login: channel } = event
    logMessage([`* ONLINE: ${channel} started streaming`])

    await getStreamTwitchEmotes(channel)
    await getStreamBttvEmotes(channel)

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

    const randNum = Math.floor(Math.random() * announcements.length + 1)

    // Optional channel data
    if (randNum === announcements.length) {
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
    }

    const reply = announcements[randNum]
    bot.say(`#${channel}`, reply)
}

function handleStreamOffline(bot, event) {
    const { broadcaster_user_login: channel } = event
    logMessage([`* OFFLINE: ${channel} stopped streaming`])

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

function handleChannelFollow(bot, event) {
    const { broadcaster_user_login: channel, user_login: username, user_name: displayName } = event
    logMessage([`* NEW FOLLOWER: ${channel} was followed by ${username}`])

    if (username === BOT_USERNAME) {
        logMessage([`-> Not thanking self for following`])
        return
    }
    const obj = batch[channel].follows

    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const followerName = username in users
        ? users[username].nickname || users[username].displayName
        : displayName

    obj.names.push(followerName)
    const greetingEmote = getContextEmote(`greeting`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)

    clearTimeout(obj.timer)
    obj.timer = setTimeout(() => {
        bot.say(`#${channel}`, `Thank you ${arrToList(obj.names)} for following ${streamer}! ${obj.names >= 3 ? hypeEmote : greetingEmote}`)
        resetChannelBatch(`follows`, channel)
    }, 1000)
}

function handleChannelAddVIP(bot, event) {
    const { broadcaster_user_login: channel, user_login: username, user_name: displayName } = event
    logMessage([`* ADD VIP: ${channel} added ${username} as a VIP`])

    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].vip = true
    }
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const vipName = username in users
        ? users[username].nickname || users[username].displayName
        : displayName

    const positiveEmote = getContextEmote(`positive`, channel)

    const reply = username === BOT_USERNAME
        ? `Thanks for adding me as a VIP, ${streamer}! ${positiveEmote}`
        : `${streamer} added ${vipName} as a VIP! ${positiveEmote}`
    bot.say(`#${channel}`, reply)
}

function handleChannelRemoveVIP(event) {
    const { broadcaster_user_login: channel, user_login: username } = event
    logMessage([`* REMOVE VIP: ${channel} removed ${username} as a VIP`])

    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].vip = false
    }
}

function handleChannelAddModerator(bot, event) {
    const { broadcaster_user_login: channel, user_login: username, user_name: displayName, user_id: userId } = event
    logMessage([`* ADD MODERATOR: ${channel} added ${username} as a mod`])

    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].mod = true
    }
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const modName = username in users
        ? users[username].nickname || users[username].displayName
        : displayName

    const positiveEmote = getContextEmote(`positive`, channel)

    const self = username === BOT_USERNAME
    updateMod(`#${channel}`, { 'user-id': userId }, self, username)

    const reply = self
        ? `Thanks for adding me as a moderator, ${streamer}! ${positiveEmote}`
        : `${streamer} added ${modName} as a moderator! ${positiveEmote}`
    bot.say(`#${channel}`, reply)
}

function handleChannelRemoveModerator(event) {
    const { broadcaster_user_login: channel, user_login: username } = event
    logMessage([`* REMOVE MODERATOR: ${channel} removed ${username} as a mod`])

    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].mod = false
    }
    if (username in mods) {
        while (mods[username].isModIn.includes(`#${channel}`)) {
            mods[username].isModIn.splice(mods[username].isModIn.indexOf(`#${channel}`), 1)
        }
    }
}

function handleChannelReceiveShoutout(bot, event) {
    const { broadcaster_user_login: channel, from_broadcaster_user_login: fromChannel, from_broadcaster_user_name: fromChannelDisplayName, viewer_count: viewerCount } = event
    logMessage([`* SHOUTOUT: ${channel} received a shoutout from ${fromChannel}`])

    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const fromStreamer = fromChannel in users
        ? users[fromChannel].nickname || users[fromChannel].displayName
        : fromChannelDisplayName

    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)
    const reply = `${streamer} just got a shoutout from ${fromStreamer} to ${pluralize(viewerCount, `viewer`, `viewers`)}! ${viewerCount >= 20 ? hypeEmote : positiveEmote}`
    bot.say(`#${channel}`, reply)
}

function handleChannelSubscription(bot, event) {
    const { broadcaster_user_login: channel, user_login: username, user_name: displayName, is_gift: isGift } = event
    logMessage([`* SUB: ${username} just subscribed to ${channel}`])

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
            : displayName

    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)

    const obj = isGift ? batch[channel].giftedSubs : batch[channel].subs
    obj.names.push(subscriberName)
    clearTimeout(obj.timer)

    if (isGift) {
        obj.timer = setTimeout(() => {
            bot.say(`#${channel}`, `${arrToList(obj.gifters)} gifted ${obj.names.length === 1 ? `a sub` : `subs`} to ${arrToList(obj.names)}! ${obj.names >= 5 ? hypeEmote : positiveEmote}`)
            resetChannelBatch(`giftedSubs`, channel)
        }, 1000)
    } else {
        obj.timer = setTimeout(() => {
            bot.say(`#${channel}`, `${arrToList(obj.names)} just subscribed to ${streamer}! ${obj.names >= 3 ? hypeEmote : positiveEmote}`)
            resetChannelBatch(`subs`, channel)
        }, 1000)
    }
}

function handleChannelSubscriptionEnd(bot, event) {
    const { broadcaster_user_login: channel, user_login: username, is_gift: isGift } = event
    logMessage([`* SUB END: ${username}'s ${isGift ? `gift ` : ``}sub to ${channel} expired`])

    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].sub = false
    }
    if (username === BOT_USERNAME) {
        const negativeEmote = getContextEmote(`negative`, channel)
        const reply = `Aww, did I lose my sub? ${negativeEmote}`
        bot.say(`#${channel}`, reply)
    }
}

function handleChannelGiftSub(bot, event) {
    const { broadcaster_user_login: channel, user_login: username, user_name: displayName, total, is_anonymous: isAnonymous } = event
    logMessage([`* GIFT SUB: ${username || `An anonymous user`} gifted ${pluralize(total, `sub`, `subs`)} to ${channel}'s channel`])

    const obj = batch[channel].giftedSubs

    const gifter = isAnonymous
        ? `an anonymous user`
        : username in users
            ? users[username].nickname || users[username].displayName
            : displayName

    obj.total += total
    if (!obj.gifters.includes(gifter)) { obj.gifters.push(gifter) }
    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)

    clearTimeout(obj.timer)
    obj.timer = setTimeout(() => {
        bot.say(`#${channel}`, `${arrToList(obj.gifters)} gifted ${obj.names.length === 1 ? `a sub` : `subs`} to ${arrToList(obj.names)}! ${obj.names >= 5 ? hypeEmote : positiveEmote}`)
        resetChannelBatch(`giftedSubs`, channel)
    }, 1000)
}

function handleChannelSubscriptionMessage(bot, event) {
    const { broadcaster_user_login: channel, user_login: username, user_name: displayName, cumulative_months: months, message } = event
    logMessage([`* SUB MESSAGE: ${username} resubscribed to ${channel}: ${message.text ? `"${message.text}"` : `(no text)`}`])

    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].sub = true
    }

    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const subscriberName = username in users
        ? users[username].nickname || users[username].displayName
        : displayName

    const yearCount = Math.floor(months / 12)
    const monthCount = months % 12
    const duration = `${yearCount ? `${pluralize(yearCount, `year`, `years`)}${monthCount ? ` and ` : ``}` : ``}${monthCount ? pluralize(monthCount, `month`, `months`) : ``}`

    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)
    const reply = yearCount && !monthCount
        ? `${subscriberName} has subscribed to ${streamer} for ${duration}! ${hypeEmote}`
        : `${subscriberName} has subscribed to ${streamer} for ${duration}! ${positiveEmote}`
    bot.say(`#${channel}`, reply)
}

function handleChannelCheer(bot, event) {
    const { broadcaster_user_login: channel, user_login: username, user_name: displayName, bits, is_anonymous: isAnonymous } = event
    logMessage([`* BITS: ${username || `An anonymous user`} cheered ${pluralize(bits), `bit`, `bits`} to ${channel}`])

    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const subscriberName = isAnonymous
        ? `An anonymous user`
        : username in users
            ? users[username].nickname || users[username].displayName
            : displayName

    const positiveEmote = getContextEmote(`positive`, channel)
    const reply = `${subscriberName} just cheered ${pluralize(bits, `bit`, `bits`)} to ${streamer}! ${positiveEmote}`
    bot.say(`#${channel}`, reply)
}

function handleChannelHypeTrainBegin(bot, event) {
    const { broadcaster_user_login: channel, top_contributions: topContributions, shared_train_participants: sharedTrainParticipants, is_shared_train: isSharedTrain, level } = event

    const streamers = isSharedTrain
        ? sharedTrainParticipants.map(obj => obj.broadcaster_user_login)
        : [channel]

    const contributors = topContributions
        .map(obj => obj.user_login)
        .filter((el, idx, self) => idx === self.indexOf(el))

    logMessage([`* HYPE TRAIN: A hype train started for ${arrToList(streamers)}, thanks to ${arrToList(contributors)}`])

    if (isSharedTrain && !sharedTrainParticipants.map(obj => obj.broadcaster_user_login).includes(channel)) {
        logMessage([`-> Hype train is not for ${channel}`])
        return
    }

    const hypeEmote = getContextEmote(`hype`, channel)
    const reply = `A ${level !== 1 ? `level ${level} ` : ``}hype train just started for ${arrToList(streamers.map(streamer => streamer in users
        ? users[streamer].nickname || users[streamer].displayName
        : streamer))}, thanks to ${arrToList(contributors.map(contributor => contributor in users
            ? users[contributor].nickname || users[contributor].displayName
            : contributor))}! ${hypeEmote}`
    bot.say(`#${channel}`, reply)
}

module.exports = {
    addNotificationsBatch(channel) {
        if (!(channel in batch)) {
            batch[channel] = {
                follows: { timer: 0, names: [] },
                subs: { timer: 0, names: [] },
                giftedSubs: { timer: 0, total: 0, gifters: [], names: [] }
            }
        }
    },
    handleNotification(bot, payload) {
        const { subscription, event } = payload, { type } = subscription

        switch (type) {
            case `stream.online`:
                handleStreamOnline(bot, event)
                break
            case `stream.offline`:
                handleStreamOffline(bot, event)
                break
            case `channel.follow`:
                handleChannelFollow(bot, event)
                break
            case `channel.vip.add`:
                handleChannelAddVIP(bot, event)
                break
            case `channel.vip.remove`:
                handleChannelRemoveVIP(event)
                break
            case `channel.moderator.add`:
                handleChannelAddModerator(bot, event)
                break
            case `channel.moderator.remove`:
                handleChannelRemoveModerator(event)
                break
            case `channel.shoutout.receive`:
                handleChannelReceiveShoutout(bot, event)
                break
            case `channel.subscribe`:
                handleChannelSubscription(bot, event)
                break
            case `channel.subscription.end`:
                handleChannelSubscriptionEnd(bot, event)
                break
            case `channel.subscription.gift`:
                handleChannelGiftSub(bot, event)
                break
            case `channel.subscription.message`:
                handleChannelSubscriptionMessage(bot, event)
                break
            case `channel.cheer`:
                handleChannelCheer(bot, event)
                break
            case `channel.hype_train.begin`:
                handleChannelHypeTrainBegin(bot, event)
                break
            default:
                logMessage([`* '${fromChannel}' ${subscription.type} is not a recognized EventSub`])
        }
    }
}
