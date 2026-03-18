const WebSocket = require(`ws`)

const { joinedChatrooms } = require(`../data`)

const { logMessage } = require(`../utils`)
const { assignToConduit } = require(`./conduits`)
const { updateEventSubs } = require(`../commands/twitch`)
const { handleNotification } = require(`./notifications`)

const webSockets = {}

function initWebSocket(bot, channel) {
    if (!(channel in webSockets)) {
        webSockets[channel] = {
            sessionId: ``,
            arr: [],
            timer: null,
            timedOut: false
        }
    }
    if (!webSockets[channel].sessionId) {
        openWebSocket(bot, channel)
    }
}

function openWebSocket(bot, channel, path = `wss://eventsub.wss.twitch.tv/ws`) {
    webSockets[channel].arr.push(new WebSocket(path))
    const ws = webSockets[channel].arr[webSockets[channel].arr.length - 1]

    ws.onopen = () => { logMessage([`-> WebSocket connection established for '${channel}'`]) }
    ws.onmessage = (event) => { handleMessage(bot, channel, event) }
    ws.onclose = (event) => { handleClose(bot, channel, event) }
    ws.onerror = (error) => { logMessage([`-> WebSocket error for '${channel}':`, error.message || `(no message)`]) }
}

function handleMessage(bot, channel, event) {
    keepAlive(channel)
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
    logMessage([`-> WebSocket connection for ${channel} ${wasClean ? `closed` : `died unexpectedly`} with code ${code}${reason ? `: '${reason}'` : ``}`])

    const ws = webSockets[channel]
    ws.arr.shift()

    // If not closed on purpose (unless keepAlive timed out)
    if (code !== 1000 || ws.timedOut) {
        if (ws.timedOut) { ws.timedOut = false }
        openWebSocket(bot, channel)
    }
}

function handleWelcome(channel, event) {
    const { id, status } = event.payload.session
    logMessage([`* WELCOME '${channel}' status: ${status}`])

    const ws = webSockets[channel]
    if (ws.sessionId === id) {
        ws.arr[0].close()
    } else {
        ws.sessionId = id
        assignToConduit(`#${channel}`, id)
        updateEventSubs(channel, ws.sessionId)
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

function keepAlive(channel) {
    const ws = webSockets[channel]
    clearTimeout(ws.timer)
    ws.timer = setTimeout(() => {
        logMessage([`* KEEPALIVE message not received for ${channel}, breaking connection...`])
        ws.timedOut = true
        closeWebSocket(channel)
    }, 35000)
}

function closeWebSocket(channel) {
    const ws = webSockets[channel]
    clearTimeout(ws.timer)
    ws.sessionId = ``
    ws.arr.length
        ? ws.arr[ws.arr.length - 1].close()
        : logMessage([`Warning: No WebSocket to close for '${channel}'`])
}

module.exports = {
    initWebSocket, // is in: handlers.js, dev.js
    closeWebSocket, // is in: handlers.js, dev.js
    checkWebSockets(arrShards) { // is in: dev.js
        const channels = joinedChatrooms.map(str => str.substring(1))
        for (const shard of arrShards) {
            const shardId = Number(shard.id)
            const channel = channels[shardId]
            const ws = webSockets[channel]
            const sessionId = shard.transport.session_id
            channel in webSockets
                ? console.log(
                    shardId,
                    channel,
                    ws.timer._destroyed ? `INACTIVE` : `ACTIVE`,
                    ws.arr.length,
                    ws.arr.map(ws => ws?._closeFrameSent || ws?._closeFrameReceived ? `CLOSED` : `OPEN`),
                    ws.sessionId,
                    ws.sessionId === sessionId || sessionId
                )
                : !channel
                    ? console.log(shardId, `Unassigned shard${sessionId ? ` - sessionId: ${sessionId}` : ``}`)
                    : console.log(shardId, `Error: '${channel}' not in webSockets{} - sessionId: ${sessionId || `(none)`}`)
        }
    }
}
