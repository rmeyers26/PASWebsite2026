# sveltia-cms-auth Worker

Replaces Netlify's built-in GitHub OAuth proxy for Sveltia CMS login (`/orion`) now
that the site is hosted on Cloudflare Pages instead of Netlify. This directory is a
placeholder for that deployment — Sveltia's auth worker is a separate project, not
bundled here, since it handles OAuth client secrets and should stay independently
versioned/updated from upstream.

## Steps

1. Create a GitHub OAuth App under the `richardmeyers@pasaz.org` / `EditorPAS`
   account (GitHub → Settings → Developer settings → OAuth Apps → New OAuth App).
   - Homepage URL: `https://pasaz.org`
   - Authorization callback URL: `https://<your-worker-subdomain>.workers.dev/callback`
     (update once you know the Worker's deployed URL; Cloudflare Workers allow
     custom domains too, e.g. `https://auth.pasaz.org/callback`)
   - Note the generated Client ID and Client Secret.

2. Deploy the official [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth)
   Cloudflare Worker (either use its "Deploy to Cloudflare" button, or clone it and
   run `wrangler deploy` from a Cloudflare account with access to this project's
   domain). Set these as Worker secrets (`wrangler secret put <NAME>`), not plain
   vars, since they're sensitive:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   Optionally restrict `ALLOWED_DOMAINS` to `pasaz.org` per that project's docs so
   the auth worker only serves this site.

3. Update `public/orion/config.yml` in this repo: set `base_url` to the Worker's
   real URL (replacing the `<your-sveltia-cms-auth-worker>.workers.dev` placeholder).

4. Confirm login works by visiting `https://pasaz.org/orion` and signing in with a
   GitHub account that has write access to `EditorPAS/PASAZ2026`.
