<script lang="ts">
  import { basicSetup, EditorView } from 'codemirror'
  import { EditorState } from '@codemirror/state'
  import { keymap, ViewUpdate } from '@codemirror/view'
  import { json as jsonLang } from '@codemirror/lang-json'
  import { xml as xmlLang } from '@codemirror/lang-xml'
  import { defaultKeymap, indentWithTab } from '@codemirror/commands'
  import { lintGutter } from '@codemirror/lint'
  import { onMount } from 'svelte'
  // import * as xmlJs from 'xml-js'
  import X2JS from 'x2js'
  import xmlFormat from 'xml-formatter'
  import { disablePageScroll, enablePageScroll } from './pageScroll.js'

  export let xml: string = ''
  export let json: string = ''

  const x2js = new X2JS()

  let refXmlEditor
  let refJsonEditor
  let xmlEditorView: EditorView
  let jsonEditorView: EditorView

  let indentation = '  '
  let fullscreen = false
  let showOptions = false

  let editorRef
  let originalParentRef

  $: updateXmlContents(xml)
  $: updateJsonContents(json)
  $: applyFullscreen(fullscreen)

  convertToJson()

  onMount(() => {
    createXmlEditor(refXmlEditor)
    createJsonEditor(refJsonEditor)
  })

  function createXmlEditor(target: HTMLDivElement) {
    let startState = EditorState.create({
      doc: xml,
      extensions: [
        keymap.of([...defaultKeymap, indentWithTab]),
        xmlLang(),
        lintGutter(),
        basicSetup,
        // EditorView.lineWrapping,
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged) {
            console.log('update xml')
            xml = update.state.doc.toString()
          }
        })
      ]
    })

    xmlEditorView = new EditorView({
      state: startState,
      parent: target
    })
  }

  function createJsonEditor(target: HTMLDivElement) {
    let startState = EditorState.create({
      doc: json,
      extensions: [
        keymap.of([...defaultKeymap, indentWithTab]),
        jsonLang(),
        lintGutter(),
        basicSetup,
        // EditorView.lineWrapping,
        EditorView.updateListener.of((update: ViewUpdate) => {
          if (update.docChanged) {
            console.log('update json')
            json = update.state.doc.toString()
          }
        })
      ]
    })

    jsonEditorView = new EditorView({
      state: startState,
      parent: target
    })
  }

  function convertToJson() {
    try {
      const parsedJson = x2js.xml2js(xml)
      json = JSON.stringify(parsedJson, null, indentation)
    } catch (err) {
      json = err.toString()
    }
  }

  function convertToXml() {
    try {
      const parsedJson = JSON.parse(json)
      xml = xmlFormat(x2js.js2xml(parsedJson), {
        indentation,
        collapseContent: true
      })
    } catch (err) {
      xml = err.toString()
    }
  }

  function updateXmlContents(updatedXml: string) {
    updateDocIfChanged(xmlEditorView, updatedXml)
  }

  function updateJsonContents(updatedJson: string) {
    updateDocIfChanged(jsonEditorView, updatedJson)
  }

  function updateDocIfChanged(editorView: EditorView, text: string) {
    if (!editorView) {
      return
    }

    const changed = text !== editorView.state.doc.toString()
    if (changed) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: text
        }
      })
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && fullscreen) {
      fullscreen = false
    }
  }

  function applyFullscreen(fullscreen: boolean) {
    if (fullscreen) {
      if (editorRef) {
        originalParentRef = editorRef.parentNode
        originalParentRef.removeChild(editorRef)
        document.body.appendChild(editorRef)
        disablePageScroll()
      }
    } else {
      if (editorRef && originalParentRef) {
        document.body.removeChild(editorRef)
        originalParentRef.appendChild(editorRef)
        enablePageScroll()
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="xml-container" class:fullscreen bind:this={editorRef}>
  <div class="xml-column">
    <div class="xml-menu">
      <button
        class="xml-menu-button"
        on:click={() => (showOptions = !showOptions)}
        title="Toggle options"
      >
        Options
      </button>
      <div class="xml-title">XML</div>
      <button class="xml-menu-button" on:click={convertToJson} title="Convert JSON to XML"
        >To JSON {'\u25B6'}</button
      >
    </div>
    {#if showOptions}
      <div class="xml-menu xml-secondary-menu">
        <span>Options:</span>
        indentation:<select title="Indentation" bind:value={indentation}>
          <option value="  ">2 spaces</option>
          <option value="   ">3 spaces</option>
          <option value="    ">4 spaces</option>
          <option value="        ">8 spaces</option>
          <option value={'\t'}>tab</option>
        </select>
      </div>
    {/if}
    <div bind:this={refXmlEditor} class="xml-editor" />
  </div>
  <div class="xml-column">
    <div class="xml-menu">
      <button class="xml-menu-button" on:click={convertToXml} title="Convert JSON to XML"
        >{'\u25C0'} To XML</button
      >
      <div class="xml-title">JSON</div>
      <button
        class="xml-menu-button"
        on:click={() => (fullscreen = !fullscreen)}
        title="Toggle full screen (ESC to exit)"
      >
        {fullscreen ? 'Exit full screen (ESC)' : 'Full screen'}
      </button>
    </div>
    <div bind:this={refJsonEditor} class="xml-editor" />
  </div>
</div>

<style lang="scss">
  $margin: 10px;
  $color: #fff;
  $button-background-color: dodgerblue;
  $menu-background-color: #eaeaea;
  $font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu;
  $font-size: 11pt;

  .xml-container {
    flex: 1;
    display: flex;
    gap: $margin;
    overflow: hidden;
    background: white;

    &.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      max-width: unset;
      box-sizing: border-box;
      border: 10px solid white;
      z-index: 9999;
    }

    .xml-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .xml-menu {
        display: flex;
        background: $menu-background-color;
        font-family: $font-family;
        font-size: $font-size;
        flex-wrap: wrap;
        align-items: center;
        gap: $margin;

        .xml-title {
          flex: 1;
          padding: 5px 10px;
          text-align: center;
        }

        label,
        select,
        button {
          cursor: pointer;
        }

        > * {
          margin: 5px;
        }

        .xml-menu-button {
          background: $button-background-color;
          color: $color;
          font-family: inherit;
          font-size: inherit;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;

          &:hover {
            background: lighten($button-background-color, 10%);
          }
        }

        &.xml-secondary-menu {
          background: #dfdfdf;
        }
      }

      .xml-editor {
        flex: 1;
        display: flex;
        min-height: 0;
        border: 1px solid #e5e5e5;
        overflow: hidden;

        :global(.cm-editor) {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      }
    }
  }
</style>
