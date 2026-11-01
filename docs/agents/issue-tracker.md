# Issue tracker: GitHub

Issues and specs live in GitHub Issues for
rabidgremlin/terrain-layout-planner. Use the gh CLI.

## Conventions

- Verify the target with `gh repo view --json nameWithOwner`.
- Read: `gh issue view <number> --json number,title,body,labels,comments`.
- List: `gh issue list` with appropriate state and label filters.
- Create: `gh issue create --title "..." --body-file <file>`.
- Use body files for multiline descriptions and comments.
- Apply labels with `gh issue edit`.
- Post an explanation before closing an issue.
- Link child issues using native sub-issues where available;
  otherwise use a parent task list and `Part of #<parent>`.
- Record blockers using native issue dependencies where available;
  otherwise use `Blocked by: #<number>` in the issue body.
  Work is startable when all blockers are closed.

“Publish to the issue tracker” means create a GitHub issue.
“Fetch the relevant ticket” means read that issue.

## Pull requests as a triage surface

PRs as a request surface: no.
