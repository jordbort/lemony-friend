const { wordBank } = require(`../config`)
const { logMessage, pluralize, getNeutralEmote, getPositiveEmote } = require(`../utils`)

function getNoun() { return wordBank.nouns[Math.floor(Math.random() * wordBank.nouns.length)] }
function getVerb() { return wordBank.verbs[Math.floor(Math.random() * wordBank.verbs.length)] }
function getAdjective() { return wordBank.adjectives[Math.floor(Math.random() * wordBank.adjectives.length)] }
function getIndefiniteArticle(nextWord) { return /^[aeiou]/i.test(nextWord) ? `an ${nextWord}` : `a ${nextWord}` }

function makePlural(noun) {
    return /[^aeiou]y$/i.test(noun)
        ? `${noun.substring(0, noun.length - 1)}ies`
        : /(s|z|x|ch|sh)$/i.test(noun)
            ? `${noun}es`
            : `${noun}s`
}

function addVerbSuffix(verb, suffix) {
    return /[aeiou][^aeiouwxy]$/i.test(verb)
        ? verb[verb.length - 3] === verb[verb.length - 2]
            ? `${verb}${suffix}`
            : `${verb}${verb[verb.length - 1]}${suffix}`
        : /e$/i.test(verb)
            ? `${verb.substring(0, verb.length - 1)}${suffix}`
            : `${verb}${suffix}`
}

module.exports = {
    manageVerbs(props) {
        const { bot, chatroom, args, channel, userNickname } = props
        logMessage([`> manageVerbs(args: [${args}])`])

        const neutralEmote = getNeutralEmote(channel)
        const positiveEmote = getPositiveEmote(channel)
        if (!args.length) { return bot.say(chatroom, `I know ${pluralize(wordBank.verbs.length, `verb`, `verbs`)}${wordBank.verbs.length ? `: ${wordBank.verbs.join(`, `)} -` : `!`} Please give me more verbs to remember, or say "!verbs delete <list of verbs>" for me to forget some, or "!verbs clear" for me to forget all, ${userNickname}! ${neutralEmote}`) }

        if (/^clear$|^c$/i.test(args[0])) {
            wordBank.verbs.length = 0
            return bot.say(chatroom, `I know ${wordBank.verbs.length} verbs! ${positiveEmote}`)
        }

        if (/^delete$|^d$/i.test(args[0])) {
            args.shift()
            const removals = []
            for (const element of args) {
                if (wordBank.verbs.includes(element)) {
                    wordBank.verbs.splice(wordBank.verbs.indexOf(element), 1)
                    removals.push(element)
                }
            }
            return bot.say(chatroom, `I forgot ${pluralize(removals.length, `verb`, `verbs`)}${removals.length ? `: ${removals.join(`, `)}` : `!`} ${neutralEmote}`)
        }

        for (const word of args) { wordBank.verbs.push(word.toLowerCase()) }
        bot.say(chatroom, `Added ${pluralize(args.length, `verb`, `verbs`)}! Now I know: ${wordBank.verbs.join(`, `)} ${positiveEmote}`)
    },
    manageNouns(props) {
        const { bot, chatroom, args, channel, userNickname } = props
        logMessage([`> manageNouns(args: [${args}])`])

        const neutralEmote = getNeutralEmote(channel)
        const positiveEmote = getPositiveEmote(channel)
        if (!args.length) { return bot.say(chatroom, `I know ${pluralize(wordBank.nouns.length, `noun`, `nouns`)}${wordBank.nouns.length ? `: ${wordBank.nouns.join(`, `)} -` : `!`} Please give me more nouns to remember, or say "!nouns delete <list of nouns>" for me to forget some, or "!nouns clear" for me to forget all, ${userNickname}! ${neutralEmote}`) }

        if (/^clear$|^c$/i.test(args[0])) {
            wordBank.nouns.length = 0
            return bot.say(chatroom, `I know ${wordBank.nouns.length} nouns! ${positiveEmote}`)
        }

        if (/^delete$|^d$/i.test(args[0])) {
            args.shift()
            const removals = []
            for (const element of args) {
                if (wordBank.nouns.includes(element)) {
                    wordBank.nouns.splice(wordBank.nouns.indexOf(element), 1)
                    removals.push(element)
                }
            }
            return bot.say(chatroom, `I forgot ${pluralize(removals.length, `noun`, `nouns`)}${removals.length ? `: ${removals.join(`, `)}` : `!`} ${neutralEmote}`)
        }

        for (const word of args) { wordBank.nouns.push(word.toLowerCase()) }
        bot.say(chatroom, `Added ${pluralize(args.length, `noun`, `nouns`)}! Now I know: ${wordBank.nouns.join(`, `)} ${positiveEmote}`)
    },
    manageAdjectives(props) {
        const { bot, chatroom, args, channel, userNickname } = props
        logMessage([`> manageAdjectives(args: [${args}])`])

        const neutralEmote = getNeutralEmote(channel)
        const positiveEmote = getPositiveEmote(channel)
        if (!args.length) { return bot.say(chatroom, `I know ${pluralize(wordBank.adjectives.length, `adjective`, `adjectives`)}${wordBank.adjectives.length ? `: ${wordBank.adjectives.join(`, `)} -` : `!`} Please give me more adjectives to remember, or say "!adjectives delete <list of adjectives>" for me to forget some, or "!adjectives clear" for me to forget all, ${userNickname}! ${neutralEmote}`) }

        if (/^clear$|^c$/i.test(args[0])) {
            wordBank.adjectives.length = 0
            return bot.say(chatroom, `I know ${wordBank.adjectives.length} adjectives! ${positiveEmote}`)
        }

        if (/^delete$|^d$/i.test(args[0])) {
            args.shift()
            const removals = []
            for (const element of args) {
                if (wordBank.adjectives.includes(element)) {
                    wordBank.adjectives.splice(wordBank.adjectives.indexOf(element), 1)
                    removals.push(element)
                }
            }
            return bot.say(chatroom, `I forgot ${pluralize(removals.length, `adjective`, `adjectives`)}${removals.length ? `: ${removals.join(`, `)}` : `!`} ${neutralEmote}`)
        }

        for (const word of args) { wordBank.adjectives.push(word.toLowerCase()) }
        bot.say(chatroom, `Added ${pluralize(args.length, `adjective`, `adjectives`)}! Now I know: ${wordBank.adjectives.join(`, `)} ${positiveEmote}`)
    },
    insultUser(props) {
        const { bot, chatroom, username, userNickname, toUser, targetNickname } = props
        logMessage([`> insultUser(user: ${toUser || username})`])

        const verbs = [...wordBank.verbs]
        const nouns = [
            ...wordBank.nouns,
            ...wordBank.nouns,
            ...wordBank.nouns,
            ...wordBank.nouns,
            ...wordBank.nouns,
            ...wordBank.nouns,
            ...wordBank.nouns,
            ...wordBank.nouns,
            ...wordBank.nouns,
            ...wordBank.verbs.map(word => `${addVerbSuffix(word, `er`)}`)
        ]
        const adjectives = [
            ...wordBank.adjectives,
            ...wordBank.adjectives,
            ...wordBank.adjectives,
            ...wordBank.adjectives,
            ...wordBank.adjectives,
            ...wordBank.adjectives,
            ...wordBank.adjectives,
            ...wordBank.adjectives,
            ...wordBank.adjectives,
            ...wordBank.verbs.map(word => `${addVerbSuffix(word, `y`)}`)
        ]

        const verb1 = getVerb() || `squeeze`
        let verb2 = getVerb() || `juice`
        while (verb2 === verb1) {
            verbs.push(`squeeze`, `juice`)
            logMessage([`-> Changing verb 2 from "${verb2}"`, verbs])
            verb2 = getVerb()
        }

        const noun1 = getNoun() || `lemon`
        let noun2 = getNoun() || `friend`
        while (noun2 === noun1) {
            nouns.push(`lemon`, `friend`)
            logMessage([`-> Changing noun 2 from "${noun2}"`, nouns])
            noun2 = getNoun()
        }

        const adjective1 = getAdjective() || `lemony`
        let adjective2 = getAdjective() || `fresh`
        while (adjective2 === adjective1) {
            adjectives.push(`lemony`, `fresh`)
            logMessage([`-> Changing adjective 2 from "${adjective2}"`, adjectives])
            adjective2 = getAdjective()
        }

        const insults = [
            `${verb1} you, you ${noun1}-${addVerbSuffix(verb2, `ing`)} ${noun2}!`,
            `go ${verb1} ${getIndefiniteArticle(noun1)}, you ${adjective1} ${noun2}!`,
            `${verb1} my ${noun1}, you ${noun2}-${addVerbSuffix(verb2, `er`)}!`,
            `I hope you ${verb1} on ${getIndefiniteArticle(adjective1)}, ${adjective2} ${noun1}!`,
            `get ${addVerbSuffix(verb1, `ed`)} by ${getIndefiniteArticle(adjective1)} ${noun1}, you ${noun2}!`,
            `you're ${getIndefiniteArticle(adjective1)}, ${adjective2} ${noun1} ${addVerbSuffix(verb1, `er`)}!`,
            `you're ${getIndefiniteArticle(adjective1)} ${noun1} ${addVerbSuffix(verb1, `ing`)} ${noun2}. And you're ${adjective2}!`,
            `go get ${addVerbSuffix(verb1, `ed`)} by a ${[`hundred`, `hundred`, `hundred`, `thousand`, `thousand`, `thousand`, `million`, `million`, `billion`, `billion`, `trillion`][Math.floor(Math.random() * 7)]} ${adjective1} ${makePlural(noun1)}!`
        ]

        const insult = insults[Math.floor(Math.random() * insults.length)]

        bot.say(chatroom, `(Hey) ${targetNickname || userNickname} ${insult}`)
    }
}