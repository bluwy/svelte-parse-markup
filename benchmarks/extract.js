import fs from 'node:fs/promises'
import { Bench } from 'tinybench'
import { extractScripts, extractStyles } from 'svelte-parse-markup'

// setup code
const scriptRegex =
  /<!--[^]*?-->|<script((?:\s+[^=>'"/]+=(?:"[^"]*"|'[^']*'|[^>\s])|\s+[^=>'"/]+)*\s*)(?:\/>|>([\S\s]*?)<\/script>)/g
const styleRegex =
  /<!--[^]*?-->|<style((?:\s+[^=>'"/]+=(?:"[^"]*"|'[^']*'|[^>\s])|\s+[^=>'"/]+)*\s*)(?:\/>|>([\S\s]*?)<\/style>)/g

const fixtureFileNames = await fs.readdir(
  new URL('../tests/fixtures', import.meta.url)
)
const fixtureFileContents = await Promise.all(
  fixtureFileNames.map(async (fileName) => {
    return await fs.readFile(
      new URL(`../tests/fixtures/${fileName}`, import.meta.url),
      'utf-8'
    )
  })
)

let temp

// scripts bench
const scriptsBench = new Bench({
  iterations: 1000,
  warmupIterations: 100
})
scriptsBench.add('extractScripts', () => {
  for (const content of fixtureFileContents) {
    extractScripts(content)
  }
})
scriptsBench.add('scriptRegex', () => {
  for (const content of fixtureFileContents) {
    temp = content.matchAll(scriptRegex)
    while (!temp.next().done) {}
  }
})
await scriptsBench.warmup()
await scriptsBench.run()
console.table(scriptsBench.table())

// styles bench
const stylesBench = new Bench({
  iterations: 1000,
  warmupIterations: 100
})
stylesBench.add('extractStyles', () => {
  for (const content of fixtureFileContents) {
    extractStyles(content)
  }
})
stylesBench.add('styleRegex', () => {
  for (const content of fixtureFileContents) {
    temp = content.matchAll(styleRegex)
    while (!temp.next().done) {}
  }
})
await stylesBench.warmup()
await stylesBench.run()
console.table(stylesBench.table())

// combined bench
const combinedBench = new Bench({
  iterations: 1000,
  warmupIterations: 100
})
combinedBench.add('extract', () => {
  for (const content of fixtureFileContents) {
    extractScripts(content)
    extractStyles(content)
  }
})
combinedBench.add('regex', () => {
  for (const content of fixtureFileContents) {
    temp = content.matchAll(scriptRegex)
    while (!temp.next().done) {}
    temp = content.matchAll(styleRegex)
    while (!temp.next().done) {}
  }
})
await combinedBench.warmup()
await combinedBench.run()
console.table(combinedBench.table())
