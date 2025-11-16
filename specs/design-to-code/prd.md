# Design-to-Code Playground — Product Requirements Document (PRD)

## 1. Purpose

Enable users to transform Figma designs and public website URLs into production-grade frontend code with selectable frameworks, reusable UI component mapping, and a live preview playground. Reduce handoff friction and repetitive markup work across design and engineering teams.

## 2. Users and Use Cases

### Personas

- **Designer**
  - Export Figma frames/components into code without deep React knowledge.
  - Validate how designs behave in a real browser with minimal dev help.

- **Front-end Engineer**
  - Bootstrap new pages/components from designs and existing sites.
  - Keep code aligned with design tokens and UI libraries (ShadCN, MUI, AntD).

- **Founder / Solo Builder**
  - Clone existing landing pages or dashboards as a starting point.
  - Quickly customize content, styles, and structure.

### Primary Flows

1. **Figma → Code**
   - User selects a Figma frame or component.
   - Invokes the plugin or Playground.
   - Chooses framework + preferences.
   - Receives a runnable React/HTML project and live preview.

2. **URL → Code**
   - User pastes a public URL.
   - System fetches DOM + CSS, normalizes layout.
   - Produces editable code + assets + preview.

3. **Iterate in Playground**
   - User edits code in a code panel.
   - Live preview updates.
   - Reference panel shows original Figma/URL snapshot.

## 3. Inputs and Outputs

### Inputs

- **Figma**
  - Frame, component, or group.
  - Figma file key + node ID via plugin or URL.

- **Public URL**
  - Any reachable HTTP/HTTPS page.
  - Optional query params to specify viewport or route.

### Outputs

- **React Project**
  - `tsx` or `jsx` (configurable).
  - Framework presets:
    - ShadCN + Tailwind
    - MUI (with or without custom theme)
    - AntD
    - No UI library (raw components)

- **HTML Export**
  - High-fidelity, static markup for marketing/landing pages.
  - Focus on visual match > interactivity.

- **Assets & Fonts**
  - Local image assets (if downloadable).
  - Font mapping:
    - Google Fonts: imported automatically.
    - Others: CSS fallback plus instruction to host fonts.

## 4. Experience & UI

### Playground Layout

- **Code Panel**
  - Editable code.
  - Framework + language toggle (TSX/JSX/HTML).
  - Formatting (Prettier) and lint surface.

- **Preview Panel**
  - Live rendering of the generated project.
  - Basic responsive controls (mobile/tablet/desktop).

- **Reference Panel**
  - Figma rendering or static snapshot of the source site.
  - Optional overlay to compare spacing, typography, and layout.

- **Flow Map (Multi-screen)**
  - Visual graph showing navigation between screens.
  - Allows selecting a node to view/edit that screen's code.

### Preferences & Settings

- Framework selection (React/TSX/JSX, HTML).
- UI library selection (ShadCN, MUI, AntD, None).
- Naming conventions (PascalCase components, kebab-case files, etc.).
- Output structure (pages/components/hooks/styles folders).

## 5. Functional Requirements

1. **Figma Import**
   - Authenticate to Figma (OAuth or token).
   - Fetch node tree, styles, and assets for the selected frame/component.
   - Normalize into an internal representation (layout, text, tokens, components).

2. **URL Import**
   - Fetch HTML, CSS, and basic assets.
   - Infer layout structure and breakpoints.
   - Merge inline and external CSS into a usable model.

3. **Code Generation**
   - Map internal representation to the target framework.
   - Generate:
     - Layout (flex/grid)
     - Typography
     - Color and spacing tokens
     - Interactive elements (buttons, links, inputs)

4. **Component Recognition**
   - Detect visually/repeated patterns and extract them as reusable components.
   - Replace duplicates in the generated tree with these components.

5. **Project Export**
   - Scaffold a minimal Next.js or Vite project.
   - Include dependencies for the selected UI library.
   - Provide ready-to-run `dev` and `build` scripts.

6. **VS Code / Claude Code Integration**
   - Commands to:
     - Import from Figma link.
     - Import from URL.
     - Insert generated components into existing workspace.
   - Claude Code hooks to:
     - Invoke generation based on natural language.
     - Inspect existing code and align with the generated design.

## 6. Non-Functional Requirements

- **Performance**
  - p95 generation under 5 seconds for single-screen.
- **Reliability**
  - Build must succeed on fresh export with documented Node version.
- **Security**
  - No storage of private Figma or URL content beyond the current session unless explicitly configured.
- **DX (Developer Experience)**
  - Clear error messages for failed imports.
  - Simple configuration file for defaults (framework, UI library, naming).

## 7. Risks & Mitigations

- **IP Risk on URL Cloning**
  - Mitigation: prominent warning and terms acknowledgment on URL input.

- **Layout Inaccuracies**
  - Mitigation: deterministic layout fallback (flexbox/grid templates) and visual diff tooling.

- **LLM Hallucination**
  - Mitigation: strict schema for generation, with schema validation and post-processing.

## 8. Rollout Plan

1. **Alpha**
   - Single-screen Figma import → TSX (no UI library).
   - Local Playground only.

2. **Beta**
   - URL import.
   - ShadCN + Tailwind, MUI, AntD adapters.
   - VS Code extension proof-of-concept.

3. **1.0 Release**
   - Claude Code integration.
   - Multi-screen flows and routing.
   - Documentation and example templates.
