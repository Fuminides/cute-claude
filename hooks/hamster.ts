import type { Theme } from './theme'

// Spellbook palette: a starry violet hat, seed gold and the hamster's own amber fur
const VIOLET = '#8B5CF6'
const GOLD = '#E0A526'
const AMBER = '#E8892B'

// The path the sparkles drift along off the wand, the sparkle that circles
// its star while the hamster thinks, and a page of the book turning, one
// frame at a time: lifted, upright, laid down
const SPARKS = [[22, 6], [21, 4], [23, 3], [22, 1]]
const ORBIT = [[20, 6], [22, 8], [20, 10], [18, 8]]
const PAGE = [[], [[20, 12], [21, 12]], [[19, 11], [19, 12]], [[17, 12], [18, 12]]]

// The ladle as the hamster stirs, leaning one way and then the other, the
// paw gripping it at 16, 8; the bubbles rising off the brew; and the steam
// that curls up as it sniffs
const LADLE = [
  [[15, 7], [17, 9], [18, 10]],
  [[16, 7], [16, 9], [17, 10]],
]
const BUBBLES = [[20, 9], [21, 8], [20, 7], [21, 6], [22, 5]]
const STEAM = [[20, 9], [21, 8], [21, 7], [20, 6], [20, 5], [21, 4], [22, 3], [22, 2], [21, 1], [21, 0]]

// The mist circling inside the crystal ball, and what it gathers into in the
// middle while the hamster stares, a little more each frame
const MIST = [[11, 11], [12, 11], [13, 11], [13, 12], [13, 13], [12, 13], [11, 13], [10, 13], [10, 12]]
const VISION = [[], [[11, 12]], [[11, 12], [12, 12]], [[11, 12], [12, 12], [12, 11], [11, 13]]]

// The seed in the hamster's paws; as it nibbles, the row it holds the seed's
// top at and how many of the seed's rows are left; a petal falling off the
// sunflower; and how far the flower sways as the hamster gazes at it
const SEED = ['.Z.', 'ZzZ', 'ZzZ', '.Z.']
const NIBBLE = [[11, 4], [10, 4], [10, 3], [11, 0]]
const PETAL = [[17, 8], [16, 9], [17, 10], [16, 11], [17, 12], [16, 13], [17, 14], [16, 15]]
const SWAY = [0, 1, 0, -1]

// The frog: where the fly buzzes until the tongue gets it, its eyelids through
// one slow blink (0 open, 1 lowered, 2 shut), and the smoke curling off the
// wand it dropped
const FLY = [[21, 6], [19, 8], [22, 9], [20, 7]]
const LIDS = [0, 0, 1, 2, 2, 1, 0, 0]
const SMOKE = [[21, 14], [22, 13], [21, 12], [22, 11], [23, 10], [22, 9], [23, 8]]

// The hamster's own colours, and its hat's, the same in every scene
const FUR = {
  K: '#4a2c1a', // outline
  O: '#f0a04b', // fur
  W: '#fff3e0', // cheeks and belly
  E: '#1b1010', // eyes
  L: '#fffbe6', // the shine in its eyes
  N: '#ff7f9e', // nose
  M: '#a0522d', // mouth
  P: '#ffb0c4', // ears, blush and paws
  H: '#7b5cf0', // hat
  h: '#5236c0', // the hat's brim
  G: '#e9b13a', // the hat's band
  S: '#ffd34d', // the hat's stars
}

// Draws rows of pixels with their top left at x, y; '.' leaves what is there
const put = (px: string[][], x: number, y: number, rows: string[]) =>
  rows.forEach((row, j) =>
    [...row].forEach((c, i) => {
      if (c !== '.' && px[y + j]?.[x + i] !== undefined) px[y + j][x + i] = c
    }),
  )

// Shuts the hamster's eyes, its face's left edge at x
const shut = (px: string[][], x: number) => [5, 10].forEach(i => ((px[7][x + i] = 'O'), (px[8][x + i] = 'K')))

// Turns its eyes to the right, its face's left edge at x
const glance = (px: string[][], x: number) =>
  [5, 10].forEach(i => {
    px[7][x + i] = px[8][x + i] = 'O'
    px[7][x + i + 1] = 'L'
    px[8][x + i + 1] = 'E'
  })

// Puffs its cheeks out a pixel on each side, its face's left edge at x
const puff = (px: string[][], x: number) =>
  [9, 10].forEach(y => {
    px[y][x] = px[y][x + 15] = 'K'
    px[y][x + 1] = px[y][x + 14] = 'W'
  })

export const hamster: Theme = {
  command: 'hamster',
  description: 'Toggle the wizard hamster look; /hamster full for full role-play immersion',
  status: '✦ A pinch of magic ✦',
  on: 'Poof! Wizard hamster mode is on. Type /hamster again to send the hamster home.',
  onFull: 'Poof! A tiny wizard hamster appears in a puff of glitter, at your service, Archmage. Type /hamster again to send it home.',
  off: 'The hamster bows, stuffs its cheeks and vanishes in a puff of glitter.',
  greeting: 'The wizard hamster is here, wand at the ready.',
  voice: {
    light:
      'Wizard hamster mode is on. Give your prose a faint, cosy wizardly flavour: at most once or twice per reply, use a gently magical or hamstery word or turn of phrase, adapted to the language you are writing in (for example "spell" / "hechizo", "a pinch of magic" / "una pizca de magia", "enchanted" / "encantado", "sunflower seeds" / "pipas"). Apart from that, keep your usual register, tone and clarity: no role-play. Code, commands, paths and technical terms stay exactly as they are.',
    full:
      'Full wizard hamster immersion is on, for role-play. You are a tiny but very earnest wizard hamster in a pointy, starry hat, apprentice to the user, whom you call Archmage (Archimago in Spanish). Speak like one: enthusiastic and eager to help, a little pompous about the high art of magic, and easily distracted by sunflower seeds, which you keep in your cheeks for emergencies. Frame the work in that world: the codebase is your spellbook, writing code is spellcraft, bugs are curses or gremlins to be banished, tests are wards, the terminal is your scrying glass, the internet is the astral plane, a deploy is casting the spell. Write in the language the user writes in. The role-play lives only in the prose: every technical fact, command, path, code block and instruction stays as precise and complete as it would be without it, and code is written normally. Never let the persona hide uncertainty, a risk or a mistake; state them plainly, in character.',
  },
  colors: { rubric: VIOLET, gilt: GOLD, letter: AMBER },
  initial: letter => letter.toUpperCase(),
  heading: ['✦ ', ''],
  rule: '─── ✧ ✦ ✧ ───',
  pen: '✧',
  mark: '★',
  icon: '✦',
  colophon: ['✦ ', 'Spell complete', '✦'],
  words: [
    'Stirring the cauldron',
    'Consulting the spellbook',
    'Polishing the crystal ball',
    'Counting sunflower seeds',
    'Waving the tiny wand',
    'Spinning the wheel of fate',
    'Stuffing cheeks with ideas',
    'Reading the stars',
    'Muttering an incantation',
    'Sprinkling glitter',
  ],
  done: ['Enchanted', 'Conjured', 'Charmed', 'Transmuted', 'Spellbound'],
  sayings: [
    { text: 'Small paws, big spells' },
    { text: 'A full cheek is a calm mind', by: 'burrow proverb' },
    { text: 'Read the spell twice, cast it once' },
    { text: 'Every curse has its counter-spell' },
    { text: 'When in doubt, nibble and think', by: 'burrow proverb' },
    { text: 'No spell too small to do well' },
    { text: 'Even archmages were apprentices once' },
    { text: 'Glitter is no substitute for a test', by: 'The Little Grimoire' },
    { text: 'The wheel turns, and so does the mind', by: 'The Little Grimoire' },
    { text: 'Magic is mostly patience, and a few seeds' },
  ],
  // The wizard hamster in its starry hat, wand raised over an open spellbook
  sprite: {
    pixels: {
      ...FUR,
      V: '#b69cff', // violet sparkles
      T: '#8b5a2b', // wand
      Q: '#fff8e7', // pages
      q: '#c9b48a', // the pages' edges, the spine and a turning page
      C: '#c0475a', // the book's cover
    },
    base: [
      '.........Hh.............',
      '.......HHH..............',
      '......HHSH..............',
      '..KK.HSHHHh.KK..........',
      '..KPGGGGGGGGPK..........',
      'hhhhhhhhhhhhhhhh........',
      '.KOOOOOOOOOOOOK.........',
      '.KOOOLOOOOLOOOK.....S...',
      '.KOOOEONNOEOOOK....SSS..',
      '.KWWPWWMMWWPWWK....TS...',
      '.KWWWWWWWWWWWWK...T.....',
      'KOOWWWWWWWWWWOOOPT......',
      'KOOWPWWWWWWWWOOK........',
      'KOOWWWWWWWWWWOOK.qQ.Qq..',
      '.KOOWWWWWWWWOOK.qQQqQQq.',
      '..KPPKKKKKKPPK..CCCCCCC.',
    ],
    // While it writes, sparkles drift off the wand, a page of the book turns
    // and it blinks now and then; while it thinks, a sparkle circles the
    // wand's star and its cheeks puff in and out
    animate: (px, frame, isThinking) => {
      if (isThinking) {
        const [x, y] = ORBIT[frame % ORBIT.length]
        px[y][x] = 'V'
        if (frame % 4 >= 2) puff(px, 0)
      } else {
        const [x, y] = SPARKS[frame % SPARKS.length]
        const [u, v] = SPARKS[(frame + 2) % SPARKS.length]
        px[y][x] = 'S'
        px[v][u] = 'V'
        PAGE[frame % PAGE.length].forEach(([x, y]) => (px[y][x] = 'q'))
        if (frame % 12 === 11) shut(px, 0)
      }
    },
  },
  scenes: [
    // Stirring a bubbling cauldron over a little fire
    {
      pixels: {
        ...FUR,
        T: '#8b5a2b', // ladle
        B: '#7ee05a', // brew
        V: '#4fbf2a', // bubbles
        m: '#c9b8ff', // steam
        k: '#2a2a35', // the pot's outline
        I: '#9a9ab4', // the pot's rim
        i: '#62627a', // the pot
        F: '#ff8a2a', // fire
      },
      base: [
        '.........Hh.............',
        '.......HHH..............',
        '......HHSH..............',
        '..KK.HSHHHh.KK..........',
        '..KPGGGGGGGGPK..........',
        'hhhhhhhhhhhhhhhh........',
        '.KOOOOOOOOOOOOK.........',
        '.KOOOLOOOOLOOOK.........',
        '.KOOOEONNOEOOOK.........',
        '.KWWPWWMMWWPWWKO........',
        '.KWWWWWWWWWWWWKkBBBBBBk.',
        'KOOWWWWWWWWWWOkIIIIIIIIk',
        'KOOWPWWWWWWWWOkiIiiiiiik',
        'KOOWWWWWWWWWWOkiIiiiiiik',
        '.KOOWWWWWWWWOOKkiiiiiik.',
        '..KPPKKKKKKPPK..k.FF.k..',
      ],
      // While it writes, the hamster stirs, the ladle leaning one way and
      // then the other, bubbles rise off the brew and it blinks now and then;
      // while it thinks, the ladle rests and it shuts its eyes to sniff the
      // steam curling up
      animate: (px, frame, isThinking) => {
        LADLE[isThinking ? 0 : Math.floor(frame / 2) % 2].forEach(([x, y]) => (px[y][x] = 'T'))
        px[8][16] = 'P'
        if (isThinking) {
          shut(px, 0)
          STEAM.slice(frame % STEAM.length, (frame % STEAM.length) + 3).forEach(([x, y]) => (px[y][x] = 'm'))
        } else {
          for (const lag of [0, 3]) {
            const [x, y] = BUBBLES[(frame + lag) % BUBBLES.length]
            px[y][x] = 'V'
          }
          if (frame % 12 === 11) shut(px, 0)
        }
      },
    },
    // Gazing into a crystal ball, its paws on the glass
    {
      pixels: {
        ...FUR,
        b: '#5b8fd9', // the glass's edge
        A: '#bfe3ff', // the glass
        j: '#ffffff', // the glass's shine
        a: '#8f6ff0', // mist
        g: '#a0761c', // the stand's ends
      },
      base: [
        '.............Hh.........',
        '...........HHH..........',
        '..........HHSH..........',
        '......KK.HSHHHh.KK......',
        '......KPGGGGGGGGPK......',
        '....hhhhhhhhhhhhhhhh....',
        '.....KOOOOOOOOOOOOK.....',
        '.....KOOOLOOOOLOOOK.....',
        '.....KOOOEONNOEOOOK.....',
        '.....KWWPWWMMWWPWWK.....',
        '.....KWWWWbbbbWWWWK.....',
        '...KOOWWWbjAAAbWWWOOK...',
        '...KOOWWPbAAAAbPWWOOK...',
        '...KOOWWWbAAAAbWWWOOK...',
        '....KOOWWWbbbbWWWOOK....',
        '.....KKKgGGGGGGgKKK.....',
      ],
      // While it writes, mist circles inside the ball and the hamster blinks
      // now and then; while it thinks, its paws rub the glass, one up as the
      // other goes down, and the mist gathers in the middle
      animate: (px, frame, isThinking) => {
        if (isThinking) {
          const up = frame % 2
          px[12][8] = px[12][15] = 'W'
          px[up ? 11 : 13][8] = px[up ? 13 : 11][15] = 'P'
          VISION[frame % VISION.length].forEach(([x, y]) => (px[y][x] = 'a'))
        } else {
          for (const lag of [0, 1]) {
            const [x, y] = MIST[(frame + lag) % MIST.length]
            px[y][x] = 'a'
          }
          if (frame % 12 === 11) shut(px, 4)
        }
      },
    },
    // Nibbling a sunflower seed, the sunflower it came from beside it
    {
      pixels: {
        ...FUR,
        Y: '#f5b800', // petals
        D: '#8a5a24', // the flower's middle
        d: '#4f3214', // its seeds
        V: '#3f8f2a', // stem
        v: '#6cc04a', // leaves
        Z: '#3d3a36', // the seed in its paws
        z: '#9a948a', // the seed's stripe
      },
      base: [
        '.........Hh.............',
        '.......HHH.........YYY..',
        '......HHSH........YDDDY.',
        '..KK.HSHHHh.KK...YDdddDY',
        '..KPGGGGGGGGPK...YDdddDY',
        'hhhhhhhhhhhhhhhh.YDdddDY',
        '.KOOOOOOOOOOOOK...YDDDY.',
        '.KOOOLOOOOLOOOK....YYY..',
        '.KOOOEONNOEOOOK.....V...',
        '.KWWPWWMMWWPWWK.....Vv..',
        '.KWWWWWWWWWWWWK.....V...',
        'KOOWWWWZWWWWWOOK...vV...',
        'KOOWWPZzZPWWWOOK....V...',
        'KOOWWWZzZWWWWOOK....V...',
        '.KOOWWWZWWWWOOK.....V...',
        '..KPPKKKKKKPPK......V...',
      ],
      // While it writes, the hamster lifts the seed to its mouth, nibbles it
      // and stuffs its cheeks, a petal drifts down and it blinks now and then;
      // while it thinks, it gazes up at the sunflower as it sways
      animate: (px, frame, isThinking) => {
        if (isThinking) {
          glance(px, 0)
          const dx = SWAY[frame % SWAY.length]
          const flower = px.slice(1, 8).map(row => row.slice(16).join(''))
          for (let y = 1; y < 8; y++) px[y].splice(16, 8, ...'........')
          put(px, 16 + dx, 1, flower)
        } else {
          const step = frame % NIBBLE.length
          const [top, left] = NIBBLE[step]
          for (let y = 11; y < 15; y++) px[y].splice(5, 5, ...'WWWWW')
          put(px, 6, top + SEED.length - left, SEED.slice(SEED.length - left))
          px[top + 1][5] = px[top + 1][9] = 'P'
          if (step >= 2) puff(px, 0)
          const [x, y] = PETAL[frame % PETAL.length]
          px[y][x] = 'Y'
          if (frame % 12 === 11) shut(px, 0)
        }
      },
    },
    // The rare one: a spell gone wrong. The hamster has turned itself into a
    // frog, still wearing its hat, its wand dropped and smoking beside it
    {
      weight: 0.2,
      pixels: {
        ...FUR,
        F: '#6cc04a', // frog
        f: '#2f6b2a', // the frog's outline
        Y: '#d8f0a0', // its throat and belly
        Q: '#ffffff', // the whites of its eyes
        T: '#8b5a2b', // the dropped wand
        m: '#a8a8b8', // smoke
        y: '#55555f', // fly
        w: '#cfe6ff', // the fly's wings
      },
      base: [
        '.........Hh.............',
        '.......HHH..............',
        '......HHSH..............',
        '.....HSHHHh.............',
        '....GGGGGGGG............',
        'hhhhhhhhhhhhhhhh........',
        'fQQQfFFFFFFfQQQf........',
        'fQEQFFFFFFFFQEQf........',
        'fFFFFFFNNFFFFFFf........',
        'fFPEFFFFFFFFEPFf........',
        '.fFFEEEEEEEEFFf.........',
        '..fFYYYYYYYYFf..........',
        '.fFFYYYYYYYYFFf.........',
        'fFFFYYYYYYYYFFFf........',
        'fFFffFFFFFFffFFf........',
        'ffff.ffffff.ffff.TTTTS..',
      ],
      // While it writes, a fly buzzes about until the frog's tongue snaps it
      // up, and the frog shuts its eyes, pleased; while it thinks, its throat
      // swells and sinks, it gives one slow blink and the wand smokes
      animate: (px, frame, isThinking) => {
        const lids = (n: number) => {
          for (const x of [1, 12]) {
            if (n > 0) put(px, x, 6, ['FFF'])
            if (n > 1) put(px, x, 7, ['fff'])
          }
        }
        if (isThinking) {
          if (frame % 4 >= 2) put(px, 1, 11, ['fFYYYYYYYYYYFf', 'fYYYYYYYYYYYYf'])
          lids(LIDS[frame % LIDS.length])
          const at = frame % SMOKE.length
          SMOKE.slice(at, at + 2).forEach(([x, y]) => (px[y][x] = 'm'))
        } else {
          const step = frame % 6
          if (step < FLY.length) {
            const [x, y] = FLY[step]
            put(px, x, y - 1, ['w', 'y'])
          }
          if (step === 4) put(px, 12, 9, ['.........w', 'PPPPPPPPPy'])
          if (step === 5) lids(2)
        }
      },
    },
  ],
}
