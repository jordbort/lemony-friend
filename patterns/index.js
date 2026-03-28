const BOT_USERNAME = process.env.BOT_USERNAME
const BOT_NICKNAME_REGEX = process.env.BOT_NICKNAME_REGEX

const { users } = require(`../data`)

const sayButt = require(`./sayButt`)
const useLemon = require(`./useLemon`)
const commandLemonInterface = require(`./cli`)

const { logMessage } = require(`../utils`)
const { checkSentiment } = require(`../commands/external`)
const { catchPokemon, buyPokeballs, acknowledgeCaughtPokemon } = require(`./pokemoncommunitygame`)
const { handleSetPoints, handleGivenPoints, subtractPoints, handleLoseAllPoints, acceptDuel } = require(`./streamelements`)
const { handleGreetOne, sayGoodnight, sayThanks, sayYoureWelcome, sayMood, contextReact } = require(`../commands/conversation`)
const { checkEmotes, checkSelfSub, checkSelfMod, checkSelfVIP, checkTargetSub, checkTargetMod, checkTargetVIP } = require(`./checkChannelInfo`)

const sePatterns = {
    [/lost (every|it)/i]: handleLoseAllPoints,
    [/^@?lemony_friend, .* wants to duel you/i]: acceptDuel
}

const seSplitMessagePatterns = {
    [/now ha(?:s|ve) \[*(\d*)/i]: handleSetPoints,
    [/lemony_friend has ([^a-z]\d*)/i]: handleSetPoints,
    [/set lemony_friend .* to /i]: handleSetPoints,
    [/^@?lemony_friend, you only have ([^a-z]\d*)/i]: handleSetPoints,
    [/^(?!lemony_friend).* gave (\d*)/i]: handleGivenPoints,
    [/lemony_friend gave ([^a-z]\d*)/i]: subtractPoints
}

const pcgPatterns = {
    [/Catch it using !pokecatch \(winners revealed in 90s\)/i]: catchPokemon,
    [/Purchase successful!/i]: catchPokemon,
    [/You don't own that ball. Check the extension to see your items/i]: buyPokeballs,
    [/has been caught by/i]: acknowledgeCaughtPokemon
}

const mentionedPatterns = {
    // good( something? )night
    [/\bg+o{2,}d+\s?(.*\s)?(n+i+g+h+t+|n+i+t+e+)/i]: sayGoodnight,
    // gn
    [/\b(g+n+)+\b/i]: sayGoodnight,
    // bye (includes good bye)
    [/\b(b+y+e+)+/i]: sayGoodnight,
    // goodbye
    [/g+o{2,}d+\s?b+y+e+/i]: sayGoodnight,

    // gj
    [/\b(g+j+)+\b/i]: sayThanks,
    // nj
    [/\b(n+j+)+\b/i]: sayThanks,
    // wd
    [/\b(w+d+)+\b/i]: sayThanks,
    // good/nice/great job/work/one
    [/\b(g+o{2,}d+|n+i+c+e+|g+r+e+a+t+)\b.*\b(j+o+b+|w+o+r+k+|o+n+e+)/i]: sayThanks,
    // well done
    [/\bw+e+l{2,}\b.*\bd+o+n+e+/i]: sayThanks,
    // congrat(ulation)s
    [/c+o+n+g+r+a+t+(u+l+a+t+i+o+n+)?s+/i]: sayThanks,

    // how are you
    [/\bh+o+w+\b.*\b(a+r+e+|r+)\b.*\b(y+o+)?u+\b/i]: sayMood,
    // how about you
    [/\bh+o+w+\sa+b+o+u+t+\s(y+o+)?u+\b/i]: sayMood,
    // how're you
    [/\bh+o+w+['"]*r+e+\b.*\b(y+o+)?u+/i]: sayMood,
    // hru/hbu
    [/\bh+(r|b)+u+\b/i]: sayMood,
    // hyd
    [/\bh+y+d+\b/i]: sayMood,
    // how is it going
    [/\bh+o+w+\b.*\bi+s+\b.*\bi+t+\b.*\bg+o+i+n+['"g]*\b/i]: sayMood,
    // how's it going
    [/\bh+o+w+['"]*s+\b.*\bi+t+\b.*\bg+o+i+n+['"g]*\b/i]: sayMood,

    // ty, tysm, tyvm
    [/\b(t+y+[svm]*)+\b/i]: sayYoureWelcome,
    // thank you
    [/\bt+h*a+n+k+\b.*\b(y+o*u+|y+e+w+|u+)\b/i]: sayYoureWelcome,
    // thanks
    [/\bt+h*a+n+k+/i]: sayYoureWelcome,

    // what up
    [/\bw+h*[au]+t+\b.*\bu+p+/i]: handleGreetOne,
    // what's up
    [/\bw+h*[au]+t+['"]*s+\b.*\bu+p+/i]: handleGreetOne,
    // wassup
    [/\b((w+h*[au]+)?['"]*(d|s|t)+u+p+)+\b/i]: handleGreetOne,
    // hello
    [/\bh*[aeu]+n*l+(o+|u+r+)\b/i]: handleGreetOne,
    // hi
    [/\b(h+i+)+\b/i]: handleGreetOne,
    // heyo
    [/\b(h*[ae]+y+[ao]*)+\b/i]: handleGreetOne,
    // howdy
    [/\b(m+e+|h+)o+w+d+y+/i]: handleGreetOne,
    // yo
    [/\b(y+o+)+\b/i]: handleGreetOne,

    // "ok(ay) lemon"/"lemon ok(ay)"
    [RegExp(`^o+k+(a*y+)?\\s${BOT_NICKNAME_REGEX}\\b|^${BOT_NICKNAME_REGEX}\\so+k+(a*y+)?\\b`, `i`)]: (props) => contextReact(props, `dumb`),
    // "yes lemon"/"lemon yes"
    [RegExp(`^y+e+s+\\s${BOT_NICKNAME_REGEX}\\b|^${BOT_NICKNAME_REGEX}\\sy+e+s+\\b`, `i`)]: (props) => contextReact(props, `neutral`),
    // "no lemon"/"lemon no"
    [RegExp(`^n+o+\\s${BOT_NICKNAME_REGEX}\\b|^${BOT_NICKNAME_REGEX}\\sn+o+\\b`, `i`)]: (props) => contextReact(props, `negative`),

    // good bot
    [/\bg+o{2,}d+\sb+ot+\b/i]: (props) => contextReact(props, `hype`),

    // Contains "you", "u", "u're", "yr", "yourself", "urself", etc.
    [/\b(y?o?u|y(e|u)?)['"]*r*e*(self)?\b/i]: checkSentiment
}

const splitMessagePatterns = {
    [/\bbut([a-s|u-z]+)\b/i]: sayButt,
    [/^!([a-z]+)lemon([a-z]*)/i]: useLemon,
    [/^cli ?\b/i]: commandLemonInterface,

    [/how many emotes does (@?[a-z0-9_\s]+) have/i]: checkEmotes,
    [/how many emotes are in (@?[a-z0-9_\s]+)/i]: checkEmotes,

    [/do i (have a )?sub[\w]*( (to|in) )?/i]: checkSelfSub,
    [/am i (a )?sub[\w]*( (to|in) )?/i]: checkSelfSub,

    [/do i (have )?mod[\w]*( (for|in) )?/i]: checkSelfMod,
    [/am i (a )?mod[\w]*( (for|in) )?/i]: checkSelfMod,

    [/do i (have )?vip[\w]*( (to|in) )?/i]: checkSelfVIP,
    [/am i (a )?vip[\w]*( (to|in) )?/i]: checkSelfVIP,

    [/does (@?[a-z0-9_\s]+) have a sub[\w]*( (to|in) )?/i]: checkTargetSub,
    [/does (@?[a-z0-9_\s]+) sub[\w]*( (to|in) )?/i]: checkTargetSub,
    [/is (@?[a-z0-9_\s]+) a sub[\w]*( (to|in) )?/i]: checkTargetSub,
    [/is (@?[a-z0-9_\s]+) sub[\w]*( (to|in) )?/i]: checkTargetSub,

    [/does (@?[a-z0-9_\s]+) have a mod[\w]*( (for|in) )?/i]: checkTargetMod,
    [/does (@?[a-z0-9_\s]+) mod[\w]*( (for|in) )?/i]: checkTargetMod,
    [/is (@?[a-z0-9_\s]+) a mod[\w]*( (for|in) )?/i]: checkTargetMod,
    [/is (@?[a-z0-9_\s]+) mod[\w]*( (for|in) )?/i]: checkTargetMod,

    [/does (@?[a-z0-9_\s]+) have vip[\w]*( (to|in) )?/i]: checkTargetVIP,
    [/is (@?[a-z0-9_\s]+) a vip[\w]*( (to|in) )?/i]: checkTargetVIP,
    [/is (@?[a-z0-9_\s]+) vip[\w]*( (to|in) )?/i]: checkTargetVIP
}

module.exports = function usePattern(props) {
    const { bot, chatroom, username, message, channel } = props

    // Interaction with StreamElements
    if (username === `streamelements`) {
        if (message.includes(BOT_USERNAME)) {
            for (const pattern in sePatterns) {
                const regex = new RegExp(pattern.split(`/`)[1], pattern.split(`/`)[2])
                if (regex.test(message)) {
                    logMessage([`${username.toUpperCase()} MATCHED REGEX PATTERN:`, regex, `[Function: ${sePatterns[regex].name}]`])
                    sePatterns[regex](props, message.split(regex))
                    return true
                }
            }

            for (const pattern in seSplitMessagePatterns) {
                const regex = new RegExp(pattern.split(`/`)[1], pattern.split(`/`)[2])
                if (regex.test(message)) {
                    logMessage([`${username.toUpperCase()} MATCHED REGEX PATTERN:`, regex, `[Function: ${seSplitMessagePatterns[regex].name}]`])
                    seSplitMessagePatterns[regex](props, message.split(regex))
                    return true
                }
            }
            logMessage([`${username.toUpperCase()} DID NOT MATCH REGEX PATTERNS`])
        }

        if (!(`points` in Object(users[BOT_USERNAME].channels[channel]))) {
            users[BOT_USERNAME].channels[channel].points = 0
            bot.say(chatroom, `!points`)
            return true
        }
    }

    // Interaction with PokemonCommunityGame
    if (username === `pokemoncommunitygame` && message.includes(BOT_USERNAME)) {
        for (const pattern in pcgPatterns) {
            const regex = new RegExp(pattern.split(`/`)[1], pattern.split(`/`)[2])
            if (regex.test(message)) {
                logMessage([`${username.toUpperCase()} MATCHED REGEX PATTERN:`, regex, `[Function: ${pcgPatterns[regex].name}]`])
                pcgPatterns[regex](props)
                return true
            }
        }
        logMessage([`${username.toUpperCase()} DID NOT MATCH REGEX PATTERNS`])
    }

    // Bot mentioned
    if (RegExp(`\\b${BOT_NICKNAME_REGEX}\\b`, `i`).test(message)) {
        for (const pattern in mentionedPatterns) {
            const regex = new RegExp(pattern.split(`/`)[1], pattern.split(`/`)[2])
            if (regex.test(message)) {
                logMessage([`MESSAGE MATCHED REGEX PATTERN:`, regex, `[Function: ${mentionedPatterns[regex].name}]`])
                mentionedPatterns[regex](props)
                return true
            }
        }
        logMessage([`BOT MENTION DID NOT MATCH REGEX PATTERNS`])
    }

    // Miscellaneous RegEx patterns
    for (const pattern in splitMessagePatterns) {
        const regex = new RegExp(pattern.split(`/`)[1], pattern.split(`/`)[2])
        if (regex.test(message)) {
            logMessage([`MESSAGE MATCHED REGEX PATTERN:`, regex, `[Function: ${splitMessagePatterns[regex].name}]`])
            splitMessagePatterns[regex](props, message.split(regex))
            return true
        }
    }

    return false
}
