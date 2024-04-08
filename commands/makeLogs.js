const fs = require(`fs`)
const BOT_ACCESS_TOKEN = process.env.BOT_ACCESS_TOKEN
const JPEGSTRIPES_ACCESS_TOKEN = process.env.JPEGSTRIPES_ACCESS_TOKEN
const JPEGSTRIPES_REFRESH_TOKEN = process.env.JPEGSTRIPES_REFRESH_TOKEN
const SCLARF_ACCESS_TOKEN = process.env.SCLARF_ACCESS_TOKEN
const SCLARF_REFRESH_TOKEN = process.env.SCLARF_REFRESH_TOKEN
const E1ECTROMA_ACCESS_TOKEN = process.env.E1ECTROMA_ACCESS_TOKEN
const E1ECTROMA_REFRESH_TOKEN = process.env.E1ECTROMA_REFRESH_TOKEN
const DOMONINTENDO1_ACCESS_TOKEN = process.env.DOMONINTENDO1_ACCESS_TOKEN
const DOMONINTENDO1_REFRESH_TOKEN = process.env.DOMONINTENDO1_REFRESH_TOKEN
const CATJERKY_ACCESS_TOKEN = process.env.CATJERKY_ACCESS_TOKEN
const CATJERKY_REFRESH_TOKEN = process.env.CATJERKY_REFRESH_TOKEN
const SKITTLE108_ACCESS_TOKEN = process.env.SKITTLE108_ACCESS_TOKEN
const SKITTLE108_REFRESH_TOKEN = process.env.SKITTLE108_REFRESH_TOKEN
const DIRTYD0INKS_ACCESS_TOKEN = process.env.DIRTYD0INKS_ACCESS_TOKEN
const DIRTYD0INKS_REFRESH_TOKEN = process.env.DIRTYD0INKS_REFRESH_TOKEN
const ASTRAL_AN0MALY_ACCESS_TOKEN = process.env.ASTRAL_AN0MALY_ACCESS_TOKEN
const ASTRAL_AN0MALY_REFRESH_TOKEN = process.env.ASTRAL_AN0MALY_REFRESH_TOKEN

const { settings } = require(`../config`)
const { lemonyFresh, mods, users, knownTags, tempCmds } = require(`../data`)

function renderObj(obj, objName, indentation = ``) {
    const tab = `${indentation}\t`
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
    if (lemonyFresh.dirtyd0inks.accessToken !== DIRTYD0INKS_ACCESS_TOKEN) { msgBlock += `DIRTYD0INKS_ACCESS_TOKEN changed, update to: '${lemonyFresh.dirtyd0inks.accessToken}'\n` }
    if (lemonyFresh.dirtyd0inks.refreshToken !== DIRTYD0INKS_REFRESH_TOKEN) { msgBlock += `DIRTYD0INKS_REFRESH_TOKEN changed, update to: '${lemonyFresh.dirtyd0inks.refreshToken}'\n` }
    if (lemonyFresh.astral_an0maly.accessToken !== ASTRAL_AN0MALY_ACCESS_TOKEN) { msgBlock += `ASTRAL_AN0MALY_ACCESS_TOKEN changed, update to: '${lemonyFresh.astral_an0maly.accessToken}'\n` }
    if (lemonyFresh.astral_an0maly.refreshToken !== ASTRAL_AN0MALY_REFRESH_TOKEN) { msgBlock += `ASTRAL_AN0MALY_REFRESH_TOKEN changed, update to: '${lemonyFresh.astral_an0maly.refreshToken}'\n` }
    if (mods.catjerky.accessToken !== CATJERKY_ACCESS_TOKEN) { msgBlock += `CATJERKY_ACCESS_TOKEN changed, update to: '${mods.catjerky.accessToken}'\n` }
    if (mods.catjerky.refreshToken !== CATJERKY_REFRESH_TOKEN) { msgBlock += `CATJERKY_REFRESH_TOKEN changed, update to: '${mods.catjerky.refreshToken}'\n` }
    if (mods.skittle108.accessToken !== SKITTLE108_ACCESS_TOKEN) { msgBlock += `SKITTLE108_ACCESS_TOKEN changed, update to: '${mods.skittle108.accessToken}'\n` }
    if (mods.skittle108.refreshToken !== SKITTLE108_REFRESH_TOKEN) { msgBlock += `SKITTLE108_REFRESH_TOKEN changed, update to: '${mods.skittle108.refreshToken}'\n` }
    msgBlock += starBorder
    return msgBlock
}

function makeLogs(arr) {
    let log = `🍋️ LEMONY LOGS 🍋️\n`
    log += `Session started: ${settings.startTime}\n`

    // If any tokens have changed, print a header and footer
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

    if (anyTokenChange) { log += tokenChangeWarning() }

    log += `\nJoined channels: ['${arr.join(`', '`)}']\n\n`

    const objectsToLog = [
        [lemonyFresh, `lemonyFresh`],
        [mods, `mods`],
        [users, `users`],
        [knownTags, 'knownTags'],
        [settings, `settings`],
        [tempCmds, `tempCmds`]
    ]
    for (const [obj, objName] of objectsToLog) {
        log += `${renderObj(obj, objName)}\n\n`
    }

    if (anyTokenChange) { log += tokenChangeWarning() }

    fs.writeFile(`lemony_logs.txt`, log, (err) => {
        if (err) { console.log(`Error writing logs:`, err) }
    })
}

module.exports = { makeLogs }
