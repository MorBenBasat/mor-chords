import { useState, useEffect, useRef } from "react";

const CHORD_DB = {
  C: { fingers: [[1,0],[2,1],[3,0],[4,2],[5,3]], barres: [], muted: [6], open: [1,3], notes: "X 3 2 0 1 0" },
  D: { fingers: [[1,2],[2,3],[3,2]], barres: [], muted: [5,6], open: [4], notes: "X X 0 2 3 2" },
  Em: { fingers: [[4,2],[5,2]], barres: [], muted: [], open: [1,2,3,6], notes: "0 2 2 0 0 0" },
  G: { fingers: [[1,3],[5,2],[6,3]], barres: [], muted: [], open: [2,3,4], notes: "3 2 0 0 0 3" },
  Am: { fingers: [[2,1],[3,2],[4,2]], barres: [], muted: [6], open: [1,5], notes: "X 0 2 2 1 0" },
  E: { fingers: [[3,1],[4,2],[5,2]], barres: [], muted: [], open: [1,2,6], notes: "0 2 2 1 0 0" },
  F: { fingers: [[2,1],[3,2],[4,3]], barres: [{from:1,to:6,fret:1}], muted: [], open: [], notes: "1 3 3 2 1 1" },
  Dm: { fingers: [[1,1],[2,3],[3,2]], barres: [], muted: [5,6], open: [4], notes: "X X 0 2 3 1" },
  A: { fingers: [[2,2],[3,2],[4,2]], barres: [], muted: [6], open: [1,5], notes: "X 0 2 2 2 0" },
  Bm: { fingers: [[3,4],[4,4],[5,3]], barres: [{from:1,to:5,fret:2}], muted: [6], open: [], notes: "X 2 4 4 3 2" },
};

const SONGS = [
  { id: 1, title: "תגידי מילה", artist: "עומר אדם", chords: ["D", "Em", "C"], difficulty: "קל", color: "#FF6B35" },
  { id: 2, title: "מישהי", artist: "שטיפלד", chords: ["G", "Em", "C", "D"], difficulty: "קל", color: "#4ECDC4" },
  { id: 3, title: "יש בי אהבה", artist: "אייל גולן", chords: ["Am", "F", "C", "G"], difficulty: "בינוני", color: "#FF4081" },
  { id: 4, title: "בא לי", artist: "עידן רפאל חביב", chords: ["Em", "C", "G", "D"], difficulty: "קל", color: "#7C4DFF" },
  { id: 5, title: "אהבתיה", artist: "עומר אדם", chords: ["Am", "Dm", "G", "C"], difficulty: "קל", color: "#FF9100" },
  { id: 6, title: "שוב הלב שלי", artist: "אייל גולן", chords: ["Am", "E", "F", "G"], difficulty: "בינוני", color: "#00BFA5" },
  { id: 7, title: "מלך העולם", artist: "עידן רפאל חביב", chords: ["G", "D", "Em", "C"], difficulty: "קל", color: "#E040FB" },
  { id: 8, title: "טירוף", artist: "נועה קירל", chords: ["Am", "F", "C", "G"], difficulty: "קל", color: "#FF5252" },
];

function ChordDiagram({ name, size = 120 }) {
  const chord = CHORD_DB[name];
  if (!chord) return null;

  const w = size;
  const h = size * 1.3;
  const startX = w * 0.2;
  const endX = w * 0.8;
  const startY = h * 0.18;
  const endY = h * 0.88;
  const stringSpacing = (endX - startX) / 5;
  const fretSpacing = (endY - startY) / 5;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <text x={w/2} y={h*0.1} textAnchor="middle" fill="#F5E6D3" fontSize={size*0.16} fontFamily="'Instrument Serif', serif" fontWeight="400">{name}</text>
      
      {/* Nut */}
      <line x1={startX} y1={startY} x2={endX} y2={startY} stroke="#F5E6D3" strokeWidth={3} strokeLinecap="round"/>
      
      {/* Strings */}
      {[0,1,2,3,4,5].map(i => (
        <line key={`s${i}`} x1={startX + i*stringSpacing} y1={startY} x2={startX + i*stringSpacing} y2={endY} stroke="#F5E6D3" strokeWidth={0.8} opacity={0.5}/>
      ))}
      
      {/* Frets */}
      {[0,1,2,3,4,5].map(i => (
        <line key={`f${i}`} x1={startX} y1={startY + i*fretSpacing} x2={endX} y2={startY + i*fretSpacing} stroke="#F5E6D3" strokeWidth={0.6} opacity={0.3}/>
      ))}

      {/* Barres */}
      {chord.barres.map((b, i) => (
        <rect key={`b${i}`} x={startX + (b.from-1)*stringSpacing - stringSpacing*0.15} y={startY + (b.fret-0.5)*fretSpacing - fretSpacing*0.25} 
              width={(b.to - b.from)*stringSpacing + stringSpacing*0.3} height={fretSpacing*0.5} rx={fretSpacing*0.25} fill="#FF6B35"/>
      ))}

      {/* Fingers */}
      {chord.fingers.map((f, i) => (
        <circle key={`d${i}`} cx={startX + (f[0]-1)*stringSpacing} cy={startY + (f[1]-0.5)*fretSpacing} r={size*0.055} fill="#FF6B35"/>
      ))}

      {/* Open / Muted */}
      {chord.open && chord.open.map(s => (
        <circle key={`o${s}`} cx={startX + (s-1)*stringSpacing} cy={startY - size*0.06} r={size*0.035} fill="none" stroke="#F5E6D3" strokeWidth={1.2}/>
      ))}
      {chord.muted && chord.muted.map(s => (
        <text key={`m${s}`} x={startX + (s-1)*stringSpacing} y={startY - size*0.03} textAnchor="middle" fill="#F5E6D3" fontSize={size*0.1} opacity={0.6}>×</text>
      ))}
    </svg>
  );
}

function SongCard({ song, onClick, index }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div onClick={onClick} style={{
      background: `linear-gradient(135deg, ${song.color}15, ${song.color}08)`,
      border: `1px solid ${song.color}30`,
      borderRadius: 16,
      padding: "18px 20px",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.01)"; e.currentTarget.style.borderColor = song.color + "60"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.borderColor = song.color + "30"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ direction: "rtl", textAlign: "right" }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#F5E6D3", fontFamily: "'Heebo', sans-serif", marginBottom: 4 }}>{song.title}</div>
          <div style={{ fontSize: 13, color: "#F5E6D3", opacity: 0.6, fontFamily: "'Heebo', sans-serif" }}>{song.artist}</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {song.chords.map(c => (
            <span key={c} style={{
              background: song.color + "25",
              color: song.color,
              padding: "4px 10px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Instrument Serif', serif",
            }}>{c}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <span style={{
          fontSize: 11,
          color: song.difficulty === "קל" ? "#4ECDC4" : "#FFB74D",
          background: song.difficulty === "קל" ? "#4ECDC420" : "#FFB74D20",
          padding: "2px 10px",
          borderRadius: 20,
          fontFamily: "'Heebo', sans-serif",
        }}>{song.difficulty}</span>
        <span style={{ fontSize: 12, color: "#F5E6D3", opacity: 0.3, fontFamily: "'Heebo', sans-serif" }}>{song.chords.length} אקורדים</span>
      </div>
    </div>
  );
}

function SongView({ song, onBack }) {
  const [activeChord, setActiveChord] = useState(0);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: "#F5E6D3", opacity: 0.6,
        cursor: "pointer", fontSize: 15, fontFamily: "'Heebo', sans-serif",
        display: "flex", alignItems: "center", gap: 6, marginBottom: 20, padding: 0,
      }}>
        → חזרה לשירים
      </button>

      <div style={{ textAlign: "center", direction: "rtl", marginBottom: 30 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 14,
          background: `linear-gradient(135deg, ${song.color}, ${song.color}80)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: 28,
        }}>🎸</div>
        <h2 style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", fontSize: 26, margin: 0, fontWeight: 700 }}>{song.title}</h2>
        <p style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", opacity: 0.5, margin: "6px 0 0", fontSize: 15 }}>{song.artist}</p>
      </div>

      {/* Chord selector pills */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 30, flexWrap: "wrap" }}>
        {song.chords.map((c, i) => (
          <button key={c} onClick={() => setActiveChord(i)} style={{
            background: i === activeChord ? song.color : song.color + "15",
            color: i === activeChord ? "#1A1A2E" : song.color,
            border: `1.5px solid ${i === activeChord ? song.color : song.color + "40"}`,
            borderRadius: 12, padding: "10px 22px", cursor: "pointer",
            fontSize: 18, fontWeight: 600, fontFamily: "'Instrument Serif', serif",
            transition: "all 0.25s ease",
          }}>{c}</button>
        ))}
      </div>

      {/* Active chord diagram */}
      <div style={{
        display: "flex", justifyContent: "center",
        background: "#ffffff06", borderRadius: 20, padding: 30,
        border: "1px solid #ffffff0a",
      }}>
        <ChordDiagram name={song.chords[activeChord]} size={180} />
      </div>

      {/* All chords overview */}
      <div style={{ marginTop: 30 }}>
        <p style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", opacity: 0.4, fontSize: 13, textAlign: "center", marginBottom: 16 }}>כל האקורדים בשיר</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          {song.chords.map((c, i) => (
            <div key={c} onClick={() => setActiveChord(i)} style={{
              cursor: "pointer",
              opacity: i === activeChord ? 1 : 0.5,
              transition: "all 0.25s ease",
              transform: i === activeChord ? "scale(1.05)" : "scale(1)",
            }}>
              <ChordDiagram name={c} size={100} />
            </div>
          ))}
        </div>
      </div>

      {/* Progression */}
      <div style={{
        marginTop: 30, padding: 20, background: "#ffffff06",
        borderRadius: 16, border: "1px solid #ffffff0a", textAlign: "center",
      }}>
        <p style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", opacity: 0.4, fontSize: 12, margin: "0 0 10px" }}>סדר נגינה</p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {song.chords.map((c, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontFamily: "'Instrument Serif', serif", fontSize: 22, color: song.color,
                fontWeight: 600,
              }}>{c}</span>
              {i < song.chords.length - 1 && <span style={{ color: "#F5E6D3", opacity: 0.2, fontSize: 18 }}>→</span>}
            </span>
          ))}
          <span style={{ color: "#F5E6D3", opacity: 0.2, fontSize: 14, marginRight: 6, fontFamily: "'Heebo', sans-serif" }}>🔁</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedSong, setSelectedSong] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredSongs = SONGS.filter(s => {
    const matchSearch = s.title.includes(searchQuery) || s.artist.includes(searchQuery) || s.chords.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchFilter = filter === "all" || s.difficulty === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
      fontFamily: "'Heebo', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(2deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.03; } 50% { opacity: 0.07; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #F5E6D380; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ffffff15; border-radius: 4px; }
      `}</style>

      {/* Background decorations */}
      <div style={{
        position: "fixed", top: -100, right: -100, width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, #FF6B3508, transparent)",
        animation: "pulse 6s ease infinite", pointerEvents: "none",
      }}/>
      <div style={{
        position: "fixed", bottom: -150, left: -100, width: 500, height: 500,
        borderRadius: "50%", background: "radial-gradient(circle, #4ECDC408, transparent)",
        animation: "pulse 8s ease infinite 2s", pointerEvents: "none",
      }}/>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
        
        {/* Header */}
        <div style={{ paddingTop: 50, paddingBottom: 30, textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #FF6B35, #FF8F60)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px #FF6B3540",
            animation: "float 6s ease-in-out infinite",
          }}>
            <span style={{ fontSize: 36 }}>🎸</span>
          </div>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 32, color: "#F5E6D3", fontWeight: 400, letterSpacing: -0.5,
            marginBottom: 4,
          }}>
            mor<span style={{ color: "#FF6B35" }}>.</span>chords
          </h1>
          <p style={{
            fontSize: 13, color: "#F5E6D3", opacity: 0.4, fontWeight: 300,
            letterSpacing: 2, textTransform: "uppercase",
          }}>@morbenbasat</p>
          <p style={{
            fontSize: 14, color: "#F5E6D3", opacity: 0.5, marginTop: 10,
            lineHeight: 1.6, direction: "rtl",
          }}>שירים קלים לגיטרה 🎶 אקורדים פשוטים לכולם</p>

          {/* Social link */}
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 10 }}>
            <a href="https://www.tiktok.com/@morbenbasat" target="_blank" rel="noopener" style={{
              background: "#ffffff0a", border: "1px solid #ffffff15",
              borderRadius: 12, padding: "8px 20px", color: "#F5E6D3",
              textDecoration: "none", fontSize: 13, fontFamily: "'Heebo', sans-serif",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.25s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#ffffff15"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ffffff0a"; }}
            >
              TikTok ♪
            </a>
          </div>
        </div>

        {selectedSong ? (
          <SongView song={selectedSong} onBack={() => setSelectedSong(null)} />
        ) : (
          <>
            {/* Search */}
            <div style={{ marginBottom: 20 }}>
              <input
                type="text"
                placeholder="🔍 חיפוש שיר, זמר או אקורד..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "14px 18px", borderRadius: 14,
                  border: "1px solid #ffffff12", background: "#ffffff08",
                  color: "#F5E6D3", fontSize: 15, fontFamily: "'Heebo', sans-serif",
                  direction: "rtl", outline: "none",
                  transition: "border-color 0.25s ease",
                }}
                onFocus={e => e.target.style.borderColor = "#FF6B3540"}
                onBlur={e => e.target.style.borderColor = "#ffffff12"}
              />
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, justifyContent: "center" }}>
              {[["all", "הכל"], ["קל", "קל"], ["בינוני", "בינוני"]].map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)} style={{
                  background: filter === val ? "#FF6B35" : "#ffffff0a",
                  color: filter === val ? "#1A1A2E" : "#F5E6D3",
                  border: "1px solid " + (filter === val ? "#FF6B35" : "#ffffff15"),
                  borderRadius: 10, padding: "7px 18px", cursor: "pointer",
                  fontSize: 13, fontFamily: "'Heebo', sans-serif", fontWeight: 500,
                  transition: "all 0.25s ease",
                }}>{label}</button>
              ))}
            </div>

            {/* Song count */}
            <p style={{
              textAlign: "center", fontSize: 12, color: "#F5E6D3", opacity: 0.3,
              marginBottom: 16, direction: "rtl",
            }}>{filteredSongs.length} שירים</p>

            {/* Songs list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 40 }}>
              {filteredSongs.map((song, i) => (
                <SongCard key={song.id} song={song} index={i} onClick={() => setSelectedSong(song)} />
              ))}
              {filteredSongs.length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: "#F5E6D3", opacity: 0.3, direction: "rtl" }}>
                  <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>🎵</span>
                  לא נמצאו שירים
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{
          textAlign: "center", padding: "30px 0 40px",
          borderTop: "1px solid #ffffff08",
        }}>
          <p style={{ fontSize: 11, color: "#F5E6D3", opacity: 0.2, fontFamily: "'Instrument Serif', serif" }}>
            mor.chords — built with 🎸
          </p>
        </div>
      </div>
    </div>
  );
}
