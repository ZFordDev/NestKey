//! Core cryptography module for NestKey.
//!
//! Responsibilities:
//! - Argon2id key derivation
//! - AES-256-GCM encryption/decryption
//! - Secure random generation
//! - Vault encryption format (salt, nonce, ciphertext, version)
//!
//! This module exposes a clean public API while keeping internal
//! crypto details encapsulated.

pub mod kdf;
pub mod aesgcm;
pub mod types;
pub mod errors;

pub use kdf::derive_key;
pub use aesgcm::{encrypt_vault, decrypt_vault};
pub use types::EncryptedVault;
pub use errors::CryptoError;