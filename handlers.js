const BOT_USERNAME = process.env.BOT_USERNAME

const { settings } = require(`./config`)
const { joinedChatrooms, lemonyFresh, users, lemCmds } = require(`./data`)

const useCommand = require(`./commands`)
const usePattern = require(`./patterns`)
const printLemon = require(`./commands/printLemon`)
const streakListener = require(`./commands/streaks`)
const rollFunNumber = require(`./commands/funNumber`)

const { useLemCmd } = require(`./commands/lemCmds`)
const { addToBatch } = require(`./events/notifications`)
const { sayJoinMessage } = require(`./commands/joinPart`)
const { hangmanListener } = require(`./patterns/hangman`)
const { initWebSocket, closeWebSocket } = require(`./events/webSockets`)
const { apiGetConduits, apiCreateConduit } = require(`./events/conduits`)
const { getGlobalBttvEmotes, getStreamBttvEmotes } = require(`./commands/external`)
const { handleNewChatter, welcomeBack, reportAway, funTimerGuess } = require(`./commands/conversation`)
const { apiGetTwitchChannel, getGlobalTwitchEmotes, getStreamTwitchEmotes } = require(`./commands/twitch`)
const { handleColorChange, handleSubChange, handleModChange, handleVIPChange } = require(`./commands/userChange`)
const { initUser, initUserChannel, initChannel, updateMod, getToUser, tagsListener, logMessage, appendLogs } = require(`./utils`)

function acknowledgeGigantifiedEmote(bot, chatroom, msg) {
    const emoteUsed = msg.split(` `)[msg.split(` `).length - 1]
    const emoteOwner = Object.keys(lemonyFresh).filter(key => lemonyFresh[key].followEmotes.includes(emoteUsed) || lemonyFresh[key].subEmotes.includes(emoteUsed))[0] || null
    logMessage([`> Gigantified ${emoteUsed} owner: ${emoteOwner || `unknown`}, ${BOT_USERNAME} subbed? ${!!users[BOT_USERNAME]?.channels[emoteOwner]?.sub}`])
    if (users[BOT_USERNAME]?.channels[emoteOwner]?.sub) { bot.say(chatroom, `BEEG ${emoteUsed}`) }
}

async function addSourceToKnownChannels(tags) {
    const sourceId = tags[`source-room-id`]

    if (sourceId
        && !(sourceId in settings.knownChannels)
        && !(Object.keys(lemonyFresh).map(chan => chan.id).includes(Number(sourceId)))) {
        const twitchChannel = await apiGetTwitchChannel(sourceId)
        if (!twitchChannel) {
            await logMessage([`-> Failed to get Twitch channel for knownChannels`])
            return
        }
        settings.knownChannels[sourceId] = twitchChannel.broadcaster_login
    }
}

async function getOrCreateConduit() {
    await logMessage([`> getOrCreateConduit()`])
    const conduits = await apiGetConduits()
    if (conduits.length) {
        if (conduits.length > 1) { await logMessage([`Warning: More than one conduit exists`]) }
        settings.conduitId = conduits[0].id
    } else {
        await apiCreateConduit(joinedChatrooms.length)
    }
}

module.exports = {
    onConnectedHandler(addr, port) {
        const time = new Date().toLocaleTimeString(settings.timeLocale, { timeZone: settings.timeZone })
        if (settings.firstConnection) {
            printLemon()
            logMessage([`Session started: ${settings.startDate.toLocaleDateString(`en-US`, { weekday: `long`, month: `long`, day: `numeric`, year: `numeric`, timeZone: settings.timeZone })} at ${settings.startDate.toLocaleTimeString(`en-US`, { hour: `numeric`, minute: `numeric`, second: `numeric`, timeZone: settings.timeZone, timeZoneName: `short` })}\n[${time}] 🍋 Connected to ${addr}:${port}`])
            getOrCreateConduit()
        } else {
            logMessage([`[${time}] 🍋 Re-connected to ${addr}:${port}`])
        }
        settings.firstConnection = false

        // Get global emotes
        // getGlobalTwitchEmotes()
        getGlobalBttvEmotes()
    },
    onJoinedHandler(chatroom, username, self) {
        logMessage([`${username} joined ${chatroom}`])
        const channel = chatroom.substring(1)

        if (self) {
            if (!joinedChatrooms.includes(chatroom)) {
                joinedChatrooms.push(chatroom)
            }

            // Setup channel data
            initChannel(channel)
            getStreamTwitchEmotes(channel)
            getStreamBttvEmotes(channel)

            // Say join message
            if (settings.sayJoinMessage) { sayJoinMessage(this, chatroom) }

            // Create WebSocket session
            addToBatch(channel)
            initWebSocket(this, channel)
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
            closeWebSocket(channel)
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
        const date = new Date().toLocaleString(settings.timeLocale, { timeZone: settings.timeZone })
        const timeStamp = new Date(date).toLocaleTimeString(settings.timeLocale, { timeZone: settings.timeZone })
        const color = tags.color || ``
        const username = tags.username
        if (!username) {
            logMessage([`Error: No username found`])
            return
        }

        // Compile any available metadata from Twitch
        tagsListener(tags)

        // If shared chat, check for unknown channel ID's name
        addSourceToKnownChannels(tags)

        // Log incoming message and capture message tags
        appendLogs(chatroom, tags, msg, self, timeStamp, username, color)

        // Stop listening here if shared chat, and not the origin channel
        if (`source-room-id` in tags && tags[`source-room-id`] !== tags[`room-id`]) { return }

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

        // Bot stops listening
        if (self) { return }

        // Parse args
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
            aprilFools: new Date(date).getMonth() === 3 && new Date(date).getDate() === 1
        }

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

        // Check user's first message in a given channel
        if (tags[`first-msg`]) {
            handleNewChatter(props)
            return
        }

        // Commands listener
        if (useCommand(props)) { return }

        // RegEx patterns listener
        if (usePattern(props)) { return }

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
