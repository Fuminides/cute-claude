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
  pulse: '#6E2A3E',
  initial: letter => letter.toUpperCase(),
  frame: 'round',
  heading: ['ฅ ', ''],
  rule: '──── =^.^= ────',
  pen: '∿',
  mark: '♡',
  icon: 'ฅ',
  colophon: ['ฅ ', 'Nap time', 'ฅ'],
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
  ],
  // A ginger cat sitting at the keyboard, its tail curled up beside it
  sprite: {
    pixels: {
      K: '#3b2416', // outline
      O: '#f2a65a', // fur
      o: '#cf7b34', // tabby stripes
      W: '#fff3e2', // muzzle, chest and paws
      P: '#ff8fab', // inside the ears and the nose
      p: '#ffb8c9', // blush
      k: '#24160e', // eyes and the fish's eye
      Q: '#ffffff', // the shine in the eyes
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
      const put = (x: number, y: number, row: string) =>
        [...row].forEach((c, i) => {
          if (c !== '.') px[y][x + i] = c
        })

      TIP[(isThinking ? frame : Math.floor(frame / 2)) % 2].forEach((row, i) => {
        px[6 + i].splice(17, 7, ...'.......')
        put(17, 6 + i, row)
      })
      if (isThinking) {
        BUBBLE.slice(0, frame % 4).flat().forEach(([x, y]) => (px[y][x] = 'b'))
        if (frame % 4 === 3) FISH.forEach((row, i) => put(17, 1 + i, row.replace(/\./g, 'B')))
        if (frame % 4 === 1) (px[0][11] = '.'), (px[0][12] = 'K')
      } else {
        const paw = PAWS[frame % 2]
        px[14][paw] = px[14][paw + 1] = 'L'
        if (frame % 12 === 11) for (const x of [3, 4, 10, 11]) (px[5][x] = 'O'), (px[6][x] = 'k')
      }
    },
  },
}
