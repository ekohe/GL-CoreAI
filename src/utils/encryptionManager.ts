/**
 * Encryption Manager for securing sensitive data in Chrome storage
 * Uses Web Crypto API with AES-GCM encryption
 */

// List of storage keys that contain sensitive data and should be encrypted
export const SENSITIVE_KEYS = [
  'GASOpenAIKey',
  'GASDeepSeekAIKey',
  'GASClaudeKey',
  'GASOpenRouterKey',
  'GASGitLabAccessToken',
  'GASGoogleAccessToken',
  'GASUserAccessToken',
  'GASSlackWebhookUrl',
  'gitlab_token', // Used in gitlabApi.ts
] as const;

export type SensitiveKey = typeof SENSITIVE_KEYS[number];

// Storage key for the encryption key (stored in chrome.storage.local for device-local security)
const ENCRYPTION_KEY_STORAGE = 'GAS_ENCRYPTION_KEY';

// Prefix for encrypted values to identify them
const ENCRYPTED_PREFIX = 'ENC::';

/**
 * Converts ArrayBuffer to base64 string
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Converts base64 string to ArrayBuffer
 */
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Generates a new AES-GCM encryption key
 */
const generateEncryptionKey = async (): Promise<CryptoKey> => {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable for storage
    ['encrypt', 'decrypt']
  );
};

/**
 * Exports a CryptoKey to a base64 string for storage
 */
const exportKey = async (key: CryptoKey): Promise<string> => {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
};

/**
 * Imports a base64 string back to a CryptoKey
 */
const importKey = async (keyData: string): Promise<CryptoKey> => {
  const keyBuffer = base64ToArrayBuffer(keyData);
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

/**
 * Gets or creates the encryption key
 * The key is stored in chrome.storage.local (device-local, not synced)
 */
const getOrCreateEncryptionKey = async (): Promise<CryptoKey> => {
  return new Promise(async (resolve, reject) => {
    try {
      chrome.storage.local.get([ENCRYPTION_KEY_STORAGE], async (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error accessing local storage:', chrome.runtime.lastError);
          reject(new Error('Failed to access encryption key storage'));
          return;
        }

        let key: CryptoKey;

        if (result[ENCRYPTION_KEY_STORAGE]) {
          // Import existing key
          try {
            key = await importKey(result[ENCRYPTION_KEY_STORAGE]);
          } catch (importError) {
            console.error('Failed to import existing key, generating new one:', importError);
            key = await generateEncryptionKey();
            const exportedKey = await exportKey(key);
            chrome.storage.local.set({ [ENCRYPTION_KEY_STORAGE]: exportedKey });
          }
        } else {
          // Generate new key
          key = await generateEncryptionKey();
          const exportedKey = await exportKey(key);
          chrome.storage.local.set({ [ENCRYPTION_KEY_STORAGE]: exportedKey });
        }

        resolve(key);
      });
    } catch (error) {
      console.error('Error in getOrCreateEncryptionKey:', error);
      reject(error);
    }
  });
};

// Cache the key to avoid repeated storage access
let cachedKey: CryptoKey | null = null;

/**
 * Gets the encryption key (with caching)
 */
const getEncryptionKey = async (): Promise<CryptoKey> => {
  if (cachedKey) {
    return cachedKey;
  }
  cachedKey = await getOrCreateEncryptionKey();
  return cachedKey;
};

/**
 * Encrypts a string value
 * Returns the encrypted value with prefix for identification
 */
export const encrypt = async (value: string): Promise<string> => {
  if (!value) return value;

  try {
    const key = await getEncryptionKey();

    // Generate a random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encode the plaintext
    const encoder = new TextEncoder();
    const data = encoder.encode(value);

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Combine IV and encrypted data, then encode as base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    return ENCRYPTED_PREFIX + arrayBufferToBase64(combined.buffer);
  } catch (error) {
    console.error('Encryption failed:', error);
    // Return original value if encryption fails (for backward compatibility)
    return value;
  }
};

/**
 * Decrypts an encrypted string value
 * Returns the original value if not encrypted or decryption fails
 */
export const decrypt = async (encryptedValue: string): Promise<string> => {
  if (!encryptedValue) return encryptedValue;

  // Check if the value is actually encrypted
  if (!encryptedValue.startsWith(ENCRYPTED_PREFIX)) {
    return encryptedValue; // Return as-is for backward compatibility
  }

  try {
    const key = await getEncryptionKey();

    // Remove prefix and decode
    const encoded = encryptedValue.slice(ENCRYPTED_PREFIX.length);
    const combined = new Uint8Array(base64ToArrayBuffer(encoded));

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    // Decode the plaintext
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    // Return original value if decryption fails (for backward compatibility)
    return encryptedValue;
  }
};

/**
 * Checks if a storage key contains sensitive data
 */
export const isSensitiveKey = (key: string): boolean => {
  return SENSITIVE_KEYS.includes(key as SensitiveKey);
};

/**
 * Checks if a value is encrypted
 */
export const isEncrypted = (value: string): boolean => {
  return typeof value === 'string' && value.startsWith(ENCRYPTED_PREFIX);
};

/**
 * Encrypts an object's sensitive values
 * Only encrypts values for keys in SENSITIVE_KEYS
 */
export const encryptSensitiveValues = async (
  obj: Record<string, any>
): Promise<Record<string, any>> => {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key) && typeof value === 'string' && value && !isEncrypted(value)) {
      result[key] = await encrypt(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};

/**
 * Decrypts an object's sensitive values
 * Only decrypts values for keys in SENSITIVE_KEYS that are encrypted
 */
export const decryptSensitiveValues = async (
  obj: Record<string, any>
): Promise<Record<string, any>> => {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key) && typeof value === 'string' && isEncrypted(value)) {
      result[key] = await decrypt(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};

/**
 * Migrates existing unencrypted sensitive data to encrypted format
 * Should be called once during extension initialization
 */
export const migrateToEncryptedStorage = async (): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(null, async (allData) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to get storage for migration:', chrome.runtime.lastError);
        resolve();
        return;
      }

      const updates: Record<string, string> = {};
      let hasUpdates = false;

      for (const key of SENSITIVE_KEYS) {
        const value = allData[key];
        if (typeof value === 'string' && value && !isEncrypted(value)) {
          updates[key] = await encrypt(value);
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        chrome.storage.sync.set(updates, () => {
          if (chrome.runtime.lastError) {
            console.error('Failed to save encrypted values:', chrome.runtime.lastError);
          } else {
            console.log('Successfully migrated sensitive data to encrypted storage');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
};

/**
 * Clears the cached encryption key (useful for testing or key rotation)
 */
export const clearKeyCache = (): void => {
  cachedKey = null;
};
