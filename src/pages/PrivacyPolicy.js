import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={styles.legalContainer}>
      <h1>Privacy Policy for Bharath Darshika</h1>
      <p>Last updated: March 13, 2026</p>
      
      <section>
        <h2>1. Information We Collect</h2>
        <p>Bharath Darshika is a tourism information app. We do not collect any personal identification information (PII) such as names, emails, or phone numbers from our general users.</p>
      </section>

      <section>
        <h2>2. Third-Party Services (Rentora)</h2>
        <p>Our app provides redirection to the <strong>Rentora</strong> app (com.rentora.user) for vehicle rentals. Any data shared on the Rentora platform is governed by their respective privacy policy.</p>
      </section>

      <section>
        <h2>3. Data Storage</h2>
        <p>We use Google Firebase to store and fetch tourism data (History, Mystery, Images). No user-side data is stored in our databases.</p>
      </section>

      <p style={{marginTop: '40px'}}>Contact: ghantasaibabu@example.com</p>
    </div>
  );
}

const styles = {
  legalContainer: { padding: '50px', maxWidth: '900px', margin: 'auto', color: '#333', lineHeight: '1.8' }
};