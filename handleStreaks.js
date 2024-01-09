const BOT_USERNAME = process.env.BOT_USERNAME

// Import global settings
const { resetTxt, boldTxt, grayTxt, settings } = require(`./config`)

// Import data
const { users } = require(`./data`)

// Import helper functions
const { delayListening, talk } = require(`./utils`)

function checkStreak(chatroom, msg) {
    let streakCount = 0
    const streakUsers = []

    for (const user in users) {
        if (user !== BOT_USERNAME && users[user][chatroom.substring(1)]?.lastMessage === msg
            && msg !== `!play`) {
            streakCount++
            streakUsers.push(users[user].displayName)
            if (streakCount >= 2) { console.log(`${boldTxt}> checkStreak("${msg}")`, streakCount, `/ 3 - ${streakUsers.join(`, `)}${resetTxt}`) }
        }
        if (streakCount >= 3) {
            delayListening()
            setTimeout(() => { talk(chatroom, msg) }, 1000)
            return true
        }
    }
    return false
}

function checkEmoteStreak(chatroom, emoteArr) {
    if (settings.debug) { console.log(`${boldTxt}> checkEmoteStreak(chatroom: ${chatroom}, emoteArr.length: ${emoteArr.length})${resetTxt}`) }
    const channel = chatroom.substring(1)
    let emoteStreakCount = 0
    const emoteStreakUsers = []
    // Checking if message includes any of the provided emotes
    for (const user in users) {
        for (const emote of emoteArr) {
            if (user !== BOT_USERNAME && users[user][channel]?.lastMessage.includes(emote)) {
                emoteStreakCount++
                emoteStreakUsers.push(users[user].displayName)
                console.log(`${grayTxt}> found`, emote, `from`, user, `emoteStreakCount:${resetTxt}`, emoteStreakCount)
                if (emoteStreakCount >= 2) { console.log(`${boldTxt}Looking for ${emoteArr[0].substring(0, 4)} emotes... ${emoteStreakCount}/4 messages - ${emoteStreakUsers.join(`, `)}${resetTxt}`) }
                break
            }
        }
    }
    if (emoteStreakCount >= 4) {
        console.log(`${grayTxt}> hit${resetTxt}`, emoteStreakCount)
        delayListening()
        return emoteReply(chatroom, emoteArr)
    }
}

function emoteReply(chatroom, emoteArr) {
    if (settings.debug) { console.log(`${boldTxt}> emoteReply(chatroom: ${chatroom}, emoteArr.length: ${emoteArr.length})${resetTxt}`) }
    const channel = chatroom.substring(1)
    const popularEmotes = Array(emoteArr.length).fill(0)
    for (const [i, emote] of emoteArr.entries()) {
        for (const user in users) {
            if (channel in users[user]) {
                const words = users[user][channel].lastMessage.split(` `)
                for (const str of words) {
                    if (str === emote) {
                        popularEmotes[i]++
                        console.log(`${grayTxt}...${emote} increased to ${popularEmotes[i]} from ${users[user].displayName}${resetTxt}`)
                    }
                }
            }
        }
    }
    const mostVotes = Math.max(...popularEmotes)
    const mostPopularEmoteIdx = popularEmotes.indexOf(mostVotes)
    const mostPopularEmote = emoteArr[mostPopularEmoteIdx]
    console.log(popularEmotes, mostPopularEmoteIdx, mostVotes, mostPopularEmote)
    talk(chatroom, `${mostPopularEmote} ${mostPopularEmote} ${mostPopularEmote} ${mostPopularEmote}`)
}

module.exports = {
    checkStreak,
    checkEmoteStreak,
    emoteReply
}
