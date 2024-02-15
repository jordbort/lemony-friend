const BOT_USERNAME = process.env.BOT_USERNAME

// Import data
const { lemonyFresh, users } = require(`./data`)

// Import global settings
const { resetTxt, boldTxt, settings } = require(`./config`)

// Import emotes
const { getHypeEmote, getPositiveEmote, getUpsetEmote, getNegativeEmote } = require(`./getEmotes`)

// Import helper functions
const { talk } = require(`./utils`)

async function getRandomWord() {
    if (settings.debug) { console.log(`${boldTxt}> getRandomWord()${resetTxt}`) }
    const response = await fetch(`https://random-word-api.vercel.app/api?words=1`)
    const data = await response.json()
    if (settings.debug) { console.log(data) }
    return data[0]
}

async function hangmanInit(hangman, username) {
    hangman.listening = true
    hangman.answer = await getRandomWord()
    hangman.spaces.length = hangman.answer.length
    hangman.spaces.fill(`_`)
    hangman.players.length = 0
    hangman.guessedLetters.length = 0
    hangman.chances = 6
    hangman.currentPlayer = 0
    hangman.players.push(username)
    if (settings.debug) { console.log(`${boldTxt}> hangmanInit(hangman: ${typeof hangman}, username: '${username}')${resetTxt}`) }
}

function hangmanAnnounce(chatroom, displayName) {
    if (settings.debug) { console.log(`${boldTxt}> hangmanAnnounce(chatroom: '${chatroom}')${resetTxt}`) }

    const channel = chatroom.slice(1)
    const hangman = lemonyFresh[channel].hangman
    hangman.signup = true
    const signupSeconds = 30

    const hypeEmote = getHypeEmote(channel)
    const positiveEmote = getPositiveEmote(channel)
    const upsetEmote = getUpsetEmote(channel)
    talk(chatroom, `${displayName} has started a game of Hangman! Type !play in the next ${signupSeconds} seconds if you'd like to join in, too! ${hypeEmote}`)
    setTimeout(() => {
        // After signup period has ended, close signup window, shuffle players, and start game
        hangman.signup = false
        hangman.players.sort(() => Math.random() - 0.5)
        if (settings.debug) { console.log(`${boldTxt}> ${signupSeconds} seconds has elapsed, signup window closed - players: ${hangman.players.length === 0 ? `(none)` : `${hangman.players.join(`, `)}`}${resetTxt}`) }
        if (hangman.players.length === 0) {
            hangman.listening = false
            talk(chatroom, `No players signed up for Hangman! ${upsetEmote}`)
        } else {
            talk(chatroom, `${hangman.players.length} player${hangman.players.length === 1 ? `` : `s`} signed up for Hangman! It's a ${hangman.answer.length}-letter word. You go first, ${users[hangman.players[0]].displayName}! ${positiveEmote}`)
            const statusMsg = `${hangman.spaces.join(` `)} (chances: ${hangman.chances})`
            const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip ? 1000 : 2000
            setTimeout(() => talk(chatroom, statusMsg), delay)
        }
    }, signupSeconds * 1000)
}

function checkLetter(chatroom, username, guess) {
    if (settings.debug) { console.log(`${boldTxt}> checkLetter(chatroom: '${chatroom}', username: '${username}', guess: '${guess}')${resetTxt}`) }

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
    const hypeEmote = getHypeEmote(channel)
    const upsetEmote = getUpsetEmote(channel)
    const negativeEmote = getNegativeEmote(channel)
    if (hangman.answer.includes(guess.toLowerCase())) {
        for (const [i, letter] of hangman.answer.split(``).entries()) {
            if (letter === guess.toLowerCase()) { hangman.spaces[i] = guess }
        }
        // If no spaces left, puzzle has been solved
        if (!hangman.spaces.includes(`_`)) { return solvePuzzle(chatroom, username) }
        talk(chatroom, `Good job ${player}, ${guess} was in the word! ${hypeEmote} Now it's your turn, ${nextPlayer}!`)
    } else {
        hangman.chances--
        if (hangman.chances === 0) {
            hangman.listening = false
            return talk(chatroom, `Sorry ${player}, ${guess} wasn't in the word! The answer was "${hangman.answer}". Game over! ${upsetEmote}`)
        }
        talk(chatroom, `Sorry ${player}, ${guess} wasn't in the word! ${hangman.chances} chance${hangman.chances === 1 ? ` left!`: `s left...`} ${negativeEmote} Now it's your turn, ${nextPlayer}!`)
    }
    const statusMsg = `${hangman.spaces.join(` `)} (chances: ${hangman.chances})`
    const delay = users[BOT_USERNAME][channel].mod || users[BOT_USERNAME][channel].vip || channel === BOT_USERNAME ? 1000 : 2000
    setTimeout(() => talk(chatroom, statusMsg), delay)
}

function solvePuzzle(chatroom, username) {
    if (settings.debug) { console.log(`${boldTxt}> solvePuzzle(chatroom: '${chatroom}', username: '${username}')${resetTxt}`) }
    const channel = chatroom.slice(1)
    const hypeEmote = getHypeEmote(channel)
    const hangman = lemonyFresh[channel].hangman
    hangman.listening = false
    users[username].hangmanWins++
    return talk(chatroom, `Congratulations, the answer was: "${hangman.answer}"! ${users[username].displayName} has solved ${users[username].hangmanWins} Hangman game${users[username].hangmanWins === 1 ? `` : `s`}! ${hypeEmote}`)
}

module.exports = {
    getRandomWord,
    hangmanInit,
    hangmanAnnounce,
    checkLetter,
    solvePuzzle
}
