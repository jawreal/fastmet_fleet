import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { normalizePassword } from "../password-input";

const keyLength = 32;
const format = "scrypt-v1";
const scryptOptions = { N: 2 ** 15, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const storedHashPattern =
  /^scrypt-v1\$([A-Za-z0-9_-]{24})\$([A-Za-z0-9_-]{43})$/;
const bcryptPattern = /^\$2[aby]\$/;
const dummyHash =
  "$2b$12$5xBpEK3zLIIPmnRGevu9L.TljUBaTLcsT/811FOxn635qN5JfMIw.";

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      normalizePassword(password),
      salt,
      keyLength,
      scryptOptions,
      (error, hash) => {
        if (error) reject(error);
        else resolve(hash);
      },
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(18);
  const hash = await deriveKey(password, salt);
  return [format, salt.toString("base64url"), hash.toString("base64url")].join(
    "$",
  );
}

export async function verifyPassword(password: string, hash = dummyHash) {
  const stored = storedHashPattern.exec(hash);
  if (stored) {
    const salt = Buffer.from(stored[1], "base64url");
    const expected = Buffer.from(stored[2], "base64url");
    const actual = await deriveKey(password, salt);
    return timingSafeEqual(actual, expected);
  }
  if (!bcryptPattern.test(hash)) return false;
  const matches = await bcrypt.compare(password, hash);
  return matches && !bcrypt.truncates(password);
}
