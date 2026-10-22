# cute-claude

I like nice things, everybody likes nice things! But Claude is sometimes too boring. I would like to change that, so that using Claude feels more pleasant to you. Whether for working, playing around or doing your own thing, let Claude become your little assistant!

## How to use

| Command | Look |
| --- | --- |
| `/medieval` | An illuminated manuscript: drop caps in a gilt frame, rubricated headings, a scribe monk with a saying of the day |
| `/mechanicus` | The Adeptus Mechanicus: a tech-priest at work each prompt, at his cogitator, with a servo-skull or anointing the machine, and once in a long while facing an angry machine spirit; machine-cant wording |
| `/halo` | Halo, with Cortana at your side |
| `/cat` | A ginger cat up to something different each prompt: typing at the keyboard, batting a ball of yarn, peeking out of a box or napping in a sunbeam, and once in a long while something odd |
| `/hamster` | A tiny wizard hamster in a starry hat, busy with something new each prompt: casting over its spellbook, stirring a cauldron, gazing into a crystal ball or nibbling a sunflower seed, and once in a long while a spell gone wrong |

Run the same command again to turn the look off, or another look's command to switch. Where a look offers it, `/<look> full` turns on full role-play immersion: Claude speaks in character, and every technical detail stays exact.

To start Claude Code with a look already on, pass its command as the first prompt:

```bash
claude /cat
```

When a look turns on, its figure waits above the prompt with a greeting until your first prompt.

<!--
## Screenshots

![medieval](screenshots/medieval.png)
![mechanicus](screenshots/mechanicus.png)
![halo](screenshots/halo.png)
![cat](screenshots/cat.png)
![hamster](screenshots/hamster.png)
-->

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install cute-claude --marketplace Fuminides/cute-claude
```

Answer `y` to add the marketplace, then choose a scope (the user scope is the first one).

From a shell:

```bash
claude plugin install cute-claude --marketplace Fuminides/cute-claude
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `Fuminides/cute-claude`, then Add plugin.
