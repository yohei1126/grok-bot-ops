# Instructions for agents

Read and follow [`CONTRIBUTING.md`](CONTRIBUTING.md) before changing any file
in this repository or opening or updating a pull request. It is the source of
contribution rules for this repository, including the generic-examples policy
and the required English prose review.

## Keep docs split by topic and at 500 lines or fewer

Prefer focused topic files under `docs/` over one growing megafile:

- Keep every Markdown file at 500 lines or fewer as measured by `wc -l`.
- Split any file under `docs/` into sibling topic files when it approaches or
  exceeds 500 lines, or when a section cluster is large enough to stand alone
  (such as tooling and cost lanes, cast and routing, or workstation CLI
  handoffs and parallel-writer control).
- Update every cross-link in [`README.md`](README.md),
  [`CONTRIBUTING.md`](CONTRIBUTING.md), and `docs/*.md` in the same pull
  request so no link points at a removed path or heading anchor.
