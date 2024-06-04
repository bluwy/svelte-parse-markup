<svelte:head>
  <script>trick()</script>
  <style>trick {}</style>
  <script />
  <style />
</svelte:head>

<script context="module">
  const foo = 'hello'
</script>

<script>
  const bar = 'world'
</script>

<h1>{foo} - {bar}</h1>

<style>
  h1 {
    color: red;
  }
</style>
