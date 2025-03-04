const { settings } = require(`../config`)
const { lemonyFresh, users, lemCmds } = require(`../data`)
const { getContextEmote, logMessage, pluralize } = require(`../utils`)

const regexNumber = /\{\s?number\s?(-?\d+)\s?\}/gi
const regexRandom = /\{\s?random\s?("[^"]+"\s?)+\s?\}/gi
const regexExclusion = /^$|^\s$|^\s?\}$|^\{\s?random\s?$/i
const regexQuote = /"(.+?)"/

function applyVariables(str, props) {
    const { args, channel, username, toUser } = props
    logMessage([`-> applyVariables(str: ${str}, args:`, `'${args.join(`', '`)}'`, `)`])

    const viewers = lemonyFresh[channel].viewers.filter(viewer => !settings.ignoredBots.includes(viewer))
    const randomViewerOne = viewers[Math.floor(Math.random() * viewers.length)]

    let randomViewerTwo = viewers[Math.floor(Math.random() * viewers.length)]
    if (viewers.length > 1) {
        while (randomViewerTwo === randomViewerOne) {
            randomViewerTwo = viewers[Math.floor(Math.random() * viewers.length)]
        }
    }

    let randomViewerThree = viewers[Math.floor(Math.random() * viewers.length)]
    if (viewers.length > 2) {
        while (randomViewerThree === randomViewerOne || randomViewerThree === randomViewerTwo) {
            randomViewerThree = viewers[Math.floor(Math.random() * viewers.length)]
        }
    }

    const newStr = str
        .replace(/\{\s?user\s?\}/gi, users[username].displayName)
        .replace(/\{\s?touser\s?\}/gi, users[toUser]?.displayName || args[0] || users[username].displayName)
        .replace(/\{\s?usernn\s?\}/gi, users[username].nickname || users[username].displayName)
        .replace(/\{\s?tousernn\s?\}/gi, users[toUser]?.nickname || users[toUser]?.displayName || args[0] || users[username].nickname || users[username].displayName)
        .replace(/\{\s?streamer\s?\}/gi, users[channel]?.nickname || users[channel]?.displayName || channel)
        .replace(/\{\s?viewer\s?\}/gi, users[randomViewerOne]?.nickname || users[randomViewerOne]?.displayName || randomViewerOne)
        .replace(/\{\s?viewer\s?1\s?\}/gi, users[randomViewerOne]?.nickname || users[randomViewerOne]?.displayName || randomViewerOne)
        .replace(/\{\s?viewer\s?2\s?\}/gi, users[randomViewerTwo]?.nickname || users[randomViewerTwo]?.displayName || randomViewerTwo)
        .replace(/\{\s?viewer\s?3\s?\}/gi, users[randomViewerThree]?.nickname || users[randomViewerThree]?.displayName || randomViewerThree)
        .replace(regexNumber, (occurrence) => Math.ceil(Math.random() * Number(occurrence.split(regexNumber)[1])))
        .replace(/\{\s?1\s?\}/g, args[0] || ``)
        .replace(/\{\s?2\s?\}/g, args[1] || ``)
        .replace(/\{\s?3\s?\}/g, args[2] || ``)
        .replace(/\{\s?4\s?\}/g, args[3] || ``)
        .replace(/\{\s?5\s?\}/g, args[4] || ``)
        .replace(/\{\s?6\s?\}/g, args[5] || ``)
        .replace(/\{\s?7\s?\}/g, args[6] || ``)
        .replace(/\{\s?8\s?\}/g, args[7] || ``)
        .replace(/\{\s?9\s?\}/g, args[8] || ``)
        .replace(regexRandom, (occurrence) => {
            const capturedArr = occurrence
                .split(regexQuote)
                .filter(element => !regexExclusion.test(element))
            const randomPick = capturedArr[Math.floor(Math.random() * capturedArr.length)]
            return randomPick
        })

    return newStr
}

module.exports = {
    handleLemCmd(props) {
        const { bot, chatroom, args, channel, userNickname } = props
        logMessage([`> handleLemCmd(chatroom: ${chatroom}, args:`, `'${args.join(`', '`)}'`, `)`])

        const positiveEmote = getContextEmote(`positive`, channel)
        const neutralEmote = getContextEmote(`neutral`, channel)
        if (!args[1]) { return bot.say(chatroom, `Hey ${userNickname}, say "!lemcmd <command_name> <command_response>..." to add/edit a command, or say "!lemcmd delete <command_name>" to delete a command. You can also use !lemcmds to view all of them! ${neutralEmote}`) }

        const negativeEmote = getContextEmote(`negative`, channel)
        if (/^delete$/i.test(args[0])) {
            if (!(args[1].toLowerCase() in lemCmds)) { return bot.say(chatroom, `No command "${args[1].toLowerCase()}" was found! ${negativeEmote}`) }
            delete lemCmds[args[1].toLowerCase()]
            bot.say(chatroom, `Command "${args[1].toLowerCase()}" has been deleted! ${positiveEmote}`)
        } else if (/^check$/i.test(args[0])) {
            if (!(args[1].toLowerCase() in lemCmds)) { return bot.say(chatroom, `No command "${args[1].toLowerCase()}" was found! ${negativeEmote}`) }
            bot.say(chatroom, `Command "${args[1].toLowerCase()}" => ${lemCmds[args[1].toLowerCase()]}`)
        } else if (/^rename$/i.test(args[0])) {
            if (!(args[1].toLowerCase() in lemCmds)) { return bot.say(chatroom, `No command "${args[1].toLowerCase()}" was found! ${negativeEmote}`) }
            if (!args[2]) { return bot.say(chatroom, `Hey ${userNickname}, I need to know what you want me to rename ${args[1].toLowerCase()} to! :O`) }
            if (args[2].toLowerCase() in lemCmds) { return bot.say(chatroom, `A command called ${args[2].toLowerCase()} already exists! Try deleting or editing it! ${negativeEmote}`) }
            lemCmds[args[2].toLowerCase()] = lemCmds[args[1].toLowerCase()]
            delete lemCmds[args[1].toLowerCase()]
            bot.say(chatroom, `Command "${args[1].toLowerCase()}" has been renamed to "${args[2].toLowerCase()}"! ${positiveEmote}`)
        } else if (args[0].toLowerCase() in lemCmds) {
            lemCmds[args[0].toLowerCase()] = args.slice(1).join(` `)
            bot.say(chatroom, `Command "${args[0].toLowerCase()}" has been edited! ${positiveEmote}`)
        } else {
            lemCmds[args[0].toLowerCase()] = args.slice(1).join(` `)
            bot.say(chatroom, `Lemon command "${args[0].toLowerCase()}" has been added! ${positiveEmote}`)
        }
    },
    getLemCmds(props) {
        const { bot, chatroom, args, channel } = props
        logMessage([`> getLemCmds(chatroom: ${chatroom}, args:`, `'${args.join(`', '`)}'`, `)`])

        const negativeEmote = getContextEmote(`negative`, channel)
        const commands = Object.keys(lemCmds)
        bot.say(chatroom, `There ${commands.length === 1 ? `is` : `are`} ${pluralize(commands.length, `lemon command`, `lemon commands`)}${commands.length === 0 ? `! ${negativeEmote}` : `: ${commands.join(`, `)}`}`)
    },
    useLemCmd(props) {
        const { bot, chatroom, command } = props
        logMessage([`> useLemCmd(command: ${command}, response: ${lemCmds[command]})`])

        const response = applyVariables(lemCmds[command], props)
        bot.say(chatroom, response)
    }
}
