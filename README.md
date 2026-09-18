# UrbanCart Ecommerce

UrbanCart is an online-only React/Vite fashion ecommerce demo designed for Adobe Experience Platform, Adobe Tags/Web SDK, Supabase, and Salesforce integration practice.

## Architecture

```text
UrbanCart React (GitHub Pages)
        ├── Adobe Tags / Web SDK → AEP
        └── Supabase Auth + PostgreSQL
                    └── Edge Function → Salesforce
```

## Features

- Home, product listing, search/filter/sort, product details
- Cart, wishlist, account, order history
- Email/password registration and login with Supabase Auth
- Checkout without a real payment gateway
- Order is created directly after delivery details are submitted
- Adobe-ready event/data layer
- Optional Salesforce customer sync through a Supabase Edge Function
- GitHub Pages deployment under `/Adobe/`

## Environment variables

Create GitHub Actions repository secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional:

- `VITE_SALESFORCE_SYNC_ENABLED=true`

Salesforce secrets are **never** stored in this repository or the browser. They belong in Supabase Edge Function secrets.

## Adobe events

The data layer emits events including `page_view`, `product_list_view`, `product_click`, `product_view`, `add_to_cart`, `remove_from_cart`, `checkout_start`, `login`, `registration`, `wishlist_add`, and `purchase`.

## Salesforce

The Edge Function uses Salesforce Client Credentials Flow and stores:

- `SALESFORCE_CLIENT_ID`
- `SALESFORCE_CLIENT_SECRET`
- `SALESFORCE_LOGIN_URL=https://login.salesforce.com`
- optional `SALESFORCE_API_VERSION`

## GitHub Pages

The Vite base path is `/Adobe/`. The included GitHub Actions workflow deploys `dist` to GitHub Pages on pushes to `main`.
