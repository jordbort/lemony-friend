const DEV = process.env.DEV
const BOT_USERNAME = process.env.BOT_USERNAME

const dev = require(`./commands/dev`)
const commands = require(`./commands`)
const printLemon = require(`./commands/printLemon`)
const patterns = require(`./patterns`)
const botInteraction = require(`./patterns/botInteraction`)
const botMention = require(`./patterns/botMention`)

const { settings } = require(`./config`)
const { lemonyFresh, users, tempCmds } = require(`./data`)

const { useTempCmd } = require(`./commands/tempCmds`)
const { streakListener } = require(`./commands/streaks`)
const { rollFunNumber } = require(`./commands/funNumber`)
const { checkWord, checkLetter } = require(`./patterns/hangman`)
const { handleNewChatter, welcomeBack, reportAway, funTimerGuess } = require(`./commands/conversation`)
const { handleColorChange, handleSubChange, handleModChange, handleVIPChange } = require(`./commands/userChange`)
const { initUser, initUserChannel, initChannel, updateMod, getToUser, tagsListener, sayJoinMessage, logMessage } = require(`./utils`)

module.exports = {
    onConnectedHandler(addr, port) {
        settings.firstConnection && printLemon()
        settings.firstConnection && logMessage([`Session started: ${settings.startDate.toLocaleDateString(`en-US`, { weekday: `long`, month: `long`, day: `numeric`, year: `numeric`, timeZone: settings.timeZone })} at ${settings.startDate.toLocaleTimeString(`en-US`, { hour: `numeric`, minute: `numeric`, second: `numeric`, timeZone: settings.timeZone, timeZoneName: `short` })}`])
        const time = new Date().toLocaleTimeString(settings.timeLocale, { timeZone: settings.timeZone })
        settings.firstConnection
            ? logMessage([`[${time}] 🍋 Connected to ${addr}:${port}`])
            : logMessage([`[${time}] 🍋 Re-connected to ${addr}:${port}`])
        settings.firstConnection = false
    },
    onJoinedHandler(chatroom, username, self) {
        logMessage([`${username} joined ${chatroom}`])
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
        logMessage([`${username} parted from ${chatroom}`])
        const channel = chatroom.substring(1)

        while (lemonyFresh[channel].viewers.includes(username)) {
            lemonyFresh[channel].viewers.splice(lemonyFresh[channel].viewers.indexOf(username), 1)
        }
    },
    onWhisperHandler(fromRoom, tags, message, err) {
        if (err) { return console.log(err) }
        logMessage([`> ${BOT_USERNAME} received a whisper from ${fromRoom}: ${message}`])
        if (/^tags$/i.test(message)) { console.log(tags) }
    },
    onMessageHandler(chatroom, tags, message, self) {
        // Allow /me but not whispers
        if (![`chat`, `action`].includes(tags[`message-type`])) {
            logMessage([`> Message is not of type 'chat' or 'action'`])
            return
        }

        const msg = message.replace(/ +/g, ` `)
        const channel = chatroom.substring(1)
        const username = tags.username
        const time = new Date().toLocaleTimeString(settings.timeLocale, { timeZone: settings.timeZone })
        const color = tags.color || ``

        // Log incoming message and capture message tags
        logMessage([msg], time, channel, username, color, self)
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

        // Checking time comparisons
        const currentTime = Number(tags[`tmi-sent-ts`])
        const minutesSinceLastMsg = (currentTime - user[channel].sentAt) / 60000
        self
            ? user[channel].sentAt = Date.now()
            : user[channel].sentAt = currentTime

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

        // User attribute change detection
        const colorChange = tags.color !== user.color && user.color !== ``
        const subChange = user[channel].sub !== tags.subscriber
        const modChange = user[channel].mod !== tags.mod
        const vipChange = user[channel].vip !== (!!tags.vip || !!tags.badges?.vip)

        if (subChange) { handleSubChange(props) }
        if (modChange) { handleModChange(props) }
        if (vipChange) { handleVIPChange(props) }

        // Bot stops listening
        if (self) { return }

        // Acknowledge color change
        if (colorChange) { return handleColorChange(props) }

        // Acknowledge gigantified emote
        if (tags[`msg-id`] === `gigantified-emote-message`) {
            const emoteUsed = msg.split(` `)[msg.split(` `).length - 1]
            const emoteOwner = Object.keys(lemonyFresh).filter(
                key => typeof lemonyFresh[key] === `object`
                    && `emotes` in lemonyFresh[key]
                    && lemonyFresh[key].emotes.includes(emoteUsed))[0]
                || null
            logMessage([`> Gigantified ${emoteUsed} owner: ${emoteOwner || `unknown`}, ${BOT_USERNAME} subbed? ${!!users[BOT_USERNAME]?.[emoteOwner]?.sub}`])
            if (users[BOT_USERNAME]?.[emoteOwner]?.sub) { this.say(chatroom, `BEEG ${emoteUsed}`) }
        }


        /**************\
        !COMMANDS PARSER
        \**************/
        // Dev commands
        if (username === DEV) {
            for (const cmd in dev) {
                if (command === cmd) {
                    logMessage([`MATCHED DEV COMMAND:`, cmd, `[Function: ${dev[command].name}]`])
                    return dev[command](props)
                }
            }
        }
        if (msg.startsWith(`!`)) {
            for (const cmd in commands) {
                if (command === cmd) {
                    logMessage([`MATCHED COMMAND:`, cmd, `[Function: ${commands[command].name}]`])
                    return commands[command](props)
                }
            }
            if (!/^!([a-z]+)lemon([a-z]*)/.test(command)) { logMessage([`COMMAND NOT RECOGNIZED`]) }
        }

        // Check user's first message in a given channel
        if (tags[`first-msg`]) { return handleNewChatter(props) }

        // User is the funTimerGuesser and making an attempt
        if (lemonyFresh[channel].funTimerGuesser === username && /\b\d+\b/.test(msg)) { return funTimerGuess(props) }

        /***********\
        REGEX PARSERS
        \***********/
        // General regex patterns
        for (const pattern in patterns) {
            const regex = new RegExp(pattern.split(`/`)[1], pattern.split(`/`)[2])
            if (regex.test(msg)) {
                logMessage([`MESSAGE MATCHED REGEX PATTERN:`, regex, `[Function: ${patterns[regex].name}]`])
                return patterns[regex](props, msg.split(regex))
            }
        }

        // Other bot mentions bot
        if ([`streamelements`, `pokemoncommunitygame`].includes(username)) {
            if (msg.includes(BOT_USERNAME)) {
                for (const pattern in botInteraction) {
                    const regex = new RegExp(pattern.split(`/`)[1], pattern.split(`/`)[2])
                    if (regex.test(msg)) {
                        logMessage([`${username.toUpperCase()} MATCHED REGEX PATTERN:`, regex, `[Function: ${botInteraction[regex].name}]`])
                        return botInteraction[regex](props, msg.split(regex))
                    }
                }
                logMessage([`${username.toUpperCase()} DID NOT MATCH REGEX PATTERNS`])
            }
            if (!(`points` in Object(users[BOT_USERNAME][channel])) && username === `streamelements`) {
                users[BOT_USERNAME][channel].points = 0
                return this.say(chatroom, `!points`)
            }
        }

        // Any user mentions bot
        if (/\b(@?lemony_friend|l+e+m+o+n+y*|m+e+l+o+n+|l+e+m+f+r+i+e+n+d+)\b/i.test(msg)) {
            for (const pattern in botMention) {
                const regex = new RegExp(pattern.split(`/`)[1], pattern.split(`/`)[2])
                if (regex.test(msg)) {
                    logMessage([`BOT MENTION MATCHED REGEX PATTERN:`, regex, `[Function: ${botMention[regex].name}]`])
                    return botMention[regex](props, msg.split(regex))
                }
            }
            logMessage([`BOT MENTION DID NOT MATCH REGEX PATTERNS`])
        }

        // If hangman has started, and it's the current player's turn
        const hangman = lemonyFresh[channel].hangman
        if (hangman.listening && !hangman.signup && username === hangman.players[hangman.currentPlayer]) {
            if (/^[a-z]$/i.test(msg)) { return checkLetter(props) }
            if (/^[a-z]{2,}$/i.test(msg) && msg.length === hangman.answer.length) { return checkWord(props) }
            logMessage([`NOT A HANGMAN GUESS`])
        }

        // Check for tempCmd
        if (command in tempCmds) { return useTempCmd(props) }

        // Listening for a message to be repeated by at least two other users
        if (lemonyFresh[channel].timers.streak.listening) { streakListener(props) }
        else { logMessage([`> checkStreak must wait for 'streak' cooldown`]) }

        // *** FUN NUMBER! ***
        if (user[channel].msgCount % settings.funNumberCount === 0) { return rollFunNumber(props, Math.floor(Math.random() * settings.funNumberTotal)) }

        if (minutesSinceLastMsg > 1
            && minutesSinceLastMsg >= settings.minWelcomeBackMinutes
            && minutesSinceLastMsg < settings.maxWelcomeBackMinutes
            && ![channel, ...settings.ignoredBots].includes(username)) { return welcomeBack(props) }

        if (user[channel].away && minutesSinceLastMsg > 1) { return welcomeBack(props) }

        // In case a user who isn't a bot mentions a user who is away
        if (!settings.ignoredBots.includes(username)) { reportAway(props) }
    }
}
