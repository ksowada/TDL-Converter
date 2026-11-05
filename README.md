# TDL Converter

**Online:** <https://ardoid.eu/tdlconverter/>

Converts [AbstractSpoon ToDoList](https://www.abstractspoon.com/) `.tdl` files to **HTML** or **Markdown**,
keeping the task hierarchy, comments and file links. The conversion runs entirely in the browser
(XSLT 3.0 via [SaxonJS](https://www.saxonica.com/saxonjs/)) – files are never uploaded.

## Function

| Input | Conversion | Output |
|---|---|---|
| `.tdl` (ToDoList XML, UTF-8 or UTF-16) via file picker, drag & drop or paste | `tdl2html.xsl` | nested `<ul>/<li>` list – task `TITLE`, `COMMENTS` as `<p>`, `FILEREFPATH` as link |
| | `tdl2md.xsl` | Markdown outline (tasks as headings, comments as text) |

- Output view: **Source** (editable) or **Preview** (rendered, follows light/dark theme)
- **Copy** to clipboard or **Download** as `.html` / `.md`

## Project layout

```
index.html, app.js, style.css, logo.svg   web app (water.css from CDN)
tdl2html.xsl, tdl2md.xsl                  XSLT sources
*.sef.json                                compiled stylesheets (generated, git-ignored)
saxonjs3/SaxonJS3.rt.js                   SaxonJS runtime
scripts/build.sh, scripts/deploy.sh       build & deploy
run.sh                                    CLI conversion with Saxon HE (Java)
```

## Build

Requires Node.js.

```bash
npm install
npm run build        # compile XSL → *.sef.json and assemble dist/
npm run serve        # dev server on http://localhost:8000 (project root)
npm run serve:dist   # test the built dist/ folder
```

## Deploy

Copies `dist/` via `rsync` over SSH to the web root of `ardoid.eu/tdlconverter/`:

```bash
DEPLOY_TARGET="user@ardoid.eu:/var/www/ardoid.eu/tdlconverter/" npm run deploy
# preview changes only:   DRY_RUN=1 DEPLOY_TARGET=... npm run deploy
# custom ssh port:        DEPLOY_SSH="ssh -p 2222" DEPLOY_TARGET=... npm run deploy
```

## Command line (without browser)

With Java and Saxon HE (`SAXON_JAR` pointing to the Saxon jar):

```bash
./run.sh input.tdl output.html
```

## License

See [LICENSE.md](LICENSE.md). SaxonJS is licensed separately, see `saxonjs3/LICENSE.txt`.
