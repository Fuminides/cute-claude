# cute-claude

Themed looks for Claude Code. Each one is a slash command that restyles the terminal: headings, tool calls, the spinner (with a small pixel-art figure beside it), the line that closes a turn, and a light touch of themed wording in Claude's replies. Code, commands and paths are never changed.

| Command | Look |
| --- | --- |
| `/medieval` | An illuminated manuscript: drop caps in a gilt frame, rubricated headings, a scribe monk with a saying of the day |
| `/mechanicus` | The Adeptus Mechanicus: a tech-priest at a cogitator, machine-cant wording |
| `/halo` | Halo, with Cortana at your side |

Run the same command again to turn the look off, or another look's command to switch. Where a look offers it, `/<look> full` turns on full role-play immersion: Claude speaks in character, and every technical detail stays exact.

<!--
## Screenshots

![medieval](screenshots/medieval.png)
![mechanicus](screenshots/mechanicus.png)
![halo](screenshots/halo.png)
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
