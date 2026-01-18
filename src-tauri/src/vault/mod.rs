//! Plaintext vault model and helpers.
//!
//! Responsibilities:
//! - Define the in-memory vault structure
//! - Serialize/deserialize to/from JSON
//! - Bridge to the crypto layer for encryption/decryption

use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::crypto::types::EncryptedVault;
use crate::crypto::aesgcm::{encrypt_vault, decrypt_vault};
use crate::crypto::errors::CryptoError;
use crate::crypto::kdf::KEY_LEN;

/// A single password entry in the vault.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasswordEntry {
    pub id: Uuid,
    pub title: String,
    pub username: String,
    pub password: String,
    pub notes: String,
    pub created_at: u64,
    pub updated_at: u64,
}

/// The plaintext vault structure held in memory.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Vault {
    pub entries: Vec<PasswordEntry>,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Vault {
    /// Create a new, empty vault.
    pub fn new(timestamp: u64) -> Self {
        Self {
            entries: Vec::new(),
            created_at: timestamp,
            updated_at: timestamp,
        }
    }
}

/// Serialize a plaintext vault and encrypt it into an EncryptedVault.
pub fn encrypt_plain_vault(
    key: &[u8; KEY_LEN],
    vault: &Vault,
) -> Result<EncryptedVault, CryptoError> {
    let json = serde_json::to_vec(vault)
        .map_err(|_| CryptoError::EncryptionFailed)?;

    encrypt_vault(key, &json)
}

/// Decrypt an EncryptedVault and deserialize it into a plaintext Vault.
pub fn decrypt_to_plain_vault(
    key: &[u8; KEY_LEN],
    encrypted: &EncryptedVault,
) -> Result<Vault, CryptoError> {
    let plaintext = decrypt_vault(key, encrypted)?;
    let vault: Vault = serde_json::from_slice(&plaintext)
        .map_err(|_| CryptoError::DecryptionFailed)?;

    Ok(vault)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::kdf::{derive_key, generate_salt};

    fn now_mock() -> u64 {
        1_700_000_000
    }

    #[test]
    fn test_encrypt_decrypt_vault_round_trip() {
        let salt = generate_salt();
        let key = derive_key("test-password", &salt);

        let mut vault = Vault::new(now_mock());
        vault.entries.push(PasswordEntry {
            id: Uuid::new_v4(),
            title: "Example".into(),
            username: "user".into(),
            password: "secret".into(),
            notes: "note".into(),
            created_at: now_mock(),
            updated_at: now_mock(),
        });

        let encrypted = encrypt_plain_vault(&key, &vault).expect("encryption failed");
        let decrypted = decrypt_to_plain_vault(&key, &encrypted).expect("decryption failed");

        assert_eq!(decrypted.entries.len(), 1);
        assert_eq!(decrypted.entries[0].title, "Example");
    }
}