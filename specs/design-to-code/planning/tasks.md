# Tasks — Design-to-Code Playground

## Core Engine
- [ ] Define intermediate representation for layout, typography, and components.
- [ ] Implement Figma node parser → intermediate representation.
- [ ] Implement DOM/CSS parser → intermediate representation.
- [ ] Implement mapping layer from IR → React (TSX) and HTML.

## Playground UI
- [ ] Scaffold Next.js or Vite app for the Playground.
- [ ] Implement tri-panel layout (Code, Preview, Reference).
- [ ] Add framework and UI library selection controls.
- [ ] Wire code editor to live preview.

## Figma Integration
- [ ] Build Figma plugin for "Send to Playground".
- [ ] Handle frame/component selection and link generation.
- [ ] Document Figma permissions and auth.

## URL Integration
- [ ] Build API/utility for fetching DOM + CSS.
- [ ] Normalize styles and inline them for mapping.
- [ ] Surface IP/legal notice in the UI before processing.

## UI Library Adapters
- [ ] Implement ShadCN + Tailwind adapter.
- [ ] Implement MUI adapter with theme generator.
- [ ] Implement AntD adapter with default theme.

## Tooling & DX
- [ ] Create VS Code extension with commands and Webview.
- [ ] Add Claude Code hook definitions for design-to-code flows.
- [ ] Set up linters, formatters, and CI for examples.

## Compliance & Quality
- [ ] Add unit/integration tests for parsers and generators.
- [ ] Create reference suite of Figma files and public URLs.
  - [ ] Add gradual.com as URL benchmark (hero, feature cards, pricing, navigation, footer)
  - [ ] Validate 90%+ visual fidelity target
  - [ ] Ensure all 5 target components extract as reusable
  - [ ] Test responsive breakpoints (mobile/tablet/desktop)
  - [ ] Verify build success and <3s dev mode page load
- [ ] Add visual regression tests for key flows (future).
