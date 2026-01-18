use thiserror::Error;

/// Unified error type for all cryptographic operations.
///
/// This keeps the public API clean and allows the UI layer
/// to handle failures in a predictable way.
#[derive(Debug, Error)]
pub enum CryptoError {
    #[error("invalid encryption key")]
    InvalidKey,

    #[error("invalid or malformed nonce")]
    InvalidNonce,

    #[error("unsupported vault version: {0}")]
    UnsupportedVersion(u8),

    #[error("encryption failed")]
    EncryptionFailed,

    #[error("decryption failed (wrong password or corrupted data)")]
    DecryptionFailed,
}