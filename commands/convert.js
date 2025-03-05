const { getContextEmote, logMessage, arrToList } = require(`../utils`)

const units = {
    [/\bf\b|\bfahrenheit\b/i]: { name: `Fahrenheit`, plural: `Fahrenheit`, type: `temperature` },
    [/\bc\b|\bcelcius\b/i]: { name: `Celcius`, plural: `Celcius`, type: `temperature` },
    [/\bk\b|\bkelvin\b/i]: { name: `Kelvin`, plural: `Kelvin`, type: `temperature` },
    [/\bmms?\b|\bmillimeters?\b/i]: { name: `millimeter`, plural: `millimeters`, type: `length` },
    [/\bcms?\b|\bcentimeters?\b/i]: { name: `centimeter`, plural: `centimeters`, type: `length` },
    [/\bms?\b|\bmeters?\b/i]: { name: `meter`, plural: `meters`, type: `length` },
    [/\bkms?\b|\bkilometers?\b/i]: { name: `kilometer`, plural: `kilometers`, type: `length` },
    [/\bins?\b|\binch(es)?\b/i]: { name: `inch`, plural: `inches`, type: `length` },
    [/\bft\b|\bfoot\b|\bfeet\b/i]: { name: `foot`, plural: `feet`, type: `length` },
    [/\byds?\b|\byards?\b/i]: { name: `yard`, plural: `yards`, type: `length` },
    [/\bmis?\b|\bmiles?\b/i]: { name: `mile`, plural: `miles`, type: `length` },
    [/\bmgs?\b|\bmilligrams?\b/i]: { name: `milligram`, plural: `milligrams`, type: `weight` },
    [/\bgs?\b|\bgrams?\b/i]: { name: `gram`, plural: `grams`, type: `weight` },
    [/\bkgs?\b|\bkilograms?\b/i]: { name: `kilogram`, plural: `kilograms`, type: `weight` },
    [/\bts?\b|\btonnes?\b|\bmetricton(ne)?s?\b/i]: { name: `metric ton`, plural: `metric tons`, type: `weight` },
    [/\bozs?\b|\bounces?\b/i]: { name: `ounce`, plural: `ounces`, type: `weight` },
    [/\blbs?\b|\bpounds?\b/i]: { name: `pound`, plural: `pounds`, type: `weight` },
    [/\bsts?\b|\bstones?\b/i]: { name: `stone`, plural: `stone`, type: `weight` },
    [/\blongtons?\b|\buktons?\b/i]: { name: `UK ton`, plural: `UK tons`, type: `weight` },
    [/\btons?\b|\bshorttons?\b|\bustons?\b/i]: { name: `US ton`, plural: `US tons`, type: `weight` },
    [/\bmls?\b|\bmilliliters?\b/i]: { name: `milliliter`, plural: `milliliters`, type: `volume` },
    [/\bls?\b|\bliters?\b/i]: { name: `liter`, plural: `liters`, type: `volume` },
    [/\btsps?\b|\bteaspoons?\b/i]: { name: `teaspoon`, plural: `teaspoons`, type: `volume` },
    [/\btbsps?\b|\btablespoons?\b/i]: { name: `tablespoon`, plural: `tablespoons`, type: `volume` },
    [/\bflozs?\b|\bfluidounces?\b/i]: { name: `fluid ounce`, plural: `ounces`, type: `volume` },
    [/\bcps?\b|\bcups?\b/i]: { name: `cup`, plural: `cups`, type: `volume` },
    [/\bpts?\b|\bpints?\b/i]: { name: `pint`, plural: `pints`, type: `volume` },
    [/\bqts?\b|\bquarts?\b/i]: { name: `quart`, plural: `quarts`, type: `volume` },
    [/\bgals?\b|\bgallons?\b/i]: { name: `gallon`, plural: `gallons`, type: `volume` }
}

const conversionTypes = {
    temperature: {
        Fahrenheit: {
            Celcius: (num) => ((num - 32) * 5) / 9,
            Kelvin: (num) => ((num - 32) * 5) / 9 + 273.15
        },
        Celcius: {
            Fahrenheit: (num) => ((9 * num) / 5) + 32,
            Kelvin: (num) => num + 273.15
        },
        Kelvin: {
            Fahrenheit: (num) => ((9 * (num - 273.15)) / 5) + 32,
            Celcius: (num) => num - 273.15
        }
    },
    length: {
        millimeter: {
            centimeter: (num) => num * 0.1,
            meter: (num) => num * 0.001,
            kilometer: (num) => num * 0.000001,
            inch: (num) => num * 0.03937008,
            foot: (num) => num * 0.00328084,
            yard: (num) => num * 0.00109361,
            mile: (num) => num * 0.000000621371
        },
        centimeter: {
            millimeter: (num) => num * 10,
            meter: (num) => num * 0.01,
            kilometer: (num) => num * 0.00001,
            inch: (num) => num * 0.3937008,
            foot: (num) => num * 0.0328084,
            yard: (num) => num * 0.0109361,
            mile: (num) => num * 0.00000621371
        },
        meter: {
            millimeter: (num) => num * 1000,
            centimeter: (num) => num * 100,
            kilometer: (num) => num * 0.001,
            inch: (num) => num * 39.37008,
            foot: (num) => num * 3.28084,
            yard: (num) => num * 1.09361,
            mile: (num) => num * 0.000621371
        },
        kilometer: {
            millimeter: (num) => num * 1000000,
            centimeter: (num) => num * 100000,
            meter: (num) => num * 1000,
            inch: (num) => num * 39370.08,
            foot: (num) => num * 3280.84,
            yard: (num) => num * 1093.61,
            mile: (num) => num * 0.621371
        },
        inch: {
            millimeter: (num) => num * 25.4,
            centimeter: (num) => num * 2.54,
            meter: (num) => num * 0.0254,
            kilometer: (num) => num * 0.0000254,
            foot: (num) => num / 12,
            yard: (num) => num / 36,
            mile: (num) => num / 63360
        },
        foot: {
            millimeter: (num) => num * 340.8,
            centimeter: (num) => num * 34.08,
            meter: (num) => num * 0.3408,
            kilometer: (num) => num * 0.0003408,
            inch: (num) => num * 12,
            yard: (num) => num / 3,
            mile: (num) => num / 5280
        },
        yard: {
            millimeter: (num) => num * 914.4,
            centimeter: (num) => num * 91.44,
            meter: (num) => num * 0.9144,
            kilometer: (num) => num * 0.0009144,
            inch: (num) => num * 36,
            foot: (num) => num * 3,
            mile: (num) => num / 1760
        },
        mile: {
            millimeter: (num) => num * 0.00000160934,
            centimeter: (num) => num * 160934,
            meter: (num) => num * 1609.34,
            kilometer: (num) => num * 1.60934,
            inch: (num) => num * 63360,
            foot: (num) => num * 5280,
            yard: (num) => num * 1760
        }
    },
    weight: {
        milligram: {
            gram: (num) => num * 0.001,
            kilogram: (num) => num * 0.000001,
            'metric ton': (num) => num * 0.000000001,
            ounce: (num) => num / 28350,
            pound: (num) => num / 453600,
            stone: (num) => num / .00000635,
            'UK ton': (num) => num / 1016.064,
            'US ton': (num) => num / 907.2
        },
        gram: {
            milligram: (num) => num * 1000,
            kilogram: (num) => num * 0.001,
            'metric ton': (num) => num * 0.000001,
            ounce: (num) => num / 28.35,
            pound: (num) => num / 453.6,
            stone: (num) => num / 6350,
            'UK ton': (num) => num / 1016064,
            'US ton': (num) => num / 907200
        },
        kilogram: {
            milligram: (num) => num * 1000000,
            gram: (num) => num * 1000,
            'metric ton': (num) => num * 0.001,
            ounce: (num) => num / 35.274,
            pound: (num) => num * 2.205,
            stone: (num) => num / 6.35,
            'UK ton': (num) => num / 1016,
            'US ton': (num) => num / 907.2
        },
        'metric ton': {
            milligram: (num) => num * 1000000000,
            gram: (num) => num * 1000000,
            kilogram: (num) => num * 1000,
            ounce: (num) => num * 35270,
            pound: (num) => num * 2204.62,
            stone: (num) => num * 157.473,
            'UK ton': (num) => num / 1.016,
            'US ton': (num) => num * 1.10231
        },
        ounce: {
            milligram: (num) => num * 28349.5,
            gram: (num) => num * 28.3495,
            kilogram: (num) => num * 0.0283495,
            'metric ton': (num) => num * 0.0000283495,
            pound: (num) => num / 16,
            stone: (num) => num / 224,
            'UK ton': (num) => num / 35840,
            'US ton': (num) => num / 32000
        },
        pound: {
            milligram: (num) => num * 453592,
            gram: (num) => num * 453.592,
            kilogram: (num) => num * 0.453592,
            'metric ton': (num) => num * 0.000453592,
            ounce: (num) => num * 16,
            stone: (num) => num / 14,
            'UK ton': (num) => num / 2000,
            'US ton': (num) => num / 2240
        },
        stone: {
            milligram: (num) => num * 6350290,
            gram: (num) => num * 6350.29,
            kilogram: (num) => num * 6.35029,
            'metric ton': (num) => num * 0.00635029,
            ounce: (num) => num * 224,
            pound: (num) => num * 14,
            'UK ton': (num) => num / 160,
            'US ton': (num) => num / 142.857
        },
        'UK ton': {
            milligram: (num) => num * 1016050000,
            gram: (num) => num * 1016050,
            kilogram: (num) => num * 1016.05,
            'metric ton': (num) => num * 1.01605,
            ounce: (num) => num * 35840,
            pound: (num) => num * 2240,
            stone: (num) => num * 160,
            'US ton': (num) => num * 1.12
        },
        'US ton': {
            milligram: (num) => num * 907184740,
            gram: (num) => num * 907184.74,
            kilogram: (num) => num * 907.18474,
            'metric ton': (num) => num * 0.90718474,
            ounce: (num) => num * 32000,
            pound: (num) => num * 2000,
            stone: (num) => num * 142.857,
            'UK ton': (num) => num / 1.12
        }
    },
    volume: {
        milliliter: {
            liter: (num) => num / 1000,
            teaspoon: (num) => num * 0.202884,
            tablespoon: (num) => num * 0.067628,
            'fluid ounce': (num) => num * 0.033814,
            cup: (num) => num * 0.00416667,
            pint: (num) => num * 0.00211338,
            quart: (num) => num * 0.00105669,
            gallon: (num) => num * 0.000264172
        },
        liter: {
            milliliter: (num) => num * 1000,
            teaspoon: (num) => num * 202.884,
            tablespoon: (num) => num * 67.628,
            'fluid ounce': (num) => num * 33.814,
            cup: (num) => num * 4.16667,
            pint: (num) => num * 2.11338,
            quart: (num) => num * 1.05669,
            gallon: (num) => num * 0.264172
        },
        teaspoon: {
            milliliter: (num) => num * 4.92892,
            liter: (num) => num * 0.00492892,
            tablespoon: (num) => num / 3,
            'fluid ounce': (num) => num / 6,
            cup: (num) => num / 48,
            pint: (num) => num / 96,
            quart: (num) => num / 192,
            gallon: (num) => num / 768
        },
        tablespoon: {
            milliliter: (num) => num * 14.7868,
            liter: (num) => num * 0.0147868,
            teaspoon: (num) => num * 3,
            'fluid ounce': (num) => num / 2,
            cup: (num) => num / 16,
            pint: (num) => num / 32,
            quart: (num) => num / 64,
            gallon: (num) => num / 256
        },
        'fluid ounce': {
            milliliter: (num) => num * 29.5735,
            liter: (num) => num * 0.0295735,
            teaspoon: (num) => num * 6,
            tablespoon: (num) => num * 2,
            pint: (num) => num / 16,
            quart: (num) => num / 32,
            gallon: (num) => num / 128
        },
        cup: {
            milliliter: (num) => num * 0.24,
            liter: (num) => num * 240,
            teaspoon: (num) => num * 48,
            tablespoon: (num) => num * 16,
            'fluid ounce': (num) => num * 8,
            pint: (num) => num / 2,
            quart: (num) => num / 4,
            gallon: (num) => num / 16
        },
        pint: {
            milliliter: (num) => num * 473.176,
            liter: (num) => num * 0.473176,
            teaspoon: (num) => num * 96,
            tablespoon: (num) => num * 32,
            'fluid ounce': (num) => num * 16,
            cup: (num) => num * 2,
            quart: (num) => num / 2,
            gallon: (num) => num / 8
        },
        quart: {
            milliliter: (num) => num * 946.353,
            liter: (num) => num * 0.946353,
            teaspoon: (num) => num * 192,
            tablespoon: (num) => num * 64,
            'fluid ounce': (num) => num * 32,
            cup: (num) => num * 4,
            pint: (num) => num * 2,
            gallon: (num) => num / 4
        },
        gallon: {
            milliliter: (num) => num * 3785.41,
            liter: (num) => num * 3.78541,
            teaspoon: (num) => num * 768,
            tablespoon: (num) => num * 256,
            'fluid ounce': (num) => num * 128,
            cup: (num) => num * 16,
            pint: (num) => num * 8,
            quart: (num) => num * 4
        }
    }
}

function validateUnit(str) {
    logMessage([`> validateUnit(str: '${str}'`])
    for (const unit in units) {
        const regex = new RegExp(unit.split(`/`)[1], unit.split(`/`)[2])
        if (regex.test(str)) {
            logMessage([str, regex, regex.test(str)])
            return units[regex]
        }
    }
    return false
}

module.exports = {
    convert(props) {
        const { bot, chatroom, args, channel } = props
        logMessage([`> convert(channel: '${channel}', args: [${args.length ? `'${args.join(`', '`)}'` : ``}])`])

        const neutralEmote = getContextEmote(`neutral`, channel)
        const positiveEmote = getContextEmote(`positive`, channel)
        const dumbEmote = getContextEmote(`dumb`, channel)

        const num = Number(args[0])
        if (isNaN(num)) {
            return bot.say(chatroom, `Please give me a number and two units of measurement! ${args.length
                ? `${/,/.test(args[0])
                    ? `Try removing the commas from "${args[0]}"`
                    : `"${args[0]}" isn't a number`
                } ${dumbEmote}`
                : `I can do ${arrToList(Object.keys(conversionTypes))} ${neutralEmote}`}`)
        }

        if (args.length < 3) { return bot.say(chatroom, `Please give me a number and two units of measurement! ${dumbEmote}`) }

        const fromUnit = validateUnit(args[1])
        if (!fromUnit) { return bot.say(chatroom, `I don't recognize "${args[1]}", please use a one-word unit or abbreviation! ${dumbEmote}`) }

        const toUnit = validateUnit(args[2])
        if (!toUnit) { return bot.say(chatroom, `I don't recognize "${args[2]}", please use a one-word unit or abbreviation! ${dumbEmote}`) }

        if (fromUnit.name === toUnit.name) { return bot.say(chatroom, `${args.slice(0, 3).join(` `)}`) }
        if (fromUnit.type !== toUnit.type) { return bot.say(chatroom, `I can't convert ${fromUnit.type} to ${toUnit.type}! ${dumbEmote}`) }

        const conversion = conversionTypes[fromUnit.type][fromUnit.name][toUnit.name](num)
        const roundedFloat = Math.round((conversion + Number.EPSILON) * 1000) / 1000
        const message = `${num}${fromUnit.type === `temperature` ? `°` : ``} ${num === 1 ? fromUnit.name : fromUnit.plural} is equal to ${roundedFloat}${toUnit.type === `temperature` ? `°` : ``} ${roundedFloat === 1 ? toUnit.name : toUnit.plural} ${positiveEmote}`
        bot.say(chatroom, message)
    }
}
