require(`dotenv`).config()
const tmi = require('tmi.js')
const BOT_USERNAME = process.env.BOT_USERNAME
const OAUTH_TOKEN = process.env.OAUTH_TOKEN

const jpegstripes = `#jpegstripes`
const sclarf = `#sclarf`
const e1ectroma = `#e1ectroma`
const domonintendo1 = `#domonintendo1`
const ppuyya = `#ppuyya`

const lemonyFresh = [
    `#${BOT_USERNAME}`,
    jpegstripes,
    sclarf,
    e1ectroma,
    domonintendo1,
    ppuyya
]

// Terminal colors
const resetTxt = `\x1b[0m`
const boldTxt = `\x1b[1m`
const underlined = `\x1b[4m`
const inverted = `\x1b[7m`

const blackTxt = `\x1b[30m`
const redTxt = `\x1b[31m`
const greenTxt = `\x1b[32m`
const yellowTxt = `\x1b[33m`
const blueTxt = `\x1b[34m`
const magentaTxt = `\x1b[35m`
const cyanTxt = `\x1b[36m`
const whiteTxt = `\x1b[37m`
const grayTxt = `\x1b[90m`
const orangeTxt = `\x1b[38;5;208m`

const blackBg = `\x1b[40m`
const redBg = `\x1b[41m`
const greenBg = `\x1b[42m`
const yellowBg = `\x1b[43m`
const blueBg = `\x1b[44m`
const magentaBg = `\x1b[45m`
const cyanBg = `\x1b[46m`
const whiteBg = `\x1b[47m`
const grayBg = `\x1b[100m`
const orangeBg = `\x1b[48;2;255;164;0m`

// Twitch color names and terminal color references
const chatColors = {
    "#0000FF": { name: "blue", terminalColor: blueTxt },
    "#8A2BE2": { name: "blue-violet", terminalColor: blueTxt },
    "#5F9EA0": { name: "cadet blue", terminalColor: cyanTxt },
    "#D2691E": { name: "chocolate", terminalColor: magentaTxt },
    "#FF7F50": { name: "coral", terminalColor: magentaTxt },
    "#1E90FF": { name: "dodger blue", terminalColor: cyanTxt },
    "#B22222": { name: "firebrick", terminalColor: redTxt },
    "#DAA520": { name: "goldenrod", terminalColor: yellowTxt },
    "#008000": { name: "green", terminalColor: greenTxt },
    "#FF69B4": { name: "hot pink", terminalColor: redTxt },
    "#FF4500": { name: "orange-red", terminalColor: orangeTxt },
    "#FF0000": { name: "red", terminalColor: redTxt },
    "#2E8B57": { name: "sea green", terminalColor: greenTxt },
    "#00FF7F": { name: "spring green", terminalColor: greenTxt },
    "#ADFF2F": { name: "yellow-green", terminalColor: yellowTxt }
}

// Create bot client
const opts = {
    identity: {
        username: BOT_USERNAME,
        password: OAUTH_TOKEN
    },
    channels: lemonyFresh
}
const client = new tmi.client(opts)
client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)
client.connect()

let users = {}

function onMessageHandler(chatroom, tags, msg, self) {
    const username = tags.username
    const displayName = tags[`display-name`]
    const channel = chatroom.slice(1)
    const color = tags.color
    const firstMsg = tags['first-msg']

    // Command and arguments parser
    const args = msg.split(` `)
    const command = args.shift().toLowerCase()
    const toUser = args[0] ? getToUser(args[0]) : ``

    // User attribute change detection
    const colorChanged = username in users && color !== users[username]?.color
    const turboChange = username in users && tags.turbo !== users[username]?.turbo
    const subChange = users[username]?.[channel]?.sub !== undefined && tags.subscriber !== users[username]?.[channel]?.sub
    const modChange = users[username]?.[channel]?.mod !== undefined && tags.mod !== users[username]?.[channel]?.mod
    const vipChange = users[username]?.[channel]?.vip !== undefined && tags.vip !== users[username]?.[channel]?.vip

    // Initialize new user
    if (!(username in users)) {
        users[username] = {
            displayName: tags[`display-name`],
            turbo: tags.turbo,
            color: color
        }
    }
    // Initialize user in a new chatroom
    if (!(channel in users[username])) {
        users[username][channel] = {
            sub: tags.subscriber,
            mod: tags.mod,
            vip: tags.vip,
            msgCount: 0,
            lastMessage: msg
        }
    }
    // Update last message in a chatroom, and increment counter by 1
    users[username][channel].lastMessage = msg
    users[username][channel].msgCount++

    // Stop here if bot, otherwise log user's chat message
    if (self) { return } else { console.log(`${color in chatColors ? chatColors[color].terminalColor : whiteTxt}<${channel}> ${username}: ${msg}${resetTxt}`) }

    /*********\
    REPLY CASES
    \*********/

    if (firstMsg) { return handleNewChatter(chatroom, users[username]) }

    if (command === `am` && args[0].toLowerCase() === `i`) {
        if (msg.toLowerCase().includes(`sub`)) {
            users[username][channel].sub ? talk(chatroom, `You are subbed! :)`) : talk(chatroom, `You are not subbed! :(`)
            return
        }
        if (msg.toLowerCase().includes(`mod`)) {
            users[username][channel].mod ? talk(chatroom, `You are a mod! :)`) : talk(chatroom, `You are not a mod! :(`)
            return
        }
        if (msg.toLowerCase().includes(`vip`)) {
            users[username][channel].vip ? talk(chatroom, `You are a vip! :)`) : talk(chatroom, `You are not a vip! :(`)
            return
        }
    }

    if (command === `do` && args[0].toLowerCase() === `i`) {
        if (msg.toLowerCase().includes(`sub`)) {
            users[username][channel].sub ? talk(chatroom, `You are subbed! :)`) : talk(chatroom, `You are not subbed! :(`)
            return
        }
        if (msg.toLowerCase().includes(`mod`)) {
            users[username][channel].mod ? talk(chatroom, `You are a mod! :)`) : talk(chatroom, `You are not a mod! :(`)
            return
        }
        if (msg.toLowerCase().includes(`vip`)) {
            users[username][channel].vip ? talk(chatroom, `You are a vip! :)`) : talk(chatroom, `You are not a vip! :(`)
            return
        }
    }

    if ([`is`, `does`].includes(command)) {
        if (!(toUser.toLowerCase() in users)) { return }
        const userAttr = users[toUser.toLowerCase()][channel]
        if (msg.toLowerCase().includes(`sub`)) {
            userAttr.sub ? talk(chatroom, `${toUser} is subbed! :)`) : talk(chatroom, `${toUser} is not subbed! :(`)
            return
        }
        if (msg.toLowerCase().includes(`mod`)) {
            userAttr.mod ? talk(chatroom, `${toUser} is a mod! :)`) : talk(chatroom, `${toUser} is not a mod! :(`)
            return
        }
        if (msg.toLowerCase().includes(`vip`)) {
            userAttr.vip ? talk(chatroom, `${toUser} is a vip! :)`) : talk(chatroom, `${toUser} is not a vip! :(`)
            return
        }
    }

    if ([`!color`, `!colour`].includes(command)) { return getColor(chatroom, users[toUser.toLowerCase()] || users[username]) }

    if (command === `!lastmsg`) { return getLastMessage(chatroom, users[toUser.toLowerCase()] || users[username], args[1]?.toLowerCase()) }

    if (command === `!msgcount`) { return getMessageCount(chatroom, users[toUser.toLowerCase()] || users[username]) }

    if (msg === `show`) { console.log(users) }

    if (msg === `tags`) { console.log(tags) }

    if (colorChanged) { return handleColorChange(chatroom, users[username], color) }

    if (turboChange) { return handleTurboChange(chatroom, users[username], tags.turbo) }

    if (subChange) { return handleSubChange(chatroom, users[username], tags.subscriber) }

    if (modChange) { return handleModChange(chatroom, users[username], tags.mod) }

    if (vipChange) { return handleVIPChange(chatroom, users[username], tags.vip) }

    if (msg.toLowerCase().includes(`${BOT_USERNAME}`)) {
        const messages = [
            `Acknowledgement :)`,
            `🍋️`
        ]
        const response = messages[Math.floor(Math.random() * messages.length)]
        talk(chatroom, response)
        return
    }
}

// Helper functions
function handleNewChatter(chatroom, target) { talk(chatroom, `Hi ${target.displayName}, welcome to the stream!`) }

function getLastMessage(chatroom, target, room) {
    room in target ? talk(chatroom, `${target.displayName} last said: "${target[room].lastMessage}" in ${args[1]}'s chat!`) : talk(chatroom, `${target.displayName} last said: "${target[`${chatroom.slice(1)}`].lastMessage}" in ${chatroom.slice(1)}'s chat!`)
}

function getMessageCount(chatroom, target) {
    let response = `${target.displayName} has sent `
    const rooms = []
    for (const room in target) {
        if (target[room]?.msgCount) {
            rooms.push(`${target[room].msgCount} ${target[room].msgCount === 1 ? `message` : `messages`} in ${room}'s chat`)
        }
    }
    if (rooms.length > 1) {
        const lastRoom = rooms[rooms.length - 1].slice()
        rooms[rooms.length - 1] = `and ${lastRoom}`
    }
    response += `${rooms.join(`, `)}!`
    talk(chatroom, response)
}

function getColor(chatroom, target) {
    if (target.color in chatColors) {
        talk(chatroom, `${target.displayName}'s chat color is ${chatColors[target.color].name}!`)
    } else {
        talk(chatroom, `${target.displayName}'s chat color is hex code ${target.color}`)
    }
}

function handleColorChange(chatroom, target, newColor) {
    target.color = newColor
    talk(chatroom, `Acknowledging ${target.displayName}'s color change :)`)
}

function handleTurboChange(chatroom, target, turboStatus) {
    target.turbo = tags.turbo
    turboStatus ? talk(chatroom, `Wow, ${target.displayName} got Turbo? :D`) : talk(chatroom, `Did ${target.displayName} stop having Turbo? :O`)
}

function handleSubChange(chatroom, target, subStatus) {
    target[`${chatroom.slice(1)}`].sub = subStatus
    subStatus ? talk(chatroom, `Wow, ${target.displayName} is subbed now! :D`) : talk(chatroom, `Did ${target.displayName} just lose their sub? :O`)
}

function handleModChange(chatroom, target, modStatus) {
    target[`${chatroom.slice(1)}`].mod = modStatus
    modStatus ? talk(chatroom, `Wow, ${target.displayName} became a mod! :D`) : talk(chatroom, `Was ${target.displayName} just unmodded? :O`)
}

function handleVIPChange(chatroom, target, vipStatus) {
    target[`${chatroom.slice(1)}`].vip = vipStatus
    vipStatus ? talk(chatroom, `Wow, ${target.displayName} became a VIP! :D`) : talk(chatroom, `Did ${target.displayName} just lose VIP status? :O`)
}

function talk(chatroom, msg) {
    client.say(chatroom, msg)
    console.log(`${yellowBg}<${chatroom.slice(1)}> ${BOT_USERNAME}: ${msg}${resetTxt}`)
}

function getToUser(str) { return str.startsWith(`@`) ? str.substring(1) : str }

function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`)
    const onlineMsg = [
        `I'm awake :)`,
        `Let's see how long before I crash`,
        `🍋️`,
        `don't mind me`,
        `(just rebooting again)`,
        `(Windows 95 startup sound plays)`
    ]
    const response = onlineMsg[Math.floor(Math.random() * onlineMsg.length)]
    setTimeout(() => talk(jpegstripes, response), 3000)
}