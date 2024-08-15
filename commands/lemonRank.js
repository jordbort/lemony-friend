const { users } = require(`../data`)
const { getLemonEmote, pluralize } = require(`../utils`)

module.exports = {
    lemonTopThree(props) {
        const { bot, chatroom, channel } = props
        const lemonEmote = getLemonEmote(channel)
        const topThree = Object.keys(users)
            .sort((a, b) => users[b].lemons - users[a].lemons)
            .slice(0, 3)

        bot.say(chatroom, `TOP LEMONS - ${topThree.map((user, idx) => `#${idx + 1}: ${user} (${pluralize(users[user].lemons, `lemon`, `lemons`)})`).join(`, `)} ${lemonEmote}`)
    }
}
