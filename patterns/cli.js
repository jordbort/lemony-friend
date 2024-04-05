const DEV = process.env.DEV
const { lemonyFresh, users } = require(`../data`)
const { settings, grayTxt, resetTxt } = require(`../config`)
const { getLemonEmote, getToUser } = require(`../utils`)

function updateBool(bot, chatroom, obj, message, name, args) {
    if (settings.debug) { console.log(`${grayTxt}> updateBool(chatroom: '${chatroom}', name: '${name}', args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

    if (/^true$|^t$/i.test(args[0])) {
        obj[name] = true
        return bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
    }

    if (/^false$|^f$/i.test(args[0])) {
        obj[name] = false
        return bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
    }

    bot.say(chatroom, `/me ${message} must be "true (t)" or "false (f)" (currently: ${obj[name]})`)
}

function updateArr(bot, chatroom, obj, message, name, args) {
    if (settings.debug) { console.log(`${grayTxt}> updateArr(chatroom: '${chatroom}', name: '${name}', args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

    if (!args.length) { return bot.say(chatroom, `/me ${message} (${obj[name].length}): ${obj[name].join(` `)} - Add more, "delete (d)" some, or "clear (c)" all`) }

    if (/^clear$|^c$/i.test(args[0])) {
        obj[name].length = 0
        return bot.say(chatroom, `/me ${message} has been cleared`)
    }

    if (/^delete$|^d$/i.test(args[0])) {
        args.shift()
        const removals = []
        for (const element of args) {
            if (obj[name].includes(element) && /^[a-z0-9]{4,30}$/i.test(element)) {
                obj[name].splice(obj[name].indexOf(element), 1)
                removals.push(element)
            }
        }
        return bot.say(chatroom, `/me ${message} length ${obj[name].length}, removed ${removals.length}${removals.length ? `: ${removals.join(` `)}` : ``}`)
    }

    const additions = []
    for (const element of args) {
        if (!obj[name].includes(element) && /^[a-z0-9]{4,30}$/i.test(element)) {
            obj[name].push(element)
            additions.push(element)
        }
    }
    bot.say(chatroom, `/me ${message} length ${obj[name].length}, added ${additions.length}${additions.length ? `: ${additions.join(` `)}` : ``}`)
}

function updateStr(bot, chatroom, obj, message, name, args) {
    if (settings.debug) { console.log(`${grayTxt}> updateStr(chatroom: '${chatroom}', name: '${name}', args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

    if (!args[0]) { return bot.say(chatroom, `/me ${message} is currently: ${obj[name] || `(not set)`} - change it, or use "clear (c)"`) }

    if (/^clear$|^c$/i.test(args[0])) {
        obj[name] = ``
        return bot.say(chatroom, `/me ${message} has been cleared`)
    }

    const toUser = getToUser(args[0])
    obj[name] = toUser in users && args.length === 1
        ? toUser
        : args.join(` `)

    bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
}

function updateNum(bot, chatroom, obj, message, name, args) {
    if (settings.debug) { console.log(`${grayTxt}> updateNum(chatroom: '${chatroom}', name: '${name}', args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

    if (Number(args[0]) >= 1 && Number(args[0]) <= 100) {
        obj[name] = Math.round(Number(args[0]))
        return bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
    }

    bot.say(chatroom, `/me ${message} must be between 1-100 (currently: ${obj[name]})`)
}

function updateDuration(bot, chatroom, obj, message, name, args) {
    if (settings.debug) { console.log(`${grayTxt}> updateDuration(chatroom: '${chatroom}', name: '${name}', args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

    if (Number(args[0]) >= 0 && Number(args[0]) <= 120) {
        obj[name] = Math.round(Number(args[0]))
        return bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
    }

    bot.say(chatroom, `/me ${message} must be between 0-120 (currently: ${obj[name]} seconds)`)
}

function updateChannel(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    if (settings.debug) { console.log(`${grayTxt}> updateChannel(username, '${username}', channel, '${channel}', args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

    const options = {
        [/^timers?$|^t$/i]: { name: `timers`, func: updateTimer },
        [/^emotes?$|^e$/i]: { name: `emotes`, func: updateArr },
        [/^bttvEmotes?$|^bttv$/i]: { name: `bttvEmotes`, func: updateArr },
        [/^shoutouts?$|^so$/i]: { name: `shoutouts`, func: updateBool },
        [/^subRaidMessage$|^srm$/i]: { name: `subRaidMessage`, func: updateStr },
        [/^noSubRaidMessage$|^nsrm$/i]: { name: `noSubRaidMessage`, func: updateStr },
        [/^redeems?$|^r$/i]: { name: `redeems`, func: updateArr },
        [/^funTimerGuesser$|^ftg$/i]: { name: `funTimerGuesser`, func: updateStr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            if (settings.debug) { console.log(`${grayTxt}-> Channel "${channel}" option "${args[0]}" matched:${resetTxt}`, regex, options[regex].func) }
            args.shift()
            return options[regex].func(bot, chatroom, lemonyFresh[channel], `Channel ${channel} "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for channel "${channel}": timers (t), emotes (e), bttvEmotes (bttv), subRaidMessage (srm), noSubRaidMessage (nsrm), redeems (r), funTimerGuesser (ftg)`)
}

function updateUser(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    if (settings.debug) { console.log(`${grayTxt}> updateUser(username, '${username}', args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

    const toUser = getToUser(args[0])
    if (!(toUser in users)) { return bot.say(chatroom, `/me Please specify one of ${(Object.keys(users).length).toLocaleString(settings.timeLocale)} valid users`) }

    const options = {
        [/^nickname$|^nn$/i]: { name: `nickname`, func: updateStr },
        [/^away$|^a$/i]: { name: `away`, func: updateBool },
        [/^awayMessage$|^am$/i]: { name: `awayMessage`, func: updateStr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[1])) {
            if (settings.debug) { console.log(`${grayTxt}-> User "${toUser}" option "${args[0]}":${resetTxt}`, regex, options[regex]) }
            args.shift()

            // User away and awayMessage require channel object
            const optCheck = args.shift()

            return options[regex].func(bot,
                chatroom,
                /^away$|^a$/i.test(optCheck) || /^awayMessage$|^am$/i.test(optCheck)
                    ? users[toUser][channel]
                    : users[toUser],
                /^away$|^a$/i.test(optCheck) || /^awayMessage$|^am$/i.test(optCheck)
                    ? `User "${toUser}" in ${channel} "${options[regex].name}"`
                    : `User ${toUser} "${options[regex].name}"`,
                options[regex].name, args
            )
        }
    }

    bot.say(chatroom, `/me Options for user "${toUser}": nickname (nn), away (a), awayMessage (am)`)
}

function updateSettings(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    if (settings.debug) { console.log(`${grayTxt}> updateSettings(username, '${username}', channel, '${channel}', args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

    const options = {
        [/^timeZone$|^tz$/i]: { name: `timeZone`, func: updateStr },
        [/^realRPS$|^rps$/i]: { name: `realRPS`, func: updateBool },
        [/^funNumberCount$|^fnc$/i]: { name: `funNumberCount`, func: updateNum },
        [/^funNumberTotal$|^fnt$/i]: { name: `funNumberTotal`, func: updateNum },
        [/^hangmanChances$|^hc$/i]: { name: `hangmanChances`, func: updateNum },
        [/^chantCount$|^cc$/i]: { name: `chantCount`, func: updateNum },
        [/^chantEmote$|^ce$/i]: { name: `chantEmote`, func: updateStr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            if (settings.debug) { console.log(`${grayTxt}-> Setting "${args[0]}" matched:${resetTxt}`, regex, options[regex].func) }
            args.shift()
            return options[regex].func(bot, chatroom, settings, `Setting "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for "settings": timeZone (tz), realRPS (rps), funNumberCount (fnc), funNumberTotal (fnt), hangmanChances (hc), chantCount (cc), chantEmote (ce)`)
}

function updateChannelDev(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    if (settings.debug) { console.log(`${grayTxt}> updateChannel(username, '${username}', channel, '${channel}', args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

    const toUser = getToUser(args.shift())
    if (!(toUser in lemonyFresh)
        || typeof lemonyFresh[toUser] !== `object`
        || Array.isArray(lemonyFresh[toUser])) { return bot.say(chatroom, `/me Please specify a valid channel: ${Object.keys(lemonyFresh).filter(channel => typeof lemonyFresh[channel] === `object` && !Array.isArray(lemonyFresh[channel])).join(`, `)}`) }

    const options = {
        [/^timers?$|^t$/i]: { name: `timers`, func: updateTimer },
        [/^subRaidMessage$|^srm$/i]: { name: `subRaidMessage`, func: updateStr },
        [/^noSubRaidMessage$|^nsrm$/i]: { name: `noSubRaidMessage`, func: updateStr },
        [/^emotes?$|^e$/i]: { name: `emotes`, func: updateArr },
        [/^bttvEmotes?$|^bttv$/i]: { name: `bttvEmotes`, func: updateArr },
        [/^redeems?$|^r$/i]: { name: `redeems`, func: updateArr },
        [/^funTimerGuesser$|^ftg$/i]: { name: `funTimerGuesser`, func: updateStr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            if (settings.debug) { console.log(`${grayTxt}-> Channel ${toUser} option "${args[0]}" matched:${resetTxt}`, regex, options[regex].func) }
            args.shift()
            return options[regex].func(bot, chatroom, lemonyFresh[toUser], `Channel ${toUser} "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for channel "${toUser}": timers (t), subRaidMessage (srm), noSubRaidMessage (nsrm), emotes (e), bttvEmotes (bttv), redeems (r), funTimerGuesser (ftg)`)
}

function updateUserDev(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    if (settings.debug) { console.log(`${grayTxt}> updateUserDev(username, '${username}', args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

    const toUser = getToUser(args[0])
    if (!(toUser in users)) { return bot.say(chatroom, `/me Please specify one of ${(Object.keys(users).length).toLocaleString(settings.timeLocale)} valid users`) }

    const options = {
        [/^displayName$|^dn$/i]: { name: `displayName`, func: updateStr },
        [/^nickname$|^nn$/i]: { name: `nickname`, func: updateStr },
        [/^lemons?$|^l$/i]: { name: `lemons`, func: updateNum },
        [/^hangmanWins?$|^hw$/i]: { name: `hangmanWins`, func: updateNum },
        [/^away$|^a$/i]: { name: `away`, func: updateBool },
        [/^awayMessage$|^am$/i]: { name: `awayMessage`, func: updateStr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[1])) {
            if (settings.debug) { console.log(`${grayTxt}-> Channel ${toUser} option ${args[0]} matched:${resetTxt}`, regex, options[regex]) }
            args.shift()

            // User away and awayMessage require channel object
            const optCheck = args.shift()

            return options[regex].func(bot,
                chatroom,
                /^away$|^a$/i.test(optCheck) || /^awayMessage$|^am$/i.test(optCheck)
                    ? users[toUser][channel]
                    : users[toUser],
                /^away$|^a$/i.test(optCheck) || /^awayMessage$|^am$/i.test(optCheck)
                    ? `User "${toUser}" in ${channel} "${options[regex].name}"`
                    : `User ${toUser} "${options[regex].name}"`,
                options[regex].name, args
            )
        }
    }

    bot.say(chatroom, `/me Options for user "${toUser}": displayName (dn), nickname (nn), lemons (l), hangmanWins (hw), away (a), awayMessage (am)`)
}

function updateSettingsDev(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    if (settings.debug) { console.log(`${grayTxt}> updateSettingsDev(username, '${username}', channel, '${channel}', args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

    if (/^baseEmotes$|^be$/i.test(args[0])) {
        args.shift()
        return updateEmotesDev(bot, chatroom, args)
    }

    const options = {
        [/^debug$|^d$/i]: { name: `debug`, func: updateBool },
        [/^timeLocale$|^tl$/i]: { name: `timeLocale`, func: updateStr },
        [/^timeZone$|^tz$/i]: { name: `timeZone`, func: updateStr },
        [/^joinMessage$|^jm$/i]: { name: `joinMessage`, func: updateStr },
        [/^highlightBotMessage$|^hbm$/i]: { name: `highlightBotMessage`, func: updateBool },
        [/^logTime$|^lt$/i]: { name: `logTime`, func: updateBool },
        [/^hideNonDevChannel$|^hndc$/i]: { name: `hideNonDevChannel`, func: updateBool },
        [/^sayJoinMessage$|^sjm$/i]: { name: `sayJoinMessage`, func: updateBool },
        [/^realRPS$|^rps$/i]: { name: `realRPS`, func: updateBool },
        [/^funNumberCount$|^fnc$/i]: { name: `funNumberCount`, func: updateNum },
        [/^funNumberTotal$|^fnt$/i]: { name: `funNumberTotal`, func: updateNum },
        [/^streakThreshold$|^st$/i]: { name: `streakThreshold`, func: updateNum },
        [/^streamerEmoteStreakThreshold$|^sest$/i]: { name: `streamerEmoteStreakThreshold`, func: updateNum },
        [/^hangmanSignupSeconds$|^hss$/i]: { name: `hangmanSignupSeconds`, func: updateNum },
        [/^hangmanChances$|^hc$/i]: { name: `hangmanChances`, func: updateNum },
        [/^chantCount$|^cc$/i]: { name: `chantCount`, func: updateNum },
        [/^chantEmote$|^ce$/i]: { name: `chantEmote`, func: updateStr },
        [/^botMood$|^m$/i]: { name: `botMood`, func: updateStr },
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            if (settings.debug) { console.log(`${grayTxt}-> Setting "${args[0]}" matched:${resetTxt}`, regex, options[regex].func) }
            args.shift()
            return options[regex].func(bot, chatroom, settings, `Setting "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for "settings": debug (d), timeLocale (tl), timeZone (tz), joinMessage (jm), highlightBotMessage (hbm), logTime (lt), hideNonDevChannel (hndc), sayJoinMessage (sjm), realRPS (rps), funNumberCount (fnc), funNumberTotal (fnt), streakThreshold (st), streamerEmoteStreakThreshold (sest), hangmanSignupSeconds (hss), hangmanChances (hc), chantCount (cc), chantEmote (ce), baseEmotes (be), botMood (m)`)
}

function updateEmotesDev(bot, chatroom, args) {
    if (settings.debug) { console.log(`${grayTxt}> updateEmotesDev(args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

    const options = {
        [/^lemonEmotes$|^lem$/i]: { name: `lemonEmotes`, func: updateArr },
        [/^neutralEmotes$|^neu$/i]: { name: `neutralEmotes`, func: updateArr },
        [/^hypeEmotes$|^hype$/i]: { name: `hypeEmotes`, func: updateArr },
        [/^positiveEmotes$|^pos$/i]: { name: `positiveEmotes`, func: updateArr },
        [/^upsetEmotes$|^up$/i]: { name: `upsetEmotes`, func: updateArr },
        [/^negativeEmotes$|^neg$/i]: { name: `negativeEmotes`, func: updateArr },
        [/^greetingEmotes$|^greet$/i]: { name: `greetingEmotes`, func: updateArr },
        [/^byeEmotes$|^bye$/i]: { name: `byeEmotes`, func: updateArr },
        [/^dumbEmotes$|^dum$/i]: { name: `dumbEmotes`, func: updateArr },
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            if (settings.debug) { console.log(`${grayTxt}-> Emotes option "${args[0]}" matched:${resetTxt}`, regex, options[regex].func) }
            args.shift()
            return options[regex].func(bot, chatroom, settings.baseEmotes, `Setting baseEmotes "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for setting "baseEmotes": lemonEmotes (lem), neutralEmotes (neu), hypeEmotes (hype), positiveEmotes (pos), upsetEmotes (up), negativeEmotes (neg), greetingEmotes (greet), byeEmotes (bye), dumbEmotes (dum)`)
}

function updateTimer(bot, chatroom, obj, message, name, args) {
    const channel = chatroom.substring(1)
    if (settings.debug) { console.log(`${grayTxt}> updateTimer(channel, ${channel}, args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

    const timer = args.shift()
    if (!(timer in obj[name])) { return bot.say(chatroom, `/me Please specify a valid timer: ${Object.keys(obj[name]).join(`, `)}`) }

    const options = {
        [/^cooldown$|^cd$/i]: { name: `cooldown`, func: updateDuration },
        [/^listening$|^l$/i]: { name: `listening`, func: updateBool }
    }

    const setting = args.shift()
    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(setting)) {
            if (settings.debug) { console.log(`${grayTxt}-> Timer "${timer}" setting "${setting}" matched:${resetTxt}`, regex, options[regex].func) }
            return options[regex].func(bot, chatroom, obj[name][timer], `${message} ${timer} "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for ${channel} timer "${timer}": cooldown (cd), listening (l)`)
}

module.exports = {
    commandLemonInterface(props, splitMessage) {
        const { bot, chatroom, username, isMod, isLemonyFreshMember } = props
        splitMessage.shift()
        const args = splitMessage[0].split(` `)
        if (settings.debug) { console.log(`${grayTxt}> commandLemonInterface(username, '${username}', isMod, ${isMod}, isLemonyFreshMember, ${isLemonyFreshMember}, args:${resetTxt}`, args, `${grayTxt})${resetTxt}`) }

        if (username === DEV) {
            const options = {
                [/^channels?$|^c$/i]: updateChannelDev,
                [/^users?$|^u$/i]: updateUserDev,
                [/^settings?$|^s$/i]: updateSettingsDev
            }
            for (const option in options) {
                const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
                if (regex.test(args[0])) {
                    if (settings.debug) { console.log(`${grayTxt}-> Dev ${username} matched:${resetTxt}`, regex, options[regex]) }
                    return options[regex](props, args)
                }
            }
        }

        if (isMod) {
            const options = {
                [/^channels?$|^c$/i]: updateChannel,
                [/^users?$|^u$/i]: updateUser,
                [/^settings?$|^s$/i]: updateSettings
            }
            for (const option in options) {
                const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
                if (regex.test(args[0])) {
                    if (settings.debug) { console.log(`${grayTxt}-> Streamer/mod ${username} matched:${resetTxt}`, regex, options[regex]) }
                    return options[regex](props, args)
                }
            }
        }

        if (isLemonyFreshMember) {
            const options = {
                [/^channels?$|^c$/i]: updateChannel,
                [/^users?$|^u$/i]: updateUser,
                [/^settings?$|^s$/i]: updateSettings
            }
            for (const option in options) {
                const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
                if (regex.test(args[0])) {
                    if (settings.debug) { console.log(`${grayTxt}-> Streamer ${username} matched:${resetTxt}`, regex, options[regex]) }
                    props.channel = username
                    return options[regex](props, args)
                }
            }
        }

        if (isMod || isLemonyFreshMember) {
            const lemonEmote = getLemonEmote()
            bot.say(chatroom, `/me Command Lemon Interface ${lemonEmote} > try: channel (c), user (u), settings (s)`)
        }
    }
}
