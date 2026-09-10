# Prototype Instructions

## Product decisions

- This is a responsive director prompt tool for desktop and mobile, not a chat product.
- Keep it simple: one scene-script input, two independent scope choices (`表演` and `视听语言`), one large director-notes input, one analysis-model choice, and one generation action.
- The scene script accepts `.txt` and modern Word `.docx` files, and also supports direct typing or paste in the same field.
- Do not add voice recording, microphones, waveforms, chat bubbles, shot-list editors, timelines, project management, history, analytics, or galleries.
- Do not use `一起聊` or `分开聊`. Selecting one scope means a focused request; selecting both means the director's paragraph may mix acting and camera language.
- Do not automatically turn the director's notes into a shot list. Preserve the director's intent and produce a Seedance 2.5 prompt.
- Generation results appear inline below the form on the same page. Never navigate to a result page or open a modal.
- Selected visual direction: bright white, calm, minimal writing surface with black typography, cool-gray rules, and one cobalt-blue accent.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
