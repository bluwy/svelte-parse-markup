# svelte-parse-template

Parse a Svelte template without parsing the script or style tags.

## Usage

```js
import { parse } from 'svelte-parse-template'

const ast = parse('some svelte code')

console.log(ast.instance.content.body)
// output:
// [
//   {
//     type: 'Text',
//     start: <num>,
//     end: <num>,
//     raw: 'instance script content'
//     content: 'instance script content'
//   }
// ]

console.log(ast.module.content.body)
// output:
// [
//   {
//     type: 'Text',
//     start: <num>,
//     end: <num>,
//     raw: 'module script content'
//     content: 'module script content'
//   }
// ]

console.log(ast.css.content.styles)
console.log(ast.css.children)
// output:
// 'css content'
// [
//   {
//     type: 'Text',
//     start: <num>,
//     end: <num>,
//     raw: 'css content'
//     content: 'css content'
//   }
// ]
```

`svelte-parse-template` skips parsing scripts and styles, and injects a `Text` node instead. Check out the [Svelte REPL](https://svelte.dev/repl) AST output tab to compare how the original AST would look like.

## Sponsors

<p align="center">
  <a href="https://bjornlu.com/sponsors.svg">
    <img src="https://bjornlu.com/sponsors.svg" alt="Sponsors" />
  </a>
</p>

## License

MIT
