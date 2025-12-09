const BOT_USERNAME = process.env.BOT_USERNAME

const { settings } = require(`../config`)
const { lemonyFresh, users, lemCmds } = require(`../data`)
const numbers = require(`../numbers`)

const { apiGetTwitchUser, deleteEventSubs } = require(`./twitch`)
const { getUsername, getContextEmote, logMessage, pluralize, arrToList } = require(`../utils`)

module.exports = {
    sayJoinMessage(bot, chatroom) {
        logMessage([`> sayJoinMessage(chatroom: '${chatroom}'${settings.joinMessage ? `, '${settings.joinMessage}'` : ``})`])
        if (settings.joinMessage) {
            bot.say(chatroom, settings.joinMessage)
        } else {
            const channel = chatroom.substring(1)
            const lemonEmote = getContextEmote(`lemon`, channel)
            const neutralEmote = getContextEmote(`neutral`, channel)
            const positiveEmote = getContextEmote(`positive`, channel)
            const hypeEmote = getContextEmote(`hype`, channel)
            const greetingEmote = getContextEmote(`greeting`, channel)
            const dumbEmote = getContextEmote(`dumb`, channel)
            const numUsers = Object.keys(users).length
            const numLemCmds = Object.keys(lemCmds).length
            const maxUses = Math.max(...Object.keys(lemCmds).map(cmd => lemCmds[cmd].uses))
            const mostUsedLemcmd = Object.keys(lemCmds).filter(cmd => lemCmds[cmd].uses === maxUses)
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
                    : numLemCmds < 10
                        ? neutralEmote
                        : numLemCmds < 100
                            ? positiveEmote
                            : hypeEmote}`,
                `Let's play Hangman! ${positiveEmote}`,
                `I know ${pluralize(lemonyFresh[channel].emotes.length, `emote`, `emotes`)} in ${channel}'s channel! ${neutralEmote}`,
                `It has been ${Date.now().toLocaleString(`en-US`)} milliseconds since January 1, 1970, 12:00:00 AM UTC ${lemonEmote}`,
                `${BOT_USERNAME} has entered the chat ${lemonEmote}`,
                `${BOT_USERNAME in users
                    ? `I have ${pluralize(users[BOT_USERNAME].lemons, `lemon`, `lemons`)}! ${lemonEmote}`
                    : `Imagine having ${pluralize(randNum, `lemon`, `lemons`)}... Heck, imagine having ${numbers[randNum + 1] || `one thousand`} lemons... ${lemonEmote}`}`,
                Object.keys(lemCmds).length === 0 || maxUses === 0
                    ? `No lemon commands have been used! ${dumbEmote}`
                    : `Most-used lemon command${mostUsedLemcmd.length === 1 ? `` : `s`} ${arrToList(mostUsedLemcmd)} ${mostUsedLemcmd.length === 1 ? `has` : `have`} been used ${pluralize(maxUses, `time`, `times`)}! ${maxUses < 50
                        ? neutralEmote
                        : maxUses < 100
                            ? positiveEmote
                            : hypeEmote}`
            ]

            const joinMessage = joinMessages[Math.floor(Math.random() * joinMessages.length)]
            bot.say(chatroom, joinMessage)
        }
    },
    async handleJoin(props) {
        const { bot, chatroom, args } = props
        await logMessage([`> handleJoin(chatroom: ${chatroom}, args: '${args.join(`', '`)}')`])

        const validUsers = args.map(arg => getUsername(arg)).filter(user => user)
        const alreadyJoined = validUsers.filter(channel => bot.channels.includes(`#${channel}`))
        const notYetJoined = validUsers.filter(channel => !bot.channels.includes(`#${channel}`))

        // Verify channels exist before attempting to join
        const successfullyJoined = []
        for (const channel of notYetJoined) {
            const twitchUser = await apiGetTwitchUser(channel)
            if (!twitchUser.id) {
                bot.say(chatroom, `Error: User "${channel}" not found! :O`)
            } else {
                successfullyJoined.push(channel)
                lemonyFresh[channel] = { ...lemonyFresh[channel], id: Number(twitchUser.id) }
                bot.join(channel)
            }
        }

        const reply = successfullyJoined.length
            ? alreadyJoined.length
                ? `Joined ${pluralize(successfullyJoined.length, `channel`, `channels`)}: ${successfullyJoined.join(`, `)} - Already joined: ${alreadyJoined.join(`, `)}`
                : `Joined ${pluralize(successfullyJoined.length, `channel`, `channels`)}: ${successfullyJoined.join(`, `)}`
            : `Active in ${pluralize(bot.channels.length, `channel`, `channels`)}: ${bot.channels.map(channel => channel.substring(1)).join(`, `)}`
        bot.say(chatroom, reply)
    },
    handlePart(props) {
        const { bot, chatroom, args, channel } = props
        logMessage([`> handlePart(chatroom: ${chatroom}, args: '${args.join(`', '`)}')`])

        const validUsers = args.map(arg => getUsername(arg)).filter(user => user)
        const needToPart = validUsers.filter(user => bot.channels.includes(`#${user}`))
        const notInChannel = validUsers.filter(user => !bot.channels.includes(`#${user}`))

        const byeEmote = getContextEmote(`bye`, channel)
        needToPart.forEach(async streamer => {
            if (settings.sayPartMessage) { bot.say(`#${streamer}`, `Bye for now! ${byeEmote}`) }
            await deleteEventSubs(streamer)
            bot.part(`#${streamer}`)
        })

        const reply = needToPart.length
            ? notInChannel.length
                ? `Parted from channel${needToPart.length === 1 ? `` : `s`}: ${needToPart.join(`, `)} - Not already in: ${notInChannel.join(`, `)}`
                : `Parted from channel${needToPart.length === 1 ? `` : `s`}: ${needToPart.join(`, `)}`
            : `All active users: ${bot.channels.map(channel => channel.substring(1)).join(`, `)}`
        bot.say(chatroom, reply)
    }
}
