const BOT_USERNAME = process.env.BOT_USERNAME

const { users } = require(`../data`)
const { getContextEmote, logMessage, renderObj } = require(`../utils`)

function renderData(obj, objName) {
    const data = [`${objName ? `${objName}: ` : ``}{`]
    if (Object.keys(obj).length) {
        const keys = Object.keys(obj).map((key) => typeof obj[key] === `string`
            ? `${key}: '${obj[key]}'`
            : typeof obj[key] === `object`
                ? obj[key] === null
                    ? `${key}: ${obj[key]}`
                    : `${key}: ${renderData(obj[key], ``)}`
                : `${key}: ${obj[key]}`)
            .join(`, `)
        data.push(keys)
        data.push(`}`)
    } else { data[0] += `}` }
    return data.join(``)
}

module.exports = {
    getDocs(props) {
        const { bot, chatroom } = props
        logMessage([`> getDocs(chatroom: ${chatroom})`])

        bot.say(chatroom, `Check out the docs here: https://github.com/jordbort/lemony-friend/blob/main/README.md`)
    },
    getStats(props) {
        const { bot, chatroom, username, user, toUser, target } = props
        logMessage([`> getStats(chatroom: "${chatroom}", user: "${toUser || username}")`])
        if (toUser && !(toUser in users)) {
            logMessage([`-> "${toUser}" isn't a known user!`])
            return
        }

        const stats = target || user
        logMessage([renderObj(stats, toUser || username)])

        const data = renderData(stats, toUser || username)
        bot.say(chatroom, data)
    },
    getSubs(props) {
        const { bot, chatroom, channel } = props
        logMessage([`> getSubs(chatroom: ${chatroom})`])

        const subbedChannels = Object.keys(users[BOT_USERNAME]).filter(channel => typeof users[BOT_USERNAME][channel] === `object` && users[BOT_USERNAME][channel].sub)

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
    }
}
