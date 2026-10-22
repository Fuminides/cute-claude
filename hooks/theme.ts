// Everything one look changes; the hooks in register.tsx draw from it
export type Theme = {
  command: string
  description: string
  status: string
  // What the command answers when it turns the look on (in full immersion) or off
  on: string
  onFull?: string
  off: string
  // What the look's figure says above the prompt once the look turns on, until the first reply
  greeting: string
  // The system prompt section while on: a light touch, and the full role-play if the look has one
  voice: { light: string; full?: string }
  // rubric: headings and marks; gilt: frames and ornaments; letter: the drop cap and the spinner's words
  colors: { rubric: string; gilt: string; letter: string }
  // Where the spinner's words dim to as they pulse while the model thinks; absent, they hold steady
  pulse?: string
  initial: (letter: string) => string
  // The drop cap's border; a look without one opens its replies plainly
  frame?: string
  heading: [string, string]
  rule: string
  pen: string
  mark: string
  icon: string
  colophon: [string, string, string]
  words: string[]
  done: string[]
  // What the figure beside the spinner says beneath himself, one a day; absent, he keeps quiet
  sayings?: { text: string; by?: string }[]
  sprite: Sprite
  // More pictures beside the spinner: each turn shows one of them or the
  // sprite, drawn at random and never the same twice running; absent, the
  // sprite stays
  scenes?: Sprite[]
}

// A picture beside the spinner, one character a pixel ('.' is empty), and
// how one frame of it changes while the model thinks or writes
export type Sprite = {
  // How likely the picture is to be drawn against the others' 1: below 1 for a rare one
  weight?: number
  pixels: Record<string, string>
  base: string[]
  animate: (px: string[][], frame: number, isThinking: boolean) => void
}
