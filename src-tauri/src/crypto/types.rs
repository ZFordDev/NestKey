use serde::{Serialize, Deserialize};

/// Current vault format version.
/// Increment this if the structure changes in the future.
pub const CURRENT_VERSION: u8 = 1;

/// The encrypted vault structure stored on disk.
///
/// This is the *only* thing written to the vault file.
/// The plaintext vault (JSON) is encrypted into `ciphertext`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedVault {
    /// Version of the vault format.
    pub version: u8,

    /// AES-GCM nonce (12 bytes).
    pub nonce: Vec<u8>,

    /// AES-GCM ciphertext (includes authentication tag).
    pub ciphertext: Vec<u8>,
}

impl EncryptedVault {
    pub const CURRENT_VERSION: u8 = CURRENT_VERSION;

    /// Basic sanity validation before attempting decryption.
    pub fn validate(&self) -> bool {
        self.version == CURRENT_VERSION
            && self.nonce.len() == 12
            && !self.ciphertext.is_empty()
    }
}