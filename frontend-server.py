#!/usr/bin/env python3
# Copyright (c) 2023 Julian Müller (ChaoticByte)

from argparse import ArgumentParser
from json import load
from pathlib import Path

import uvicorn
from frontend.app import app

if __name__ == "__main__":
    # CLI
    ap = ArgumentParser()
    ap.add_argument("--profile", help="Path to a profile file that includes settings for a specific model", type=Path, required=True)
    ap.add_argument("--host", help="Address to listen on (default: localhost)", type=str, default="localhost")
    ap.add_argument("--port", help="Port to listen on (default: 8080)", type=int, default=8080)
    ap.add_argument("--api", help="URL of the API Server (default: 'http://localhost:7331')", type=str, default="http://localhost:7331")
    args = ap.parse_args()
    # Read profile
    with args.profile.open("r") as pf:
        profile = load(pf)
    # Check profile
    assert "name" in profile
    assert "conversation_prefix" in profile
    assert "user_keyword" in profile
    assert "assistant_keyword" in profile
    assert "stop_sequences" in profile
    # Pass frontend config to the app
    app.config.frontend_config = {
        "api_url": args.api.rstrip("/"),
        "profile": {
            "name": profile["name"],
            "conversation_prefix": profile["conversation_prefix"],
            "user_keyword": profile["user_keyword"],
            "assistant_keyword": profile["assistant_keyword"],
            "separator": profile["separator"],
            "stop_sequences": profile["stop_sequences"]
        }
    }
    # Run
    uvicorn.run(app, host=args.host, port=args.port)
