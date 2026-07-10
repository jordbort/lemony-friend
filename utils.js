const DEV = process.env.DEV
const BOT_ID = Number(process.env.BOT_ID)
const BOT_USERNAME = process.env.BOT_USERNAME

const fs = require(`fs/promises`)

const { settings, lemonyFresh, mods, users, knownTags, lemCmds, wordBank, joinedChatrooms } = require(`./data`)

// Terminal colors
const terminalColors = {
    resetTxt: `\x1b[0m`,
    boldTxt: `\x1b[1m`,
    underlined: `\x1b[4m`,
    inverted: `\x1b[7m`,

    blackTxt: `\x1b[30m`,
    redTxt: `\x1b[31m`,
    greenTxt: `\x1b[32m`,
    yellowTxt: `\x1b[33m`,
    blueTxt: `\x1b[34m`,
    magentaTxt: `\x1b[35m`,
    cyanTxt: `\x1b[36m`,
    whiteTxt: `\x1b[37m`,
    grayTxt: `\x1b[90m`,
    orangeTxt: `\x1b[38;5;208m`,

    blackBg: `\x1b[40m`,
    redBg: `\x1b[41m`,
    greenBg: `\x1b[42m`,
    yellowBg: `\x1b[43m`,
    blueBg: `\x1b[44m`,
    magentaBg: `\x1b[45m`,
    cyanBg: `\x1b[46m`,
    whiteBg: `\x1b[47m`,
    grayBg: `\x1b[100m`,
    orangeBg: `\x1b[48;2;255;164;0m`
}

// Twitch color names and terminal color references
const chatColors = {
    '#0000FF': { name: `blue`, terminalColor: terminalColors.blueTxt },
    '#8A2BE2': { name: `blue-violet`, terminalColor: terminalColors.blueTxt },
    '#5F9EA0': { name: `cadet blue`, terminalColor: terminalColors.cyanTxt },
    '#D2691E': { name: `chocolate`, terminalColor: terminalColors.magentaTxt },
    '#FF7F50': { name: `coral`, terminalColor: terminalColors.magentaTxt },
    '#1E90FF': { name: `dodger blue`, terminalColor: terminalColors.cyanTxt },
    '#B22222': { name: `firebrick`, terminalColor: terminalColors.redTxt },
    '#DAA520': { name: `goldenrod`, terminalColor: terminalColors.yellowTxt },
    '#008000': { name: `green`, terminalColor: terminalColors.greenTxt },
    '#FF69B4': { name: `hot pink`, terminalColor: terminalColors.redTxt },
    '#FF4500': { name: `orange-red`, terminalColor: terminalColors.orangeTxt },
    '#FF0000': { name: `red`, terminalColor: terminalColors.redTxt },
    '#2E8B57': { name: `sea green`, terminalColor: terminalColors.greenTxt },
    '#00FF7F': { name: `spring green`, terminalColor: terminalColors.greenTxt },
    '#ADFF2F': { name: `yellow-green`, terminalColor: terminalColors.yellowTxt }
}

const twitchUsernamePattern = /^[a-z0-9_]{4,25}$/i
const emotePattern = /\b([a-z][a-z0-9]{2,9}[A-Z0-9][a-zA-Z0-9]{0,19})\b/

const formatMegabytes = (num) => Math.round(num / 1024 / 1024 * 100) / 100

function pluralize(num, singularForm, pluralForm) {
    return Number(num) === 1
        ? `${Number(num).toLocaleString(settings.timeLocale)} ${singularForm}`
        : `${Number(num).toLocaleString(settings.timeLocale)} ${pluralForm}`
}

function renderObj(obj, objName, indentation = ``) {
    if (!Object.keys(obj).length) return `${objName}: {}`
    const tab = `${indentation}\t`
    const data = [`${objName ? `${objName}: ` : ``}{`]
    const keys = `\n${Object.keys(obj).map((key) => {
        return typeof obj[key] === `string`
            ? `${tab}${key}: '${obj[key]}'`
            : typeof obj[key] === `object` && obj[key] !== null
                ? Array.isArray(obj[key])
                    ? `${tab}${key}: [${obj[key].length
                        ? obj[key].map((val) => {
                            return typeof val === `string`
                                ? `'${val}'`
                                : typeof val === `object` && val !== null && !Array.isArray(val)
                                    ? renderObj(val, ``, tab)
                                    : val
                        }).join(`, `)
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
    // Colorize chat messages
    const { resetTxt, grayTxt, whiteTxt, yellowBg } = terminalColors

    // Display date change
    const currentDate = new Date().toLocaleDateString(settings.timeLocale, { year: `numeric`, month: `long`, day: `numeric`, timeZone: settings.timeZone })
    if (currentDate !== settings.currentDate) {
        settings.currentDate = currentDate
        console.log(settings.currentDate)
        await fs.appendFile(`lemony_logs.txt`, `${settings.currentDate}\n`, (err) => {
            if (err) { console.log(`Error writing logs:`, err) }
        })
    }

    // Log chat message or debug message
    const channelName = settings.knownChannels[channel] || channel
    const log = messages.join(` `)
    if (username) {
        await fs.appendFile(`lemony_logs.txt`, `[${time}] <${channelName}> ${username}: ${log}\n`, (err) => {
            if (err) { console.log(`Error writing logs:`, err) }
        })
        if (!settings.hideNonDevChannel || channelName === DEV) {
            self && settings.highlightBotMessage
                ? console.log(`${yellowBg}${settings.logTime
                    ? `[${time}] `
                    : ``}${settings.hideNonDevChannel
                        ? ``
                        : `<${channelName}> `}${username}: ${log}${resetTxt}`)
                : console.log(`${settings.logTime
                    ? `[${time}] `
                    : ``}${settings.hideNonDevChannel
                        ? ``
                        : `<${channelName}> `}${color in chatColors ? chatColors[color].terminalColor : whiteTxt}${username}: ${log}${resetTxt}`)
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
    `ninety-nine`
]

function spellOutNumber(num) {
    if (isNaN(Number(num))) { return NaN }

    const output = []
    if (num < 0) {
        output.push(`negative`)
        num = Math.abs(num)
    }
    if (num === Infinity) {
        output.push(`infinity`)
        return output.join(` `)
    }
    if (num >= 10 ** 15) {
        output.push(`uncountable`)
        return output.join(` `)
    }

    const placeValues = {
        hundred: 0,
        thousand: 0,
        million: 0,
        billion: 0,
        trillion: 0
    }

    while (num >= 10 ** 12) {
        placeValues.trillion++
        num -= 10 ** 12
    }
    while (num >= 10 ** 9) {
        placeValues.billion++
        num -= 10 ** 9
    }
    while (num >= 10 ** 6) {
        placeValues.million++
        num -= 10 ** 6
    }
    while (num >= 10 ** 3) {
        placeValues.thousand++
        num -= 10 ** 3
    }
    while (num >= 100) {
        placeValues.hundred++
        num -= 100
    }

    if (placeValues.trillion) {
        output.push(spellOutNumber(placeValues.trillion), `trillion`)
    }
    if (placeValues.billion) {
        output.push(spellOutNumber(placeValues.billion), `billion`)
    }
    if (placeValues.million) {
        output.push(spellOutNumber(placeValues.million), `million`)
    }
    if (placeValues.thousand) {
        output.push(spellOutNumber(placeValues.thousand), `thousand`)
    }
    if (placeValues.hundred) {
        output.push(spellOutNumber(placeValues.hundred), `hundred`)
    }

    const afterDecimal = num.toString().split(`.`)[1] || ``
    num = Math.trunc(num)

    if (num || num === 0) {
        output.push(numbers[num])
    }
    if (afterDecimal.length) {
        output.push(`point`)
        for (const digit of afterDecimal) {
            output.push(numbers[Number(digit)])
        }
    }

    return output.join(` `)
}

function logArr(arr) {
    const typeArr = arr.map(el => typeof el === `string` ? `'${el}'` : `${el}`)
    return `[${typeArr.length ? ` ${typeArr.join(`, `)} ` : ``}]`
}

async function printMemory(arr) {
    await logMessage([`> printMemory(joinedChatrooms: ${logArr(arr)})`])
    await fs.writeFile(`./memory.json`, JSON.stringify({
        joinedChatrooms: arr,
        settings,
        lemonyFresh,
        mods,
        users,
        knownTags,
        lemCmds,
        wordBank
    }, null, 4))
}

function findEmotePrefix(username) {
    const arr = [...lemonyFresh[username].followEmotes, ...lemonyFresh[username].subEmotes]
    if (arr.length < 2) {
        const prefix = [...lemonyFresh[username].followEmotes, ...lemonyFresh[username].subEmotes]
            .map(str => str.search(/[A-Z]/))
            .filter((el, idx, self) => self.indexOf(el) === idx && el !== -1)
            .map(num => [...lemonyFresh[username].followEmotes, ...lemonyFresh[username].subEmotes][0].substring(0, num))
        return prefix[0] || ``
    } else {
        const firstEmote = arr[0]
        const lengths = []
        for (let j = 1; j < arr.length; j++) {
            let i = 0
            while (i < arr[j].length && firstEmote[i] === arr[j][i] && !/[A-Z]/.test(arr[j][i])) { i++ }
            lengths.push(i)
        }
        const prefixLengths = lengths.filter((el, idx, self) => idx === self.indexOf(el))
        if (prefixLengths.length !== 1) {
            logMessage([`Warning: Consensus for ${username}'s emote prefix length was not reached: ${logArr(prefixLengths)} Returning '${arr[0].substring(0, prefixLengths[0])}'`])
        }
        return arr[0].substring(0, prefixLengths[0])
    }
}

const superscriptTable = {
    a: `ᵃ`,
    b: `ᵇ`,
    c: `ᶜ`,
    d: `ᵈ`,
    e: `ᵉ`,
    f: `ᶠ`,
    g: `ᵍ`,
    h: `ʰ`,
    i: `ᶦ`,
    j: `ʲ`,
    k: `ᵏ`,
    l: `ˡ`,
    m: `ᵐ`,
    n: `ⁿ`,
    o: `ᵒ`,
    p: `ᵖ`,
    q: `ᑫ`,
    r: `ʳ`,
    s: `ˢ`,
    t: `ᵗ`,
    u: `ᵘ`,
    v: `ᵛ`,
    w: `ʷ`,
    x: `ˣ`,
    y: `ʸ`,
    z: `ᶻ`,
    A: `ᴬ`,
    B: `ᴮ`,
    C: `ᶜ`,
    D: `ᴰ`,
    E: `ᴱ`,
    F: `ᶠ`,
    G: `ᴳ`,
    H: `ᴴ`,
    I: `ᴵ`,
    J: `ᴶ`,
    K: `ᴷ`,
    L: `ᴸ`,
    M: `ᴹ`,
    N: `ᴺ`,
    O: `ᴼ`,
    P: `ᴾ`,
    Q: `Q`,
    R: `ᴿ`,
    S: `ˢ`,
    T: `ᵀ`,
    U: `ᵁ`,
    V: `ⱽ`,
    W: `ᵂ`,
    X: `ˣ`,
    Y: `ʸ`,
    Z: `ᶻ`,
    0: `⁰`,
    1: `¹`,
    2: `²`,
    3: `³`,
    4: `⁴`,
    5: `⁵`,
    6: `⁶`,
    7: `⁷`,
    8: `⁸`,
    9: `⁹`,
    '(': `⁽`,
    ')': `⁾`,
    '-': `⁻`,
    '=': `⁼`,
    '+': `⁺`
}

const boldTable = {
    0: `𝟎`,
    1: `𝟏`,
    2: `𝟐`,
    3: `𝟑`,
    4: `𝟒`,
    5: `𝟓`,
    6: `𝟔`,
    7: `𝟕`,
    8: `𝟖`,
    9: `𝟗`,
    a: `𝐚`,
    b: `𝐛`,
    c: `𝐜`,
    d: `𝐝`,
    e: `𝐞`,
    f: `𝐟`,
    g: `𝐠`,
    h: `𝐡`,
    i: `𝐢`,
    j: `𝐣`,
    k: `𝐤`,
    l: `𝐥`,
    m: `𝐦`,
    n: `𝐧`,
    o: `𝐨`,
    p: `𝐩`,
    q: `𝐪`,
    r: `𝐫`,
    s: `𝐬`,
    t: `𝐭`,
    u: `𝐮`,
    v: `𝐯`,
    w: `𝐰`,
    x: `𝐱`,
    y: `𝐲`,
    z: `𝐳`,
    A: `𝐀`,
    B: `𝐁`,
    C: `𝐂`,
    D: `𝐃`,
    E: `𝐄`,
    F: `𝐅`,
    G: `𝐆`,
    H: `𝐇`,
    I: `𝐈`,
    J: `𝐉`,
    K: `𝐊`,
    L: `𝐋`,
    M: `𝐌`,
    N: `𝐍`,
    O: `𝐎`,
    P: `𝐏`,
    Q: `𝐐`,
    R: `𝐑`,
    S: `𝐒`,
    T: `𝐓`,
    U: `𝐔`,
    V: `𝐕`,
    W: `𝐖`,
    X: `𝐗`,
    Y: `𝐘`,
    Z: `𝐙`
}

const italicTable = {
    a: `𝑎`,
    b: `𝑏`,
    c: `𝑐`,
    d: `𝑑`,
    e: `𝑒`,
    f: `𝑓`,
    g: `𝑔`,
    h: `ℎ`,
    i: `𝑖`,
    j: `𝑗`,
    k: `𝑘`,
    l: `𝑙`,
    m: `𝑚`,
    n: `𝑛`,
    o: `𝑜`,
    p: `𝑝`,
    q: `𝑞`,
    r: `𝑟`,
    s: `𝑠`,
    t: `𝑡`,
    u: `𝑢`,
    v: `𝑣`,
    w: `𝑤`,
    x: `𝑥`,
    y: `𝑦`,
    z: `𝑧`,
    A: `𝐴`,
    B: `𝐵`,
    C: `𝐶`,
    D: `𝐷`,
    E: `𝐸`,
    F: `𝐹`,
    G: `𝐺`,
    H: `𝐻`,
    I: `𝐼`,
    J: `𝐽`,
    K: `𝐾`,
    L: `𝐿`,
    M: `𝑀`,
    N: `𝑁`,
    O: `𝑂`,
    P: `𝑃`,
    Q: `𝑄`,
    R: `𝑅`,
    S: `𝑆`,
    T: `𝑇`,
    U: `𝑈`,
    V: `𝑉`,
    W: `𝑊`,
    X: `𝑋`,
    Y: `𝑌`,
    Z: `𝑍`
}

const boldItalicTable = {
    a: `𝒂`,
    b: `𝒃`,
    c: `𝒄`,
    d: `𝒅`,
    e: `𝒆`,
    f: `𝒇`,
    g: `𝒈`,
    h: `𝒉`,
    i: `𝒊`,
    j: `𝒋`,
    k: `𝒌`,
    l: `𝒍`,
    m: `𝒎`,
    n: `𝒏`,
    o: `𝒐`,
    p: `𝒑`,
    q: `𝒒`,
    r: `𝒓`,
    s: `𝒔`,
    t: `𝒕`,
    u: `𝒖`,
    v: `𝒗`,
    w: `𝒘`,
    x: `𝒙`,
    y: `𝒚`,
    z: `𝒛`,
    A: `𝑨`,
    B: `𝑩`,
    C: `𝑪`,
    D: `𝑫`,
    E: `𝑬`,
    F: `𝑭`,
    G: `𝑮`,
    H: `𝑯`,
    I: `𝑰`,
    J: `𝑱`,
    K: `𝑲`,
    L: `𝑳`,
    M: `𝑴`,
    N: `𝑵`,
    O: `𝑶`,
    P: `𝑷`,
    Q: `𝑸`,
    R: `𝑹`,
    S: `𝑺`,
    T: `𝑻`,
    U: `𝑼`,
    V: `𝑽`,
    W: `𝑾`,
    X: `𝑿`,
    Y: `𝒀`,
    Z: `𝒁`
}

const sansSerifNormalTable = {
    a: `𝖺`,
    b: `𝖻`,
    c: `𝖼`,
    d: `𝖽`,
    e: `𝖾`,
    f: `𝖿`,
    g: `𝗀`,
    h: `𝗁`,
    i: `𝗂`,
    j: `𝗃`,
    k: `𝗄`,
    l: `𝗅`,
    m: `𝗆`,
    n: `𝗇`,
    o: `𝗈`,
    p: `𝗉`,
    q: `𝗊`,
    r: `𝗋`,
    s: `𝗌`,
    t: `𝗍`,
    u: `𝗎`,
    v: `𝗏`,
    w: `𝗐`,
    x: `𝗑`,
    y: `𝗒`,
    z: `𝗓`,
    A: `𝖠`,
    B: `𝖡`,
    C: `𝖢`,
    D: `𝖣`,
    E: `𝖤`,
    F: `𝖥`,
    G: `𝖦`,
    H: `𝖧`,
    I: `𝖨`,
    J: `𝖩`,
    K: `𝖪`,
    L: `𝖫`,
    M: `𝖬`,
    N: `𝖭`,
    O: `𝖮`,
    P: `𝖯`,
    Q: `𝖰`,
    R: `𝖱`,
    S: `𝖲`,
    T: `𝖳`,
    U: `𝖴`,
    V: `𝖵`,
    W: `𝖶`,
    X: `𝖷`,
    Y: `𝖸`,
    Z: `𝖹`
}

const sansSerifBoldTable = {
    a: `𝗮`,
    b: `𝗯`,
    c: `𝗰`,
    d: `𝗱`,
    e: `𝗲`,
    f: `𝗳`,
    g: `𝗴`,
    h: `𝗵`,
    i: `𝗶`,
    j: `𝗷`,
    k: `𝗸`,
    l: `𝗹`,
    m: `𝗺`,
    n: `𝗻`,
    o: `𝗼`,
    p: `𝗽`,
    q: `𝗾`,
    r: `𝗿`,
    s: `𝘀`,
    t: `𝘁`,
    u: `𝘂`,
    v: `𝘃`,
    w: `𝘄`,
    x: `𝘅`,
    y: `𝘆`,
    z: `𝘇`,
    A: `𝗔`,
    B: `𝗕`,
    C: `𝗖`,
    D: `𝗗`,
    E: `𝗘`,
    F: `𝗙`,
    G: `𝗚`,
    H: `𝗛`,
    I: `𝗜`,
    J: `𝗝`,
    K: `𝗞`,
    L: `𝗟`,
    M: `𝗠`,
    N: `𝗡`,
    O: `𝗢`,
    P: `𝗣`,
    Q: `𝗤`,
    R: `𝗥`,
    S: `𝗦`,
    T: `𝗧`,
    U: `𝗨`,
    V: `𝗩`,
    W: `𝗪`,
    X: `𝗫`,
    Y: `𝗬`,
    Z: `𝗭`
}

const sansSerifItalicTable = {
    a: `𝘢`,
    b: `𝘣`,
    c: `𝘤`,
    d: `𝘥`,
    e: `𝘦`,
    f: `𝘧`,
    g: `𝘨`,
    h: `𝘩`,
    i: `𝘪`,
    j: `𝘫`,
    k: `𝘬`,
    l: `𝘭`,
    m: `𝘮`,
    n: `𝘯`,
    o: `𝘰`,
    p: `𝘱`,
    q: `𝘲`,
    r: `𝘳`,
    s: `𝘴`,
    t: `𝘵`,
    u: `𝘶`,
    v: `𝘷`,
    w: `𝘸`,
    x: `𝘹`,
    y: `𝘺`,
    z: `𝘻`,
    A: `𝘈`,
    B: `𝘉`,
    C: `𝘊`,
    D: `𝘋`,
    E: `𝘌`,
    F: `𝘍`,
    G: `𝘎`,
    H: `𝘏`,
    I: `𝘐`,
    J: `𝘑`,
    K: `𝘒`,
    L: `𝘓`,
    M: `𝘔`,
    N: `𝘕`,
    O: `𝘖`,
    P: `𝘗`,
    Q: `𝘘`,
    R: `𝘙`,
    S: `𝘚`,
    T: `𝘛`,
    U: `𝘜`,
    V: `𝘝`,
    W: `𝘞`,
    X: `𝘟`,
    Y: `𝘠`,
    Z: `𝘡`
}

const sansSerifBoldItalicTable = {
    a: `𝙖`,
    b: `𝙗`,
    c: `𝙘`,
    d: `𝙙`,
    e: `𝙚`,
    f: `𝙛`,
    g: `𝙜`,
    h: `𝙝`,
    i: `𝙞`,
    j: `𝙟`,
    k: `𝙠`,
    l: `𝙡`,
    m: `𝙢`,
    n: `𝙣`,
    o: `𝙤`,
    p: `𝙥`,
    q: `𝙦`,
    r: `𝙧`,
    s: `𝙨`,
    t: `𝙩`,
    u: `𝙪`,
    v: `𝙫`,
    w: `𝙬`,
    x: `𝙭`,
    y: `𝙮`,
    z: `𝙯`,
    A: `𝘼`,
    B: `𝘽`,
    C: `𝘾`,
    D: `𝘿`,
    E: `𝙀`,
    F: `𝙁`,
    G: `𝙂`,
    H: `𝙃`,
    I: `𝙄`,
    J: `𝙅`,
    K: `𝙆`,
    L: `𝙇`,
    M: `𝙈`,
    N: `𝙉`,
    O: `𝙊`,
    P: `𝙋`,
    Q: `𝙌`,
    R: `𝙍`,
    S: `𝙎`,
    T: `𝙏`,
    U: `𝙐`,
    V: `𝙑`,
    W: `𝙒`,
    X: `𝙓`,
    Y: `𝙔`,
    Z: `𝙕`
}

const scriptNormalTable = {
    a: `𝒶`,
    b: `𝒷`,
    c: `𝒸`,
    d: `𝒹`,
    e: `ℯ`,
    f: `𝒻`,
    g: `ℊ`,
    h: `𝒽`,
    i: `𝒾`,
    j: `𝒿`,
    k: `𝓀`,
    l: `𝓁`,
    m: `𝓂`,
    n: `𝓃`,
    o: `ℴ`,
    p: `𝓅`,
    q: `𝓆`,
    r: `𝓇`,
    s: `𝓈`,
    t: `𝓉`,
    u: `𝓊`,
    v: `𝓋`,
    w: `𝓌`,
    x: `𝓍`,
    y: `𝓎`,
    z: `𝓏`,
    A: `𝒜`,
    B: `ℬ`,
    C: `𝒞`,
    D: `𝒟`,
    E: `ℰ`,
    F: `ℱ`,
    G: `𝒢`,
    H: `ℋ`,
    I: `ℐ`,
    J: `𝒥`,
    K: `𝒦`,
    L: `ℒ`,
    M: `ℳ`,
    N: `𝒩`,
    O: `𝒪`,
    P: `𝒫`,
    Q: `𝒬`,
    R: `ℛ`,
    S: `𝒮`,
    T: `𝒯`,
    U: `𝒰`,
    V: `𝒱`,
    W: `𝒲`,
    X: `𝒳`,
    Y: `𝒴`,
    Z: `𝒵`
}

const scriptBoldTable = {
    a: `𝓪`,
    b: `𝓫`,
    c: `𝓬`,
    d: `𝓭`,
    e: `𝓮`,
    f: `𝓯`,
    g: `𝓰`,
    h: `𝓱`,
    i: `𝓲`,
    j: `𝓳`,
    k: `𝓴`,
    l: `𝓵`,
    m: `𝓶`,
    n: `𝓷`,
    o: `𝓸`,
    p: `𝓹`,
    q: `𝓺`,
    r: `𝓻`,
    s: `𝓼`,
    t: `𝓽`,
    u: `𝓾`,
    v: `𝓿`,
    w: `𝔀`,
    x: `𝔁`,
    y: `𝔂`,
    z: `𝔃`,
    A: `𝓐`,
    B: `𝓑`,
    C: `𝓒`,
    D: `𝓓`,
    E: `𝓔`,
    F: `𝓕`,
    G: `𝓖`,
    H: `𝓗`,
    I: `𝓘`,
    J: `𝓙`,
    K: `𝓚`,
    L: `𝓛`,
    M: `𝓜`,
    N: `𝓝`,
    O: `𝓞`,
    P: `𝓟`,
    Q: `𝓠`,
    R: `𝓡`,
    S: `𝓢`,
    T: `𝓣`,
    U: `𝓤`,
    V: `𝓥`,
    W: `𝓦`,
    X: `𝓧`,
    Y: `𝓨`,
    Z: `𝓩`
}

const frakturNormalTable = {
    a: `𝔞`,
    b: `𝔟`,
    c: `𝔠`,
    d: `𝔡`,
    e: `𝔢`,
    f: `𝔣`,
    g: `𝔤`,
    h: `𝔥`,
    i: `𝔦`,
    j: `𝔧`,
    k: `𝔨`,
    l: `𝔩`,
    m: `𝔪`,
    n: `𝔫`,
    o: `𝔬`,
    p: `𝔭`,
    q: `𝔮`,
    r: `𝔯`,
    s: `𝔰`,
    t: `𝔱`,
    u: `𝔲`,
    v: `𝔳`,
    w: `𝔴`,
    x: `𝔵`,
    y: `𝔶`,
    z: `𝔷`,
    A: `𝔄`,
    B: `𝔅`,
    C: `ℭ`,
    D: `𝔇`,
    E: `𝔈`,
    F: `𝔉`,
    G: `𝔊`,
    H: `ℌ`,
    I: `ℑ`,
    J: `𝔍`,
    K: `𝔎`,
    L: `𝔏`,
    M: `𝔐`,
    N: `𝔑`,
    O: `𝔒`,
    P: `𝔓`,
    Q: `𝔔`,
    R: `ℜ`,
    S: `𝔖`,
    T: `𝔗`,
    U: `𝔘`,
    V: `𝔙`,
    W: `𝔚`,
    X: `𝔛`,
    Y: `𝔜`,
    Z: `ℨ`
}

const frakturBoldTable = {
    a: `𝖆`,
    b: `𝖇`,
    c: `𝖈`,
    d: `𝖉`,
    e: `𝖊`,
    f: `𝖋`,
    g: `𝖌`,
    h: `𝖍`,
    i: `𝖎`,
    j: `𝖏`,
    k: `𝖐`,
    l: `𝖑`,
    m: `𝖒`,
    n: `𝖓`,
    o: `𝖔`,
    p: `𝖕`,
    q: `𝖖`,
    r: `𝖗`,
    s: `𝖘`,
    t: `𝖙`,
    u: `𝖚`,
    v: `𝖛`,
    w: `𝖜`,
    x: `𝖝`,
    y: `𝖞`,
    z: `𝖟`,
    A: `𝕬`,
    B: `𝕭`,
    C: `𝕮`,
    D: `𝕯`,
    E: `𝕰`,
    F: `𝕱`,
    G: `𝕲`,
    H: `𝕳`,
    I: `𝕴`,
    J: `𝕵`,
    K: `𝕶`,
    L: `𝕷`,
    M: `𝕸`,
    N: `𝕹`,
    O: `𝕺`,
    P: `𝕻`,
    Q: `𝕼`,
    R: `𝕽`,
    S: `𝕾`,
    T: `𝕿`,
    U: `𝖀`,
    V: `𝖁`,
    W: `𝖂`,
    X: `𝖃`,
    Y: `𝖄`,
    Z: `𝖅`
}

const monospaceTable = {
    a: `𝚊`,
    b: `𝚋`,
    c: `𝚌`,
    d: `𝚍`,
    e: `𝚎`,
    f: `𝚏`,
    g: `𝚐`,
    h: `𝚑`,
    i: `𝚒`,
    j: `𝚓`,
    k: `𝚔`,
    l: `𝚕`,
    m: `𝚖`,
    n: `𝚗`,
    o: `𝚘`,
    p: `𝚙`,
    q: `𝚚`,
    r: `𝚛`,
    s: `𝚜`,
    t: `𝚝`,
    u: `𝚞`,
    v: `𝚟`,
    w: `𝚠`,
    x: `𝚡`,
    y: `𝚢`,
    z: `𝚣`,
    A: `𝙰`,
    B: `𝙱`,
    C: `𝙲`,
    D: `𝙳`,
    E: `𝙴`,
    F: `𝙵`,
    G: `𝙶`,
    H: `𝙷`,
    I: `𝙸`,
    J: `𝙹`,
    K: `𝙺`,
    L: `𝙻`,
    M: `𝙼`,
    N: `𝙽`,
    O: `𝙾`,
    P: `𝙿`,
    Q: `𝚀`,
    R: `𝚁`,
    S: `𝚂`,
    T: `𝚃`,
    U: `𝚄`,
    V: `𝚅`,
    W: `𝚆`,
    X: `𝚇`,
    Y: `𝚈`,
    Z: `𝚉`
}

const doubleStruckTable = {
    '(': `⦅`,
    ')': `⦆`,
    '[': `⟦`,
    ']': `⟧`,
    '{': `⦃`,
    '}': `⦄`,
    ':': `⦂`,
    0: `𝟘`,
    1: `𝟙`,
    2: `𝟚`,
    3: `𝟛`,
    4: `𝟜`,
    5: `𝟝`,
    6: `𝟞`,
    7: `𝟟`,
    8: `𝟠`,
    9: `𝟡`,
    a: `𝕒`,
    b: `𝕓`,
    c: `𝕔`,
    d: `𝕕`,
    e: `𝕖`,
    f: `𝕗`,
    g: `𝕘`,
    h: `𝕙`,
    i: `𝕚`,
    j: `𝕛`,
    k: `𝕜`,
    l: `𝕝`,
    m: `𝕞`,
    n: `𝕟`,
    o: `𝕠`,
    p: `𝕡`,
    q: `𝕢`,
    r: `𝕣`,
    s: `𝕤`,
    t: `𝕥`,
    u: `𝕦`,
    v: `𝕧`,
    w: `𝕨`,
    x: `𝕩`,
    y: `𝕪`,
    z: `𝕫`,
    A: `𝔸`,
    B: `𝔹`,
    C: `ℂ`,
    D: `𝔻`,
    E: `𝔼`,
    F: `𝔽`,
    G: `𝔾`,
    H: `ℍ`,
    I: `𝕀`,
    J: `𝕁`,
    K: `𝕂`,
    L: `𝕃`,
    M: `𝕄`,
    N: `ℕ`,
    O: `𝕆`,
    P: `ℙ`,
    Q: `ℚ`,
    R: `ℝ`,
    S: `𝕊`,
    T: `𝕋`,
    U: `𝕌`,
    V: `𝕍`,
    W: `𝕎`,
    X: `𝕏`,
    Y: `𝕐`,
    Z: `ℤ`
}

module.exports = {
    terminalColors,
    chatColors,
    twitchUsernamePattern,
    printMemory,
    pluralize,
    renderObj,
    logMessage,
    logArr,
    numbers,
    spellOutNumber,
    async handleUncaughtException(bot, err, location) {
        await printMemory(bot.channels)
        await logMessage([`> handleUncaughtException(err.message: '${err.message}', location: '${location}')`])

        const emote = users[BOT_USERNAME]?.channels.jpegstripes?.sub ? `jpegstBroken`
            : users[BOT_USERNAME]?.channels.sclarf?.sub ? `sclarfDead`
                : users[BOT_USERNAME]?.channels.e1ectroma?.sub ? `e1ectr4Heat`
                    : users[BOT_USERNAME]?.channels.domonintendo1?.sub ? `domoni6Sneeze`
                        : `>(`

        for (const chatroom of bot.channels) {
            bot.say(chatroom, `Oops, I just crashed! ${emote} ${err.message} ${location}`)
        }
        await logMessage([err.stack])
    },
    coinFlip() { return Math.floor(Math.random() * 2) },
    getContextEmote(type, channel) {
        const baseType = `${type}Emotes`
        const emotes = [...settings.baseEmotes[baseType]]

        if (channel === `jpegstripes` && !users[BOT_USERNAME]?.channels.jpegstripes?.sub) {
            if (type === `hype`) { emotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
            if (type === `positive`) { emotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
            if (type === `greeting`) { emotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
            if (type === `bye`) { emotes.push(`WhitneyVibe`) }
        }

        for (const member in lemonyFresh) {
            const stream = lemonyFresh[member]
            for (let i = stream.contextEmotes[baseType].length - 1; i >= 0; i--) {
                const emote = stream.contextEmotes[baseType][i]

                // If the context emote can be used
                if ((stream.followEmotes.includes(emote) && member === channel)
                    || (stream.followEmotes.includes(emote) && users[BOT_USERNAME]?.channels[member]?.sub)
                    || (stream.subEmotes.includes(emote) && users[BOT_USERNAME]?.channels[member]?.sub)
                    || (stream.bttvEmotes.includes(emote) && member === channel)
                    || settings.globalEmotes.twitch.includes(emote)
                    || settings.globalEmotes.bttv.includes(emote)) {
                    emotes.push(emote)
                }

                // If the context emote doesn't exist, remove it or rename (username/emote prefix change)
                if (!stream.followEmotes.includes(emote)
                    && !stream.subEmotes.includes(emote)
                    && !stream.bttvEmotes.includes(emote)
                    && !settings.globalEmotes.twitch.includes(emote)
                    && !settings.globalEmotes.bttv.includes(emote)) {
                    const prefix = findEmotePrefix(member)
                    const replacementEmotes = [...stream.followEmotes, ...stream.subEmotes].filter(el => new RegExp(`${el.split(prefix)[1]}$`).test(emote))
                    if (replacementEmotes.length === 1) {
                        stream.contextEmotes[baseType][i] = replacementEmotes[0]
                        logMessage([`-> Renaming ${member}'s emote '${emote}' to '${replacementEmotes[0]}' in ${baseType}`])
                    } else {
                        stream.contextEmotes[baseType].splice(i, 1)
                        logMessage([`-> Deleted ${member}'s unrecognized emote '${emote}' from ${baseType}`])
                    }
                }
            }
        }
        // logMessage([`> getContextEmote(type: '${type}', channel: '${channel}', emotes: ${logArr(emotes)})`])

        const emote = emotes[Math.floor(Math.random() * emotes.length)] || ``
        return emote
    },
    transformText(type, str) {
        let output = ``

        switch (type) {
            case `superscript`:
                for (const char of str) { char in superscriptTable ? output += superscriptTable[char] : output += char }
                break
            case `bold`:
                for (const char of str) { char in boldTable ? output += boldTable[char] : output += char }
                break
            case `italic`:
                for (const char of str) { char in italicTable ? output += italicTable[char] : output += char }
                break
            case `bold-italic`:
                for (const char of str) { char in boldItalicTable ? output += boldItalicTable[char] : output += char }
                break
            case `sans-normal`:
                for (const char of str) { char in sansSerifNormalTable ? output += sansSerifNormalTable[char] : output += char }
                break
            case `sans-bold`:
                for (const char of str) { char in sansSerifBoldTable ? output += sansSerifBoldTable[char] : output += char }
                break
            case `sans-italic`:
                for (const char of str) { char in sansSerifItalicTable ? output += sansSerifItalicTable[char] : output += char }
                break
            case `sans-bold-italic`:
                for (const char of str) { char in sansSerifBoldItalicTable ? output += sansSerifBoldItalicTable[char] : output += char }
                break
            case `script-normal`:
                for (const char of str) { char in scriptNormalTable ? output += scriptNormalTable[char] : output += char }
                break
            case `script-bold`:
                for (const char of str) { char in scriptBoldTable ? output += scriptBoldTable[char] : output += char }
                break
            case `fraktur-normal`:
                for (const char of str) { char in frakturNormalTable ? output += frakturNormalTable[char] : output += char }
                break
            case `fraktur-bold`:
                for (const char of str) { char in frakturBoldTable ? output += frakturBoldTable[char] : output += char }
                break
            case `monospace`:
                for (const char of str) { char in monospaceTable ? output += monospaceTable[char] : output += char }
                break
            case `doubleStruck`:
                for (const char of str) { char in doubleStruckTable ? output += doubleStruckTable[char] : output += char }
                break
            default:
                logMessage([`> Type '${type}' not recognized`])
        }

        return output
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
    arrToList(arr, conjunction = `and`) {
        return arr
            .map((element, idx) => idx !== 0 && idx + 1 === arr.length
                ? `${conjunction} ${element}`
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
            hangmanWins: 0,
            channels: {}
        }

        // Check if user ID already exists, and merge their data
        for (const oldUsername of Object.keys(users)) {
            if (users[newUsername].id === users[oldUsername].id && oldUsername !== newUsername) {
                logMessage([`-> Merging '${oldUsername}' (ID: ${users[oldUsername].id}) into '${newUsername}'`])
                users[newUsername] = {
                    ...users[oldUsername],
                    displayName: tags[`display-name`],
                    nickname: '',
                    color: tags.color || ``
                }
                bot.say(chatroom, `Wow, ${users[oldUsername].nickname || users[oldUsername].displayName} changed their name to ${users[newUsername].displayName}!`)
                delete users[oldUsername]

                // Update if user is a mod anywhere
                if (oldUsername in mods) {
                    logMessage([`-> Merging mod '${oldUsername}' into '${newUsername}'`])
                    mods[newUsername] = { ...mods[oldUsername] }
                    delete mods[oldUsername]
                }
                for (const mod in mods) {
                    if (mods[mod].isModIn.includes(`#${oldUsername}`)) {
                        logMessage([`-> Removing '#${oldUsername}' from ${mod}'s moderated channels`])
                        mods[mod].isModIn.splice(mods[mod].isModIn.indexOf(`#${oldUsername}`), 1)
                    }
                }

                // Update if bot is in also channel
                if (oldUsername in lemonyFresh) {
                    logMessage([`-> Merging channel '${oldUsername}' into '${newUsername}' and re-joining`])
                    lemonyFresh[newUsername] = { ...lemonyFresh[oldUsername] }
                    bot.part(`#${oldUsername}`)
                    delete lemonyFresh[oldUsername]
                    joinedChatrooms[joinedChatrooms.indexOf(oldUsername)] = newUsername
                    bot.join(`#${newUsername}`)

                    // Update potential channel data for all users
                    for (const user in users) {
                        if (oldUsername in users[user].channels) {
                            logMessage([`-> Merging user ${user}'s '${oldUsername}' data into '${newUsername}'`])
                            users[user].channels[newUsername] = { ...users[user].channels[oldUsername] }
                            delete users[user].channels[oldUsername]
                        }
                    }
                }

                // Rename any lemon command's origin channel
                for (const cmd in lemCmds) {
                    if (lemCmds[cmd].origin === oldUsername) {
                        logMessage([`-> Renaming lemon command ${cmd}'s origin to '${newUsername}'`])
                        lemCmds[cmd].origin = newUsername
                    }
                }
            }
        }
    },
    initUserChannel(tags, username, channel) {
        logMessage([`> initUserChannel(username: '${username}', channel: '${channel}')`])
        users[username].channels[channel] = {
            sub: tags.subscriber,
            mod: tags.mod,
            vip: !!tags.vip || !!tags.badges?.vip,
            away: false,
            awayMessage: ``,
            msgCount: 0,
            pyramidWord: ``,
            pyramidCount: 1,
            pyramidMaxCount: 0,
            pyramidAscending: true
        }
    },
    initChannel(channel) {
        logMessage([`> initChannel(channel: '${channel}')`])
        lemonyFresh[channel] = { ...lemonyFresh[channel] }
        lemonyFresh[channel].accessToken = lemonyFresh[channel].accessToken || mods[channel]?.accessToken || ``
        lemonyFresh[channel].refreshToken = lemonyFresh[channel].refreshToken || mods[channel]?.refreshToken || ``
        lemonyFresh[channel].subRaidMessage = lemonyFresh[channel].subRaidMessage || ``
        lemonyFresh[channel].noSubRaidMessage = lemonyFresh[channel].noSubRaidMessage || ``
        lemonyFresh[channel].followEmotes = lemonyFresh[channel].followEmotes || []
        lemonyFresh[channel].subEmotes = lemonyFresh[channel].subEmotes || []
        lemonyFresh[channel].bttvEmotes = lemonyFresh[channel].bttvEmotes || []
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
            ...lemonyFresh[channel].contextEmotes
        }
        lemonyFresh[channel].funnyCommands = lemonyFresh[channel].funnyCommands || []
        lemonyFresh[channel].redeems = lemonyFresh[channel].redeems || []
        lemonyFresh[channel].rollFunNumber = lemonyFresh[channel].rollFunNumber === undefined ? true : lemonyFresh[channel].rollFunNumber
        lemonyFresh[channel].funTimer = lemonyFresh[channel].funTimer === undefined ? 0 : lemonyFresh[channel].funTimer
        lemonyFresh[channel].funTimerGuesser = lemonyFresh[channel].funTimerGuesser === undefined ? `` : lemonyFresh[channel].funTimerGuesser
        lemonyFresh[channel].pollId = lemonyFresh[channel].pollId === undefined ? `` : lemonyFresh[channel].pollId
        lemonyFresh[channel].viewers = []
        lemonyFresh[channel].streakThreshold = lemonyFresh[channel].streakThreshold === undefined ? 3 : lemonyFresh[channel].streakThreshold
        lemonyFresh[channel].streamerEmoteStreakThreshold = lemonyFresh[channel].streamerEmoteStreakThreshold === undefined ? 4 : lemonyFresh[channel].streamerEmoteStreakThreshold
        lemonyFresh[channel].count = {
            name: ``,
            value: 0,
            ...lemonyFresh[channel].count
        }
        lemonyFresh[channel].list = lemonyFresh[channel].list || [``]
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
            'say-butt': { cooldown: 120, listening: true },
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
    resetCooldownTimer(channel, name) {
        const timer = lemonyFresh[channel].timers[name]
        logMessage([`> resetCooldownTimer(channel: '${channel}', timer: '${name}', cooldown: ${pluralize(timer.cooldown, `second`, `seconds`)})`])
        timer.listening = false
        clearTimeout(timer.timerId)
        timer.timerId = Number(setTimeout(() => {
            timer.listening = true
            logMessage([`-> Listening for '${name}' again!`])
        }, timer.cooldown * 1000))
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
    parseTargetByNickname(arr) {
        const nicknames = Object.fromEntries(
            Object.entries(users)
                .filter(arr => arr[1].nickname)
                .map(arr => {
                    return [[arr[1].nickname.toLowerCase()], arr[0]]
                })
        )
        for (const nickname in nicknames) {
            if (new RegExp(`^${nickname}$`, `i`).test(arr.join(` `))) {
                return users[nicknames[nickname]]
            }
        }
        return null
    },
    containsInaccessibleEmotes(str, channel) {
        const inaccessibleEmotes = Object.keys(lemonyFresh)
            .filter(stream => !users[BOT_USERNAME].channels[stream].sub)
            .map(stream => stream === channel
                ? [...lemonyFresh[stream].subEmotes]
                : [...lemonyFresh[stream].followEmotes, ...lemonyFresh[stream].subEmotes])
            .flat()
        if (inaccessibleEmotes.some(emote => str.includes(emote))) {
            logMessage([`> containsInaccessibleEmotes: ${logArr(inaccessibleEmotes.filter(emote => str.includes(emote)))}`])
            return true
        }
        return false
    },
    containsUnrecognizedEmotes(str) {
        if (emotePattern.test(str)) {
            const allEmotes = [
                ...Object.keys(lemonyFresh).map(channel => lemonyFresh[channel].followEmotes),
                ...Object.keys(lemonyFresh).map(channel => lemonyFresh[channel].subEmotes),
                ...Object.keys(lemonyFresh).map(channel => lemonyFresh[channel].bttvEmotes)
            ].flat()

            const unrecognizedEmotes = str
                .split(emotePattern)
                .filter((emote, idx) => !allEmotes.includes(emote) && (idx + 1) % 2 === 0)
                .filter((el, idx, self) => self.indexOf(el) === idx)

            if (unrecognizedEmotes.length) {
                logMessage([`> containsUnrecognizedEmotes: ${logArr(unrecognizedEmotes)}`])
                return true
            }
        }
        return false
    },
    appendLogs(chatroom, tags, msg, self, timeStamp, username, color) {
        const channel = chatroom.substring(1)
        const sharedChat = `source-room-id` in tags
        const isOriginChannel = sharedChat && tags[`room-id`] === tags[`source-room-id`]
        const sourceChannel = sharedChat
            ? Object.keys(lemonyFresh).filter(key => lemonyFresh[key].id && lemonyFresh[key].id === Number(tags[`source-room-id`]))[0]
            : null

        sharedChat
            ? isOriginChannel
                ? logMessage([msg], timeStamp, channel, username, color, self)
                : sourceChannel
                    ? logMessage([`${username}'s message also posted in ${channel}'s channel`])
                    : logMessage([msg], timeStamp, tags[`source-room-id`], username, color, self)
            : logMessage([msg], timeStamp, channel, username, color, self)
    },
    normalize(str) {
        return str
            .replace(/ᵃ|𝐚|𝑎|𝒂|𝖺|𝗮|𝘢|𝙖|𝒶|𝓪|𝔞|𝖆|𝚊|𝕒/g, `a`)
            .replace(/ᵇ|𝐛|𝑏|𝒃|𝖻|𝗯|𝘣|𝙗|𝒷|𝓫|𝔟|𝖇|𝚋|𝕓/g, `b`)
            .replace(/ᶜ|𝐜|𝑐|𝒄|𝖼|𝗰|𝘤|𝙘|𝒸|𝓬|𝔠|𝖈|𝚌|𝕔/g, `c`)
            .replace(/ᵈ|𝐝|𝑑|𝒅|𝖽|𝗱|𝘥|𝙙|𝒹|𝓭|𝔡|𝖉|𝚍|𝕕/g, `d`)
            .replace(/ᵉ|𝐞|𝑒|𝒆|𝖾|𝗲|𝘦|𝙚|ℯ|𝓮|𝔢|𝖊|𝚎|𝕖/g, `e`)
            .replace(/ᶠ|𝐟|𝑓|𝒇|𝖿|𝗳|𝘧|𝙛|𝒻|𝓯|𝔣|𝖋|𝚏|𝕗/g, `f`)
            .replace(/ᵍ|𝐠|𝑔|𝒈|𝗀|𝗴|𝘨|𝙜|ℊ|𝓰|𝔤|𝖌|𝚐|𝕘/g, `g`)
            .replace(/ʰ|𝐡|ℎ|𝒉|𝗁|𝗵|𝘩|𝙝|𝒽|𝓱|𝔥|𝖍|𝚑|𝕙/g, `h`)
            .replace(/ᶦ|𝐢|𝑖|𝒊|𝗂|𝗶|𝘪|𝙞|𝒾|𝓲|𝔦|𝖎|𝚒|𝕚/g, `i`)
            .replace(/ʲ|𝐣|𝑗|𝒋|𝗃|𝗷|𝘫|𝙟|𝒿|𝓳|𝔧|𝖏|𝚓|𝕛/g, `j`)
            .replace(/ᵏ|𝐤|𝑘|𝒌|𝗄|𝗸|𝘬|𝙠|𝓀|𝓴|𝔨|𝖐|𝚔|𝕜/g, `k`)
            .replace(/ˡ|𝐥|𝑙|𝒍|𝗅|𝗹|𝘭|𝙡|𝓁|𝓵|𝔩|𝖑|𝚕|𝕝/g, `l`)
            .replace(/ᵐ|𝐦|𝑚|𝒎|𝗆|𝗺|𝘮|𝙢|𝓂|𝓶|𝔪|𝖒|𝚖|𝕞/g, `m`)
            .replace(/ⁿ|𝐧|𝑛|𝒏|𝗇|𝗻|𝘯|𝙣|𝓃|𝓷|𝔫|𝖓|𝚗|𝕟/g, `n`)
            .replace(/ᵒ|𝐨|𝑜|𝒐|𝗈|𝗼|𝘰|𝙤|ℴ|𝓸|𝔬|𝖔|𝚘|𝕠/g, `o`)
            .replace(/ᵖ|𝐩|𝑝|𝒑|𝗉|𝗽|𝘱|𝙥|𝓅|𝓹|𝔭|𝖕|𝚙|𝕡/g, `p`)
            .replace(/ᑫ|𝐪|𝑞|𝒒|𝗊|𝗾|𝘲|𝙦|𝓆|𝓺|𝔮|𝖖|𝚚|𝕢/g, `q`)
            .replace(/ʳ|𝐫|𝑟|𝒓|𝗋|𝗿|𝘳|𝙧|𝓇|𝓻|𝔯|𝖗|𝚛|𝕣/g, `r`)
            .replace(/ˢ|𝐬|𝑠|𝒔|𝗌|𝘀|𝘴|𝙨|𝓈|𝓼|𝔰|𝖘|𝚜|𝕤/g, `s`)
            .replace(/ᵗ|𝐭|𝑡|𝒕|𝗍|𝘁|𝘵|𝙩|𝓉|𝓽|𝔱|𝖙|𝚝|𝕥/g, `t`)
            .replace(/ᵘ|𝐮|𝑢|𝒖|𝗎|𝘂|𝘶|𝙪|𝓊|𝓾|𝔲|𝖚|𝚞|𝕦/g, `u`)
            .replace(/ᵛ|𝐯|𝑣|𝒗|𝗏|𝘃|𝘷|𝙫|𝓋|𝓿|𝔳|𝖛|𝚟|𝕧/g, `v`)
            .replace(/ʷ|𝐰|𝑤|𝒘|𝗐|𝘄|𝘸|𝙬|𝓌|𝔀|𝔴|𝖜|𝚠|𝕨/g, `w`)
            .replace(/ˣ|𝐱|𝑥|𝒙|𝗑|𝘅|𝘹|𝙭|𝓍|𝔁|𝔵|𝖝|𝚡|𝕩/g, `x`)
            .replace(/ʸ|𝐲|𝑦|𝒚|𝗒|𝘆|𝘺|𝙮|𝓎|𝔂|𝔶|𝖞|𝚢|𝕪/g, `y`)
            .replace(/ᶻ|𝐳|𝑧|𝒛|𝗓|𝘇|𝘻|𝙯|𝓏|𝔃|𝔷|𝖟|𝚣|𝕫/g, `z`)
            .replace(/ᴬ|𝐀|𝐴|𝑨|𝖠|𝗔|𝘈|𝘼|𝒜|𝓐|𝔄|𝕬|𝙰|𝔸/g, `A`)
            .replace(/ᴮ|𝐁|𝐵|𝑩|𝖡|𝗕|𝘉|𝘽|ℬ|𝓑|𝔅|𝕭|𝙱|𝔹/g, `B`)
            .replace(/ᶜ|𝐂|𝐶|𝑪|𝖢|𝗖|𝘊|𝘾|𝒞|𝓒|ℭ|𝕮|𝙲|ℂ/g, `C`)
            .replace(/ᴰ|𝐃|𝐷|𝑫|𝖣|𝗗|𝘋|𝘿|𝒟|𝓓|𝔇|𝕯|𝙳|𝔻/g, `D`)
            .replace(/ᴱ|𝐄|𝐸|𝑬|𝖤|𝗘|𝘌|𝙀|ℰ|𝓔|𝔈|𝕰|𝙴|𝔼/g, `E`)
            .replace(/ᶠ|𝐅|𝐹|𝑭|𝖥|𝗙|𝘍|𝙁|ℱ|𝓕|𝔉|𝕱|𝙵|𝔽/g, `F`)
            .replace(/ᴳ|𝐆|𝐺|𝑮|𝖦|𝗚|𝘎|𝙂|𝒢|𝓖|𝔊|𝕲|𝙶|𝔾/g, `G`)
            .replace(/ᴴ|𝐇|𝐻|𝑯|𝖧|𝗛|𝘏|𝙃|ℋ|𝓗|ℌ|𝕳|𝙷|ℍ/g, `H`)
            .replace(/ᴵ|𝐈|𝐼|𝑰|𝖨|𝗜|𝘐|𝙄|ℐ|𝓘|ℑ|𝕴|𝙸|𝕀/g, `I`)
            .replace(/ᴶ|𝐉|𝐽|𝑱|𝖩|𝗝|𝘑|𝙅|𝒥|𝓙|𝔍|𝕵|𝙹|𝕁/g, `J`)
            .replace(/ᴷ|𝐊|𝐾|𝑲|𝖪|𝗞|𝘒|𝙆|𝒦|𝓚|𝔎|𝕶|𝙺|𝕂/g, `K`)
            .replace(/ᴸ|𝐋|𝐿|𝑳|𝖫|𝗟|𝘓|𝙇|ℒ|𝓛|𝔏|𝕷|𝙻|𝕃/g, `L`)
            .replace(/ᴹ|𝐌|𝑀|𝑴|𝖬|𝗠|𝘔|𝙈|ℳ|𝓜|𝔐|𝕸|𝙼|𝕄/g, `M`)
            .replace(/ᴺ|𝐍|𝑁|𝑵|𝖭|𝗡|𝘕|𝙉|𝒩|𝓝|𝔑|𝕹|𝙽|ℕ/g, `N`)
            .replace(/ᴼ|𝐎|𝑂|𝑶|𝖮|𝗢|𝘖|𝙊|𝒪|𝓞|𝔒|𝕺|𝙾|𝕆/g, `O`)
            .replace(/ᴾ|𝐏|𝑃|𝑷|𝖯|𝗣|𝘗|𝙋|𝒫|𝓟|𝔓|𝕻|𝙿|ℙ/g, `P`)
            .replace(/Q|𝐐|𝑄|𝑸|𝖰|𝗤|𝘘|𝙌|𝒬|𝓠|𝔔|𝕼|𝚀|ℚ/g, `Q`)
            .replace(/ᴿ|𝐑|𝑅|𝑹|𝖱|𝗥|𝘙|𝙍|ℛ|𝓡|ℜ|𝕽|𝚁|ℝ/g, `R`)
            .replace(/ˢ|𝐒|𝑆|𝑺|𝖲|𝗦|𝘚|𝙎|𝒮|𝓢|𝔖|𝕾|𝚂|𝕊/g, `S`)
            .replace(/ᵀ|𝐓|𝑇|𝑻|𝖳|𝗧|𝘛|𝙏|𝒯|𝓣|𝔗|𝕿|𝚃|𝕋/g, `T`)
            .replace(/ᵁ|𝐔|𝑈|𝑼|𝖴|𝗨|𝘜|𝙐|𝒰|𝓤|𝔘|𝖀|𝚄|𝕌/g, `U`)
            .replace(/ⱽ|𝐕|𝑉|𝑽|𝖵|𝗩|𝘝|𝙑|𝒱|𝓥|𝔙|𝖁|𝚅|𝕍/g, `V`)
            .replace(/ᵂ|𝐖|𝑊|𝑾|𝖶|𝗪|𝘞|𝙒|𝒲|𝓦|𝔚|𝖂|𝚆|𝕎/g, `W`)
            .replace(/ˣ|𝐗|𝑋|𝑿|𝖷|𝗫|𝘟|𝙓|𝒳|𝓧|𝔛|𝖃|𝚇|𝕏/g, `X`)
            .replace(/ʸ|𝐘|𝑌|𝒀|𝖸|𝗬|𝘠|𝙔|𝒴|𝓨|𝔜|𝖄|𝚈|𝕐/g, `Y`)
            .replace(/ᶻ|𝐙|𝑍|𝒁|𝖹|𝗭|𝘡|𝙕|𝒵|𝓩|ℨ|𝖅|𝚉|ℤ/g, `Z`)
    }
}
