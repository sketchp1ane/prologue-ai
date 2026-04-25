# Database modules

Database access will be implemented here after the data model task.

Rules:

- Every user-owned record must be scoped by `userId`.
- Do not query user data by URL id alone.
- Keep Prisma access in server-side modules.
