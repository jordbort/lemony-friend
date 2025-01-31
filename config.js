const BOT_USERNAME = process.env.BOT_USERNAME

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
    '#0000FF': { name: `blue`, terminalColor: blueTxt },
    '#8A2BE2': { name: `blue-violet`, terminalColor: blueTxt },
    '#5F9EA0': { name: `cadet blue`, terminalColor: cyanTxt },
    '#D2691E': { name: `chocolate`, terminalColor: magentaTxt },
    '#FF7F50': { name: `coral`, terminalColor: magentaTxt },
    '#1E90FF': { name: `dodger blue`, terminalColor: cyanTxt },
    '#B22222': { name: `firebrick`, terminalColor: redTxt },
    '#DAA520': { name: `goldenrod`, terminalColor: yellowTxt },
    '#008000': { name: `green`, terminalColor: greenTxt },
    '#FF69B4': { name: `hot pink`, terminalColor: redTxt },
    '#FF4500': { name: `orange-red`, terminalColor: orangeTxt },
    '#FF0000': { name: `red`, terminalColor: redTxt },
    '#2E8B57': { name: `sea green`, terminalColor: greenTxt },
    '#00FF7F': { name: `spring green`, terminalColor: greenTxt },
    '#ADFF2F': { name: `yellow-green`, terminalColor: yellowTxt }
}

// Global settings
const settings = {
    debug: true,
    timeLocale: `en-US`,
    timeZone: `America/New_York`,
    startDate: new Date(),
    joinMessage: ``,
    highlightBotMessage: true,
    logTime: true,
    hideNonDevChannel: false,
    sayJoinMessage: true,
    sayPartMessage: true,
    firstConnection: true,
    realRPS: true,
    minWelcomeBackMinutes: 120,
    maxWelcomeBackMinutes: 640,
    funNumberCount: 25,
    funNumberTotal: 60,
    funTimerDuration: 1800000,
    streakThreshold: 3,
    streamerEmoteStreakThreshold: 4,
    hangmanSignupSeconds: 30,
    hangmanChances: 6,
    hangmanLemonThreshold: 2,
    chantCount: 8,
    chantEmote: `👏️`,
    pokeballQuantity: 15,
    maxCountdownDuration: 7200000,
    ignoredBots: [
        BOT_USERNAME,
        `blerp`,
        `buttsbot`,
        `commanderroot`,
        `creatisbot`,
        `fossabot`,
        `frostytoolsdotcom`,
        `kofistreambot`,
        `moobot`,
        `nightbot`,
        `ouvertbot`,
        `pokemoncommunitygame`,
        `rpgcommunitybot`,
        `sery_bot`,
        `songlistbot`,
        `soundalerts`,
        `sport_scores_bot`,
        `streamelements`,
        `streamlabs`,
        `tangiabot`,
        `thetarashark`,
        `ttsmonster`,
        `undertalebot`,
        `uwu_twanswator`,
        `wizebot`
    ],
    baseEmotes: {
        lemonEmotes: [
            `🍋️`
        ],
        neutralEmotes: [
            `:)`
        ],
        hypeEmotes: [
            `:D`
        ],
        positiveEmotes: [
            `:)`
        ],
        upsetEmotes: [
            `>(`,
            `:(`
        ],
        negativeEmotes: [
            `:(`,
            `:O`
        ],
        greetingEmotes: [
            `HeyGuys`,
            `<3`,
            `FishMoley`
        ],
        byeEmotes: [
            `HeyGuys`,
            `<3`
        ],
        dumbEmotes: [
            `:p`
        ]
    },
    globalEmotes: {
        twitch: [
            `4Head`,
            `8-)`,
            `:(`,
            `:)`,
            `:-(`,
            `:-)`,
            `:-/`,
            `:-D`,
            `:-O`,
            `:-P`,
            `:-Z`,
            `:-\\`,
            `:-o`,
            `:-p`,
            `:-z`,
            `:-|`,
            `:/`,
            `:D`,
            `:O`,
            `:P`,
            `:Z`,
            `:\\`,
            `:o`,
            `:p`,
            `:z`,
            `:|`,
            `;)`,
            `;-)`,
            `;-P`,
            `;-p`,
            `;P`,
            `;p`,
            `<3`,
            `>(`,
            `ANELE`,
            `AmbessaLove`,
            `AndalusianCrush`,
            `AnotherRecord`,
            `ArgieB8`,
            `ArsonNoSexy`,
            `AsexualPride`,
            `AsianGlow`,
            `B)`,
            `B-)`,
            `BCWarrior`,
            `BOP`,
            `BabyRage`,
            `BangbooBounce`,
            `BatChest`,
            `BegWan`,
            `BigBrother`,
            `BigPhish`,
            `BigSad`,
            `BisexualPride`,
            `BlackLivesMatter`,
            `BlargNaut`,
            `BloodTrail`,
            `BrainSlug`,
            `BratChat`,
            `BrokeBack`,
            `BuddhaBar`,
            `CaitThinking`,
            `CaitlynS`,
            `CarlSmile`,
            `CerberusDog`,
            `ChefFrank`,
            `ChewyYAY`,
            `Cinheimer`,
            `CoolCat`,
            `CoolStoryBob`,
            `CorgiDerp`,
            `CrreamAwk`,
            `CurseLit`,
            `DAESuppy`,
            `DBstyle`,
            `DansGame`,
            `DarkKnight`,
            `DarkMode`,
            `DatSheffy`,
            `DendiFace`,
            `DinoDance`,
            `DogFace`,
            `DoritosChip`,
            `DxCat`,
            `EarthDay`,
            `EkkoChest`,
            `EleGiggle`,
            `EntropyWins`,
            `ExtraLife`,
            `FBBlock`,
            `FBCatch`,
            `FBChallenge`,
            `FBPass`,
            `FBPenalty`,
            `FBRun`,
            `FBSpiral`,
            `FBtouchdown`,
            `FUNgineer`,
            `FailFish`,
            `FallCry`,
            `FallHalp`,
            `FallWinning`,
            `FamilyMan`,
            `FeelsVi`,
            `FlawlessVictory`,
            `FootBall`,
            `FootGoal`,
            `FootYellow`,
            `ForSigmar`,
            `FrankerZ`,
            `FreakinStinkin`,
            `FutureMan`,
            `GRASSLORD`,
            `GayPride`,
            `GenderFluidPride`,
            `Getcamped`,
            `GingerPower`,
            `GivePLZ`,
            `GlitchCat`,
            `GlitchLit`,
            `GlitchNRG`,
            `GoatEmotey`,
            `GoldPLZ`,
            `GrammarKing`,
            `GunRun`,
            `HSCheers`,
            `HSWP`,
            `HarleyWink`,
            `HassaanChop`,
            `HeyGuys`,
            `HolidayCookie`,
            `HolidayLog`,
            `HolidayPresent`,
            `HolidaySanta`,
            `HolidayTree`,
            `HotPokket`,
            `HungryPaimon`,
            `ImTyping`,
            `IntersexPride`,
            `InuyoFace`,
            `ItsBoshyTime`,
            `JKanStyle`,
            `Jebaited`,
            `Jebasted`,
            `JinxLUL`,
            `JonCarnage`,
            `KAPOW`,
            `KEKHeim`,
            `Kappa`,
            `KappaClaus`,
            `KappaPride`,
            `KappaRoss`,
            `KappaWealth`,
            `Kappu`,
            `Keepo`,
            `KevinTurtle`,
            `KingWorldCup`,
            `Kippa`,
            `KomodoHype`,
            `KonCha`,
            `Kreygasm`,
            `LUL`,
            `LaundryBasket`,
            `Lechonk`,
            `LesbianPride`,
            `LionOfYara`,
            `MVGame`,
            `Mau5`,
            `MaxLOL`,
            `MechaRobot`,
            `MercyWing1`,
            `MercyWing2`,
            `MikeHogu`,
            `MingLee`,
            `ModLove`,
            `MorphinTime`,
            `MrDestructoid`,
            `MyAvatar`,
            `NewRecord`,
            `NiceTry`,
            `NinjaGrumpy`,
            `NomNom`,
            `NonbinaryPride`,
            `NotATK`,
            `NotLikeThis`,
            `O.O`,
            `O.o`,
            `OSFrog`,
            `O_O`,
            `O_o`,
            `OhMyDog`,
            `OneHand`,
            `OpieOP`,
            `OptimizePrime`,
            `PJSalt`,
            `PJSugar`,
            `PMSTwin`,
            `PRChase`,
            `PanicVis`,
            `PansexualPride`,
            `PartyHat`,
            `PartyTime`,
            `PeoplesChamp`,
            `PermaSmug`,
            `PicoMause`,
            `PikaRamen`,
            `PinkMercy`,
            `PipeHype`,
            `PixelBob`,
            `PizzaTime`,
            `PogBones`,
            `PogChamp`,
            `Poooound`,
            `PopCorn`,
            `PopGhost`,
            `PopNemo`,
            `PoroSad`,
            `PotFriend`,
            `PowerUpL`,
            `PowerUpR`,
            `PraiseIt`,
            `PrimeMe`,
            `PunOko`,
            `PunchTrees`,
            `R)`,
            `R-)`,
            `RaccAttack`,
            `RalpherZ`,
            `RedCoat`,
            `ResidentSleeper`,
            `RitzMitz`,
            `RlyTho`,
            `RuleFive`,
            `RyuChamp`,
            `SMOrc`,
            `SSSsss`,
            `SUBprise`,
            `SUBtember`,
            `SabaPing`,
            `SeemsGood`,
            `SeriousSloth`,
            `ShadyLulu`,
            `ShazBotstix`,
            `Shush`,
            `SingsMic`,
            `SingsNote`,
            `SmoocherZ`,
            `SoBayed`,
            `SoonerLater`,
            `Squid1`,
            `Squid2`,
            `Squid3`,
            `Squid4`,
            `StinkyCheese`,
            `StinkyGlitch`,
            `StoneLightning`,
            `StrawBeary`,
            `SuperVinlin`,
            `SwiftRage`,
            `TBAngel`,
            `TF2John`,
            `TPFufun`,
            `TPcrunchyroll`,
            `TTours`,
            `TWITH`,
            `TakeNRG`,
            `TearGlove`,
            `TehePelo`,
            `ThankEgg`,
            `TheIlluminati`,
            `TheRinger`,
            `TheTarFu`,
            `TheThing`,
            `ThunBeast`,
            `TinyFace`,
            `TombRaid`,
            `TooSpicy`,
            `TransgenderPride`,
            `TriHard`,
            `TwitchConHYPE`,
            `TwitchLit`,
            `TwitchRPG`,
            `TwitchSings`,
            `TwitchUnity`,
            `TwitchVotes`,
            `UWot`,
            `UnSane`,
            `UncleNox`,
            `VirtualHug`,
            `VoHiYo`,
            `VoteNay`,
            `VoteYea`,
            `WTRuck`,
            `WholeWheat`,
            `WhySoSerious`,
            `WutFace`,
            `YouDontSay`,
            `YouWHY`,
            `bleedPurple`,
            `cmonBruh`,
            `copyThis`,
            `duDudu`,
            `imGlitch`,
            `mcaT`,
            `o.O`,
            `o.o`,
            `o_O`,
            `o_o`,
            `panicBasket`,
            `pastaThat`,
            `riPepperonis`,
            `twitchRaid`
        ],
        bttv: [
            `:tf:`,
            `AngelThump`,
            `BroBalt`,
            `CandianRage`,
            `ConcernDoge`,
            `CruW`,
            `D:`,
            `DatSauce`,
            `DogChamp`,
            `DuckerZ`,
            `FeelsAmazingMan`,
            `FeelsBadMan`,
            `FeelsBirthdayMan`,
            `FeelsGoodMan`,
            `FeelsPumpkinMan`,
            `FeelsSnowMan`,
            `FeelsSnowyMan`,
            `FireSpeed`,
            `FishMoley`,
            `ForeverAlone`,
            `GabeN`,
            `HailHelix`,
            `Hhhehehe`,
            `KKona`,
            `KaRappa`,
            `KappaCool`,
            `LuL`,
            `M&Mjc`,
            `NaM`,
            `PoleDoge`,
            `RarePepe`,
            `RonSmug`,
            `SaltyCorn`,
            `ShoopDaWhoop`,
            `SourPls`,
            `SqShy`,
            `TaxiBro`,
            `TwaT`,
            `VapeNation`,
            `VisLaud`,
            `WatChuSay`,
            `Wowee`,
            `WubTF`,
            `ariW`,
            `bUrself`,
            `bttvNice`,
            `cvHazmat`,
            `cvL`,
            `cvMask`,
            `cvR`,
            `haHAA`,
            `monkaS`,
            `notsquishY`,
            `sosGame`,
            `tehPoleCat`,
            `c!`,
            `h!`,
            `l!`,
            `p!`,
            `r!`,
            `s!`,
            `v!`,
            `w!`,
            `z!`
        ]
    },
    botMood: `happy`,
    autoBan: [
        `I want to offer promotion of your channel`,
        `onlyfans`,
        `viewers on`
    ]
}

const wordBank = {
    verbs: [],
    nouns: [],
    adjectives: []
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
    wordBank
}
