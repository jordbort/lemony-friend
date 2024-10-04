const BOT_ACCESS_TOKEN = process.env.BOT_ACCESS_TOKEN

const JPEGSTRIPES_ACCESS_TOKEN = process.env.JPEGSTRIPES_ACCESS_TOKEN
const JPEGSTRIPES_REFRESH_TOKEN = process.env.JPEGSTRIPES_REFRESH_TOKEN

const SCLARF_ACCESS_TOKEN = process.env.SCLARF_ACCESS_TOKEN
const SCLARF_REFRESH_TOKEN = process.env.SCLARF_REFRESH_TOKEN

const E1ECTROMA_ACCESS_TOKEN = process.env.E1ECTROMA_ACCESS_TOKEN
const E1ECTROMA_REFRESH_TOKEN = process.env.E1ECTROMA_REFRESH_TOKEN

const DOMONINTENDO1_ACCESS_TOKEN = process.env.DOMONINTENDO1_ACCESS_TOKEN
const DOMONINTENDO1_REFRESH_TOKEN = process.env.DOMONINTENDO1_REFRESH_TOKEN

const PPUYYA_ACCESS_TOKEN = process.env.PPUYYA_ACCESS_TOKEN
const PPUYYA_REFRESH_TOKEN = process.env.PPUYYA_REFRESH_TOKEN

const ASTRAL_AN0MALY_ACCESS_TOKEN = process.env.ASTRAL_AN0MALY_ACCESS_TOKEN
const ASTRAL_AN0MALY_REFRESH_TOKEN = process.env.ASTRAL_AN0MALY_REFRESH_TOKEN

const DIRTYD0INKS_ACCESS_TOKEN = process.env.DIRTYD0INKS_ACCESS_TOKEN
const DIRTYD0INKS_REFRESH_TOKEN = process.env.DIRTYD0INKS_REFRESH_TOKEN

const ARTYINPINK_ACCESS_TOKEN = process.env.ARTYINPINK_ACCESS_TOKEN
const ARTYINPINK_REFRESH_TOKEN = process.env.ARTYINPINK_REFRESH_TOKEN

const THETARASTARK_ACCESS_TOKEN = process.env.THETARASTARK_ACCESS_TOKEN
const THETARASTARK_REFRESH_TOKEN = process.env.THETARASTARK_REFRESH_TOKEN

const CATJERKY_ACCESS_TOKEN = process.env.CATJERKY_ACCESS_TOKEN
const CATJERKY_REFRESH_TOKEN = process.env.CATJERKY_REFRESH_TOKEN

const SKITTLE108_ACCESS_TOKEN = process.env.SKITTLE108_ACCESS_TOKEN
const SKITTLE108_REFRESH_TOKEN = process.env.SKITTLE108_REFRESH_TOKEN

const { settings, wordBank } = require(`../config`)
const { lemonyFresh, mods, users, knownTags, tempCmds, startingLemons, commonNicknames } = require(`../data`)

function renderObj(obj, objName, indentation = ``) {
    const tab = `${indentation}\t`
    if (!Object.keys(obj).length) { return `${objName}: {}` }

    const data = [`${objName}: {`]
    if (Object.keys(obj).length) {
        const keys = `\n${Object.keys(obj).map((key) => {
            return typeof obj[key] === `string`
                ? `${tab}${key}: '${obj[key]}'`
                : typeof obj[key] === `object` && obj[key] !== null
                    ? Array.isArray(obj[key])
                        ? `${tab}${key}: [${obj[key].length
                            ? obj[key].map((val) => { return typeof val === `string` ? `'${val}'` : val }).join(`, `)
                            : ``
                        }]`
                        : `${tab}${renderObj(obj[key], key, tab)}`
                    : `${tab}${key}: ${obj[key]}`
        }).join(`,\n`)}`
        data.push(keys)
    }
    data.push(`\n${indentation}}`)

    return data.join(``)
}

function tokenChangeWarning() {
    const starBorder = `${Array(50).fill(`*`).join(` `)}\n`
    let msgBlock = starBorder
    if (lemonyFresh.botAccessToken !== BOT_ACCESS_TOKEN) { msgBlock += `BOT_ACCESS_TOKEN changed, update to: '${lemonyFresh.botAccessToken}'\n` }
    if (lemonyFresh.jpegstripes.accessToken !== JPEGSTRIPES_ACCESS_TOKEN) { msgBlock += `JPEGSTRIPES_ACCESS_TOKEN changed, update to: '${lemonyFresh.jpegstripes.accessToken}'\n` }
    if (lemonyFresh.jpegstripes.refreshToken !== JPEGSTRIPES_REFRESH_TOKEN) { msgBlock += `JPEGSTRIPES_REFRESH_TOKEN changed, update to: '${lemonyFresh.jpegstripes.refreshToken}'\n` }
    if (lemonyFresh.sclarf.accessToken !== SCLARF_ACCESS_TOKEN) { msgBlock += `SCLARF_ACCESS_TOKEN changed, update to: '${lemonyFresh.sclarf.accessToken}'\n` }
    if (lemonyFresh.sclarf.refreshToken !== SCLARF_REFRESH_TOKEN) { msgBlock += `SCLARF_REFRESH_TOKEN changed, update to: '${lemonyFresh.sclarf.refreshToken}'\n` }
    if (lemonyFresh.e1ectroma.accessToken !== E1ECTROMA_ACCESS_TOKEN) { msgBlock += `E1ECTROMA_ACCESS_TOKEN changed, update to: '${lemonyFresh.e1ectroma.accessToken}'\n` }
    if (lemonyFresh.e1ectroma.refreshToken !== E1ECTROMA_REFRESH_TOKEN) { msgBlock += `E1ECTROMA_REFRESH_TOKEN changed, update to: '${lemonyFresh.e1ectroma.refreshToken}'\n` }
    if (lemonyFresh.domonintendo1.accessToken !== DOMONINTENDO1_ACCESS_TOKEN) { msgBlock += `DOMONINTENDO1_ACCESS_TOKEN changed, update to: '${lemonyFresh.domonintendo1.accessToken}'\n` }
    if (lemonyFresh.domonintendo1.refreshToken !== DOMONINTENDO1_REFRESH_TOKEN) { msgBlock += `DOMONINTENDO1_REFRESH_TOKEN changed, update to: '${lemonyFresh.domonintendo1.refreshToken}'\n` }
    if (lemonyFresh.ppuyya.accessToken !== PPUYYA_ACCESS_TOKEN) { msgBlock += `PPUYYA_ACCESS_TOKEN changed, update to: '${lemonyFresh.ppuyya.accessToken}'\n` }
    if (lemonyFresh.ppuyya.refreshToken !== PPUYYA_REFRESH_TOKEN) { msgBlock += `PPUYYA_REFRESH_TOKEN changed, update to: '${lemonyFresh.ppuyya.refreshToken}'\n` }
    if (lemonyFresh.astral_an0maly.accessToken !== ASTRAL_AN0MALY_ACCESS_TOKEN) { msgBlock += `ASTRAL_AN0MALY_ACCESS_TOKEN changed, update to: '${lemonyFresh.astral_an0maly.accessToken}'\n` }
    if (lemonyFresh.astral_an0maly.refreshToken !== ASTRAL_AN0MALY_REFRESH_TOKEN) { msgBlock += `ASTRAL_AN0MALY_REFRESH_TOKEN changed, update to: '${lemonyFresh.astral_an0maly.refreshToken}'\n` }
    if (lemonyFresh.dirtyd0inks.accessToken !== DIRTYD0INKS_ACCESS_TOKEN) { msgBlock += `DIRTYD0INKS_ACCESS_TOKEN changed, update to: '${lemonyFresh.dirtyd0inks.accessToken}'\n` }
    if (lemonyFresh.dirtyd0inks.refreshToken !== DIRTYD0INKS_REFRESH_TOKEN) { msgBlock += `DIRTYD0INKS_REFRESH_TOKEN changed, update to: '${lemonyFresh.dirtyd0inks.refreshToken}'\n` }
    if (lemonyFresh.artyinpink.accessToken !== ARTYINPINK_ACCESS_TOKEN) { msgBlock += `ARTYINPINK_ACCESS_TOKEN changed, update to: '${lemonyFresh.artyinpink.accessToken}'\n` }
    if (lemonyFresh.artyinpink.refreshToken !== ARTYINPINK_REFRESH_TOKEN) { msgBlock += `ARTYINPINK_REFRESH_TOKEN changed, update to: '${lemonyFresh.artyinpink.refreshToken}'\n` }
    if (lemonyFresh.thetarastark.accessToken !== THETARASTARK_ACCESS_TOKEN) { msgBlock += `THETARASTARK_ACCESS_TOKEN changed, update to: '${lemonyFresh.thetarastark.accessToken}'\n` }
    if (lemonyFresh.thetarastark.refreshToken !== THETARASTARK_REFRESH_TOKEN) { msgBlock += `THETARASTARK_REFRESH_TOKEN changed, update to: '${lemonyFresh.thetarastark.refreshToken}'\n` }
    if (mods.catjerky.accessToken !== CATJERKY_ACCESS_TOKEN) { msgBlock += `CATJERKY_ACCESS_TOKEN changed, update to: '${mods.catjerky.accessToken}'\n` }
    if (mods.catjerky.refreshToken !== CATJERKY_REFRESH_TOKEN) { msgBlock += `CATJERKY_REFRESH_TOKEN changed, update to: '${mods.catjerky.refreshToken}'\n` }
    if (mods.skittle108.accessToken !== SKITTLE108_ACCESS_TOKEN) { msgBlock += `SKITTLE108_ACCESS_TOKEN changed, update to: '${mods.skittle108.accessToken}'\n` }
    if (mods.skittle108.refreshToken !== SKITTLE108_REFRESH_TOKEN) { msgBlock += `SKITTLE108_REFRESH_TOKEN changed, update to: '${mods.skittle108.refreshToken}'\n` }
    msgBlock += starBorder
    return msgBlock
}

function makeLogs(arr) {
    let logs = `🍋️ LEMONY LOGS 🍋️\n`

    const dateOptions = {
        weekday: `long`,
        month: `long`,
        day: `numeric`,
        year: `numeric`,
        timeZone: settings.timeZone
    }
    const timeOptions = {
        hour: `numeric`,
        minute: `numeric`,
        second: `numeric`,
        timeZone: settings.timeZone,
        timeZoneName: `short`
    }

    logs += `Session started: ${settings.startDate.toLocaleDateString(`en-US`, dateOptions)} at ${settings.startDate.toLocaleTimeString(`en-US`, timeOptions)}\n`

    logs += `\nJoined channels: ['${arr.join(`', '`)}']\n\n`

    const objectsToLog = [
        [lemonyFresh, `lemonyFresh`],
        [mods, `mods`],
        [users, `users`],
        [knownTags, 'knownTags'],
        [settings, `settings`],
        [wordBank, `wordBank`],
        [tempCmds, `tempCmds`]
    ]
    for (const [obj, objName] of objectsToLog) {
        logs += `${renderObj(obj, objName)}\n\n`
    }

    const listUserNicknames = Object.keys(users)
        .map(user => { return [user, users[user].nickname] })
        .filter(el => el[1])
        .concat(Object.keys(commonNicknames).map(key => { return [key, commonNicknames[key]] }))
        .sort()
        .join()
    logs += `COMMON_NICKNAMES='${listUserNicknames}'\n\n`

    const listUserLemons = Object.keys(users)
        .map(user => { return [user, users[user].lemons] })
        .filter(el => el[1])
        .concat(Object.keys(startingLemons).map(key => { return [key, startingLemons[key]] }))
        .sort()
        .join()
    logs += `STARTING_LEMONS='${listUserLemons}'\n\n`

    // If any tokens have changed, print a footer
    const anyTokenChange = lemonyFresh.botAccessToken !== BOT_ACCESS_TOKEN
        || lemonyFresh.jpegstripes.accessToken !== JPEGSTRIPES_ACCESS_TOKEN
        || lemonyFresh.jpegstripes.refreshToken !== JPEGSTRIPES_REFRESH_TOKEN

        || lemonyFresh.sclarf.accessToken !== SCLARF_ACCESS_TOKEN
        || lemonyFresh.sclarf.refreshToken !== SCLARF_REFRESH_TOKEN

        || lemonyFresh.e1ectroma.accessToken !== E1ECTROMA_ACCESS_TOKEN
        || lemonyFresh.e1ectroma.refreshToken !== E1ECTROMA_REFRESH_TOKEN

        || lemonyFresh.domonintendo1.accessToken !== DOMONINTENDO1_ACCESS_TOKEN
        || lemonyFresh.domonintendo1.refreshToken !== DOMONINTENDO1_REFRESH_TOKEN

        || lemonyFresh.dirtyd0inks.accessToken !== DIRTYD0INKS_ACCESS_TOKEN
        || lemonyFresh.dirtyd0inks.refreshToken !== DIRTYD0INKS_REFRESH_TOKEN

        || mods.catjerky.accessToken !== CATJERKY_ACCESS_TOKEN
        || mods.catjerky.refreshToken !== CATJERKY_REFRESH_TOKEN

    if (anyTokenChange) { logs += tokenChangeWarning() }

    return logs
}

module.exports = { makeLogs }
