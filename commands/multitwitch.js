const { twitchUsernamePattern, logMessage, getContextEmote } = require(`../utils`)

module.exports = {
    makeMultiTwitchLink(props) {
        const { bot, chatroom, args } = props
        logMessage([`> makeMultiTwitchLink(args: '${args.join(`', '`)}')`])

        const channel = chatroom.substring(1)
        const negativeEmote = getContextEmote(`negative`, channel)
        const neutralEmote = getContextEmote(`neutral`, channel)
        const dumbEmote = getContextEmote(`dumb`, channel)

        if (args.length < 2) {
            bot.say(chatroom, `Please provide at least two usernames! ${neutralEmote}`)
            return
        }

        const usernames = args
            .map(arg => arg.replace(/^[@#]/g, ``).toLowerCase())
            .filter(arg => twitchUsernamePattern.test(arg))
            .join(`/`)

        // Check how many valid usernames remain after filtering
        if (usernames.split(`/`).length < 2) {
            bot.say(chatroom, `Not enough valid usernames were found! ${dumbEmote}`)
            return
        }

        // Check if URL exceeds 500-character limit
        if (usernames.length > 475) {
            bot.say(chatroom, `Too many usernames provided! ${negativeEmote}`)
            return
        }

        const url = `https://multitwitch.live/${usernames}`
        bot.say(chatroom, url)
    }
}
