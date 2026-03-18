import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { FileJson, UploadCloud, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react';

export default function BulkUpload({ refresh }) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    
    fileReader.onload = async (event) => {
      try {
        setUploading(true);
        setStatus({ type: 'info', msg: 'Analyzing JSON structure...' });
        
        const json = JSON.parse(event.target.result);
        
        if (!Array.isArray(json)) {
          throw new Error("JSON must be an array of objects!");
        }

        setStatus({ type: 'info', msg: `Uploading ${json.length} records...` });

        // Firebase Batch Limit: Max 500 docs per batch
        const batch = writeBatch(db);
        json.forEach((place) => {
          // ఇక్కడ నీ కలెక్షన్ పేరు 'Places' అని ఖచ్చితంగా ఉండాలి
          const newDocRef = doc(collection(db, "Places"));
          batch.set(newDocRef, {
            ...place,
            is_hidden_gem: place.is_hidden_gem || false,
            createdAt: new Date()
          });
        });

        await batch.commit();
        
        setStatus({ type: 'success', msg: `Success! ${json.length} places integrated. 🎉` });
        if (refresh) refresh(); // Dashboard డేటాని అప్‌డేట్ చేయడానికి
        
      } catch (err) {
        console.error(err);
        setStatus({ type: 'error', msg: 'Invalid JSON! Check the file format.' });
      } finally {
        setUploading(false);
      }
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconCircle}>
          <UploadCloud size={40} color="#FF7A00" />
        </div>
        
        <h2 style={styles.title}>System Bulk Integration</h2>
        <p style={styles.subTitle}>
          Drop your heritage JSON file here to sync multiple records with the Firebase cloud.
        </p>

        <div style={styles.uploadArea}>
          <input 
            type="file" 
            accept=".json" 
            onChange={handleFileUpload} 
            style={styles.hiddenInput} 
            id="bulk-file"
            disabled={uploading}
          />
          <label htmlFor="bulk-file" style={uploading ? styles.disabledLabel : styles.fileLabel}>
            {uploading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <><FileJson size={20} /> Choose JSON File</>
            )}
          </label>
        </div>

        {status.msg && (
          <div style={{
            ...styles.statusBox, 
            backgroundColor: status.type === 'success' ? '#ECFDF5' : status.type === 'error' ? '#FEF2F2' : '#EFF6FF',
            color: status.type === 'success' ? '#059669' : status.type === 'error' ? '#EF4444' : '#3B82F6'
          }}>
            {status.type === 'success' ? <CheckCircle size={18} /> : status.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
            <span>{status.msg}</span>
          </div>
        )}

        <div style={styles.templateInfo}>
          <b>Expected Format:</b> <code>[&#123; "name": "...", "state": "..." &#125;]</code>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', animation: 'fadeIn 0.5s' },
  card: { 
    backgroundColor: '#fff', padding: '50px 40px', borderRadius: '32px', 
    textAlign: 'center', maxWidth: '550px', width: '100%',
    boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' 
  },
  iconCircle: { width: '80px', height: '80px', backgroundColor: '#FFF7ED', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' },
  title: { fontSize: '24px', fontWeight: '900', color: '#0F172A', margin: '0 0 10px 0' },
  subTitle: { color: '#64748B', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' },
  uploadArea: { marginBottom: '25px' },
  hiddenInput: { display: 'none' },
  fileLabel: { 
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    backgroundColor: '#0F172A', color: '#fff', padding: '18px 30px', borderRadius: '16px',
    cursor: 'pointer', fontWeight: '700', fontSize: '16px', transition: '0.3s'
  },
  disabledLabel: { 
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    backgroundColor: '#F1F5F9', color: '#94A3B8', padding: '18px 30px', borderRadius: '16px',
    cursor: 'not-allowed', fontWeight: '700'
  },
  statusBox: { 
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    padding: '15px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', marginTop: '20px'
  },
  templateInfo: { marginTop: '30px', padding: '15px', backgroundColor: '#F8FAFC', borderRadius: '12px', fontSize: '12px', color: '#94A3B8' }
};