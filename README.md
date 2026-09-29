# Nandz AI — Landing Page

Landing page untuk `ai.nandzstore.com` — web jualan API key Qwen3.8-27B-Turbo.

Single file: `index.html` (no build step).

## Deploy

Diserved oleh Caddy di origin server. Config yang dipakai:

```caddy
ai.nandzstore.com {
	handle / {
		root * /srv/landing
		file_server
	}
	handle {
		reverse_proxy localhost:4000
	}
}
```

`/` → landing page, sisanya (`/v1/*`, `/ui/*`) → LiteLLM Proxy.

## Link yang perlu diganti kalau fork

Di `<script>` paling bawah `index.html`:

```js
var TELEGRAM_URL = "https://t.me/ainandzbot";      // store
var CLAIM_URL = "https://t.me/ainandzclaimbot";    // bot bansos /claim
```
