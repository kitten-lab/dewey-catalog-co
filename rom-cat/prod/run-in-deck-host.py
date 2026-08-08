#!/usr/bin/env python3
"""
ROM Cat → The Deck Host (desk profile — catalog wants a little room)
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

PROD = Path(__file__).resolve().parent
ROMCAT_SYS = PROD / "romcat_sys"
# dewey-catalog-co/rom-cat/prod → parents[3] = ALICE_BOX
DECK_HOST_PY = PROD.parents[2] / "the-deck-host" / "shell" / "deck_host.py"

PORT = os.environ.get("ROMCAT_PORT", "43132")
URL = os.environ.get("ROMCAT_URL", f"http://127.0.0.1:{PORT}/")
HEALTH = os.environ.get("ROMCAT_HEALTH", f"http://127.0.0.1:{PORT}/api/health")


def main() -> int:
    if not (ROMCAT_SYS / "server.py").is_file():
        print(f"server missing: {ROMCAT_SYS}", file=sys.stderr)
        return 1
    if not DECK_HOST_PY.is_file():
        print(f"Deck Host not found: {DECK_HOST_PY}", file=sys.stderr)
        return 1

    profile = os.environ.get("DECK_HOST_PROFILE", "desk").strip() or "desk"
    # IDA03: 800×600 standard — zoomed-out catalog, not 1024 desk chrome
    width = os.environ.get("ROMCAT_WIDTH", "800")
    height = os.environ.get("ROMCAT_HEIGHT", "600")
    server_cmd = f"{sys.executable} server.py"
    cmd = [
        sys.executable,
        str(DECK_HOST_PY),
        "--title",
        "ROM Cat",
        "--profile",
        profile,
        "--width",
        str(width),
        "--height",
        str(height),
        "--url",
        URL,
        "--health",
        HEALTH,
        "--health-timeout",
        "20",
        "--spawn",
        server_cmd,
        "--spawn-cwd",
        str(ROMCAT_SYS),
    ]
    print("ROM Cat · CO.DCC-001-ROMCAT · Deck Host")
    print(f"  url:     {URL}")
    print(f"  profile: {profile}")
    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
