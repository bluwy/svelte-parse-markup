import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { parse as parseTemplate } from '../index.js'
import { parse as parseSvelte } from 'svelte/compiler'

/** @type {(p: string) => Promise<string>} */
const read = (p) =>
  fs.readFile(
    fileURLToPath(new URL('./fixtures/' + p, import.meta.url)),
    'utf-8'
  )

test('ast start and end is consistent', async () => {
  const template = await read('Basic.svelte')
  const mine = parseTemplate(template)
  const them = parseSvelte(template)

  // instance script
  assert.equal(mine.instance.content.start, them.instance.content.start)
  assert.equal(mine.instance.content.end, them.instance.content.end)
  assert.equal(
    mine.instance.content.body[0].data,
    template.slice(
      mine.instance.content.body[0].start,
      mine.instance.content.body[0].end
    )
  )

  // module script
  assert.equal(mine.module.content.start, them.module.content.start)
  assert.equal(mine.module.content.end, them.module.content.end)
  assert.equal(
    mine.module.content.body[0].data,
    template.slice(
      mine.module.content.body[0].start,
      mine.module.content.body[0].end
    )
  )

  // css
  assert.equal(mine.css.start, them.css.start)
  assert.equal(mine.css.end, them.css.end)
  assert.equal(
    mine.css.children[0].data,
    template.slice(mine.css.children[0].start, mine.css.children[0].end)
  )
  assert.equal(mine.css.content.styles, them.css.content.styles)
  assert.equal(mine.css.content.start, them.css.content.start)
  assert.equal(mine.css.content.end, them.css.content.end)
})

test('parse svelte code that needs preprocess', async () => {
  const template = await read('Basic.svelte')
  const ast = parseTemplate(template)
  assert.equal(ast.instance.content.body[0].type, 'Text')
  assert.equal(ast.module.content.body[0].type, 'Text')
  assert.equal(ast.css.children[0].type, 'Text')
})

test.run()
