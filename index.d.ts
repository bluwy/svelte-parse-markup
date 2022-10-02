import type { Ast, ParserOptions } from 'svelte/types/compiler/interfaces'

/**
 * Parse a Svelte template without parsing the script or style tags
 */
export declare function parse(template: string, options?: ParserOptions): Ast
