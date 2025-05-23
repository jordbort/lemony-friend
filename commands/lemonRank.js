const { users } = require(`../data`)
const { settings } = require(`../config`)
const { getContextEmote, pluralize } = require(`../utils`)

module.exports = {
    lemonTopThree(props) {
        const { bot, chatroom, channel } = props
        const lemonEmote = getContextEmote(`lemon`, channel)
        const leaders = Object.keys(users)
            .sort((a, b) => users[b].lemons - users[a].lemons)
            .slice(0, settings.lemonLeaderCount)

        bot.say(chatroom, `TOP LEMONS - ${leaders.map((username, idx) => `#${idx + 1}: ${username} (${pluralize(users[username].lemons, `lemon`, `lemons`)})`).join(`, `)} ${lemonEmote}`)
    }
}
