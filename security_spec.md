# Security Spec

## Data Invariants
- Users can only read, create, update, or delete their own documents.
- The `ownerId` must exactly match the authenticated user's ID.
- The document ID for the user profile must exactly match the user's UID.
- Subcollections (`vitals`, `medications`, `checkins`) can only be accessed if the parent document ID `userId` matches the authenticated user's ID.

## Dirty Dozen Payloads
1. User profile creation with mismatched `ownerId`.
2. User profile creation without `name`.
3. Updating another user's profile.
4. User profile creation with ghost fields (e.g., `isAdmin`).
5. User profile update trying to change `ownerId`.
6. Creating a vital reading in another user's subcollection.
7. Creating a vital reading with invalid type for `status`.
8. Vital reading with `ownerId` mismatched.
9. Missing required timestamp on creation.
10. Creating a medication with a non-matching `userId` path variable.
11. Updating a medication but deleting a required field.
12. Fetching a daily checkin from another user's subcollection.

## Test Runner
Testing will be conducted on ESLint rules validation.
