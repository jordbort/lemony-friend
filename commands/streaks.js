const BOT_USERNAME = process.env.BOT_USERNAME

const { users, lemonyFresh } = require(`../data`)
const { pluralize, resetCooldownTimer, logMessage, containsInaccessibleEmotes, containsUnrecognizedEmotes } = require(`../utils`)

function checkStreak(bot, chatroom, message) {
    const channel = chatroom.substring(1)

    const streakUsers = []
    for (const username in users) {
        if (username !== BOT_USERNAME && users[username].channels[channel]?.lastMessage === message) {
            streakUsers.push(users[username].displayName)
            if (streakUsers.length >= 2) { logMessage([`> checkStreak("${message}")`, streakUsers.length, `/ ${lemonyFresh[channel].streakThreshold} - ${streakUsers.join(`, `)}`]) }
        }
        if (streakUsers.length >= lemonyFresh[channel].streakThreshold) {
            if (containsInaccessibleEmotes(message)) {
                logMessage([`-> Not participating in streak because it contains inaccessible emotes`])
                return
            }
            if (containsUnrecognizedEmotes(message)) {
                logMessage([`-> Not participating in streak because it may contain unrecognized emotes`])
                return
            }
            resetCooldownTimer(channel, `streak`)
            setTimeout(() => { bot.say(chatroom, message) }, 1000)
            break
        }
    }
}

function checkStreamerEmoteStreak(bot, chatroom, emoteOwner) {
    const channel = chatroom.substring(1)
    logMessage([`> checkStreamerEmoteStreak(channel: '${channel}', emoteOwner: '${emoteOwner}')`])

    // Checking if message includes any of the provided emotes
    const emoteArr = lemonyFresh[emoteOwner].emotes
    const emoteStreakUsers = []
    for (const user in users) {
        for (const emote of emoteArr) {
            if (user !== BOT_USERNAME && users[user].channels[channel]?.lastMessage.includes(emote)) {
                emoteStreakUsers.push(user)
                if (emoteStreakUsers.length) { logMessage([`-> Found`, emoteStreakUsers.length, `out of`, lemonyFresh[channel].streamerEmoteStreakThreshold, `${emoteOwner} emotes: ${emoteStreakUsers.join(`, `)}`]) }
                break
            }
        }
    }

    if (emoteStreakUsers.length >= lemonyFresh[channel].streamerEmoteStreakThreshold) {
        resetCooldownTimer(channel, `streak`)
        emoteReply(bot, chatroom, emoteOwner)
    }
}

function emoteReply(bot, chatroom, emoteOwner) {
    const channel = chatroom.substring(1)
    logMessage([`> emoteReply(channel: '${channel}', emoteOwner: '${emoteOwner}')`])

    const applicableUsers = Object.keys(users).filter(username => channel in users[username].channels)

    const popularEmotes = lemonyFresh[emoteOwner].emotes.map(emote => {
        let usages = 0
        for (const username of applicableUsers) {
            for (const word of users[username].channels[channel].lastMessage.split(` `)) {
                if (word === emote) { usages++ }
            }
        }
        return usages
    })

    const mostUsages = Math.max(...popularEmotes)
    const index = popularEmotes.indexOf(mostUsages)
    const mostPopularEmote = lemonyFresh[emoteOwner].emotes[index]
    logMessage([popularEmotes])
    logMessage([`-> mostPopularEmote ${mostPopularEmote} at index ${index} was used ${pluralize(mostUsages, `time`, `times`)}`])
    bot.say(chatroom, `${mostPopularEmote} ${mostPopularEmote} ${mostPopularEmote} ${mostPopularEmote}`)
}

module.exports = {
    streakListener(props) {
        const { bot, chatroom, message, channel } = props

        // Listening for a message to be repeated by at least two other users
        checkStreak(bot, chatroom, message)

        // Same timer to avoid double message
        if (lemonyFresh[channel].timers.streak.listening) {
            // Listening for a messages containing known emotes from a specific streamer
            const accessibleEmotes = Object.keys(users[BOT_USERNAME].channels)
                .filter(channel => users[BOT_USERNAME].channels[channel].sub)
                .map(channel => lemonyFresh[channel].emotes)
                .flat()
            if (accessibleEmotes.some(emote => message.includes(emote))) {
                const emoteOwner = Object.keys(lemonyFresh).filter(channel => `emotes` in lemonyFresh[channel]
                    && lemonyFresh[channel].emotes.some(emote => message.includes(emote)))[0]
                checkStreamerEmoteStreak(bot, chatroom, emoteOwner)
            }
        } else { logMessage([`> Timer in ${channel} 'streak' is not currently listening`]) }
    }
}
