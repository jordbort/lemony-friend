const BOT_USERNAME = process.env.BOT_USERNAME

const { settings } = require(`../config`)
const { users, lemonyFresh } = require(`../data`)

const { getLemonEmote, getNeutralEmote, getPositiveEmote, getGreetingEmote, getByeEmote, pluralize, resetCooldownTimer, getHypeEmote, getUpsetEmote, getNegativeEmote, getDumbEmote, logMessage } = require(`../utils`)
const { autoBanUser } = require(`./twitch`)

function handleGreetOne(props) {
    const { bot, chatroom, channel, toUser, userNickname, targetNickname } = props
    logMessage([`> handleGreetOne(chatroom: '${chatroom}', nickname: ${targetNickname || userNickname})`])

    if (lemonyFresh[channel].timers[`greet`].listening) {
        resetCooldownTimer(channel, `greet`)

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

        let response = `${greetings[greeting]} ${toUser === BOT_USERNAME ? userNickname : targetNickname || userNickname}`
        const greetingEmote = getGreetingEmote(channel)

        // If the greeting is "Howdy"
        if (greeting === 0) {
            response += `! ${users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Ram` : greetingEmote}`
        }
        // If there's a comma after the greeting
        else if (greeting < greetings.indexOf(`Hello`)) {
            const appends = [
                `How are you doing today?`,
                `How are you today?`,
                `How are you doing?`,
                `How are you?`,
                `How's it going?`,
                `How goes it?`
            ]
            response += `! ${appends[Math.floor(Math.random() * appends.length)]} ${greetingEmote}`
        }
        // If there's no comma after the greeting
        else {
            const appends = [
                `how are you doing today?`,
                `how are you today?`,
                `how are you doing?`,
                `how are you?`,
                `how's it going?`,
                `how goes it?`
            ]
            response += `, ${appends[Math.floor(Math.random() * appends.length)]} ${greetingEmote}`
        }
        bot.say(chatroom, response)
    } else { logMessage([`-> Timer in ${channel} 'greet' is not currently listening`]) }
}

function handleGreetMany(bot, chatroom, arr) {
    logMessage([`> handleGreetMany(chatroom: ${chatroom}, arr: ${arr})`])
    const channel = chatroom.substring(1)

    if (lemonyFresh[channel].timers[`mass-greet`].listening) {
        resetCooldownTimer(channel, `mass-greet`)

        const greetings = [
            `hello`,
            `howdy`,
            `hey`,
            `hi`
        ]
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
        const greetingEmote = getGreetingEmote(channel)

        const response = []
        for (let str of arr) {
            while (str.startsWith(`@`)) { str = str.substring(1) }
            str.toLowerCase() in users
                ? response.push(`${randomGreeting} ${users[str.toLowerCase()].nickname || users[str.toLowerCase()].displayName} ${greetingEmote}`)
                : response.push(`${randomGreeting} ${str} ${greetingEmote}`)
        }
        bot.say(chatroom, response.join(` `))
    } else { logMessage([`-> Timer in ${channel} 'massGreet' is not currently listening`]) }
}

function handleGreetAll(bot, chatroom, username) {
    logMessage([`> handleGreetAll(chatroom: ${chatroom}, username: ${username})`])
    const channel = chatroom.substring(1)

    if (lemonyFresh[channel].timers[`mass-greet`].listening) {
        resetCooldownTimer(channel, `mass-greet`)

        const currentTime = Date.now()

        const usersToGreet = []
        for (const user in users) {
            if (!settings.ignoredBots.includes(user) && user !== username && channel in users[user]) {
                const lastChattedAtMins = Number(((currentTime - users[user][channel].sentAt) / 60000).toFixed(2))
                if (lastChattedAtMins < 60) {
                    usersToGreet.push(users[user].nickname || users[user].displayName)
                } else {
                    logMessage([`${user} has not chatted in the past 60 minutes, ignoring...`, lastChattedAtMins])
                }
            }
        }

        const greetings = [
            `hello`,
            `howdy`,
            `hey`,
            `hi`
        ]
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]

        const greetingEmote = getGreetingEmote(channel)
        const response = usersToGreet.map((user) => `${randomGreeting} ${user} ${greetingEmote}`)
        bot.say(chatroom, response.join(` `))
    } else { logMessage([`-> Timer in ${channel} 'greetAll' is not currently listening`]) }
}

module.exports = {
    handleGreetOne,
    handleNewChatter(bot, chatroom, username, message) {
        logMessage([`> handleNewChatter(chatroom: ${chatroom}, username: ${username})`])

        // Check for automatic ban phrase
        for (const phrase of settings.autoBan) {
            const regex = new RegExp(phrase, `i`)
            if (regex.test(message)) {
                logMessage([`${username.toUpperCase()} MATCHED AUTO-BAN PATTERN:`, regex])
                return autoBanUser(bot, chatroom, username)
            }
        }

        const channel = chatroom.substring(1)
        if (lemonyFresh[channel].timers[`new-chatter`].listening) {
            resetCooldownTimer(channel, `new-chatter`)

            const user = users[username]
            const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel
            const greetings = [
                `Hi ${user.displayName}, welcome to the stream!`,
                `Hey ${user.displayName}, welcome to the stream!`,
                `Welcome to the stream, ${user.displayName}!`,
                `Hi ${user.displayName}, welcome in!`,
                `Hi @${user.displayName}`,
                `Hello @${user.displayName} welcome in!`,
                `@${user.displayName} welcome 2 ${channelNickname} strem`,
            ]
            const greeting = greetings[Math.floor(Math.random() * greetings.length)]

            const greetingEmote = getGreetingEmote(channel)
            setTimeout(() => bot.say(chatroom, `${greeting} ${greetingEmote}`), 5000)
        } else { logMessage([`-> Timer in ${channel} 'newChatter' is not currently listening`]) }
    },
    handleGreet(props) {
        const { bot, chatroom, args, channel, username, userNickname, target, targetNickname } = props
        logMessage([`> handleGreet(chatroom: '${chatroom}', args:`, args, `userNickname: ${userNickname}, targetNickname: ${targetNickname})`])

        // If !greet all
        if (/^all$/i.test(args[0])) { handleGreetAll(bot, chatroom, username) }
        // If one (known) username is used, greet normally
        else if (target && !args[1]) { handleGreetOne(props) }
        // If multiple args are used, or toUser is not known
        else if (args.length) { handleGreetMany(bot, chatroom, args) }
        // If no args are used
        else { bot.say(chatroom, `Greetings, ${userNickname}! ${getGreetingEmote(channel)}`) }
    },
    sayGoodnight(props) {
        const { bot, chatroom, message, args, channel, userNickname, toUser, targetNickname } = props
        const recipient = targetNickname || userNickname
        logMessage([`> handleGreet(chatroom: ${chatroom}, args:`, args, `)`])

        if (lemonyFresh[channel].timers[`say-goodnight`].listening) {
            resetCooldownTimer(channel, `say-goodnight`)

            // In case unknown user is mentioned
            if (!targetNickname && toUser && !/\b(@?lemony_friend|l+e+m+o+n+y*|m+e+l+o+n+|l+e+m+f+r+i+e+n+d+)\b/i.test(message)) { return bot.say(chatroom, `see ya ${args[0]}`) }

            const greetings = [
                `Bye`,
                `Good night,`,
                `Sleep well,`,
                `See you next time,`,
                `Have a good night,`
            ]
            const greeting = Math.floor(Math.random() * greetings.length)

            let response = `${greetings[greeting]} ${recipient}`
            if (greeting === 0) {
                const appends = [
                    `sleep well`,
                    `see you next time`,
                    `have a good night`,
                ]
                response += `, ${appends[Math.floor(Math.random() * appends.length)]}`
            }

            const byeEmote = getByeEmote(channel)
            response += `! ${byeEmote}`
            bot.say(chatroom, response)
        } else { logMessage([`-> Timer in ${channel} 'sayGoodnight' is not currently listening`]) }
    },
    sayYoureWelcome(props) {
        const { bot, chatroom, channel, user, userNickname } = props
        logMessage([`> sayYoureWelcome(chatroom: ${chatroom}, userNickname: ${userNickname})`])

        if (lemonyFresh[channel].timers[`say-youre-welcome`].listening) {
            resetCooldownTimer(channel, `say-youre-welcome`)

            const welcomes = [
                `@${user.displayName}`,
                `You're welcome, ${userNickname}`,
                `No problem, ${userNickname}`,
                `My pleasure, ${userNickname}`,
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

            const positiveEmote = getPositiveEmote(channel)
            response += `! ${positiveEmote}`
            bot.say(chatroom, response)
        } else { logMessage([`-> Timer in ${channel} 'sayYoureWelcome' is not currently listening`]) }
    },
    sayThanks(props) {
        const { bot, chatroom, channel, user, userNickname } = props
        logMessage([`> sayThanks(chatroom: ${chatroom}, userNickname: ${userNickname})`])

        if (lemonyFresh[channel].timers[`say-thanks`].listening) {
            resetCooldownTimer(channel, `say-thanks`)

            const thanks = [
                `@${user.displayName}`,
                `Thanks, ${userNickname}`,
                `Thanks, ${userNickname}`,
                `Thanks, ${userNickname}`,
                `Thank you, ${userNickname}`,
                `Thank you, ${userNickname}`,
                `Thank you, ${userNickname}`,
                `Thank you so much, ${userNickname}`,
                `Hey thanks, ${userNickname}`,
                `Aw thanks, ${userNickname}`
            ]
            const sentiment = Math.floor(Math.random() * thanks.length)

            let response = `${thanks[sentiment]}`
            if (sentiment === 0) {
                const appends = [
                    `thanks`,
                    `thank you`,
                    `thank you so much`
                ]
                response += ` ${appends[Math.floor(Math.random() * appends.length)]}`
            }

            const positiveEmote = getPositiveEmote(channel)
            response += `! ${positiveEmote}`
            bot.say(chatroom, response)
        } else { logMessage([`-> Timer in ${channel} 'sayThanks' is not currently listening`]) }
    },
    sayMood(props) {
        const { bot, chatroom, channel, user, userNickname } = props
        logMessage([`> sayMood(chatroom: '${chatroom}', userNickname: ${userNickname})`])

        if (lemonyFresh[channel].timers[`say-mood`].listening) {
            resetCooldownTimer(channel, `say-mood`)

            const lemonEmote = getLemonEmote(channel)
            const neutralEmote = getNeutralEmote(channel)
            const hypeEmote = getHypeEmote(channel)
            const positiveEmote = getPositiveEmote(channel)
            const upsetEmote = getUpsetEmote(channel)
            const negativeEmote = getNegativeEmote(channel)
            const greetingEmote = getGreetingEmote(channel)
            const byeEmote = getByeEmote(channel)
            const dumbEmote = getDumbEmote(channel)

            const botMoods = {
                dev: {
                    replies: [
                        `@${user.displayName}`,
                        `I'm okay ${userNickname}, still recovering!`,
                        `I'm hanging in there ${userNickname}, hoping I don't crash!`,
                        `I'm getting better ${userNickname}, almost done being rebuilt I think!`,
                    ],
                    appends: [
                        `I'm fine, hopefully almost done being rebuilt. Hope you're well!`,
                        `hanging in there, still in recovery!`,
                        `just trying my best not to crash!`
                    ],
                    emote: dumbEmote
                },
                happy: {
                    replies: [
                        `@${user.displayName}`,
                        `I'm doing great, ${userNickname}!`,
                        `I'm doing well ${userNickname}, hope you are too!`,
                        `Doing well ${userNickname}, thanks for asking!`,
                    ],
                    appends: [
                        `I'm good, hope you're well!`,
                        `doing great, thanks for asking!`,
                        `I'm doing well, thank you!`
                    ],
                    emote: neutralEmote
                }
            }

            if (!(settings.botMood in botMoods)) {
                logMessage([`-> botMood '${settings.botMood}' not found`])
                return
            }

            const replies = botMoods[settings.botMood].replies
            const appends = botMoods[settings.botMood].appends
            const numReply = Math.floor(Math.random() * replies.length)

            let reply = `${replies[numReply]}`
            if (numReply === 0) { reply += ` ${appends[Math.floor(Math.random() * appends.length)]}` }

            reply += ` ${botMoods[settings.botMood].emote}`
            bot.say(chatroom, reply)
        } else { logMessage([`-> Timer in ${channel} 'sayMood' is not currently listening`]) }
    },
    handleRaid(props) {
        const { bot, chatroom, channel, username, isModOrVIP } = props
        logMessage([`> handleRaid(channel: '${channel}')`])

        // VIPs only
        if (!isModOrVIP) {
            logMessage([`-> ${username} isn't a VIP or mod, ignoring`])
            return
        }

        if (lemonyFresh[channel].timers[`!raid`].listening) {
            resetCooldownTimer(channel, `!raid`)

            const subRaidMessage = lemonyFresh[channel].subRaidMessage
            const noSubRaidMessage = lemonyFresh[channel].noSubRaidMessage
            const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip ? 1000 : 2000
            const appendEmote = users[BOT_USERNAME][channel].sub ? lemonyFresh[channel].emotes[0] : getPositiveEmote(channel)

            if (subRaidMessage) { bot.say(chatroom, subRaidMessage) }
            if (noSubRaidMessage) {
                setTimeout(() => {
                    bot.say(chatroom, noSubRaidMessage)
                }, subRaidMessage ? delay : 1)
            }
            if (subRaidMessage && noSubRaidMessage) {
                setTimeout(() => {
                    bot.say(chatroom, `Thanks for sticking around for the raid! If you're subscribed to the channel, you can use the first raid message, otherwise you can use the second raid message! ${appendEmote}`)
                }, delay * 2)
            }
        } else { logMessage([`-> Timer in ${channel} '!raid' is not currently listening`]) }
    },
    welcomeBack(props) {
        const { bot, chatroom, channel, user, userNickname } = props
        logMessage([`> welcomeBack(chatroom: '${chatroom}', userNickname: '${userNickname}')`])

        const greetingEmote = getGreetingEmote(channel)
        user[channel].away = false
        user[channel].awayMessage = ``
        setTimeout(() => bot.say(chatroom, `Welcome back, ${userNickname}! ${greetingEmote}`), 5000)
    },
    funTimerGuess(props) {
        const { bot, chatroom, message, channel, user, userNickname } = props
        logMessage([`> funTimerGuess(chatroom: '${chatroom}', message: ${message}, userNickname: '${userNickname}', number: ${lemonyFresh[channel].funTimer})`])

        const regex = new RegExp(`\\b${lemonyFresh[channel].funTimer}\\b`)

        if (regex.test(message)) {
            user.lemons++
            const lemonEmote = getLemonEmote(channel)
            bot.say(chatroom, `That's right ${userNickname}, the number was ${lemonyFresh[channel].funTimer}. Have a lemon! ${lemonEmote}`)
        } else {
            const neutralEmote = getNeutralEmote(channel)
            bot.say(chatroom, `Sorry ${userNickname}, the number was ${lemonyFresh[channel].funTimer}. Next time! ${neutralEmote}`)
        }
        lemonyFresh[channel].funTimer = 0
        lemonyFresh[channel].funTimerGuesser = ``
    },
    chant(props) {
        const { bot, chatroom, args } = props
        logMessage([`> chant(chatroom: '${chatroom}', args:`, args, `)`])

        const emotes = Object.keys(lemonyFresh)
            .filter(key => typeof lemonyFresh[key] === `object` && `emotes` in lemonyFresh[key])
            .map(channel => lemonyFresh[channel].emotes)
            .flat()

        const chant = args.map((word) => {
            return !emotes.includes(word)
                ? word.toUpperCase()
                : word
        })
        const response = Array(settings.chantCount).fill(`${chant.join(` `)} ${settings.chantEmote}`)
        return bot.say(chatroom, `📣️ ${response.join(` `)}`)
    },
    yell(props) {
        const { bot, message, userNickname, currentTime } = props

        const mostRecentMessages = {}
        for (const channel in lemonyFresh) {
            if (typeof lemonyFresh[channel] === `object` && !Array.isArray(lemonyFresh[channel])) { mostRecentMessages[channel] = 0 }
        }
        for (const channel in mostRecentMessages) {
            for (const username in users) {
                if (channel in users[username] && users[username][channel]?.sentAt > mostRecentMessages[channel]) { mostRecentMessages[channel] = users[username][channel].sentAt }
            }
        }

        const recentChannels = Object.keys(mostRecentMessages).filter(channel => currentTime - mostRecentMessages[channel] < 3600000)
        logMessage([`> yell(userNickname: '${userNickname}', recentChannels:`, recentChannels, `)`])

        for (const chatroom of recentChannels) {
            bot.say(chatroom, `${userNickname} says: ${message.substring(6)}`)
        }
    },
    setAway(props) {
        const { bot, chatroom, args, command, channel, username, user, userNickname } = props
        logMessage([`> setAway(chatroom: '${chatroom}', username: '${username}', args:`, args, `)`])

        user[channel].away = true
        if (args.length) { user[channel].awayMessage = args.join(` `) }
        const byeEmote = getByeEmote(channel)
        if (command !== `!lurk`) {
            user[channel].awayMessage
                ? bot.say(chatroom, `See you later, ${userNickname}! I'll pass along your away message if they mention you! ${byeEmote}`)
                : bot.say(chatroom, `See you later, ${userNickname}! I'll let people know you're away if they mention you! ${byeEmote}`)
        }
        // This helps prevent users from being welcomed back in the distant future
        setTimeout(() => {
            user[channel].away = false
            user[channel].awayMessage = ``
        }, settings.maxWelcomeBackMinutes * 1000)
    },
    reportAway(props) {
        const { bot, chatroom, args, message, channel, username, currentTime } = props

        for (const targetName of Object.keys(users)) {
            const target = users[targetName]
            const targetNickname = target.nickname || target.displayName
            const regex = new RegExp(`\\b(@?${targetName}|${targetNickname})\\b`, `i`)

            if (target[channel]?.away && regex.test(message)) {
                logMessage([`> reportAway(chatroom: '${chatroom}', targetNickname: '${targetNickname}')`])
                const elapsedTime = Math.round((currentTime - target[channel].sentAt) / 60000)
                const reply = `${targetNickname} has been away for ~${pluralize(elapsedTime, `minute`, `minutes`)}!${target[channel].awayMessage ? ` Their away message: "${target[channel].awayMessage}"` : ``}`
                if (elapsedTime > 1) { return bot.say(chatroom, reply) }
                else { logMessage([`-> ${username} has been away for less than one-minute grace period`]) }
            }
        }

        // End of onChatHandler logic
        logMessage([`MESSAGE DID NOT MATCH REGEX PATTERNS`])
    }
}
