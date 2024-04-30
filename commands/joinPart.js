const { settings } = require(`../config`)
const { lemonyFresh } = require(`../data`)
const { getTwitchUser } = require(`./twitch`)
const { getUsername, getByeEmote, logMessage } = require(`../utils`)

module.exports = {
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

        // lemonyFresh.channels are not allowed to be parted
        const validUsers = args.map(arg => getUsername(arg)).filter(user => user && !lemonyFresh.channels.includes(`#${user}`))
        const needToPart = validUsers.filter(user => bot.channels.includes(`#${user}`))
        const notInChannel = validUsers.filter(user => !bot.channels.includes(`#${user}`))

        const byeEmote = getByeEmote(channel)
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
