import { expect, mock, test } from 'claude-code/testing'

type On = Parameters<Parameters<typeof test>[1]>[1]

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
  expect((await ui.find({ type: 'Text', text: /^H$/ }))?.props.color).toBe('#39FF6A')
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
  expect(await ui.find({ type: 'Text', text: /^⚙ $/ })).toBeDefined()
  // 'Baking' picks this phrase; writing, it shines steady
  expect((await ui.find({ type: 'Text', text: /^Burning sacred incense$/ }))?.props.color).toBe('#39FF6A')
  await ui.unmount()

  // Thinking, it pulses, starting from its dimmest
  ui = await $.ui.mount({
    plugin: 'cute-claude',
    surface: 'terminal',
    component: 'Spinner',
    props: { word: 'Baking', message: null, suffix: '…', mode: 'thinking' },
  })
  expect((await ui.find({ type: 'Text', text: /^Burning sacred incense$/ }))?.props.color).toBe('#0f5a26')
  await ui.unmount()

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

  // A pink drop cap in a round frame, and headings behind a paw
  let ui = await $.ui.mount(reply('hola, humano.\n\n# Mouse hunt'))
  expect((await ui.find({ type: 'Text', text: /^H$/ }))?.props.color).toBe('#E0567A')
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

  expect(await run('cat')).toMatch(/wandered off/)
  expect(await voice()).toBe('')
})

test('hamster conjures a tiny wizard, light or in full, and sends it home', async ($, on) => {
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

  expect(await run('hamster')).toMatch(/^Poof! Wizard hamster mode is on\./)
  expect(await voice()).toMatch(/^Wizard hamster mode is on/)
  expect(await run('hamster', 'full')).toMatch(/Archmage/)
  expect(await voice()).toMatch(/^Full wizard hamster immersion is on/)

  // A drop cap in a round frame, headings in violet behind a star
  let ui = await $.ui.mount(reply('hola, Archimago.\n\n# Wards'))
  expect((await ui.find({ type: 'Text', text: /^H$/ }))?.props.color).toBe('#E8892B')
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

  expect(await run('hamster')).toMatch(/vanishes in a puff of glitter/)
  expect(await voice()).toBe('')
})
