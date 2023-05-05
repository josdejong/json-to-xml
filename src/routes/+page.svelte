<script lang="ts">
  import { onMount } from 'svelte'
  import { Editor } from '$lib/index.js'

  let editorRef

  let xml = stripIndent(`<?xml version = "1.0" encoding = "UTF-8" ?>
    <User>
      <Name>Joe</Name>
      <Nickname>Big Joe</Nickname>
      <Score>12.4</Score>
      <Subscribed>true</Subscribed>
      <Friends>
        <Friend>Sarah</Friend>
        <Friend>Robert</Friend>
        <Friend>Paul</Friend>
      </Friends>
    </User>`)

  onMount(() => {
    const testEditor = new Editor({ target: editorRef, props: { xml } })
  })

  function stripIndent(text: string, indent = 4): string {
    return text.replace(new RegExp(`\n {${4}}`, 'g'), '\n')
  }
</script>

<h1>JSON to XML converter</h1>

<div bind:this={editorRef} class="json-to-xml-editor" />

<style lang="scss">
  .json-to-xml-editor {
    width: 100%;
    max-width: 1000px;
    height: 300px;
    display: flex;
  }
</style>
