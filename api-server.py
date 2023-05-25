#!/usr/bin/env python3
# Copyright (c) 2023 Julian Müller (ChaoticByte)

from argparse import ArgumentParser
from os import environ

from llama_cpp.server.app import create_app

import uvicorn

if __name__ == "__main__":
    # CLI
    ap = ArgumentParser()
    ap.add_argument("-m", "--model", help="Filepath to the model", type=str, required=True)
    ap.add_argument("--host", help="Address to listen on (default: localhost)", type=str, default="localhost")
    ap.add_argument("--port", help="Port to listen on (default: 7331)", type=int, default=7331)
    args = ap.parse_args()
    environ["MODEL"] = args.model
    # Run
    app = create_app()
    uvicorn.run(app, host=args.host, port=args.port)
