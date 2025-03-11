const BOT_USERNAME = process.env.BOT_USERNAME

const { settings } = require(`../config`)
const { getTwitchUser } = require(`./twitch`)
const { lemonyFresh, users, lemCmds } = require(`../data`)
const { getUsername, getContextEmote, logMessage, pluralize, numbers } = require(`../utils`)

module.exports = {
    sayJoinMessage(bot, chatroom) {
        logMessage([`> sayJoinMessage(chatroom: '${chatroom}'${settings.joinMessage ? `, '${settings.joinMessage}'` : ``})`])

        const channel = chatroom.substring(1)
        const lemonEmote = getContextEmote(`lemon`, channel)
        const neutralEmote = getContextEmote(`neutral`, channel)
        const positiveEmote = getContextEmote(`positive`, channel)
        const hypeEmote = getContextEmote(`hype`, channel)
        const greetingEmote = getContextEmote(`greeting`, channel)
        const dumbEmote = getContextEmote(`dumb`, channel)
        const numUsers = Object.keys(users).length
        const numLemCmds = Object.keys(lemCmds).length
        const randNum = Math.floor(Math.random() * numbers.length)

        const joinMessages = [
            `Let's see how long before I crash ${dumbEmote}`,
            `* ${BOT_USERNAME.substring(0, 1).toUpperCase() + BOT_USERNAME.substring(1)} blocks the way! ${positiveEmote}`,
            `Hi ${channel}, I'm ${BOT_USERNAME}! ${greetingEmote} ${lemonEmote}`,
            `(Windows XP startup sound plays)`,
            `I'm onl`,
            `I have ${numUsers <= 999
                ? `${numbers[numUsers]} (${numUsers}) friend${numUsers === 1 ? `` : `s`}`
                : pluralize(numUsers, `friend`, `friends`)}! ${numUsers === 0
                    ? dumbEmote
                    : numUsers < 25
                        ? neutralEmote
                        : numUsers < 50
                            ? positiveEmote
                            : hypeEmote}`,
            `There ${numLemCmds === 1 ? `is` : `are`} ${pluralize(numLemCmds, `lemon command`, `lemon commands`)}! ${numLemCmds === 0
                ? dumbEmote
                : numLemCmds < 3
                    ? neutralEmote
                    : numLemCmds < 5
                        ? positiveEmote
                        : hypeEmote}`,
            `Let's play Hangman! ${positiveEmote}`,
            `I know ${pluralize(lemonyFresh[channel].emotes.length, `emote`, `emotes`)} in ${channel}'s channel! ${neutralEmote}`,
            `It has been ${Date.now().toLocaleString(`en-US`)} milliseconds since January 1, 1970, 12:00:00 AM UTC ${lemonEmote}`,
            `${BOT_USERNAME} has entered the chat ${lemonEmote}`,
            `${BOT_USERNAME in users
                ? `I have ${pluralize(users[BOT_USERNAME].lemons, `lemon`, `lemons`)}! ${lemonEmote}`
                : `Imagine having ${pluralize(randNum, `lemon`, `lemons`)}... Heck, imagine having ${numbers[randNum + 1] || `one thousand`} lemons... ${lemonEmote}`}`
        ]
        const joinMessage = joinMessages[Math.floor(Math.random() * joinMessages.length)]

        bot.say(channel, settings.joinMessage || joinMessage)
    },
    async handleJoin(props) {
        const { bot, chatroom, args, channel } = props
        logMessage([`> handleJoin(chatroom: ${chatroom}, args:`, args, `)`])

        const validUsers = args.map(arg => getUsername(arg)).filter(user => user)
        const alreadyJoined = validUsers.filter(channel => bot.channels.includes(`#${channel}`))
        const notYetJoined = validUsers.filter(channel => !bot.channels.includes(`#${channel}`))

        // Verify channels exist before attempting to join
        const successfullyJoined = []
        for (const channel of notYetJoined) {
            props.username = channel
            const twitchUser = await getTwitchUser(props)
            if (!twitchUser?.id) {
                logMessage([`-> Error: '${channel}' does not have a user ID`])
            } else {
                successfullyJoined.push(channel)
                lemonyFresh[channel] = { ...lemonyFresh[channel], id: Number(twitchUser.id) }
                bot.join(channel)
            }
        }

        successfullyJoined.length
            ? alreadyJoined.length
                ? bot.say(channel, `Joined channel${successfullyJoined.length === 1 ? `` : `s`}: ${successfullyJoined.join(`, `)} - Already joined: ${alreadyJoined.join(`, `)}`)
                : bot.say(channel, `Joined channel${successfullyJoined.length === 1 ? `` : `s`}: ${successfullyJoined.join(`, `)}`)
            : bot.say(channel, `All active users: ${bot.channels.map(channel => channel.substring(1)).join(`, `)}`)
    },
    handlePart(props) {
        const { bot, chatroom, args, channel } = props
        logMessage([`> handlePart(chatroom: ${chatroom}, args:`, args, `)`])

        const validUsers = args.map(arg => getUsername(arg)).filter(user => user)
        const needToPart = validUsers.filter(user => bot.channels.includes(`#${user}`))
        const notInChannel = validUsers.filter(user => !bot.channels.includes(`#${user}`))

        const byeEmote = getContextEmote(`bye`, channel)
        needToPart.forEach(user => {
            if (settings.sayPartMessage) { bot.say(`#${user}`, `Bye for now! ${byeEmote}`) }
            bot.part(`#${user}`)
        })
        needToPart.length
            ? notInChannel.length
                ? bot.say(channel, `Parted from channel${needToPart.length === 1 ? `` : `s`}: ${needToPart.join(`, `)} - Not already in: ${notInChannel.join(`, `)}`)
                : bot.say(channel, `Parted from channel${needToPart.length === 1 ? `` : `s`}: ${needToPart.join(`, `)}`)
            : bot.say(chatroom, `All active users: ${bot.channels.map(channel => channel.substring(1)).join(`, `)}`)
    }
}
