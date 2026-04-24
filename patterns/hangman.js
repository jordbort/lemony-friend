const BOT_USERNAME = process.env.BOT_USERNAME

const { settings, lemonyFresh, users } = require(`../data`)
const { pluralize, getContextEmote, logMessage, arrToList } = require(`../utils`)

const { apiGetRandomWord } = require(`../commands/external`)

const setDelay = (channel) => users[BOT_USERNAME].channels[channel].mod || users[BOT_USERNAME].channels[channel].vip || channel === BOT_USERNAME ? 1000 : 2000

async function getRandomWord() {
    await logMessage([`> getRandomWord()`])

    try {
        const response = await fetch(`https://random-word-api.vercel.app/api?words=1`)
        const data = await response.json()
        await logMessage([`-> Random word:`, data])
        return data[0]
    } catch (err) {
        logMessage([`getRandomWord ${err}`])
        return false
    }
}

async function hangmanInit(channel, username, aprilFools) {
    await logMessage([`> hangmanInit(channel: '${channel}', username: '${username}')`])
    const hangman = lemonyFresh[channel].hangman

    let randomWord = await getRandomWord()
    if (!randomWord) { randomWord = await apiGetRandomWord(aprilFools) }
    if (!randomWord) { return false }

    hangman.listening = true
    hangman.answer = randomWord.toLowerCase()
    hangman.spaces = Array(hangman.answer.length).fill(`_`)
    hangman.players.length = 0
    hangman.guessedLetters.length = 0
    hangman.chances = settings.hangmanChances
    hangman.currentPlayer = 0
    hangman.players.push(username)

    return true
}

function getNextPlayer(hangman) {
    hangman.currentPlayer++
    if (hangman.currentPlayer === hangman.players.length) { hangman.currentPlayer = 0 }
    const nextPlayer = users[hangman.players[hangman.currentPlayer]].nickname || users[hangman.players[hangman.currentPlayer]].displayName
    return nextPlayer
}

function solvePuzzle(bot, chatroom, channel, username, userNickname) {
    logMessage([`> solvePuzzle(channel: '${channel}', username: '${username}')`])

    const user = users[username]
    const hangman = lemonyFresh[channel].hangman
    const hypeEmote = getContextEmote(`hype`, channel)
    hangman.listening = false
    user.hangmanWins++
    if (user.hangmanWins % settings.hangmanLemonThreshold === 0) {
        user.lemons++
        bot.say(chatroom, `Congratulations, the answer was: "${hangman.answer}"! ${userNickname} has solved ${pluralize(user.hangmanWins, `Hangman game`, `Hangman games`)}, and earned a lemon! ${hypeEmote}`)
    } else {
        bot.say(chatroom, `Congratulations, the answer was: "${hangman.answer}"! ${userNickname} has solved ${pluralize(user.hangmanWins, `Hangman game`, `Hangman games`)}! ${hypeEmote}`)
    }
}

function checkLetter(bot, chatroom, message, channel, username, userNickname) {
    const guess = message.toUpperCase()
    logMessage([`> checkLetter(chatroom: '${chatroom}', username: '${username}', guess: '${guess}')`])
    const hangman = lemonyFresh[channel].hangman

    // Already guessed letter
    if (hangman.guessedLetters.includes(guess)) {
        const singular = hangman.guessedLetters.length === 1
        bot.say(chatroom, `${userNickname}, the letter${singular ? `` : `s`} ${arrToList(hangman.guessedLetters)} ${singular ? `has` : `have`} already been guessed - try again!`)
        return
    }
    hangman.guessedLetters.push(guess)

    // Set up for next round
    const nextPlayer = getNextPlayer(hangman)
    const hypeEmote = getContextEmote(`hype`, channel)
    const negativeEmote = getContextEmote(`negative`, channel)

    if (hangman.answer.includes(guess.toLowerCase())) {
        // Correct guess
        for (const [i, letter] of hangman.answer.split(``).entries()) {
            if (letter === guess.toLowerCase()) { hangman.spaces[i] = guess }
        }
        // If no spaces left, puzzle has been solved
        if (!hangman.spaces.includes(`_`)) {
            solvePuzzle(bot, chatroom, channel, username, userNickname)
            return
        }
        bot.say(chatroom, `Good job ${userNickname}, ${guess} was in the word! ${hypeEmote} Now it's your turn, ${nextPlayer}!`)
    } else {
        // Wrong answer, check for game over
        hangman.chances--
        if (hangman.chances === 0) {
            hangman.listening = false
            const upsetEmote = getContextEmote(`upset`, channel)
            bot.say(chatroom, `Sorry ${userNickname}, ${guess} wasn't in the word! The answer was "${hangman.answer}". Game over! ${upsetEmote}`)
            return
        }
        bot.say(chatroom, `Sorry ${userNickname}, ${guess} wasn't in the word! ${pluralize(hangman.chances, `chance left...`, `chances left!`)} ${negativeEmote} Now it's your turn, ${nextPlayer}!`)
    }

    // Next round
    const statusMsg = `${hangman.spaces.join(` `)} (chances: ${hangman.chances})`
    const delay = setDelay(channel)
    setTimeout(() => bot.say(chatroom, statusMsg), delay)
}

function checkWord(bot, chatroom, message, channel, username, userNickname) {
    const guess = message.toLowerCase()
    logMessage([`> checkWord(chatroom: '${chatroom}', username: '${username}', guess: '${guess}')`])
    const hangman = lemonyFresh[channel].hangman

    // Correct guess
    if (guess === hangman.answer) {
        solvePuzzle(bot, chatroom, channel, username, userNickname)
        return
    }

    // Wrong answer, check for game over
    hangman.chances--
    if (hangman.chances === 0) {
        hangman.listening = false
        const upsetEmote = getContextEmote(`upset`, channel)
        bot.say(chatroom, `Sorry ${userNickname}, "${guess}" wasn't the answer! The answer was "${hangman.answer}". Game over! ${upsetEmote}`)
        return
    }

    // Set up for next round
    const nextPlayer = getNextPlayer(hangman)
    const negativeEmote = getContextEmote(`negative`, channel)

    // Next round
    bot.say(chatroom, `Sorry ${userNickname}, "${guess}" wasn't the answer! ${pluralize(hangman.chances, `chance left...`, `chances left!`)} ${negativeEmote} Now it's your turn, ${nextPlayer}!`)
    const statusMsg = `${hangman.spaces.join(` `)} (chances: ${hangman.chances})`
    const delay = setDelay(channel)
    setTimeout(() => bot.say(chatroom, statusMsg), delay)
}

function hangmanAnnounce(bot, chatroom, userNickname) {
    logMessage([`> hangmanAnnounce(chatroom: '${chatroom}', userNickname: '${userNickname}')`])

    const channel = chatroom.substring(1)
    const hypeEmote = getContextEmote(`hype`, channel)
    const positiveEmote = getContextEmote(`positive`, channel)
    const hangman = lemonyFresh[channel].hangman

    bot.say(chatroom, `${userNickname} has started a game of Hangman! Type !play in the next ${pluralize(settings.hangmanSignupSeconds, `second`, `seconds`)} if you'd like to join in, too! ${hypeEmote}`)

    // After signup timer ID has expired, close signup window, shuffle players, and start game
    hangman.signup = Number(setTimeout(() => {
        hangman.signup = false
        logMessage([`-> ${settings.hangmanSignupSeconds} seconds has elapsed, signup window closed - players: ${hangman.players.join(`, `)}`])
        hangman.players.sort(() => Math.random() - 0.5)
        const firstPlayer = users[hangman.players[0]].nickname || users[hangman.players[0]].displayName
        const reply = `${pluralize(hangman.players.length, `player`, `players`)} signed up for Hangman! It's ${[8, 11].includes(hangman.answer.length) ? `an` : `a`} ${hangman.answer.length}-letter word. You go first, ${firstPlayer}! ${positiveEmote}`
        bot.say(chatroom, reply)
        // First round
        const statusMsg = `${hangman.spaces.join(` `)} (chances: ${hangman.chances})`
        const delay = setDelay(channel)
        setTimeout(() => bot.say(chatroom, statusMsg), delay)
    }, settings.hangmanSignupSeconds * 1000))
}

module.exports = {
    async manageHangman(props) {
        const { bot, chatroom, args, channel, username, userNickname, isMod, aprilFools } = props
        logMessage([`> manageHangman(chatroom: '${chatroom}')`])

        // In case a Hangman game is already in progress in the channel
        const hangman = lemonyFresh[channel].hangman
        if (hangman.listening) {
            // Mod can end the game early
            const neutralEmote = getContextEmote(`neutral`, channel)
            if (isMod && /^end$/i.test(args[0])) {
                hangman.listening = false
                clearTimeout(hangman.signup)
                hangman.signup = false
                bot.say(chatroom, `Hangman ended! The answer was "${hangman.answer}" ${neutralEmote}`)
                return
            }

            // Mod can skip the current player
            if (isMod && !hangman.signup && /^skip$/i.test(args[0])) {
                const skippedPlayer = users[hangman.players[hangman.currentPlayer]].nickname || users[hangman.players[hangman.currentPlayer]].displayName
                const nextPlayer = getNextPlayer(hangman)
                bot.say(chatroom, `Skipping ${skippedPlayer}! Now it's your turn, ${nextPlayer}! ${neutralEmote}`)
                const statusMsg = `${hangman.spaces.join(` `)} (chances: ${hangman.chances})`
                const delay = setDelay(channel)
                setTimeout(() => bot.say(chatroom, statusMsg), delay)
                return
            }

            const currentPlayer = hangman.players[hangman.currentPlayer]
            hangman.signup
                ? bot.say(chatroom, `A game of Hangman is starting, type !play to join!`)
                : bot.say(chatroom,
                    `A game of Hangman is already in progress! It's currently ${username === currentPlayer
                        ? `your`
                        : `${users[currentPlayer].nickname || users[currentPlayer].displayName}'s`
                    } turn.`
                )
            return
        }

        const success = await hangmanInit(channel, username, aprilFools)
        if (!success) {
            const negativeEmote = getContextEmote(`negative`, channel)
            bot.say(chatroom, `Failed to start Hangman! ${negativeEmote}`)
            return
        }
        hangmanAnnounce(bot, chatroom, userNickname)
    },
    joinHangman(props) {
        const { bot, chatroom, channel, username, userNickname } = props
        logMessage([`> joinHangman(chatroom: '${chatroom}', userNickname: '${userNickname}')`])

        const hangman = lemonyFresh[channel].hangman
        if (hangman.listening) {
            if (hangman.signup) {
                if (hangman.players.includes(username)) {
                    logMessage([`-> ${username} already in ${channel}'s Hangman players: ${hangman.players.join(`, `)}`])
                } else {
                    hangman.players.push(username)
                    logMessage([`-> ${username} added to ${channel}'s Hangman players: ${hangman.players.join(`, `)}`])
                }
            } else if (!hangman.players.includes(username)) {
                const lastPlayer = users[hangman.players[hangman.players.length - 1]].nickname || users[hangman.players[hangman.players.length - 1]].displayName
                hangman.players.push(username)
                logMessage([`-> ${username} added to ${channel}'s Hangman players: ${hangman.players.join(`, `)}}`])
                const positiveEmote = getContextEmote(`positive`, channel)
                bot.say(chatroom, `${userNickname}, you can still hop in, you'll go after ${lastPlayer}! ${positiveEmote}`)
            }
        } else {
            logMessage([`-> Hangman game is not currently in progress for ${channel}`])
        }
    },
    hangmanListener(props) {
        const { bot, chatroom, message, channel, username, userNickname } = props
        const hangman = lemonyFresh[channel].hangman
        if (hangman.listening && !hangman.signup && username === hangman.players[hangman.currentPlayer]) {
            if (/^[a-z]$/i.test(message)) {
                checkLetter(bot, chatroom, message, channel, username, userNickname)
                return true
            }
            if (/^[a-z]{2,}$/i.test(message) && message.length === hangman.answer.length) {
                checkWord(bot, chatroom, message, channel, username, userNickname)
                return true
            }
            logMessage([`NOT A HANGMAN GUESS`])
        }
        return false
    }
}
