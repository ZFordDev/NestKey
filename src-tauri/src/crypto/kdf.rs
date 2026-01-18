use argon2::{
    password_hash::{SaltString, rand_core::OsRng},
    Argon2,
};
use zeroize::Zeroize;


/// Length of the derived key (AES‑256 requires 32 bytes)
pub const KEY_LEN: usize = 32;

/// Generate a random salt suitable for Argon2id.
///
/// Salt is stored in the vault header and is NOT secret.
pub fn generate_salt() -> SaltString {
    // Uses the OsRng that comes from password-hash's rand_core
    SaltString::generate(OsRng)
}

/// Derive a 256‑bit key from the master password using Argon2id.
///
/// This function:
/// - Uses strong, desktop‑grade Argon2id parameters
/// - Zeroizes the password buffer after use
/// - Returns a fixed‑size 32‑byte key for AES‑256‑GCM
pub fn derive_key(master_password: &str, salt: &SaltString) -> [u8; KEY_LEN] {
    let argon2 = Argon2::new_with_secret(
        &[],
        argon2::Algorithm::Argon2id,
        argon2::Version::V0x13,
        argon2::Params::new(19456, 2, 1, None).expect("Invalid Argon2 params"),
    )
    .expect("Failed to construct Argon2 instance");

    let mut key = [0u8; KEY_LEN];

    let mut password_buf = master_password.as_bytes().to_vec();

    // Use the salt's string representation as bytes
    let salt_bytes = salt.as_str().as_bytes();

    argon2
        .hash_password_into(&password_buf, salt_bytes, &mut key)
        .expect("Argon2 key derivation failed");

    password_buf.zeroize();

    key
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_key_derivation_is_deterministic() {
        let salt = generate_salt();
        let key1 = derive_key("test-password", &salt);
        let key2 = derive_key("test-password", &salt);
        assert_eq!(key1, key2);
    }

    #[test]
    fn test_key_derivation_changes_with_salt() {
        let salt1 = generate_salt();
        let salt2 = generate_salt();
        let key1 = derive_key("test-password", &salt1);
        let key2 = derive_key("test-password", &salt2);
        assert_ne!(key1, key2);
    }
}