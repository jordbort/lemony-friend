require(`dotenv`).config()
const tmi = require('tmi.js')
const BOT_USERNAME = process.env.BOT_USERNAME
const OAUTH_TOKEN = process.env.OAUTH_TOKEN

const jpegstripes = process.env.CHANNEL_1
const sclarf = process.env.CHANNEL_2
const e1ectroma = process.env.CHANNEL_3
const domonintendo1 = process.env.CHANNEL_4
const ppuyya = process.env.CHANNEL_5

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

const users = {}
const tempCmds = {}
let listening = true
let sayOnlineMsg = true
let DEBUG_MODE = true

function onMessageHandler(chatroom, tags, message, self) {
    const msg = cleanupSpaces(message)
    const username = tags.username
    const displayName = tags[`display-name`]
    const channel = chatroom.slice(1)
    const color = tags.color
    const firstMsg = tags['first-msg']

    // Command and arguments parser
    const args = msg.split(` `)
    const command = args.shift().toLowerCase()
    const toUser = args[0] ? getToUser(args[0]) : ``
    const target = toUser.toLowerCase() in users ? toUser.toLowerCase() : null

    // User attribute change detection
    const colorChanged = username in users && color !== users[username]?.color
    // const turboChange = username in users && tags.turbo !== users[username]?.turbo
    const subChange = users[username]?.[channel]?.sub !== undefined && tags.subscriber !== users[username]?.[channel]?.sub
    const modChange = users[username]?.[channel]?.mod !== undefined && tags.mod !== users[username]?.[channel]?.mod
    const vipChange = users[username]?.[channel]?.vip !== undefined && (!!tags.vip || !!tags.badges?.vip) !== users[username]?.[channel]?.vip

    // Initialize new user
    if (!(username in users)) {
        users[username] = {
            displayName: tags[`display-name`],
            // turbo: tags.turbo,
            color: color
        }
    }
    // Initialize user in a new chatroom
    if (!(channel in users[username])) {
        users[username][channel] = {
            sub: tags.subscriber,
            mod: tags.mod,
            vip: !!tags.vip || !!tags.badges?.vip,
            msgCount: 0,
            lastMessage: msg,
            away: false,
            awayMessage: ``
        }
    }
    // Update last message in a chatroom, and increment counter by 1
    users[username][channel].lastMessage = msg
    users[username][channel].msgCount++

    // These checks happen earlier in case they happened to the bot
    if (subChange) { return handleSubChange(chatroom, users[username], tags.subscriber) }
    if (modChange) { return handleModChange(chatroom, users[username], tags.mod) }
    if (vipChange) { return handleVIPChange(chatroom, users[username], tags.vip) }

    // Stop here if bot, otherwise log user's chat message
    if (self) { return } else { console.log(`${color in chatColors ? chatColors[color].terminalColor : whiteTxt}<${channel}> ${username}: ${msg}${resetTxt}`) }

    /*********\
    REPLY CASES
    \*********/

    // For testing/debugging
    if (msg === `show`) { console.log(users, `tempCmds:`, tempCmds) }
    if (msg === `tags`) { console.log(tags) }
    if (command === `!ping`) { ping(args.length ? args : lemonyFresh) }

    // If first message since being away
    if (users[username][channel].away) {
        users[username][channel].away = false
        users[username][channel].awayMessage = ``
        return talk(chatroom, `Welcome back, ${displayName}! :)`)
    }

    if (sayOnlineMsg) {
        const numbers = [
            `zero`,
            `one`,
            `two`,
            `three`,
            `four`,
            `five`,
            `six`,
            `seven`,
            `eight`,
            `nine`,
            `ten`,
            `eleven`,
            `twelve`,
            `thirteen`,
            `fourteen`,
            `fifteen`,
            `sixteen`,
            `seventeen`,
            `eighteen`,
            `nineteen`,
            `twenty`,
            `twenty-one`,
            `twenty-two`,
            `twenty-three`,
            `twenty-four`,
            `twenty-five`,
            `twenty-six`,
            `twenty-seven`,
            `twenty-eight`,
            `twenty-nine`,
            `thirty`,
            `thirty-one`,
            `thirty-two`,
            `thirty-three`,
            `thirty-four`,
            `thirty-five`,
            `thirty-six`,
            `thirty-seven`,
            `thirty-eight`,
            `thirty-nine`,
            `forty`,
            `forty-one`,
            `forty-two`,
            `forty-three`,
            `forty-four`,
            `forty-five`,
            `forty-six`,
            `forty-seven`,
            `forty-eight`,
            `forty-nine`,
        ]
        const onlineMsg = [
            `Let's see how long before I crash`,
            `🍋️`,
            `don't mind me`,
            `(just rebooting again)`,
            `(Windows 95 startup sound plays)`,
            `I'm onl`,
            `reconnecting...`,
            `I have ${Object.keys(users).length <= 50 ? `${numbers[Object.keys(users).length]} (${Object.keys(users).length})` : Object.keys(users).length} friend${Object.keys(users).length === 1 ? `` : `s`}! :D`,
            `(there ${Object.keys(tempCmds).length === 1 ? `is` : `are`} ${Object.keys(tempCmds).length} temporary command${Object.keys(tempCmds).length === 1 ? `` : `s`})`,
            `Debug mode is currently ${DEBUG_MODE ? `ON` : `OFF`}! :)`,
            `thanksLikePattern has been updated to /^t(h*[aeou]*[bmn])*(ks+|x+)\b/i`
        ]
        const response = onlineMsg[Math.floor(Math.random() * onlineMsg.length)]
        sayOnlineMsg = false
        return talk(chatroom, response)
    }

    if (colorChanged) { return handleColorChange(chatroom, users[username], color) }
    // if (turboChange) { return handleTurboChange(chatroom, users[username], tags.turbo) }

    // User's first message in a given channel
    if (firstMsg) { return handleNewChatter(chatroom, users[username]) }

    // JSON stats of user or toUser
    if (command === `!mystats`) {
        const user = target || username
        let data = `${user}: { displayName: '${users[user].displayName}', color: ${users[user].color}`
        for (const key of Object.keys(users[user])) {
            if (typeof users[user][key] === `object`) {
                data += `, ${key}: { sub: ${users[user][key].sub}, mod: ${users[user][key].mod}, vip: ${users[user][key].vip}, msgCount: ${users[user][key].msgCount}, lastMessage: '${users[user][key].lastMessage}', away: ${users[user][key].away ? `${users[user][key].away}, awayMessage: '${users[user][key].awayMessage}'` : `${users[user][key].away}`} }`
            }
        }
        data += ` }`
        return talk(chatroom, data)
    }

    // All commands
    if (command === `!commands`) {
        talk(chatroom, `Commands: !greet => Say hi to one or more people, !bye => Say goodnight to someone, !yell => Chat across Lemony Fresh ${users[BOT_USERNAME].e1ectroma?.sub ? `e1ectr4Lemfresh ` : `🍋️`}, !away => (Optionally add an away message), !tempcmd => Make your own command! :)`)
    }

    if (command === `!subs`) {
        const subbedUsers = []
        const allUsers = []
        for (const key of Object.keys(users[BOT_USERNAME])) {
            if (users[BOT_USERNAME][key]?.sub === true) {
                subbedUsers.push(key)
            } else if (typeof users[BOT_USERNAME][key] === `object`) {
                allUsers.push(key)
            }
        }
        return subbedUsers.length ? talk(chatroom, `I am subbed to: ${subbedUsers.join(`, `)} :)`) : talk(chatroom, `I am not subbed to: ${allUsers.join(`, `)} :(`)
    }

    // If user mentions a user who is away
    for (const user of Object.keys(users)) {
        // console.log(`Checking for ${user}...`)
        if (msg.toLowerCase().includes(user) && users[user][channel]?.away) {
            let reply = `Unfortunately ${users[user].displayName} is away from chat right now!`
            users[user][channel].awayMessage ? reply += ` Their away message: "${users[user][channel].awayMessage}"` : ` :(`
            return talk(chatroom, reply)
        }
    }

    // Toggle DEBUG_MODE
    if ([
        `!debug`,
        `!debugmode`
    ].includes(command)) {
        const initialDebugState = DEBUG_MODE
        if (args[0]?.toLowerCase() === `on`) { DEBUG_MODE = true }
        else if (args[0]?.toLowerCase() === `off`) { DEBUG_MODE = false }
        else { DEBUG_MODE = !DEBUG_MODE }
        DEBUG_MODE === initialDebugState ? talk(channel, `Debug mode is currently ${DEBUG_MODE ? `ON` : `OFF`}! :)`) : talk(channel, `Debug mode is now ${DEBUG_MODE ? `ON` : `OFF`}! :)`)
    }

    // !lastmsg (Show a user's last message, optionally in a specified stream)
    if (command === `!lastmsg`) { return getLastMessage(chatroom, users[target] || users[username], args[1]?.toLowerCase()) }

    // !msgcount (Show a user's last message)
    if (command === `!msgcount`) { return getMessageCount(chatroom, users[target] || users[username]) }

    // !yell across all lemonyFresh chatrooms
    if (command === `!yell`) { return yell(users[username], msg) }

    // !friend(s) count
    if ([
        `!friend`,
        `!friends`
    ].includes(command)) {
        const numbers = [
            `zero`,
            `one`,
            `two`,
            `three`,
            `four`,
            `five`,
            `six`,
            `seven`,
            `eight`,
            `nine`,
            `ten`,
            `eleven`,
            `twelve`,
            `thirteen`,
            `fourteen`,
            `fifteen`,
            `sixteen`,
            `seventeen`,
            `eighteen`,
            `nineteen`,
            `twenty`,
            `twenty-one`,
            `twenty-two`,
            `twenty-three`,
            `twenty-four`,
            `twenty-five`,
            `twenty-six`,
            `twenty-seven`,
            `twenty-eight`,
            `twenty-nine`,
            `thirty`,
            `thirty-one`,
            `thirty-two`,
            `thirty-three`,
            `thirty-four`,
            `thirty-five`,
            `thirty-six`,
            `thirty-seven`,
            `thirty-eight`,
            `thirty-nine`,
            `forty`,
            `forty-one`,
            `forty-two`,
            `forty-three`,
            `forty-four`,
            `forty-five`,
            `forty-six`,
            `forty-seven`,
            `forty-eight`,
            `forty-nine`,
        ]
        return talk(chatroom, `I have ${Object.keys(users).length <= 50 ? `${numbers[Object.keys(users).length]} (${Object.keys(users).length})` : Object.keys(users).length} friend${Object.keys(users).length === 1 ? `` : `s`}! :D`)
    }

    // lemonify
    if (command === `!lemonify`) {
        if (!target) { return users[BOT_USERNAME].e1ectroma?.sub ? talk(chatroom, `e1ectr4Lemfresh e1ectr4Lemfresh e1ectr4Lemfresh :)`) : talk(chatroom, `🍋️🍋️🍋️ :)`) }
        const channelMsg = users[target][channel]?.lastMessage || getRandomChannelMessage(users[target])
        const lemonMsg = lemonify(channelMsg)
        return talk(chatroom, lemonMsg)
    }

    // !greet a user or whoever
    if (command === `!greet`) {
        // If one (known) username is used, greet normally
        if (target && !args[1]) { return handleGreet(chatroom, users[target]) }
        // If multiple args are used
        else if (args.length) { return handleMassGreet(chatroom, args) }
        // If no args are used
        else { return talk(chatroom, `Greetings, ${users[username].displayName}! :)`) }
    }

    // !tempcmd
    if (command === `!tempcmd`) {
        if (!args[0] || !args[1]) {
            return talk(chatroom, `Hey ${users[username].displayName}, use this command like: !tempcmd [commandname] [response...]! :)`)
        } else if (args[0].toLowerCase() === `delete`) {
            if (args[1].toLowerCase() in tempCmds) {
                delete tempCmds[args[1].toLowerCase()]
                return talk(chatroom, `Command "${args[1].toLowerCase()}" has been deleted! :)`)
            } else {
                return talk(chatroom, `No command "${args[1].toLowerCase()}" was found! :(`)
            }
        }
        else if (args[0].toLowerCase() in tempCmds) {
            tempCmds[args[0].toLowerCase()] = args.slice(1).join(` `)
            return talk(chatroom, `Command "${args[0].toLowerCase()}" has been edited! :)`)
        } else {
            tempCmds[args[0].toLowerCase()] = args.slice(1).join(` `)
            return talk(chatroom, `Temporary command "${args[0].toLowerCase()}" has been added! :)`)
        }
    }

    // !tempcmds
    if (command === `!tempcmds`) {
        const commands = []
        for (key in tempCmds) {
            commands.push(`${key} => "${tempCmds[key]}"`)
        }
        return talk(chatroom, `There ${commands.length === 1 ? `is` : `are`} ${commands.length} temporary command${commands.length === 1 ? `` : `s`}${commands.length === 0 ? ` :(` : `: ${commands.join(', ')}`}`)
    }

    // Check for tempCmd
    if (command in tempCmds) { return talk(chatroom, tempCmds[command]) }

    // sclarf SUBtember goals
    if (command === `!goals`
        && args.length
        && chatroom === sclarf) {
        const subs = Number(args[0])
        const goals = {
            25: `sclarf will play 3d pinball!`,
            50: `sclarf will make a food tirr list!`,
            75: `sclarf will have a fight club movie night!`,
            100: `sclarf will play hello kitty island adventure!`,
            125: `sclarf will play a 400-in-1 games console!`,
            150: `chat decidecs speedrun`,
            175: `sclarf will play just dance!`,
            200: `sclarf will do a cosplay!`,
            225: `lemony fresh stream???`,
            250: `sclarf will play Pokemon Soul Link!`,
            275: `mezcal tasting when pp`,
            300: `bianca stream`,
            325: `bianca cosplay`,
            350: `sclarf will do an art stream!`,
            375: `sclarf will have a casino night!`,
            400: `sclarf will play Pokemon Infinite fusion`,
            425: `chat pick cosplay`,
            450: `sclarf will game give away`,
            475: `big collab`,
            500: `sclarf will make a server in minecraft!`,
            525: `sclarf will play Dream Daddy or another dating sim!`,
            550: `LEGO STREAM`,
            575: `cooking adjacent goal`,
            600: `sclarf will END STREAM IMMEDIATELY`,
            625: `sclarf will Call shannon wonderwall`,
            650: `sclarf will taco bell irl stream?`,
            675: `sclarf will sexc sclarf corp calendar`,
            700: `sclarf will go see trom!`
        }
        if (!isNaN(subs) && subs in goals) { return talk(chatroom, `At ${subs} subs, ${goals[subs]}`) }
    }

    // !bye OR !gn OR !goodnight
    if (command === `!bye`
        || command === `!gn`
        || command === `!goodnight`) {
        if (target) { return sayGoodnight(chatroom, users[target]) }
        else if (args[0]) { return talk(chatroom, `see ya ${args[0]}`) }
        else { return sayGoodnight(chatroom, users[username]) }
    }

    // !color / !colour
    if ([
        `!color`,
        `!colour`
    ].includes(command)) { return getColor(chatroom, users[target] || users[username]) }

    // !dadjoke
    if (command === `!dadjoke`) { return getDadJoke(chatroom) }

    // !pokemon
    if (command === `!pokemon`) { return getPokemon(chatroom, args[0]) }

    // !away or !brb or !lurk
    if ([
        `!away`,
        `!brb`,
        `!lurk`
    ].includes(command)) {
        users[username][channel].away = true
        if (args.length) { users[username][channel].awayMessage = args.join(` `) }
        return args.length ? talk(chatroom, `See you later, ${displayName}! I'll pass along your away message if they mention you! :)`) : talk(chatroom, `See you later, ${displayName}! I'll let people know you're away if they mention you! :)`)
    }

    // If bot mentioned in message
    if (msg.toLowerCase().includes(`lemon`)
        || msg.toLowerCase().includes(`melon`)
        || msg.toLowerCase().includes(`lemfriend`)) {
        // If the first word is a greeting
        const greetingPattern = /^hey+\b|^hi+\b|^he.*lo+\b|^howd|sup+\b|^wh?[au].*up\b/i
        if (command.match(greetingPattern)) { return handleGreet(chatroom, users[username]) }

        // If the first word is `gn` or `bye`
        const goodNightPattern = /^ni(ght|te)|^gn|^(bye+)+/i
        if (command.match(goodNightPattern)) { return sayGoodnight(chatroom, users[username]) }

        // If the first word is `good` followed by "night"-like word
        if (command === `good` && args[0]?.match(goodNightPattern)) { return sayGoodnight(chatroom, users[username]) }

        // If the first word is `gj` or `nj`
        if ([`gj`, `nj`].includes(command)) { return sayThanks(chatroom, users[username]) }

        // If the first word is `good`/`nice` followed by `job` or `work`
        if ([`good`, `nice`].includes(command)
            && (args[0]?.match(/^job+/i) || args[0]?.match(/^work+/i))) {
            return sayThanks(chatroom, users[username])
        }

        // If the first word is `well` followed by `done`
        if (command === `well` && args[0]?.match(/^done+/i)) { return sayThanks(chatroom, users[username]) }

        // If the first word is `thanks`-like
        const thanksLikePattern = /^t(h*[aeou]*[bmn])*(ks+|x+)\b/i
        if (command.match(thanksLikePattern)) { return sayYoureWelcome(chatroom, users[username]) }

        // If the first word is `thank`-like and followed by "you"-like word
        const thankLikePattern = /^th*[aeou]*[bmn]*[kx]+\b/i
        const youLikePattern = /^yo?u\b|^yew\b|^u\b/i
        if (command.match(thankLikePattern) && args[0]?.match(youLikePattern)) { return sayYoureWelcome(chatroom, users[username]) }

        // All words after the first, in lower case
        const lowercaseArgs = args.map(str => str.toLowerCase())

        // Checking for "what's up"
        const whatsUpPrefixPattern = /^wh?[au]t?['"]*s*\b/i
        // In case saying "what's up" first, and/or `up` doesn't come immediately
        if (command.match(whatsUpPrefixPattern)) {
            for (const str of lowercaseArgs) {
                if (str.match(/^up/i)) {
                    return handleGreet(chatroom, users[username])
                }
            }
        }

        // Check all words in message after the first
        for (const [i, val] of lowercaseArgs.entries()) {
            if (DEBUG_MODE) {
                if (val.match(greetingPattern)) { console.log(`${boldTxt}> "${val}" matched greetingPattern${resetTxt}`) }
                if (val.match(goodNightPattern)) { console.log(`${boldTxt}> "${val}" matched goodNightPattern${resetTxt}`) }
                if (val === `good` && lowercaseArgs[i + 1]?.match(goodNightPattern)) { console.log(`${boldTxt}> "${val}" followed by "${lowercaseArgs[i + 1]}" matched goodNightPattern${resetTxt}`) }
                if (val.match(thanksLikePattern)) { console.log(`${boldTxt}> "${val}" matched thanksLikePattern${resetTxt}`) }
                if (val.match(thankLikePattern)) { console.log(`${boldTxt}> "${val}" matched thankLikePattern${resetTxt}`) }
                if (val.match(youLikePattern)) { console.log(`${boldTxt}> "${val}" matched youLikePattern${resetTxt}`) }
                if (val.match(thankLikePattern) && lowercaseArgs[i + 1]?.match(youLikePattern)) { console.log(`${boldTxt}> "${val}" matched thankLikePattern and "${lowercaseArgs[i + 1]}" matched youLikePattern${resetTxt}`) }
                if (val.match(thankLikePattern)) { console.log(`${boldTxt}> "${val}" matched thankLikePattern${resetTxt}`) }
                if (val.match(youLikePattern)) { console.log(`${boldTxt}> "${val}" matched youLikePattern${resetTxt}`) }
                if (val.match(whatsUpPrefixPattern)) { console.log(`${boldTxt}> "${val}" matched whatsUpPrefixPattern${resetTxt}`) }
                if (val.match(/^up+/) && lowercaseArgs[i - 1]?.match(whatsUpPrefixPattern)) { console.log(`${boldTxt}> "${val}" preceded by "${lowercaseArgs[i - 1]}" matched whatsUpPrefixPattern${resetTxt}`) }
            }
            // Checking if greeting came later in message
            if (val.match(greetingPattern)) { return handleGreet(chatroom, users[username]) }

            // Checking if `up` (and preceeding "what's"-like word) came later in message
            if (val.match(/^up+/) && lowercaseArgs[i - 1]?.match(whatsUpPrefixPattern)) { return handleGreet(chatroom, users[username]) }

            // If `gn` came later in the message
            if (val.match(goodNightPattern)) { return sayGoodnight(chatroom, users[username]) }

            // If `good` followed by "night"-like word came later in the message
            if (val === `good` && lowercaseArgs[i + 1]?.match(goodNightPattern)) { return sayGoodnight(chatroom, users[username]) }

            // If thanks came later in message
            if (val.match(thanksLikePattern)) { return sayYoureWelcome(chatroom, users[username]) }

            // If "thank"-like followed by "you"-like word came later in the message
            if (val.match(thankLikePattern) && lowercaseArgs[i + 1]?.match(youLikePattern)) { return sayYoureWelcome(chatroom, users[username]) }

            // If `gj` or `nj` came later in the message
            if ([`gj`, `nj`].includes(val)) { return sayThanks(chatroom, users[username]) }

            // If `good`/`nice` followed by `job`/`work` came later in the message
            if ([`good`, `nice`].includes(val)
                && (lowercaseArgs[i + 1]?.match(/^job+/) || lowercaseArgs[i + 1]?.match(/^work+/))) {
                return sayThanks(chatroom, users[username])
            }

            // If `well` followed by `done` came later in the message
            if (val === `well` && lowercaseArgs[i + 1].match(/^done+/)) { return sayThanks(chatroom, users[username]) }
        }
        if (DEBUG_MODE) { console.log(`${boldTxt}> Bot mentioned, but didn't trigger response${resetTxt}`) }
    }

    // User asking an "am i ...?" question about themselves
    if (command === `am`
        && args[0]?.toLowerCase() === `i`) {
        args.shift()
        const lowercaseArgs = args.map(str => str.toLowerCase())

        for (const str of lowercaseArgs) {
            const idx = lowercaseArgs.indexOf(str)

            // Asking about channel info
            if (str.match(/^sub/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in users[username]) { return users[username][`jpegstripes`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to JPEGSTRIPES! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to JPEGSTRIPES! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in users[username]) { return users[username][`sclarf`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to sclarf! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to sclarf! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in users[username]) { return users[username][`domonintendo1`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to domonintendo1! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to domonintendo1! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in users[username]) { return users[username][`e1ectroma`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to e1ectroma! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to e1ectroma! :(`) }
                }
                return users[username][channel].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to ${channel}! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to ${channel}! :(`)
            }
            if (str.match(/^mod/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in users[username]) { return users[username][`jpegstripes`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in JPEGSTRIPES's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in JPEGSTRIPES's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in users[username]) { return users[username][`sclarf`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in sclarf's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in sclarf's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in users[username]) { return users[username][`domonintendo1`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in domonintendo1's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in domonintendo1's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in users[username]) { return users[username][`e1ectroma`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in e1ectroma's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in e1ectroma's chat! :(`) }
                }
                return users[username][channel].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in ${channel}'s chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in ${channel}'s chat! :(`)
            }
            if (str.match(/^vip/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in users[username]) { return users[username][`jpegstripes`].vip ? talk(chatroom, `Yes ${displayName}, you are a vip in JPEGSTRIPES's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a vip in JPEGSTRIPES's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in users[username]) { return users[username][`sclarf`].vip ? talk(chatroom, `Yes ${displayName}, you are a vip in sclarf's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a vip in sclarf's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in users[username]) { return users[username][`domonintendo1`].vip ? talk(chatroom, `Yes ${displayName}, you are a vip in domonintendo1's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a vip in domonintendo1's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in users[username]) { return users[username][`e1ectroma`].vip ? talk(chatroom, `Yes ${displayName}, you are a vip in e1ectroma's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a vip in e1ectroma's chat! :(`) }
                }
                return users[username][channel].vip ? talk(chatroom, `Yes ${displayName}, you are a vip in ${channel}'s chat! :)`) : talk(chatroom, `No ${displayName}, you are not a vip in ${channel}'s chat! :(`)
            }
        }
    }

    // User asking a "do i ...?" question about themselves
    if (command === `do`
        && args[0]?.toLowerCase() === `i`) {
        args.shift()
        const lowercaseArgs = args.map(str => str.toLowerCase())

        for (const str of lowercaseArgs) {
            const idx = lowercaseArgs.indexOf(str)

            // Asking about channel info
            if (str.match(/^sub/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in users[username]) { return users[username][`jpegstripes`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to JPEGSTRIPES! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to JPEGSTRIPES! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in users[username]) { return users[username][`sclarf`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to sclarf! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to sclarf! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in users[username]) { return users[username][`domonintendo1`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to domonintendo1! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to domonintendo1! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in users[username]) { return users[username][`e1ectroma`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to e1ectroma! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to e1ectroma! :(`) }
                }
                return users[username][channel].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to ${channel}! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to ${channel}! :(`)
            }
            if (str.match(/^mod/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in users[username]) { return users[username][`jpegstripes`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in JPEGSTRIPES's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in JPEGSTRIPES's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in users[username]) { return users[username][`sclarf`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in sclarf's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in sclarf's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in users[username]) { return users[username][`domonintendo1`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in domonintendo1's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in domonintendo1's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in users[username]) { return users[username][`e1ectroma`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in e1ectroma's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in e1ectroma's chat! :(`) }
                }
                return users[username][channel].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in ${channel}'s chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in ${channel}'s chat! :(`)
            }
            if (str.match(/^vip/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in users[username]) { return users[username][`jpegstripes`].vip ? talk(chatroom, `Yes ${displayName}, you are a vip in JPEGSTRIPES's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a vip in JPEGSTRIPES's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in users[username]) { return users[username][`sclarf`].vip ? talk(chatroom, `Yes ${displayName}, you are a vip in sclarf's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a vip in sclarf's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in users[username]) { return users[username][`domonintendo1`].vip ? talk(chatroom, `Yes ${displayName}, you are a vip in domonintendo1's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a vip in domonintendo1's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in users[username]) { return users[username][`e1ectroma`].vip ? talk(chatroom, `Yes ${displayName}, you are a vip in e1ectroma's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a vip in e1ectroma's chat! :(`) }
                }
                return users[username][channel].vip ? talk(chatroom, `Yes ${displayName}, you are a vip in ${channel}'s chat! :)`) : talk(chatroom, `No ${displayName}, you are not a vip in ${channel}'s chat! :(`)
            }
        }
    }

    // User asking a question about another user
    if ([
        `is`,
        `does`
    ].includes(command)) {
        // Ignore if other user isn't known
        if (!target) { return }

        const targetedUser = users[target || username]
        args.shift()
        const lowercaseArgs = args.map(str => str.toLowerCase())

        for (const str of lowercaseArgs) {
            const idx = lowercaseArgs.indexOf(str)

            // Asking about other user's channel info
            if (str.match(/^sub/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in targetedUser) { return targetedUser[`jpegstripes`].sub ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to JPEGSTRIPES! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to JPEGSTRIPES! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in targetedUser) { return targetedUser[`sclarf`].sub ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to sclarf! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to sclarf! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in targetedUser) { return targetedUser[`domonintendo1`].sub ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to domonintendo1! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to domonintendo1! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in targetedUser) { return targetedUser[`e1ectroma`].sub ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to e1ectroma! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to e1ectroma! :(`) }
                }
                return targetedUser[channel]?.sub ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to ${channel}! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to ${channel}! :(`)
            }
            if (str.match(/^mod/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in targetedUser) { return targetedUser[`jpegstripes`].mod ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in JPEGSTRIPES's chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in JPEGSTRIPES's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in targetedUser) { return targetedUser[`sclarf`].mod ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in sclarf's chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in sclarf's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in targetedUser) { return targetedUser[`domonintendo1`].mod ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in domonintendo1's chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in domonintendo1's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in targetedUser) { return targetedUser[`e1ectroma`].mod ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in e1ectroma's chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in e1ectroma's chat! :(`) }
                }
                return targetedUser[channel]?.mod ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in ${channel}'s chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in ${channel}'s chat! :(`)
            }
            if (str.match(/^vip/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in targetedUser) { return targetedUser[`jpegstripes`].vip ? talk(chatroom, `Yes, ${targetedUser.displayName} is a VIP in JPEGSTRIPES's chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a VIP in JPEGSTRIPES's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in targetedUser) { return targetedUser[`sclarf`].vip ? talk(chatroom, `Yes, ${targetedUser.displayName} is a VIP in sclarf's chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a VIP in sclarf's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in targetedUser) { return targetedUser[`domonintendo1`].vip ? talk(chatroom, `Yes, ${targetedUser.displayName} is a VIP in domonintendo1's chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a VIP in domonintendo1's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in targetedUser) { return targetedUser[`e1ectroma`].vip ? talk(chatroom, `Yes, ${targetedUser.displayName} is a VIP in e1ectroma's chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a VIP in e1ectroma's chat! :(`) }
                }
                return targetedUser[channel]?.vip ? talk(chatroom, `Yes, ${targetedUser.displayName} is a VIP in ${channel}'s chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a VIP in ${channel}'s chat! :(`)
            }
        }
    }

    if (username === `streamelements` && (msg.includes(`lemony_friend`))) {
        console.log(`Current points:`, `points` in users[BOT_USERNAME][channel] ? users[BOT_USERNAME][channel].points : `(not known)`)
        if (args[0] === `gave` && `points` in users[BOT_USERNAME][channel]) {
            users[BOT_USERNAME][channel].points += Number(args[1])
            console.log(`> Received`, Number(args[1]), `points, thanks to`, command, `- now has:`, users[BOT_USERNAME][channel].points)
        }
        else if (args[1] === `has`) {
            users[BOT_USERNAME][channel].points = Number(args[2])
            console.log(`> Checked points, and has`, Number(args[2]))
        }
        else if (msg.includes(`jpegstSpamton`)) {
            console.log(`*** JPEG MODE ***`)
            if (msg.toLowerCase().includes(`all`)) {
                if (msg.toLowerCase().includes(`lost`)) {
                    users[BOT_USERNAME][channel].points = 0
                    console.log(`> Gambled ALL, LOST ALL, new amount:`, 0)
                } else {
                    users[BOT_USERNAME][channel].points = Number(args[args.length - 3].substring(2, 7))
                    console.log(`> Gambled ALL, 2x POINTS:`, Number(args[args.length - 3].substring(2, 7)))
                }
            } else if (msg.toLowerCase().includes(`lost`)) {
                users[BOT_USERNAME][channel].points = Number(args[args.length - 3])
                console.log(`> LOST SOME, new amount:`, Number(args[args.length - 3]))
            } else if (msg.toLowerCase().includes(`won`)) {
                users[BOT_USERNAME][channel].points = Number(args[args.length - 3].substring(2, 7))
                console.log(`> WON SOME, new amount:`, Number(args[args.length - 3].substring(2, 7)))
            }
        } else {
            if (msg.toLowerCase().includes(`all`)) {
                if (msg.toLowerCase().includes(`lost`)) {
                    users[BOT_USERNAME][channel].points = 0
                    console.log(`> Gambled ALL, LOST ALL, new amount:`, 0)
                } else {
                    users[BOT_USERNAME][channel].points = Number(args[args.length - 3])
                    console.log(`> Gambled ALL, 2x POINTS:`, Number(args[args.length - 3]))
                }
            } else if (msg.toLowerCase().includes(`lost`)) {
                users[BOT_USERNAME][channel].points = Number(args[args.length - 3])
                console.log(`> LOST SOME, new amount:`, Number(args[args.length - 3]))
            } else if (msg.toLowerCase().includes(`won`)) {
                users[BOT_USERNAME][channel].points = Number(args[args.length - 3])
                console.log(`> WON SOME, new amount:`, Number(args[args.length - 3]))
            }
        }
        console.log(`New points:`, `points` in users[BOT_USERNAME][channel] ? users[BOT_USERNAME][channel].points : `(not known)`)
        if (!(`points` in users[BOT_USERNAME][channel])) {
            talk(chatroom, `!points`)
        }
    }

    if (listening || channel === BOT_USERNAME) {
        // Parsing each message word
        const lowercaseArgs = args.map(str => str.toLowerCase())
        for (const str of lowercaseArgs) {
            // If a word starts with "but", and has a 4th letter that isn't T or punctuation, make it "BUTT-(rest of word)"
            if (str.match(/^but[a-s|u-z]/i)) {
                delayListening()
                return talk(chatroom, `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}? More like BUTT-${str.slice(3).toLowerCase()}`)
            }
        }

        // Look for emote streak (if bot is subbed)
        if (users[BOT_USERNAME]?.[`sclarf`]?.sub) {
            const sclarfEmotes = [
                `sclarfRave`,
                `sclarfWobble`,
                `sclarfBark`,
                `sclarfSpin`,
                `sclarfPls`,
                `sclarfMad`,
                `sclarfPog`,
                `sclarfHuh`,
                `sclarfHowdy`,
                `sclarfDog`,
                `sclarfBlind`,
                `sclarfPalm`,
                `sclarfDead`,
                `sclarfSophisticated`,
                `sclarfLUL`,
                `sclarfHiss`,
                `sclarfHearts`,
                `sclarfDEEP`,
                `sclarfGong`
            ]
            for (const str of sclarfEmotes) {
                if (msg.includes(str)) {
                    checkEmoteStreak(chatroom, sclarfEmotes, channel)
                    break
                }
            }
        }
        if (users[BOT_USERNAME]?.[`domonintendo1`]?.sub) {
            const domoEmotes = [
                `domoni6Really`,
                `domoni6Bingo`,
                `domoni6ChefHey`,
                `domoni6MeincSus`,
                `domoni6Sneeze`,
                `domoni6Dum`,
                `domoni6Love`
            ]
            for (const str of domoEmotes) {
                if (msg.includes(str)) {
                    checkEmoteStreak(chatroom, domoEmotes, channel)
                    break
                }
            }
        }
        if (users[BOT_USERNAME]?.[`e1ectroma`]?.sub) {
            const tromEmotes = [
                `e1ectr4Lfg`,
                `e1ectr4Pikadance`,
                `e1ectr4Tromadance`,
                `e1ectr4Coop`,
                `e1ectr4Ocha`,
                `e1ectr4Hello`,
                `e1ectr4Hi`,
                `e1ectr4Bye`,
                `e1ectr4Laugh`,
                `e1ectr4Wazzah`,
                `e1ectr4Smile`,
                `e1ectr4Devil`,
                `e1ectr4Ram`,
                `e1ectr4Salute`,
                `e1ectr4Lemfresh`,
                `e1ectr4Moses`,
                `e1ectr4Josie`,
                `e1ectr4Malort`,
                `e1ectr4Kim`
            ]
            for (const str of tromEmotes) {
                if (msg.includes(str)) {
                    checkEmoteStreak(chatroom, tromEmotes, channel)
                    break
                }
            }
        }
        if (users[BOT_USERNAME]?.[`jpegstripes`]?.sub) {
            const jpegEmotes = [
                `jpegstCoin`,
                `jpegstTimber`,
                `jpegstBamJAM`,
                `jpegstKylePls`,
                `jpegstJulian`,
                `jpegstHeyGuys`,
                `jpegstKylePog`,
                `jpegstSpamton`,
                `jpegstJPEG`,
                `jpegstRAID`,
                `jpegstYes`,
                `jpegstNo`,
                `jpegstOkay`,
                `jpegstSlay`,
                `jpegstBonk`,
                `jpegstMegamind`,
                `jpegstTapeEnd`,
                `jpegstDog`,
                `jpegstBlank`
            ]
            for (const str of jpegEmotes) {
                if (msg.includes(str)) {
                    checkEmoteStreak(chatroom, jpegEmotes, channel)
                    break
                }
            }
        }

        // Looking for a message to be repeated by at least two other users
        let streakCount = 0
        const streakUsers = []

        for (const user in users) {
            if (user !== BOT_USERNAME && users[user][channel]?.lastMessage === msg) {
                streakCount++
                streakUsers.push(users[user].displayName)
                if (streakCount >= 2) { console.log(`${boldTxt}Listening for message streak... ${streakCount}/3 "${msg}" - ${streakUsers.join(`, `)}${resetTxt}`) }
            }
            if (streakCount >= 3) {
                delayListening()
                setTimeout(() => { talk(chatroom, msg) }, 1000)
                return
            }
        }
        // if (DEBUG_MODE) { talk(chatroom, `Listening for message streak... ${streakCount}/3 "${msg}" - ${streakUsers.join(`, `)}`) }
    }

    // *** FUN NUMBER! ***
    const funNumberCount = 25
    const funNumberTotal = 50
    if (users[username][channel].msgCount % funNumberCount === 0) {
        const funNumber = Math.floor(Math.random() * funNumberTotal)
        console.log(`${boldTxt}*** Fun number triggered by`, users[username].displayName, `:`, funNumber, resetTxt)

        let randomUser = getRandomUser()
        const currencies = [
            {
                name: `dollars`,
                abbreviation: `usd`,
                symbol: `$`,
                zeroes: ``
            },
            {
                name: `dollars`,
                abbreviation: `usd`,
                symbol: `$`,
                zeroes: ``
            },
            {
                name: `dollars`,
                abbreviation: `usd`,
                symbol: `$`,
                zeroes: ``
            },
            {
                name: `dollars`,
                abbreviation: `usd`,
                symbol: `$`,
                zeroes: ``
            },
            {
                name: `dollars`,
                abbreviation: `usd`,
                symbol: `$`,
                zeroes: ``
            },
            {
                name: `japanese yen`,
                abbreviation: `jpy`,
                symbol: `¥`,
                zeroes: `00`
            },
            {
                name: `japanese yen`,
                abbreviation: `jpy`,
                symbol: `¥`,
                zeroes: `00`
            },
            {
                name: `korean won`,
                abbreviation: `krw`,
                symbol: `₩`,
                zeroes: `000`
            },
            {
                name: `korean won`,
                abbreviation: `krw`,
                symbol: `₩`,
                zeroes: `000`
            },
            {
                name: `turkish lira`,
                abbreviation: ``,
                symbol: `₺`,
                zeroes: `00`
            },
            {
                name: `turkish lira`,
                abbreviation: ``,
                symbol: `₺`,
                zeroes: `00`
            },
            {
                name: `british pound sterling`,
                abbreviation: `gbp`,
                symbol: `£`,
                zeroes: ``
            },
            {
                name: `british pound sterling`,
                abbreviation: `gbp`,
                symbol: `£`,
                zeroes: ``
            },
            {
                name: `mexican pesos`,
                abbreviation: `mxn`,
                symbol: `$`,
                zeroes: `0`
            },
            {
                name: `mexican pesos`,
                abbreviation: `mxn`,
                symbol: `$`,
                zeroes: `0`
            },
            {
                name: `canadian dollars`,
                abbreviation: `cad`,
                symbol: `$`,
                zeroes: `0`
            },
            {
                name: `canadian dollars`,
                abbreviation: `cad`,
                symbol: `$`,
                zeroes: `0`
            },
            {
                name: `euro`,
                abbreviation: `eur`,
                symbol: `€`,
                zeroes: ``
            },
            {
                name: `euro`,
                abbreviation: `eur`,
                symbol: `€`,
                zeroes: ``
            },
            {
                name: `australian dollars`,
                abbreviation: `aud`,
                symbol: `$`,
                zeroes: `0`
            },
            {
                name: `australian dollars`,
                abbreviation: `aud`,
                symbol: `$`,
                zeroes: `0`
            },
            {
                name: `malaysian ringgit`,
                abbreviation: `myr`,
                symbol: `RM`,
                zeroes: `0`
            },
            {
                name: `malaysian ringgit`,
                abbreviation: `myr`,
                symbol: `RM`,
                zeroes: `0`
            },
            {
                name: `indian rupees`,
                abbreviation: `inr`,
                symbol: `₹`,
                zeroes: `00`
            },
            {
                name: `indian rupees`,
                abbreviation: `inr`,
                symbol: `₹`,
                zeroes: `00`
            },
            {
                name: `zimbabwean dollars`,
                abbreviation: `zwd`,
                symbol: `$`,
                zeroes: `0000000000000000`
            }
        ]
        const randCurrency = Math.floor(Math.random() * currencies.length)
        const currency = currencies[randCurrency]

        // Make 4-wide message pyramid of first word in message
        if (funNumber === 0) {
            const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME ? 1000 : 2000
            talk(chatroom, `${command}`)
            setTimeout(() => talk(chatroom, `${command} ${command}`), delay)
            setTimeout(() => talk(chatroom, `${command} ${command} ${command}`), delay * 2)
            setTimeout(() => talk(chatroom, `${command} ${command}`), delay * 3)
            setTimeout(() => talk(chatroom, `${command}`), delay * 4)
        }
        // Turn message count into money
        else if (funNumber === 1) { return talk(chatroom, `Give me ${currency.symbol}${users[username][channel].msgCount}${currency.zeroes} ${currency.abbreviation.toUpperCase()}`) }
        // Turn message count into money to my account
        else if (funNumber === 2) {
            const paymentMethods = [
                `give me`,
                `give me`,
                `venmo me`,
                `venmo me`,
                `paypal me`,
                `paypal me`,
                `cashapp me`,
                `cashapp me`,
                `wire transfer me`,
                `wire transfer me`,
                `messenger pigeon me`,
                `messenger pigeon me`,
                `pls email me`,
                `write me a travelers check for`
            ]
            const paymentMethod = Math.floor(Math.random() * paymentMethods.length)
            return talk(chatroom, `${paymentMethods[paymentMethod]} ${users[username][channel].msgCount}${currency.zeroes} ${currency.name}`)
        }
        // Activate random redeem
        else if (funNumber === 3) {
            let redeems = []
            if (chatroom === e1ectroma) {
                redeems = [
                    `!winner`,
                    `!soda`,
                    `!pipe`,
                    `!nope`,
                    `!nice`,
                    `!n64`,
                    `!bork`,
                    `!maxwell`
                ]
            } else if (chatroom === jpegstripes) {
                redeems = [
                    `!bigshot`,
                    `!keygen`,
                    `!spotion`,
                    `!thebigone`,
                    `!bowtie`,
                    `!neo`,
                    `!workout`,
                    `!suscr1ber`,
                    `!mario`,
                    `!piano`,
                    `!slip`,
                    `!hamster`,
                    `!alarm`,
                    `!waste`,
                    `!25k`,
                    `!crabrave`,
                    `!confusion`,
                    `!soulja`,
                    `!breakdance`,
                    `!gigachad`,
                    `!4d3d3d3`,
                    `!feedcat`,
                    `!polarbear`,
                    `!graph`,
                    `!checkmate`,
                    `!shutup`,
                    `!doggo`,
                    `!marshmallows`,
                    `!chocotaco`,
                    `!rat`,
                    `!hamburger`,
                    `!chickendance`,
                    `!come`,
                    `!gauntlet`,
                    `!princess`,
                    `!rubbermaid`,
                    `!peachsyrup`,
                    `!skype`,
                    `!ohhimark`,
                    `!dripgoku`,
                    `!gelatin`,
                    `!cheesecake`,
                    `!fancam`,
                    `!nicecock`,
                    `!lieblingsfach`,
                    `!lavish`,
                    `!shootme`,
                    `!disk`,
                    `!flagranterror`,
                    `!technology`,
                    `!bingchilling`,
                    `!flagranterror`,
                    `!litlizards`,
                    `!raccoon`,
                    `!gay`,
                    `!turbomaxwaste`
                ]
            } else if (chatroom === sclarf) {
                redeems = [
                    `!balls`,
                    `!hat`,
                    `!no`,
                    `!omg`,
                    `!why`,
                    `!yes`
                ]
            } else if (chatroom === domonintendo1) {
                while (randomUser === BOT_USERNAME) { randomUser = getRandomUser() }
                redeems = [
                    `!slap ${randomUser}`
                ]
            }
            const redeem = Math.floor(Math.random() * redeems.length)
            return talk(chatroom, redeems[redeem])
        }
        // Give hundreds of points (requires StreamElements)
        else if (funNumber === 4 && chatroom !== domonintendo1) { return talk(chatroom, `!give ${username} ${users[username][channel].msgCount}00`) }
        // Lemonify a random user's random chat message
        else if (funNumber === 5) {
            while (randomUser === BOT_USERNAME) { randomUser = getRandomUser() }
            const randomMsg = getRandomChannelMessage(users[randomUser])
            const lemonMsg = lemonify(randomMsg)
            return talk(chatroom, lemonMsg)
        }
        // Check for UndertaleBot and interact with a random user
        else if (funNumber === 6 && `undertalebot` in users && Object.keys(users.undertalebot).includes(channel)) {
            while ([BOT_USERNAME, `undertalebot`].includes(randomUser)) { randomUser = getRandomUser() }
            const actions = [
                `!fight ${users[randomUser].displayName}`,
                `!act ${users[randomUser].displayName}`,
                `!mercy ${users[randomUser].displayName}`
            ]
            return talk(chatroom, actions[Math.floor(Math.random() * actions.length)])
        }
        else if (funNumber === 7) { return talk(chatroom, `This message has a 1 / ${(funNumberCount * funNumberTotal).toLocaleString()} chance of appearing`) }
    }
}

// Helper functions
function handleNewChatter(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleNewChatter(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    const greetings = [
        `Hi ${user.displayName}, welcome to the stream!`,
        `Hey ${user.displayName}, welcome to the stream!`,
        `Welcome to the stream, ${user.displayName}!`,
        `Hi ${user.displayName}, welcome in!`,
        `Hi ${user.displayName} :)`,
        `Hello @${user.displayName} welcome in!`,
        `@${user.displayName} welcome 2 ${chatroom.substring(1, 5)} strem`,
    ]
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    setTimeout(() => talk(chatroom, greeting), 5000)
}

function getLastMessage(chatroom, user, room) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getLastMessage(chatroom: ${chatroom}, user: ${user.displayName}, room: ${room})${resetTxt}`) }
    if (!(chatroom.slice(1) in user)) { return }
    room in user ? talk(chatroom, `${user.displayName} last said: "${user[room].lastMessage}" in ${room}'s chat!`) : talk(chatroom, `${user.displayName} last said: "${user[chatroom.slice(1)].lastMessage}" in ${chatroom.slice(1)}'s chat!`)
}

function getMessageCount(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getMessageCount(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    let response = `${user.displayName} has sent `
    const rooms = []
    for (const room in user) {
        if (user[room]?.msgCount) {
            rooms.push(`${user[room].msgCount} ${user[room].msgCount === 1 ? `message` : `messages`} in ${room}'s chat`)
        }
    }
    if (rooms.length > 1) {
        const lastRoom = rooms[rooms.length - 1].slice()
        rooms[rooms.length - 1] = `and ${lastRoom}`
    }
    response += `${rooms.join(`, `)}!`
    talk(chatroom, response)
}

function yell(user, msg) {
    for (chatroom of lemonyFresh) {
        talk(chatroom, `${user.displayName} says: ${msg.substring(6)}`)
    }
}

async function getDadJoke(chatroom) {
    const response = await fetch("https://icanhazdadjoke.com/", {
        headers: {
            "Accept": "application/json",
        }
    })
    const data = await response.json()
    if (DEBUG_MODE) { console.log(data) }
    data.status === 200 ? talk(chatroom, data.joke) : talk(chatroom, `Error fetching dad joke! :(`)
}

async function getPokemon(chatroom, pokemon) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getPokemon(chatroom: ${chatroom}, pokemon: ${pokemon})${resetTxt}`) }
    if (!pokemon) { return }

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
    if (response.statusText !== `OK`) {
        talk(chatroom, `Pokemon ${pokemon} was not found! :(`)
        return
    }
    const data = await response.json()

    let message = `#${data.id} ${pokemon.toUpperCase()} `

    const pokemonTypes = []
    for (const types of data.types) { pokemonTypes.push(types.type.name) }
    message += `(${pokemonTypes.join(`/`)}) - ${data.abilities.length === 1 ? `Ability` : `Abilities`}: `

    const pokemonAbilities = []
    for (const abilities of data.abilities) { pokemonAbilities.push(`${abilities.ability.name}${abilities.is_hidden ? ` (hidden)` : ``}`) }
    message += `${pokemonAbilities.join(`, `)}. `

    // if (DEBUG_MODE) {
    //     console.log(data.types)
    //     console.log(data.abilities)
    // }

    let type1Data
    let type2Data
    const doubleDamageTo = []
    const doubleDamageFrom = []
    const halfDamageTo = []
    const halfDamageFrom = []
    const immuneTo = []
    const immuneFrom = []

    if (pokemonTypes[0]) {
        // look up one type
        const response1 = await fetch(`https://pokeapi.co/api/v2/type/${pokemonTypes[0]}`)
        type1Data = await response1.json()
        for (const damageType of type1Data.damage_relations.double_damage_to) {
            if (!doubleDamageTo.includes(damageType.name)) { doubleDamageTo.push(damageType.name) }
        }
        for (const damageType of type1Data.damage_relations.double_damage_from) {
            if (!doubleDamageFrom.includes(damageType.name)) { doubleDamageFrom.push(damageType.name) }
        }
        for (const damageType of type1Data.damage_relations.half_damage_to) {
            if (!halfDamageTo.includes(damageType.name)) { halfDamageTo.push(damageType.name) }
        }
        for (const damageType of type1Data.damage_relations.half_damage_from) {
            if (!halfDamageFrom.includes(damageType.name)) { halfDamageFrom.push(damageType.name) }
        }
        for (const damageType of type1Data.damage_relations.no_damage_to) {
            if (!immuneTo.includes(damageType.name)) { immuneTo.push(damageType.name) }
        }
        for (const damageType of type1Data.damage_relations.no_damage_from) {
            if (!immuneFrom.includes(damageType.name)) { immuneFrom.push(damageType.name) }
        }
    }
    if (pokemonTypes[1]) {
        // look up two types
        const response2 = await fetch(`https://pokeapi.co/api/v2/type/${pokemonTypes[1]}`)
        type2Data = await response2.json()
        for (const damageType of type2Data.damage_relations.double_damage_to) {
            if (!doubleDamageTo.includes(damageType.name)) { doubleDamageTo.push(damageType.name) }
        }
        for (const damageType of type2Data.damage_relations.double_damage_from) {
            if (!doubleDamageFrom.includes(damageType.name)) { doubleDamageFrom.push(damageType.name) }
        }
        for (const damageType of type2Data.damage_relations.half_damage_to) {
            if (!halfDamageTo.includes(damageType.name)) { halfDamageTo.push(damageType.name) }
        }
        for (const damageType of type2Data.damage_relations.half_damage_from) {
            if (!halfDamageFrom.includes(damageType.name)) { halfDamageFrom.push(damageType.name) }
        }
        for (const damageType of type2Data.damage_relations.no_damage_to) {
            if (!immuneTo.includes(damageType.name)) { immuneTo.push(damageType.name) }
        }
        for (const damageType of type2Data.damage_relations.no_damage_from) {
            if (!immuneFrom.includes(damageType.name)) { immuneFrom.push(damageType.name) }
        }
    }

    // if (DEBUG_MODE) {
    //     type1Data && console.log(`type1Data.damage_relations:`, type1Data.damage_relations)
    //     type2Data && console.log(`type2Data.damage_relations:`, type2Data.damage_relations)
    // }

    // if it TAKES double damage AND half damage FROM a type, remove from BOTH arrays
    const nullify = []
    for (const type of doubleDamageFrom) {
        console.log(`Looking at:`, doubleDamageFrom.indexOf(type), type)
        if (halfDamageFrom.includes(type)) {
            console.log(`Found in both:`, type)
            // doubleDamageFrom.splice(doubleDamageFrom.indexOf(type), 1)
            // halfDamageFrom.splice(halfDamageFrom.indexOf(type), 1)
            nullify.push(type)
        }
    }
    for (const dupe of nullify) {
        doubleDamageFrom.splice(doubleDamageFrom.indexOf(dupe), 1)
        halfDamageFrom.splice(halfDamageFrom.indexOf(dupe), 1)
    }

    // Cleaning up immunities
    for (const type of immuneFrom) {
        if (halfDamageFrom.includes(type)) {
            console.log(`"Immunity from" found in halfDamageFrom:`, type)
            halfDamageFrom.splice(halfDamageFrom.indexOf(type), 1)
        }
        if (doubleDamageFrom.includes(type)) {
            console.log(`"Immunity from" found in doubleDamageFrom:`, type)
            doubleDamageFrom.splice(doubleDamageFrom.indexOf(type), 1)
        }
    }

    if (DEBUG_MODE) {
        console.log(`nullify:`, nullify)
        console.log(`doubleDamageTo:`, doubleDamageTo)
        console.log(`doubleDamageFrom:`, doubleDamageFrom)
        console.log(`halfDamageTo:`, halfDamageTo)
        console.log(`halfDamageFrom:`, halfDamageFrom)
        console.log(`immuneTo:`, immuneTo)
        console.log(`immuneFrom:`, immuneFrom)
    }

    if (doubleDamageTo.length > 0) { message += `Super effective to ${doubleDamageTo.join(`/`)}-type Pokemon. ` }
    if (doubleDamageFrom.length > 0) { message += `Weak to ${doubleDamageFrom.join(`/`)}-type moves. ` }
    if (halfDamageTo.length > 0) { message += `Not very effective to ${halfDamageTo.join(`/`)}-type Pokemon. ` }
    if (halfDamageFrom.length > 0) { message += `Resistant to ${halfDamageFrom.join(`/`)}-type moves. ` }
    if (immuneTo.length > 0) { message += `No effect to ${immuneTo.join(`/`)}-type Pokemon. ` }
    if (immuneFrom.length > 0) { message += `No effect from ${immuneFrom.join(`/`)}-type moves.` }
    talk(chatroom, message)
}

function getColor(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getColor(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    if (user.color in chatColors) {
        talk(chatroom, `${user.displayName}'s chat color is ${chatColors[user.color].name}!`)
    } else {
        talk(chatroom, `${user.displayName}'s chat color is hex code ${user.color}`)
    }
}

function getRandomUser() {
    const arr = Object.keys(users)
    const randomUser = arr[Math.floor(Math.random() * arr.length)]
    if (DEBUG_MODE) { console.log(`${boldTxt}> getRandomUser() picked: ${randomUser}${resetTxt}`) }
    return randomUser
}

function getRandomChannelMessage(user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getRandomChannelMessage(user: ${user.displayName})${resetTxt}`) }
    const allKeys = Object.keys(user)
    let channelKey = Math.floor(Math.random() * allKeys.length)
    while (![
        `lemony_friend`,
        `jpegstripes`,
        `sclarf`,
        `e1ectroma`,
        `domonintendo1`,
        `ppuyya`
    ].includes(allKeys[channelKey])) { channelKey = Math.floor(Math.random() * allKeys.length) }
    if (DEBUG_MODE) { console.log(`${boldTxt}...from ${allKeys[channelKey]}'s channel${resetTxt}`) }
    const randomMessage = user[allKeys[channelKey]].lastMessage
    return randomMessage
}

function lemonify(str) {
    const words = str.split(` `)
    const reservedKeywords = [
        `a`,
        `an`,
        `this`,
        `that`,
        `one`,
        `the`,
        `my`,
        `your`,
        `his`,
        `her`,
        `its`,
        `our`,
        `their`,
        `for`,
        `and`,
        `nor`,
        `by`,
        `or`,
        `yet`,
        `so`,
        `if`,
        `when`,
        `of`,
        `on`,
        `these`,
        `those`,
        `many`,
        `some`,
        `zero`,
        `one`,
        `two`,
        `three`,
        `four`,
        `five`,
        `six`,
        `seven`,
        `eight`,
        `nine`,
        `ten`,
        `eleven`,
        `twelve`,
        `thirteen`,
        `fourteen`,
        `fifteen`,
        `sixteen`,
        `seventeen`,
        `eightteen`,
        `nineteen`,
        `twenty`,
        `thirty`,
        `forty`,
        `fifty`,
        `sixty`,
        `seventy`,
        `eighty`,
        `ninety`,
        `hundred`,
        `thousand`,
        `million`,
        `billion`,
        `trillion`,
        `quadrillion`
    ]

    // Reading from last word to first
    for (let i = words.length - 1; i >= 0; i--) {
        const number = Number(words[i])
        const append = []
        while (words[i + 1] && words[i + 1].match(/[^a-zA-Z]$/)) {
            append.push(words[i + 1][words[i + 1].length - 1])
            words[i + 1] = words[i + 1].substring(0, words[i + 1].length - 1)
        }
        append.reverse()

        // Definitely singular
        if ((
            number === 1
            || [
                `a`,
                `an`,
                `this`,
                `that`,
                `one`
            ].includes(words[i].toLowerCase())
            && !reservedKeywords.includes(words[i + 1]))
            && words[i + 1]
        ) {
            if (words[i].toLowerCase() === `an`) { words[i] = `a` }
            words[i + 1] = `lemon${append.join(``)}`
        }

        // Definitely plural
        else if ((
            ((number || number === 0) && number !== 1)
            || [
                `these`,
                `those`,
                `many`,
                `some`,
                `zero`,
                `two`,
                `three`,
                `four`,
                `five`,
                `six`,
                `seven`,
                `eight`,
                `nine`,
                `ten`,
                `eleven`,
                `twelve`,
                `thirteen`,
                `fourteen`,
                `fifteen`,
                `sixteen`,
                `seventeen`,
                `eightteen`,
                `nineteen`,
                `twenty`,
                `thirty`,
                `forty`,
                `fifty`,
                `sixty`,
                `seventy`,
                `eighty`,
                `ninety`,
                `hundred`,
                `thousand`,
                `million`,
                `billion`,
                `trillion`,
                `quadrillion`
            ].includes(words[i].toLowerCase()))
            && words[i + 1]
            && !reservedKeywords.includes(words[i + 1])
        ) { words[i + 1] = `lemons${append.join(``)}` }

        // Ambiguous count
        else if ((
            [`the`,
                `my`,
                `your`,
                `his`,
                `her`,
                `its`,
                `whose`,
                `our`,
                `their`,
                `for`,
                `and`,
                `nor`,
                `by`,
                `or`,
                `yet`,
                `so`,
                `if`,
                `when`,
                `of`,
                `on`,
                `to`
            ].includes(words[i].toLowerCase()))
            && words[i + 1]
            && !reservedKeywords.includes(words[i + 1])
        ) { words[i + 1] = words[i + 1].match(/[^s][s]$/i) ? `lemons${append.join(``)}` : `lemon${append.join(``)}` }
        else if (words[i + 1]) { words[i + 1] = `${words[i + 1]}${append.join(``)}` }
    }

    const lemonifiedString = words.join(` `)
    return lemonifiedString
}

function handleGreet(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleGreet(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    const greetings = [
        `Howdy,`,
        `Hello,`,
        `Hey,`,
        `Hi,`,
        `Hey there,`,
        `Hello`,
        `Hey`,
        `Hi`,
        `Hey there`
    ]
    const greeting = Math.floor(Math.random() * greetings.length)
    let response = `${greetings[greeting]} ${user.displayName}`

    // If the greeting is "Howdy"
    if (greeting === 0) {
        response += `! :)`
    } else if (greeting < greetings.indexOf(`Hello`)) {
        // If there's a comma after the greeting
        const appends = [
            `How are you doing today?`,
            `How are you today?`,
            `How are you doing?`,
            `How are you?`,
            `How's it going?`,
            `How goes it?`
        ]
        response += `! ${appends[Math.floor(Math.random() * appends.length)]} :)`
    } else {
        // If there's no comma after the greeting
        const appends = [
            `how are you doing today?`,
            `how are you today?`,
            `how are you doing?`,
            `how are you?`,
            `how's it going?`,
            `how goes it?`
        ]
        response += `, ${appends[Math.floor(Math.random() * appends.length)]} :)`
    }
    talk(chatroom, response)
}

function handleMassGreet(chatroom, arr) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleGreet(chatroom: ${chatroom}, arr: ${arr})${resetTxt}`) }
    const response = []
    const greetings = [
        `hello`,
        `howdy`,
        `hey`,
        `hi`
    ]
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
    const emotes = [
        `HeyGuys`,
        `:)`
    ]
    if (users[BOT_USERNAME]?.[`sclarf`]?.sub) { emotes.push(`sclarfWobble`, `sclarfPls`, `sclarfPog`, `sclarfHowdy`, `sclarfDog`, `sclarfHearts`) }
    if (users[BOT_USERNAME]?.[`domonintendo1`]?.sub) { emotes.push(`domoni6ChefHey`, `domoni6Sneeze`, `domoni6Love`) }
    if (users[BOT_USERNAME]?.[`e1ectroma`]?.sub) { emotes.push(`e1ectr4Pikadance`, `e1ectr4Tromadance`, `e1ectr4Hello`, `e1ectr4Hi`, `e1ectr4Smile`, `e1ectr4Ram`, `e1ectr4Salute`, `e1ectr4Lemfresh`) }
    if (users[BOT_USERNAME]?.[`jpegstripes`]?.sub) { emotes.push(`jpegstBamJAM`, `jpegstKylePls`, `jpegstJulian`, `jpegstHeyGuys`, `jpegstSlay`) }
    const randomEmote = emotes[Math.floor(Math.random() * emotes.length)]
    for (let str of arr) {
        if (str.startsWith(`@`)) { str = str.substring(1) }
        if (str.toLowerCase() in users) {
            response.push(`${randomGreeting} ${users[str.toLowerCase()].displayName} ${randomEmote}`)
        } else {
            response.push(`${randomGreeting} ${str} ${randomEmote}`)
        }
    }
    talk(chatroom, response.join(` `))
}

function sayGoodnight(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleGreet(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    const greetings = [
        `Bye`,
        `Good night,`,
        `Sleep well,`,
        `See you next time,`,
        `Have a good night,`
    ]
    const greeting = Math.floor(Math.random() * greetings.length)
    let response = `${greetings[greeting]} ${user.displayName}`
    if (greeting === 0) {
        const appends = [
            `sleep well`,
            `see you next time`,
            `have a good night`,
        ]
        response += `, ${appends[Math.floor(Math.random() * appends.length)]}`
    }
    response += `! :)`
    talk(chatroom, response)
}

function sayYoureWelcome(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> sayYoureWelcome(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    const welcomes = [
        `${user.displayName}`,
        `You're welcome, ${user.displayName}`,
        `No problem, ${user.displayName}`,
        `My pleasure, ${user.displayName}`,
    ]
    const welcome = Math.floor(Math.random() * welcomes.length)
    let response = `${welcomes[welcome]}`
    if (welcome === 0) {
        const appends = [
            `you're welcome`,
            `no problem`,
            `my pleasure`
        ]
        response += ` ${appends[Math.floor(Math.random() * appends.length)]}`
    }
    response += `! :)`
    talk(chatroom, response)
}

function sayThanks(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> sayThanks(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    const thanks = [
        `${user.displayName}`,
        `Thanks, ${user.displayName}`,
        `Thanks, ${user.displayName}`,
        `Thanks, ${user.displayName}`,
        `Thank you, ${user.displayName}`,
        `Thank you, ${user.displayName}`,
        `Thank you, ${user.displayName}`,
        `Thank you so much, ${user.displayName}`,
        `Hey thanks, ${user.displayName}`,
        `Aw thanks, ${user.displayName}`
    ]
    const sentiment = Math.floor(Math.random() * thanks.length)
    let response = `${thanks[sentiment]}`
    if (sentiment === 0) {
        const appends = [
            `thanks`,
            `thank you`,
            `thank you so much`
        ]
        response += ` ${appends[Math.floor(Math.random() * appends.length)]}`
    }
    response += `! :)`
    talk(chatroom, response)
}

function handleColorChange(chatroom, user, newColor) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleColorChange(chatroom: ${chatroom}, user: ${user.displayName}, newColor: ${newColor})${resetTxt}`) }
    user.color = newColor
    talk(chatroom, `Acknowledging ${user.displayName}'s color change :)`)
}

// function handleTurboChange(chatroom, user, turboStatus) {
//     if (DEBUG_MODE) { console.log(`${boldTxt}> handleTurboChange(chatroom: ${chatroom}, user: ${user.displayName}, turboStatus: ${turboStatus})${resetTxt}`) }
//     user.turbo = turboStatus
//     turboStatus ? talk(chatroom, `Wow, ${user.displayName} got Turbo? :D`) : talk(chatroom, `Did ${user.displayName} stop having Turbo? :O`)
// }

function handleSubChange(chatroom, user, subStatus) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleSubChange(chatroom: ${chatroom}, user: ${user.displayName}, subStatus: ${subStatus})${resetTxt}`) }
    user[chatroom.slice(1)].sub = subStatus
    if (user.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => subStatus ? talk(chatroom, `Thank you for the gift sub! :D`) : talk(chatroom, `Aww, did I lose my sub? :(`), 2000)
    } else {
        subStatus ? talk(chatroom, `Wow, ${user.displayName} is subbed now! :D`) : talk(chatroom, `Did ${user.displayName} just lose their sub? :O`)
    }
}

function handleModChange(chatroom, user, modStatus) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleModChange(chatroom: ${chatroom}, user: ${user.displayName}, modStatus: ${modStatus})${resetTxt}`) }
    user[chatroom.slice(1)].mod = modStatus
    if (user.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => modStatus ? talk(chatroom, `Thank you for modding me! :D`) : talk(chatroom, `Was I just unmodded? :O`), 2000)
    } else {
        modStatus ? talk(chatroom, `Wow, ${user.displayName} became a mod! :D`) : talk(chatroom, `Was ${user.displayName} just unmodded? :O`)
    }
}

function handleVIPChange(chatroom, user, vipStatus) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleVIPChange(chatroom: ${chatroom}, user: ${user.displayName}, vipStatus: ${vipStatus})${resetTxt}`) }
    user[chatroom.slice(1)].vip = vipStatus
    if (user.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => vipStatus ? talk(chatroom, `Thank you for giving me VIP! :D`) : talk(chatroom, `Did I just lose VIP? :O`), 2000)
    } else {
        vipStatus ? talk(chatroom, `Wow, ${user.displayName} became a VIP! :D`) : talk(chatroom, `Did ${user.displayName} just lose VIP status? :O`)
    }
}

function checkEmoteStreak(chatroom, emoteArr, channel) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> checkEmoteStreak(chatroom: ${chatroom}, emoteArr.length: ${emoteArr.length}, channel: ${channel})${resetTxt}`) }
    let emoteStreakCount = 0
    const emoteStreakUsers = []
    // Checking if message includes any of the provided emotes
    for (const user in users) {
        for (const str of emoteArr) {
            if (user !== BOT_USERNAME && users[user][channel]?.lastMessage.includes(str)) {
                emoteStreakCount++
                emoteStreakUsers.push(users[user].displayName)
                if (emoteStreakCount >= 2) { console.log(`${boldTxt}Looking for ${emoteArr[0].substring(0, 4)} emotes... ${emoteStreakCount}/4 messages - ${emoteStreakUsers.join(`, `)}${resetTxt}`) }
                break
            }
        }
        if (emoteStreakCount >= 4) {
            delayListening()
            return emoteReply(chatroom, channel, emoteArr)
        }
    }
    // if (DEBUG_MODE) { talk(chatroom, `Looking for ${emoteArr[0].substring(0, 4)} emotes... ${emoteStreakCount}/4 messages - ${emoteStreakUsers.join(`, `)}`) }
}

function emoteReply(chatroom, channel, emoteArr) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> emoteReply(chatroom: ${chatroom}, channel: ${channel}, emoteArr: ${emoteArr})${resetTxt}`) }
    const popularEmotes = Array(emoteArr.length).fill(0)
    for (const [i, val] of emoteArr.entries()) {
        for (const user in users) {
            if (channel in users[user]) {
                const words = users[user][channel].lastMessage.split(` `)
                for (const str of words) {
                    if (str === val) {
                        popularEmotes[i]++
                        console.log(`${boldTxt}...${val} increased to ${popularEmotes[i]} from ${users[user].displayName}${resetTxt}`)
                    }
                }
            }
        }
    }
    const mostVotes = Math.max(...popularEmotes)
    const mostPopularEmoteIdx = popularEmotes.indexOf(mostVotes)
    const mostPopularEmote = emoteArr[mostPopularEmoteIdx]
    console.log(popularEmotes, mostPopularEmoteIdx, mostVotes, mostPopularEmote)
    talk(chatroom, `${mostPopularEmote} ${mostPopularEmote} ${mostPopularEmote} ${mostPopularEmote}`)
}

function delayListening() {
    console.log(`${boldTxt}> delayListening() 30 seconds...${resetTxt}`)
    listening = false
    setTimeout(() => {
        listening = true
        console.log(`${boldTxt}> Listening for streaks again!${resetTxt}`)
    }, 30000)
}

function ping(arr) {
    for (const [i, str] of arr.entries()) {
        setTimeout(() => { talk(str, `hi :)`) }, 1000 * i)
    }
}

function cleanupSpaces(str) {
    let newStr = ``
    for (let i = 0; i < str.length; i++) {
        if (!(str[i] === ` ` && str[i + 1] === ` `)) {
            newStr += str[i]
        } else if (DEBUG_MODE) { console.log(`${boldTxt}> cleanupSpaces() removed a double space!${resetTxt}`) }
    }
    return newStr
}

function talk(chatroom, msg) {
    client.say(chatroom, msg)
    console.log(`${yellowBg}<${chatroom.slice(1)}> ${BOT_USERNAME}: ${msg}${resetTxt}`)
}

function getToUser(str) { return str.startsWith(`@`) ? str.substring(1) : str }

function printLemon() {
    const noSq = `  `
    const bkSq = `\x1b[40m  \x1b[0m`
    const gnSq = `\x1b[42m  \x1b[0m`
    const ywSq = `\x1b[43m  \x1b[0m`
    const whSq = `\x1b[47m  \x1b[0m`
    const lemonyFriendTitleSpacedOutTopTextYayyyy = `${yellowBg}${boldTxt}L e m o n y ${resetTxt}`
    const lemonyFriendTitleSpacedOutBottomTextYay = `${yellowBg}${boldTxt}F r i e n d ${resetTxt}`
    console.log(noSq + noSq + noSq + noSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + gnSq + bkSq + noSq + noSq + noSq + noSq + bkSq + bkSq + bkSq + bkSq + bkSq + bkSq + bkSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + bkSq + gnSq + gnSq + bkSq + bkSq + bkSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq + bkSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + bkSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + bkSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + bkSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + bkSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + bkSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + bkSq + gnSq + gnSq + gnSq + gnSq + bkSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + gnSq + bkSq + noSq + noSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + lemonyFriendTitleSpacedOutTopTextYayyyy + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + gnSq + bkSq + noSq + noSq + noSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + lemonyFriendTitleSpacedOutBottomTextYay + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + bkSq + bkSq + noSq + noSq + noSq + noSq + noSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + bkSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + bkSq + bkSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq + bkSq + bkSq + bkSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + bkSq + bkSq + bkSq + bkSq + bkSq)
}

function onConnectedHandler(addr, port) {
    printLemon()
    console.log(`* Connected to ${addr}:${port}`)
    sayOnlineMsg = true
}
