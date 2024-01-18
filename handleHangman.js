const BOT_USERNAME = process.env.BOT_USERNAME

// Import data
const { lemonyFresh, users } = require(`./data`)

// Import global settings
const { resetTxt, boldTxt, settings } = require(`./config`)

// Import helper functions
const { talk } = require(`./utils`)

async function getRandomWord() {
    if (settings.debug) { console.log(`${boldTxt}> getRandomWord()${resetTxt}`) }
    const response = await fetch(`https://random-word-api.vercel.app/api?words=1`)
    const data = await response.json()
    if (settings.debug) { console.log(data) }
    return data[0]
}

async function hangmanInit(hangman) {
    if (settings.debug) { console.log(`${boldTxt}> hangmanInit(hangman: ${typeof hangman})${resetTxt}`) }

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
    if (settings.debug) { console.log(`${boldTxt}> hangmanAnnounce(chatroom: ${chatroom})${resetTxt}`) }
    const channel = chatroom.slice(1)
    const hangman = lemonyFresh[channel].hangman

    hangman.signup = true
    talk(chatroom, `I'm thinking of a word... Type !play in the next 30 seconds to join in a game of Hangman! :)`)
    setTimeout(() => {
        if (settings.debug) { console.log(`${boldTxt}> 30 seconds has elapsed, signup window closed${resetTxt}`) }
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
    if (settings.debug) { console.log(`${boldTxt}> checkLetter(chatroom: ${chatroom}, username: ${username}, guess: ${guess})${resetTxt}`) }
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
    if (settings.debug) { console.log(`${boldTxt}> solvePuzzle(chatroom: ${chatroom}, username: ${username})${resetTxt}`) }
    const channel = chatroom.slice(1)
    const hangman = lemonyFresh[channel].hangman
    hangman.listening = false
    users[username][channel].hangmanWins++
    return talk(chatroom, `Congratulations, the answer was: "${hangman.answer}"! ${users[username].displayName} has solved ${users[username][channel].hangmanWins} Hangman game${users[username][channel].hangmanWins === 1 ? `` : `s`}! :D`)
}

module.exports = {
    getRandomWord,
    hangmanInit,
    hangmanAnnounce,
    checkLetter,
    solvePuzzle
}
