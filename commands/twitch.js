const BOT_USERNAME = process.env.BOT_USERNAME
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI

const { settings } = require(`../config`)
const { lemonyFresh, mods, users } = require(`../data`)
const { getContextEmote, resetCooldownTimer, getToUser, renderObj, pluralize, logMessage } = require(`../utils`)

async function apiGetTwitchAppAccessToken() {
    logMessage([`> apiGetTwitchAppAccessToken()`])
    const endpoint = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
    const options = { method: `POST` }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    logMessage([`apiGetTwitchAppAccessToken`, response.status, renderObj(twitchData, `twitchData`)])

    if (response.status === 200) {
        settings.botAccessToken = twitchData.access_token
        logMessage([`-> Access token granted successfully!`])
        return true
    } else {
        logMessage([`-> Failed to get access token`])
        return null
    }
}

async function apiGetOAUTHToken(username, authCode) {
    logMessage([`> apiGetOAUTHToken(username: ${username}, authCode: ${authCode})`])
    const requestBody = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${authCode}&grant_type=authorization_code&redirect_uri=${REDIRECT_URI}`
    const endpoint = `https://id.twitch.tv/oauth2/token`
    const options = {
        method: `POST`,
        headers: {
            'Content-Type': `application/x-www-form-urlencoded`
        },
        body: requestBody
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    logMessage([`authorizeToken`, response.status, renderObj(twitchData, `twitchData`)])

    if (response.status === 200) {
        logMessage([`-> OAUTH token granted successfully!`])
        if (username in lemonyFresh) {
            lemonyFresh[username].accessToken = twitchData.access_token
            lemonyFresh[username].refreshToken = twitchData.refresh_token
        }
        if (username in mods) {
            mods[username].accessToken = twitchData.access_token
            mods[username].refreshToken = twitchData.refresh_token
        }
        return true
    } else { return null }
}

async function apiGetTwitchUser(username, attempt = 1) {
    logMessage([`> apiGetTwitchUser(username: ${username}, attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/users?login=${username}`
    const options = {
        headers: {
            authorization: `Bearer ${settings.botAccessToken}`,
            'Client-Id': CLIENT_ID
        }
    }
    const response = await fetch(endpoint, options)
    const twitchData = await response.json()

    logMessage([
        `apiGetTwitchUser`,
        response.status,
        `data` in twitchData
            ? twitchData.data.length
                ? renderObj(twitchData.data[0], `twitchData.data[0]`)
                : `twitchData.data: []`
            : renderObj(twitchData, `twitchData`)
    ])

    if (response.status !== 200) {
        if (attempt < 3) {
            logMessage([`-> Failed to get Twitch user, attempting to get new access token...`])
            const retry = await apiGetTwitchAppAccessToken()
            if (retry) {
                attempt++
                return apiGetTwitchUser(username, attempt)
            }
        } else {
            logMessage([`-> Failed to get Twitch user after ${pluralize(attempt, `attempt`, `attempts`)}`])
            return null
        }
    } else {
        if (!twitchData.data.length) {
            logMessage([`-> No user '${username}' found`])
            return false
        }
        return twitchData.data[0]
    }
}

async function apiGetTwitchChannel(broadcasterId, attempt = 1) {
    logMessage([`> apiGetTwitchChannel(broadcasterId: ${broadcasterId}, attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/channels?broadcaster_id=${broadcasterId}`
    const options = {
        headers: {
            authorization: `Bearer ${settings.botAccessToken}`,
            'Client-Id': CLIENT_ID
        }
    }
    const response = await fetch(endpoint, options)
    const twitchData = await response.json()

    logMessage([
        `apiGetTwitchChannel`,
        response.status,
        `data` in twitchData
            ? twitchData.data.length
                ? renderObj(twitchData.data[0], `twitchData.data[0]`)
                : `twitchData.data: []`
            : renderObj(twitchData, `twitchData`)
    ])

    if (response.status === 200) {
        return twitchData.data[0]
    } else if (response.status === 401) {
        if (attempt < 3) {
            logMessage([`-> Failed to get Twitch channel, attempting to get new access token...`])
            const retry = await apiGetTwitchAppAccessToken()
            if (retry) {
                attempt++
                return apiGetTwitchChannel(broadcasterId, attempt)
            }
        } else {
            logMessage([`-> Failed to get Twitch channel after ${pluralize(attempt, `attempt`, `attempts`)}`])
            return null
        }
    } else { return null }
}

async function apiRefreshToken(username, refreshToken, attempts = 1) {
    logMessage([`> apiRefreshToken(username: ${username}, attempts: ${attempts})`])

    const endpoint = `https://id.twitch.tv/oauth2/token`
    const options = {
        method: `POST`,
        headers: {
            'Content-Type': `application/x-www-form-urlencoded`
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    logMessage([`apiRefreshToken`, response.status, renderObj(twitchData, `twitchData`)])

    if (response.status === 200) {
        if (username in lemonyFresh) {
            lemonyFresh[username].accessToken = twitchData.access_token
            lemonyFresh[username].refreshToken = twitchData.refresh_token
        }
        if (username in mods) {
            mods[username].accessToken = twitchData.access_token
            mods[username].refreshToken = twitchData.refresh_token
        }
        return true
    } else { return null }
}

async function apiShoutOut(fromId, toId, moderatorName, moderatorId, accessToken, refreshToken, attempt = 1) {
    logMessage([`> apiShoutOut(fromId: ${fromId}, toId: ${toId}, moderatorName: ${moderatorName}, moderatorId: ${moderatorId}, attempt: ${attempt})`])
    const endpoint = `https://api.twitch.tv/helix/chat/shoutouts?from_broadcaster_id=${fromId}&to_broadcaster_id=${toId}&moderator_id=${moderatorId}`
    const options = {
        method: `POST`,
        headers: {
            authorization: `Bearer ${accessToken}`,
            'Client-Id': CLIENT_ID
        }
    }
    const response = await fetch(endpoint, options)

    if (response.status === 204) {
        logMessage([`-> Shoutout posted successfully!`])
    } else {
        if (attempt < 3) {
            const twitchData = await response.json()
            logMessage([`apiShoutOut`, response.status, renderObj(twitchData, `twitchData`)])
            if (response.status === 401) {
                logMessage([`-> Unauthorized from apiShoutOut(), attempting to refresh access token...`])
                const retry = await apiRefreshToken(moderatorName, refreshToken)
                if (retry) {
                    attempt++
                    accessToken = moderatorName in mods ? mods[moderatorName].accessToken : lemonyFresh[moderatorName].accessToken
                    refreshToken = moderatorName in mods ? mods[moderatorName].refreshToken : lemonyFresh[moderatorName].refreshToken
                    return apiShoutOut(fromId, toId, moderatorName, moderatorId, accessToken, refreshToken, attempt)
                }
            } else { return null }
        } else {
            logMessage([`-> Failed to post shoutout after ${pluralize(attempt, `attempt`, `attempts`)}`])
            return null
        }
    }
}

async function apiPostAnnouncement(channel, broadcasterId, moderatorId, moderatorName, message, color, accessToken, refreshToken, attempt = 1) {
    logMessage([`> apiPostAnnouncement(channel: '${channel}', broadcasterId: ${broadcasterId}, moderatorId: ${moderatorId}, moderatorName: '${moderatorName}', message: '${message}', color: '${color}', attempt: ${attempt})`])

    const requestBody = {
        message: message,
        color: color
    }
    const endpoint = `https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${broadcasterId}&moderator_id=${moderatorId}`
    const options = {
        method: `POST`,
        headers: {
            authorization: `Bearer ${accessToken}`,
            'Client-Id': CLIENT_ID,
            'Content-Type': `application/json`
        },
        body: JSON.stringify(requestBody)
    }

    const response = await fetch(endpoint, options)
    if (response.status !== 204) {
        if (attempt < 3) {
            const twitchData = await response.json()
            logMessage([`apiPostAnnouncement`, response.status, renderObj(twitchData, `twitchData`)])
            if (response.status === 401) {
                logMessage([`-> Unauthorized from apiPostAnnouncement(), attempting to refresh access token...`])
                const retry = await apiRefreshToken(moderatorName, refreshToken)
                if (retry) {
                    attempt++
                    accessToken = moderatorName in mods ? mods[moderatorName].accessToken : lemonyFresh[moderatorName].accessToken
                    refreshToken = moderatorName in mods ? mods[moderatorName].refreshToken : lemonyFresh[moderatorName].refreshToken
                    return apiPostAnnouncement(channel, broadcasterId, moderatorId, moderatorName, message, color, accessToken, refreshToken, attempt)
                }
            } else { return null }
        } else {
            logMessage([`-> Failed to post announcement after ${pluralize(attempt, `attempt`, `attempts`)}`])
            return null
        }
    } else { return true }
}

async function apiStartPoll(channel, broadcasterId, title, arrChoices, duration, accessToken, refreshToken, attempt = 1) {
    logMessage([`> apiStartPoll(channel: '${channel}', broadcasterId: ${broadcasterId}, title: '${title}', arrChoices: ${arrChoices.length}, duration: ${duration}, attempt: ${attempt})`])

    const requestBody = {
        'broadcaster_id': broadcasterId,
        'title': title,
        'choices': arrChoices,
        'duration': duration
    }
    const endpoint = `https://api.twitch.tv/helix/polls`
    const options = {
        method: `POST`,
        headers: {
            authorization: `Bearer ${accessToken}`,
            'Client-Id': CLIENT_ID,
            'Content-Type': `application/json`
        },
        body: JSON.stringify(requestBody)
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    logMessage([
        `apiStartPoll`,
        response.status,
        `data` in twitchData
            ? twitchData.data.length
                ? renderObj(twitchData.data[0], `twitchData.data[0]`)
                : `twitchData.data: []`
            : renderObj(twitchData, `twitchData`)])

    if (response.status === 200) {
        lemonyFresh[channel].pollId = twitchData.data[0].id
        setTimeout(() => { lemonyFresh[channel].pollId = `` }, duration * 1000)
        return true
    } else if (response.status === 401) {
        if (attempt < 3) {
            logMessage([`-> Unauthorized from apiStartPoll(), attempting to refresh access token...`])
            const retry = await apiRefreshToken(channel, refreshToken)
            if (retry) {
                attempt++
                accessToken = lemonyFresh[channel].accessToken
                refreshToken = lemonyFresh[channel].refreshToken
                return apiStartPoll(channel, broadcasterId, title, arrChoices, duration, accessToken, refreshToken, attempt)
            }
        } else {
            logMessage([`-> Failed to start poll after ${pluralize(attempt, `attempt`, `attempts`)}`])
            return null
        }
    } else { return null }
}

async function apiEndPoll(channel, broadcasterId, pollId, status, accessToken, refreshToken, attempt = 1) {
    logMessage([`channel: ${channel}, broadcasterId: ${broadcasterId}, pollId: ${pollId}, status: ${status}, attempt: ${attempt}`])
    const endpoint = `https://api.twitch.tv/helix/polls?broadcaster_id=${broadcasterId}&id=${pollId}&status=${status}`
    const options = {
        method: `PATCH`,
        headers: {
            authorization: `Bearer ${accessToken}`,
            'Client-Id': CLIENT_ID
        }
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    logMessage([`apiEndPoll`, response.status, renderObj(twitchData.data[0], `twitchData.data[0]`)])

    if (response.status === 200) {
        lemonyFresh[channel].pollId = ``
        return true
    } else if (response.status === 401) {
        if (attempt < 3) {
            logMessage([`-> Unauthorized from apiEndPoll(), attempting to refresh access token...`])
            const retry = await apiRefreshToken(channel, refreshToken)
            if (retry) {
                attempt++
                accessToken = lemonyFresh[channel].accessToken
                refreshToken = lemonyFresh[channel].refreshToken
                return apiEndPoll(channel, broadcasterId, pollId, status, accessToken, refreshToken, attempt)
            }
        } else {
            logMessage([`-> Failed to end poll after ${pluralize(attempt, `attempt`, `attempts`)}`])
            return null
        }
    } else { return null }
}

async function apiBanUsers(broadcasterId, moderatorName, moderatorId, arrUsers, reason, accessToken, refreshToken, attempt = 1) {
    logMessage([`> apiBanUsers(broadcasterId: ${broadcasterId}, moderatorName: ${moderatorName}, moderatorId: ${moderatorId}, arrUsers: ${arrUsers.length}, attempt: ${attempt})`])

    // Look up/ban each user one-by-one
    const endpoint = `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${broadcasterId}&moderator_id=${moderatorId}`
    const banned = []
    const alreadyBanned = []

    for (const name of arrUsers) {
        const userToBan = getToUser(name) // sanitize name to remove possible @ and caps
        const twitchUser = userToBan in users
            ? users[userToBan]
            : await apiGetTwitchUser(userToBan)
        if (!twitchUser.id) { return false }

        const requestBody = {
            'data': {
                user_id: `${twitchUser.id}`,
                reason: reason
            }
        }
        const options = {
            method: `POST`,
            headers: {
                authorization: `Bearer ${accessToken}`,
                'Client-Id': CLIENT_ID,
                'Content-Type': `application/json`
            },
            body: JSON.stringify(requestBody)
        }

        const response = await fetch(endpoint, options)
        const twitchData = await response.json()
        logMessage([`apiBanUsers`,
            response.status,
            `data` in twitchData
                ? twitchData.data.length
                    ? renderObj(twitchData.data[0],
                        `twitchData.data[0]`)
                    : `twitchData.data: []`
                : renderObj(twitchData, `twitchData`)
        ])

        if (response.status === 200) {
            banned.push(userToBan)
        } else if (response.status === 400 && twitchData.message === `The user specified in the user_id field is already banned.`) {
            alreadyBanned.push(userToBan)
        } else if (response.status === 401) {
            if (attempt < 3) {
                logMessage([`-> Unauthorized from apiBanUsers(), attempting to refresh access token...`])
                const retry = await apiRefreshToken(moderatorName, refreshToken)
                if (retry) {
                    attempt++
                    accessToken = moderatorName in mods ? mods[moderatorName].accessToken : lemonyFresh[moderatorName].accessToken
                    refreshToken = moderatorName in mods ? mods[moderatorName].refreshToken : lemonyFresh[moderatorName].refreshToken
                    return apiBanUsers(broadcasterId, moderatorName, moderatorId, arrUsers, reason, accessToken, refreshToken, attempt)
                }
            } else {
                logMessage([`-> Failed to ban user after ${pluralize(attempt, `attempt`, `attempts`)}`])
                return null
            }
        } else { return null }
    }

    return { banned: banned, alreadyBanned: alreadyBanned }
}

module.exports = {
    apiGetTwitchAppAccessToken,
    apiGetTwitchUser,
    apiGetTwitchChannel,
    accessInstructions(props) {
        const { bot, chatroom, username } = props
        logMessage([`> accessInstructions(chatroom: '${chatroom}', username: '${username}')`])
        const reply = `For streamers/mods, please follow this link and instructions, and copy/paste "!authorize <code>" in the chat! ${REDIRECT_URI}`
        bot.say(chatroom, reply)
    },
    async getBotToken(props) {
        const { bot, chatroom } = props
        const success = await apiGetTwitchAppAccessToken()
        const positiveEmote = getContextEmote(`positive`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)

        const reply = success
            ? `Token updated! ${positiveEmote}`
            : `Error updating app access token! ${negativeEmote}`
        bot.say(chatroom, reply)
    },
    async startPoll(props) {
        const { bot, chatroom, args, channel, username, isMod } = props
        const str = args.join(` `)
        logMessage([`> startPoll(channel: '${channel}', username: ${username}, str: '${str}', isMod: ${isMod})`])

        // Mods only
        if (!isMod) {
            logMessage([`-> ${username} isn't a mod, ignoring`])
            return
        }

        // Check for poll already in progress
        const negativeEmote = getContextEmote(`negative`, channel)
        if (lemonyFresh[channel].pollId) {
            bot.say(chatroom, `There is already a poll in progress! ${negativeEmote}`)
            return
        }

        // Get duration
        const params = str.split(new RegExp(/ ?\/ ?/))
        const seconds = params.shift()
        let duration = Number(seconds)
        if ([`<`, `>`].some(bracket => seconds.includes(bracket))) {
            const regex = /^<(\d+)>$/
            if (!seconds.match(regex)) {
                const neutralEmote = getContextEmote(`neutral`, channel)
                bot.say(chatroom, `Error: Please don't use angle brackets in the seconds! ${neutralEmote}`)
                return
            }
            else { duration = Number(seconds.split(regex)[1]) }

        }
        if (isNaN(duration) || duration < 15 || duration > 1800) {
            bot.say(chatroom, `Error: Duration should be a number between 15 and 1800, followed by a slash. Try: !poll <seconds> / Title of poll / First choice / Second choice ...`)
            return
        }

        // Get title and choices
        const title = params.shift()
        // Params length should be more than 2, and shouldn't be longer than 6
        if (params.length < 2 || params.length > 5) {
            bot.say(chatroom, `Error: Between 2-5 choices are allowed. Try: !poll <seconds> / Title of poll / First choice / Second choice ...`)
            return
        }
        const arrChoices = params.map(choice => { return { title: choice } })

        // Use broadcaster's access token
        const broadcasterId = lemonyFresh[channel].id
        const accessToken = lemonyFresh[channel].accessToken
        const refreshToken = lemonyFresh[channel].refreshToken

        // Stop if the channel has no access token
        if (!accessToken || !refreshToken) {
            logMessage([`-> ${channel} has no access and/or refresh token, can't make create poll`])
            bot.say(chatroom, `No access token found for ${channel in users ? users[channel].displayName : channel}'s channel! ${negativeEmote} Please use !access to renew your credentials!`)
            return
        }

        const positiveEmote = getContextEmote(`positive`, channel)
        const success = await apiStartPoll(channel, broadcasterId, title, arrChoices, duration, accessToken, refreshToken)
        const reply = success
            ? `Poll created, go vote! ${positiveEmote}`
            : `Error creating poll! ${negativeEmote}`
        bot.say(chatroom, reply)
    },
    async endPoll(props) {
        const { bot, chatroom, command, channel, username, isMod } = props
        const status = command === `!endpoll` ? `TERMINATED` : command === `!cancelpoll` ? `ARCHIVED` : null
        logMessage([`> pollEnd(chatroom: '${chatroom}', status: '${status}')`])

        // Mods only
        if (!isMod) {
            logMessage([`-> ${username} isn't a mod, ignoring`])
            return
        }

        // Check whether poll is currently running
        const negativeEmote = getContextEmote(`negative`, channel)
        if (!lemonyFresh[channel].pollId) {
            bot.say(chatroom, `There is no active poll! ${negativeEmote}`)
            return
        }

        // Determine whether to get rid of poll, or bring it to an end
        const neutralEmote = getContextEmote(`neutral`, channel)
        if (!status) {
            bot.say(chatroom, `Use !stoppoll to finish and show the results, or !cancelpoll to remove it! ${neutralEmote}`)
            return
        }

        const broadcasterId = lemonyFresh[channel].id
        const pollId = lemonyFresh[channel].pollId
        const accessToken = lemonyFresh[channel].accessToken
        const refreshToken = lemonyFresh[channel].refreshToken

        const positiveEmote = getContextEmote(`positive`, channel)
        const success = await apiEndPoll(channel, broadcasterId, pollId, status, accessToken, refreshToken)
        const reply = success
            ? `Poll ${status === `TERMINATED` ? `finished` : `was canceled`}! ${positiveEmote}`
            : `Error ending poll! ${negativeEmote}`
        bot.say(chatroom, reply)
    },
    async handleShoutout(props) {
        const { bot, chatroom, channel, username, toUser, isMod, isModOrVIP } = props
        logMessage([`> newShoutOut(channel: '${channel}', username: ${username}, toUser: ${toUser}, isMod: ${isMod}, isModOrVIP: ${isModOrVIP})`])

        if (!isModOrVIP) {
            logMessage([`-> ${username} isn't a mod or VIP, ignoring`])
            return
        }
        // Stop if no user specified
        if (!toUser) {
            logMessage([`-> No user specified to give a shoutout to`])
            return
        }

        if (lemonyFresh[channel].timers[`!so`].listening) {
            resetCooldownTimer(channel, `!so`)

            // Stop if user doesn't exist
            const twitchUser = await apiGetTwitchUser(toUser)
            if (!twitchUser) {
                logMessage([`-> No user '${toUser}' found, exiting newShoutOut function`])
                bot.say(chatroom, `No user ${toUser} was found! :O`)
                return
            }

            const stream = await apiGetTwitchChannel(twitchUser.id)
            if (!stream) {
                logMessage([`-> Failed to fetch ${toUser}'s channel, exiting newShoutOut function`])
                bot.say(chatroom, `Failed to fetch ${toUser}'s stream information! :O`)
                return
            }
            const neutralEmote = getContextEmote(`neutral`, channel)
            const reply = `Let's give a shoutout to ${stream.broadcaster_name}! ${stream.game_name
                ? `They were last ${stream.game_name === `Just Chatting`
                    ? `chatting with viewers`
                    : `playing ${stream.game_name}`}${twitchUser.broadcaster_type
                        ? `, and are a Twitch ${twitchUser.broadcaster_type.substring(0, 1).toUpperCase() + twitchUser.broadcaster_type.substring(1)}!`
                        : `.`}`
                : `#NoGameGang`
                } Follow them here: https://www.twitch.tv/${stream.broadcaster_login} ${neutralEmote}`

            bot.say(chatroom, reply)

            // Mods only - Twitch official shoutout
            if (isMod) {
                if (channel === toUser) {
                    logMessage([`-> Can't give Twitch official shoutout to ${channel}`])
                    return
                }

                const fromId = lemonyFresh[channel].id
                const toId = twitchUser.id

                // If moderator doesn't have a token, use broadcaster's
                const moderatorHasToken = username in mods && mods[username].isModIn.includes(chatroom) && !!mods[username].accessToken && !!mods[username].refreshToken
                const moderatorName = moderatorHasToken ? username : channel
                const moderatorId = moderatorHasToken ? mods[username].id : lemonyFresh[channel].id
                const accessToken = moderatorHasToken ? mods[username].accessToken : lemonyFresh[channel].accessToken
                const refreshToken = moderatorHasToken ? mods[username].refreshToken : lemonyFresh[channel].refreshToken

                // Stop if neither the channel nor a mod has an access token
                if (!accessToken || !refreshToken) {
                    logMessage([`-> ${moderatorName} has no access and/or refresh token, can't give shoutout`])
                    return
                }
                apiShoutOut(fromId, toId, moderatorName, moderatorId, accessToken, refreshToken)
            }

        } else { logMessage([`-> Timer in ${channel} '!so' is not currently listening`]) }
    },
    async makeAnnouncement(props) {
        const { bot, chatroom, args, command, channel, username, isMod } = props
        const message = args.join(` `)
        const commandSuffix = command.split(/^!announce([a-z]*)$/)[1]
        const color = [`blue`, `green`, `orange`, `purple`].includes(commandSuffix) ? commandSuffix : `primary`
        logMessage([`> newMakeAnnouncement(channel: '${channel}', username: '${username}', isMod: ${isMod}, message: '${message}', color: '${color}')`])

        if (!isMod) {
            logMessage([`-> ${username} isn't a mod, ignoring`])
            return
        }

        const negativeEmote = getContextEmote(`negative`, channel)
        if (!message) {
            bot.say(chatroom, `No announcement message provided! ${negativeEmote}`)
            return
        }

        const broadcasterId = lemonyFresh[channel].id
        // If moderator doesn't have a token, use broadcaster's
        const moderatorHasToken = username in mods && mods[username].isModIn.includes(chatroom) && !!mods[username].accessToken && !!mods[username].refreshToken
        const moderatorName = moderatorHasToken ? username : channel
        const moderatorId = moderatorHasToken ? mods[username].id : lemonyFresh[channel].id
        const accessToken = moderatorHasToken ? mods[username].accessToken : lemonyFresh[channel].accessToken
        const refreshToken = moderatorHasToken ? mods[username].refreshToken : lemonyFresh[channel].refreshToken

        // Stop if neither the channel nor a mod has an access token
        if (!accessToken || !refreshToken) {
            logMessage([`-> ${moderatorName} has no access and/or refresh token, can't make announcement`])
            bot.say(chatroom, `No access token found! ${negativeEmote} Please use !access to renew your credentials!`)
            return
        }

        const success = apiPostAnnouncement(channel, broadcasterId, moderatorId, moderatorName, message, color, accessToken, refreshToken)
        if (!success) { bot.say(chatroom, `Failed to post announcement! ${negativeEmote}`) }
    },
    async authorizeToken(props) {
        const { bot, chatroom, args, username, channel, isLemonyFreshMember } = props
        logMessage([`> authorizeToken(channel: '${channel}', username: '${username}', isLemonyFreshMember: ${isLemonyFreshMember})`])

        // Can only be used by a streamer or mod
        if (!isLemonyFreshMember && !(username in mods)) {
            logMessage([`-> ${username} is neither a known streamer nor mod, ignoring`])
            return
        }

        const authCode = args[0]
        if (!authCode) {
            logMessage([`-> No authorization code provided`])
            return
        }

        const hypeEmote = getContextEmote(`hype`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)

        const success = await apiGetOAUTHToken(username, authCode)
        const reply = success
            ? `Access token was granted! ${hypeEmote}`
            : `Failed to grant access token! ${negativeEmote}`
        bot.say(chatroom, reply)
    },
    async banUsers(props) {
        const { bot, chatroom, args, channel, username, isMod } = props
        logMessage([`> newBanUsers(channel: '${channel}', username: '${username}', isMod: ${isMod}, args: '${args.join(`', '`)}')`])

        // Mods only
        if (!isMod) {
            logMessage([`-> ${username} isn't a mod, ignoring`])
            return
        }

        // Make sure at least one user was listed
        if (args.length === 0) {
            logMessage([`-> No users provided to ban`])
            return
        }

        // If moderator doesn't have a token, use broadcaster's
        const moderatorHasToken = username in mods && mods[username].isModIn.includes(chatroom) && !!mods[username].accessToken && !!mods[username].refreshToken
        const moderatorName = moderatorHasToken ? username : channel
        const moderatorId = moderatorHasToken ? mods[username].id : lemonyFresh[channel].id
        const accessToken = moderatorHasToken ? mods[username].accessToken : lemonyFresh[channel].accessToken
        const refreshToken = moderatorHasToken ? mods[username].refreshToken : lemonyFresh[channel].refreshToken

        const broadcasterId = lemonyFresh[channel].id
        const negativeEmote = getContextEmote(`negative`, channel)

        // Stop if neither the channel nor a mod has an access token
        if (!accessToken || !refreshToken) {
            logMessage([`-> ${moderatorName} has no access and/or refresh token, can't make announcement`])
            bot.say(chatroom, `No access token found! ${negativeEmote} Please use !access to renew your credentials!`)
            return
        }

        // Please wait if list will take a moment to process
        if (args.length >= 5) { bot.say(chatroom, `Please wait while I work on this list of ${args.length.toLocaleString()} usernames...`) }

        const reason = `Banned by ${username} via ${BOT_USERNAME}`
        const success = await apiBanUsers(broadcasterId, moderatorName, moderatorId, args, reason, accessToken, refreshToken)

        if (!success) {
            bot.say(chatroom, `Failed to ban ${args.length === 1 ? `user` : `users`}! ${negativeEmote}`)
        } else {
            const { banned, alreadyBanned } = success
            const positiveEmote = getContextEmote(`positive`, channel)
            const reply = `Banned ${pluralize(banned.length, `user`, `users`)}${banned.length
                ? `: ${banned.join(`, `)} ${positiveEmote}`
                : `! ${negativeEmote}`
                }${alreadyBanned.length ? ` Already banned: ${alreadyBanned.join(`, `)}` : ``}`
            bot.say(chatroom, reply)
        }
    },
    async autoBanUser(props) {
        const { bot, chatroom, username, channel } = props
        logMessage([`> newAutoBanUser(channel: '${channel}', username: '${username}')`])

        const broadcasterId = lemonyFresh[channel].id
        const accessToken = lemonyFresh[channel].accessToken
        const refreshToken = lemonyFresh[channel].refreshToken

        const greetingEmote = getContextEmote(`greeting`, channel)
        const negativeEmote = getContextEmote(`negative`, channel)
        const dumbEmote = getContextEmote(`dumb`, channel)

        // Stop if the channel doesn't have an access token
        if (!accessToken || !refreshToken) {
            logMessage([`-> ${channel} has no access token, can't autoban user '${username}'`])
            const reply = `Hi, ${users[username].displayName}... ${lemonyFresh[channel].bttvEmotes.includes(`modCheck`) ? `modCheck` : `${dumbEmote}`} Any mods in chat?`
            bot.say(chatroom, reply)
            return
        }

        const reason = `Auto-banned by ${BOT_USERNAME} for message content`
        const success = await apiBanUsers(broadcasterId, channel, broadcasterId, [username], reason, accessToken, refreshToken)

        if (success) {
            delete users[username]
            const reply = `Begone, spammer! ${greetingEmote}`
            bot.say(chatroom, reply)
        } else if (success === null) {
            bot.say(chatroom, `Failed to autoban user! ${negativeEmote} Please update ${channel in users ? users[channel].displayName : channel}'s credentials by using !access again!`)
        } else {
            bot.say(chatroom, `Failed to autoban user! ${dumbEmote}`)
        }
    }
}
