import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { 
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, writeBatch 
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit3, Trash2, MapPin, Layers, LogOut, 
  ChevronDown, ChevronRight, Search, Sparkles, CheckSquare, Square, Youtube, Navigation 
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [expandedZones, setExpandedZones] = useState({ "South India": true });
  const [selectedItems, setSelectedItems] = useState([]);

  const [formData, setFormData] = useState({
    name: '', state: '', zone: 'South India', category: 'Hidden Gems', 
    history: '', mystery: '', img: '', location: '', nearby_attractions: '', 
    rentora_suitable: 'No', is_hidden_gem: false, yt_link: ''
  });

  const zones = ['South India', 'North India', 'West India', 'East India', '💎 Hidden Gems'];

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') navigate('/login');
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pSnap = await getDocs(collection(db, "Places"));
      const gSnap = await getDocs(collection(db, "HiddenGems"));
      const combined = [
        ...pSnap.docs.map(d => ({ id: d.id, ...d.data(), is_hidden_gem: false })),
        ...gSnap.docs.map(d => ({ id: d.id, ...d.data(), is_hidden_gem: true }))
      ];
      setPlaces(combined);
    } catch (e) { console.error("Fetch Error:", e); }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.state) return alert("పేరు మరియు రాష్ట్రం తప్పనిసరి బొస్సు!");
    
    // 🔥 రాజస్థాన్ ఇష్యూ ఫిక్స్: సేవ్ చేసేటప్పుడే మనం సెలెక్ట్ చేసిన జోన్ ని పక్కాగా పంపిస్తున్నాం
    const targetCol = formData.is_hidden_gem ? "HiddenGems" : "Places";
    const dataToSave = {
      ...formData,
      zone: formData.is_hidden_gem ? "North India" : formData.zone // Hidden Gems కి డీఫాల్ట్ జోన్
    };

    try {
      if (isEditing) {
        await updateDoc(doc(db, targetCol, currentId), dataToSave);
        alert("అప్‌డేట్ అయ్యింది! ✅");
      } else {
        await addDoc(collection(db, targetCol), dataToSave);
        alert("యాడ్ అయ్యింది! 🚀");
      }
      resetForm();
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const resetForm = () => {
    setFormData({ name: '', state: '', zone: 'South India', category: 'Hidden Gems', history: '', mystery: '', img: '', location: '', nearby_attractions: '', rentora_suitable: 'No', is_hidden_gem: false, yt_link: '' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const toggleZone = (z) => setExpandedZones(prev => ({ ...prev, [z]: !prev[z] }));

  const handleDelete = async (id, isGem) => {
    if (window.confirm("డిలీట్ చేయమంటావా బాస్?")) {
      await deleteDoc(doc(db, isGem ? "HiddenGems" : "Places", id));
      fetchData();
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`${selectedItems.length} ఐటమ్స్ డిలీట్ చేయమంటావా?`)) return;
    const batch = writeBatch(db);
    selectedItems.forEach(id => {
      const item = places.find(p => p.id === id);
      batch.delete(doc(db, item.is_hidden_gem ? "HiddenGems" : "Places", id));
    });
    await batch.commit();
    setSelectedItems([]);
    fetchData();
  };

  // --- 🔥 అసలైన రాజస్థాన్ జోన్ ఫిక్స్ ఇక్కడ ఉంది ---
  const getFilteredItems = (zoneName) => {
    return places.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.state.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (zoneName === '💎 Hidden Gems') return p.is_hidden_gem && matchesSearch;
      
      // పక్కాగా జోన్ మ్యాచ్ అవ్వాలి + అది హిడెన్ జెమ్ కాకూడదు
      const pZone = p.zone || 'South India'; 
      return pZone === zoneName && !p.is_hidden_gem && matchesSearch;
    });
  };

  if (loading) return <div style={styles.loader}>మాస్టర్ డేటా లోడ్ అవుతోంది... ⏳</div>;

  return (
    <div style={styles.container}>
      {/* TOP BAR */}
      <div style={styles.nav}>
        <div style={styles.brand}><Layers color="#FF7A00" size={28} /> <h2>Darshika <span style={{color: '#94A3B8'}}>CMS</span></h2></div>
        <div style={styles.searchWrap}>
          <Search size={18} color="#94A3B8" />
          <input placeholder="వెతకండి బాస్ (Place or State)..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.search} />
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={styles.logout}><LogOut size={18} /></button>
      </div>

      <div style={styles.wrapper}>
        {/* SIDE FORM */}
        <div style={styles.formSide}>
          <div style={styles.card}>
            <h3 style={{margin: 0, color: '#0F4C81'}}>{isEditing ? "✏️ Edit Gem" : "➕ Add New Gem"}</h3>
            <div style={styles.formGrid}>
              <input placeholder="Place Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.input} />
              <input placeholder="State (e.g. Rajasthan)" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} style={styles.input} />
              <select value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} style={styles.input}>
                {zones.filter(z => z !== '💎 Hidden Gems').map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <select value={formData.is_hidden_gem} onChange={e => setFormData({...formData, is_hidden_gem: e.target.value === 'true'})} style={styles.input}>
                <option value="false">Regular Place</option>
                <option value="true">Hidden Gem 💎</option>
              </select>
              <input placeholder="Image URL" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} style={styles.input} />
              <input placeholder="YouTube Link" value={formData.yt_link} onChange={e => setFormData({...formData, yt_link: e.target.value})} style={styles.input} />
            </div>
            <textarea placeholder="Mystery / History (Telugu)" value={formData.history} style={styles.textarea} onChange={e => setFormData({...formData, history: e.target.value})} />
            <input placeholder="Nearby Attractions" value={formData.nearby_attractions} style={styles.input} onChange={e => setFormData({...formData, nearby_attractions: e.target.value})} />
            
            <div style={styles.btnRow}>
              <button onClick={handleSave} style={styles.saveBtn}>{isEditing ? "Update Database" : "Publish to App"}</button>
              {isEditing && <button onClick={resetForm} style={styles.cancelBtn}>Cancel</button>}
            </div>
          </div>
        </div>

        {/* DATA LIST (ACCORDION) */}
        <div style={styles.listSide}>
          <div style={styles.listHead}>
            <h4 style={{margin: 0}}>Organized Database</h4>
            {selectedItems.length > 0 && <button onClick={handleBulkDelete} style={styles.bulkBtn}>Delete Selected ({selectedItems.length})</button>}
          </div>

          {zones.map(zone => {
            const items = getFilteredItems(zone);
            return (
              <div key={zone} style={styles.accordion}>
                <div onClick={() => toggleZone(zone)} style={styles.accHead}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    {expandedZones[zone] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <span style={{fontWeight: '800', fontSize: '16px'}}>{zone}</span>
                    <span style={styles.badge}>{items.length}</span>
                  </div>
                </div>

                {expandedZones[zone] && (
                  <div style={styles.accBody}>
                    {items.map(item => (
                      <div key={item.id} style={styles.itemRow}>
                        <div onClick={() => setSelectedItems(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} style={{cursor: 'pointer'}}>
                          {selectedItems.includes(item.id) ? <CheckSquare size={20} color="#FF7A00" /> : <Square size={20} color="#CBD5E1" />}
                        </div>
                        <img src={item.img} style={styles.thumb} alt="" />
                        <div style={{flex: 1}}>
                          <div style={{fontWeight: '700', fontSize: '14px'}}>{item.name}</div>
                          <div style={{fontSize: '11px', color: '#64748B'}}>{item.state} | {item.location}</div>
                        </div>
                        <div style={{display: 'flex', gap: '10px'}}>
                          <button onClick={() => { setFormData(item); setCurrentId(item.id); setIsEditing(true); window.scrollTo(0,0); }} style={styles.iconBtn}><Edit3 size={18}/></button>
                          <button onClick={() => handleDelete(item.id, item.is_hidden_gem)} style={styles.iconBtnRed}><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#F1F5F9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5%', backgroundColor: '#fff', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 100 },
  brand: { display: 'flex', alignItems: 'center', gap: '10px' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F8FAFC', padding: '10px 20px', borderRadius: '15px', border: '1px solid #E2E8F0', flex: 0.5 },
  search: { border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '14px' },
  logout: { backgroundColor: '#FEE2E2', border: 'none', padding: '10px', borderRadius: '10px', color: '#EF4444', cursor: 'pointer' },
  wrapper: { display: 'grid', gridTemplateColumns: '400px 1fr', gap: '30px', padding: '30px 5%' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'sticky', top: '100px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' },
  input: { padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', backgroundColor: '#F8FAFC', outline: 'none' },
  textarea: { width: '100%', height: '100px', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '10px', boxSizing: 'border-box', fontFamily: 'inherit', backgroundColor: '#F8FAFC', outline: 'none' },
  saveBtn: { flex: 1, backgroundColor: '#0F4C81', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { backgroundColor: '#94A3B8', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', cursor: 'pointer', marginLeft: '10px' },
  btnRow: { display: 'flex' },
  listHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  bulkBtn: { backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  accordion: { backgroundColor: '#fff', borderRadius: '20px', marginBottom: '15px', border: '1px solid #E2E8F0', overflow: 'hidden' },
  accHead: { padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  badge: { backgroundColor: '#F1F5F9', padding: '2px 10px', borderRadius: '10px', fontSize: '12px', color: '#64748B' },
  accBody: { padding: '0 20px 20px 20px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 0', borderBottom: '1px solid #F8FAFC' },
  thumb: { width: '45px', height: '45px', borderRadius: '10px', objectFit: 'cover' },
  iconBtn: { background: 'none', border: 'none', color: '#0F4C81', cursor: 'pointer' },
  iconBtnRed: { background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' },
  loader: { textAlign: 'center', padding: '100px', fontSize: '20px', fontWeight: 'bold' }
};