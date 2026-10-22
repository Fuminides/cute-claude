export type Tick = { frame: number; seconds: number; tokens: number; effort?: string }

declare module 'claude-code' {
  interface PluginState {
    'cute-claude': { tick: Tick; scene: number }
  }
}
