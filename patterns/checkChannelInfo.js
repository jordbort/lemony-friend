const { users, lemonyFresh } = require(`../data`)
const { getContextEmote, getToUser, pluralize, logMessage, findUserByNickname } = require(`../utils`)

module.exports = {
    checkEmotes(props, splitMessage) {
        const { bot, chatroom, userNickname } = props
        const toUser = getToUser(splitMessage[1])
        const toUserByNickname = findUserByNickname(toUser)
        const validatedChannelName = toUserByNickname in lemonyFresh
            ? toUserByNickname
            : toUser in lemonyFresh
                ? toUser
                : null
        const channelNickname = users[validatedChannelName]?.nickname || users[validatedChannelName]?.displayName || validatedChannelName
        logMessage([`> checkEmotes(chatroom: '${chatroom}', toUser: '${toUser}', validatedChannelName: '${validatedChannelName}', channelNickname: '${channelNickname}')`])

        if (validatedChannelName in lemonyFresh) {
            `emotes` in lemonyFresh[validatedChannelName]
                ? bot.say(chatroom, `I know ${pluralize(lemonyFresh[validatedChannelName].emotes.length, `emote`, `emotes`)} in ${channelNickname}'s channel, ${userNickname}!`)
                : bot.say(chatroom, `I don't know how many emotes ${channelNickname} has, ${userNickname}!`)
        }
    },
    checkSelfSub(props, splitMessage) {
        const { bot, chatroom, channel, user, userChannel, userNickname } = props
        const currentChannelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

        // Possible other channel name or nickname
        const otherChannel = getToUser(splitMessage[splitMessage.length - 1].split(` `)[0].replace(/'s|\?/g, ``))
        const otherChannelByNickname = findUserByNickname(otherChannel)
        const validatedOtherChannelName = otherChannelByNickname in lemonyFresh
            ? otherChannelByNickname
            : otherChannel in lemonyFresh
                ? otherChannel
                : null
        const otherChannelNickname = users[validatedOtherChannelName]?.nickname || users[validatedOtherChannelName]?.displayName || validatedOtherChannelName

        logMessage([`> checkSelfSub(chatroom: '${chatroom}', userNickname: '${userNickname}', channel: '${channel}', validatedOtherChannelName: '${validatedOtherChannelName}')`])

        const hypeEmote = getContextEmote(`hype`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)
        const dumbEmote = getContextEmote(`dumb`, channel)

        validatedOtherChannelName
            ? validatedOtherChannelName in user.channels
                ? user.channels[validatedOtherChannelName].sub
                    ? bot.say(chatroom, `Yes ${userNickname}, you are subbed to ${otherChannelNickname}! ${hypeEmote}`)
                    : bot.say(chatroom, `No ${userNickname}, you are not subbed to ${otherChannelNickname}! ${negativeEmote}`)
                : bot.say(chatroom, `I don't know whether you are subbed to ${otherChannelNickname}, ${userNickname}! ${dumbEmote}`)
            : userChannel.sub
                ? bot.say(chatroom, `Yes ${userNickname}, you are subbed to ${currentChannelNickname}! ${hypeEmote}`)
                : bot.say(chatroom, `No ${userNickname}, you are not subbed to ${currentChannelNickname}! ${negativeEmote}`)
    },
    checkSelfMod(props, splitMessage) {
        const { bot, chatroom, channel, user, userChannel, userNickname } = props
        const currentChannelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

        // Possible other channel name or nickname
        const otherChannel = getToUser(splitMessage[splitMessage.length - 1].split(` `)[0].replace(/'s|\?/g, ``))
        const otherChannelByNickname = findUserByNickname(otherChannel)
        const validatedOtherChannelName = otherChannelByNickname in lemonyFresh
            ? otherChannelByNickname
            : otherChannel in lemonyFresh
                ? otherChannel
                : null
        const otherChannelNickname = users[validatedOtherChannelName]?.nickname || users[validatedOtherChannelName]?.displayName || validatedOtherChannelName

        logMessage([`> checkSelfMod(chatroom: '${chatroom}', userNickname: '${userNickname}', channel: '${channel}', validatedOtherChannelName: '${validatedOtherChannelName}')`])

        const hypeEmote = getContextEmote(`hype`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)
        const dumbEmote = getContextEmote(`dumb`, channel)

        validatedOtherChannelName
            ? validatedOtherChannelName in user.channels
                ? user.channels[validatedOtherChannelName].mod
                    ? bot.say(chatroom, `Yes ${userNickname}, you are a mod in ${otherChannelNickname}'s chat! ${hypeEmote}`)
                    : bot.say(chatroom, `No ${userNickname}, you are not a mod in ${otherChannelNickname}'s chat! ${negativeEmote}`)
                : bot.say(chatroom, `I don't know whether you are a mod in ${otherChannelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
            : userChannel.mod
                ? bot.say(chatroom, `Yes ${userNickname}, you are a mod in ${currentChannelNickname}'s chat! ${hypeEmote}`)
                : bot.say(chatroom, `No ${userNickname}, you are not a mod in ${currentChannelNickname}'s chat! ${negativeEmote}`)
    },
    checkSelfVIP(props, splitMessage) {
        const { bot, chatroom, channel, user, userChannel, userNickname } = props
        const currentChannelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

        // Possible other channel name or nickname
        const otherChannel = getToUser(splitMessage[splitMessage.length - 1].split(` `)[0].replace(/'s|\?/g, ``))
        const otherChannelByNickname = findUserByNickname(otherChannel)
        const validatedOtherChannelName = otherChannelByNickname in lemonyFresh
            ? otherChannelByNickname
            : otherChannel in lemonyFresh
                ? otherChannel
                : null
        const otherChannelNickname = users[validatedOtherChannelName]?.nickname || users[validatedOtherChannelName]?.displayName || validatedOtherChannelName

        logMessage([`> checkSelfVIP(chatroom: '${chatroom}', userNickname: '${userNickname}', channel: '${channel}', validatedOtherChannelName: '${validatedOtherChannelName}')`])

        const hypeEmote = getContextEmote(`hype`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)
        const dumbEmote = getContextEmote(`dumb`, channel)

        validatedOtherChannelName
            ? validatedOtherChannelName in user.channels
                ? user.channels[validatedOtherChannelName].vip
                    ? bot.say(chatroom, `Yes ${userNickname}, you are a VIP in ${otherChannelNickname}'s chat! ${hypeEmote}`)
                    : bot.say(chatroom, `No ${userNickname}, you are not a VIP in ${otherChannelNickname}'s chat! ${negativeEmote}`)
                : bot.say(chatroom, `I don't know whether you are a VIP in ${otherChannelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
            : userChannel.vip
                ? bot.say(chatroom, `Yes ${userNickname}, you are a VIP in ${currentChannelNickname}'s chat! ${hypeEmote}`)
                : bot.say(chatroom, `No ${userNickname}, you are not a VIP in ${currentChannelNickname}'s chat! ${negativeEmote}`)
    },
    checkTargetSub(props, splitMessage) {
        const { bot, chatroom, channel, userNickname } = props
        const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

        // Parse target user
        const toUser = getToUser(splitMessage[1])
        const toUserByNickname = findUserByNickname(toUser)
        const target = toUserByNickname in users
            ? users[toUserByNickname]
            : toUser in users
                ? users[toUser]
                : null
        const targetNickname = target?.nickname || target?.displayName || null

        // Possible other channel name or nickname
        const otherChannel = getToUser(splitMessage[splitMessage.length - 1].split(` `)[0].replace(/'s|\?/g, ``))
        const otherChannelByNickname = findUserByNickname(otherChannel)
        const validatedOtherChannelName = otherChannelByNickname in lemonyFresh
            ? otherChannelByNickname
            : otherChannel in lemonyFresh
                ? otherChannel
                : null
        const otherChannelNickname = users[validatedOtherChannelName]?.nickname || users[validatedOtherChannelName]?.displayName || validatedOtherChannelName

        logMessage([`> checkTargetSub(chatroom: '${chatroom}', otherChannelNickname: '${otherChannelNickname}', userNickname: '${userNickname}', targetNickname: '${targetNickname}')`])

        const hypeEmote = getContextEmote(`hype`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)
        const dumbEmote = getContextEmote(`dumb`, channel)

        if (target) {
            validatedOtherChannelName
                ? validatedOtherChannelName in target.channels
                    ? target.channels[validatedOtherChannelName].sub
                        ? bot.say(chatroom, `Yes ${userNickname}, ${targetNickname} is subbed to ${otherChannelNickname}! ${hypeEmote}`)
                        : bot.say(chatroom, `No ${userNickname}, ${targetNickname} is not subbed to ${otherChannelNickname}! ${negativeEmote}`)
                    : bot.say(chatroom, `I don't know whether ${targetNickname} is subbed in ${otherChannelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
                : channel in target.channels
                    ? target.channels[channel].sub
                        ? bot.say(chatroom, `Yes ${userNickname}, ${targetNickname} is subbed to ${channelNickname}! ${hypeEmote}`)
                        : bot.say(chatroom, `No ${userNickname}, ${targetNickname} is not subbed to ${channelNickname}! ${negativeEmote}`)
                    : bot.say(chatroom, `I don't know whether ${targetNickname} is subbed in ${channelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
        }
    },
    checkTargetMod(props, splitMessage) {
        const { bot, chatroom, channel, userNickname } = props
        const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

        // Parse target user
        const toUser = getToUser(splitMessage[1])
        const toUserByNickname = findUserByNickname(toUser)
        const target = toUserByNickname in users
            ? users[toUserByNickname]
            : toUser in users
                ? users[toUser]
                : null
        const targetNickname = target?.nickname || target?.displayName || null

        // Possible other channel name or nickname
        const otherChannel = getToUser(splitMessage[splitMessage.length - 1].split(` `)[0].replace(/'s|\?/g, ``))
        const otherChannelByNickname = findUserByNickname(otherChannel)
        const validatedOtherChannelName = otherChannelByNickname in lemonyFresh
            ? otherChannelByNickname
            : otherChannel in lemonyFresh
                ? otherChannel
                : null
        const otherChannelNickname = users[validatedOtherChannelName]?.nickname || users[validatedOtherChannelName]?.displayName || validatedOtherChannelName

        logMessage([`> checkTargetMod(chatroom: '${chatroom}', otherChannelNickname: '${otherChannelNickname}', userNickname: '${userNickname}', targetNickname: '${targetNickname}')`])

        const hypeEmote = getContextEmote(`hype`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)
        const dumbEmote = getContextEmote(`dumb`, channel)

        if (target) {
            validatedOtherChannelName
                ? validatedOtherChannelName in target.channels
                    ? target.channels[validatedOtherChannelName].mod
                        ? bot.say(chatroom, `Yes ${userNickname}, ${targetNickname} is a mod in ${otherChannelNickname}'s chat! ${hypeEmote}`)
                        : bot.say(chatroom, `No ${userNickname}, ${targetNickname} is not a mod in ${otherChannelNickname}'s chat! ${negativeEmote}`)
                    : bot.say(chatroom, `I don't know whether ${targetNickname} is a mod in ${otherChannelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
                : channel in target.channels
                    ? target.channels[channel].mod
                        ? bot.say(chatroom, `Yes ${userNickname}, ${targetNickname} is a mod in ${channelNickname}'s chat! ${hypeEmote}`)
                        : bot.say(chatroom, `No ${userNickname}, ${targetNickname} is not a mod in ${channelNickname}'s chat! ${negativeEmote}`)
                    : bot.say(chatroom, `I don't know whether ${targetNickname} is a mod in ${channelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
        }
    },
    checkTargetVIP(props, splitMessage) {
        const { bot, chatroom, channel, userNickname } = props
        const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

        // Parse target user
        const toUser = getToUser(splitMessage[1])
        const toUserByNickname = findUserByNickname(toUser)
        const target = toUserByNickname in users
            ? users[toUserByNickname]
            : toUser in users
                ? users[toUser]
                : null
        const targetNickname = target?.nickname || target?.displayName || null

        // Possible other channel name or nickname
        const otherChannel = getToUser(splitMessage[splitMessage.length - 1].split(` `)[0].replace(/'s|\?/g, ``))
        const otherChannelByNickname = findUserByNickname(otherChannel)
        const validatedOtherChannelName = otherChannelByNickname in lemonyFresh
            ? otherChannelByNickname
            : otherChannel in lemonyFresh
                ? otherChannel
                : null
        const otherChannelNickname = users[validatedOtherChannelName]?.nickname || users[validatedOtherChannelName]?.displayName || validatedOtherChannelName

        logMessage([`> checkTargetVIP(chatroom: '${chatroom}', otherChannelNickname: '${otherChannelNickname}', userNickname: '${userNickname}', targetNickname: '${targetNickname}')`])

        const hypeEmote = getContextEmote(`hype`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)
        const dumbEmote = getContextEmote(`dumb`, channel)

        if (target) {
            validatedOtherChannelName
                ? validatedOtherChannelName in target.channels
                    ? target.channels[validatedOtherChannelName].vip
                        ? bot.say(chatroom, `Yes ${userNickname}, ${targetNickname} is a VIP in ${otherChannelNickname}'s chat! ${hypeEmote}`)
                        : bot.say(chatroom, `No ${userNickname}, ${targetNickname} is not a VIP in ${otherChannelNickname}'s chat! ${negativeEmote}`)
                    : bot.say(chatroom, `I don't know whether ${targetNickname} is a VIP in ${otherChannelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
                : channel in target.channels
                    ? target.channels[channel].vip
                        ? bot.say(chatroom, `Yes ${userNickname}, ${targetNickname} is a VIP in ${channelNickname}'s chat! ${hypeEmote}`)
                        : bot.say(chatroom, `No ${userNickname}, ${targetNickname} is not a VIP in ${channelNickname}'s chat! ${negativeEmote}`)
                    : bot.say(chatroom, `I don't know whether ${targetNickname} is a VIP in ${channelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
        }
    }
}
