const WebSocket = require(`ws`)

const { joinedChatrooms } = require(`../data`)

const { logMessage } = require(`../utils`)
const { assignToConduit } = require(`./conduits`)
const { handleNotification } = require(`./notifications`)
const { updateEventSubs } = require(`../commands/twitch`)

const webSockets = {}

function initWebSocket(bot, channel, path = `wss://eventsub.wss.twitch.tv/ws`) {
    // logMessage([`> initWebSocket(channel: '${channel}', path: '${path}')`])

    webSockets[channel].ws.push(new WebSocket(path))
    const ws = getWebSocket(channel)

    ws.onopen = () => { logMessage([`-> WebSocket connection established for '${channel}'`]) }
    ws.onmessage = (event) => { handleMessage(bot, channel, event) }
    ws.onclose = (event) => { handleClose(bot, channel, event) }
    ws.onerror = (error) => { logMessage([`-> WebSocket error for '${channel}':`, error.message]) }
}

function handleMessage(bot, channel, event) {
    keepAlive(bot, channel)
    const message = JSON.parse(event.data)
    switch (message.metadata.message_type) {
        case `session_welcome`:
            handleWelcome(channel, message)
            break
        case `session_keepalive`:
            break
        case `notification`:
            handleNotification(bot, message.payload)
            break
        case `session_reconnect`:
            handleReconnect(bot, channel, message)
            break
        case `revocation`:
            handleRevocation(channel, message)
            break
        default:
            logMessage([`* '${channel}' ${message.message_type} is not a recognized message type`])
            console.log(message)
    }
}

function handleClose(bot, channel, event) {
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

function handleWelcome(channel, event) {
    const { id, status } = event.payload.session
    logMessage([`* WELCOME '${channel}' status: ${status}`])
    if (webSockets[channel].sessionId === id) {
        webSockets[channel].ws[0].close()
    } else {
        webSockets[channel].sessionId = id
        assignToConduit(`#${channel}`, id)
        updateEventSubs(channel, webSockets[channel].sessionId)
    }
}

function handleReconnect(bot, channel, event) {
    const { status, reconnect_url } = event.payload.session
    logMessage([`* RECONNECT '${channel}' status: ${status}, reconnect_url: ${reconnect_url}`])
    initWebSocket(bot, channel, reconnect_url)
}

function handleRevocation(channel, event) {
    logMessage([`* REVOKED '${channel}' status: ${event.payload.session.status}`])
    updateEventSubs(channel, webSockets[channel].sessionId)
}

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
    clearTimeout(webSockets[channel].timer)
    webSockets[channel].timer = setTimeout(() => {
        logMessage([`* KEEPALIVE message not received for ${channel}, breaking connection...`])
        closeWebSocket(bot, channel)
    }, 35000)
}

function closeWebSocket(bot, channel) {
    // logMessage([`> closeWebSocket(channel: '${channel}')`])
    clearTimeout(webSockets[channel].timer)
    webSockets[channel].timer = 0

    const ws = getWebSocket(channel)
    if (ws) {
        webSockets[channel].sessionId = ``
        ws.close()
    } else {
        logMessage([`* Error: No web socket to close for '${channel}', reinitializing web socket...`])
        initWebSocket(bot, channel)
    }
}

function getWebSocket(channel) {
    return webSockets[channel].ws.length
        ? webSockets[channel].ws[webSockets[channel].ws.length - 1]
        : null
}

module.exports = {
    createWebSocket, // is in: handlers.js, dev.js
    closeWebSocket, // is in: handlers.js, dev.js
    checkWebSockets(arrShards) { // is in: dev.js
        const channels = joinedChatrooms.map(str => str.substring(1))
        for (const shard of arrShards) {
            const shardId = Number(shard.id)
            const channel = channels[shardId]
            const sessionId = shard.transport.session_id
            channel in webSockets
                ? console.log(
                    shardId,
                    channel,
                    webSockets[channel].timer._destroyed ? `INACTIVE` : `ACTIVE`,
                    webSockets[channel].ws.length,
                    webSockets[channel].ws.map(ws => ws?._closeFrameSent || ws?._closeFrameReceived ? `CLOSED` : `OPEN`),
                    webSockets[channel].sessionId,
                    webSockets[channel].sessionId === sessionId || sessionId
                )
                : console.log(`Error: ${channel} not in webSockets{} - shardId:`, shardId, `sessionId:`, sessionId)
        }
    }
}
