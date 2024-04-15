const DEV = process.env.DEV
const BOT_USERNAME = process.env.BOT_USERNAME

const dev = require(`./commands/dev`)
const commands = require(`./commands`)
const printLemon = require(`./commands/printLemon`)
const { makeLogs } = require(`./commands/makeLogs`)
const { streakListener } = require(`./commands/streaks`)
const { rollFunNumber } = require(`./commands/funNumber`)
const { handleNewChatter, welcomeBack, reportAway, funTimerGuess } = require(`./commands/conversation`)
const { handleColorChange, handleTurboChange, handleSubChange, handleModChange, handleVIPChange } = require(`./commands/userChange`)

const patterns = require(`./patterns`)
const botInteraction = require(`./patterns/botInteraction`)
const botMention = require(`./patterns/botMention`)
const { checkWord, checkLetter } = require(`./patterns/hangman`)

const { lemonyFresh, users, tempCmds } = require(`./data`)
const { resetTxt, whiteTxt, grayTxt, yellowBg, chatColors, settings } = require(`./config`)
const { initUser, initUserChannel, initChannel, updateMod, getToUser, tagsListener, sayJoinMessage } = require(`./utils`)

module.exports = {
    onConnectedHandler(addr, port) {
        settings.firstConnection && printLemon()
        const time = new Date().toLocaleTimeString(settings.timeLocale, { timeZone: settings.timeZone })
        settings.firstConnection
            ? console.log(`[${time}] 🍋 Connected to ${addr}:${port}`)
            : console.log(`[${time}] 🍋 Re-connected to ${addr}:${port}`)
        settings.firstConnection = false
    },
    onJoinedHandler(chatroom, username, self) {
        if (settings.debug) { console.log(`${grayTxt}${username} joined ${chatroom}${resetTxt}`) }
        const channel = chatroom.substring(1)

        if (self) {
            initChannel(channel)
            // Say join message
            if (settings.sayJoinMessage) { sayJoinMessage(this, chatroom) }
        }

        if (!lemonyFresh[channel].viewers.includes(username)) {
            lemonyFresh[channel].viewers.push(username)
        }
    },
    onPartedHandler(chatroom, username, self) {
        if (settings.debug) { console.log(`${grayTxt}${username} parted from ${chatroom}${resetTxt}`) }
        const channel = chatroom.substring(1)

        lemonyFresh[channel].viewers.splice(lemonyFresh[channel].viewers.indexOf(username), 1)
        while (lemonyFresh[channel].viewers.includes(username)) {
            lemonyFresh[channel].viewers.splice(lemonyFresh[channel].viewers.indexOf(username), 1)
        }
    },
    onWhisperHandler(fromRoom, tags, message, err) {
        if (err) { return console.log(err) }
        if (settings.debug) {
            console.log(`> ${BOT_USERNAME} received a whisper from ${fromRoom}: ${message}`)
            if (/^tags$/i.test(message)) { console.log(tags) }
        }
    },
    onMessageHandler(chatroom, tags, message, self) {
        // Allow /me but not whispers
        if (![`chat`, `action`].includes(tags[`message-type`])) {
            if (settings.debug) { console.log(`${grayTxt}> Message is not of type 'chat' or 'action'${resetTxt}`) }
            return
        }

        const msg = message.replace(/ +/g, ` `)
        const channel = chatroom.substring(1)
        const username = tags.username
        const time = new Date().toLocaleTimeString(settings.timeLocale, { timeZone: settings.timeZone })
        const color = tags.color || ``

        // Log incoming message and capture message tags
        if (!settings.hideNonDevChannel || channel === DEV) {
            self && settings.highlightBotMessage
                ? console.log(`${yellowBg}${settings.logTime
                    ? `[${time}] `
                    : ``}${settings.hideNonDevChannel
                        ? ``
                        : `<${channel}> `}${username}: ${msg}${resetTxt}`)
                : console.log(`${settings.logTime
                    ? `[${time}] `
                    : ``}${settings.hideNonDevChannel
                        ? ``
                        : `<${channel}> `}${color in chatColors ? chatColors[color].terminalColor : whiteTxt}${username}: ${msg}${resetTxt}`)
        }
        tagsListener(tags)

        // Initialize new user
        if (!(username in users)) { initUser(tags, self) }

        // Add mod/update isModIn list
        if (tags.mod) { updateMod(chatroom, tags, self, username) }

        // Initialize user in a new chatroom
        if (!(channel in users[username])) { initUserChannel(tags, username, channel) }

        const user = users[username]
        user[channel].msgCount++
        user[channel].lastMessage = msg
        self
            ? user[channel].sentAt = Date.now()
            : user[channel].sentAt = Number(tags[`tmi-sent-ts`])

        // Update lemony_logs.txt
        makeLogs(this.channels)

        // Checking time comparisons
        const currentTime = Number(tags[`tmi-sent-ts`])
        const minutesSinceLastMsg = (currentTime - user[channel].sentAt) / 60000
        if (minutesSinceLastMsg >= settings.minWelcomeBackMinutes && minutesSinceLastMsg < settings.maxWelcomeBackMinutes && ![channel, ...settings.ignoredBots].includes(username)) { return welcomeBack(props) }

        // User attribute change detection
        const colorChanged = tags.color !== user.color && user.color !== ``
        const turboChange = tags.turbo !== user.turbo
        const subChange = user[channel].sub !== tags.subscriber
        const modChange = user[channel].mod !== tags.mod
        const vipChange = user[channel].vip !== (!!tags.vip || !!tags.badges?.vip)

        const args = msg.split(` `)
        const command = args.shift().toLowerCase()
        const toUser = getToUser(args[0])
        const props = {
            bot: this,
            chatroom: chatroom,
            tags: tags,
            message: msg,
            self: self,
            args: args,
            currentTime: currentTime,
            command: command,
            channel: channel,
            username: tags.username,
            isMod: tags.mod || username === channel,
            isModOrVIP: !!tags.badges?.vip || !!tags.vip || tags.mod || username === channel,
            isLemonyFreshMember: username in lemonyFresh,
            user: users[username],
            userNickname: users[username].nickname || users[username].displayName,
            toUser: toUser,
            target: users?.[toUser] || null,
            targetNickname: users?.[toUser]?.nickname || users?.[toUser]?.displayName || null
        }
        // These checks happen earlier in case they happened to the bot
        if (subChange) { return handleSubChange(props) }
        if (modChange) { return handleModChange(props) }
        if (vipChange) { return handleVIPChange(props) }

        // Bot stops listening
        if (self) { return }

        if (user[channel].away) { return welcomeBack(props) }
        if (colorChanged) { return handleColorChange(props) }
        if (turboChange) { return handleTurboChange(props) }

        /**************\
        !COMMANDS PARSER
        \**************/
        if (msg.startsWith(`!`)) {
            for (const cmd in commands) {
                if (command === cmd) {
                    if (settings.debug) { console.log(`${grayTxt}MATCHED COMMAND:${resetTxt}`, cmd, commands[command]) }
                    return commands[command](props)
                }
            }
            if (settings.debug && !/^!([a-z]+)lemon([a-z]*)/.test(command)) { console.log(`${grayTxt}COMMAND NOT RECOGNIZED${resetTxt}`) }
        }
        // Dev commands
        if (username === DEV) {
            for (const cmd in dev) {
                if (command === cmd) {
                    if (settings.debug) { console.log(`${grayTxt}MATCHED DEV COMMAND:${resetTxt}`, cmd, dev[command]) }
                    return dev[command](props)
                }
            }
            // if (settings.debug) { console.log(`${grayTxt}DEV COMMAND NOT RECOGNIZED${resetTxt}`) }
        }

        // User is the funTimerGuesser and making an attempt
        if (lemonyFresh[channel].funTimerGuesser === username && /^\d+$/.test(msg)) { return funTimerGuess(props) }

        // User's first message in a given channel
        const firstMsg = tags['first-msg']
        if (firstMsg) { return handleNewChatter(this, chatroom, user) }

        /*************\
        /REGEX/ PARSERS
        \*************/
        // General regex patterns
        for (const pattern in patterns) {
            const regex = new RegExp(pattern.split('/')[1], pattern.split('/')[2])
            if (regex.test(msg)) {
                if (settings.debug) { console.log(`${grayTxt}MESSAGE MATCHED REGEX PATTERN:${resetTxt}`, regex, patterns[regex]) }
                return patterns[regex](props, msg.split(regex))
            }
        }
        // Other bot mentions bot
        if ([`streamelements`, `thetarashark`, `pokemoncommunitygame`].includes(username)) {
            if (msg.includes(BOT_USERNAME)) {
                for (const pattern in botInteraction) {
                    const regex = new RegExp(pattern.split('/')[1], pattern.split('/')[2])
                    if (regex.test(msg)) {
                        if (settings.debug) { console.log(`${grayTxt}${username.toUpperCase()} MATCHED REGEX PATTERN:${resetTxt}`, regex, botInteraction[regex]) }
                        return botInteraction[regex](props, msg.split(regex))
                    }
                }
                if (settings.debug) { console.log(`${grayTxt}${username.toUpperCase()} DID NOT MATCH REGEX PATTERNS${resetTxt}`) }
            }
            if (!(`points` in Object(users[BOT_USERNAME][channel])) && [`streamelements`, `thetarashark`].includes(username)) { return this.say(chatroom, `!points`) }
        }
        // Any user mentions bot
        if (/\b(@?lemony_friend|l+e+m+o+n+y*|m+e+l+o+n+|l+e+m+f+r+i+e+n+d+)\b/i.test(msg)) {
            for (const pattern in botMention) {
                const regex = new RegExp(pattern.split('/')[1], pattern.split('/')[2])
                if (regex.test(msg)) {
                    if (settings.debug) { console.log(`${grayTxt}BOT MENTION MATCHED REGEX PATTERN:${resetTxt}`, regex, botMention[regex]) }
                    return botMention[regex](props, msg.split(regex))
                }
            }
            if (settings.debug) { console.log(`${grayTxt}BOT MENTION DID NOT MATCH REGEX PATTERNS${resetTxt}`) }
        }
        // If hangman has started, and it's the current player's turn
        const hangman = lemonyFresh[channel].hangman
        if (hangman.listening && !hangman.signup && username === hangman.players[hangman.currentPlayer]) {
            if (/^[a-z]$/i.test(msg)) { return checkLetter(props) }
            if (/^[a-z]{2,}$/i.test(msg) && msg.length === hangman.answer.length) { return checkWord(props) }
            if (settings.debug) { console.log(`${grayTxt}NOT A HANGMAN GUESS${resetTxt}`) }
        }

        // Listening for a message to be repeated by at least two other users
        if (lemonyFresh[channel].timers.streak.listening) { streakListener(props) }
        else if (settings.debug) { console.log(`${grayTxt}> checkStreak must wait for 'streak' cooldown${resetTxt}`) }

        // Check for tempCmd
        if (command in tempCmds) {
            if (settings.debug) { console.log(`${grayTxt}MATCHED TEMPORARY COMMAND:${resetTxt} ${command} ${grayTxt}${tempCmds[command]}${resetTxt}`) }
            return this.say(chatroom, tempCmds[command])
        }

        // *** FUN NUMBER! ***
        if (user[channel].msgCount % settings.funNumberCount === 0) { return rollFunNumber(props, Math.floor(Math.random() * settings.funNumberTotal)) }

        // In case a user who isn't a bot mentions a user who is away
        if (!settings.ignoredBots.includes(username)) { reportAway(props) }
    }
}
