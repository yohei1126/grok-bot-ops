# Personal values checklist

Run this checklist on every template change before publication. A match is a
stop signal. Replace the value with a placeholder. Do not add an exception.

## Forbidden patterns

| Pattern | Why it is forbidden | Safe form |
| --- | --- | --- |
| Private key blocks (`BEGIN ... PRIVATE KEY`) | Grants App or user access | No key in the tree. Store it in a secret manager |
| GitHub tokens (`ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`, `github_pat_`) | Grants repository access | No token. Use a placeholder name |
| Cloud or model API keys (`AKIA...`, `sk-...`) | Bills an account or grants access | No key. Use a placeholder name |
| JWTs with three dot-separated segments | May be a live session or App token | No token. Describe the flow |
| Real webhook or proxy secrets | Forges a launch or a status write | `replace-with-webhook-secret` |
| `op://` references with real vault or item names | Names a person's secret store | `op://vault/item/private-key` |
| Real email addresses | Identifies a person | `operator@example.invalid` |
| Real hostnames, tunnel URLs, or Worker URLs | Exposes a live endpoint | `https://worker.example.invalid` |
| Cloudflare account, zone, or tunnel IDs | Targets live infrastructure | `000000` or omit |
| GitHub App ID, installation ID, or client secret as a live value | Targets a live App install | `000000` or omit |
| Real `ALLOWED_ACTORS` logins | Names the people who can launch | `login1,login2` |
| Absolute paths with a real home user | Identifies a person and leaks layout | `$HOME/agy-work/<repo>` |
| Private hub owner/repo used as the template destination | Treats a private hub as public | `YOUR_HUB_OWNER/YOUR_HUB_REPO` |
| Personal names, bot display names, or handles | Identifies a person | `Domain｜Role`, `domain bot`, `operator` |
| Job briefs, Issue bodies, or comment bodies | Personal task text | Describe the shape only |
| Log excerpts, `.env` dumps, or secret listings | Leaks values and host details | No excerpt. State the rule |
| Eval fixture content from a private hub | Private task data | Describe the layout in prose only |
| Drive folder IDs, task app IDs, or calendar IDs | Links personal data | Omit or use `YOUR_FOLDER_ID` |

## Review steps

1. Read the full diff, not only the added lines.
2. Search for token shapes, key blocks, email addresses, home paths, and live
   URLs.
3. Check every `ALLOWED_ACTORS`, App ID, installation ID, and hostname value.
4. Confirm that each path uses `$HOME/...` or a relative path.
5. Confirm that the private hub is described generically, with no owner or repo
   name used as the public destination.
6. Confirm that any log or comment example names only PID, log path, soft-deny
   command and reason, or PR URL.
7. Re-read the English prose. Remove names and personal context that slipped
   into an explanation.

## Search examples

These patterns catch common shapes. A clean run does not replace a human read.

```bash
rg -n --hidden \
  -g '!.git/**' \
  -g '!node_modules/**' \
  -e 'BEGIN [A-Z ]*PRIVATE KEY' \
  -e 'gh[pousr]_[A-Za-z0-9]{20,}' \
  -e 'github_pat_' \
  -e 'AKIA[0-9A-Z]{16}' \
  -e 'sk-[A-Za-z0-9]{20,}' \
  -e '/Users/[A-Za-z0-9._-]+' \
  -e '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+' \
  .
```

Treat a hit on `example.invalid`, `login1,login2`, `000000`, or `$HOME` as a
placeholder, not a leak. Read the surrounding line before you decide.

## When a match is legitimate

Some documents must name a pattern to ban it, such as this checklist. A
pattern name without a value is acceptable. A live value is not. When in
doubt, remove the value and describe the rule instead.
