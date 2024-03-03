const BOT_ID = 893524366
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

// Import data
const { lemonyFresh, mods, users } = require(`./data`)

// Import global settings
const { resetTxt, boldTxt, grayTxt, settings } = require(`./config`)

// Import emotes
const { getHypeEmote, getPositiveEmote, getNegativeEmote } = require(`./getEmotes`)

// Import helper functions
const { talk } = require(`./utils`)

async function authorizeToken(chatroom, username, str) {
    if (settings.debug) { console.log(`${boldTxt}> authorizeToken(chatroom: ${chatroom}, username: ${username}, str: ${str})${resetTxt}`) }
    const authCodePattern = /^http:\/\/localhost:3000\/\?code=([a-z0-9]*)&scope=.*$/
    if (!authCodePattern.test(str)) { return talk(chatroom, `${users[username].displayName}, when using the !authorize command, please paste the whole URL after!`) }
    const authCode = str.split(authCodePattern)[1]

    const requestBody = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${authCode}&grant_type=authorization_code&redirect_uri=http://localhost:3000`
    const endpoint = `https://id.twitch.tv/oauth2/token`
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    console.log(twitchData)

    const channel = chatroom.substring(1)
    const hypeEmote = getHypeEmote(channel)
    const negativeEmote = getNegativeEmote(channel)
    if (`expires_in` in twitchData) {
        if (username in lemonyFresh) {
            lemonyFresh[username].accessToken = twitchData.access_token
            lemonyFresh[username].refreshToken = twitchData.refresh_token
        }
        if (username in mods) {
            mods[username].accessToken = twitchData.access_token
            mods[username].refreshToken = twitchData.refresh_token
        }
        talk(chatroom, `Token was authorized! ${hypeEmote}`)
        return true
    } else {
        talk(chatroom, `Failed to authorize token ${negativeEmote}`)
        return false
    }
}

async function getOAUTHToken(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> getOAUTHToken(chatroom: ${chatroom}, user: ${user})${resetTxt}`) }

    // Scope for making polls, reading polls, and making announcements
    const urlEncodedScope = `channel%3Amanage%3Apolls+channel%3Aread%3Apolls+moderator%3Amanage%3Aannouncements+moderator%3Amanage%3Ashoutouts`

    const endpoint = `https://id.twitch.tv/oauth2/authorize`

    talk(chatroom, `${endpoint}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=http://localhost:3000&scope=${urlEncodedScope}`)
    setTimeout(() => {
        talk(chatroom, `${users[user].displayName}, please follow this link, click "Authorize", copy the URL you're redirected to (it will say "localhost refused to connect" but that's okay), and finally send !authorize <url> in the chat!`)
    }, 2000)
}

async function getTwitchChannel(chatroom, broadcaster_id) {
    if (settings.debug) { console.log(`${boldTxt}> getTwitchChannel(broadcaster_id: ${broadcaster_id})${resetTxt}`) }

    const endpoint = `https://api.twitch.tv/helix/channels?broadcaster_id=${broadcaster_id}`
    const options = {
        headers: {
            authorization: `Bearer ${lemonyFresh.botAccessToken}`,
            "Client-Id": CLIENT_ID
        }
    }

    const response = await fetch(endpoint, options)
    const channelnfo = await response.json()
    console.log(channelnfo)

    const channel = chatroom.substring(1)
    return channelnfo?.data[0] || talk(chatroom, `There was a problem getting the channel info! ${getNegativeEmote(channel)}`)
}

async function getTwitchGame(chatroom, str) {
    if (settings.debug) { console.log(`${boldTxt}> getTwitchGame(str: ${str})${resetTxt}`) }
    const endpoint = `https://api.twitch.tv/helix/games?name=${str}`
    const options = {
        headers: {
            authorization: `Bearer ${lemonyFresh.botAccessToken}`,
            "Client-Id": CLIENT_ID
        }
    }
    const response = await fetch(endpoint, options)
    const data = await response.json()
    console.log(data)
    talk(chatroom, `Looking for ${str}!`)
}

async function getBotToken(chatroom, replyWanted) {
    if (settings.debug) { console.log(`${boldTxt}> getBotToken()${resetTxt}`) }
    const channel = chatroom.substring(1)
    const hypeEmote = getHypeEmote(channel)
    const negativeEmote = getNegativeEmote(channel)

    const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
    const response = await fetch(url, { method: "POST" })
    const twitchData = await response.json()
    console.log(`${grayTxt}${JSON.stringify(twitchData)}${resetTxt}`)

    if (`expires_in` in twitchData) {
        lemonyFresh.botAccessToken = twitchData.access_token
        if (replyWanted) { talk(chatroom, `Updated! My new token expires in ~${Math.round(twitchData.expires_in / 1000 / 60)} minutes! ${hypeEmote}`) }
    } else {
        talk(chatroom, `Error updating access token! ${negativeEmote}${twitchData.error ? ` ${twitchData.error}` : ``}`)
    }
}

async function getTwitchUser(chatroom, username) {
    if (settings.debug) { console.log(`${boldTxt}> getTwitchUser(chatroom: ${chatroom}, username: ${username})${resetTxt}`) }

    const endpoint = `https://api.twitch.tv/helix/users?login=${username}`
    const options = {
        headers: {
            authorization: `Bearer ${lemonyFresh.botAccessToken}`,
            "Client-Id": CLIENT_ID
        }
    }

    const response = await fetch(endpoint, options)
    const userInfo = await response.json()
    console.log(userInfo)

    const channel = chatroom.substring(1)
    const negativeEmote = getNegativeEmote(channel)
    if (`error` in userInfo) {
        if (userInfo.error === `Unauthorized`) {
            // talk(chatroom, `Hold on, I need to refresh my token...`)
            console.log(`${grayTxt}> Unauthorized from getTwitchUser(), attempting to refresh access token...${resetTxt}`)
            await getBotToken(chatroom, false)
            options.headers.authorization = `Bearer ${lemonyFresh.botAccessToken}`
            const finalAttempt = await fetch(endpoint, options)
            const finalAttemptData = await finalAttempt.json()
            console.log(finalAttemptData)
            if (userInfo.data[0]?.id) { return userInfo.data[0] }
        }
        talk(chatroom, `Error: ${userInfo.error} ${negativeEmote}`)
    } else if (userInfo.data.length === 0) {
        return talk(chatroom, `No user ${username} was found! ${negativeEmote}`)
    } else {
        return userInfo.data[0]
    }
}

async function pollEnd(chatroom, status) {
    if (settings.debug) { console.log(`${boldTxt}> pollEnd(chatroom: ${chatroom})${resetTxt}`) }
    const channel = chatroom.substring(1)
    const positiveEmote = getPositiveEmote(channel)
    const negativeEmote = getNegativeEmote(channel)
    if (!lemonyFresh[channel].pollId) { return talk(chatroom, `There is no active poll! ${negativeEmote}`) }

    const endpoint = `https://api.twitch.tv/helix/polls?broadcaster_id=${lemonyFresh[channel].id}&id=${lemonyFresh[channel].pollId}&status=${status}`
    const options = {
        method: 'PATCH',
        headers: {
            authorization: `Bearer ${lemonyFresh[channel].accessToken}`,
            'Client-Id': CLIENT_ID
        }
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    console.log(twitchData)

    if (`error` in twitchData) {
        talk(chatroom, `Error ending poll! ${negativeEmote}`)
    } else if (twitchData.data[0].status = status) {
        lemonyFresh[channel].pollId = ``
        talk(chatroom, `Poll ${status === `TERMINATED` ? `finished` : `was canceled`}! ${positiveEmote}`)
    }
}

async function pollStart(chatroom, str) {
    if (settings.debug) { console.log(`${boldTxt}> pollStart(chatroom: ${chatroom}, str: ${str})${resetTxt}`) }
    const channel = chatroom.substring(1)
    const positiveEmote = getPositiveEmote(channel)
    const negativeEmote = getNegativeEmote(channel)
    if (lemonyFresh[channel].pollId) { return talk(chatroom, `There is already a poll in progress! ${negativeEmote}`) }

    const params = str.split(new RegExp(/ ?\/ ?/))
    const seconds = params.shift()
    let duration = Number(seconds)
    if ([`<`, `>`].some((bracket) => seconds.includes(bracket))) {
        const regex = /^<(\d+)>$/
        if (!seconds.match(regex)) {
            return talk(chatroom, `Error: Please don't use angle brackets in the seconds! :)`)
        } else {
            duration = Number(seconds.split(regex)[1])
        }
    }

    if (isNaN(duration)
        || duration < 15
        || duration > 1800) {
        return talk(chatroom, `Error: Duration should be a number between 15 and 1800. Try: !poll <seconds> / Title of poll / First choice / Second choice ...`)
    }

    // Params length should be more than 2, and shouldn't be longer than 6
    const title = params.shift()
    if (params.length < 2 || params.length > 5) { return talk(chatroom, `Error: Between 2-5 choices are allowed. Try: !poll <seconds> / Title of poll / First choice / Second choice ...`) }

    const choices = []
    params.map((choice) => choices.push({ 'title': choice }))

    const requestBody = {
        "broadcaster_id": lemonyFresh[channel].id,
        "title": title,
        "choices": choices,
        "duration": duration
    }

    const endpoint = `https://api.twitch.tv/helix/polls`
    const options = {
        method: 'POST',
        headers: {
            authorization: `Bearer ${lemonyFresh[channel].accessToken}`,
            'Client-Id': CLIENT_ID,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    console.log(twitchData)

    if (`error` in twitchData) {
        if (twitchData.message === `Invalid OAuth token`) {
            // talk(chatroom, `Hold on, I need to refresh the token...`)
            console.log(`${grayTxt}> Unauthorized from pollStart(), attempting to refresh access token...${resetTxt}`)
            await refreshToken(chatroom, channel, false)
            options.headers.authorization = `Bearer ${lemonyFresh[channel].accessToken}`
            const finalAttempt = await fetch(endpoint, options)
            const finalAttemptData = await finalAttempt.json()
            console.log(finalAttemptData)
            if (finalAttemptData?.data) {
                talk(chatroom, `Poll created, go vote! ${positiveEmote}`)
                lemonyFresh[channel].pollId = finalAttemptData.data[0].id
                return setTimeout(() => { lemonyFresh[channel].pollId = `` }, duration * 1000)
            }
        }
        talk(chatroom, `(Error ${twitchData.status}) ${twitchData.error}: ${twitchData.message}`)
    } else if (!twitchData.data) {
        talk(chatroom, `Error creating poll! ${negativeEmote}`)
    } else {
        lemonyFresh[channel].pollId = twitchData.data[0].id
        setTimeout(() => { lemonyFresh[channel].pollId = `` }, duration * 1000)
        talk(chatroom, `Poll created, go vote! ${positiveEmote}`)
    }
}

async function handleShoutOut(chatroom, username, toUser) {
    if (settings.debug) { console.log(`${boldTxt}> handleShoutOut(chatroom: ${chatroom}, username: ${username}, toUser: ${toUser})${resetTxt}`) }

    const twitchUser = await getTwitchUser(chatroom, toUser)
    if (!twitchUser) { return console.log(`${grayTxt}No user found, exiting handleShoutOut function${resetTxt}`) }
    const stream = await getTwitchChannel(chatroom, twitchUser.id)
    let response = `Let's give a shoutout to ${stream.broadcaster_name}! `

    stream.game_name
        ? response += `They were last playing ${stream.game_name}${twitchUser.broadcaster_type ? ` and are a Twitch ${twitchUser.broadcaster_type.substring(0, 1).toUpperCase() + twitchUser.broadcaster_type.substring(1)}!` : `.`}`
        : response += `#NoGameGang`
    response += ` Follow them here: https://www.twitch.tv/${stream.broadcaster_login} :)`

    talk(chatroom, response)

    // Twitch official shoutout (if not to self or current channel)
    const channel = chatroom.substring(1)
    if ((users[username][channel].mod || username === channel)) {
        if (channel === toUser) { return console.log(`${grayTxt}> Can't give shoutout to ${channel}${resetTxt}`) }
        const token = username in mods && mods[username].isModIn.includes(chatroom) && mods[username].accessToken
            ? mods[username].accessToken
            : lemonyFresh[channel].accessToken

        const moderatorId = username in mods && mods[username].isModIn.includes(chatroom) && mods[username].accessToken
            ? mods[username].id
            : lemonyFresh[channel].id

        const endpoint = `https://api.twitch.tv/helix/chat/shoutouts?from_broadcaster_id=${lemonyFresh[channel].id}&to_broadcaster_id=${twitchUser.id}&moderator_id=${moderatorId}`
        const options = {
            method: 'POST',
            headers: {
                authorization: `Bearer ${token}`,
                "Client-Id": CLIENT_ID
            }
        }
        const response = await fetch(endpoint, options)
        // If too many requests, stop attempting
        if (response.status !== 204) {
            const data = await response.json()
            console.log(data)
            if (response.status === 401) {
                // talk(chatroom, `Hold on, I need to refresh ${username in mods && mods[username].isModIn.includes(chatroom) && mods[username].accessToken ? username : channel}'s token...`)
                console.log(`${grayTxt}> Unauthorized from handleShoutOut(), attempting to refresh access token...${resetTxt}`)
                await refreshToken(chatroom, username in mods && mods[username].isModIn.includes(chatroom) && mods[username].accessToken ? username : channel, false)
                options.headers.authorization = `Bearer ${username in mods && mods[username].isModIn.includes(chatroom) && mods[username].accessToken ? mods[username].accessToken : lemonyFresh[channel].accessToken}`
                const finalAttempt = await fetch(endpoint, options)
                if (finalAttempt.status !== 204) {
                    const finalAttemptData = await finalAttempt.json()
                    console.log(`> handleShoutOut() failed a second time:`)
                    return console.log(finalAttemptData)
                }
                return console.log(`${grayTxt}> Shoutout posted successfully!${resetTxt}`)
            }
        }
        console.log(`${grayTxt}> Shoutout posted successfully!${resetTxt}`)
    }
}

async function makeAnnouncement(chatroom, commandSuffix, username, message) {
    if (settings.debug) { console.log(`${boldTxt}> makeAnnouncement(chatroom: ${chatroom}, color: ${[`blue`, `green`, `orange`, `purple`].includes(commandSuffix) ? commandSuffix : `primary`}, username: ${username}, message: ${message})${resetTxt}`) }

    const channel = chatroom.substring(1)
    const negativeEmote = getNegativeEmote(channel)
    if (!message) { return talk(chatroom, `No announcement message provided! ${negativeEmote}`) }

    const color = [`blue`, `green`, `orange`, `purple`].includes(commandSuffix) ? commandSuffix : `primary`
    const requestBody = {
        message: message,
        color: color
    }

    const token = username in mods && mods[username].isModIn.includes(chatroom) && mods[username].accessToken
        ? mods[username].accessToken
        : lemonyFresh[channel].accessToken

    const moderatorId = username in mods && mods[username].isModIn.includes(chatroom) && mods[username].accessToken
        ? mods[username].id
        : lemonyFresh[channel].id

    const endpoint = `https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${lemonyFresh[channel].id}&moderator_id=${moderatorId}`
    const options = {
        method: 'POST',
        headers: {
            authorization: `Bearer ${token}`,
            "Client-Id": CLIENT_ID,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    }

    const response = await fetch(endpoint, options)
    if (response.status !== 204) {
        const data = await response.json()
        console.log(data)
        if (response.status === 401) {
            // talk(chatroom, `Hold on, I need to refresh ${username in mods && mods[username].isModIn.includes(chatroom) && mods[username].accessToken ? username : channel}'s token...`)
            console.log(`${grayTxt}> Unauthorized from makeAnnouncement(), attempting to refresh access token...${resetTxt}`)
            await refreshToken(chatroom, username in mods && mods[username].isModIn.includes(chatroom) && mods[username].accessToken ? username : channel, false)
            options.headers.authorization = `Bearer ${username in mods && mods[username].isModIn.includes(chatroom) && mods[username].accessToken ? mods[username].accessToken : lemonyFresh[channel].accessToken}`
            const finalAttempt = await fetch(endpoint, options)
            if (finalAttempt.status !== 204) {
                const finalAttemptData = await finalAttempt.json()
                console.log(`> makeAnnouncement() failed a second time:`)
                console.log(finalAttemptData)
            }
            return
        }
    }
}

async function refreshToken(chatroom, username, replyWanted) {
    if (settings.debug) { console.log(`${boldTxt}> refreshToken(chatroom: ${chatroom}, username: ${username}, replyWanted: ${replyWanted})${resetTxt}`) }

    const channel = chatroom.substring(1)
    let refreshToken = username === channel ? lemonyFresh[channel].refreshToken : mods[username].refreshToken
    if (!refreshToken && username === channel) { refreshToken = lemonyFresh[channel].refreshToken }
    if (!refreshToken) { return talk(chatroom, `Unauthorized! Please use !access and follow the !authorize instructions :)`) }

    const endpoint = `https://id.twitch.tv/oauth2/token`
    const requestBody = `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    console.log(twitchData)

    const hypeEmote = getHypeEmote(channel)
    const negativeEmote = getNegativeEmote(channel)
    if (`expires_in` in twitchData) {
        if (username in lemonyFresh) {
            lemonyFresh[username].accessToken = twitchData.access_token
            lemonyFresh[username].refreshToken = twitchData.refresh_token
        }
        if (username in mods) {
            mods[username].accessToken = twitchData.access_token
            mods[username].refreshToken = twitchData.refresh_token
        }
        console.log(`${grayTxt}> Token refreshed successfully!${resetTxt}`)
        if (replyWanted) { talk(chatroom, `Successfully updated ${username}'s token! ${hypeEmote}`) }
    } else {
        talk(chatroom, `Error refreshing ${username}'s token! ${negativeEmote}`)
    }
}

async function validateToken(chatroom) {
    if (settings.debug) { console.log(`${boldTxt}> validateToken(chatroom: ${chatroom})${resetTxt}`) }
    const channel = chatroom.substring(1)
    const endpoint = `https://id.twitch.tv/oauth2/validate`
    const options = {
        headers: {
            authorization: `Bearer ${lemonyFresh[channel].accessToken}`
        }
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    console.log(twitchData)

    const positiveEmote = getPositiveEmote(channel)
    const negativeEmote = getNegativeEmote(channel)
    return `expires_in` in twitchData
        ? talk(chatroom, `${users[twitchData.login]?.displayName || twitchData.login}'s token expires in ${Math.round(twitchData.expires_in / 60)} minute${Math.round(twitchData.expires_in / 60) === 1 ? `` : `s`}! ${positiveEmote}`)
        : talk(chatroom, `${channel}'s token is invalid! ${negativeEmote}`)
}

module.exports = {
    authorizeToken,
    getOAUTHToken,
    getTwitchChannel,
    getTwitchGame,
    getBotToken,
    getTwitchUser,
    handleShoutOut,
    makeAnnouncement,
    pollEnd,
    pollStart,
    refreshToken,
    validateToken
}
