import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch 
} from 'firebase/firestore';
import { 
  Edit3, Trash2, ChevronDown, ChevronRight, Search, 
  PlusCircle, MapPin, Image as ImageIcon, CheckCircle2, XCircle, CheckSquare, Square
} from 'lucide-react';

export default function PlacesTab() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [expandedZones, setExpandedZones] = useState({ "South India": true });
  
  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState([]);

  const [formData, setFormData] = useState({
    name: '', state: '', zone: 'South India', history: '', img: '', is_hidden_gem: false
  });

  const zones = ['South India', 'North India', 'West India', 'East India', '💎 Hidden Gems'];

  useEffect(() => { fetchData(); }, []);

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

  // --- SAVE LOGIC (Fixed Undefined Error) ---
  const handleSave = async () => {
    if (!formData.name || !formData.state) return alert("పేరు మరియు రాష్ట్రం తప్పనిసరి!");
    
    setLoading(true);
    try {
      const targetCol = formData.is_hidden_gem ? "HiddenGems" : "Places";
      
      // 🛡️ Safe Data Object (Undefined రాకుండా చెక్ చేస్తుంది)
      const dataToSave = {
        name: formData.name || "",
        state: formData.state || "",
        zone: formData.zone || "South India", // ఇక్కడ undefined రాకుండా డిఫాల్ట్ ఇచ్చాను
        history: formData.history || "",
        img: formData.img || "",
        is_hidden_gem: !!formData.is_hidden_gem
      };

      if (isEditing) {
        await updateDoc(doc(db, targetCol, currentId), dataToSave);
        alert("అప్‌డేట్ అయ్యింది! ✅");
      } else {
        await addDoc(collection(db, targetCol), dataToSave);
        alert("సేవ్ అయ్యింది! 🚀");
      }
      
      resetForm(); fetchData();
    } catch (e) { 
      console.error(e);
      alert("Save Error: " + e.message); 
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ name: '', state: '', zone: 'South India', history: '', img: '', is_hidden_gem: false });
    setIsEditing(false);
    setCurrentId(null);
    setSelectedIds([]);
  };

  // --- BULK DELETE LOGIC ---
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`${selectedIds.length} ఐటమ్స్ డిలీట్ చేయమంటావా బాసు?`)) {
      setLoading(true);
      const batch = writeBatch(db);
      
      selectedIds.forEach(obj => {
        const col = obj.isGem ? "HiddenGems" : "Places";
        batch.delete(doc(db, col, obj.id));
      });

      await batch.commit();
      alert("బల్క్ డిలీట్ సక్సెస్! 🔥");
      setSelectedIds([]);
      fetchData();
    }
  };

  const toggleSelect = (id, isGem) => {
    const isAlreadySelected = selectedIds.find(item => item.id === id);
    if (isAlreadySelected) {
      setSelectedIds(selectedIds.filter(item => item.id !== id));
    } else {
      setSelectedIds([...selectedIds, { id, isGem }]);
    }
  };

  const selectAllInZone = (zoneItems) => {
    const zoneIds = zoneItems.map(item => ({ id: item.id, isGem: item.is_hidden_gem }));
    // ఒకవేళ అన్నీ ఆల్రెడీ సెలెక్ట్ అయి ఉంటే, అన్-సెలెక్ట్ చెయ్
    const allSelected = zoneIds.every(zi => selectedIds.find(si => si.id === zi.id));
    
    if (allSelected) {
      setSelectedIds(selectedIds.filter(si => !zoneIds.find(zi => zi.id === si.id)));
    } else {
      const newSelection = [...selectedIds];
      zoneIds.forEach(zi => {
        if (!newSelection.find(si => si.id === zi.id)) newSelection.push(zi);
      });
      setSelectedIds(newSelection);
    }
  };

  const getFilteredItems = (zoneName) => {
    return places.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.state.toLowerCase().includes(searchTerm.toLowerCase());
      if (zoneName === '💎 Hidden Gems') return p.is_hidden_gem && matchSearch;
      return (p.zone || 'South India') === zoneName && !p.is_hidden_gem && matchSearch;
    });
  };

  return (
    <div style={pStyles.grid}>
      {/* 🛠️ LEFT: FORM */}
      <div style={pStyles.formCard}>
        <div style={pStyles.cardHeader}>
          <PlusCircle size={22} color="#FF7A00" />
          <h3 style={{margin:0}}>{isEditing ? "Edit Place" : "New Entry"}</h3>
        </div>

        <div style={pStyles.formBody}>
          <label style={pStyles.label}>Name</label>
          <input style={pStyles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          
          <div style={{display:'flex', gap:'10px'}}>
            <div style={{flex:1}}>
              <label style={pStyles.label}>State</label>
              <input style={pStyles.input} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
            </div>
            <div style={{flex:1}}>
              <label style={pStyles.label}>Zone</label>
              <select style={pStyles.input} value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})}>
                {zones.filter(z => z !== '💎 Hidden Gems').map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          </div>

          <label style={pStyles.label}>Image URL</label>
          <input style={pStyles.input} value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} />

          <label style={pStyles.label}>History</label>
          <textarea style={{...pStyles.input, height:'80px'}} value={formData.history} onChange={e => setFormData({...formData, history: e.target.value})} />

          <div style={pStyles.gemToggle} onClick={() => setFormData({...formData, is_hidden_gem: !formData.is_hidden_gem})}>
            <span>Is Hidden Gem? 💎</span>
            {formData.is_hidden_gem ? <CheckCircle2 color="#FF7A00" /> : <XCircle color="#CBD5E1" />}
          </div>

          <button onClick={handleSave} style={pStyles.saveBtn}>{isEditing ? "Update Database" : "Save Entry"}</button>
          {isEditing && <button onClick={resetForm} style={pStyles.cancelBtn}>Cancel</button>}
        </div>
      </div>

      {/* 📊 RIGHT: LIST & BULK ACTIONS */}
      <div style={pStyles.listArea}>
        <div style={pStyles.topActions}>
          <div style={pStyles.searchCard}>
            <Search size={18} color="#94A3B8" />
            <input style={pStyles.searchInput} placeholder="Search database..." onChange={e => setSearchTerm(e.target.value)} />
          </div>
          {selectedIds.length > 0 && (
            <button onClick={handleBulkDelete} style={pStyles.bulkDelBtn}>
              <Trash2 size={16} /> Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>

        {zones.map(zone => {
          const items = getFilteredItems(zone);
          return (
            <div key={zone} style={pStyles.zoneBox}>
              <div style={pStyles.zoneHeader}>
                <div onClick={() => setExpandedZones(p => ({...p, [zone]: !p[zone]}))} style={{display:'flex', alignItems:'center', gap:'10px', flex:1, cursor:'pointer'}}>
                  {expandedZones[zone] ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                  <span style={{fontWeight:'800'}}>{zone}</span>
                </div>
                <button onClick={() => selectAllInZone(items)} style={pStyles.selectAllBtn}>Select All</button>
              </div>
              
              {expandedZones[zone] && items.map(item => (
                <div key={item.id} style={{...pStyles.itemRow, backgroundColor: selectedIds.find(si => si.id === item.id) ? '#FFF7ED' : 'transparent'}}>
                  <div onClick={() => toggleSelect(item.id, item.is_hidden_gem)} style={{cursor:'pointer'}}>
                    {selectedIds.find(si => si.id === item.id) ? <CheckSquare size={20} color="#FF7A00" /> : <Square size={20} color="#CBD5E1" />}
                  </div>
                  <img src={item.img} style={pStyles.thumb} alt="" />
                  <div style={{flex:1}}>
                    <div style={{fontWeight:'700', fontSize:'14px'}}>{item.name}</div>
                    <div style={{fontSize:'12px', color:'#94A3B8'}}>{item.state}</div>
                  </div>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button onClick={() => {setFormData(item); setCurrentId(item.id); setIsEditing(true); window.scrollTo(0,0);}} style={pStyles.iconBtn}><Edit3 size={15}/></button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- STYLES ---
const pStyles = {
  grid: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '25px' },
  formCard: { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #E2E8F0', position: 'sticky', top: '20px', height: 'fit-content' },
  cardHeader: { padding: '20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '10px' },
  formBody: { padding: '20px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '5px', textTransform: 'uppercase' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '15px', boxSizing: 'border-box', outline: 'none', fontWeight: '600' },
  gemToggle: { display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '12px', cursor: 'pointer', marginBottom: '20px', fontWeight: '700' },
  saveBtn: { width: '100%', padding: '15px', backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '800' },
  cancelBtn: { width: '100%', padding: '12px', backgroundColor: '#F1F5F9', color: '#64748B', borderRadius: '12px', border: 'none', cursor: 'pointer', marginTop: '10px' },
  listArea: { display: 'flex', flexDirection: 'column', gap: '15px' },
  topActions: { display: 'flex', gap: '15px', alignItems: 'center' },
  searchCard: { flex: 1, backgroundColor: '#fff', padding: '12px 20px', borderRadius: '15px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontWeight: '600' },
  bulkDelBtn: { backgroundColor: '#EF4444', color: '#fff', padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' },
  zoneBox: { backgroundColor: '#fff', borderRadius: '15px', border: '1px solid #E2E8F0', overflow: 'hidden' },
  zoneHeader: { padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' },
  selectAllBtn: { border: 'none', background: 'none', color: '#3B82F6', fontWeight: '700', cursor: 'pointer', fontSize: '12px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 20px', borderBottom: '1px solid #F8FAFC' },
  thumb: { width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' },
  iconBtn: { border: 'none', backgroundColor: '#F1F5F9', padding: '8px', borderRadius: '8px', cursor: 'pointer' }
};