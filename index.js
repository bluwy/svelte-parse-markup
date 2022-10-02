import { parse as parseSvelte } from 'svelte/compiler'

// https://github.com/sveltejs/svelte/blob/0b46c72cada210b3a6c72c30a51d35f5c4ccefb3/src/compiler/preprocess/index.ts#L146-L149
const scriptRegex = /<script(\s[^]*?)?(?:>([^]*?)<\/script>|\/>)/gim
const styleRegex = /<style(\s[^]*?)?(?:>([^]*?)<\/style>|\/>)/gim
const contextModuleRegex = /context\s*=\s*["']module["']/i

/** @type {import('./index').parse} */
export function parse(template, options) {
  const originalTemplate = template

  /** @type {import('svelte/types/compiler/interfaces').Text[]} */
  const instanceNodes = []
  /** @type {import('svelte/types/compiler/interfaces').Text[]} */
  const moduleNodes = []
  /** @type {import('svelte/types/compiler/interfaces').Text[]} */
  const cssNodes = []

  template = template.replace(scriptRegex, (match, attrs, content) => {
    const isContextModule = contextModuleRegex.test(attrs)
    const start = match.indexOf(content)
    const end = start + content.length
    if (isContextModule) {
      moduleNodes.push({
        type: 'Text',
        start,
        end,
        raw: content,
        data: content
      })
    } else {
      instanceNodes.push({
        type: 'Text',
        start,
        end,
        raw: content,
        data: content
      })
    }
    return match.replace(content, content.replace(/./g, ' '))
  })

  template = template.replace(styleRegex, (match, attrs, content) => {
    const start = match.indexOf(content)
    const end = start + content.length
    cssNodes.push({ type: 'Text', start, end, raw: content, data: content })
    return match.replace(content, content.replace(/./g, ' '))
  })

  const ast = parseSvelte(template, options)

  if (ast.instance && instanceNodes.length) {
    for (const node of instanceNodes) {
      node.start += ast.instance.start
      node.end += ast.instance.start
      if (
        instanceNodes.length === 1 ||
        originalTemplate.slice(node.start, node.end) === node.data
      ) {
        ast.instance.content.body = [node]
      }
    }
  }

  if (ast.module && moduleNodes.length) {
    for (const node of moduleNodes) {
      node.start += ast.module.start
      node.end += ast.module.start
      if (
        moduleNodes.length === 1 ||
        originalTemplate.slice(node.start, node.end) === node.data
      ) {
        ast.module.content.body = [node]
      }
    }
  }

  if (ast.css && cssNodes.length) {
    for (const node of cssNodes) {
      node.start += ast.css.start
      node.end += ast.css.start
      if (
        cssNodes.length === 1 ||
        originalTemplate.slice(node.start, node.end) === node.data
      ) {
        ast.css.children = [node]
        ast.css.content.styles = node.raw
      }
    }
  }

  return ast
}
