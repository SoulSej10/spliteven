/**
 * Supabase enforces its own "required characters" policy on the server and
 * rejects a weak password with a message like
 *   "Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyz,
 *    ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789, !@#$%^&*()_+-=[]{};':\"|<>?,./`~."
 * This turns that into plain language, listing exactly which symbols the server
 * accepts, so a person can fix the password instead of guessing. Returns null
 * for any other error.
 */
export function describeWeakPassword(message: string | null | undefined): string | null {
  if (!message) return null;
  const match = /at least one character of each:\s*(.+)$/i.exec(message.trim());
  if (!match) return null;

  const groups = match[1].replace(/\.$/, "").split(/,\s+(?=\S)/);
  const parts: string[] = [];
  for (const group of groups) {
    const chars = group.trim();
    if (!chars) continue;
    if (/^[a-z]{20,}$/.test(chars)) parts.push("a lowercase letter");
    else if (/^[A-Z]{20,}$/.test(chars)) parts.push("a capital letter");
    else if (/^[0-9]{8,}$/.test(chars)) parts.push("a number");
    else if (chars.length > 12) parts.push("a symbol (such as ! @ # $ %)");
    else parts.push(`one of these symbols: ${chars.split("").join(" ")}`);
  }
  if (parts.length === 0) return null;
  const last = parts.pop() as string;
  const list = parts.length ? `${parts.join(", ")} and ${last}` : last;
  return `Your password needs at least ${list}.`;
}
