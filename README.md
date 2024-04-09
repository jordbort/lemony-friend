# @lemony_friend 🍋️

Lemony Friend is a Twitch chatbot built for the Lemony Fresh streamers and their community.

## Boring commands 🍋️
- `!docs` - Use this command to get a link to this README.
- `!commands` - This command lists all the commonly-used commands lemony_friend has.
- `!access` - Use this command to get the link to Lemony Friend's authorization page. After following the prompts, the user should land on a page with a code to copy/paste into chat with the `!authorize` command. Giving access allows Lemony Friend to perform Twitch-related actions on behalf of the user, such as giving shoutouts, starting polls in chat, making announcements, etc.
- `!authorize` - This command can only be used by a streamer or moderator. It should be followed by the code created following the authorization prompts. If it is done successfully, an access token and refresh token are generated for the streamer.
- `!validate` - This command can only be used by a streamer or moderator. This command checks the lifespan of the user or channel's Twitch API access token. If it is invalid, it can be refreshed by using the `!refresh` command. If the user doesn't have an access token or valid refresh token, they must use the `!access` command to get a new OAuth token. This shouldn't be necessary to use, as lemony_friend automatically refreshes access tokens if they're found to be invalid, but could be helpful in troubleshooting.
- `!refresh` - This command can be used to generate a renewed access token for the user or streamer manually, as long there is a valid refresh token. This shouldn't be necessary to use, because commands that require the access token are programmed to attempt to refresh the access token once if the request doesn't go through successfully the first time.

## Commands for lemony_friend info 🍋️
- `!time` - This command can be used to get the current time, optionally in a provided time zone and locale. For example, you can use `!time Australia/Sydney` to get the time in Sydney, and `!time Asia/Seoul ko-KR` to get the current time in Seoul in the Korean date and time format. By default, this command falls back on whichever time zone and locale are specified in Lemony Friend's settings.
- `!mystats` - Use this command to get the JSON data of a user.
- `!color` (or `!colour`) - Use this command to get a user's chat message color.
- `!lastmsg` - This command can be used to get a user's last message in the current channel, or use `!lastmsg <user>` to specify a different user. You can also specify a channel, as in `!lastmsg <user> <channel>`. If the specified user hasn't spoken in the specified channel, it falls back on the current channel. If the specified user isn't known to lemony_friend, it falls back on the user of the command.
- `!msgcount` - This command can be used to get a count of all messages sent by a user across all Lemony Fresh channels. Use `!msgcount <user>` to specify another user.
- `!friend` (or `!friends`) - This command can be used to get a count of all users lemony_friend knows (including itself).
- `!goal` (or `!goals`) - This command is used followed by a number (of subscribers, dollars, etc.) to return a specific goal at that amount for that channel. This only works in channels with defined stream goals.
- `!lurk` (or `!away` or `!brb`) - This command marks the user as "away" in the current channel. Use `!lurk <message...>` to set a custom away message. Using `!lurk` (rather than `!away` or `!brb`) does not prompt a reply from lemony_friend, opting for a quieter exit. If a user is mentioned in chat by full username while they are marked as away, lemony_friend will mention that the user is away, along with an optional away message. Upon posting in chat again, lemony_friend marks the user as unaway.
- `!apply` - This is an easy way to apply pre-made nicknames to known users.
- `!online` (or `!onl`) - This command reports the time that the bot was booted up.

## Mod/VIP commands 🍋️
- `!so` - This command gives a shoutout to another user by looking them up using the [Twitch API](https://dev.twitch.tv/docs/api/). If the streamer or mod using the command has given lemony_friend access to their account with `!access`, it will also attempt to give the Twitch-powered `/shoutout` to the user as well. The latter has a cooldown built into Twitch, so it will not post successfully if too many are done in succession.
- `!raid` - It can be used to post one or both versions of the channel's raid message - one with sub emotes, and one without. This can be updated through the CLI (see below).
- `!announce` - This command can only be used by the streamer or a moderator. It is used to make an announcement the channel. It will be made in the name of the streamer, unless a mod gives `!access` to Lemony Friend. The announcement will be in the primary color of the channel, unless `!announceblue`, `!announcegreen`, `!announceorange`, or `!announcepurple` are used.
- `!poll` - This command can only be used by the streamer or a moderator. It is used to create a poll for the channel. The syntax for this command is `!poll <seconds> / Title of the poll / Choice 1 / Choice 2` and so on. Spaces before/after the slashes are not required, but the slashes themselves are. "Seconds" is a number between 15 and 1800 (thirty minutes). There must be at least two (or at most, five) choices.
- `!stoppoll` - This command can only be used by the streamer or a moderator. It is used to finish the current poll before the timer runs out, and show the results.
- `!cancelpoll` - This command can only be used by the streamer or a moderator. It is used to get rid of the current poll.

## Fun commands 🍋️
- `!hangman` - This command initiates a game of Hangman and chooses a random word by using the [Rando API](https://random-word-api.vercel.app/). Join the game using `!play`, even after the game has started.
- `!play` - Use this command to join an active game of Hangman.
- `!rps` - Use this command to challenge lemony_friend to a game of Rock, Paper, Scissors. You may can use `!rps rock` `!rps paper` `!rps scissors` to specify your move, or simply use `!rps` and a move will be chosen at random.
- `!chant` - Use this command to have lemony_friend chant it in all caps in chat. It
- `!yell` - Use this command with a message to send that message across all channels where someone has chatted in the past hour.
- `!define` (or `!definition` or `!meaning`) - This command can be used followed by a word to look up its definition using an API from [API Ninjas](https://api-ninjas.com/).
- `!lemon` (or `!lemons`) - This command can be used to check how many lemons the sender (or another user) has.
- `![use]lemon[append?]` - This command is a wildcard that can be used. [Use] can be any verb (or verb phrase), and [append?] could be an optional suffix, if "lemon" is meant to be a descriptor, possibly to pluralize "lemon" to all "lemons".
- `!lemonify` - This command can be used to transform another user's message into lemons.
- `!tempcmd` (or `!tmpcmd`) - This command is used to create custom commands that will be active until the next time lemony_friend is rebooted. Use `!tempcmd <commandname> <response...>` to create/edit a command name and reply, and `!tempcmd delete <commandname>` to delete a command.
- `!tempcmds` (or `!tmpcmds`) - This command lists all existing temporary commands.
- `!greet` - This command can be used to greet one or more users. Use `!greet <user>` to greet another user, `!greet <user1> <user2>...` to greet multiple users, or `!greet all` to greet all known users in the current channel who have chatted in the past hour, other than the user of the command.
- `!bye` (or `!gn` or `!goodnight`) - This command can be used to say good night to a user leaving chat.
- `!dadjoke` - This command gets a random joke from a [Dad Joke API](https://icanhazdadjoke.com/api).
- `!pokemon` - This command can be used to get useful information about a Pokémon from a [Pokémon API](https://pokeapi.co/).

## Command Lemon Interface 🍋️
If lemony_friend is present in your Twitch channel, or you are a moderator of a channel where lemony_friend is present, you are able to use the command `cli` to adjust lemony_friend's settings and data.

### `cli channel`
Use `cli channel` or `cli c` to access settings for the current channel (if you are the channel owner or a moderator of that channel), or your own channel. The current channel has priority, so if you are a moderator of the current channel, but would like to adjust settings for your own channel, you'll have to use this command either in your own channel, or where you are not a moderator but lemony_friend is present.

- `cli channel timers <timer_name> cooldown` or `cli c t <timer_name> cd`
- `cli channel timers <timer_name> listening` or `cli c t <timer_name> l`

Use this command to adjust the cooldown and "listening" status of timers for bot commands and replies, such as `!so` and `!raid`, etc. Having a cooldown prevents the same command from being responded to multiple times within that time period. Changing the "listening" status of a command or reply type to `false` prevents the bot from acknowledging the message. For example, if you already have a bot in your channel that handles shoutouts, and don't want lemony_friend to give them, you can use `cli channel timer !so listening false` to disable this behavior.

- `cli channel emotes` or `cli c e` (array of strings)

Use this command to update the list of emotes lemony_friend has access to within a channel.

- `cli channel bttvEmotes` or `cli c bttv` (array of strings)

Use this command to update the list of BTTV emotes lemony_friend has access to within a channel.

- `cli channel subRaidMessage` or `cli c srm` (string)

Use this command to update lemony_friend's response to the `!raid` command. The "sub" raid message is intended for raid messages which use emotes that require a subscription to the channel.

- `cli channel noSubRaidMessage` or `cli c nsrm` (string)

Use this command to update lemony_friend's response to the `!raid` command. The "no sub" raid message is intended for raid messages which do not use emotes that require a subscription to the channel (accessible to anyone).

- `cli channel redeems` or `cli c r` (array of strings)

Use this command to update the list of commands other bots might respond to. For example, adding `!buy <item>` could allow lemony_friend to use StreamElements loyalty points randomly to redeem store items.

- `cli channel rollFunNumber` or `cli c rfn` (boolean)

By default, lemony_friend posts a random message in chat after another chatter's every Nth message. Use this command to turn on or off this behavior.

### `cli users`
Use `cli users` or `cli u` to access settings for a specific user. Using, or not using, an @ when entering the username are both acceptable. In the case of non-English display names, the username must be used, as the display name will not be recognized.

- `cli user <@?username> nickname` or `cli u <@?username> nn` (string)

Use this command to adjust the nickname of a user. This will be used by the bot when addressing the user, or use their display name as a fallback if the nickname is empty.

- `cli user <@?username> away` or `cli u <@?username> a` (boolean)

Use this command to mark a user as known by the bot to be away. The bot will welcome them back upon their first message in chat.

- `cli user <@?username> awayMessage` or `cli u <@?username> am` (string)

Use this command to update a user's away message. This is mentioned by the bot if the user marked as being away is mentioned in chat.

### `cli settings`
Use `cli settings` or `cli s` to access lemony_friend's settings. These are global (not specific to a certain channel).

- `cli settings timeZone` or `cli s tz` (string)

Use this command to change lemony_friend's default time zone. This is primarily used in response to the `!time` command. A list of valid time zones can be found at <link>

- `cli settings realRPS` or `cli s rps` (boolean)

Use this command to swap between real and fake verions of the `!rps` game. In "real" Rock Paper Scissors, the game is played normally. In "fake" Rock Paper Scissors, the player cannot actually win. This is mostly used for fun, or as a prank.

- `cli settings hangmanChances` or `cli s hc` (number)
Use this command to change the starting number of chances in Hangman (default 6).

- `cli settings chantCount` or `cli s cc` (number)
Use this command to change the number of times a message is chanted (default 8).

- `cli settings chantEmote` or `cli s ce` (string)
Use this command to change or remove the emote/emoji used to separate chants (default 👏).

