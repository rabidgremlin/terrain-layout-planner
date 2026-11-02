# State and styling migration

Design decisions agreed during the migration interview. The state/history
migration and the Tailwind styling conversion (#19) are implemented.
Styling guidance and visual regression checks are documented in the root README.

## Scope

- Replace shared React state and the custom undo implementation with Zustand
  and Zundo's temporal middleware.
- Convert the complete interface to Tailwind utilities: setup, toolbar, terrain
  library, terrain list, and selected terrain properties.
- Preserve the current appearance and behaviour. Redesign and new editing
  capabilities are outside this migration.
- Retain the existing native controls and SVG icons. A component library is
  outside scope.
- Allow a small global theme/base stylesheet, dynamic DOM dimensions and
  colours, and Konva rendering properties.

## State ownership

- Zustand owns the current terrain layout, selection, units, grid visibility,
  grid spacing, and position-snapping preferences.
- Zundo tracks layout changes only. Selection and preference changes neither
  consume undo steps nor clear redo.
- Form drafts and their validation remain component-local. This includes setup
  and unapplied terrain geometry values.
- DOM/Konva references, drag previews, and measured viewport dimensions remain
  local. They are not serializable layout data.
- Derived values, such as the selected terrain piece and display measurements,
  are derived from their source state rather than duplicated.

## Behaviour to preserve

- All terrain edits share one history. Future terrain capabilities extend that
  history rather than introducing a separate undo mechanism.
- A completed movement, rotation, or Apply action creates one history step.
  Transient gesture previews stay outside committed layout state.
- Unchanged edits create no history step. A new layout edit clears redo.
- Initial creation and loading establish the history baseline; undo cannot
  return the user to setup.
- Existing localStorage layouts retain their physical geometry and remain
  readable. Preserve the existing storage key, serialized layout format,
  validation, and visible storage-failure feedback.
- Autosave the current layout after edits, undo, and redo. History, selection,
  and editor preferences remain session-only and reset on reload.
- Keep existing draft-reset behaviour when the selected piece or units change.
  Deletion followed by undo restores the selected piece's properties.
- Preserve exact numeric geometry, unit conversion, template grab offsets,
  independent duplication, keyboard shortcuts, independent grid visibility and
  positional snapping, and Ctrl-held 15-degree rotation snapping.
- Preserve desktop board fitting, independently scrolling right panels,
  keyboard focus styling, and accessible control names and states.

## Package findings

- [Zustand lists Zundo as a third-party integration](https://github.com/pmndrs/zustand/blob/main/docs/reference/integrations/third-party-libraries.md).
- [Zundo's temporal middleware](https://github.com/charkour/zundo) supports
  history field selection and equality checks. Configure these explicitly;
  defaults must not add editor preferences or unchanged layouts to history.
- [Tailwind's Vite integration](https://tailwindcss.com/docs/installation/using-vite)
  supplies utilities, not component behaviour. Its
  [Preflight reset](https://tailwindcss.com/docs/preflight) can change default
  element styling, so the migration must explicitly preserve the existing UI.

## Verification

- Keep the Playwright browser UI as the public test boundary. Direct tests of
  Zustand or Zundo internals are not part of this migration.
- Keep all 31 existing browser tests passing. Add migration checks for loading
  existing saved layouts and for selection/preference changes preserving redo.
- Compare desktop screenshots before and after migration to catch visual
  regressions in layout, colours, controls, and focus styling.
- Run typecheck, lint, production build, and the full browser suite for each
  completed migration step.

## Work breakdown

Plan two reviewable tickets, worked in this order:

1. Migrate shared editor state and undo/redo to Zustand and Zundo, preserving
   the current interface, persistence, and observable editing behaviour.
2. Convert the complete interface styling to Tailwind utilities, preserving
   appearance, accessibility, and responsive board/panel behaviour.

Each step must pass validation independently. This work order is not a claim
that Tailwind technically requires the state migration; blocking relationships
should reflect actual implementation prerequisites when tickets are drafted.

## Interview status

The user confirmed the shared understanding on 2026-11-01. The agreed work is
published as two `ready-for-agent` tickets, with no technical blockers:

1. [Migrate terrain editor state and history to Zustand and Zundo (#18)](https://github.com/rabidgremlin/terrain-layout-planner/issues/18).
2. [Convert terrain planner UI styling to Tailwind without visual regressions (#19)](https://github.com/rabidgremlin/terrain-layout-planner/issues/19).
