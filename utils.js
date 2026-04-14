const DEV = process.env.DEV
const BOT_ID = Number(process.env.BOT_ID)
const BOT_USERNAME = process.env.BOT_USERNAME

const fs = require(`fs/promises`)

const { settings, lemonyFresh, mods, users, knownTags, lemCmds, wordBank } = require(`./data`)

// Terminal colors
const terminalColors = {
    resetTxt: `\x1b[0m`,
    boldTxt: `\x1b[1m`,
    underlined: `\x1b[4m`,
    inverted: `\x1b[7m`,

    blackTxt: `\x1b[30m`,
    redTxt: `\x1b[31m`,
    greenTxt: `\x1b[32m`,
    yellowTxt: `\x1b[33m`,
    blueTxt: `\x1b[34m`,
    magentaTxt: `\x1b[35m`,
    cyanTxt: `\x1b[36m`,
    whiteTxt: `\x1b[37m`,
    grayTxt: `\x1b[90m`,
    orangeTxt: `\x1b[38;5;208m`,

    blackBg: `\x1b[40m`,
    redBg: `\x1b[41m`,
    greenBg: `\x1b[42m`,
    yellowBg: `\x1b[43m`,
    blueBg: `\x1b[44m`,
    magentaBg: `\x1b[45m`,
    cyanBg: `\x1b[46m`,
    whiteBg: `\x1b[47m`,
    grayBg: `\x1b[100m`,
    orangeBg: `\x1b[48;2;255;164;0m`
}

// Twitch color names and terminal color references
const chatColors = {
    '#0000FF': { name: `blue`, terminalColor: terminalColors.blueTxt },
    '#8A2BE2': { name: `blue-violet`, terminalColor: terminalColors.blueTxt },
    '#5F9EA0': { name: `cadet blue`, terminalColor: terminalColors.cyanTxt },
    '#D2691E': { name: `chocolate`, terminalColor: terminalColors.magentaTxt },
    '#FF7F50': { name: `coral`, terminalColor: terminalColors.magentaTxt },
    '#1E90FF': { name: `dodger blue`, terminalColor: terminalColors.cyanTxt },
    '#B22222': { name: `firebrick`, terminalColor: terminalColors.redTxt },
    '#DAA520': { name: `goldenrod`, terminalColor: terminalColors.yellowTxt },
    '#008000': { name: `green`, terminalColor: terminalColors.greenTxt },
    '#FF69B4': { name: `hot pink`, terminalColor: terminalColors.redTxt },
    '#FF4500': { name: `orange-red`, terminalColor: terminalColors.orangeTxt },
    '#FF0000': { name: `red`, terminalColor: terminalColors.redTxt },
    '#2E8B57': { name: `sea green`, terminalColor: terminalColors.greenTxt },
    '#00FF7F': { name: `spring green`, terminalColor: terminalColors.greenTxt },
    '#ADFF2F': { name: `yellow-green`, terminalColor: terminalColors.yellowTxt }
}

const twitchUsernamePattern = /^[a-z0-9_]{4,25}$/i
const emotePattern = /\b([a-z][a-z0-9]{2,9}[A-Z0-9][a-zA-Z0-9]{0,19})\b/

const formatMegabytes = (num) => Math.round(num / 1024 / 1024 * 100) / 100

async function printMemory(arr) {
    await fs.writeFile(`./memory.json`, JSON.stringify({
        joinedChatrooms: arr,
        settings,
        lemonyFresh,
        mods,
        users,
        knownTags,
        lemCmds,
        wordBank
    }, null, 4))
}

function pluralize(num, singularForm, pluralForm) {
    return Number(num) === 1
        ? `${Number(num).toLocaleString(settings.timeLocale)} ${singularForm}`
        : `${Number(num).toLocaleString(settings.timeLocale)} ${pluralForm}`
}

function renderObj(obj, objName, indentation = ``) {
    if (!Object.keys(obj).length) return `${objName}: {}`
    const tab = `${indentation}\t`
    const data = [`${objName ? `${objName}: ` : ``}{`]
    const keys = `\n${Object.keys(obj).map((key) => {
        return typeof obj[key] === `string`
            ? `${tab}${key}: '${obj[key]}'`
            : typeof obj[key] === `object` && obj[key] !== null
                ? Array.isArray(obj[key])
                    ? `${tab}${key}: [${obj[key].length
                        ? obj[key].map((val) => {
                            return typeof val === `string`
                                ? `'${val}'`
                                : typeof val === `object` && val !== null && !Array.isArray(val)
                                    ? renderObj(val, ``, tab)
                                    : val
                        }).join(`, `)
                        : ``
                    }]`
                    : `${tab}${renderObj(obj[key], key, tab)}`
                : `${tab}${key}: ${obj[key]}`
    }).join(`,\n`)}`

    data.push(keys)
    data.push(`\n${indentation}}`)
    return data.join(``)
}

async function logMessage(messages, time, channel, username, color, self) {
    // Colorize chat messages
    const { resetTxt, grayTxt, whiteTxt, yellowBg } = terminalColors

    // Display date change
    const currentDate = new Date().toLocaleDateString(settings.timeLocale, { year: `numeric`, month: `long`, day: `numeric`, timeZone: settings.timeZone })
    if (currentDate !== settings.currentDate) {
        settings.currentDate = currentDate
        console.log(settings.currentDate)
        await fs.appendFile(`lemony_logs.txt`, `${settings.currentDate}\n`, (err) => {
            if (err) { console.log(`Error writing logs:`, err) }
        })
    }

    // Log chat message or debug message
    const channelName = settings.knownChannels[channel] || channel
    const log = messages.join(` `)
    if (username) {
        await fs.appendFile(`lemony_logs.txt`, `[${time}] <${channelName}> ${username}: ${log}\n`, (err) => {
            if (err) { console.log(`Error writing logs:`, err) }
        })
        if (!settings.hideNonDevChannel || channelName === DEV) {
            self && settings.highlightBotMessage
                ? console.log(`${yellowBg}${settings.logTime
                    ? `[${time}] `
                    : ``}${settings.hideNonDevChannel
                        ? ``
                        : `<${channelName}> `}${username}: ${log}${resetTxt}`)
                : console.log(`${settings.logTime
                    ? `[${time}] `
                    : ``}${settings.hideNonDevChannel
                        ? ``
                        : `<${channelName}> `}${color in chatColors ? chatColors[color].terminalColor : whiteTxt}${username}: ${log}${resetTxt}`)
        }
    }
    else {
        await fs.appendFile(`lemony_logs.txt`, `${log}\n`, (err) => {
            if (err) { console.log(`Error writing logs:`, err) }
        })
        if (settings.debug) { console.log(`${grayTxt}${log}${resetTxt}`) }
    }
}

const superscriptTable = {
    'a': `ᵃ`,
    'b': `ᵇ`,
    'c': `ᶜ`,
    'd': `ᵈ`,
    'e': `ᵉ`,
    'f': `ᶠ`,
    'g': `ᵍ`,
    'h': `ʰ`,
    'i': `ᶦ`,
    'j': `ʲ`,
    'k': `ᵏ`,
    'l': `ˡ`,
    'm': `ᵐ`,
    'n': `ⁿ`,
    'o': `ᵒ`,
    'p': `ᵖ`,
    'q': `ᑫ`,
    'r': `ʳ`,
    's': `ˢ`,
    't': `ᵗ`,
    'u': `ᵘ`,
    'v': `ᵛ`,
    'w': `ʷ`,
    'x': `ˣ`,
    'y': `ʸ`,
    'z': `ᶻ`,
    'A': `ᴬ`,
    'B': `ᴮ`,
    'C': `ᶜ`,
    'D': `ᴰ`,
    'E': `ᴱ`,
    'F': `ᶠ`,
    'G': `ᴳ`,
    'H': `ᴴ`,
    'I': `ᴵ`,
    'J': `ᴶ`,
    'K': `ᴷ`,
    'L': `ᴸ`,
    'M': `ᴹ`,
    'N': `ᴺ`,
    'O': `ᴼ`,
    'P': `ᴾ`,
    'Q': `Q`,
    'R': `ᴿ`,
    'S': `ˢ`,
    'T': `ᵀ`,
    'U': `ᵁ`,
    'V': `ⱽ`,
    'W': `ᵂ`,
    'X': `ˣ`,
    'Y': `ʸ`,
    'Z': `ᶻ`,
    '0': `⁰`,
    '1': `¹`,
    '2': `²`,
    '3': `³`,
    '4': `⁴`,
    '5': `⁵`,
    '6': `⁶`,
    '7': `⁷`,
    '8': `⁸`,
    '9': `⁹`,
    '(': `⁽`,
    ')': `⁾`,
    '-': `⁻`,
    '=': `⁼`,
    '+': `⁺`
}

const cursiveTable = {
    a: `𝒶`,
    b: `𝒷`,
    c: `𝒸`,
    d: `𝒹`,
    e: `𝑒`,
    f: `𝒻`,
    g: `𝑔`,
    h: `𝒽`,
    i: `𝒾`,
    j: `𝒿`,
    k: `𝓀`,
    l: `𝓁`,
    m: `𝓂`,
    n: `𝓃`,
    o: `𝑜`,
    p: `𝓅`,
    q: `𝓆`,
    r: `𝓇`,
    s: `𝓈`,
    t: `𝓉`,
    u: `𝓊`,
    v: `𝓋`,
    w: `𝓌`,
    x: `𝓍`,
    y: `𝓎`,
    z: `𝓏`,
    A: `𝒜`,
    B: `𝐵`,
    C: `𝒞`,
    D: `𝒟`,
    E: `𝐸`,
    F: `𝐹`,
    G: `𝒢`,
    H: `𝐻`,
    I: `𝐼`,
    J: `𝒥`,
    K: `𝒦`,
    L: `𝐿`,
    M: `𝑀`,
    N: `𝒩`,
    O: `𝒪`,
    P: `𝒫`,
    Q: `𝒬`,
    R: `𝑅`,
    S: `𝒮`,
    T: `𝒯`,
    U: `𝒰`,
    V: `𝒱`,
    W: `𝒲`,
    X: `𝒳`,
    Y: `𝒴`,
    Z: `𝒵`
}

module.exports = {
    terminalColors,
    chatColors,
    twitchUsernamePattern,
    printMemory,
    pluralize,
    renderObj,
    logMessage,
    async handleUncaughtException(bot, err, location) {
        await printMemory(bot.channels)
        await logMessage([`> handleUncaughtException(err.message: '${err.message}', location: '${location}')`])

        const emote = users[BOT_USERNAME]?.channels.jpegstripes?.sub ? `jpegstBroken`
            : users[BOT_USERNAME]?.channels.sclarf?.sub ? `sclarfDead`
                : users[BOT_USERNAME]?.channels.e1ectroma?.sub ? `e1ectr4Heat`
                    : users[BOT_USERNAME]?.channels.domonintendo1?.sub ? `domoni6Sneeze`
                        : `>(`

        for (const chatroom of bot.channels) {
            bot.say(chatroom, `Oops, I just crashed! ${emote} ${err.message} ${location}`)
        }
        await logMessage([err.stack])
    },
    coinFlip() { return Math.floor(Math.random() * 2) },
    logArr(arr) {
        const typeArr = arr.map(el => typeof el === `string`
            ? `'${el}'`
            : `${el}`)
        return `[${typeArr.length
            ? ` ${typeArr.join(`, `)} `
            : ``}]`
    },
    getContextEmote(type, channel) {
        const baseType = `${type}Emotes`
        const emotes = [...settings.baseEmotes[baseType]]

        if (channel === `jpegstripes` && !users[BOT_USERNAME]?.channels.jpegstripes?.sub) {
            if (type === `hype`) { emotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
            if (type === `positive`) { emotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
            if (type === `greeting`) { emotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
            if (type === `bye`) { emotes.push(`WhitneyVibe`) }
        }

        for (const member in lemonyFresh) {
            for (const emote of lemonyFresh[member].contextEmotes[baseType]) {
                if ((lemonyFresh[member].followEmotes.includes(emote) && member === channel)
                    || (lemonyFresh[member].followEmotes.includes(emote) && users[BOT_USERNAME]?.channels[member]?.sub)
                    || (lemonyFresh[member].subEmotes.includes(emote) && users[BOT_USERNAME]?.channels[member]?.sub)
                    || (lemonyFresh[member].bttvEmotes.includes(emote) && member === channel)
                    || settings.globalEmotes.twitch.includes(emote)
                    || settings.globalEmotes.bttv.includes(emote)) {
                    emotes.push(emote)
                }
            }
        }
        // logMessage([`> getContextEmote(type: '${type}', channel: '${channel}', emotes: '${emotes.join(`', '`)}')`])

        const emote = emotes[Math.floor(Math.random() * emotes.length)] || ``
        return emote
    },
    transformText(type, str) {
        let output = ``

        switch (type) {
            case `superscript`:
                for (const char of str) {
                    char in superscriptTable
                        ? output += superscriptTable[char]
                        : output += char
                }
                break
            case `cursive`:
                for (const char of str) {
                    char in cursiveTable
                        ? output += cursiveTable[char]
                        : output += char
                }
                break
            default:
                logMessage([`> Type '${type}' not recognized`])
        }

        return output
    },
    getMemoryUsage(props) {
        const { bot, chatroom } = props
        const obj = process.memoryUsage()
        const totalUsage = Object.keys(obj).map(key => obj[key]).reduce((a, b) => a + b)
        const list = Object.keys(obj).map(key => `${key}: ${formatMegabytes(obj[key])} MB`)
        bot.say(chatroom, `Currently using ${formatMegabytes(totalUsage)} MB (${list.join(`, `)})`)
    },
    getToUser(str) {
        return str
            ? str.replace(/^[@#]/g, ``).toLowerCase()
            : null
    },
    arrToList(arr, conjunction = `and`) {
        return arr
            .map((element, idx) => idx !== 0 && idx + 1 === arr.length
                ? `${conjunction} ${element}`
                : element)
            .join(arr.length > 2
                ? `, `
                : ` `)
    },
    initUser(bot, chatroom, tags, self) {
        const newUsername = tags.username
        logMessage([`> initUser(tags.username: '${newUsername}')`])
        users[newUsername] = {
            id: self ? BOT_ID : Number(tags[`user-id`]),
            displayName: tags[`display-name`],
            nickname: '',
            color: tags.color || ``,
            lemons: 0,
            hangmanWins: 0,
            channels: {}
        }

        // Check if user ID already exists, and merge their data
        for (const oldUsername of Object.keys(users)) {
            if (users[newUsername].id === users[oldUsername].id && oldUsername !== newUsername) {
                logMessage([`-> Merging '${oldUsername}' (ID: ${users[oldUsername].id}) into '${newUsername}'`])
                users[newUsername] = {
                    ...users[oldUsername],
                    displayName: tags[`display-name`],
                    nickname: '',
                    color: tags.color || ``
                }
                bot.say(chatroom, `Wow, ${users[oldUsername].nickname || users[oldUsername].displayName} changed their name to ${users[newUsername].displayName}!`)
                delete users[oldUsername]

                // Update if user is a mod anywhere
                if (oldUsername in mods) {
                    logMessage([`-> Merging mod '${oldUsername}' into '${newUsername}'`])
                    mods[newUsername] = { ...mods[oldUsername] }
                    delete mods[oldUsername]
                }

                // Update if bot is in also channel
                if (oldUsername in lemonyFresh) {
                    logMessage([`-> Merging channel '${oldUsername}' into '${newUsername}' and re-joining`])
                    lemonyFresh[newUsername] = { ...lemonyFresh[oldUsername] }
                    delete lemonyFresh[oldUsername]
                    bot.join(newUsername)

                    // Update potential channel data for all users
                    for (const user of Object.keys(users)) {
                        if (oldUsername in users[user].channels) {
                            logMessage([`-> Merging user ${user}'s '${oldUsername}' data into '${newUsername}'`])
                            users[user].channels[newUsername] = { ...users[user].channels[oldUsername] }
                            delete users[user].channels[oldUsername]
                        }
                    }
                }
            }
        }
    },
    initUserChannel(tags, username, channel) {
        logMessage([`> initUserChannel(username: '${username}', channel: '${channel}')`])
        users[username].channels[channel] = {
            sub: tags.subscriber,
            mod: tags.mod,
            vip: !!tags.vip || !!tags.badges?.vip,
            away: false,
            awayMessage: ``,
            msgCount: 0,
            pyramidWord: ``,
            pyramidCount: 1,
            pyramidMaxCount: 0,
            pyramidAscending: true
        }
    },
    initChannel(channel) {
        logMessage([`> initChannel(channel: '${channel}')`])
        lemonyFresh[channel] = { ...lemonyFresh[channel] }
        lemonyFresh[channel].accessToken = lemonyFresh[channel]?.accessToken || mods[channel]?.accessToken || ``
        lemonyFresh[channel].refreshToken = lemonyFresh[channel]?.refreshToken || mods[channel]?.refreshToken || ``
        lemonyFresh[channel].subRaidMessage = lemonyFresh[channel]?.subRaidMessage || ``
        lemonyFresh[channel].noSubRaidMessage = lemonyFresh[channel]?.noSubRaidMessage || ``
        lemonyFresh[channel].followEmotes = lemonyFresh[channel]?.followEmotes || []
        lemonyFresh[channel].subEmotes = lemonyFresh[channel]?.subEmotes || []
        lemonyFresh[channel].bttvEmotes = lemonyFresh[channel]?.bttvEmotes || []
        lemonyFresh[channel].contextEmotes = {
            lemonEmotes: [],
            neutralEmotes: [],
            hypeEmotes: [],
            positiveEmotes: [],
            upsetEmotes: [],
            negativeEmotes: [],
            greetingEmotes: [],
            byeEmotes: [],
            dumbEmotes: [],
            ...lemonyFresh[channel].contextEmotes
        }
        lemonyFresh[channel].funnyCommands = lemonyFresh[channel]?.funnyCommands || []
        lemonyFresh[channel].redeems = lemonyFresh[channel]?.redeems || []
        lemonyFresh[channel].rollFunNumber = lemonyFresh[channel]?.rollFunNumber || true
        lemonyFresh[channel].funTimer = 0
        lemonyFresh[channel].funTimerGuesser = ``
        lemonyFresh[channel].pollId = ``
        lemonyFresh[channel].viewers = []
        lemonyFresh[channel].streakThreshold = lemonyFresh[channel]?.streakThreshold || 3
        lemonyFresh[channel].streamerEmoteStreakThreshold = lemonyFresh[channel]?.streamerEmoteStreakThreshold || 4
        lemonyFresh[channel].count = {
            name: ``,
            value: 0,
            ...lemonyFresh[channel].count
        }
        lemonyFresh[channel].list = lemonyFresh[channel]?.list || [``]
        lemonyFresh[channel].hangman = {
            listening: false,
            signup: false,
            answer: ``,
            spaces: [],
            players: [],
            guessedLetters: [],
            chances: settings.hangmanChances,
            currentPlayer: 0,
            ...lemonyFresh[channel].hangman
        }
        lemonyFresh[channel].timers = {
            '!so': { cooldown: 4, listening: true },
            '!raid': { cooldown: 6, listening: true },
            '!count': { cooldown: 0, listening: true },
            'streak': { cooldown: 30, listening: true },
            'new-chatter': { cooldown: 0, listening: true },
            'greet': { cooldown: 0, listening: true },
            'mass-greet': { cooldown: 0, listening: true },
            'say-butt': { cooldown: 120, listening: true },
            'say-goodnight': { cooldown: 0, listening: true },
            'say-thanks': { cooldown: 0, listening: true },
            'say-youre-welcome': { cooldown: 0, listening: true },
            'say-mood': { cooldown: 0, listening: true },
            ...lemonyFresh[channel].timers
        }
        lemonyFresh[channel].countdown = {
            startedAt: 0,
            duration: 0,
            full: 0,
            half: 0,
            lastTen: 0,
            ...lemonyFresh[channel].countdown
        }
    },
    updateMod(chatroom, tags, self, username) {
        if (!(username in mods)) {
            logMessage([`> initMod: '${username}'`])
            mods[username] = {
                id: self ? BOT_ID : Number(tags[`user-id`]),
                accessToken: ``,
                refreshToken: ``
            }
            if (username in lemonyFresh) {
                mods[username].accessToken = lemonyFresh[username].accessToken
                mods[username].refreshToken = lemonyFresh[username].refreshToken
            }
        }
        mods[username].isModIn = mods[username].isModIn || []
        if (!mods[username].isModIn.includes(chatroom)) {
            logMessage([`> updateMod ${username}: '${chatroom}'`])
            mods[username].isModIn.push(chatroom)
        }
    },
    resetCooldownTimer(channel, name) {
        const timer = lemonyFresh[channel].timers[name]
        logMessage([`> resetCooldownTimer(channel: '${channel}', timer: '${name}', cooldown: ${pluralize(timer.cooldown, `second`, `seconds`)})`])
        timer.listening = false
        clearTimeout(timer.timerId)
        timer.timerId = Number(setTimeout(() => {
            timer.listening = true
            logMessage([`-> Listening for '${name}' again!`])
        }, timer.cooldown * 1000))
    },
    // (For debugging/discovery) Add to list of known message tags
    tagsListener(tags) {
        for (const tag of Object.keys(tags)) {
            const type = typeof tags[tag] === `object`
                ? tags[tag] === null
                    ? `null`
                    : Array.isArray(tags[tag])
                        ? `array`
                        : typeof tags[tag]
                : typeof tags[tag]
            if (!(tag in knownTags)) {
                logMessage([`> New message tag '${tag}' discovered (type: '${type}')`, type === `object` ? renderObj(tags[tag], tag) : tags[tag]])
                knownTags[tag] = { types: [] }
                if (tag === `msg-id`) { knownTags[tag].strings = [] }
            }
            // Listening for msg-id strings
            if (tag === `msg-id` && type === `string`) {
                if (!knownTags[tag].strings.includes(tags[tag])) {
                    logMessage([`> New string for message tag '${tag}' added: ${tags[tag]}`])
                    knownTags[tag].strings.push(tags[tag])
                }
            }
            if (!knownTags[tag].types.includes(type)) {
                if (knownTags[tag].types.length > 0) { logMessage([`> New type for message tag '${tag}' added: '${type}'`]) }
                knownTags[tag].types.push(type)
            }
            knownTags[tag].lastValue = typeof tags[tag] === `string`
                ? tags[tag].replace(/'/g, `’`)
                : tags[tag]
        }
    },
    getUsername(str) {
        return str
            ? str.replace(/^[@#]/g, ``).match(twitchUsernamePattern)
                ? str.replace(/^[@#]/g, ``)
                : null
            : null
    },
    findUserByNickname(str) {
        const nicknames = Object.fromEntries(
            Object.entries(users)
                .filter(arr => arr[1].nickname)
                .map(arr => {
                    return [[arr[1].nickname.toLowerCase()], arr[0]]
                })
        )
        logMessage([`> findUserByNickname(str: '${str}', result: ${str in nicknames ? `'${nicknames[str]}'` : null})`])
        return str in nicknames
            ? nicknames[str]
            : null
    },
    parseTargetByNickname(arr) {
        const nicknames = Object.fromEntries(
            Object.entries(users)
                .filter(arr => arr[1].nickname)
                .map(arr => {
                    return [[arr[1].nickname.toLowerCase()], arr[0]]
                })
        )
        for (const nickname in nicknames) {
            if (new RegExp(`^${nickname}$`, `i`).test(arr.join(` `))) {
                return users[nicknames[nickname]]
            }
        }
        return null
    },
    containsInaccessibleEmotes(str, channel) {
        const inaccessibleEmotes = Object.keys(lemonyFresh)
            .filter(stream => !users[BOT_USERNAME].channels[stream].sub)
            .map(stream => stream === channel
                ? lemonyFresh[stream].subEmotes
                : [...lemonyFresh[stream].followEmotes, ...lemonyFresh[stream].subEmotes])
            .flat()
        if (inaccessibleEmotes.some(emote => str.includes(emote))) {
            logMessage([`> containsInaccessibleEmotes(str: '${str}')`])
            return true
        }
        return false
    },
    containsUnrecognizedEmotes(str) {
        if (emotePattern.test(str)) {
            const allEmotes = [
                ...Object.keys(lemonyFresh).map(channel => lemonyFresh[channel].followEmotes),
                ...Object.keys(lemonyFresh).map(channel => lemonyFresh[channel].subEmotes),
                ...Object.keys(lemonyFresh).map(channel => lemonyFresh[channel].bttvEmotes)
            ].flat()

            const unrecognizedEmotes = str
                .split(emotePattern)
                .filter((emote, idx) => !allEmotes.includes(emote) && (idx + 1) % 2 === 0)
                .filter((el, idx, self) => self.indexOf(el) === idx)

            if (unrecognizedEmotes.length) {
                logMessage([`> containsUnrecognizedEmotes: ${unrecognizedEmotes.join(`, `)}`])
                return true
            }
        }
        return false
    },
    appendLogs(chatroom, tags, msg, self, timeStamp, username, color) {
        const channel = chatroom.substring(1)
        const sharedChat = `source-room-id` in tags
        const isOriginChannel = sharedChat && tags[`room-id`] === tags[`source-room-id`]
        const sourceChannel = sharedChat
            ? Object.keys(lemonyFresh).filter(key => lemonyFresh[key].id && lemonyFresh[key].id === Number(tags[`source-room-id`]))[0]
            : null

        sharedChat
            ? isOriginChannel
                ? logMessage([msg], timeStamp, channel, username, color, self)
                : sourceChannel
                    ? logMessage([`${username}'s message also posted in ${channel}'s channel`])
                    : logMessage([msg], timeStamp, tags[`source-room-id`], username, color, self)
            : logMessage([msg], timeStamp, channel, username, color, self)
    }
}
