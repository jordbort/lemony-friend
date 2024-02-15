const BOT_USERNAME = process.env.BOT_USERNAME

// Import data
const { users } = require(`./data`)

function getLemonEmote() { return users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Lemfresh` : `🍋️` }

function getHypeEmote(channel) {
    const hypeEmotes = [`:D`]
    if (channel === `jpegstripes`) { hypeEmotes.push(`(ditto)`, `bongoTap`, `catJAM`, `CherryStomp`, `Clap`, `diddyJAM`, `HYPERCHOP`, `KongDance`, `KyleFestivale`, `MitziJump`, `PartyKirby`, `popCat`, `raccPls`, `racJam`, `ratJAM`, `DogChamp`) }
    if (channel === `jpegstripes` && !users[BOT_USERNAME]?.jpegstripes?.sub) { hypeEmotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
    if (channel === `sclarf`) { hypeEmotes.push(`(ditto)`, `batJAM`, `BoneZone`, `bongoTap`, `catJAM`, `Clap`, `EZ`, `GIGACHAD`, `gorgHAIP`, `hypeE`, `MorshuPls`, `NODDERS`, `OOOO`) }
    if (channel === `e1ectroma`) { hypeEmotes.push(`AlienPls`, `BlobDance`, `BoneZone`, `bongoTap`, `catJAM`, `chikaYo`, `Clap`, `dekuHYPE`, `PokemonTrainer`, `popCat`, `RareChar`, `ratJAM`, `ricardoFlick`, `WeSmart`) }
    if (channel === `domonintendo1`) { hypeEmotes.push(`catJAM`, `ChristmasCatJam`, `ChristmasPartyKirby`, `Drake`, `gachiHYPER`, `GIGACHAD`, `HYPERS`, `NODDERS`, `pepeD`, `pepeDS`, `pepeSanta`, `POGGERS`, `ricardoFlick`, `WeSmart`) }

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { hypeEmotes.push(`jpegstCoin`, `jpegstGeno`, `jpegstKylePls`, `jpegstBamJAM`, `jpegstLucky`, `jpegstKetchup`, `jpegstJulian`, `jpegstScoot`, `jpegstWhitney`, `jpegstApollo`, `jpegstKylePog`, `jpegstYes`, `jpegstSlay`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { hypeEmotes.push(`sclarfRave`, `sclarfWobble`, `sclarfBark`, `sclarfSpin`, `sclarfPls`, `sclarfAmazed`, `sclarfHearts`, `sclarfDEEP`, `sclarfYay`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { hypeEmotes.push(`e1ectr4Lfg`, `e1ectr4Pikadance`, `e1ectr4Tromadance`, `e1ectr4Coop`, `e1ectr4Ocha`, `e1ectr4Smile`, `e1ectr4Salute`, `e1ectr4Lemfresh`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { hypeEmotes.push(`domoni6Bingo`, `domoni6Love`, `domoni6Mingo`) }

    const hypeEmote = hypeEmotes[Math.floor(Math.random() * hypeEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getHypeEmote(channel: '${channel}') => '${hypeEmote}'), choices:${resetTxt}`, hypeEmotes.length) }
    return hypeEmote
}

function getPositiveEmote(channel) {
    const positiveEmotes = [`:)`, `SeemsGood`]
    if (channel === `jpegstripes`) { positiveEmotes.push(`CherryStomp`) }
    if (channel === `jpegstripes` && !users[BOT_USERNAME]?.jpegstripes?.sub) { positiveEmotes.push(`ApolloFly`, `BamJAM`, `KetchupWave`, `KyleSwish`, `LuckySway`, `WhitneyVibe`) }
    if (channel === `sclarf`) { positiveEmotes.push(`(ditto)`, `NODDERS`) }
    if (channel === `e1ectroma`) { positiveEmotes.push(`AlienPls`, `PokeMon`, `PokemonTrainer`, `RareChar`) }
    if (channel === `domonintendo1`) { positiveEmotes.push(`HYPERS`, `NODDERS`, `PepoChristmas`) }

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { positiveEmotes.push(`jpegstGeno`, `jpegstKylePls`, `jpegstBamJAM`, `jpegstLucky`, `jpegstKetchup`, `jpegstWhitney`, `jpegstApollo`, `jpegstYes`, `jpegstDog`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { positiveEmotes.push(`sclarfDog`, `sclarfHearts`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { positiveEmotes.push(`e1ectr4Pikadance`, `e1ectr4Coop`, `e1ectr4Smile`, `e1ectr4Salute`, `e1ectr4Lemfresh`, `e1ectr4Moses`, `e1ectr4Josie`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { positiveEmotes.push(`domoni6Bingo`, `domoni6Mingo`) }

    const positiveEmote = positiveEmotes[Math.floor(Math.random() * positiveEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getPositiveEmote(channel: '${channel}') => '${positiveEmote}'), choices:${resetTxt}`, positiveEmotes.length) }
    return positiveEmote
}

function getUpsetEmote(channel) {
    const upsetEmotes = [`>(`, `:(`]
    if (channel === `jpegstripes`) { upsetEmotes.push(`BowserRAGE`) }
    if (channel === `sclarf`) { upsetEmotes.push(`Madge`, `NOOO`, `NOPERS`) }
    if (channel === `e1ectroma`) { upsetEmotes.push(`pikaO`, `pressF`, `sadCat`) }
    if (channel === `domonintendo1`) { upsetEmotes.push(`coffinPLZ`, `monkaX`, `sadCat`, `tenseSmash`) }

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { upsetEmotes.push(`jpegstKylePog`, `jpegstNo`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { upsetEmotes.push(`sclarfMad`, `sclarfPalm`, `sclarfDead`, `sclarfHiss`, `sclarfD8`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { upsetEmotes.push(`e1ectr4Devil`, `e1ectr4Heat`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { upsetEmotes.push(`domoni6Sneeze`, `domoni6Dum`) }

    const upsetEmote = upsetEmotes[Math.floor(Math.random() * upsetEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getUpsetEmote(channel: '${channel}') => '${sadEmote}'), choices:${resetTxt}`, upsetEmotes.length) }
    return upsetEmote
}

function getNegativeEmote(channel) {
    const negativeEmotes = [`:(`, `:O`]
    if (channel === `jpegstripes`) { negativeEmotes.push(`modCheck`) }
    if (channel === `sclarf`) { negativeEmotes.push(`NOOO`, `NOPERS`) }
    if (channel === `e1ectroma`) { negativeEmotes.push(`pikaO`, `pressF`, `sadCat`) }
    if (channel === `domonintendo1`) { negativeEmotes.push(`sadCat`, `tenseSmash`) }

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { negativeEmotes.push(`jpegstNo`, `jpegstBroken`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { negativeEmotes.push(`sclarfBlind`, `sclarfDead`, `sclarfHiss`, `sclarfD8`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { negativeEmotes.push(`e1ectr4Devil`, `e1ectr4Heat`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { negativeEmotes.push(`domoni6Sneeze`, `domoni6Dum`) }

    const negativeEmote = negativeEmotes[Math.floor(Math.random() * negativeEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getNegativeEmote(channel: '${channel}') => '${negativeEmote}'), choices:${resetTxt}`, negativeEmotes.length) }
    return negativeEmote
}

function getGreetingEmote(channel) {
    const greetingEmotes = [`HeyGuys`, `<3`, `FishMoley`]
    if (channel === `jpegstripes`) { greetingEmotes.push(`(ditto)`, `bongoTap`, `CherryStomp`, `diddyJAM`, `HYPERCHOP`, `KongDance`, `KyleFestivale`, `MitziJump`, `PartyKirby`, `popCat`, `raccPls`, `racJam`, `ratJAM`, `VillagerTimber`) }
    if (channel === `jpegstripes` && !users[BOT_USERNAME]?.jpegstripes?.sub) { greetingEmotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
    if (channel === `sclarf`) { greetingEmotes.push(`(ditto)`, `BoneZone`, `bongoTap`, `BOOBA`, `catKISS`, `EZ`, `GIGACHAD`, `jesusBeBallin`, `LICKA`, `MEOW`, `OOOO`, `peepoShy`) }
    if (channel === `e1ectroma`) { greetingEmotes.push(`AlienPls`, `BlobDance`, `BoneZone`, `bongoTap`, `chikaYo`, `dekuHYPE`, `PokeMon`, `PokemonTrainer`, `popCat`, `RareChar`, `ricardoFlick`) }
    if (channel === `domonintendo1`) { greetingEmotes.push(`ChristmasCatJam`, `ChristmasPartyKirby`, `gachiHYPER`, `GIGACHAD`, `HYPERS`, `pepeD`, `pepeDS`, `pepeSanta`, `PepoChristmas`, `POGGERS`, `ricardoFlick`) }

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { greetingEmotes.push(`jpegstCoin`, `jpegstTimber`, `jpegstGeno`, `jpegstKylePls`, `jpegstBamJAM`, `jpegstLucky`, `jpegstKetchup`, `jpegstJulian`, `jpegstScoot`, `jpegstWhitney`, `jpegstApollo`, `jpegstHeyGuys`, `jpegstYes`, `jpegstChrome`, `jpegstBroken`, `jpegstSlay`, `jpegstDog`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { greetingEmotes.push(`sclarfRave`, `sclarfWobble`, `sclarfBark`, `sclarfSpin`, `sclarfPls`, `sclarfHowdy`, `sclarfDog`, `sclarfAmazed`, `sclarfHearts`, `sclarfDEEP`, `sclarfWave`, `sclarfYay`, `sclarfChickenmoley`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { greetingEmotes.push(`e1ectr4Lfg`, `e1ectr4Pikadance`, `e1ectr4Tromadance`, `e1ectr4Ocha`, `e1ectr4Hello`, `e1ectr4Hi`, `e1ectr4Wazzah`, `e1ectr4Smile`, `e1ectr4Ram`, `e1ectr4Salute`, `e1ectr4Lemfresh`, `e1ectr4Moses`, `e1ectr4Josie`, `e1ectr4Malort`, `e1ectr4Umbreon`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { greetingEmotes.push(`domoni6Bingo`, `domoni6ChefHey`, `domoni6Sneeze`, `domoni6Love`, `domoni6Boom`, `domoni6Mingo`) }

    const greetingEmote = greetingEmotes[Math.floor(Math.random() * greetingEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getgreetingEmote(channel: '${channel}') => '${greetingEmote}'), choices:${resetTxt}`, greetingEmotes.length) }
    return greetingEmote
}

function getDumbEmote(channel) {
    const dumbEmotes = [`:p`]
    if (channel === `jpegstripes`) { dumbEmotes.push(`KEKW`, `modCheck`, `OMEGALUL`, `PepeLaugh`, `popCat`) }
    if (channel === `sclarf`) { dumbEmotes.push(`Clueless`, `COPIUM`, `DonoWall`, `KEKW`, `LULW`, `modCheck`) }
    if (channel === `e1ectroma`) { dumbEmotes.push(`dekuHYPE`, `KEKW`, `LULW`, `modCheck`, `OMEGALUL`, `pikaO`, `popCat`, `pressF`, `WeSmart`) }
    if (channel === `domonintendo1`) { dumbEmotes.push(`HUHH`, `KEKW`, `modCheck`, `OMEGALUL`, `PauseChamp`, `peepoGiggles`, `Pepega`, `PepeLaugh`, `pepoG`, `weirdChamp`, `WeSmart`) }

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { dumbEmotes.push(`jpegstOkay`, `jpegstChrome`, `jpegstBroken`, `jpegstBlank`, `jpegstBonk`, `jpegstMegamind`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { dumbEmotes.push(`sclarfSpin`, `sclarfHuh`, `sclarfBlind`, `sclarfSophisticated`, `sclarfLUL`, `sclarfDEEP`, `sclarfChickenmoley`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { dumbEmotes.push(`e1ectr4Bye`, `e1ectr4Laugh`, `e1ectr4Wazzah`, `e1ectr4Malort`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { dumbEmotes.push(`domoni6ChefHey`, `domoni6MeincSus`, `domoni6Sneeze`, `domoni6Dum`, `domoni6Kek`) }

    const dumbEmote = dumbEmotes[Math.floor(Math.random() * dumbEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getDumbEmote(channel: '${channel}') => '${dumbEmote}'), choices:${resetTxt}`, dumbEmotes.length) }
    return dumbEmote
}

module.exports = {
    getLemonEmote,
    getHypeEmote,
    getPositiveEmote,
    getUpsetEmote,
    getNegativeEmote,
    getGreetingEmote,
    getDumbEmote
}
