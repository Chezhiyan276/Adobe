# UrbanCart — Online Setup Guide

## 1. Supabase

Project name: `UrbanCart`

The SQL schema in `supabase/schema.sql` matches the application. The existing UrbanCart project can keep the already-created tables/products; do not rerun destructive SQL.

Authentication:
- Email provider: enabled
- Allow new users to sign up: enabled
- Confirm email: enabled
- Anonymous sign-ins: disabled

After GitHub Pages is enabled, set Supabase Authentication URL Configuration:

- Site URL: `https://chezhiyan276.github.io/Adobe/`
- Redirect URL: `https://chezhiyan276.github.io/Adobe/**`

## 2. GitHub

Repository: `Chezhiyan276/Adobe`

Enable GitHub Pages using the GitHub Actions workflow included in `.github/workflows/deploy.yml`.

Add repository Actions secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Do not add Salesforce secrets to GitHub.

## 3. Salesforce

External Client App: `UrbanCart Ecommerce Integration`

Client Credentials Flow is enabled with a Run As user. Keep the Consumer Key and Consumer Secret private.

## 4. Supabase Salesforce Edge Function

Deploy:
`supabase/functions/sync-customer-salesforce/index.ts`

Set Edge Function secrets:
- `SALESFORCE_CLIENT_ID` = Salesforce Consumer Key
- `SALESFORCE_CLIENT_SECRET` = Salesforce Consumer Secret
- `SALESFORCE_LOGIN_URL` = `https://login.salesforce.com`
- `SALESFORCE_API_VERSION` = current Salesforce API version used by the org (optional; default in source is `v65.0`)

Then set the GitHub-built frontend variable:
`VITE_SALESFORCE_SYNC_ENABLED=true`

## 5. Adobe Tags / AEP

Add the Adobe Tags async embed code to the site's HTML head through the approved Tags deployment method. Map the browser data layer events to the Web SDK XDM variable and Send Event actions.

Page view pattern:
- Update Variable before Send Event
- `web.webPageDetails.pageViews.value = 1`
- Send Event with the XDM variable
- Clear the XDM variable afterward

Non-page-view pattern:
- Update Variable before Send Event
- `web.webPageDetails.pageViews.value = 0`
- `web.webInteraction.linkClicks.value = 1`
- Set `web.webInteraction.name` and `web.webInteraction.type`
- Send Event with the XDM variable
- Clear the XDM variable afterward
