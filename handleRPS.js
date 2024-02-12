// Import data
const { users } = require(`./data`)

// Import global settings
const { resetTxt, boldTxt, settings } = require(`./config`)

// Import helper functions
const { talk, getHappyEmote } = require(`./utils`)

function rockPaperScissors(chatroom, username, arg) {
    const rps = [`rock`, `paper`, `scissors`]
    if (settings.debug) { console.log(`${boldTxt}> rockPaperScissors(rockPaperScissors: ${chatroom}, username: ${username}, arg: ${arg}) ${rps.includes(arg)}${resetTxt}`) }
    const botChoice = rps[Math.floor(Math.random() * rps.length)]
    const playerChoice = rps.includes(arg) ? arg : rps[Math.floor(Math.random() * rps.length)]
    const name = users[username].displayName
    let response = `${name} throws ${playerChoice}! I throw ${botChoice}`
    if ((playerChoice === `rock` && botChoice === `paper`)
        || (playerChoice === `paper` && botChoice === `scissors`)
        || (playerChoice === `scissors` && botChoice === `rock`)) { response += `. Sorry, I win! :)` }
    else if ((playerChoice === `rock` && botChoice === `scissors`)
        || (playerChoice === `paper` && botChoice === `rock`)
        || (playerChoice === `scissors` && botChoice === `paper`)) { response += `. You win! ${getHappyEmote()}` }
    else { response += `, too. It's a tie! :O` }
    talk(chatroom, response)
}

module.exports = { rockPaperScissors }
