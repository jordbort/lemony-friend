const WebSocket = require(`ws`)

const { joinedChatrooms } = require(`../data`)

const { logMessage } = require(`../utils`)
const { assignToConduit } = require(`./conduits`)
const { handleNotification } = require(`./notifications`)
const { updateEventSubs } = require(`../commands/twitch`)

const webSockets = {}

function openWebSocket(bot, channel, path = `wss://eventsub.wss.twitch.tv/ws`) {
    webSockets[channel].ws.push(new WebSocket(path))
    const ws = webSockets[channel].ws[webSockets[channel].ws.length - 1]

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
    logMessage([`-> WebSocket connection for ${channel} ${wasClean ? `closed` : `died unexpectedly`} with code ${code}${reason ? `: '${reason}'` : ``}`])

    // If not closed on purpose (unless keepAlive timed out), for unused connection, or from not reconnecting in time
    if (![1000, 4003, 4004].includes(code) || webSockets[channel].timedOut) {
        if (webSockets[channel].timedOut) { webSockets[channel].timedOut = false }
        openWebSocket(bot, channel)
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
    openWebSocket(bot, channel, reconnect_url)
}

function handleRevocation(channel, event) {
    logMessage([`* REVOKED '${channel}' status: ${event.payload.session.status}`])
    updateEventSubs(channel, webSockets[channel].sessionId)
}

function initWebSocket(bot, channel) {
    if (!(channel in webSockets)) {
        webSockets[channel] = {
            sessionId: 0,
            ws: [],
            timer: 0,
            timedOut: false
        }
    }
    if (!webSockets[channel].sessionId) {
        openWebSocket(bot, channel)
    }
}

function keepAlive(bot, channel) {
    clearTimeout(webSockets[channel].timer)
    webSockets[channel].timer = setTimeout(() => {
        logMessage([`* KEEPALIVE message not received for ${channel}, breaking connection...`])
        webSockets[channel].timedOut = true
        closeWebSocket(bot, channel)
    }, 35000)
}

function closeWebSocket(channel) {
    clearTimeout(webSockets[channel].timer)
    webSockets[channel].timer = 0
    webSockets[channel].sessionId = ``
    webSockets[channel].ws[webSockets[channel].ws.length - 1].close()
}

module.exports = {
    initWebSocket, // is in: handlers.js, dev.js
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
