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

module.exports = {
    makeLogs(arr) {
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
    },
    async printMemory(arr) {
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
}
