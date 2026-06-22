const BOT_USERNAME = process.env.BOT_USERNAME
const BOT_NICKNAME_REGEX = process.env.BOT_NICKNAME_REGEX

const { settings, users, lemonyFresh } = require(`../data`)
const { getContextEmote, pluralize, resetCooldownTimer, logMessage, transformText, logArr, twitchUsernamePattern, containsInaccessibleEmotes, arrToList } = require(`../utils`)

const { autoBanUser } = require(`./twitch`)

function handleGreetOne(props) {
    const { bot, chatroom, channel, command, userNickname, targetNickname } = props
    logMessage([`> handleGreetOne(channel: '${channel}', nickname: '${command === `!greet` ? targetNickname || userNickname : userNickname}')`])

    if (lemonyFresh[channel].timers[`greet`].listening) {
        resetCooldownTimer(channel, `greet`)

        const greetings = [
            `Howdy,`,
            `Hello,`,
            `Hey,`,
            `Hi,`,
            `Hey there,`,
            `Hello`,
            `Hey`,
            `Hi`,
            `Hey there`
        ]
        const greeting = Math.floor(Math.random() * greetings.length)
        let response = `${greetings[greeting]} ${command === `!greet` ? targetNickname || userNickname : userNickname}`
        const greetingEmote = getContextEmote(`greeting`, channel)

        // If the greeting is "Howdy"
        if (greeting === 0) { response += `! ${users[BOT_USERNAME].channels.e1ectroma?.sub ? `e1ectr4Ram` : greetingEmote}` }
        // If there's a comma after the greeting
        else if (greeting < greetings.indexOf(`Hello`)) {
            const appends = [
                `How are you doing today?`,
                `How are you today?`,
                `How are you doing?`,
                `How are you?`,
                `How's it going?`,
                `How goes it?`
            ]
            response += `! ${appends[Math.floor(Math.random() * appends.length)]} ${greetingEmote}`
        }
        // If there's no comma after the greeting
        else {
            const appends = [
                `how are you doing today?`,
                `how are you today?`,
                `how are you doing?`,
                `how are you?`,
                `how's it going?`,
                `how goes it?`
            ]
            response += `, ${appends[Math.floor(Math.random() * appends.length)]} ${greetingEmote}`
        }
        bot.say(chatroom, response)

    } else { logMessage([`-> Timer in ${channel} 'greet' is not currently listening`]) }
}

function handleGreetMany(bot, chatroom, arr, channel) {
    logMessage([`> handleGreetMany(channel: '${channel}', arr: ${logArr(arr)})`])

    if (lemonyFresh[channel].timers[`mass-greet`].listening) {
        resetCooldownTimer(channel, `mass-greet`)

        const greetings = [
            `hello`,
            `howdy`,
            `hey`,
            `hi`
        ]
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
        const greetingEmote = getContextEmote(`greeting`, channel)

        const response = []
        for (let str of arr) {
            while (str.startsWith(`@`)) { str = str.substring(1) }
            str.toLowerCase() in users
                ? response.push(`${randomGreeting} ${users[str.toLowerCase()].nickname || users[str.toLowerCase()].displayName} ${greetingEmote}`)
                : response.push(`${randomGreeting} ${str} ${greetingEmote}`)
        }
        bot.say(chatroom, response.join(` `))

    } else { logMessage([`-> Timer in ${channel} 'massGreet' is not currently listening`]) }
}

function handleGreetAll(bot, chatroom, channel, username) {
    logMessage([`> handleGreetAll(channel: '${channel}', username: '${username}')`])

    if (lemonyFresh[channel].timers[`mass-greet`].listening) {
        resetCooldownTimer(channel, `mass-greet`)

        const currentTime = Date.now()

        const usersToGreet = []
        for (const user in users) {
            if (!settings.ignoredBots.includes(user) && user !== username && channel in users[user].channels) {
                const lastChattedAtMins = Number(((currentTime - users[user].channels[channel].sentAt) / 60000).toFixed(2))
                if (lastChattedAtMins < 60) {
                    usersToGreet.push(users[user].nickname || users[user].displayName)
                }
            }
        }

        if (!usersToGreet.length) {
            logMessage([`-> No users to greet!`])
            return
        }

        const greetings = [
            `hello`,
            `howdy`,
            `hey`,
            `hi`
        ]
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
        const greetingEmote = getContextEmote(`greeting`, channel)
        const response = usersToGreet.map((user) => `${randomGreeting} ${user} ${greetingEmote}`)
        bot.say(chatroom, response.join(` `))

    } else { logMessage([`-> Timer in ${channel} 'greetAll' is not currently listening`]) }
}

const newChatters = {}
function resetNewChatters(channel) {
    newChatters[channel].timer = 0
    newChatters[channel].names = []
}

module.exports = {
    handleGreetOne,
    addNewChattersBatch(channel) {
        if (!(channel in newChatters)) {
            newChatters[channel] = {
                timer: 0,
                names: []
            }
        }
    },
    handleNewChatter(props) {
        const { bot, chatroom, username, message, channel } = props
        logMessage([`> handleNewChatter(channel: '${channel}', username: '${username}')`])

        // Decode message in case of weird characters
        const decoded = message
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

        // Check for automatic ban phrase
        for (const phrase of settings.autoBan) {
            const regex = new RegExp(phrase, `i`)
            if (regex.test(decoded)) {
                logMessage([`${username.toUpperCase()} MATCHED AUTO-BAN PATTERN:`, regex])
                autoBanUser(props)
                return
            }
        }

        if (lemonyFresh[channel].timers[`new-chatter`].listening) {
            const channelNickname = users[channel]?.nickname || users[channel]?.displayName || channel
            const obj = newChatters[channel]
            obj.names.push(username)
            clearTimeout(obj.timer)

            obj.timer = setTimeout(() => {
                resetCooldownTimer(channel, `new-chatter`)
                const greetingEmote = getContextEmote(`greeting`, channel)
                const greetings = [
                    `Hi there ${arrToList(obj.names.map(name => users[name].nickname || users[name].displayName))}, welcome to the stream! ${greetingEmote}`,
                    `Hey ${arrToList(obj.names.map(name => users[name].nickname || users[name].displayName))}, welcome to the stream! ${greetingEmote}`,
                    `Welcome to the stream, ${arrToList(obj.names.map(name => users[name].nickname || users[name].displayName))}! ${greetingEmote}`,
                    `Hi ${arrToList(obj.names.map(name => users[name].nickname || users[name].displayName))}, welcome in! ${greetingEmote}`,
                    `Hi ${obj.names.map(name => `@${users[name].displayName}`).join(` ${greetingEmote} hi `)} ${greetingEmote}`,
                    `Hello ${obj.names.map(name => `@${users[name].displayName}`).join(` ${greetingEmote} hello `)} ${obj.names.length === 1 ? `welcome in! ${greetingEmote}` : `${greetingEmote} welcome in!`}`,
                    `${obj.names.map(name => `@${users[name].nickname || users[name].displayName}`).join(` `)} welcome 2 ${channelNickname} strem ${greetingEmote}`
                ]
                const greeting = greetings[Math.floor(Math.random() * greetings.length)]
                bot.say(chatroom, `${greeting}`)
                resetNewChatters(channel)
            }, 5000)

        } else { logMessage([`-> Timer in ${channel} 'newChatter' is not currently listening`]) }
    },
    handleGreet(props) {
        const { bot, chatroom, args, channel, username, userNickname, target, targetNickname } = props
        logMessage([`> handleGreet(channel: '${channel}', args: ${logArr(args)}, userNickname: '${userNickname}', targetNickname: '${targetNickname}')`])

        // If !greet all
        if (/^all$/i.test(args[0])) { handleGreetAll(bot, chatroom, channel, username) }
        // If one (known) username is used, greet normally
        else if (target && !args[1]) { handleGreetOne(props) }
        // If multiple args are used, or toUser is not known
        else if (args.length) { handleGreetMany(bot, chatroom, args, channel) }
        // If no args are used
        else { bot.say(chatroom, `Greetings, ${userNickname}! ${getContextEmote(`greeting`, channel)}`) }
    },
    sayGoodnight(props) {
        const { bot, chatroom, message, args, channel, userNickname, toUser, targetNickname } = props
        const recipient = targetNickname || userNickname
        logMessage([`> handleGreet(channel: '${channel}', args: ${logArr(args)})`])

        if (lemonyFresh[channel].timers[`say-goodnight`].listening) {
            resetCooldownTimer(channel, `say-goodnight`)

            // In case unknown user is mentioned
            if (!targetNickname && toUser && !new RegExp(`\\b${BOT_NICKNAME_REGEX}\\b`, `i`).test(message)) {
                bot.say(chatroom, `see ya ${args[0]}`)
                return
            }

            const greetings = [
                `Bye`,
                `Good night,`,
                `Sleep well,`,
                `See you next time,`,
                `Have a good night,`
            ]
            const greeting = Math.floor(Math.random() * greetings.length)

            let response = `${greetings[greeting]} ${recipient}`
            if (greeting === 0) {
                const appends = [
                    `sleep well`,
                    `see you next time`,
                    `have a good night`,
                ]
                response += `, ${appends[Math.floor(Math.random() * appends.length)]}`
            }
            const byeEmote = getContextEmote(`bye`, channel)
            response += `! ${byeEmote}`
            bot.say(chatroom, response)

        } else { logMessage([`-> Timer in ${channel} 'sayGoodnight' is not currently listening`]) }
    },
    sayYoureWelcome(props) {
        const { bot, chatroom, channel, user, userNickname } = props
        logMessage([`> sayYoureWelcome(channel: '${channel}', userNickname: '${userNickname}')`])

        if (lemonyFresh[channel].timers[`say-youre-welcome`].listening) {
            resetCooldownTimer(channel, `say-youre-welcome`)

            const welcomes = [
                `@${user.displayName}`,
                `You're welcome, ${userNickname}`,
                `No problem, ${userNickname}`,
                `My pleasure, ${userNickname}`,
            ]
            const welcome = Math.floor(Math.random() * welcomes.length)

            let response = `${welcomes[welcome]}`
            if (welcome === 0) {
                const appends = [
                    `you're welcome`,
                    `no problem`,
                    `my pleasure`
                ]
                response += ` ${appends[Math.floor(Math.random() * appends.length)]}`
            }
            const positiveEmote = getContextEmote(`positive`, channel)
            response += `! ${positiveEmote}`
            bot.say(chatroom, response)

        } else { logMessage([`-> Timer in ${channel} 'sayYoureWelcome' is not currently listening`]) }
    },
    sayThanks(props) {
        const { bot, chatroom, channel, user, userNickname } = props
        logMessage([`> sayThanks(channel: '${channel}', userNickname: '${userNickname}')`])

        if (lemonyFresh[channel].timers[`say-thanks`].listening) {
            resetCooldownTimer(channel, `say-thanks`)

            const thanks = [
                `@${user.displayName}`,
                `Thanks, ${userNickname}`,
                `Thanks, ${userNickname}`,
                `Thanks, ${userNickname}`,
                `Thank you, ${userNickname}`,
                `Thank you, ${userNickname}`,
                `Thank you, ${userNickname}`,
                `Thank you so much, ${userNickname}`,
                `Hey thanks, ${userNickname}`,
                `Aw thanks, ${userNickname}`
            ]
            const sentiment = Math.floor(Math.random() * thanks.length)

            let response = `${thanks[sentiment]}`
            if (sentiment === 0) {
                const appends = [
                    `thanks`,
                    `thank you`,
                    `thank you so much`
                ]
                response += ` ${appends[Math.floor(Math.random() * appends.length)]}`
            }
            const positiveEmote = getContextEmote(`positive`, channel)
            response += `! ${positiveEmote}`
            bot.say(chatroom, response)

        } else { logMessage([`-> Timer in ${channel} 'sayThanks' is not currently listening`]) }
    },
    sayMood(props) {
        const { bot, chatroom, channel, user, userNickname } = props
        logMessage([`> sayMood(channel: '${channel}', userNickname: '${userNickname}')`])

        if (lemonyFresh[channel].timers[`say-mood`].listening) {
            resetCooldownTimer(channel, `say-mood`)

            const neutralEmote = getContextEmote(`neutral`, channel)
            const dumbEmote = getContextEmote(`dumb`, channel)

            const botMoods = {
                dev: {
                    replies: [
                        `@${user.displayName}`,
                        `I'm okay ${userNickname}, still recovering!`,
                        `I'm hanging in there ${userNickname}, hoping I don't crash!`,
                        `I'm getting better ${userNickname}, almost done being rebuilt I think!`,
                    ],
                    appends: [
                        `I'm fine, hopefully almost done being rebuilt. Hope you're well!`,
                        `hanging in there, still in recovery!`,
                        `just trying my best not to crash!`
                    ],
                    emote: dumbEmote
                },
                happy: {
                    replies: [
                        `@${user.displayName}`,
                        `I'm doing great, ${userNickname}!`,
                        `I'm doing well ${userNickname}, hope you are too!`,
                        `Doing well ${userNickname}, thanks for asking!`,
                    ],
                    appends: [
                        `I'm good, hope you're well!`,
                        `doing great, thanks for asking!`,
                        `I'm doing well, thank you!`
                    ],
                    emote: neutralEmote
                }
            }

            if (!(settings.botMood in botMoods)) {
                logMessage([`-> botMood '${settings.botMood}' not found`])
                return
            }

            const replies = botMoods[settings.botMood].replies
            const appends = botMoods[settings.botMood].appends
            const numReply = Math.floor(Math.random() * replies.length)

            let reply = `${replies[numReply]}`
            if (numReply === 0) { reply += ` ${appends[Math.floor(Math.random() * appends.length)]}` }

            reply += ` ${botMoods[settings.botMood].emote}`
            bot.say(chatroom, reply)

        } else { logMessage([`-> Timer in ${channel} 'sayMood' is not currently listening`]) }
    },
    handleRaid(props) {
        const { bot, chatroom, channel, username, isModOrVIP } = props
        logMessage([`> handleRaid(channel: '${channel}')`])

        // VIPs only
        if (!isModOrVIP) {
            logMessage([`-> ${username} isn't a VIP or mod, ignoring`])
            return
        }

        if (lemonyFresh[channel].timers[`!raid`].listening) {
            resetCooldownTimer(channel, `!raid`)

            const subRaidMessage = lemonyFresh[channel].subRaidMessage
            const noSubRaidMessage = lemonyFresh[channel].noSubRaidMessage
            const delay = users[BOT_USERNAME].channels[channel].mod || users[BOT_USERNAME].channels[channel].vip ? 1000 : 2000
            const positiveEmote = getContextEmote(`positive`, channel)

            if (subRaidMessage) { bot.say(chatroom, subRaidMessage) }
            if (noSubRaidMessage) {
                setTimeout(() => {
                    bot.say(chatroom, noSubRaidMessage)
                }, subRaidMessage ? delay : 1)
            }
            if (subRaidMessage && noSubRaidMessage) {
                setTimeout(() => {
                    bot.say(chatroom, `Thanks for sticking around for the raid! If you're subscribed to the channel, you can use the first raid message, otherwise you can use the second raid message! ${positiveEmote}`)
                }, delay * 2)
            }

        } else { logMessage([`-> Timer in ${channel} '!raid' is not currently listening`]) }
    },
    welcomeBack(props) {
        const { bot, chatroom, channel, userChannel, userNickname } = props
        logMessage([`> welcomeBack(channel: '${channel}', userNickname: '${userNickname}')`])

        const greetingEmote = getContextEmote(`greeting`, channel)
        userChannel.away = false
        userChannel.awayMessage = ``
        setTimeout(() => bot.say(chatroom, `Welcome back, ${userNickname}! ${greetingEmote}`), 5000)
    },
    funTimerGuess(props) {
        const { bot, chatroom, message, channel, user, userNickname } = props
        logMessage([`> funTimerGuess(channel: '${channel}', message: '${message}', userNickname: '${userNickname}', number: ${lemonyFresh[channel].funTimer})`])

        const regex = new RegExp(`\\b${lemonyFresh[channel].funTimer}\\b`)

        if (regex.test(message)) {
            user.lemons++
            const lemonEmote = getContextEmote(`lemon`, channel)
            bot.say(chatroom, `That's right ${userNickname}, the number was ${lemonyFresh[channel].funTimer}. Have a lemon! ${lemonEmote}`)
        } else {
            const neutralEmote = getContextEmote(`neutral`, channel)
            bot.say(chatroom, `Sorry ${userNickname}, the number was ${lemonyFresh[channel].funTimer}. Next time! ${neutralEmote}`)
        }
        lemonyFresh[channel].funTimer = 0
        lemonyFresh[channel].funTimerGuesser = ``
    },
    chant(props) {
        const { bot, chatroom, args } = props
        logMessage([`> chant(chatroom: '${chatroom}', args: ${logArr(args)})`])

        const emotes = [
            ...Object.keys(lemonyFresh).map(channel => lemonyFresh[channel].followEmotes),
            ...Object.keys(lemonyFresh).map(channel => lemonyFresh[channel].subEmotes),
            ...Object.keys(lemonyFresh).map(channel => lemonyFresh[channel].bttvEmotes),
            ...settings.globalEmotes.twitch,
            ...settings.globalEmotes.bttv
        ].flat()

        const chant = args
            .map(word => emotes.includes(word) ? word : word.toUpperCase())
            .join(` `)

        const response = Array(settings.chantCount)
            .fill(`${chant} ${settings.chantEmote}`)
            .join(` `)

        bot.say(chatroom, `📣️ ${response}`)
    },
    yell(props) {
        const { bot, message, userNickname, currentTime } = props

        // Collect channels bot is currently joined to
        const mostRecentMessages = {}
        for (const channel of bot.channels) { mostRecentMessages[channel.substring(1)] = 0 }

        // Create table of most recently-sent message times from non-bots
        for (const channel in mostRecentMessages) {
            for (const username in users) {
                if (channel in users[username].channels
                    && !settings.ignoredBots.includes(username)
                    && users[username].channels[channel].sentAt > mostRecentMessages[channel]) {
                    mostRecentMessages[channel] = users[username].channels[channel].sentAt
                }
            }
        }

        // Filter out channels that have had message activity more than an hour ago
        const recentChannels = Object.keys(mostRecentMessages).filter(channel => currentTime - mostRecentMessages[channel] < 3600000)
        logMessage([`> yell(userNickname: '${userNickname}', recentChannels: ${logArr(recentChannels)})`])

        recentChannels.forEach(channel => bot.say(`#${channel}`, `${userNickname} says: ${message.substring(6)}`))
    },
    setAway(props) {
        const { bot, chatroom, args, command, channel, username, userChannel, userNickname } = props
        logMessage([`> setAway(channel: '${channel}', username: '${username}', args: ${logArr(args)})`])

        userChannel.away = true
        if (args.length) { userChannel.awayMessage = args.join(` `) }

        const byeEmote = getContextEmote(`bye`, channel)
        if (command !== `!lurk`) {
            userChannel.awayMessage
                ? bot.say(chatroom, `See you later, ${userNickname}! I'll pass along your away message if they mention you! ${byeEmote}`)
                : bot.say(chatroom, `See you later, ${userNickname}! I'll let people know you're away if they mention you! ${byeEmote}`)
        }

        // This helps prevent users from being welcomed back in the distant future
        setTimeout(() => {
            userChannel.away = false
            userChannel.awayMessage = ``
        }, settings.maxWelcomeBackMinutes * 1000)
    },
    reportAway(props) {
        const { bot, chatroom, message, channel, currentTime } = props

        for (const targetName of Object.keys(users)) {
            const target = users[targetName]
            const targetNickname = target.nickname || target.displayName
            const regex = new RegExp(`\\b(@?${targetName}|${targetNickname})\\b`, `i`)

            if (target.channels[channel]?.away && regex.test(message)) {
                const elapsedTime = Math.round((currentTime - target.channels[channel].sentAt) / 60000)
                logMessage([`> reportAway(channel: '${channel}', targetNickname: '${targetNickname}', elapsedTime: ${pluralize(elapsedTime, `minute`, `minutes`)})`])
                if (elapsedTime > 1) {
                    const reply = `${targetNickname} has been away for ~${pluralize(elapsedTime, `minute`, `minutes`)}!${target.channels[channel].awayMessage ? ` Their away message: "${target.channels[channel].awayMessage}"` : ``}`
                    bot.say(chatroom, reply)
                } else {
                    logMessage([`-> ${targetName} has been away for less than one-minute grace period`])
                }
            }
        }
    },
    makeMultiTwitchLink(props) {
        const { bot, chatroom, args, channel } = props
        logMessage([`> makeMultiTwitchLink(args: ${logArr(args)})`])

        const negativeEmote = getContextEmote(`negative`, channel)
        const neutralEmote = getContextEmote(`neutral`, channel)
        const dumbEmote = getContextEmote(`dumb`, channel)

        if (args.length < 2) {
            bot.say(chatroom, `Please provide at least two usernames! ${neutralEmote}`)
            return
        }

        const usernames = args
            .map(arg => arg.replace(/^[@#]/g, ``).toLowerCase())
            .filter(arg => twitchUsernamePattern.test(arg))
            .join(`/`)

        // Check how many valid usernames remain after filtering
        if (usernames.split(`/`).length < 2) {
            bot.say(chatroom, `Not enough valid usernames were found! ${dumbEmote}`)
            return
        }

        // Check if URL exceeds 500-character limit
        if (usernames.length > 475) {
            bot.say(chatroom, `Too many usernames provided! ${negativeEmote}`)
            return
        }

        const url = `https://multitwitch.live/${usernames}`
        bot.say(chatroom, url)
    },
    tiny(props) {
        const { bot, chatroom, args } = props
        const message = transformText(`superscript`, args.join(` `))
        if (!message) {
            bot.say(chatroom, `ᵗᶦⁿʸ`)
            return
        }
        bot.say(chatroom, message)
    },
    cursive(props) {
        const { bot, chatroom, args } = props
        const message = transformText(`cursive`, args.join(` `))
        if (!message) {
            bot.say(chatroom, `𝒸𝓊𝓇𝓈𝒾𝓋𝑒`)
            return
        }
        bot.say(chatroom, message)
    },
    bold(props) {
        const { bot, chatroom, args, command } = props
        const message = transformText(`bold`, args.join(` `))
        if (!message) {
            bot.say(chatroom, command === `!big` ? `𝐇𝐔𝐆𝐄` : command === `!huge` ? `𝐁𝐈𝐆` : `𝐁𝐎𝐋𝐃`)
            return
        }
        bot.say(chatroom, message)
    },
    doubleStruck(props) {
        const { bot, chatroom, args, command } = props
        const message = transformText(`double-struck`, args.join(` `))
        if (!message) {
            bot.say(chatroom, `𝕎𝕠𝕨`)
            return
        }
        bot.say(chatroom, message)
    },
    contextReact(props, context) {
        const { bot, chatroom, channel } = props
        const emote = getContextEmote(context, channel)
        bot.say(chatroom, emote)
    },
    pyramidListener(bot, chatroom, channel, message, self, username, aprilFools) {
        const userNickname = users[username].nickname || users[username].displayName
        const userChannel = users[username].channels[channel]
        const arr = message.split(` `)

        // Interrupt other pyramids
        for (const user in users) {
            if (channel in users[user].channels && user !== username && users[user].channels[channel].pyramidWord) {
                users[user].channels[channel].pyramidWord = ``
                users[user].channels[channel].pyramidCount = 1
                users[user].channels[channel].pyramidMaxCount = 0
                users[user].channels[channel].pyramidAscending = true
            }
        }

        if (arr.length === 1 && !userChannel.pyramidWord) {
            // First step in pyramid
            userChannel.pyramidWord = arr[0]
            userChannel.pyramidCount++
        } else if (userChannel.pyramidCount === 1 && arr.length === 1 && arr.filter(el => el === userChannel.pyramidWord).length === userChannel.pyramidCount) {
            // Successfully completed pyramid
            if (self) {
                const delay = userChannel.mod || userChannel.vip || username === channel ? 1000 : 2000
                setTimeout(() => bot.say(chatroom, `;)`), delay)
            } else {
                const positiveEmote = getContextEmote(`positive`, channel)
                bot.say(chatroom, `Congrats on your ${userChannel.pyramidMaxCount}-length ${userChannel.pyramidWord} pyramid, ${userNickname}! ${positiveEmote}`)
            }
            userChannel.pyramidWord = ``
            userChannel.pyramidCount = 1
            userChannel.pyramidMaxCount = 0
            userChannel.pyramidAscending = true
        } else if (arr.length === userChannel.pyramidCount && arr.filter(el => el === userChannel.pyramidWord).length === userChannel.pyramidCount) {
            // Successful next step in pyramid, expect next count
            userChannel.pyramidAscending
                ? userChannel.pyramidCount++
                : userChannel.pyramidCount--
        } else if (arr.length === userChannel.pyramidCount - 2 && arr.filter(el => el === userChannel.pyramidWord).length === 1) {
            // Reset - Pyramid too short
            userChannel.pyramidWord = ``
            userChannel.pyramidCount = 1
            userChannel.pyramidMaxCount = 0
            userChannel.pyramidAscending = true
        } else if (userChannel.pyramidAscending && arr.length === userChannel.pyramidCount - 2 && arr.filter(el => el === userChannel.pyramidWord).length === userChannel.pyramidCount - 2) {
            // Pyramid is now going down
            userChannel.pyramidAscending = false
            userChannel.pyramidMaxCount = userChannel.pyramidCount - 1
            userChannel.pyramidCount -= 3
        } else if (userChannel.pyramidWord) {
            // Reset - Pyramid aborted
            userChannel.pyramidWord = ``
            userChannel.pyramidCount = 1
            userChannel.pyramidMaxCount = 0
            userChannel.pyramidAscending = true
        }

        if (aprilFools && arr.length === 2 && !userChannel.pyramidAscending) {
            const interruptions = [
                `oh`,
                `oops`,
                `whoops`,
                `no`,
                `stop`,
                `:)`
            ]
            if (!containsInaccessibleEmotes(arr[0], channel)) {
                interruptions.push(arr[0], arr[0], arr[0], arr[0], arr[0], arr[0])
            }
            const interruption = interruptions[Math.floor(Math.random() * interruptions.length)]
            bot.say(chatroom, interruption)
        }
    }
}
