import { Plugin, MarkdownPostProcessor, MarkdownPostProcessorContext } from 'obsidian'
import { RangeSetBuilder } from "@codemirror/state"
import { ViewPlugin, WidgetType, EditorView, ViewUpdate, Decoration, DecorationSet } from '@codemirror/view'

// Regular Expression for {text|text|text} format
const REGEXP = /\{([^|{}]+)\|([^|{}]+)\|([^|{}]+)\}/gm;

// Main Tags to search for Furigana Syntax
const TAGS = 'p, h1, h2, h3, h4, h5, h6, ol, ul, table'

const convertFurigana = (element: Text): Node => {
  const matches = Array.from(element.textContent.matchAll(REGEXP))
  let lastNode = element
  for (const match of matches) {
    // match[1] = основа, match[2] = верх, match[3] = низ
    const container = document.createElement('span')
    container.addClass('ts-container') // Добавим этот класс в CSS позже

    container.createSpan({ cls: 'ts-top', text: match[2] })
    container.createSpan({ cls: 'ts-mid', text: match[1] })
    container.createSpan({ cls: 'ts-bot', text: match[3] })

    let offset = lastNode.textContent.indexOf(match[0])
    const nodeToReplace = lastNode.splitText(offset)
    lastNode = nodeToReplace.splitText(match[0].length)
    nodeToReplace.replaceWith(container)
  }
  return element
}

export default class MarkdownFurigana extends Plugin {
  public postprocessor: MarkdownPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const blockToReplace = el.querySelectorAll(TAGS)
    if (blockToReplace.length === 0) return

    function replace(node: Node) {
      const childrenToReplace: Text[] = []
      node.childNodes.forEach(child => {
        if (child.nodeType === 3) {
          // Nodes of Type 3 are TextElements
          childrenToReplace.push(child as Text)
        } else if (child.hasChildNodes() && child.nodeName !== 'CODE' && child.nodeName !== 'RUBY') {
          // Ignore content in Code Blocks
          replace(child)
        }
      })
      childrenToReplace.forEach((child) => {
        child.replaceWith(convertFurigana(child))
      })
    }

    blockToReplace.forEach(block => {
      replace(block)
    })
  }

  async onload() {
    console.log('loading Markdown Triple Stack Text plugin')
    this.registerMarkdownPostProcessor(this.postprocessor)
    this.registerEditorExtension(viewPlugin)
  }

  onunload() {
    console.log('unloading Markdown Triple Stack Text plugin')
  }
}

class RubyWidget extends WidgetType {
  constructor(readonly base: string, readonly top: string, readonly bot: string) {
    super()
  }

  toDOM(view: EditorView): HTMLElement {
    const container = document.createElement('span')
    container.addClass('ts-container')

    container.createSpan({ cls: 'ts-top', text: this.top })
    container.createSpan({ cls: 'ts-mid', text: this.base })
    container.createSpan({ cls: 'ts-bot', text: this.bot })

    return container
  }
}

const viewPlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (
      update.docChanged ||
      update.viewportChanged ||
      update.selectionSet
    ) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  destroy() { }

  buildDecorations(view: EditorView): DecorationSet {
    let builder = new RangeSetBuilder<Decoration>();
    let lines: number[] = [];
    if (view.state.doc.length > 0) {
      lines = Array.from(
        { length: view.state.doc.lines },
        (_, i) => i + 1,
      );
    }

    const currentSelections = [...view.state.selection.ranges];

    for (let n of lines) {
      const line = view.state.doc.line(n);
      const startOfLine = line.from;
      const endOfLine = line.to;

      let currentLine = false;

      currentSelections.forEach((r) => {
        if (r.to >= startOfLine && r.from <= endOfLine) {
          currentLine = true;
          return;
        }
      });
      let matches = Array.from(line.text.matchAll(REGEXP))
      for (const match of matches) {
        let add = true
        // Извлекаем 3 части
        const base = match[1]
        const top = match[2]
        const bot = match[3]
        
        const from = match.index != undefined ? match.index + line.from : -1
        const to = from + match[0].length
        
        currentSelections.forEach((r) => {
          if (r.to >= from && r.from <= to) {
            add = false // Если курсор внутри, не превращаем в виджет (позволяем редактировать)
          }
        })
        
        if (add) {
          builder.add(from, to, Decoration.widget({ 
            widget: new RubyWidget(base, top, bot) 
          }))
        }
      }
    }
    return builder.finish();
  }
}, {
  decorations: (v) => v.decorations,
})
