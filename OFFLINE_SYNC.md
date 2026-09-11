# Offline submission sync

Student activity submissions use an IndexedDB outbox. Pressing **Submit** always saves the reflection
and photo on the device first. The local copy is deleted only after the authenticated server endpoint
confirms that Supabase received it.

## Activate the database support

Run `supabase/migrations/20260822_offline_submission_sync.sql` in the Supabase SQL Editor, or rerun
the complete `supabase/schema.sql`. This adds a client submission UUID and database uniqueness rules
that make retries idempotent.

Then verify the project:

```powershell
npm run db:check
```

`offline submission sync` should report `ready`.

## Test offline submission

1. Start the app and sign in as a student while online.
2. Open **Explore** and begin an unfinished field activity.
3. In browser developer tools, set the network to **Offline**.
4. Select a JPG, PNG, or WebP image under 3 MB, write a reflection, and submit.
5. Confirm the activity says **Saved on this device / Tersimpan di perangkat ini** and the header shows **1 waiting / 1 menunggu**.
6. Navigate away and back while the app remains open. Confirm the saved submission is still shown.
7. Restore the network.
8. Confirm the header briefly says **Syncing… / Menyinkronkan…**, then disappears.
9. Sign in as the teacher and confirm the field activity is waiting under **Review**.

For an online activity, repeat the test without a photo and confirm its learning badge appears after
sync.

## Sync behavior

- Chrome and Android use Background Sync when supported, including after the PWA is closed.
- Every browser also retries when the app opens, regains connectivity, resumes, or receives focus.
- iPhone and iPad do not reliably support closed-app Background Sync. Saved work uploads when the
  student reopens or resumes the PWA after reconnecting.
- Browsers cannot reliably distinguish Wi-Fi from mobile data. Sync begins when any usable internet
  connection returns.
- Queue records are tied to a student ID. A different account on a shared device cannot upload them.
- No Supabase password, API key, or authentication token is stored in IndexedDB.
- Photos and reflections are removed from IndexedDB after the server confirms success.

If a saved item reports **needs attention / perlu diperiksa**, open it from Explore. Retry it after correcting the
server/database issue, or use **Remove** to delete that local reflection and photo deliberately.

## Language

The interface is bilingual. Where this guide names an on-screen string it gives the English and the
Bahasa Indonesia wording separated by a slash; only one of them appears, depending on the reader's
language. **Remove** appears as _Hapus_ in Bahasa Indonesia.

Queued submissions store their last failure as a dictionary key, so switching language while work is
still waiting re-renders the stored status and any error in the new language.
