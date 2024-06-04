export { parse } from 'svelte/compiler'

export interface ExtractPosition {
  tagStart: number
  tagEnd: number
  /**
   * May be undefined if the tag is self-closing, e.g. `<script/>` or `<style/>`
   */
  contentStart?: number
  /**
   * May be undefined if the tag is self-closing, e.g. `<script/>` or `<style/>`
   */
  contentEnd?: number
}

export declare function extractScripts(template: string): ExtractPosition[]
export declare function extractStyles(template: string): ExtractPosition[]
