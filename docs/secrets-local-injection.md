# Inject local LLM API keys with 1Password

Inject LLM API keys on a local Mac from 1Password with `op run`. The child
process receives the values in its environment. Plaintext files, chat, issues,
and pull requests stay free of secret material.

Rules that apply to every secret, including deploy-time Worker inject, are in
[1Password is the source of truth for secrets](shared-rules.md#18-1password-is-the-source-of-truth-for-secrets).

## 1. Keep 1Password as the source of truth

1Password holds every API key and token. Local process inject and deploy-time
reads both come from that vault.

Prefer subscription-authenticated lanes (`agy` and Cursor) when the task can
run there. API-key live spend needs explicit operator approval before a
non-trivial run.

## 2. Keep secret values off plaintext files

Leave secret values out of `scripts/**/.env`, repository `.env` files, chat,
issues, pull requests, and progress docs.

A committed `.env` or `.env.example` may list non-secret config and
placeholders only.

A local `.env` that once held a real key has already put that key on disk.
Delete the value, or delete the file when it held only secrets, then rotate
the key at the provider. Stop live calls that still use the old key.

## 3. Inject on a Mac with `op run`

Use this path when the operator is present for an interactive eval or a local
model gateway.

1. Install the 1Password CLI (`op`) on the Mac and sign in.
2. Store the key as a Login or API Credential item in the operator vault.
3. Point a template env file at the item with `op://` references. The file
   stores those references and other placeholders. Add `.env.tpl` to
   `.gitignore`, or commit it only in that form.
4. Start the process under inject:

   ```bash
   op run --env-file=.env.tpl -- <litellm or eval command>
   # same wrapper for an existing start script
   op run --env-file=.env.tpl -- ./start.sh
   ```

5. Check that the child process has the expected variable set, and that no
   plaintext `.env` beside the script still contains the key.

Example template line. Replace `Vault`, `Item`, and `credential` with the
labels in the operator vault:

```text
GEMINI_API_KEY=op://Vault/Item/credential
```

Keep one item per provider key purpose so each key can be rotated on its own.
A workable local name is `LLM / Gemini: <project> eval`. Map the item field to
the environment variable the tool reads, such as `GEMINI_API_KEY`. Keep real
vault names and item names out of public docs, issues, and pull requests.

## 4. Reserve Service Accounts for unattended automation

A 1Password Service Account fits unattended automation such as GitHub Actions
or headless CI. Scope the vault that account can read to that automation.

When the operator is present for an interactive Mac eval, the signed-in `op`
session and `op run` cover the run. A one-off local remeasurement stays on
that session.

## 5. Split Grok Bot Vault from 1Password

| Store | Role |
| :--- | :--- |
| **1Password** | Source of truth for secrets (API keys, tokens, application PEMs). Mac inject and deploy inject read from here. |
| **Grok Bot Vault** | Bot-side logins, cards, and contacts for browser fill on the bot computer. |
| **Grok Bot 1Password Connect** | Optional bridge so the bot can fill browser forms from 1Password. Mac LLM keys stay in 1Password. |

Bots leave provider API keys out of plaintext project `.env` files. When a
Mac job needs a key, the bot tells the operator, or a Mac worker, to inject
with `op run` after the key is in 1Password.

## 6. Keep the shareable procedure in this repository

This repository holds the procedure other operators can copy. Private
operational notes may keep install-specific item names and deploy-time inject
details. Link those notes here for the Mac steps.

Public text stays generic. Omit personal vault names, email addresses, and
real key material.
