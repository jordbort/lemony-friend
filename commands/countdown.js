const { settings } = require(`../config`)
const { lemonyFresh } = require(`../data`)
const { getContextEmote, pluralize, logMessage } = require(`../utils`)

function stopCountdown(bot, chatroom) {
    logMessage([`> stopCountdown(chatroom: '${chatroom}')`])
    const channel = chatroom.substring(1)
    const positiveEmote = getContextEmote(`positive`, chatroom)

    clearTimeout(lemonyFresh[channel].countdown.full)
    clearTimeout(lemonyFresh[channel].countdown.half)
    clearTimeout(lemonyFresh[channel].countdown.lastTen)
    lemonyFresh[channel].countdown.startedAt = 0
    lemonyFresh[channel].countdown.duration = 0
    lemonyFresh[channel].countdown.full = 0
    lemonyFresh[channel].countdown.half = 0
    lemonyFresh[channel].countdown.lastTen = 0

    bot.say(chatroom, `Countdown timer stopped! ${positiveEmote}`)
}

module.exports = {
    countdown(props) {
        const { bot, chatroom, args, channel } = props
        logMessage([`> countdown(channel: '${channel}', args: '${args.join(`', '`)}')`])

        const positiveEmote = getContextEmote(`positive`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)
        const neutralEmote = getContextEmote(`neutral`, channel)
        const dumbEmote = getContextEmote(`dumb`, channel)

        // No args, and countdown timer not running
        if (!args.length && !lemonyFresh[channel].countdown.startedAt) {
            bot.say(chatroom, `There is no countdown timer active, please give me a duration in seconds to start one! ${neutralEmote}`)
            return
        }

        // STOP (if active countdown)
        if (/^stop$/i.test(args[0])) {
            if (!lemonyFresh[channel].countdown.startedAt) {
                bot.say(chatroom, `There is no countdown timer active! ${dumbEmote}`)
                return
            }
            stopCountdown(bot, chatroom)
            return
        }

        // Report remaining duration of active countdown
        if (lemonyFresh[channel].countdown.startedAt) {
            const remainingDuration = Math.round(((lemonyFresh[channel].countdown.startedAt + lemonyFresh[channel].countdown.duration) - Date.now()) / 1000)
            bot.say(chatroom, `Countdown timer is already running, about ${pluralize(remainingDuration, `second remains`, `seconds remain`)}! ${neutralEmote}`)
            return
        }

        // Countdown timer duration validation
        const duration = Number(args[0]) * 1000

        if (duration <= 0 || duration > settings.maxCountdownDuration) {
            bot.say(chatroom, `Countdown timer must be longer than zero seconds, and shorter than ${pluralize(settings.maxCountdownDuration / 1000, `second`, `seconds`)}! ${negativeEmote}`)
            return
        }
        if (!duration) {
            bot.say(chatroom, `Invalid countdown timer duration! ${negativeEmote}`)
            return
        }

        // Start countdown timer (say last ten seconds if > 10 seconds, say halfway point if >= 30 seconds)
        lemonyFresh[channel].countdown.startedAt = Date.now()
        lemonyFresh[channel].countdown.duration = duration
        bot.say(chatroom, `Starting ${duration / 1000}-second countdown timer! ${positiveEmote}`)

        lemonyFresh[channel].countdown.full = Number(setTimeout(() => {
            lemonyFresh[channel].countdown.startedAt = 0
            lemonyFresh[channel].countdown.duration = 0
            lemonyFresh[channel].countdown.full = 0
            lemonyFresh[channel].countdown.half = 0
            lemonyFresh[channel].countdown.lastTen = 0
            const hypeEmote = getContextEmote(`hype`, channel)
            bot.say(chatroom, `Countdown finished! ${hypeEmote}`)
        }, duration))

        if (duration > 10000) {
            lemonyFresh[channel].countdown.lastTen = Number(setTimeout(() => {
                bot.say(chatroom, `10 seconds remaining!`)
            }, duration - 10000))
        }

        if (duration >= 30000) {
            lemonyFresh[channel].countdown.half = Number(setTimeout(() => {
                bot.say(chatroom, `${duration / 2000} seconds remaining!`)
            }, duration / 2))
        }
    }
}
