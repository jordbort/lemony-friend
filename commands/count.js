const { lemonyFresh } = require(`../data`)
const { getNeutralEmote, getPositiveEmote, getNegativeEmote, logMessage, resetCooldownTimer } = require(`../utils`)

module.exports = {
    useCount(props) {
        const { bot, chatroom, args, channel, } = props
        logMessage([`> useCount(channel: '${channel}', count.name: '${lemonyFresh[channel].count.name}', count.value: ${lemonyFresh[channel].count.value}, args:`, `'${args.join(`', '`)}')`])

        if (lemonyFresh[channel].timers[`!count`].listening) {
            resetCooldownTimer(channel, `!count`)

            const negativeEmote = getNegativeEmote(channel)
            const neutralEmote = getNeutralEmote(channel)
            const positiveEmote = getPositiveEmote(channel)

            const counter = lemonyFresh[channel].count.name
            const count = lemonyFresh[channel].count.value

            // SET the count
            if (/^set$/i.test(args[0])) {
                const num = Number(args[1])

                if (isNaN(num)) { return bot.say(chatroom, `${counter ? counter.substring(0, 1).toUpperCase() + counter.substring(1) : `The counter`} cannot be set to "${num}"! ${negativeEmote}`) }
                lemonyFresh[channel].count.value = num

                return bot.say(chatroom, `${counter ? counter.substring(0, 1).toUpperCase() + counter.substring(1) : `The counter`} has been set to: ${lemonyFresh[channel].count.value}`)
            }

            // NAME the count
            if (/^(re)?name$/i.test(args[0])) {
                lemonyFresh[channel].count.name = args[1] || ""

                return bot.say(chatroom, `The counter ${lemonyFresh[channel].count.name
                    ? `has been renamed "${lemonyFresh[channel].count.name}"!`
                    : `name has been reset!`} ${positiveEmote}`)
            }

            // RESET the count
            if (/^reset$/i.test(args[0])) {
                lemonyFresh[channel].count.value = 0
                lemonyFresh[channel].count.name = ""

                return bot.say(chatroom, `The counter has been reset to zero! ${positiveEmote}`)
            }

            // REPORT the count
            if (!!!args[0]) { return bot.say(chatroom, `Current ${counter || `count`} is: ${count} ${neutralEmote}`) }

            // ADD to the count
            const num = args[0] === `+`
                ? 1
                : args[0] === `-`
                    ? -1
                    : Number(args[0])

            if (isNaN(num)) { return bot.say(chatroom, `"${args.join(` `)}" cannot be added to ${counter || `the count`}! ${negativeEmote}`) }

            lemonyFresh[channel].count.value += num

            bot.say(chatroom, `${num} has been ${num < 0 ? `subtracted from` : `added to`} ${counter || `the count`}! ${positiveEmote} New value is: ${lemonyFresh[channel].count.value} `)
        }
    }
}
