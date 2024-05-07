import * as process from 'node:process';

export async function getPublicKey() {
  return Buffer.from(process.env.JWT_PUBLIC_KEY_BASE64, 'base64').toString(
    'utf8',
  );
}

export async function getPrivateKey() {
  return Buffer.from(process.env.JWT_PRIVATE_KEY_BASE64, 'base64').toString(
    'utf8',
  );
}

export default async () => ({
  JWT_PUBLIC_KEY: await getPublicKey(),
  JWT_PRIVATE_KEY: await getPrivateKey(),
});
