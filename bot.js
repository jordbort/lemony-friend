require(`dotenv`).config()

// Import helper functions
const { client, handleUncaughtException } = require('./utils')

// Import client handlers
const { onConnectedHandler, onMessageHandler } = require('./clientHandlers')

process.on('uncaughtException', async (err) => {
    const errorPosition = err.stack.split(`\n`)[1].split(`/`)[0].substring(4) + err.stack.split(`\n`)[1].split(`/`)[err.stack.split(`\n`)[1].split(`/`).length - 1]
    await handleUncaughtException(err.message, errorPosition)
    console.error(err)
    process.exit(1)
})

client.on('connected', onConnectedHandler)
client.on('message', onMessageHandler)
client.connect()
