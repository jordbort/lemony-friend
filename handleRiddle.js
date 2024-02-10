// Import global settings
const { resetTxt, boldTxt, settings } = require(`./config`)

// Import data
const { lemonyFresh, users } = require(`./data`)


// Import helper functions
const { talk } = require(`./utils`)

async function getRiddle(chatroom) {
    if (settings.debug) { console.log(`${boldTxt}> getRiddle(chatroom: ${chatroom})${resetTxt}`) }
    const response = await fetch(`https://riddles-api.vercel.app/random`)
    const data = await response.json()
    console.log(data)
    const channel = chatroom.substring(1)
    lemonyFresh[channel].riddle.question = data.riddle
    lemonyFresh[channel].riddle.answer = data.answer
    talk(chatroom, lemonyFresh[channel].riddle.question)
}

function handleRiddleAnswer(chatroom, username, args) {
    if (settings.debug) { console.log(`${boldTxt}> handleRiddleAnswer(chatroom: ${chatroom}, args.length: ${args.length})${resetTxt}`) }
    const str = args.map((arg) => arg.toLowerCase()).join(` `)
    const channel = chatroom.substring(1)
    const solved = lemonyFresh[channel].riddle.answer.toLowerCase().includes(str) || str.includes(lemonyFresh[channel].riddle.answer.toLowerCase())
    if (solved) {
        users[username].riddleWins++
        talk(chatroom, `That's right: ${lemonyFresh[channel].riddle.answer}! ${users[username].displayName} has solved ${users[username].riddleWins} riddle${users[username].riddleWins === 1 ? `` : `s`}! :)`)
        lemonyFresh[channel].riddle.question = ``
        lemonyFresh[channel].riddle.answer = ``
    } else {
        talk(chatroom, `Nope, that's not it!`)
    }
}

module.exports = {
    getRiddle,
    handleRiddleAnswer
}
