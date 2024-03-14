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
    startTime: new Date().toLocaleString(`en-US`, { timeZone: `America/New_York` }),
    firstConnection: true,
    sayOnlineMsg: true,
    funNumberCount: 25,
    funNumberTotal: 50,
    funTimerDuration: 1800000,
    streakThreshold: 3,
    emoteStreakThreshold: 4,
    hangmanSignupSeconds: 30,
    hangmanChances: 6,
    chantCount: 8,
    chantEmote: `👏️`
}

const timers = {
    'streak': {
        cooldown: 30000,
        listening: true
    },
    'data': {
        cooldown: 0,
        listening: true
    },
    'tags': {
        cooldown: 0,
        listening: true
    },
    'cli': {
        cooldown: 0,
        listening: true
    },
    'test': {
        cooldown: 0,
        listening: true
    },
    '!test': {
        cooldown: 0,
        listening: true
    },
    '!forget': {
        cooldown: 0,
        listening: true
    },
    '!docs': {
        cooldown: 0,
        listening: true
    },
    '!commands': {
        cooldown: 0,
        listening: true
    },
    '!so': {
        cooldown: 1000,
        listening: true
    },
    '!token': {
        cooldown: 5000,
        listening: true
    },
    '!validate': {
        cooldown: 5000,
        listening: true
    },
    '!refresh': {
        cooldown: 0,
        listening: true
    },
    '!announce': {
        cooldown: 0,
        listening: true
    },
    '!poll': {
        cooldown: 0,
        listening: true
    },
    '!endpoll': {
        cooldown: 0,
        listening: true
    },
    '!cancelpoll': {
        cooldown: 0,
        listening: true
    },
    '!stoppoll': {
        cooldown: 0,
        listening: true
    },
    '!access': {
        cooldown: 0,
        listening: true
    },
    '!authorize': {
        cooldown: 0,
        listening: true
    },
    '!time': {
        cooldown: 0,
        listening: true
    },
    '!chant': {
        cooldown: 0,
        listening: true
    },
    '!hangman': {
        cooldown: 0,
        listening: true
    },
    '!play': {
        cooldown: 0,
        listening: true
    },
    '!define': {
        cooldown: 0,
        listening: true
    },
    '!define': {
        cooldown: 0,
        listening: true
    },
    '!riddle': {
        cooldown: 0,
        listening: true
    },
    '!answer': {
        cooldown: 0,
        listening: true
    },
    '!raid': {
        cooldown: 0,
        listening: true
    },
    '!rps': {
        cooldown: 0,
        listening: true
    },
    '!mystats': {
        cooldown: 0,
        listening: true
    },
    '!subs': {
        cooldown: 0,
        listening: true
    },
    '!debug': {
        cooldown: 0,
        listening: true
    },
    '!lastmsg': {
        cooldown: 0,
        listening: true
    },
    '!msgcount': {
        cooldown: 0,
        listening: true
    },
    '!yell': {
        cooldown: 0,
        listening: true
    },
    '!friend': {
        cooldown: 0,
        listening: true
    },
    '!lemon': {
        cooldown: 0,
        listening: true
    },
    '!uselemon': {
        cooldown: 0,
        listening: true
    },
    '!lemonify': {
        cooldown: 0,
        listening: true
    },
    '!goal': {
        cooldown: 0,
        listening: true
    },
    '!color': {
        cooldown: 0,
        listening: true
    },
    '!dadjoke': {
        cooldown: 0,
        listening: true
    },
    '!pokemon': {
        cooldown: 0,
        listening: true
    },
    '!lurk': {
        cooldown: 0,
        listening: true
    },
    'new-chatter': {
        cooldown: 0,
        listening: true
    },
    'greet': {
        cooldown: 0,
        listening: true
    },
    'mass-greet': {
        cooldown: 0,
        listening: true
    },
    'greet-all': {
        cooldown: 0,
        listening: true
    },
    'say-goodnight': {
        cooldown: 0,
        listening: true
    },
    'say-youre-welcome': {
        cooldown: 0,
        listening: true
    },
    'say-thanks': {
        cooldown: 0,
        listening: true
    }
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
    settings,
    timers
}
