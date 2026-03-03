const CLIENT_ID = process.env.CLIENT_ID

const { settings } = require(`../config`)
const { joinedChatrooms } = require(`../data`)

const { pluralize, logMessage, renderObj } = require(`../utils`)
const { apiGetTwitchAppAccessToken } = require(`../commands/twitch`)

async function apiCreateConduit(shardCount, attempt = 1) {
    await logMessage([`> apiCreateConduit(shardCount: ${shardCount}, attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/eventsub/conduits`
    const requestBody = { shard_count: shardCount }
    const options = {
        method: `POST`,
        headers: {
            Authorization: `Bearer ${settings.botAccessToken}`,
            'Client-Id': `${CLIENT_ID}`,
            'Content-Type': `application/json`
        },
        body: JSON.stringify(requestBody)
    }

    try {
        const response = await fetch(endpoint, options)
        const twitchData = await response.json()
        if (response.status === 200) {
            settings.conduitId = twitchData.data[0].id
        } else {
            await logMessage([renderObj(twitchData, `twitchData`)])
            if (response.status === 401) {
                if (attempt < 3) {
                    const retry = await apiGetTwitchAppAccessToken()
                    if (retry) {
                        attempt++
                        return apiCreateConduit(attempt)
                    }
                } else {
                    await logMessage([`-> Failed to create Twitch conduit after ${pluralize(attempt, `attempt`, `attempts`)}`])
                }
            }
        }
    } catch (err) {
        await logMessage([`apiCreateConduit ${err}`])
    }
}

async function apiGetConduits(attempt = 1) {
    await logMessage([`> apiGetConduits(attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/eventsub/conduits`
    const options = {
        headers: {
            Authorization: `Bearer ${settings.botAccessToken}`,
            'Client-Id': `${CLIENT_ID}`
        }
    }

    try {
        const response = await fetch(endpoint, options)
        const twitchData = await response.json()
        if (response.status === 200) {
            // console.log(twitchData) // delete after testing
            return twitchData.data
        } else {
            await logMessage([`apiGetConduits`, response.status, twitchData])
            if (response.status === 401) {
                if (attempt < 3) {
                    const retry = await apiGetTwitchAppAccessToken()
                    if (retry) {
                        attempt++
                        return apiGetConduits(attempt)
                    }
                } else {
                    await logMessage([`-> Failed to get Twitch conduits after ${pluralize(attempt, `attempt`, `attempts`)}`])
                    return null
                }
            } else { return null }
        }
    } catch (err) {
        await logMessage([`apiGetConduits ${err}`])
        return false
    }
}

async function apiUpdateConduit(conduitId, shardCount, attempt = 1) {
    await logMessage([`> apiUpdateConduit(conduitId: '${conduitId}', shardCount: ${shardCount}, attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/eventsub/conduits`
    const requestBody = {
        id: conduitId,
        shard_count: shardCount
    }
    const options = {
        method: `PATCH`,
        headers: {
            Authorization: `Bearer ${settings.botAccessToken}`,
            'Client-Id': `${CLIENT_ID}`,
            'Content-Type': `application/json`
        },
        body: JSON.stringify(requestBody)
    }

    try {
        const response = await fetch(endpoint, options)
        const twitchData = await response.json()
        if (response.status === 200) {
            return twitchData.data
        } else {
            await logMessage([renderObj(twitchData, `twitchData`)])
            if (response.status === 401) {
                if (attempt < 3) {
                    const retry = await apiGetTwitchAppAccessToken()
                    if (retry) {
                        attempt++
                        return apiUpdateConduit(attempt)
                    }
                } else {
                    await logMessage([`-> Failed to create Twitch conduit after ${pluralize(attempt, `attempt`, `attempts`)}`])
                    return null
                }
            } else { return null }
        }
    } catch (err) {
        await logMessage([`apiUpdateConduit ${err}`])
        return null
    }
}

async function apiDeleteConduit(conduitId, attempt = 1) {
    await logMessage([`> apiDeleteConduit(conduitId, '${conduitId}', attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/eventsub/conduits?id=${conduitId}`
    const options = {
        method: `DELETE`,
        headers: {
            Authorization: `Bearer ${settings.botAccessToken}`,
            'Client-Id': `${CLIENT_ID}`
        }
    }

    try {
        const response = await fetch(endpoint, options)
        if (response.status === 204) {
            settings.conduitId = ``
        } else {
            const twitchData = await response.json()
            await logMessage([renderObj(twitchData, `twitchData`)])
            if (response.status === 401) {
                if (attempt < 3) {
                    const retry = await apiGetTwitchAppAccessToken()
                    if (retry) {
                        attempt++
                        return apiDeleteConduit(attempt)
                    }
                } else {
                    await logMessage([`-> Failed to delete Twitch conduit after ${pluralize(attempt, `attempt`, `attempts`)}`])
                }
            }
        }
    } catch (err) {
        await logMessage([`apiDeleteConduit ${err}`])
    }
}

async function apiGetConduitShards(conduitId, attempt = 1) {
    await logMessage([`> apiGetConduitShards(conduitId: '${conduitId}', attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/eventsub/conduits/shards?conduit_id=${conduitId}`
    const options = {
        headers: {
            Authorization: `Bearer ${settings.botAccessToken}`,
            'Client-Id': `${CLIENT_ID}`
        }
    }

    try {
        const response = await fetch(endpoint, options)
        const twitchData = await response.json()
        if (response.status !== 200) {
            await logMessage([renderObj(twitchData, `twitchData`)])
            if (response.status === 401) {
                if (attempt < 3) {
                    const retry = await apiGetTwitchAppAccessToken()
                    if (retry) {
                        attempt++
                        return apiGetConduitShards(attempt)
                    }
                } else {
                    await logMessage([`-> Failed to get Twitch conduit shard after ${pluralize(attempt, `attempt`, `attempts`)}`])
                }
            }
        } else { return twitchData.data } // delete after testing
    } catch (err) {
        await logMessage([`apiGetConduitShards ${err}`])
    }
}

async function apiUpdateConduitShard(conduitId, shardId, webSocketSessionId, attempt = 1) {
    await logMessage([`> apiUpdateConduitShard(conduitId: '${conduitId}', shardId: ${shardId}, webSocketSessionId: '${webSocketSessionId}', attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/eventsub/conduits/shards`
    const requestBody = {
        conduit_id: conduitId,
        shards: [{
            id: `${shardId}`,
            transport: {
                method: `websocket`,
                session_id: webSocketSessionId
            }
        }]
    }
    const options = {
        method: `PATCH`,
        headers: {
            Authorization: `Bearer ${settings.botAccessToken}`,
            'Client-Id': `${CLIENT_ID}`,
            'Content-Type': `application/json`
        },
        body: JSON.stringify(requestBody)
    }

    try {
        const response = await fetch(endpoint, options)
        const twitchData = await response.json()
        if (response.status !== 202) {
            await logMessage([renderObj(twitchData, `twitchData`)])
            if (response.status === 401) {
                if (attempt < 3) {
                    const retry = await apiGetTwitchAppAccessToken()
                    if (retry) {
                        attempt++
                        return apiUpdateConduitShard(attempt)
                    }
                } else {
                    await logMessage([`-> Failed to update Twitch conduit shards after ${pluralize(attempt, `attempt`, `attempts`)}`])
                }
            }
        }
    } catch (err) {
        await logMessage([`apiUpdateConduitShard ${err}`])
    }
}

module.exports = {
    apiCreateConduit, // is in: handlers.js, dev.js
    apiGetConduits, // is in: handlers.js, dev.js
    apiUpdateConduit, // is in: dev.js
    apiDeleteConduit, // is in: dev.js
    apiGetConduitShards, // is in: dev.js
    apiUpdateConduitShard, // is in: dev.js
    async assignToConduit(chatroom, webSocketSessionId) {
        if (!settings.conduitId) {
            // await logMessage([`No conduit ID`])
            console.log(`assignToConduit: No conduit ID`)
            return
        }
        const index = joinedChatrooms.indexOf(chatroom)
        const conduits = await apiGetConduits()
        const shardCount = conduits[0].shard_count
        await logMessage([`> assignToConduit(chatroom: '${chatroom}', index: ${index}, shardCount: ${shardCount})`])
        if (index > shardCount - 1) {
            await apiUpdateConduit(settings.conduitId, shardCount + 1)
        }
        apiUpdateConduitShard(settings.conduitId, index, webSocketSessionId)
    }
}