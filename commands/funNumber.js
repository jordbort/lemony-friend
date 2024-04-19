const BOT_USERNAME = process.env.BOT_USERNAME

const { lemonyFresh, users } = require(`../data`)
const { resetTxt, settings, grayTxt } = require(`../config`)

const { lemonify } = require(`./lemonify`)
const { getTwitchChannel } = require(`./twitch`)
const { getRandomUser, getRandomChannelMessage } = require(`./getInfo`)
const { getLemonEmote, getNeutralEmote, pluralize, getHypeEmote, getPositiveEmote, getNegativeEmote, getDumbEmote } = require(`../utils`)

function makePyramid(props) {
    const { bot, chatroom, message, channel } = props
    const firstWord = message.split(` `)[0]
    if (settings.debug) { console.log(`${grayTxt}> makePyramid(channel: '${channel}', firstWord: '${firstWord}')${resetTxt}`) }

    const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME
        ? 1000
        : 2000

    bot.say(chatroom, `${firstWord}`)
    setTimeout(() => bot.say(chatroom, `${firstWord} ${firstWord}`), delay)
    setTimeout(() => bot.say(chatroom, `${firstWord} ${firstWord} ${firstWord}`), delay * 2)
    setTimeout(() => bot.say(chatroom, `${firstWord} ${firstWord}`), delay * 3)
    setTimeout(() => bot.say(chatroom, `${firstWord}`), delay * 4)
}

const currencies = [
    {
        name: `dollars`,
        abbreviation: `usd`,
        symbol: `$`,
        zeroes: ``
    },
    {
        name: `dollars`,
        abbreviation: `usd`,
        symbol: `$`,
        zeroes: ``
    },
    {
        name: `dollars`,
        abbreviation: `usd`,
        symbol: `$`,
        zeroes: ``
    },
    {
        name: `dollars`,
        abbreviation: `usd`,
        symbol: `$`,
        zeroes: ``
    },
    {
        name: `dollars`,
        abbreviation: `usd`,
        symbol: `$`,
        zeroes: ``
    },
    {
        name: `japanese yen`,
        abbreviation: `jpy`,
        symbol: `¥`,
        zeroes: `00`
    },
    {
        name: `japanese yen`,
        abbreviation: `jpy`,
        symbol: `¥`,
        zeroes: `00`
    },
    {
        name: `korean won`,
        abbreviation: `krw`,
        symbol: `₩`,
        zeroes: `000`
    },
    {
        name: `korean won`,
        abbreviation: `krw`,
        symbol: `₩`,
        zeroes: `000`
    },
    {
        name: `turkish lira`,
        abbreviation: ``,
        symbol: `₺`,
        zeroes: `00`
    },
    {
        name: `turkish lira`,
        abbreviation: ``,
        symbol: `₺`,
        zeroes: `00`
    },
    {
        name: `british pound sterling`,
        abbreviation: `gbp`,
        symbol: `£`,
        zeroes: ``
    },
    {
        name: `british pound sterling`,
        abbreviation: `gbp`,
        symbol: `£`,
        zeroes: ``
    },
    {
        name: `mexican pesos`,
        abbreviation: `mxn`,
        symbol: `$`,
        zeroes: `0`
    },
    {
        name: `mexican pesos`,
        abbreviation: `mxn`,
        symbol: `$`,
        zeroes: `0`
    },
    {
        name: `canadian dollars`,
        abbreviation: `cad`,
        symbol: `$`,
        zeroes: `0`
    },
    {
        name: `canadian dollars`,
        abbreviation: `cad`,
        symbol: `$`,
        zeroes: `0`
    },
    {
        name: `euro`,
        abbreviation: `eur`,
        symbol: `€`,
        zeroes: ``
    },
    {
        name: `euro`,
        abbreviation: `eur`,
        symbol: `€`,
        zeroes: ``
    },
    {
        name: `australian dollars`,
        abbreviation: `aud`,
        symbol: `$`,
        zeroes: `0`
    },
    {
        name: `australian dollars`,
        abbreviation: `aud`,
        symbol: `$`,
        zeroes: `0`
    },
    {
        name: `malaysian ringgit`,
        abbreviation: `myr`,
        symbol: `RM`,
        zeroes: `0`
    },
    {
        name: `malaysian ringgit`,
        abbreviation: `myr`,
        symbol: `RM`,
        zeroes: `0`
    },
    {
        name: `indian rupees`,
        abbreviation: `inr`,
        symbol: `₹`,
        zeroes: `00`
    },
    {
        name: `indian rupees`,
        abbreviation: `inr`,
        symbol: `₹`,
        zeroes: `00`
    },
    {
        name: `zimbabwean dollars`,
        abbreviation: `zwd`,
        symbol: `$`,
        zeroes: `0000000000000000`
    }
]
function giveMeMoney(props) {
    const { bot, chatroom, channel, username } = props
    const msgCount = users[username][channel].msgCount
    const currency = currencies[Math.floor(Math.random() * currencies.length)]
    if (settings.debug) { console.log(`${grayTxt}> giveMeMoney(msgCount: ${msgCount}, currency: '${currency.abbreviation.toUpperCase()}')${resetTxt}`) }

    bot.say(chatroom, `Give me ${currency.symbol}${msgCount}${currency.zeroes} ${currency.abbreviation.toUpperCase()}`)
}
function transferMeMoney(props) {
    const { bot, chatroom, channel, username } = props
    const msgCount = users[username][channel].msgCount
    const currency = currencies[Math.floor(Math.random() * currencies.length)]
    if (settings.debug) { console.log(`${grayTxt}> transferMeMoney(msgCount: ${msgCount}, currency: '${currency.abbreviation.toUpperCase()}')${resetTxt}`) }

    const paymentMethods = [
        `give me`,
        `give me`,
        `venmo me`,
        `venmo me`,
        `paypal me`,
        `paypal me`,
        `cashapp me`,
        `cashapp me`,
        `wire transfer me`,
        `wire transfer me`,
        `messenger pigeon me`,
        `messenger pigeon me`,
        `pls email me`,
        `write me a travelers check for`
    ]
    const paymentMethod = Math.floor(Math.random() * paymentMethods.length)
    bot.say(chatroom, `${paymentMethods[paymentMethod]} ${msgCount}${currency.zeroes} ${currency.name}`)
}

function useRedemption(props) {
    const { bot, chatroom, channel } = props
    if (settings.debug) { console.log(`${grayTxt}> useRedemption(channel: '${channel}', redeems.length: ${lemonyFresh[channel].redeems.length})${resetTxt}`) }
    if (lemonyFresh[channel].redeems.length === 0) {
        if (settings.debug) { console.log(`${grayTxt}-> No redemptions available${resetTxt}`) }
        return
    }

    const redeem = lemonyFresh[channel].redeems[Math.floor(Math.random() * lemonyFresh[channel].redeems.length)]
    bot.say(chatroom, redeem)
}

function givePoints(props) {
    const { bot, chatroom, channel, username } = props
    const msgCount = users[username][channel].msgCount
    if (settings.debug) { console.log(`${grayTxt}> givePoints(channel: '${channel}', username: '${username}', msgCount: ${msgCount}, points: ${users[BOT_USERNAME][channel]?.points})${resetTxt}`) }

    if (lemonyFresh[channel].viewers.includes(`streamelements`)) {
        const pointsToGive = `points` in Object(users[BOT_USERNAME][channel])
            ? msgCount * 25 >= users[BOT_USERNAME][channel].points
                ? `all`
                : `${msgCount * 25}`
            : `${msgCount * 25}`
        bot.say(chatroom, `!give ${username} ${pointsToGive}`)
    } else if (settings.debug) { console.log(`${grayTxt}-> StreamElements not present in ${channel}'s channel${resetTxt}`) }
}

function lemonifyRandomUser(props) {
    const { bot, chatroom } = props
    if (settings.debug) { console.log(`${grayTxt}> lemonifyRandomUser()${resetTxt}`) }

    const randomUser = getRandomUser([BOT_USERNAME])
    const randomMsg = getRandomChannelMessage(users[randomUser])
    const lemonMsg = lemonify(randomMsg)
    bot.say(chatroom, lemonMsg)
}

function useUndertaleBot(props) {
    const { bot, chatroom, channel } = props
    if (settings.debug) { console.log(`${grayTxt}> useUndertaleBot()${resetTxt}`) }

    if (lemonyFresh[channel].viewers.includes(`undertalebot`)) {
        const randomUser = getRandomUser(settings.ignoredBots)
        const actions = [
            `!fight ${randomUser}`,
            `!act ${randomUser}`,
            `!mercy ${randomUser}`
        ]
        bot.say(chatroom, actions[Math.floor(Math.random() * actions.length)])
    } else { console.log(`${grayTxt}-> UndertaleBot not present in ${channel}'s channel${resetTxt}`) }
}

function reportChance(props) {
    const { bot, chatroom } = props
    if (settings.debug) { console.log(`${grayTxt}> reportChance(funNumberCount: ${settings.funNumberCount}, funNumberTotal: ${settings.funNumberTotal})${resetTxt}`) }

    bot.say(chatroom, `This message has a 1/${(settings.funNumberCount * settings.funNumberTotal).toLocaleString()} chance of appearing`)
}

function sayMessageID(props) {
    const { bot, chatroom, tags } = props
    if (settings.debug) { console.log(`${grayTxt}> sayMessageID(tags: ${Object.keys(tags)})${resetTxt}`) }

    bot.say(chatroom, `${tags.id}`)
}

function sayTime(props) {
    const { bot, chatroom, currentTime } = props
    if (settings.debug) { console.log(`${grayTxt}> sayTime(currentTime: ${currentTime})${resetTxt}`) }

    bot.say(chatroom, `${currentTime}`)
}

async function askAboutGame(props) {
    const { bot, chatroom, channel } = props
    const broadcaster_id = lemonyFresh[channel].id
    const twitchChannel = await getTwitchChannel(bot, chatroom, broadcaster_id)
    const game = twitchChannel.game_name
    if (settings.debug) { console.log(`${grayTxt}> askAboutGame(channel: '${channel}', game: '${game}', game_id: '${twitchChannel.game_id}')${resetTxt}`) }

    const neutralEmote = getNeutralEmote(channel)
    bot.say(
        chatroom,
        game === `Just Chatting`
            ? `How is everyone doing? ${neutralEmote}`
            : `How are you enjoying ${game || `the game`}? ${neutralEmote}`
    )
}

function awardLemon(props) {
    const { bot, chatroom, channel, username, userNickname } = props
    if (settings.debug) { console.log(`${grayTxt}> awardLemon(channel: '${channel}', userNickname: '${userNickname}')${resetTxt}`) }

    users[username].lemons++
    const lemonEmote = getLemonEmote()
    bot.say(chatroom, `${userNickname} earned one (1) lemon! ${lemonEmote}`)
}

function useBTTVEmote(props) {
    const { bot, chatroom, channel } = props
    if (settings.debug) { console.log(`${grayTxt}> useBTTVEmote(channel: '${channel}', bttvEmotes: ${lemonyFresh[channel].bttvEmotes.length})${resetTxt}`) }

    if (lemonyFresh[channel].bttvEmotes.length === 0) {
        if (settings.debug) { console.log(`${grayTxt}-> No known BTTV emotes in channel${resetTxt}`) }
        return
    }

    const curseChance = [`c! `, ``, ``]
    const cursed = curseChance[Math.floor(Math.random() * curseChance.length)]

    const emotes = lemonyFresh[channel].bttvEmotes
    const emote = emotes[Math.floor(Math.random() * emotes.length)]
    bot.say(chatroom, `w! h! ${cursed}${emote}`)
}

function restartFunTimer(props) {
    const { bot, chatroom, channel, username } = props
    if (settings.debug) { console.log(`${grayTxt}> restartFunTimer(channel: '${channel}', username: '${username}')${resetTxt}`) }

    lemonyFresh[channel].funTimerGuesser = ``
    clearTimeout(lemonyFresh[channel].funTimer)

    const timer = setTimeout(() => {
        lemonyFresh[channel].funTimerGuesser = username
        bot.say(chatroom, `Do you remember the number, ${users[username].displayName}?`)
    }, settings.funTimerDuration)

    lemonyFresh[channel].funTimer
        ? bot.say(chatroom, `Forget ${lemonyFresh[channel].funTimer}, now I need ${users[username].displayName} to remember ${timer}`)
        : bot.say(chatroom, `I need ${users[username].displayName} to remember ${timer}`)

    if (settings.debug) {
        console.log(`${grayTxt}-> Fun Timer has been delayed in ${chatroom} ${lemonyFresh[channel].funTimer
            ? `again`
            : `for the first time`}, new value: ${Number(timer)}${resetTxt}`)
    }
    lemonyFresh[channel].funTimer = Number(timer)
}

function getViewers(props) {
    const { bot, chatroom, channel } = props
    const viewers = lemonyFresh[channel].viewers.length
    if (settings.debug) { console.log(`${grayTxt}> getViewers(channel: '${channel}', viewers: '${viewers}')${resetTxt}`) }

    const hypeEmote = getHypeEmote(channel)
    const positiveEmote = getPositiveEmote(channel)
    const neutralEmote = getNeutralEmote(channel)

    const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

    if (viewers > 4) {
        bot.say(chatroom,
            `${channelNickname} has ${pluralize(viewers, `viewer`, `viewers`)}! ${viewers < 10
                ? neutralEmote
                : viewers < 20
                    ? positiveEmote
                    : hypeEmote}`
        )
    } else if (settings.debug) { console.log(`${grayTxt}-> ${chatroom} only has ${pluralize(viewers, `viewer`, `viewers`)}${resetTxt}`) }
}

function getLurker(props) {
    const { bot, chatroom, channel } = props
    const notChatted = lemonyFresh[channel].viewers.filter(username => !(username in users) || !(channel in users[username]))
    const lurker = notChatted[Math.floor(Math.random() * notChatted.length)]
    if (settings.debug) { console.log(`${grayTxt}> getLurker(channel: '${channel}', lurker: '${lurker}', notChatted.length: ${notChatted.length})${resetTxt}`) }

    if (!notChatted.length) {
        if (settings.debug) { console.log(`${grayTxt}-> No lurkers found!${resetTxt}`) }
        return
    }

    const dumbEmote = getDumbEmote(channel)
    bot.say(chatroom, `Has anyone heard from ${lurker}? ${dumbEmote}`)
}

function awardLemonToChannelChatters(props) {
    const { bot, chatroom, channel } = props
    if (settings.debug) { console.log(`${grayTxt}> awardLemonToChannelChatters(channel: '${channel}')${resetTxt}`) }

    const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

    const recipients = []
    for (const username in users) {
        if (channel in users[username]) {
            users[username].lemons++
            recipients.push(username)
        }
    }
    if (settings.debug) { console.log(`${grayTxt}-> recipients:${resetTxt}`, recipients) }

    const lemonEmote = getLemonEmote()
    bot.say(chatroom, `${pluralize(recipients.length, `chatter`, `chatters`)} in ${channelNickname}'s channel just received one (1) lemon! ${lemonEmote}`)
}


function useTwoEmotes(props) {
    const { bot, chatroom, channel } = props
    if (settings.debug) { console.log(`${grayTxt}> useTwoEmotes(channel: '${channel}', emotes: ${lemonyFresh[channel].emotes.length})${resetTxt}`) }

    if (lemonyFresh[channel].emotes.length === 0) {
        if (settings.debug) { console.log(`${grayTxt}-> No known emotes in channel '${channel}'${resetTxt}`) }
        return
    }

    if (!users[BOT_USERNAME][channel].sub) {
        if (settings.debug) { console.log(`${grayTxt}-> ${BOT_USERNAME} is not subscribed to ${channel}, can't use emotes${resetTxt}`) }
        return
    }

    const emotes = lemonyFresh[channel].emotes
    const emoteOne = emotes[Math.floor(Math.random() * emotes.length)]
    const emoteTwo = emotes[Math.floor(Math.random() * emotes.length)]
    bot.say(chatroom, `${emoteOne} ${emoteTwo}`)
}

module.exports = {
    rollFunNumber(props, funNumber) {
        const { tags, message, channel, username } = props
        if (settings.debug) { console.log(`${grayTxt}> rollFunNumber(channel: '${channel}', tags: ${Object.keys(tags).length}, username: '${username}', message: '${message}', funNumber: ${funNumber})${resetTxt}`) }

        if (!lemonyFresh[channel].rollFunNumber) {
            if (settings.debug) { console.log(`${grayTxt}-> rollFunNumber disabled in ${channel}'s channel${resetTxt}`) }
            return
        }

        const outcomes = {
            0: makePyramid,
            1: giveMeMoney,
            2: transferMeMoney,
            3: useRedemption,
            4: givePoints,
            5: lemonifyRandomUser,
            6: useUndertaleBot,
            7: reportChance,
            8: sayMessageID,
            9: sayTime,
            10: askAboutGame,
            11: awardLemon,
            12: useBTTVEmote,
            13: restartFunTimer,
            14: restartFunTimer,
            15: restartFunTimer,
            16: getViewers,
            17: getLurker,
            18: awardLemonToChannelChatters,
            19: useTwoEmotes
        }

        if (funNumber in outcomes) {
            if (settings.debug) { console.log(`${grayTxt}-> Fun number${resetTxt}`, funNumber, `${grayTxt}matched:${resetTxt}`, outcomes[funNumber]) }
            return outcomes[funNumber](props)
        }
        if (settings.debug) { console.log(`${grayTxt}-> Fun number${resetTxt}`, funNumber, `${grayTxt}is unused${resetTxt}`) }
    }
}
