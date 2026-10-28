import type { Theme } from './theme'

// Forge-world palette: Mars red, brass and the phosphor green of a cogitator screen
const RED = '#C62828'
const BRASS = '#B08A2E'
const PHOSPHOR = '#39FF6A'
// The phosphor for text, dark enough to read on a light terminal too
const PHOSPHOR_TEXT = '#22B14C'

// The cog, in its text presentation so that no font draws it as a two-cell emoji
const COG_GLYPH = '⚙︎'

// Double-struck capital for the first letter of a reply, as if stamped in
// steel; seven of them live in the older letterlike block
const LETTERLIKE: Record<string, number> = { C: 0x2102, H: 0x210d, N: 0x2115, P: 0x2119, Q: 0x211a, R: 0x211d, Z: 0x2124 }
const stamp = (letter: string) => {
  const c = letter.toUpperCase()
  if (!/^[A-Z]$/.test(c)) return letter
  return String.fromCodePoint(LETTERLIKE[c] ?? 0x1d538 + c.charCodeAt(0) - 65)
}

// Lines of text that scroll up the cogitator's screen while he writes, a blank
// line between each, and the same lines in red: scrapcode
const LINES = ['GGGBGGBG', 'BBBBBBBB', 'GGBGGGGB', 'BBBBBBBB', 'gGGGBGGB', 'BBBBBBBB']
const SCRAPCODE = LINES.map(line => line.replace(/G/g, 'L').replace(/g/g, 'l'))

// A cog turning, a quarter-tooth apart: on the screen while he thinks, and
// larger on the shrine while he prays
const COG = [
  ['BBGBB', 'BGGGB', 'GGBGG', 'BGGGB', 'BBGBB'],
  ['GBBBG', 'BGGGB', 'BGBGB', 'BGGGB', 'GBBBG'],
]
const SHRINE_COG = [
  ['...M...', '.MMMMM.', '.MCCCM.', 'MMCWCMM', '.MCCCM.', '.MMMMM.', '...M...'],
  ['.M...M.', '..MMM..', 'MMCCCMM', '.MCWCM.', 'MMCCCMM', '..MMM..', '.M...M.'],
]

// The skull that glares from the screen when the machine spirit is displeased
const SKULL = ['.LLLLL.', 'LLLLLLL', 'LBBLBBL', '.LLLLL.', '.L.L.L.']

// The mechadendrite from his back, over his hood, to its claw: a pulse of data
// runs along it while he writes
const DENDRITE = [[3, 4], [3, 3], [3, 2], [4, 1], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 1], [12, 1], [13, 1], [14, 1], [15, 1]]

// The keys his hand strikes, one a frame
const KEYS = [16, 14, 20, 18]

// The servo-skull's cable, from its base down to his hand, and how far it
// drifts in towards him and back, its lenses turning to him as it comes
const CABLE = [[18, 10], [17, 11], [16, 12], [15, 12], [14, 11]]
const HOVER = [0, -1, -1, 0]

// The censer hangs from his claw and sways while he prays; its smoke climbs,
// and the binary of his chant drifts up from his grille
const SWAY = [0, 1, 0, -1]
const SMOKE = [[16, 9], [17, 8], [16, 7], [16, 6], [17, 5], [17, 4], [16, 3]]
const CHANT = [[13, 8], [14, 7], [13, 6], [14, 5], [13, 4]]

// The mechadendrites he flails when the machine spirit rages, three poses
const FLAIL = [
  ['S.....', '.s..S.', '.S..s.', '..sS..', '..Ss..', '...s..'],
  ['......', 'sS....', '..sS.S', '...ss.', '..sS..', '...s..'],
  ['..S...', '..s...', 'S.S.s.', '.sS.S.', '..Ss..', '...s..'],
]
// And the sparks that fly off the cogitator's casing
const SPARKS = [[[13, 2], [12, 1]], [[23, 2], [23, 0]], [[13, 1], [14, 0]]]

// The tech-priest's own colours, and his cogitator's, the same in every scene
const PRIEST = {
  K: '#3a1616', // outline
  R: '#a3191c', // robe
  r: '#6b0f12', // robe in shadow
  P: '#d0393e', // the hood's edge, lit by the screen
  H: '#0d0606', // inside the hood
  E: PHOSPHOR, // eyes
  O: '#d8ffe0', // eyes flaring
  M: '#b08d57', // brass
  m: '#6e5531', // brass in shadow
  C: '#d9b76a', // bright brass: cog, claw, keys
  W: '#e8dcc0', // ivory: the heart of the cog, a key struck
  S: '#8a8f94', // steel: mechadendrite, grille and hand
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

// A run of two pixels along a path, a step further each frame
const pulse = (px: string[][], path: number[][], frame: number, c: string) =>
  [0, 1].forEach(i => {
    const [x, y] = path[(2 * frame + i) % path.length]
    px[y][x] = c
  })

// The censer on its chain from the claw at 15, 1, swung dx at the bottom
const censer = (px: string[][], dx: number) => {
  for (let k = 1; k <= 7; k++) px[1 + k][15 + Math.round((dx * k) / 7)] = k % 2 ? 's' : 'S'
  put(px, 14 + dx, 9, ['.M.', 'MCM', 'mMm'])
}

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
  initial: stamp,
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
    'Swinging the censer',
    'Blessing the servitors',
  ],
  done: ['Sanctified', 'Consecrated', 'Compiled', 'Ratified', 'Anointed'],
  sayings: [
    { text: 'The flesh is weak' },
    { text: 'There is no truth in flesh, only betrayal', by: 'Credo Omnissiah' },
    { text: 'Life is directed motion', by: 'the Universal Laws' },
    { text: 'There is no strength in flesh, only weakness', by: 'Credo Omnissiah' },
    { text: 'The spirit is the spark of life', by: 'the Universal Laws' },
    { text: 'There is no constancy in flesh, only decay', by: 'Credo Omnissiah' },
    { text: 'Comprehension is the key to all things', by: 'the Universal Laws' },
    { text: 'There is no certainty in flesh but death', by: 'Credo Omnissiah' },
    { text: 'The Omnissiah knows all, comprehends all', by: 'the Universal Laws' },
    { text: 'Even in death I serve the Omnissiah' },
    { text: '01000001 01110110 01100101', by: 'binaric cant' },
  ],
  // The tech-priest at his cogitator, his mechadendrite arched over his hood
  // and plugged into its casing
  sprite: {
    pixels: PRIEST,
    base: [
      '.....sSsSsS.............',
      '....S......sSsSsC.......',
      '...s..KKK.......C.......',
      '...S.KRRPK....mMMMMMMMMm',
      '...sKRRRRPK...MBBBBBBBBM',
      '...KRRRRHHPK..MBBBBBBBBM',
      '..KRRRRHHHHPK.MBBBBBBBBM',
      '..KRRRHEEHEEK.MBBBBBBBBM',
      '..KRRRHSsSsSK.MBBBBBBBBM',
      '.KRRRRRsSsSsK.mMMMCMMMMm',
      '.KRRRRRRsRsRK....mm.mm..',
      'KRRRCRRRsRsRRSs.........',
      'KrRCWCRRRRRRKmMMMMMMMMm.',
      'KrRRCRRRRRRrKmCmCmCmCmm.',
      'KrrrrrrrrrrrKKKKKKKKKKKK',
      'KKKKKKKKKKKKK.ss.....ss.',
    ],
    // While he writes, lines scroll up the screen, a pulse of data runs along
    // the mechadendrite and his hand strikes the keys; while he thinks, a cog
    // turns on the screen, the cursor blinks, the claw works and his eyes flare
    animate: (px, frame, isThinking) => {
      if (isThinking) {
        put(px, 16, 4, COG[frame % 2])
        if (frame % 2 === 0) px[8][15] = 'G'
        if (frame % 2) {
          px[2][16] = '.'
          px[2][15] = px[2][17] = 'C'
        }
        if (frame % 4 >= 2) px[7][7] = px[7][10] = 'O'
      } else {
        put(px, 15, 4, scroll(LINES, frame))
        pulse(px, DENDRITE, frame, 'G')
        px[13][KEYS[frame % KEYS.length]] = 'W'
        if (frame % 2) put(px, 13, 11, ['sS'])
      }
    },
  },
  scenes: [
    // A servo-skull hovers before him, its cable in his hand, his claw
    // reaching out to steady it
    {
      pixels: {
        ...PRIEST,
        W: '#d9d0b4', // bone
        w: '#9c927a', // bone in shadow
        L: '#ff3b30', // its lenses
      },
      base: [
        '.....sSsSsS..C....S.....',
        '....S......sC.....S.....',
        '...s..KKK....C..KKKKK...',
        '...S.KRRPK.....KWWWWWK..',
        '...sKRRRRPK...KWWWWWWWK.',
        '...KRRRRHHPK..KWKKWKKWK.',
        '..KRRRRHHHHPK.KWKLWKLWK.',
        '..KRRRHEEHEEK..KWWwWWK..',
        '..KRRRHSsSsSK..KwKwKwK..',
        '.KRRRRRsSsSsK...KKKKK...',
        '.KRRRRRRsRsRK.....s.....',
        'KRRRCRRRsRsRRSs..s......',
        'KrRCWCRRRRRRK..ss.......',
        'KrRRCRRRRRRrK...........',
        'KrrrrrrrrrrrK...........',
        'KKKKKKKKKKKKK...........',
      ],
      // While he writes, the skull bobs on the beat and a pulse of data runs
      // down its cable to his hand; while he thinks, it drifts in towards him
      // and back, its lenses turning to him, its cable slackening
      animate: (px, frame, isThinking) => {
        if (isThinking) {
          if (frame % 4 === 1 || frame % 4 === 2) {
            px[6][16] = px[6][19] = 'L'
            px[6][17] = px[6][20] = 'K'
          }
          move(px, 14, 22, 0, 9, HOVER[frame % HOVER.length], 0)
        } else {
          if (frame % 4 >= 2) move(px, 14, 22, 1, 9, 0, -1)
          const [x, y] = CABLE[frame % CABLE.length]
          px[y][x] = 'G'
        }
      },
    },
    // The rite of incense: a censer swings from his claw before a shrine of
    // the cog, its smoke climbing, while he chants
    {
      pixels: {
        ...PRIEST,
        Q: '#b9b4a8', // smoke
      },
      base: [
        '.....sSsSsS.............',
        '....S......sSsSC........',
        '...s..KKK...............',
        '...S.KRRPK..............',
        '...sKRRRRPK.............',
        '...KRRRRHHPK............',
        '..KRRRRHHHHPK...........',
        '..KRRRHEEHEEK......mMm..',
        '..KRRRHSsSsSK......mMm..',
        '.KRRRRRsSsSsK......mMm..',
        '.KRRRRRRsRsRK......mMm..',
        'KRRRCRRRsRsRK......mMm..',
        'KrRCWCRRRRRRK.....mMMMm.',
        'KrRRCRRRRRRrK....mMMMMMm',
        'KrrrrrrrrrrrKKKKKKKKKKKK',
        'KKKKKKKKKKKKK...........',
      ],
      // While he prays, the censer sways and its smoke climbs; while he
      // writes, the censer hangs still, the binary of his chant drifts up and
      // the shrine's cog turns
      animate: (px, frame, isThinking) => {
        if (isThinking) {
          put(px, 17, 0, SHRINE_COG[0])
          censer(px, SWAY[frame % SWAY.length])
          ;[0, 3].forEach(i => {
            const [x, y] = SMOKE[(frame + i) % SMOKE.length]
            px[y][x + SWAY[frame % SWAY.length]] = 'Q'
          })
        } else {
          censer(px, 0)
          put(px, 17, 0, SHRINE_COG[frame % 2])
          ;[0, 3].forEach(i => {
            const [x, y] = CHANT[(frame + i) % CHANT.length]
            px[y][x] = (frame + i) % 2 ? 'G' : 'g'
          })
        }
      },
    },
    // The rare one: the machine spirit is displeased. His hood falls back on
    // a skull of chrome, his eyes burn red, scrapcode fills the screen and
    // his mechadendrites flail
    {
      weight: 0.2,
      pixels: {
        ...PRIEST,
        L: '#ff3b30', // scrapcode, his burning eyes and the skull on the screen
        l: '#8a1a14', // dim scrapcode
        F: '#ffb52e', // sparks
      },
      base: [
        '........................',
        '........................',
        '......sSSSs.............',
        '.....sSSSSSs..mMMMMMMMMm',
        '.....SKLSKLS..MBBBBBBBBM',
        '.....sSSsSSs..MBBBBBBBBM',
        '......SKSKS...MBBBBBBBBM',
        '..KKRRsSsSsRK.MBBBBBBBBM',
        '..KRRRRsRsRRK.MBBBBBBBBM',
        '.KRRRRRRsRsRK.mMMMCMMMMm',
        '.KRRRRRRsRsRK....mm.mm..',
        'KRRRCRRRsRsRRSs.........',
        'KrRCWCRRRRRRKmMMMMMMMMm.',
        'KrRRCRRRRRRrKmCmCmCmCmm.',
        'KrrrrrrrrrrrKKKKKKKKKKKK',
        'KKKKKKKKKKKKK.ss.....ss.',
      ],
      // His mechadendrites flail all the while; while he writes, scrapcode
      // scrolls up the screen; while he thinks, a red skull glares from it
      // and sparks fly off its casing
      animate: (px, frame, isThinking) => {
        put(px, 0, 1, FLAIL[frame % FLAIL.length])
        if (isThinking) {
          put(px, 16, 4, SKULL)
          SPARKS[frame % SPARKS.length].forEach(([x, y]) => {
            px[y][x] = 'F'
          })
        } else {
          put(px, 15, 4, scroll(SCRAPCODE, frame))
        }
      },
    },
  ],
}
