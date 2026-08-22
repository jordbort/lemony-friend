const BOT_USERNAME = process.env.BOT_USERNAME

const { lemonyFresh, users } = require(`../data`)
const { pluralize, getContextEmote, logMessage, arrToList, shuffle } = require(`../utils`)

const { apiGetRandomWord } = require(`../commands/external`)

const setDelay = (channel) => users[BOT_USERNAME].channels[channel].mod || users[BOT_USERNAME].channels[channel].vip || channel === BOT_USERNAME ? 1000 : 2000

const dispatchTimers = {}

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

async function hangmanInit(bot, chatroom, channel, username, aprilFools) {
    await logMessage([`> hangmanInit(channel: '${channel}', username: '${username}')`])
    const hm = lemonyFresh[channel].hangman

    let randomWord = await getRandomWord()
    if (!randomWord) { randomWord = await apiGetRandomWord(bot, chatroom, aprilFools) }
    if (!randomWord) { return false }

    hm.listening = true
    hm.answer = randomWord.toLowerCase()
    hm.spaces = Array(hm.answer.length).fill(`_`)
    hm.players.length = 0
    hm.guessedLetters.length = 0
    hm.remainingChances = hm.totalChances
    hm.currentPlayer = 0
    hm.players.push(username)

    return true
}

function getNextPlayer(game) {
    game.currentPlayer++
    if (game.currentPlayer === game.players.length) { game.currentPlayer = 0 }
    const nextPlayer = users[game.players[game.currentPlayer]].nickname || users[game.players[game.currentPlayer]].displayName
    return nextPlayer
}

function solvePuzzle(bot, chatroom, channel, username, userNickname) {
    logMessage([`> solvePuzzle(channel: '${channel}', username: '${username}')`])

    const user = users[username]
    const hm = lemonyFresh[channel].hangman
    const hypeEmote = getContextEmote(`hype`, channel)

    hm.listening = false
    user.hangmanWins++
    if (user.hangmanWins % hm.lemonThreshold === 0) {
        user.lemons++
        bot.say(chatroom, `Congratulations, the answer was: "${hm.answer}"! ${userNickname} has solved ${pluralize(user.hangmanWins, `Hangman game`, `Hangman games`)}, and earned a lemon! ${hypeEmote}`)
    } else {
        bot.say(chatroom, `Congratulations, the answer was: "${hm.answer}"! ${userNickname} has solved ${pluralize(user.hangmanWins, `Hangman game`, `Hangman games`)}! ${hypeEmote}`)
    }
}

function checkLetter(bot, chatroom, message, channel, username, userNickname) {
    clearTimeout(dispatchTimers[channel])
    const guess = message.toUpperCase()
    logMessage([`> checkLetter(chatroom: '${chatroom}', username: '${username}', guess: '${guess}')`])
    const hm = lemonyFresh[channel].hangman

    // Already guessed letter
    if (hm.guessedLetters.includes(guess)) {
        const singular = hm.guessedLetters.length === 1
        bot.say(chatroom, `${userNickname}, the letter${singular ? `` : `s`} ${arrToList(hm.guessedLetters)} ${singular ? `has` : `have`} already been guessed - try again!`)
        return
    }
    hm.guessedLetters.push(guess)

    // Set up for next round
    const nextPlayer = getNextPlayer(hm)
    const hypeEmote = getContextEmote(`hype`, channel)
    const negativeEmote = getContextEmote(`negative`, channel)

    if (hm.answer.includes(guess.toLowerCase())) {
        // Correct guess
        hm.answer.split(``).forEach((letter, i) => {
            if (letter === guess.toLowerCase()) hm.spaces[i] = guess
        })

        // If no spaces left, puzzle has been solved
        if (!hm.spaces.includes(`_`)) {
            hm.players.forEach(username => users[username].hangmanGamesPlayed++)
            solvePuzzle(bot, chatroom, channel, username, userNickname)
            return
        }
        bot.say(chatroom, `Good job ${userNickname}, ${guess} was in the word! ${hypeEmote} Now it's your turn, ${nextPlayer}!`)
    } else {
        // Wrong answer, check for game over
        hm.remainingChances--
        if (hm.remainingChances === 0) {
            clearTimeout(dispatchTimers[channel])
            hm.players.forEach(username => users[username].hangmanGamesPlayed++)
            hm.listening = false
            const upsetEmote = getContextEmote(`upset`, channel)
            bot.say(chatroom, `Sorry ${userNickname}, ${guess} wasn't in the word! The answer was "${hm.answer}". Game over! ${upsetEmote}`)
            return
        }
        bot.say(chatroom, `Sorry ${userNickname}, ${guess} wasn't in the word! ${pluralize(hm.remainingChances, `chance left...`, `chances left!`)} ${negativeEmote} Now it's your turn, ${nextPlayer}!`)
    }

    // Next round
    const statusMsg = `${hm.spaces.join(` `)} (chances: ${hm.remainingChances})`
    const delay = setDelay(channel)
    dispatchTimers[channel] = setTimeout(() => bot.say(chatroom, statusMsg), delay)
}

function checkWord(bot, chatroom, message, channel, username, userNickname) {
    clearTimeout(dispatchTimers[channel])
    const guess = message.toLowerCase()
    logMessage([`> checkWord(chatroom: '${chatroom}', username: '${username}', guess: '${guess}')`])
    const hm = lemonyFresh[channel].hangman

    // Correct guess
    if (guess === hm.answer) {
        hm.players.forEach(username => users[username].hangmanGamesPlayed++)
        solvePuzzle(bot, chatroom, channel, username, userNickname)
        return
    }

    // Wrong answer, check for game over
    hm.remainingChances--
    if (hm.remainingChances === 0) {
        hm.players.forEach(username => users[username].hangmanGamesPlayed++)
        hm.listening = false
        const upsetEmote = getContextEmote(`upset`, channel)
        bot.say(chatroom, `Sorry ${userNickname}, "${guess}" wasn't the answer! The answer was "${hm.answer}". Game over! ${upsetEmote}`)
        return
    }

    // Set up for next round
    const nextPlayer = getNextPlayer(hm)
    const negativeEmote = getContextEmote(`negative`, channel)

    // Next round
    bot.say(chatroom, `Sorry ${userNickname}, "${guess}" wasn't the answer! ${pluralize(hm.remainingChances, `chance left...`, `chances left!`)} ${negativeEmote} Now it's your turn, ${nextPlayer}!`)
    const statusMsg = `${hm.spaces.join(` `)} (chances: ${hm.remainingChances})`
    const delay = setDelay(channel)
    dispatchTimers[channel] = setTimeout(() => bot.say(chatroom, statusMsg), delay)
}

function hangmanAnnounce(bot, chatroom, userNickname) {
    logMessage([`> hangmanAnnounce(chatroom: '${chatroom}', userNickname: '${userNickname}')`])

    const channel = chatroom.substring(1)
    const hypeEmote = getContextEmote(`hype`, channel)
    const positiveEmote = getContextEmote(`positive`, channel)
    const hm = lemonyFresh[channel].hangman

    bot.say(chatroom, `${userNickname} has started a game of Hangman! Type !play in the next ${pluralize(hm.signupSeconds, `second`, `seconds`)} if you'd like to join in, too! ${hypeEmote}`)

    // After signup timer ID has expired, close signup window, shuffle players, and start game
    hm.signup = Number(setTimeout(() => {
        hm.signup = false
        logMessage([`-> ${hm.signupSeconds} seconds has elapsed, signup window closed - players: ${hm.players.join(`, `)}`])
        hm.players = shuffle(hm.players)
        const firstPlayer = users[hm.players[0]].nickname || users[hm.players[0]].displayName
        const reply = `${pluralize(hm.players.length, `player`, `players`)} signed up for Hangman! It's ${[8, 11].includes(hm.answer.length) ? `an` : `a`} ${hm.answer.length}-letter word. You go first, ${firstPlayer}! ${positiveEmote}`
        bot.say(chatroom, reply)
        // First round
        const statusMsg = `${hm.spaces.join(` `)} (chances: ${hm.remainingChances})`
        const delay = setDelay(channel)
        dispatchTimers[channel] = setTimeout(() => bot.say(chatroom, statusMsg), delay)
    }, hm.signupSeconds * 1000))
}

module.exports = {
    async manageHangman(props) {
        const { bot, chatroom, args, channel, username, userNickname, isMod, aprilFools } = props
        logMessage([`> manageHangman(chatroom: '${chatroom}')`])

        // In case a Hangman game is already in progress in the channel
        const hm = lemonyFresh[channel].hangman
        if (hm.listening) {
            // Mod can end the game early
            const neutralEmote = getContextEmote(`neutral`, channel)
            if (isMod && /^end$/i.test(args[0])) {
                hm.listening = false
                clearTimeout(hm.signup)
                hm.signup = false
                bot.say(chatroom, `Hangman ended! The answer was "${hm.answer}" ${neutralEmote}`)
                return
            }

            // Mod can skip the current player
            if (isMod && !hm.signup && /^skip$/i.test(args[0])) {
                const skippedPlayer = users[hm.players[hm.currentPlayer]].nickname || users[hm.players[hm.currentPlayer]].displayName
                const nextPlayer = getNextPlayer(hm)
                bot.say(chatroom, `Skipping ${skippedPlayer}! Now it's your turn, ${nextPlayer}! ${neutralEmote}`)
                const statusMsg = `${hm.spaces.join(` `)} (chances: ${hm.remainingChances})`
                const delay = setDelay(channel)
                dispatchTimers[channel] = setTimeout(() => bot.say(chatroom, statusMsg), delay)
                return
            }

            const currentPlayer = hm.players[hm.currentPlayer]
            hm.signup
                ? bot.say(chatroom, `A game of Hangman is starting, type !play to join!`)
                : bot.say(chatroom,
                    `A game of Hangman is already in progress! It's currently ${username === currentPlayer
                        ? `your`
                        : `${users[currentPlayer].nickname || users[currentPlayer].displayName}'s`
                    } turn.`
                )
            return
        }

        const success = await hangmanInit(bot, chatroom, channel, username, aprilFools)
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

        const hm = lemonyFresh[channel].hangman
        if (hm.listening) {
            if (hm.signup) {
                if (hm.players.includes(username)) {
                    logMessage([`-> ${username} already in ${channel}'s Hangman players: ${hm.players.join(`, `)}`])
                } else {
                    hm.players.push(username)
                    logMessage([`-> ${username} added to ${channel}'s Hangman players: ${hm.players.join(`, `)}`])
                }
            } else if (!hm.players.includes(username)) {
                const lastPlayer = users[hm.players[hm.players.length - 1]].nickname || users[hm.players[hm.players.length - 1]].displayName
                hm.players.push(username)
                logMessage([`-> ${username} added to ${channel}'s Hangman players: ${hm.players.join(`, `)}}`])
                const positiveEmote = getContextEmote(`positive`, channel)
                bot.say(chatroom, `${userNickname}, you can still hop in, you'll go after ${lastPlayer}! ${positiveEmote}`)
            }
        } else {
            logMessage([`-> Hangman game is not currently in progress for ${channel}`])
        }
    },
    hangmanListener(props) {
        const { bot, chatroom, message, channel, username, userNickname } = props
        const { listening, signup, players, currentPlayer, spaces } = lemonyFresh[channel].hangman
        if (listening && !signup && username === players[currentPlayer]) {
            if (/^[a-z]$/i.test(message)) {
                checkLetter(bot, chatroom, message, channel, username, userNickname)
                return true
            }
            if (new RegExp(`^${spaces.join(``).replace(/_/g, `[a-z]`)}$`, `i`).test(message)) {
                checkWord(bot, chatroom, message, channel, username, userNickname)
                return true
            }
            logMessage([`NOT A HANGMAN GUESS`])
        }
        return false
    }
}
