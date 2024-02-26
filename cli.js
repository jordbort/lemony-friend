const { settings } = require(`./config`)
const { users } = require(`./data`)
const { talk } = require("./utils")

function cli(chatroom, args) {
    if ([`settings`, `s`].includes(args[0])) {
        if (args[1] === `listening`) {
            if (![`true`, `t`, `false`, `f`].includes(args[2])) { return talk(chatroom, `> Setting '${args[1]}' must be of value BOOLEAN (currently: ${settings.listening})`) }
            if ([`true`, `t`].includes(args[2])) { settings.listening = true }
            if ([`false`, `f`].includes(args[2])) { settings.listening = false }
            return talk(chatroom, `> Setting 'listening' set to ${settings.listening}`)
        } else if (args[1] === `sayonlinemsg`) {
            if (![`true`, `t`, `false`, `f`].includes(args[2])) { return talk(chatroom, `> Setting '${args[1]}' must be of value BOOLEAN (currently: ${settings.sayOnlineMsg})`) }
            if ([`true`, `t`].includes(args[2])) { settings.sayOnlineMsg = true }
            if ([`false`, `f`].includes(args[2])) { settings.sayOnlineMsg = false }
            return talk(chatroom, `> Setting 'sayOnlineMsg' set to ${settings.sayOnlineMsg}`)
        } else if (args[1] === `firstconnection`) {
            if (![`true`, `t`, `false`, `f`].includes(args[2])) { return talk(chatroom, `> Setting '${args[1]}' must be of value BOOLEAN (currently: ${settings.firstConnection})`) }
            if ([`true`, `t`].includes(args[2])) { settings.firstConnection = true }
            if ([`false`, `f`].includes(args[2])) { settings.firstConnection = false }
            return talk(chatroom, `> Setting 'firstConnection' set to ${settings.firstConnection}`)
        } else if (args[1] === `debug`) {
            if (![`true`, `t`, `false`, `f`].includes(args[2])) { return talk(chatroom, `> Setting '${args[1]}' must be of value BOOLEAN (currently: ${settings.debug})`) }
            if ([`true`, `t`].includes(args[2])) { settings.debug = true }
            if ([`false`, `f`].includes(args[2])) { settings.debug = false }
            return talk(chatroom, `> Setting 'debug' set to ${settings.debug}`)
        } else if (args[1] === `funnumbercount`) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${args[1]}' must be of value NUMBER (currently: ${settings.funNumberCount})`) }
            settings.funNumberCount = args[2]
            return talk(chatroom, `> Setting 'funNumberCount' set to ${settings.funNumberCount}`)
        } else if (args[1] === `funnumbertotal`) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${args[1]}' must be of value NUMBER (currently: ${settings.funNumberTotal})`) }
            settings.funNumberTotal = args[2]
            return talk(chatroom, `> Setting 'funNumberTotal' set to ${settings.funNumberTotal}`)
        } else if (args[1] === `streakthreshold`) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${args[1]}' must be of value NUMBER (currently: ${settings.streakThreshold})`) }
            settings.streakThreshold = args[2]
            return talk(chatroom, `> Setting 'streakThreshold' set to ${settings.streakThreshold}`)
        } else if (args[1] === `emotestreakthreshold`) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${args[1]}' must be of value NUMBER (currently: ${settings.emoteStreakThreshold})`) }
            settings.emoteStreakThreshold = args[2]
            return talk(chatroom, `> Setting 'emoteStreakThreshold' set to ${settings.emoteStreakThreshold}`)
        } else if (args[1] === `hangmansignupseconds`) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${args[1]}' must be of value NUMBER (currently: ${settings.hangmanSignupSeconds})`) }
            settings.hangmanSignupSeconds = args[2]
            return talk(chatroom, `> Setting 'hangmanSignupSeconds' set to ${settings.hangmanSignupSeconds}`)
        } else if (args[1] === `hangmanchances`) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${args[1]}' must be of value NUMBER (currently: ${settings.hangmanChances})`) }
            settings.hangmanChances = args[2]
            return talk(chatroom, `> Setting 'hangmanChances' set to ${settings.hangmanChances}`)
        } else if (args[1] === `chantcount`) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${args[1]}' must be of value NUMBER (currently: ${settings.chantCount})`) }
            settings.chantCount = args[2]
            return talk(chatroom, `> Setting 'chantCount' set to ${settings.chantCount}`)
        } else if (args[1] === `chantemote`) {
            settings.chantEmote = args[2]
            return talk(chatroom, `> Setting 'chantEmote' set to '${settings.chantEmote}'`)
        } else { return talk(chatroom, `> Possible 'settings' controls: listening, sayOnlineMsg, firstConnection, debug, funNumberCount, funNumberTotal, streakThreshold, emoteStreakThreshold, hangmanSignupSeconds, hangmanChances, chantCount, chantEmote`) }
    } else if ([`users`, `u`].includes(args[0])) {
        if (!args[1]) { return talk(chatroom, `> You must specify a user`) }
        const user = args[1].replace(/^@/, ``)
        if (user in users) {
            if (args[2] === `delete`) {
                delete users[user]
                return talk(chatroom, `> User '${user}' deleted`)
            } else if (args[2] === `displayname`) {
                users[user].displayName = args.slice(3).join(` `)
                return talk(chatroom, `> User '${user}' displayName set to '${users[user].displayName}'`)
            } else if (args[2] === `lemons`) {
                if (!args[3] || isNaN(Number(args[3]))) { return talk(chatroom, `> User's '${args[2]}' must be of value NUMBER (currently: ${users[user].lemons})`) }
                users[user].lemons = Number(args[3])
                return talk(chatroom, `> User '${user}' lemons set to ${users[user].lemons}`)
            } else if (args[2] === `hangmanwins`) {
                if (!args[3] || isNaN(Number(args[3]))) { return talk(chatroom, `> User's '${args[2]}' must be of value NUMBER (currently: ${users[user].hangmanWins})`) }
                users[user].hangmanWins = Number(args[3])
                return talk(chatroom, `> User '${user}' hangmanWins set to ${users[user].hangmanWins}`)
            } else if (args[2] === `riddlewins`) {
                if (!args[3] || isNaN(Number(args[3]))) { return talk(chatroom, `> User's '${args[2]}' must be of value NUMBER (currently: ${users[user].riddleWins})`) }
                users[user].riddleWins = Number(args[3])
                return talk(chatroom, `> User '${user}' riddleWins set to ${users[user].riddleWins}`)
            } else if ([`jpegstripes`, `sclarf`, `e1ectroma`, `domonintendo1`, `ppuyya`].includes(args[2])) {
                const channel = args[2]
                if (args[3] === `sub`) {
                    if (![`true`, `t`, `false`, `f`].includes(args[4])) { return talk(chatroom, `> User in ${channel}'s '${args[3]}' must be of value BOOLEAN (currently: ${users[user][channel].sub})`) }
                    if ([`true`, `t`].includes(args[4])) { users[user][channel].sub = true }
                    if ([`false`, `f`].includes(args[4])) { users[user][channel].sub = false }
                    return talk(chatroom, `> User '${user}' sub in '${channel}' set to ${users[user][channel].sub}`)
                } else if (args[3] === `mod`) {
                    if (![`true`, `t`, `false`, `f`].includes(args[4])) { return talk(chatroom, `> User in ${channel}'s '${args[3]}' must be of value BOOLEAN (currently: ${users[user][channel].mod})`) }
                    if ([`true`, `t`].includes(args[4])) { users[user][channel].mod = true }
                    if ([`false`, `f`].includes(args[4])) { users[user][channel].mod = false }
                    return talk(chatroom, `> User '${user}' mod in '${channel}' set to ${users[user][channel].mod}`)
                } else if (args[3] === `vip`) {
                    if (![`true`, `t`, `false`, `f`].includes(args[4])) { return talk(chatroom, `> User in ${channel}'s '${args[3]}' must be of value BOOLEAN (currently: ${users[user][channel].vip})`) }
                    if ([`true`, `t`].includes(args[4])) { users[user][channel].vip = true }
                    if ([`false`, `f`].includes(args[4])) { users[user][channel].vip = false }
                    return talk(chatroom, `> User '${user}' vip in '${channel}' set to ${users[user][channel].vip}`)
                } else if (args[3] === `msgcount`) {
                    if (!args[4] || isNaN(Number(args[4]))) { return talk(chatroom, `> User in ${channel}'s '${args[3]}' must be of value NUMBER (currently: ${users[user][channel].msgCount})`) }
                    users[user][channel].msgCount = Number(args[4])
                    return talk(chatroom, `> User '${user}' msgCount in '${channel}' set to ${users[user][channel].msgCount}`)
                } else if (args[3] === `lastmessage`) {
                    users[user][channel].lastMessage = args.slice(4).join(` `)
                    return talk(chatroom, `> User '${user}' lastMessage in '${channel}' set to '${users[user][channel].lastMessage}'`)
                } else if (args[3] === `away`) {
                    if (![`true`, `t`, `false`, `f`].includes(args[4])) { return talk(chatroom, `> User in ${channel}'s '${args[3]}' must be of value BOOLEAN (currently: ${users[user][channel].away})`) }
                    if ([`true`, `t`].includes(args[4])) { users[user][channel].away = true }
                    if ([`false`, `f`].includes(args[4])) { users[user][channel].away = false }
                    return talk(chatroom, `> User '${user}' away in '${channel}' set to ${users[user][channel].away}`)
                } else if (args[3] === `awaymessage`) {
                    users[user][channel].awayMessage = args.slice(4).join(` `)
                    return talk(chatroom, `> User '${user}' awayMessage in '${channel}' set to '${users[user][channel].awayMessage}'`)
                } else { return talk(chatroom, `> Possible '${channel}' controls for user '${user}': sub, mod, vip, msgCount, lastMessage, away, awayMessage`) }
            } else { return talk(chatroom, `> Possible 'user' controls: delete, displayName, lemons, hangmanWins, riddleWins, <channel ...>`) }
        } else { return talk(chatroom, `> User '${user}' is not known`) }
    }
    talk(chatroom, `> Possible configurations: (s) settings, (u) users`)
}

module.exports = { cli }