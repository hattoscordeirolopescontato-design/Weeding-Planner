import "server-only";
import {
  randomBytes,
  scryptSync,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";

// Criptografia dos votos em repouso: AES-256-GCM com chave derivada da senha
// via scrypt. Sem a senha, nem o acesso ao banco revela o texto.

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12; // recomendado para GCM
const SALT_LENGTH = 16;

export type EncryptedVow = {
  ciphertext: string;
  iv: string;
  salt: string;
  authTag: string;
};

function deriveKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, KEY_LENGTH);
}

export function encryptVow(plaintext: string, password: string): EncryptedVow {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(password, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    salt: salt.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

/**
 * Decifra o voto. Lança erro se a senha estiver incorreta (a verificação da
 * authTag do GCM falha), o que usamos para validar a senha sem armazená-la.
 */
export function decryptVow(data: EncryptedVow, password: string): string {
  const salt = Buffer.from(data.salt, "base64");
  const iv = Buffer.from(data.iv, "base64");
  const authTag = Buffer.from(data.authTag, "base64");
  const key = deriveKey(password, salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data.ciphertext, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
