const DEV = process.env.DEV
const { settings } = require(`../config`)
const { lemonyFresh, users } = require(`../data`)
const { getLemonEmote, getToUser, pluralize, logMessage } = require(`../utils`)

function updateBool(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateBool(chatroom: '${chatroom}', name: '${name}', args:`, args, `)`])

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
    logMessage([`> updateArr(chatroom: '${chatroom}', name: '${name}', args:`, args, `)`])

    if (!args.length) { return bot.say(chatroom, `/me ${message} (${pluralize(obj[name].length, `item`, `items`)}): ${obj[name].join(` `)} - Add more, "delete (d)" some, or "clear (c)" all`) }

    if (/^clear$|^c$/i.test(args[0])) {
        obj[name].length = 0
        return bot.say(chatroom, `/me ${message} has been cleared`)
    }

    if (/^delete$|^d$/i.test(args[0])) {
        args.shift()
        const removals = []
        for (const element of args) {
            if (obj[name].includes(element)) {
                obj[name].splice(obj[name].indexOf(element), 1)
                removals.push(element)
            }
        }
        return bot.say(chatroom, `/me ${message} (${pluralize(obj[name].length, `item`, `items`)}), removed ${removals.length}${removals.length ? `: ${removals.join(` `)}` : ``}`)
    }

    const additions = []
    for (const element of args) {
        if (!obj[name].includes(element)) {
            obj[name].push(element)
            additions.push(element)
        }
    }
    bot.say(chatroom, `/me ${message} (${pluralize(obj[name].length, `item`, `items`)}), added ${additions.length}${additions.length ? `: ${additions.join(` `)}` : ``}`)
}

function updatePhraseArr(bot, chatroom, obj, message, name, args) {
    logMessage([`> updatePhraseArr(chatroom: '${chatroom}', name: '${name}', args:`, args, `)`])

    if (/^add$|^a$/i.test(args[0])) {
        args.shift()
        if (!args.length) { return bot.say(chatroom, `/me ${message}: Nothing to add`) }
        const phrase = args.join(` `)
        obj[name].push(phrase)
        return bot.say(chatroom, `/me ${message}: Added "${phrase}"`)
    }

    if (/^delete$|^d$/i.test(args[0])) {
        args.shift()
        if (!args.length) { return bot.say(chatroom, `/me ${message}: Nothing to delete`) }
        const phrase = args.join(` `)
        const regex = new RegExp(`^${phrase}$`, `i`)
        for (const [i, entry] of obj[name].entries()) {
            if (regex.test(entry)) {
                obj[name].splice(i, 1)
                return bot.say(chatroom, `/me ${message}: Removed "${entry}" (${obj[name].length} remaining)${obj[name].length ? ` - "${obj[name].join(`", "`)}"` : ``}`)
            }
        }
        return bot.say(chatroom, `/me ${message}: Could not find "${phrase}" (${pluralize(obj[name].length, `phrase exists`, `phrases exist`)})${obj[name].length ? ` - "${obj[name].join(`", "`)}"` : ``}`)
    }

    if (/^clear$|^c$/i.test(args[0])) {
        obj[name].length = 0
        return bot.say(chatroom, `/me ${message} has been cleared`)
    }

    bot.say(chatroom, `/me ${message} (${pluralize(obj[name].length, `phrase`, `phrases`)})${obj[name].length ? `: "${obj[name].join(`", "`)}"` : ``} - Use "add (a)" to add one, use "delete (d)" to delete one, or use "clear (c)" to remove all`)
}

function updateStr(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateStr(chatroom: '${chatroom}', name: '${name}', args:`, args, `)`])

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
    logMessage([`> updateNum(chatroom: '${chatroom}', name: '${name}', args:`, args, `)`])

    if (Number(args[0]) >= 1 && Number(args[0]) <= 100) {
        obj[name] = Math.round(Number(args[0]))
        return bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
    }

    bot.say(chatroom, `/me ${message} must be between 1-100 (currently: ${obj[name]})`)
}

function updateDuration(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateDuration(chatroom: '${chatroom}', name: '${name}', args:`, args, `)`])

    if (Number(args[0]) >= 0 && Number(args[0]) <= 120) {
        obj[name] = Math.round(Number(args[0]))
        return bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
    }

    bot.say(chatroom, `/me ${message} must be between 0-120 (currently: ${obj[name]} seconds)`)
}

function updateChannelDev(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateChannel(username, '${username}', channel, '${channel}', args:`, args, `)`])

    const toUser = getToUser(args.shift())
    if (!(toUser in lemonyFresh)
        || typeof lemonyFresh[toUser] !== `object`
        || Array.isArray(lemonyFresh[toUser])) { return bot.say(chatroom, `/me Please specify a valid channel: ${Object.keys(lemonyFresh).filter(channel => typeof lemonyFresh[channel] === `object` && !Array.isArray(lemonyFresh[channel])).join(`, `)}`) }

    const options = {
        [/^timers?$|^t$/i]: { name: `timers`, func: updateTimer },
        [/^rollFunNumber$|^rfn$/i]: { name: `rollFunNumber`, func: updateBool },
        [/^emotes?$|^e$/i]: { name: `emotes`, func: updateArr },
        [/^bttvEmotes?$|^bttv$/i]: { name: `bttvEmotes`, func: updateArr },
        [/^subRaidMessage$|^srm$/i]: { name: `subRaidMessage`, func: updateStr },
        [/^noSubRaidMessage$|^nsrm$/i]: { name: `noSubRaidMessage`, func: updateStr },
        [/^redeems?$|^r$/i]: { name: `redeems`, func: updateArr },
        [/^funTimerGuesser$|^ftg$/i]: { name: `funTimerGuesser`, func: updateStr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            logMessage([`-> Channel ${toUser} option "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            return options[regex].func(bot, chatroom, lemonyFresh[toUser], `Channel ${toUser} "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for channel "${toUser}": timers (t), rollFunNumber (rfn), emotes (e), bttvEmotes (bttv), subRaidMessage (srm), noSubRaidMessage (nsrm), redeems (r), funTimerGuesser (ftg)`)
}

function updateChannel(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateChannel(username, '${username}', channel, '${channel}', args:`, args, `)`])

    const options = {
        [/^timers?$|^t$/i]: { name: `timers`, func: updateTimer },
        [/^rollFunNumber$|^rfn$/i]: { name: `rollFunNumber`, func: updateBool },
        [/^emotes?$|^e$/i]: { name: `emotes`, func: updateArr },
        [/^bttvEmotes?$|^bttv$/i]: { name: `bttvEmotes`, func: updateArr },
        [/^subRaidMessage$|^srm$/i]: { name: `subRaidMessage`, func: updateStr },
        [/^noSubRaidMessage$|^nsrm$/i]: { name: `noSubRaidMessage`, func: updateStr },
        [/^redeems?$|^r$/i]: { name: `redeems`, func: updateArr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            logMessage([`-> Channel "${channel}" option "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            return options[regex].func(bot, chatroom, lemonyFresh[channel], `Channel ${channel} "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for channel "${channel}": timers (t), rollFunNumber (rfn), emotes (e), bttvEmotes (bttv), subRaidMessage (srm), noSubRaidMessage (nsrm), redeems (r)`)
}

function updateUserDev(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateUserDev(username, '${username}', args:`, args, `)`])

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
            logMessage([`-> Channel ${toUser} option ${args[0]} matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()

            // User away and awayMessage require channel object
            const optCheck = args.shift()

            return /^away$|^a$/i.test(optCheck) || /^awayMessage$|^am$/i.test(optCheck)
                ? channel in users[toUser]
                    ? options[regex].func(
                        bot,
                        chatroom,
                        users[toUser][channel],
                        `User "${toUser}" in ${channel} "${options[regex].name}"`,
                        options[regex].name, args
                    )
                    : bot.say(chatroom, `/me User "${toUser}" has no data in channel "${channel}", so "${options[regex].name}" cannot be changed here`)
                : options[regex].func(
                    bot,
                    chatroom,
                    users[toUser],
                    `User ${toUser} "${options[regex].name}"`,
                    options[regex].name, args
                )
        }
    }

    bot.say(chatroom, `/me Options for user "${toUser}": displayName (dn), nickname (nn), lemons (l), hangmanWins (hw), away (a), awayMessage (am)`)
}

function updateUser(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateUser(username, '${username}', args:`, args, `)`])

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
            logMessage([`-> User "${toUser}" option "${args[0]}":`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()

            // User away and awayMessage require channel object
            const optCheck = args.shift()

            return /^away$|^a$/i.test(optCheck) || /^awayMessage$|^am$/i.test(optCheck)
                ? channel in users[toUser]
                    ? options[regex].func(
                        bot,
                        chatroom,
                        users[toUser][channel],
                        `User "${toUser}" in ${channel} "${options[regex].name}"`,
                        options[regex].name,
                        args
                    )
                    : bot.say(chatroom, `/me User "${toUser}" has no data in channel "${channel}", so "${options[regex].name}" cannot be changed here`)
                : options[regex].func(
                    bot,
                    chatroom,
                    users[toUser],
                    `User ${toUser} "${options[regex].name}"`,
                    options[regex].name,
                    args
                )
        }
    }

    bot.say(chatroom, `/me Options for user "${toUser}": nickname (nn), away (a), awayMessage (am)`)
}

function updateSettingsDev(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateSettingsDev(username, '${username}', channel, '${channel}', args:`, args, `)`])

    if (/^baseEmotes$|^be$/i.test(args[0])) {
        args.shift()
        return updateBaseEmotesDev(bot, chatroom, args)
    }

    const options = {
        [/^debug$|^d$/i]: { name: `debug`, func: updateBool },
        [/^timeLocale$|^tl$/i]: { name: `timeLocale`, func: updateStr },
        [/^timeZone$|^tz$/i]: { name: `timeZone`, func: updateStr },
        // [/^joinMessage$|^jm$/i]: { name: `joinMessage`, func: updateStr },
        // [/^highlightBotMessage$|^hbm$/i]: { name: `highlightBotMessage`, func: updateBool },
        // [/^logTime$|^lt$/i]: { name: `logTime`, func: updateBool },
        // [/^hideNonDevChannel$|^hndc$/i]: { name: `hideNonDevChannel`, func: updateBool },
        [/^autoBan$|^ab$/i]: { name: `autoBan`, func: updatePhraseArr },
        [/^ignoredBots$|^ib$/i]: { name: `ignoredBots`, func: updateArr },
        // [/^sayJoinMessage$|^sjm$/i]: { name: `sayJoinMessage`, func: updateBool },
        // [/^sayPartMessage$|^spm$/i]: { name: `sayPartMessage`, func: updateBool },
        [/^realRPS$|^rps$/i]: { name: `realRPS`, func: updateBool },
        [/^funNumberCount$|^fnc$/i]: { name: `funNumberCount`, func: updateNum },
        [/^funNumberTotal$|^fnt$/i]: { name: `funNumberTotal`, func: updateNum },
        [/^streakThreshold$|^st$/i]: { name: `streakThreshold`, func: updateNum },
        [/^streamerEmoteStreakThreshold$|^sest$/i]: { name: `streamerEmoteStreakThreshold`, func: updateNum },
        [/^hangmanSignupSeconds$|^hss$/i]: { name: `hangmanSignupSeconds`, func: updateNum },
        [/^hangmanChances$|^hc$/i]: { name: `hangmanChances`, func: updateNum },
        [/^hangmanLemonThreshold$|^hlt$/i]: { name: `hangmanLemonThreshold`, func: updateNum },
        [/^chantCount$|^cc$/i]: { name: `chantCount`, func: updateNum },
        [/^chantEmote$|^ce$/i]: { name: `chantEmote`, func: updateStr },
        [/^botMood$|^m$/i]: { name: `botMood`, func: updateStr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            logMessage([`-> Setting "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            return options[regex].func(bot, chatroom, settings, `Setting "${options[regex].name}"`, options[regex].name, args)
        }
    }

    // bot.say(chatroom, `/me Options for "settings": debug (d), timeLocale (tl), timeZone (tz), joinMessage (jm), highlightBotMessage (hbm), logTime (lt), hideNonDevChannel (hndc), autoBan (ab), ignoredBots (ib), sayJoinMessage (sjm), sayPartMessage (spm), realRPS (rps), funNumberCount (fnc), funNumberTotal (fnt), streakThreshold (st), streamerEmoteStreakThreshold (sest), hangmanSignupSeconds (hss), hangmanChances (hc), hangmanLemonThreshold (hlt), chantCount (cc), chantEmote (ce), baseEmotes (be), botMood (m)`)
    bot.say(chatroom, `/me Options for "settings": debug (d), timeLocale (tl), timeZone (tz), autoBan (ab), ignoredBots (ib), realRPS (rps), funNumberCount (fnc), funNumberTotal (fnt), streakThreshold (st), streamerEmoteStreakThreshold (sest), hangmanSignupSeconds (hss), hangmanChances (hc), hangmanLemonThreshold (hlt), chantCount (cc), chantEmote (ce), baseEmotes (be), botMood (m)`)
}

function updateSettings(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateSettings(username, '${username}', channel, '${channel}', args:`, args, `)`])

    const options = {
        [/^timeZone$|^tz$/i]: { name: `timeZone`, func: updateStr },
        [/^autoBan$|^ab$/i]: { name: `autoBan`, func: updatePhraseArr },
        [/^ignoredBots$|^ib$/i]: { name: `ignoredBots`, func: updateArr },
        [/^realRPS$|^rps$/i]: { name: `realRPS`, func: updateBool },
        [/^hangmanChances$|^hc$/i]: { name: `hangmanChances`, func: updateNum },
        [/^chantCount$|^cc$/i]: { name: `chantCount`, func: updateNum },
        [/^chantEmote$|^ce$/i]: { name: `chantEmote`, func: updateStr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            logMessage([`-> Setting "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            return options[regex].func(bot, chatroom, settings, `Setting "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for "settings": timeZone (tz), autoBan (ab), ignoredBots (ib), realRPS (rps), hangmanChances (hc), chantCount (cc), chantEmote (ce)`)
}

function updateBaseEmotesDev(bot, chatroom, args) {
    logMessage([`> updateBaseEmotesDev(args:`, args, `)`])

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
            logMessage([`-> Emotes option "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            return options[regex].func(bot, chatroom, settings.baseEmotes, `Setting baseEmotes "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for setting "baseEmotes": lemonEmotes (lem), neutralEmotes (neu), hypeEmotes (hype), positiveEmotes (pos), upsetEmotes (up), negativeEmotes (neg), greetingEmotes (greet), byeEmotes (bye), dumbEmotes (dum)`)
}

function updateTimer(bot, chatroom, obj, message, name, args) {
    const channel = chatroom.substring(1)
    logMessage([`> updateTimer(channel, ${channel}, args:`, args, `)`])

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
            logMessage([`-> Timer "${timer}" setting "${setting}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
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
        logMessage([`> commandLemonInterface(username, '${username}', isMod, ${isMod}, isLemonyFreshMember, ${isLemonyFreshMember}, args:`, args, `)`])

        if (username === DEV) {
            const options = {
                [/^channels?$|^c$/i]: updateChannelDev,
                [/^users?$|^u$/i]: updateUserDev,
                [/^settings?$|^s$/i]: updateSettingsDev
            }
            for (const option in options) {
                const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
                if (regex.test(args[0])) {
                    logMessage([`-> Dev ${username} matched:`, regex, `[Function: ${options[regex].name}]`])
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
                    logMessage([`-> Streamer/mod ${username} matched:`, regex, `[Function: ${options[regex].name}]`])
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
                    logMessage([`-> Streamer ${username} matched:`, regex, `[Function: ${options[regex].name}]`])
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
