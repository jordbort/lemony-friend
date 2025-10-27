const BOT_USERNAME = process.env.BOT_USERNAME

const { settings } = require(`../config`)
const { users, lemonyFresh } = require(`../data`)
const { pluralize, resetCooldownTimer, logMessage, containsInaccessibleEmotes, containsUnrecognizedEmotes, renderObj } = require(`../utils`)

function checkStreak(bot, chatroom, message, currentTime) {
    const channel = chatroom.substring(1)

    const streakUsers = []
    for (const username in users) {
        if (username !== BOT_USERNAME
            && channel in users[username].channels
            && users[username].channels[channel].lastMessage === message
            && currentTime - users[username].channels[channel].sentAt <= settings.streakMinutesThreshold * 60000) {
            streakUsers.push(users[username].displayName)
            if (streakUsers.length > 1) { logMessage([`> checkStreak("${message}")`, streakUsers.length, `/ ${settings.streakThreshold} - ${streakUsers.join(`, `)}`]) }
        }
        if (streakUsers.length >= settings.streakThreshold) {
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

function checkStreamerEmoteStreak(bot, chatroom, emoteOwner, currentTime) {
    const channel = chatroom.substring(1)
    logMessage([`> checkStreamerEmoteStreak(channel: '${channel}', emoteOwner: '${emoteOwner}')`])

    // Checking if message includes any of the provided emotes
    const emoteArr = lemonyFresh[emoteOwner].emotes
    const emoteStreakUsers = []
    for (const username in users) {
        for (const emote of emoteArr) {
            if (username !== BOT_USERNAME
                && channel in users[username].channels
                && users[username].channels[channel].lastMessage.includes(emote)
                && currentTime - users[username].channels[channel].sentAt <= settings.streakMinutesThreshold * 60000) {
                emoteStreakUsers.push(username)
                if (emoteStreakUsers.length) { logMessage([`-> Found`, emoteStreakUsers.length, `out of`, settings.streamerEmoteStreakThreshold, `${emoteOwner} emotes: ${emoteStreakUsers.join(`, `)}`]) }
                break
            }
        }
    }

    if (emoteStreakUsers.length >= settings.streamerEmoteStreakThreshold) {
        resetCooldownTimer(channel, `streak`)
        emoteReply(bot, chatroom, emoteOwner)
    }
}

function emoteReply(bot, chatroom, emoteOwner) {
    const channel = chatroom.substring(1)
    logMessage([`> emoteReply(channel: '${channel}', emoteOwner: '${emoteOwner}')`])

    const applicableUsers = Object.keys(users).filter(username => channel in users[username].channels)

    const usedEmotes = {}
    for (const emote of lemonyFresh[emoteOwner].emotes) {
        for (const username of applicableUsers) {
            for (const word of users[username].channels[channel].lastMessage.split(` `)) {
                if (word === emote) {
                    emote in usedEmotes
                        ? usedEmotes[emote]++
                        : usedEmotes[emote] = 1
                }
            }
        }
    }
    logMessage([renderObj(usedEmotes, `usedEmotes`)])

    const mostUsed = Math.max(...Object.keys(usedEmotes).map(emote => usedEmotes[emote]))
    const mostPopularEmote = Object.keys(usedEmotes).filter(emote => usedEmotes[emote] === mostUsed)[0]
    const reply = Array(mostUsed).fill(mostPopularEmote).join(` `)
    bot.say(chatroom, reply)
}

module.exports = {
    streakListener(props) {
        const { bot, chatroom, message, currentTime, channel } = props

        // Listening for a message to be repeated by at least two other users
        checkStreak(bot, chatroom, message, currentTime)

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
                checkStreamerEmoteStreak(bot, chatroom, emoteOwner, currentTime)
            }
        } else { logMessage([`> Timer in ${channel} 'streak' is not currently listening`]) }
    }
}
