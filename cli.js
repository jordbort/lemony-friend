// Import global settings
const { settings } = require(`./config`)

// Import data
const { lemonyFresh, mods, users } = require(`./data`)

// Import bot's ability to speak
const { talk } = require("./utils")

const settingsOptions = {
    debug: {
        aliases: [`debug`, `d`],
        name: `debug`
    },
    timelocale: {
        aliases: [`timelocale`, `tl`],
        name: `timeLocale`
    },
    timezone: {
        aliases: [`timezone`, `tz`],
        name: `timeZone`
    },
    firstconnection: {
        aliases: [`firstconnection`, `fc`],
        name: `firstConnection`
    },
    sayonlinemsg: {
        aliases: [`sayonlinemsg`, `som`],
        name: `sayOnlineMsg`
    },
    funnumbercount: {
        aliases: [`funnumbercount`, `fnc`],
        name: `funNumberCount`
    },
    funnumbertotal: {
        aliases: [`funnumbertotal`, `fnt`],
        name: `funNumberTotal`
    },
    funtimerduration: {
        aliases: [`funtimerduration`, `ftd`],
        name: `funTimerDuration`
    },
    listening: {
        aliases: [`listening`, `l`],
        name: `listening`
    },
    streakthreshold: {
        aliases: [`streakthreshold`, `st`],
        name: `streakThreshold`
    },
    emotestreakthreshold: {
        aliases: [`emotestreakthreshold`, `est`],
        name: `emoteStreakThreshold`
    },
    hangmansignupseconds: {
        aliases: [`hangmansignupseconds`, `hss`],
        name: `hangmanSignupSeconds`
    },
    hangmanchances: {
        aliases: [`hangmanchances`, `hc`],
        name: `hangmanChances`
    },
    chantcount: {
        aliases: [`chantcount`, `cc`],
        name: `chantCount`
    },
    chantemote: {
        aliases: [`chantemote`, `ce`],
        name: `chantEmote`
    }
}
const usersOptions = {
    displayname: {
        aliases: [`displayname`, `n`],
        name: `displayName`
    },
    lemons: {
        aliases: [`lemons`, `l`],
        name: `lemons`
    },
    hangmanwins: {
        aliases: [`hangmanwins`, `hw`],
        name: `hangmanWins`
    },
    riddlewins: {
        aliases: [`riddlewins`, `rw`],
        name: `riddleWins`
    },
    sub: {
        aliases: [`sub`, `s`],
        name: `sub`
    },
    mod: {
        aliases: [`mod`, `m`],
        name: `mod`
    },
    vip: {
        aliases: [`vip`, `v`],
        name: `vip`
    },
    msgcount: {
        aliases: [`msgcount`, `mc`],
        name: `msgCount`
    },
    lastmessage: {
        aliases: [`lastmessage`, `lm`],
        name: `lastMessage`
    },
    away: {
        aliases: [`away`, `a`],
        name: `away`
    },
    awaymessage: {
        aliases: [`awaymessage`, `am`],
        name: `awayMessage`
    }
}
const lemonyFreshOptions = {
    funtimer: {
        aliases: [`funtimer`, `ft`],
        name: `funTimer`
    },
    funtimerguesser: {
        aliases: [`funtimerguesser`, `ftg`],
        name: `funTimerGuesser`
    },
    pollid: {
        aliases: [`pollid`, `p`],
        name: `pollId`
    }
}
const modOptions = {
    id: {
        aliases: [`id`, `i`],
        name: `id`
    },
    ismodin: {
        aliases: [`ismodin`, `m`],
        name: `isModIn`
    },
    accesstoken: {
        aliases: [`accesstoken`, `at`],
        name: `accessToken`
    },
    refreshtoken: {
        aliases: [`refreshtoken`, `rt`],
        name: `refreshToken`
    }
}
const { debug, timelocale, timezone, firstconnection, sayonlinemsg, funnumbercount, funnumbertotal, funtimerduration, listening, streakthreshold, emotestreakthreshold, hangmansignupseconds, hangmanchances, chantcount, chantemote } = settingsOptions
const { displayname, lemons, hangmanwins, riddlewins, sub, mod, vip, msgcount, lastmessage, away, awaymessage } = usersOptions
const { funtimer, funtimerguesser, pollid } = lemonyFreshOptions
const { id, ismodin, accesstoken, refreshtoken } = modOptions

function cli(chatroom, args) {
    if ([`settings`, `s`].includes(args[0])) {
        if (debug.aliases.includes(args[1])) {
            if (![`true`, `t`, `false`, `f`].includes(args[2])) { return talk(chatroom, `> Setting '${debug.name}' must be of value BOOLEAN (currently: ${settings[debug.name]})`) }
            if ([`true`, `t`].includes(args[2])) { settings[debug.name] = true }
            if ([`false`, `f`].includes(args[2])) { settings[debug.name] = false }
            return talk(chatroom, `> Setting '${debug.name}' set to ${settings[debug.name]}`)
        } else if (timelocale.aliases.includes(args[1])) {
            if (!args[2]) { return talk(chatroom, `> Setting '${timelocale.name}' is currently: ${settings[timelocale.name]}`) }
            settings[timelocale.name] = args[2]
            return talk(chatroom, `> Setting '${timelocale.name}' set to ${settings[timelocale.name]}`)
        } else if (timezone.aliases.includes(args[1])) {
            if (!args[2]) { return talk(chatroom, `> Setting '${timezone.name}' is currently: ${settings.timeZone[timezone.name]}`) }
            settings.timeZone[timezone.name] = args[2]
            return talk(chatroom, `> Setting '${timezone.name}' set to ${settings.timeZone[timezone.name]}`)
        } else if (firstconnection.aliases.includes(args[1])) {
            if (![`true`, `t`, `false`, `f`].includes(args[2])) { return talk(chatroom, `> Setting '${firstconnection.name}' must be of value BOOLEAN (currently: ${settings[firstconnection.name]})`) }
            if ([`true`, `t`].includes(args[2])) { settings[firstconnection.name] = true }
            if ([`false`, `f`].includes(args[2])) { settings[firstconnection.name] = false }
            return talk(chatroom, `> Setting '${firstconnection.name}' set to ${settings[firstconnection.name]}`)
        } else if (sayonlinemsg.aliases.includes(args[1])) {
            if (![`true`, `t`, `false`, `f`].includes(args[2])) { return talk(chatroom, `> Setting '${sayonlinemsg.name}' must be of value BOOLEAN (currently: ${settings[sayonlinemsg.name]})`) }
            if ([`true`, `t`].includes(args[2])) { settings[sayonlinemsg.name] = true }
            if ([`false`, `f`].includes(args[2])) { settings[sayonlinemsg.name] = false }
            return talk(chatroom, `> Setting '${sayonlinemsg.name}' set to ${settings[sayonlinemsg.name]}`)
        } else if (funnumbercount.aliases.includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${funnumbercount.name}' must be of value NUMBER (currently: ${settings[funnumbercount.name]})`) }
            settings[funnumbercount.name] = Number(args[2])
            return talk(chatroom, `> Setting '${funnumbercount.name}' set to ${settings[funnumbercount.name]}`)
        } else if (funnumbertotal.aliases.includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${funnumbertotal.name}' must be of value NUMBER (currently: ${settings[funnumbertotal.name]})`) }
            settings[funnumbertotal.name] = Number(args[2])
            return talk(chatroom, `> Setting '${funnumbertotal.name}' set to ${settings[funnumbertotal.name]}`)
        } else if (funtimerduration.aliases.includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${funtimerduration.name}' must be of value NUMBER (currently: ${settings[funtimerduration.name]})`) }
            settings[funtimerduration.name] = Number(args[2])
            return talk(chatroom, `> Setting '${funtimerduration.name}' set to ${settings[funtimerduration.name]}`)
        } else if (streakthreshold.aliases.includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${streakthreshold.name}' must be of value NUMBER (currently: ${settings[streakthreshold.name]})`) }
            settings[streakthreshold.name] = Number(args[2])
            return talk(chatroom, `> Setting '${streakthreshold.name}' set to ${settings[streakthreshold.name]}`)
        } else if (emotestreakthreshold.aliases.includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${emotestreakthreshold.name}' must be of value NUMBER (currently: ${settings[emotestreakthreshold.name]})`) }
            settings[emotestreakthreshold.name] = Number(args[2])
            return talk(chatroom, `> Setting '${emotestreakthreshold.name}' set to ${settings[emotestreakthreshold.name]}`)
        } else if (hangmansignupseconds.aliases.includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${hangmansignupseconds.name}' must be of value NUMBER (currently: ${settings[hangmansignupseconds.name]})`) }
            settings[hangmansignupseconds.name] = Number(args[2])
            return talk(chatroom, `> Setting '${hangmansignupseconds.name}' set to ${settings[hangmansignupseconds.name]}`)
        } else if (hangmanchances.aliases.includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${hangmanchances.name}' must be of value NUMBER (currently: ${settings[hangmanchances.name]})`) }
            settings[hangmanchances.name] = Number(args[2])
            return talk(chatroom, `> Setting '${hangmanchances.name}' set to ${settings[hangmanchances.name]}`)
        } else if (chantcount.aliases.includes(args[1])) {
            if (!args[2] || isNaN(Number(args[2]))) { return talk(chatroom, `> Setting '${chantcount.name}' must be of value NUMBER (currently: ${settings[chantcount.name]})`) }
            settings[chantcount.name] = Number(args[2])
            return talk(chatroom, `> Setting '${chantcount.name}' set to ${settings[chantcount.name]}`)
        } else if (chantemote.aliases.includes(args[1])) {
            settings[chantemote.name] = args[2]
            return talk(chatroom, `> Setting '${chantemote.name}' set to ${settings[chantemote.name]}`)
        } else { return talk(chatroom, `> Possible 'settings' controls: listening, sayOnlineMsg, firstConnection, debug, funNumberCount, funNumberTotal, streakThreshold, emoteStreakThreshold, hangmanSignupSeconds, hangmanChances, chantCount, chantEmote`) }
    } else if ([`users`, `u`].includes(args[0])) {
        if (!args[1]) { return talk(chatroom, `> You must specify a user`) }
        const user = args[1].replace(/^@/, ``)
        if (user in users) {
            if ([`delete`, `d`].includes(args[2])) {
                delete users[user]
                return talk(chatroom, `> User '${user}' deleted`)
            } else if (displayname.aliases.includes(args[2])) {
                users[user][displayname.name] = args.slice(3).join(` `)
                return talk(chatroom, `> User '${user}' ${displayname.name} set to '${users[user][displayname.name]}'`)
            } else if (lemons.aliases.includes(args[2])) {
                if (!args[3] || isNaN(Number(args[3]))) { return talk(chatroom, `> User's 'lemons' must be of value NUMBER (currently: ${users[user][lemons.name]})`) }
                users[user][lemons.name] = Number(args[3])
                return talk(chatroom, `> User '${user}' ${lemons.name} set to ${users[user][lemons.name]}`)
            } else if (hangmanwins.aliases.includes(args[2])) {
                if (!args[3] || isNaN(Number(args[3]))) { return talk(chatroom, `> User's 'hangmanwins' must be of value NUMBER (currently: ${users[user][hangmanwins.name]})`) }
                users[user][hangmanwins.name] = Number(args[3])
                return talk(chatroom, `> User '${user}' ${hangmanwins.name} set to ${users[user][hangmanwins.name]}`)
            } else if (riddlewins.aliases.includes(args[2])) {
                if (!args[3] || isNaN(Number(args[3]))) { return talk(chatroom, `> User's 'riddlewins' must be of value NUMBER (currently: ${users[user][riddlewins.name]})`) }
                users[user][riddlewins.name] = Number(args[3])
                return talk(chatroom, `> User '${user}' ${riddlewins.name} set to ${users[user][riddlewins.name]}`)
            } else if ([`jpegstripes`, `j`, `sclarf`, `s`, `e1ectroma`, `e`, `domonintendo1`, `d`, `ppuyya`, `p`].includes(args[2])) {
                const channel = [`jpegstripes`, `j`].includes(args[2]) ? `jpegstripes` : [`sclarf`, `s`].includes(args[2]) ? `sclarf` : [`e1ectroma`, `e`].includes(args[2]) ? `e1ectroma` : [`domonintendo1`, `d`].includes(args[2]) ? `domonintendo1` : `ppuyya`
                if (sub.aliases.includes(args[3])) {
                    if (![`true`, `t`, `false`, `f`].includes(args[4])) { return talk(chatroom, `> User in ${channel}'s '${sub.name}' must be of value BOOLEAN (currently: ${users[user][channel][sub.name]})`) }
                    if ([`true`, `t`].includes(args[4])) { users[user][channel][sub.name] = true }
                    if ([`false`, `f`].includes(args[4])) { users[user][channel][sub.name] = false }
                    return talk(chatroom, `> User '${user}' sub in '${channel}' set to ${users[user][channel][sub.name]}`)
                } else if (mod.aliases.includes(args[3])) {
                    if (![`true`, `t`, `false`, `f`].includes(args[4])) { return talk(chatroom, `> User in ${channel}'s '${mod.name}' must be of value BOOLEAN (currently: ${users[user][channel][mod.name]})`) }
                    if ([`true`, `t`].includes(args[4])) { users[user][channel][mod.name] = true }
                    if ([`false`, `f`].includes(args[4])) { users[user][channel][mod.name] = false }
                    return talk(chatroom, `> User '${user}' mod in '${channel}' set to ${users[user][channel][mod.name]}`)
                } else if (vip.aliases.includes(args[3])) {
                    if (![`true`, `t`, `false`, `f`].includes(args[4])) { return talk(chatroom, `> User in ${channel}'s '${vip.name}' must be of value BOOLEAN (currently: ${users[user][channel][vip.name]})`) }
                    if ([`true`, `t`].includes(args[4])) { users[user][channel][vip.name] = true }
                    if ([`false`, `f`].includes(args[4])) { users[user][channel][vip.name] = false }
                    return talk(chatroom, `> User '${user}' vip in '${channel}' set to ${users[user][channel][vip.name]}`)
                } else if (msgcount.aliases.includes(args[3])) {
                    if (!args[4] || isNaN(Number(args[4]))) { return talk(chatroom, `> User in ${channel}'s '${msgcount.name}' must be of value NUMBER (currently: ${users[user][channel][msgcount.name]})`) }
                    users[user][channel][msgcount.name] = Number(args[4])
                    return talk(chatroom, `> User '${user}' msgCount in '${channel}' set to ${users[user][channel][msgcount.name]}`)
                } else if (lastmessage.aliases.includes(args[3])) {
                    users[user][channel][lastmessage.name] = args.slice(4).join(` `)
                    return talk(chatroom, `> User '${user}' lastMessage in '${channel}' set to '${users[user][channel][lastmessage.name]}'`)
                } else if (away.aliases.includes(args[3])) {
                    if (![`true`, `t`, `false`, `f`].includes(args[4])) { return talk(chatroom, `> User in ${channel}'s '${away.name}' must be of value BOOLEAN (currently: ${users[user][channel][away.name]})`) }
                    if ([`true`, `t`].includes(args[4])) { users[user][channel][away.name] = true }
                    if ([`false`, `f`].includes(args[4])) { users[user][channel][away.name] = false }
                    return talk(chatroom, `> User '${user}' away in '${channel}' set to ${users[user][channel][away.name]}`)
                } else if (awaymessage.aliases.includes(args[3])) {
                    users[user][channel].awayMessage = args.slice(4).join(` `)
                    return talk(chatroom, `> User '${user}' awayMessage in '${channel}' set to '${users[user][channel].awayMessage}'`)
                } else { return talk(chatroom, `> Possible '${channel}' controls for user '${user}': (s) sub, (m) mod, (v) vip, (mc) msgCount, (lm) lastMessage, (a) away, (am) awayMessage`) }
            } else { return talk(chatroom, `> Possible 'user' controls: (d) delete, (n) displayName, (l) lemons, (hw) hangmanWins, (rw) riddleWins, <channel ...>`) }
        } else { return talk(chatroom, `> User '${user}' is not known`) }
    } else if ([`lemonyfresh`, `lf`].includes(args[0])) {
        if (![`jpegstripes`, `j`, `sclarf`, `s`, `e1ectroma`, `e`, `domonintendo1`, `d`, `ppuyya`, `p`].includes(args[1])) { return talk(chatroom, `> You must specify a Lemony Fresh member`) }
        const channel = [`jpegstripes`, `j`].includes(args[1]) ? `jpegstripes` : [`sclarf`, `s`].includes(args[1]) ? `sclarf` : [`e1ectroma`, `e`].includes(args[1]) ? `e1ectroma` : [`domonintendo1`, `d`].includes(args[1]) ? `domonintendo1` : `ppuyya`
        if (funtimer.aliases.includes(args[2])) {
            lemonyFresh[channel][funtimer.name] = Number(args[3]) || 0
            return talk(chatroom, `> ${channel} '${funtimer.name}' set to ${lemonyFresh[channel][funtimer.name]}`)
        } else if (funtimerguesser.aliases.includes(args[2])) {
            lemonyFresh[channel][funtimerguesser.name] = args[3] || ``
            return talk(chatroom, `> ${channel} '${funtimerguesser.name}' set to ${lemonyFresh[channel][funtimerguesser.name]}`)
        } else if (pollid.aliases.includes(args[2])) {
            lemonyFresh[channel][pollid.name] = args[3] || ``
            return talk(chatroom, `> ${channel} 'pollId' set to ${lemonyFresh[channel][pollid.name]}`)
        } else { return talk(chatroom, `> Possible lemonyFresh controls for member '${channel}': (ft) funTimer (ftg) funTimerGuesser (p) pollId`) }
    } else if ([`mods`, `m`].includes(args[0])) {
        if (!args[1]) { return talk(chatroom, `> You must specify a moderator`) }
        const user = args[1].replace(/^@/, ``)
        if (user in mods) {
            if (id.aliases.includes(args[2])) {
                if (!args[3] || isNaN(Number(args[3]))) { return talk(chatroom, `> Mod ${user} 'id' must be of value NUMBER (currently: ${mods[user][id.name]})`) }
                mods[user][id.name] = Number(args[3])
                return talk(chatroom, `> Mod '${user}' id set to ${mods[user][id.name]}`)
            } else if (ismodin.aliases.includes(args[2])) {
                if (!args[3]) { return talk(chatroom, `> Mod '${user}' is moderating in: [${mods[user][ismodin.name].join(`, `)}] - Edit list with: (c) clear (p) push`) }
                if ([`clear`, `c`].includes(args[3])) {
                    mods[user][ismodin.name].length = 0
                    return talk(chatroom, `> Mod '${user}' channels list cleared!`)
                } else if ([`push`, `p`].includes(args[3]) && args[4]) {
                    const channel = args[4].startsWith(`#`) ? args[4] : `#${args[4]}`
                    mods[user][ismodin.name].push(channel)
                    return talk(chatroom, `> Mod '${user}' is moderating in: [${mods[user][ismodin.name].join(`, `)}]`)
                }
            } else if (accesstoken.aliases.includes(args[2])) {
                mods[user][accesstoken.name] = args[3] || ``
                return talk(chatroom, `> Mod ${user} '${accesstoken.name}' set to ${mods[user][accesstoken.name]}`)
            } else if (refreshtoken.aliases.includes(args[2])) {
                mods[user][refreshtoken.name] = args[3] || ``
                return talk(chatroom, `> Mod ${user} '${refreshtoken.name}' set to ${mods[user][refreshtoken.name]}`)
            } else { return talk(chatroom, `> Possible controls for mod '${user}': (i) id (m) isModIn (at) accessToken (rt) refreshToken`) }
        } else { return talk(chatroom, `> Mod '${user}' is not known`) }
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
        } else { return talk(chatroom, `> Possible mod controls for member '${channel}': (ft) funTimer (ftg) funTimerGuesser (p) pollId`) }
    } else { talk(chatroom, `> Possible configurations: (s) settings, (u) users, (lf) lemonyFresh`) }
}

module.exports = { cli }
