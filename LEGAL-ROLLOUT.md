# Legal pages and account acceptance

## Deployment order

1. Review the English legal pages with the operator. Confirm the public contact
   address in `lib/legal.ts`; preferably replace the personal mailbox with a
   dedicated alias. Confirm the operator's full name, country and any required
   postal address. The current copy uses the details supplied by the operator.
2. Verify the actual Supabase/Vercel regions, subprocessors, transfer safeguards,
   backup and log retention periods. Replace the general provider/retention
   wording with confirmed deployment-specific details before launch. Check that
   deleting `auth.users` also deletes their `tracked_accounts` rows: the existing
   schema is not in this repository. Do not claim complete deletion otherwise.
3. Apply `supabase/migrations/202611100001_legal_acceptances.sql` to the existing
   Supabase project **before deploying the app** (SQL editor or your established
   migration workflow). It requires the existing `public.tracked_accounts` table
   and its ownership RLS policies. It does not backfill acceptance for old users.
   Take a backup and verify the migration in a staging project first.
4. Deploy the application. Existing users and Google users without an acceptance
   record must accept before synchronisation. Applying the migration temporarily
   blocks their cloud tracking access until the new app is deployed and they
   accept. Existing records are retained, and ownership policies are preserved.
5. Allow production `/auth/callback` and
   `/auth/callback?next=/reset-password` in Supabase redirect settings. Check the
   configured email confirmation template uses a PKCE code callback compatible
   with `exchangeCodeForSession`. No authentication secrets are added by this change.

## Behaviour

- Email registration requires an unchecked-by-default checkbox and sends the
  accepted version as signup metadata. An insert-only auth trigger records the
  version with database time. Authenticated users cannot modify acceptance rows.
- Google OAuth can create accounts even from the login page. Those users accept
  after authentication, before cloud tracking. The Google button on registration
  also checks the checkbox. Account creation alone does not imply acceptance.
- A same-origin authenticated POST calls a restricted RPC to insert the current
  version for the current user. Duplicate submissions preserve the original time.
- Database RLS restricts direct cloud tracking access until current terms are
  accepted. Public legal pages, password recovery and account deletion stay open.
- Declining users can sign out or request deletion using the public contact.
- No marketing consent is bundled with acceptance. Privacy is an information
  notice; essential storage does not have an optional-tracking consent banner.
- External Google Fonts requests were removed; system fonts avoid disclosing
  visitors' IP addresses to Google on every page load.
- The existing callback accidentally contained a DELETE account handler. It is
  replaced by a GET code exchange with an allowlisted password recovery target.
  Actual account deletion remains at `/api/account/delete`.

## Release checks with real staging credentials

- Email: unchecked registration creates no user; checked registration creates
  exactly one acceptance record; confirmation/login reaches the dashboard.
- Google from registration and login: cancelled/failed OAuth does not grant
  acceptance; first login reaches `/accept-terms`; acceptance unlocks tracking.
- Existing user: no acceptance is invented; local entries and cloud rows remain.
- Direct Supabase requests cannot insert/read/update/delete cloud tracking before
  acceptance. After acceptance, cross-user access remains denied by ownership RLS.
- Acceptance API rejects unauthenticated users, missing/false consent, old terms
  versions and foreign origins. Authenticated duplicate POSTs retain the timestamp.
- Legal links work signed out and on mobile; password recovery still reaches
  `/reset-password`; unknown callback destinations cannot redirect off-site.
- Verify account deletion and cascading data removal, including acceptance rows.
- Inspect production network/storage (including host-injected scripts). If optional
  analytics or advertising is enabled outside this repo, block it until opt-in and
  add reject/withdraw controls. Do not assume the source audit covers hosting settings.

## Updating terms

Publish the new wording, update `TERMS_VERSION` and add a migration updating
`public.current_terms_version()` together. Preserve earlier acceptance records and
the previous published terms text in version control. Existing users will see the
acceptance screen for the new version. A privacy-only correction need not change
the contractual terms version; update its displayed date separately if needed.
