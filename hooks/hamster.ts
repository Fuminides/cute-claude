import type { Theme } from './theme'

// Spellbook palette: a starry violet hat, seed gold and the hamster's own amber fur
const VIOLET = '#8B5CF6'
const GOLD = '#E0A526'
const AMBER = '#E8892B'

// Where the wand's star is, where its eyes are, and the path its sparkles drift along
const TIP = [20, 8]
const EYES = [5, 10]
const SPARKS = [[22, 6], [21, 4], [23, 3], [22, 1]]

// A page of the book turning, one frame at a time: lifted, upright, laid down
const PAGE = [[], [[20, 12], [21, 12]], [[19, 11], [19, 12]], [[17, 12], [18, 12]]]

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
  pulse: '#5A3510',
  initial: letter => letter.toUpperCase(),
  frame: 'round',
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
      K: '#4a2c1a', // outline
      O: '#f0a04b', // fur
      W: '#fff3e0', // cheeks and belly
      E: '#1b1010', // eyes
      L: '#fffbe6', // eye shine and the glow at the wand's tip
      N: '#ff7f9e', // nose
      M: '#a0522d', // mouth
      P: '#ffb0c4', // ears, blush and paws
      H: '#7b5cf0', // hat
      h: '#5236c0', // hat in shadow
      G: '#e9b13a', // hat band
      S: '#ffd34d', // stars and gold sparkles
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
    // and it blinks now and then; while it thinks, the wand's star and the
    // hat's stars twinkle and its cheeks puff out
    animate: (px, frame, isThinking) => {
      if (isThinking) {
        if (frame % 2) {
          for (let y = 0; y < 5; y++) px[y] = px[y].map(c => (c === 'S' ? 'L' : c))
          const [x, y] = TIP
          px[y][x] = 'L'
          for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
            if (px[y + dy][x + dx] === '.') px[y + dy][x + dx] = 'V'
          }
        }
        if (frame % 4 >= 2) {
          for (const y of [9, 10]) {
            px[y][0] = px[y][15] = 'K'
            px[y][1] = px[y][14] = 'W'
          }
        }
      } else {
        const [x, y] = SPARKS[frame % SPARKS.length]
        const [u, v] = SPARKS[(frame + 2) % SPARKS.length]
        px[y][x] = 'S'
        px[v][u] = 'V'
        PAGE[frame % PAGE.length].forEach(([x, y]) => (px[y][x] = 'q'))
        if (frame % 12 === 11) EYES.forEach(x => ((px[7][x] = 'O'), (px[8][x] = 'K')))
      }
    },
  },
}
