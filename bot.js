require(`dotenv`).config()

const fs = require(`fs/promises`)

fs.writeFile(`lemony_logs.txt`, `🍋️ LEMONY LOGS 🍋️\n`, (err) => {
    if (err) { console.log(`Error writing logs:`, err) }
})

// Import helper functions
const { handleUncaughtException } = require(`./utils`)

// Import client
const client = require(`./client`)

const { settings } = require(`./data`)
if (!settings.devMode) {
    process.on(`uncaughtException`, async (err) => {
        const errorStack = err.stack.split(`\n`)[1].split(`/`)
        const errorPosition = errorStack[0].substring(4) + errorStack[errorStack.length - 1]
        await handleUncaughtException(client, err, errorPosition)
        process.exit(1)
    })
}

client.connect()
