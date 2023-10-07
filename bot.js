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
    const target = toUser.toLowerCase() in users ? toUser.toLowerCase() : null

    // User attribute change detection
    const colorChanged = username in users && color !== users[username]?.color
    const turboChange = username in users && tags.turbo !== users[username]?.turbo
    const subChange = users[username]?.[channel]?.sub !== undefined && tags.subscriber !== users[username]?.[channel]?.sub
    const modChange = users[username]?.[channel]?.mod !== undefined && tags.mod !== users[username]?.[channel]?.mod
    const vipChange = users[username]?.[channel]?.vip !== undefined && (!!tags.vip || !!tags.badges?.vip) !== users[username]?.[channel]?.vip

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
            vip: !!tags.vip || !!tags.badges?.vip,
            msgCount: 0,
            lastMessage: msg
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
    if (msg === `ping`) { ping(lemonyFresh) }

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
            `(there are ${Object.keys(tempCmds).length} temporary command${Object.keys(tempCmds).length === 1 ? `` : `s`})`
        ]
        const response = onlineMsg[Math.floor(Math.random() * onlineMsg.length)]
        sayOnlineMsg = false
        return talk(chatroom, response)
    }

    if (colorChanged) { return handleColorChange(chatroom, users[username], color) }
    if (turboChange) { return handleTurboChange(chatroom, users[username], tags.turbo) }

    // User's first message in a given channel
    if (firstMsg) { return handleNewChatter(chatroom, users[username]) }

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
            commands.push(`${key}: ${tempCmds[key]}`)
        }
        return talk(chatroom, `All commands => ${commands.join(', ')}`)
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
            650: `sclarf will tace bell irl stream?`,
            675: `sclarf will sexc sclarf corp calendar`,
            700: `sclarf will go see trom!`
        }
        if (isNaN(subs)) {
            return talk(chatroom, args.join(` `))
        } else if (subs in goals) {
            return talk(chatroom, `At ${subs} subs, ${goals[subs]}`)
        }
        // else {
        //     const adjectives = [
        //         `nice`,
        //         `nice`,
        //         `friendly`,
        //         `friendly`,
        //         `sweet`,
        //         `lovely`,
        //         `warm`,
        //         `special`,
        //         `consensual`
        //     ]
        //     return talk(chatroom, `At ${subs} subs, sclarf will give @lemony_friend a ${adjectives[Math.floor(Math.random() * adjectives.length)]} hug! :)`)
        // }
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
    if (command === `!pokemon`) { return getPokemon(chatroom) }

    // JSON stats of user or toUser
    if (command === `!mystats`) {
        const user = target || username
        let data = `${user}: { displayName: '${users[user].displayName}', turbo: ${users[user].turbo}, color: ${users[user].color}`
        for (const key of Object.keys(users[user])) {
            if (typeof users[user][key] === `object`) {
                data += `, ${key}: { sub: ${users[user][key].sub}, mod: ${users[user][key].mod}, vip: ${users[user][key].vip}, msgCount: ${users[user][key].msgCount}, lastMessage: '${users[user][key].lastMessage}' }`
            }
        }
        data += ` }`
        return talk(chatroom, data)
    }

    // If bot mentioned in message
    if (msg.toLowerCase().includes(`lemon`)
        || msg.toLowerCase().includes(`melon`)) {
        // If the first word is a greeting
        const greetings = [
            `hello`,
            `howdy`,
            `howdi`,
            `hemblo`,
            `hemlo`,
            `henlo`,
            `helo`,
            `heyyyyyyyy`,
            `heyyyyyyy`,
            `heyyyyyy`,
            `heyyyyy`,
            `heyyyy`,
            `heyyy`,
            `heyy`,
            `hey`,
            `hi`,
            `sup`,
            `whatsup`,
            `whassup`,
            `whaddup`,
            `whadup`,
            `watsup`,
            `wadsup`,
            `wassup`,
            `whasup`,
            `wasup`,
            `wadup`,
            `whutsup`,
            `whussup`,
            `whuddup`,
            `whudup`,
            `wutsup`,
            `wudsup`,
            `wussup`,
            `whusup`,
            `wusup`,
            `wudup`
        ]
        if (greetings.includes(command)) { return handleGreet(chatroom, users[username]) }

        // If the first word is `gn` or `bye`
        if (command === `gn`
            || command === `bye`) { return sayGoodnight(chatroom, users[username]) }

        // If the first word is `good` followed by "night"-like word
        if (command === `good`) {
            const nights = [
                `night`,
                `nite`
            ]
            if (nights.includes(args[0].toLowerCase())) { return sayGoodnight(chatroom, users[username]) }
        }

        // If the first word is `thanks`-like
        const thanks = [
            `thanks`,
            `thabks`,
            `thonks`,
            `thamks`,
            `ty`,
            `thx`
        ]
        if (thanks.includes(command)) { return sayYoureWelcome(chatroom, users[username]) }

        // If the first word is `thank`-like and followed by "you"-like word
        const thankLike = [
            `thank`,
            `thx`,
            `thnk`,
            `thk`,
            `thabk`,
            `thonk`
        ]
        const yous = [
            `you`,
            `yew`,
            `yu`,
            `u`
        ]
        if (thankLike.includes(command)) {
            if (yous.includes(args[0].toLowerCase())) { return sayYoureWelcome(chatroom, users[username]) }
        }

        // All words after the first, in lower case
        const lowercaseArgs = args.map(str => str.toLowerCase())

        // Checking for "what's up"
        const whatsUpPrefix = [
            `what"s`,
            `what's`,
            `whats`,
            `what`,
            `whas`,
            `wats`,
            `wat`,
            `was`,
            `whut"s`,
            `whut's`,
            `whuts`,
            `whut`,
            `whus`,
            `wuts`,
            `wut`,
            `wus`
        ]
        // In case saying "what's up" first, and/or `up` doesn't come immediately
        if (whatsUpPrefix.includes(command)) {
            for (const str of lowercaseArgs) {
                if (str.slice(0, 2) === `up`) {
                    return handleGreet(chatroom, users[username])
                }
            }
        }

        // Check all words in message after the first
        for (const [i, val] of lowercaseArgs.entries()) {
            // Checking if greeting came later in message
            for (const str of greetings) {
                if (val.slice(0, str.length) === str) { return handleGreet(chatroom, users[username]) }
            }

            // If `gn` came later in the message
            if (val === `gn`) { return sayGoodnight(chatroom, users[username]) }

            // If `good` followed by "night"-like word came later in the message
            if (val === `good`) {
                const nights = [
                    `night`,
                    `nite`
                ]
                if (lowercaseArgs[i + 1] && nights.includes(lowercaseArgs[i + 1].toLowerCase())) { return sayGoodnight(chatroom, users[username]) }
            }

            // If thanks came later in message
            for (const str of thanks) {
                if (val === str) { return sayYoureWelcome(chatroom, users[username]) }
            }

            // If "thank"-like followed by "you"-like word came later in the message
            for (const str of thankLike) {
                if (val === str) {
                    if (lowercaseArgs[i + 1] && yous.includes(lowercaseArgs[i + 1].toLowerCase())) { return sayYoureWelcome(chatroom, users[username]) }
                }
            }

            // Checking if `up` (and preceeding "what's"-like word) came later in message
            if (val.slice(0, 2) === `up`) {
                for (const str of whatsUpPrefix) {
                    if (lowercaseArgs[i - 1].slice(0, str.length) === str) {
                        return handleGreet(chatroom, users[username])
                    }
                }
            }
        }
    }

    // User asking an "am i ...?" question about themselves
    if (command === `am`
        && args[0].toLowerCase() === `i`) {
        args.shift()
        const lowercaseArgs = args.map(str => str.toLowerCase())

        for (const str of lowercaseArgs) {
            const idx = lowercaseArgs.indexOf(str)

            // Asking about channel info
            if (str.slice(0, 3) === `sub`) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in users[username]) { return users[username][`jpegstripes`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to JPEGSTRIPES! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to JPEGSTRIPES! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in users[username]) { return users[username][`sclarf`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to sclarf! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to sclarf! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in users[username]) { return users[username][`domonintendo1`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to domonintendo1! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to domonintendo1! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in users[username]) { return users[username][`e1ectroma`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to e1ectroma! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to e1ectroma! :(`) }
                }
                return users[username][channel].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to ${channel}! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to ${channel}! :(`)
            }
            if (str.slice(0, 3) === `mod`) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in users[username]) { return users[username][`jpegstripes`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in JPEGSTRIPES's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in JPEGSTRIPES's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in users[username]) { return users[username][`sclarf`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in sclarf's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in sclarf's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in users[username]) { return users[username][`domonintendo1`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in domonintendo1's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in domonintendo1's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in users[username]) { return users[username][`e1ectroma`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in e1ectroma's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in e1ectroma's chat! :(`) }
                }
                return users[username][channel].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in ${channel}'s chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in ${channel}'s chat! :(`)
            }
            if (str.slice(0, 3) === `vip`) {
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
        && args[0].toLowerCase() === `i`) {
        args.shift()
        const lowercaseArgs = args.map(str => str.toLowerCase())

        for (const str of lowercaseArgs) {
            const idx = lowercaseArgs.indexOf(str)

            // Asking about channel info
            if (str.slice(0, 3) === `sub`) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in users[username]) { return users[username][`jpegstripes`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to JPEGSTRIPES! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to JPEGSTRIPES! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in users[username]) { return users[username][`sclarf`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to sclarf! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to sclarf! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in users[username]) { return users[username][`domonintendo1`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to domonintendo1! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to domonintendo1! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in users[username]) { return users[username][`e1ectroma`].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to e1ectroma! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to e1ectroma! :(`) }
                }
                return users[username][channel].sub ? talk(chatroom, `Yes ${displayName}, you are subbed to ${channel}! :)`) : talk(chatroom, `No ${displayName}, you are not subbed to ${channel}! :(`)
            }
            if (str.slice(0, 3) === `mod`) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in users[username]) { return users[username][`jpegstripes`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in JPEGSTRIPES's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in JPEGSTRIPES's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in users[username]) { return users[username][`sclarf`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in sclarf's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in sclarf's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in users[username]) { return users[username][`domonintendo1`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in domonintendo1's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in domonintendo1's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in users[username]) { return users[username][`e1ectroma`].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in e1ectroma's chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in e1ectroma's chat! :(`) }
                }
                return users[username][channel].mod ? talk(chatroom, `Yes ${displayName}, you are a mod in ${channel}'s chat! :)`) : talk(chatroom, `No ${displayName}, you are not a mod in ${channel}'s chat! :(`)
            }
            if (str.slice(0, 3) === `vip`) {
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
            if (str.slice(0, 3) === `sub`) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in targetedUser) { return targetedUser[`jpegstripes`].sub ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to JPEGSTRIPES! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to JPEGSTRIPES! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in targetedUser) { return targetedUser[`sclarf`].sub ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to sclarf! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to sclarf! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in targetedUser) { return targetedUser[`domonintendo1`].sub ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to domonintendo1! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to domonintendo1! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in targetedUser) { return targetedUser[`e1ectroma`].sub ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to e1ectroma! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to e1ectroma! :(`) }
                }
                return targetedUser[channel]?.sub ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to ${channel}! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to ${channel}! :(`)
            }
            if (str.slice(0, 3) === `mod`) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in targetedUser) { return targetedUser[`jpegstripes`].mod ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in JPEGSTRIPES's chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in JPEGSTRIPES's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in targetedUser) { return targetedUser[`sclarf`].mod ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in sclarf's chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in sclarf's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in targetedUser) { return targetedUser[`domonintendo1`].mod ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in domonintendo1's chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in domonintendo1's chat! :(`) }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in targetedUser) { return targetedUser[`e1ectroma`].mod ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in e1ectroma's chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in e1ectroma's chat! :(`) }
                }
                return targetedUser[channel]?.mod ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in ${channel}'s chat! :)`) : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in ${channel}'s chat! :(`)
            }
            if (str.slice(0, 3) === `vip`) {
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

    if (listening || channel === BOT_USERNAME) {
        // Parsing each message word
        const lowercaseArgs = args.map(str => str.toLowerCase())
        for (const str of lowercaseArgs) {
            // If a word starts with "but", and has a 4th letter that isn't T or punctuation, make it "BUTT-(rest of word)"
            if (str.slice(0, 3).toLowerCase() === `but`
                && str[3]
                && ![
                    `t`,
                    `T`,
                    `.`,
                    `,`,
                    `!`,
                    `?`
                ].includes(str[3])) {
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
                return setTimeout(() => { return talk(chatroom, msg) }, 1000)
            }
        }
    }

    // *** FUN NUMBER! ***
    if (users[username][channel].msgCount % 22 === 0) {
        let randomUser = getRandomUser()
        const funNumber = Math.floor(Math.random() * 50)
        console.log(`${boldTxt}*** Fun number triggered by`, users[username].displayName, `:`, funNumber, resetTxt)

        // Make 4-wide message pyramid of first word in message
        if (funNumber === 0) {
            const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME ? 1000 : 2000
            talk(chatroom, `${command}`)
            setTimeout(() => talk(chatroom, `${command} ${command}`), delay)
            setTimeout(() => talk(chatroom, `${command} ${command} ${command}`), delay * 2)
            setTimeout(() => talk(chatroom, `${command} ${command}`), delay * 3)
            setTimeout(() => talk(chatroom, `${command}`), delay * 4)
        }
        // Turn message count into dollars
        if (funNumber === 1) { return talk(chatroom, `Give me $${users[username][channel].msgCount} USD`) }
        // Turn message count into thousands of dollars to my account
        if (funNumber === 2) {
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
            return talk(chatroom, `${paymentMethods[paymentMethod]} ${users[username][channel].msgCount},000 usd`)
        }
        // Activate random redeem
        if (funNumber === 3) {
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
                ]
            } else if (chatroom === jpegstripes) {
                redeems = [
                    `!redeem bigshot`,
                    `!redeem keygen`,
                    `!redeem spotion`,
                    `!redeem thebigone`,
                    `!redeem bowtie`,
                    `!redeem neo`,
                    `!redeem workout`,
                    `!redeem suscr1ber`,
                    `!redeem mario`,
                    `!redeem piano`,
                    `!redeem slip`,
                    `!redeem hamster`,
                    `!redeem alarm`,
                    `!redeem waste`,
                    `!redeem 25k`,
                    `!redeem crabrave`,
                    `!redeem confusion`,
                    `!redeem soulja`,
                    `!redeem breakdance`,
                    `!redeem gigachad`,
                    `!redeem 4d3d3d3`,
                    `!redeem feedcat`,
                    `!redeem polarbear`,
                    `!redeem graph`,
                    `!redeem checkmate`,
                    `!redeem shutup`,
                    `!redeem doggo`,
                    `!redeem marshmallows`,
                    `!redeem chocotaco`,
                    `!redeem rat`,
                    `!redeem hamburger`,
                    `!redeem chickendance`,
                    `!redeem come`,
                    `!redeem gauntlet`,
                    `!redeem princess`,
                    `!redeem rubbermaid`,
                    `!redeem peachsyrup`,
                    `!redeem skype`,
                    `!redeem ohhimark`,
                    `!redeem dripgoku`,
                    `!redeem gelatin`,
                    `!redeem cheesecake`,
                    `!redeem fancam`,
                    `!redeem nicecock`,
                    `!redeem lieblingsfach`,
                    `!redeem lavish`,
                    `!redeem shootme`,
                    `!redeem disk`,
                    `!redeem flagranterror`,
                    `!redeem technology`,
                    `!redeem bingchilling`,
                    `!redeem flagranterror`,
                    `!redeem litlizards`,
                    `!redeem raccoon`,
                    `!redeem gay`,
                    `!redeem turbomaxwaste`,
                    `!redeem birthday`
                ]
            } else if (chatroom === sclarf) {
                redeems = [
                    `!redeem balls`,
                    `!redeem hat`,
                    `!redeem no`,
                    `!redeem omg`,
                    `!redeem why`,
                    `!redeem yes`
                ]
            } else {
                redeems = [`Give me ${users[username][channel].msgCount},000 dollars`]
            }
            const redeem = Math.floor(Math.random() * redeems.length)
            return talk(chatroom, redeems[redeem])
        }
        // Give hundreds of points (requires StreamElements)
        if (funNumber === 4 && chatroom !== domonintendo1) { return talk(chatroom, `!give ${username} ${users[username][channel].msgCount}00`) }
        // Lemonify a random user's random chat message
        if (funNumber === 5) {
            while (randomUser === BOT_USERNAME) { randomUser = getRandomUser() }
            const randomMsg = getRandomChannelMessage(users[randomUser])
            const lemonMsg = lemonify(randomMsg)
            return talk(chatroom, lemonMsg)
        }
        // Check for UndertaleBot and interact with a random user
        if (funNumber === 6 && `undertalebot` in users && Object.keys(users.undertalebot).includes(channel)) {
            while ([BOT_USERNAME, `undertalebot`].includes(randomUser)) { randomUser = getRandomUser() }
            const actions = [
                `!fight ${users[randomUser].displayName}`,
                `!act ${users[randomUser].displayName}`,
                `!mercy ${users[randomUser].displayName}`
            ]
            return talk(chatroom, actions[Math.floor(Math.random() * actions.length)])
        }
    }
}

// Helper functions
function handleNewChatter(chatroom, target) { talk(chatroom, `Hi ${target.displayName}, welcome to the stream!`) }

function getLastMessage(chatroom, target, room) {
    if (!(chatroom.slice(1) in target)) { return }
    room in target ? talk(chatroom, `${target.displayName} last said: "${target[room].lastMessage}" in ${room}'s chat!`) : talk(chatroom, `${target.displayName} last said: "${target[`${chatroom.slice(1)}`].lastMessage}" in ${chatroom.slice(1)}'s chat!`)
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

function yell(target, msg) {
    for (chatroom of lemonyFresh) {
        talk(chatroom, `${target.displayName} says: ${msg.substring(6)}`)
    }
}

async function getDadJoke(chatroom) {
    const response = await fetch("https://icanhazdadjoke.com/", {
        headers: {
            "Accept": "application/json",
        }
    })
    const data = await response.json()
    data.status === 200 ? talk(chatroom, data.joke) : talk(chatroom, `Error fetching dad joke! :(`)
}

async function getPokemon(chatroom) {
    let randNum = Math.ceil(Math.random() * 1281)
    console.log(`Looking up Pokemon #${randNum}...`)
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randNum}`)
    while (response.statusText !== `OK`) {
        randNum = Math.ceil(Math.random() * 1281)
        console.log(`Not Found! Looking up Pokemon #${randNum}...`)
        response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randNum}`)
    }
    const data = await response.json()
    talk(chatroom, `${data.name}: ${data.sprites.front_default}`)
}

function getColor(chatroom, target) {
    if (target.color in chatColors) {
        talk(chatroom, `${target.displayName}'s chat color is ${chatColors[target.color].name}!`)
    } else {
        talk(chatroom, `${target.displayName}'s chat color is hex code ${target.color}`)
    }
}

function getRandomUser() {
    const arr = Object.keys(users)
    const randomUser = arr[Math.floor(Math.random() * arr.length)]
    return randomUser
}

function getRandomChannelMessage(target) {
    const allKeys = Object.keys(target)
    let channelKey = Math.floor(Math.random() * allKeys.length)
    while (![
        `lemony_friend`,
        `jpegstripes`,
        `sclarf`,
        `e1ectroma`,
        `domonintendo1`,
        `ppuyya`
    ].includes(allKeys[channelKey])) { channelKey = Math.floor(Math.random() * allKeys.length) }
    const randomMessage = target[allKeys[channelKey]].lastMessage
    return randomMessage
}

function lemonify(str) {
    const words = str.split(` `)
    for (const word of words) {
        if (
            (word.toLowerCase() === `a`
                || word.toLowerCase() === `an`
                || word.toLowerCase() === `the`
            ) && words[words.indexOf(word) + 1]) {
            words[words.indexOf(word) + 1] = `lemon`
        }
    }
    const lemonifiedString = words.join(` `)
    return lemonifiedString
}

function handleGreet(chatroom, target) {
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
    let response = `${greetings[greeting]} ${target.displayName}`

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

function sayGoodnight(chatroom, target) {
    const greetings = [
        `Bye`,
        `Good night,`,
        `Sleep well,`,
        `See you next time,`,
        `Have a good night,`
    ]
    const greeting = Math.floor(Math.random() * greetings.length)
    let response = `${greetings[greeting]} ${target.displayName}`
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

function sayYoureWelcome(chatroom, target) {
    const welcomes = [
        `${target.displayName}`,
        `You're welcome, ${target.displayName}`,
        `No problem, ${target.displayName}`,
        `My pleasure, ${target.displayName}`,
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

function handleColorChange(chatroom, target, newColor) {
    target.color = newColor
    talk(chatroom, `Acknowledging ${target.displayName}'s color change :)`)
}

function handleTurboChange(chatroom, target, turboStatus) {
    target.turbo = turboStatus
    turboStatus ? talk(chatroom, `Wow, ${target.displayName} got Turbo? :D`) : talk(chatroom, `Did ${target.displayName} stop having Turbo? :O`)
}

function handleSubChange(chatroom, target, subStatus) {
    target[`${chatroom.slice(1)}`].sub = subStatus
    if (target.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => subStatus ? talk(chatroom, `Thank you for the gift sub! :D`) : talk(chatroom, `Aww, did I lose my sub? :(`), 2000)
    } else {
        subStatus ? talk(chatroom, `Wow, ${target.displayName} is subbed now! :D`) : talk(chatroom, `Did ${target.displayName} just lose their sub? :O`)
    }
}

function handleModChange(chatroom, target, modStatus) {
    target[`${chatroom.slice(1)}`].mod = modStatus
    if (target.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => modStatus ? talk(chatroom, `Thank you for modding me! :D`) : talk(chatroom, `Was I just unmodded? :O`), 2000)
    } else {
        modStatus ? talk(chatroom, `Wow, ${target.displayName} became a mod! :D`) : talk(chatroom, `Was ${target.displayName} just unmodded? :O`)
    }
}

function handleVIPChange(chatroom, target, vipStatus) {
    target[`${chatroom.slice(1)}`].vip = vipStatus
    if (target.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => vipStatus ? talk(chatroom, `Thank you for giving me VIP! :D`) : talk(chatroom, `Did I just lose VIP? :O`), 2000)
    } else {
        vipStatus ? talk(chatroom, `Wow, ${target.displayName} became a VIP! :D`) : talk(chatroom, `Did ${target.displayName} just lose VIP status? :O`)
    }
}

function checkEmoteStreak(chatroom, emoteArr, channel) {
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
}

function emoteReply(chatroom, channel, emoteArr) {
    console.log(`${boldTxt}> Running emoteReply()${resetTxt}`)
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
    console.log(`${boldTxt}Listening for streaks delayed...${resetTxt}`)
    listening = false
    setTimeout(() => {
        listening = true
        console.log(`${boldTxt}Listening for streaks again!${resetTxt}`)
    }, 30000)
}

function ping(arr) {
    for (const [i, str] of arr.entries()) {
        setTimeout(() => { talk(str, `hi :)`) }, 1000 * i)
    }
}

function talk(chatroom, msg) {
    client.say(chatroom, msg)
    console.log(`${yellowBg}<${chatroom.slice(1)}> ${BOT_USERNAME}: ${msg}${resetTxt}`)
}

function getToUser(str) { return str.startsWith(`@`) ? str.substring(1) : str }

function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`)
    sayOnlineMsg = true
}
