const WebSocket = require(`ws`)

const { joinedChatrooms } = require(`../data`)

const { logMessage } = require(`../utils`)
const { assignToConduit } = require(`./conduits`)
const { handleNotification } = require(`./notifications`)
const { updateEventSubs } = require(`../commands/twitch`)

const webSockets = {}
function createWebSocket(bot, channel) {
    if (!(channel in webSockets)) {
        webSockets[channel] = {
            sessionId: 0,
            ws: [],
            timer: 0
        }
    }
    if (!webSockets[channel].sessionId) {
        initWebSocket(bot, channel)
    } else { console.log(`Warning: sessionId ${webSockets[channel].sessionId} already exists for '${channel}'`) }
}

function keepAlive(bot, channel) {
    // console.log(`keep_alive`, channel)
    clearTimeout(webSockets[channel].timer)
    webSockets[channel].timer = setTimeout(() => {
        // logMessage([`* KEEPALIVE message not received for ${channel}, breaking connection...`])
        console.log(`* KEEPALIVE message not received for ${channel}, breaking connection...`)
        closeWebSocket(bot, channel)
    }, 35000)
}

function handleWelcome(channel, event) {
    if (webSockets[channel].sessionId === event.payload.session.id) {
        // logMessage([`Reconnection complete, closing first WebSocket`])
        console.log(`Reconnection complete, closing first WebSocket`)
        webSockets[channel].ws[0].close()
    } else {
        // logMessage([`status:`, event.payload.session.status, event.payload.session.id, `(not reconnection)`])
        console.log(`status:`, event.payload.session.status, event.payload.session.id, `(not reconnection)`)
        webSockets[channel].sessionId = event.payload.session.id
        assignToConduit(`#${channel}`, event.payload.session.id)
        updateEventSubs(channel, webSockets[channel].sessionId)
    }
}

function handleReconnect(bot, channel, event) {
    // console.log(`channel:`, channel, `event:`, event)
    initWebSocket(bot, channel, event.payload.session.reconnect_url)
}

function handleRevocation(channel, event) {
    // console.log(`channel:`, channel, `event:`, event)
    updateEventSubs(channel, webSockets[channel].sessionId)
}

function handleMessage(bot, channel, event) {
    keepAlive(bot, channel)
    switch (event.metadata.message_type) {
        case `session_welcome`:
            // console.log(`session_welcome`, channel, webSockets[channel].sessionId)
            logMessage([`* WELCOME '${channel}' status: ${event.payload.session.status}`])
            handleWelcome(channel, event)
            break
        case `session_keepalive`:
            // console.log(`session_keepalive`, channel, webSockets[channel].sessionId)
            break
        case `notification`:
            // console.log(`handleMessage(channel, ${channel})`)
            // console.log(`condition:`, event.payload.subscription.condition)
            // console.log(`transport:`, event.payload.subscription.transport)
            // console.log(`notification`, channel, webSockets[channel].sessionId)
            // if (event.payload.subscription.type === `conduit.shard.disabled`) {
            //     console.log(event)
            //     const shardId = Number(event.payload.event.shard_id)
            //     console.log(shardId, joinedChatrooms[shardId])
            //     initWebSocket(bot, joinedChatrooms[shardId], joinedChatrooms[shardId].substring(1))
            // }
            handleNotification(bot, event.payload)
            break
        case `session_reconnect`:
            // console.log(`session_reconnect`, channel, webSockets[channel].sessionId)
            logMessage([`* RECONNECT '${channel}' status: ${event.payload.session.status}, reconnect_url: ${event.payload.session.reconnect_url}`])
            handleReconnect(bot, channel, event)
            break
        case `revocation`:
            // console.log(`revocation`, channel, webSockets[channel].sessionId)
            logMessage([`* REVOKED '${channel}' status: ${event.payload.session.status}`])
            handleRevocation(channel, event)
            break
        default:
            // console.log(`Message type '${event.message_type}' not recognized`, channel, webSockets[channel].sessionId)
            logMessage([`* '${channel}' ${event.message_type} is not a recognized event message type`])
            console.log(event)
    }
}

function getWebSocket(channel) {
    return webSockets[channel].ws.length
        ? webSockets[channel].ws[webSockets[channel].ws.length - 1]
        : null
}

function closeWebSocket(bot, channel) {
    logMessage([`> closeWebSocket(channel: '${channel}')`])
    clearTimeout(webSockets[channel].timer)
    webSockets[channel].timer = 0
    if (!webSockets[channel].sessionId) {
        // logMessage([`* Warning: No sessionId for '${channel}'`])
        console.log(`* Warning: No sessionId for '${channel}'`)
    }

    const ws = getWebSocket(channel)
    if (ws) {
        webSockets[channel].sessionId = ``
        ws.close()
    } else {
        // logMessage([`* Error: No web socket to close for '${channel}', reinitializing web socket...`])
        console.log(`* Error: No web socket to close for '${channel}', reinitializing web socket...`)
        initWebSocket(bot, channel)
    }
}

function initWebSocket(bot, channel, path = `wss://eventsub.wss.twitch.tv/ws`) {
    logMessage([`> initWebSocket(channel: '${channel}', path: '${path}')`])
    webSockets[channel].ws.push(new WebSocket(path))
    const ws = getWebSocket(channel)

    ws.onopen = () => { logMessage([`-> WebSocket connection established for '${channel}'`]) }

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        handleMessage(bot, channel, message)
    }

    ws.onclose = (event) => {
        const { code, reason, wasClean } = event
        webSockets[channel].ws.shift()

        wasClean
            ? logMessage([`-> WebSocket connection for ${channel} closed with code ${code}: '${reason}'`])
            : logMessage([`-> WebSocket connection for ${channel} died unexpectedly with code ${code}${reason ? `: '${reason}'` : ``}`])

        // Should 4004 be removed?
        if (![1000, 4003, 4004].includes(code)) { // Not on purpose, unused connection, or from reconnection
            initWebSocket(bot, channel)
        }
    }

    ws.onerror = (error) => { logMessage([`-> WebSocket error for '${channel}':`, error.message]) }
}

module.exports = {
    createWebSocket, // is in: handlers.js
    printWebSockets() { // is in: dev.js
        for (const channel in webSockets) {
            console.log(channel, webSockets[channel].ws.length, webSockets[channel].ws.map(ws => ws._closeFrameSent || ws.closeFrameReceived ? `closed` : `open`), webSockets[channel].timer._destroyed ? `inactive` : `active`, webSockets[channel].sessionId)
        }
    },
    removeClosedWebSockets(channel) {
        let count = 0
        for (let i = webSockets[channel].ws.length - 1; i >= 0; i--) {
            if (webSockets[channel].ws[i]?._closeFrameSent || webSockets[channel].ws[i]?._closeFrameReceived) {
                webSockets[channel].ws.splice(i, 1)
                count++
            }
        }
        console.log(pluralize(count, `web socket`, `web sockets`), `removed for '${channel}'`)
    },
    forceTrimWebSocket(channel) {
        webSockets[channel].ws.shift()
    },
    closeWebSocket,
    checkWebSockets(arrShards) {
        const list = joinedChatrooms.map(str => str.substring(1))
        for (const shard of arrShards) {
            const shardId = shard.id
            const channel = list[shardId]
            const sessionId = shard.transport.session_id
            console.log(shardId, channel, webSockets[channel].sessionId, sessionId, webSockets[channel].sessionId === sessionId)
        }
    }
}
