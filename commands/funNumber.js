const BOT_USERNAME = process.env.BOT_USERNAME

const { settings } = require(`../config`)
const { lemonyFresh, users, lemCmds, wordBank } = require(`../data`)
const numbers = require(`../numbers`)

const { lemonify } = require(`./lemonify`)
const { apiGetTwitchChannel } = require(`./twitch`)
const { getRandomUser, getRandomChannelMessage } = require(`./getInfo`)
const { getContextEmote, pluralize, logMessage } = require(`../utils`)

function makePyramid(props) {
    const { bot, chatroom, message, channel } = props
    const firstWord = message.split(` `)[0]
    logMessage([`> makePyramid(channel: '${channel}', firstWord: '${firstWord}')`])

    const delay = users[BOT_USERNAME].channels[channel].mod || users[BOT_USERNAME].channels[channel].vip || channel === BOT_USERNAME
        ? 1000
        : 2000

    bot.say(chatroom, `${firstWord}`)
    setTimeout(() => bot.say(chatroom, `${firstWord} ${firstWord}`), delay)
    setTimeout(() => bot.say(chatroom, `${firstWord} ${firstWord} ${firstWord}`), delay * 2)
    setTimeout(() => bot.say(chatroom, `${firstWord} ${firstWord}`), delay * 3)
    setTimeout(() => bot.say(chatroom, `${firstWord}`), delay * 4)
}

const currencies = [
    {
        name: `dollars`,
        abbreviation: `usd`,
        symbol: `$`,
        zeroes: ``
    },
    {
        name: `dollars`,
        abbreviation: `usd`,
        symbol: `$`,
        zeroes: ``
    },
    {
        name: `dollars`,
        abbreviation: `usd`,
        symbol: `$`,
        zeroes: ``
    },
    {
        name: `dollars`,
        abbreviation: `usd`,
        symbol: `$`,
        zeroes: ``
    },
    {
        name: `dollars`,
        abbreviation: `usd`,
        symbol: `$`,
        zeroes: ``
    },
    {
        name: `japanese yen`,
        abbreviation: `jpy`,
        symbol: `¥`,
        zeroes: `00`
    },
    {
        name: `japanese yen`,
        abbreviation: `jpy`,
        symbol: `¥`,
        zeroes: `00`
    },
    {
        name: `korean won`,
        abbreviation: `krw`,
        symbol: `₩`,
        zeroes: `000`
    },
    {
        name: `korean won`,
        abbreviation: `krw`,
        symbol: `₩`,
        zeroes: `000`
    },
    {
        name: `turkish lira`,
        abbreviation: `TRY`,
        symbol: `₺`,
        zeroes: `00`
    },
    {
        name: `turkish lira`,
        abbreviation: `TRY`,
        symbol: `₺`,
        zeroes: `00`
    },
    {
        name: `british pound sterling`,
        abbreviation: `gbp`,
        symbol: `£`,
        zeroes: ``
    },
    {
        name: `british pound sterling`,
        abbreviation: `gbp`,
        symbol: `£`,
        zeroes: ``
    },
    {
        name: `mexican pesos`,
        abbreviation: `mxn`,
        symbol: `$`,
        zeroes: `0`
    },
    {
        name: `mexican pesos`,
        abbreviation: `mxn`,
        symbol: `$`,
        zeroes: `0`
    },
    {
        name: `canadian dollars`,
        abbreviation: `cad`,
        symbol: `$`,
        zeroes: `0`
    },
    {
        name: `canadian dollars`,
        abbreviation: `cad`,
        symbol: `$`,
        zeroes: `0`
    },
    {
        name: `euro`,
        abbreviation: `eur`,
        symbol: `€`,
        zeroes: ``
    },
    {
        name: `euro`,
        abbreviation: `eur`,
        symbol: `€`,
        zeroes: ``
    },
    {
        name: `australian dollars`,
        abbreviation: `aud`,
        symbol: `$`,
        zeroes: `0`
    },
    {
        name: `australian dollars`,
        abbreviation: `aud`,
        symbol: `$`,
        zeroes: `0`
    },
    {
        name: `malaysian ringgit`,
        abbreviation: `myr`,
        symbol: `RM`,
        zeroes: `0`
    },
    {
        name: `malaysian ringgit`,
        abbreviation: `myr`,
        symbol: `RM`,
        zeroes: `0`
    },
    {
        name: `indian rupees`,
        abbreviation: `inr`,
        symbol: `₹`,
        zeroes: `00`
    },
    {
        name: `indian rupees`,
        abbreviation: `inr`,
        symbol: `₹`,
        zeroes: `00`
    },
    {
        name: `zimbabwean dollars`,
        abbreviation: `zwd`,
        symbol: `$`,
        zeroes: `0000000000000000`
    }
]
function giveMeMoney(props) {
    const { bot, chatroom, userChannel } = props
    const msgCount = userChannel.msgCount
    const currency = currencies[Math.floor(Math.random() * currencies.length)]
    logMessage([`> giveMeMoney(msgCount: ${msgCount}, currency: '${currency.abbreviation.toUpperCase()}')`])

    bot.say(chatroom, `Give me ${currency.symbol}${msgCount}${currency.zeroes} ${currency.abbreviation.toUpperCase()}`)
}
function transferMeMoney(props) {
    const { bot, chatroom, userChannel } = props
    const msgCount = userChannel.msgCount
    const currency = currencies[Math.floor(Math.random() * currencies.length)]
    logMessage([`> transferMeMoney(msgCount: ${msgCount}, currency: '${currency.abbreviation.toUpperCase()}')`])

    const paymentMethods = [
        `give me`,
        `give me`,
        `venmo me`,
        `venmo me`,
        `paypal me`,
        `paypal me`,
        `cashapp me`,
        `cashapp me`,
        `wire transfer me`,
        `wire transfer me`,
        `messenger pigeon me`,
        `messenger pigeon me`,
        `pls email me`,
        `write me a travelers check for`
    ]
    const paymentMethod = Math.floor(Math.random() * paymentMethods.length)
    bot.say(chatroom, `${paymentMethods[paymentMethod]} ${msgCount}${currency.zeroes} ${currency.name}`)
}

function useRedemption(props) {
    const { bot, chatroom, channel } = props
    logMessage([`> useRedemption(channel: '${channel}', redeems.length: ${lemonyFresh[channel].redeems.length})`])
    if (lemonyFresh[channel].redeems.length === 0) {
        logMessage([`-> No redemptions available`])
        return
    }

    const redeem = lemonyFresh[channel].redeems[Math.floor(Math.random() * lemonyFresh[channel].redeems.length)]
    bot.say(chatroom, redeem)
}

function givePoints(props) {
    const { bot, chatroom, userChannel, channel, username } = props
    const msgCount = userChannel.msgCount
    logMessage([`> givePoints(channel: '${channel}', username: '${username}', msgCount: ${msgCount}, points: ${users[BOT_USERNAME].channels[channel]?.points})`])

    if (lemonyFresh[channel].viewers.includes(`streamelements`)) {
        if (users[BOT_USERNAME].channels[channel]?.points <= 0) {
            bot.say(chatroom, `!points`)
            return
        }

        const pointsToGive = `points` in Object(users[BOT_USERNAME].channels[channel])
            ? msgCount * 25 >= users[BOT_USERNAME].channels[channel].points
                ? `all`
                : `${msgCount * 25}`
            : `${msgCount * 25}`
        bot.say(chatroom, `!give ${username} ${pointsToGive}`)
    } else { logMessage([`-> StreamElements not present in ${channel}'s channel`]) }
}

function lemonifyRandomUser(props) {
    const { bot, chatroom } = props
    logMessage([`> lemonifyRandomUser()`])

    const randomUser = getRandomUser([BOT_USERNAME])
    const randomMsg = getRandomChannelMessage(users[randomUser])
    const lemonMsg = lemonify(randomMsg)
    bot.say(chatroom, lemonMsg)
}

function useUndertaleBot(props) {
    const { bot, chatroom, channel } = props
    logMessage([`> useUndertaleBot()`])

    if (lemonyFresh[channel].viewers.includes(`undertalebot`)) {
        const randomUser = getRandomUser(settings.ignoredBots)
        const actions = [
            `!fight ${randomUser}`,
            `!act ${randomUser}`,
            `!mercy ${randomUser}`
        ]
        bot.say(chatroom, actions[Math.floor(Math.random() * actions.length)])
    } else { logMessage([`-> UndertaleBot not present in ${channel}'s channel`]) }
}

function reportChance(props) {
    const { bot, chatroom } = props
    logMessage([`> reportChance(funNumberCount: ${settings.funNumberCount}, funNumberTotal: ${settings.funNumberTotal})`])

    bot.say(chatroom, `This message has a 1/${(settings.funNumberCount * settings.funNumberTotal).toLocaleString()} chance of appearing`)
}

function sayMessageID(props) {
    const { bot, chatroom, tags } = props
    logMessage([`> sayMessageID(tags: ${Object.keys(tags)})`])

    bot.say(chatroom, `${tags.id}`)
}

function sayTime(props) {
    const { bot, chatroom, currentTime } = props
    logMessage([`> sayTime(currentTime: ${currentTime})`])

    bot.say(chatroom, `${currentTime}`)
}

async function askAboutGame(props) {
    const { bot, chatroom, channel } = props
    const broadcasterId = lemonyFresh[channel].id
    const twitchChannel = await apiGetTwitchChannel(broadcasterId)
    if (!twitchChannel) {
        logMessage([`-> Failed to fetch Twitch channel`])
        return
    }

    const { game_name, game_id } = twitchChannel
    logMessage([`> askAboutGame(channel: '${channel}', game_name: '${game_name}', game_id: '${game_id}')`])

    const neutralEmote = getContextEmote(`neutral`, channel)
    const reply = game_name === `Just Chatting`
        ? `How is everyone doing? ${neutralEmote}`
        : `How are you enjoying ${game_name || `the game`}? ${neutralEmote}`
    bot.say(chatroom, reply)
}

function awardLemon(props) {
    const { bot, chatroom, channel, username, userNickname } = props
    logMessage([`> awardLemon(channel: '${channel}', userNickname: '${userNickname}')`])

    users[username].lemons++
    const lemonEmote = getContextEmote(`lemon`, channel)
    bot.say(chatroom, `${userNickname} earned one (1) lemon! ${lemonEmote}`)
}

function useBTTVEmote(props) {
    const { bot, chatroom, channel } = props
    logMessage([`> useBTTVEmote(channel: '${channel}', bttvEmotes: ${lemonyFresh[channel].bttvEmotes.length})`])

    if (lemonyFresh[channel].bttvEmotes.length === 0) {
        logMessage([`-> No known BTTV emotes in channel`])
        return
    }

    const shakingCurseChance = [`c! s! `, ``, ``, ``]
    const shakingCurse = shakingCurseChance[Math.floor(Math.random() * shakingCurseChance.length)]

    const emotes = lemonyFresh[channel].bttvEmotes
    const emote = emotes[Math.floor(Math.random() * emotes.length)]
    bot.say(chatroom, `w! h! ${shakingCurse}${emote}`)
}

function restartFunTimer(props) {
    const { bot, chatroom, channel, username } = props
    logMessage([`> restartFunTimer(channel: '${channel}', username: '${username}')`])

    if (settings.ignoredBots.includes(username)) {
        logMessage([`-> ${username} is a bot, ignoring`])
        return
    }

    lemonyFresh[channel].funTimerGuesser = ``
    clearTimeout(lemonyFresh[channel].funTimer)

    const timer = setTimeout(() => {
        lemonyFresh[channel].funTimerGuesser = username
        bot.say(chatroom, `Do you remember the number, ${users[username].displayName}?`)
    }, settings.funTimerDuration)

    lemonyFresh[channel].funTimer
        ? bot.say(chatroom, `Forget ${lemonyFresh[channel].funTimer}, now I need ${users[username].displayName} to remember ${timer}`)
        : bot.say(chatroom, `I need ${users[username].displayName} to remember ${timer}`)

    logMessage([`-> Fun Timer has been delayed in ${chatroom} ${lemonyFresh[channel].funTimer
        ? `again`
        : `for the first time`}, new value: ${Number(timer)}`
    ])
    lemonyFresh[channel].funTimer = Number(timer)
}

function getViewers(props) {
    const { bot, chatroom, channel } = props
    const viewers = lemonyFresh[channel].viewers.filter(viewer => viewer !== channel && !settings.ignoredBots.includes(viewer))
    logMessage([`> getViewers(channel: '${channel}', viewers: ${viewers.length})`])

    const hypeEmote = getContextEmote(`hype`, channel)
    const positiveEmote = getContextEmote(`positive`, channel)
    const neutralEmote = getContextEmote(`neutral`, channel)
    const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel

    if (viewers.length > 4) {
        bot.say(chatroom,
            `${channelNickname} has ${pluralize(viewers.length, `viewer`, `viewers`)}! ${viewers.length < 10
                ? neutralEmote
                : viewers.length < 20
                    ? positiveEmote
                    : hypeEmote}`
        )
    } else { logMessage([`-> ${channel} only has ${pluralize(viewers.length, `viewer`, `viewers`)}`]) }
}

function getLurker(props) {
    const { bot, chatroom, channel } = props
    const notChatted = lemonyFresh[channel].viewers.filter(username => !(username in users) || !(channel in users[username].channels))
    if (notChatted.includes(channel)) { notChatted.splice(notChatted.indexOf(channel), 1) }

    const lurker = notChatted[Math.floor(Math.random() * notChatted.length)]
    logMessage([`> getLurker(channel: '${channel}', lurker: '${lurker}', notChatted.length: ${notChatted.length})`])
    if (!notChatted.length) {
        logMessage([`-> No lurkers found!`])
        return
    }

    const dumbEmote = getContextEmote(`dumb`, channel)
    bot.say(chatroom, `Has anyone heard from ${lurker}? ${dumbEmote}`)
}

function awardLemonToRecentChatters(props) {
    const { bot, currentTime, chatroom, channel } = props
    logMessage([`> awardLemonToRecentChatters(channel: '${channel}')`])

    // Check if user has chatted in the past 10 minutes
    const recipients = []
    for (const username in users) {
        if (channel in users[username].channels && currentTime - users[username].channels[channel].sentAt <= 600000) {
            users[username].lemons++
            recipients.push(username)
        }
    }
    logMessage([`-> recipients:`, recipients.join(`, `)])

    const lemonEmote = getContextEmote(`lemon`, channel)
    bot.say(chatroom, `${pluralize(recipients.length, `person`, `people`)} just received one lemon each! ${lemonEmote}`)
}

function useTwoEmotes(props) {
    const { bot, chatroom, channel } = props
    logMessage([`> useTwoEmotes(channel: '${channel}', emotes: ${lemonyFresh[channel].emotes.length})`])

    if (lemonyFresh[channel].emotes.length === 0) {
        logMessage([`-> No known emotes in channel '${channel}'`])
        return
    }

    if (!users[BOT_USERNAME].channels[channel].sub) {
        logMessage([`-> ${BOT_USERNAME} is not subscribed to ${channel}, can't use emotes`])
        return
    }

    const emotes = lemonyFresh[channel].emotes
    const emoteOne = emotes[Math.floor(Math.random() * emotes.length)]
    const emoteTwo = emotes[Math.floor(Math.random() * emotes.length)]
    bot.say(chatroom, `${emoteOne} ${emoteTwo}`)
}

function useFunnyCommand(props) {
    const { bot, message, chatroom, channel, username } = props
    logMessage([`> useFunnyCommand(channel: '${channel}'`])

    const arrFunnyCommands = lemonyFresh[channel].funnyCommands.slice()

    if (!arrFunnyCommands.length) {
        logMessage([`-> No funny commands`])
        return
    }

    if (channel === `jpegstripes`) {
        const arrStaleHangmanAnswers = Object.keys(lemonyFresh)
            .filter(chan => typeof lemonyFresh[chan] === `object` && !Array.isArray(lemonyFresh[chan]))
            .filter(chan => lemonyFresh[chan].hangman?.answer && !lemonyFresh[chan].hangman?.listening)
            .map(chan => lemonyFresh[chan].hangman.answer.split(``))

        if (arrStaleHangmanAnswers.length) {
            const guess = arrStaleHangmanAnswers[Math.floor(Math.random() * arrStaleHangmanAnswers.length)]
            guess.length = 4
            arrFunnyCommands.push(`!fourdle ${guess.join(` `)}`)
        }

        arrFunnyCommands.push(
            `!duel ${username}`,
            `!fightbot ${username}`,
            `!gamer ${username}`,
            `!reverse ${message}`,
            `!editme ${message}`,
            `My name is ${BOT_USERNAME} jpegstHeyGuys`
        )
    }

    if (channel === `sclarf`) {
        arrFunnyCommands.push(
            `!addcomb ${username}`,
            `!antistar ${username}`,
            `!blunt ${username}`,
            `!braincell ${username}`,
            `!cuddle ${username}`,
            `!highfive ${username}`,
            `!hug ${username}`,
            `!piss ${username}`,
            `!shit ${username}`,
            `!slap ${username}`,
            `!star ${username}`
        )
    }

    if (channel === `e1ectroma`) {
        arrFunnyCommands.push(
            `!timeout ${username}`,
            `!bog ${username}`,
            `!bong ${username}`,
            `!zeroth ${username}`,
            `!duel ${username} ${users[username].channels[channel].msgCount}`
        )
    }

    if (channel === `domonintendo1`) {
        arrFunnyCommands.push(
            `!cheese ${username}`,
            `!honey ${username}`,
            `!hotdog ${username}`,
            `!slap ${username}`,
            `!teriyaki ${username}`
        )
    }

    const response = arrFunnyCommands[Math.floor(Math.random() * arrFunnyCommands.length)]

    bot.say(chatroom, response)
}

function imagineLemons(props) {
    const { bot, chatroom, channel } = props
    const randNum = Math.floor(Math.random() * numbers.length)
    const lemonEmote = getContextEmote(`lemon`, channel)
    logMessage([`> imagineLemons(chatroom: '${chatroom}', randNum: ${randNum})`])
    bot.say(chatroom, `Imagine having ${pluralize(randNum, `lemon`, `lemons`)}... Heck, imagine having ${numbers[randNum + 1] || `one thousand`} lemons... ${lemonEmote}`)
}

function makeInsultSentence(props) {
    const { bot, chatroom } = props

    const nouns = [...wordBank.nouns]
    const verbs = [...wordBank.verbs]
    const filteredNouns = nouns.filter((el, idx) => nouns.indexOf(el) === idx)
    const filteredVerbs = verbs.filter((el, idx) => verbs.indexOf(el) === idx)

    logMessage([`> makeInsultSentence(filteredNouns: ['${filteredNouns.join(`', '`)}'], filteredVerbs: ['${filteredVerbs.join(`', '`)}'])`])
    if (filteredNouns.length < 1 || filteredVerbs.length < 2) {
        logMessage([`-> Not enough words to make a sentence`])
        return
    }

    const noun = filteredNouns[Math.floor(Math.random() * filteredNouns.length)]

    const verb1 = filteredVerbs[Math.floor(Math.random() * filteredVerbs.length)]

    let verb2 = filteredVerbs[Math.floor(Math.random() * filteredVerbs.length)]
    if (filteredVerbs.length > 1) {
        while (verb2 === verb1) {
            logMessage([`-> Verb 1: '${verb1}', verb 2: '${verb2}', re-rolling verb 2...`])
            verb2 = filteredVerbs[Math.floor(Math.random() * filteredVerbs.length)]
        }
    }

    const pronoun = [`she`, `he`, `they`][Math.floor(Math.random() * 3)]
    const message = `${pronoun} ${verb1} on my ${noun} till i ${verb2}`

    bot.say(chatroom, message)
}

function reportRandomLemCmdUsage(props) {
    const { bot, chatroom, channel } = props
    const neutralEmote = getContextEmote(`neutral`, channel)
    const negativeEmote = getContextEmote(`negative`, channel)
    const positiveEmote = getContextEmote(`positive`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)
    const dumbEmote = getContextEmote(`dumb`, channel)

    const randomCommand = Object.keys(lemCmds)[Math.floor(Math.random() * Object.keys(lemCmds).length)]
    logMessage([`> reportRandomLemCmdUsage(randomCommand: '${randomCommand}', uses: ${lemCmds[randomCommand].uses})`])

    const reply = Object.keys(lemCmds).length === 0
        ? `No lemon commands have been used! ${negativeEmote}`
        : `Lemon command "${randomCommand}" from ${lemCmds[randomCommand].origin in users ? users[lemCmds[randomCommand].origin].nickname || users[lemCmds[randomCommand].origin].displayName : lemCmds[randomCommand].origin}'s channel has been used ${pluralize(lemCmds[randomCommand].uses, `time`, `times`)}! ${lemCmds[randomCommand].uses === 0
            ? dumbEmote
            : lemCmds[randomCommand].uses < 50
                ? neutralEmote
                : lemCmds[randomCommand].uses < 100
                    ? positiveEmote
                    : hypeEmote}`
    bot.say(chatroom, reply)
}

function sayPastHangmanAnswer(props) {
    const { bot, chatroom, channel } = props
    const pastAnswer = lemonyFresh[channel].hangman.answer
    logMessage([`> sayPastHangmanAnswer(pastAnswer: '${pastAnswer}')`])
    if (lemonyFresh[channel].hangman.listening || lemonyFresh[channel].hangman.signup) {
        logMessage([`-> Aborting, Hangman game in progress`])
        return
    }
    const neutralEmote = getContextEmote(`neutral`, channel)
    if (pastAnswer) {
        bot.say(chatroom, `Do you remember when the Hangman answer was ${pastAnswer}? ${neutralEmote}`)
    }
}

function sayPastHangmanSpaces(props) {
    const { bot, chatroom, channel } = props
    const arr = lemonyFresh[channel].hangman.spaces
    logMessage([`> sayPastHangmanSpaces(arr: '${arr.join(` `)}')`])
    if (lemonyFresh[channel].hangman.listening || lemonyFresh[channel].hangman.signup) {
        logMessage([`-> Aborting, Hangman game in progress`])
        return
    }
    if (arr.length) {
        bot.say(chatroom, `${arr.join(` `)}`)
    }
}

function sayPastHangmanGuessedLetters(props) {
    const { bot, chatroom, channel } = props
    const arr = lemonyFresh[channel].hangman.guessedLetters
    logMessage([`> sayPastHangmanGuessedLetters(arr: '${arr.join(``)}')`])
    if (lemonyFresh[channel].hangman.listening || lemonyFresh[channel].hangman.signup) {
        logMessage([`-> Aborting, Hangman game in progress`])
        return
    }
    if (arr.length) {
        bot.say(chatroom, `${arr.join(``)}`)
    }
}

async function sayGameId(props) {
    const { bot, chatroom, channel } = props
    const broadcasterId = lemonyFresh[channel].id
    const twitchChannel = await apiGetTwitchChannel(broadcasterId)
    if (!twitchChannel) {
        logMessage([`-> Failed to fetch Twitch channel`])
        return
    }
    logMessage([`> sayGameId(channel: '${channel}', game_name: '${twitchChannel.game_name}', game_id: '${twitchChannel.game_id}')`])

    const reply = twitchChannel.game_id
    bot.say(chatroom, reply)
}

function rememberPastMessage(props) {
    const { bot, chatroom, channel, userNickname, message } = props
    const msg = message.split(` `)
    const neutralEmote = getContextEmote(`neutral`, channel)
    msg.length < 10
        ? setTimeout(() => bot.say(chatroom, `I'm still thinking about when ${userNickname} said "${msg.join(` `)}" ${neutralEmote}`), 10000)
        : setTimeout(() => bot.say(chatroom, `I'm still thinking about when ${userNickname} said "... ${msg.splice(4, 6).join(` `)} ..." ${neutralEmote}`), 10000)
}

module.exports = {
    rollFunNumber(props, funNumber) {
        const { bot, chatroom, tags, message, channel, username, aprilFools } = props
        logMessage([`> rollFunNumber(channel: '${channel}', tags: ${Object.keys(tags).length}, username: '${username}', message: '${message}', funNumber: ${funNumber})`])

        if (!lemonyFresh[channel].rollFunNumber) {
            logMessage([`-> rollFunNumber disabled in ${channel}'s channel`])
            return
        }

        const outcomes = {
            0: makePyramid,
            1: giveMeMoney,
            2: transferMeMoney,
            3: useRedemption,
            4: givePoints,
            5: lemonifyRandomUser,
            6: useUndertaleBot,
            7: reportChance,
            8: sayMessageID,
            9: sayTime,
            10: askAboutGame,
            11: awardLemon,
            12: useBTTVEmote,
            13: restartFunTimer,
            14: restartFunTimer,
            15: restartFunTimer,
            16: getViewers,
            17: getLurker,
            18: awardLemonToRecentChatters,
            19: useTwoEmotes,
            20: useFunnyCommand,
            21: imagineLemons,
            22: makeInsultSentence,
            23: reportRandomLemCmdUsage,
            24: sayPastHangmanAnswer,
            25: sayPastHangmanSpaces,
            26: sayPastHangmanGuessedLetters,
            27: sayGameId,
            28: rememberPastMessage
        }

        if (funNumber in outcomes) {
            logMessage([`-> Fun number`, funNumber, `matched:`, `[Function: ${outcomes[funNumber].name}]`])
            outcomes[funNumber](props)
            return
        }

        aprilFools
            ? bot.say(chatroom, `${funNumber}`)
            : logMessage([`-> Fun number`, funNumber, `is unused`])
    }
}
