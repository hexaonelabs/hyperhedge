class SecureKeyManager {
  private static readonly STORAGE_KEY = 'hl_encrypted_key';
  
  // Générer une clé de chiffrement à partir du wallet principal
  private static async deriveKey(walletSignature: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(walletSignature),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('hyperhedge-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(value: string, walletSignature: string): Promise<string> {
    const key = await this.deriveKey(walletSignature);
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    const encryptedData = {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv)
    };
    
    return JSON.stringify(encryptedData);
  }

  static async encryptAndStore(privateKey: string, walletSignature: string): Promise<void> {
    const key = await this.deriveKey(walletSignature);
    const encoder = new TextEncoder();
    const data = encoder.encode(privateKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    const encryptedData = {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv)
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(encryptedData));
  }

  static async decrypt(value: string, walletSignature: string): Promise<string | null> {
    try {
      const { data, iv } = JSON.parse(value);
      const key = await this.deriveKey(walletSignature);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(data)
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Failed to decrypt key:', error);
      return null;
    }
  }
  
  static async decryptAndRetrieve(walletSignature: string): Promise<string | null> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const { data, iv } = JSON.parse(stored);
      const key = await this.deriveKey(walletSignature);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(data)
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Failed to decrypt key:', error);
      return null;
    }
  }
  
  static clearStoredKey(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export { SecureKeyManager };