// @ts-check
import { parse as parseSvelte } from 'svelte/compiler'

const contextModuleRegex = /context\s*=\s*["']module["']/i

// Use manual types here because TypeScript is unable to infer types for function overloads
/**
 * @param {string} template
 * @param {any} options
 */
export function parse(template, options) {
  const originalTemplate = template

  // text nodes that will be injected into the ast. there maybe be multiple as the regex
  // may catch script tags in `svelte:head` for example. we will handle this below.
  /** @type {import('svelte/compiler').Text[]} */
  const instanceNodes = []
  /** @type {import('svelte/compiler').Text[]} */
  const moduleNodes = []
  /** @type {import('svelte/compiler').Text[]} */
  const cssNodes = []

  // extract instance and module script tags
  const scripts = extractScripts(template)
  for (const s of scripts) {
    // ignore self-closing script tags as they parse fine
    if (s.contentStart == null || s.contentEnd == null) continue

    const isContextModule = contextModuleRegex.test(
      template.slice(s.tagStart, s.contentStart)
    )
    const content = template.slice(s.contentStart, s.contentEnd)
    // pre-construct text node
    /** @type {import('svelte/compiler').Text} */
    const node = {
      type: 'Text',
      start: s.contentStart,
      end: s.contentEnd,
      raw: content,
      data: content,
      parent: null
    }
    if (isContextModule) {
      moduleNodes.push(node)
    } else {
      instanceNodes.push(node)
    }
    // empty content to avoid parsing errors
    template = template.replace(content, ' '.repeat(content.length))
  }

  // extract css style tags
  const styles = extractStyles(template)
  for (const s of styles) {
    // ignore self-closing style tags as they parse fine
    if (s.contentStart == null || s.contentEnd == null) continue

    const content = template.slice(s.contentStart, s.contentEnd)
    // pre-construct text node
    /** @type {import('svelte/compiler').Text} */
    const node = {
      type: 'Text',
      start: s.contentStart,
      end: s.contentEnd,
      raw: content,
      data: content,
      parent: null
    }
    cssNodes.push(node)
    // empty content to avoid parsing errors
    template = template.replace(content, ' '.repeat(content.length))
  }

  // do the actual parsing
  const ast = parseSvelte(template, options)

  // inject instance script text node
  if (ast.instance && instanceNodes.length) {
    for (const node of instanceNodes) {
      if (
        // fast path
        instanceNodes.length === 1 ||
        // compare start-end slice to expected, only nodes that are inside the real instance script
        // will pass this condition
        originalTemplate.slice(node.start, node.end) === node.data
      ) {
        // @ts-expect-error inject text node
        ast.instance.content.body = [node]
      }
    }
  }

  // inject module script text node
  if (ast.module && moduleNodes.length) {
    for (const node of moduleNodes) {
      if (
        // fast path
        moduleNodes.length === 1 ||
        // compare start-end slice to expected, only nodes that are inside the real module script
        // will pass this condition
        originalTemplate.slice(node.start, node.end) === node.data
      ) {
        // @ts-expect-error inject text node
        ast.module.content.body = [node]
      }
    }
  }

  // inject css text node
  if (ast.css && cssNodes.length) {
    for (const node of cssNodes) {
      if (
        // fast path
        cssNodes.length === 1 ||
        // compare start-end slice to expected, only nodes that are inside the real css style
        // will pass this condition
        originalTemplate.slice(node.start, node.end) === node.data
      ) {
        // @ts-expect-error inject text node
        ast.css.children = [node]
        // also inject the raw styles
        // NOTE: `ast.css.content` has start and end but it's guaranteed to be the same,
        // so no change needed
        ast.css.content.styles = node.raw
      }
    }
  }

  return ast
}

/** @type {import('./index.d.ts').extractScripts} */
export function extractScripts(template) {
  /** @type {import('./index.d.ts').ExtractPosition[]} */
  const extracted = []

  let i = 0
  do {
    const tagStart = template.indexOf('<script', i)
    if (tagStart === -1) break

    const contentStart = lexUntilClosingTag(template, tagStart + 7)
    if (contentStart === -1) break

    // self-closing script tag
    if (template[contentStart - 2] === '/') {
      extracted.push({ tagStart, tagEnd: contentStart })
      i = contentStart
      continue
    }

    const contentEnd = template.indexOf('</script>', contentStart)
    if (contentEnd === -1) break

    const tagEnd = contentEnd + 9

    extracted.push({ tagStart, tagEnd, contentStart, contentEnd })
    i = tagEnd
  } while (i < template.length)

  return extracted
}

/** @type {import('./index.d.ts').extractStyles} */
export function extractStyles(template) {
  /** @type {import('./index.d.ts').ExtractPosition[]} */
  const extracted = []

  let i = 0
  do {
    const tagStart = template.indexOf('<style', i)
    if (tagStart === -1) break

    const contentStart = lexUntilClosingTag(template, tagStart + 6)
    if (contentStart === -1) break

    // self-closing script tag
    if (template[contentStart - 2] === '/') {
      extracted.push({ tagStart, tagEnd: contentStart })
      i = contentStart
      continue
    }

    const contentEnd = template.indexOf('</style>', contentStart)
    if (contentEnd === -1) break

    const tagEnd = contentEnd + 8

    extracted.push({ tagStart, tagEnd, contentStart, contentEnd })
    i = tagEnd
  } while (i < template.length)

  return extracted
}

/**
 * Try to lex from index until we find a `>` or `/>`.
 * The number will be the index after `>` or `/>`.
 * If no closing tag is found, return -1.
 * @param {string} template
 * @param {number} startIndex
 */
function lexUntilClosingTag(template, startIndex) {
  let i = startIndex
  /** @type {'"' | "'" | false}  */
  let withinQuotes = false
  let c
  while ((c = template[i++])) {
    if (c === '"' || c === "'") {
      if (withinQuotes) {
        if (c === withinQuotes) {
          withinQuotes = false
        }
      } else {
        withinQuotes = c
      }
    } else if (withinQuotes) {
      continue
    } else if (c === '>') {
      return i
    } else if (c === '/' && template[i] === '>') {
      return i + 1
    }
  }
  return -1
}
