# Security Specification for PharmaGuard

## Data Invariants
1. A delivery cannot exist without a pharmacyId and patientId.
2. Only pharmacies can create deliveries.
3. Drivers can only update status, location, and temperature of high-value deliveries.
4. Users cannot change their own roles once set.
5. PII (emails/names) is protected; only admins or the user themselves can read profiles.

## Dirty Dozen Payloads (Fail Tests)
1. **Identity Spoof**: Non-admin user tries to read another user's profile.
2. **Role Escalation**: Pharmacy tries to update its own role to 'admin'.
3. **Ghost Write**: User tries to create a delivery for another pharmacy.
4. **Invalid State**: Driver tries to set status to 'delivered' before 'picked-up' (handled by app, rule blocks unauthorized keys).
5. **PII Leak**: Unauthenticated user tries to list all user emails.
6. **Shadow Field**: Adding `isVerified: true` to a profile update.
7. **Orphaned Delivery**: Creating a delivery with a random patientId that doesn't exist (can be checked with `exists()`).
8. **Resource Exhaustion**: Sending a 1MB string as a delivery ID.
9. **Tampering**: Driver tries to change `pharmacyId` on a delivery they are assigned to.
10. **Malicious Temp**: Setting temperature to `999` (can add range check in refined rules).
11. **Expired Session**: Trying to write with null auth.
12. **Unverified Email**: Trying to create a pharmacy profile without email verification.

## Implementation Status: DRAFT_firestore.rules created.
