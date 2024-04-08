const BOT_USERNAME = process.env.BOT_USERNAME

const { resetTxt, grayTxt, settings } = require(`../config`)
const { users } = require(`../data`)

const { getNeutralEmote, getHypeEmote, getPositiveEmote, getNegativeEmote } = require(`../utils`)

module.exports = {
    sayCommands(props) {
        const { bot, chatroom, channel } = props
        if (settings.debug) { console.log(`${grayTxt}> sayCommands(chatroom: ${chatroom})${resetTxt}`) }

        const neutralEmote = getNeutralEmote(channel)
        bot.say(chatroom, `Commands: !greet => Say hi to one or more people, !bye => Say goodnight to someone, !hangman => Start a game of Hangman, !rps => Play me in Rock, Paper, Scissors (move optional), !yell => Chat across Lemony Fresh ${users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Lemfresh ` : `🍋️`}, !away => (Optionally add an away message), !tempcmd => Make your own command! ${neutralEmote}`)
    },
    getDocs(props) {
        const { bot, chatroom } = props
        if (settings.debug) { console.log(`${grayTxt}> getDocs(chatroom: ${chatroom})${resetTxt}`) }

        bot.say(chatroom, `Check out the docs here: https://github.com/jordbort/lemony-friend/blob/main/README.md`)
    },
    getStats(props) {
        const { bot, chatroom, username, user, toUser, target } = props
        if (settings.debug) { console.log(`${grayTxt}> getStats(chatroom: ${chatroom})${resetTxt}`) }

        const stats = target || user
        if (settings.debug) { console.log(`${toUser || username}:`, stats) }

        let data = `${toUser || username}: { id: ${stats.id}, displayName: '${stats.displayName}', nickname: '${stats.nickname}', turbo: ${stats.turbo}, color: '${stats.color}', lemons: ${stats.lemons}, hangmanWins: ${stats.hangmanWins}`
        for (const key of Object.keys(stats)) {
            if (typeof stats[key] === `object`) {
                data += `, ${key}: { sub: ${stats[key]?.sub}, mod: ${stats[key].mod}, vip: ${stats[key].vip}, msgCount: ${stats[key].msgCount}, away: ${stats[key].away ? `${stats[key].away}, awayMessage: '${stats[key].awayMessage}'` : `${stats[key].away}`}, lastMessage: '${stats[key].lastMessage}', sentAt: ${stats[key].sentAt} }`
            }
        }
        data += ` }`
        bot.say(chatroom, data)
    },
    getSubs(props) {
        const { bot, chatroom, channel } = props
        if (settings.debug) { console.log(`${grayTxt}> getSubs(chatroom: ${chatroom})${resetTxt}`) }

        const subbedChannels = Object.keys(users[BOT_USERNAME]).filter(channel => typeof users[BOT_USERNAME][channel] === `object` && users[BOT_USERNAME][channel].sub)

        const hypeEmote = getHypeEmote(channel)
        const positiveEmote = getPositiveEmote(channel)
        const neutralEmote = getNeutralEmote(channel)
        const negativeEmote = getNegativeEmote(channel)

        subbedChannels.length
            ? bot.say(chatroom,
                `I am subbed to: ${subbedChannels.join(`, `)} ${subbedChannels.length < 2
                    ? neutralEmote
                    : subbedChannels.length < 4
                        ? positiveEmote
                        : hypeEmote}`
            )
            : bot.say(chatroom, `I am not subbed to any channels I'm active in ${negativeEmote}`)
    }
}
