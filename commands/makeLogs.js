const BOT_USERNAME = process.env.BOT_USERNAME
const BOT_ID = process.env.BOT_ID
const DEV = process.env.DEV
const OAUTH_TOKEN = process.env.OAUTH_TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const API_KEY = process.env.API_KEY

const { settings, wordBank } = require(`../config`)
const { lemonyFresh, mods, users, knownTags, tempCmds, commonNicknames, startingLemons, hangmanWins } = require(`../data`)

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

function createCSV(prevObj, currObj, property) {
    const listCSV = Object.keys(currObj)
        .map(key => { return [key, currObj[key][property]] })
        .filter(el => el[1])
        .concat(Object.keys(prevObj).map(key => { return [key, prevObj[key]] }))
        .sort()
        .join()
    return listCSV
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

    logs += `${Array(50).fill(`*`).join(` `)}`

    logs += `
BOT_USERNAME='${BOT_USERNAME}'
BOT_ID='${BOT_ID}'
DEV='${DEV}'

OAUTH_TOKEN='${OAUTH_TOKEN}'

CLIENT_ID='${CLIENT_ID}'
CLIENT_SECRET='${CLIENT_SECRET}'
BOT_ACCESS_TOKEN='${lemonyFresh.botAccessToken}'

REDIRECT_URI='${REDIRECT_URI}'

API_KEY='${API_KEY}'

JPEGSTRIPES_ACCESS_TOKEN='${lemonyFresh.jpegstripes.accessToken}'
JPEGSTRIPES_REFRESH_TOKEN='${lemonyFresh.jpegstripes.refreshToken}'

SCLARF_ACCESS_TOKEN='${lemonyFresh.sclarf.accessToken}'
SCLARF_REFRESH_TOKEN='${lemonyFresh.sclarf.refreshToken}'

E1ECTROMA_ACCESS_TOKEN='${lemonyFresh.e1ectroma.accessToken}'
E1ECTROMA_REFRESH_TOKEN='${lemonyFresh.e1ectroma.refreshToken}'

DOMONINTENDO1_ACCESS_TOKEN='${lemonyFresh.domonintendo1.accessToken}'
DOMONINTENDO1_REFRESH_TOKEN='${lemonyFresh.domonintendo1.refreshToken}'

PPUYYA_ACCESS_TOKEN='${lemonyFresh.ppuyya.accessToken}'
PPUYYA_REFRESH_TOKEN='${lemonyFresh.ppuyya.refreshToken}'

ASTRAL_AN0MALY_ACCESS_TOKEN='${lemonyFresh.astral_an0maly.accessToken}'
ASTRAL_AN0MALY_REFRESH_TOKEN='${lemonyFresh.astral_an0maly.refreshToken}'

DIRTYD0INKS_ACCESS_TOKEN='${lemonyFresh.dirtyd0inks.accessToken}'
DIRTYD0INKS_REFRESH_TOKEN='${lemonyFresh.dirtyd0inks.refreshToken}'

ARTYINPINK_ACCESS_TOKEN='${lemonyFresh.artyinpink.accessToken}'
ARTYINPINK_REFRESH_TOKEN='${lemonyFresh.artyinpink.refreshToken}'

THETARASTARK_ACCESS_TOKEN='${lemonyFresh.thetarastark.accessToken}'
THETARASTARK_REFRESH_TOKEN='${lemonyFresh.thetarastark.refreshToken}'

SLEBTV_ACCESS_TOKEN='${lemonyFresh.slebtv.accessToken}'
SLEBTV_REFRESH_TOKEN='${lemonyFresh.slebtv.refreshToken}'

CATJERKY_ACCESS_TOKEN='${mods.catjerky.accessToken}'
CATJERKY_REFRESH_TOKEN='${mods.catjerky.refreshToken}'

SKITTLE108_ACCESS_TOKEN='${mods.skittle108.accessToken}'
SKITTLE108_REFRESH_TOKEN='${mods.skittle108.refreshToken}'\n\n`

    logs += `COMMON_NICKNAMES='${createCSV(commonNicknames, users, `nickname`)}'\n\n`

    logs += `STARTING_LEMONS='${createCSV(startingLemons, users, `lemons`)}'\n\n`

    logs += `HANGMAN_WINS='${createCSV(hangmanWins, users, `hangmanWins`)}'\n\n`

    logs += `${Array(50).fill(`*`).join(` `)}\n`

    return logs
}

module.exports = { makeLogs }
