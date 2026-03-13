import React from 'react';

export default function Terms() {
  return (
    <div style={styles.legalContainer}>
      <h1>Terms and Conditions</h1>
      <p>Last updated: March 13, 2026</p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By downloading and using the <strong>Bharath Darshika</strong> mobile application or visiting our website, you agree to comply with these terms. If you do not agree, please do not use our services.</p>
      </section>

      <section>
        <h2>2. Use of Information</h2>
        <p>The history, mystery, and tourism facts provided in this app are for informational purposes only. While we strive for accuracy, we do not guarantee the completeness or reliability of any information.</p>
      </section>

      <section>
        <h2>3. Third-Party Links & Rentora</h2>
        <p>Our application integrates with <strong>Rentora</strong> for vehicle rental services. Any transactions, disputes, or agreements made on the Rentora platform are strictly between the user and Rentora. Bharath Darshika is not responsible for rental services.</p>
      </section>

      <section>
        <h2>4. User Safety</h2>
        <p>Users are advised to follow local laws and safety guidelines while visiting the tourism spots mentioned. Travel at your own risk.</p>
      </section>

      <section>
        <h2>5. Changes to Terms</h2>
        <p>We reserve the right to update these terms at any time. Continued use of the app signifies your acceptance of the updated terms.</p>
      </section>

      <footer style={{marginTop: '50px', borderTop: '1px solid #ddd', paddingTop: '20px'}}>
        <p>© 2026 Bharath Darshika - Developed by Ghanta Sai Babu</p>
      </footer>
    </div>
  );
}

const styles = {
  legalContainer: { 
    padding: '50px', 
    maxWidth: '900px', 
    margin: 'auto', 
    color: '#333', 
    lineHeight: '1.8', 
    fontFamily: 'Arial, sans-serif' 
  }
};