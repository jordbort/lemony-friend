const BOT_USERNAME = process.env.BOT_USERNAME
const REDIRECT_URI = process.env.REDIRECT_URI

const { users } = require(`../data`)
const { getContextEmote, logMessage } = require(`../utils`)

module.exports = {
    getDocs(props) {
        const { bot, chatroom } = props
        logMessage([`> getDocs(chatroom: ${chatroom})`])

        bot.say(chatroom, `Check out the docs here: https://github.com/jordbort/lemony-friend/blob/main/README.md`)
    },
    getSubs(props) {
        const { bot, chatroom, channel } = props
        logMessage([`> getSubs(chatroom: ${chatroom})`])

        const subbedChannels = Object.keys(users[BOT_USERNAME].channels).filter(channel => users[BOT_USERNAME].channels[channel].sub)

        const hypeEmote = getContextEmote(`hype`, channel)
        const positiveEmote = getContextEmote(`positive`, channel)
        const neutralEmote = getContextEmote(`neutral`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)

        subbedChannels.length
            ? bot.say(chatroom,
                `I am subbed to: ${subbedChannels.join(`, `)} ${subbedChannels.length < 2
                    ? neutralEmote
                    : subbedChannels.length < 4
                        ? positiveEmote
                        : hypeEmote}`
            )
            : bot.say(chatroom, `I am not subbed to any channels I'm active in ${negativeEmote}`)
    },
    accessInstructions(props) {
        const { bot, chatroom, username } = props
        logMessage([`> accessInstructions(chatroom: '${chatroom}', username: '${username}')`])
        const reply = `For streamers/mods, please follow this link and instructions, and copy/paste "!authorize <code>" in the chat! ${REDIRECT_URI}`
        bot.say(chatroom, reply)
    }
}
