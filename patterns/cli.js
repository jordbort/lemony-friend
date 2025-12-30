const DEV = process.env.DEV
const { settings } = require(`../config`)
const { lemonyFresh, users } = require(`../data`)
const { validTimeZones, validLocales } = require(`../commands/time`)
const { getContextEmote, getToUser, pluralize, logMessage } = require(`../utils`)

const makeList = (obj) => Object.keys(obj)
    .map(pattern => pattern.split(/\^([^?]+)\??\$\|\^([^?]+)\$/i)
        .slice(1, 3))
    .map(arr => `${arr[0]} (${arr[1]})`)
    .join(`, `)

function updateTimeZone(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateTimeZone(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])
    const input = args.join(` `)

    for (const timeZone of Object.keys(validTimeZones)) {
        const regex = new RegExp(timeZone.split(`/`).slice(1, timeZone.split(`/`).length - 1).join(`/`), timeZone.split(`/`)[timeZone.split(`/`).length - 1])
        if (regex.test(input)) {
            obj[name] = validTimeZones[regex]
            bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
            return
        }
    }

    bot.say(chatroom, `/me ${message} must be a valid timezone (currently: ${obj[name]})`)
}

function updateTimeLocale(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateTimeLocale(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])
    const input = args.join(` `)

    for (const locale of Object.keys(validLocales)) {
        const regex = new RegExp(locale.split(`/`).slice(1, locale.split(`/`).length - 1).join(`/`), locale.split(`/`)[locale.split(`/`).length - 1])
        if (regex.test(input)) {
            obj[name] = validLocales[regex]
            bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
            return
        }
    }

    bot.say(chatroom, `/me ${message} must be a valid time locale (currently: ${obj[name]})`)
}

function updateBool(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateBool(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])

    if (/^true$|^t$/i.test(args[0])) {
        obj[name] = true
        bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
        return
    }

    if (/^false$|^f$/i.test(args[0])) {
        obj[name] = false
        bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
        return
    }

    bot.say(chatroom, `/me ${message} must be "true (t)" or "false (f)" (currently: ${obj[name]})`)
}

function updateArr(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateArr(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])

    if (!args.length) {
        bot.say(chatroom, `/me ${message} (${pluralize(obj[name].length, `item`, `items`)}): ${obj[name].join(` `)} - Add more, "delete (d)" some, or "clear (c)" all`)
        return
    }

    if (/^clear$|^c$/i.test(args[0])) {
        obj[name].length = 0
        bot.say(chatroom, `/me ${message} has been cleared`)
        return
    }

    if (/^delete$|^d$/i.test(args[0])) {
        args.shift()
        const removals = []
        const notFound = []
        for (const element of args) {
            if (obj[name].includes(element)) {
                obj[name].splice(obj[name].indexOf(element), 1)
                removals.push(element)
            } else {
                if (!notFound.includes(element)) { notFound.push(element) }
            }
        }
        bot.say(chatroom, `/me ${message} (${pluralize(obj[name].length, `item`, `items`)}), removed ${removals.length}${removals.length ? `: ${removals.join(` `)}` : ``}${notFound.length ? `, not found: ${notFound.join(` `)}` : ``}`)
        return
    }

    const additions = []
    const alreadyExisted = []
    for (const element of args) {
        if ([`a`, `add`].includes(element.toLowerCase())) { continue }
        if (!obj[name].includes(element)) {
            obj[name].push(element)
            additions.push(element)
        } else {
            if (!alreadyExisted.includes(element)) { alreadyExisted.push(element) }
        }
    }
    bot.say(chatroom, `/me ${message} (${pluralize(obj[name].length, `item`, `items`)}), added ${additions.length}${additions.length ? `: ${additions.join(` `)}` : ``}${alreadyExisted.length ? `, already existed: ${alreadyExisted.join(` `)}` : ``}`)
}

function updatePhraseArr(bot, chatroom, obj, message, name, args) {
    logMessage([`> updatePhraseArr(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])

    if (/^add$|^a$/i.test(args[0])) {
        args.shift()
        if (!args.length) {
            bot.say(chatroom, `/me ${message}: Nothing to add`)
            return
        }
        const phrase = args.join(` `)
        if (obj[name].includes(phrase)) {
            bot.say(chatroom, `/me ${message}: Already contains "${phrase}" (${pluralize(obj[name].length, `phrase exists`, `phrases exist`)})${obj[name].length ? ` - "${obj[name].join(`", "`)}"` : ``}`)
        } else {
            obj[name].push(phrase)
            bot.say(chatroom, `/me ${message}: Added "${phrase}"`)
        }
        return
    }

    if (/^delete$|^d$/i.test(args[0])) {
        args.shift()
        if (!args.length) {
            bot.say(chatroom, `/me ${message}: Nothing to delete`)
            return
        }
        const phrase = args.join(` `)
        const regex = new RegExp(`^${phrase}$`, `i`)
        for (const [i, entry] of obj[name].entries()) {
            if (regex.test(entry)) {
                obj[name].splice(i, 1)
                bot.say(chatroom, `/me ${message}: Removed "${entry}" (${obj[name].length} remaining)${obj[name].length ? ` - "${obj[name].join(`", "`)}"` : ``}`)
                return
            }
        }
        bot.say(chatroom, `/me ${message}: Could not find "${phrase}" (${pluralize(obj[name].length, `phrase exists`, `phrases exist`)})${obj[name].length ? ` - "${obj[name].join(`", "`)}"` : ``}`)
        return
    }

    if (/^clear$|^c$/i.test(args[0])) {
        obj[name].length = 0
        bot.say(chatroom, `/me ${message} has been cleared`)
        return
    }

    bot.say(chatroom, `/me ${message} (${pluralize(obj[name].length, `phrase`, `phrases`)})${obj[name].length ? `: "${obj[name].join(`", "`)}"` : ``} - Use "add (a)" to add one, use "delete (d)" to delete one, or use "clear (c)" to remove all`)
}

function updateStr(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateStr(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])

    if (!args[0]) {
        bot.say(chatroom, `/me ${message} is currently: ${obj[name] || `(not set)`} - change it, or use "clear (c)"`)
        return
    }

    if (/^clear$|^c$/i.test(args[0])) {
        obj[name] = ``
        bot.say(chatroom, `/me ${message} has been cleared`)
        return
    }

    const toUser = getToUser(args[0])
    obj[name] = toUser in users && args.length === 1
        ? toUser
        : args.join(` `)

    bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
}

function updateNum(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateNum(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])

    if (Number(args[0]) >= 1 && Number(args[0]) <= 100) {
        obj[name] = Math.round(Number(args[0]))
        bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
        return
    }

    bot.say(chatroom, `/me ${message} must be between 1-100 (currently: ${obj[name]})`)
}

function updateDuration(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateDuration(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])

    if (Number(args[0]) >= 0 && Number(args[0]) <= 120) {
        obj[name] = Math.round(Number(args[0]))
        bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
        return
    }

    bot.say(chatroom, `/me ${message} must be between 0-120 (currently: ${obj[name]} seconds)`)
}

function updateLargeNum(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateLargeNum(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])

    if (Number(args[0]) >= 1 && Number(args[0]) <= 9999999) {
        obj[name] = Math.round(Number(args[0]))
        bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
        return
    }

    bot.say(chatroom, `/me ${message} must be between 1-9999999 (currently: ${obj[name]})`)
}

function updateContextEmotes(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateContextEmotes(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])
    const channel = chatroom.substring(1)

    const options = {
        [/^lemon(Emotes)?$|^lem$/i]: { name: `lemonEmotes`, func: updateArr },
        [/^neutral(Emotes)?$|^neu$/i]: { name: `neutralEmotes`, func: updateArr },
        [/^hype(Emotes)?$/i]: { name: `hypeEmotes`, func: updateArr },
        [/^positive(Emotes)?$|^pos$/i]: { name: `positiveEmotes`, func: updateArr },
        [/^upset(Emotes)?$|^up$/i]: { name: `upsetEmotes`, func: updateArr },
        [/^negative(Emotes)?$|^neg$/i]: { name: `negativeEmotes`, func: updateArr },
        [/^greeting(Emotes)?$|^greet$/i]: { name: `greetingEmotes`, func: updateArr },
        [/^bye(Emotes)?$/i]: { name: `byeEmotes`, func: updateArr },
        [/^dumb(Emotes)?$|^dumb?$/i]: { name: `dumbEmotes`, func: updateArr },
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            logMessage([`-> Channel "${channel}" option "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            options[regex].func(bot, chatroom, obj.contextEmotes, `${message.replace(/"/g, ``)} "${options[regex].name}"`, options[regex].name, args)
            return
        }
    }

    bot.say(chatroom, `/me ${message} options: lemon (lem), neutral (neu), hype, positive (pos), upset (up), negative (neg), greeting (greet), bye, dumb (dum)`)
}

function deleteUser(bot, chatroom, obj, message, name, args) {
    logMessage([`> deleteUser(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])
    delete users[name]
    bot.say(chatroom, `/me User "${name}" has been deleted`)
}

function updateChannelDev(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateChannel(username, '${username}', channel, '${channel}', args:`, args.join(`, `), `)`])

    const toUser = getToUser(args.shift())
    if (!(toUser in lemonyFresh)) {
        bot.say(chatroom, `/me Please specify a valid channel: ${Object.keys(lemonyFresh).join(`, `)}`)
        return
    }

    const options = {
        [/^timers?$|^t$/i]: { name: `timers`, func: updateTimer },
        [/^rollFunNumber$|^rfn$/i]: { name: `rollFunNumber`, func: updateBool },
        [/^followEmotes?$|^fe$/i]: { name: `followEmotes`, func: updateArr },
        [/^subEmotes?$|^se$/i]: { name: `subEmotes`, func: updateArr },
        [/^bttvEmotes?$|^bttv$/i]: { name: `bttvEmotes`, func: updateArr },
        [/^contextEmotes?$|^ce$/i]: { name: `contextEmotes`, func: updateContextEmotes },
        [/^subRaidMessage$|^srm$/i]: { name: `subRaidMessage`, func: updateStr },
        [/^noSubRaidMessage$|^nsrm$/i]: { name: `noSubRaidMessage`, func: updateStr },
        [/^funnyCommands?$|^fc$/i]: { name: `funnyCommands`, func: updateArr },
        [/^redeems?$|^r$/i]: { name: `redeems`, func: updateArr },
        [/^funTimerGuesser$|^ftg$/i]: { name: `funTimerGuesser`, func: updateStr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            logMessage([`-> Channel ${toUser} option "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            options[regex].func(bot, chatroom, lemonyFresh[toUser], `Channel ${toUser} "${options[regex].name}"`, options[regex].name, args)
            return
        }
    }

    bot.say(chatroom, `/me Options for channel "${toUser}": ${makeList(options)}`)
}

function updateChannel(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateChannel(username, '${username}', channel, '${channel}', args:`, args.join(`, `), `)`])

    const options = {
        [/^timers?$|^t$/i]: { name: `timers`, func: updateTimer },
        [/^rollFunNumber$|^rfn$/i]: { name: `rollFunNumber`, func: updateBool },
        [/^followEmotes?$|^fe$/i]: { name: `followEmotes`, func: updateArr },
        [/^subEmotes?$|^se$/i]: { name: `subEmotes`, func: updateArr },
        [/^bttvEmotes?$|^bttv$/i]: { name: `bttvEmotes`, func: updateArr },
        [/^contextEmotes?$|^ce$/i]: { name: `contextEmotes`, func: updateContextEmotes },
        [/^subRaidMessage$|^srm$/i]: { name: `subRaidMessage`, func: updateStr },
        [/^noSubRaidMessage$|^nsrm$/i]: { name: `noSubRaidMessage`, func: updateStr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            logMessage([`-> Channel "${channel}" option "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            options[regex].func(bot, chatroom, lemonyFresh[channel], `Channel ${channel} "${options[regex].name}"`, options[regex].name, args)
            return
        }
    }

    bot.say(chatroom, `/me Options for channel "${channel}": ${makeList(options)}`)
}

function updateUserDev(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateUserDev(username, '${username}', args:`, args.join(`, `), `)`])

    const toUser = getToUser(args[0])
    if (!(toUser in users)) {
        bot.say(chatroom, `/me Please specify one of ${Object.keys(users).length.toLocaleString(settings.timeLocale)} valid users`)
        return
    }

    const options = {
        [/^displayName$|^dn$/i]: { name: `displayName`, func: updateStr },
        [/^nickname$|^nn$/i]: { name: `nickname`, func: updateStr },
        [/^lemons?$|^l$/i]: { name: `lemons`, func: updateNum },
        [/^hangmanWins?$|^hw$/i]: { name: `hangmanWins`, func: updateNum },
        [/^away$|^a$/i]: { name: `away`, func: updateBool },
        [/^awayMessage$|^am$/i]: { name: `awayMessage`, func: updateStr },
        [/^delete$|^d$/i]: { name: `${toUser}`, func: deleteUser }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[1])) {
            logMessage([`-> Channel ${toUser} option ${args[0]} matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()

            // User away and awayMessage require channel object
            const optCheck = args.shift()

            return /^away$|^a$/i.test(optCheck) || /^awayMessage$|^am$/i.test(optCheck)
                ? channel in users[toUser].channels
                    ? options[regex].func(
                        bot,
                        chatroom,
                        users[toUser].channels[channel],
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

    bot.say(chatroom, `/me Options for user "${toUser}": ${makeList(options)}`)
}

function updateUser(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateUser(username, '${username}', args:`, args.join(`, `), `)`])

    const toUser = getToUser(args[0])
    if (!(toUser in users)) {
        bot.say(chatroom, `/me Please specify one of ${(Object.keys(users).length).toLocaleString(settings.timeLocale)} valid users`)
        return
    }

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
                ? channel in users[toUser].channels
                    ? options[regex].func(
                        bot,
                        chatroom,
                        users[toUser].channels[channel],
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

    bot.say(chatroom, `/me Options for user "${toUser}": ${makeList(options)}`)
}

function updateGlobalEmotes(bot, chatroom, obj, message, name, args) {
    const options = {
        [/^twitch$|^t$/i]: { name: `twitch`, func: updateArr },
        [/^bttv$|^b$/i]: { name: `bttv`, func: updateArr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            logMessage([`-> Setting "${name}" option "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            options[regex].func(bot, chatroom, obj[name], `Setting globalEmotes "${options[regex].name}"`, options[regex].name, args)
            return
        }
    }

    bot.say(chatroom, `/me Options for setting "globalEmotes": ${makeList(options)}`)
}

function updateSettingsDev(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateSettingsDev(username, '${username}', channel, '${channel}', args:`, args.join(`, `), `)`])

    if (/^baseEmotes$|^be$/i.test(args[0])) {
        args.shift()
        return updateBaseEmotesDev(bot, chatroom, args)
    }

    const options = {
        [/^debug$|^d$/i]: { name: `debug`, func: updateBool },
        [/^autoBan$|^ab$/i]: { name: `autoBan`, func: updatePhraseArr },
        [/^playPCG$|^pcg$/i]: { name: `playPCG`, func: updateBool },
        [/^pokeballQuantity$|^pq$/i]: { name: `pokeballQuantity`, func: updateNum },
        [/^usedPokeball$|^up$/i]: { name: `usedPokeball`, func: updateStr },
        [/^lemonLeaderCount$|^llc$/i]: { name: `lemonLeaderCount`, func: updateNum },
        [/^ignoredBots?$|^ib$/i]: { name: `ignoredBots`, func: updateArr },
        [/^timeZone$|^tz$/i]: { name: `timeZone`, func: updateTimeZone },
        // [/^timeLocale$|^tl$/i]: { name: `timeLocale`, func: updateTimeLocale },
        // [/^joinMessage$|^jm$/i]: { name: `joinMessage`, func: updateStr },
        // [/^maxCountdownDuration$|^mcd$/i]: { name: `maxCountdownDuration`, func: updateLargeNum },
        // [/^sayJoinMessage$|^sjm$/i]: { name: `sayJoinMessage`, func: updateBool },
        // [/^sayPartMessage$|^spm$/i]: { name: `sayPartMessage`, func: updateBool },
        // [/^highlightBotMessage$|^hbm$/i]: { name: `highlightBotMessage`, func: updateBool },
        // [/^logTime$|^lt$/i]: { name: `logTime`, func: updateBool },
        // [/^hideNonDevChannel$|^hndc$/i]: { name: `hideNonDevChannel`, func: updateBool },
        [/^funNumberCount$|^fnc$/i]: { name: `funNumberCount`, func: updateNum },
        [/^funNumberTotal$|^fnt$/i]: { name: `funNumberTotal`, func: updateNum },
        [/^streakMinutesThreshold$|^smt$/i]: { name: `streakMinutesThreshold`, func: updateNum },
        [/^streakThreshold$|^st$/i]: { name: `streakThreshold`, func: updateNum },
        [/^streamerEmoteStreakThreshold$|^sest$/i]: { name: `streamerEmoteStreakThreshold`, func: updateNum },
        [/^hangmanSignupSeconds$|^hss$/i]: { name: `hangmanSignupSeconds`, func: updateNum },
        // [/^hangmanChances?$|^hc$/i]: { name: `hangmanChances`, func: updateNum },
        // [/^hangmanLemonThreshold$|^hlt$/i]: { name: `hangmanLemonThreshold`, func: updateNum },
        // [/^chantCount$|^cc$/i]: { name: `chantCount`, func: updateNum },
        [/^chantEmote$|^ce$/i]: { name: `chantEmote`, func: updateStr },
        // [/^realRPS$|^rps$/i]: { name: `realRPS`, func: updateBool },
        [/^globalEmotes$|^ge$/i]: { name: `globalEmotes`, func: updateGlobalEmotes },
        [/^botMood$|^m$/i]: { name: `botMood`, func: updateStr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            logMessage([`-> Setting "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            options[regex].func(bot, chatroom, settings, `Setting "${options[regex].name}"`, options[regex].name, args)
            return
        }
    }

    bot.say(chatroom, `/me Options for "settings": ${makeList(options)}`)
}

function updateSettings(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateSettings(username, '${username}', channel, '${channel}', args:`, args.join(`, `), `)`])

    const options = {
        [/^autoBan$|^ab$/i]: { name: `autoBan`, func: updatePhraseArr },
        [/^ignoredBots?$|^ib$/i]: { name: `ignoredBots`, func: updateArr },
        [/^playPCG$|^pcg$/i]: { name: `playPCG`, func: updateBool },
        [/^pokeballQuantity$|^pq$/i]: { name: `pokeballQuantity`, func: updateNum },
        [/^usedPokeball$|^up$/i]: { name: `usedPokeball`, func: updateStr },
        [/^chantEmote$|^ce$/i]: { name: `chantEmote`, func: updateStr },
        // [/^hangmanChances$|^hc$/i]: { name: `hangmanChances`, func: updateNum }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            logMessage([`-> Setting "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            options[regex].func(bot, chatroom, settings, `Setting "${options[regex].name}"`, options[regex].name, args)
            return
        }
    }

    bot.say(chatroom, `/me Options for "settings": ${makeList(options)}`)
}

function updateBaseEmotesDev(bot, chatroom, args) {
    logMessage([`> updateBaseEmotesDev(args:`, args.join(`, `), `)`])

    const options = {
        [/^lemon$|^lem$/i]: { name: `lemonEmotes`, func: updateArr },
        [/^neutral$|^neu$/i]: { name: `neutralEmotes`, func: updateArr },
        [/^hype$|^h$/i]: { name: `hypeEmotes`, func: updateArr },
        [/^positive$|^p$/i]: { name: `positiveEmotes`, func: updateArr },
        [/^upset$|^up$/i]: { name: `upsetEmotes`, func: updateArr },
        [/^negative$|^neg$/i]: { name: `negativeEmotes`, func: updateArr },
        [/^greeting$|^g$/i]: { name: `greetingEmotes`, func: updateArr },
        [/^bye$|^b$/i]: { name: `byeEmotes`, func: updateArr },
        [/^dumb$|^d$/i]: { name: `dumbEmotes`, func: updateArr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            logMessage([`-> Emotes option "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            options[regex].func(bot, chatroom, settings.baseEmotes, `Setting baseEmotes "${options[regex].name}"`, options[regex].name, args)
            return
        }
    }

    bot.say(chatroom, `/me Options for setting "baseEmotes": ${makeList(options)}`)
}

function updateTimer(bot, chatroom, obj, message, name, args) {
    const channel = chatroom.substring(1)
    logMessage([`> updateTimer(channel, ${channel}, args:`, args.join(`, `), `)`])

    const timer = args.shift()
    if (!(timer in obj[name])) {
        bot.say(chatroom, `/me Please specify a valid timer: ${Object.keys(obj[name]).join(`, `)}`)
        return
    }

    const options = {
        [/^cooldown$|^cd$/i]: { name: `cooldown`, func: updateDuration },
        [/^listening$|^l$/i]: { name: `listening`, func: updateBool }
    }

    const setting = args.shift()
    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(setting)) {
            logMessage([`-> Timer "${timer}" setting "${setting}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            options[regex].func(bot, chatroom, obj[name][timer], `${message.replace(`"timers"`, `timer`)} ${timer} "${options[regex].name}"`, options[regex].name, args)
            return
        }
    }

    bot.say(chatroom, `/me Options for timer "${timer}": ${makeList(options)}`)
}

module.exports = {
    commandLemonInterface(props, splitMessage) {
        const { bot, chatroom, channel, username, isMod, isLemonyFreshMember } = props
        splitMessage.shift()
        const args = splitMessage[0].split(` `)
        logMessage([`> commandLemonInterface(username, '${username}', isMod, ${isMod}, isLemonyFreshMember, ${isLemonyFreshMember}, args:`, args.join(`, `), `)`])

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
                    options[regex](props, args)
                    return
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
                    options[regex](props, args)
                    return
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
                    options[regex](props, args)
                    return
                }
            }
        }

        if (isMod || isLemonyFreshMember) {
            const lemonEmote = getContextEmote(`lemon`, channel)
            bot.say(chatroom, `/me Command Lemon Interface ${lemonEmote} > try: channel (c), user (u), settings (s)`)
        }
    }
}
