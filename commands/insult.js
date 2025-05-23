const { wordBank } = require(`../data`)
const { logMessage, pluralize, getContextEmote } = require(`../utils`)

const getIndefiniteArticle = (nextWord) => /^[aeiou]/i.test(nextWord) ? `an ${nextWord}` : `a ${nextWord}`

const makePlural = (noun) => /[^aeiou]y$/i.test(noun)
    ? `${noun.substring(0, noun.length - 1)}ies`
    : /(s|z|x|ch|sh)$/i.test(noun)
        ? `${noun}es`
        : `${noun}s`

const addVerbSuffix = (verb, suffix) => suffix === `s`
    ? /(o|s|z|x|ch|sh)$/i.test(verb)
        ? `${verb}e${suffix}`
        : /y$/i.test(verb)
            ? `${verb.substring(0, verb.length - 1)}ie${suffix}`
            : `${verb}${suffix}`
    : /[aeiou][^aeiouwxy]$/i.test(verb)
        ? verb[verb.length - 3] === verb[verb.length - 2]
            ? `${verb}${suffix}`
            : `${verb}${verb[verb.length - 1]}${suffix}`
        : /e$/i.test(verb)
            ? `${verb.substring(0, verb.length - 1)}${suffix}`
            : `${verb}${suffix}`

module.exports = {
    manageVerbs(props) {
        const { bot, chatroom, args, channel, userNickname } = props
        logMessage([`> manageVerbs(args: [${args}])`])

        const neutralEmote = getContextEmote(`neutral`, channel)
        const positiveEmote = getContextEmote(`positive`, channel)
        if (!args.length) {
            bot.say(chatroom, `I know ${pluralize(wordBank.verbs.length, `verb`, `verbs`)}${wordBank.verbs.length ? `: ${wordBank.verbs.join(`, `)} -` : `!`} Please give me more verbs to remember, or say "!verbs delete <list of verbs>" for me to forget some, or "!verbs clear" for me to forget all, ${userNickname}! ${neutralEmote}`)
            return
        }

        if (/^clear$|^c$/i.test(args[0])) {
            wordBank.verbs.length = 0
            bot.say(chatroom, `Now I know ${wordBank.verbs.length} verbs! ${positiveEmote}`)
            return
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
            bot.say(chatroom, `I forgot ${pluralize(removals.length, `verb`, `verbs`)}${removals.length ? `: ${removals.join(`, `)}` : `!`} ${neutralEmote}`)
            return
        }

        for (const word of args) { wordBank.verbs.push(word.toLowerCase()) }
        bot.say(chatroom, `Added ${pluralize(args.length, `verb`, `verbs`)}: ${args.join(`, `)} ${positiveEmote}`)
    },
    manageNouns(props) {
        const { bot, chatroom, args, channel, userNickname } = props
        logMessage([`> manageNouns(args: [${args}])`])

        const neutralEmote = getContextEmote(`neutral`, channel)
        const positiveEmote = getContextEmote(`positive`, channel)
        if (!args.length) {
            bot.say(chatroom, `I know ${pluralize(wordBank.nouns.length, `noun`, `nouns`)}${wordBank.nouns.length ? `: ${wordBank.nouns.join(`, `)} -` : `!`} Please give me more nouns to remember, or say "!nouns delete <list of nouns>" for me to forget some, or "!nouns clear" for me to forget all, ${userNickname}! ${neutralEmote}`)
            return
        }

        if (/^clear$|^c$/i.test(args[0])) {
            wordBank.nouns.length = 0
            bot.say(chatroom, `Now I know ${wordBank.nouns.length} nouns! ${positiveEmote}`)
            return
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
            bot.say(chatroom, `I forgot ${pluralize(removals.length, `noun`, `nouns`)}${removals.length ? `: ${removals.join(`, `)}` : `!`} ${neutralEmote}`)
            return
        }

        for (const word of args) { wordBank.nouns.push(word.toLowerCase()) }
        bot.say(chatroom, `Added ${pluralize(args.length, `noun`, `nouns`)}: ${args.join(`, `)} ${positiveEmote}`)
    },
    manageAdjectives(props) {
        const { bot, chatroom, args, channel, userNickname } = props
        logMessage([`> manageAdjectives(args: [${args}])`])

        const neutralEmote = getContextEmote(`neutral`, channel)
        const positiveEmote = getContextEmote(`positive`, channel)
        if (!args.length) {
            bot.say(chatroom, `I know ${pluralize(wordBank.adjectives.length, `adjective`, `adjectives`)}${wordBank.adjectives.length ? `: ${wordBank.adjectives.join(`, `)} -` : `!`} Please give me more adjectives to remember, or say "!adjectives delete <list of adjectives>" for me to forget some, or "!adjectives clear" for me to forget all, ${userNickname}! ${neutralEmote}`)
            return
        }

        if (/^clear$|^c$/i.test(args[0])) {
            wordBank.adjectives.length = 0
            bot.say(chatroom, `Now I know ${wordBank.adjectives.length} adjectives! ${positiveEmote}`)
            return
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
            bot.say(chatroom, `I forgot ${pluralize(removals.length, `adjective`, `adjectives`)}${removals.length ? `: ${removals.join(`, `)}` : `!`} ${neutralEmote}`)
            return
        }

        for (const word of args) { wordBank.adjectives.push(word.toLowerCase()) }
        bot.say(chatroom, `Added ${pluralize(args.length, `adjective`, `adjectives`)}: ${args.join(`, `)} ${positiveEmote}`)
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
            ...wordBank.nouns.map(word => `${word}-like`),
            ...wordBank.verbs.map(word => `${addVerbSuffix(word, `y`)}`)
        ]

        const verb1 = verbs[Math.floor(Math.random() * verbs.length)] || `squeeze`
        let verb2 = verbs[Math.floor(Math.random() * verbs.length)] || `juice`
        while (verb2 === verb1) {
            verbs.push(`squeeze`, `juice`)
            logMessage([`-> Changing verb 2 from "${verb2}"`, verbs])
            verb2 = verbs[Math.floor(Math.random() * verbs.length)]
        }

        const noun1 = nouns[Math.floor(Math.random() * nouns.length)] || `lemon`
        let noun2 = nouns[Math.floor(Math.random() * nouns.length)] || `friend`
        while (noun2 === noun1) {
            nouns.push(`lemon`, `friend`)
            logMessage([`-> Changing noun 2 from "${noun2}"`, nouns])
            noun2 = nouns[Math.floor(Math.random() * nouns.length)]
        }

        const adjective1 = adjectives[Math.floor(Math.random() * adjectives.length)] || `lemony`
        let adjective2 = adjectives[Math.floor(Math.random() * adjectives.length)] || `fresh`
        while (adjective2 === adjective1) {
            adjectives.push(`lemony`, `fresh`)
            logMessage([`-> Changing adjective 2 from "${adjective2}"`, adjectives])
            adjective2 = adjectives[Math.floor(Math.random() * adjectives.length)]
        }

        const insults = [
            `${verb1} you, you ${noun1}-${addVerbSuffix(verb2, `ing`)} ${noun2}!`,
            `go ${verb1} ${getIndefiniteArticle(noun1)}, you ${adjective1} ${noun2}!`,
            `${verb1} my ${noun1}, you ${noun2}-${addVerbSuffix(verb2, `er`)}!`,
            `I hope you ${verb1} on ${getIndefiniteArticle(adjective1)}, ${adjective2} ${noun1}!`,
            `I hope ${getIndefiniteArticle(adjective1)} ${noun1} ${addVerbSuffix(verb2, `s`)} your ${adjective2} ${noun2}!`,
            `get ${addVerbSuffix(verb1, `ed`)} by ${getIndefiniteArticle(adjective1)} ${noun1}, you ${noun2}!`,
            `you're ${getIndefiniteArticle(adjective1)}, ${adjective2} ${noun1} ${addVerbSuffix(verb1, `er`)}!`,
            `you're ${getIndefiniteArticle(adjective1)} ${noun1} ${addVerbSuffix(verb1, `ing`)} ${noun2}. And you're ${adjective2}!`,
            `you're not just ${getIndefiniteArticle(adjective1)} ${noun1} ${addVerbSuffix(verb1, `er`)}, but ${getIndefiniteArticle(adjective2)} ${noun2} too!`,
            `try ${addVerbSuffix(verb1, `ing`)} ${getIndefiniteArticle(adjective1)} ${noun1}, you ${adjective2} ${noun2}-${addVerbSuffix(verb2), `er`}!`,
            `go get ${addVerbSuffix(verb1, `ed`)} by a ${[`hundred`, `hundred`, `hundred`, `thousand`, `thousand`, `thousand`, `million`, `million`, `billion`, `billion`, `trillion`][Math.floor(Math.random() * 7)]} ${adjective1} ${makePlural(noun1)}!`,
            `I bet your ${noun1} ${addVerbSuffix(verb1, `s`)} like ${getIndefiniteArticle(adjective1)} ${noun2}!`,
            `your ${adjective1} ${noun1} can't ${verb1}, ${noun2}-${addVerbSuffix(verb2, `er`)}!`,
            `you're ${getIndefiniteArticle(adjective1)} ${noun1} whose ${adjective2} ${noun2} couldn't ${verb1}!`,
            `your ${adjective1} ${noun1} is ${addVerbSuffix(verb1, `ing`)} like ${getIndefiniteArticle(adjective2)} ${noun2}!`,
            `I hope ${getIndefiniteArticle(noun1)} ${addVerbSuffix(verb1, `s`)} your ${adjective1} ${noun2} while ${getIndefiniteArticle(noun2)} ${addVerbSuffix(verb2, `s`)}!`
        ]

        const insult = insults[Math.floor(Math.random() * insults.length)]

        bot.say(chatroom, `Hey ${targetNickname || toUser || userNickname} ${insult}`)
    }
}
