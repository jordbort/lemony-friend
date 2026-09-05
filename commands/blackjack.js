const BOT_USERNAME = process.env.BOT_USERNAME

const { lemonyFresh, users } = require(`../data`)
const { arrToList, pluralize, getContextEmote, logMessage, shuffle, getOrdinalNumeralSuffix } = require(`../utils`)

const deckOfCards = [
    `2 ♠️`, `3 ♠️`, `4 ♠️`, `5 ♠️`, `6 ♠️`, `7 ♠️`, `8 ♠️`, `9 ♠️`, `10 ♠️`, `J ♠️`, `Q ♠️`, `K ♠️`, `A ♠️`,
    `2 ♦️`, `3 ♦️`, `4 ♦️`, `5 ♦️`, `6 ♦️`, `7 ♦️`, `8 ♦️`, `9 ♦️`, `10 ♦️`, `J ♦️`, `Q ♦️`, `K ♦️`, `A ♦️`,
    `2 ♣️`, `3 ♣️`, `4 ♣️`, `5 ♣️`, `6 ♣️`, `7 ♣️`, `8 ♣️`, `9 ♣️`, `10 ♣️`, `J ♣️`, `Q ♣️`, `K ♣️`, `A ♣️`,
    `2 ♥️`, `3 ♥️`, `4 ♥️`, `5 ♥️`, `6 ♥️`, `7 ♥️`, `8 ♥️`, `9 ♥️`, `10 ♥️`, `J ♥️`, `Q ♥️`, `K ♥️`, `A ♥️`
]

const name = (username) => users[username].nickname || users[username].displayName
const renderCards = (arr) => `[${arr.join(`, `)}]`
const article = (card) => `${card.startsWith(`8`) || card.startsWith(`A`) ? `an` : `a`} ${renderCards([card])}`
const getPlayer = (game, username) => game.players.filter(p => p.name === username)[0]
const addPlayer = (game, username, bet) => game.players.push({ name: username, hands: [{ cards: [], score: 0, bet: bet }], currentHand: 0 })

// Configurable dealer hit on soft 17
const hasSoft17 = (hand) => hand.score === 17 && hand.cards.map(card => evaluate(card)).includes(11)
const dealerMustHit = (game, hand) => hand.score < 17 || (hasSoft17(hand) && game.hitSoft17)

function addToBlackjack(bot, chatroom, channel, username, bet) {
    logMessage([`> addToBlackjack(channel: '${channel}', username: '${username}', bet: ${bet})`])
    addPlayer(lemonyFresh[channel].blackjack, username, bet)

    const neutralEmote = getContextEmote(`neutral`, channel)
    const reply = `${name(username)} has joined the game of Blackjack with ${bet ? `a bet of ${pluralize(bet, `lemon`, `lemons`)}` : `no bet`}! ${neutralEmote}`
    bot.say(chatroom, reply)
}

function evaluate(card) {
    switch (card) {
        case `2 ♠️`:
        case `2 ♦️`:
        case `2 ♣️`:
        case `2 ♥️`:
            return 2
        case `3 ♠️`:
        case `3 ♦️`:
        case `3 ♣️`:
        case `3 ♥️`:
            return 3
        case `4 ♠️`:
        case `4 ♦️`:
        case `4 ♣️`:
        case `4 ♥️`:
            return 4
        case `5 ♠️`:
        case `5 ♦️`:
        case `5 ♣️`:
        case `5 ♥️`:
            return 5
        case `6 ♠️`:
        case `6 ♦️`:
        case `6 ♣️`:
        case `6 ♥️`:
            return 6
        case `7 ♠️`:
        case `7 ♦️`:
        case `7 ♣️`:
        case `7 ♥️`:
            return 7
        case `8 ♠️`:
        case `8 ♦️`:
        case `8 ♣️`:
        case `8 ♥️`:
            return 8
        case `9 ♠️`:
        case `9 ♦️`:
        case `9 ♣️`:
        case `9 ♥️`:
            return 9
        case `10 ♠️`:
        case `10 ♦️`:
        case `10 ♣️`:
        case `10 ♥️`:
        case `J ♠️`:
        case `J ♦️`:
        case `J ♣️`:
        case `J ♥️`:
        case `Q ♠️`:
        case `Q ♦️`:
        case `Q ♣️`:
        case `Q ♥️`:
        case `K ♠️`:
        case `K ♦️`:
        case `K ♣️`:
        case `K ♥️`:
            return 10
        case `A ♣️`:
        case `A ♦️`:
        case `A ♠️`:
        case `A ♥️`:
            return 11
        default:
            return 0
    }
}

function processScore(game, idxPlayer, idxHand) {
    const currentHand = game.players[idxPlayer].hands[idxHand]
    const values = currentHand.cards.map(card => evaluate(card))

    let score = values.reduce((prev, curr) => prev + curr, 0)
    while (score > 21 && values.includes(11)) {
        values[values.indexOf(11)] = 1
        score = values.reduce((prev, curr) => prev + curr, 0)
    }

    currentHand.score = score
}

function discardAllCards(game) {
    game.players.forEach(p => {
        p.hands.forEach(hand => {
            while (hand.cards.length) { game.discardPile.push(hand.cards.shift()) }
        })
    })
}

const dispatchTimers = {}
function dispatchMessages(bot, chatroom, game, messageQueue, endGame = false) {
    // In case command interrupts gameplay
    clearTimeout(dispatchTimers[chatroom])

    messageQueue.forEach((msg, idx) => {
        dispatchTimers[chatroom] = setTimeout(() => {
            bot.say(chatroom, msg)
            if (endGame && idx === messageQueue.length - 1) {
                discardAllCards(game)
                game.listening = false
            }
        }, game.messageDelay * idx)
    })
}

function payout(bot, chatroom, channel, messageQueue) {
    const bj = lemonyFresh[channel].blackjack
    const dealerScore = bj.players[bj.players.length - 1].hands[0].score

    const results = {
        gotBlackjack: [],
        won: [],
        push: [],
        lost: []
    }

    // Fill out results and exchange lemons
    for (let i = 0; i < bj.players.length - 1; i++) {
        users[bj.players[i].name].blackjackRoundsPlayed++
        const nickname = name(bj.players[i].name)

        bj.players[i].hands.forEach((hand, idx) => {
            if (hand.score === 21 && hand.cards.length === 2 && hand.score !== dealerScore && bj.players[i].hands.length === 1) {
                // Beat the dealer with a Blackjack
                results.gotBlackjack.push(nickname)
                users[bj.players[i].name].lemons += (hand.bet * 3)
                users[bj.players[i].name].blackjackNetGains += (hand.bet * 2)
                users[BOT_USERNAME].lemons -= (hand.bet * 3)
                users[BOT_USERNAME].blackjackNetGains -= (hand.bet * 3)
            } else if ((hand.score > dealerScore || dealerScore > 21) && hand.score <= 21) {
                // Won against the dealer
                results.won.push(bj.players[i].hands.length > 1 ? `${nickname}'s ${getOrdinalNumeralSuffix(idx + 1)} hand` : nickname)
                users[bj.players[i].name].lemons += (hand.bet * 2)
                users[bj.players[i].name].blackjackNetGains += hand.bet
                users[BOT_USERNAME].lemons -= (hand.bet * 2)
                users[BOT_USERNAME].blackjackNetGains -= hand.bet
            } else if ((hand.score === dealerScore && hand.score <= 21) || (hand.score > 21 && dealerScore > 21)) {
                // Push
                results.push.push(bj.players[i].hands.length > 1 ? `${nickname}'s ${getOrdinalNumeralSuffix(idx + 1)} hand` : nickname)
                users[bj.players[i].name].lemons += hand.bet
            } else {
                // Lost
                results.lost.push(bj.players[i].hands.length > 1 ? `${nickname}'s ${getOrdinalNumeralSuffix(idx + 1)} hand` : nickname)
                users[bj.players[i].name].blackjackNetGains -= hand.bet
                users[BOT_USERNAME].lemons += hand.bet
                users[BOT_USERNAME].blackjackNetGains += hand.bet
            }
        })
    }
    // In case the dealer runs out of lemons
    if (users[BOT_USERNAME].lemons < 0) { users[BOT_USERNAME].lemons = 0 }
    users[BOT_USERNAME].blackjackRoundsPlayed++

    // Add final results message to the queue
    const reply = arrToList(Object.keys(results)
        .filter(key => results[key].length)
        .map(key => `${arrToList(results[key])} ${key === `gotBlackjack`
            ? `got a Blackjack and won 3x their bet${results[key].length === 1 ? `` : `s`}`
            : key === `won`
                ? `won and got 2x their bet${results[key].length === 1 ? `` : `s`}`
                : key === `push`
                    ? `tied with the dealer and ${results[key].length === 1 ? `was` : `were`} returned their bet${results[key].length === 1 ? `` : `s`}`
                    : `lost their bet${results[key].length === 1 ? `` : `s`} to the dealer`}`
        ), `and`, true)
    // Exclude players who didn't make a bet from the lemon count too
    const lemonCounts = arrToList(bj.players
        .filter((p, idx) => p.hands[0].bet && idx !== bj.players)
        .map(p => `${name(p.name)} has ${pluralize(users[p.name].lemons, `lemon`, `lemons`)}`
        ), `and`, true)
    const lemonEmote = getContextEmote(`lemon`, channel)
    messageQueue.push(`${reply}!${lemonCounts ? ` Now ${lemonCounts}` : ``} ${lemonEmote}`)

    dispatchMessages(bot, chatroom, bj, messageQueue, true)
}

function dealCard(game, idxPlayer, idxHand) {
    const cards = game.players[idxPlayer].hands[idxHand].cards
    const dealtCard = game.deck.shift()
    cards.push(dealtCard)
    processScore(game, idxPlayer, idxHand)

    // logMessage([`> dealCard(idxPlayer: ${idxPlayer}, idxHand: ${idxHand}, dealtCard: ${renderCards([dealtCard])})`])
    return dealtCard
}

function dealToSelf(channel, messageQueue) {
    const bj = lemonyFresh[channel].blackjack
    const dealer = bj.players[bj.players.length - 1]
    const dealerHand = dealer.hands[0]

    const hypeEmote = getContextEmote(`hype`, channel)
    const positiveEmote = getContextEmote(`positive`, channel)
    const neutralEmote = getContextEmote(`neutral`, channel)
    const upsetEmote = getContextEmote(`upset`, channel)

    if (dealerMustHit(bj, dealerHand)) {
        messageQueue.push(`I have ${dealerHand.score} showing ${renderCards(dealerHand.cards)} - I'll hit! ${neutralEmote}`)
        while (dealerMustHit(bj, dealerHand)) {
            const dealtCard = dealCard(bj, bj.players.length - 1, 0)

            if (dealerMustHit(bj, dealerHand)) {
                const hitMessage = `I got ${article(dealtCard)} and have ${dealerHand.score} showing ${renderCards(dealerHand.cards)} - I'll hit again! ${neutralEmote}`
                messageQueue.push(hitMessage)
            } else if (dealerHand.score > 21) {
                const bustMessage = `I got ${article(dealtCard)} and have ${dealerHand.score} showing ${renderCards(dealerHand.cards)} - I busted! ${upsetEmote}`
                messageQueue.push(bustMessage)
            } else {
                const stayMessage = `I got ${article(dealtCard)} and have ${dealerHand.score} showing ${renderCards(dealerHand.cards)}${dealerHand.score !== 21 ? ` - I'll stay!` : ``} ${dealerHand.score === 21 ? hypeEmote : dealerHand.score >= 17 ? positiveEmote : neutralEmote}`
                messageQueue.push(stayMessage)
            }
        }
    } else {
        messageQueue.push(`I have ${renderCards(dealerHand.cards)} and will stay with ${dealerHand.score} ${dealerHand.score === 21 ? hypeEmote : dealerHand.score >= 17 ? positiveEmote : neutralEmote}`)
    }
    return messageQueue
}

function gameOver(bot, chatroom, channel, messageQueue) {
    const bj = lemonyFresh[channel].blackjack
    const dealer = bj.players[bj.players.length - 1]
    const dealerHand = dealer.hands[0]
    const dumbEmote = getContextEmote(`dumb`, channel)

    const playerScores = bj.players
        .filter(p => p.name !== BOT_USERNAME)
        .map(p => p.hands.map(hand => hand.score > 21).flat())
        .flat()


    // Check if everyone busted before dealing to self
    if (playerScores.includes(false)) {
        messageQueue = dealToSelf(channel, messageQueue)
    } else if (!bj.deck.length) {
        messageQueue.push(`I have ${dealerHand.score} showing ${renderCards(dealerHand.cards)} and can't draw a card ${dumbEmote}`)
    } else {
        messageQueue.push(`I have ${dealerHand.score} showing ${renderCards(dealerHand.cards)} and ${bj.players.length > 2 ? `everyone else` : name(bj.players[0].name)} busted ${dumbEmote}`)
    }

    payout(bot, chatroom, channel, messageQueue)
}

function setUpNextHand(bot, chatroom, channel, messageQueue) {
    const bj = lemonyFresh[channel].blackjack
    const p = bj.players[bj.currentPlayer]

    const hypeEmote = getContextEmote(`hype`, channel)
    const positiveEmote = getContextEmote(`positive`, channel)
    const neutralEmote = getContextEmote(`neutral`, channel)

    // Next hand from player who split, or next player's hand
    if (p.hands[p.currentHand + 1]) {
        p.currentHand++
        const nickname = name(p.name)
        const nextHand = p.hands[p.currentHand]
        const dealtCard = dealCard(bj, bj.currentPlayer, p.currentHand)

        if (nextHand.score === 21) {
            messageQueue.push(`Also, ${nickname}'s ${getOrdinalNumeralSuffix(p.currentHand + 1)} hand was dealt ${article(dealtCard)} and has ${nextHand.score}! ${hypeEmote} ${renderCards(nextHand.cards)}`)
            setUpNextHand(bot, chatroom, channel, messageQueue)
        } else {
            const options = [`!hit`, `!stay`]
            messageQueue.push(`Now, ${nickname}'s ${getOrdinalNumeralSuffix(p.currentHand + 1)} hand was dealt ${article(dealtCard)} and has ${nextHand.score} showing ${nextHand.score >= 17 ? positiveEmote : neutralEmote} ${renderCards(nextHand.cards)} - You may ${arrToList(options, `or`)}`)
            dispatchMessages(bot, chatroom, bj, messageQueue)
        }
    } else {
        bj.currentPlayer++

        if (bj.currentPlayer === bj.players.length - 1) {
            gameOver(bot, chatroom, channel, messageQueue)
        } else {
            const np = bj.players[bj.currentPlayer]
            const npNickname = name(np.name)
            const npHand = np.hands[0]

            if (npHand.score === 21) {
                messageQueue.push(`Now, ${npNickname} has ${npHand.score} showing! ${hypeEmote} ${renderCards(npHand.cards)}`)
                setUpNextHand(bot, chatroom, channel, messageQueue)
            } else {
                const options = [`!hit`, `!stay`]
                if (npHand.bet && users[np.name].lemons >= npHand.bet) { options.push(`!doubledown`) }
                if (evaluate(npHand.cards[0]) === evaluate(npHand.cards[1]) && users[np.name].lemons >= npHand.bet) { options.push(`!split`) }
                messageQueue.push(`Now, ${npNickname} has ${npHand.score} showing ${npHand.score >= 17 ? positiveEmote : neutralEmote} ${renderCards(npHand.cards)} - You may ${arrToList(options, `or`)}`)
                dispatchMessages(bot, chatroom, bj, messageQueue)
            }
        }
    }
}

function splitHand(game, idxPlayer, idxHand) {
    logMessage([`> splitHand(idxPlayer: ${idxPlayer}, idxHand: ${idxHand})`])
    const hands = game.players[idxPlayer].hands

    // Move second card from current hand to a new hand and deal one card to both hands
    hands.push({ cards: [], score: 0, bet: hands[idxHand].bet })
    hands[hands.length - 1].cards.push(hands[idxHand].cards.pop())
    dealCard(game, idxPlayer, idxHand)
}

function initBlackjack(bot, chatroom, channel, username, bet) {
    logMessage([`> initBlackjack(channel: ${channel}, username: ${username}, bet: ${bet})`])
    const bj = lemonyFresh[channel].blackjack
    const positiveEmote = getContextEmote(`positive`, channel)

    bj.players.length = 0
    bj.currentPlayer = 0
    bj.listening = true

    addPlayer(bj, username, bet)
    const reply = `${name(username)} started a game of Blackjack with ${bet ? `a bet of ${pluralize(bet, `lemon`, `lemons`)}` : `no bet`}! Type !blackjack or !bj in the next ${pluralize(bj.signupSeconds, `second`, `seconds`)} with your bet to join in too! ${positiveEmote} `
    bot.say(chatroom, reply)

    bj.signup = Number(setTimeout(() => {
        const hypeEmote = getContextEmote(`hype`, channel)
        const positiveEmote = getContextEmote(`positive`, channel)
        const neutralEmote = getContextEmote(`neutral`, channel)

        bj.signup = false
        bj.players = shuffle(bj.players)

        // Decide whether to reshuffle the deck, and burn a card if so
        const reshuffleDeck = (bj.players.length + 1) * 11 > bj.deck.length
        bj.deck = reshuffleDeck
            ? (bj.discardPile.length = 0, shuffle(Array(bj.numberOfDecks).fill(deckOfCards).flat()))
            : bj.deck
        if (reshuffleDeck) bj.discardPile.push(bj.deck.shift())

        // Add dealer, and deal two rounds of cards
        addPlayer(bj, BOT_USERNAME, 0)
        for (let i = 0; i < 2; i++) { bj.players.forEach((player, idx) => dealCard(bj, idx, 0)) }

        const table = arrToList(bj.players
            .map(p => p.name === BOT_USERNAME
                ? `${name(p.name)} is showing ${renderCards([p.hands[0].cards[0], `???`])}`
                : `${name(p.name)} and has ${renderCards(p.hands[0].cards)}`))
        bot.say(chatroom, `${reshuffleDeck ? `I have shuffled the deck! ` : ``}After dealing, ${table}`)

        setTimeout(() => {
            const fp = bj.players[0]
            const fpNickname = name(fp.name)
            const fpHand = fp.hands[0]
            if (fpHand.score === 21) {
                const message = `${fpNickname} has ${fpHand.score} showing! ${hypeEmote} ${renderCards(fpHand.cards)}`
                setUpNextHand(bot, chatroom, channel, [message])
            } else {
                const options = [`!hit`, `!stay`]
                if (fpHand.bet && users[fp.name].lemons >= fpHand.bet) { options.push(`!doubledown`) }
                if (evaluate(fpHand.cards[0]) === evaluate(fpHand.cards[1]) && users[fp.name].lemons >= fpHand.bet) { options.push(`!split`) }
                const reply = `${fpNickname} has ${fpHand.score} showing ${fpHand.score === 21 ? hypeEmote : fpHand.score >= 17 ? positiveEmote : neutralEmote} ${renderCards(fpHand.cards)} - You may ${arrToList(options, `or`)} `
                bot.say(chatroom, reply)
            }
        }, bj.messageDelay)
    }, bj.signupSeconds * 1000))
}

function changeBet(bot, chatroom, channel, player, bet) {
    const bj = lemonyFresh[channel].blackjack
    const nickname = name(player.name)

    const positiveEmote = getContextEmote(`positive`, channel)
    const negativeEmote = getContextEmote(`negative`, channel)

    // Only if Blackjack has started and it's the current player's turn
    if (bj.listening) {
        if (bj.signup) {
            // Must make a valid bet high than the previous one
            if (bet <= player.hands[0].bet) {
                bot.say(chatroom, `Your new bet has to be higher than the previous one, ${nickname}! ${negativeEmote}`)
                return
            }
            player.hands[0].bet = bet
            bot.say(chatroom, `${nickname} has updated their bet to ${bet}! ${positiveEmote}`)
        } else {
            bot.say(chatroom, `Sorry ${nickname}, it's too late to change your bet! ${negativeEmote}`)
        }
    }
}

function processBet(username, bet) {
    const user = users[username]
    if (user.lemons >= bet) {
        user.lemons -= bet
        return true
    }
    return false
}

function invalidBet(bot, chatroom, channel, username, bet) {
    const negativeEmote = getContextEmote(`negative`, channel)
    if (!Number.isInteger(bet) || bet < 0) {
        bot.say(chatroom, `${name(username)}, your bet must be a whole number of lemons! ${negativeEmote}`)
        return true
    }
    return false
}

module.exports = {
    playBlackjack(props) {
        const { bot, chatroom, args, username, channel, isMod } = props
        logMessage([`> playBlackjack(channel: '${channel}', username: '${username}')`])
        const bj = lemonyFresh[channel].blackjack

        // Cancel Blackjack game
        const neutralEmote = getContextEmote(`neutral`, channel)
        if (isMod && /^end$/i.test(args[0])) {
            if (bj.listening) {
                clearTimeout(bj.signup)
                bj.listening = false
                bj.signup = false
                discardAllCards(bj)
                bj.players.forEach(p => p.hands.forEach(hand => users[p.name].lemons += hand.bet))
                bot.say(chatroom, `The Blackjack game has been ended early, and all bets have been returned to the players ${neutralEmote}`)
            } else {
                logMessage([`-> No Blackjack game to end for '${channel}'`])
            }
            return
        }

        const nickname = name(username)
        const bet = Number(args[0]) || 0
        const negativeEmote = getContextEmote(`negative`, channel)
        if (bj.listening) {
            const player = getPlayer(bj, username)
            if (bj.signup) {
                if (invalidBet(bot, chatroom, channel, username, bet)) { return }
                if (player) {
                    const initialBet = player.hands[0].bet
                    if (!processBet(username, bet - initialBet)) {
                        bot.say(chatroom, `You don't have enough lemons for that bet, ${nickname}! ${negativeEmote}`)
                        return
                    }
                    changeBet(bot, chatroom, channel, player, bet)
                } else {
                    addToBlackjack(bot, chatroom, channel, username, bet)
                }
            } else {
                const error = player
                    ? `Sorry ${nickname}, it's too late to change your bet! ${negativeEmote}`
                    : `Please wait for this game of Blackjack to end, ${nickname}! ${neutralEmote}`
                bot.say(chatroom, error)
            }
        } else {
            if (invalidBet(bot, chatroom, channel, username, bet)) { return }
            if (!processBet(username, bet)) {
                bot.say(chatroom, `You don't have enough lemons to place that bet, ${nickname}! ${negativeEmote}`)
                return
            }
            initBlackjack(bot, chatroom, channel, username, bet)
        }
    },
    hit(props) {
        const { bot, chatroom, channel, username } = props
        const bj = lemonyFresh[channel].blackjack
        const p = bj.players[bj.currentPlayer]

        // Only if Blackjack has started and it's the current player's turn
        if (bj.listening && !bj.signup && username === p.name) {
            const dealtCard = dealCard(bj, bj.currentPlayer, p.currentHand)
            if (!dealtCard) {
                gameOver(bot, chatroom, channel, [`Oops, I ran out of cards...`])
                return
            }

            const hand = p.hands[p.currentHand]
            const nickname = name(p.name)
            if (hand.score > 21) {
                const upsetEmote = getContextEmote(`upset`, channel)
                const message = `${nickname} got ${article(dealtCard)} - You busted with ${hand.score}! ${upsetEmote} ${renderCards(hand.cards)}`
                setUpNextHand(bot, chatroom, channel, [message])
            } else if (hand.score === 21) {
                const hypeEmote = getContextEmote(`hype`, channel)
                const message = `${nickname} got ${article(dealtCard)} and has ${hand.score}! ${hypeEmote} ${renderCards(hand.cards)}`
                setUpNextHand(bot, chatroom, channel, [message])
            } else {
                const positiveEmote = getContextEmote(`positive`, channel)
                const neutralEmote = getContextEmote(`neutral`, channel)
                const message = `${nickname} got ${article(dealtCard)} and has ${hand.score} showing ${hand.score >= 17 ? positiveEmote : neutralEmote} ${renderCards(hand.cards)} - You can !hit or !stay`
                bot.say(chatroom, message)
            }
        }
    },
    doubleDown(props) {
        const { bot, chatroom, channel, username } = props
        const bj = lemonyFresh[channel].blackjack
        const p = bj.players[bj.currentPlayer]

        // Only if Blackjack has started and it's the current player's turn
        if (bj.listening && !bj.signup && username === p.name) {
            const hypeEmote = getContextEmote(`hype`, channel)
            const positiveEmote = getContextEmote(`positive`, channel)
            const neutralEmote = getContextEmote(`neutral`, channel)
            const negativeEmote = getContextEmote(`negative`, channel)
            const upsetEmote = getContextEmote(`upset`, channel)

            const nickname = name(p.name)
            const hand = p.hands[p.currentHand]

            // Can only double down if they've actually placed a bet
            if (!hand.bet) {
                bot.say(chatroom, `You can't double down if you haven't placed a bet, ${nickname}! ${negativeEmote}`)
                return
            }

            // Can only double down on the first opportunity
            if (p.hands[1] || hand.cards.length > 2) {
                bot.say(chatroom, `You can only double down at your first opportunity to hit, ${nickname}! ${negativeEmote}`)
                return
            }

            // Stop if player can't afford bet
            if (!processBet(username, hand.bet)) {
                bot.say(chatroom, `You don't have enough lemons to double your bet, ${nickname}! ${negativeEmote}`)
                return
            }

            hand.bet *= 2
            const dealtCard = dealCard(bj, bj.currentPlayer, p.currentHand)
            if (!dealtCard) {
                gameOver(bot, chatroom, channel, [`Oops, I ran out of cards...`])
                return
            }
            const message = `${nickname} doubled down and got ${article(dealtCard)} - They ${hand.score > 21 ? `busted with ${hand.score}! ${upsetEmote}` : `have ${hand.score} showing${hand.score === 21 ? `! ${hypeEmote}` : hand.score >= 17 ? `! ${positiveEmote}` : ` ${neutralEmote}`}`} ${renderCards(hand.cards)}`
            setUpNextHand(bot, chatroom, channel, [message])
        }
    },
    split(props) {
        const { bot, chatroom, channel, username } = props
        const bj = lemonyFresh[channel].blackjack
        const p = bj.players[bj.currentPlayer]

        // Only if Blackjack has started and it's the current player's turn
        if (bj.listening && !bj.signup && username === p.name) {
            const positiveEmote = getContextEmote(`positive`, channel)
            const neutralEmote = getContextEmote(`neutral`, channel)
            const negativeEmote = getContextEmote(`negative`, channel)

            const nickname = name(p.name)
            const hand = p.hands[p.currentHand]
            const hypeEmote = getContextEmote(`hype`, channel)

            // Stop if player has more than two cards, or they aren't the same value
            if (hand.cards.length !== 2 || evaluate(hand.cards[0]) !== evaluate(hand.cards[1])) {
                bot.say(chatroom, `You can't split your current hand, ${nickname}! ${negativeEmote}`)
                return
            }

            // Can only split if they've actually placed a bet
            if (!hand.bet) {
                bot.say(chatroom, `You can't split if you haven't placed a bet, ${nickname}! ${negativeEmote}`)
                return
            }

            // Stop if player can't afford bet
            if (!processBet(username, hand.bet)) {
                bot.say(chatroom, `You don't have enough lemons to afford the additional bet, ${nickname}! ${negativeEmote}`)
                return
            }

            splitHand(bj, bj.currentPlayer, p.currentHand)
            const cardValue = evaluate(hand.cards[0]) === 11 ? `ace` : evaluate(hand.cards[0])

            if (hand.score === 21) {
                const message = `${nickname} split their ${cardValue}s into separate hands. They were dealt ${article(hand.cards[1])} to their ${getOrdinalNumeralSuffix(p.currentHand + 1)} hand and have ${hand.score} showing! ${hypeEmote} ${renderCards(hand.cards)}`
                setUpNextHand(bot, chatroom, channel, [message])
            } else {
                const options = [`!hit`, `!stay`]
                if (evaluate(hand.cards[0]) === evaluate(hand.cards[1]) && users[p.name].lemons >= hand.bet) { options.push(`!split`) }
                bot.say(chatroom, `${nickname} split their ${cardValue}s into separate hands. They were dealt ${article(hand.cards[1])} to their ${getOrdinalNumeralSuffix(p.currentHand + 1)} hand and have ${hand.score} showing ${hand.score >= 17 ? positiveEmote : neutralEmote} ${renderCards(hand.cards)} - You may ${arrToList(options, `or`)}`)
            }
        }
    },
    stay(props) {
        const { bot, chatroom, channel, username } = props
        const bj = lemonyFresh[channel].blackjack
        const p = bj.players[bj.currentPlayer]

        // Only if Blackjack has started and it's the current player's turn
        if (bj.listening && !bj.signup && username === p.name) {
            const positiveEmote = getContextEmote(`positive`, channel)
            const neutralEmote = getContextEmote(`neutral`, channel)

            const hand = p.hands[p.currentHand]
            const message = `${name(p.name)} stands at ${hand.score}! ${hand.score >= 17 ? positiveEmote : neutralEmote} ${renderCards(hand.cards)}`
            setUpNextHand(bot, chatroom, channel, [message])
        }
    }
}
