const DEV = process.env.DEV
const BOT_ID = Number(process.env.BOT_ID)
const BOT_USERNAME = process.env.BOT_USERNAME

const fs = require(`fs/promises`)

const { settings, resetTxt, grayTxt, whiteTxt, yellowBg, chatColors } = require(`./config`)
const { lemonyFresh, mods, users, knownTags, lemCmds, wordBank, commonNicknames, startingLemons, hangmanWins } = require(`./data`)

const twitchUsernamePattern = /^[a-z0-9_]{4,25}$/i
const emotePattern = /\b([a-z][a-z0-9]{2,9}[A-Z0-9][a-zA-Z0-9]{0,19})\b/

const formatMegabytes = (num) => Math.round(num / 1024 / 1024 * 100) / 100

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
        [knownTags, `knownTags`],
        [settings, `settings`],
        [wordBank, `wordBank`],
        [lemCmds, `lemCmds`],
        [commonNicknames, `commonNicknames`],
        [startingLemons, `startingLemons`],
        [hangmanWins, `hangmanWins`]
    ]
    for (const [obj, objName] of objectsToLog) {
        logs += `${renderObj(obj, objName)}\n\n`
    }

    return logs
}

async function printMemory(arr) {
    await fs.writeFile(`./memory.json`, JSON.stringify({
        joinedChannels: arr,
        settings,
        lemonyFresh,
        mods,
        users,
        knownTags,
        lemCmds,
        wordBank,
        commonNicknames,
        startingLemons,
        hangmanWins
    }, null, 4))
}

function getContextEmote(type, channel) {
    const baseType = `${type}Emotes`
    const bttvType = `bttv${type.substring(0, 1).toUpperCase()}${type.substring(1)}Emotes`
    const emotes = [...settings.baseEmotes[baseType]]

    if (channel === `jpegstripes` && !users[BOT_USERNAME]?.jpegstripes?.sub) {
        if (type === `hype`) { emotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
        if (type === `positive`) { emotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
        if (type === `greeting`) { emotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
        if (type === `bye`) { emotes.push(`WhitneyVibe`) }
    }

    for (const member in lemonyFresh) {
        if (users[BOT_USERNAME]?.[member]?.sub) { emotes.push(...lemonyFresh[member].contextEmotes[baseType]) }
        if (member === channel) { emotes.push(...lemonyFresh[member].contextEmotes[bttvType]) }
    }
    if (type === `lemon` && emotes.length > 1) { emotes.shift() }
    // logMessage([`> getContextEmote(type: '${type}', channel: '${channel}', emotes: '${emotes.join(`', '`)}')`])

    const emote = emotes[Math.floor(Math.random() * emotes.length)] || ``
    return emote
}

function pluralize(num, singularForm, pluralForm) {
    return Number(num) === 1
        ? `${Number(num)} ${singularForm}`
        : `${Number(num)} ${pluralForm}`
}

function renderObj(obj, objName, indentation = ``) {
    if (!Object.keys(obj).length) return `${objName}: {}`
    const tab = `${indentation}\t`
    const data = [`${objName}: {`]
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
    data.push(`\n${indentation}}`)
    return data.join(``)
}

async function logMessage(messages, time, channel, username, color, self) {
    const log = messages.join(` `)
    if (username) {
        await fs.appendFile(`lemony_logs.txt`, `[${time}] <${channel}> ${username}: ${log}\n`, (err) => {
            if (err) { console.log(`Error writing logs:`, err) }
        })
        if (!settings.hideNonDevChannel || channel === DEV) {
            self && settings.highlightBotMessage
                ? console.log(`${yellowBg}${settings.logTime
                    ? `[${time}] `
                    : ``}${settings.hideNonDevChannel
                        ? ``
                        : `<${channel}> `}${username}: ${log}${resetTxt}`)
                : console.log(`${settings.logTime
                    ? `[${time}] `
                    : ``}${settings.hideNonDevChannel
                        ? ``
                        : `<${channel}> `}${color in chatColors ? chatColors[color].terminalColor : whiteTxt}${username}: ${log}${resetTxt}`)
        }
    }
    else {
        await fs.appendFile(`lemony_logs.txt`, `${log}\n`, (err) => {
            if (err) { console.log(`Error writing logs:`, err) }
        })
        if (settings.debug) { console.log(`${grayTxt}${log}${resetTxt}`) }
    }
}

const numbers = [
    `zero`,
    `one`,
    `two`,
    `three`,
    `four`,
    `five`,
    `six`,
    `seven`,
    `eight`,
    `nine`,
    `ten`,
    `eleven`,
    `twelve`,
    `thirteen`,
    `fourteen`,
    `fifteen`,
    `sixteen`,
    `seventeen`,
    `eighteen`,
    `nineteen`,
    `twenty`,
    `twenty-one`,
    `twenty-two`,
    `twenty-three`,
    `twenty-four`,
    `twenty-five`,
    `twenty-six`,
    `twenty-seven`,
    `twenty-eight`,
    `twenty-nine`,
    `thirty`,
    `thirty-one`,
    `thirty-two`,
    `thirty-three`,
    `thirty-four`,
    `thirty-five`,
    `thirty-six`,
    `thirty-seven`,
    `thirty-eight`,
    `thirty-nine`,
    `forty`,
    `forty-one`,
    `forty-two`,
    `forty-three`,
    `forty-four`,
    `forty-five`,
    `forty-six`,
    `forty-seven`,
    `forty-eight`,
    `forty-nine`,
    `fifty`,
    `fifty-one`,
    `fifty-two`,
    `fifty-three`,
    `fifty-four`,
    `fifty-five`,
    `fifty-six`,
    `fifty-seven`,
    `fifty-eight`,
    `fifty-nine`,
    `sixty`,
    `sixty-one`,
    `sixty-two`,
    `sixty-three`,
    `sixty-four`,
    `sixty-five`,
    `sixty-six`,
    `sixty-seven`,
    `sixty-eight`,
    `sixty-nine`,
    `seventy`,
    `seventy-one`,
    `seventy-two`,
    `seventy-three`,
    `seventy-four`,
    `seventy-five`,
    `seventy-six`,
    `seventy-seven`,
    `seventy-eight`,
    `seventy-nine`,
    `eighty`,
    `eighty-one`,
    `eighty-two`,
    `eighty-three`,
    `eighty-four`,
    `eighty-five`,
    `eighty-six`,
    `eighty-seven`,
    `eighty-eight`,
    `eighty-nine`,
    `ninety`,
    `ninety-one`,
    `ninety-two`,
    `ninety-three`,
    `ninety-four`,
    `ninety-five`,
    `ninety-six`,
    `ninety-seven`,
    `ninety-eight`,
    `ninety-nine`,
    `one hundred`,
    `one hundred one`,
    `one hundred two`,
    `one hundred three`,
    `one hundred four`,
    `one hundred five`,
    `one hundred six`,
    `one hundred seven`,
    `one hundred eight`,
    `one hundred nine`,
    `one hundred ten`,
    `one hundred eleven`,
    `one hundred twelve`,
    `one hundred thirteen`,
    `one hundred fourteen`,
    `one hundred fifteen`,
    `one hundred sixteen`,
    `one hundred seventeen`,
    `one hundred eighteen`,
    `one hundred nineteen`,
    `one hundred twenty`,
    `one hundred twenty-one`,
    `one hundred twenty-two`,
    `one hundred twenty-three`,
    `one hundred twenty-four`,
    `one hundred twenty-five`,
    `one hundred twenty-six`,
    `one hundred twenty-seven`,
    `one hundred twenty-eight`,
    `one hundred twenty-nine`,
    `one hundred thirty`,
    `one hundred thirty-one`,
    `one hundred thirty-two`,
    `one hundred thirty-three`,
    `one hundred thirty-four`,
    `one hundred thirty-five`,
    `one hundred thirty-six`,
    `one hundred thirty-seven`,
    `one hundred thirty-eight`,
    `one hundred thirty-nine`,
    `one hundred forty`,
    `one hundred forty-one`,
    `one hundred forty-two`,
    `one hundred forty-three`,
    `one hundred forty-four`,
    `one hundred forty-five`,
    `one hundred forty-six`,
    `one hundred forty-seven`,
    `one hundred forty-eight`,
    `one hundred forty-nine`,
    `one hundred fifty`,
    `one hundred fifty-one`,
    `one hundred fifty-two`,
    `one hundred fifty-three`,
    `one hundred fifty-four`,
    `one hundred fifty-five`,
    `one hundred fifty-six`,
    `one hundred fifty-seven`,
    `one hundred fifty-eight`,
    `one hundred fifty-nine`,
    `one hundred sixty`,
    `one hundred sixty-one`,
    `one hundred sixty-two`,
    `one hundred sixty-three`,
    `one hundred sixty-four`,
    `one hundred sixty-five`,
    `one hundred sixty-six`,
    `one hundred sixty-seven`,
    `one hundred sixty-eight`,
    `one hundred sixty-nine`,
    `one hundred seventy`,
    `one hundred seventy-one`,
    `one hundred seventy-two`,
    `one hundred seventy-three`,
    `one hundred seventy-four`,
    `one hundred seventy-five`,
    `one hundred seventy-six`,
    `one hundred seventy-seven`,
    `one hundred seventy-eight`,
    `one hundred seventy-nine`,
    `one hundred eighty`,
    `one hundred eighty-one`,
    `one hundred eighty-two`,
    `one hundred eighty-three`,
    `one hundred eighty-four`,
    `one hundred eighty-five`,
    `one hundred eighty-six`,
    `one hundred eighty-seven`,
    `one hundred eighty-eight`,
    `one hundred eighty-nine`,
    `one hundred ninety`,
    `one hundred ninety-one`,
    `one hundred ninety-two`,
    `one hundred ninety-three`,
    `one hundred ninety-four`,
    `one hundred ninety-five`,
    `one hundred ninety-six`,
    `one hundred ninety-seven`,
    `one hundred ninety-eight`,
    `one hundred ninety-nine`,
    `two hundred`,
    `two hundred one`,
    `two hundred two`,
    `two hundred three`,
    `two hundred four`,
    `two hundred five`,
    `two hundred six`,
    `two hundred seven`,
    `two hundred eight`,
    `two hundred nine`,
    `two hundred ten`,
    `two hundred eleven`,
    `two hundred twelve`,
    `two hundred thirteen`,
    `two hundred fourteen`,
    `two hundred fifteen`,
    `two hundred sixteen`,
    `two hundred seventeen`,
    `two hundred eighteen`,
    `two hundred nineteen`,
    `two hundred twenty`,
    `two hundred twenty-one`,
    `two hundred twenty-two`,
    `two hundred twenty-three`,
    `two hundred twenty-four`,
    `two hundred twenty-five`,
    `two hundred twenty-six`,
    `two hundred twenty-seven`,
    `two hundred twenty-eight`,
    `two hundred twenty-nine`,
    `two hundred thirty`,
    `two hundred thirty-one`,
    `two hundred thirty-two`,
    `two hundred thirty-three`,
    `two hundred thirty-four`,
    `two hundred thirty-five`,
    `two hundred thirty-six`,
    `two hundred thirty-seven`,
    `two hundred thirty-eight`,
    `two hundred thirty-nine`,
    `two hundred forty`,
    `two hundred forty-one`,
    `two hundred forty-two`,
    `two hundred forty-three`,
    `two hundred forty-four`,
    `two hundred forty-five`,
    `two hundred forty-six`,
    `two hundred forty-seven`,
    `two hundred forty-eight`,
    `two hundred forty-nine`,
    `two hundred fifty`,
    `two hundred fifty-one`,
    `two hundred fifty-two`,
    `two hundred fifty-three`,
    `two hundred fifty-four`,
    `two hundred fifty-five`,
    `two hundred fifty-six`,
    `two hundred fifty-seven`,
    `two hundred fifty-eight`,
    `two hundred fifty-nine`,
    `two hundred sixty`,
    `two hundred sixty-one`,
    `two hundred sixty-two`,
    `two hundred sixty-three`,
    `two hundred sixty-four`,
    `two hundred sixty-five`,
    `two hundred sixty-six`,
    `two hundred sixty-seven`,
    `two hundred sixty-eight`,
    `two hundred sixty-nine`,
    `two hundred seventy`,
    `two hundred seventy-one`,
    `two hundred seventy-two`,
    `two hundred seventy-three`,
    `two hundred seventy-four`,
    `two hundred seventy-five`,
    `two hundred seventy-six`,
    `two hundred seventy-seven`,
    `two hundred seventy-eight`,
    `two hundred seventy-nine`,
    `two hundred eighty`,
    `two hundred eighty-one`,
    `two hundred eighty-two`,
    `two hundred eighty-three`,
    `two hundred eighty-four`,
    `two hundred eighty-five`,
    `two hundred eighty-six`,
    `two hundred eighty-seven`,
    `two hundred eighty-eight`,
    `two hundred eighty-nine`,
    `two hundred ninety`,
    `two hundred ninety-one`,
    `two hundred ninety-two`,
    `two hundred ninety-three`,
    `two hundred ninety-four`,
    `two hundred ninety-five`,
    `two hundred ninety-six`,
    `two hundred ninety-seven`,
    `two hundred ninety-eight`,
    `two hundred ninety-nine`,
    `three hundred`,
    `three hundred one`,
    `three hundred two`,
    `three hundred three`,
    `three hundred four`,
    `three hundred five`,
    `three hundred six`,
    `three hundred seven`,
    `three hundred eight`,
    `three hundred nine`,
    `three hundred ten`,
    `three hundred eleven`,
    `three hundred twelve`,
    `three hundred thirteen`,
    `three hundred fourteen`,
    `three hundred fifteen`,
    `three hundred sixteen`,
    `three hundred seventeen`,
    `three hundred eighteen`,
    `three hundred nineteen`,
    `three hundred twenty`,
    `three hundred twenty-one`,
    `three hundred twenty-two`,
    `three hundred twenty-three`,
    `three hundred twenty-four`,
    `three hundred twenty-five`,
    `three hundred twenty-six`,
    `three hundred twenty-seven`,
    `three hundred twenty-eight`,
    `three hundred twenty-nine`,
    `three hundred thirty`,
    `three hundred thirty-one`,
    `three hundred thirty-two`,
    `three hundred thirty-three`,
    `three hundred thirty-four`,
    `three hundred thirty-five`,
    `three hundred thirty-six`,
    `three hundred thirty-seven`,
    `three hundred thirty-eight`,
    `three hundred thirty-nine`,
    `three hundred forty`,
    `three hundred forty-one`,
    `three hundred forty-two`,
    `three hundred forty-three`,
    `three hundred forty-four`,
    `three hundred forty-five`,
    `three hundred forty-six`,
    `three hundred forty-seven`,
    `three hundred forty-eight`,
    `three hundred forty-nine`,
    `three hundred fifty`,
    `three hundred fifty-one`,
    `three hundred fifty-two`,
    `three hundred fifty-three`,
    `three hundred fifty-four`,
    `three hundred fifty-five`,
    `three hundred fifty-six`,
    `three hundred fifty-seven`,
    `three hundred fifty-eight`,
    `three hundred fifty-nine`,
    `three hundred sixty`,
    `three hundred sixty-one`,
    `three hundred sixty-two`,
    `three hundred sixty-three`,
    `three hundred sixty-four`,
    `three hundred sixty-five`,
    `three hundred sixty-six`,
    `three hundred sixty-seven`,
    `three hundred sixty-eight`,
    `three hundred sixty-nine`,
    `three hundred seventy`,
    `three hundred seventy-one`,
    `three hundred seventy-two`,
    `three hundred seventy-three`,
    `three hundred seventy-four`,
    `three hundred seventy-five`,
    `three hundred seventy-six`,
    `three hundred seventy-seven`,
    `three hundred seventy-eight`,
    `three hundred seventy-nine`,
    `three hundred eighty`,
    `three hundred eighty-one`,
    `three hundred eighty-two`,
    `three hundred eighty-three`,
    `three hundred eighty-four`,
    `three hundred eighty-five`,
    `three hundred eighty-six`,
    `three hundred eighty-seven`,
    `three hundred eighty-eight`,
    `three hundred eighty-nine`,
    `three hundred ninety`,
    `three hundred ninety-one`,
    `three hundred ninety-two`,
    `three hundred ninety-three`,
    `three hundred ninety-four`,
    `three hundred ninety-five`,
    `three hundred ninety-six`,
    `three hundred ninety-seven`,
    `three hundred ninety-eight`,
    `three hundred ninety-nine`,
    `four hundred`,
    `four hundred one`,
    `four hundred two`,
    `four hundred three`,
    `four hundred four`,
    `four hundred five`,
    `four hundred six`,
    `four hundred seven`,
    `four hundred eight`,
    `four hundred nine`,
    `four hundred ten`,
    `four hundred eleven`,
    `four hundred twelve`,
    `four hundred thirteen`,
    `four hundred fourteen`,
    `four hundred fifteen`,
    `four hundred sixteen`,
    `four hundred seventeen`,
    `four hundred eighteen`,
    `four hundred nineteen`,
    `four hundred twenty`,
    `four hundred twenty-one`,
    `four hundred twenty-two`,
    `four hundred twenty-three`,
    `four hundred twenty-four`,
    `four hundred twenty-five`,
    `four hundred twenty-six`,
    `four hundred twenty-seven`,
    `four hundred twenty-eight`,
    `four hundred twenty-nine`,
    `four hundred thirty`,
    `four hundred thirty-one`,
    `four hundred thirty-two`,
    `four hundred thirty-three`,
    `four hundred thirty-four`,
    `four hundred thirty-five`,
    `four hundred thirty-six`,
    `four hundred thirty-seven`,
    `four hundred thirty-eight`,
    `four hundred thirty-nine`,
    `four hundred forty`,
    `four hundred forty-one`,
    `four hundred forty-two`,
    `four hundred forty-three`,
    `four hundred forty-four`,
    `four hundred forty-five`,
    `four hundred forty-six`,
    `four hundred forty-seven`,
    `four hundred forty-eight`,
    `four hundred forty-nine`,
    `four hundred fifty`,
    `four hundred fifty-one`,
    `four hundred fifty-two`,
    `four hundred fifty-three`,
    `four hundred fifty-four`,
    `four hundred fifty-five`,
    `four hundred fifty-six`,
    `four hundred fifty-seven`,
    `four hundred fifty-eight`,
    `four hundred fifty-nine`,
    `four hundred sixty`,
    `four hundred sixty-one`,
    `four hundred sixty-two`,
    `four hundred sixty-three`,
    `four hundred sixty-four`,
    `four hundred sixty-five`,
    `four hundred sixty-six`,
    `four hundred sixty-seven`,
    `four hundred sixty-eight`,
    `four hundred sixty-nine`,
    `four hundred seventy`,
    `four hundred seventy-one`,
    `four hundred seventy-two`,
    `four hundred seventy-three`,
    `four hundred seventy-four`,
    `four hundred seventy-five`,
    `four hundred seventy-six`,
    `four hundred seventy-seven`,
    `four hundred seventy-eight`,
    `four hundred seventy-nine`,
    `four hundred eighty`,
    `four hundred eighty-one`,
    `four hundred eighty-two`,
    `four hundred eighty-three`,
    `four hundred eighty-four`,
    `four hundred eighty-five`,
    `four hundred eighty-six`,
    `four hundred eighty-seven`,
    `four hundred eighty-eight`,
    `four hundred eighty-nine`,
    `four hundred ninety`,
    `four hundred ninety-one`,
    `four hundred ninety-two`,
    `four hundred ninety-three`,
    `four hundred ninety-four`,
    `four hundred ninety-five`,
    `four hundred ninety-six`,
    `four hundred ninety-seven`,
    `four hundred ninety-eight`,
    `four hundred ninety-nine`,
    `five hundred`,
    `five hundred one`,
    `five hundred two`,
    `five hundred three`,
    `five hundred four`,
    `five hundred five`,
    `five hundred six`,
    `five hundred seven`,
    `five hundred eight`,
    `five hundred nine`,
    `five hundred ten`,
    `five hundred eleven`,
    `five hundred twelve`,
    `five hundred thirteen`,
    `five hundred fourteen`,
    `five hundred fifteen`,
    `five hundred sixteen`,
    `five hundred seventeen`,
    `five hundred eighteen`,
    `five hundred nineteen`,
    `five hundred twenty`,
    `five hundred twenty-one`,
    `five hundred twenty-two`,
    `five hundred twenty-three`,
    `five hundred twenty-four`,
    `five hundred twenty-five`,
    `five hundred twenty-six`,
    `five hundred twenty-seven`,
    `five hundred twenty-eight`,
    `five hundred twenty-nine`,
    `five hundred thirty`,
    `five hundred thirty-one`,
    `five hundred thirty-two`,
    `five hundred thirty-three`,
    `five hundred thirty-four`,
    `five hundred thirty-five`,
    `five hundred thirty-six`,
    `five hundred thirty-seven`,
    `five hundred thirty-eight`,
    `five hundred thirty-nine`,
    `five hundred forty`,
    `five hundred forty-one`,
    `five hundred forty-two`,
    `five hundred forty-three`,
    `five hundred forty-four`,
    `five hundred forty-five`,
    `five hundred forty-six`,
    `five hundred forty-seven`,
    `five hundred forty-eight`,
    `five hundred forty-nine`,
    `five hundred fifty`,
    `five hundred fifty-one`,
    `five hundred fifty-two`,
    `five hundred fifty-three`,
    `five hundred fifty-four`,
    `five hundred fifty-five`,
    `five hundred fifty-six`,
    `five hundred fifty-seven`,
    `five hundred fifty-eight`,
    `five hundred fifty-nine`,
    `five hundred sixty`,
    `five hundred sixty-one`,
    `five hundred sixty-two`,
    `five hundred sixty-three`,
    `five hundred sixty-four`,
    `five hundred sixty-five`,
    `five hundred sixty-six`,
    `five hundred sixty-seven`,
    `five hundred sixty-eight`,
    `five hundred sixty-nine`,
    `five hundred seventy`,
    `five hundred seventy-one`,
    `five hundred seventy-two`,
    `five hundred seventy-three`,
    `five hundred seventy-four`,
    `five hundred seventy-five`,
    `five hundred seventy-six`,
    `five hundred seventy-seven`,
    `five hundred seventy-eight`,
    `five hundred seventy-nine`,
    `five hundred eighty`,
    `five hundred eighty-one`,
    `five hundred eighty-two`,
    `five hundred eighty-three`,
    `five hundred eighty-four`,
    `five hundred eighty-five`,
    `five hundred eighty-six`,
    `five hundred eighty-seven`,
    `five hundred eighty-eight`,
    `five hundred eighty-nine`,
    `five hundred ninety`,
    `five hundred ninety-one`,
    `five hundred ninety-two`,
    `five hundred ninety-three`,
    `five hundred ninety-four`,
    `five hundred ninety-five`,
    `five hundred ninety-six`,
    `five hundred ninety-seven`,
    `five hundred ninety-eight`,
    `five hundred ninety-nine`,
    `six hundred`,
    `six hundred one`,
    `six hundred two`,
    `six hundred three`,
    `six hundred four`,
    `six hundred five`,
    `six hundred six`,
    `six hundred seven`,
    `six hundred eight`,
    `six hundred nine`,
    `six hundred ten`,
    `six hundred eleven`,
    `six hundred twelve`,
    `six hundred thirteen`,
    `six hundred fourteen`,
    `six hundred fifteen`,
    `six hundred sixteen`,
    `six hundred seventeen`,
    `six hundred eighteen`,
    `six hundred nineteen`,
    `six hundred twenty`,
    `six hundred twenty-one`,
    `six hundred twenty-two`,
    `six hundred twenty-three`,
    `six hundred twenty-four`,
    `six hundred twenty-five`,
    `six hundred twenty-six`,
    `six hundred twenty-seven`,
    `six hundred twenty-eight`,
    `six hundred twenty-nine`,
    `six hundred thirty`,
    `six hundred thirty-one`,
    `six hundred thirty-two`,
    `six hundred thirty-three`,
    `six hundred thirty-four`,
    `six hundred thirty-five`,
    `six hundred thirty-six`,
    `six hundred thirty-seven`,
    `six hundred thirty-eight`,
    `six hundred thirty-nine`,
    `six hundred forty`,
    `six hundred forty-one`,
    `six hundred forty-two`,
    `six hundred forty-three`,
    `six hundred forty-four`,
    `six hundred forty-five`,
    `six hundred forty-six`,
    `six hundred forty-seven`,
    `six hundred forty-eight`,
    `six hundred forty-nine`,
    `six hundred fifty`,
    `six hundred fifty-one`,
    `six hundred fifty-two`,
    `six hundred fifty-three`,
    `six hundred fifty-four`,
    `six hundred fifty-five`,
    `six hundred fifty-six`,
    `six hundred fifty-seven`,
    `six hundred fifty-eight`,
    `six hundred fifty-nine`,
    `six hundred sixty`,
    `six hundred sixty-one`,
    `six hundred sixty-two`,
    `six hundred sixty-three`,
    `six hundred sixty-four`,
    `six hundred sixty-five`,
    `six hundred sixty-six`,
    `six hundred sixty-seven`,
    `six hundred sixty-eight`,
    `six hundred sixty-nine`,
    `six hundred seventy`,
    `six hundred seventy-one`,
    `six hundred seventy-two`,
    `six hundred seventy-three`,
    `six hundred seventy-four`,
    `six hundred seventy-five`,
    `six hundred seventy-six`,
    `six hundred seventy-seven`,
    `six hundred seventy-eight`,
    `six hundred seventy-nine`,
    `six hundred eighty`,
    `six hundred eighty-one`,
    `six hundred eighty-two`,
    `six hundred eighty-three`,
    `six hundred eighty-four`,
    `six hundred eighty-five`,
    `six hundred eighty-six`,
    `six hundred eighty-seven`,
    `six hundred eighty-eight`,
    `six hundred eighty-nine`,
    `six hundred ninety`,
    `six hundred ninety-one`,
    `six hundred ninety-two`,
    `six hundred ninety-three`,
    `six hundred ninety-four`,
    `six hundred ninety-five`,
    `six hundred ninety-six`,
    `six hundred ninety-seven`,
    `six hundred ninety-eight`,
    `six hundred ninety-nine`,
    `seven hundred`,
    `seven hundred one`,
    `seven hundred two`,
    `seven hundred three`,
    `seven hundred four`,
    `seven hundred five`,
    `seven hundred six`,
    `seven hundred seven`,
    `seven hundred eight`,
    `seven hundred nine`,
    `seven hundred ten`,
    `seven hundred eleven`,
    `seven hundred twelve`,
    `seven hundred thirteen`,
    `seven hundred fourteen`,
    `seven hundred fifteen`,
    `seven hundred sixteen`,
    `seven hundred seventeen`,
    `seven hundred eighteen`,
    `seven hundred nineteen`,
    `seven hundred twenty`,
    `seven hundred twenty-one`,
    `seven hundred twenty-two`,
    `seven hundred twenty-three`,
    `seven hundred twenty-four`,
    `seven hundred twenty-five`,
    `seven hundred twenty-six`,
    `seven hundred twenty-seven`,
    `seven hundred twenty-eight`,
    `seven hundred twenty-nine`,
    `seven hundred thirty`,
    `seven hundred thirty-one`,
    `seven hundred thirty-two`,
    `seven hundred thirty-three`,
    `seven hundred thirty-four`,
    `seven hundred thirty-five`,
    `seven hundred thirty-six`,
    `seven hundred thirty-seven`,
    `seven hundred thirty-eight`,
    `seven hundred thirty-nine`,
    `seven hundred forty`,
    `seven hundred forty-one`,
    `seven hundred forty-two`,
    `seven hundred forty-three`,
    `seven hundred forty-four`,
    `seven hundred forty-five`,
    `seven hundred forty-six`,
    `seven hundred forty-seven`,
    `seven hundred forty-eight`,
    `seven hundred forty-nine`,
    `seven hundred fifty`,
    `seven hundred fifty-one`,
    `seven hundred fifty-two`,
    `seven hundred fifty-three`,
    `seven hundred fifty-four`,
    `seven hundred fifty-five`,
    `seven hundred fifty-six`,
    `seven hundred fifty-seven`,
    `seven hundred fifty-eight`,
    `seven hundred fifty-nine`,
    `seven hundred sixty`,
    `seven hundred sixty-one`,
    `seven hundred sixty-two`,
    `seven hundred sixty-three`,
    `seven hundred sixty-four`,
    `seven hundred sixty-five`,
    `seven hundred sixty-six`,
    `seven hundred sixty-seven`,
    `seven hundred sixty-eight`,
    `seven hundred sixty-nine`,
    `seven hundred seventy`,
    `seven hundred seventy-one`,
    `seven hundred seventy-two`,
    `seven hundred seventy-three`,
    `seven hundred seventy-four`,
    `seven hundred seventy-five`,
    `seven hundred seventy-six`,
    `seven hundred seventy-seven`,
    `seven hundred seventy-eight`,
    `seven hundred seventy-nine`,
    `seven hundred eighty`,
    `seven hundred eighty-one`,
    `seven hundred eighty-two`,
    `seven hundred eighty-three`,
    `seven hundred eighty-four`,
    `seven hundred eighty-five`,
    `seven hundred eighty-six`,
    `seven hundred eighty-seven`,
    `seven hundred eighty-eight`,
    `seven hundred eighty-nine`,
    `seven hundred ninety`,
    `seven hundred ninety-one`,
    `seven hundred ninety-two`,
    `seven hundred ninety-three`,
    `seven hundred ninety-four`,
    `seven hundred ninety-five`,
    `seven hundred ninety-six`,
    `seven hundred ninety-seven`,
    `seven hundred ninety-eight`,
    `seven hundred ninety-nine`,
    `eight hundred`,
    `eight hundred one`,
    `eight hundred two`,
    `eight hundred three`,
    `eight hundred four`,
    `eight hundred five`,
    `eight hundred six`,
    `eight hundred seven`,
    `eight hundred eight`,
    `eight hundred nine`,
    `eight hundred ten`,
    `eight hundred eleven`,
    `eight hundred twelve`,
    `eight hundred thirteen`,
    `eight hundred fourteen`,
    `eight hundred fifteen`,
    `eight hundred sixteen`,
    `eight hundred seventeen`,
    `eight hundred eighteen`,
    `eight hundred nineteen`,
    `eight hundred twenty`,
    `eight hundred twenty-one`,
    `eight hundred twenty-two`,
    `eight hundred twenty-three`,
    `eight hundred twenty-four`,
    `eight hundred twenty-five`,
    `eight hundred twenty-six`,
    `eight hundred twenty-seven`,
    `eight hundred twenty-eight`,
    `eight hundred twenty-nine`,
    `eight hundred thirty`,
    `eight hundred thirty-one`,
    `eight hundred thirty-two`,
    `eight hundred thirty-three`,
    `eight hundred thirty-four`,
    `eight hundred thirty-five`,
    `eight hundred thirty-six`,
    `eight hundred thirty-seven`,
    `eight hundred thirty-eight`,
    `eight hundred thirty-nine`,
    `eight hundred forty`,
    `eight hundred forty-one`,
    `eight hundred forty-two`,
    `eight hundred forty-three`,
    `eight hundred forty-four`,
    `eight hundred forty-five`,
    `eight hundred forty-six`,
    `eight hundred forty-seven`,
    `eight hundred forty-eight`,
    `eight hundred forty-nine`,
    `eight hundred fifty`,
    `eight hundred fifty-one`,
    `eight hundred fifty-two`,
    `eight hundred fifty-three`,
    `eight hundred fifty-four`,
    `eight hundred fifty-five`,
    `eight hundred fifty-six`,
    `eight hundred fifty-seven`,
    `eight hundred fifty-eight`,
    `eight hundred fifty-nine`,
    `eight hundred sixty`,
    `eight hundred sixty-one`,
    `eight hundred sixty-two`,
    `eight hundred sixty-three`,
    `eight hundred sixty-four`,
    `eight hundred sixty-five`,
    `eight hundred sixty-six`,
    `eight hundred sixty-seven`,
    `eight hundred sixty-eight`,
    `eight hundred sixty-nine`,
    `eight hundred seventy`,
    `eight hundred seventy-one`,
    `eight hundred seventy-two`,
    `eight hundred seventy-three`,
    `eight hundred seventy-four`,
    `eight hundred seventy-five`,
    `eight hundred seventy-six`,
    `eight hundred seventy-seven`,
    `eight hundred seventy-eight`,
    `eight hundred seventy-nine`,
    `eight hundred eighty`,
    `eight hundred eighty-one`,
    `eight hundred eighty-two`,
    `eight hundred eighty-three`,
    `eight hundred eighty-four`,
    `eight hundred eighty-five`,
    `eight hundred eighty-six`,
    `eight hundred eighty-seven`,
    `eight hundred eighty-eight`,
    `eight hundred eighty-nine`,
    `eight hundred ninety`,
    `eight hundred ninety-one`,
    `eight hundred ninety-two`,
    `eight hundred ninety-three`,
    `eight hundred ninety-four`,
    `eight hundred ninety-five`,
    `eight hundred ninety-six`,
    `eight hundred ninety-seven`,
    `eight hundred ninety-eight`,
    `eight hundred ninety-nine`,
    `nine hundred`,
    `nine hundred one`,
    `nine hundred two`,
    `nine hundred three`,
    `nine hundred four`,
    `nine hundred five`,
    `nine hundred six`,
    `nine hundred seven`,
    `nine hundred eight`,
    `nine hundred nine`,
    `nine hundred ten`,
    `nine hundred eleven`,
    `nine hundred twelve`,
    `nine hundred thirteen`,
    `nine hundred fourteen`,
    `nine hundred fifteen`,
    `nine hundred sixteen`,
    `nine hundred seventeen`,
    `nine hundred eighteen`,
    `nine hundred nineteen`,
    `nine hundred twenty`,
    `nine hundred twenty-one`,
    `nine hundred twenty-two`,
    `nine hundred twenty-three`,
    `nine hundred twenty-four`,
    `nine hundred twenty-five`,
    `nine hundred twenty-six`,
    `nine hundred twenty-seven`,
    `nine hundred twenty-eight`,
    `nine hundred twenty-nine`,
    `nine hundred thirty`,
    `nine hundred thirty-one`,
    `nine hundred thirty-two`,
    `nine hundred thirty-three`,
    `nine hundred thirty-four`,
    `nine hundred thirty-five`,
    `nine hundred thirty-six`,
    `nine hundred thirty-seven`,
    `nine hundred thirty-eight`,
    `nine hundred thirty-nine`,
    `nine hundred forty`,
    `nine hundred forty-one`,
    `nine hundred forty-two`,
    `nine hundred forty-three`,
    `nine hundred forty-four`,
    `nine hundred forty-five`,
    `nine hundred forty-six`,
    `nine hundred forty-seven`,
    `nine hundred forty-eight`,
    `nine hundred forty-nine`,
    `nine hundred fifty`,
    `nine hundred fifty-one`,
    `nine hundred fifty-two`,
    `nine hundred fifty-three`,
    `nine hundred fifty-four`,
    `nine hundred fifty-five`,
    `nine hundred fifty-six`,
    `nine hundred fifty-seven`,
    `nine hundred fifty-eight`,
    `nine hundred fifty-nine`,
    `nine hundred sixty`,
    `nine hundred sixty-one`,
    `nine hundred sixty-two`,
    `nine hundred sixty-three`,
    `nine hundred sixty-four`,
    `nine hundred sixty-five`,
    `nine hundred sixty-six`,
    `nine hundred sixty-seven`,
    `nine hundred sixty-eight`,
    `nine hundred sixty-nine`,
    `nine hundred seventy`,
    `nine hundred seventy-one`,
    `nine hundred seventy-two`,
    `nine hundred seventy-three`,
    `nine hundred seventy-four`,
    `nine hundred seventy-five`,
    `nine hundred seventy-six`,
    `nine hundred seventy-seven`,
    `nine hundred seventy-eight`,
    `nine hundred seventy-nine`,
    `nine hundred eighty`,
    `nine hundred eighty-one`,
    `nine hundred eighty-two`,
    `nine hundred eighty-three`,
    `nine hundred eighty-four`,
    `nine hundred eighty-five`,
    `nine hundred eighty-six`,
    `nine hundred eighty-seven`,
    `nine hundred eighty-eight`,
    `nine hundred eighty-nine`,
    `nine hundred ninety`,
    `nine hundred ninety-one`,
    `nine hundred ninety-two`,
    `nine hundred ninety-three`,
    `nine hundred ninety-four`,
    `nine hundred ninety-five`,
    `nine hundred ninety-six`,
    `nine hundred ninety-seven`,
    `nine hundred ninety-eight`,
    `nine hundred ninety-nine`,
]

module.exports = {
    numbers,
    twitchUsernamePattern,
    printMemory,
    getContextEmote,
    pluralize,
    renderObj,
    logMessage,
    async handleUncaughtException(bot, err, location) {
        await printMemory(bot.channels)
        await logMessage([`> handleUncaughtException(err.message: '${err.message}', location: '${location}')`])

        const emote = users[BOT_USERNAME]?.jpegstripes?.sub ? `jpegstBroken` : users[BOT_USERNAME]?.sclarf?.sub ? `sclarfDead` : users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Heat` : users[BOT_USERNAME]?.domonintendo1?.sub ? `domoni6Sneeze` : `>(`
        for (const chatroom of bot.channels) {
            bot.say(chatroom, `Oops, I just crashed! ${emote} ${err.message} ${location}`)
        }

        await logMessage([makeLogs(bot.channels)])
        await logMessage([err.stack])

    },
    async dumpMemory(props) {
        const { bot, channel, username } = props
        await logMessage([`> dumpMemory(channel: ${channel}, username: ${username})`, `\n`])
        await logMessage([makeLogs(bot.channels)])
    },
    getMemoryUsage(props) {
        const { bot, chatroom } = props
        const obj = process.memoryUsage()
        const totalUsage = Object.keys(obj).map(key => obj[key]).reduce((a, b) => a + b)
        const list = Object.keys(obj).map(key => `${key}: ${formatMegabytes(obj[key])} MB`)
        bot.say(chatroom, `Currently using ${formatMegabytes(totalUsage)} MB (${list.join(`, `)})`)
    },
    getToUser(str) {
        return str
            ? str.replace(/^[@#]/g, ``).toLowerCase()
            : null
    },
    arrToList(arr) {
        return arr
            .map((element, idx) => idx !== 0 && idx + 1 === arr.length
                ? `and ${element}`
                : element)
            .join(arr.length > 2
                ? `, `
                : ` `)
    },
    initUser(bot, chatroom, tags, self) {
        const newUsername = tags.username
        logMessage([`> initUser(tags.username: '${newUsername}')`])
        users[newUsername] = {
            id: self ? BOT_ID : Number(tags[`user-id`]),
            displayName: tags[`display-name`],
            nickname: '',
            color: tags.color || ``,
            lemons: 0,
            hangmanWins: 0
        }

        // Check if user ID already exists, and merge their data
        for (const user of Object.keys(users)) {
            if (users[newUsername].id === users[user].id && user !== newUsername) {
                logMessage([`-> Merging '${user}' (ID: ${users[user].id}) into '${newUsername}'`])
                users[newUsername] = {
                    ...users[user],
                    displayName: tags[`display-name`],
                    nickname: '',
                    color: tags.color || ``
                }
                bot.say(chatroom, `Wow, ${users[user].nickname || users[user].displayName} changed their name to ${users[newUsername].displayName}!`)
                delete users[user]

                // Update if mod
                if (user in mods) {
                    mods[newUsername] = { ...mods[user] }
                    delete mods[user]
                }

                // Update if in channel
                if (user in lemonyFresh) {
                    lemonyFresh[newUsername] = { ...lemonyFresh[user] }
                    delete lemonyFresh[user]
                    bot.join(newUsername)
                }
            }
        }

        // Apply nickname
        if (newUsername in commonNicknames) {
            users[newUsername].nickname = commonNicknames[newUsername]
            delete commonNicknames[newUsername]
            logMessage([`-> ${newUsername}'s nickname has been restored (${users[newUsername].nickname}), ${Object.keys(commonNicknames).length} remain`])
        }

        // Restore lemons
        if (newUsername in startingLemons) {
            users[newUsername].lemons += startingLemons[newUsername]
            delete startingLemons[newUsername]
            logMessage([`-> ${newUsername}'s lemons have been restored (${users[newUsername].lemons}), ${Object.keys(startingLemons).length} remain`])
        }

        // Restore Hangman wins
        if (newUsername in hangmanWins) {
            users[newUsername].hangmanWins += hangmanWins[newUsername]
            delete hangmanWins[newUsername]
            logMessage([`-> ${newUsername}'s hangmanWins have been restored (${users[newUsername].hangmanWins}), ${Object.keys(hangmanWins).length} remain`])
        }
    },
    initUserChannel(tags, username, channel) {
        logMessage([`> initUserChannel(username: '${username}', channel: '${channel}')`])
        users[username][channel] = {
            sub: tags.subscriber,
            mod: tags.mod,
            vip: !!tags.vip || !!tags.badges?.vip,
            away: false,
            awayMessage: ``,
            msgCount: 0
        }
    },
    initChannel(channel) {
        logMessage([`> initChannel(channel: '${channel}')`])
        lemonyFresh[channel] = { ...lemonyFresh[channel] }
        lemonyFresh[channel].accessToken = lemonyFresh[channel]?.accessToken || mods[channel]?.accessToken || ``
        lemonyFresh[channel].refreshToken = lemonyFresh[channel]?.refreshToken || mods[channel]?.refreshToken || ``
        lemonyFresh[channel].subRaidMessage = lemonyFresh[channel]?.subRaidMessage || ``
        lemonyFresh[channel].noSubRaidMessage = lemonyFresh[channel]?.noSubRaidMessage || ``
        lemonyFresh[channel].emotes = lemonyFresh[channel]?.emotes || []
        lemonyFresh[channel].bttvEmotes = lemonyFresh[channel]?.bttvEmotes || []
        lemonyFresh[channel].contextEmotes = {
            lemonEmotes: [],
            neutralEmotes: [],
            hypeEmotes: [],
            positiveEmotes: [],
            upsetEmotes: [],
            negativeEmotes: [],
            greetingEmotes: [],
            byeEmotes: [],
            dumbEmotes: [],
            bttvLemonEmotes: [],
            bttvNeutralEmotes: [],
            bttvHypeEmotes: [],
            bttvPositiveEmotes: [],
            bttvUpsetEmotes: [],
            bttvNegativeEmotes: [],
            bttvGreetingEmotes: [],
            bttvByeEmotes: [],
            bttvDumbEmotes: [],
            ...lemonyFresh[channel].contextEmotes
        }
        lemonyFresh[channel].funnyCommands = lemonyFresh[channel]?.funnyCommands || []
        lemonyFresh[channel].redeems = lemonyFresh[channel]?.redeems || []
        lemonyFresh[channel].rollFunNumber = lemonyFresh[channel]?.rollFunNumber || true
        lemonyFresh[channel].funTimer = 0
        lemonyFresh[channel].funTimerGuesser = ``
        lemonyFresh[channel].pollId = ``
        lemonyFresh[channel].viewers = []
        lemonyFresh[channel].count = {
            name: ``,
            value: 0,
            ...lemonyFresh[channel].count
        }
        lemonyFresh[channel].list = lemonyFresh[channel]?.list || [``]
        lemonyFresh[channel].hangman = {
            listening: false,
            signup: false,
            answer: ``,
            spaces: [],
            players: [],
            guessedLetters: [],
            chances: settings.hangmanChances,
            currentPlayer: 0,
            ...lemonyFresh[channel].hangman
        }
        lemonyFresh[channel].timers = {
            '!so': { cooldown: 4, listening: true },
            '!raid': { cooldown: 6, listening: true },
            '!count': { cooldown: 0, listening: true },
            'streak': { cooldown: 30, listening: true },
            'new-chatter': { cooldown: 0, listening: true },
            'greet': { cooldown: 0, listening: true },
            'mass-greet': { cooldown: 0, listening: true },
            'say-goodnight': { cooldown: 0, listening: true },
            'say-thanks': { cooldown: 0, listening: true },
            'say-youre-welcome': { cooldown: 0, listening: true },
            'say-mood': { cooldown: 0, listening: true },
            ...lemonyFresh[channel].timers
        }
        lemonyFresh[channel].countdown = {
            startedAt: 0,
            duration: 0,
            full: 0,
            half: 0,
            lastTen: 0,
            ...lemonyFresh[channel].countdown
        }
    },
    updateMod(chatroom, tags, self, username) {
        if (!(username in mods)) {
            logMessage([`> initMod: '${username}'`])
            mods[username] = {
                id: self ? BOT_ID : Number(tags[`user-id`]),
                accessToken: ``,
                refreshToken: ``
            }
            if (username in lemonyFresh) {
                mods[username].accessToken = lemonyFresh[username].accessToken
                mods[username].refreshToken = lemonyFresh[username].refreshToken
            }
        }
        mods[username].isModIn = mods[username].isModIn || []
        if (!mods[username].isModIn.includes(chatroom)) {
            logMessage([`> updateMod ${username}: '${chatroom}'`])
            mods[username].isModIn.push(chatroom)
        }
    },
    resetCooldownTimer(channel, timer) {
        logMessage([`> resetCooldownTimer(channel: '${channel}', timer: '${timer}', cooldown: ${pluralize(lemonyFresh[channel].timers[timer].cooldown, `second`, `seconds`)})`])
        lemonyFresh[channel].timers[timer].listening = false
        clearTimeout(lemonyFresh[channel].timers[timer].timerId)
        lemonyFresh[channel].timers[timer].timerId = Number(setTimeout(() => {
            lemonyFresh[channel].timers[timer].listening = true
            logMessage([`-> Listening for '${timer}' again!`])
        }, lemonyFresh[channel].timers[timer].cooldown * 1000))
    },
    // (For debugging/discovery) Add to list of known message tags
    tagsListener(tags) {
        for (const tag of Object.keys(tags)) {
            const type = typeof tags[tag] === `object`
                ? tags[tag] === null
                    ? `null`
                    : Array.isArray(tags[tag])
                        ? `array`
                        : typeof tags[tag]
                : typeof tags[tag]
            if (!(tag in knownTags)) {
                logMessage([`> New message tag '${tag}' discovered (type: '${type}')`, type === `object` ? renderObj(tags[tag], tag) : tags[tag]])
                knownTags[tag] = { types: [] }
                if (tag === `msg-id`) { knownTags[tag].strings = [] }
            }
            // Listening for msg-id strings
            if (tag === `msg-id` && type === `string`) {
                if (!knownTags[tag].strings.includes(tags[tag])) {
                    logMessage([`> New string for message tag '${tag}' added: ${tags[tag]}`])
                    knownTags[tag].strings.push(tags[tag])
                }
            }
            if (!knownTags[tag].types.includes(type)) {
                if (knownTags[tag].types.length > 0) { logMessage([`> New type for message tag '${tag}' added: '${type}'`]) }
                knownTags[tag].types.push(type)
            }
            knownTags[tag].lastValue = typeof tags[tag] === `string`
                ? tags[tag].replace(/'/g, `’`)
                : tags[tag]
        }
    },
    getUsername(str) {
        return str
            ? str.replace(/^[@#]/g, ``).match(twitchUsernamePattern)
                ? str.replace(/^[@#]/g, ``)
                : null
            : null
    },
    findUserByNickname(str) {
        const nicknames = Object.fromEntries(
            Object.entries(users)
                .filter(arr => arr[1].nickname)
                .map(arr => {
                    return [[arr[1].nickname.toLowerCase()], arr[0]]
                })
        )
        logMessage([`> findUserByNickname(str: '${str}', result: ${str in nicknames ? `'${nicknames[str]}'` : null})`])
        return str in nicknames
            ? nicknames[str]
            : null
    },
    containsInaccessibleEmotes(str) {
        const inaccessibleEmotes = Object.keys(users[BOT_USERNAME])
            .filter(key => typeof users[BOT_USERNAME][key] === `object` && users.lemony_friend[key].sub === false)
            .map(channel => lemonyFresh[channel].emotes)
            .flat()
        if (inaccessibleEmotes.some(emote => str.includes(emote))) {
            logMessage([`> containsInaccessibleEmotes(str: '${str}')`])
            return true
        }
        return false
    },
    containsUnrecognizedEmotes(str) {
        if (emotePattern.test(str)) {
            const allEmotes = [
                ...Object.keys(lemonyFresh).map(channel => lemonyFresh[channel].emotes),
                ...Object.keys(lemonyFresh).map(channel => lemonyFresh[channel].bttvEmotes)
            ].flat()
            const unrecognizedEmotes = str
                .split(emotePattern)
                .filter((emote, idx) => !allEmotes.includes(emote) && (idx + 1) % 2 === 0)
                .filter((el, idx, self) => self.indexOf(el) === idx)

            if (unrecognizedEmotes.length) logMessage([`> containsUnrecognizedEmotes: ${unrecognizedEmotes.join(`, `)}`])
            return true
        }
        return false
    },
    acknowledgeGigantifiedEmote(bot, chatroom, msg) {
        const emoteUsed = msg.split(` `)[msg.split(` `).length - 1]
        const emoteOwner = Object.keys(lemonyFresh).filter(key => `emotes` in lemonyFresh[key] && lemonyFresh[key].emotes.includes(emoteUsed))[0]
            || null
        logMessage([`> Gigantified ${emoteUsed} owner: ${emoteOwner || `unknown`}, ${BOT_USERNAME} subbed? ${!!users[BOT_USERNAME]?.[emoteOwner]?.sub}`])
        if (users[BOT_USERNAME]?.[emoteOwner]?.sub) { bot.say(chatroom, `BEEG ${emoteUsed}`) }
    },
    appendLogs(chatroom, tags, msg, self, time, username, color) {
        const channel = chatroom.substring(1)
        const sharedChat = `source-room-id` in tags
        const isOriginChannel = sharedChat && tags[`room-id`] === tags[`source-room-id`]
        const sourceChannel = sharedChat
            ? Object.keys(lemonyFresh).filter(key => lemonyFresh[key].id && lemonyFresh[key].id === Number(tags[`source-room-id`]))[0]
            : null

        sharedChat
            ? isOriginChannel
                ? logMessage([msg], time, channel, username, color, self)
                : sourceChannel
                    ? logMessage([`${username}'s message also posted in ${channel}'s channel`])
                    : logMessage([msg], time, tags[`room-id`], username, color, self)
            : logMessage([msg], time, channel, username, color, self)
    }
}
