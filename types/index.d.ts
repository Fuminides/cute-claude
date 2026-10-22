export type Tick = { frame: number; seconds: number }

declare module 'claude-code' {
  interface PluginState {
    'cute-claude': { tick: Tick }
  }
}
