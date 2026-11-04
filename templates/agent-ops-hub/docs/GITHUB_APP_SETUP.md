# GitHub App procedure template

The operator creates and installs the GitHub App in the GitHub UI. This
template records the steps. It does not call the GitHub API to create the App.
Every App id and installation id is omitted. Record your own values outside
git.

Related: [Security Must summary](SECURITY_IMPLEMENTATION.md),
[Label taxonomy](LABELS.md),
[Secrets and placeholders](SECRETS.md).

## Foundation rules this setup must preserve

1. HMAC: the webhook secret you generate is `WEBHOOK_SECRET`. The Worker
   compares `X-Hub-Signature-256` in constant time to the HMAC-SHA256 of the
   raw body before JSON parse. A bad signature is `401` or `403` and stops.
2. Concurrent launch: the App's Issue updates must represent
   `status-running`. While that label is on an Issue, a second job is refused.
3. Actor allowlist: after install, set `ALLOWED_ACTORS` to the GitHub logins
   that may add `trigger-run`. The committed example is `login1,login2`. Put
   real values in Worker config, not in git.
4. Loop prevention: the Worker ignores webhook events where this App is the
   actor, except intentional status updates that do not re-add `trigger-run`.
   Keep the Issues subscription. The Worker filters the App's own deliveries.

## Create the App

The operator performs every step below. A bot does not click through this flow.

1. Open GitHub **Settings → Developer settings → GitHub Apps → New GitHub
   App**.
2. Set the name and homepage to values you choose. Leave a callback URL empty.
   This App is not an OAuth user-login app.
3. Webhook: active. The webhook URL is a placeholder until the Worker is
   deployed, for example `https://worker.example.invalid/github/webhook`.
   Replace it with the real Worker route at deploy time. Do not enter a tunnel
   hostname here.
4. Webhook secret: generate a long random value. Put it in a secret manager.
   At Worker deploy, inject it into the Cloudflare secret `WEBHOOK_SECRET`. Do
   not put it in a local `.env`, in git, in this doc, or in an Issue comment.
5. Leave the callback URL empty. This relay uses installation tokens minted by
   the Worker. It does not use a stored user-to-server token.

## Permissions

Set repository permissions to this table and nothing broader.

| Permission | Level |
| --- | --- |
| Issues | Read and write |
| Metadata | Read (required with any other repository permission) |
| Contents | Read only |
| Pull requests | No access |
| Actions | No access |
| Workflows | No access |
| Administration | No access |
| Members | No access |
| Checks | No access |

Contents stays read-only. Opening a pull request, when a job needs one, uses
the operator's `gh` login on the Mac. Grant Contents write only in a later
reviewed change if the App itself must open pull requests.

Leave organization permissions and account permissions at no access.

## Subscribe to events

| Event | Subscribe | Why |
| --- | --- | --- |
| Issues | Yes | `labeled` and `unlabeled` carry `trigger-run` and status changes |
| Issue comment | Yes | Status comments are part of the operator-visible record |
| Label | No | Repository label edits are not a launch signal |
| Pull request, Check, Workflow, Member, and the rest | No | Not used |

`issues` action `labeled` is the launch signal when the added label is
`trigger-run`. The separate **Label** event is label CRUD on the repository,
which you perform out of band.

## Install on the private hub only

1. After creating the App, choose **Install App**.
2. Choose **Only select repositories**.
3. Select `YOUR_HUB_OWNER/YOUR_HUB_REPO` only.
4. Do not choose **All repositories**.
5. Do not install on the public template repository. That repository is
   templates. The Worker ignores `trigger-run` there even if a read-only
   install is discussed later.

Record the installation id from the installation URL
(`.../installations/<id>`) as `GITHUB_INSTALLATION_ID`. Record the App id from
the App settings page as `GITHUB_APP_ID`. Both are config. The private key is
the secret.

## Store the private key

1. On the App page, generate a private key and download the PEM once.
2. Put the PEM in a secret manager. That item is the source of truth.
3. At deploy, inject it into the Cloudflare secret `GITHUB_APP_PRIVATE_KEY`.
4. Delete the downloaded PEM from disk after the secret manager has it. Do not
   keep a copy in a local `.env`.
5. Do not copy the PEM to the Mac, do not commit it, and do not paste it into
   chat or Issues.

[`.env.example`](../.env.example) records only
`GITHUB_APP_PRIVATE_KEY_REF=op://vault/item/private-key`.

## Actor allowlist

Set the Worker config key:

```text
ALLOWED_ACTORS=login1,login2
```

Replace `login1,login2` at deploy time with the GitHub logins allowed to add
`trigger-run`. Use logins, not email addresses. Anyone else, including GitHub
Apps and other bots, must not launch a job. The allowlist is checked on the
user who added the label, before enqueue.

## Loop prevention

The App will post status comments and replace status labels. Those deliveries
come back to the webhook with the App as `sender`. The Worker drops them, with
one exception: a status update the Worker itself intended, and only when that
update does not add `trigger-run`.

Set `GITHUB_APP_SLUG` to this App's bot login without the `[bot]` suffix. The
Worker compares the webhook sender login to that value before it drops the
event.

When you write status from the Worker, remove `trigger-run` if it is still
present. Do not add it. A delivery that adds `trigger-run` is a launch request
and is subject to `ALLOWED_ACTORS` and the `status-running` lock.

## Operator checklist

- [ ] App created by the operator in the GitHub UI
- [ ] Permissions match the table (Issues read and write, Metadata read,
      Contents read)
- [ ] No pull request, Actions, Workflows, Administration, Members, or Checks
      access
- [ ] Webhook secret in the secret manager. Cloudflare secret is a deploy-time
      inject only. Not in git or a local `.env`
- [ ] Webhook URL is the Worker placeholder or the deployed Worker route, not
      a Mac tunnel
- [ ] Events are Issues and Issue comment only
- [ ] Installed on the selected private hub only
- [ ] Private key in the secret manager. Cloudflare holds only the deploy
      inject. PEM removed from local disk
- [ ] `ALLOWED_ACTORS` set in Worker config (example shape `login1,login2`)
- [ ] `GITHUB_APP_SLUG` set to the App bot login without `[bot]`
- [ ] `GITHUB_APP_ID` and `GITHUB_INSTALLATION_ID` recorded outside git or as
      non-secret config
- [ ] Confirmed the Mac will not receive the PEM
