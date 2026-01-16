const { getContextEmote, logMessage } = require(`../utils`)

const rps = [`rock`, `paper`, `scissors`]

function realRPS(playerChoice, channel) {
    const botChoice = rps[Math.floor(Math.random() * rps.length)]
    const neutralEmote = getContextEmote(`neutral`, channel)
    const hypeEmote = getContextEmote(`hype`, channel)

    let reply = `${botChoice}`

    if ((playerChoice === `rock` && botChoice === `paper`)
        || (playerChoice === `paper` && botChoice === `scissors`)
        || (playerChoice === `scissors` && botChoice === `rock`)) {
        reply += `. Sorry, I win! ${neutralEmote}`
    }
    else if ((playerChoice === `rock` && botChoice === `scissors`)
        || (playerChoice === `paper` && botChoice === `rock`)
        || (playerChoice === `scissors` && botChoice === `paper`)) {
        reply += `. You win! ${hypeEmote}`
    }
    else { reply += `, too. It's a tie! :O` }

    return reply
}

function fakeRPS(playerChoice, channel) {
    const neutralEmote = getContextEmote(`neutral`, channel)

    switch (playerChoice) {
        case `rock`: return `paper. Sorry, I win! ${neutralEmote}`
        case `paper`: return `scissors. Sorry, I win! ${neutralEmote}`
        case `scissors`: return `rock. Sorry, I win! ${neutralEmote}`
        default: return `${playerChoice}, too. It's a tie! :O`
    }
}

module.exports = {
    rockPaperScissors(props) {
        const { bot, chatroom, args, channel, userNickname, aprilFools } = props

        const playerChoice = aprilFools
            ? args.join(` `) || `nothing`
            : rps.includes(args[0]?.toLowerCase())
                ? args[0].toLowerCase()
                : rps[Math.floor(Math.random() * rps.length)]

        logMessage([`> rockPaperScissors(channel: '${channel}', userNickname: '${userNickname}', playerChoice: '${playerChoice}', aprilFools? ${aprilFools})`])

        let reply = `${userNickname} throws ${playerChoice}! I throw `

        aprilFools
            ? reply += fakeRPS(playerChoice, channel)
            : reply += realRPS(playerChoice, channel)

        bot.say(chatroom, reply)
    }
}
