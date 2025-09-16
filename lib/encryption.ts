import crypto from "crypto";

const algorithm = "aes-256-gcm";
const secret = process.env.ENCRYPTION_KEY!;

export function encrypt(text: string) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret, "hex"), iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(enc: string) {
    const [ivHex, tagHex, encryptedHex] = enc.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encryptedText = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret, "hex"), iv);
    decipher.setAuthTag(tag);
    const decrypted = decipher.update(encryptedText) + decipher.final("utf8");
    return decrypted;
}