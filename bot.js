require(`dotenv`).config()

// Show the cursor when the process exits HUD
if (!settings.debug) {
    process.on(`exit`, () => process.stdout.write(`\x1b[?25h`));
    [`SIGINT`, `SIGTERM`, `SIGQUIT`].forEach(signal => process.on(signal, () => {
        process.stdout.write(`\x1b[?25h`)
        process.exit()
    }))
}
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
