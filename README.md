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
