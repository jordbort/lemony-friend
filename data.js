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

const lemonyFresh = {
    channels: [
        `#jpegstripes`,
        `#sclarf`,
        `#e1ectroma`,
        `#domonintendo1`,
        `#ppuyya`
    ],
    botAccessToken: BOT_ACCESS_TOKEN,
    jpegstripes: {
        id: 70624062,
        accessToken: JPEGSTRIPES_ACCESS_TOKEN,
        refreshToken: JPEGSTRIPES_REFRESH_TOKEN,
        pollId: ``,
        emotes: [
            `jpegstCoin`,
            `jpegstTimber`,
            `jpegstGeno`,
            `jpegstKylePls`,
            `jpegstBamJAM`,
            `jpegstLucky`,
            `jpegstKetchup`,
            `jpegstJulian`,
            `jpegstScoot`,
            `jpegstWhitney`,
            `jpegstApollo`,
            `jpegstHeyGuys`,
            `jpegstKylePog`,
            `jpegstSpamton`,
            `jpegstJPEG`,
            `jpegstRAID`,
            `jpegstYes`,
            `jpegstNo`,
            `jpegstOkay`,
            `jpegstChrome`,
            `jpegstBroken`,
            `jpegstSlay`,
            `jpegstTapeEnd`,
            `jpegstBlank`,
            `jpegstDog`,
            `jpegstBonk`,
            `jpegstMegamind`
        ],
        redeems: [
            `!bigshot`,
            `!keygen`,
            `!spotion`,
            `!thebigone`,
            `!bowtie`,
            `!neo`,
            `!workout`,
            `!suscr1ber`,
            `!mario`,
            `!piano`,
            `!slip`,
            `!hamster`,
            `!alarm`,
            `!waste`,
            `!25k`,
            `!crabrave`,
            `!confusion`,
            `!soulja`,
            `!breakdance`,
            `!gigachad`,
            `!4d3d3d3`,
            `!feedcat`,
            `!polarbear`,
            `!graph`,
            `!checkmate`,
            `!shutup`,
            `!doggo`,
            `!marshmallows`,
            `!chocotaco`,
            `!rat`,
            `!hamburger`,
            `!chickendance`,
            `!come`,
            `!gauntlet`,
            `!princess`,
            `!rubbermaid`,
            `!peachsyrup`,
            `!skype`,
            `!ohhimark`,
            `!dripgoku`,
            `!gelatin`,
            `!cheesecake`,
            `!fancam`,
            `!nicecock`,
            `!lieblingsfach`,
            `!lavish`,
            `!shootme`,
            `!disk`,
            `!flagranterror`,
            `!technology`,
            `!bingchilling`,
            `!flagranterror`,
            `!litlizards`,
            `!raccoon`,
            `!gay`,
            `!turbomaxwaste`,
            `!where`
        ],
        hangman: {
            listening: false,
            signup: false,
            answer: ``,
            spaces: [],
            players: [],
            guessedLetters: [],
            chances: 6,
            currentPlayer: 0
        },
        riddle: {
            question: ``,
            answer: ``
        }
    },
    sclarf: {
        id: 108504232,
        accessToken: SCLARF_ACCESS_TOKEN,
        refreshToken: SCLARF_REFRESH_TOKEN,
        pollId: ``,
        emotes: [
            `sclarfRave`,
            `sclarfWobble`,
            `sclarfBark`,
            `sclarfSpin`,
            `sclarfPls`,
            `sclarfMad`,
            `sclarfHuh`,
            `sclarfHowdy`,
            `sclarfDog`,
            `sclarfAmazed`,
            `sclarfBlind`,
            `sclarfPalm`,
            `sclarfDead`,
            `sclarfSophisticated`,
            `sclarfLUL`,
            `sclarfHiss`,
            `sclarfHearts`,
            `sclarfDEEP`,
            `sclarfWave`,
            `sclarfSleep`
        ],
        redeems: [],
        hangman: {
            listening: false,
            signup: false,
            answer: ``,
            spaces: [],
            players: [],
            guessedLetters: [],
            chances: 6,
            currentPlayer: 0
        },
        riddle: {
            question: ``,
            answer: ``
        }
    },
    e1ectroma: {
        id: 467062147,
        accessToken: E1ECTROMA_ACCESS_TOKEN,
        refreshToken: E1ECTROMA_REFRESH_TOKEN,
        pollId: ``,
        emotes: [
            `e1ectr4Lfg`,
            `e1ectr4Pikadance`,
            `e1ectr4Tromadance`,
            `e1ectr4Coop`,
            `e1ectr4Ocha`,
            `e1ectr4Hello`,
            `e1ectr4Hi`,
            `e1ectr4Bye`,
            `e1ectr4Laugh`,
            `e1ectr4Wazzah`,
            `e1ectr4Smile`,
            `e1ectr4Devil`,
            `e1ectr4Ram`,
            `e1ectr4Salute`,
            `e1ectr4Lemfresh`,
            `e1ectr4Moses`,
            `e1ectr4Josie`,
            `e1ectr4Malort`,
            `e1ectr4Kim`
        ],
        redeems: [
            `!winner`,
            `!soda`,
            `!pipe`,
            `!nope`,
            `!nice`,
            `!n64`,
            `!bork`,
            `!maxwell`
        ],
        hangman: {
            listening: false,
            signup: false,
            answer: ``,
            spaces: [],
            players: [],
            guessedLetters: [],
            chances: 6,
            currentPlayer: 0
        },
        riddle: {
            question: ``,
            answer: ``
        }
    },
    domonintendo1: {
        id: 100792658,
        accessToken: DOMONINTENDO1_ACCESS_TOKEN,
        refreshToken: DOMONINTENDO1_REFRESH_TOKEN,
        pollId: ``,
        emotes: [
            `domoni6Really`,
            `domoni6Bingo`,
            `domoni6ChefHey`,
            `domoni6MeincSus`,
            `domoni6Sneeze`,
            `domoni6Dum`,
            `domoni6Love`,
            `domoni6Boom`,
            `domoni6Kek`,
            `domoni6Mingo`
        ],
        redeems: [],
        hangman: {
            listening: false,
            signup: false,
            answer: ``,
            spaces: [],
            players: [],
            guessedLetters: [],
            chances: 6,
            currentPlayer: 0
        },
        riddle: {
            question: ``,
            answer: ``
        }
    },
    ppuyya: {
        id: 500904880,
        accessToken: PPUYYA_ACCESS_TOKEN,
        refreshToken: PPUYYA_REFRESH_TOKEN,
        pollId: ``,
        emotes: [],
        redeems: [],
        hangman: {
            listening: false,
            signup: false,
            answer: ``,
            spaces: [],
            players: [],
            guessedLetters: [],
            chances: 6,
            currentPlayer: 0
        },
        riddle: {
            question: ``,
            answer: ``
        }
    }
}

const users = {}

const tempCmds = {}

module.exports = {
    lemonyFresh,
    users,
    tempCmds
}
