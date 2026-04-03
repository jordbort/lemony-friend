const BOT_USERNAME = process.env.BOT_USERNAME

const { lemonyFresh, mods, users, joinedChatrooms } = require(`../data`)

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

async function handleStreamOnline(bot, channel, event) {
    logMessage([`* ONLINE: ${event.broadcaster_user_name} started streaming`])

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

function handleStreamOffline(bot, channel, event) {
    logMessage([`* OFFLINE: ${event.broadcaster_user_name} stopped streaming`])

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
    const { broadcaster_user_name, user_login, user_name } = event
    logMessage([`* NEW FOLLOWER: ${broadcaster_user_name} was followed by ${user_name}`])

    if (user_login === BOT_USERNAME) {
        logMessage([`-> Not thanking self for following`])
        return
    }
    const obj = batch[channel].follows

    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const followerName = user_login in users
        ? users[user_login].nickname || users[user_login].displayName
        : user_name

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

    // logMessage([`> handleChannelFollow(channel: '${channel}', timer: ${obj.timer}, names: '${obj.names.join(`', '`)}')`])
}

function handleChannelAddVIP(bot, channel, event) {
    const { broadcaster_user_name, user_login, user_name } = event
    logMessage([`* ADD VIP: ${broadcaster_user_name} added ${user_name} as a VIP`])

    if (user_login in users && channel in users[user_login].channels) {
        users[user_login].channels[channel].vip = true
    }
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const vipName = user_login in users
        ? users[user_login].nickname || users[user_login].displayName
        : user_name

    const positiveEmote = getContextEmote(`positive`, channel)

    const reply = user_login === BOT_USERNAME
        ? `Thanks for adding me as a VIP, ${streamer}! ${positiveEmote}`
        : `${streamer} added ${vipName} as a VIP! ${positiveEmote}`
    bot.say(`#${channel}`, reply)
}

function handleChannelRemoveVIP(channel, event) {
    const { broadcaster_user_name, user_login, user_name } = event
    logMessage([`* REMOVE VIP: ${broadcaster_user_name} removed ${user_name} as a VIP`])

    const username = user_login
    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].vip = false
    }
}

function handleChannelAddModerator(bot, channel, event) {
    const { broadcaster_user_name, user_login, user_name, user_id } = event
    logMessage([`* ADD MODERATOR: ${broadcaster_user_name} added ${user_name} as a mod`])

    const username = user_login
    if (username in users && channel in users[username].channels) {
        users[username].channels[channel].mod = true
    }
    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const modName = username in users
        ? users[username].nickname || users[username].displayName
        : user_name

    const positiveEmote = getContextEmote(`positive`, channel)

    const self = username === BOT_USERNAME
    updateMod(`#${channel}`, { 'user-id': user_id }, self, username)

    const reply = self
        ? `Thanks for adding me as a moderator, ${streamer}! ${positiveEmote}`
        : `${streamer} added ${modName} as a moderator! ${positiveEmote}`
    bot.say(`#${channel}`, reply)
}

function handleChannelRemoveModerator(channel, event) {
    const { broadcaster_user_name, user_login, user_name } = event
    logMessage([`* REMOVE MODERATOR: ${broadcaster_user_name} removed ${user_name} as a mod`])

    if (user_login in users && channel in users[user_login].channels) {
        users[user_login].channels[channel].mod = false
    }
    if (user_login in mods) {
        while (mods[user_login].isModIn.includes(`#${channel}`)) {
            mods[user_login].isModIn.splice(mods[user_login].isModIn.indexOf(`#${channel}`), 1)
        }
    }
}

function handleChannelReceiveShoutout(bot, channel, event) {
    const { broadcaster_user_name, from_broadcaster_user_name, from_broadcaster_user_login, viewer_count } = event
    logMessage([`* SHOUTOUT: ${broadcaster_user_name} received a shoutout from ${from_broadcaster_user_name}`])

    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const fromStreamer = from_broadcaster_user_login in users
        ? users[from_broadcaster_user_login].nickname || users[from_broadcaster_user_login].displayName
        : from_broadcaster_user_name

    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)
    const reply = `${streamer} just got a shoutout from ${fromStreamer} to ${pluralize(viewer_count, `viewer`, `viewers`)}! ${viewer_count >= 20 ? hypeEmote : positiveEmote}`
    bot.say(`#${channel}`, reply)
}

function handleChannelSubscription(bot, channel, event) {
    const { broadcaster_user_name, user_login, user_name, is_gift } = event
    logMessage([`* SUB: ${user_name} just subscribed to ${broadcaster_user_name}`])

    const username = user_login
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
            : user_name

    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)

    if (is_gift) {
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
        // logMessage([`> handleChannelSubscription(channel: '${channel}', gift: ${is_gift}, timer: ${obj.timer}, gifters: '${obj.gifters.join(`', '`)}', names: '${obj.names.join(`', '`)}')`])
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
        // logMessage([`> handleChannelSubscription(channel: '${channel}', gift: ${is_gift}, timer: ${obj.timer}, names: '${obj.names.join(`', '`)}')`])
    }
}

function handleChannelSubscriptionEnd(bot, channel, event) {
    const { broadcaster_user_name, user_login, user_name, is_gift } = event
    logMessage([`* SUB END: ${user_name}'s ${is_gift ? `gift ` : ``}sub to ${broadcaster_user_name} expired`])

    if (user_login in users && channel in users[user_login].channels) {
        users[user_login].channels[channel].sub = false
    }
    if (user_login === BOT_USERNAME) {
        const negativeEmote = getContextEmote(`negative`, channel)
        const reply = `Aww, did I lose my sub? ${negativeEmote}`
        bot.say(`#${channel}`, reply)
    }
}

function handleChannelGiftSub(bot, channel, event) {
    const { broadcaster_user_name, user_login, user_name, total, is_anonymous } = event
    logMessage([`* GIFT SUB: ${user_name || `An anonymous user`} gifted ${pluralize(total, `sub`, `subs`)} to ${broadcaster_user_name}`])

    const obj = batch[channel].giftedSubs

    const gifter = is_anonymous
        ? `an anonymous user`
        : user_login in users
            ? users[user_login].nickname || users[user_login].displayName
            : user_name

    obj.total += total
    if (!obj.gifters.includes(gifter)) { obj.gifters.push(gifter) }
    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)

    clearTimeout(obj.timer)
    obj.timer = Number(setTimeout(() => {
        bot.say(`#${channel}`, `${arrToList(obj.gifters)} gifted ${obj.names.length === 1 ? `a sub` : `subs`} to ${arrToList(obj.names)}! ${obj.names >= 5 ? hypeEmote : positiveEmote}`)
        resetChannelBatch(`giftedSubs`, channel)
    }, 1000))

    // logMessage([`> handleChannelGiftSub(channel: '${channel}', timer: ${obj.timer}, gifters: '${obj.gifters.join(`', '`)}', names: '${obj.names.join(`', '`)}')`])
}

function handleChannelSubscriptionMessage(bot, channel, event) {
    const { broadcaster_user_name, user_login, user_name, cumulative_months, message } = event
    logMessage([`* SUB MESSAGE: ${user_name} resubscribed to ${broadcaster_user_name}: ${message.text ? `"${message.text}"` : `(no text)`}`])

    if (user_login in users && channel in users[user_login].channels) {
        users[user_login].channels[channel].sub = true
    }

    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const subscriberName = user_login in users
        ? users[user_login].nickname || users[user_login].displayName
        : user_name

    const yearCount = Math.floor(cumulative_months / 12)
    const monthCount = cumulative_months % 12
    const duration = `${yearCount ? `${pluralize(yearCount, `year`, `years`)}${monthCount ? ` and ` : ``}` : ``}${monthCount ? pluralize(monthCount, `month`, `months`) : ``}`

    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)
    const reply = yearCount && !monthCount
        ? `${subscriberName} has subscribed to ${streamer} for ${duration}! ${hypeEmote}`
        : `${subscriberName} has subscribed to ${streamer} for ${duration}! ${positiveEmote}`
    bot.say(`#${channel}`, reply)
}

function handleChannelCheer(bot, channel, event) {
    const { broadcaster_user_name, user_login, user_name, bits, is_anonymous } = event
    logMessage([`* BITS: ${user_name || `An anonymous user`} cheered ${pluralize(bits), `bit`, `bits`} to ${broadcaster_user_name}`])

    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const subscriberName = is_anonymous
        ? `An anonymous user`
        : user_login in users
            ? users[user_login].nickname || users[user_login].displayName
            : user_name

    const positiveEmote = getContextEmote(`positive`, channel)
    const reply = `${subscriberName} just cheered ${pluralize(bits, `bit`, `bits`)} to ${streamer}! ${positiveEmote}`
    bot.say(`#${channel}`, reply)
}

function handleChannelHypeTrainBegin(bot, channel, event) {
    const { broadcaster_user_name, top_contributions } = event
    logMessage([`* HYPE TRAIN: A hype train started for ${broadcaster_user_name} thanks to ${arrToList(top_contributions.map(obj => obj.user_login))}`])

    const streamer = channel in users
        ? users[channel].nickname || users[channel].displayName
        : channel

    const contributors = top_contributions.map(obj => obj.user_login in users
        ? users[obj.user_login].nickname || users[obj.user_login].displayName
        : obj.user_name
    )

    const hypeEmote = getContextEmote(`hype`, channel)
    const reply = `A hype train just started for ${streamer}, thanks to ${arrToList(contributors.filter((str, idx) => idx === contributors.indexOf(str)))}! ${hypeEmote}`
    bot.say(`#${channel}`, reply)
}

function handleShardDisabled(event) {
    const shardId = Number(event.shard_id)
    const disabledChannel = joinedChatrooms[shardId].substring(1)
    logMessage([`* SHARD DISABLED: Conduit shard ID ${shardId} belonging to ${disabledChannel} was disabled`])
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
        const { type, condition } = subscription
        const fromChannel = Object.keys(lemonyFresh).filter(key => lemonyFresh[key].id === Number(condition.broadcaster_user_id))[0]

        switch (type) {
            case `stream.online`:
                handleStreamOnline(bot, fromChannel, event)
                break
            case `stream.offline`:
                handleStreamOffline(bot, fromChannel, event)
                break
            case `channel.follow`:
                handleChannelFollow(bot, fromChannel, event)
                break
            case `channel.vip.add`:
                handleChannelAddVIP(bot, fromChannel, event)
                break
            case `channel.vip.remove`:
                handleChannelRemoveVIP(fromChannel, event)
                break
            case `channel.moderator.add`:
                handleChannelAddModerator(bot, fromChannel, event)
                break
            case `channel.moderator.remove`:
                handleChannelRemoveModerator(fromChannel, event)
                break
            case `channel.shoutout.receive`:
                handleChannelReceiveShoutout(bot, fromChannel, event)
                break
            case `channel.subscribe`:
                handleChannelSubscription(bot, fromChannel, event)
                break
            case `channel.subscription.end`:
                handleChannelSubscriptionEnd(bot, fromChannel, event)
                break
            case `channel.subscription.gift`:
                handleChannelGiftSub(bot, fromChannel, event)
                break
            case `channel.subscription.message`:
                handleChannelSubscriptionMessage(bot, fromChannel, event)
                break
            case `channel.cheer`:
                handleChannelCheer(bot, fromChannel, event)
                break
            case `channel.hype_train.begin`:
                handleChannelHypeTrainBegin(bot, fromChannel, event)
                break
            case `conduit.shard.disabled`:
                handleShardDisabled(event)
                break
            default:
                logMessage([`* '${fromChannel}' ${subscription.type} is not a recognized EventSub`])
        }
    }
}
