const BOT_USERNAME = process.env.BOT_USERNAME

const { users, lemonyFresh } = require(`../data`)
const { resetTxt, grayTxt, settings } = require(`../config`)

const { pluralize, resetCooldownTimer } = require(`../utils`)

function checkStreak(bot, chatroom, message) {
    const channel = chatroom.substring(1)
    let streakCount = 0
    const streakUsers = []

    for (const username in users) {
        if (username !== BOT_USERNAME && users[username][channel]?.lastMessage === message) {
            streakCount++
            streakUsers.push(users[username].displayName)
            if (streakCount >= 2 && settings.debug) { console.log(`${grayTxt}> checkStreak("${message}")`, streakCount, `/ ${settings.streakThreshold} - ${streakUsers.join(`, `)}${resetTxt}`) }
        }
        if (streakCount >= settings.streakThreshold) {
            resetCooldownTimer(`streak`)
            return setTimeout(() => { bot.say(chatroom, message) }, 1000)
        }
    }
}

function checkStreamerEmoteStreak(bot, chatroom, emoteOwner) {
    if (settings.debug) { console.log(`${grayTxt}> checkStreamerEmoteStreak(chatroom: ${chatroom}, emoteOwner: '${emoteOwner}')${resetTxt}`) }

    const emoteArr = lemonyFresh[emoteOwner].emotes
    const emoteStreakUsers = []
    // Checking if message includes any of the provided emotes
    for (const user in users) {
        for (const emote of emoteArr) {
            if (user !== BOT_USERNAME && users[user][emoteOwner]?.lastMessage.includes(emote)) {
                emoteStreakUsers.push(user)
                if (emoteStreakUsers.length && settings.debug) { console.log(`${grayTxt}-> Found${resetTxt}`, emoteStreakUsers.length, `${grayTxt}out of${resetTxt}`, settings.streamerEmoteStreakThreshold, `${grayTxt}${emoteOwner} emotes: ${emoteStreakUsers.join(`, `)}${resetTxt}`) }
                break
            }
        }
    }

    if (emoteStreakUsers.length >= settings.streamerEmoteStreakThreshold) {
        resetCooldownTimer(`streak`)
        return emoteReply(bot, chatroom, emoteOwner)
    }
}

function emoteReply(bot, chatroom, emoteOwner) {
    if (settings.debug) { console.log(`${grayTxt}> emoteReply(chatroom: ${chatroom}, emoteOwner: ${emoteOwner})${resetTxt}`) }
    const channel = chatroom.substring(1)

    const applicableUsers = Object.keys(users).filter(username => emoteOwner in users[username])
    const popularEmotes = lemonyFresh[emoteOwner].emotes.map(emote => {
        let usages = 0
        for (const username of applicableUsers) {
            for (const word of users[username][channel].lastMessage.split(` `)) {
                if (word === emote) { usages++ }
            }
        }
        return usages
    })

    const mostUsages = Math.max(...popularEmotes)
    const index = popularEmotes.indexOf(mostUsages)
    const mostPopularEmote = lemonyFresh[emoteOwner].emotes[index]
    if (settings.debug) { console.log(popularEmotes) }
    if (settings.debug) { console.log(`${grayTxt}-> mostPopularEmote ${mostPopularEmote} at index ${index} was used ${pluralize(mostUsages, `time`, `times`)}${resetTxt}`) }
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
            const accessibleEmotes = Object.keys(users[BOT_USERNAME])
                .filter(channel => typeof users[BOT_USERNAME][channel] === `object` && users[BOT_USERNAME][channel].sub) //  && `emotes` in lemonyFresh[channel] // this logic shouldn't be necessary since any channel the bot is in will have been initialized
                .map(channel => lemonyFresh[channel].emotes)
                .flat()
            if (accessibleEmotes.some(emote => message.includes(emote))) {
                const emoteOwner = Object.keys(lemonyFresh).filter(key => typeof lemonyFresh[key] === `object`
                    && `emotes` in lemonyFresh[key]
                    && lemonyFresh[key].emotes.some(emote => message.includes(emote)))[0]
                checkStreamerEmoteStreak(bot, chatroom, emoteOwner)
            }
        } else if (settings.debug) { console.log(`${grayTxt}> Timer in ${channel} 'streak' is not currently listening${resetTxt}`) }
    }
}
