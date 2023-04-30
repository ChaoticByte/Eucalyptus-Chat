# Copyright (c) 2023 Julian Müller (ChaoticByte)

from pathlib import Path

from sanic import Sanic
from sanic import Request
from sanic import json
from sanic import redirect

# App

app = Sanic("Eucalyptus")

# Static files

static_dir = Path(__file__).parent / "static"
app.static("/ui", static_dir, index="index.html")

# Routes

@app.get("/")
async def redirect_to_ui(request: Request):
    return redirect("/ui/")

@app.get("/config")
async def frontend_config(request: Request):
    return json(app.config.frontend_config)

# Security Headers

@app.on_response
async def security_headers(_, response):
    response.headers.update({
        "X-Frame-Options": "deny",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": f"default-src 'self'; style-src 'unsafe-inline' 'self'; connect-src 'self' {app.config.frontend_config['api_url']}",
        "X-Permitted-Cross-Domain-Policies": "none",
        "Referrer-Policy": "no-referrer",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Resource-Policy": "same-origin"
    })
