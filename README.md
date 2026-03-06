# Triple Stack Text Plugin for Obsidian

A powerful annotation tool for Obsidian that allows you to display text in three vertical layers: **Top** (transcription/IPA), **Center** (base word), and **Bottom** (translation/meaning).

This plugin is built upon the logic of [obsidian-markdown-furigana](https://github.com/steven-kraft/obsidian-markdown-furigana) by Steven Kraft, but modified to support a universal three-tier syntax instead of standard Japanese ruby characters.

### Syntax

Use a simple curly brace construction with two pipes:
`{Base|Top|Bottom}`

| Markdown | Result |
| --- | --- |
| `{Әке|ækʲe|Father}` | Top: `ækʲe`, Center: **Әке**, Bottom: *Father* |
| `{Book|bʊk|Книга}` | Top: `bʊk`, Center: **Book**, Bottom: *Книга* |

### Key Features

- **Live Preview Support**: When your cursor enters the text, it expands into the raw source code `{Base|Top|Bottom}` for easy editing. When the cursor leaves, it instantly renders as a beautiful vertical widget.
- **Reading Mode Support**: Perfectly rendered in the final reading view.
- **Universal Language Support**: Unlike the original Furigana plugin, this is not restricted to CJK (Chinese/Japanese/Korean) characters. It works with any language (Kazakh, Russian, English, IPA, etc.).
- **CSS Customization**: Easily adjust font sizes, colors, and spacing by editing the `styles.css` file.

### Styling (CSS)

The plugin uses the following CSS classes for easy theme integration:
- `.ts-container`: The main flexbox wrapper.
- `.ts-top`: The top layer (defaults to the theme's accent color).
- `.ts-mid`: The base text (bold by default).
- `.ts-bot`: The bottom layer (muted and italicized by default).

### Credits

This plugin is a modified version (fork) of the [Markdown Triple Stack Text](https://github.com/steven-kraft/obsidian-markdown-furigana) plugin. Heartfelt thanks to Steven Kraft for the original implementation of the CodeMirror 6 logic and Markdown post-processing.