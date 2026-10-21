# /baking

A public, mobile-first log of baking experiments at `alexiswei.com/baking`.
Anyone can read it; only Alexis can edit, after unlocking with a passcode.
**It holds real data**, so treat every change as a change to a live database.

## Where things live

| Path                     | What                                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `src/app/baking/`        | Pages (logs list, log, ingredients, ingredient, recently deleted, unlock) and `actions.ts` (every write, as server actions) |
| `src/app/api/baking/`    | Upload signing for R2, plus a local-only stand-in for R2                                                                    |
| `src/components/baking/` | UI: log editor, timeline, gallery, ingredient popup, cropper, autosave                                                      |
| `src/lib/baking/`        | Database (`db.ts`), reads (`queries.ts`), 30-day trash (`trash.ts`), storage, image/video prep, formatting                  |

## Data

- **Turso (SQLite)** in production. Without `TURSO_DATABASE_URL`, local dev uses
  `.baking-local/baking.db` and stores uploads in `.baking-local/uploads/`.
- **Vercel previews use the production database and bucket.** Don't test on a
  preview with data you care about; test locally.
- **Schema changes run automatically on server start** (`migrate` in `db.ts`):
  - `SCHEMA`: tables and indexes (`CREATE … IF NOT EXISTS`). New tables use `STRICT`.
  - `ADDED_COLUMNS`: new columns on existing tables. Additive and safe.
  - `DROPPED_COLUMNS`: **deletes data for good.** Only add a column here when that's the intent.
  - `DATA_MIGRATIONS`: one-time data moves, recorded in `schema_migrations` so they never run twice.
    Leave the old data in place as a backup rather than deleting it in the same change.
- **Deletes are soft.** Rows get `deleted_at`, are hidden everywhere, can be restored
  from "recently deleted" for 30 days, and are then purged with their R2 files
  (`purgeExpired`). Any new table that belongs to a log must be handled in
  `trash.ts`, both in the purge and, if users can delete it, in `listDeleted`.
- **Timeline step times** are "YYYY-MM-DDTHH:MM". Older steps may hold "HH:MM";
  `resolveStepTimes` reads them on the log's date, rolling to the next day when
  time goes backwards. Gaps between steps are computed on render, not stored.
- **Ordering** (timeline steps, photos, ingredients, recipe files) is an integer
  `position` per log. Reordering rewrites the positions of that log's rows in one
  batch. Gaps are fine; only the order matters.
- **Files** go straight from the browser to R2 with a presigned URL. Log photos
  and videos are resized to 1080p first, ingredient icons are 720×720 (with a
  ≤720px original kept for re-cropping), and recipe files are stored untouched.

## Tests

```bash
pnpm test
```

CI runs this on every pull request.

**Every change to /baking comes with tests:**

- **New feature:** add tests for what it does, including the failure path (failed save, bad input).
- **Changed behaviour:** update the tests that describe the old behaviour in the
  same change. Don't delete or loosen a failing test to get green; fix the code or
  rewrite the test to describe the new intended behaviour.
- **Bug fix:** add a test that fails without the fix (check this by running it against the old code once).
- **Database change** (new table/column, migration, ordering, trash): cover it in
  `src/lib/baking/data.test.ts`. It runs the real code against an in-memory SQLite
  database and includes an "existing database" case shaped like production.

| Test file                                          | Covers                                                                                 |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/lib/baking/data.test.ts`                      | Migrations on an existing database, timeline step insert/reorder/delete, 30-day purge  |
| `src/lib/baking/format.test.ts`                    | Safe recipe links, bake start/end and durations                                        |
| `src/lib/baking/order.test.ts`                     | Reorder helpers, drop position, cover choice                                           |
| `src/lib/baking/timeline.test.ts`                  | Step dates (incl. older time-only steps), gaps between steps, date labels              |
| `src/lib/baking/image.test.ts`                     | 1080p sizing, saved ingredient crops                                                   |
| `src/lib/baking/capture.test.ts`                   | Photo capture time from EXIF                                                           |
| `src/components/baking/Timeline.test.tsx`          | Adding, inserting, reordering and deleting steps; per-step saving; step dates and gaps |
| `src/components/baking/IngredientBrowser.test.tsx` | Adding an ingredient from a log (with image) and saving on every exit                  |
| `src/components/baking/autosave.test.tsx`          | Debounced, ordered, retrying autosave                                                  |

**Before shipping:** run `pnpm test`, `pnpm lint`, `npx tsc --noEmit` and a
production build, then click through the change locally at phone width.
