const { settings } = require(`../config`)
const { getNeutralEmote, getHypeEmote } = require(`../utils`)

module.exports = {
    rockPaperScissors(props) {
        const { bot, chatroom, args, channel, userNickname } = props

        if (settings.realRPS) {
            const rps = [`rock`, `paper`, `scissors`]
            const playerChoice = rps.includes(args[0]?.toLowerCase()) ? args[0].toLowerCase() : rps[Math.floor(Math.random() * rps.length)]
            logMessage([`> rockPaperScissors(chatroom: ${chatroom}, userNickname: ${userNickname}, playerChoice: ${playerChoice})`])

            const botChoice = rps[Math.floor(Math.random() * rps.length)]
            let reply = `${userNickname} throws ${playerChoice}! I throw ${botChoice}`
            const neutralEmote = getNeutralEmote(channel)
            const hypeEmote = getHypeEmote(channel)

            if ((playerChoice === `rock` && botChoice === `paper`)
                || (playerChoice === `paper` && botChoice === `scissors`)
                || (playerChoice === `scissors` && botChoice === `rock`)) { reply += `. Sorry, I win! ${neutralEmote}` }
            else if ((playerChoice === `rock` && botChoice === `scissors`)
                || (playerChoice === `paper` && botChoice === `rock`)
                || (playerChoice === `scissors` && botChoice === `paper`)) { reply += `. You win! ${hypeEmote}` }
            else { reply += `, too. It's a tie! :O` }

            bot.say(chatroom, reply)
        } else {
            const playerChoice = args[0]?.toLowerCase() || `nothing`
            logMessage([`> fakeRockPaperScissors(chatroom: ${chatroom}, userNickname: ${userNickname}, playerChoice: ${playerChoice})`])

            let reply = `${userNickname} throws ${playerChoice}! I throw `
            const neutralEmote = getNeutralEmote(channel)

            if (playerChoice === `rock`) { reply += `paper. Sorry, I win! ${neutralEmote}` }
            else if (playerChoice === `paper`) { reply += `scissors. Sorry, I win! ${neutralEmote}` }
            else if (playerChoice === `scissors`) { reply += `rock. Sorry, I win! ${neutralEmote}` }
            else { reply += `${playerChoice}, too. It's a tie! :O` }

            bot.say(chatroom, reply)
        }
    }
}
