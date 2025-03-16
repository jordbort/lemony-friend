const BOT_USERNAME = process.env.BOT_USERNAME
const BOT_NICKNAME_REGEX = process.env.BOT_NICKNAME_REGEX
const BOT_ID = process.env.BOT_ID
const DEV = process.env.DEV
const OAUTH_TOKEN = process.env.OAUTH_TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const API_KEY = process.env.API_KEY

const { settings } = require(`../config`)
const { lemonyFresh, mods, users, knownTags, lemCmds, wordBank, commonNicknames, startingLemons, hangmanWins } = require(`../data`)

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

function createCSV(obj) {
    const listCSV = Object.keys(obj)
        .map(key => { return [key, obj[key]] })
        .filter(el => el[1])
        .sort()
        .join()
    return listCSV
}

function makeEnv(arr) {
    const newEnv = `BOT_USERNAME='${BOT_USERNAME}'
BOT_ID='${BOT_ID}'
DEV='${DEV}'
BOT_NICKNAME_REGEX='${BOT_NICKNAME_REGEX}'

OAUTH_TOKEN='${OAUTH_TOKEN}'

CLIENT_ID='${CLIENT_ID}'
CLIENT_SECRET='${CLIENT_SECRET}'

REDIRECT_URI='${REDIRECT_URI}'

API_KEY='${API_KEY}'

JOINED_CHANNELS='${JSON.stringify(arr)}'

SETTINGS='${JSON.stringify(settings)}'

LEMONY_FRESH='${JSON.stringify(lemonyFresh)}'

MOD_DATA='${JSON.stringify(mods)}'

USER_DATA='${JSON.stringify(users)}'

KNOWN_TAGS='${JSON.stringify(knownTags)}'

LEMON_COMMANDS='${JSON.stringify(lemCmds)}'

WORDBANK_NOUNS='${JSON.stringify(wordBank.nouns)}'

WORDBANK_VERBS='${JSON.stringify(wordBank.verbs)}'

WORDBANK_ADJECTIVES='${JSON.stringify(wordBank.adjectives)}'

COMMON_NICKNAMES='${createCSV(commonNicknames)}'

STARTING_LEMONS='${createCSV(startingLemons)}'

HANGMAN_WINS='${createCSV(hangmanWins)}'\n`

    return newEnv
}

module.exports = {
    makeEnv,
    makeLogs(arr) {
        let logs = `🍋️ LEMONY LOGS 🍋️\n`
        const border = `${Array(50).fill(`*`).join(` `)}\n`

        const newEnv = makeEnv(arr)

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
            [lemCmds, `lemCmds`]
        ]
        for (const [obj, objName] of objectsToLog) {
            logs += `${renderObj(obj, objName)}\n\n`
        }

        logs += border
        logs += newEnv
        logs += border

        return logs
    }
}
