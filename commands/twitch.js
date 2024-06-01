const BOT_USERNAME = process.env.BOT_USERNAME
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI

const { lemonyFresh, mods, users } = require(`../data`)
const { getNeutralEmote, getHypeEmote, getPositiveEmote, getNegativeEmote, getGreetingEmote, getDumbEmote, resetCooldownTimer, getToUser, renderObj, pluralize, logMessage } = require(`../utils`)

async function getBotToken(props, replyWanted = true) {
    const { bot, chatroom, channel, isLemonyFreshMember } = props
    logMessage([`> getBotToken(channel: '${channel}')`])

    // Streamers and mods only
    if (!isLemonyFreshMember && !(username in mods)) {
        logMessage([`-> ${username} isn't a streamer or mod, ignoring`])
        return
    }

    const hypeEmote = getHypeEmote(channel)
    const negativeEmote = getNegativeEmote(channel)

    const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
    const response = await fetch(url, { method: `POST` })
    const twitchData = await response.json()
    logMessage([`getBotToken`, response.status, renderObj(twitchData, `twitchData`)])

    if (response.status === 200) {
        lemonyFresh.botAccessToken = twitchData.access_token
        if (replyWanted) { bot.say(chatroom, `Updated! My new token expires in ~${Math.round(twitchData.expires_in / 1000 / 60)} minutes! ${hypeEmote}`) }
    } else {
        if (replyWanted) {
            bot.say(chatroom, `Error updating app access token! ${negativeEmote}${twitchData?.message || ``}`)
        }
    }
}

async function getTwitchUser(props) {
    const { bot, chatroom, channel, username } = props
    logMessage([`> getTwitchUser(chatroom: '${chatroom}', username: '${username}')`])

    const endpoint = `https://api.twitch.tv/helix/users?login=${username}`
    const options = {
        headers: {
            authorization: `Bearer ${lemonyFresh.botAccessToken}`,
            'Client-Id': CLIENT_ID
        }
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    logMessage([`getTwitchUser`, response.status, `data` in twitchData ? twitchData.data.length ? renderObj(twitchData.data[0], `twitchData.data[0]`) : `twitchData.data: []` : renderObj(twitchData, `twitchData`)])

    const negativeEmote = getNegativeEmote(channel)
    if (response.status !== 200) {
        if (twitchData.error === `Unauthorized`) {
            // bot.say(chatroom, `Hold on, I need to refresh my token...`)
            logMessage([`-> Unauthorized from getTwitchUser(), attempting to refresh bot's token...`])
            await getBotToken(props, false)
            options.headers.authorization = `Bearer ${lemonyFresh.botAccessToken}`
            const finalAttempt = await fetch(endpoint, options)
            const finalAttemptData = await finalAttempt.json()
            logMessage([`getTwitchUser`, finalAttempt.status, `data` in finalAttemptData ? finalAttemptData.length ? renderObj(finalAttemptData.data[0], `finalAttemptData.data[0]`) : `finalAttemptData.data: []` : renderObj(finalAttemptData, `finalAttemptData`)])
            if (finalAttempt.status === 200) {
                return finalAttemptData.data[0]
            } else {
                bot.say(chatroom, `Error: ${finalAttemptData.message} ${negativeEmote}`)
                return finalAttemptData
            }
        }
    } else if (twitchData.data.length === 0) {
        bot.say(chatroom, `No user ${username} was found! ${negativeEmote}`)
    } else {
        return twitchData.data[0]
    }
}

async function refreshToken(props, replyWanted = true) {
    const { bot, chatroom, channel, username, toUser } = props
    const userOrChannel = toUser === channel ? channel : username
    logMessage([`> refreshToken(chatroom: '${chatroom}', userOrChannel: '${userOrChannel}', replyWanted: ${replyWanted})`])

    const refreshToken = userOrChannel === channel ? lemonyFresh[userOrChannel].refreshToken : mods[userOrChannel]?.refreshToken || lemonyFresh[userOrChannel]?.refreshToken
    const neutralEmote = getNeutralEmote(channel)
    if (!refreshToken && replyWanted) { return bot.say(chatroom, `${userOrChannel} is unauthorized! Please use !access and follow the instructions ${neutralEmote}`) }

    const endpoint = `https://id.twitch.tv/oauth2/token`
    const requestBody = `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    const options = {
        method: `POST`,
        headers: {
            'Content-Type': `application/x-www-form-urlencoded`
        },
        body: requestBody
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    logMessage([`refreshToken`, response.status, renderObj(twitchData, `twitchData`)])

    const hypeEmote = getHypeEmote(channel)
    const negativeEmote = getNegativeEmote(channel)
    if (response.status === 200) {
        if (userOrChannel in lemonyFresh) {
            lemonyFresh[userOrChannel].accessToken = twitchData.access_token
            lemonyFresh[userOrChannel].refreshToken = twitchData.refresh_token
        }
        if (userOrChannel in mods) {
            mods[userOrChannel].accessToken = twitchData.access_token
            mods[userOrChannel].refreshToken = twitchData.refresh_token
        }
        logMessage([`-> Token refreshed successfully!`])
        if (replyWanted) { bot.say(chatroom, `Successfully updated ${userOrChannel}'s token! ${hypeEmote}`) }
    } else {
        bot.say(chatroom, `Error refreshing ${userOrChannel}'s token! ${negativeEmote} Please use !access to renew your credentials!`)
    }
}

async function getTwitchChannel(bot, chatroom, broadcaster_id) {
    logMessage([`> getTwitchChannel(broadcaster_id: ${broadcaster_id})`])

    const endpoint = `https://api.twitch.tv/helix/channels?broadcaster_id=${broadcaster_id}`
    const options = {
        headers: {
            authorization: `Bearer ${lemonyFresh.botAccessToken}`,
            'Client-Id': CLIENT_ID
        }
    }

    const response = await fetch(endpoint, options)
    const twitchData = await response.json()
    logMessage([`getTwitchChannel`, response.status, `data` in twitchData ? twitchData.data.length ? renderObj(twitchData.data[0], `twitchData.data[0]`) : `twitchData.data: []` : renderObj(twitchData, `twitchData`)])

    const channel = chatroom.substring(1)
    if (response.status !== 200) { return bot.say(chatroom, `${twitchData?.message || `There was a problem getting the channel info!`} ${getNegativeEmote(channel)}`) }
    return twitchData.data[0]
}

module.exports = {
    getBotToken,
    getTwitchUser,
    refreshToken,
    getTwitchChannel,
    async pollEnd(props) {
        const { bot, chatroom, command, channel, username, isMod } = props
        const status = command === `!endpoll` ? `TERMINATED` : command === `!cancelpoll` ? `ARCHIVED` : null
        logMessage([`> pollEnd(chatroom: '${chatroom}', status: '${status}')`])

        // Mods only
        if (!isMod) {
            logMessage([`-> ${username} isn't a mod, ignoring`])
            return
        }

        const negativeEmote = getNegativeEmote(channel)
        if (!lemonyFresh[channel].pollId) { return bot.say(chatroom, `There is no active poll! ${negativeEmote}`) }
        const positiveEmote = getPositiveEmote(channel)
        if (!status) { return bot.say(chatroom, `Use !stoppoll to finish and show the results, or !cancelpoll to remove it! ${positiveEmote}`) }

        const endpoint = `https://api.twitch.tv/helix/polls?broadcaster_id=${lemonyFresh[channel].id}&id=${lemonyFresh[channel].pollId}&status=${status}`
        const options = {
            method: `PATCH`,
            headers: {
                authorization: `Bearer ${lemonyFresh[channel].accessToken}`,
                'Client-Id': CLIENT_ID
            }
        }

        const response = await fetch(endpoint, options)
        const twitchData = await response.json()
        logMessage([`pollEnd`, response.status, renderObj(twitchData.data[0], `twitchData.data[0]`)])

        if (`error` in twitchData) {
            bot.say(chatroom, `Error ending poll! ${negativeEmote}`)
        } else if (twitchData.data[0].status = status) {
            lemonyFresh[channel].pollId = ``
            bot.say(chatroom, `Poll ${status === `TERMINATED` ? `finished` : `was canceled`}! ${positiveEmote}`)
        }
    },
    async pollStart(props) {
        const { bot, chatroom, args, channel, username, isMod } = props
        const str = args.join(` `)
        logMessage([`> pollStart(chatroom: '${chatroom}', str: '${str}')`])

        // Mods only
        if (!isMod) {
            logMessage([`-> ${username} isn't a mod, ignoring`])
            return
        }

        const negativeEmote = getNegativeEmote(channel)
        if (lemonyFresh[channel].pollId) { return bot.say(chatroom, `There is already a poll in progress! ${negativeEmote}`) }

        const params = str.split(new RegExp(/ ?\/ ?/))

        // Get duration
        const seconds = params.shift()
        let duration = Number(seconds)
        if ([`<`, `>`].some((bracket) => seconds.includes(bracket))) {
            const regex = /^<(\d+)>$/
            if (!seconds.match(regex)) {
                const neutralEmote = getNeutralEmote(channel)
                return bot.say(chatroom, `Error: Please don't use angle brackets in the seconds! ${neutralEmote}`)
            } else {
                duration = Number(seconds.split(regex)[1])
            }
        }
        if (isNaN(duration)
            || duration < 15
            || duration > 1800) {
            return bot.say(chatroom, `Error: Duration should be a number between 15 and 1800. Try: !poll <seconds> / Title of poll / First choice / Second choice ...`)
        }

        // Get title and choices
        const title = params.shift()
        // Params length should be more than 2, and shouldn't be longer than 6
        if (params.length < 2 || params.length > 5) { return bot.say(chatroom, `Error: Between 2-5 choices are allowed. Try: !poll <seconds> / Title of poll / First choice / Second choice ...`) }
        const choices = params.map(choice => { return { title: choice } })

        const requestBody = {
            'broadcaster_id': lemonyFresh[channel].id,
            'title': title,
            'choices': choices,
            'duration': duration
        }
        const endpoint = `https://api.twitch.tv/helix/polls`
        const options = {
            method: `POST`,
            headers: {
                authorization: `Bearer ${lemonyFresh[channel].accessToken}`,
                'Client-Id': CLIENT_ID,
                'Content-Type': `application/json`
            },
            body: JSON.stringify(requestBody)
        }

        const response = await fetch(endpoint, options)
        const twitchData = await response.json()
        logMessage([`pollStart`, response.status, `data` in twitchData ? twitchData.data.length ? renderObj(twitchData.data[0], `twitchData.data[0]`) : `twitchData.data: []` : renderObj(twitchData, `twitchData`)])

        const positiveEmote = getPositiveEmote(channel)
        if (response.status === 200) {
            lemonyFresh[channel].pollId = twitchData.data[0].id
            setTimeout(() => { lemonyFresh[channel].pollId = `` }, duration * 1000)
            bot.say(chatroom, `Poll created, go vote! ${positiveEmote}`)
        } else if (response.status === 401) {
            // bot.say(chatroom, `Hold on, I need to refresh the token...`)
            logMessage([`-> Unauthorized from pollStart(), attempting to refresh access token...`])
            props.username = channel
            await refreshToken(props, false)
            options.headers.authorization = `Bearer ${lemonyFresh[channel].accessToken}`
            const finalAttempt = await fetch(endpoint, options)
            const finalAttemptData = await finalAttempt.json()
            logMessage([`pollStart`, finalAttempt.status, `data` in finalAttemptData ? finalAttemptData.data.length ? renderObj(finalAttemptData.data[0], `finalAttemptData.data[0]`) : `finalAttemptData.data: []` : renderObj(finalAttemptData, `finalAttemptData`)])
            if (finalAttempt.status === 200) {
                bot.say(chatroom, `Poll created, go vote! ${positiveEmote}`)
                lemonyFresh[channel].pollId = finalAttemptData.data[0].id
                return setTimeout(() => { lemonyFresh[channel].pollId = `` }, duration * 1000)
            } else {
                logMessage([`--> pollStart() failed a second time:`])
                bot.say(chatroom, `Error${finalAttempt?.message ? `: ${finalAttempt?.message}` : ` creating poll!`} ${negativeEmote}`)
            }
        } else {
            bot.say(chatroom, `Error creating poll! ${negativeEmote}`)
        }
    },
    async handleShoutOut(props) {
        const { bot, chatroom, channel, username, toUser, isMod, isModOrVIP } = props
        logMessage([`> handleShoutOut(chatroom: '${chatroom}', username: '${username}', toUser: '${toUser}', isMod:`, isMod, `, isModOrVIP:`, isModOrVIP, `)`])

        // VIPs only
        if (!isModOrVIP) {
            logMessage([`-> ${username} isn't a VIP or mod, ignoring`])
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
            const twitchUser = await getTwitchUser({ ...props, username: toUser })
            if (!twitchUser) {
                logMessage([`-> No user '${toUser}' found, exiting handleShoutOut function`])
                return
            }

            const stream = await getTwitchChannel(bot, chatroom, twitchUser.id)
            let reply = `Let's give a shoutout to ${stream.broadcaster_name}! `
            stream.game_name
                ? reply += `They were last playing ${stream.game_name}${twitchUser.broadcaster_type ? ` and are a Twitch ${twitchUser.broadcaster_type.substring(0, 1).toUpperCase() + twitchUser.broadcaster_type.substring(1)}!` : `.`}`
                : reply += `#NoGameGang`
            const neutralEmote = getNeutralEmote(channel)
            reply += ` Follow them here: https://www.twitch.tv/${stream.broadcaster_login} ${neutralEmote}`

            bot.say(chatroom, reply)

            // Mods only - Twitch official shoutout
            if (isMod) {
                if (channel === toUser) {
                    logMessage([`-> Can't give Twitch official shoutout to ${channel}`])
                    return
                }

                const modHasToken = username in mods && mods[username].isModIn.includes(chatroom) && !!mods[username].accessToken
                const token = modHasToken
                    ? mods[username].accessToken
                    : lemonyFresh[channel].accessToken

                // Stop if neither the channel nor a mod has an access token
                if (!token) {
                    logMessage([`-> ${channel} has no access token, not attempting Twitch official shoutout`])
                    return
                }

                const moderatorId = modHasToken
                    ? mods[username].id
                    : lemonyFresh[channel].id

                const endpoint = `https://api.twitch.tv/helix/chat/shoutouts?from_broadcaster_id=${lemonyFresh[channel].id}&to_broadcaster_id=${twitchUser.id}&moderator_id=${moderatorId}`
                const options = {
                    method: `POST`,
                    headers: {
                        authorization: `Bearer ${token}`,
                        'Client-Id': CLIENT_ID
                    }
                }
                const response = await fetch(endpoint, options)

                if (response.status === 204) {
                    logMessage([`-> Shoutout posted successfully!`])
                } else {
                    const twitchData = await response.json()
                    logMessage([`handleShoutOut`, response.status, renderObj(twitchData, `twitchData`)])
                    if (response.status === 401) {
                        // bot.say(chatroom, `Hold on, I need to refresh ${modHasToken ? username : channel}'s token...`)
                        logMessage([`-> Unauthorized from handleShoutOut(), attempting to refresh access token...`])
                        props.username = modHasToken ? username : channel
                        await refreshToken(props, false)
                        options.headers.authorization = `Bearer ${modHasToken ? mods[username].accessToken : lemonyFresh[channel].accessToken}`
                        const finalAttempt = await fetch(endpoint, options)
                        if (finalAttempt.status === 204) {
                            logMessage([`-> Shoutout posted successfully!`])
                        } else {
                            const finalAttemptData = await finalAttempt.json()
                            logMessage([`--> handleShoutOut() failed a second time:`])
                            logMessage([`handleShoutOut`, finalAttempt.status, renderObj(finalAttemptData, `finalAttemptData`)])
                        }
                    }
                }
            }
        } else { logMessage([`-> Timer in ${channel} '!so' is not currently listening`]) }
    },
    async makeAnnouncement(props) {
        const { bot, chatroom, args, command, channel, username } = props
        const commandSuffix = command.split(/^!announce([a-z]*)$/)[1]
        const str = args.join(` `)
        logMessage([`> makeAnnouncement(chatroom: '${chatroom}', commandSuffix: '${[`blue`, `green`, `orange`, `purple`].includes(commandSuffix) ? commandSuffix : `primary`}', username: '${username}', str: '${str}')`])

        const negativeEmote = getNegativeEmote(channel)
        if (!str) { return bot.say(chatroom, `No announcement message provided! ${negativeEmote}`) }

        const color = [`blue`, `green`, `orange`, `purple`].includes(commandSuffix) ? commandSuffix : `primary`
        const requestBody = {
            message: str,
            color: color
        }

        const modHasToken = username in mods && mods[username].isModIn.includes(chatroom) && !!mods[username].accessToken
        const token = modHasToken
            ? mods[username].accessToken
            : lemonyFresh[channel].accessToken

        // Stop if neither the channel nor a mod has an access token
        if (!token) {
            logMessage([`-> ${channel} has no access token, can't make announcement`])
            return
        }

        const moderatorId = modHasToken
            ? mods[username].id
            : lemonyFresh[channel].id

        const endpoint = `https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${lemonyFresh[channel].id}&moderator_id=${moderatorId}`
        const options = {
            method: `POST`,
            headers: {
                authorization: `Bearer ${token}`,
                'Client-Id': CLIENT_ID,
                'Content-Type': `application/json`
            },
            body: JSON.stringify(requestBody)
        }

        const response = await fetch(endpoint, options)
        if (response.status !== 204) {
            const twitchData = await response.json()
            logMessage([`makeAnnouncement`, response.status, renderObj(twitchData, `twitchData`)])
            if (response.status === 401) {
                // bot.say(chatroom, `Hold on, I need to refresh ${modHasToken ? username : channel}'s token...`)
                logMessage([`-> Unauthorized from makeAnnouncement(), attempting to refresh access token...`])
                await refreshToken(props, false)
                options.headers.authorization = `Bearer ${modHasToken ? mods[username].accessToken : lemonyFresh[channel].accessToken}`
                const finalAttempt = await fetch(endpoint, options)
                if (finalAttempt.status !== 204) {
                    const finalAttemptData = await finalAttempt.json()
                    logMessage([`--> makeAnnouncement() failed a second time:`])
                    logMessage([`makeAnnouncement`, finalAttempt.status, renderObj(finalAttemptData, `finalAttemptData`)])
                    bot.say(chatroom, `Failed to make announcement! ${finalAttemptData.message} from ${modHasToken ? username : channel} ${getNegativeEmote(channel)}`)
                }
            }
        }
    },
    async validateToken(props) {
        const { bot, chatroom, channel, username, toUser, isLemonyFreshMember } = props
        const userOrChannel = toUser === channel ? channel : username
        logMessage([`> validateToken(chatroom: '${chatroom}', userOrChannel: '${userOrChannel}')`])

        // Permissions
        if (!isLemonyFreshMember && !(username in mods)) {
            logMessage([`-> ${username} is neither a known streamer nor mod, ignoring`])
            return
        }

        const accessToken = userOrChannel === channel ? lemonyFresh[userOrChannel].accessToken : mods[userOrChannel]?.accessToken || lemonyFresh[userOrChannel]?.accessToken
        if (!accessToken) {
            const neutralEmote = getNeutralEmote(channel)
            return bot.say(chatroom, `${userOrChannel} is unauthorized! Please use !access and follow the instructions ${neutralEmote}`)
        }

        const endpoint = `https://id.twitch.tv/oauth2/validate`
        const options = {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        }

        const response = await fetch(endpoint, options)
        const twitchData = await response.json()
        logMessage([`validateToken`, response.status, renderObj(twitchData, `twitchData`)])

        const positiveEmote = getPositiveEmote(channel)
        const negativeEmote = getNegativeEmote(channel)
        return `expires_in` in twitchData
            ? bot.say(chatroom, `${users[twitchData.login]?.displayName || twitchData.login}'s token expires in ${Math.round(twitchData.expires_in / 60)} minute${Math.round(twitchData.expires_in / 60) === 1 ? `` : `s`}! ${positiveEmote}`)
            : bot.say(chatroom, `${userOrChannel}'s token is invalid! ${negativeEmote}`)
    },
    async authorizeToken(props) {
        const { bot, chatroom, args, channel, username, isMod, isLemonyFreshMember } = props
        logMessage([`> authorizeToken(chatroom: '${chatroom}', username: '${username}', isMod: ${isMod}, isLemonyFreshMember: ${isLemonyFreshMember})`])

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

        const hypeEmote = getHypeEmote(channel)
        const negativeEmote = getNegativeEmote(channel)
        if (response.status === 200) {
            if (username in lemonyFresh) {
                lemonyFresh[username].accessToken = twitchData.access_token
                lemonyFresh[username].refreshToken = twitchData.refresh_token
            }
            if (username in mods) {
                mods[username].accessToken = twitchData.access_token
                mods[username].refreshToken = twitchData.refresh_token
            }
            bot.say(chatroom, `Token was authorized! ${hypeEmote}`)
            return true
        } else {
            bot.say(chatroom, `${twitchData?.message || `Failed to authorize token`} ${negativeEmote}`)
            return false
        }
    },
    async getOAUTHToken(props) {
        const { bot, chatroom, username, user } = props
        logMessage([`> getOAUTHToken(chatroom: '${chatroom}', username: '${username}')`])

        bot.say(chatroom, `@${user.displayName} Follow this link and instructions, and copy/paste "!authorize <code>" in the chat! ${REDIRECT_URI}`)
    },
    async banUsers(props) {
        const { bot, chatroom, args, channel, username, isMod } = props
        logMessage([`> banUsers(channel: ${channel}, username: ${username}, isMod:`, isMod, `, args:`, args, `)`])

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

        // Check if streamer or their mod has an access token (mod token will be used unless they don't have one, streamer's used as a fallback)
        const modHasToken = username in mods && mods[username].isModIn.includes(chatroom) && !!mods[username].accessToken
        const token = modHasToken
            ? mods[username].accessToken
            : lemonyFresh[channel].accessToken

        // Stop if neither the channel nor a mod has an access token
        if (!token) {
            logMessage([`-> ${channel} has no access token, can't make announcement`])
            return
        }

        const moderatorId = modHasToken
            ? mods[username].id
            : lemonyFresh[channel].id

        const endpoint = `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${lemonyFresh[channel].id}&moderator_id=${moderatorId}`

        const positiveEmote = getPositiveEmote(channel)
        const negativeEmote = getNegativeEmote(channel)

        // Please wait if list will take a moment to process
        if (args.length >= 5) { bot.say(chatroom, `Please wait while I work on this list of ${args.length.toLocaleString()} usernames...`) }

        // Look up/ban each user one-by-one
        const banned = []
        const alreadyBanned = []
        for (const arg of args) {
            const userToBan = getToUser(arg)
            const twitchUser = userToBan in users
                ? users[userToBan]
                : await getTwitchUser({ ...props, username: userToBan })

            if (!twitchUser?.id) {
                logMessage([`-> Error: '${userToBan}' does not have a user ID`])
            } else {
                const requestBody = {
                    'data': {
                        user_id: `${twitchUser.id}`,
                        reason: `Banned by ${username} via ${BOT_USERNAME}`
                    }
                }
                const options = {
                    method: `POST`,
                    headers: {
                        authorization: `Bearer ${modHasToken ? mods[username].accessToken : lemonyFresh[channel].accessToken}`,
                        'Client-Id': CLIENT_ID,
                        'Content-Type': `application/json`
                    },
                    body: JSON.stringify(requestBody)
                }

                const response = await fetch(endpoint, options)
                const twitchData = await response.json()
                logMessage([`banUsers`, response.status, `data` in twitchData ? twitchData.data.length ? renderObj(twitchData.data[0], `twitchData.data[0]`) : `twitchData.data: []` : renderObj(twitchData, `twitchData`)])

                if (response.status === 401) {
                    logMessage([`-> Unauthorized from banUsers(), attempting to refresh access token...`])
                    await refreshToken(props, false)
                    options.headers.authorization = `Bearer ${modHasToken ? mods[username].accessToken : lemonyFresh[channel].accessToken}`
                    const finalAttempt = await fetch(endpoint, options)
                    const finalAttemptData = await finalAttempt.json()
                    logMessage([`banUsers`, finalAttempt.status, `data` in finalAttemptData ? finalAttemptData.length ? renderObj(finalAttemptData.data[0], `finalAttemptData.data[0]`) : `finalAttemptData.data: []` : renderObj(finalAttemptData, `finalAttemptData`)])
                    if (finalAttempt.status === 400 && finalAttemptData.message === `The user specified in the user_id field is already banned.`) {
                        alreadyBanned.push(userToBan)
                    } else if (finalAttempt.status !== 200) {
                        logMessage([`--> banUsers() failed a second time:`])
                        return bot.say(chatroom, `Failed to ban user! ${finalAttemptData?.message || `Please update your token scope by using !access again, ${modHasToken ? username : channel}!`} ${negativeEmote}`)
                    } else {
                        banned.push(userToBan)
                    }
                } else if (response.status === 200) {
                    banned.push(userToBan)
                } else if (response.status === 400 && twitchData.message === `The user specified in the user_id field is already banned.`) {
                    alreadyBanned.push(userToBan)
                } else {
                    bot.say(chatroom, `Error banning ${userToBan}${twitchData.message ? `: ${twitchData.message}` : ``} ${negativeEmote}`)
                }
            }
        }

        bot.say(chatroom, `Banned ${pluralize(banned.length, `user`, `users`)}${banned.length
            ? `: ${banned.join(`, `)} ${positiveEmote}`
            : `! ${negativeEmote}`
            } ${alreadyBanned.length ? `Already banned: ${alreadyBanned.join(`, `)}` : ``}`)
    },
    async autoBanUser(bot, chatroom, username) {
        const channel = chatroom.substring(1)
        logMessage([`> autoBanUser(channel: ${channel}, username: ${username})`])

        const greetingEmote = getGreetingEmote(channel)
        const negativeEmote = getNegativeEmote(channel)
        const dumbEmote = getDumbEmote(channel)

        // Stop if the channel doesn't have an access token
        if (!lemonyFresh[channel].accessToken) {
            logMessage([`-> ${channel} has no access token, can't ban user '${username}'`])
            return bot.say(chatroom, `Hi, ${users[username].displayName}... ${lemonyFresh[channel].bttvEmotes.includes(`modCheck`)
                ? `modCheck`
                : `${greetingEmote}`
                } Any mods in chat?`)
        }

        const endpoint = `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${lemonyFresh[channel].id}&moderator_id=${lemonyFresh[channel].id}`
        const requestBody = {
            'data': {
                user_id: `${users[username].id}`,
                reason: `Auto-banned by ${BOT_USERNAME} for message content`
            }
        }
        const options = {
            method: `POST`,
            headers: {
                authorization: `Bearer ${lemonyFresh[channel].accessToken}`,
                'Client-Id': CLIENT_ID,
                'Content-Type': `application/json`
            },
            body: JSON.stringify(requestBody)
        }

        const response = await fetch(endpoint, options)
        const twitchData = await response.json()
        logMessage([`autoBanUser`, response.status, renderObj(twitchData, `twitchData`)])

        if (response.status === 401) {
            logMessage([`-> Unauthorized from banUsers(), attempting to refresh access token...`])
            await refreshToken({ bot: bot, chatroom: chatroom, channel: channel, username: username, toUser: null }, false)
            options.headers.authorization = `Bearer ${lemonyFresh[channel].accessToken}`
            const finalAttempt = await fetch(endpoint, options)
            const finalAttemptData = await finalAttempt.json()
            logMessage([`autoBanUser`, finalAttempt.status, renderObj(finalAttemptData, `finalAttemptData`)])
            if (finalAttempt.status !== 200) {
                logMessage([`--> banUsers() failed a second time:`])
                return bot.say(chatroom, `Failed to ban user! ${finalAttemptData?.message || `Please update your token scope by using !access again!`} ${negativeEmote}`)
            }
            else { bot.say(chatroom, `Begone, spammer! ${greetingEmote}`) }
        } else if (response.status === 200) {
            bot.say(chatroom, `Begone, spammer! ${greetingEmote}`)
        } else {
            bot.say(chatroom, `Failed to ban ${users[username].displayName} automatically... ${dumbEmote} ${twitchData?.message || `Please update your token scope by using !access again!`}`)
        }

        // delete users[username]
    }
}
