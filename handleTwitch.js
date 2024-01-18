const BOT_ID = 893524366
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

// Import data
const { lemonyFresh, users } = require(`./data`)

// Import global settings
const { resetTxt, boldTxt, grayTxt, settings } = require(`./config`)

// Import helper functions
const { talk } = require(`./utils`)

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

async function getTwitchToken() {
    if (settings.debug) { console.log(`${boldTxt}> getTwitchToken()${resetTxt}`) }
    const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
    const response = await fetch(url, { method: "POST" })
    const token = await response.json()
    console.log(`${grayTxt}${JSON.stringify(token)}${resetTxt}`)
    lemonyFresh.botAccessToken = token.access_token
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

module.exports = {
    getTwitchUser,
    getTwitchChannel,
    getTwitchToken,
    getTwitchGame,
    handleShoutOut
}
