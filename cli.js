const { settings } = require(`./config`)
const { users, lemonyFresh } = require(`./data`)
const { talk } = require("./utils")

function cli(chatroom, args) {
    if ([`settings`, `s`].includes(args[0])) {
        if ([`debug`, `d`].includes(args[1])) {
            if (![`true`, `t`, `false`, `f`].includes(args[2])) { return talk(chatroom, `> Setting 'debug' must be of value BOOLEAN (currently: ${settings.debug})`) }
            if ([`true`, `t`].includes(args[2])) { settings.debug = true }
            if ([`false`, `f`].includes(args[2])) { settings.debug = false }
            return talk(chatroom, `> Setting 'debug' set to ${settings.debug}`)
        } else if ([`timelocale`, `tl`].includes(args[1])) {
            if (!args[2]) { return talk(chatroom, `> Setting 'timeLocale' is currently: ${settings.timeLocale}`) }
            settings.timeLocale = args[2]
            return talk(chatroom, `> Setting 'timeLocale' set to ${settings.timeLocale}`)
        } else if ([`timezone`, `tz`].includes(args[1])) {
            if (!args[2]) { return talk(chatroom, `> Setting 'timeZone' is currently: ${settings.timeZone.timeZone}`) }
            settings.timeZone.timeZone = args[2]
            return talk(chatroom, `> Setting 'timeZone' set to ${settings.timeZone.timeZone}`)
        } else if ([`firstconnection`, `fc`].includes(args[1])) {
            if (![`true`, `t`, `false`, `f`].includes(args[2])) { return talk(chatroom, `> Setting 'firstConnection' must be of value BOOLEAN (currently: ${settings.firstConnection})`) }
            if ([`true`, `t`].includes(args[2])) { settings.firstConnection = true }
            if ([`false`, `f`].includes(args[2])) { settings.firstConnection = false }
            return talk(chatroom, `> Setting 'firstConnection' set to ${settings.firstConnection}`)
        } else if ([`sayonlinemsg`, `som`].includes(args[1])) {
            if (![`true`, `t`, `false`, `f`].includes(args[2])) { return talk(chatroom, `> Setting 'sayOnlineMsg' must be of value BOOLEAN (currently: ${settings.sayOnlineMsg})`) }
            if ([`true`, `t`].includes(args[2])) { settings.sayOnlineMsg = true }
            if ([`false`, `f`].includes(args[2])) { settings.sayOnlineMsg = false }
            return talk(chatroom, `> Setting 'sayOnlineMsg' set to ${settings.sayOnlineMsg}`)
        } else if ([`funnumbercount`, `fnc`].includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting 'funNumberCount' must be of value NUMBER (currently: ${settings.funNumberCount})`) }
            settings.funNumberCount = args[2]
            return talk(chatroom, `> Setting 'funNumberCount' set to ${settings.funNumberCount}`)
        } else if ([`funnumbertotal`, `fnt`].includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting 'funNumberTotal' must be of value NUMBER (currently: ${settings.funNumberTotal})`) }
            settings.funNumberTotal = args[2]
            return talk(chatroom, `> Setting 'funNumberTotal' set to ${settings.funNumberTotal}`)
        } else if ([`listening`, `l`].includes(args[1])) {
            if (![`true`, `t`, `false`, `f`].includes(args[2])) { return talk(chatroom, `> Setting 'listening' must be of value BOOLEAN (currently: ${settings.listening})`) }
            if ([`true`, `t`].includes(args[2])) { settings.listening = true }
            if ([`false`, `f`].includes(args[2])) { settings.listening = false }
            return talk(chatroom, `> Setting 'listening' set to ${settings.listening}`)
        } else if ([`streakthreshold`, `st`].includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting 'streakThreshold' must be of value NUMBER (currently: ${settings.streakThreshold})`) }
            settings.streakThreshold = args[2]
            return talk(chatroom, `> Setting 'streakThreshold' set to ${settings.streakThreshold}`)
        } else if ([`emotestreakthreshold`, `est`].includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting 'emoteStreakThreshold' must be of value NUMBER (currently: ${settings.emoteStreakThreshold})`) }
            settings.emoteStreakThreshold = args[2]
            return talk(chatroom, `> Setting 'emoteStreakThreshold' set to ${settings.emoteStreakThreshold}`)
        } else if ([`hangmansignupseconds`, `hss`].includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting 'hangmanSignupSeconds' must be of value NUMBER (currently: ${settings.hangmanSignupSeconds})`) }
            settings.hangmanSignupSeconds = args[2]
            return talk(chatroom, `> Setting 'hangmanSignupSeconds' set to ${settings.hangmanSignupSeconds}`)
        } else if ([`hangmanchances`, `hc`].includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting 'hangmanChances' must be of value NUMBER (currently: ${settings.hangmanChances})`) }
            settings.hangmanChances = args[2]
            return talk(chatroom, `> Setting 'hangmanChances' set to ${settings.hangmanChances}`)
        } else if ([`chantcount`, `cc`].includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting 'chantCount' must be of value NUMBER (currently: ${settings.chantCount})`) }
            settings.chantCount = args[2]
            return talk(chatroom, `> Setting 'chantCount' set to ${settings.chantCount}`)
        } else if ([`chantemote`, `ce`].includes(args[1])) {
            settings.chantEmote = args[2]
            return talk(chatroom, `> Setting 'chantEmote' set to '${settings.chantEmote}'`)
        } else { return talk(chatroom, `> Possible 'settings' controls: listening, sayOnlineMsg, firstConnection, debug, funNumberCount, funNumberTotal, streakThreshold, emoteStreakThreshold, hangmanSignupSeconds, hangmanChances, chantCount, chantEmote`) }
    } else if ([`users`, `u`].includes(args[0])) {
        if (!args[1]) { return talk(chatroom, `> You must specify a user`) }
        const user = args[1].replace(/^@/, ``)
        if (user in users) {
            if ([`delete`, `d`].includes(args[2])) {
                delete users[user]
                return talk(chatroom, `> User '${user}' deleted`)
            } else if ([`displayname`, `n`].includes(args[2])) {
                users[user].displayName = args.slice(3).join(` `)
                return talk(chatroom, `> User '${user}' displayName set to '${users[user].displayName}'`)
            } else if ([`lemons`, `l`].includes(args[2])) {
                if (!args[3] || isNaN(Number(args[3]))) { return talk(chatroom, `> User's '${args[2]}' must be of value NUMBER (currently: ${users[user].lemons})`) }
                users[user].lemons = Number(args[3])
                return talk(chatroom, `> User '${user}' lemons set to ${users[user].lemons}`)
            } else if ([`hangmanwins`, `hw`].includes(args[2])) {
                if (!args[3] || isNaN(Number(args[3]))) { return talk(chatroom, `> User's '${args[2]}' must be of value NUMBER (currently: ${users[user].hangmanWins})`) }
                users[user].hangmanWins = Number(args[3])
                return talk(chatroom, `> User '${user}' hangmanWins set to ${users[user].hangmanWins}`)
            } else if ([`riddlewins`, `rw`].includes(args[2])) {
                if (!args[3] || isNaN(Number(args[3]))) { return talk(chatroom, `> User's '${args[2]}' must be of value NUMBER (currently: ${users[user].riddleWins})`) }
                users[user].riddleWins = Number(args[3])
                return talk(chatroom, `> User '${user}' riddleWins set to ${users[user].riddleWins}`)
            } else if ([`jpegstripes`, `j`, `sclarf`, `s`, `e1ectroma`, `e`, `domonintendo1`, `d`, `ppuyya`, `p`].includes(args[2])) {
                const channel = [`jpegstripes`, `j`].includes(args[2]) ? `jpegstripes` : [`sclarf`, `s`].includes(args[2]) ? `sclarf` : [`e1ectroma`, `e`].includes(args[2]) ? `e1ectroma` : [`domonintendo1`, `d`].includes(args[2]) ? `domonintendo1` : `ppuyya`
                if ([`sub`, `s`].includes(args[3])) {
                    if (![`true`, `t`, `false`, `f`].includes(args[4])) { return talk(chatroom, `> User in ${channel}'s '${args[3]}' must be of value BOOLEAN (currently: ${users[user][channel].sub})`) }
                    if ([`true`, `t`].includes(args[4])) { users[user][channel].sub = true }
                    if ([`false`, `f`].includes(args[4])) { users[user][channel].sub = false }
                    return talk(chatroom, `> User '${user}' sub in '${channel}' set to ${users[user][channel].sub}`)
                } else if ([`mod`, `m`].includes(args[3])) {
                    if (![`true`, `t`, `false`, `f`].includes(args[4])) { return talk(chatroom, `> User in ${channel}'s '${args[3]}' must be of value BOOLEAN (currently: ${users[user][channel].mod})`) }
                    if ([`true`, `t`].includes(args[4])) { users[user][channel].mod = true }
                    if ([`false`, `f`].includes(args[4])) { users[user][channel].mod = false }
                    return talk(chatroom, `> User '${user}' mod in '${channel}' set to ${users[user][channel].mod}`)
                } else if ([`vip`, `v`].includes(args[3])) {
                    if (![`true`, `t`, `false`, `f`].includes(args[4])) { return talk(chatroom, `> User in ${channel}'s '${args[3]}' must be of value BOOLEAN (currently: ${users[user][channel].vip})`) }
                    if ([`true`, `t`].includes(args[4])) { users[user][channel].vip = true }
                    if ([`false`, `f`].includes(args[4])) { users[user][channel].vip = false }
                    return talk(chatroom, `> User '${user}' vip in '${channel}' set to ${users[user][channel].vip}`)
                } else if ([`msgcount`, `mc`].includes(args[3])) {
                    if (!args[4] || isNaN(Number(args[4]))) { return talk(chatroom, `> User in ${channel}'s '${args[3]}' must be of value NUMBER (currently: ${users[user][channel].msgCount})`) }
                    users[user][channel].msgCount = Number(args[4])
                    return talk(chatroom, `> User '${user}' msgCount in '${channel}' set to ${users[user][channel].msgCount}`)
                } else if ([`lastmessage`, `lm`].includes(args[3])) {
                    users[user][channel].lastMessage = args.slice(4).join(` `)
                    return talk(chatroom, `> User '${user}' lastMessage in '${channel}' set to '${users[user][channel].lastMessage}'`)
                } else if ([`away`, `a`].includes(args[3])) {
                    if (![`true`, `t`, `false`, `f`].includes(args[4])) { return talk(chatroom, `> User in ${channel}'s '${args[3]}' must be of value BOOLEAN (currently: ${users[user][channel].away})`) }
                    if ([`true`, `t`].includes(args[4])) { users[user][channel].away = true }
                    if ([`false`, `f`].includes(args[4])) { users[user][channel].away = false }
                    return talk(chatroom, `> User '${user}' away in '${channel}' set to ${users[user][channel].away}`)
                } else if ([`awaymessage`, `am`].includes(args[3])) {
                    users[user][channel].awayMessage = args.slice(4).join(` `)
                    return talk(chatroom, `> User '${user}' awayMessage in '${channel}' set to '${users[user][channel].awayMessage}'`)
                } else { return talk(chatroom, `> Possible '${channel}' controls for user '${user}': (s) sub, (m) mod, (v) vip, (mc) msgCount, (lm) lastMessage, (a) away, (am) awayMessage`) }
            } else { return talk(chatroom, `> Possible 'user' controls: (d) delete, (n) displayName, (l) lemons, (hw) hangmanWins, (rw) riddleWins, <channel ...>`) }
        } else { return talk(chatroom, `> User '${user}' is not known`) }
    } else if ([`lemonyfresh`, `lf`].includes(args[0])) {
        if (![`jpegstripes`, `j`, `sclarf`, `s`, `e1ectroma`, `e`, `domonintendo1`, `d`, `ppuyya`, `p`].includes(args[1])) { return talk(chatroom, `> You must specify a Lemony Fresh member`) }
        const channel = [`jpegstripes`, `j`].includes(args[1]) ? `jpegstripes` : [`sclarf`, `s`].includes(args[1]) ? `sclarf` : [`e1ectroma`, `e`].includes(args[1]) ? `e1ectroma` : [`domonintendo1`, `d`].includes(args[1]) ? `domonintendo1` : `ppuyya`
        if ([`funtimer`, `ft`].includes(args[2])) {
            lemonyFresh[channel].funTimer = Number(args[3]) || 0
            return talk(chatroom, `> ${channel} 'funTimer' set to ${lemonyFresh[channel].funTimer}`)
        } else if ([`funtimerguesser`, `ftg`].includes(args[2])) {
            lemonyFresh[channel].funTimerGuesser = args[3] || ``
            return talk(chatroom, `> ${channel} 'funTimerGuesser' set to ${lemonyFresh[channel].funTimerGuesser}`)
        } else if ([`pollid`, `p`].includes(args[2])) {
            lemonyFresh[channel].pollId = args[3] || ``
            return talk(chatroom, `> ${channel} 'pollId' set to ${lemonyFresh[channel].pollId}`)
        } else { return talk(chatroom, `> Possible lemonyFresh controls for member '${channel}': (ft) funTimer (ftg) funTimerGuesser (p) pollId`) }
    } else { talk(chatroom, `> Possible configurations: (s) settings, (u) users, (lf) lemonyFresh`) }
}

module.exports = { cli }
