const BOT_USERNAME = process.env.BOT_USERNAME
const { lemonyFresh, users } = require(`../data`)
const { grayTxt, resetTxt, settings } = require(`../config`)
const { pluralize, getHypeEmote, getPositiveEmote, getUpsetEmote, getNegativeEmote } = require(`../utils`)

async function getRandomWord() {
    if (settings.debug) { console.log(`${grayTxt}> getRandomWord()${resetTxt}`) }

    const response = await fetch(`https://random-word-api.vercel.app/api?words=1`)
    const data = await response.json()
    if (settings.debug) { console.log(data) }
    return data[0]
}

async function hangmanInit(channel, username) {
    if (settings.debug) { console.log(`${grayTxt}> hangmanInit(channel: '${channel}', username: '${username}')${resetTxt}`) }
    const hangman = lemonyFresh[channel].hangman

    hangman.listening = true
    hangman.answer = await getRandomWord()
    hangman.spaces = Array(hangman.answer.length).fill(`_`)
    hangman.players.length = 0
    hangman.guessedLetters.length = 0
    hangman.chances = settings.hangmanChances
    hangman.currentPlayer = 0
    hangman.players.push(username)
}

function solvePuzzle(bot, chatroom, username) {
    if (settings.debug) { console.log(`${grayTxt}> solvePuzzle(chatroom: '${chatroom}', username: '${username}')${resetTxt}`) }

    const channel = chatroom.substring(1)
    const user = users[username]
    const hangman = lemonyFresh[channel].hangman
    const hypeEmote = getHypeEmote(channel)
    hangman.listening = false
    user.hangmanWins++
    bot.say(chatroom, `Congratulations, the answer was: "${hangman.answer}"! ${user.nickname || user.displayName} has solved ${pluralize(user.hangmanWins, `Hangman game`, `Hangman games`)}! ${hypeEmote}`)
}

function hangmanAnnounce(bot, chatroom, userNickname) {
    if (settings.debug) { console.log(`${grayTxt}> hangmanAnnounce(chatroom: '${chatroom}', userNickname: '${userNickname}')${resetTxt}`) }

    const channel = chatroom.substring(1)
    const hypeEmote = getHypeEmote(channel)
    const positiveEmote = getPositiveEmote(channel)
    const hangman = lemonyFresh[channel].hangman

    hangman.signup = true
    bot.say(chatroom, `${userNickname} has started a game of Hangman! Type !play in the next ${settings.hangmanSignupSeconds} seconds if you'd like to join in, too! ${hypeEmote}`)

    // After signup period has ended, close signup window, shuffle players, and start game
    setTimeout(() => {
        hangman.signup = false
        if (settings.debug) { console.log(`${grayTxt}-> ${settings.hangmanSignupSeconds} seconds has elapsed, signup window closed - players: ${hangman.players.join(`, `)}${resetTxt}`) }
        hangman.players.sort(() => Math.random() - 0.5)
        const firstPlayer = users[hangman.players[0]].nickname || users[hangman.players[0]].displayName
        bot.say(chatroom,
            `${hangman.players.length} player${hangman.players.length === 1
                ? ``
                : `s`
            } signed up for Hangman! It's a ${hangman.answer.length}-letter word. You go first, ${firstPlayer}! ${positiveEmote}`
        )
        // First round
        const statusMsg = `${hangman.spaces.join(` `)} (chances: ${hangman.chances})`
        const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip ? 1000 : 2000
        setTimeout(() => bot.say(chatroom, statusMsg), delay)
    }, settings.hangmanSignupSeconds * 1000)
}

module.exports = {
    startHangman(props) {
        const { bot, chatroom, channel, username, userNickname } = props
        if (settings.debug) { console.log(`${grayTxt}> startHangman(chatroom: '${chatroom}')${resetTxt}`) }

        // In case a Hangman game is already in progress in the channel
        const hangman = lemonyFresh[channel].hangman
        if (hangman.listening) {
            const currentPlayer = hangman.players[hangman.currentPlayer]
            return hangman.signup
                ? bot.say(chatroom, `A game of Hangman is starting, type !play to join!`)
                : bot.say(chatroom,
                    `A game of Hangman is already in progress! It's currently ${username === currentPlayer
                        ? `your`
                        : `${users[currentPlayer].nickname || users[currentPlayer].displayName}'s`
                    } turn.`
                )
        }

        hangmanInit(channel, username)
        hangmanAnnounce(bot, chatroom, userNickname)
    },
    joinHangman(props) {
        const { bot, chatroom, channel, username, userNickname } = props
        if (settings.debug) { console.log(`${grayTxt}> joinHangman(chatroom: '${chatroom}', userNickname: '${userNickname}')${resetTxt}`) }

        const hangman = lemonyFresh[channel].hangman
        if (hangman.listening) {
            if (hangman.signup) {
                if (hangman.players.includes(username)) {
                    if (settings.debug) { console.log(`${grayTxt}-> ${username} already in ${channel}'s Hangman players: ${hangman.players.join(`, `)}${resetTxt}`) }
                } else {
                    hangman.players.push(username)
                    if (settings.debug) { console.log(`${grayTxt}-> ${username} added to ${channel}'s Hangman players: ${hangman.players.join(`, `)}${resetTxt}`) }
                }
            } else if (!hangman.players.includes(username)) {
                hangman.players.push(username)
                if (settings.debug) { console.log(`${grayTxt}-> ${username} added to ${channel}'s Hangman players: ${hangman.players.join(`, `)}}${resetTxt}`) }
                const positiveEmote = getPositiveEmote(channel)
                bot.say(chatroom, `${userNickname}, you can still hop in, you'll go after everyone else! ${positiveEmote}`)
            }
        } else {
            if (settings.debug) { console.log(`${grayTxt}-> Hangman game is not currently in progress for ${channel}${resetTxt}`) }
        }
    },
    checkLetter(props) {
        const { bot, chatroom, message, channel, username, userNickname } = props
        const guess = message.toUpperCase()
        if (settings.debug) { console.log(`${grayTxt}> checkLetter(chatroom: '${chatroom}', username: '${username}', guess: '${guess}')${resetTxt}`) }
        const hangman = lemonyFresh[channel].hangman

        // Already guessed letter
        const guessLetters = hangman.guessedLetters
        if (guessLetters.includes(guess)) {
            const listOfLetters = guessLetters.map((letter, i) => {
                if (i === guessLetters.length - 1 && i !== 0) { letter = `and ${letter}` }
                return letter
            })
            return bot.say(chatroom,
                `${userNickname}, the letter${guessLetters.length === 1
                    ? ``
                    : `s`
                } ${listOfLetters.length > 2
                    ? listOfLetters.join(`, `)
                    : listOfLetters.join(` `)
                } ${guessLetters.length === 1
                    ? `has`
                    : `have`} already been guessed - try again!`
            )
        }
        guessLetters.push(guess)

        // Set up for next round
        hangman.currentPlayer++
        if (hangman.currentPlayer === hangman.players.length) { hangman.currentPlayer = 0 }
        const nextPlayer = users[hangman.players[hangman.currentPlayer]].nickname || users[hangman.players[hangman.currentPlayer]].displayName
        const hypeEmote = getHypeEmote(channel)
        const negativeEmote = getNegativeEmote(channel)

        if (hangman.answer.includes(guess.toLowerCase())) {
            // Correct guess
            for (const [i, letter] of hangman.answer.split(``).entries()) {
                if (letter === guess.toLowerCase()) { hangman.spaces[i] = guess }
            }
            // If no spaces left, puzzle has been solved
            if (!hangman.spaces.includes(`_`)) { return solvePuzzle(bot, chatroom, username) }
            bot.say(chatroom, `Good job ${userNickname}, ${guess} was in the word! ${hypeEmote} Now it's your turn, ${nextPlayer}!`)
        } else {
            // Wrong answer, check for game over
            hangman.chances--
            if (hangman.chances === 0) {
                hangman.listening = false
                const upsetEmote = getUpsetEmote(channel)
                return bot.say(chatroom, `Sorry ${userNickname}, ${guess} wasn't in the word! The answer was "${hangman.answer}". Game over! ${upsetEmote}`)
            }
            bot.say(chatroom, `Sorry ${userNickname}, ${guess} wasn't in the word! ${pluralize(hangman.chances, `chance left...`, `chances left!`)} ${negativeEmote} Now it's your turn, ${nextPlayer}!`)
        }

        // Next round
        const statusMsg = `${hangman.spaces.join(` `)} (chances: ${hangman.chances})`
        const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME ? 1000 : 2000
        setTimeout(() => bot.say(chatroom, statusMsg), delay)
    },
    checkWord(props) {
        const { bot, chatroom, message, channel, username, userNickname } = props
        const guess = message.toLowerCase()
        if (settings.debug) { console.log(`${grayTxt}> checkWord(chatroom: '${chatroom}', username: '${username}', guess: '${guess}')${resetTxt}`) }
        const hangman = lemonyFresh[channel].hangman

        // Correct guess
        if (guess === hangman.answer) { return solvePuzzle(bot, chatroom, username) }

        // Wrong answer, check for game over
        hangman.chances--
        if (hangman.chances === 0) {
            hangman.listening = false
            const upsetEmote = getUpsetEmote(channel)
            return bot.say(chatroom, `Sorry ${userNickname}, "${guess}" wasn't the answer! The answer was "${hangman.answer}". Game over! ${upsetEmote}`)
        }

        // Set up for next round
        hangman.currentPlayer++
        if (hangman.currentPlayer === hangman.players.length) { hangman.currentPlayer = 0 }
        const negativeEmote = getNegativeEmote(channel)

        // Next round
        const nextPlayer = users[hangman.players[hangman.currentPlayer]].nickname || users[hangman.players[hangman.currentPlayer]].displayName
        bot.say(chatroom, `Sorry ${userNickname}, "${guess}" wasn't the answer! ${pluralize(hangman.chances, `chance left...`, `chances left!`)} ${negativeEmote} Now it's your turn, ${nextPlayer}!`)
        const statusMsg = `${hangman.spaces.join(` `)} (chances: ${hangman.chances})`
        const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME ? 1000 : 2000
        setTimeout(() => bot.say(chatroom, statusMsg), delay)
    }
}
