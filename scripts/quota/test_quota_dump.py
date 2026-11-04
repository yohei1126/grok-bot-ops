"""Golden-fixture schema tests. Run: python3 -m unittest scripts/quota/test_quota_dump.py"""
import json
import subprocess
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).parent
SCRIPT = HERE / "quota_dump.py"
FIELDS = {"agent_id", "pool_id", "kind", "status", "remaining_fraction", "used_fraction",
          "reset_time", "captured_at", "plan_tier", "source"}


def run(*args):
    return subprocess.run([sys.executable, str(SCRIPT), *args], capture_output=True, text=True)


class QuotaSchema(unittest.TestCase):
    def test_golden_agy_fixture(self):
        r = run("--agy-payload", str(HERE / "fixtures/agy-payload.mock.json"), "--json")
        self.assertEqual(r.returncode, 0, r.stderr)
        doc = json.loads(r.stdout)
        self.assertEqual(doc["schema_version"], 1)
        agy = {x["pool_id"]: x for x in doc["records"] if x["agent_id"] == "agy"}
        self.assertEqual(set(agy), {"gemini-weekly", "gemini-5h", "3p-weekly", "3p-5h",
                                    "gemini-argon-wtu-weekly"})
        for rec in doc["records"]:
            self.assertEqual(set(rec) - {"note"}, FIELDS)
        self.assertEqual(agy["gemini-weekly"]["remaining_fraction"], 0.62)
        self.assertEqual(agy["3p-weekly"]["remaining_fraction"], 0.6)
        self.assertEqual(agy["gemini-argon-wtu-weekly"]["used_fraction"], 0.75)
        self.assertEqual(agy["gemini-weekly"]["reset_time"], "2026-11-10T00:00:00Z")
        self.assertEqual(agy["gemini-weekly"]["plan_tier"], "ai-pro")

    def test_fireworks_and_goat_never_invent_numbers(self):
        doc = json.loads(run("--json").stdout)
        by = {r["agent_id"]: r for r in doc["records"]}
        for key in ("opencode-fireworks", "box-goat"):
            self.assertEqual(by[key]["status"], "unknown")
            self.assertIsNone(by[key]["remaining_fraction"])
        self.assertEqual(by["opencode-fireworks"]["kind"], "carry")
        self.assertEqual(by["box-goat"]["kind"], "flat")

    def test_missing_pool_marked_unknown(self):
        p = HERE / "fixtures/agy-partial.tmp.json"
        p.write_text('{"quota": {"gemini-weekly": {"remaining_fraction": 0.5, "reset_time": "2026-11-10T00:00:00Z"}}}')
        try:
            doc = json.loads(run("--agy-payload", str(p), "--json").stdout)
        finally:
            p.unlink()
        by = {r["pool_id"]: r for r in doc["records"] if r["agent_id"] == "agy"}
        self.assertEqual(by["3p-weekly"]["status"], "unknown")

    def test_ok_weekly_without_reset_fails_schema(self):
        p = HERE / "fixtures/agy-noreset.tmp.json"
        p.write_text('{"quota": {"gemini-weekly": {"remaining_fraction": 0.5}}}')
        try:
            r = run("--agy-payload", str(p), "--json")
        finally:
            p.unlink()
        self.assertEqual(r.returncode, 2)
        self.assertIn("reset_time missing", r.stderr)

    def test_capture_always_restores_settings(self):
        import os
        import tempfile
        with tempfile.TemporaryDirectory() as home:
            cfg = Path(home) / ".gemini/antigravity-cli/settings.json"
            cfg.parent.mkdir(parents=True)
            cfg.write_text('{"model": "x"}\n')
            before = cfg.read_bytes()
            r = subprocess.run([sys.executable, str(SCRIPT), "--agy-capture", "--agy-cmd", "true",
                                "--timeout", "1"], capture_output=True, text=True,
                               env={**os.environ, "HOME": home})
            self.assertNotEqual(r.returncode, 0)
            self.assertEqual(cfg.read_bytes(), before)
            self.assertNotIn("statusLine", cfg.read_text())


if __name__ == "__main__":
    unittest.main()
