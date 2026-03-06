# Triple Stack Text Plugin for Obsidian

A specialized annotation tool for Obsidian designed for language learners and linguists. This plugin allows you to display text in three vertical layers: **Transcription** (top), **Base Text** (center), and **Translation** (bottom).

This plugin is a modified version (fork) of [obsidian-markdown-furigana](https://github.com/steven-kraft/obsidian-markdown-furigana) by Steven Kraft, enhanced to support nested phrase-level translations.

## Syntax

The plugin supports two types of annotations:

### 1. Individual Word Stack
Use single braces for a word and its transcription (top layer only).
`{Word|Transcription}`

| Markdown | Result |
| --- | --- |
| `{Әке|ækʲe}` | Top: `ækʲe`, Center: **Әке** |

### 2. Nested Phrase Stack (Collective Translation)
Use double braces to wrap multiple words and add a collective translation at the bottom.
`{{ {Word1|Top1} {Word2|Top2} | Collective Bottom Translation }}`

| Markdown | Result |
| --- | --- |
| `{{ {Әке|ækʲe} {және|ʒænʲe} {Ұл|ʊl} | In the name of the Father and the Son }}` | **Top:** IPA over each word <br> **Mid:** The Kazakh phrase <br> **Bottom:** Full English translation centered under the whole group |

---

## Key Features

- **Nested Logic**: Apply transcriptions to individual words while keeping a single, unified translation for the entire sentence.
- **Live Preview Support**: When your cursor enters the text, it expands into raw markdown for editing. When the cursor leaves, it renders as a clean vertical stack.
- **Reading Mode Support**: High-performance rendering for the final document view.
- **Universal Language Support**: Works with any script (Cyrillic, Latin, Arabic, IPA symbols, etc.). No longer restricted to CJK (Chinese/Japanese/Korean) characters.
- **Responsive Layout**: Uses Flexbox to ensure that phrase-level translations remain centered under their respective word groups.

---

## Custom Styling (CSS)

You can customize the appearance by editing the `styles.css` file in the plugin folder. The plugin uses the following classes:

- `.ts-phrase-container`: The main wrapper for a whole phrase (Flex column).
- `.ts-phrase-content`: The horizontal row containing the annotated words.
- `.ts-word-group`: The individual word + transcription stack.
- `.ts-top`: The transcription text (defaults to theme accent color).
- `.ts-mid`: The base text (bold).
- `.ts-bot`: The collective translation (muted and italicized).

---

## Installation

### Manual Installation
1. Download `main.js`, `manifest.json`, and `styles.css`.
2. Create a folder: `.obsidian/plugins/obsidian-triple-stack-text/` in your vault.
3. Move the three files into that folder.
4. Reload Obsidian and enable the plugin in **Settings > Community Plugins**.

---

## Credits

This project is a fork of the [Markdown Furigana](https://github.com/steven-kraft/obsidian-markdown-furigana) plugin. Special thanks to **Steven Kraft** for the original implementation of the CodeMirror 6 widget logic and Markdown post-processing.
