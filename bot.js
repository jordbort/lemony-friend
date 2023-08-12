require(`dotenv`).config()
const tmi = require('tmi.js')
const BOT_USERNAME = process.env.BOT_USERNAME
const OAUTH_TOKEN = process.env.OAUTH_TOKEN

const jpegstripes = 'jpegstripes'
const sclarf = 'sclarf'
const e1ectroma = 'e1ectroma'
const domonintendo1 = 'domonintendo1'
const ppuyya = 'ppuyya'

const lemonyFresh = [
    BOT_USERNAME,
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



const chatColors = {
    "#0000FF": { name: "blue", terminalColor: blueTxt },
    "#8A2BE2": { name: "blue-violet", terminalColor: blueTxt },
    "#5F9EA0": { name: "cadet blue", terminalColor: cyanTxt },
    "#D2691E": { name: "chocolate", terminalColor: magentaTxt },
    "#FF7F50": { name: "coral", terminalColor: redTxt },
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

const opts = {
    identity: {
        username: BOT_USERNAME,
        password: OAUTH_TOKEN
    },
    channels: lemonyFresh
}

// Create a client with our options
const client = new tmi.client(opts)

// Register our event handlers (defined below)
client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)

// Connect to Twitch:
client.connect()

// 'first-msg': true??
let users = {}

function onMessageHandler(chatroom, tags, msg, self) {
    const username = tags.username
    const displayName = tags[`display-name`]
    const channel = chatroom.slice(1)
    const color = tags.color || "white, sure"

    if (self) { return }

    const colorChanged = username in users && color !== users[username]?.color
    // if (username in users && color !== users[username]?.color) {
    //     talk(`Acknowledging ${displayName}'s color change :)`)
    // }

    users[username] = {
        turbo: tags.turbo,
        color: tags.color
    }
    users[username][channel] = {
        sub: tags.subscriber,
        mod: tags.mod,
        lastMessage: msg
    }

    console.log(`${color in chatColors ? chatColors[color].terminalColor : whiteTxt}<${channel}> ${username}: ${msg}${resetTxt}`)
    // console.log(username, color in chatColors ? chatColors[color].name : color)

    if (msg === `show`) {
        console.log(`all users:`)
        console.log(users)
        talk(users.toString())
    }
    // client.say(chatroom, `Hi, ${tags.username}!`)

    if (colorChanged) {
        talk(`Acknowledging ${displayName}'s color change :)`)
        return
    }

    if (msg.toLowerCase().includes(`lemony_friend`)) {
        const onlineMsg = [
            `Acknowledgement :)`,
            `🍋️`
        ]
        const response = onlineMsg[Math.floor(Math.random() * onlineMsg.length)]
        talk(response)
    }

    function talk(resp) {
        client.say(chatroom, resp)
        console.log(`${yellowBg}<${channel}> lemony_friend: ${resp}${resetTxt}`)
    }
}

function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`)
    const onlineMsg = [
        `I'm awake :)`,
        `Let's see how long before I crash`,
        `🍋️`,
        `Hello World`
    ]
    const response = onlineMsg[Math.floor(Math.random() * onlineMsg.length)]
    client.say(`#${e1ectroma}`, `${response}`)
    console.log(`${yellowBg}<${e1ectroma}> lemony_friend: ${response}${resetTxt}`)
}