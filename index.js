import { parse as parseSvelte } from 'svelte/compiler'

// https://github.com/sveltejs/svelte/blob/0b46c72cada210b3a6c72c30a51d35f5c4ccefb3/src/compiler/preprocess/index.ts#L146-L149
const scriptRegex = /^<script(\s[^]*?)?(?:>([^]*?)<\/script>|\/>)/gi
const styleRegex = /^<style(\s[^]*?)?(?:>([^]*?)<\/style>|\/>)/gi
const contextModuleRegex = /context\s*=\s*["']module["']/i

/** @type {import('./index').parse} */
export function parse(template, options) {
  let instanceNode
  let moduleNode
  let cssNode

  template = template.replace(scriptRegex, (match, attrs, content) => {
    const isContextModule = contextModuleRegex.test(attrs)
    const start = match.indexOf(content)
    const end = start + content.length
    if (!moduleNode && isContextModule) {
      moduleNode = { type: 'Text', start, end, raw: content, data: content }
    } else if (!instanceNode && !isContextModule) {
      instanceNode = { type: 'Text', start, end, raw: content, data: content }
    }
    return match.replace(content, ' '.repeat(content.length))
  })

  template = template.replace(styleRegex, (match, attrs, content) => {
    const start = match.indexOf(content)
    const end = start + content.length
    if (!cssNode) {
      cssNode = { type: 'Text', start, end, raw: content, data: content }
    }
    return match.replace(content, ' '.repeat(content.length))
  })

  const ast = parseSvelte(template, options)

  if (ast.instance && instanceNode) {
    ast.instance.content.body = [instanceNode]
  } else if (ast.module && moduleNode) {
    ast.module.content.body = [moduleNode]
  } else if (ast.css && cssNode) {
    ast.css.children = [cssNode]
    ast.css.content.styles = cssNode.raw
  }

  return ast
}
