// Fill these in from your Supabase project's Settings -> API page.
// SUPABASE_ANON_KEY is safe to expose in frontend code (it's the public
// key, gated by the row-level security policies in supabase/schema.sql).
// Never put the service_role key here or anywhere in this repo.
//
// Sign-in is Google-only (js/account.js calls signInWithOAuth). Before it
// works you also need to, in the Supabase dashboard:
//   1. Authentication -> Providers -> enable Google, using a Client ID /
//      Secret from a Google Cloud OAuth consent screen + credential you
//      create yourself (console.cloud.google.com -> APIs & Services ->
//      Credentials -> OAuth client ID -> Web application).
//   2. Authentication -> URL Configuration -> add this site's account.html
//      URL (e.g. https://<user>.github.io/<repo>/account.html) to the
//      allowed Redirect URLs.
window.SUPABASE_URL = "https://vtkmcrfaydgmxjlpvbrn.supabase.co";
window.SUPABASE_ANON_KEY = "sb_publishable_gkiAphPGfNPHFRgXCK3EhQ_EsvxQbgU";
