const { settings } = require(`../config`)
const { lemonyFresh, users, tempCmds } = require(`../data`)
const { getNeutralEmote, getPositiveEmote, getNegativeEmote, logMessage } = require(`../utils`)

const regexNumber = /\{number(-?\d+)\}/gi
const regexRandom = /\{random (.*)\}/gi

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
        .replace(/\{user\}/gi, users[username].displayName)
        .replace(/\{touser\}/gi, users[toUser]?.displayName || args[0] || users[username].displayName)
        .replace(/\{usernn\}/gi, users[username].nickname || users[username].displayName)
        .replace(/\{tousernn\}/gi, users[toUser]?.nickname || users[toUser]?.displayName || args[0] || users[username].nickname || users[username].displayName)
        .replace(/\{streamer\}/gi, users[channel]?.nickname || users[channel]?.displayName || channel)
        .replace(/\{viewer\}/gi, users[randomViewerOne]?.nickname || users[randomViewerOne]?.displayName || randomViewerOne)
        .replace(/\{viewer1\}/gi, users[randomViewerOne]?.nickname || users[randomViewerOne]?.displayName || randomViewerOne)
        .replace(/\{viewer2\}/gi, users[randomViewerTwo]?.nickname || users[randomViewerTwo]?.displayName || randomViewerTwo)
        .replace(/\{viewer3\}/gi, users[randomViewerThree]?.nickname || users[randomViewerThree]?.displayName || randomViewerThree)
        .replace(regexNumber, (occurrence) => Math.ceil(Math.random() * Number(occurrence.split(regexNumber)[1])))
        .replace(/\{1\}/g, args[0])
        .replace(/\{2\}/g, args[1])
        .replace(/\{3\}/g, args[2])
        .replace(/\{4\}/g, args[3])
        .replace(/\{5\}/g, args[4])
        .replace(/\{6\}/g, args[5])
        .replace(/\{7\}/g, args[6])
        .replace(/\{8\}/g, args[7])
        .replace(/\{9\}/g, args[8])
        .replace(regexRandom, (occurrence) => {
            const capturedArr = occurrence.split(regexRandom)[1]
                .split(`"`)
                .filter(element => element && element !== ` `)
                .map(element => element.trim())
            const randomPick = capturedArr[Math.floor(Math.random() * capturedArr.length)]
            return randomPick
        })

    return newStr
}

module.exports = {
    handleTempCmd(props) {
        const { bot, chatroom, args, channel, userNickname } = props
        logMessage([`> handleTempCmd(chatroom: ${chatroom}, args:`, `'${args.join(`', '`)}'`, `)`])

        const positiveEmote = getPositiveEmote(channel)
        const neutralEmote = getNeutralEmote(channel)
        if (!args[1]) { return bot.say(chatroom, `Hey ${userNickname}, say "!tempcmd <command_name> <command_response>..." to add/edit a command, or say "!tempcmd delete <command_name>" to delete a command. You can also use !tempcmds to view all of them! ${neutralEmote}`) }

        const negativeEmote = getNegativeEmote(channel)
        if (/^delete$/i.test(args[0])) {
            if (!(args[1].toLowerCase() in tempCmds)) { return bot.say(chatroom, `No command "${args[1].toLowerCase()}" was found! ${negativeEmote}`) }
            delete tempCmds[args[1].toLowerCase()]
            bot.say(chatroom, `Command "${args[1].toLowerCase()}" has been deleted! ${positiveEmote}`)
        } else if (/^rename$/i.test(args[0])) {
            if (!(args[1].toLowerCase() in tempCmds)) { return bot.say(chatroom, `No command "${args[1].toLowerCase()}" was found! ${negativeEmote}`) }
            if (!args[2]) { return bot.say(chatroom, `Hey ${userNickname}, I need to know what you want me to rename ${args[1].toLowerCase()} to! :O`) }
            if (args[2].toLowerCase() in tempCmds) { return bot.say(chatroom, `A command called ${args[2].toLowerCase()} already exists! Try deleting or editing it! ${negativeEmote}`) }
            tempCmds[args[2].toLowerCase()] = tempCmds[args[1].toLowerCase()]
            delete tempCmds[args[1].toLowerCase()]
            bot.say(chatroom, `Command "${args[1].toLowerCase()}" has been renamed to "${args[2].toLowerCase()}"! ${positiveEmote}`)
        } else if (args[0].toLowerCase() in tempCmds) {
            tempCmds[args[0].toLowerCase()] = args.slice(1).join(` `)
            bot.say(chatroom, `Command "${args[0].toLowerCase()}" has been edited! ${positiveEmote}`)
        } else {
            tempCmds[args[0].toLowerCase()] = args.slice(1).join(` `)
            bot.say(chatroom, `Temporary command "${args[0].toLowerCase()}" has been added! ${positiveEmote}`)
        }
    },
    getTempCmds(props) {
        const { bot, chatroom, args, channel } = props
        logMessage([`> getTempCmds(chatroom: ${chatroom}, args:`, `'${args.join(`', '`)}'`, `)`])

        const negativeEmote = getNegativeEmote(channel)
        const commands = Object.keys(tempCmds).map((key) => `${key} => "${tempCmds[key]}"`)
        bot.say(chatroom, `There ${commands.length === 1 ? `is` : `are`} ${commands.length} temporary command${commands.length === 1 ? `` : `s`}${commands.length === 0 ? `! ${negativeEmote}` : `: ${commands.join(', ')}`}`)
    },
    useTempCmd(props) {
        const { bot, chatroom, command } = props
        logMessage([`> useTempCmd(command: ${command}, response: ${tempCmds[command]})`])

        const response = applyVariables(tempCmds[command], props)
        bot.say(chatroom, response)
    }
}
