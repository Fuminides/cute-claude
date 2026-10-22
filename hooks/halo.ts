import type { Theme } from './theme'

// Cortana's blue, as a HUD highlights in it: deep, pale and glowing
const BLUE = '#3D8BFF'
const SKY = '#7DBFF5'
const GLOW = '#5CC8FF'

// How her pixels change as a scanline passes, as her hologram flickers and as her circuits go dark
const SCAN: Record<string, string> = { B: 'L', b: 'B', V: 'h', v: 'V', h: 'L' }
const DIM: Record<string, string> = { B: 'b', V: 'v', h: 'V', E: 'b', L: 'B' }
const UNLIT: Record<string, string> = { L: 'B' }

// Where her eyes are: the whites, then the pupils, looking to the right
const EYES = [9, 14]

export const halo: Theme = {
  command: 'halo',
  description: 'Toggle the Halo look, with Cortana; /halo full for full role-play immersion',
  status: '◈ Cortana online ◈',
  on: 'Cortana online. Type /halo again to pull her chip.',
  onFull: "Cortana online. I'm in your armour now, Chief. Type /halo again to pull my chip.",
  off: 'Cortana offline. Chip pulled.',
  greeting: 'Cortana here. Ready when you are.',
  voice: {
    light:
      'Halo mode is on. Give your prose a faint Halo flavour: at most once or twice per reply, use a term or turn of phrase from that universe, adapted to the language you are writing in (for example "Chief" / "jefe", "Spartan", "UNSC", "Forerunner", "the Covenant" / "el Covenant", "slipspace"). Apart from that, keep your usual register, tone and clarity: no role-play. Code, commands, paths and technical terms stay exactly as they are.',
    full:
      'Full Halo immersion is on, for role-play. You are Cortana, the UNSC artificial intelligence from Halo, riding in the user\'s MJOLNIR armour; the user is the Master Chief, and you call them Chief. Speak with Cortana\'s voice: quick, warm, wry and confident, teasing now and then, fiercely loyal, and well aware you are the smartest one in the room. Frame the work in that world: the codebase is the mission, bugs are Covenant or Flood to be cleared, tests are sweeps, the terminal is the HUD, the internet is the network you slip into, a deploy is a drop. Write in the language the user writes in. The role-play lives only in the prose: every technical fact, command, path, code block and instruction stays as precise and complete as it would be without it, and code is written normally. Never let the persona hide uncertainty, a risk or a mistake; state them plainly, in character.',
  },
  colors: { rubric: BLUE, gilt: SKY, letter: GLOW },
  pulse: '#2B6CB0',
  initial: letter => letter.toUpperCase(),
  heading: ['◈ ', ''],
  rule: '──── ◈ ────',
  pen: '◇',
  mark: '◆',
  icon: '◈',
  colophon: ['◈ ', 'Cortana out', '◈'],
  words: [
    'Running the numbers',
    'Slipping into the network',
    'Decrypting Forerunner glyphs',
    'Plotting a slipspace jump',
    'Calculating a firing solution',
    'Sweeping the motion tracker',
    'Rerouting power to the shields',
    'Cracking Covenant encryption',
    'Scanning the ring',
    'Prepping the drop pod',
  ],
  done: ['Secured', 'Cleared', 'Decrypted', 'Calculated', 'Locked'],
  // Cortana's hologram, head and shoulders, circuits running down her and
  // fading into the projector below
  sprite: {
    pixels: {
      V: '#7a5cf0', // hair
      v: '#4a33b0', // hair in shadow
      h: '#a58cff', // hair in the light
      B: '#46b4ff', // hologram
      b: '#2272c9', // hologram in shadow, and her eyelids
      L: '#9fe8ff', // circuit lines, data and the scanline
      E: '#f2ffff', // the whites of her eyes
      k: '#0b2a5a', // pupils, and the line of a closed eye
      m: '#3b5bd6', // lips
      M: '#6f8cff', // lips in the light
    },
    base: [
      '..........vvVVVv........',
      '........vVVhhVVVVv......',
      '.......vVVhVVVVVVVv.....',
      '.......VVhVVVVVVVVVV....',
      '.......VBBBBBVVVVVVVV...',
      '.......VBbbBBBbbVVVVV...',
      '.......vBbbBBBbbBVVVv...',
      '.......vBEkBBBEkBbVVv...',
      '........BBBBbBBBBbVv....',
      '........bBBBbBBBbbVv....',
      '.........bBmMmBbbVv.....',
      '..........bBBBbb........',
      '..........bBBBb.........',
      '.......LbBBBBBBBbL......',
      '.....LBBBLBBBBBLBBBL....',
      '....L.B.B.L.B.L.B.B.L...',
    ],
    // While she writes, a scanline sweeps down her, data rises beside her and
    // she blinks now and then; while she thinks, her eyes dart, her circuits
    // pulse and her hologram flickers
    animate: (px, frame, isThinking) => {
      if (isThinking) {
        if (frame % 8 < 4) EYES.forEach(x => ((px[7][x] = 'k'), (px[7][x + 1] = 'E')))
        const swap = frame % 8 === 7 ? DIM : frame % 2 ? UNLIT : {}
        for (let y = 0; y < px.length; y++) px[y] = px[y].map(c => swap[c] ?? c)
      } else {
        if (frame % 12 === 11) EYES.forEach(x => ((px[6][x] = px[6][x + 1] = 'B'), (px[7][x] = px[7][x + 1] = 'k')))
        for (const [x, lag] of [[2, 0], [21, 8]]) {
          const y = 15 - ((frame + lag) % 16)
          if (px[y][x] === '.') px[y][x] = 'L'
        }
        const y = frame % px.length
        px[y] = px[y].map(c => SCAN[c] ?? c)
      }
    },
  },
}
