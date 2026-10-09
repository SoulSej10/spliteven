/**
 * With "confirm email" on, Supabase hides whether an address is already
 * registered: signUp() "succeeds" for an existing account, sends no email, and
 * returns a user whose `identities` list is empty. Treat that as "already
 * registered" so the UI doesn't tell someone to wait for an email that is never
 * coming.
 */
export function signupHitExistingAccount(user: { identities?: unknown[] | null } | null | undefined): boolean {
  return !!user && Array.isArray(user.identities) && user.identities.length === 0;
}
