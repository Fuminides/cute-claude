# cute-claude

Themed looks for Claude Code. Each one is a slash command that restyles the terminal: headings, tool calls, the spinner (with a small pixel-art figure beside it, keeping Claude Code's time, token count and effort), the line that closes a turn, and a light touch of themed wording in Claude's replies. Code, commands and paths are never changed.

| Command | Look |
| --- | --- |
| `/medieval` | An illuminated manuscript: drop caps in a gilt frame, rubricated headings, a scribe monk with a saying of the day |
| `/mechanicus` | The Adeptus Mechanicus: a tech-priest at a cogitator, machine-cant wording |
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

## Developing

```bash
claude plugin validate .
claude plugin test .
```
