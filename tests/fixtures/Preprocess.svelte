<script context="module" lang="ts">
  const foo: string = 'hello'
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  const bar: string = 'world'
  const t: T = {} as T
</script>

<h1>{foo} - {bar} - {t}</h1>

<style lang="scss">
  h1 {
    color: $red;
  }
</style>
