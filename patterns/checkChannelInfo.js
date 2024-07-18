const { users, lemonyFresh } = require(`../data`)
const { getHypeEmote, getNegativeEmote, getDumbEmote, getToUser, pluralize, logMessage, findUserByNickname } = require(`../utils`)

module.exports = {
    checkEmotes(props, splitMessage) {
        const { bot, chatroom, userNickname } = props
        const capturedChannel = getToUser(splitMessage[1])
        logMessage([`> checkEmotes(chatroom: '${chatroom}', capturedChannel: '${capturedChannel}', userNickname: '${userNickname}')`])

        if (capturedChannel in lemonyFresh) {
            `emotes` in lemonyFresh[capturedChannel]
                ? bot.say(chatroom, `I know ${pluralize(lemonyFresh[capturedChannel].emotes.length, `emote`, `emotes`)} in ${capturedChannel}'s channel!`)
                : bot.say(chatroom, `I don't know how many emotes ${capturedChannel} has!`)
        }
    },
    checkSelfSub(props, splitMessage) {
        const { bot, chatroom, channel, user, userNickname } = props
        const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

        const otherChannel = getToUser(splitMessage[splitMessage.length - 1].split(` `)[0].replace(/'s|\?/g, ``))
        const possibleNickname = findUserByNickname(otherChannel)
        const otherChannelNickname = otherChannel in lemonyFresh
            ? users[otherChannel]?.nickname || users[otherChannel]?.displayName || otherChannel
            : possibleNickname in lemonyFresh
                ? users[possibleNickname]?.nickname || users[possibleNickname]?.displayName || possibleNickname
                : null
        logMessage([`> checkSelfSub(chatroom: '${chatroom}', otherChannel: '${otherChannel}', otherChannelNickname: '${otherChannelNickname}', userNickname: '${userNickname}')`])

        const hypeEmote = getHypeEmote(channel)
        const negativeEmote = getNegativeEmote(channel)
        const dumbEmote = getDumbEmote(channel)

        otherChannelNickname
            ? otherChannel in user
                ? user[otherChannel].sub
                    ? bot.say(chatroom, `Yes ${userNickname}, you are subbed to ${otherChannelNickname}! ${hypeEmote}`)
                    : bot.say(chatroom, `No ${userNickname}, you are not subbed to ${otherChannelNickname}! ${negativeEmote}`)
                : bot.say(chatroom, `I don't know whether you are subbed to ${otherChannelNickname}, ${userNickname}! ${dumbEmote}`)
            : user[channel].sub
                ? bot.say(chatroom, `Yes ${userNickname}, you are subbed to ${channelNickname}! ${hypeEmote}`)
                : bot.say(chatroom, `No ${userNickname}, you are not subbed to ${channelNickname}! ${negativeEmote}`)
    },
    checkSelfMod(props, splitMessage) {
        const { bot, chatroom, channel, user, userNickname } = props
        const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

        const otherChannel = getToUser(splitMessage[splitMessage.length - 1].split(` `)[0].replace(/'s|\?/g, ``))
        const possibleNickname = findUserByNickname(otherChannel)
        const otherChannelNickname = otherChannel in lemonyFresh
            ? users[otherChannel]?.nickname || users[otherChannel]?.displayName || otherChannel
            : possibleNickname in lemonyFresh
                ? users[possibleNickname]?.nickname || users[possibleNickname]?.displayName || possibleNickname
                : null
        logMessage([`> checkSelfMod(chatroom: '${chatroom}', otherChannelNickname: '${otherChannelNickname}', userNickname: '${userNickname}')`])

        const hypeEmote = getHypeEmote(channel)
        const negativeEmote = getNegativeEmote(channel)
        const dumbEmote = getDumbEmote(channel)

        otherChannelNickname
            ? otherChannel in user
                ? user[otherChannel].mod
                    ? bot.say(chatroom, `Yes ${userNickname}, you are a mod in ${otherChannelNickname}'s chat! ${hypeEmote}`)
                    : bot.say(chatroom, `No ${userNickname}, you are not a mod in ${otherChannelNickname}'s chat! ${negativeEmote}`)
                : bot.say(chatroom, `I don't know whether you are a mod in ${otherChannelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
            : user[channel].mod
                ? bot.say(chatroom, `Yes ${userNickname}, you are a mod in ${channelNickname}'s chat! ${hypeEmote}`)
                : bot.say(chatroom, `No ${userNickname}, you are not a mod in ${channelNickname}'s chat! ${negativeEmote}`)
    },
    checkSelfVIP(props, splitMessage) {
        const { bot, chatroom, channel, user, userNickname } = props
        const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

        const otherChannel = getToUser(splitMessage[splitMessage.length - 1].split(` `)[0].replace(/'s|\?/g, ``))
        const possibleNickname = findUserByNickname(otherChannel)
        const otherChannelNickname = otherChannel in lemonyFresh
            ? users[otherChannel]?.nickname || users[otherChannel]?.displayName || otherChannel
            : possibleNickname in lemonyFresh
                ? users[possibleNickname]?.nickname || users[possibleNickname]?.displayName || possibleNickname
                : null
        logMessage([`> checkSelfVIP(chatroom: '${chatroom}', otherChannelNickname: '${otherChannelNickname}', userNickname: '${userNickname}')`])

        const hypeEmote = getHypeEmote(channel)
        const negativeEmote = getNegativeEmote(channel)
        const dumbEmote = getDumbEmote(channel)

        otherChannelNickname
            ? otherChannel in user
                ? user[otherChannel].vip
                    ? bot.say(chatroom, `Yes ${userNickname}, you are a VIP in ${otherChannelNickname}'s chat! ${hypeEmote}`)
                    : bot.say(chatroom, `No ${userNickname}, you are not a VIP in ${otherChannelNickname}'s chat! ${negativeEmote}`)
                : bot.say(chatroom, `I don't know whether you are a VIP in ${otherChannelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
            : user[channel].vip
                ? bot.say(chatroom, `Yes ${userNickname}, you are a VIP in ${channelNickname}'s chat! ${hypeEmote}`)
                : bot.say(chatroom, `No ${userNickname}, you are not a VIP in ${channelNickname}'s chat! ${negativeEmote}`)
    },
    checkTargetSub(props, splitMessage) {
        const { bot, chatroom, channel, userNickname } = props
        const targetUser = getToUser(splitMessage[1])
        const target = users[targetUser] || null
        const targetNickname = target?.nickname || target?.displayName || null
        const otherChannel = getToUser(splitMessage[splitMessage.length - 1].split(` `)[0].replace(/'s|\?/g, ``))
        const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

        const possibleNickname = findUserByNickname(otherChannel)
        const otherChannelNickname = otherChannel in lemonyFresh
            ? users[otherChannel]?.nickname || users[otherChannel]?.displayName || otherChannel
            : possibleNickname in lemonyFresh
                ? users[possibleNickname]?.nickname || users[possibleNickname]?.displayName || possibleNickname
                : null
        logMessage([`> checkTargetSub(chatroom: '${chatroom}', otherChannelNickname: '${otherChannelNickname}', userNickname: '${userNickname}', targetNickname: '${targetNickname}')`])

        const hypeEmote = getHypeEmote(channel)
        const negativeEmote = getNegativeEmote(channel)
        const dumbEmote = getDumbEmote(channel)

        if (target) {
            otherChannelNickname
                ? otherChannel in target
                    ? target[otherChannel].sub
                        ? bot.say(chatroom, `Yes ${userNickname}, ${targetNickname} is subbed to ${otherChannelNickname}! ${hypeEmote}`)
                        : bot.say(chatroom, `No ${userNickname}, ${targetNickname} is not subbed to ${otherChannelNickname}! ${negativeEmote}`)
                    : bot.say(chatroom, `I don't know whether ${targetNickname} is subbed in ${otherChannelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
                : channel in target
                    ? target[channel].sub
                        ? bot.say(chatroom, `Yes ${userNickname}, ${targetNickname} is subbed to ${channelNickname}! ${hypeEmote}`)
                        : bot.say(chatroom, `No ${userNickname}, ${targetNickname} is not subbed to ${channelNickname}! ${negativeEmote}`)
                    : bot.say(chatroom, `I don't know whether ${targetNickname} is subbed in ${channelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
        }
    },
    checkTargetMod(props, splitMessage) {
        const { bot, chatroom, channel, userNickname } = props
        const targetUser = getToUser(splitMessage[1])
        const target = users[targetUser] || null
        const targetNickname = target?.nickname || target?.displayName || null
        const otherChannel = getToUser(splitMessage[splitMessage.length - 1].split(` `)[0].replace(/'s|\?/g, ``))
        const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

        const possibleNickname = findUserByNickname(otherChannel)
        const otherChannelNickname = otherChannel in lemonyFresh
            ? users[otherChannel]?.nickname || users[otherChannel]?.displayName || otherChannel
            : possibleNickname in lemonyFresh
                ? users[possibleNickname]?.nickname || users[possibleNickname]?.displayName || possibleNickname
                : null
        logMessage([`> checkTargetMod(chatroom: '${chatroom}', otherChannelNickname: '${otherChannelNickname}', userNickname: '${userNickname}', targetNickname: '${targetNickname}')`])

        const hypeEmote = getHypeEmote(channel)
        const negativeEmote = getNegativeEmote(channel)
        const dumbEmote = getDumbEmote(channel)

        if (target) {
            otherChannelNickname
                ? otherChannel in target
                    ? target[otherChannel].mod
                        ? bot.say(chatroom, `Yes ${userNickname}, ${targetNickname} is a mod in ${otherChannelNickname}'s chat! ${hypeEmote}`)
                        : bot.say(chatroom, `No ${userNickname}, ${targetNickname} is not a mod in ${otherChannelNickname}'s chat! ${negativeEmote}`)
                    : bot.say(chatroom, `I don't know whether ${targetNickname} is a mod in ${otherChannelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
                : channel in target
                    ? target[channel].mod
                        ? bot.say(chatroom, `Yes ${userNickname}, ${targetNickname} is a mod in ${channelNickname}'s chat! ${hypeEmote}`)
                        : bot.say(chatroom, `No ${userNickname}, ${targetNickname} is not a mod in ${channelNickname}'s chat! ${negativeEmote}`)
                    : bot.say(chatroom, `I don't know whether ${targetNickname} is a mod in ${channelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
        }
    },
    checkTargetVIP(props, splitMessage) {
        const { bot, chatroom, channel, userNickname } = props
        const targetUser = getToUser(splitMessage[1])
        const target = users[targetUser] || null
        const targetNickname = target?.nickname || target?.displayName || null
        const otherChannel = getToUser(splitMessage[splitMessage.length - 1].split(` `)[0].replace(/'s|\?/g, ``))
        const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

        const possibleNickname = findUserByNickname(otherChannel)
        const otherChannelNickname = otherChannel in lemonyFresh
            ? users[otherChannel]?.nickname || users[otherChannel]?.displayName || otherChannel
            : possibleNickname in lemonyFresh
                ? users[possibleNickname]?.nickname || users[possibleNickname]?.displayName || possibleNickname
                : null
        logMessage([`> checkTargetVIP(chatroom: '${chatroom}', otherChannelNickname: '${otherChannelNickname}', userNickname: '${userNickname}', targetNickname: '${targetNickname}')`])

        const hypeEmote = getHypeEmote(channel)
        const negativeEmote = getNegativeEmote(channel)
        const dumbEmote = getDumbEmote(channel)

        if (target) {
            otherChannelNickname
                ? otherChannel in target
                    ? target[otherChannel].vip
                        ? bot.say(chatroom, `Yes ${userNickname}, ${targetNickname} is a VIP in ${otherChannelNickname}'s chat! ${hypeEmote}`)
                        : bot.say(chatroom, `No ${userNickname}, ${targetNickname} is not a VIP in ${otherChannelNickname}'s chat! ${negativeEmote}`)
                    : bot.say(chatroom, `I don't know whether ${targetNickname} is a VIP in ${otherChannelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
                : channel in target
                    ? target[channel].vip
                        ? bot.say(chatroom, `Yes ${userNickname}, ${targetNickname} is a VIP in ${channelNickname}'s chat! ${hypeEmote}`)
                        : bot.say(chatroom, `No ${userNickname}, ${targetNickname} is not a VIP in ${channelNickname}'s chat! ${negativeEmote}`)
                    : bot.say(chatroom, `I don't know whether ${targetNickname} is a VIP in ${channelNickname}'s chat, ${userNickname}! ${dumbEmote}`)
        }
    }
}
