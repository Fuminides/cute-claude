import type { Theme } from './theme'

// Forge-world palette: Mars red, brass and the phosphor green of a cogitator screen
const RED = '#C62828'
const BRASS = '#C8A24A'
const PHOSPHOR = '#39FF6A'

// Lines of glyphs that scroll up the cogitator's screen while he writes
const LINES = ['GGgBGGBgG', 'gGGGBGgBB', 'GBGgGGBGg', 'BGGBgBGGG', 'GgGGBBGgB', 'GGBGgGBBG']

// A cog turning on the screen while he thinks
const COG = [
  ['BGB', 'GGG', 'BGB'],
  ['GBG', 'BgB', 'GBG'],
]

export const mechanicus: Theme = {
  command: 'mechanicus',
  description: 'Toggle the Adeptus Mechanicus look; /mechanicus full for full role-play immersion',
  status: '⚙ Praise the Omnissiah ⚙',
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
  colors: { rubric: RED, gilt: BRASS, letter: PHOSPHOR },
  pulse: '#0F5A26',
  initial: letter => letter.toUpperCase(),
  frame: 'bold',
  heading: ['+++ ', ' +++'],
  rule: '──── ⚙ ────',
  pen: '⚙',
  mark: '⚙',
  icon: '⚙',
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
    pixels: {
      K: '#140a0a', // outline
      R: '#a3191c', // robe
      r: '#6b0f12', // robe in shadow
      H: '#0d0606', // inside the hood
      E: PHOSPHOR, // eyes
      e: '#1f8f3c', // eyes dimmed
      M: '#b08d57', // brass
      m: '#6e5531', // brass in shadow
      C: '#d9b76a', // bright brass: cog and keys
      S: '#8a8f94', // steel: mechadendrite and hand
      s: '#4b5055', // steel in shadow
      B: '#062b12', // screen
      G: PHOSPHOR, // glyphs on the screen
      g: '#1f8f3c', // dim glyphs
    },
    base: [
      '....sSsS................',
      '...S....s...............',
      '..s......S..mMMMMMMMMMm.',
      '..S..KKK..s.MBBBBBBBBBM.',
      '...KKRRRK..SMBBBBBBBBBM.',
      '..KRRRRRRK..MBBBBBBBBBM.',
      '..KRRRHHHK..MBBBBBBBBBM.',
      '.KRRRRHEHE..MBBBBBBBBBM.',
      '.KRRRRHHHK..MBBBBBBBBBM.',
      '.KRRRRRHK...mMMMMCMMMMm.',
      'KRRRRRRRRK.....mm.mm....',
      'KRRRRRRRRRRRSs..........',
      'KRRRrRRRRKmMMMMMMMMMMm..',
      'KRRRrRRRRKmCmCmCmCmCmm..',
      'KrrrrrrrrKKKKKKKKKKKKKK.',
      'KKKKKKKKKK..ss......ss..',
    ],
    // While he writes, glyphs scroll up the screen, his hand types and the
    // mechadendrite's tip flickers; while he thinks, a cog turns on the
    // screen, the cursor blinks and his eyes pulse
    animate: (px, frame, isThinking) => {
      const put = (x: number, y: number, s: string) =>
        [...s].forEach((c, i) => {
          px[y][x + i] = c
        })

      if (isThinking) {
        COG[frame % 2].forEach((row, i) => put(16, 4 + i, row))
        if (frame % 2 === 0) px[7][13] = 'G'
        if (frame % 4 >= 2) px[7][7] = px[7][9] = 'e'
      } else {
        for (let i = 0; i < 4; i++) put(13, 4 + i, LINES[(frame + i) % LINES.length])
        if (frame % 2) put(12, 11, 'sS')
        px[4][11] = frame % 2 ? 'S' : 's'
      }
    },
  },
}
