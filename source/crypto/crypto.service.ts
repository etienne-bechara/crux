import { Injectable, InternalServerErrorException } from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class CryptoService {

  /**
   * Encrypts value with target key and iv, internal use for
   * exposed `encrypt()` and `encryptWithoutIv()` methods.
   * @param value
   * @param key
   * @param iv
   */
  private encryptWithIv(value: string, key: string, iv: Buffer): string {
    const algorithm = 'aes-256-ctr';

    if (!key || key.length !== 32) {
      throw new InternalServerErrorException('encrypt key must be equal to 32 characters');
    }

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([ cipher.update(value), cipher.final() ]);

    return `${iv.toString('hex')}.${encrypted.toString('hex')}`;
  }

  /**
   * Encrypts desired value with target key and returns a
   * hash in the form of {iv.encrypted}.
   * @param value
   * @param key
   */
  public encrypt(value: string, key: string): string {
    const iv = crypto.randomBytes(16);
    return this.encryptWithIv(value, key, iv);
  }

  /**
   * Encrypts desired value with target key and without and
   * initialization vector, which leads resulting string to
   * be always the same.
   * @param value
   * @param key
   */
  public encryptWithoutIv(value: string, key: string): string {
    const iv = Buffer.from('0'.repeat(32), 'hex');
    const encrypted = this.encryptWithIv(value, key, iv);
    return encrypted.split('.')[1];
  }

  /**
   * Decrypts hash with target key.
   * @param hash
   * @param key
   */
  public decrypt(hash: string, key: string): string {
    const algorithm = 'aes-256-ctr';
    let encrypted: string;
    let iv: string;

    if (!key || key.length !== 32) {
      throw new InternalServerErrorException('decrypt key must be equal to 32 characters');
    }
    else if (!hash) {
      return null;
    }

    if (hash.includes('.')) {
      [ iv, encrypted ] = hash.split('.');
    }
    else {
      iv = '0'.repeat(32);
      encrypted = hash;
    }

    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([ decipher.update(Buffer.from(encrypted, 'hex')), decipher.final() ]);

    return decrypted.toString();
  }

}
