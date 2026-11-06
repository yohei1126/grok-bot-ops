# Retro template and ingest contract

A merged pull request can leave one durable lesson. This template turns that
lesson into a single short comment, so the fleet picks up the rule without chat
round-trips and without anyone crawling old chat threads.

## Purpose

The post-merge retro produces one short shared rule line. The reader is another
bot that starts a later task in the same area. A rule that needs a conversation
to explain is too long for this path.

## Write-out convention

1. The implementing bot waits until the pull request merges.
2. It posts exactly one Issue comment on the tracking Issue, using
   [`RETRO.md`](RETRO.md) as the body.
3. A pre-merge completion report must not use the `## RETRO` heading. Use
   another heading so the ingest step can tell the two apart.
4. A later `## RETRO` comment supersedes an earlier one. Ingest reads the newest
   marker on the Issue.

One Issue, one current retro. Do not post a retro on a pull request, a chat, or
a second Issue.

## Ingest contract

| Field | Contract |
| --- | --- |
| Marker | The comment starts with `## RETRO` as its first line |
| Source PR link | A `Source PR: <url>` line directly under the marker |
| Max length | 1,500 characters for the whole comment |
| Scrub list | All five items below must pass |
| Owner | An operator bot routine, scheduled or event driven. CI never writes memory |
| Trigger | `pr-merged` only |
| Repo allowlist | An explicit list the operator maintains. Never an org-wide rule |
| Output | One shared-memory line of 300 characters or fewer, plus one FYI line |

Scrub list, applied before posting:

- No personal or customer names.
- No local paths.
- No document or drive ids.
- No secrets or tokens.
- No quoted private repository content.

Output line shape: `As of <date> (<repo>#<n> retro) <rule>`, at 300 characters
or fewer. The same run sends one FYI line to the coordinator.

The ingest routine rejects a comment that misses the marker, the source link,
the length limit, or the scrub list. It records the rejection and writes no
memory line, so a fixed comment can be ingested on a later run.

## Out of scope for v1

- A live end-to-end listener test.
- CI writes to shared memory.
- Auto-review or allow-list changes.
- Weekly retro routines.
- Cross-chat scans.

## Related

- [`RETRO.md`](RETRO.md): the copyable comment template.
- [Shared rules](../../docs/shared-rules.md): the rules that retros propose
  changes to.
