# ADR-001 — Architecture Approach for Design-to-Code Playground

## Status
Accepted

## Context

We need to turn Figma nodes and live website DOM/CSS into production-ready frontend code. A pure rules-based approach is brittle and hard to extend. A pure LLM approach is flexible but can hallucinate, break layout, or produce invalid code.

## Decision

Use a hybrid approach:

1. **Deterministic Parsing and Normalization**
   - Figma node tree → internal layout model.
   - DOM + CSS → internal layout model.
   - Extract tokens (colors, typography, spacing), components, and layout primitives.

2. **LLM-Assisted Mapping and Refactoring**
   - Map normalized layout into React/HTML structures for each selected framework.
   - Infer reasonable component boundaries and naming.
   - Apply slight refactors for cleanliness, accessibility, and reuse.

3. **Deterministic Post-Processing**
   - Run the generated code through schema validation.
   - Apply formatting (Prettier) and lint rules.
   - Enforce stable file structure and imports.

## Consequences

- **Pros**
  - More predictable output than pure LLM.
  - Easier to add new frameworks and UI libraries.
  - Better control over layout fidelity and performance.

- **Cons**
  - Higher initial implementation complexity.
  - Requires maintaining a shared intermediate representation.
  - Needs good test coverage to ensure new frameworks don't break others.

## Alternatives Considered

1. **Pure AI Inference**
   - Rejected: unpredictable, high variance in output quality, difficult to debug.

2. **Pure Deterministic Scraper**
   - Rejected: too rigid, requires constant maintenance for new UI patterns.

3. **Hybrid Model (Selected)**
   - Chosen for balance of flexibility and predictability.
