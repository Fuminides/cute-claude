import type { Theme } from './theme'

// Manuscript palette: vermilion rubrics and gold leaf
const RUBRIC = '#C0392B'
const GOLD = '#B8860B'

// Bold Fraktur capital for the first letter of a reply, like an illuminated initial
const illuminate = (text: string) => {
  const c = text.charCodeAt(0)
  const start = c >= 65 && c <= 90 ? 0x1d56c - 65 : c >= 97 && c <= 122 ? 0x1d586 - 97 : 0
  if (!start) return text
  const cap = c >= 97 ? 0x1d56c + (c - 97) : c + start
  return String.fromCodePoint(cap) + text.slice(1)
}

// Where the ink lands on the page's bottom line, the red initial first
const INK = [10, 11, 13, 14, 16, 17]

// Over his head, a thought bubble and the two puffs that lead to it
const BUBBLE = ['.qqqq.', 'qQQQQq', '.qqqq.']
const PUFFS = [[11, 4], [12, 2]]

export const medieval: Theme = {
  command: 'medieval',
  description: 'Toggle the medieval look: illuminated manuscript, a scribe and a light archaic voice',
  status: '✠ Ora et labora ✠',
  on: 'Hear ye: medieval mode is on. Type /medieval again to return to the modern age.',
  off: 'Medieval mode is off. Modern times return.',
  greeting: 'Brother scribe is at his desk, quill inked and ready.',
  // A light touch only: the reply keeps its normal register
  voice: {
    light:
      'Medieval mode is on. Give your prose a faint medieval flavour: at most once or twice per reply, use an old-fashioned word or turn of phrase that suits the language you are writing in (for example "en verdad", "menester" or "pardiez" in Spanish; "verily", "aye" or "forsooth" in English). Apart from that, keep your usual register, tone and clarity: no archaic grammar, no thee/thou or vuestra merced throughout, no role-play. Code, commands, paths and technical terms stay exactly as they are.',
  },
  colors: { rubric: RUBRIC, gilt: GOLD, letter: RUBRIC },
  initial: illuminate,
  frame: 'double',
  heading: ['❧ ', ''],
  rule: '──── ❦ ────',
  pen: '✎',
  mark: '✠',
  icon: '⚜',
  colophon: ['❦ ', 'Explicit', '❦'],
  words: [
    'Consulting the scrolls',
    'Summoning the scribes',
    'Forging',
    'Parleying with the wizard',
    'Brewing a potion',
    'Sharpening quills',
    'Riding to the castle',
    'Deciphering runes',
    'Polishing the armour',
    'Heeding the council',
  ],
  done: ['Decreed', 'Proclaimed', 'Forged', 'Illuminated', 'Sealed'],
  sayings: [
    { text: 'Laus Deo' },
    { text: 'Deo gratias' },
    { text: 'Laudetur Iesus Christus' },
    { text: 'Ora et labora' },
    { text: 'Tolle, lege', by: 'S. Augustinus' },
    { text: 'Dilige, et quod vis fac', by: 'S. Augustinus' },
    { text: 'Credo ut intelligam', by: 'S. Anselmus' },
    { text: 'Ignoratio Scripturarum ignoratio Christi est', by: 'S. Hieronymus' },
    { text: 'Ut in omnibus glorificetur Deus', by: 'S. Benedictus' },
    { text: 'Ad maiorem Dei gloriam', by: 'S. Ignatius' },
    { text: 'Dominus det tibi pacem', by: 'S. Franciscus' },
    { text: 'Ligna et lapides docebunt te', by: 'S. Bernardus' },
    { text: 'Non nobis, Domine, non nobis', by: 'Psalmus 113' },
    { text: 'Tres digiti scribunt, totum corpus laborat', by: 'scriptor ignotus' },
    { text: 'Finito libro sit laus et gloria Christo', by: 'scriptor ignotus' },
  ],
  // The scribe at his desk by candlelight
  sprite: {
    pixels: {
      K: '#1e140c', // outline
      R: '#7a4a2a', // habit
      r: '#4f2e18', // habit in shadow
      H: '#2e1c10', // inside the hood
      S: '#f0c08a', // skin
      s: '#c98e5a', // skin in shadow, and a closed eye
      W: '#f3e2b3', // parchment
      w: '#cdb57a', // parchment edge
      I: '#2b2b40', // ink
      N: RUBRIC, // the page's red initial
      Q: '#e6e6de', // quill and thought bubble
      q: '#9a9a90', // quill shaft and the bubble's rim
      D: '#8a5a2b', // desk
      d: '#5a3818', // desk legs
      C: '#f1e4b8', // candle
      c: '#c9b98a', // candle in shadow
      F: '#ffb52e', // flame
      f: '#ffdd55', // flame core
      G: GOLD, // candlestick
    },
    base: [
      '........................',
      '....KKKK................',
      '..KKRRRRK...............',
      '.KRRRRRRRK..............',
      '.KRRRRHHSK..............',
      'KRRRRHHSKSS..........F..',
      'KRRRRHHSSSK.........FfF.',
      'KRRRRRHSsK..........FfF.',
      'KRRRRRRKK.......Q....K..',
      'KRRRRRRRRK.....QQ...cCc.',
      'KRRRRRRRRRRRKSSq....cCc.',
      'KRRRrRRRRRRRSSq.....cCc.',
      'KRRRrRRRKWWWWWWWWWW.cCc.',
      'KRRRrRRRKwWWWWWWWWw.GGG.',
      'KrrrrrrrKDDDDDDDDDDDDDDD',
      'KKKKKKKKK.dd........dd..',
    ],
    // The flame flickers; while he writes, the ink spreads, the quill wiggles
    // and he blinks now and then; while he thinks, a bubble grows over him
    animate: (px, frame, isThinking) => {
      if (frame % 2) {
        px[5][21] = '.'
        px[5][22] = 'F'
        px[6][20] = '.'
        px[6][21] = 'f'
        px[6][22] = 'F'
      }
      INK.slice(0, isThinking ? INK.length : (frame % 6) + 1).forEach((x, i) => {
        px[13][x] = i === 0 ? 'N' : 'I'
      })
      if (isThinking) {
        const step = frame % 4
        PUFFS.slice(0, Math.min(step, 2)).forEach(([x, y]) => {
          px[y][x] = 'q'
        })
        if (step === 3) {
          BUBBLE.forEach((row, y) =>
            [...row].forEach((c, i) => {
              if (c !== '.') px[y][12 + i] = c
            }),
          )
        }
      } else {
        if (frame % 2) {
          px[8][16] = '.'
          px[8][17] = 'Q'
        }
        if (frame % 6 === 5) px[5][8] = 's'
      }
    },
  },
}
