const BOT_ID = Number(process.env.BOT_ID)
const BOT_USERNAME = process.env.BOT_USERNAME
const COMMON_NICKNAMES = process.env.COMMON_NICKNAMES

const { resetTxt, grayTxt, settings } = require(`./config`)
const { lemonyFresh, users, mods, knownTags, tempCmds } = require(`./data`)

function getLemonEmote() {
    // const lemonEmotes = [...settings.baseEmotes.lemonEmotes]
    // if (users[BOT_USERNAME]?.e1ectroma?.sub) { lemonEmotes.push(`e1ectr4Lemfresh`) }

    // const lemonEmote = lemonEmotes[Math.floor(Math.random() * lemonEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getLemonEmote(channel: '${channel}') => '${lemonEmote}'), choices:${resetTxt}`, lemonEmotes.length) }
    // return lemonEmote
    return users[BOT_USERNAME]?.e1ectroma?.sub
        ? `e1ectr4Lemfresh`
        : `🍋`
}
function getNeutralEmote(channel) {
    const neutralEmotes = [...settings.baseEmotes.neutralEmotes]

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { neutralEmotes.push(`jpegstHeyGuys`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { neutralEmotes.push(`sclarfWave`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { neutralEmotes.push(`e1ectr4Smile`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { neutralEmotes.push(`domoni6ChefHey`) }
    if (users[BOT_USERNAME]?.cosyinpink?.sub) { neutralEmotes.push(`cosyin1Wave`, `cosyin1Soft`) }
    if (users[BOT_USERNAME]?.thetarastark?.sub) { neutralEmotes.push(`thetar42Pelican`) }

    const neutralEmote = neutralEmotes[Math.floor(Math.random() * neutralEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getNeutralEmote(channel: '${channel}') => '${neutralEmote}'), choices:${resetTxt}`, neutralEmotes.length) }
    return neutralEmote
}
function getHypeEmote(channel) {
    const hypeEmotes = [...settings.baseEmotes.hypeEmotes]

    if (channel === `jpegstripes`) { hypeEmotes.push(`(ditto)`, `bongoTap`, `catJAM`, `CherryStomp`, `Clap`, `diddyJAM`, `HYPERCHOP`, `KongDance`, `KyleFestivale`, `MitziJump`, `PartyKirby`, `popCat`, `raccPls`, `racJam`, `ratJAM`, `DogChamp`) }
    if (channel === `jpegstripes` && !users[BOT_USERNAME]?.jpegstripes?.sub) { hypeEmotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
    if (channel === `sclarf`) { hypeEmotes.push(`(ditto)`, `batJAM`, `BoneZone`, `bongoTap`, `catJAM`, `Clap`, `EZ`, `GIGACHAD`, `gorgHAIP`, `hypeE`, `MorshuPls`, `NODDERS`, `OOOO`) }
    if (channel === `e1ectroma`) { hypeEmotes.push(`AlienPls`, `BlobDance`, `BoneZone`, `bongoTap`, `catJAM`, `chikaYo`, `Clap`, `dekuHYPE`, `PokemonTrainer`, `popCat`, `RareChar`, `ratJAM`, `ricardoFlick`, `WeSmart`) }
    if (channel === `domonintendo1`) { hypeEmotes.push(`catJAM`, `ChipiChipi`, `Drake`, `GIGACHAD`, `HYPERS`, `NODDERS`, `PartyKirby`, `pepeD`, `pepeDS`, `POGGERS`, `ricardoFlick`) }

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { hypeEmotes.push(`jpegstCoin`, `jpegstGeno`, `jpegstKylePls`, `jpegstBamJAM`, `jpegstLucky`, `jpegstKetchup`, `jpegstJulian`, `jpegstScoot`, `jpegstWhitney`, `jpegstApollo`, `jpegstKylePog`, `jpegstYes`, `jpegstSlay`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { hypeEmotes.push(`sclarfRave`, `sclarfWobble`, `sclarfBark`, `sclarfSpin`, `sclarfPls`, `sclarfAmazed`, `sclarfHearts`, `sclarfDEEP`, `sclarfYay`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { hypeEmotes.push(`e1ectr4Lfg`, `e1ectr4Pikadance`, `e1ectr4Tromadance`, `e1ectr4Coop`, `e1ectr4Ocha`, `e1ectr4Smile`, `e1ectr4Salute`, `e1ectr4Lemfresh`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { hypeEmotes.push(`domoni6Bingo`, `domoni6Love`, `domoni6Mingo`) }
    if (users[BOT_USERNAME]?.cosyinpink?.sub) { hypeEmotes.push(`cosyin1Hype`, `cosyin1Dance`) }
    if (users[BOT_USERNAME]?.thetarastark?.sub) { hypeEmotes.push(`thetar42Cheer`, `thetar42POG`) }

    const hypeEmote = hypeEmotes[Math.floor(Math.random() * hypeEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getHypeEmote(channel: '${channel}') => '${hypeEmote}'), choices:${resetTxt}`, hypeEmotes.length) }
    return hypeEmote
}
function getPositiveEmote(channel) {
    const positiveEmotes = [...settings.baseEmotes.positiveEmotes]

    if (channel === `jpegstripes`) { positiveEmotes.push(`CherryStomp`) }
    if (channel === `jpegstripes` && !users[BOT_USERNAME]?.jpegstripes?.sub) { positiveEmotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
    if (channel === `sclarf`) { positiveEmotes.push(`(ditto)`, `NODDERS`) }
    if (channel === `e1ectroma`) { positiveEmotes.push(`AlienPls`, `PokeMon`, `PokemonTrainer`, `RareChar`) }
    if (channel === `domonintendo1`) { positiveEmotes.push(`HYPERS`, `NODDERS`, `peepoHappy`) }

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { positiveEmotes.push(`jpegstGeno`, `jpegstKylePls`, `jpegstBamJAM`, `jpegstLucky`, `jpegstKetchup`, `jpegstJulian`, `jpegstScoot`, `jpegstWhitney`, `jpegstApollo`, `jpegstYes`, `jpegstDog`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { positiveEmotes.push(`sclarfDog`, `sclarfHearts`, `sclarfPopbonk`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { positiveEmotes.push(`e1ectr4Pikadance`, `e1ectr4Coop`, `e1ectr4Smile`, `e1ectr4Salute`, `e1ectr4Lemfresh`, `e1ectr4Moses`, `e1ectr4Josie`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { positiveEmotes.push(`domoni6Bingo`, `domoni6Mingo`) }
    if (users[BOT_USERNAME]?.cosyinpink?.sub) { positiveEmotes.push(`cosyin1Hype`, `cosyin1Love`) }
    if (users[BOT_USERNAME]?.thetarastark?.sub) { positiveEmotes.push(`thetar42Cheer`) }

    const positiveEmote = positiveEmotes[Math.floor(Math.random() * positiveEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getPositiveEmote(channel: '${channel}') => '${positiveEmote}'), choices:${resetTxt}`, positiveEmotes.length) }
    return positiveEmote
}
function getUpsetEmote(channel) {
    const upsetEmotes = [...settings.baseEmotes.upsetEmotes]

    if (channel === `jpegstripes`) { upsetEmotes.push(`BowserRAGE`) }
    if (channel === `sclarf`) { upsetEmotes.push(`Madge`, `NOOO`, `NOPERS`) }
    if (channel === `e1ectroma`) { upsetEmotes.push(`pikaO`, `pressF`, `sadCat`) }
    if (channel === `domonintendo1`) { upsetEmotes.push(`coffinPLZ`, `monkaX`, `sadCat`, `tenseSmash`, `VegetaPain`) }

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { upsetEmotes.push(`jpegstKylePog`, `jpegstNo`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { upsetEmotes.push(`sclarfMad`, `sclarfPalm`, `sclarfDead`, `sclarfHiss`, `sclarfD8`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { upsetEmotes.push(`e1ectr4Devil`, `e1ectr4Heat`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { upsetEmotes.push(`domoni6Sneeze`, `domoni6Dum`) }
    if (users[BOT_USERNAME]?.cosyinpink?.sub) { upsetEmotes.push(`cosyin1Crying`) }
    if (users[BOT_USERNAME]?.thetarastark?.sub) { upsetEmotes.push(`thetar42Fkickline`) }

    const upsetEmote = upsetEmotes[Math.floor(Math.random() * upsetEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getUpsetEmote(channel: '${channel}') => '${sadEmote}'), choices:${resetTxt}`, upsetEmotes.length) }
    return upsetEmote
}
function getNegativeEmote(channel) {
    const negativeEmotes = [...settings.baseEmotes.negativeEmotes]

    if (channel === `jpegstripes`) { negativeEmotes.push(`modCheck`) }
    if (channel === `sclarf`) { negativeEmotes.push(`NOOO`, `NOPERS`) }
    if (channel === `e1ectroma`) { negativeEmotes.push(`pikaO`, `pressF`, `sadCat`) }
    if (channel === `domonintendo1`) { negativeEmotes.push(`sadCat`) }

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { negativeEmotes.push(`jpegstNo`, `jpegstBroken`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { negativeEmotes.push(`sclarfBlind`, `sclarfDead`, `sclarfHiss`, `sclarfD8`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { negativeEmotes.push(`e1ectr4Devil`, `e1ectr4Heat`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { negativeEmotes.push(`domoni6Sneeze`, `domoni6Dum`) }
    if (users[BOT_USERNAME]?.cosyinpink?.sub) { negativeEmotes.push(`cosyin1Crying`) }
    if (users[BOT_USERNAME]?.thetarastark?.sub) { negativeEmotes.push(`thetar42Fkickline`) }

    const negativeEmote = negativeEmotes[Math.floor(Math.random() * negativeEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getNegativeEmote(channel: '${channel}') => '${negativeEmote}'), choices:${resetTxt}`, negativeEmotes.length) }
    return negativeEmote
}
function getGreetingEmote(channel) {
    const greetingEmotes = [...settings.baseEmotes.greetingEmotes]

    if (channel === `jpegstripes`) { greetingEmotes.push(`(ditto)`, `bongoTap`, `CherryStomp`, `diddyJAM`, `HYPERCHOP`, `KongDance`, `KyleFestivale`, `MitziJump`, `PartyKirby`, `popCat`, `raccPls`, `racJam`, `ratJAM`, `VillagerTimber`) }
    if (channel === `jpegstripes` && !users[BOT_USERNAME]?.jpegstripes?.sub) { greetingEmotes.push(`ApolloFly`, `BamJAM`, `JulianGroove`, `KetchupWave`, `KyleSwish`, `LuckySway`, `ScootPatch`, `WhitneyVibe`) }
    if (channel === `sclarf`) { greetingEmotes.push(`(ditto)`, `BoneZone`, `bongoTap`, `BOOBA`, `catKISS`, `EZ`, `GIGACHAD`, `jesusBeBallin`, `LICKA`, `MEOW`, `OOOO`, `peepoShy`) }
    if (channel === `e1ectroma`) { greetingEmotes.push(`AlienPls`, `BlobDance`, `BoneZone`, `bongoTap`, `chikaYo`, `dekuHYPE`, `PokeMon`, `PokemonTrainer`, `popCat`, `RareChar`, `ricardoFlick`) }
    if (channel === `domonintendo1`) { greetingEmotes.push(`ChipiChipi`, `GIGACHAD`, `HYPERS`, `peepoHappy`, `pikaHi`, `POGGERS`, `ricardoFlick`) }

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { greetingEmotes.push(`jpegstCoin`, `jpegstTimber`, `jpegstGeno`, `jpegstKylePls`, `jpegstBamJAM`, `jpegstLucky`, `jpegstKetchup`, `jpegstJulian`, `jpegstScoot`, `jpegstWhitney`, `jpegstApollo`, `jpegstHeyGuys`, `jpegstYes`, `jpegstChrome`, `jpegstBroken`, `jpegstSlay`, `jpegstDog`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { greetingEmotes.push(`sclarfRave`, `sclarfWobble`, `sclarfBark`, `sclarfSpin`, `sclarfPls`, `sclarfHowdy`, `sclarfDog`, `sclarfAmazed`, `sclarfHearts`, `sclarfDEEP`, `sclarfWave`, `sclarfYay`, `sclarfChickenmoley`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { greetingEmotes.push(`e1ectr4Lfg`, `e1ectr4Pikadance`, `e1ectr4Tromadance`, `e1ectr4Ocha`, `e1ectr4Hello`, `e1ectr4Hi`, `e1ectr4Wazzah`, `e1ectr4Smile`, `e1ectr4Ram`, `e1ectr4Salute`, `e1ectr4Lemfresh`, `e1ectr4Moses`, `e1ectr4Josie`, `e1ectr4Malort`, `e1ectr4Umbreon`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { greetingEmotes.push(`domoni6Bingo`, `domoni6ChefHey`, `domoni6Sneeze`, `domoni6Love`, `domoni6Boom`, `domoni6Mingo`) }
    if (users[BOT_USERNAME]?.astral_an0maly?.sub) { greetingEmotes.push(`astral332HI`) }
    if (users[BOT_USERNAME]?.dirtyd0inks?.sub) { greetingEmotes.push(`dirtyd182LOVE`) }
    if (users[BOT_USERNAME]?.cosyinpink?.sub) { greetingEmotes.push(`cosyin1Hype`, `cosyin1Dance`, `cosyin1Love`, `cosyin1Wave`, `cosyin1Soft`) }
    if (users[BOT_USERNAME]?.thetarastark?.sub) { greetingEmotes.push(`thetar42KeystoneFlag`, `thetar42Cheer`, `thetar42POG`, `thetar42Pelican`, `thetar42Blep`, `thetar42Sad`) }

    const greetingEmote = greetingEmotes[Math.floor(Math.random() * greetingEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getgreetingEmote(channel: '${channel}') => '${greetingEmote}'), choices:${resetTxt}`, greetingEmotes.length) }
    return greetingEmote
}
function getByeEmote(channel) {
    const byeEmotes = [...settings.baseEmotes.byeEmotes]

    if (channel === `jpegstripes` && !users[BOT_USERNAME]?.jpegstripes?.sub) { byeEmotes.push(`raccPls`, `WhitneyVibe`) }
    if (channel === `sclarf`) { byeEmotes.push(`catKISS`, `LICKA`, `MEOW`) }
    if (channel === `e1ectroma`) { byeEmotes.push(`PokemonTrainer`) }
    if (channel === `domonintendo1`) { byeEmotes.push(`peepoHappy`, `pikaHi`) }

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { byeEmotes.push(`jpegstGeno`, `jpegstKylePls`, `jpegstLucky`, `jpegstKetchup`, `jpegstWhitney`, `jpegstApollo`, `jpegstHeyGuys`, `jpegstTapeEnd`, `jpegstDog`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { byeEmotes.push(`sclarfSleep`, `sclarfWave`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { byeEmotes.push(`e1ectr4Pikadance`, `e1ectr4Hello`, `e1ectr4Smile`, `e1ectr4Ram`, `e1ectr4Salute`, `e1ectr4Lemfresh`, `e1ectr4Moses`, `e1ectr4Josie`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { byeEmotes.push(`domoni6Love`) }
    if (users[BOT_USERNAME]?.cosyinpink?.sub) { byeEmotes.push(`cosyin1Love`, `cosyin1Wave`, `cosyin1Cozy`) }

    const byeEmote = byeEmotes[Math.floor(Math.random() * byeEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getbyeEmote(channel: '${channel}') => '${byeEmote}'), choices:${resetTxt}`, byeEmotes.length) }
    return byeEmote
}
function getDumbEmote(channel) {
    const dumbEmotes = [...settings.baseEmotes.dumbEmotes]

    if (channel === `jpegstripes`) { dumbEmotes.push(`KEKW`, `modCheck`, `popCat`) }
    if (channel === `sclarf`) { dumbEmotes.push(`Clueless`, `COPIUM`, `DonoWall`, `KEKW`, `modCheck`) }
    if (channel === `e1ectroma`) { dumbEmotes.push(`dekuHYPE`, `KEKW`, `modCheck`, `pikaO`, `popCat`, `pressF`) }
    if (channel === `domonintendo1`) { dumbEmotes.push(`COPIUM`, `HUHH`, `KEKW`, `modCheck`, `monkaHmm`, `NODDERS`, `PauseChamp`, `pepoG`, `weirdChamp`) }

    if (users[BOT_USERNAME]?.jpegstripes?.sub) { dumbEmotes.push(`jpegstChrome`, `jpegstBroken`, `jpegstBlank`, `jpegstBonk`, `jpegstMegamind`) }
    if (users[BOT_USERNAME]?.sclarf?.sub) { dumbEmotes.push(`sclarfSpin`, `sclarfHuh`, `sclarfBlind`, `sclarfSophisticated`, `sclarfLUL`, `sclarfDEEP`, `sclarfChickenmoley`) }
    if (users[BOT_USERNAME]?.e1ectroma?.sub) { dumbEmotes.push(`e1ectr4Bye`, `e1ectr4Laugh`, `e1ectr4Wazzah`, `e1ectr4Malort`) }
    if (users[BOT_USERNAME]?.domonintendo1?.sub) { dumbEmotes.push(`domoni6ChefHey`, `domoni6MeincSus`, `domoni6Sneeze`, `domoni6Dum`, `domoni6Kek`) }
    if (users[BOT_USERNAME]?.cosyinpink?.sub) { dumbEmotes.push(`cosyin1Dance`) }
    if (users[BOT_USERNAME]?.thetarastark?.sub) { dumbEmotes.push(`thetar42Blep`, `thetar42Sad`) }

    const dumbEmote = dumbEmotes[Math.floor(Math.random() * dumbEmotes.length)]
    // if (settings.debug) { console.log(`${boldTxt}> getDumbEmote(channel: '${channel}') => '${dumbEmote}'), choices:${resetTxt}`, dumbEmotes.length) }
    return dumbEmote
}
function pluralize(num, singularForm, pluralForm) {
    return Number(num) === 1
        ? `${Number(num)} ${singularForm}`
        : `${Number(num)} ${pluralForm}`
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
    getLemonEmote,
    getNeutralEmote,
    getHypeEmote,
    getPositiveEmote,
    getUpsetEmote,
    getNegativeEmote,
    getGreetingEmote,
    getByeEmote,
    getDumbEmote,
    pluralize,
    getToUser(str) {
        return str
            ? str.replace(/^[@#]/g, ``).toLowerCase()
            : null
    },
    initUser(tags, self) {
        const username = tags.username
        if (settings.debug) { console.log(`${grayTxt}> initUser(tags.username: '${tags.username}')${resetTxt}`) }
        users[username] = {
            id: self ? BOT_ID : Number(tags[`user-id`]),
            displayName: tags[`display-name`],
            nickname: '',
            turbo: !!tags.turbo,
            color: tags.color || ``,
            lemons: 0,
            hangmanWins: 0
        }
    },
    initUserChannel(tags, username, channel) {
        if (settings.debug) { console.log(`${grayTxt}> initUserChannel(username: '${username}', channel: '${channel}')${resetTxt}`) }
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
        if (settings.debug) { console.log(`${grayTxt}> initChannel(channel: '${channel}')${resetTxt}`) }
        lemonyFresh[channel].accessToken = lemonyFresh[channel]?.accessToken || mods[channel]?.accessToken || ``
        lemonyFresh[channel].refreshToken = lemonyFresh[channel]?.refreshToken || mods[channel]?.refreshToken || ``
        lemonyFresh[channel].subRaidMessage = lemonyFresh[channel]?.subRaidMessage || ``
        lemonyFresh[channel].noSubRaidMessage = lemonyFresh[channel]?.noSubRaidMessage || ``
        lemonyFresh[channel].emotes = lemonyFresh[channel]?.emotes || []
        lemonyFresh[channel].bttvEmotes = lemonyFresh[channel]?.bttvEmotes || []
        lemonyFresh[channel].redeems = lemonyFresh[channel]?.redeems || []
        lemonyFresh[channel].rollFunNumber = lemonyFresh[channel]?.rollFunNumber || true
        lemonyFresh[channel].funTimer = 0
        lemonyFresh[channel].funTimerGuesser = ``
        lemonyFresh[channel].pollId = ``
        lemonyFresh[channel].viewers = []
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
    },
    updateMod(chatroom, tags, self, username) {
        if (!(username in mods)) {
            if (settings.debug) { console.log(`${grayTxt}> initMod: '${username}'${resetTxt}`) }
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
            if (settings.debug) { console.log(`${grayTxt}> updateMod ${username}: '${chatroom}'${resetTxt}`) }
            mods[username].isModIn.push(chatroom)
        }
    },
    resetCooldownTimer(channel, timer) {
        if (settings.debug) { console.log(`${grayTxt}> resetCooldownTimer(channel: '${channel}', timer: '${timer}', cooldown: ${pluralize(lemonyFresh[channel].timers[timer].cooldown, `second`, `seconds`)})${resetTxt}`) }
        lemonyFresh[channel].timers[timer].listening = false
        clearTimeout(lemonyFresh[channel].timers[timer].timerId)
        lemonyFresh[channel].timers[timer].timerId = Number(setTimeout(() => {
            lemonyFresh[channel].timers[timer].listening = true
            if (settings.debug) { console.log(`${grayTxt}-> Listening for '${timer}' again!${resetTxt}`) }
        }, lemonyFresh[channel].timers[timer].cooldown * 1000))
    },
    sayJoinMessage(bot, chatroom) {
        if (settings.debug) { console.log(`${grayTxt}> sayJoinMessage(chatroom: '${chatroom}'${settings.joinMessage ? `, '${settings.joinMessage}'` : ``})${resetTxt}`) }

        const channel = chatroom.substring(1)
        const lemonEmote = getLemonEmote()
        const neutralEmote = getNeutralEmote(channel)
        const positiveEmote = getPositiveEmote(channel)
        const hypeEmote = getHypeEmote(channel)
        const greetingEmote = getGreetingEmote(channel)
        const dumbEmote = getDumbEmote(channel)
        const numUsers = Object.keys(users).length
        const numTempCmds = Object.keys(tempCmds).length
        const randNum = Math.floor(Math.random() * numbers.length)

        const joinMessages = [
            `Let's see how long before I crash ${dumbEmote}`,
            `* Lemony_friend blocks the way! ${positiveEmote}`,
            `Hi ${channel}, I'm lemony_friend! ${greetingEmote} ${lemonEmote}`,
            `(Windows XP startup sound plays)`,
            `I'm onl`,
            `I have ${numUsers <= 999
                ? `${numbers[numUsers]} (${numUsers}) friend${numUsers === 1 ? `` : `s`}`
                : pluralize(numUsers, `friend`, `friends`)}! ${numUsers === 0
                    ? dumbEmote
                    : numUsers < 25
                        ? neutralEmote
                        : numUsers < 50
                            ? positiveEmote
                            : hypeEmote}`,
            `There ${numTempCmds === 1 ? `is` : `are`} ${pluralize(numTempCmds, `temporary command`, `temporary commands`)}! ${numTempCmds === 0
                ? dumbEmote
                : numTempCmds < 3
                    ? neutralEmote
                    : numTempCmds < 5
                        ? positiveEmote
                        : hypeEmote}`,
            `Let's play Hangman! ${positiveEmote}`,
            `I know ${pluralize(lemonyFresh[channel].emotes.length, `emote`, `emotes`)} in ${channel}'s channel! ${lemonyFresh[channel].emotes[0] || neutralEmote}`,
            `It has been ${Date.now().toLocaleString(`en-US`)} milliseconds since January 1, 1970, 12:00:00 AM UTC ${lemonEmote}`,
            `lemony_friend has entered the chat ${lemonEmote}`,
            `${BOT_USERNAME in users
                ? `I have ${pluralize(users[BOT_USERNAME].lemons, `lemon`, `lemons`)}! ${lemonEmote}`
                : `Imagine having ${pluralize(randNum, `lemon`, `lemons`)}... Heck, imagine having ${numbers[randNum + 1] || `one thousand`} lemons... ${lemonEmote}`}`
        ]
        const joinMessage = joinMessages[Math.floor(Math.random() * joinMessages.length)]

        bot.say(channel, settings.joinMessage || joinMessage)
    },
    // (For debugging/discovery) Add to list of known message tags
    tagsListener(tags) {
        for (const tag of Object.keys(tags)) {
            const type = typeof tags[tag] === `object`
                ? tags[tag] === null
                    ? `null`
                    : Array.isArray(tags[tag])
                        ? `array`
                        : typeof tags[tag] : typeof tags[tag]
            if (!(tag in knownTags)) {
                if (settings.debug) { console.log(`${grayTxt}> New message tag '${tag}' discovered (type: ${type})${resetTxt}`, tags[tag]) }
                knownTags[tag] = { types: [] }
            }
            if (!knownTags[tag].types.includes(type)) {
                if (settings.debug && knownTags[tag].types.length > 0) console.log(`${grayTxt}> New type for message tag '${tag}' added: ${type}${resetTxt}`)
                knownTags[tag].types.push(type)
            }
            knownTags[tag].lastValue = tags[tag]
        }
    },
    getUsername(str) {
        const twitchUsernamePattern = /^[a-z0-9_]{4,25}$/i
        return str
            ? str.replace(/^[@#]/g, ``).match(twitchUsernamePattern)
                ? str.replace(/^[@#]/g, ``)
                : null
            : null
    },
    async handleUncaughtException(bot, errMsg, location) {
        if (settings.debug) { console.log(`${grayTxt}> handleUncaughtException(errMsg: '${errMsg}', location: '${location}')${resetTxt}`) }

        const emote = users[BOT_USERNAME]?.jpegstripes?.sub ? `jpegstBroken` : users[BOT_USERNAME]?.sclarf?.sub ? `sclarfDead` : users[BOT_USERNAME]?.e1ectroma?.sub ? `e1ectr4Heat` : users[BOT_USERNAME]?.domonintendo1?.sub ? `domoni6Sneeze` : `>(`
        for (const chatroom of bot.channels) {
            bot.say(chatroom, `Oops, I just crashed! ${emote} ${errMsg} ${location}`)
        }
        console.log(`knownTags:`, knownTags, `tempCmds:`, tempCmds, `users:`, users, `mods:`, mods, `lemonyFresh:`, lemonyFresh)
    },
    applyNicknames(props) {
        const { bot, chatroom } = props
        if (settings.debug) { console.log(`${grayTxt}> applyNicknames(chatroom: '${chatroom}')${resetTxt}`) }
        const nicknames = COMMON_NICKNAMES.split(`,`)

        const updatedUsers = []
        const skippedUsers = []
        const unknownUsers = []
        for (const [i, name] of nicknames.entries()) {
            if (i % 2 === 0) {
                const nickname = nicknames[i + 1]
                if (name in users) {
                    if (!users[name].nickname) {
                        users[name].nickname = nickname
                        updatedUsers.push(nickname)
                    } else { skippedUsers.push(nickname) }
                } else { unknownUsers.push(name) }
            }
        }

        const response = []
        if (updatedUsers.length) {
            console.log(`${grayTxt}-> updatedUsers: ${updatedUsers.join(`, `)}${resetTxt}`)
            response.push(`${updatedUsers.length} updated`)
        }
        if (skippedUsers.length) {
            console.log(`${grayTxt}-> skippedUsers: ${skippedUsers.join(`, `)}${resetTxt}`)
            response.push(`${skippedUsers.length} skipped`)
        }
        if (unknownUsers.length) {
            console.log(`${grayTxt}-> unknownUsers: ${unknownUsers.join(`, `)}${resetTxt}`)
            response.push(`${unknownUsers.length} not known yet`)
        }
        bot.say(chatroom, `/me ${response.join(`, `)}`)
    }
}
