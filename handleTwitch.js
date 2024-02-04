const BOT_ID = 893524366
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

// Import data
const { lemonyFresh, users } = require(`./data`)

// Import global settings
const { resetTxt, boldTxt, grayTxt, settings } = require(`./config`)

// Import helper functions
const { talk } = require(`./utils`)

async function authorizeToken(chatroom, user, str) {
    if (settings.debug) { console.log(`${boldTxt}> authorizeToken(chatroom: ${chatroom}, user: ${user}, str: ${str})${resetTxt}`) }
    const authCodePattern = /^http:\/\/localhost:3000\/\?code=([a-z0-9]*)&scope=.*$/
    if (!authCodePattern.test(str)) { return talk(chatroom, `${users[user].displayName}, when using the !authorize command, please paste the whole URL after!`) }
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

    if (`expires_in` in twitchData) {
        lemonyFresh[user].accessToken = twitchData.access_token
        lemonyFresh[user].refreshToken = twitchData.refresh_token
        talk(chatroom, `Token was authorized :)`)
        return true
    } else {
        talk(chatroom, `Invalid token :(`)
        return false
    }
}

async function getOAUTHToken(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> getOAUTHToken(chatroom: ${chatroom}, user: ${user})${resetTxt}`) }

    // Scope for making polls, reading polls, and making announcements
    const urlEncodedScope = `channel%3Amanage%3Apolls+channel%3Aread%3Apolls`

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

    return channelnfo?.data[0] || talk(chatroom, `There was a problem getting the channel info! :(`)
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

async function getTwitchToken() {
    if (settings.debug) { console.log(`${boldTxt}> getTwitchToken()${resetTxt}`) }
    const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
    const response = await fetch(url, { method: "POST" })
    const token = await response.json()
    console.log(`${grayTxt}${JSON.stringify(token)}${resetTxt}`)
    lemonyFresh.botAccessToken = token.access_token
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

    return `error` in userInfo
        ? talk(chatroom, userInfo.error)
        : userInfo.data.length === 0
            ? talk(chatroom, `No user ${username} was found! :(`)
            : userInfo.data[0]
}

async function handleShoutOut(chatroom, user) {
    if (settings.debug) { console.log(`${boldTxt}> handleShoutOut(chatroom: ${chatroom}, user: ${user})${resetTxt}`) }
    const twitchUser = await getTwitchUser(chatroom, user)
    if (!twitchUser) { return console.log(`${grayTxt}No user found, exiting handleShoutOut function${resetTxt}`) }
    const stream = await getTwitchChannel(chatroom, twitchUser.id)
    let response = `Let's give a shoutout to ${stream.broadcaster_name}! `
    stream.game_name
        ? response += `They were last playing ${stream.game_name}${twitchUser.broadcaster_type ? ` and are a Twitch ${twitchUser.broadcaster_type.substring(0, 1).toUpperCase() + twitchUser.broadcaster_type.substring(1)}!` : `.`}`
        : response += `#NoGameGang`
    response += ` Follow them here: https://www.twitch.tv/${stream.broadcaster_login} :)`
    talk(chatroom, response)
}

async function refreshToken(chatroom) {
    if (settings.debug) { console.log(`${boldTxt}> refreshToken(chatroom: ${chatroom})${resetTxt}`) }
    const channel = chatroom.substring(1)
    const refreshToken = lemonyFresh[channel].refreshToken

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

    if (`expires_in` in twitchData) {
        lemonyFresh[channel].accessToken = twitchData.access_token
        lemonyFresh[channel].refreshToken = twitchData.refresh_token
        talk(chatroom, `Success! :D`)
    } else {
        talk(chatroom, `Error refreshing token :(`)
    }
}

async function startPoll(chatroom, str) {
    if (settings.debug) { console.log(`${boldTxt}> startPoll(chatroom: ${chatroom}, str: ${str})${resetTxt}`) }
    const channel = chatroom.substring(1)
    const params = str.split(` / `)

    const duration = Number(params.shift())
    if (isNaN(duration)
        || duration < 15
        || duration > 1800) {
        return talk(chatroom, `Error: Duration should be a number between 15 and 1800. Try: !poll <seconds> / Title of poll / First choice / Second choice ...`)
    }

    // length should be more than 2, and shouldn't be longer than 6 (1 title, 5 choices)
    const title = params.shift()
    if (params.length < 2 || params.length > 5) { return talk(chatroom, `Error: Between 2-5 choices are allowed. Try: !poll <seconds> / Title of poll / First choice / Second choice ...`) }

    const choices = []
    params.map((choice) => choices.push({ 'title': choice }))

    const requestBody = {
        "broadcaster_id": lemonyFresh[chatroom.substring(1)].id,
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
            talk(chatroom, `Hold on, I need to refresh the token...`)
            await refreshToken(chatroom)
            options.headers.authorization = `Bearer ${lemonyFresh[channel].accessToken}`
            const finalAttempt = await fetch(endpoint, options)
            const finalAttemptData = await finalAttempt.json()
            console.log(finalAttemptData)
        } else {
            talk(chatroom, `(Error ${twitchData.status}) ${twitchData.error}: ${twitchData.message}`)
        }
    } else if (!twitchData.data) {
        talk(chatroom, `Error creating poll :(`)
    } else {
        talk(chatroom, `Poll created. Go vote! :)`)
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

    return `expires_in` in twitchData
        ? talk(chatroom, `${users[twitchData.login]?.displayName || twitchData.login}'s token expires in ${Math.round(twitchData.expires_in / 60)} minute${Math.round(twitchData.expires_in / 60) === 1 ? `` : `s`}!`)
        : talk(chatroom, `${channel}'s token is invalid! :(`)
}

module.exports = {
    authorizeToken,
    getOAUTHToken,
    getTwitchChannel,
    getTwitchGame,
    getTwitchToken,
    getTwitchUser,
    handleShoutOut,
    refreshToken,
    startPoll,
    validateToken
}
