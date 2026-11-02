---
status: accepted
---

# Derive LOS blocking from tags shared within a layout

The user confirmed the complete shared understanding on 2026-11-02. This decision supersedes the earlier separate per-piece visibility model; implementation is pending.

Replace the separate clear/blocking/dense property on terrain with an editable **Blocks LOS** property on tag definitions shared within each layout. A piece blocks LOS if any assigned tag blocks it, with no separate per-piece visibility override; changing a tag affects every piece carrying it in that layout, while other saved layouts retain their own definitions. Both supplied and custom tags allow editing this property.

For the planning tools, Dense is a tag with blocking enabled, not a distinct visibility rule: its footprint acts as a solid obstacle, including for lines starting or ending inside it. This deliberately simplifies the previously specified Firefight behaviour that allowed sight into and out of Dense terrain; the source research remains a record of the game rules, rather than this planner's chosen approximation.

Sight Blocking and Dense start with blocking enabled; other supplied tags start with it disabled. Supply separate Scalable wall (Climbable, non-blocking) and Tall wall (Impassable + Sight Blocking) presets, initially retaining the existing editable 6-inch by 1-inch footprint. A numeric 3D height field is not part of this change.

New placements reuse the layout's current tag definitions, including edited blocking rules, rather than resetting supplied tags. New layouts start with the supplied defaults. Existing planner saves may be reset during implementation because there are no active users; preserving old per-piece visibility overrides or migrating old saves is not required.

The selected-terrain panel assigns tag memberships and shows the resulting blocking state without a separate override. Tag management allows creating, renaming, and deleting supplied and custom tags; renaming preserves memberships, and unused definitions remain available until deleted. Deletion warns about affected pieces, removes memberships and the tag from catalog choices within this layout, and future placements must not silently recreate it.

Tag-definition edits remain a draft until Save commits them together as one shared undo/redo step; Cancel discards the draft. Undo restores definitions and memberships removed by deletion.

Future blocking coverage, piece counts, and terrain-mix recommendations use the derived blocking result, including Dense and custom blocking tags; a piece with several blocking tags counts once. Document this as the planner's simplified interpretation of the Firefight guidance.

Use a gear icon labelled Layout settings in the editor toolbar to open a dialog with Tags as its only initial tab. This replaces the previously proposed Manage tags button in the terrain library. The Tags tab provides editable names, Blocks LOS checkboxes, piece-usage counts, Add tag, Delete, Save, and Cancel; new tags start with blocking disabled. Tag creation and definition edits belong in this dialog, while the selected-terrain panel handles memberships and the derived blocking result.

