/**
 * Calculates the SHA-256 hash of a string using the browser's Web Crypto API.
 * 
 * @param {string} message - The text content to hash.
 * @returns {Promise<string>} - The 64-character hexadecimal SHA-256 hash.
 */
export async function calculateSHA256(message) {
  if (!message) return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // empty hash
  
  // Encode string as UTF-8 bytes
  const msgBuffer = new TextEncoder().encode(message);
  
  // Hash the message buffer using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Convert ArrayBuffer to Uint8Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // Convert bytes to hex string
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}
