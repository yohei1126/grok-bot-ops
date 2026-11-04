#!/usr/bin/env python3
"""Emit one versioned JSON schema of remaining capacity for every coding lane.

Lanes: Antigravity `agy`, Cursor / Grok Bot plan, OpenCode + Fireworks, Box GOAT.
Fireworks and GOAT are not weekly pools. They are reported as `carry` / `flat`
and stay `unknown` unless a value is supplied. This script never invents numbers.

Usage:
  quota_dump.py [--agy-payload FILE | --agy-capture] [--cursor-json FILE]
                [--fireworks-remaining-usd N --fireworks-budget-usd N]
                [--out FILE] [--json]

Exit codes: 0 ok, 2 schema incomplete, 3 agy settings restore failed.
No API keys are read or stored. Inputs are files you produce with your own auth.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

SCHEMA_VERSION = 1
REQUIRED = ("agent_id", "pool_id", "kind", "status", "source", "captured_at")
AGY_POOLS = (
    "gemini-weekly",
    "gemini-5h",
    "3p-weekly",
    "3p-5h",
    "gemini-argon-wtu-weekly",
)
KIND_BY_POOL_SUFFIX = {"weekly": "weekly", "5h": "5h"}
SETTINGS = Path.home() / ".gemini" / "antigravity-cli" / "settings.json"


def now_utc() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0)


def iso(t: dt.datetime) -> str:
    return t.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def pool_kind(pool_id: str) -> str:
    for suffix, kind in KIND_BY_POOL_SUFFIX.items():
        if pool_id.endswith(suffix):
            return kind
    return "weekly"


def fractions(node: dict) -> tuple[float | None, float | None]:
    """Return (remaining, used) in 0..1 from the first recognised field."""
    def pct(v: float) -> float:
        return v / 100.0 if v > 1.0 else v

    for key in ("remaining_fraction", "remaining_percentage", "remaining_percent"):
        if isinstance(node.get(key), (int, float)):
            rem = pct(float(node[key])) if "percent" in key else float(node[key])
            return rem, 1.0 - rem
    for key in ("used_fraction", "used_percentage", "used_percent"):
        if isinstance(node.get(key), (int, float)):
            used = pct(float(node[key])) if "percent" in key else float(node[key])
            return 1.0 - used, used
    return None, None


def reset_time(node: dict, captured: dt.datetime) -> str | None:
    for key in ("reset_time", "resets_at", "reset_at"):
        v = node.get(key)
        if isinstance(v, str) and v:
            return iso(dt.datetime.fromisoformat(v.replace("Z", "+00:00")))
        if isinstance(v, (int, float)):
            return iso(dt.datetime.fromtimestamp(v, dt.timezone.utc))
    secs = node.get("reset_in_seconds")
    if isinstance(secs, (int, float)):
        return iso(captured + dt.timedelta(seconds=secs))
    return None


def walk_pools(obj, path=()):
    """Yield (key, dict) for every dict carrying a recognised fraction field."""
    if isinstance(obj, dict):
        if fractions(obj) != (None, None):
            name = str(obj.get("pool_id") or obj.get("id") or obj.get("name") or (path[-1] if path else ""))
            yield name, obj
        for k, v in obj.items():
            yield from walk_pools(v, path + (str(k),))
    elif isinstance(obj, list):
        for v in obj:
            yield from walk_pools(v, path)


def record(agent, pool, kind, source, captured, node=None, plan_tier=None, note=None) -> dict:
    rem, used = fractions(node) if node else (None, None)
    rec = {
        "agent_id": agent,
        "pool_id": pool,
        "kind": kind,
        "status": "ok" if rem is not None else "unknown",
        "remaining_fraction": None if rem is None else round(rem, 4),
        "used_fraction": None if used is None else round(used, 4),
        "reset_time": reset_time(node, captured) if node else None,
        "captured_at": iso(captured),
        "plan_tier": plan_tier,
        "source": source,
    }
    if note:
        rec["note"] = note
    return rec


def from_payload(agent: str, payload: dict, source: str, captured: dt.datetime, known=None) -> list[dict]:
    tier = None
    for key in ("plan_tier", "plan", "tier"):
        if isinstance(payload.get(key), str):
            tier = payload[key]
    out, seen = [], set()
    for name, node in walk_pools(payload):
        pool = name.strip().lower().replace("_", "-")
        if known and pool not in known:
            continue
        if pool in seen:
            continue
        seen.add(pool)
        out.append(record(agent, pool, pool_kind(pool), source, captured, node, tier))
    if known:
        for pool in known:
            if pool not in seen:
                out.append(record(agent, pool, pool_kind(pool), source, captured,
                                  note="pool absent from payload"))
    return out


def fireworks_records(args, captured) -> list[dict]:
    node = None
    if args.fireworks_remaining_usd is not None and args.fireworks_budget_usd:
        rem = max(0.0, min(1.0, args.fireworks_remaining_usd / args.fireworks_budget_usd))
        node = {"remaining_fraction": rem}
    note = None if node else "balance API unavailable; supply --fireworks-remaining-usd"
    return [record("opencode-fireworks", "fireworks-credits", "carry",
                   "operator-supplied" if node else "unavailable", captured, node, note=note)]


def goat_records(captured) -> list[dict]:
    return [record("box-goat", "goat-flat-monthly", "flat", "unavailable", captured,
                   note="flat monthly lane; no usage API, not a weekly pool")]


def agy_capture(timeout: float, agy_cmd: list[str]) -> dict:
    """Temporarily point statusLine at a dump hook, then always restore settings."""
    original = SETTINGS.read_bytes() if SETTINGS.exists() else None
    existed = original is not None
    tmp = Path(tempfile.mkdtemp(prefix="quota-dump-"))
    dump = tmp / "payload.json"
    hook = tmp / "hook.sh"
    hook.write_text(f'#!/bin/sh\ncat > "{dump}.part" && mv -f "{dump}.part" "{dump}"\necho quota-dump\n')
    hook.chmod(0o700)
    try:
        cfg = json.loads(original) if original else {}
        cfg["statusLine"] = {"type": "command", "command": str(hook), "enabled": True, "padding": 0}
        SETTINGS.write_text(json.dumps(cfg, indent=2))
        subprocess.Popen(agy_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        deadline = time.time() + timeout
        while time.time() < deadline and not dump.exists():
            time.sleep(0.5)
        if not dump.exists():
            raise TimeoutError("no statusLine payload captured before timeout")
        return json.loads(dump.read_text())
    finally:
        try:
            if existed:
                SETTINGS.write_bytes(original)
                ok = SETTINGS.read_bytes() == original
            else:
                SETTINGS.unlink(missing_ok=True)
                ok = not SETTINGS.exists()
        except OSError:
            ok = False
        shutil.rmtree(tmp, ignore_errors=True)
        if not ok:
            print("ERROR: failed to restore agy settings.json", file=sys.stderr)
            os._exit(3)


def validate(doc: dict) -> list[str]:
    errs = []
    for i, r in enumerate(doc["records"]):
        for k in REQUIRED:
            if r.get(k) in (None, ""):
                errs.append(f"records[{i}].{k} missing")
        if r.get("status") == "ok":
            for k in ("remaining_fraction", "used_fraction"):
                if not isinstance(r.get(k), (int, float)):
                    errs.append(f"records[{i}].{k} missing for ok record")
            if r.get("kind") in ("weekly", "5h") and not r.get("reset_time"):
                errs.append(f"records[{i}].reset_time missing for {r.get('kind')} record")
    return errs


def one_liner(doc: dict) -> str:
    parts = []
    for r in doc["records"]:
        v = "n/a" if r["remaining_fraction"] is None else f"{r['remaining_fraction'] * 100:.0f}%"
        parts.append(f"{r['agent_id']}/{r['pool_id']} {v}")
    return "quota " + doc["captured_at"] + ": " + "; ".join(parts)


def build(args) -> dict:
    captured = now_utc()
    recs: list[dict] = []
    if args.agy_payload or args.agy_capture:
        if args.agy_capture:
            payload = agy_capture(args.timeout, args.agy_cmd.split())
            src = "agy-statusline-hook"
        else:
            payload = json.loads(Path(args.agy_payload).read_text())
            src = "agy-statusline-file"
        recs += from_payload("agy", payload, src, captured, known=AGY_POOLS)
    if args.cursor_json:
        payload = json.loads(Path(args.cursor_json).read_text())
        recs += from_payload("cursor-grok", payload, "cursor-plan-usage-file", captured)
    recs += fireworks_records(args, captured)
    recs += goat_records(captured)
    return {"schema_version": SCHEMA_VERSION, "captured_at": iso(captured), "records": recs}


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--agy-payload", help="saved agy statusLine JSON payload")
    p.add_argument("--agy-capture", action="store_true", help="temporary statusLine hook, then restore")
    p.add_argument("--agy-cmd", default="agy -p ok", help="command that makes agy emit a statusLine payload")
    p.add_argument("--timeout", type=float, default=60.0)
    p.add_argument("--cursor-json", help="saved Cursor / Grok plan usage JSON")
    p.add_argument("--fireworks-remaining-usd", type=float)
    p.add_argument("--fireworks-budget-usd", type=float)
    p.add_argument("--out", help="write full JSON to this file")
    p.add_argument("--json", action="store_true", help="print full JSON to stdout")
    args = p.parse_args(argv)
    doc = build(args)
    errs = validate(doc)
    text = json.dumps(doc, indent=2) + "\n"
    if args.out:
        Path(args.out).write_text(text)
    if args.json:
        sys.stdout.write(text)
    else:
        print(one_liner(doc))
    for e in errs:
        print("schema error: " + e, file=sys.stderr)
    return 2 if errs else 0


if __name__ == "__main__":
    sys.exit(main())
