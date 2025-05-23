const { lemonyFresh } = require(`../data`)
const { getContextEmote, logMessage, resetCooldownTimer } = require(`../utils`)

module.exports = {
    useCount(props) {
        const { bot, chatroom, args, channel } = props
        logMessage([`> useCount(channel: '${channel}', count.name: '${lemonyFresh[channel].count.name}', count.value: ${lemonyFresh[channel].count.value}, args:`, `'${args.join(`', '`)}')`])

        if (lemonyFresh[channel].timers[`!count`].listening) {
            resetCooldownTimer(channel, `!count`)

            const negativeEmote = getContextEmote(`negative`, channel)
            const neutralEmote = getContextEmote(`neutral`, channel)
            const positiveEmote = getContextEmote(`positive`, channel)

            const counter = lemonyFresh[channel].count.name
            const count = lemonyFresh[channel].count.value

            // SET the count
            if (/^set$/i.test(args[0])) {
                const num = Number(args[1])

                if (isNaN(num)) {
                    bot.say(chatroom, `${counter ? counter.substring(0, 1).toUpperCase() + counter.substring(1) : `The counter`} cannot be set to "${num}"! ${negativeEmote}`)
                    return
                }
                lemonyFresh[channel].count.value = num

                bot.say(chatroom, `${counter ? counter.substring(0, 1).toUpperCase() + counter.substring(1) : `The counter`} has been set to: ${lemonyFresh[channel].count.value} ${positiveEmote}`)
                return
            }

            // NAME the count
            if (/^(re)?name$/i.test(args[0])) {
                args.shift()
                lemonyFresh[channel].count.name = args.length
                    ? args.join(` `)
                    : ""

                bot.say(chatroom, `The counter ${lemonyFresh[channel].count.name
                    ? `has been renamed "${lemonyFresh[channel].count.name}"!`
                    : `name has been reset!`} ${positiveEmote}`)
                return
            }

            // RESET the count
            if (/^reset$/i.test(args[0])) {
                lemonyFresh[channel].count.value = 0
                lemonyFresh[channel].count.name = ""

                bot.say(chatroom, `The counter has been reset to zero! ${positiveEmote}`)
                return
            }

            // REPORT the count
            if (!!!args[0]) {
                bot.say(chatroom, `Current ${counter || `count`} is: ${count} ${neutralEmote}`)
                return
            }

            // ADD to the count
            const num = args[0] === `+`
                ? 1
                : args[0] === `-`
                    ? -1
                    : Number(args[0])

            if (isNaN(num)) {
                bot.say(chatroom, `"${args.join(` `)}" cannot be added to ${counter || `the count`}! ${negativeEmote}`)
                return
            }

            lemonyFresh[channel].count.value += num

            bot.say(chatroom, `${Math.abs(num)} has been ${num < 0 ? `subtracted from` : `added to`} ${counter || `the count`}! ${positiveEmote} New value is: ${lemonyFresh[channel].count.value} `)
        }
    }
}
