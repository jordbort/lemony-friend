const BOT_USERNAME = process.env.BOT_USERNAME

// Import global settings
const { resetTxt, boldTxt, settings, grayTxt } = require(`./config`)

// Import data
const { lemonyFresh, users } = require(`./data`)

// Lemonify chat message
const { lemonify } = require(`./handleLemonify`)

// Import Twitch functions
const { getTwitchChannel } = require(`./handleTwitch`)

// Import emotes
const { getLemonEmote } = require(`./getEmotes`)

// Import user data fetches
const { getRandomUser, getRandomChannelMessage } = require("./getInfo")

// Import helper functions
const { talk } = require(`./utils`)

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
        abbreviation: ``,
        symbol: `₺`,
        zeroes: `00`
    },
    {
        name: `turkish lira`,
        abbreviation: ``,
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

async function rollFunNumber(chatroom, tags, username, msgArr, funNumber) {
    if (settings.debug) { console.log(`${boldTxt}> rollFunNumber(chatroom: ${chatroom}, tags: ${Object.keys(tags).length}, username: ${username}, msgArr.length: ${msgArr.length}, funNumber: ${funNumber})${resetTxt}`) }

    const channel = chatroom.substring(1)
    const msgCount = users[username][channel].msgCount

    const randCurrency = Math.floor(Math.random() * currencies.length)
    const currency = currencies[randCurrency]
    let randomUser = getRandomUser()

    // Make 4-wide message pyramid of first word in message
    if (funNumber === 0) {
        const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME ? 1000 : 2000
        talk(chatroom, `${msgArr[0]}`)
        setTimeout(() => talk(chatroom, `${msgArr[0]} ${msgArr[0]}`), delay)
        setTimeout(() => talk(chatroom, `${msgArr[0]} ${msgArr[0]} ${msgArr[0]}`), delay * 2)
        setTimeout(() => talk(chatroom, `${msgArr[0]} ${msgArr[0]}`), delay * 3)
        setTimeout(() => talk(chatroom, `${msgArr[0]}`), delay * 4)
    }
    // Turn message count into money
    else if (funNumber === 1) { talk(chatroom, `Give me ${currency.symbol}${msgCount}${currency.zeroes} ${currency.abbreviation.toUpperCase()}`) }
    // Turn message count into money to my account
    else if (funNumber === 2) {
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
        talk(chatroom, `${paymentMethods[paymentMethod]} ${msgCount}${currency.zeroes} ${currency.name}`)
    }
    // Activate random redeem
    else if (funNumber === 3) {
        const redeems = []
        if (lemonyFresh[channel].redeems.length === 0) {
            while (randomUser === BOT_USERNAME) { randomUser = getRandomUser() }
            redeems.push(`!slap ${randomUser}`)
        } else {
            redeems.push(...lemonyFresh[channel].redeems)
        }
        if (settings.debug) { console.log(redeems) }
        const redeem = Math.floor(Math.random() * redeems.length)
        talk(chatroom, redeems[redeem])
    }
    // Give hundreds of points (requires StreamElements)
    else if (funNumber === 4 && chatroom !== `#domonintendo1`) {
        console.log(msgCount * 50, `>=`, users[BOT_USERNAME][channel]?.points, `?`, msgCount * 50 >= users[BOT_USERNAME][channel]?.points)
        const pointsToGive = `points` in Object(users[BOT_USERNAME][channel])
            ? msgCount * 50 >= users[BOT_USERNAME][channel].points
                ? `all`
                : `${msgCount * 50}`
            : `${msgCount * 50}`
        talk(chatroom, `!give ${username} ${pointsToGive}`)
    }
    // Lemonify a random user's random chat message
    else if (funNumber === 5) {
        while (randomUser === BOT_USERNAME) { randomUser = getRandomUser() }
        const randomMsg = getRandomChannelMessage(users[randomUser])
        const lemonMsg = lemonify(randomMsg)
        talk(chatroom, lemonMsg)
    }
    // Check for UndertaleBot and interact with a random user
    else if (funNumber === 6 && `undertalebot` in users && Object.keys(users.undertalebot).includes(channel)) {
        while ([BOT_USERNAME, `undertalebot`].includes(randomUser)) { randomUser = getRandomUser() }
        const actions = [
            `!fight ${randomUser}`,
            `!act ${randomUser}`,
            `!mercy ${randomUser}`
        ]
        talk(chatroom, actions[Math.floor(Math.random() * actions.length)])
    }
    else if (funNumber === 7) { talk(chatroom, `This message has a 1/${(settings.funNumberCount * settings.funNumberTotal).toLocaleString()} chance of appearing`) }
    else if (funNumber === 8) { talk(chatroom, `${tags.id}`) }
    else if (funNumber === 9) { talk(chatroom, `${tags[`tmi-sent-ts`]}`) }
    else if (funNumber === 10) {
        const broadcaster_id = lemonyFresh[channel].id
        const twitchChannel = await getTwitchChannel(chatroom, broadcaster_id)
        const game = twitchChannel.game_name
        talk(chatroom, `How are you enjoying ${game || `the game`}?`)
    }
    else if (funNumber === 11) {
        users[username].lemons++
        talk(chatroom, `${users[username].displayName} earned one (1) lemon! ${getLemonEmote()}`)
    }
    // Random wide (and possibly cursed) BTTV emote
    else if (funNumber === 12) {
        const curseChance = [`c! `, ``, ``]
        const cursed = curseChance[Math.floor(Math.random() * curseChance.length)]

        const emotes = lemonyFresh[channel].bttvEmotes
        const emote = emotes[Math.floor(Math.random() * emotes.length)]
        talk(chatroom, `w! h! ${cursed}${emote}`)
    }
    // Re-delay (or start) a message that will post in 30 minutes
    else if ([13, 14, 15].includes(funNumber)) {
        if (!lemonyFresh[channel].funTimerGuesser) {
            clearTimeout(lemonyFresh[channel].funTimer)
            console.log(`${grayTxt}> Fun Timer has been delayed in ${chatroom} ${lemonyFresh[channel].funTimer ? `again, current value: ${lemonyFresh[channel].funTimer}` : `for the first time!`}${resetTxt}`)
            const timer = setTimeout(() => {
                lemonyFresh[channel].funTimerGuesser = username
                talk(chatroom, `Do you remember the number, ${users[username].displayName}?`)
            }, settings.funTimerDuration)
            lemonyFresh[channel].funTimer
                ? talk(chatroom, `Forget ${lemonyFresh[channel].funTimer}, now I need ${users[username].displayName} to remember ${timer}`)
                : talk(chatroom, `I need ${users[username].displayName} to remember ${timer}`)
            lemonyFresh[channel].funTimer = Number(timer)
        } else {
            console.log(`${grayTxt}> Fun Timer can't be updated because we're waiting on ${lemonyFresh[channel].funTimerGuesser} to say ${lemonyFresh[channel].funTimer}${resetTxt}`)
        }
    }
}

module.exports = { rollFunNumber }
