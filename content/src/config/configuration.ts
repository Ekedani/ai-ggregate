import axios from 'axios';
import * as process from 'node:process';

export async function getPublicKey() {
  const usersApiUri = process.env.USERS_SERVICE_URL;
  if (!usersApiUri) {
    return Buffer.from(process.env.JWT_PUBLIC_KEY_BASE64, 'base64').toString(
      'utf8',
    );
  }
  const publicKeyUrl = `${usersApiUri}/auth/pem`;
  try {
    const response = await axios.get(publicKeyUrl);
    return response.data;
  } catch (error) {
    return Buffer.from(process.env.JWT_PUBLIC_KEY_BASE64, 'base64').toString(
      'utf8',
    );
  }
}

export default async () => ({
  JWT_PUBLIC_KEY: await getPublicKey(),
});
