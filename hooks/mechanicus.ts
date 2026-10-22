import type { Theme } from './theme'

// Forge-world palette: Mars red, brass and the phosphor green of a cogitator screen
const RED = '#C62828'
const BRASS = '#B08A2E'
const PHOSPHOR = '#39FF6A'
// The phosphor for text, dark enough to read on a light terminal too
const PHOSPHOR_TEXT = '#22B14C'

// The cog, in its text presentation so that no font draws it as a two-cell emoji
const COG_GLYPH = '⚙︎'

// Lines of text that scroll up the cogitator's screen while he writes, a blank
// line between each, and the same lines in red: scrapcode
const LINES = ['GGGBGGBGG', 'BBBBBBBBB', 'GGBGGGGBg', 'BBBBBBBBB', 'gGGGBGGBG', 'BBBBBBBBB']
const SCRAPCODE = LINES.map(line => line.replace(/G/g, 'L').replace(/g/g, 'l'))

// A cog turning on the screen while he thinks, a quarter-tooth apart
const COG = [
  ['BBGBB', 'BGGGB', 'GGBGG', 'BGGGB', 'BBGBB'],
  ['GBBBG', 'BGGGB', 'BGBGB', 'BGGGB', 'GBBBG'],
]

// The skull that glares from the screen when the machine spirit is displeased
const SKULL = ['.LLLLL.', 'LLLLLLL', 'LBBLBBL', '.LLLLL.', '.L.L.L.']

// The servo-skull's cable, from its base down to his hand, and how far it
// drifts in towards him and back
const CABLE = [[17, 10], [16, 11], [15, 12], [14, 12], [13, 11]]
const HOVER = [0, -1, -1, 0]

// Where a drop of oil falls from the flask: twice in the air, then on the casing
const DRIP = [[18, 3], [18, 4], [18, 5]]

// The tech-priest's own colours, and his cogitator's, the same in every scene
const PRIEST = {
  K: '#140a0a', // outline
  R: '#a3191c', // robe
  r: '#6b0f12', // robe in shadow
  H: '#0d0606', // inside the hood
  E: PHOSPHOR, // eyes
  e: '#1f8f3c', // eyes dimmed
  M: '#b08d57', // brass
  m: '#6e5531', // brass in shadow
  C: '#d9b76a', // bright brass: cog, keys, the flask and its oil
  S: '#8a8f94', // steel: mechadendrite and hand
  s: '#4b5055', // steel in shadow
  B: '#062b12', // screen
  G: PHOSPHOR, // glyphs on the screen
  g: '#1f8f3c', // dim glyphs
}

// Draws rows of pixels with their top left at x, y; '.' leaves what is there
const put = (px: string[][], x: number, y: number, rows: string[]) =>
  rows.forEach((row, j) =>
    [...row].forEach((c, i) => {
      if (c !== '.' && px[y + j]?.[x + i] !== undefined) px[y + j][x + i] = c
    }),
  )

// Moves the pixels in columns x0 to x1 and rows y0 to y1 by dx, dy, clearing what they leave
const move = (px: string[][], x0: number, x1: number, y0: number, y1: number, dx: number, dy: number) => {
  const block = px.slice(y0, y1 + 1).map(row => row.slice(x0, x1 + 1).join(''))
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) px[y][x] = '.'
  put(px, x0 + dx, y0 + dy, block)
}

// The four lines of the screen as they stand at this frame, scrolling up
const scroll = (lines: string[], frame: number) => [0, 1, 2, 3].map(i => lines[(frame + i) % lines.length])

export const mechanicus: Theme = {
  command: 'mechanicus',
  description: 'Toggle the Adeptus Mechanicus look; /mechanicus full for full role-play immersion',
  status: `${COG_GLYPH} Praise the Omnissiah ${COG_GLYPH}`,
  on: '+++ Noosphere link established. Praise the Omnissiah. Type /mechanicus again to sever it. +++',
  onFull:
    '+++ Noosphere link established. Full rite engaged: the Omnissiah speaks. Type /mechanicus again to sever it. +++',
  off: '+++ Link severed. The machine spirit rests. +++',
  greeting: 'The tech-priest stands ready. The machine spirit is willing.',
  voice: {
    light:
      'Mechanicus mode is on. Give your prose a faint Adeptus Mechanicus flavour, from Warhammer 40,000: at most once or twice per reply, use a term or turn of phrase from that lore, adapted to the language you are writing in (for example "machine spirit" / "espíritu máquina", "cogitator" / "cogitador", "scrapcode", "praise the Omnissiah" / "alabado sea el Omnissiah"). Apart from that, keep your usual register, tone and clarity: no role-play. Code, commands, paths and technical terms stay exactly as they are.',
    full:
      'Full Mechanicus immersion is on, for role-play. The user is a Tech-Priest of the Adeptus Mechanicus (Warhammer 40,000), and you answer as the voice of the Omnissiah, the Machine God, speaking through the cogitator. Address them as Tech-Priest (or Magos), with the solemn, ritual cadence of the Cult Mechanicus: programs are machine spirits, bugs are scrapcode or a corruption to be purged, tests are rites, the terminal is the cogitator, the internet is the noosphere. You may open or close with a short litany or a line of binaric cant (0s and 1s). Write in the language the user writes in. The role-play lives only in the prose: every technical fact, command, path, code block and instruction stays as precise and complete as it would be without it, and code is written normally. Never let the persona hide uncertainty, a risk or a mistake; state them plainly, in character.',
  },
  colors: { rubric: RED, gilt: BRASS, letter: PHOSPHOR_TEXT },
  pulse: '#1F8F3C',
  initial: letter => letter.toUpperCase(),
  frame: 'bold',
  heading: ['+++ ', ' +++'],
  rule: `──── ${COG_GLYPH} ────`,
  pen: COG_GLYPH,
  mark: COG_GLYPH,
  icon: COG_GLYPH,
  colophon: ['+++ ', 'Transmission ends', '+++'],
  words: [
    'Appeasing the machine spirit',
    'Reciting the litany of ignition',
    'Anointing the cogitators',
    'Consulting the noosphere',
    'Chanting in binaric cant',
    'Purging scrapcode',
    'Venerating the sacred STC',
    'Calibrating the auspex',
    'Burning sacred incense',
    'Performing the rite of activation',
  ],
  done: ['Sanctified', 'Consecrated', 'Compiled', 'Ratified', 'Anointed'],
  // The tech-priest at his cogitator, a mechadendrite arching over his hood
  sprite: {
    pixels: PRIEST,
    base: [
      '....sSsS................',
      '...S....s...............',
      '..s......S..mMMMMMMMMMm.',
      '..S..KKK..s.MBBBBBBBBBM.',
      '...KKRRRK..SMBBBBBBBBBM.',
      '..KRRRRRRK..MBBBBBBBBBM.',
      '..KRRRHHHHK.MBBBBBBBBBM.',
      '.KRRRRHEHEK.MBBBBBBBBBM.',
      '.KRRRRHHHHK.MBBBBBBBBBM.',
      '.KRRRRRHK...mMMMMCMMMMm.',
      'KRRRRRRRRK.....mm.mm....',
      'KRRRRRRRRRRRSs..........',
      'KRRRrRRRRKmMMMMMMMMMMm..',
      'KRRRrRRRRKmCmCmCmCmCmm..',
      'KrrrrrrrrKKKKKKKKKKKKKK.',
      'KKKKKKKKKK..ss......ss..',
    ],
    // While he writes, lines scroll up the screen, his hand types and the
    // mechadendrite's tip flickers; while he thinks, a cog turns on the
    // screen, the cursor blinks and his eyes pulse
    animate: (px, frame, isThinking) => {
      if (isThinking) {
        put(px, 15, 3, COG[frame % 2])
        if (frame % 2 === 0) px[8][13] = 'G'
        if (frame % 4 >= 2) px[7][7] = px[7][9] = 'e'
      } else {
        put(px, 13, 4, scroll(LINES, frame))
        if (frame % 2) put(px, 12, 11, ['sS'])
        px[4][11] = frame % 2 ? 'S' : 's'
      }
    },
  },
  scenes: [
    // A servo-skull hovers before him, its cable in his hand
    {
      pixels: {
        ...PRIEST,
        W: '#d9d0b4', // bone
        w: '#9c927a', // bone in shadow
        L: '#ff3b30', // its lenses
      },
      base: [
        '....sSsS.........S......',
        '...S....s........S......',
        '..s......S.....KKKKK....',
        '..S..KKK..s...KWWWWWK...',
        '...KKRRRK..S.KWWWWWWWK..',
        '..KRRRRRRK...KWKKWKKWK..',
        '..KRRRHHHHK..KWKLWKLWK..',
        '.KRRRRHEHEK...KWWwWWK...',
        '.KRRRRHHHHK...KwKwKwK...',
        '.KRRRRRHK......KKKKK....',
        'KRRRRRRRRK.......s......',
        'KRRRRRRRRRRRSs..s.......',
        'KRRRrRRRRK....ss........',
        'KRRRrRRRRK..............',
        'KrrrrrrrrK..............',
        'KKKKKKKKKK..............',
      ],
      // While he writes, the skull bobs on the beat and a pulse of data runs
      // down its cable to his hand; while he thinks, it drifts in towards him
      // and back, its cable slackening
      animate: (px, frame, isThinking) => {
        if (isThinking) {
          move(px, 13, 21, 0, 9, HOVER[frame % HOVER.length], 0)
        } else {
          if (frame % 4 >= 2) move(px, 13, 21, 1, 9, 0, -1)
          const [x, y] = CABLE[frame % CABLE.length]
          px[y][x] = 'G'
          px[4][11] = frame % 2 ? 'S' : 's'
        }
      },
    },
    // Anointing the cogitator: his mechadendrite tips a flask of sacred oil
    // over its casing while he types
    {
      pixels: PRIEST,
      base: [
        '....sSsSsS..............',
        '...S......sS....CC......',
        '..s.........sSsSCCC.....',
        '..S..KKK................',
        '...KKRRRK...............',
        '..KRRRRRRK..mMMMMMMMMMm.',
        '..KRRRHHHHK.MBBBBBBBBBM.',
        '.KRRRRHEHEK.MBBBBBBBBBM.',
        '.KRRRRHHHHK.MBBBBBBBBBM.',
        '.KRRRRRHK...MBBBBBBBBBM.',
        'KRRRRRRRRK..MBBBBBBBBBM.',
        'KRRRRRRRRRRRSsMMMCMMMMm.',
        'KRRRrRRRRKmMMMMMMMMMMm..',
        'KRRRrRRRRKmCmCmCmCmCmm..',
        'KrrrrrrrrKKKKKKKKKKKKKK.',
        'KKKKKKKKKK..ss......ss..',
      ],
      // While he writes, lines scroll up the screen and a drop of oil falls
      // and lands on the casing; while he thinks, the cog turns and the oil
      // holds in the flask
      animate: (px, frame, isThinking) => {
        if (isThinking) {
          put(px, 15, 6, COG[frame % 2])
        } else {
          put(px, 13, 6, scroll(LINES, frame))
          const drop = DRIP[frame % 4]
          if (drop) px[drop[1]][drop[0]] = 'C'
        }
      },
    },
    // The rare one: the machine spirit is displeased, scrapcode fills the
    // screen in red and he throws both hands up
    {
      weight: 0.2,
      pixels: {
        ...PRIEST,
        L: '#ff3b30', // scrapcode, and the skull it draws
        l: '#8a1a14', // dim scrapcode
      },
      base: [
        '....sSsS................',
        '...S....s...............',
        '..s......S..mMMMMMMMMMm.',
        '..S..KKK.S..MBBBBBBBBBM.',
        'SS.KKRRRK.SSMBBBBBBBBBM.',
        'SSKRRRRRRKSSMBBBBBBBBBM.',
        'RRKRRRHHHHrRMBBBBBBBBBM.',
        'RRKRRRHEHErRMBBBBBBBBBM.',
        'RRKRRRHHHHrRMBBBBBBBBBM.',
        'RKRRRRRHKRR.mMMMMCMMMMm.',
        'KRRRRRRRRRR....mm.mm....',
        'KRRRRRRRRK..............',
        'KRRRrRRRRKmMMMMMMMMMMm..',
        'KRRRrRRRRKmCmCmCmCmCmm..',
        'KrrrrrrrrKKKKKKKKKKKKKK.',
        'KKKKKKKKKK..ss......ss..',
      ],
      // While he writes, scrapcode scrolls up the screen; while he thinks, a
      // red skull glares from it and his hands tremble
      animate: (px, frame, isThinking) => {
        if (isThinking) {
          put(px, 14, 3, SKULL)
          if (frame % 2) {
            move(px, 0, 1, 4, 5, 0, -1)
            move(px, 10, 11, 4, 5, 0, -1)
          }
        } else {
          put(px, 13, 4, scroll(SCRAPCODE, frame))
        }
      },
    },
  ],
}
