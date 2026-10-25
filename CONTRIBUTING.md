# Contributing

Thanks for helping improve these multi-agent and Grok Bot operations
practices. This repo is documentation only, so every contribution is a change
to English Markdown.

## How to suggest a change

1. Fork the repository, or use a branch if you have write access.
2. Edit the relevant docs, usually [`docs/shared-rules.md`](docs/shared-rules.md)
   or [`docs/monthly-audit.md`](docs/monthly-audit.md).
3. Keep the change generalized: useful to other operators and not tied to one
   person's setup.
4. Run the English prose review on every file you changed (see
   [Review English prose before every PR](#review-english-prose-before-every-pr)).
5. Open a pull request against `main` with an English title and body that
   explain why the change helps ops hygiene or token cost.
6. Do not merge your own PR unless maintainers ask you to. Review may refine
   wording for a wider audience.

Monthly audits that change shared rules follow the same PR path. After merge,
operators update private shared assistant notes and tag a `YYMMDD` GitHub
Release. The post-merge checklist lives in
[`docs/monthly-audit.md`](docs/monthly-audit.md).

## Review English prose before every PR

Every pull request that adds or changes English Markdown in this repo needs two
review passes before it is opened. Run them again before each later push that
changes English prose. The requirement applies to people and to bots that open
or update PRs.

1. Structure review for English technical writing:
   - Open each document and section with the problem or the rule, not with
     background.
   - Use sentence-case headings that name the topic or claim.
   - Keep paragraphs short and actionable, with one idea each.
2. Humanizer pass to remove AI writing tells:
   - Cut staged contrasts ("not X but Y"), one-line closers that repeat the
     point, lists of three that exist only for rhythm, inflated words such as
     "pivotal" or "robust", and chatbot residue such as "I hope this helps".
   - Do not use em dashes or en dashes in prose. Use a comma, colon, period,
     or parentheses instead. Dashes inside code, commands, paths, and URLs are
     fine.

Both passes change wording only. Keep every substantive rule and fact.

Use these published skills for the two passes (or an equivalent that
covers the same checks):

- Structure:
  [english-tech-blog-structure](https://github.com/yohei1126/agent-skills/tree/main/english-tech-blog-structure)
  in [yohei1126/agent-skills](https://github.com/yohei1126/agent-skills)
- Humanizer (AI-tells pass):
  [blader/humanizer](https://github.com/blader/humanizer)
  (the pairing recommended by that structure skill)

Operators who keep named skills or saved prompts for these steps should run
those for the review.

## Keep examples generic

Contributors must keep examples generic. Prefer:

- "operator", "domain bot", "progress bot", "cost/ops bot"
- "document worker", "cloud coding agent"
- "shared durable notes", "shared workspace status files"
- "collaborative docs suite", "task app", "calendar"
- "monthly ops audit", "operator's shared assistant notes"
- the name pattern `Domain｜Role` (placeholders, not real display names)

Do not include:

- real names, employers, or family details
- billing amounts or subscription tiers
- customer or project names
- bot display names that identify an individual
- internal paths (for example home directories), email addresses, or city or
  move plans
- Drive folder IDs
- GitHub usernames or repositories that identify one person

If your draft needs a concrete illustration, invent a clearly fictional
placeholder such as `Domain｜Role` or `articles/YYYY-MM-DD-slug.md`. Do not
copy from a private workspace.

## Style

- Write in English throughout: README, docs, and PR title and body.
- Prefer short, actionable rules over essays.
- Link related sections instead of duplicating long passages.
- Do not add Agent Skills `SKILL.md` folders. This repo is not a skills tree
  unless maintainers explicitly expand its scope.

## License

By contributing, you agree that your contributions are licensed under the
[Apache License 2.0](LICENSE).
