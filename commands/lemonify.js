const { getRandomChannelMessage } = require(`./getInfo`)
const { getContextEmote, logMessage } = require(`../utils`)

function lemonify(str) {
    logMessage([`> lemonify(str: ${str})`])
    const words = str.split(` `)
    const reservedKeywords = [
        `a`,
        `an`,
        `this`,
        `that`,
        `one`,
        `the`,
        `my`,
        `your`,
        `his`,
        `her`,
        `its`,
        `our`,
        `their`,
        `for`,
        `and`,
        `nor`,
        `by`,
        `or`,
        `yet`,
        `so`,
        `if`,
        `when`,
        `of`,
        `on`,
        `these`,
        `those`,
        `many`,
        `some`,
        `zero`,
        `one`,
        `two`,
        `three`,
        `four`,
        `five`,
        `six`,
        `seven`,
        `eight`,
        `nine`,
        `ten`,
        `eleven`,
        `twelve`,
        `thirteen`,
        `fourteen`,
        `fifteen`,
        `sixteen`,
        `seventeen`,
        `eightteen`,
        `nineteen`,
        `twenty`,
        `thirty`,
        `forty`,
        `fifty`,
        `sixty`,
        `seventy`,
        `eighty`,
        `ninety`,
        `hundred`,
        `thousand`,
        `million`,
        `billion`,
        `trillion`,
        `quadrillion`
    ]

    // Reading from last word to first
    for (let i = words.length - 1; i >= 0; i--) {
        const number = Number(words[i])
        const append = []

        // Shaving non-alphanumeric characters from the end of the next word (the word it might decide to replace with "lemon")
        while (words[i + 1] && /[^a-z0-9]$/i.test(words[i + 1])) {
            append.push(words[i + 1][words[i + 1].length - 1])
            words[i + 1] = words[i + 1].substring(0, words[i + 1].length - 1)
        }
        append.reverse()

        // Definitely singular
        if ((
            number === 1
            || [
                `a`,
                `an`,
                `this`,
                `that`,
                `one`
            ].includes(words[i].toLowerCase())
            && !reservedKeywords.includes(words[i + 1]))
            && words[i + 1]
        ) {
            if (words[i].toLowerCase() === `an`) { words[i] = `a` }
            words[i + 1] = `lemon${append.join(``)}`
        }

        // Definitely plural
        else if ((
            ((number || number === 0) && number !== 1)
            // If a number spelled out, or "these/those/many/some"
            || [
                `these`,
                `those`,
                `many`,
                `some`,
                `zero`,
                `two`,
                `three`,
                `four`,
                `five`,
                `six`,
                `seven`,
                `eight`,
                `nine`,
                `ten`,
                `eleven`,
                `twelve`,
                `thirteen`,
                `fourteen`,
                `fifteen`,
                `sixteen`,
                `seventeen`,
                `eightteen`,
                `nineteen`,
                `twenty`,
                `thirty`,
                `forty`,
                `fifty`,
                `sixty`,
                `seventy`,
                `eighty`,
                `ninety`,
                `hundred`,
                `thousand`,
                `million`,
                `billion`,
                `trillion`,
                `quadrillion`
            ].includes(words[i].toLowerCase()))
            && words[i + 1]
            && !reservedKeywords.includes(words[i + 1])
        ) { words[i + 1] = `lemons${append.join(``)}` }

        // Ambiguous count
        else if ((
            [
                `the`,
                `my`,
                `your`,
                `his`,
                `her`,
                `its`,
                `whose`,
                `our`,
                `their`,
                `for`,
                `and`,
                `nor`,
                `by`,
                `or`,
                `yet`,
                `so`,
                `if`,
                `when`,
                `of`,
                `on`,
                `to`
            ].includes(words[i].toLowerCase()))
            && words[i + 1]
            && !reservedKeywords.includes(words[i + 1])
        ) { words[i + 1] = /[^s][s]$/i.test(words[i + 1]) ? `lemons${append.join(``)}` : `lemon${append.join(``)}` }
        else if (words[i + 1]) { words[i + 1] = `${words[i + 1]}${append.join(``)}` }
    }

    const lemonifiedString = words.join(` `)
    return lemonifiedString
}

module.exports = {
    lemonify,
    handleLemonify(props) {
        const { bot, chatroom, channel, target } = props
        const lemonEmote = getContextEmote(`lemon`, channel)
        const positiveEmote = getContextEmote(`positive`, channel)
        if (!target) { return bot.say(chatroom, `${lemonEmote}${lemonEmote}${lemonEmote} ${positiveEmote}`) }
        const channelMsg = target[channel]?.lastMessage || getRandomChannelMessage(target)
        const lemonMsg = lemonify(channelMsg)
        bot.say(chatroom, lemonMsg)
    }
}
