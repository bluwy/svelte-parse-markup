import { parse as parseSvelte } from 'svelte/compiler'

// https://github.com/sveltejs/svelte/blob/0b46c72cada210b3a6c72c30a51d35f5c4ccefb3/src/compiler/preprocess/index.ts#L146-L149
const scriptRegex = /^<script(\s[^]*?)?(?:>([^]*?)<\/script>|\/>)/gim
const styleRegex = /^<style(\s[^]*?)?(?:>([^]*?)<\/style>|\/>)/gim
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
    return match.replace(content, content.replace(/./g, ' '))
  })

  template = template.replace(styleRegex, (match, attrs, content) => {
    const start = match.indexOf(content)
    const end = start + content.length
    if (!cssNode) {
      cssNode = { type: 'Text', start, end, raw: content, data: content }
    }
    return match.replace(content, content.replace(/./g, ' '))
  })

  const ast = parseSvelte(template, options)

  if (ast.instance && instanceNode) {
    instanceNode.start += ast.instance.start
    instanceNode.end += ast.instance.start
    ast.instance.content.body = [instanceNode]
  }
  if (ast.module && moduleNode) {
    moduleNode.start += ast.module.start
    moduleNode.end += ast.module.start
    ast.module.content.body = [moduleNode]
  }
  if (ast.css && cssNode) {
    cssNode.start += ast.css.start
    cssNode.end += ast.css.start
    ast.css.children = [cssNode]
    ast.css.content.styles = cssNode.raw
  }

  return ast
}
