# AGENTS.md

## Purpose
Build and maintain `docs.pelindungbumi.dev` as a clean Astro documentation site for Pelindung Bumi using Starlight.

## Stack
- Framework: Astro
- Docs framework: Starlight
- Package manager/runtime: Bun first
- Prefer `bun` for install, dev, build, preview, and script execution
- Only use `npm`, `pnpm`, or `node` when a task cannot be done with Bun

## Site Identity
- Public site name: `Pelindung Bumi`
- Repository name `peta` is internal/repository naming only
- Domain: `docs.pelindungbumi.dev`
- GitHub link: `https://github.com/pelindung-bumi/peta`
- Reuse the Pelindung Bumi logo and icon for header and favicon

## Content Direction
- Write documentation that is direct, useful, and easy to scan
- Prefer practical explanations over marketing language
- Keep the voice calm, clear, and professional
- Assume readers want documentation, guides, references, and project information

## Documentation Rules
- Preserve the default Starlight experience unless there is a strong reason to change it
- Prefer content and config changes over custom JavaScript or component overrides
- Keep the homepage simple
- Keep navigation minimal and understandable
- Use Markdown or MDX in `src/content/docs/` for new pages
- Organize docs so sidebar labels and page titles stay consistent

## Design Rules
- Stay close to the default Starlight template
- Avoid unnecessary UI customization
- Only add custom CSS when needed for branding or small fixes
- Keep the site readable, fast, and maintainable

## Deployment Rules
- GitHub Pages deployment should follow the same workflow style as the main blog repo
- Keep `public/CNAME` aligned with `docs.pelindungbumi.dev`

## Workflow Rules
- Prefer minimal, maintainable changes
- Update docs content, config, workflow, and assets carefully
- Do not introduce extra tooling unless it clearly improves documentation work

## Commands
Use Bun first:
```bash
bun install
bun run dev
bun run build
bun run preview
```
