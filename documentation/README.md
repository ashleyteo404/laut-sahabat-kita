# Digital Ocean Passport documentation

This directory is the maintained technical reference for the Laut Sahabat Kita Digital Ocean
Passport. It documents the three-island pilot implemented in this repository: Gili Bidara, Gili
Range, and Gili Sarang.

## Document map

| Document                                                    | Audience                             | Purpose                                                                          |
| ----------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------- |
| [Architecture](architecture.md)                             | Developers and technical leads       | System boundaries, runtime layers, roles, and end-to-end data flows.             |
| [Code reference](code-reference.md)                         | Developers and reviewers             | Responsibility of every source, configuration, script, database, and PWA file.   |
| [Database and security](database-and-security.md)           | Developers and Supabase operators    | Tables, functions, RLS, Storage, migrations, and security invariants.            |
| [PWA and offline sync](pwa-and-offline-sync.md)             | Developers, testers, and pilot staff | Cache behavior, local persistence, synchronization, limitations, and test cases. |
| [Development and operations](development-and-operations.md) | Developers and operators             | Setup, quality gates, deployment, Supabase updates, and release checklist.       |
| [UptimeRobot monitoring](uptimerobot-monitoring.md)         | Operators                            | Configure an authenticated external monitor for the deployed app and database.   |
| [Code audit](code-audit.md)                                 | Project owners and maintainers       | Audit scope, resolved findings, verification evidence, and remaining risks.      |

## Documentation conventions

- Repository paths are relative to the project root.
- `MUST`, `SHOULD`, and `MAY` describe required, recommended, and optional behavior respectively.
- Supabase's publishable/anonymous key is intentionally browser-safe when Row Level Security is
  enabled. Database passwords, secret keys, and `service_role` keys MUST never be committed.
- `supabase/schema.sql` is the canonical, idempotent database definition. Files in
  `supabase/migrations/` are focused upgrades for an existing project.
- The audit reflects the repository on **2026-09-11**. Update the audit and affected references when
  architecture or security behavior changes.

## Change policy

Code changes that affect authentication, authorization, database structure, offline persistence,
submission state, or deployment MUST update the corresponding document in this directory. New
runtime files MUST also be added to [Code reference](code-reference.md).
