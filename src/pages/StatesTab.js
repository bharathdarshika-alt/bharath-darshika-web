import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc 
} from 'firebase/firestore';
import { 
  Edit3, Trash2, Map, PlusCircle, Search, Camera, ChevronRight 
} from 'lucide-react';

export default function StatesTab() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', capital: '', img: '', zoneId: 'z1'
  });

  // జోన్ మ్యాపింగ్ - కార్పొరేట్ స్టైల్
  const zoneMapping = { 
    "South India": "z1", 
    "North India": "z2", 
    "West India": "z3", 
    "East India": "z4" 
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "States"));
      setStates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error("Fetch Error:", e); }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.capital) return alert("రాష్ట్రం పేరు మరియు రాజధాని తప్పనిసరి బాసు!");
    
    setLoading(true);
    try {
      const dataToSave = {
        name: formData.name || "",
        capital: formData.capital || "",
        img: formData.img || "",
        zoneId: formData.zoneId || "z1"
      };

      if (isEditing) {
        await updateDoc(doc(db, "States", currentId), dataToSave);
        alert("రాష్ట్రం వివరాలు అప్‌డేట్ అయ్యాయి! ✅");
      } else {
        await addDoc(collection(db, "States"), dataToSave);
        alert("కొత్త రాష్ట్రం యాడ్ అయ్యింది! 🚩");
      }
      
      resetForm(); fetchData();
    } catch (e) { alert("Error: " + e.message); }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ name: '', capital: '', img: '', zoneId: 'z1' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("ఈ రాష్ట్రాన్ని డిలీట్ చేయమంటావా బాసు?")) {
      await deleteDoc(doc(db, "States", id));
      fetchData();
    }
  };

  // Search filter
  const filteredStates = states.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={sStyles.container}>
      <div style={sStyles.layout}>
        
        {/* 🛠️ LEFT: FORM CARD */}
        <div style={sStyles.formSide}>
          <div style={sStyles.card}>
            <div style={sStyles.cardHeader}>
              <Map size={22} color="#FF7A00" />
              <h3 style={{margin: 0}}>{isEditing ? "Edit State" : "Add New State"}</h3>
            </div>
            
            <div style={sStyles.formBody}>
              <label style={sStyles.label}>State Name</label>
              <input style={sStyles.input} value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} placeholder="Ex: Telangana" />

              <label style={sStyles.label}>Capital City</label>
              <input style={sStyles.input} value={formData.capital} onChange={e=>setFormData({...formData, capital:e.target.value})} placeholder="Ex: Hyderabad" />

              <label style={sStyles.label}>Zone Selection</label>
              <select style={sStyles.input} value={formData.zoneId} onChange={e=>setFormData({...formData, zoneId:e.target.value})}>
                {Object.keys(zoneMapping).map(z => <option key={z} value={zoneMapping[z]}>{z}</option>)}
              </select>

              <label style={sStyles.label}>Cover Image URL</label>
              <input style={sStyles.input} value={formData.img} onChange={e=>setFormData({...formData, img:e.target.value})} placeholder="https://..." />

              <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                <button onClick={handleSave} style={sStyles.saveBtn}>{isEditing ? "Update State" : "Add State"}</button>
                {isEditing && <button onClick={resetForm} style={sStyles.cancelBtn}>Cancel</button>}
              </div>
            </div>
          </div>
        </div>

        {/* 📊 RIGHT: STATES DISPLAY */}
        <div style={sStyles.listSide}>
          <div style={sStyles.searchWrap}>
            <Search size={18} color="#94A3B8" />
            <input style={sStyles.searchInput} placeholder="Search states..." onChange={e => setSearchTerm(e.target.value)} />
          </div>

          <div style={sStyles.statesGrid}>
            {filteredStates.map(st => (
              <div key={st.id} style={sStyles.stateCard}>
                <img src={st.img || 'https://via.placeholder.com/300x150'} style={sStyles.stateImg} alt="" />
                <div style={sStyles.overlay}>
                  <div style={{flex: 1}}>
                    <div style={sStyles.stName}>{st.name}</div>
                    <div style={sStyles.stCap}>{st.capital}</div>
                  </div>
                  <div style={sStyles.actions}>
                    <button onClick={() => {
                      setFormData(st);
                      setCurrentId(st.id);
                      setIsEditing(true);
                      window.scrollTo({top: 0, behavior: 'smooth'});
                    }} style={sStyles.actionBtn}><Edit3 size={14}/></button>
                    <button onClick={() => handleDelete(st.id)} style={{...sStyles.actionBtn, color: '#FCA5A5'}}><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const sStyles = {
  container: { animation: 'fadeIn 0.4s ease-in' },
  layout: { display: 'grid', gridTemplateColumns: window.innerWidth <= 1024 ? '1fr' : '380px 1fr', gap: '30px' },
  
  // Form Styles
  formSide: { position: 'sticky', top: '20px', height: 'fit-content' },
  card: { backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', overflow: 'hidden' },
  cardHeader: { padding: '20px 25px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '12px' },
  formBody: { padding: '25px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' },
  input: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '15px', outline: 'none', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' },
  saveBtn: { flex: 1, backgroundColor: '#0F172A', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' },
  cancelBtn: { backgroundColor: '#F1F5F9', color: '#64748B', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' },

  // List Styles
  listSide: { display: 'flex', flexDirection: 'column', gap: '20px' },
  searchWrap: { backgroundColor: '#fff', padding: '15px 25px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #E2E8F0' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '15px', fontWeight: '600' },
  statesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' },
  stateCard: { height: '160px', borderRadius: '20px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  stateImg: { width: '100%', height: '100%', objectFit: 'cover' },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '15px', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', display: 'flex', alignItems: 'center' },
  stName: { color: '#fff', fontWeight: '800', fontSize: '16px' },
  stCap: { color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600' },
  actions: { display: 'flex', gap: '8px' },
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer' }
};