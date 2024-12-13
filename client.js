const { lemonyFresh } = require(`./data`)
const { onMessageHandler, onJoinedHandler, onPartedHandler, onWhisperHandler, onConnectedHandler } = require(`./handlers`)

// Create bot client
const tmi = require(`tmi.js`)
const BOT_USERNAME = process.env.BOT_USERNAME
const OAUTH_TOKEN = process.env.OAUTH_TOKEN

const opts = {
    identity: {
        username: BOT_USERNAME,
        password: OAUTH_TOKEN
    },
    channels: lemonyFresh.channels
}
const client = new tmi.client(opts)

client.on(`connected`, onConnectedHandler)
client.on(`message`, onMessageHandler)
client.on(`join`, onJoinedHandler)
client.on(`part`, onPartedHandler)
client.on(`whisper`, onWhisperHandler)

module.exports = client
