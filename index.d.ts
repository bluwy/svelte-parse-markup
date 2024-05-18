type ParseFunc = typeof import('svelte/compiler').parse;
type ParseOptions = Parameters<ParseFunc>[1];
type ParseOutput = ReturnType<ParseFunc>;

/**
 * Parse a Svelte template without parsing the script or style tags
 */
export declare function parse(template: string, options?: ParseOptions): ParseOutput;
