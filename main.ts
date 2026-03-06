import { Plugin, MarkdownPostProcessor, MarkdownPostProcessorContext } from 'obsidian'
import { RangeSetBuilder } from "@codemirror/state"
import { ViewPlugin, WidgetType, EditorView, ViewUpdate, Decoration, DecorationSet } from '@codemirror/view'

//Regex
const COMBINED_REGEXP = /\{\{(?:[^{}]|\{[^{}]*\})+\|[^|{}]+\}\}|\{[^|{}]+\|[^|{}]+\}/g;
const PHRASE_REGEXP = /\{\{((?:[^{}]|\{[^{}]*\})+)\|([^|{}]+)\}\}/g;
const WORD_REGEXP = /\{([^|{}]+)\|([^|{}]+)\}/g;

// Main Tags to search for Furigana Syntax
const TAGS = 'p, h1, h2, h3, h4, h5, h6, ol, ul, table'

const createWordStack = (base: string, top: string): HTMLElement => {
  const span = document.createElement('span');
  span.addClass('ts-word-group');
  span.createSpan({ cls: 'ts-top', text: top });
  span.createSpan({ cls: 'ts-mid', text: base });
  return span;
}

const createPhraseStack = (contentHtml: string, bot: string): HTMLElement => {
  const container = document.createElement('span');
  container.addClass('ts-phrase-container');
  const topRow = container.createSpan({ cls: 'ts-phrase-content' });
  topRow.innerHTML = contentHtml;
  container.createSpan({ cls: 'ts-bot', text: bot });
  return container;
}

const convertFurigana = (element: Text): Node => {
  let text = element.textContent;

  let html = text.replace(PHRASE_REGEXP, (_, content, bot) => {
    const innerWords = content.replace(WORD_REGEXP, (__: any, b: string, t: string) => {
      return createWordStack(b, t).outerHTML;
    });
    return createPhraseStack(innerWords, bot).outerHTML;
  });

  html = html.replace(WORD_REGEXP, (_, b, t) => {
    return createWordStack(b, t).outerHTML;
  });

  const span = document.createElement('span');
  span.innerHTML = html;
  return span;
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
  constructor(readonly rawText: string) { 
    super(); 
  }

  toDOM(view: EditorView): HTMLElement {
    if (this.rawText.startsWith('{{')) {
      const match = Array.from(this.rawText.matchAll(PHRASE_REGEXP))[0];
      PHRASE_REGEXP.lastIndex = 0;

      if (match) {
        const inner = match[1].replace(WORD_REGEXP, (_, b, t) => {
          return createWordStack(b, t).outerHTML;
        });
        return createPhraseStack(inner, match[2]);
      }
    } else {
      const match = Array.from(this.rawText.matchAll(WORD_REGEXP))[0];
      WORD_REGEXP.lastIndex = 0;

      if (match) {
        return createWordStack(match[1], match[2]);
      }
    }

    return document.createElement('span');
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
      let matches = Array.from(line.text.matchAll(COMBINED_REGEXP))
      for (const match of matches) {
        let add = true
        const from = match.index != undefined ? match.index + line.from : -1
        const to = from + match[0].length
        
        currentSelections.forEach((r) => {
          if (r.to >= from && r.from <= to) {
            add = false
          }
        })
        
        if (add) {
          builder.add(from, to, Decoration.widget({ 
            widget: new RubyWidget(match[0]) 
          }));
        }
      }
    }
    return builder.finish();
  }
}, {
  decorations: (v) => v.decorations,
})
