const { tempCmds } = require(`../data`)
const { getNeutralEmote, getPositiveEmote, getNegativeEmote, logMessage } = require(`../utils`)

module.exports = {
    handleTempCmd(props) {
        const { bot, chatroom, args, channel, userNickname } = props
        logMessage([`> handleTempCmd(chatroom: ${chatroom}, args:`, args, `)`])

        const positiveEmote = getPositiveEmote(channel)
        const neutralEmote = getNeutralEmote(channel)
        if (!args[1]) { return bot.say(chatroom, `Hey ${userNickname}, say "!tempcmd <command_name> <command_response>..." to add/edit a command, or say "!tempcmd delete <command_name>" to delete a command. You can also use !tempcmds to view all of them! :)${neutralEmote}`) }

        const negativeEmote = getNegativeEmote(channel)
        if (/^delete$/i.test(args[0])) {
            if (!(args[1].toLowerCase() in tempCmds)) { return bot.say(chatroom, `No command "${args[1].toLowerCase()}" was found! ${negativeEmote}`) }
            delete tempCmds[args[1].toLowerCase()]
            bot.say(chatroom, `Command "${args[1].toLowerCase()}" has been deleted! ${positiveEmote}`)
        } else if (/^rename$/i.test(args[0])) {
            if (!(args[1].toLowerCase() in tempCmds)) { return bot.say(chatroom, `No command "${args[1].toLowerCase()}" was found! ${negativeEmote}`) }
            if (!args[2]) { return bot.say(chatroom, `Hey ${userNickname}, I need to know what you want me to rename ${args[1].toLowerCase()} to! :O`) }
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
        logMessage([`> getTempCmds(chatroom: ${chatroom}, args:`, args, `)`])

        const negativeEmote = getNegativeEmote(channel)
        const commands = Object.keys(tempCmds).map((key) => `${key} => "${tempCmds[key]}"`)
        bot.say(chatroom, `There ${commands.length === 1 ? `is` : `are`} ${commands.length} temporary command${commands.length === 1 ? `` : `s`}${commands.length === 0 ? `! ${negativeEmote}` : `: ${commands.join(', ')}`}`)
    }
}
