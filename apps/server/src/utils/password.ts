/** Hashes an explicitly supplied account password using the shared server policy. */
export function hashPassword(password: string) {
  return Bun.password.hash(password, { algorithm: 'bcrypt', cost: 10 });
}
