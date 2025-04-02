const DEV = process.env.DEV
const { settings } = require(`../config`)
const { lemonyFresh, users } = require(`../data`)
const { validTimeZones, validLocales } = require(`../commands/time`)
const { getContextEmote, getToUser, pluralize, logMessage } = require(`../utils`)

function updateTimeZone(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateTimeZone(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])
    const input = args.join(` `)

    for (const timeZone of Object.keys(validTimeZones)) {
        const regex = new RegExp(timeZone.split(`/`).slice(1, timeZone.split(`/`).length - 1).join(`/`), timeZone.split(`/`)[timeZone.split(`/`).length - 1])
        if (regex.test(input)) {
            obj[name] = validTimeZones[regex]
            return bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
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
            return bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
        }
    }

    bot.say(chatroom, `/me ${message} must be a valid time locale (currently: ${obj[name]})`)
}

function updateBool(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateBool(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])

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
    logMessage([`> updateArr(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])

    if (!args.length) { return bot.say(chatroom, `/me ${message} (${pluralize(obj[name].length, `item`, `items`)}): ${obj[name].join(` `)} - Add more, "delete (d)" some, or "clear (c)" all`) }

    if (/^clear$|^c$/i.test(args[0])) {
        obj[name].length = 0
        return bot.say(chatroom, `/me ${message} has been cleared`)
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
        return bot.say(chatroom, `/me ${message} (${pluralize(obj[name].length, `item`, `items`)}), removed ${removals.length}${removals.length ? `: ${removals.join(` `)}` : ``}${notFound.length ? `, not found: ${notFound.join(` `)}` : ``}`)
    }

    const additions = []
    const alreadyExisted = []
    for (const element of args) {
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
    logMessage([`> updateStr(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])

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
    logMessage([`> updateNum(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])

    if (Number(args[0]) >= 1 && Number(args[0]) <= 100) {
        obj[name] = Math.round(Number(args[0]))
        return bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
    }

    bot.say(chatroom, `/me ${message} must be between 1-100 (currently: ${obj[name]})`)
}

function updateDuration(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateDuration(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])

    if (Number(args[0]) >= 0 && Number(args[0]) <= 120) {
        obj[name] = Math.round(Number(args[0]))
        return bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
    }

    bot.say(chatroom, `/me ${message} must be between 0-120 (currently: ${obj[name]} seconds)`)
}

function updateLargeNum(bot, chatroom, obj, message, name, args) {
    logMessage([`> updateLargeNum(chatroom: '${chatroom}', name: '${name}', args:`, args.join(`, `), `)`])

    if (Number(args[0]) >= 1 && Number(args[0]) <= 9999999) {
        obj[name] = Math.round(Number(args[0]))
        return bot.say(chatroom, `/me ${message} set to: ${obj[name]}`)
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
        [/^bttvLemon(Emotes)?$|^bttvLem$/i]: { name: `bttvLemonEmotes`, func: updateArr },
        [/^bttvNeutral(Emotes)?$|^bttvNeu$/i]: { name: `bttvNeutralEmotes`, func: updateArr },
        [/^bttvHype(Emotes)?$/i]: { name: `bttvHypeEmotes`, func: updateArr },
        [/^bttvPositive(Emotes)?$|^bttvPos$/i]: { name: `bttvPositiveEmotes`, func: updateArr },
        [/^bttvUpset(Emotes)?$|^bttvUp$/i]: { name: `bttvUpsetEmotes`, func: updateArr },
        [/^bttvNegative(Emotes)?$|^bttvNeg$/i]: { name: `bttvNegativeEmotes`, func: updateArr },
        [/^bttvGreeting(Emotes)?$|^bttvGreet$/i]: { name: `bttvGreetingEmotes`, func: updateArr },
        [/^bttvBye(Emotes)?$/i]: { name: `bttvByeEmotes`, func: updateArr },
        [/^bttvDumb(Emotes)?$|^bttvDumb?$/i]: { name: `bttvDumbEmotes`, func: updateArr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            logMessage([`-> Channel "${channel}" option "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            return options[regex].func(bot, chatroom, obj.contextEmotes, `${message.replace(`"`, ``)} "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me ${message} options: lemon (lem), neutral (neu), hype, positive (pos), upset (up), negative (neg), greeting (greet), bye, dumb (dum), bttvLemon (bttvLem), bttvNeutral (bttvNeu), bttvHype, bttvPositive (bttvPos), bttvUpset (bttvUp), bttvNegative (bttvNeg), bttvGreeting (bttvGreet), bttvBye, bttvDumb (bttvDum)`)
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
    if (!(toUser in lemonyFresh)) { return bot.say(chatroom, `/me Please specify a valid channel: ${Object.keys(lemonyFresh).join(`, `)}`) }

    const options = {
        [/^timers?$|^t$/i]: { name: `timers`, func: updateTimer },
        [/^rollFunNumber$|^rfn$/i]: { name: `rollFunNumber`, func: updateBool },
        [/^emotes?$|^e$/i]: { name: `emotes`, func: updateArr },
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
            return options[regex].func(bot, chatroom, lemonyFresh[toUser], `Channel ${toUser} "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for channel "${toUser}": timers (t), rollFunNumber (rfn), emotes (e), bttvEmotes (bttv), contextEmotes (ce), subRaidMessage (srm), noSubRaidMessage (nsrm), funnyCommands (fc), redeems (r), funTimerGuesser (ftg)`)
}

function updateChannel(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateChannel(username, '${username}', channel, '${channel}', args:`, args.join(`, `), `)`])

    const options = {
        [/^timers?$|^t$/i]: { name: `timers`, func: updateTimer },
        [/^rollFunNumber$|^rfn$/i]: { name: `rollFunNumber`, func: updateBool },
        [/^emotes?$|^e$/i]: { name: `emotes`, func: updateArr },
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
            return options[regex].func(bot, chatroom, lemonyFresh[channel], `Channel ${channel} "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for channel "${channel}": timers (t), rollFunNumber (rfn), emotes (e), bttvEmotes (bttv), subRaidMessage (srm), noSubRaidMessage (nsrm)`)
}

function updateUserDev(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateUserDev(username, '${username}', args:`, args.join(`, `), `)`])

    const toUser = getToUser(args[0])
    if (!(toUser in users)) { return bot.say(chatroom, `/me Please specify one of ${(Object.keys(users).length).toLocaleString(settings.timeLocale)} valid users`) }

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

    bot.say(chatroom, `/me Options for user "${toUser}": displayName (dn), nickname (nn), lemons (l), hangmanWins (hw), away (a), awayMessage (am), delete (d)`)
}

function updateUser(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateUser(username, '${username}', args:`, args.join(`, `), `)`])

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
    logMessage([`> updateSettingsDev(username, '${username}', channel, '${channel}', args:`, args.join(`, `), `)`])

    if (/^baseEmotes$|^be$/i.test(args[0])) {
        args.shift()
        return updateBaseEmotesDev(bot, chatroom, args)
    }

    const options = {
        [/^debug$|^d$/i]: { name: `debug`, func: updateBool },
        [/^autoBan$|^ab$/i]: { name: `autoBan`, func: updatePhraseArr },
        [/^ignoredBots$|^ib$/i]: { name: `ignoredBots`, func: updateArr },
        [/^playPCG$|^pcg$/i]: { name: `playPCG`, func: updateBool },
        [/^pokeballQuantity$|^pq$/i]: { name: `pokeballQuantity`, func: updateNum },
        [/^usedPokeball$|^up$/i]: { name: `usedPokeball`, func: updateStr },
        [/^maxCountdownDuration$|^mcd$/i]: { name: `maxCountdownDuration`, func: updateLargeNum },
        [/^timeZone$|^tz$/i]: { name: `timeZone`, func: updateTimeZone },
        // [/^timeLocale$|^tl$/i]: { name: `timeLocale`, func: updateTimeLocale },
        // [/^joinMessage$|^jm$/i]: { name: `joinMessage`, func: updateStr },
        // [/^highlightBotMessage$|^hbm$/i]: { name: `highlightBotMessage`, func: updateBool },
        // [/^logTime$|^lt$/i]: { name: `logTime`, func: updateBool },
        // [/^hideNonDevChannel$|^hndc$/i]: { name: `hideNonDevChannel`, func: updateBool },
        // [/^sayJoinMessage$|^sjm$/i]: { name: `sayJoinMessage`, func: updateBool },
        // [/^sayPartMessage$|^spm$/i]: { name: `sayPartMessage`, func: updateBool },
        [/^realRPS$|^rps$/i]: { name: `realRPS`, func: updateBool },
        [/^funNumberCount$|^fnc$/i]: { name: `funNumberCount`, func: updateNum },
        [/^funNumberTotal$|^fnt$/i]: { name: `funNumberTotal`, func: updateNum },
        [/^streakThreshold$|^st$/i]: { name: `streakThreshold`, func: updateNum },
        [/^streamerEmoteStreakThreshold$|^sest$/i]: { name: `streamerEmoteStreakThreshold`, func: updateNum },
        // [/^hangmanSignupSeconds$|^hss$/i]: { name: `hangmanSignupSeconds`, func: updateNum },
        // [/^hangmanChances$|^hc$/i]: { name: `hangmanChances`, func: updateNum },
        // [/^hangmanLemonThreshold$|^hlt$/i]: { name: `hangmanLemonThreshold`, func: updateNum },
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

    bot.say(chatroom, `/me Options for "settings": debug (d), autoBan (ab), ignoredBots (ib), playPCG (pcg), pokeballQuantity (pq), usedPokeball (up), maxCountdownDuration (mcd), timeZone (tz), realRPS (rps), funNumberCount (fnc), funNumberTotal (fnt), streakThreshold (st), streamerEmoteStreakThreshold (sest), chantCount (cc), chantEmote (ce), baseEmotes (be), botMood (m)`)
}

function updateSettings(props, args) {
    const { bot, chatroom, channel, username } = props
    args.shift()
    logMessage([`> updateSettings(username, '${username}', channel, '${channel}', args:`, args.join(`, `), `)`])

    const options = {
        [/^autoBan$|^ab$/i]: { name: `autoBan`, func: updatePhraseArr },
        [/^ignoredBots$|^ib$/i]: { name: `ignoredBots`, func: updateArr },
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
            return options[regex].func(bot, chatroom, settings, `Setting "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for "settings": autoBan (ab), ignoredBots (ib), playPCG (pcg), pokeballQuantity (pq), usedPokeball (up), chantEmote (ce)`)
}

function updateBaseEmotesDev(bot, chatroom, args) {
    logMessage([`> updateBaseEmotesDev(args:`, args.join(`, `), `)`])

    const options = {
        [/^lemon(Emotes)?$|^lem$/i]: { name: `lemonEmotes`, func: updateArr },
        [/^neutral(Emotes)?$|^neu$/i]: { name: `neutralEmotes`, func: updateArr },
        [/^hype(Emotes)?$/i]: { name: `hypeEmotes`, func: updateArr },
        [/^positive(Emotes)?$|^pos$/i]: { name: `positiveEmotes`, func: updateArr },
        [/^upset(Emotes)?$|^up$/i]: { name: `upsetEmotes`, func: updateArr },
        [/^negative(Emotes)?$|^neg$/i]: { name: `negativeEmotes`, func: updateArr },
        [/^greeting(Emotes)?$|^greet$/i]: { name: `greetingEmotes`, func: updateArr },
        [/^bye(Emotes)?$/i]: { name: `byeEmotes`, func: updateArr },
        [/^dumb(Emotes)?$|^dumb?$/i]: { name: `dumbEmotes`, func: updateArr }
    }

    for (const option in options) {
        const regex = new RegExp(option.split(`/`)[1], option.split(`/`)[2])
        if (regex.test(args[0])) {
            logMessage([`-> Emotes option "${args[0]}" matched:`, regex, `[Function: ${options[regex].func.name}]`])
            args.shift()
            return options[regex].func(bot, chatroom, settings.baseEmotes, `Setting baseEmotes "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for setting "baseEmotes": lemon (lem), neutral (neu), hype, positive (pos), upset (up), negative (neg), greeting (greet), bye, dumb (dum)`)
}

function updateTimer(bot, chatroom, obj, message, name, args) {
    const channel = chatroom.substring(1)
    logMessage([`> updateTimer(channel, ${channel}, args:`, args.join(`, `), `)`])

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
            return options[regex].func(bot, chatroom, obj[name][timer], `${message.replace(`"timers"`, `timer`)} ${timer} "${options[regex].name}"`, options[regex].name, args)
        }
    }

    bot.say(chatroom, `/me Options for timer "${timer}": cooldown (cd), listening (l)`)
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
            const lemonEmote = getContextEmote(`lemon`, channel)
            bot.say(chatroom, `/me Command Lemon Interface ${lemonEmote} > try: channel (c), user (u), settings (s)`)
        }
    }
}
