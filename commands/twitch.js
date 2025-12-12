const BOT_USERNAME = process.env.BOT_USERNAME
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI

const { settings } = require(`../config`)
const { lemonyFresh, mods, users } = require(`../data`)
const { openWebSocket, handleEvent, getWebSocket, removeClosedWebSockets, handleReconnect, handleMessage } = require(`../events`)
const { getContextEmote, resetCooldownTimer, getToUser, renderObj, pluralize, logMessage, arrToList } = require(`../utils`)

async function apiGetTwitchAppAccessToken() {
    await logMessage([`> apiGetTwitchAppAccessToken()`])
    const endpoint = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
    const options = { method: `POST` }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()

    if (response.status === 200) {
        settings.botAccessToken = twitchData.access_token
        await logMessage([`-> Access token granted successfully!`])
        return true
    } else {
        await logMessage([`apiGetTwitchAppAccessToken`, response.status, renderObj(twitchData, `twitchData`)])
        return null
    }
}

async function apiGetOAUTHToken(username, authCode) {
    await logMessage([`> apiGetOAUTHToken(username: ${username}, authCode: ${authCode})`])
    const requestBody = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${authCode}&grant_type=authorization_code&redirect_uri=${REDIRECT_URI}`
    const endpoint = `https://id.twitch.tv/oauth2/token`
    const options = {
        method: `POST`,
        headers: {
            'Content-Type': `application/x-www-form-urlencoded`
        },
        body: requestBody
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()

    if (response.status === 200) {
        if (username in lemonyFresh) {
            lemonyFresh[username].accessToken = twitchData.access_token
            lemonyFresh[username].refreshToken = twitchData.refresh_token
        }
        if (username in mods) {
            mods[username].accessToken = twitchData.access_token
            mods[username].refreshToken = twitchData.refresh_token
        }
        await logMessage([`-> OAUTH token granted successfully!`])
        return true
    } else {
        await logMessage([`authorizeToken`, response.status, renderObj(twitchData, `twitchData`)])
        return null
    }
}

async function apiGetTwitchUser(username, attempt = 1) {
    await logMessage([`> apiGetTwitchUser(username: ${username}, attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/users?login=${username}`
    const options = {
        headers: {
            authorization: `Bearer ${settings.botAccessToken}`,
            'Client-Id': CLIENT_ID
        }
    }
    const response = await fetch(endpoint, options)
    const twitchData = await response.json()

    if (response.status === 200) {
        if (!twitchData.data.length) {
            await logMessage([`-> No user '${username}' found`])
            return false
        }
        return twitchData.data[0]
    } else {
        await logMessage([`apiGetTwitchUser`, response.status, renderObj(twitchData, `twitchData`)])
        if (response.status === 401) {
            if (attempt < 3) {
                const retry = await apiGetTwitchAppAccessToken()
                if (retry) {
                    attempt++
                    return apiGetTwitchUser(username, attempt)
                }
            } else {
                await logMessage([`-> Failed to get Twitch user after ${pluralize(attempt, `attempt`, `attempts`)}`])
                return null
            }
        } else { return null }
    }
}

async function apiGetTwitchChannel(broadcasterId, attempt = 1) {
    await logMessage([`> apiGetTwitchChannel(broadcasterId: ${broadcasterId}, attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/channels?broadcaster_id=${broadcasterId}`
    const options = {
        headers: {
            authorization: `Bearer ${settings.botAccessToken}`,
            'Client-Id': CLIENT_ID
        }
    }
    const response = await fetch(endpoint, options)
    const twitchData = await response.json()

    if (response.status === 200) {
        return twitchData.data[0]
    } else {
        await logMessage([`apiGetTwitchChannel`, response.status, renderObj(twitchData, `twitchData`)])
        if (response.status === 401) {
            if (attempt < 3) {
                const retry = await apiGetTwitchAppAccessToken()
                if (retry) {
                    attempt++
                    return apiGetTwitchChannel(broadcasterId, attempt)
                }
            } else {
                await logMessage([`-> Failed to get Twitch channel after ${pluralize(attempt, `attempt`, `attempts`)}`])
                return null
            }
        } else { return null }
    }
}

async function apiUpdateTwitchChannel(channel, requestBody, attempt = 1) {
    const key = Object.keys(requestBody)[0]
    await logMessage([`> apiUpdateTwitchChannel(channel: '${channel}', ${key}: '${requestBody[key]}', attempt: ${attempt})`])
    const streamer = lemonyFresh[channel]
    const endpoint = `https://api.twitch.tv/helix/channels?broadcaster_id=${streamer.id}`
    const options = {
        method: `PATCH`,
        headers: {
            authorization: `Bearer ${streamer.accessToken}`,
            'Client-Id': CLIENT_ID,
            'Content-Type': `application/json`
        },
        body: JSON.stringify(requestBody)
    }
    const response = await fetch(endpoint, options)

    if (response.status !== 204) {
        const twitchData = await response.json()
        await logMessage([
            `apiUpdateTwitchChannel`,
            response.status,
            `data` in twitchData
                ? twitchData.data.length
                    ? renderObj(twitchData.data[0], `twitchData.data[0]`)
                    : `twitchData.data: []`
                : renderObj(twitchData, `twitchData`)
        ])
        if (response.status === 401 && twitchData.message === `Invalid OAuth token`) {
            if (attempt < 3) {
                const retry = await apiRefreshToken(channel, streamer.refreshToken)
                if (retry) {
                    attempt++
                    return apiUpdateTwitchChannel(channel, requestBody, attempt)
                }
            } else {
                await logMessage([`-> Failed to update Twitch channel after ${pluralize(attempt, `attempt`, `attempts`)}`])
                return null
            }
        } else { return null }
    }
    return true
}

async function apiGetGame(query, attempt = 1) {
    await logMessage([`> apiGetGame(query: '${query}', attempt: ${attempt})`])
    const endpoint = isNaN(Number(query))
        ? `https://api.twitch.tv/helix/games?name=${query}`
        : `https://api.twitch.tv/helix/games?id=${query}`
    const options = {
        headers: {
            authorization: `Bearer ${settings.botAccessToken}`,
            'Client-Id': CLIENT_ID
        }
    }
    const response = await fetch(endpoint, options)
    const twitchData = await response.json()

    if (response.status === 200) {
        return twitchData.data.length
            ? twitchData.data[0]
            : (await logMessage([`-> No game found`]), null)
    } else {
        await logMessage([`apiGetGame`, response.status, renderObj(twitchData, `twitchData`)])
        if (response.status === 401) {
            if (attempt < 3) {
                await logMessage([`-> Failed to get game info, getting new app access token...`])
                const retry = await apiGetTwitchAppAccessToken()
                if (retry) {
                    attempt++
                    return apiGetGame(query, attempt)
                }
            } else {
                await logMessage([`-> Failed to get game info after ${pluralize(attempt, `attempt`, `attempts`)}`])
                return null
            }
        } else { return null }
    }
}

async function apiRefreshToken(username, refreshToken) {
    await logMessage([`> apiRefreshToken(username: ${username})`])

    const endpoint = `https://id.twitch.tv/oauth2/token`
    const options = {
        method: `POST`,
        headers: {
            'Content-Type': `application/x-www-form-urlencoded`
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()

    if (response.status === 200) {
        if (username in lemonyFresh) {
            lemonyFresh[username].accessToken = twitchData.access_token
            lemonyFresh[username].refreshToken = twitchData.refresh_token
        }
        if (username in mods) {
            mods[username].accessToken = twitchData.access_token
            mods[username].refreshToken = twitchData.refresh_token
        }
        return true
    } else {
        await logMessage([`apiRefreshToken`, response.status, renderObj(twitchData, `twitchData`)])
        return null
    }
}

async function apiGetTokenScope(channel, attempt = 1) {
    await logMessage([`> apiGetTokenScope(channel: '${channel}', attempt: ${attempt})`])
    const streamer = lemonyFresh[channel]
    if (!streamer.accessToken || !streamer.refreshToken) {
        await logMessage([`-> ${channel} has no token`])
        return null
    }

    const endpoint = `https://id.twitch.tv/oauth2/validate`
    const options = {
        headers: { authorization: `OAuth ${streamer.accessToken}` }
    }
    const response = await fetch(endpoint, options)
    const twitchData = await response.json()

    if (response.status === 200) {
        return twitchData.scopes
    } else {
        await logMessage([`apiGetTokenScope ${channel}`, response.status, renderObj(twitchData, `twitchData`)])
        if (response.status === 401 && twitchData.message === `invalid access token`) {
            if (attempt < 3) {
                const retry = await apiRefreshToken(channel, streamer.refreshToken)
                if (retry) {
                    attempt++
                    return apiGetTokenScope(channel, attempt)
                }
            } else {
                await logMessage([`-> Failed to parse ${channel}'s access token after ${pluralize(attempt, `attempt`, `attempts`)}`])
                return null
            }
        } else { return null }
    }
}

async function apiCreateEventSub(channel, type, version, attempt = 1) {
    await logMessage([`> apiCreateEventSub(channel: '${channel}', type: '${type}', version: ${version}, attempt: ${attempt})`])
    const streamer = lemonyFresh[channel]

    const endpoint = `https://api.twitch.tv/helix/eventsub/subscriptions`

    const requestBody = {
        type: type,
        version: `${version}`,
        condition: {
            broadcaster_user_id: `${streamer.id}`
        },
        transport: {
            method: `websocket`,
            session_id: streamer.webSocketSessionId
        }
    }
    if ([
        `channel.follow`,
        `channel.shoutout.receive`
    ].includes(type)) {
        requestBody.condition.moderator_user_id = `${streamer.id}`
    }

    const options = {
        method: `POST`,
        headers: {
            authorization: `Bearer ${streamer.accessToken}`,
            'Client-Id': CLIENT_ID,
            'Content-Type': `application/json`
        },
        body: JSON.stringify(requestBody)
    }
    const response = await fetch(endpoint, options)

    if (response.status !== 202) {
        const twitchData = await response.json()
        await logMessage([`createEventSub`, response.status, renderObj(twitchData, `twitchData`)])
        if (response.status === 401) {
            if (attempt < 3) {
                await logMessage([`-> Failed to create '${type}' EventSub for ${channel}, refreshing token...`])
                const retry = await apiRefreshToken(channel, streamer.refreshToken)
                if (retry) {
                    attempt++
                    return apiCreateEventSub(channel, type, version, attempt)
                }
            } else {
                await logMessage([`-> Failed to create '${type}' EventSub for ${channel} after ${pluralize(attempt, `attempt`, `attempts`)}`])
                return null
            }
        } else if (response.status === 403) {
            return false
        }
    }
}

async function apiGetEventSubs(channel, attempt = 1) {
    await logMessage([`> apiGetEventSubs(channel: '${channel}', attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/eventsub/subscriptions`
    const options = {
        headers: {
            authorization: `Bearer ${lemonyFresh[channel].accessToken}`,
            'Client-Id': CLIENT_ID,
            'Content-Type': `application/json`
        }
    }
    const response = await fetch(endpoint, options)
    const twitchData = await response.json()

    if (response.status === 200) {
        return twitchData
    } else {
        await logMessage([`apiGetEventSubs ${channel}`, response.status, renderObj(twitchData, `twitchData`)])
        if (response.status === 401 && [`Invalid OAuth token`, `invalid access token`].includes(twitchData.message)) {
            if (attempt < 3) {
                const retry = await apiRefreshToken(channel, lemonyFresh[channel].refreshToken)
                if (retry) {
                    attempt++
                    return apiGetEventSubs(channel, attempt)
                }
            } else {
                await logMessage([`-> Failed to get ${channel}'s event subscriptions after ${pluralize(attempt, `attempt`, `attempts`)}`])
                return null
            }
        }
    }
}

async function apiDeleteEventSub(channel, id, attempt = 1) {
    await logMessage([`> apiDeleteEventSub(channel: '${channel}', session_id: '${id}', attempt: ${attempt})`])
    const streamer = lemonyFresh[channel]
    const endpoint = `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`
    const options = {
        method: `DELETE`,
        headers: {
            authorization: `Bearer ${streamer.accessToken}`,
            'Client-Id': CLIENT_ID
        }
    }
    const response = await fetch(endpoint, options)

    if (response.status !== 204) {
        const twitchData = await response.json()
        await logMessage([`apiDeleteEventSub ${channel}`, response.status, renderObj(twitchData, `twitchData`)])
        if (response.status === 401) {
            if (attempt < 3) {
                const retry = await apiRefreshToken(channel, streamer.refreshToken)
                if (retry) {
                    attempt++
                    return apiDeleteEventSub(channel, id, attempt)
                }
            } else {
                await logMessage([`-> Failed to delete EventSub for ${channel} after ${pluralize(attempt, `attempt`, `attempts`)}`])
                return null
            }
        } else if (response.status === 403) {
            return false
        }
    }
}

async function updateEventSubs(channel, maintenance = false) {
    await logMessage([`> updateEventSubs(channel: '${channel}')`])
    const arrScope = await apiGetTokenScope(channel)
    if (!arrScope) {
        await logMessage([`-> Unable to determine ${channel}'s token scope`])
        return
    }
    const obj = await apiGetEventSubs(channel)
    if (obj && `data` in obj) {
        const enabled = obj.data.filter(obj => obj.status === `enabled`).map(obj => obj.type)
        const disabled = obj.data.filter(obj => obj.status !== `enabled`)
        // Delete disabled EventSubs
        if (disabled.length) {
            console.log(`channel:`, channel, `enabled.length:`, enabled.length, `disabled.length:`, disabled.length)
            for (const el of disabled) {
                await apiDeleteEventSub(channel, el.id)
            }
        }
        // Rebuild EventSubs
        if (!enabled.includes(`stream.online`)) { await apiCreateEventSub(channel, `stream.online`, 1) }
        if (!enabled.includes(`stream.offline`)) { await apiCreateEventSub(channel, `stream.offline`, 1) }
        for (const scope of arrScope) {
            if (scope === `moderator:read:followers`) {
                if (!enabled.includes(`channel.follow`)) { await apiCreateEventSub(channel, `channel.follow`, 2) }
            }
            if (scope === `channel:manage:vips`) {
                if (!enabled.includes(`channel.vip.add`)) { await apiCreateEventSub(channel, `channel.vip.add`, 1) }
                if (!enabled.includes(`channel.vip.remove`)) { await apiCreateEventSub(channel, `channel.vip.remove`, 1) }
            }
            if (scope === `moderation:read`) {
                if (!enabled.includes(`channel.moderator.add`)) { await apiCreateEventSub(channel, `channel.moderator.add`, 1) }
                if (!enabled.includes(`channel.moderator.remove`)) { await apiCreateEventSub(channel, `channel.moderator.remove`, 1) }
            }
            if (scope === `moderator:manage:shoutouts`) {
                if (!enabled.includes(`channel.shoutout.receive`)) { await apiCreateEventSub(channel, `channel.shoutout.receive`, 1) }
            }
            if (scope === `channel:read:subscriptions`) {
                if (!enabled.includes(`channel.subscribe`)) { await apiCreateEventSub(channel, `channel.subscribe`, 1) }
                if (!enabled.includes(`channel.subscription.end`)) { await apiCreateEventSub(channel, `channel.subscription.end`, 1) }
                if (!enabled.includes(`channel.subscription.gift`)) { await apiCreateEventSub(channel, `channel.subscription.gift`, 1) }
                if (!enabled.includes(`channel.subscription.message`)) { await apiCreateEventSub(channel, `channel.subscription.message`, 1) }
            }
            if (scope === `bits:read`) {
                if (!enabled.includes(`channel.cheer`)) { await apiCreateEventSub(channel, `channel.cheer`, 1) }
            }
            if (scope === `channel:read:hype_train`) {
                if (!enabled.includes(`channel.hype_train.begin`)) { await apiCreateEventSub(channel, `channel.hype_train.begin`, 2) }
            }
        }
    } else { console.log(`* WARNING: Failed to get EventSubs for '${channel}'`) }
}

async function apiShoutOut(fromId, toId, moderatorName, moderatorId, accessToken, refreshToken, attempt = 1) {
    await logMessage([`> apiShoutOut(fromId: ${fromId}, toId: ${toId}, moderatorName: ${moderatorName}, moderatorId: ${moderatorId}, attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/chat/shoutouts?from_broadcaster_id=${fromId}&to_broadcaster_id=${toId}&moderator_id=${moderatorId}`
    const options = {
        method: `POST`,
        headers: {
            authorization: `Bearer ${accessToken}`,
            'Client-Id': CLIENT_ID
        }
    }
    const response = await fetch(endpoint, options)

    if (response.status === 204) {
        await logMessage([`-> Shoutout posted successfully!`])
    } else {
        const twitchData = await response.json()
        await logMessage([`apiShoutOut`, response.status, renderObj(twitchData, `twitchData`)])
        if (attempt < 3) {
            if (response.status === 401) {
                const retry = await apiRefreshToken(moderatorName, refreshToken)
                if (retry) {
                    attempt++
                    accessToken = moderatorName in mods ? mods[moderatorName].accessToken : lemonyFresh[moderatorName].accessToken
                    refreshToken = moderatorName in mods ? mods[moderatorName].refreshToken : lemonyFresh[moderatorName].refreshToken
                    return apiShoutOut(fromId, toId, moderatorName, moderatorId, accessToken, refreshToken, attempt)
                }
            } else { return null }
        } else {
            await logMessage([`-> Failed to post shoutout after ${pluralize(attempt, `attempt`, `attempts`)}`])
            return null
        }
    }
}

async function apiPostAnnouncement(channel, broadcasterId, moderatorId, moderatorName, message, color, accessToken, refreshToken, attempt = 1) {
    await logMessage([`> apiPostAnnouncement(channel: '${channel}', broadcasterId: ${broadcasterId}, moderatorId: ${moderatorId}, moderatorName: '${moderatorName}', message: '${message}', color: '${color}', attempt: ${attempt})`])

    const requestBody = {
        message: message,
        color: color
    }
    const endpoint = `https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${broadcasterId}&moderator_id=${moderatorId}`
    const options = {
        method: `POST`,
        headers: {
            authorization: `Bearer ${accessToken}`,
            'Client-Id': CLIENT_ID,
            'Content-Type': `application/json`
        },
        body: JSON.stringify(requestBody)
    }

    const response = await fetch(endpoint, options)
    if (response.status === 204) {
        return true
    } else {
        const twitchData = await response.json()
        await logMessage([`apiPostAnnouncement`, response.status, renderObj(twitchData, `twitchData`)])
        if (attempt < 3) {
            if (response.status === 401) {
                const retry = await apiRefreshToken(moderatorName, refreshToken)
                if (retry) {
                    attempt++
                    accessToken = moderatorName in mods ? mods[moderatorName].accessToken : lemonyFresh[moderatorName].accessToken
                    refreshToken = moderatorName in mods ? mods[moderatorName].refreshToken : lemonyFresh[moderatorName].refreshToken
                    return apiPostAnnouncement(channel, broadcasterId, moderatorId, moderatorName, message, color, accessToken, refreshToken, attempt)
                }
            } else { return null }
        } else {
            await logMessage([`-> Failed to post announcement after ${pluralize(attempt, `attempt`, `attempts`)}`])
            return null
        }
    }
}

async function apiStartPoll(channel, broadcasterId, title, arrChoices, duration, accessToken, refreshToken, attempt = 1) {
    await logMessage([`> apiStartPoll(channel: '${channel}', broadcasterId: ${broadcasterId}, title: '${title}', arrChoices: ${arrChoices.length}, duration: ${duration}, attempt: ${attempt})`])

    const requestBody = {
        'broadcaster_id': broadcasterId,
        'title': title,
        'choices': arrChoices,
        'duration': duration
    }
    const endpoint = `https://api.twitch.tv/helix/polls`
    const options = {
        method: `POST`,
        headers: {
            authorization: `Bearer ${accessToken}`,
            'Client-Id': CLIENT_ID,
            'Content-Type': `application/json`
        },
        body: JSON.stringify(requestBody)
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()

    if (response.status === 200) {
        lemonyFresh[channel].pollId = twitchData.data[0].id
        setTimeout(() => { lemonyFresh[channel].pollId = `` }, duration * 1000)
        return true
    } else {
        await logMessage([`apiStartPoll`, response.status, renderObj(twitchData, `twitchData`)])
        if (response.status === 401) {
            if (attempt < 3) {
                const retry = await apiRefreshToken(channel, refreshToken)
                if (retry) {
                    attempt++
                    accessToken = lemonyFresh[channel].accessToken
                    refreshToken = lemonyFresh[channel].refreshToken
                    return apiStartPoll(channel, broadcasterId, title, arrChoices, duration, accessToken, refreshToken, attempt)
                }
            } else {
                await logMessage([`-> Failed to start poll after ${pluralize(attempt, `attempt`, `attempts`)}`])
                return null
            }
        } else { return null }
    }
}

async function apiEndPoll(channel, broadcasterId, pollId, status, accessToken, refreshToken, attempt = 1) {
    await logMessage([`channel: ${channel}, broadcasterId: ${broadcasterId}, pollId: ${pollId}, status: ${status}, attempt: ${attempt}`])
    const endpoint = `https://api.twitch.tv/helix/polls?broadcaster_id=${broadcasterId}&id=${pollId}&status=${status}`
    const options = {
        method: `PATCH`,
        headers: {
            authorization: `Bearer ${accessToken}`,
            'Client-Id': CLIENT_ID
        }
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    await logMessage([`apiEndPoll`, response.status, renderObj(twitchData.data[0], `twitchData.data[0]`)])

    if (response.status === 200) {
        lemonyFresh[channel].pollId = ``
        return true
    } else if (response.status === 401) {
        if (attempt < 3) {
            const retry = await apiRefreshToken(channel, refreshToken)
            if (retry) {
                attempt++
                accessToken = lemonyFresh[channel].accessToken
                refreshToken = lemonyFresh[channel].refreshToken
                return apiEndPoll(channel, broadcasterId, pollId, status, accessToken, refreshToken, attempt)
            }
        } else {
            await logMessage([`-> Failed to end poll after ${pluralize(attempt, `attempt`, `attempts`)}`])
            return null
        }
    } else { return null }
}

async function apiBanUsers(broadcasterId, moderatorName, moderatorId, arrUsers, reason, accessToken, refreshToken, attempt = 1) {
    await logMessage([`> apiBanUsers(broadcasterId: ${broadcasterId}, moderatorName: ${moderatorName}, moderatorId: ${moderatorId}, arrUsers: ${arrUsers.length}, attempt: ${attempt})`])

    // Look up/ban each user one-by-one
    const endpoint = `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${broadcasterId}&moderator_id=${moderatorId}`
    const banned = []
    const alreadyBanned = []

    for (const name of arrUsers) {
        const userToBan = getToUser(name) // sanitize name to remove possible @ and caps
        const twitchUser = userToBan in users
            ? users[userToBan]
            : await apiGetTwitchUser(userToBan)
        if (!twitchUser.id) { return false }

        const requestBody = {
            'data': {
                user_id: `${twitchUser.id}`,
                reason: reason
            }
        }
        const options = {
            method: `POST`,
            headers: {
                authorization: `Bearer ${accessToken}`,
                'Client-Id': CLIENT_ID,
                'Content-Type': `application/json`
            },
            body: JSON.stringify(requestBody)
        }

        const response = await fetch(endpoint, options)
        const twitchData = await response.json()

        if (response.status === 200) {
            banned.push(userToBan)
        } else if (response.status === 400 && twitchData.message === `The user specified in the user_id field is already banned.`) {
            alreadyBanned.push(userToBan)
        } else {
            await logMessage([`apiBanUsers`, response.status, renderObj(twitchData, `twitchData`)])
            if (response.status === 401) {
                if (attempt < 3) {
                    const retry = await apiRefreshToken(moderatorName, refreshToken)
                    if (retry) {
                        attempt++
                        accessToken = moderatorName in mods ? mods[moderatorName].accessToken : lemonyFresh[moderatorName].accessToken
                        refreshToken = moderatorName in mods ? mods[moderatorName].refreshToken : lemonyFresh[moderatorName].refreshToken
                        return apiBanUsers(broadcasterId, moderatorName, moderatorId, arrUsers, reason, accessToken, refreshToken, attempt)
                    }
                } else {
                    await logMessage([`-> Failed to ban user after ${pluralize(attempt, `attempt`, `attempts`)}`])
                    return null
                }
            } else { return null }
        }
    }

    return { banned: banned, alreadyBanned: alreadyBanned }
}

async function initWebSocket(bot, chatroom, channel, path = `wss://eventsub.wss.twitch.tv/ws`) {
    await logMessage([`> initWebSocket(channel: '${channel}')`])
    const arrScope = await apiGetTokenScope(channel)
    if (!arrScope) {
        await logMessage([`-> Unable to determine ${channel}'s token scope`])
        return
    }
    openWebSocket(channel, path)
    const ws = getWebSocket(channel, path !== `wss://eventsub.wss.twitch.tv/ws`)

    ws.onopen = () => logMessage([`-> WebSocket connection established for ${channel}`])

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        handleMessage(channel, message)

        // If new welcome message, save session ID and create event subs, else close
        if (message.metadata.message_type === `session_welcome`) {
            if (lemonyFresh[channel].webSocketSessionId === message.payload.session.id) {
                // close if 2 web sockets
                handleReconnect(channel)
            } else {
                lemonyFresh[channel].webSocketSessionId = message.payload.session.id
                // EventSubs don't quite seem to expire immediately?
                setTimeout(() => updateEventSubs(channel), 500)
            }
        }

        // Handle events
        if (`subscription` in message.payload) {
            handleEvent(bot, chatroom, channel, message.payload.subscription.type, message.payload.event)
        }

        // Handle reconnection
        if (message.metadata.message_type === `session_reconnect`) {
            initWebSocket(bot, chatroom, channel, message.payload.session.reconnect_url)
        }
    }

    ws.onclose = (event) => {
        const { code, reason, wasClean } = event
        removeClosedWebSockets(channel, code)
        wasClean
            ? logMessage([`-> WebSocket connection for ${channel} closed with code ${code}: '${reason}'`])
            : logMessage([`-> WebSocket connection for ${channel} died unexpectedly with code ${code}${reason ? `: '${reason}'` : ``}`])

        if (![1000, 4003, 4004].includes(code)) { // Not on purpose, unused, or from reconnection
            initWebSocket(bot, chatroom, channel)
        }
    }

    ws.onerror = (error) => logMessage([`WebSocket error from ${channel}:`, error])
}

module.exports = {
    apiGetTwitchAppAccessToken,
    apiGetTwitchUser,
    apiGetTwitchChannel,
    apiRefreshToken,
    apiGetTokenScope,
    apiGetEventSubs,
    updateEventSubs,
    initWebSocket,
    async checkToken(props) {
        const { bot, chatroom, channel } = props
        const arrScope = await apiGetTokenScope(channel)
        if (!arrScope) {
            bot.say(chatroom, `Channel has no access token!`)
            return
        }

        const allScopes = [
            `moderator:read:followers`,
            `moderation:read`,
            `channel:manage:vips`,
            `moderator:manage:shoutouts`,
            `channel:read:subscriptions`,
            `bits:read`,
            `moderator:manage:announcements`,
            `moderator:manage:banned_users`,
            `moderator:read:shoutouts`,
            `channel:read:hype_train`,
            `channel:manage:broadcast`
        ].filter(el => !arrScope.includes(el))

        const arrAbilities = allScopes.map(el => {
            if (el === `moderator:read:followers`) { return `new followers` }
            else if (el === `moderation:read`) { return `new mods` }
            else if (el === `channel:manage:vips`) { return `new VIPs` }
            else if (el === `moderator:manage:shoutouts`) { return `shoutouts from other streamers` }
            else if (el === `channel:read:subscriptions`) { return `subs/gift subs` }
            else if (el === `bits:read`) { return `cheering bits` }
            else if (el === `moderator:manage:announcements`) { return `making announcements` }
            else if (el === `moderator:manage:banned_users`) { return `banning spambots` }
            else if (el === `moderator:read:shoutouts`) { return `receiving shoutouts` }
            else if (el === `channel:read:hype_train`) { return `detecting hype trains` }
            else if (el === `channel:manage:broadcast`) { return `updating your stream game or title` }
        }).filter(el => el)

        const reply = arrAbilities.length
            ? `Token is unable to handle ${arrToList(arrAbilities, `or`)}. Please use !access to renew your token and get all the features!`
            : `Token has all available features! Thanks for using ${BOT_USERNAME}!`
        bot.say(chatroom, reply)
    },
    async deleteEventSubs(channel) {
        await logMessage([`> deleteEventSubs(channel: '${channel}')`])
        const obj = await apiGetEventSubs(channel)
        if (obj && `data` in obj) {
            if (obj.data.length) {
                for (const el of obj.data) {
                    await apiDeleteEventSub(channel, el.id)
                }
            }
        }
    },
    accessInstructions(props) {
        const { bot, chatroom, username } = props
        logMessage([`> accessInstructions(chatroom: '${chatroom}', username: '${username}')`])
        const reply = `For streamers/mods, please follow this link and instructions, and copy/paste "!authorize <code>" in the chat! ${REDIRECT_URI}`
        bot.say(chatroom, reply)
    },
    async getBotToken(props) {
        const { bot, chatroom, channel } = props
        const success = await apiGetTwitchAppAccessToken()
        const positiveEmote = getContextEmote(`positive`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)

        const reply = success
            ? `Token updated! ${positiveEmote}`
            : `Error updating app access token! ${negativeEmote}`
        bot.say(chatroom, reply)
    },
    async startPoll(props) {
        const { bot, chatroom, args, channel, username, isMod } = props
        const str = args.join(` `)
        await logMessage([`> startPoll(channel: '${channel}', username: ${username}, str: '${str}', isMod: ${isMod})`])

        // Mods only
        if (!isMod) {
            await logMessage([`-> ${username} isn't a mod, ignoring`])
            return
        }

        // Check for poll already in progress
        const negativeEmote = getContextEmote(`negative`, channel)
        if (lemonyFresh[channel].pollId) {
            bot.say(chatroom, `There is already a poll in progress! ${negativeEmote}`)
            return
        }

        // Get duration
        const params = str.split(new RegExp(/ ?\/ ?/))
        const seconds = params.shift()
        let duration = Number(seconds)
        if ([`<`, `>`].some(bracket => seconds.includes(bracket))) {
            const regex = /^<(\d+)>$/
            if (!seconds.match(regex)) {
                const neutralEmote = getContextEmote(`neutral`, channel)
                bot.say(chatroom, `Error: Please don't use angle brackets in the seconds! ${neutralEmote}`)
                return
            }
            else { duration = Number(seconds.split(regex)[1]) }

        }
        if (isNaN(duration) || duration < 15 || duration > 1800) {
            bot.say(chatroom, `Error: Duration should be a number between 15 and 1800, followed by a slash. Try: !poll <seconds> / Title of poll / First choice / Second choice ...`)
            return
        }

        // Get title and choices
        const title = params.shift()
        // Params length should be more than 2, and shouldn't be longer than 6
        if (params.length < 2 || params.length > 5) {
            bot.say(chatroom, `Error: Between 2-5 choices are allowed. Try: !poll <seconds> / Title of poll / First choice / Second choice ...`)
            return
        }
        const arrChoices = params.map(choice => { return { title: choice } })

        // Use broadcaster's access token
        const broadcasterId = lemonyFresh[channel].id
        const accessToken = lemonyFresh[channel].accessToken
        const refreshToken = lemonyFresh[channel].refreshToken

        // Stop if the channel has no access token
        if (!accessToken || !refreshToken) {
            await logMessage([`-> ${channel} has no access and/or refresh token, can't make create poll`])
            bot.say(chatroom, `No access token found for ${channel in users ? users[channel].displayName : channel}'s channel! ${negativeEmote} Please use !access to renew your credentials!`)
            return
        }

        const positiveEmote = getContextEmote(`positive`, channel)
        const success = await apiStartPoll(channel, broadcasterId, title, arrChoices, duration, accessToken, refreshToken)
        const reply = success
            ? `Poll created, go vote! ${positiveEmote}`
            : `Error creating poll! ${negativeEmote}`
        bot.say(chatroom, reply)
    },
    async endPoll(props) {
        const { bot, chatroom, command, channel, username, isMod } = props
        const status = command === `!endpoll` ? `TERMINATED` : command === `!cancelpoll` ? `ARCHIVED` : null
        await logMessage([`> pollEnd(chatroom: '${chatroom}', status: '${status}')`])

        // Mods only
        if (!isMod) {
            await logMessage([`-> ${username} isn't a mod, ignoring`])
            return
        }

        // Check whether poll is currently running
        const negativeEmote = getContextEmote(`negative`, channel)
        if (!lemonyFresh[channel].pollId) {
            bot.say(chatroom, `There is no active poll! ${negativeEmote}`)
            return
        }

        // Determine whether to get rid of poll, or bring it to an end
        const neutralEmote = getContextEmote(`neutral`, channel)
        if (!status) {
            bot.say(chatroom, `Use !stoppoll to finish and show the results, or !cancelpoll to remove it! ${neutralEmote}`)
            return
        }

        const broadcasterId = lemonyFresh[channel].id
        const pollId = lemonyFresh[channel].pollId
        const accessToken = lemonyFresh[channel].accessToken
        const refreshToken = lemonyFresh[channel].refreshToken

        const positiveEmote = getContextEmote(`positive`, channel)
        const success = await apiEndPoll(channel, broadcasterId, pollId, status, accessToken, refreshToken)
        const reply = success
            ? `Poll ${status === `TERMINATED` ? `finished` : `was canceled`}! ${positiveEmote}`
            : `Error ending poll! ${negativeEmote}`
        bot.say(chatroom, reply)
    },
    async handleShoutout(props) {
        const { bot, chatroom, channel, username, toUser, isMod, isModOrVIP } = props
        await logMessage([`> handleShoutout(channel: '${channel}', username: ${username}, toUser: ${toUser}, isMod: ${isMod}, isModOrVIP: ${isModOrVIP})`])

        if (!isModOrVIP) {
            await logMessage([`-> ${username} isn't a mod or VIP, ignoring`])
            return
        }
        // Stop if no user specified
        if (!toUser) {
            await logMessage([`-> No user specified to give a shoutout to`])
            return
        }

        if (lemonyFresh[channel].timers[`!so`].listening) {
            resetCooldownTimer(channel, `!so`)

            // Stop if user doesn't exist
            const twitchUser = await apiGetTwitchUser(toUser)
            if (!twitchUser) {
                await logMessage([`-> No user '${toUser}' found, exiting handleShoutout function`])
                bot.say(chatroom, `No user ${toUser} was found! :O`)
                return
            }

            const stream = await apiGetTwitchChannel(twitchUser.id)
            if (!stream) {
                await logMessage([`-> Failed to fetch ${toUser}'s channel, exiting handleShoutout function`])
                bot.say(chatroom, `Failed to fetch ${toUser}'s stream information! :O`)
                return
            }
            const neutralEmote = getContextEmote(`neutral`, channel)
            const reply = `Let's give a shoutout to ${stream.broadcaster_name}! ${stream.game_name
                ? `They were last ${stream.game_name === `Just Chatting`
                    ? `chatting with viewers`
                    : `playing ${stream.game_name}`}${twitchUser.broadcaster_type
                        ? `, and are a Twitch ${twitchUser.broadcaster_type.substring(0, 1).toUpperCase() + twitchUser.broadcaster_type.substring(1)}!`
                        : `.`}`
                : `#NoGameGang`
                } Follow them here: https://www.twitch.tv/${stream.broadcaster_login} ${neutralEmote}`

            bot.say(chatroom, reply)

            // Mods only - Twitch official shoutout
            if (isMod) {
                if (channel === toUser) {
                    await logMessage([`-> Can't give Twitch official shoutout to ${channel}`])
                    return
                }

                const fromId = lemonyFresh[channel].id
                const toId = twitchUser.id

                // If moderator doesn't have a token, use broadcaster's
                const moderatorHasToken = username in mods && mods[username].isModIn.includes(chatroom) && !!mods[username].accessToken && !!mods[username].refreshToken
                const moderatorName = moderatorHasToken ? username : channel
                const moderatorId = moderatorHasToken ? mods[username].id : lemonyFresh[channel].id
                const accessToken = moderatorHasToken ? mods[username].accessToken : lemonyFresh[channel].accessToken
                const refreshToken = moderatorHasToken ? mods[username].refreshToken : lemonyFresh[channel].refreshToken

                // Stop if neither the channel nor a mod has an access token
                if (!accessToken || !refreshToken) {
                    await logMessage([`-> ${moderatorName} has no access and/or refresh token, can't give shoutout`])
                    return
                }
                apiShoutOut(fromId, toId, moderatorName, moderatorId, accessToken, refreshToken)
            }

        } else { await logMessage([`-> Timer in ${channel} '!so' is not currently listening`]) }
    },
    async updateStreamGame(props) {
        const { bot, chatroom, args, channel, isMod } = props
        if (!isMod) {
            await logMessage([`-> ${username} isn't a mod, ignoring`])
            return
        }
        const query = args.join(` `)
        await logMessage([`> updateStreamGame(query: '${query}')`])

        const negativeEmote = getContextEmote(`negative`, channel)
        const positiveEmote = getContextEmote(`positive`, channel)
        if (!query) {
            const streamer = channel in users
                ? users[channel].nickname || users[channel].displayName
                : channel
            const stream = await apiGetTwitchChannel(lemonyFresh[channel].id)
            bot.say(chatroom, `${streamer} is currently playing ${stream.game_name}!`)
            return
        }

        const game = await apiGetGame(query)
        if (!game) {
            bot.say(chatroom, `No game found ${negativeEmote}`)
            return
        }

        const requestBody = { game_id: game.id }
        const success = await apiUpdateTwitchChannel(channel, requestBody)

        const reply = success
            ? `Stream game successfully updated to ${game.name}! ${positiveEmote}`
            : `Unable to update stream game! ${negativeEmote}`
        bot.say(chatroom, reply)
    },
    async updateStreamTitle(props) {
        const { bot, chatroom, args, channel, isMod } = props
        if (!isMod) {
            await logMessage([`-> ${username} isn't a mod, ignoring`])
            return
        }
        const title = args.join(` `)
        await logMessage([`> updateStreamTitle(title: '${title}')`])

        const negativeEmote = getContextEmote(`negative`, channel)
        const positiveEmote = getContextEmote(`positive`, channel)
        if (!title) {
            bot.say(chatroom, `No title provided ${negativeEmote}`)
            return
        }

        const requestBody = { title: title }
        const success = await apiUpdateTwitchChannel(channel, requestBody)

        const reply = success
            ? `Stream title updated successfully! ${positiveEmote}`
            : `Unable to update stream title! ${negativeEmote}`
        bot.say(chatroom, reply)
    },
    async makeAnnouncement(props) {
        const { bot, chatroom, args, command, channel, username, isMod } = props
        const message = args.join(` `)
        const commandSuffix = command.split(/^!announce([a-z]*)$/)[1]
        const color = [`blue`, `green`, `orange`, `purple`].includes(commandSuffix) ? commandSuffix : `primary`
        await logMessage([`> newMakeAnnouncement(channel: '${channel}', username: '${username}', isMod: ${isMod}, message: '${message}', color: '${color}')`])

        if (!isMod) {
            await logMessage([`-> ${username} isn't a mod, ignoring`])
            return
        }

        const negativeEmote = getContextEmote(`negative`, channel)
        if (!message) {
            bot.say(chatroom, `No announcement message provided! ${negativeEmote}`)
            return
        }

        const broadcasterId = lemonyFresh[channel].id
        // If moderator doesn't have a token, use broadcaster's
        const moderatorHasToken = username in mods && mods[username].isModIn.includes(chatroom) && !!mods[username].accessToken && !!mods[username].refreshToken
        const moderatorName = moderatorHasToken ? username : channel
        const moderatorId = moderatorHasToken ? mods[username].id : lemonyFresh[channel].id
        const accessToken = moderatorHasToken ? mods[username].accessToken : lemonyFresh[channel].accessToken
        const refreshToken = moderatorHasToken ? mods[username].refreshToken : lemonyFresh[channel].refreshToken

        // Stop if neither the channel nor a mod has an access token
        if (!accessToken || !refreshToken) {
            await logMessage([`-> ${moderatorName} has no access and/or refresh token, can't make announcement`])
            bot.say(chatroom, `No access token found! ${negativeEmote} Please use !access to renew your credentials!`)
            return
        }

        const success = apiPostAnnouncement(channel, broadcasterId, moderatorId, moderatorName, message, color, accessToken, refreshToken)
        if (!success) { bot.say(chatroom, `Failed to post announcement! ${negativeEmote}`) }
    },
    async authorizeToken(props) {
        const { bot, chatroom, args, username, channel, isLemonyFreshMember } = props
        await logMessage([`> authorizeToken(channel: '${channel}', username: '${username}', isLemonyFreshMember: ${isLemonyFreshMember})`])

        // Can only be used by a streamer or mod
        if (!isLemonyFreshMember && !(username in mods)) {
            await logMessage([`-> ${username} is neither a known streamer nor mod, ignoring`])
            return
        }

        const authCode = args[0]
        if (!authCode) {
            await logMessage([`-> No authorization code provided`])
            return
        }

        const hypeEmote = getContextEmote(`hype`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)

        const success = await apiGetOAUTHToken(username, authCode)
        const reply = success
            ? `Access token was granted! ${hypeEmote}`
            : `Failed to grant access token! ${negativeEmote}`
        bot.say(chatroom, reply)
        updateEventSubs(channel)
    },
    async banUsers(props) {
        const { bot, chatroom, args, channel, username, isMod } = props
        await logMessage([`> newBanUsers(channel: '${channel}', username: '${username}', isMod: ${isMod}, args: '${args.join(`', '`)}')`])

        // Mods only
        if (!isMod) {
            await logMessage([`-> ${username} isn't a mod, ignoring`])
            return
        }

        // Make sure at least one user was listed
        if (args.length === 0) {
            await logMessage([`-> No users provided to ban`])
            return
        }

        // If moderator doesn't have a token, use broadcaster's
        const moderatorHasToken = username in mods && mods[username].isModIn.includes(chatroom) && !!mods[username].accessToken && !!mods[username].refreshToken
        const moderatorName = moderatorHasToken ? username : channel
        const moderatorId = moderatorHasToken ? mods[username].id : lemonyFresh[channel].id
        const accessToken = moderatorHasToken ? mods[username].accessToken : lemonyFresh[channel].accessToken
        const refreshToken = moderatorHasToken ? mods[username].refreshToken : lemonyFresh[channel].refreshToken

        const broadcasterId = lemonyFresh[channel].id
        const negativeEmote = getContextEmote(`negative`, channel)

        // Stop if neither the channel nor a mod has an access token
        if (!accessToken || !refreshToken) {
            await logMessage([`-> ${moderatorName} has no access and/or refresh token, can't make announcement`])
            bot.say(chatroom, `No access token found! ${negativeEmote} Please use !access to renew your credentials!`)
            return
        }

        // Please wait if list will take a moment to process
        if (args.length >= 5) { bot.say(chatroom, `Please wait while I work on this list of ${args.length.toLocaleString()} usernames...`) }

        const reason = `Banned by ${username} via ${BOT_USERNAME}`
        const success = await apiBanUsers(broadcasterId, moderatorName, moderatorId, args, reason, accessToken, refreshToken)

        if (!success) {
            bot.say(chatroom, `Failed to ban ${args.length === 1 ? `user` : `users`}! ${negativeEmote}`)
        } else {
            const { banned, alreadyBanned } = success
            const positiveEmote = getContextEmote(`positive`, channel)
            const reply = `Banned ${pluralize(banned.length, `user`, `users`)}${banned.length
                ? `: ${banned.join(`, `)} ${positiveEmote}`
                : `! ${negativeEmote}`
                }${alreadyBanned.length ? ` Already banned: ${alreadyBanned.join(`, `)}` : ``}`
            bot.say(chatroom, reply)
        }
    },
    async autoBanUser(props) {
        const { bot, chatroom, username, channel } = props
        await logMessage([`> newAutoBanUser(channel: '${channel}', username: '${username}')`])

        const broadcasterId = lemonyFresh[channel].id
        const accessToken = lemonyFresh[channel].accessToken
        const refreshToken = lemonyFresh[channel].refreshToken

        const greetingEmote = getContextEmote(`greeting`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)
        const dumbEmote = getContextEmote(`dumb`, channel)

        // Stop if the channel doesn't have an access token
        if (!accessToken || !refreshToken) {
            await logMessage([`-> ${channel} has no access token, can't autoban user '${username}'`])
            const reply = `Hi, ${users[username].displayName}... ${lemonyFresh[channel].bttvEmotes.includes(`modCheck`) ? `modCheck` : `${dumbEmote}`} Any mods in chat?`
            bot.say(chatroom, reply)
            return
        }

        const reason = `Auto-banned by ${BOT_USERNAME} for message content`
        const success = await apiBanUsers(broadcasterId, channel, broadcasterId, [username], reason, accessToken, refreshToken)

        if (success) {
            delete users[username]
            const reply = `Begone, spammer! ${greetingEmote}`
            bot.say(chatroom, reply)
        } else if (success === null) {
            bot.say(chatroom, `Failed to autoban user! ${negativeEmote} Please update ${channel in users ? users[channel].displayName : channel}'s credentials by using !access again!`)
        } else {
            bot.say(chatroom, `Failed to autoban user! ${dumbEmote}`)
        }
    }
}
