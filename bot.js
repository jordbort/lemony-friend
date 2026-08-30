require(`dotenv`).config()

// Set up process handlers
const { settings } = require(`./data`)

// Show the cursor when the process exits HUD
if (!settings.debug) {
    process.on(`exit`, () => process.stdout.write(`\x1b[?25h`));
    [`SIGINT`, `SIGTERM`, `SIGQUIT`].forEach(signal => process.on(signal, () => {
        process.stdout.write(`\x1b[?25h`)
        process.exit()
    }))
}

// Import crash handler
const { handleUncaughtException } = require(`./utils`)

// Import client
const client = require(`./client`)

// Write memory.json on crash
if (!settings.devMode) {
    process.on(`uncaughtException`, async (err) => {
        const errorStack = err.stack.split(`\n`)[1].split(`/`)
        const errorPosition = errorStack[0].substring(4) + errorStack[errorStack.length - 1]
        await handleUncaughtException(client, err, errorPosition)
        process.exit(1)
    })
}

// Start new log file
const fs = require(`fs/promises`)
fs.writeFile(`logs.txt`, `🍋️ LEMONY LOGS 🍋️\n`, (err) => {
    if (err) console.log(`Error writing logs:`, err)
})

// Connect to Twitch IRC
client.connect()
