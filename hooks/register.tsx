import { atom, read, update } from 'claude-code'
import type { Register, Timer } from 'claude-code'

import { cat } from './cat'
import { halo } from './halo'
import { hamster } from './hamster'
import { mechanicus } from './mechanicus'
import { medieval } from './medieval'
import type { Theme } from './theme'

const THEMES = [medieval, mechanicus, halo, cat, hamster]

// What the spinner's picture draws from: an animation frame and the turn's seconds
const tick = atom({ plugin: 'cute-claude', key: 'tick' } as const, { frame: 0, seconds: 0 })

const pick = (list: string[], seed: string) =>
  list[[...seed].reduce((n, c) => n + c.charCodeAt(0), 0) % list.length]

// A colour between two hex colours, k from 0 (the first) to 1 (the second)
const mix = (a: string, b: string, k: number) => {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16)

  return `#${[0, 1, 2]
    .map(i => Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * k).toString(16).padStart(2, '0'))
    .join('')}`
}

// A smooth rise and fall from 0 to 1 and back, once every 12 frames
const wave = (frame: number) => (1 - Math.cos((2 * Math.PI * (frame % 12)) / 12)) / 2

// Thematic breaks become the look's ornamental rule; code is left alone
const ornament = (text: string, rule: string) => {
  let isCode = false

  return text
    .split('\n')
    .map((line, i, lines) => {
      if (/^\s*(```|~~~)/.test(line)) {
        isCode = !isCode
        return line
      }
      if (isCode) return line
      // A rule right under text would be a setext heading's underline, so only after a blank line
      const isAfterBlank = i === 0 || lines[i - 1].trim() === ''
      if (isAfterBlank && /^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) return rule
      return line
    })
    .join('\n')
}

// Drops the blank lines around a block of markdown, keeping its first line's indent
const unblank = (text: string) => text.replace(/^\s*\n/, '').replace(/\n\s*$/, '')

// The reply cut at its headings, outside code: markdown blocks and the headings between them
const segments = (text: string) => {
  const blocks: { text: string; heading?: string }[] = []
  let lines: string[] = []
  let isCode = false
  const flush = () => {
    const block = unblank(lines.join('\n'))
    if (block.trim()) blocks.push({ text: block })
    lines = []
  }

  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) isCode = !isCode
    const heading = isCode ? null : line.match(/^#{1,6}\s+(.*)$/)
    if (heading) {
      flush()
      blocks.push({ text: line, heading: heading[1].replace(/\*\*|`/g, '') })
    } else {
      lines.push(line)
    }
  }
  flush()

  return blocks
}

// What a tool call is about, in one line: its command, file, pattern or address
const gloss = (tool: string, input: unknown) => {
  const i = (input ?? {}) as Record<string, unknown>
  const about = [i.command, i.file_path, i.pattern, i.url, i.description].find(
    v => typeof v === 'string',
  ) as string | undefined

  return about ? `${tool} · ${about.split('\n')[0]}` : tool
}

// Two pixels a cell: the upper one as a half block's colour, the lower as its
// background; neighbouring cells drawn alike merge into one run
const cells = (px: string[][], pixels: Record<string, string>) => {
  const rows: { text: string; color?: string; backgroundColor?: string }[][] = []

  for (let y = 0; y < px.length; y += 2) {
    const runs: (typeof rows)[number] = []
    px[y].forEach((top, x) => {
      const bottom = px[y + 1]?.[x] ?? '.'
      const cell =
        top === '.' && bottom === '.'
          ? { text: ' ' }
          : top === '.'
            ? { text: '▄', color: pixels[bottom] }
            : bottom === top
              ? { text: '█', color: pixels[top] }
              : bottom === '.'
                ? { text: '▀', color: pixels[top] }
                : { text: '▀', color: pixels[top], backgroundColor: pixels[bottom] }
      const last = runs[runs.length - 1]
      if (last && last.text[0] === cell.text && last.color === cell.color && last.backgroundColor === cell.backgroundColor) {
        last.text += cell.text
      } else {
        runs.push(cell)
      }
    })
    rows.push(runs)
  }

  return rows
}

export const register: Register = on => {
  // The look that is on, if any, and whether it speaks in full immersion
  let look: { theme: Theme; isFull: boolean } | undefined
  let timer: Timer | undefined
  let startedAt = 0

  // Turns a look on, switches to it from another (or between its light and
  // full voice), or turns it off when it is already on as asked
  const toggle = (theme: Theme, args: string) => {
    const isFull = args.trim() === 'full' && theme.voice.full !== undefined
    const isOff = look?.theme === theme && (args.trim() === '' || look.isFull === isFull)
    look = isOff ? undefined : { theme, isFull }

    return isOff ? theme.off : isFull && theme.onFull ? theme.onFull : theme.on
  }

  on('session.start', async ($, e, next) => {
    for (const theme of THEMES) {
      await $.command.register({ name: theme.command, description: theme.description })
    }

    return next(e)
  })

  for (const theme of THEMES) {
    on('command.run', { command: theme.command }, async ($, e) => {
      const text = toggle(theme, e.args)
      $.ui.status(look?.theme.status)
      $.ui.invalidate('ui.render')

      return { text }
    })
  }

  // The spinner's picture only moves while a main turn runs and a look is on
  on('turn.start', async ($, e, next) => {
    if (e.agentId !== undefined || !look) return next(e)

    timer?.cancel()
    startedAt = await $.clock.now()
    await update($, tick, () => ({ frame: 0, seconds: 0 }))
    // 8 frames a second, so a pulse fades smoothly; the picture moves on every other one
    timer = $.clock.every(125, async () => {
      const seconds = Math.floor(((await $.clock.now()) - startedAt) / 1000)
      await update($, tick, t => ({ frame: t.frame + 1, seconds }))
    })

    return next(e)
  })

  on('turn.complete', ($, e, next) => {
    if (e.agentId === undefined) {
      timer?.cancel()
      timer = undefined
    }

    return next(e)
  })

  on('prompt.compose', async ($, e, next) => {
    const out = await next(e)
    if (!look) return out

    const { theme, isFull } = look
    const text = isFull && theme.voice.full ? theme.voice.full : theme.voice.light

    return { sections: [...out.sections, { id: 'cute-claude:voice', text, scope: 'session' }] }
  })

  // A reply that opens on a letter gets a drop cap: the letter in a gilt
  // frame, the first paragraph beside it and the rest at full width. Headings
  // are written as rubrics. Markdown such as a heading or a list at the very
  // start, or a code fence in the first paragraph, gets no drop cap, and a
  // block with neither cap nor heading keeps the engine's drawing
  on('ui.render', { component: 'AssistantMessage' }, ($, e, next) => {
    const t = look?.theme
    if (!t) return next(e)

    const full = ornament(e.props.text, t.rule)
    if (e.props.isSummary) return next({ ...e, props: { ...e.props, text: full } })

    const blocks = segments(full)
    const lead = blocks[0]?.heading === undefined ? (blocks[0]?.text ?? '') : ''
    const at = lead.search(/\n\s*\n/)
    const first = at < 0 ? lead : lead.slice(0, at)
    const hasCap = t.frame !== undefined && e.props.isFirstOfReply && /^[A-Za-z]/.test(first) && !first.includes('```')
    const body = hasCap ? [...(at < 0 ? [] : [{ text: unblank(lead.slice(at)) }]), ...blocks.slice(1)] : blocks

    if (!hasCap && blocks.every(b => b.heading === undefined)) {
      return next({ ...e, props: { ...e.props, text: full } })
    }

    const { Box, Text, Markdown } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        {hasCap ? (
          <Box flexDirection="row">
            <Box borderStyle={t.frame} borderColor={t.colors.gilt} paddingX={1} flexShrink={0}>
              <Text color={t.colors.letter} bold>{t.initial(first[0])}</Text>
            </Box>
            <Box flexGrow={1} flexShrink={1} paddingLeft={1}>
              <Markdown text={first.slice(1)} />
            </Box>
          </Box>
        ) : null}
        {body.map((block, i) => (
          <Box marginTop={hasCap || i > 0 ? 1 : 0}>
            {block.heading === undefined ? (
              <Markdown text={block.text} />
            ) : (
              <Text>
                <Text color={t.colors.gilt}>{t.heading[0]}</Text>
                <Text color={t.colors.rubric} bold>{block.heading}</Text>
                <Text color={t.colors.gilt}>{t.heading[1]}</Text>
              </Text>
            )}
          </Box>
        ))}
      </Box>
    )
  })

  on('ui.render', { component: 'UserMessage' }, ($, e, next) => {
    const t = look?.theme
    if (!t || e.props.origin.kind !== 'composer') return next(e)

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row">
        <Text color={t.colors.rubric} bold>{`${t.mark} `}</Text>
        <Text color={t.colors.gilt}>{e.props.text}</Text>
      </Box>
    )
  })

  // Tool calls become a gloss; ctrl+o (expanded) still shows the engine's full row
  on('ui.render', { component: 'ToolUse' }, ($, e, next) => {
    const t = look?.theme
    if (!t || e.props.isExpanded) return next(e)

    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text color={t.colors.gilt}>{`${t.pen} `}</Text>
        <Text dimColor italic wrap="truncate-end">{gloss(e.props.tool, e.props.input)}</Text>
        {e.props.isErrored || e.props.isInterrupted ? <Text color={t.colors.rubric}> ✗</Text> : null}
      </Box>
    )
  })

  // On the terminal the whole line is drawn here, picture included, so the
  // engine's token count goes; the seconds are kept from the turn's own clock
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    const t = look?.theme
    if (!t) return next(e)

    const word = pick(t.words, e.props.word)
    if (e.surface !== 'terminal') return next({ ...e, props: { ...e.props, word } })

    const { frame, seconds } = await read($, tick)
    const isThinking = e.props.mode === 'thinking' || e.props.mode === 'requesting'
    const px = t.sprite.base.map(row => [...row])
    t.sprite.animate(px, Math.floor(frame / 2), isThinking)
    const label = e.props.message ?? word
    const glow = isThinking && t.pulse ? mix(t.pulse, t.colors.letter, wave(frame)) : t.colors.letter
    // The day's saying, the same all day long (days turn at midnight UTC)
    const saying = t.sayings?.[Math.floor((await $.clock.now()) / 86_400_000) % t.sayings.length]
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        <Box flexDirection="row" alignItems="center">
          <Box flexDirection="column" width={t.sprite.base[0].length} flexShrink={0} marginRight={2}>
            {cells(px, t.sprite.pixels).map(row => (
              <Text>
                {row.map(run => (
                  <Text color={run.color} backgroundColor={run.backgroundColor}>
                    {run.text}
                  </Text>
                ))}
              </Text>
            ))}
          </Box>
          <Text color={t.colors.gilt}>{`${t.icon} `}</Text>
          <Text color={glow} bold>{t.initial(label.slice(0, 1)) + label.slice(1)}</Text>
          <Text color={glow}>{label.endsWith('…') ? '' : e.props.suffix}</Text>
          <Text dimColor>{` ${seconds}s`}</Text>
        </Box>
        {saying ? (
          <Text wrap="truncate-end">
            <Text color={t.colors.gilt} italic>{`« ${saying.text} »`}</Text>
            {saying.by ? <Text dimColor>{` · ${saying.by}`}</Text> : null}
          </Text>
        ) : null}
      </Box>
    )
  })

  // The line that closes a turn becomes a colophon; ctrl+o and the line that
  // waits on background agents keep the engine's drawing
  on('ui.render', { component: 'TurnDuration' }, ($, e, next) => {
    const t = look?.theme
    if (!t) return next(e)

    const word = pick(t.done, e.props.word)
    if (e.props.isExpanded || e.props.waitingFor) return next({ ...e, props: { ...e.props, word } })

    const s = Math.round(e.props.durationMs / 1000)
    const took = s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
    const [open, title, close] = t.colophon
    const { Text } = $.ui.resolve(e)

    return (
      <Text>
        <Text color={t.colors.gilt}>{open}</Text>
        <Text color={t.colors.rubric} italic>{title}</Text>
        <Text dimColor>{` · ${word} in ${took} `}</Text>
        <Text color={t.colors.gilt}>{close}</Text>
      </Text>
    )
  })
}
