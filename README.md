# Uriel website

Static site for the Uriel group: Uriel Properties, Uriel Construction, Uriel Oil and Gas, Uriel Farms and Uriel Integrated Ventures.

- `public/index.html` holds the whole site. Pages are switched with links like `#properties`, `#construction`, `#oilgas`, `#farms`, `#ventures` and `#contact`.
- `public/img/` holds the project photos, named by project (for example `banana-1.jpg`).
- Deployed on Cloudflare Pages from the `main` branch.

## Cloudflare Pages settings

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `exit 0` (or leave empty) |
| Build output directory | `public` |
| Root directory | leave empty |

## Website dashboard

Staff edit the site at `/admin` (password protected): Now at Uriel updates, projects and photos, contact details and company page text. Changes go live when they press **Publish changes**.

How it works:

- `functions/` holds Cloudflare Pages Functions: `/api/login`, `/api/content` (read and save the content), `/api/photo` (upload) and `/photos/<id>` (serve uploads).
- Content and uploaded photos are stored in a Cloudflare KV namespace bound as `CONTENT`. The previous saved version is kept under `content:previous`.
- The password is the `ADMIN_PASSWORD` secret on the Pages project.
- Until the first publish, the site uses the defaults built into `public/index.html` (mirrored in `public/content-default.json`).

One-time setup in Cloudflare:

1. Storage & Databases → KV → Create a namespace called `uriel-content`.
2. Workers & Pages → urielngr → Settings → Bindings → Add → KV namespace. Variable name `CONTENT`, namespace `uriel-content`.
3. Settings → Variables and Secrets → Add → Secret. Name `ADMIN_PASSWORD`, value: the dashboard password.
4. Deployments → Retry the latest deployment so the binding and secret take effect.
