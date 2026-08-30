const { joinedChatrooms, settings, lemonyFresh, users } = require(`../data`)
const { terminalColors, getTerminalChatColor } = require(`../utils`),
    { resetTxt, boldTxt, underlined, redTxt, yellowTxt, cyanTxt, whiteTxt, grayTxt, blackBg } = terminalColors

const printLemon = require(`./printLemon`)

function getMostRecentMsg(channel) {
    const mostRecentTime = Math.max(...Object.keys(users)
        .filter(username => channel in users[username].channels)
        .map(username => users[username].channels[channel].sentAt)
    )
    const mostRecentChatter = Object.keys(users).filter(username => channel in users[username].channels && users[username].channels[channel].sentAt === mostRecentTime)[0]

    return mostRecentChatter
        ? [mostRecentChatter, users[mostRecentChatter].channels[channel].lastMessage, users[mostRecentChatter].channels[channel].sentAt]
        : [``, ``, ``]
}

function fillWhitespace(maxLength, entry = ``) {
    entry = String(entry)

    // Properly counts emoji as one character each
    const segmenter = new Intl.Segmenter(`en`, { granularity: `grapheme` })
    const segments = segmenter.segment(entry)

    // Idk why this is different on different computers
    let emojiCount = 0
    const emojiRegex = /\p{Emoji_Presentation}/u
    for (const { segment } of segments) { if (emojiRegex.test(segment)) { emojiCount++ } }
    const charLength = settings.devMode
        ? Array.from(segments).map(el => el.segment).length + emojiCount
        : Array.from(segments).map(el => el.segment).length

    return charLength >= maxLength
        ? `${entry.substring(0, maxLength - 4)}... `
        : `${entry}${Array(maxLength - charLength).fill(` `).join(``)}`
}

const isOnline = {}
const cursor = { x: 0, y: 0 }
const colWidths = {
    channelName: 25,
    lastChatter: 25,
    // lastMessage: 100,
    lastMessage: 80,
    sentAt: 18,
    contextEmotes: 4,
    accessToken: 7,
    webSocket: 13
}

function moveCursor(x, y) {
    while (x < cursor.x) {
        process.stdout.write(`\x1b[1D`) // Move cursor left 1 column within a row
        cursor.x--
    }
    while (y < cursor.y) {
        process.stdout.write(`\x1b[1A`) // Move cursor up 1 row while keeping the same vertical column
        cursor.y--
    }
    while (y > cursor.y) {
        process.stdout.write(`\x1b[1B`) // Move cursor down 1 row while keeping the same vertical column
        cursor.y++
    }
    while (x > cursor.x) {
        process.stdout.write(`\x1b[1C`) // Move cursor right 1 column within a row
        cursor.x++
    }
}

function drawColumnTitles() {
    // Channel column
    colWidths.channelName = Math.max(8, Math.max(...joinedChatrooms.map(chatroom => chatroom.length)))
    const channelColumn = fillWhitespace(colWidths.channelName, `Channel`)
    process.stdout.write(boldTxt)
    process.stdout.write(underlined)
    process.stdout.write(channelColumn)

    // Last chatter column
    const lastChatterColumn = `${fillWhitespace(colWidths.lastChatter, `Last chatter`)}`
    process.stdout.write(lastChatterColumn)

    // Last message column
    const lastMessageColumn = `${fillWhitespace(colWidths.lastMessage, `Last message`)}`
    process.stdout.write(lastMessageColumn)

    // Last message column
    const sentAtColumn = `${fillWhitespace(colWidths.sentAt, `Sent at`)}`
    process.stdout.write(sentAtColumn)

    // CEs column
    const contextEmotesColumn = `${fillWhitespace(colWidths.contextEmotes, `CEs`)}`
    process.stdout.write(contextEmotesColumn)

    // Token column
    const accessTokenColumn = `${fillWhitespace(colWidths.accessToken, `Token?`)}`
    process.stdout.write(accessTokenColumn)

    // WebSocket column
    if (!settings.devMode) {
        const webSocketColumn = fillWhitespace(colWidths.webSocket, `WebSocket`)
        process.stdout.write(webSocketColumn)
    }
    process.stdout.write(`${resetTxt}\n`)
}

function initHUD() {
    process.stdout.write(`\x1b[?25l`) // low (hide cursor)
    process.stdout.write(`\x1b[2J`) // Clear screen
    process.stdout.write(`\x1b[H`) // Move cursor to home

    // Print lemon and base previous data
    printLemon()
    process.stdout.write(`\n`)
    drawColumnTitles()

    // Write out data
    joinedChatrooms.forEach((chatroom, idx) => {
        // Set up colors
        process.stdout.write(idx % 2 ? `` : blackBg)

        // Channel column
        const channel = chatroom.substring(1)
        const channelColumn = fillWhitespace(colWidths.channelName, channel)
        process.stdout.write(grayTxt)
        process.stdout.write(channelColumn)

        // Import most recent message from channels
        const [lastChatter, lastMessage, sentAt] = getMostRecentMsg(channel)

        // Last chatter and last message columns
        const chatColor = getTerminalChatColor(users[lastChatter].color)
        const lastChatterColumn = fillWhitespace(colWidths.lastChatter, lastChatter)
        const lastMessageColumn = fillWhitespace(colWidths.lastMessage, lastMessage)
        process.stdout.write(chatColor)
        process.stdout.write(lastChatterColumn)
        process.stdout.write(lastMessageColumn)

        // Sent at column
        const strDateTime = new Date(sentAt).toLocaleDateString(settings.timeLocale, { timeZone: settings.timeZone, year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).replace(`,`, ``)
        const sentAtColumn = fillWhitespace(colWidths.sentAt, strDateTime)
        process.stdout.write(whiteTxt)
        process.stdout.write(sentAtColumn)

        // CEs column
        const stream = lemonyFresh[channel]
        const numContextEmotes = Object.keys(stream.contextEmotes).map(type => stream.contextEmotes[type].length).reduce((prev, curr) => prev + curr, 0)
        const contextEmotesColumn = fillWhitespace(colWidths.contextEmotes, numContextEmotes)
        process.stdout.write(yellowTxt)
        process.stdout.write(contextEmotesColumn)

        // Token column
        const hasAccessToken = !!(stream.accessToken && stream.refreshToken)
        const accessTokenColumn = fillWhitespace(colWidths.accessToken, hasAccessToken)
        process.stdout.write(hasAccessToken ? cyanTxt : redTxt)
        process.stdout.write(accessTokenColumn)

        // WebSocket column
        if (!settings.devMode) {
            process.stdout.write(whiteTxt)
            const webSocketColumn = fillWhitespace(colWidths.webSocket, `pending`)
            process.stdout.write(webSocketColumn)
        }

        // Increment cursor position
        process.stdout.write(`${resetTxt}\n`)
        cursor.y++
    })
}

function renderLineHUD(chatroom, webSocketStatus = ``, username = ``, message = ``, currentTime = ``) {
    // Move cursor up to relevant line and clear it
    moveCursor(0, joinedChatrooms.indexOf(chatroom))
    process.stdout.clearLine(1)

    // Apply color if channel is online
    const channel = chatroom.substring(1)
    const bgColor = joinedChatrooms.indexOf(chatroom) % 2 ? `` : blackBg
    process.stdout.write(bgColor)

    // Channel column
    process.stdout.write(isOnline[channel] ? whiteTxt : grayTxt)
    colWidths.channelName = Math.max(8, Math.max(...joinedChatrooms.map(chatroom => chatroom.length)))
    const channelColumn = fillWhitespace(colWidths.channelName, channel)
    process.stdout.write(channelColumn)

    // Use or import most recent message from channel
    const [lastChatter, lastMessage, sentAt] = username ? [username, message, currentTime] : getMostRecentMsg(channel)

    // Last chatter and message columns
    const chatColor = getTerminalChatColor(users[lastChatter].color)
    const lastChatterColumn = fillWhitespace(colWidths.lastChatter, lastChatter)
    const lastMessageColumn = fillWhitespace(colWidths.lastMessage, lastMessage)
    process.stdout.write(chatColor)
    process.stdout.write(lastChatterColumn)
    process.stdout.write(lastMessageColumn)

    // Sent at column
    const strDateTime = new Date(sentAt).toLocaleDateString(settings.timeLocale, { timeZone: settings.timeZone, year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }).replace(`,`, ``)
    const sentAtColumn = fillWhitespace(colWidths.sentAt, strDateTime)
    process.stdout.write(whiteTxt)
    process.stdout.write(sentAtColumn)

    // CEs column
    const stream = lemonyFresh[channel]
    const numContextEmotes = Object.keys(stream.contextEmotes).map(type => stream.contextEmotes[type].length).reduce((prev, curr) => prev + curr, 0)
    const contextEmotesColumn = fillWhitespace(colWidths.contextEmotes, numContextEmotes)
    process.stdout.write(yellowTxt)
    process.stdout.write(contextEmotesColumn)

    // Token column
    const hasAccessToken = !!(stream.accessToken && stream.refreshToken)
    const accessTokenColumn = fillWhitespace(colWidths.accessToken, hasAccessToken)
    process.stdout.write(hasAccessToken ? cyanTxt : redTxt)
    process.stdout.write(accessTokenColumn)

    // WebSocket column
    if (!settings.devMode) {
        const webSocketColumn = fillWhitespace(colWidths.webSocket, webSocketStatus)
        process.stdout.write(webSocketStatus === `connected` ? cyanTxt : redTxt)
        process.stdout.write(webSocketColumn)
    }

    // Return cursor down to ready position
    process.stdout.write(`${resetTxt}\n`)
    cursor.y++
    moveCursor(0, joinedChatrooms.length)
}

module.exports = {
    drawColumnTitles, // is in: dev.js
    initHUD, // is in: handlers.js
    renderLineHUD, // is in: dev.js, webSockets.js
    setChannelOnline(channel, bool) { isOnline[channel] = bool } // is in: dev.js, notifications.js
}
