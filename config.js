// Terminal colors
const resetTxt = `\x1b[0m`
const boldTxt = `\x1b[1m`
const underlined = `\x1b[4m`
const inverted = `\x1b[7m`

const blackTxt = `\x1b[30m`
const redTxt = `\x1b[31m`
const greenTxt = `\x1b[32m`
const yellowTxt = `\x1b[33m`
const blueTxt = `\x1b[34m`
const magentaTxt = `\x1b[35m`
const cyanTxt = `\x1b[36m`
const whiteTxt = `\x1b[37m`
const grayTxt = `\x1b[90m`
const orangeTxt = `\x1b[38;5;208m`

const blackBg = `\x1b[40m`
const redBg = `\x1b[41m`
const greenBg = `\x1b[42m`
const yellowBg = `\x1b[43m`
const blueBg = `\x1b[44m`
const magentaBg = `\x1b[45m`
const cyanBg = `\x1b[46m`
const whiteBg = `\x1b[47m`
const grayBg = `\x1b[100m`
const orangeBg = `\x1b[48;2;255;164;0m`

// Twitch color names and terminal color references
const chatColors = {
    "#0000FF": { name: "blue", terminalColor: blueTxt },
    "#8A2BE2": { name: "blue-violet", terminalColor: blueTxt },
    "#5F9EA0": { name: "cadet blue", terminalColor: cyanTxt },
    "#D2691E": { name: "chocolate", terminalColor: magentaTxt },
    "#FF7F50": { name: "coral", terminalColor: magentaTxt },
    "#1E90FF": { name: "dodger blue", terminalColor: cyanTxt },
    "#B22222": { name: "firebrick", terminalColor: redTxt },
    "#DAA520": { name: "goldenrod", terminalColor: yellowTxt },
    "#008000": { name: "green", terminalColor: greenTxt },
    "#FF69B4": { name: "hot pink", terminalColor: redTxt },
    "#FF4500": { name: "orange-red", terminalColor: orangeTxt },
    "#FF0000": { name: "red", terminalColor: redTxt },
    "#2E8B57": { name: "sea green", terminalColor: greenTxt },
    "#00FF7F": { name: "spring green", terminalColor: greenTxt },
    "#ADFF2F": { name: "yellow-green", terminalColor: yellowTxt }
}

// Global settings
const settings = {
    debug: true,
    timeLocale: `en-US`,
    timeZone: { timeZone: `America/New_York` },
    firstConnection: true,
    sayOnlineMsg: true,
    funNumberCount: 25,
    funNumberTotal: 50,
    funTimerDuration: 1800000,
    listening: true,
    streakThreshold: 3,
    emoteStreakThreshold: 4,
    hangmanSignupSeconds: 30,
    hangmanChances: 6,
    chantCount: 8,
    chantEmote: `👏️`
}

module.exports = {
    resetTxt,
    boldTxt,
    underlined,
    inverted,
    blackTxt,
    redTxt,
    greenTxt,
    yellowTxt,
    blueTxt,
    magentaTxt,
    cyanTxt,
    whiteTxt,
    grayTxt,
    orangeTxt,
    blackBg,
    redBg,
    greenBg,
    yellowBg,
    blueBg,
    magentaBg,
    cyanBg,
    whiteBg,
    grayBg,
    orangeBg,
    chatColors,
    settings
}
