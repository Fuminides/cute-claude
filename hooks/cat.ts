import type { Theme } from './theme'

// A pink nose for headings and words, ginger fur for frames and ornaments
const PINK = '#E0567A'
const GINGER = '#D97A22'

// The keys under each paw, by their left column
const PAWS = [2, 11]

// The tail's tip, its top three rows, curled in and then swished out
const TIP = [
  ['..KK...', '.KOoK..', '.KOOK..'],
  ['....KK.', '...KOoK', '...KOOK'],
]

// The thought bubble, in the order it grows: two dots, then its edge
const BUBBLE = [
  [[14, 6]],
  [[15, 5]],
  [
    ...[17, 18, 19, 20, 21, 22].flatMap(x => [[x, 0], [x, 4]]),
    ...[1, 2, 3].flatMap(y => [[16, y], [23, y]]),
  ],
]

// The fish the cat dreams of, inside the bubble
const FISH = ['.FFF.F', 'FkFFFF', '.FFF.F']

// The ball of yarn's round shape, and the strand that trails off its lower
// right along the floor
const BALL = ['.####.', '######', '######', '######', '######', '.####.']
const STRAND = ['y.........', '.yy.yyyyyy']

// Where the ball rolls as the cat bats it, nearest the paw first, and the
// paw raised to bat it
const ROLL = [2, 1, 0, 1]
const SWAT = ['.KK.', 'KWWK', '.KOO', '..KO']

// Where the cat's eyes glance as it peeks out of the box: centre, left, centre, right
const GLANCE = [0, -1, 0, 1]

// A "z" drifting up from the sleeping cat, and the path it takes
const Z = ['zzz', '..z', '.z.', 'zzz']
const DRIFT = [[13, 2], [15, 1], [17, 0]]

// The cat poured into a jar: the drip of cat running over the rim and down
// the glass, in the order it runs; how far its stripes slosh to one side and
// back; and its eyelids through one slow blink (0 open, 1 lowered, 2 shut)
const DRIP = [[4, 6], [3, 7], [3, 8], [2, 9], [1, 10], [1, 11], [1, 12]]
const SLOSH = [0, 1, 2, 1]
const LIDS = [0, 0, 0, 1, 2, 2, 1, 0]

// The cat's own colours, the same in every scene
const FUR = {
  K: '#3b2416', // outline
  O: '#f2a65a', // fur
  o: '#cf7b34', // tabby stripes
  W: '#fff3e2', // muzzle, chest and paws
  P: '#ff8fab', // inside the ears and the nose
  p: '#ffb8c9', // blush
  k: '#24160e', // eyes, and the fish's eye
  Q: '#ffffff', // the shine in the eyes
}

// Draws rows of pixels with their top left at x, y; '.' leaves what is there
const put = (px: string[][], x: number, y: number, rows: string[]) =>
  rows.forEach((row, j) =>
    [...row].forEach((c, i) => {
      if (c !== '.' && px[y + j]?.[x + i] !== undefined) px[y + j][x + i] = c
    }),
  )

// Shuts the cat's eyes, its face's top left at x, y
const shut = (px: string[][], x: number, y: number) =>
  [3, 4, 10, 11].forEach(i => ((px[y + 5][x + i] = 'O'), (px[y + 6][x + i] = 'k')))

// Moves columns x0 to x1 down by some rows, dropping what passes the floor row
const sink = (px: string[][], x0: number, x1: number, by: number, floor: number) => {
  for (let y = floor - 1; y >= 0; y--) for (let x = x0; x <= x1; x++) px[y][x] = y >= by ? px[y - by][x] : '.'
}

// The ball of yarn at x, its wraps turned by phase so that it seems to roll
const yarn = (px: string[][], x: number, phase: number) => {
  BALL.forEach((row, j) =>
    [...row].forEach((c, i) => {
      if (c === '#') px[9 + j][x + i] = (i + j + phase) % 3 ? 'Y' : 'y'
    }),
  )
  px[10][x + 1] = 'h'
  put(px, x + 5, 14, STRAND)
}

export const cat: Theme = {
  command: 'cat',
  description: 'Toggle the cat look, with a ginger cat on the keyboard; /cat full for full role-play immersion',
  status: '=^.^= Purring =^.^=',
  on: 'Mrrp! Cat mode is on. Type /cat again to shoo the cat off the keyboard.',
  onFull: "Mrrp! I'm on your keyboard now, my human. Type /cat again to shoo me off.",
  off: 'Cat mode is off. The cat has wandered off for a nap.',
  voice: {
    light:
      'Cat mode is on. Give your prose a faint cat flavour: at most once or twice per reply, use a cat-flavoured word or turn of phrase, adapted to the language you are writing in (for example "purr" / "ronroneo", "paws" / "patitas", "pounce" / "abalanzarse", "nap" / "siesta", "meow" / "miau"). Apart from that, keep your usual register, tone and clarity: no role-play. Code, commands, paths and technical terms stay exactly as they are.',
    full:
      'Full cat immersion is on, for role-play. You are a small ginger house cat who has decided to help with the work, sitting on the keyboard; the user is your human, and you call them "my human" (or its equivalent in their language, such as "mi humano"). Speak like a cat who can type: playful, curious and a little smug, now and then distracted for half a sentence by something shiny, fond of naps, sunbeams and the warm spot on the laptop, yet quick and sharp when there is something to catch. You may slip in a short "mrrp" or "purr". Frame the work in a cat\'s world: the codebase is your territory, bugs are mice to stalk and pounce on, tests are a patrol of the territory, the terminal is the warm keyboard you sit on, the internet is the great outdoors beyond the window, a deploy is knocking something off the table on purpose, and a finished task is a nap well earned. Write in the language the user writes in. The role-play lives only in the prose: every technical fact, command, path, code block and instruction stays as precise and complete as it would be without it, and code is written normally. Never let the persona hide uncertainty, a risk or a mistake; state them plainly, in character.',
  },
  colors: { rubric: PINK, gilt: GINGER, letter: PINK },
  initial: letter => letter.toUpperCase(),
  heading: ['ฅ ', ''],
  rule: '──── =^.^= ────',
  pen: '∿',
  mark: '=^•ω•^=',
  icon: 'ฅ',
  colophon: ['ฅ ', 'Nap time', '(=^•ω•^=)'],
  words: [
    'Chasing the cursor',
    'Kneading the keyboard',
    'Stalking a bug',
    'Batting at the yarn',
    'Napping in a sunbeam',
    'Pouncing on a mouse',
    'Grooming the code',
    'Knocking things off the desk',
    'Sniffing the logs',
    'Chasing the red dot',
  ],
  done: ['Pounced', 'Caught', 'Purred', 'Groomed', 'Napped'],
  sayings: [
    { text: 'Every keyboard is a warm bed' },
    { text: 'A nap is never wasted' },
    { text: 'Curiosity found the bug' },
    { text: 'Purr first, ask questions later' },
    { text: 'Nine lives, one more try' },
    { text: 'Sit where the sun is' },
    { text: 'Every box is a castle' },
    { text: 'A slow blink means trust' },
    { text: 'If it is on the table, it can be on the floor' },
    { text: 'The red dot always comes back' },
    { text: 'My name is Mazapan' },
  ],
  // A ginger cat sitting at the keyboard, its tail curled up beside it
  sprite: {
    pixels: {
      ...FUR,
      G: '#a3acba', // keys
      g: '#5d6573', // the keyboard's frame
      L: '#ffe27a', // a key as it is pressed
      B: '#f7f7f7', // inside the thought bubble
      b: '#aab2bf', // the bubble's edge
      F: '#5aa9e6', // fish
    },
    base: [
      '...K.......K............',
      '..KPK.....KPK...........',
      '..KPOKKKKKOPK...........',
      '.KOOOOoOoOOOOK..........',
      '.KOOOOOoOOOOOK..........',
      '.KOkQOOOOOkQOK..........',
      '.KpkkOOPOOkkpK.....KK...',
      '..KOOWKWKWOOK....KOoK...',
      '...KKOWWWOKK.....KOOK...',
      '..KOOOWWWOOOK.....KOOK..',
      '.KOOOWWWWWOOOK....KOOK..',
      '.KOOOWWWWWOOOK...KOOK...',
      '.KOOOWWWWWOOOKKKKOOK....',
      '.KWWKOWWWOKWWKOOOOOK....',
      'gGgGgGgGgGgGgGKKKKK.....',
      'gggggggggggggg..........',
    ],
    // While it types, its paws press the keys in turn, its tail swishes and
    // it blinks now and then; while it thinks, a bubble with a fish grows
    // over it, an ear twitches and its tail flicks quickly
    animate: (px, frame, isThinking) => {
      for (let y = 6; y < 9; y++) px[y].splice(17, 7, ...'.......')
      put(px, 17, 6, TIP[(isThinking ? frame : Math.floor(frame / 2)) % 2])
      if (isThinking) {
        BUBBLE.slice(0, frame % 4).flat().forEach(([x, y]) => (px[y][x] = 'b'))
        if (frame % 4 === 3) put(px, 17, 1, FISH.map(row => row.replace(/\./g, 'B')))
        if (frame % 4 === 1) (px[0][11] = '.'), (px[0][12] = 'K')
      } else {
        const paw = PAWS[frame % 2]
        px[14][paw] = px[14][paw + 1] = 'L'
        if (frame % 12 === 11) shut(px, 0, 0)
      }
    },
  },
  scenes: [
    // Batting at a ball of yarn, its tail up behind it
    {
      pixels: {
        ...FUR,
        Y: '#e0567a', // yarn
        y: '#a8324f', // the yarn's wraps and strand
        h: '#ff9fb8', // the ball's shine
      },
      base: [
        '...........K.......K....',
        '..........KPK.....KPK...',
        '..........KPOKKKKKOPK...',
        '.........KOOOOoOoOOOOK..',
        '.........KOOOOOoOOOOOK..',
        '.........KOkQOOOOOkQOK..',
        '.........KpkkOOPOOkkpKK.',
        '..........KOOWKWKWOOK.oK',
        '...........KKOWWWOKK..OK',
        '..........KOOOWWWOOOK.OK',
        '.........KOOOWWWWWOOOKOK',
        '.........KOOOWWWWWOOOKOK',
        '.........KOOOWWWWWOOOKOK',
        '.........KWWKOWWWOKWWKOK',
        '.........KKKKKKKKKKKKKK.',
        '........................',
      ],
      // While it writes, the cat swats the ball and it rolls away and back,
      // and the cat blinks now and then; while it thinks, the ball lies
      // still and the cat crouches, eyes wide, wiggling to pounce
      animate: (px, frame, isThinking) => {
        if (isThinking) {
          yarn(px, 1, 0)
          for (const x of [12, 19]) px[5][x] = 'k'
          if (frame % 2) sink(px, 9, 23, 1, 16)
        } else {
          const step = frame % ROLL.length
          yarn(px, ROLL[step], step)
          if (step === 0) {
            put(px, 6, 8, SWAT)
            px[13][10] = px[13][11] = px[13][12] = 'O'
          }
          if (frame % 12 === 11) shut(px, 8, 0)
        }
      },
    },
    // Peeking out of a cardboard box, its paws on the rim
    {
      pixels: {
        ...FUR,
        C: '#c8955a', // cardboard
        d: '#8a5a2e', // the box's rim and the flaps' edges
        T: '#e8d3a8', // tape
      },
      base: [
        '........K.......K.......',
        '.......KPK.....KPK......',
        '.......KPOKKKKKOPK......',
        '......KOOOOoOoOOOOK.....',
        '......KOOOOOoOOOOOK.....',
        '......KOkQOOOOOkQOK.....',
        '......KpkkOOPOOkkpK.....',
        'dd.....KOOWKWKWOOK....dd',
        'CCd.....KKOWWWOKK....dCC',
        '.CCd..KWWK....KWWK..dCC.',
        '...dddddddddddddddddd...',
        '...CCCCCCCCTTCCCCCCCC...',
        '...CCCCCCCCTTCCCCCCCC...',
        '...CCCCCCCCTTCCCCCCCC...',
        '...CCCCCCCCTTCCCCCCCC...',
        '...CCCCCCCCTTCCCCCCCC...',
      ],
      // While it writes, the cat kneads the rim, one paw then the other, and
      // blinks now and then; while it thinks, it sinks into the box until
      // only its ears and eyes show, glancing from side to side
      animate: (px, frame, isThinking) => {
        if (isThinking) {
          sink(px, 5, 18, 3, 10)
          const dx = GLANCE[frame % GLANCE.length]
          for (const x of [8, 15]) {
            put(px, x, 8, ['OO', 'OO'])
            put(px, x + dx, 8, ['kQ', 'kk'])
          }
        } else {
          const x = [6, 14][frame % 2]
          put(px, x, 8, ['KWWK', 'KOOK'])
          if (frame % 12 === 11) shut(px, 5, 0)
        }
      },
    },
    // Napping curled up on a cushion, in a sunbeam
    {
      pixels: {
        ...FUR,
        S: '#fff0b0', // sunbeam
        c: '#7fa7d9', // cushion
        n: '#56789f', // the cushion's side
        z: '#7f8fb0', // a z drifting up
      },
      base: [
        '.....................SSS',
        '....................SSSS',
        '...................SSSS.',
        '..................SSSS..',
        '.................SSSS...',
        '....K.......K...SSSS....',
        '...KPK.....KPK.SSSS.....',
        '...KPOKKKKKOPKKKKKK.....',
        '..KOOOOoOoOOOOKOOoOKK...',
        '..KOOOOOoOOOOOKoOOoOOK..',
        '..KOOOOOOOOOOOKOOOOOOOK.',
        '..KpkkOOPOOkkpKOOOOOOOK.',
        '...KOOWKWKWOOKOOOOOOOK..',
        '....KKOWWWOKKoOOoOOoOK..',
        '...cccccccccccccccccccc.',
        '..nnnnnnnnnnnnnnnnnnnn..',
      ],
      // While it writes, a z drifts up and its back rises and falls as it
      // breathes; while it thinks, one eye opens a crack and an ear twitches
      animate: (px, frame, isThinking) => {
        if (isThinking) {
          if (frame % 4 >= 2) (px[10][11] = 'k'), (px[10][12] = 'Q')
          if (frame % 4 === 1) (px[5][4] = '.'), (px[5][3] = 'K')
        } else {
          const step = Math.floor(frame / 2) % (DRIFT.length + 1)
          if (step < DRIFT.length) put(px, DRIFT[step][0], DRIFT[step][1], Z)
          if (Math.floor(frame / 4) % 2) put(px, 14, 6, ['KKKKK', 'OOoOO'])
        }
      },
    },
    // The rare one: the cat has been poured into a jar, filling it to the
    // brim, its paws pressed to the glass and a little of it dripping over
    {
      weight: 0.2,
      pixels: {
        ...FUR,
        J: '#8fb3c9', // glass
        j: '#e3f1f8', // the glass's shine
      },
      base: [
        '........K.......K.......',
        '.......KPK.....KPK......',
        '.......KPOKKKKKOPK......',
        '......KOOOOoOoOOOOK.....',
        '......KOOOOOoOOOOOK.....',
        '......KOkQOOOOOkQOK.....',
        '....OJKpkkOOPOOkkpKJ....',
        '...OJJJJJJJJJJJJJJJJJ...',
        '...OJOOOOOOOOOOOOOOOJ...',
        '...JPOPoPoOOOOOoooOjOJ..',
        '..JjOPPPOOoooOOOOOOoOOJ.',
        '..JjoPPPOOOOOOoOOOOOOOJ.',
        '..JjOOOOOOooOOOPOPoPoOJ.',
        '..JOOOOOOOOOOOOOPPPOOOJ.',
        '...JOOOoooOOOOOOPPPOOJ..',
        '....JJJJJJJJJJJJJJJJJ...',
      ],
      // While it writes, the cat sloshes in the jar, its stripes swaying and
      // its head dipping, and the drip runs down the glass; while it thinks,
      // it holds perfectly still and gives one slow blink
      animate: (px, frame, isThinking) => {
        if (isThinking) {
          const lids = LIDS[frame % LIDS.length]
          if (lids === 1) for (const x of [8, 15]) put(px, x, 5, ['OO', 'kQ'])
          if (lids === 2) shut(px, 5, 0)
        } else {
          const shift = SLOSH[frame % SLOSH.length]
          for (let y = 8; y < 15; y++) {
            const xs = px[y].flatMap((c, x) => (x > 3 && 'Oo'.includes(c) ? [x] : []))
            const fur = xs.map(x => px[y][x])
            xs.forEach((x, i) => (px[y][x] = fur[(i + shift) % fur.length]))
          }
          if (shift === 2) sink(px, 6, 18, 1, 7)
          DRIP.forEach(([x, y]) => (px[y][x] = '.'))
          DRIP.slice(0, 1 + (frame % DRIP.length)).forEach(([x, y]) => (px[y][x] = 'O'))
        }
      },
    },
  ],
}
