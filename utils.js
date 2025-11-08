const DEV = process.env.DEV
const BOT_ID = Number(process.env.BOT_ID)
const BOT_USERNAME = process.env.BOT_USERNAME

const fs = require(`fs/promises`)

const { settings, resetTxt, grayTxt, whiteTxt, yellowBg, chatColors } = require(`./config`)
const { lemonyFresh, mods, users, knownTags, lemCmds, wordBank, commonNicknames, startingLemons, hangmanWins } = require(`./data`)

const twitchUsernamePattern = /^[a-z0-9_]{4,25}$/i
const emotePattern = /\b([a-z][a-z0-9]{2,9}[A-Z0-9][a-zA-Z0-9]{0,19})\b/

const formatMegabytes = (num) => Math.round(num / 1024 / 1024 * 100) / 100

function makeLogs(arr) {
    let logs = `🍋️ LEMONY LOGS 🍋️\n`

    const dateOptions = {
        weekday: `long`,
        month: `long`,
        day: `numeric`,
        year: `numeric`,
        timeZone: settings.timeZone
    }
    const timeOptions = {
        hour: `numeric`,
        minute: `numeric`,
        second: `numeric`,
        timeZone: settings.timeZone,
        timeZoneName: `short`
    }

    logs += `Session started: ${settings.startDate.toLocaleDateString(`en-US`, dateOptions)} at ${settings.startDate.toLocaleTimeString(`en-US`, timeOptions)}\n`

    logs += `\nJoined channels: ['${arr.join(`', '`)}']\n\n`

    const objectsToLog = [
        [lemonyFresh, `lemonyFresh`],
        [mods, `mods`],
        [users, `users`],
        [knownTags, `knownTags`],
        [settings, `settings`],
        [wordBank, `wordBank`],
        [lemCmds, `lemCmds`],
        [commonNicknames, `commonNicknames`],
        [startingLemons, `startingLemons`],
        [hangmanWins, `hangmanWins`]
    ]
    for (const [obj, objName] of objectsToLog) {
        logs += `${renderObj(obj, objName)}\n\n`
    }

    return logs
}

async function printMemory(arr) {
    await fs.writeFile(`./memory.json`, JSON.stringify({
        joinedChannels: arr,
        settings,
        lemonyFresh,
        mods,
        users,
        knownTags,
        lemCmds,
        wordBank,
        commonNicknames,
        startingLemons,
        hangmanWins
    }, null, 4))
}

function getContextEmote(type, channel) {
    const baseType = `${type}Emotes`
    const bttvType = `bttv${type.substring(0, 1).toUpperCase()}${type.substring(1)}Emotes`
    const emotes = [...settings.baseEmotes[baseType]]

    if (channel === `jpegstripes` && !users[BOT_USERNAME]?.channels.jpegstripes?.sub) {
        if (type === `hype`) { emotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
        if (type === `positive`) { emotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
        if (type === `greeting`) { emotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
        if (type === `bye`) { emotes.push(`WhitneyVibe`) }
    }

    for (const member in lemonyFresh) {
        if (users[BOT_USERNAME]?.channels[member]?.sub) { emotes.push(...lemonyFresh[member].contextEmotes[baseType]) }
        if (member === channel) { emotes.push(...lemonyFresh[member].contextEmotes[bttvType]) }
    }
    if (type === `lemon` && emotes.length > 1) { emotes.shift() }
    // logMessage([`> getContextEmote(type: '${type}', channel: '${channel}', emotes: '${emotes.join(`', '`)}')`])

    const emote = emotes[Math.floor(Math.random() * emotes.length)] || ``
    return emote
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

module.exports = {
    twitchUsernamePattern,
    printMemory,
    getContextEmote,
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

        // await logMessage([makeLogs(bot.channels)])
        await logMessage([err.stack])
    },
    async dumpMemory(props) {
        const { bot, channel, username } = props
        await logMessage([`> dumpMemory(channel: ${channel}, username: ${username})`, `\n`])
        await logMessage([makeLogs(bot.channels)])
    },
    coinFlip() { return Math.floor(Math.random() * 2) },
    superscript(str) {
        const table = {
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
        let output = ``
        for (const char of str) {
            char in table
                ? output += table[char]
                : output += char
        }
        return output
    },
    cursive(str) {
        const table = {
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
        let output = ``
        for (const char of str) {
            char in table
                ? output += table[char]
                : output += char
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

        // Apply nickname
        if (newUsername in commonNicknames) {
            users[newUsername].nickname = commonNicknames[newUsername]
            delete commonNicknames[newUsername]
            logMessage([`-> ${newUsername}'s nickname has been restored (${users[newUsername].nickname}), ${Object.keys(commonNicknames).length} remain`])
        }

        // Restore lemons
        if (newUsername in startingLemons) {
            users[newUsername].lemons += startingLemons[newUsername]
            delete startingLemons[newUsername]
            logMessage([`-> ${newUsername}'s lemons have been restored (${users[newUsername].lemons}), ${Object.keys(startingLemons).length} remain`])
        }

        // Restore Hangman wins
        if (newUsername in hangmanWins) {
            users[newUsername].hangmanWins += hangmanWins[newUsername]
            delete hangmanWins[newUsername]
            logMessage([`-> ${newUsername}'s hangmanWins have been restored (${users[newUsername].hangmanWins}), ${Object.keys(hangmanWins).length} remain`])
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
            msgCount: 0
        }
    },
    initChannel(channel) {
        logMessage([`> initChannel(channel: '${channel}')`])
        lemonyFresh[channel] = { ...lemonyFresh[channel] }
        lemonyFresh[channel].accessToken = lemonyFresh[channel]?.accessToken || mods[channel]?.accessToken || ``
        lemonyFresh[channel].refreshToken = lemonyFresh[channel]?.refreshToken || mods[channel]?.refreshToken || ``
        lemonyFresh[channel].subRaidMessage = lemonyFresh[channel]?.subRaidMessage || ``
        lemonyFresh[channel].noSubRaidMessage = lemonyFresh[channel]?.noSubRaidMessage || ``
        lemonyFresh[channel].emotes = lemonyFresh[channel]?.emotes || []
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
            bttvLemonEmotes: [],
            bttvNeutralEmotes: [],
            bttvHypeEmotes: [],
            bttvPositiveEmotes: [],
            bttvUpsetEmotes: [],
            bttvNegativeEmotes: [],
            bttvGreetingEmotes: [],
            bttvByeEmotes: [],
            bttvDumbEmotes: [],
            ...lemonyFresh[channel].contextEmotes
        }
        lemonyFresh[channel].funnyCommands = lemonyFresh[channel]?.funnyCommands || []
        lemonyFresh[channel].redeems = lemonyFresh[channel]?.redeems || []
        lemonyFresh[channel].rollFunNumber = lemonyFresh[channel]?.rollFunNumber || true
        lemonyFresh[channel].funTimer = 0
        lemonyFresh[channel].funTimerGuesser = ``
        lemonyFresh[channel].pollId = ``
        lemonyFresh[channel].viewers = []
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
    containsInaccessibleEmotes(str) {
        const inaccessibleEmotes = Object.keys(users[BOT_USERNAME].channels)
            .filter(channel => users[BOT_USERNAME].channels[channel].sub === false)
            .map(channel => lemonyFresh[channel].emotes)
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
                ...Object.keys(lemonyFresh).map(channel => lemonyFresh[channel].emotes),
                ...Object.keys(lemonyFresh).map(channel => lemonyFresh[channel].bttvEmotes)
            ].flat()
            const unrecognizedEmotes = str
                .split(emotePattern)
                .filter((emote, idx) => !allEmotes.includes(emote) && (idx + 1) % 2 === 0)
                .filter((el, idx, self) => self.indexOf(el) === idx)

            if (unrecognizedEmotes.length) logMessage([`> containsUnrecognizedEmotes: ${unrecognizedEmotes.join(`, `)}`])
            return true
        }
        return false
    },
    acknowledgeGigantifiedEmote(bot, chatroom, msg) {
        const emoteUsed = msg.split(` `)[msg.split(` `).length - 1]
        const emoteOwner = Object.keys(lemonyFresh).filter(key => `emotes` in lemonyFresh[key] && lemonyFresh[key].emotes.includes(emoteUsed))[0]
            || null
        logMessage([`> Gigantified ${emoteUsed} owner: ${emoteOwner || `unknown`}, ${BOT_USERNAME} subbed? ${!!users[BOT_USERNAME]?.channels[emoteOwner]?.sub}`])
        if (users[BOT_USERNAME]?.channels[emoteOwner]?.sub) { bot.say(chatroom, `BEEG ${emoteUsed}`) }
    },
    appendLogs(chatroom, tags, msg, self, time, username, color) {
        const channel = chatroom.substring(1)
        const sharedChat = `source-room-id` in tags
        const isOriginChannel = sharedChat && tags[`room-id`] === tags[`source-room-id`]
        const sourceChannel = sharedChat
            ? Object.keys(lemonyFresh).filter(key => lemonyFresh[key].id && lemonyFresh[key].id === Number(tags[`source-room-id`]))[0]
            : null

        sharedChat
            ? isOriginChannel
                ? logMessage([msg], time, channel, username, color, self)
                : sourceChannel
                    ? logMessage([`${username}'s message also posted in ${channel}'s channel`])
                    : logMessage([msg], time, tags[`source-room-id`], username, color, self)
            : logMessage([msg], time, channel, username, color, self)
    }
}
