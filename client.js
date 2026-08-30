const { joinedChatrooms, settings } = require(`./data`)

const BOT_USERNAME = process.env.BOT_USERNAME
const OAUTH_TOKEN = process.env.OAUTH_TOKEN

const options = {
    identity: {
        username: BOT_USERNAME,
        password: OAUTH_TOKEN
    },
    channels: settings.devMode
        ? [`#lemony_friend`]
        : joinedChatrooms
}

// Create bot client
const tmi = require(`tmi.js`)
const client = new tmi.client(options)

const { onConnectedHandler, onMessageHandler, onJoinedHandler, onPartedHandler, onWhisperHandler } = require(`./handlers`)

client.on(`connected`, onConnectedHandler)
client.on(`message`, onMessageHandler)
client.on(`join`, onJoinedHandler)
client.on(`part`, onPartedHandler)
client.on(`whisper`, onWhisperHandler)

module.exports = client
