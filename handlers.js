const DEV = process.env.DEV
const BOT_USERNAME = process.env.BOT_USERNAME
const BOT_NICKNAME_REGEX = process.env.BOT_NICKNAME_REGEX

const dev = require(`./commands/dev`)
const commands = require(`./commands`)
const patterns = require(`./patterns`)
const botMention = require(`./patterns/botMention`)
const printLemon = require(`./commands/printLemon`)
const botInteraction = require(`./patterns/botInteraction`)

const { settings } = require(`./config`)
const { lemonyFresh, users, lemCmds } = require(`./data`)

const { useLemCmd } = require(`./commands/lemCmds`)
const { streakListener } = require(`./commands/streaks`)
const { rollFunNumber } = require(`./commands/funNumber`)
const { sayJoinMessage } = require(`./commands/joinPart`)
const { checkWord, checkLetter } = require(`./patterns/hangman`)
const { registerWebSocket, initWebSocket, closeWebSocket } = require(`./events`)
const { getGlobalBttvEmotes, getStreamBttvEmotes } = require(`./commands/external`)
const { handleNewChatter, welcomeBack, reportAway, funTimerGuess } = require(`./commands/conversation`)
const { apiGetTwitchChannel, getGlobalTwitchEmotes, getStreamTwitchEmotes } = require(`./commands/twitch`)
const { handleColorChange, handleSubChange, handleModChange, handleVIPChange } = require(`./commands/userChange`)
const { initUser, initUserChannel, initChannel, updateMod, getToUser, tagsListener, logMessage, acknowledgeGigantifiedEmote, appendLogs } = require(`./utils`)

function devCommandUsed(props) {
    const { username, command } = props
    if (username === DEV) {
        if (command in dev) {
            logMessage([`MATCHED DEV COMMAND:`, command, `[Function: ${dev[command].name}]`])
            dev[command](props)
            return true
        }
    }
    return false
}

function commandUsed(props) {
    const { message, command } = props
    if (message.startsWith(`!`)) {
        if (command in commands) {
            logMessage([`MATCHED COMMAND:`, command, `[Function: ${commands[command].name}]`])
            commands[command](props)
            return true
        } else if (/!.+lemon/i.test(command) in lemCmds) { logMessage([`COMMAND NOT RECOGNIZED`]) }
    }
    return false
}

function regexMatch(props) {
    const { message } = props
    for (const pattern in patterns) {
        const regex = new RegExp(pattern.split(`/`)[1], pattern.split(`/`)[2])
        if (regex.test(message)) {
            logMessage([`MESSAGE MATCHED REGEX PATTERN:`, regex, `[Function: ${patterns[regex].name}]`])
            patterns[regex](props, message.split(regex))
            return true
        }
    }
    return false
}

function botMentionedByBot(props) {
    const { bot, chatroom, username, message, channel } = props
    if ([`streamelements`, `pokemoncommunitygame`].includes(username)) {
        if (message.includes(BOT_USERNAME)) {
            for (const pattern in botInteraction) {
                const regex = new RegExp(pattern.split(`/`)[1], pattern.split(`/`)[2])
                if (regex.test(message)) {
                    logMessage([`${username.toUpperCase()} MATCHED REGEX PATTERN:`, regex, `[Function: ${botInteraction[regex].name}]`])
                    botInteraction[regex](props, message.split(regex))
                    return true
                }
            }
            logMessage([`${username.toUpperCase()} DID NOT MATCH REGEX PATTERNS`])
        }
        if (!(`points` in Object(users[BOT_USERNAME].channels[channel])) && username === `streamelements`) {
            users[BOT_USERNAME].channels[channel].points = 0
            bot.say(chatroom, `!points`)
            return true
        }
    }
    return false
}

function botMentioned(props) {
    const { message } = props
    if (RegExp(`\\b${BOT_NICKNAME_REGEX}\\b`, `i`).test(message)) {
        for (const pattern in botMention) {
            const regex = new RegExp(pattern.split(`/`)[1], pattern.split(`/`)[2])
            if (regex.test(message)) {
                logMessage([`BOT MENTION MATCHED REGEX PATTERN:`, regex, `[Function: ${botMention[regex].name}]`])
                botMention[regex](props, message.split(regex))
                return true
            }
        }
        logMessage([`BOT MENTION DID NOT MATCH REGEX PATTERNS`])
    }
    return false
}

function hangmanListener(props) {
    const { message, channel, username } = props
    const hangman = lemonyFresh[channel].hangman
    if (hangman.listening && !hangman.signup && username === hangman.players[hangman.currentPlayer]) {
        if (/^[a-z]$/i.test(message)) {
            checkLetter(props)
            return true
        }
        if (/^[a-z]{2,}$/i.test(message) && message.length === hangman.answer.length) {
            checkWord(props)
            return true
        }
        logMessage([`NOT A HANGMAN GUESS`])
    }
    return false
}

async function addToKnownChannels(broadcasterId) {
    const twitchChannel = await apiGetTwitchChannel(broadcasterId)
    if (!twitchChannel) {
        await logMessage([`-> Failed to get Twitch channel for knownChannels`])
        return
    }
    settings.knownChannels[broadcasterId] = twitchChannel.broadcaster_login
}

module.exports = {
    onConnectedHandler(addr, port) {
        settings.firstConnection && printLemon()
        settings.firstConnection && logMessage([`Session started: ${settings.startDate.toLocaleDateString(`en-US`, { weekday: `long`, month: `long`, day: `numeric`, year: `numeric`, timeZone: settings.timeZone })} at ${settings.startDate.toLocaleTimeString(`en-US`, { hour: `numeric`, minute: `numeric`, second: `numeric`, timeZone: settings.timeZone, timeZoneName: `short` })}`])
        const time = new Date().toLocaleTimeString(settings.timeLocale, { timeZone: settings.timeZone })
        settings.firstConnection
            ? logMessage([`[${time}] 🍋 Connected to ${addr}:${port}`])
            : logMessage([`[${time}] 🍋 Re-connected to ${addr}:${port}`])
        settings.firstConnection = false
        // getGlobalTwitchEmotes()
        getGlobalBttvEmotes()
    },
    onJoinedHandler(chatroom, username, self) {
        logMessage([`${username} joined ${chatroom}`])
        const channel = chatroom.substring(1)

        if (self) {
            // Setup channel data
            initChannel(channel)
            getStreamTwitchEmotes(channel)
            getStreamBttvEmotes(channel)

            // Say join message
            if (settings.sayJoinMessage) { sayJoinMessage(this, chatroom) }

            // Check to create or update WebSocket session
            registerWebSocket(channel)
            lemonyFresh[channel].webSocketSessionId
                ? updateEventSubs(channel)
                : initWebSocket(this, chatroom, channel)
        }

        if (!lemonyFresh[channel].viewers.includes(username)) {
            lemonyFresh[channel].viewers.push(username)
        }
    },
    onPartedHandler(chatroom, username, self) {
        logMessage([`${username} parted from ${chatroom}`])
        const channel = chatroom.substring(1)

        // Close WebSocket connection
        if (self) {
            if (lemonyFresh[channel].webSocketSessionId) { closeWebSocket(channel) }
            lemonyFresh[channel].webSocketSessionId = ``
        }

        while (lemonyFresh[channel].viewers.includes(username)) {
            lemonyFresh[channel].viewers.splice(lemonyFresh[channel].viewers.indexOf(username), 1)
        }
    },
    onWhisperHandler(fromRoom, tags, message, err) {
        if (err) {
            console.log(err)
            return
        }
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
        appendLogs(chatroom, tags, msg, self, time, username, color)
        tagsListener(tags)

        // If shared chat, check for unknown channel ID's name
        const originChat = !(`source-room-id` in tags) || (`source-room-id` in tags && tags[`room-id`] === tags[`source-room-id`])
        if (!originChat
            && !(tags[`source-room-id`] in settings.knownChannels)
            && !(Object.keys(lemonyFresh).map(chan => chan.id).includes(Number(tags[`source-room-id`])))) {
            addToKnownChannels(tags[`source-room-id`])
        }

        // If shared chat, stop listening here if not the origin channel
        if (!originChat) { return }

        // Initialize new user
        if (!(username in users)) { initUser(this, chatroom, tags, self) }

        // Add mod/update isModIn list
        if (tags.mod) { updateMod(chatroom, tags, self, username) }

        // Initialize user in a new chatroom
        if (!(channel in users[username].channels)) { initUserChannel(tags, username, channel) }

        const currentTime = Number(tags[`tmi-sent-ts`]) || Date.now()
        const userChannel = users[username].channels[channel]
        userChannel.msgCount++
        userChannel.lastMessage = msg
        userChannel.sentAt = currentTime

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
            userChannel: userChannel,
            userNickname: users[username].nickname || users[username].displayName,
            toUser: toUser,
            target: users?.[toUser] || null,
            targetNickname: users?.[toUser]?.nickname || users?.[toUser]?.displayName || null,
            aprilFools: new Date(currentTime).getMonth() === 3 && new Date(currentTime).getDate() === 1
        }

        // Bot stops listening
        if (self) { return }

        // User attribute change detection
        const subChange = userChannel.sub !== tags.subscriber
        const modChange = userChannel.mod !== tags.mod
        const vipChange = userChannel.vip !== (!!tags.vip || !!tags.badges?.vip)
        const colorChange = tags.color !== users[username].color && users[username].color !== ``
        if (subChange) { handleSubChange(props) }
        if (modChange) { handleModChange(props) }
        if (vipChange) { handleVIPChange(props) }
        if (colorChange) { handleColorChange(props) }

        // Acknowledge gigantified emote
        if (tags[`msg-id`] === `gigantified-emote-message`) {
            acknowledgeGigantifiedEmote(this, chatroom, msg)
            return
        }

        // Acknowledge highlighted message
        if (tags[`msg-id`] === `highlighted-message`) { logMessage([`This was a highlighted message`]) }

        // Commands listener
        if (devCommandUsed(props)) { return }
        if (commandUsed(props)) { return }

        // Check user's first message in a given channel
        if (tags[`first-msg`]) {
            handleNewChatter(props)
            return
        }

        // General regex patterns
        if (regexMatch(props)) { return }

        // Other bot mentions bot
        if (botMentionedByBot(props)) { return }

        // Any user mentions bot
        if (botMentioned(props)) { return }

        // User is the funTimerGuesser and making an attempt
        if (lemonyFresh[channel].funTimerGuesser === username && /\b\d+\b/.test(msg)) {
            funTimerGuess(props)
            return
        }

        // If hangman has started, and it's the current player's turn
        if (hangmanListener(props)) { return }

        // Check for lemonCommand
        if (command in lemCmds) {
            useLemCmd(props)
            return
        }

        // Listening for a message to be repeated by at least two other users
        if (lemonyFresh[channel].timers.streak.listening) { streakListener(props) }
        else { logMessage([`> checkStreak must wait for 'streak' cooldown`]) }

        // *** FUN NUMBER! ***
        if (userChannel.msgCount % settings.funNumberCount === 0) {
            rollFunNumber(props, Math.floor(Math.random() * settings.funNumberTotal))
            return
        }

        // Checking whether enough time has passed to welcome back
        const minutesSinceLastMsg = (currentTime - userChannel.sentAt) / 60000
        if (minutesSinceLastMsg > 1
            && minutesSinceLastMsg >= settings.minWelcomeBackMinutes
            && minutesSinceLastMsg < settings.maxWelcomeBackMinutes
            && ![channel, ...settings.ignoredBots].includes(username)) {
            welcomeBack(props)
            return
        }

        if (userChannel.away && minutesSinceLastMsg > 1) {
            welcomeBack(props)
            return
        }

        // In case a user who isn't a bot mentions a user who is away
        if (!settings.ignoredBots.includes(username)) {
            reportAway(props)
            return
        }
    }
}
