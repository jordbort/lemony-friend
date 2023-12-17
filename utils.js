const BOT_USERNAME = process.env.BOT_USERNAME
const OAUTH_TOKEN = process.env.OAUTH_TOKEN
const BOT_ID = 893524366
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
let ACCESS_TOKEN = process.env.ACCESS_TOKEN

// Import data
const {
    lemonyFresh,
    users,
    tempCmds
} = require(`./data`)

// Import terminal colors
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
    chatColors
} = require(`./colors`)

// Import global settings
const { funNumberCount, funNumberTotal } = require(`./config`)
let { DEBUG_MODE } = require(`./config`)

// Create bot client
const tmi = require('tmi.js')
const opts = {
    identity: {
        username: BOT_USERNAME,
        password: OAUTH_TOKEN
    },
    channels: lemonyFresh.channels
}
const client = new tmi.client(opts)

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
const numbers = [
    `zero`,
    `one`,
    `two`,
    `three`,
    `four`,
    `five`,
    `six`,
    `seven`,
    `eight`,
    `nine`,
    `ten`,
    `eleven`,
    `twelve`,
    `thirteen`,
    `fourteen`,
    `fifteen`,
    `sixteen`,
    `seventeen`,
    `eighteen`,
    `nineteen`,
    `twenty`,
    `twenty-one`,
    `twenty-two`,
    `twenty-three`,
    `twenty-four`,
    `twenty-five`,
    `twenty-six`,
    `twenty-seven`,
    `twenty-eight`,
    `twenty-nine`,
    `thirty`,
    `thirty-one`,
    `thirty-two`,
    `thirty-three`,
    `thirty-four`,
    `thirty-five`,
    `thirty-six`,
    `thirty-seven`,
    `thirty-eight`,
    `thirty-nine`,
    `forty`,
    `forty-one`,
    `forty-two`,
    `forty-three`,
    `forty-four`,
    `forty-five`,
    `forty-six`,
    `forty-seven`,
    `forty-eight`,
    `forty-nine`,
]

// Helper functions
function sayRebootMsg(chatroom) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> sayRebootMsg(chatroom: ${chatroom})${resetTxt}`) }
    const channel = chatroom.substring(1)
    const onlineMsgs = [
        `Let's see how long before I crash`,
        `🍋️`,
        `don't mind me`,
        `(just rebooting again)`,
        `(Windows 95 startup sound plays)`,
        `I'm onl`,
        `reconnecting...`,
        `I have ${Object.keys(users).length <= 50 ? `${numbers[Object.keys(users).length]} (${Object.keys(users).length})` : Object.keys(users).length} friend${Object.keys(users).length === 1 ? `` : `s`}! :D`,
        `(there ${Object.keys(tempCmds).length === 1 ? `is` : `are`} ${Object.keys(tempCmds).length} temporary command${Object.keys(tempCmds).length === 1 ? `` : `s`})`,
        `Debug mode is currently ${DEBUG_MODE ? `ON` : `OFF`}! :)`,
        `Let's play Hangman! :)`,
        `nowHasPattern has been updated to /now ha(?:s|ve) \[*(\d*)/i which makes use of capturing and non-capturing groups :)`,
        `${channel} has ${lemonyFresh[channel].emotes.length} emote${lemonyFresh[channel].emotes.length === 1 ? `` : `s`}!`
    ]
    const response = onlineMsgs[Math.floor(Math.random() * onlineMsgs.length)]
    talk(chatroom, response)
}

function sayFriends(chatroom) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> sayFriends(chatroom: ${chatroom})${resetTxt}`) }
    talk(chatroom, `I have ${Object.keys(users).length <= 50 ? `${numbers[Object.keys(users).length]} (${Object.keys(users).length})` : Object.keys(users).length} friend${Object.keys(users).length === 1 ? `` : `s`}! :D`)
}

function sayCommands(chatroom) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> sayCommands(chatroom: ${chatroom})${resetTxt}`) }
    talk(chatroom, `Commands: !greet => Say hi to one or more people, !bye => Say goodnight to someone, !hangman => Start a game of Hangman, !yell => Chat across Lemony Fresh ${users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Lemfresh ` : `🍋️`}, !away => (Optionally add an away message), !tempcmd => Make your own command! :)`)
}

function toggleDebugMode(chatroom, args) {
    const initialDebugState = DEBUG_MODE
    if (args[0]?.toLowerCase() === `on`) { DEBUG_MODE = true }
    else if (args[0]?.toLowerCase() === `off`) { DEBUG_MODE = false }
    else { DEBUG_MODE = !DEBUG_MODE }
    DEBUG_MODE === initialDebugState
        ? talk(chatroom, `Debug mode is currently ${DEBUG_MODE ? `ON` : `OFF`}! :)`)
        : talk(chatroom, `Debug mode is now ${DEBUG_MODE ? `ON` : `OFF`}! :)`)
}

function rollFunNumber(chatroom, tags, username, msgArr, funNumber) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> rollFunNumber(chatroom: ${chatroom}, tags: ${typeof tags}, username: ${username}, msgArr.length: ${msgArr.length}, funNumber: ${funNumber})${resetTxt}`) }
    const channel = chatroom.substring(1)

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
    else if (funNumber === 1) { talk(chatroom, `Give me ${currency.symbol}${users[username][channel].msgCount}${currency.zeroes} ${currency.abbreviation.toUpperCase()}`) }
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
        talk(chatroom, `${paymentMethods[paymentMethod]} ${users[username][channel].msgCount}${currency.zeroes} ${currency.name}`)
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
        if (DEBUG_MODE) { console.log(redeems) }
        const redeem = Math.floor(Math.random() * redeems.length)
        talk(chatroom, redeems[redeem])
    }
    // Give hundreds of points (requires StreamElements)
    else if (funNumber === 4 && chatroom !== domonintendo1) {
        const pointsToGive = `points` in Object(users[BOT_USERNAME][channel])
            ? users[username][channel].msgCount * 100 >= users[username][channel].points
                ? `all`
                : `${users[username][channel].msgCount * 100}`
            : `${users[username][channel].msgCount * 100}`
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
            `!fight ${users[randomUser].displayName}`,
            `!act ${users[randomUser].displayName}`,
            `!mercy ${users[randomUser].displayName}`
        ]
        talk(chatroom, actions[Math.floor(Math.random() * actions.length)])
    }
    else if (funNumber === 7) { talk(chatroom, `This message has a 1 / ${(funNumberCount * funNumberTotal).toLocaleString()} chance of appearing`) }
    else if (funNumber === 8) { talk(chatroom, `${tags.id}`) }
    else if (funNumber === 9) { talk(chatroom, `${tags[`tmi-sent-ts`]}`) }
}

function handleGivenPoints(chatroom, givingUser, pointsNum) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleGivenPoints(chatroom: ${chatroom}, givingUser: ${givingUser}, pointsNum: ${pointsNum})${resetTxt}`) }
    if (isNaN(pointsNum)) { console.log(`${redBg}${boldTxt}WARNING: pointsNum isn't a number!${resetTxt}`) }
    const channel = chatroom.substring(1)
    talk(chatroom, `Thank you for the points, ${givingUser}! :)`)
    if (`points` in Object(users[BOT_USERNAME][channel])) {
        users[BOT_USERNAME][channel].points += Number(pointsNum)
    }
    else {
        const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME ? 1000 : 2000
        setTimeout(() => talk(chatroom, `!points`), delay)
    }
    if (DEBUG_MODE) { console.log(`${boldTxt}> New points:${resetTxt}`, `points` in Object(users[BOT_USERNAME][channel]) ? users[BOT_USERNAME][channel].points : `(waiting for reply...)`) }
}

function handleSetPoints(chatroom, pointsNum) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleSetPoints(chatroom: ${chatroom}, pointsNum: ${pointsNum})${resetTxt}`) }
    if (isNaN(pointsNum)) { console.log(`${redBg}${boldTxt}WARNING: pointsNum isn't a number!${resetTxt}`) }
    const channel = chatroom.substring(1)
    if (`points` in users[BOT_USERNAME][channel] && pointsNum > users[BOT_USERNAME][channel].points) { talk(chatroom, `:D`) }
    users[BOT_USERNAME][channel].points = pointsNum
    if (DEBUG_MODE) { console.log(`${boldTxt}> New points:${resetTxt}`, users[BOT_USERNAME][channel].points) }
}

function handleLoseAllPoints(chatroom) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleLoseAllPoints(chatroom: ${chatroom})${resetTxt}`) }
    const channel = chatroom.substring(1)
    users[BOT_USERNAME][channel].points = 0
    console.log(`> Gambled ALL, LOST ALL, new amount:`, 0)
    talk(chatroom, `:(`)
    if (DEBUG_MODE) { console.log(`${boldTxt}> New points:${resetTxt}`, users[BOT_USERNAME][channel].points) }
}

async function getRandomWord() {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getRandomWord()${resetTxt}`) }
    const response = await fetch(`https://random-word-api.vercel.app/api?words=1`)
    const data = await response.json()
    if (DEBUG_MODE) { console.log(data) }
    return data[0]
}

async function hangmanInit(hangman) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> hangmanInit(hangman: ${typeof hangman})${resetTxt}`) }

    hangman.listening = true
    hangman.answer = await getRandomWord()
    hangman.spaces.length = hangman.answer.length
    hangman.spaces.fill(`_`)
    hangman.players.length = 0
    hangman.guessedLetters.length = 0
    hangman.chances = 6
    hangman.currentPlayer = 0
}

function hangmanAnnounce(chatroom) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> hangmanAnnounce(chatroom: ${chatroom})${resetTxt}`) }
    const channel = chatroom.slice(1)
    const hangman = lemonyFresh[channel].hangman

    hangman.signup = true
    talk(chatroom, `I'm thinking of a word... Type !play in the next 30 seconds to join in a game of Hangman! :)`)
    setTimeout(() => {
        if (DEBUG_MODE) { console.log(`${boldTxt}> 30 seconds has elapsed, signup window closed${resetTxt}`) }
        hangman.signup = false
        if (hangman.players.length === 0) {
            hangman.listening = false
            talk(chatroom, `No players signed up for Hangman! :(`)
        } else {
            talk(chatroom, `${hangman.players.length} player${hangman.players.length === 1 ? `` : `s`} signed up for Hangman! It's a ${hangman.answer.length}-letter word. You go first, ${users[hangman.players[0]].displayName}! :)`)
            const statusMsg = `${hangman.spaces.join(` `)} (chances: ${hangman.chances})`
            const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME ? 1000 : 2000
            setTimeout(() => talk(chatroom, statusMsg), delay)
        }
    }, 30000)
}

function checkLetter(chatroom, username, guess) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> checkLetter(chatroom: ${chatroom}, username: ${username}, guess: ${guess})${resetTxt}`) }
    const channel = chatroom.slice(1)
    const hangman = lemonyFresh[channel].hangman
    const player = users[username].displayName

    if (hangman.guessedLetters.includes(guess)) {
        const listOfLetters = hangman.guessedLetters.length === 1
            ? hangman.guessedLetters[0]
            : hangman.guessedLetters.length === 2
                ? hangman.guessedLetters.join(` and `)
                : hangman.guessedLetters.slice(0, hangman.guessedLetters.length - 1).join(`, `) + `, and ` + hangman.guessedLetters[hangman.guessedLetters.length - 1]
        return talk(chatroom, `${player}, the letter${hangman.guessedLetters.length === 1 ? `` : `s`} ${listOfLetters} ${hangman.guessedLetters.length === 1 ? `has` : `have`} already been guessed - try again!`)
    }
    hangman.guessedLetters.push(guess)
    hangman.currentPlayer++
    if (hangman.currentPlayer === hangman.players.length) { hangman.currentPlayer = 0 }
    const nextPlayer = users[hangman.players[hangman.currentPlayer]].displayName
    if (hangman.answer.includes(guess.toLowerCase())) {
        for (const [i, letter] of hangman.answer.split(``).entries()) {
            if (letter === guess.toLowerCase()) { hangman.spaces[i] = guess }
        }
        if (!hangman.spaces.includes(`_`)) {
            return solvePuzzle(chatroom, username)
        }
        talk(chatroom, `Good job ${player}, ${guess} was in the word! :) Now it's your turn, ${nextPlayer}!`)
    } else {
        hangman.chances--
        if (hangman.chances === 0) {
            hangman.listening = false
            return talk(chatroom, `Sorry ${player}, ${guess} wasn't in the word! The answer was "${hangman.answer}". Game over! :(`)
        }
        talk(chatroom, `Sorry ${player}, ${guess} wasn't in the word! Minus one chance... :( Now it's your turn, ${nextPlayer}!`)
    }
    const statusMsg = `${hangman.spaces.join(` `)} (chances: ${hangman.chances})`
    const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME ? 1000 : 2000
    setTimeout(() => talk(chatroom, statusMsg), delay)
}

function solvePuzzle(chatroom, username) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> solvePuzzle(chatroom: ${chatroom}, username: ${username})${resetTxt}`) }
    const hangman = lemonyFresh[chatroom.slice(1)].hangman

    hangman.listening = false
    return talk(chatroom, `Congratulations ${users[username].displayName}, you solved the puzzle! The answer was: "${hangman.answer}" :D`)
}

function rockPaperScissors(chatroom, username, arg) {
    const rps = [`rock`, `paper`, `scissors`]
    if (DEBUG_MODE) { console.log(`${boldTxt}> rockPaperScissors(rockPaperScissors: ${chatroom}, username: ${username}, arg: ${arg}) ${rps.includes(arg)}${resetTxt}`) }
    const botChoice = rps[Math.floor(Math.random() * rps.length)]
    const playerChoice = rps.includes(arg) ? arg : rps[Math.floor(Math.random() * rps.length)]
    const name = users[username].displayName
    let response = `${name} throws ${playerChoice}! I throw ${botChoice}`
    if ((playerChoice === `rock` && botChoice === `paper`)
        || (playerChoice === `paper` && botChoice === `scissors`)
        || (playerChoice === `scissors` && botChoice === `rock`)) { response += `. Sorry, I win! :)` }
    else if ((playerChoice === `rock` && botChoice === `scissors`)
        || (playerChoice === `paper` && botChoice === `rock`)
        || (playerChoice === `scissors` && botChoice === `paper`)) { response += `. You win! :D` }
    else { response += `, too. It's a tie! :O` }
    talk(chatroom, response)
}

function handleNewChatter(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleNewChatter(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    const greetings = [
        `Hi ${user.displayName}, welcome to the stream!`,
        `Hey ${user.displayName}, welcome to the stream!`,
        `Welcome to the stream, ${user.displayName}!`,
        `Hi ${user.displayName}, welcome in!`,
        `Hi ${user.displayName} :)`,
        `Hello @${user.displayName} welcome in!`,
        `@${user.displayName} welcome 2 ${chatroom.substring(1, 5)} strem`,
    ]
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    setTimeout(() => talk(chatroom, greeting), 5000)
}

function getLastMessage(chatroom, user, room) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getLastMessage(chatroom: ${chatroom}, user: ${user.displayName}, room: ${room})${resetTxt}`) }
    if (!(chatroom.slice(1) in user)) { return }
    room in user
        ? talk(chatroom, `${user.displayName} last said: "${user[room].lastMessage}" in ${room}'s chat!`)
        : talk(chatroom, `${user.displayName} last said: "${user[chatroom.slice(1)].lastMessage}" in ${chatroom.slice(1)}'s chat!`)
}

function getMessageCount(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getMessageCount(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    let response = `${user.displayName} has sent `
    const rooms = []
    for (const room in user) {
        if (user[room]?.msgCount) {
            rooms.push(`${user[room].msgCount} ${user[room].msgCount === 1 ? `message` : `messages`} in ${room}'s chat`)
        }
    }
    if (rooms.length > 1) {
        const lastRoom = rooms[rooms.length - 1].slice()
        rooms[rooms.length - 1] = `and ${lastRoom}`
    }
    response += `${rooms.join(`, `)}!`
    talk(chatroom, response)
}

function yell(user, msg) {
    for (const chatroom of lemonyFresh.channels) {
        talk(chatroom, `${user.displayName} says: ${msg.substring(6)}`)
    }
}

async function getDadJoke(chatroom) {
    const response = await fetch("https://icanhazdadjoke.com/", {
        headers: {
            "Accept": "application/json",
        }
    })
    const data = await response.json()
    if (DEBUG_MODE) { console.log(data) }
    data.status === 200
        ? talk(chatroom, data.joke)
        : talk(chatroom, `Error fetching dad joke! :(`)
}

async function getPokemon(chatroom, pokemon) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getPokemon(chatroom: ${chatroom}, pokemon: ${pokemon})${resetTxt}`) }
    if (!pokemon) { return }

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
    if (response.statusText !== `OK`) {
        talk(chatroom, `Pokemon ${pokemon} was not found! :(`)
        return
    }
    const data = await response.json()

    let message = `#${data.id} ${pokemon.toUpperCase()} `

    const pokemonTypes = []
    for (const types of data.types) { pokemonTypes.push(types.type.name) }
    message += `(${pokemonTypes.join(`/`)}) - ${data.abilities.length === 1 ? `Ability` : `Abilities`}: `

    const pokemonAbilities = []
    for (const abilities of data.abilities) { pokemonAbilities.push(`${abilities.ability.name}${abilities.is_hidden ? ` (hidden)` : ``}`) }
    message += `${pokemonAbilities.join(`, `)}. `

    let type1Data
    let type2Data
    const doubleDamageTo = []
    const doubleDamageFrom = []
    const halfDamageTo = []
    const halfDamageFrom = []
    const immuneTo = []
    const immuneFrom = []

    if (pokemonTypes[0]) {
        // look up one type
        const response1 = await fetch(`https://pokeapi.co/api/v2/type/${pokemonTypes[0]}`)
        type1Data = await response1.json()
        for (const damageType of type1Data.damage_relations.double_damage_to) {
            if (!doubleDamageTo.includes(damageType.name)) { doubleDamageTo.push(damageType.name) }
        }
        for (const damageType of type1Data.damage_relations.double_damage_from) {
            if (!doubleDamageFrom.includes(damageType.name)) { doubleDamageFrom.push(damageType.name) }
        }
        for (const damageType of type1Data.damage_relations.half_damage_to) {
            if (!halfDamageTo.includes(damageType.name)) { halfDamageTo.push(damageType.name) }
        }
        for (const damageType of type1Data.damage_relations.half_damage_from) {
            if (!halfDamageFrom.includes(damageType.name)) { halfDamageFrom.push(damageType.name) }
        }
        for (const damageType of type1Data.damage_relations.no_damage_to) {
            if (!immuneTo.includes(damageType.name)) { immuneTo.push(damageType.name) }
        }
        for (const damageType of type1Data.damage_relations.no_damage_from) {
            if (!immuneFrom.includes(damageType.name)) { immuneFrom.push(damageType.name) }
        }
    }
    if (pokemonTypes[1]) {
        // look up two types
        const response2 = await fetch(`https://pokeapi.co/api/v2/type/${pokemonTypes[1]}`)
        type2Data = await response2.json()
        for (const damageType of type2Data.damage_relations.double_damage_to) {
            if (!doubleDamageTo.includes(damageType.name)) { doubleDamageTo.push(damageType.name) }
        }
        for (const damageType of type2Data.damage_relations.double_damage_from) {
            if (!doubleDamageFrom.includes(damageType.name)) { doubleDamageFrom.push(damageType.name) }
        }
        for (const damageType of type2Data.damage_relations.half_damage_to) {
            if (!halfDamageTo.includes(damageType.name)) { halfDamageTo.push(damageType.name) }
        }
        for (const damageType of type2Data.damage_relations.half_damage_from) {
            if (!halfDamageFrom.includes(damageType.name)) { halfDamageFrom.push(damageType.name) }
        }
        for (const damageType of type2Data.damage_relations.no_damage_to) {
            if (!immuneTo.includes(damageType.name)) { immuneTo.push(damageType.name) }
        }
        for (const damageType of type2Data.damage_relations.no_damage_from) {
            if (!immuneFrom.includes(damageType.name)) { immuneFrom.push(damageType.name) }
        }
    }

    // if it TAKES double damage AND half damage FROM a type, remove from BOTH arrays
    const nullify = []
    for (const type of doubleDamageFrom) {
        console.log(`Looking at:`, doubleDamageFrom.indexOf(type), type)
        if (halfDamageFrom.includes(type)) {
            console.log(`Found in both:`, type)
            nullify.push(type)
        }
    }
    for (const dupe of nullify) {
        doubleDamageFrom.splice(doubleDamageFrom.indexOf(dupe), 1)
        halfDamageFrom.splice(halfDamageFrom.indexOf(dupe), 1)
    }

    // Cleaning up immunities
    for (const type of immuneFrom) {
        if (halfDamageFrom.includes(type)) {
            console.log(`"Immunity from" found in halfDamageFrom:`, type)
            halfDamageFrom.splice(halfDamageFrom.indexOf(type), 1)
        }
        if (doubleDamageFrom.includes(type)) {
            console.log(`"Immunity from" found in doubleDamageFrom:`, type)
            doubleDamageFrom.splice(doubleDamageFrom.indexOf(type), 1)
        }
    }

    if (DEBUG_MODE) {
        console.log(`nullify:`, nullify)
        console.log(`doubleDamageTo:`, doubleDamageTo)
        console.log(`doubleDamageFrom:`, doubleDamageFrom)
        console.log(`halfDamageTo:`, halfDamageTo)
        console.log(`halfDamageFrom:`, halfDamageFrom)
        console.log(`immuneTo:`, immuneTo)
        console.log(`immuneFrom:`, immuneFrom)
    }

    if (doubleDamageTo.length > 0) { message += `Super effective to ${doubleDamageTo.join(`/`)}-type Pokemon. ` }
    if (doubleDamageFrom.length > 0) { message += `Weak to ${doubleDamageFrom.join(`/`)}-type moves. ` }
    if (halfDamageTo.length > 0) { message += `Not very effective to ${halfDamageTo.join(`/`)}-type Pokemon. ` }
    if (halfDamageFrom.length > 0) { message += `Resistant to ${halfDamageFrom.join(`/`)}-type moves. ` }
    if (immuneTo.length > 0) { message += `No effect to ${immuneTo.join(`/`)}-type Pokemon. ` }
    if (immuneFrom.length > 0) { message += `No effect from ${immuneFrom.join(`/`)}-type moves.` }
    talk(chatroom, message)
}

function getColor(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getColor(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    user.color in chatColors
        ? talk(chatroom, `${user.displayName}'s chat color is ${chatColors[user.color].name}!`)
        : talk(chatroom, `${user.displayName}'s chat color is hex code ${user.color}`)
}

function getRandomUser() {
    const arr = Object.keys(users)
    const randomUser = arr[Math.floor(Math.random() * arr.length)]
    if (DEBUG_MODE) { console.log(`${boldTxt}> getRandomUser() picked: ${randomUser}${resetTxt}`) }
    return randomUser
}

function getRandomChannelMessage(user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getRandomChannelMessage(user: ${user.displayName})${resetTxt}`) }
    const allKeys = Object.keys(user)
    let channelKey = Math.floor(Math.random() * allKeys.length)
    while (![
        `lemony_friend`,
        `jpegstripes`,
        `sclarf`,
        `e1ectroma`,
        `domonintendo1`,
        `ppuyya`
    ].includes(allKeys[channelKey])) { channelKey = Math.floor(Math.random() * allKeys.length) }
    if (DEBUG_MODE) { console.log(`${boldTxt}...from ${allKeys[channelKey]}'s channel${resetTxt}`) }
    const randomMessage = user[allKeys[channelKey]].lastMessage
    return randomMessage
}

function lemonify(str) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> lemonify(str: ${str})${resetTxt}`) }
    const words = str.split(` `)
    const reservedKeywords = [
        `a`,
        `an`,
        `this`,
        `that`,
        `one`,
        `the`,
        `my`,
        `your`,
        `his`,
        `her`,
        `its`,
        `our`,
        `their`,
        `for`,
        `and`,
        `nor`,
        `by`,
        `or`,
        `yet`,
        `so`,
        `if`,
        `when`,
        `of`,
        `on`,
        `these`,
        `those`,
        `many`,
        `some`,
        `zero`,
        `one`,
        `two`,
        `three`,
        `four`,
        `five`,
        `six`,
        `seven`,
        `eight`,
        `nine`,
        `ten`,
        `eleven`,
        `twelve`,
        `thirteen`,
        `fourteen`,
        `fifteen`,
        `sixteen`,
        `seventeen`,
        `eightteen`,
        `nineteen`,
        `twenty`,
        `thirty`,
        `forty`,
        `fifty`,
        `sixty`,
        `seventy`,
        `eighty`,
        `ninety`,
        `hundred`,
        `thousand`,
        `million`,
        `billion`,
        `trillion`,
        `quadrillion`
    ]

    // Reading from last word to first
    for (let i = words.length - 1; i >= 0; i--) {
        const number = Number(words[i])
        const append = []

        // Shaving non-alphanumeric characters from the end of the next word (the word it might decide to replace with "lemon")
        while (words[i + 1] && words[i + 1].match(/[^a-z0-9]$/i)) {
            append.push(words[i + 1][words[i + 1].length - 1])
            words[i + 1] = words[i + 1].substring(0, words[i + 1].length - 1)
        }
        append.reverse()

        // Definitely singular
        if ((
            number === 1
            || [
                `a`,
                `an`,
                `this`,
                `that`,
                `one`
            ].includes(words[i].toLowerCase())
            && !reservedKeywords.includes(words[i + 1]))
            && words[i + 1]
        ) {
            if (words[i].toLowerCase() === `an`) { words[i] = `a` }
            words[i + 1] = `lemon${append.join(``)}`
        }

        // Definitely plural
        else if ((
            ((number || number === 0) && number !== 1)
            // If a number spelled out, or "these/those/many/some"
            || [
                `these`,
                `those`,
                `many`,
                `some`,
                `zero`,
                `two`,
                `three`,
                `four`,
                `five`,
                `six`,
                `seven`,
                `eight`,
                `nine`,
                `ten`,
                `eleven`,
                `twelve`,
                `thirteen`,
                `fourteen`,
                `fifteen`,
                `sixteen`,
                `seventeen`,
                `eightteen`,
                `nineteen`,
                `twenty`,
                `thirty`,
                `forty`,
                `fifty`,
                `sixty`,
                `seventy`,
                `eighty`,
                `ninety`,
                `hundred`,
                `thousand`,
                `million`,
                `billion`,
                `trillion`,
                `quadrillion`
            ].includes(words[i].toLowerCase()))
            && words[i + 1]
            && !reservedKeywords.includes(words[i + 1])
        ) { words[i + 1] = `lemons${append.join(``)}` }

        // Ambiguous count
        else if ((
            [`the`,
                `my`,
                `your`,
                `his`,
                `her`,
                `its`,
                `whose`,
                `our`,
                `their`,
                `for`,
                `and`,
                `nor`,
                `by`,
                `or`,
                `yet`,
                `so`,
                `if`,
                `when`,
                `of`,
                `on`,
                `to`
            ].includes(words[i].toLowerCase()))
            && words[i + 1]
            && !reservedKeywords.includes(words[i + 1])
        ) { words[i + 1] = words[i + 1].match(/[^s][s]$/i) ? `lemons${append.join(``)}` : `lemon${append.join(``)}` }
        else if (words[i + 1]) { words[i + 1] = `${words[i + 1]}${append.join(``)}` }
    }

    const lemonifiedString = words.join(` `)
    return lemonifiedString
}

function handleTempCmd(chatroom, username, args) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleTempCmd(chatroom: ${chatroom}, args: ${args})${resetTxt}`) }
    if (!args[1]) { return talk(chatroom, `Hey ${users[username].displayName}, use this command like: !tempcmd [commandname] [response...]! :)`) }
    if (args[0].toLowerCase() === `delete`) {
        if (args[1].toLowerCase() in tempCmds) {
            delete tempCmds[args[1].toLowerCase()]
            return talk(chatroom, `Command "${args[1].toLowerCase()}" has been deleted! :)`)
        } else {
            return talk(chatroom, `No command "${args[1].toLowerCase()}" was found! :(`)
        }
    }
    else if (args[0].toLowerCase() in tempCmds) {
        tempCmds[args[0].toLowerCase()] = args.slice(1).join(` `)
        return talk(chatroom, `Command "${args[0].toLowerCase()}" has been edited! :)`)
    } else {
        tempCmds[args[0].toLowerCase()] = args.slice(1).join(` `)
        return talk(chatroom, `Temporary command "${args[0].toLowerCase()}" has been added! :)`)
    }
}

function handleGreet(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleGreet(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
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
    let response = `${greetings[greeting]} ${user.displayName}`

    // If the greeting is "Howdy"
    if (greeting === 0) {
        response += `! :)`
    } else if (greeting < greetings.indexOf(`Hello`)) {
        // If there's a comma after the greeting
        const appends = [
            `How are you doing today?`,
            `How are you today?`,
            `How are you doing?`,
            `How are you?`,
            `How's it going?`,
            `How goes it?`
        ]
        response += `! ${appends[Math.floor(Math.random() * appends.length)]} :)`
    } else {
        // If there's no comma after the greeting
        const appends = [
            `how are you doing today?`,
            `how are you today?`,
            `how are you doing?`,
            `how are you?`,
            `how's it going?`,
            `how goes it?`
        ]
        response += `, ${appends[Math.floor(Math.random() * appends.length)]} :)`
    }
    talk(chatroom, response)
}

function handleMassGreet(chatroom, arr) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleGreet(chatroom: ${chatroom}, arr: ${arr})${resetTxt}`) }
    const response = []
    const greetings = [
        `hello`,
        `howdy`,
        `hey`,
        `hi`
    ]
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
    const emotes = [
        `HeyGuys`,
        `:)`
    ]
    if (users[BOT_USERNAME]?.[`sclarf`]?.sub) { emotes.push(`sclarfWobble`, `sclarfPls`, `sclarfPog`, `sclarfHowdy`, `sclarfDog`, `sclarfHearts`) }
    if (users[BOT_USERNAME]?.[`domonintendo1`]?.sub) { emotes.push(`domoni6ChefHey`, `domoni6Sneeze`, `domoni6Love`) }
    if (users[BOT_USERNAME]?.[`e1ectroma`]?.sub) { emotes.push(`e1ectr4Pikadance`, `e1ectr4Tromadance`, `e1ectr4Hello`, `e1ectr4Hi`, `e1ectr4Smile`, `e1ectr4Ram`, `e1ectr4Salute`, `e1ectr4Lemfresh`) }
    if (users[BOT_USERNAME]?.[`jpegstripes`]?.sub) { emotes.push(`jpegstBamJAM`, `jpegstKylePls`, `jpegstJulian`, `jpegstHeyGuys`, `jpegstSlay`) }
    const randomEmote = emotes[Math.floor(Math.random() * emotes.length)]
    for (let str of arr) {
        while (str.startsWith(`@`)) { str = str.substring(1) }
        str.toLowerCase() in users
            ? response.push(`${randomGreeting} ${users[str.toLowerCase()].displayName} ${randomEmote}`)
            : response.push(`${randomGreeting} ${str} ${randomEmote}`)
    }
    talk(chatroom, response.join(` `))
}

function handleGreetAll(chatroom) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleGreetAll(chatroom: ${chatroom})${resetTxt}`) }
    const channel = chatroom.substring(1)
    const usersToGreet = []
    const response = []
    const greetings = [
        `hello`,
        `howdy`,
        `hey`,
        `hi`
    ]
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
    const emotes = [
        `HeyGuys`,
        `:)`
    ]
    if (users[BOT_USERNAME]?.[`sclarf`]?.sub) { emotes.push(`sclarfWobble`, `sclarfPls`, `sclarfPog`, `sclarfHowdy`, `sclarfDog`, `sclarfHearts`) }
    if (users[BOT_USERNAME]?.[`domonintendo1`]?.sub) { emotes.push(`domoni6ChefHey`, `domoni6Sneeze`, `domoni6Love`) }
    if (users[BOT_USERNAME]?.[`e1ectroma`]?.sub) { emotes.push(`e1ectr4Pikadance`, `e1ectr4Tromadance`, `e1ectr4Hello`, `e1ectr4Hi`, `e1ectr4Smile`, `e1ectr4Ram`, `e1ectr4Salute`, `e1ectr4Lemfresh`) }
    if (users[BOT_USERNAME]?.[`jpegstripes`]?.sub) { emotes.push(`jpegstBamJAM`, `jpegstKylePls`, `jpegstJulian`, `jpegstHeyGuys`, `jpegstSlay`) }
    const randomEmote = emotes[Math.floor(Math.random() * emotes.length)]
    for (const user in users) {
        if (user !== BOT_USERNAME && channel in users[user]) {
            usersToGreet.push(users[user].displayName)
        }
    }
    for (const user of usersToGreet) {
        response.push(`${randomGreeting} ${user} ${randomEmote}`)
    }
    talk(chatroom, response.join(` `))
}

function sayGoodnight(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleGreet(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    const greetings = [
        `Bye`,
        `Good night,`,
        `Sleep well,`,
        `See you next time,`,
        `Have a good night,`
    ]
    const greeting = Math.floor(Math.random() * greetings.length)
    let response = `${greetings[greeting]} ${user.displayName}`
    if (greeting === 0) {
        const appends = [
            `sleep well`,
            `see you next time`,
            `have a good night`,
        ]
        response += `, ${appends[Math.floor(Math.random() * appends.length)]}`
    }
    response += `! :)`
    talk(chatroom, response)
}

function sayYoureWelcome(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> sayYoureWelcome(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    const welcomes = [
        `${user.displayName}`,
        `You're welcome, ${user.displayName}`,
        `No problem, ${user.displayName}`,
        `My pleasure, ${user.displayName}`,
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
    response += `! :)`
    talk(chatroom, response)
}

function sayThanks(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> sayThanks(chatroom: ${chatroom}, user: ${user.displayName})${resetTxt}`) }
    const thanks = [
        `${user.displayName}`,
        `Thanks, ${user.displayName}`,
        `Thanks, ${user.displayName}`,
        `Thanks, ${user.displayName}`,
        `Thank you, ${user.displayName}`,
        `Thank you, ${user.displayName}`,
        `Thank you, ${user.displayName}`,
        `Thank you so much, ${user.displayName}`,
        `Hey thanks, ${user.displayName}`,
        `Aw thanks, ${user.displayName}`
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
    response += `! :)`
    talk(chatroom, response)
}

function handleColorChange(chatroom, user, newColor) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleColorChange(chatroom: ${chatroom}, user: ${user.displayName}, newColor: ${newColor})${resetTxt}`) }
    user.color = newColor
    talk(chatroom, `Acknowledging ${user.displayName}'s color change :)`)
}

function handleTurboChange(chatroom, user, turboStatus) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleTurboChange(chatroom: ${chatroom}, user: ${user.displayName}, turboStatus: ${turboStatus})${resetTxt}`) }
    user.turbo = turboStatus
    turboStatus ? talk(chatroom, `Wow, ${user.displayName} got Turbo? :D`) : talk(chatroom, `Did ${user.displayName} stop having Turbo? :O`)
}

function handleSubChange(chatroom, user, subStatus) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleSubChange(chatroom: ${chatroom}, user: ${user.displayName}, subStatus: ${subStatus})${resetTxt}`) }
    user[chatroom.slice(1)].sub = subStatus
    if (user.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => subStatus
            ? talk(chatroom, `Thank you for the gift sub! :D`)
            : talk(chatroom, `Aww, did I lose my sub? :(`), 2000)
    } else {
        subStatus
            ? talk(chatroom, `Wow, ${user.displayName} is subbed now! :D`)
            : talk(chatroom, `Did ${user.displayName} just lose their sub? :O`)
    }
}

function handleModChange(chatroom, user, modStatus) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleModChange(chatroom: ${chatroom}, user: ${user.displayName}, modStatus: ${modStatus})${resetTxt}`) }
    user[chatroom.slice(1)].mod = modStatus
    if (user.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => modStatus
            ? talk(chatroom, `Thank you for modding me! :D`)
            : talk(chatroom, `Was I just unmodded? :O`), 2000)
    } else {
        modStatus
            ? talk(chatroom, `Wow, ${user.displayName} became a mod! :D`)
            : talk(chatroom, `Was ${user.displayName} just unmodded? :O`)
    }
}

function handleVIPChange(chatroom, user, vipStatus) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleVIPChange(chatroom: ${chatroom}, user: ${user.displayName}, vipStatus: ${vipStatus})${resetTxt}`) }
    user[chatroom.slice(1)].vip = vipStatus
    if (user.displayName.toLowerCase() === BOT_USERNAME) {
        setTimeout(() => vipStatus
            ? talk(chatroom, `Thank you for giving me VIP! :D`)
            : talk(chatroom, `Did I just lose VIP? :O`), 2000)
    } else {
        vipStatus
            ? talk(chatroom, `Wow, ${user.displayName} became a VIP! :D`)
            : talk(chatroom, `Did ${user.displayName} just lose VIP status? :O`)
    }
}

function checkEmoteStreak(chatroom, emoteArr, channel) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> checkEmoteStreak(chatroom: ${chatroom}, emoteArr.length: ${emoteArr.length}, channel: ${channel})${resetTxt}`) }
    let emoteStreakCount = 0
    const emoteStreakUsers = []
    // Checking if message includes any of the provided emotes
    for (const user in users) {
        for (const str of emoteArr) {
            if (user !== BOT_USERNAME && users[user][channel]?.lastMessage.includes(str)) {
                emoteStreakCount++
                emoteStreakUsers.push(users[user].displayName)
                if (emoteStreakCount >= 2) { console.log(`${boldTxt}Looking for ${emoteArr[0].substring(0, 4)} emotes... ${emoteStreakCount}/4 messages - ${emoteStreakUsers.join(`, `)}${resetTxt}`) }
                break
            }
        }
        if (emoteStreakCount >= 4) {
            delayListening()
            return emoteReply(chatroom, emoteArr)
        }
    }
}

function emoteReply(chatroom, emoteArr) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> emoteReply(chatroom: ${chatroom}, emoteArr: ${emoteArr})${resetTxt}`) }
    const channel = chatroom.substring(1)
    const popularEmotes = Array(emoteArr.length).fill(0)
    for (const [i, val] of emoteArr.entries()) {
        for (const user in users) {
            if (channel in users[user]) {
                const words = users[user][channel].lastMessage.split(` `)
                for (const str of words) {
                    if (str === val) {
                        popularEmotes[i]++
                        console.log(`${boldTxt}...${val} increased to ${popularEmotes[i]} from ${users[user].displayName}${resetTxt}`)
                    }
                }
            }
        }
    }
    const mostVotes = Math.max(...popularEmotes)
    const mostPopularEmoteIdx = popularEmotes.indexOf(mostVotes)
    const mostPopularEmote = emoteArr[mostPopularEmoteIdx]
    console.log(popularEmotes, mostPopularEmoteIdx, mostVotes, mostPopularEmote)
    talk(chatroom, `${mostPopularEmote} ${mostPopularEmote} ${mostPopularEmote} ${mostPopularEmote}`)
}

function delayListening() {
    const delayTime = 30
    console.log(`${boldTxt}> delayListening() ${delayTime} seconds...${resetTxt}`)
    listening = false
    setTimeout(() => {
        listening = true
        console.log(`${boldTxt}> Listening for streaks again!${resetTxt}`)
    }, delayTime * 1000)
}

function ping(arr) {
    for (const [i, str] of arr.entries()) {
        setTimeout(() => { talk(str, `hi :)`) }, 1000 * i)
    }
}

function cleanupSpaces(str) {
    let newStr = ``
    for (let i = 0; i < str.length; i++) {
        if (!(str[i] === ` ` && str[i + 1] === ` `)) {
            newStr += str[i]
        } else if (DEBUG_MODE) { console.log(`${boldTxt}> cleanupSpaces() removed a double space!${resetTxt}`) }
    }
    return newStr
}

function getToUser(str) {
    let toUser = str
    while (toUser.startsWith(`@`)) { toUser = toUser.substring(1) }
    return toUser
}

function printLemon() {
    const noSq = `  `
    const bkSq = `\x1b[40m  \x1b[0m`
    const gnSq = `\x1b[42m  \x1b[0m`
    const ywSq = `\x1b[43m  \x1b[0m`
    const whSq = `\x1b[47m  \x1b[0m`
    const lemonyFriendTitleSpacedOutTopTextYayyyy = `${yellowBg}${boldTxt}L e m o n y ${resetTxt}`
    const lemonyFriendTitleSpacedOutBottomTextYay = `${yellowBg}${boldTxt}F r i e n d ${resetTxt}`
    console.log(noSq + noSq + noSq + noSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + gnSq + bkSq + noSq + noSq + noSq + noSq + bkSq + bkSq + bkSq + bkSq + bkSq + bkSq + bkSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + bkSq + gnSq + gnSq + bkSq + bkSq + bkSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq + bkSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + bkSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + bkSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + bkSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + bkSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + bkSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + whSq + whSq + whSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + whSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + bkSq + gnSq + gnSq + gnSq + gnSq + gnSq + gnSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + bkSq + gnSq + gnSq + gnSq + gnSq + bkSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + gnSq + bkSq + noSq + noSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + lemonyFriendTitleSpacedOutTopTextYayyyy + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + bkSq + gnSq + gnSq + bkSq + noSq + noSq + noSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + lemonyFriendTitleSpacedOutBottomTextYay + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + bkSq + bkSq + noSq + noSq + noSq + noSq + noSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + bkSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + bkSq + bkSq + bkSq + ywSq + ywSq + ywSq + ywSq + ywSq + bkSq + bkSq + bkSq + bkSq + bkSq)
    console.log(noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + noSq + bkSq + bkSq + bkSq + bkSq + bkSq)
}

async function getTwitchUser(chatroom, username) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getTwitchUser(chatroom: ${chatroom}, username: ${username})${resetTxt}`) }

    const endpoint = `https://api.twitch.tv/helix/users?login=${username}`
    const headers = {
        authorization: `Bearer ${ACCESS_TOKEN}`,
        "Client-Id": CLIENT_ID
    }

    const response = await fetch(endpoint, { headers })
    const userInfo = await response.json()
    console.log(userInfo)

    return `error` in userInfo
        ? talk(chatroom, userInfo.error)
        : userInfo.data.length === 0
            ? talk(chatroom, `No user ${username} was found! :(`)
            : userInfo.data[0]
}

async function banTwitchUser(chatroom, username) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> banTwitchUser(chatroom: ${chatroom}, username: ${username})${resetTxt}`) }
    const channel = chatroom.substring(1)

    const bannedUser = await getTwitchUser(chatroom, username)
    if (!bannedUser) { return }
    const bannedUserId = await bannedUser.id
    const requestBody = {
        data: {
            user_id: bannedUserId
        }
    }
    // const broadcaster = await getTwitchUser(chatroom, channel)
    // const chatroomId = await broadcaster.id
    // const bot = await getTwitchUser(chatroom, `lemony_friend`)
    // const botId = await bot.id

    const endpoint = `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${lemonyFresh[channel].id}&moderator_id=${BOT_ID}`
    // const endpoint = `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${chatroomId}&moderator_id=${botId}`
    const options = {
        method: 'POST',
        headers: {
            authorization: `Bearer ${ACCESS_TOKEN}`,
            'Client-Id': CLIENT_ID,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    }

    console.log(endpoint, options)
    const response = await fetch(endpoint, options)
    const data = await response.json()
    console.log(data)

    return `message` in data
        ? talk(chatroom, data.message)
        : talk(chatroom, `Did it work???`)
}

async function getTwitchChannel(chatroom, broadcaster_id) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getTwitchChannel(broadcaster_id: ${broadcaster_id})${resetTxt}`) }

    const endpoint = `https://api.twitch.tv/helix/channels?broadcaster_id=${broadcaster_id}`
    const headers = {
        authorization: `Bearer ${ACCESS_TOKEN}`,
        "Client-Id": CLIENT_ID
    }

    const response = await fetch(endpoint, { headers })
    const channelnfo = await response.json()

    return channelnfo?.data[0] || talk(chatroom, `There was a problem getting the channel info! :(`)
}

async function getTwitchAuthorization() {
    if (DEBUG_MODE) { console.log(`${boldTxt}> getTwitchAuthorization()${resetTxt}`) }
    const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
    const response = await fetch(url, { method: "POST" })
    const token = await response.json()
    console.log(`${grayTxt}${JSON.stringify(token)}${resetTxt}`)
    ACCESS_TOKEN = token.access_token
}

async function handleShoutOut(chatroom, user) {
    if (DEBUG_MODE) { console.log(`${boldTxt}> handleShoutOut(chatroom: ${chatroom}, user: ${user})${resetTxt}`) }
    const twitchUser = await getTwitchUser(chatroom, user)
    const stream = await getTwitchChannel(chatroom, twitchUser.id)
    talk(chatroom, `Let's give a shoutout to ${stream.broadcaster_name}! They were last playing ${stream.game_name}${twitchUser.broadcaster_type ? ` and are a Twitch ${twitchUser.broadcaster_type}!` : `.`} Follow them here: https://www.twitch.tv/${stream.broadcaster_login} :)`)
}

function talk(chatroom, msg) {
    const time = new Date().toLocaleTimeString()
    client.say(chatroom, msg)
    console.log(`${yellowBg}[${time}] <${chatroom.slice(1)}> ${BOT_USERNAME}: ${msg}${resetTxt}`)
}

module.exports = {
    client,
    sayRebootMsg,
    sayFriends,
    sayCommands,
    toggleDebugMode,
    rollFunNumber,
    handleGivenPoints,
    handleSetPoints,
    handleLoseAllPoints,
    getRandomWord,
    hangmanInit,
    hangmanAnnounce,
    checkLetter,
    solvePuzzle,
    rockPaperScissors,
    handleNewChatter,
    getLastMessage,
    getMessageCount,
    yell,
    getDadJoke,
    getPokemon,
    getColor,
    getRandomUser,
    getRandomChannelMessage,
    lemonify,
    handleTempCmd,
    handleGreet,
    handleMassGreet,
    handleGreetAll,
    sayGoodnight,
    sayYoureWelcome,
    sayThanks,
    handleColorChange,
    handleTurboChange,
    handleSubChange,
    handleModChange,
    handleVIPChange,
    checkEmoteStreak,
    emoteReply,
    delayListening,
    ping,
    cleanupSpaces,
    getToUser,
    printLemon,
    getTwitchUser,
    banTwitchUser,
    getTwitchChannel,
    getTwitchAuthorization,
    handleShoutOut,
    talk
}
