import { expect, mock, test } from 'claude-code/testing'

import { cat } from './cat'
import { hamster } from './hamster'
import { mechanicus } from './mechanicus'
import type { Theme } from './theme'

type On = Parameters<Parameters<typeof test>[1]>[1]
type Harness = Parameters<Parameters<typeof test>[1]>[0]

// Nothing sits beneath the plugin: these hooks stand for the engine, and its clock
const engine = (on: On) => {
  on('command.register', (_, e) => ({ value: { command: e.name } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('ui.status', () => ({ value: undefined }))
  on('prompt.compose', () => ({ sections: [{ id: 'intro', text: 'You are Claude.', scope: 'shared' }] }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    const p = e.props as Record<string, unknown>

    return <Text>{String(p.text ?? p.word)}</Text>
  })

  return mock.clock(on)
}

const request = {
  model: 'claude-opus-5-5',
  promptModel: 'claude-opus-5-5',
  surfaces: ['terminal'],
  tools: [],
  outputStyle: null,
  traits: [],
} as const

const reply = (text: string, isFirstOfReply = true) =>
  ({
    plugin: 'cute-claude',
    surface: 'terminal',
    component: 'AssistantMessage',
    props: { text, isFirstOfReply },
  }) as const

// Each turn a look with scenes shows one of its pictures, drawn at random: the
// first turn moves off the sprite, and over 200 more it never shows the same
// picture twice running, shows every one, and a rare one least. The clock
// stands still, so each picture draws the same every time it comes up. The
// test registers the engine's side of a turn beneath the plugin first
const expectScenes = async ($: Harness, theme: Theme) => {
  const spinner = async () => {
    const ui = await $.ui.mount({
      plugin: 'cute-claude',
      surface: 'terminal',
      component: 'Spinner',
      props: { word: 'Baking', message: null, suffix: '…', mode: 'responding' },
    })
    const drawn = JSON.stringify(await ui.drawn())
    await ui.unmount()
    return drawn
  }
  const turn = async (turnId: string) => {
    await $.turn.start({ text: '', turnId })
    await $.turn.complete({ turnId, answer: '', durationMs: 1000, isAborted: false, reason: 'answer' })
  }

  const sprite = await spinner()
  await turn('t0')
  expect(await spinner()).not.toBe(sprite)

  const drawn: string[] = []
  for (let i = 1; i <= 200; i++) {
    await turn(`t${i}`)
    drawn.push(await spinner())
  }
  const weights = [theme.sprite, ...(theme.scenes ?? [])].map(p => p.weight ?? 1)
  const times = [...new Set(drawn)].map(d => drawn.filter(x => x === d).length).sort((a, b) => a - b)
  expect(drawn.every((d, i) => i === 0 || d !== drawn[i - 1])).toBe(true)
  expect(times).toHaveLength(weights.length)
  if (weights.some(w => w < 1)) expect(times[0]).toBeLessThan(times[1])
}

test('a reply opens on a framed drop cap only when the mode is on', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  let ui = await $.ui.mount(reply('Hola, buen amigo'))
  expect((await ui.find({ type: 'Text' }))?.text).toBe('Hola, buen amigo')
  await ui.unmount()

  await $.command.run({ command: 'medieval', args: '' })

  ui = await $.ui.mount(reply('Hola, buen amigo.\n\nSegundo párrafo.'))
  expect((await ui.find({ type: 'Text' }))?.text).toBe('𝕳')
  const blocks = await ui.findAll({ type: 'Markdown' })
  expect(blocks.map(b => b.text)).toEqual(['ola, buen amigo.', 'Segundo párrafo.'])
  await ui.unmount()

  ui = await $.ui.mount(reply('second block', false))
  expect((await ui.find({ type: 'Text' }))?.text).toBe('second block')
  await ui.unmount()

  ui = await $.ui.mount(reply('# Heading'))
  expect((await ui.find({ type: 'Text', text: /^Heading$/ }))?.props.color).toBe('#C0392B')
  await ui.unmount()

  ui = await $.ui.mount(reply('Hola.\n\n## **Parte** dos\n\nTexto.\n```\n# code\n```'))
  expect((await ui.findAll({ type: 'Markdown' })).map(b => b.text)).toEqual([
    'ola.',
    'Texto.\n```\n# code\n```',
  ])
  expect(await ui.find({ type: 'Text', text: /^Parte dos$/ })).toBeDefined()
  await ui.unmount()

  ui = await $.ui.mount(reply('Mira:\n```\nx\n```'))
  expect(await ui.find({ type: 'Markdown' })).toBeUndefined()
  await ui.unmount()
})

test('rules become ornaments, but not inside code or under a setext heading', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'medieval', args: '' })

  const ui = await $.ui.mount(reply('uno\n\n---\n\nTitle\n---\n```\n# no\n---\n```', false))
  expect((await ui.find({ type: 'Text' }))?.text).toBe(
    'uno\n\n──── ❦ ────\n\nTitle\n---\n```\n# no\n---\n```',
  )
  await ui.unmount()
})

test('a tool call draws as a gloss, and in full when expanded', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'medieval', args: '' })

  const row = (isExpanded: boolean) =>
    $.ui.mount({
      plugin: 'cute-claude',
      surface: 'terminal',
      component: 'ToolUse',
      props: {
        tool_use_id: 't1',
        tool: 'Bash',
        input: { command: 'ls -la\necho hi' },
        isRunning: false,
        isErrored: true,
        isInterrupted: false,
        isExpanded,
      },
    })

  let ui = await row(false)
  expect((await ui.find({ type: 'Text', text: /Bash/ }))?.text).toBe('Bash · ls -la')
  expect(await ui.find({ type: 'Text', text: '✗' })).toBeDefined()
  await ui.unmount()

  ui = await row(true)
  expect(await ui.find({ type: 'Text', text: /Bash/ })).toBeUndefined()
  await ui.unmount()
})

test('the voice section is in the system prompt only while the mode is on', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const ids = async () => (await $.prompt.compose(request)).sections.map(s => s.id)

  expect(await ids()).toEqual(['intro'])
  await $.command.run({ command: 'medieval', args: '' })
  expect(await ids()).toEqual(['intro', 'cute-claude:voice'])
  await $.command.run({ command: 'medieval', args: '' })
  expect(await ids()).toEqual(['intro'])
})

test('the spinner and the closing line take medieval words when on', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'medieval', args: '' })

  const spinner = (surface: 'terminal' | 'desktop', mode: 'thinking' | 'responding') =>
    $.ui.mount({
      plugin: 'cute-claude',
      surface,
      component: 'Spinner',
      props: { word: 'Baking', message: null, suffix: '…', mode },
    })

  let ui = await spinner('terminal', 'thinking')
  const thinking = JSON.stringify(await ui.drawn())
  expect(await ui.findAll({ type: 'Text', text: '▀' })).not.toHaveLength(0)
  expect(await ui.find({ type: 'Text', text: '⚜' })).toBeDefined()
  // 'Baking' always picks the same word; its first letter comes out in Fraktur
  expect(await ui.find({ type: 'Text', text: /^[\u{1D56C}-\u{1D59F}]\S* /u })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Baking' })).toBeUndefined()
  await ui.unmount()

  // Writing, only the initial is inked yet; thinking, the whole line is
  ui = await spinner('terminal', 'responding')
  expect(JSON.stringify(await ui.drawn())).not.toBe(thinking)
  await ui.unmount()

  ui = await spinner('desktop', 'responding')
  expect(await ui.find({ type: 'Text', text: '⚜' })).toBeUndefined()
  expect((await ui.find({ type: 'Text' }))?.text).not.toBe('Baking')
  await ui.unmount()

  const done = await $.ui.mount({
    plugin: 'cute-claude',
    surface: 'terminal',
    component: 'TurnDuration',
    props: { word: 'Baked', durationMs: 3000 },
  })
  expect((await done.find({ type: 'Text' }))?.text).toMatch(/^❦ Explicit · \w+ in 3s ❦$/)
  await done.unmount()
})

test('the spinner keeps the seconds, tokens and effort the engine would show', async ($, on) => {
  const clock = engine(on)
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  // The step beneath streams 40 characters, then the API reports 12 tokens for them
  on('turn.step', async function* (_, e) {
    const usage = { input_tokens: 5, output_tokens: 12, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 }
    yield { kind: 'text', index: 0, text: 'x'.repeat(40) } as const
    yield { kind: 'stop', stopReason: 'end_turn', usage: { ...usage, model: 'claude-opus-5-5' } } as const
    return {
      turnId: e.turnId,
      index: e.index,
      answer: 'x'.repeat(40),
      toolUses: [],
      stopReason: 'end_turn',
      usage: { ...usage, model: 'claude-opus-5-5' },
    } as const
  })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'medieval', args: '' })
  await $.turn.start({ text: 'hola', turnId: 't1' })

  const stats = async () => {
    const ui = await $.ui.mount({
      plugin: 'cute-claude',
      surface: 'terminal',
      component: 'Spinner',
      props: { word: 'Baking', message: null, suffix: '…', mode: 'responding' },
    })
    const text = (await ui.find({ type: 'Text', text: /^\d+s( ·|$)/ }))?.text
    await ui.unmount()
    return text
  }

  expect(await stats()).toBe('0s')

  // Midway through the stream the count is an estimate, four characters a token
  const stream = $.turn.step({ turnId: 't1', index: 0, model: 'claude-opus-5-5', effort: 'high', messageCount: 1 })
  await stream.next()
  await clock.advance(2000)
  expect(await stats()).toBe('2s · ↓ 10 tokens · high effort')

  // Once the step ends, the API's own figure takes its place
  for await (const _ of stream);
  await clock.advance(1000)
  expect(await stats()).toBe('3s · ↓ 12 tokens · high effort')
})

test('a look greets above the prompt from turning on until the first turn', async ($, on) => {
  engine(on)
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const greeting = async (props: { hasSurvey?: boolean; maxRows?: number } = {}) => {
    const ui = await $.ui.mount({
      plugin: 'cute-claude',
      surface: 'terminal',
      component: 'AbovePrompt',
      props: {
        hasSurvey: false,
        isWorking: false,
        maxRows: 20,
        bodyColumns: 80,
        scroll: { offset: 0, bodyRows: 20 },
        view: {},
        ...props,
      },
    })
    const text = (await ui.find({ type: 'Text', text: / is here/ }))?.text
    await ui.unmount()
    return text
  }

  expect(await greeting()).toBeUndefined()
  await $.command.run({ command: 'cat', args: '' })
  expect(await greeting()).toBe('Mazapan is here, curled up by your keyboard.')
  // A survey, or a band too short for the picture, keeps the engine's drawing
  expect(await greeting({ hasSurvey: true })).toBeUndefined()
  expect(await greeting({ maxRows: 4 })).toBeUndefined()

  await $.turn.start({ text: 'hola', turnId: 't1' })
  expect(await greeting()).toBeUndefined()

  // Switching to another look greets again
  await $.command.run({ command: 'hamster', args: '' })
  expect(await greeting()).toBe('The wizard hamster is here, wand at the ready.')
})

test('your own messages are rubricated, other rows keep the engine drawing', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'medieval', args: '' })

  const message = (origin: { kind: 'composer' } | { kind: 'unclassified' }) =>
    $.ui.mount({
      plugin: 'cute-claude',
      surface: 'terminal',
      component: 'UserMessage',
      props: { text: 'hola', origin, isExpanded: true },
    })

  let ui = await message({ kind: 'composer' })
  expect((await ui.find({ type: 'Text', text: '✠' }))?.props.color).toBe('#C0392B')
  expect((await ui.find({ type: 'Text', text: /^hola$/ }))?.props.color).toBe('#B8860B')
  await ui.unmount()

  ui = await message({ kind: 'unclassified' })
  expect((await ui.find({ type: 'Text' }))?.text).toBe('hola')
  await ui.unmount()
})

test('mechanicus takes over from medieval, and its full rite swaps the voice', async ($, on) => {
  engine(on)
  // The engine's side of a turn, so that turns can start and end
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('turn.complete', () => ({ text: '' }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const run = async (command: string, args = '') =>
    ((await $.command.run({ command, args })) as { text?: string }).text ?? ''
  const voice = async () =>
    (await $.prompt.compose(request)).sections.find(s => s.id === 'cute-claude:voice')?.text ?? ''

  await run('medieval')
  expect(await voice()).toMatch(/^Medieval mode is on/)
  expect(await run('mechanicus')).toMatch(/Noosphere link established\. Praise/)
  expect(await voice()).toMatch(/^Mechanicus mode is on/)
  expect(await run('mechanicus', 'full')).toMatch(/Full rite engaged/)
  expect(await voice()).toMatch(/^Full Mechanicus immersion is on/)

  let ui = await $.ui.mount(reply('hola, Magos.\n\n# Rite of tests'))
  expect((await ui.find({ type: 'Text', text: /^H$/ }))?.props.color).toBe('#22B14C')
  expect((await ui.find({ type: 'Text', text: /^Rite of tests$/ }))?.props.color).toBe('#C62828')
  expect(await ui.find({ type: 'Text', text: /^\+\+\+ Rite of tests \+\+\+$/ })).toBeDefined()
  await ui.unmount()

  ui = await $.ui.mount({
    plugin: 'cute-claude',
    surface: 'terminal',
    component: 'TurnDuration',
    props: { word: 'Baked', durationMs: 65000 },
  })
  expect((await ui.find({ type: 'Text' }))?.text).toMatch(/^\+\+\+ Transmission ends · \w+ in 1m 5s \+\+\+$/)
  await ui.unmount()

  ui = await $.ui.mount({
    plugin: 'cute-claude',
    surface: 'terminal',
    component: 'Spinner',
    props: { word: 'Baking', message: null, suffix: '…', mode: 'responding' },
  })
  expect(await ui.find({ type: 'Text', text: /^⚙︎ $/ })).toBeDefined()
  // 'Baking' picks this phrase; writing, it shines steady
  expect((await ui.find({ type: 'Text', text: /^Burning sacred incense$/ }))?.props.color).toBe('#22B14C')
  await ui.unmount()

  // Thinking, it pulses, starting from its dimmest
  ui = await $.ui.mount({
    plugin: 'cute-claude',
    surface: 'terminal',
    component: 'Spinner',
    props: { word: 'Baking', message: null, suffix: '…', mode: 'thinking' },
  })
  expect((await ui.find({ type: 'Text', text: /^Burning sacred incense$/ }))?.props.color).toBe('#1f8f3c')
  await ui.unmount()

  // Each turn the tech-priest is drawn at something else
  await expectScenes($, mechanicus)

  expect(await run('mechanicus')).toMatch(/Link severed/)
  expect(await voice()).toBe('')
})

test("the monk says the day's saying beneath himself, and the tech-priest keeps quiet", async ($, on) => {
  const clock = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'medieval', args: '' })

  const spinner = () =>
    $.ui.mount({
      plugin: 'cute-claude',
      surface: 'terminal',
      component: 'Spinner',
      props: { word: 'Baking', message: null, suffix: '…', mode: 'responding' },
    })

  let ui = await spinner()
  expect(await ui.find({ type: 'Text', text: '« Laus Deo »' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /·/ })).toBeUndefined()
  await ui.unmount()

  // Four days and a few hours on, it is Augustine's turn, and it stays his all day
  await clock.set(4 * 86_400_000 + 5 * 3_600_000)
  ui = await spinner()
  expect(await ui.find({ type: 'Text', text: '« Tolle, lege »' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: ' · S. Augustinus' })).toBeDefined()
  await ui.unmount()

  await $.command.run({ command: 'mechanicus', args: '' })
  ui = await spinner()
  expect(await ui.find({ type: 'Text', text: /«/ })).toBeUndefined()
  await ui.unmount()
})

test('halo brings Cortana online, light or in full, and takes her off again', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const run = async (command: string, args = '') =>
    ((await $.command.run({ command, args })) as { text?: string }).text ?? ''
  const voice = async () =>
    (await $.prompt.compose(request)).sections.find(s => s.id === 'cute-claude:voice')?.text ?? ''
  const spinner = (mode: 'thinking' | 'responding') =>
    $.ui.mount({
      plugin: 'cute-claude',
      surface: 'terminal',
      component: 'Spinner',
      props: { word: 'Baking', message: null, suffix: '…', mode },
    })

  expect(await run('halo')).toMatch(/^Cortana online\./)
  expect(await voice()).toMatch(/^Halo mode is on/)
  expect(await run('halo', 'full')).toMatch(/Chief/)
  expect(await voice()).toMatch(/^Full Halo immersion is on/)

  // No drop cap for her: the reply opens plainly, its headings in her blue
  let ui = await $.ui.mount(reply('hola, Chief.\n\n# Sweep'))
  expect(await ui.find({ type: 'Text', text: /^H$/ })).toBeUndefined()
  expect((await ui.find({ type: 'Markdown' }))?.text).toBe('hola, Chief.')
  expect((await ui.find({ type: 'Text', text: /^Sweep$/ }))?.props.color).toBe('#3D8BFF')
  await ui.unmount()

  // She has no sayings beneath her, and writing and thinking draw her apart
  ui = await spinner('responding')
  const writing = JSON.stringify(await ui.drawn())
  expect(await ui.find({ type: 'Text', text: /^◈ $/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /«/ })).toBeUndefined()
  await ui.unmount()
  ui = await spinner('thinking')
  expect(JSON.stringify(await ui.drawn())).not.toBe(writing)
  await ui.unmount()

  expect(await run('halo')).toMatch(/offline/)
  expect(await voice()).toBe('')
})

test('cat sits on the keyboard, light or in full, and wanders off again', async ($, on) => {
  engine(on)
  // The engine's side of a turn, so that turns can start and end
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('turn.complete', () => ({ text: '' }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const run = async (command: string, args = '') =>
    ((await $.command.run({ command, args })) as { text?: string }).text ?? ''
  const voice = async () =>
    (await $.prompt.compose(request)).sections.find(s => s.id === 'cute-claude:voice')?.text ?? ''
  const spinner = (mode: 'thinking' | 'responding') =>
    $.ui.mount({
      plugin: 'cute-claude',
      surface: 'terminal',
      component: 'Spinner',
      props: { word: 'Baking', message: null, suffix: '…', mode },
    })

  expect(await run('cat')).toMatch(/^Mrrp! Cat mode is on\./)
  expect(await voice()).toMatch(/^Cat mode is on/)
  expect(await run('cat', 'full')).toMatch(/my human/)
  expect(await voice()).toMatch(/^Full cat immersion is on/)

  // No drop cap: the reply opens plainly, its headings behind a paw
  let ui = await $.ui.mount(reply('hola, humano.\n\n# Mouse hunt'))
  expect(await ui.find({ type: 'Text', text: /^H$/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /^ฅ Mouse hunt$/ })).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /^Mouse hunt$/ }))?.props.color).toBe('#E0567A')
  await ui.unmount()

  // The day's saying sits beneath the cat, and writing and thinking draw it apart
  ui = await spinner('responding')
  const writing = JSON.stringify(await ui.drawn())
  expect(await ui.find({ type: 'Text', text: /^ฅ $/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^Sniffing the logs$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '« Every keyboard is a warm bed »' })).toBeDefined()
  await ui.unmount()
  ui = await spinner('thinking')
  expect(JSON.stringify(await ui.drawn())).not.toBe(writing)
  await ui.unmount()

  // Each turn the cat finds something else to do
  await expectScenes($, cat)

  expect(await run('cat')).toMatch(/wandered off/)
  expect(await voice()).toBe('')
})

test('hamster conjures a tiny wizard, light or in full, and sends it home', async ($, on) => {
  engine(on)
  // The engine's side of a turn, so that turns can start and end
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  on('turn.complete', () => ({ text: '' }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const run = async (command: string, args = '') =>
    ((await $.command.run({ command, args })) as { text?: string }).text ?? ''
  const voice = async () =>
    (await $.prompt.compose(request)).sections.find(s => s.id === 'cute-claude:voice')?.text ?? ''
  const spinner = (mode: 'thinking' | 'responding') =>
    $.ui.mount({
      plugin: 'cute-claude',
      surface: 'terminal',
      component: 'Spinner',
      props: { word: 'Baking', message: null, suffix: '…', mode },
    })

  expect(await run('hamster')).toMatch(/^Poof! Wizard hamster mode is on\./)
  expect(await voice()).toMatch(/^Wizard hamster mode is on/)
  expect(await run('hamster', 'full')).toMatch(/Archmage/)
  expect(await voice()).toMatch(/^Full wizard hamster immersion is on/)

  // No drop cap: the reply opens plainly, its headings in violet behind a star
  let ui = await $.ui.mount(reply('hola, Archimago.\n\n# Wards'))
  expect(await ui.find({ type: 'Text', text: /^H$/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /^✦ Wards$/ })).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /^Wards$/ }))?.props.color).toBe('#8B5CF6')
  await ui.unmount()

  // The day's saying sits beneath it, and writing and thinking draw it apart
  ui = await spinner('responding')
  const writing = JSON.stringify(await ui.drawn())
  expect(await ui.find({ type: 'Text', text: /^✦ $/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '« Small paws, big spells »' })).toBeDefined()
  await ui.unmount()
  ui = await spinner('thinking')
  expect(JSON.stringify(await ui.drawn())).not.toBe(writing)
  await ui.unmount()

  ui = await $.ui.mount({
    plugin: 'cute-claude',
    surface: 'terminal',
    component: 'TurnDuration',
    props: { word: 'Baked', durationMs: 3000 },
  })
  expect((await ui.find({ type: 'Text' }))?.text).toMatch(/^✦ Spell complete · \w+ in 3s ✦$/)
  await ui.unmount()

  // Each turn the hamster takes up another bit of magic
  await expectScenes($, hamster)

  expect(await run('hamster')).toMatch(/vanishes in a puff of glitter/)
  expect(await voice()).toBe('')
})
