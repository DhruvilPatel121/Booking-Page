export const PAYU_CONFIG = {
  // PayU Production/Sandbox Configuration
  MERCHANT_KEY: import.meta.env.VITE_PAYU_MERCHANT_KEY || 'IhRBAw',
  SALT: import.meta.env.VITE_PAYU_SALT || 'yzIfxwUgSFnwT6mT3QAQh9bnrkejsXJD',
  
  // PayU URLs (change based on environment)
  PROD_URL: 'https://secure.payu.in/_payment',
  TEST_URL: 'https://test.payu.in/_payment',
  
  // Use test URL for development, prod URL for production
  get PAYMENT_URL() {
    return import.meta.env.MODE === 'production' ? this.PROD_URL : this.TEST_URL;
  },
  
  // Success/Failure URLs
  SUCCESS_URL: `${window.location.origin}/payment/success`,
  FAILURE_URL: `${window.location.origin}/payment/failure`,
  CANCEL_URL: `${window.location.origin}/payment/cancel`,
  
  // Payment modes
  PAYMENT_MODES: {
    CC: 'CC',           // Credit Card
    DC: 'DC',           // Debit Card
    NB: 'NB',           // Net Banking
    UPI: 'UPI',         // UPI
    CASH: 'CASH',       // Cash on Delivery
    EMI: 'EMI',        // EMI
    WALLET: 'WALLET'     // Wallet
  },
  
  /**
   * Generate hash for PayU transaction
   * Note: In production, this should be done server-side for security
   */
  async generateHash(data: any): Promise<string> {
    // PayU exact formula: sha512(key|txnid|amount|productinfo|firstname|email|||||||||||SALT)
    const hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${this.SALT}`;
    
    // Generate SHA512 hash
    try {
      return await this.sha512(hashString);
    } catch (error) {
      console.error('Hash generation error:', error);
      return this.fallbackHash(hashString);
    }
  },

  /**
   * Verify hash for PayU transaction response
   */
  async verifyHash(data: any): Promise<string> {
    // PayU exact formula for response: sha512(SALT|status|||||||||||email|firstname|productinfo|amount|txnid|key)
    const hashString = `${this.SALT}|${data.status}|||||||||||${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${data.key}`;
    
    // Generate SHA512 hash
    try {
      return await this.sha512(hashString);
    } catch (error) {
      console.error('Hash verification error:', error);
      return this.fallbackHash(hashString);
    }
  },

  /**
   * SHA512 hash using Web Crypto API
   */
  async sha512(str: string): Promise<string> {
    try {
      // Encode the string as UTF-8
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      
      // Compute SHA-512 hash
      const hashBuffer = await crypto.subtle.digest('SHA-512', data);
      
      // Convert buffer to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (error) {
      console.error('SHA512 error:', error);
      // Fallback for testing
      return this.fallbackHash(str);
    }
  },

  /**
   * Fallback hash for testing (not secure!)
   */
  fallbackHash(str: string): string {
    // Generate a consistent 128-character hex string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const baseHash = Math.abs(hash).toString(16);
    return baseHash.padStart(128, '0').substring(0, 128);
  },
  
  // Payment status codes
  PAYMENT_STATUS: {
    SUCCESS: 'success',
    PENDING: 'pending',
    FAILURE: 'failure',
    CANCELLED: 'cancelled',
    PENDING_VB: 'pending_vbv',
    INVALID: 'invalid'
  }
};
