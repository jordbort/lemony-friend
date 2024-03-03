const BOT_USERNAME = process.env.BOT_USERNAME

// Import dev controls
const { cli } = require("./cli")

// Import global settings
const {
    resetTxt,
    boldTxt,
    underlined,
    inverted,
    blackTxt,
    redTxt,
    greenTxt,
    yellowTxt,
    blueTxt,
    magentaTxt,
    cyanTxt,
    whiteTxt,
    grayTxt,
    orangeTxt,
    blackBg,
    redBg,
    greenBg,
    yellowBg,
    blueBg,
    magentaBg,
    cyanBg,
    whiteBg,
    grayBg,
    orangeBg,
    chatColors,
    settings,
    timers
} = require(`./config`)

// Import data
const {
    lemonyFresh,
    mods,
    users,
    tempCmds
} = require(`./data`)

// Handle change of user's properties in chat
const {
    handleColorChange,
    handleTurboChange,
    handleSubChange,
    handleModChange,
    handleVIPChange
} = require(`./handleChange`)

// Respond to people in chat
const {
    handleNewChatter,
    handleGreet,
    handleMassGreet,
    handleGreetAll,
    sayGoodnight,
    sayYoureWelcome,
    sayThanks
} = require(`./handleConversation`)

// Import fetches from other APIs
const {
    checkSentiment,
    getDadJoke,
    getDefinition,
    getPokemon
} = require(`./handleExternal`)

// Import fun number event
const { rollFunNumber } = require(`./handleFunNumber`)

// Import Hangman controls
const {
    getRandomWord,
    hangmanInit,
    hangmanAnnounce,
    checkLetter,
    solvePuzzle
} = require(`./handleHangman`)

// Lemonify chat message
const { lemonify } = require(`./handleLemonify`)

// Import Rock, Paper, Scissors
const { rockPaperScissors } = require(`./handleRPS`)

// Import riddle controls
const {
    getRiddle,
    handleRiddleAnswer
} = require("./handleRiddle")

// Listen for message streaks and emote streaks
const {
    checkStreak,
    checkEmoteStreak,
    emoteReply
} = require(`./handleStreaks`)

// Import StreamElements bot reactions
const {
    handleGivenPoints,
    handleSetPoints,
    handleLoseAllPoints
} = require(`./handleStreamElements`)

// Import Twitch functions
const {
    authorizeToken,
    getOAUTHToken,
    getTwitchChannel,
    getTwitchGame,
    getBotToken,
    getTwitchUser,
    handleShoutOut,
    makeAnnouncement,
    pollEnd,
    pollStart,
    refreshToken,
    validateToken
} = require(`./handleTwitch`)

// Import uses for lemons
const { useLemon } = require(`./handleUseLemon`)

// Import emotes
const {
    getLemonEmote,
    getHypeEmote,
    getPositiveEmote,
    getUpsetEmote,
    getNegativeEmote,
    getGreetingEmote,
    getByeEmote,
    getDumbEmote
} = require(`./getEmotes`)

// Import time lookup
const {
    validTimeZones,
    validLocales,
    getTime
} = require(`./time`)

// Import helper functions
const {
    handleUncaughtException,
    talk,
    resetCooldownTimer,
    sayGoals,
    sayRebootMsg,
    sayFriends,
    sayCommands,
    toggleDebugMode,
    getLastMessage,
    getMessageCount,
    yell,
    getColor,
    getRandomUser,
    getRandomChannelMessage,
    handleTempCmd,
    chant,
    printLemon,
    makeLogs,
    handleRaid
} = require(`./utils`)

function onConnectedHandler(addr, port) {
    settings.firstConnection && printLemon()
    const time = new Date().toLocaleTimeString(settings.timeLocale, settings.timeZone)
    settings.firstConnection
        ? console.log(`[${time}] 🍋 Connected to ${addr}:${port}`)
        : console.log(`[${time}] 🍋 Re-connected to ${addr}:${port}`)
    settings.firstConnection = false
    settings.sayOnlineMsg = true
}

function onMessageHandler(chatroom, tags, message, self) {
    const msg = message.replace(/ +/g, ` `)
    const username = tags.username
    const channel = chatroom.slice(1)
    const color = tags.color || ``
    const firstMsg = tags['first-msg']
    const hangman = lemonyFresh[channel].hangman
    const isMod = tags.mod || username === channel
    const isModOrVIP = !!tags.badges?.vip || !!tags.vip || tags.mod || username === channel
    const lemonyFreshMember = [`jpegstripes`, `sclarf`, `e1ectroma`, `domonintendo1`, `ppuyya`]

    // Command and arguments parser
    const args = msg.split(` `)
    const lowercaseArgs = args.map(str => str.toLowerCase())
    const command = args.shift().toLowerCase()
    const toUser = args[0] ? args[0].replace(/^@/, ``) : null
    const target = toUser && toUser.toLowerCase() in users ? toUser.toLowerCase() : null
    const currentTime = Date.now()

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
            color: color,
            lemons: 0,
            hangmanWins: 0,
            riddleWins: 0
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
            sentAt: currentTime,
            away: false,
            awayMessage: ``
        }
    }
    if (tags.mod) {
        if (!(username in mods)) {
            mods[username] = {
                id: Number(tags[`user-id`]),
                isModIn: [],
                accessToken: ``,
                refreshToken: ``
            }
            if (username in lemonyFresh) {
                mods[username].accessToken = lemonyFresh[username].accessToken
                mods[username].refreshToken = lemonyFresh[username].refreshToken
            }
        }
        if (!mods[username].isModIn.includes(chatroom)) { mods[username].isModIn.push(chatroom) }
    }

    const user = users[username]

    // Cleaning up potential undefined user
    if (`undefined` in users) { return delete users.undefined }

    // Prepare emotes for responses
    const lemonEmote = getLemonEmote(channel)
    const hypeEmote = getHypeEmote(channel)
    const positiveEmote = getPositiveEmote(channel)
    const upsetEmote = getUpsetEmote(channel)
    const negativeEmote = getNegativeEmote(channel)
    const greetingEmote = getGreetingEmote(channel)
    const byeEmote = getByeEmote(channel)

    // Checking time comparisons
    const elapsedMinsSinceLastMsg = (currentTime - user[channel].sentAt) / 60000

    // Update last message in a chatroom, and increment counter by 1
    user[channel].lastMessage = msg
    user[channel].sentAt = Date.now()
    user[channel].msgCount++

    makeLogs()

    // These checks happen earlier in case they happened to the bot
    if (subChange) { return handleSubChange(chatroom, username, tags.subscriber) }
    if (modChange) { return handleModChange(chatroom, username, tags.mod) }
    if (vipChange) { return handleVIPChange(chatroom, username, tags.vip) }

    // Stop here if bot, otherwise log user's chat message
    if (self) { return } else {
        const time = new Date().toLocaleTimeString(settings.timeLocale, settings.timeZone)
        console.log(`[${time}] <${channel}> ${color in chatColors ? chatColors[color].terminalColor : whiteTxt}${username}: ${msg}${resetTxt}`)
    }

    /*********\
    REPLY CASES
    \*********/

    if (settings.sayOnlineMsg) { return sayRebootMsg(chatroom) }

    // Dev commands
    if (username === `jpegstripes`) {
        if (command === `data`) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return console.log(`lemonyFresh:`, lemonyFresh, `users:`, users, `tempCmds:`, tempCmds)
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
        if (command === `tags`) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return console.log(tags)
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
        if (command === `cli`) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return cli(chatroom, args.map(arg => arg.toLowerCase()))
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
    }

    if (command === `test` && !isNaN(args[0]) && username === `jpegstripes`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return rollFunNumber(chatroom, tags, username, msg.split(` `), Number(args[0]))
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }
    if (command === `!test`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return `points` in users[BOT_USERNAME][channel]
                ? talk(chatroom, `I have ${users[BOT_USERNAME][channel].points} point${users[BOT_USERNAME][channel].points === 1 ? `` : `s`}!`)
                : talk(chatroom, `I don't know how many points I have!`)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    if (command === `!forget`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            if (points in users[BOT_USERNAME][channel]) {
                delete users[BOT_USERNAME][channel].points
                return talk(chatroom, `I forgor 💀️`)
            }
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // If guessing the Fun Timer correctly
    if (lemonyFresh[channel].funTimerGuesser === username && msg.includes(lemonyFresh[channel].funTimer)) {
        lemonyFresh[channel].funTimer = 0
        lemonyFresh[channel].funTimerGuesser = ``
        user.lemons++
        return talk(chatroom, `That's right ${user.displayName}, have a lemon! ${lemonEmote}`)
    }

    // If first message since being away
    if (user[channel].away) {
        user[channel].away = false
        user[channel].awayMessage = ``
        return setTimeout(() => talk(chatroom, `Welcome back, ${user.displayName}! ${greetingEmote}`), 5000)
    }

    if (colorChanged) { return handleColorChange(chatroom, user, color) }
    // if (turboChange) { return handleTurboChange(chatroom, user, tags.turbo) }

    // User's first message in a given channel
    if (firstMsg) {
        if (timers[`new-chatter`].listening) {
            resetCooldownTimer(`new-chatter`)
            return handleNewChatter(chatroom, user)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    /******\
    COMMANDS
    \******/

    // All commands
    if (command === `!docs`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return talk(chatroom, `Check out the docs here: https://github.com/jordbort/lemony-friend/blob/main/README.md`)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    if (command === `!commands`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return sayCommands(chatroom)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // TWITCH COMMANDS
    // Only the streamer, a mod, or a VIP
    if (isModOrVIP) {
        if (command === `!so` && toUser) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return handleShoutOut(chatroom, username, toUser.toLowerCase())
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
        // Refreshes bot's access token
        if (command === `!token`) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return getBotToken(chatroom, true)
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
        // Checks lifespan of channel's access token
        if (command === `!validate`) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return validateToken(chatroom)
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
    }
    // Only the streamer or a mod
    if (isMod) {
        // Manually refreshes the channel or the mod's access token
        if (command === `!refresh`) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return refreshToken(chatroom, toUser?.toLowerCase() === channel ? channel : username, true)
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
        if (command.match(/^!announce([a-z]*)$/)) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return makeAnnouncement(chatroom, command.split(/^!announce([a-z]*)$/)[1], username, args.join(` `))
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
        if (command === `!poll`) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return !lemonyFresh[channel].pollId ? pollStart(chatroom, args.join(` `)) : talk(channel, `There is already a poll active! ${negativeEmote}`)
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
        if (command === `!endpoll`) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return talk(chatroom, lemonyFresh[channel].pollId ? `Use !stoppoll to finish and show the results, or !cancelpoll to remove it! ${positiveEmote}` : `There is no active poll! ${negativeEmote}`)
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
        if (command === `!cancelpoll`) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return lemonyFresh[channel].pollId ? pollEnd(chatroom, `ARCHIVED`) : talk(chatroom, `There is no active poll! ${negativeEmote}`)
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
        if (command === `!stoppoll`) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return lemonyFresh[channel].pollId ? pollEnd(chatroom, `TERMINATED`) : talk(chatroom, `There is no active poll! ${negativeEmote}`)
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
    }
    // Lemony Fresh channels or their mods only
    if (lemonyFreshMember || isMod) {
        if (command === `!access`) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return getOAUTHToken(chatroom, username)
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
        if (command === `!authorize`) {
            if (timers[command].listening) {
                resetCooldownTimer(command)
                return authorizeToken(chatroom, username, args.join(` `))
            } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
        }
    }

    // Current time
    if (command === `!time`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return getTime(chatroom, args[0], args[1])
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // Chant
    if (command === `!chant`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return chant(chatroom, args)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // Start a game of Hangman (if one isn't already in progress)
    if (command === `!hangman`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            if (hangman.listening) {
                return hangman.signup
                    ? talk(chatroom, `A game of Hangman is starting, type !play to join!`)
                    : talk(chatroom, `A game of Hangman is already in progress! It's currently ${users[hangman.players[hangman.currentPlayer]].displayName}'s turn.`)
            } else {
                hangmanInit(hangman, username)
                return hangmanAnnounce(chatroom, user.displayName)
            }
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // Join a game of Hangman (during the 30-second signup window)
    if (command === `!play` && hangman.listening) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            if (hangman.signup) {
                console.log(`${grayTxt}${hangman.players.includes(username) ? `> ${username} already in ${channel}'s Hangman players: ${hangman.players.join(`, `)}` : `> ${username} added to ${channel}'s Hangman players: ${hangman.players.join(`, `)}`}${resetTxt}`)
                if (!hangman.players.includes(username)) { return hangman.players.push(username) }
            } else if (!hangman.players.includes(username)) {
                console.log(`${grayTxt}> ${username} added to ${channel}'s Hangman players: ${hangman.players.join(`, `)}}${resetTxt}`)
                hangman.players.push(username)
                return talk(chatroom, `${user.displayName}, you can still hop in, you'll go after everyone else! ${positiveEmote}`)
            }
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // Define a word
    if ([`!define`, `!definition`, `!meaning`].includes(command)) {
        if (timers[`!define`].listening) {
            resetCooldownTimer(`!define`)
            return getDefinition(chatroom, args.join(` `))
        } else { console.log(`${grayTxt}> Must wait for '!define' cooldown${resetTxt}`) }
    }

    // Ask for a riddle
    if (command === `!riddle`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return lemonyFresh[channel].riddle.question
                ? talk(chatroom, `I already have a riddle for you: ${lemonyFresh[channel].riddle.question}`)
                : getRiddle(chatroom)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // Answer the riddle
    if (command === `!answer`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return lemonyFresh[channel].riddle.question
                ? args[0]
                    ? handleRiddleAnswer(chatroom, username, args)
                    : talk(chatroom, `What is your answer, ${user.displayName}? ${positiveEmote}`)
                : talk(chatroom, `You can use !riddle to ask me for a riddle! ${positiveEmote}`)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // Channel-specific raid messages
    if (command === `!raid` && isModOrVIP) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return handleRaid(chatroom)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // Play rock, paper, scissors with the bot
    if (command === `!rps`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return rockPaperScissors(chatroom, username, args[0]?.toLowerCase())
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // JSON stats of user or toUser
    if (command === `!mystats`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            const user = target || username
            console.log(`${user}:`, users[user])
            let data = `${user}: { displayName: '${users[user].displayName}', color: ${users[user].color}, lemons: ${users[user].lemons}, hangmanWins: ${users[user].hangmanWins}, riddleWins: ${users[user].riddleWins}`
            for (const key of Object.keys(users[user])) {
                if (typeof users[user][key] === `object`) {
                    data += `, ${key}: { sub: ${users[user][key]?.sub}, mod: ${users[user][key].mod}, vip: ${users[user][key].vip}, msgCount: ${users[user][key].msgCount}, lastMessage: '${users[user][key].lastMessage}', sentAt: ${users[user][key].sentAt}, away: ${users[user][key].away ? `${users[user][key].away}, awayMessage: '${users[user][key].awayMessage}'` : `${users[user][key].away}`} }`
                }
            }
            data += ` }`
            return talk(chatroom, data)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // Check which channels the bot is subbed to
    if (command === `!subs`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            const subbedUsers = []
            const allUsers = []
            for (const key of Object.keys(users[BOT_USERNAME])) {
                if (users[BOT_USERNAME][key]?.sub === true) { subbedUsers.push(key) }
                else if (typeof users[BOT_USERNAME][key] === `object`) { allUsers.push(key) }
            }
            return subbedUsers.length
                ? talk(chatroom, `I am subbed to: ${subbedUsers.join(`, `)} ${hypeEmote}`)
                : talk(chatroom, `I am not subbed to: ${allUsers.join(`, `)} ${upsetEmote}`)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // If a user who isn't Nightbot or StreamElements mentions a user who is away
    if (![`nightbot`, `streamelements`].includes(username)) {
        for (const user of Object.keys(users)) {
            if (msg.toLowerCase().includes(user) && users[user][channel]?.away) {
                const elapsedTime = Math.round((currentTime - users[user][channel].sentAt) / 60000)
                const reply = `${users[user].displayName} has been away for ~${elapsedTime} minute${elapsedTime === 1 ? `` : `s`}!${users[user][channel].awayMessage ? ` Their away message: "${users[user][channel].awayMessage}"` : ``}`
                return talk(chatroom, reply)
            }
        }
    }

    // Toggle debug mode
    if ([`!debug`, `!debugmode`].includes(command)) {
        if (timers[`!debug`].listening) {
            resetCooldownTimer(`!debug`)
            return toggleDebugMode(chatroom, args)
        } else { console.log(`${grayTxt}> Must wait for '!debug' cooldown${resetTxt}`) }
    }

    // !lastmsg (Show a user's last message, optionally in a specified stream)
    if (command === `!lastmsg`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return getLastMessage(chatroom, users[target] || user, args[1]?.toLowerCase())
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // !msgcount (Show a user's last message)
    if (command === `!msgcount`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return getMessageCount(chatroom, users[target] || user)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // !yell across all lemonyFresh.channels
    if (command === `!yell`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return yell(user, msg.substring(6))
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // !friend(s) count
    if ([`!friend`, `!friends`].includes(command)) {
        if (timers[`!friend`].listening) {
            resetCooldownTimer(`!friend`)
            return sayFriends(chatroom)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // !lemon(s) count
    if ([`!lemon`, `!lemons`].includes(command)) {
        if (timers[`!lemon`].listening) {
            resetCooldownTimer(`!lemon`)
            return target
                ? talk(chatroom, `${users[target].displayName} has ${users[target].lemons} lemon${users[target].lemons === 1 ? `` : `s`}! ${lemonEmote}`)
                : talk(chatroom, `${user.displayName} has ${user.lemons} lemon${user.lemons === 1 ? `` : `s`}! ${lemonEmote}`)
        } else { console.log(`${grayTxt}> Must wait for '!lemon' cooldown${resetTxt}`) }
    }

    // !uselemon (in some way)
    if (/^!([a-z]+)lemon([a-z]*)$/i.test(command)) {
        if (timers[`!uselemon`].listening) {
            resetCooldownTimer(`!uselemon`)
            return useLemon(chatroom, command, username, target)
        } else { console.log(`${grayTxt}> Must wait for '!uselemon' cooldown${resetTxt}`) }
    }

    // lemonify
    if (command === `!lemonify`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            if (!target) { return talk(chatroom, `${lemonEmote}${lemonEmote}${lemonEmote} ${positiveEmote}`) }
            const channelMsg = users[target][channel]?.lastMessage || getRandomChannelMessage(users[target])
            const lemonMsg = lemonify(channelMsg)
            return talk(chatroom, lemonMsg)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // !greet a user or whoever
    if (command === `!greet`) {
        // If !greet all
        if (args[0] === `all`) { return handleGreetAll(chatroom, currentTime) }
        // If one (known) username is used, greet normally
        if (target && !args[1]) { return handleGreet(chatroom, users[target]) }
        // If multiple args are used
        else if (args.length) { return handleMassGreet(chatroom, args) }
        // If no args are used
        else { return talk(chatroom, `Greetings, ${user.displayName}! ${greetingEmote}`) }
    }

    // Handle channel-specific goals
    if ([`!goal`, `!goals`].includes(command) && args.length) {
        if (timers[`!goal`].listening) {
            resetCooldownTimer(`!goal`)
            return sayGoals(chatroom, args)
        } else { console.log(`${grayTxt}> Must wait for '!goal' cooldown${resetTxt}`) }
    }

    // !bye OR !gn OR !goodnight
    if ([`!gn`, `!goodnight`, `!bye`].includes(command)) {
        if (target) { return sayGoodnight(chatroom, users[target]) }
        else if (args[0]) { return talk(chatroom, `see ya ${args[0]}`) }
        else { return sayGoodnight(chatroom, user) }
    }

    // !color / !colour
    if ([`!color`, `!colour`].includes(command)) {
        if (timers[`!color`].listening) {
            resetCooldownTimer(`!color`)
            return getColor(chatroom, users[target] || user)
        } else { console.log(`${grayTxt}> Must wait for '!color' cooldown${resetTxt}`) }
    }

    // !dadjoke
    if (command === `!dadjoke`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return getDadJoke(chatroom)
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // !pokemon
    if (command === `!pokemon`) {
        if (timers[command].listening) {
            resetCooldownTimer(command)
            return getPokemon(chatroom, args[0])
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // !away or !brb or !lurk
    if ([`!lurk`, `!away`, `!brb`].includes(command)) {
        if (timers[`!lurk`].listening) {
            resetCooldownTimer(`!lurk`)
            user[channel].away = true
            if (args.length) { user[channel].awayMessage = args.join(` `) }
            if (command !== `!lurk`) {
                return args.length
                    ? talk(chatroom, `See you later, ${user.displayName}! I'll pass along your away message if they mention you! ${byeEmote}`)
                    : talk(chatroom, `See you later, ${user.displayName}! I'll let people know you're away if they mention you! ${byeEmote}`)
            }
        } else { console.log(`${grayTxt}> Must wait for '${command}' cooldown${resetTxt}`) }
    }

    // Mentioned by StreamElements
    if (username === `streamelements` && (msg.includes(BOT_USERNAME))) {
        console.log(`${grayTxt}> Current points:${resetTxt}`, `points` in Object(users[BOT_USERNAME][channel]) ? users[BOT_USERNAME][channel].points : `(not known)`)
        // If bot used !gamble all and lost
        if (msg.match(/lost (every|it)/i)) {
            return handleLoseAllPoints(chatroom)
        }
        const nowHasPattern = /now ha(?:s|ve) \[*(\d*)/i // Set points based on "now has/have..." result
        if (msg.match(nowHasPattern)) {
            return handleSetPoints(chatroom, Number(msg.split(nowHasPattern)[1]))
        }
        const botHasNumPattern = / lemony_friend has ([^a-z]\d*)/i // Set points based StreamElements replying to '!points lemony_friend'
        if (msg.match(botHasNumPattern)) {
            return handleSetPoints(chatroom, Number(msg.split(botHasNumPattern)[1]))
        }
        const pointsSetToPattern = /set lemony_friend /i // Triggered by a manual set/bonus of points
        if (msg.match(pointsSetToPattern)) {
            return handleSetPoints(chatroom, Number(msg.split(pointsSetToPattern)[1].split(` `)[2]))
        }
        const insufficientFundsPattern = /^@?lemony_friend, you only have ([^a-z]\d*)/i // Triggered by insufficient points
        if (msg.match(insufficientFundsPattern)) {
            return handleSetPoints(chatroom, Number(msg.split(insufficientFundsPattern)[1]))
        }
        // Receiving points from a gifter
        const receivingPattern = /^(?!lemony_friend).* gave (\d*)/i
        if (msg.match(receivingPattern)) {
            return handleGivenPoints(chatroom, msg.split(` `)[0], Number(msg.split(receivingPattern)[1]))
        }
        // Checking bot's points if unknown
        if (!(`points` in Object(users[BOT_USERNAME][channel]))) {
            return talk(chatroom, `!points`)
        }
        // Updating points when giving (if known)
        const givingPattern = /lemony_friend gave ([^a-z]\d*)/i
        if (givingPattern.test(msg)) {
            users[BOT_USERNAME][channel].points += Number(msg.split(givingPattern)[1])
            if (settings.debug) { console.log(`${boldTxt}> New points:${resetTxt}`, users[BOT_USERNAME][channel].points) }
        }
    }

    // If bot mentioned in message
    if (msg.toLowerCase().includes(`lemon`)
        || msg.toLowerCase().includes(`melon`)
        || msg.toLowerCase().includes(`lemfriend`)) {
        // If the first word is `gn` or `bye`
        const goodNightPattern = /^ni(ght|te)[^\w\s]*$|^gn[^\w\s]*$|^(bye+)+[^\w\s]*$/i
        if (command.match(goodNightPattern)) {
            console.log(`${grayTxt}> "${command}" matched goodNightPattern${resetTxt}`)
            return sayGoodnight(chatroom, user)
        }

        // If the first word is `good` followed by "night"-like word
        if (command === `good` && args[0]?.match(goodNightPattern)) {
            console.log(`${grayTxt}> "good ${args[0]}" matched goodNightPattern${resetTxt}`)
            return sayGoodnight(chatroom, user)
        }

        // If the first word is `gj` or `nj`
        if ([`gj`, `nj`].includes(command)) { return sayThanks(chatroom, user) }

        // If the first word is `good`/`nice` followed by `job` or `work`
        const jobPattern = /^job+[^\w\s]*$/i
        const workPattern = /^work+[^\w\s]*$/i
        if ([`good`, `nice`].includes(command)
            && (args[0]?.match(jobPattern) || args[0]?.match(workPattern))) {
            return sayThanks(chatroom, user)
        }

        // If the first word is `well` followed by `done`
        if (command === `well` && args[0]?.match(/^done+[^\w\s]*$/i)) { return sayThanks(chatroom, user) }

        // If the first word is `thanks`-like
        const thanksLikePattern = /^t(y*(sm*)*|(h*[aeou]*[bmn]*)*(ks+|x+))[^\w\s]*$/i
        if (command.match(thanksLikePattern)) {
            console.log(`${grayTxt}> "${command}" matched thanksLikePattern${resetTxt}`)
            return sayYoureWelcome(chatroom, user)
        }

        // If the first word is `thank`-like and followed by "you"-like word
        const thankLikePattern = /^th*[aeou]*[bmn]*[kx]+[^\w\s]*$/i
        const youLikePattern = /^yo?u+[^\w\s]*$|^yew+[^\w\s]*$|^u+[^\w\s]*$/i
        if (command.match(thankLikePattern) && args[0]?.match(youLikePattern)) {
            console.log(`${grayTxt}> "${command}"/"${args[0]}" matched thankLikePattern & youLikePattern${resetTxt}`)
            return sayYoureWelcome(chatroom, user)
        }

        // If the first word is a greeting
        const greetingPattern = /^h[ae]+y+[^\w\s]*$|^hi+[^\w\s]*$|^he.*lo+[^\w\s]*$|^howd[a-z][^\w\s]*$|^sup+[^\w\s]*$|^wh?[au].*up[^\w\s]*$/i
        if (command.match(greetingPattern)) {
            console.log(`${grayTxt}> "${command}" matched greetingPattern${resetTxt}`)
            return handleGreet(chatroom, user)
        }

        // Checking for "what's up"
        const whatsUpPrefixPattern = /^wh?[au]t?['"]*s*[^\w\s]*$/i
        const upPattern = /^up+[^\w\s]*$/i
        // In case saying "what's up" first, and/or `up` doesn't come immediately
        if (command.match(whatsUpPrefixPattern)) {
            console.log(`${grayTxt}> "${command}" matched whatsUpPrefixPattern${resetTxt}`)
            for (const str of lowercaseArgs) {
                if (str.match(upPattern)) {
                    console.log(`${grayTxt}> "${str}" matched upPattern${resetTxt}`)
                    return handleGreet(chatroom, user)
                }
            }
        }

        // Check all words in message after the first
        for (const [i, val] of lowercaseArgs.entries()) {
            if (val.match(greetingPattern)) { console.log(`${grayTxt}> "${val}" matched greetingPattern${resetTxt}`) }
            if (val.match(upPattern) && lowercaseArgs[i - 1]?.match(whatsUpPrefixPattern)) { console.log(`${grayTxt}> "${val}" preceded by "${lowercaseArgs[i - 1]}" matched whatsUpPrefixPattern${resetTxt}`) }
            if (val.match(whatsUpPrefixPattern)) { console.log(`${grayTxt}> "${val}" matched whatsUpPrefixPattern${resetTxt}`) }
            if (val.match(goodNightPattern)) { console.log(`${grayTxt}> "${val}" matched goodNightPattern${resetTxt}`) }
            if (val.match(thanksLikePattern)) { console.log(`${grayTxt}> "${val}" matched thanksLikePattern${resetTxt}`) }
            if (val.match(thankLikePattern)) { console.log(`${grayTxt}> "${val}" matched thankLikePattern${resetTxt}`) }
            if (val.match(youLikePattern)) { console.log(`${grayTxt}> "${val}" matched youLikePattern${resetTxt}`) }
            if (val.match(thankLikePattern) && lowercaseArgs[i + 1]?.match(youLikePattern)) { console.log(`${grayTxt}> "${val}" matched thankLikePattern and "${lowercaseArgs[i + 1]}" matched youLikePattern${resetTxt}`) }
            if ([`gj`, `nj`].includes(val) && lowercaseArgs[i + 1]?.match(goodNightPattern)) { console.log(`${grayTxt}> "${val}" followed by "${lowercaseArgs[i + 1]}" matched goodNightPattern${resetTxt}`) }
            if ([`good`, `nice`].includes(val) && lowercaseArgs[i + 1]?.match(jobPattern)) { console.log(`${grayTxt}> "${val}" followed by "${lowercaseArgs[i + 1]}" matched jobPattern${resetTxt}`) }
            if ([`good`, `nice`].includes(val) && lowercaseArgs[i + 1]?.match(workPattern)) { console.log(`${grayTxt}> "${val}" followed by "${lowercaseArgs[i + 1]}" matched workPattern${resetTxt}`) }

            // Checking if greeting came later in message
            if (val.match(greetingPattern)) { return handleGreet(chatroom, user) }

            // Checking if `up` (and preceeding "what's"-like word) came later in message
            if (val.match(upPattern) && lowercaseArgs[i - 1]?.match(whatsUpPrefixPattern)) { return handleGreet(chatroom, user) }

            // If `gn` came later in the message
            if (val.match(goodNightPattern)) { return sayGoodnight(chatroom, user) }

            // If `good` followed by "night"-like word came later in the message
            if (val === `good` && lowercaseArgs[i + 1]?.match(goodNightPattern)) { return sayGoodnight(chatroom, user) }

            // If thanks came later in message
            if (val.match(thanksLikePattern)) { return sayYoureWelcome(chatroom, user) }

            // If "thank"-like followed by "you"-like word came later in the message
            if (val.match(thankLikePattern) && lowercaseArgs[i + 1]?.match(youLikePattern)) { return sayYoureWelcome(chatroom, user) }

            // If `gj` or `nj` came later in the message
            if ([`gj`, `nj`].includes(val)) { return sayThanks(chatroom, user) }

            // If `good`/`nice` followed by `job`/`work` came later in the message
            if ([`good`, `nice`].includes(val)
                && (lowercaseArgs[i + 1]?.match(jobPattern) || lowercaseArgs[i + 1]?.match(workPattern))) {
                return sayThanks(chatroom, user)
            }

            // If `well` followed by `done` came later in the message
            if (val === `well` && lowercaseArgs[i + 1]?.match(/^done+[^\w\s]*$/)) { return sayThanks(chatroom, user) }
        }

        // If all else fails, but message includes "you/your/you're" or " u / ur/ u"
        const secondPersonPattern = /you([^npst]|$)| ur?( |$)/i
        if (secondPersonPattern.test(msg)) {
            console.log(`${grayTxt}> "${msg}" matched secondPersonPattern${resetTxt}`)
            return checkSentiment(chatroom, msg)
        }

        console.log(`${grayTxt}> Bot mentioned, but didn't trigger response${resetTxt}`)
    }

    // New idea attempt: RegEx for questions
    // User asking "how many emotes does (member of Lemony Fresh) have?"
    const howManyEmotesPattern = /^how many emotes does (\w+) have/i
    if (msg.match(howManyEmotesPattern)) {
        let grabbedUser = msg.split(howManyEmotesPattern)[1].toLowerCase()
        while (grabbedUser.startsWith(`@`)) (grabbedUser = grabbedUser.substring(1))
        if ([`jpegstripes`, `sclarf`, `e1ectroma`, `domonintendo1`, `ppuyya`].includes(grabbedUser)) {
            return talk(chatroom, `${grabbedUser} has ${lemonyFresh[grabbedUser].emotes.length} emote${lemonyFresh[grabbedUser].emotes.length === 1 ? `` : `s`}!`)
        }
    }

    // User asking an "am i ...?" question about themselves
    if (command === `am` && args[0]?.toLowerCase() === `i`) {
        args.shift()
        const lowercaseArgs = args.map(str => str.toLowerCase())

        for (const str of lowercaseArgs) {
            const idx = lowercaseArgs.indexOf(str)

            // Asking about channel info
            if (str.match(/^sub/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in user) {
                        return user[`jpegstripes`].sub
                            ? talk(chatroom, `Yes ${user.displayName}, you are subbed to JPEGSTRIPES! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not subbed to JPEGSTRIPES! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in user) {
                        return user[`sclarf`].sub
                            ? talk(chatroom, `Yes ${user.displayName}, you are subbed to sclarf! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not subbed to sclarf! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in user) {
                        return user[`domonintendo1`].sub
                            ? talk(chatroom, `Yes ${user.displayName}, you are subbed to domonintendo1! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not subbed to domonintendo1! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in user) {
                        return user[`e1ectroma`].sub
                            ? talk(chatroom, `Yes ${user.displayName}, you are subbed to e1ectroma! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not subbed to e1ectroma! ${negativeEmote}`)
                    }
                }
                return user[channel].sub
                    ? talk(chatroom, `Yes ${user.displayName}, you are subbed to ${channel}! ${hypeEmote}`)
                    : talk(chatroom, `No ${user.displayName}, you are not subbed to ${channel}! ${negativeEmote}`)
            }
            if (str.match(/^mod/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in user) {
                        return user[`jpegstripes`].mod
                            ? talk(chatroom, `Yes ${user.displayName}, you are a mod in JPEGSTRIPES's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a mod in JPEGSTRIPES's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in user) {
                        return user[`sclarf`].mod
                            ? talk(chatroom, `Yes ${user.displayName}, you are a mod in sclarf's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a mod in sclarf's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in user) {
                        return user[`domonintendo1`].mod
                            ? talk(chatroom, `Yes ${user.displayName}, you are a mod in domonintendo1's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a mod in domonintendo1's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in user) {
                        return user[`e1ectroma`].mod
                            ? talk(chatroom, `Yes ${user.displayName}, you are a mod in e1ectroma's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a mod in e1ectroma's chat! ${negativeEmote}`)
                    }
                }
                return user[channel].mod
                    ? talk(chatroom, `Yes ${user.displayName}, you are a mod in ${channel}'s chat! ${hypeEmote}`)
                    : talk(chatroom, `No ${user.displayName}, you are not a mod in ${channel}'s chat! ${negativeEmote}`)
            }
            if (str.match(/^vip/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in user) {
                        return user[`jpegstripes`].vip
                            ? talk(chatroom, `Yes ${user.displayName}, you are a VIP in JPEGSTRIPES's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a VIP in JPEGSTRIPES's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in user) {
                        return user[`sclarf`].vip
                            ? talk(chatroom, `Yes ${user.displayName}, you are a VIP in sclarf's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a VIP in sclarf's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in user) {
                        return user[`domonintendo1`].vip
                            ? talk(chatroom, `Yes ${user.displayName}, you are a VIP in domonintendo1's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a VIP in domonintendo1's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in user) {
                        return user[`e1ectroma`].vip
                            ? talk(chatroom, `Yes ${user.displayName}, you are a VIP in e1ectroma's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a VIP in e1ectroma's chat! ${negativeEmote}`)
                    }
                }
                return user[channel].vip
                    ? talk(chatroom, `Yes ${user.displayName}, you are a VIP in ${channel}'s chat! ${hypeEmote}`)
                    : talk(chatroom, `No ${user.displayName}, you are not a VIP in ${channel}'s chat! ${negativeEmote}`)
            }
        }
    }

    // User asking a "do i ...?" question about themselves
    if (command === `do` && args[0]?.toLowerCase() === `i`) {
        args.shift()
        const lowercaseArgs = args.map(str => str.toLowerCase())

        for (const str of lowercaseArgs) {
            const idx = lowercaseArgs.indexOf(str)

            // Asking about channel info
            if (str.match(/^sub/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in user) {
                        return user[`jpegstripes`].sub
                            ? talk(chatroom, `Yes ${user.displayName}, you are subbed to JPEGSTRIPES! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not subbed to JPEGSTRIPES! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in user) {
                        return user[`sclarf`].sub
                            ? talk(chatroom, `Yes ${user.displayName}, you are subbed to sclarf! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not subbed to sclarf! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in user) {
                        return user[`domonintendo1`].sub
                            ? talk(chatroom, `Yes ${user.displayName}, you are subbed to domonintendo1! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not subbed to domonintendo1! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in user) {
                        return user[`e1ectroma`].sub
                            ? talk(chatroom, `Yes ${user.displayName}, you are subbed to e1ectroma! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not subbed to e1ectroma! ${negativeEmote}`)
                    }
                }
                return user[channel].sub
                    ? talk(chatroom, `Yes ${user.displayName}, you are subbed to ${channel}! ${hypeEmote}`)
                    : talk(chatroom, `No ${user.displayName}, you are not subbed to ${channel}! ${negativeEmote}`)
            }
            if (str.match(/^mod/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in user) {
                        return user[`jpegstripes`].mod
                            ? talk(chatroom, `Yes ${user.displayName}, you are a mod in JPEGSTRIPES's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a mod in JPEGSTRIPES's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in user) {
                        return user[`sclarf`].mod
                            ? talk(chatroom, `Yes ${user.displayName}, you are a mod in sclarf's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a mod in sclarf's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in user) {
                        return user[`domonintendo1`].mod
                            ? talk(chatroom, `Yes ${user.displayName}, you are a mod in domonintendo1's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a mod in domonintendo1's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in user) {
                        return user[`e1ectroma`].mod
                            ? talk(chatroom, `Yes ${user.displayName}, you are a mod in e1ectroma's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a mod in e1ectroma's chat! ${negativeEmote}`)
                    }
                }
                return user[channel].mod
                    ? talk(chatroom, `Yes ${user.displayName}, you are a mod in ${channel}'s chat! ${hypeEmote}`)
                    : talk(chatroom, `No ${user.displayName}, you are not a mod in ${channel}'s chat! ${negativeEmote}`)
            }
            if (str.match(/^vip/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in user) {
                        return user[`jpegstripes`].vip
                            ? talk(chatroom, `Yes ${user.displayName}, you are a VIP in JPEGSTRIPES's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a VIP in JPEGSTRIPES's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in user) {
                        return user[`sclarf`].vip
                            ? talk(chatroom, `Yes ${user.displayName}, you are a VIP in sclarf's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a VIP in sclarf's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in user) {
                        return user[`domonintendo1`].vip
                            ? talk(chatroom, `Yes ${user.displayName}, you are a VIP in domonintendo1's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a VIP in domonintendo1's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in user) {
                        return user[`e1ectroma`].vip
                            ? talk(chatroom, `Yes ${user.displayName}, you are a VIP in e1ectroma's chat! ${hypeEmote}`)
                            : talk(chatroom, `No ${user.displayName}, you are not a VIP in e1ectroma's chat! ${negativeEmote}`)
                    }
                }
                return user[channel].vip
                    ? talk(chatroom, `Yes ${user.displayName}, you are a VIP in ${channel}'s chat! ${hypeEmote}`)
                    : talk(chatroom, `No ${user.displayName}, you are not a VIP in ${channel}'s chat! ${negativeEmote}`)
            }
        }
    }

    // User asking a question about another user
    if ([`is`, `does`].includes(command)) {
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
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in targetedUser) {
                        return targetedUser[`jpegstripes`].sub
                            ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to JPEGSTRIPES! ${hypeEmote}`)
                            : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to JPEGSTRIPES! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in targetedUser) {
                        return targetedUser[`sclarf`].sub
                            ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to sclarf! ${hypeEmote}`)
                            : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to sclarf! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in targetedUser) {
                        return targetedUser[`domonintendo1`].sub
                            ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to domonintendo1! ${hypeEmote}`)
                            : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to domonintendo1! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in targetedUser) {
                        return targetedUser[`e1ectroma`].sub
                            ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to e1ectroma! ${hypeEmote}`)
                            : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to e1ectroma! ${negativeEmote}`)
                    }
                }
                return targetedUser[channel]?.sub
                    ? talk(chatroom, `Yes, ${targetedUser.displayName} is subbed to ${channel}! ${hypeEmote}`)
                    : talk(chatroom, `No, ${targetedUser.displayName} is not subbed to ${channel}! ${negativeEmote}`)
            }
            if (str.match(/^mod/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in targetedUser) {
                        return targetedUser[`jpegstripes`].mod
                            ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in JPEGSTRIPES's chat! ${hypeEmote}`)
                            : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in JPEGSTRIPES's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in targetedUser) {
                        return targetedUser[`sclarf`].mod
                            ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in sclarf's chat! ${hypeEmote}`)
                            : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in sclarf's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in targetedUser) {
                        return targetedUser[`domonintendo1`].mod
                            ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in domonintendo1's chat! ${hypeEmote}`)
                            : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in domonintendo1's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in targetedUser) {
                        return targetedUser[`e1ectroma`].mod
                            ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in e1ectroma's chat! ${hypeEmote}`)
                            : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in e1ectroma's chat! ${negativeEmote}`)
                    }
                }
                return targetedUser[channel]?.mod
                    ? talk(chatroom, `Yes, ${targetedUser.displayName} is a mod in ${channel}'s chat! ${hypeEmote}`)
                    : talk(chatroom, `No, ${targetedUser.displayName} is not a mod in ${channel}'s chat! ${negativeEmote}`)
            }
            if (str.match(/^vip/i)) {
                if (lowercaseArgs[idx + 2]) {
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`jpeg`) && `jpegstripes` in targetedUser) {
                        return targetedUser[`jpegstripes`].vip
                            ? talk(chatroom, `Yes, ${targetedUser.displayName} is a VIP in JPEGSTRIPES's chat! ${hypeEmote}`)
                            : talk(chatroom, `No, ${targetedUser.displayName} is not a VIP in JPEGSTRIPES's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`scl`) && `sclarf` in targetedUser) {
                        return targetedUser[`sclarf`].vip
                            ? talk(chatroom, `Yes, ${targetedUser.displayName} is a VIP in sclarf's chat! ${hypeEmote}`)
                            : talk(chatroom, `No, ${targetedUser.displayName} is not a VIP in sclarf's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`dom`) && `domonintendo1` in targetedUser) {
                        return targetedUser[`domonintendo1`].vip
                            ? talk(chatroom, `Yes, ${targetedUser.displayName} is a VIP in domonintendo1's chat! ${hypeEmote}`)
                            : talk(chatroom, `No, ${targetedUser.displayName} is not a VIP in domonintendo1's chat! ${negativeEmote}`)
                    }
                    if (lowercaseArgs[idx + 2].toLowerCase().includes(`trom`) && `e1ectroma` in targetedUser) {
                        return targetedUser[`e1ectroma`].vip
                            ? talk(chatroom, `Yes, ${targetedUser.displayName} is a VIP in e1ectroma's chat! ${hypeEmote}`)
                            : talk(chatroom, `No, ${targetedUser.displayName} is not a VIP in e1ectroma's chat! ${negativeEmote}`)
                    }
                }
                return targetedUser[channel]?.vip
                    ? talk(chatroom, `Yes, ${targetedUser.displayName} is a VIP in ${channel}'s chat! ${hypeEmote}`)
                    : talk(chatroom, `No, ${targetedUser.displayName} is not a VIP in ${channel}'s chat! ${negativeEmote}`)
            }
        }
    }

    // !tempcmd or !tmpcmd
    if ([`!tempcmd`, `!tmpcmd`].includes(command)) { return handleTempCmd(chatroom, username, args) }

    // !tempcmds or !tmpcmds
    if ([`!tempcmds`, `!tmpcmds`].includes(command)) {
        const commands = Object.keys(tempCmds).map((key) => `${key} => "${tempCmds[key]}"`)
        return talk(chatroom, `There ${commands.length === 1 ? `is` : `are`} ${commands.length} temporary command${commands.length === 1 ? `` : `s`}${commands.length === 0 ? `! ${negativeEmote}` : `: ${commands.join(', ')}`}`)
    }

    // Check for tempCmd
    if (command in tempCmds) { return talk(chatroom, tempCmds[command]) }

    if (hangman.listening && !hangman.signup) {
        if (msg.match(/^[a-z]$/i) && username === hangman.players[hangman.currentPlayer]) {
            return checkLetter(chatroom, username, msg.toUpperCase())
        } else if (msg.split(` `).length === 1 && msg.split(` `)[0].length === hangman.answer.length && username === hangman.players[hangman.currentPlayer] && msg.match(/^[a-z]+$/i)) {
            console.log(`> Word guess attempt was made!`)
            if (msg.toLowerCase() === hangman.answer) {
                return solvePuzzle(chatroom, username)
            } else {
                hangman.chances--
                if (hangman.chances === 0) {
                    hangman.listening = false
                    return talk(chatroom, `Sorry ${user.displayName}, "${msg.toLowerCase()}" wasn't the answer! The answer was "${hangman.answer}". Game over! ${negativeEmote}`)
                }
                hangman.currentPlayer++
                if (hangman.currentPlayer === hangman.players.length) { hangman.currentPlayer = 0 }
                const nextPlayer = users[hangman.players[hangman.currentPlayer]].displayName
                talk(chatroom, `Sorry ${user.displayName}, "${msg.toLowerCase()}" wasn't the answer! ${hangman.chances} chance${hangman.chances === 1 ? ` left!` : `s left...`} ${negativeEmote} Now it's your turn, ${nextPlayer}!`)
                const statusMsg = `${hangman.spaces.join(` `)} (chances: ${hangman.chances})`
                const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME ? 1000 : 2000
                setTimeout(() => talk(chatroom, statusMsg), delay)
            }
        }
    }

    if (timers.streak.listening || channel === BOT_USERNAME) {
        // Listening for a message to be repeated by at least two other users
        const stopListening = checkStreak(chatroom, msg)

        // create separate cooldown timer settings.cooldown[`emoteStreaksTimer`] - consider renaming settings.cooldown[timer] from `listening` to `streaksTimer`
        // Continue listening for emote streak (if bot is subbed)
        if (!stopListening) {
            for (const member of lemonyFresh.channels) {
                const chan = member.substring(1)
                if (users[BOT_USERNAME]?.[chan]?.sub) {
                    for (const str of lemonyFresh[chan].emotes) {
                        if (msg.includes(str)) {
                            return checkEmoteStreak(chatroom, lemonyFresh[chan].emotes)
                        }
                    }
                }
            }
        }
    }

    // If a word starts with "but", and has a 4th letter that isn't T or punctuation, make it "BUTT-(rest of word)"
    for (const str of lowercaseArgs) {
        if (str.match(/^but[a-s|u-z]/i)) { return talk(chatroom, `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}? More like BUTT-${str.slice(3).toLowerCase()}`) }
    }

    // *** FUN NUMBER! ***
    if (user[channel].msgCount % settings.funNumberCount === 0) { return rollFunNumber(chatroom, tags, username, msg.split(` `), Math.floor(Math.random() * settings.funNumberTotal)) }

    // Check if user hasn't chatted in more than an hour, but less than 8 hours, and isn't the streamer or a known bot
    if (elapsedMinsSinceLastMsg >= 60
        && elapsedMinsSinceLastMsg < 480
        && ![channel, `nightbot`, `streamelements`, `blerp`, `soundalerts`, `streamlabs`, `undertalebot`, `buttsbot`].includes(username)) {
        console.log(`${grayTxt}${username} hasn't chatted in the past 1-8 hours${resetTxt}`, elapsedMinsSinceLastMsg)
        return setTimeout(() => talk(chatroom, `Welcome back, ${user.displayName}! ${greetingEmote}`), 5000)
    }
}

module.exports = {
    onConnectedHandler,
    onMessageHandler
}
