// Everything one look changes; the hooks in register.tsx draw from it
export type Theme = {
  command: string
  description: string
  status: string
  // What the command answers when it turns the look on (in full immersion) or off
  on: string
  onFull?: string
  off: string
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
  // The picture beside the spinner, one character a pixel ('.' is empty), and
  // how one frame of it changes while the model thinks or writes
  sprite: {
    pixels: Record<string, string>
    base: string[]
    animate: (px: string[][], frame: number, isThinking: boolean) => void
  }
}
