use aes_gcm::{
    aead::{Aead, KeyInit, OsRng, rand_core::RngCore},
    Aes256Gcm, Nonce,
};

use zeroize::Zeroize;

use crate::crypto::kdf::KEY_LEN;
use crate::crypto::types::EncryptedVault;
use crate::crypto::errors::CryptoError;

const NONCE_LEN: usize = 12;

pub fn encrypt_vault(key: &[u8; KEY_LEN], plaintext: &[u8]) -> Result<EncryptedVault, CryptoError> {
    let mut key_buf = *key;
    let cipher = Aes256Gcm::new_from_slice(&key_buf)
        .map_err(|_| CryptoError::InvalidKey)?;

    // Generate random nonce using aes-gcm's OsRng + RngCore
    let mut nonce_bytes = [0u8; NONCE_LEN];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|_| CryptoError::EncryptionFailed)?;

    key_buf.zeroize();

    Ok(EncryptedVault {
        version: EncryptedVault::CURRENT_VERSION,
        nonce: nonce_bytes.to_vec(),
        ciphertext,
    })
}

pub fn decrypt_vault(
    key: &[u8; KEY_LEN],
    encrypted: &EncryptedVault,
) -> Result<Vec<u8>, CryptoError> {
    if encrypted.nonce.len() != NONCE_LEN {
        return Err(CryptoError::InvalidNonce);
    }

    if encrypted.version != EncryptedVault::CURRENT_VERSION {
        return Err(CryptoError::UnsupportedVersion(encrypted.version));
    }

    let mut key_buf = *key;
    let cipher = Aes256Gcm::new_from_slice(&key_buf)
        .map_err(|_| CryptoError::InvalidKey)?;

    let nonce = Nonce::from_slice(&encrypted.nonce);

    let plaintext = cipher
        .decrypt(nonce, encrypted.ciphertext.as_ref())
        .map_err(|_| CryptoError::DecryptionFailed)?;

    key_buf.zeroize();

    Ok(plaintext)
}