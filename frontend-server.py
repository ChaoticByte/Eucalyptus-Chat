#!/usr/bin/env python3
# Copyright (c) 2023 Julian Müller (ChaoticByte)

from argparse import ArgumentParser

import uvicorn
from frontend.app import app

if __name__ == "__main__":
    # CLI
    ap = ArgumentParser()
    ap.add_argument("--host", help="Address to listen on (default: localhost)", type=str, default="localhost")
    ap.add_argument("--port", help="Port to listen on (default: 8080)", type=int, default=8080)
    ap.add_argument("--api", help="URL of the API Server (default: 'http://localhost:7331')", type=str, default="http://localhost:7331")
    args = ap.parse_args()
    # Pass frontend config to the app
    app.config.frontend_config = {"api_url": args.api.rstrip("/")}
    # Run
    uvicorn.run(app, host=args.host, port=args.port)
