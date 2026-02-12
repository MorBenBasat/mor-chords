import { useState, useEffect } from "react";
import { CHORD_DB } from "./data/chords";
import { artists } from "./data/artists";

// ===== פונקציות עזר =====

// שליפת כל האקורדים מתוך טקסט מילים
function extractChords(lyrics) {
  const matches = lyrics.match(/\[([A-Za-z0-9#]+)\]/g);
  if (!matches) return [];
  const unique = [...new Set(matches.map(m => m.slice(1, -1)))];
  return unique;
}

// פירוק שורת מילים לחלקים של אקורד+טקסט
function parseLine(line) {
  const parts = [];
  const regex = /\[([A-Za-z0-9#]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: line.slice(lastIndex, match.index), chord: null });
    }
    const chordEnd = regex.lastIndex;
    const nextMatch = regex.exec(line);
    const textEnd = nextMatch ? nextMatch.index : line.length;
    regex.lastIndex = chordEnd;
    parts.push({ chord: match[1], text: line.slice(chordEnd, textEnd) });
    lastIndex = textEnd;
  }

  if (lastIndex < line.length) {
    parts.push({ text: line.slice(lastIndex), chord: null });
  }
  if (parts.length === 0 && line.length > 0) {
    parts.push({ text: line, chord: null });
  }

  return parts;
}

// ===== קומפוננטות =====

function ChordDiagram({ name, size = 120 }) {
  const chord = CHORD_DB[name];
  if (!chord) return <div style={{ textAlign: "center", color: "#FF6B35", fontFamily: "'Instrument Serif', serif", fontSize: size * 0.16 }}>{name}</div>;

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
      <text x={w / 2} y={h * 0.1} textAnchor="middle" fill="#F5E6D3" fontSize={size * 0.16} fontFamily="'Instrument Serif', serif" fontWeight="400">{name}</text>
      <line x1={startX} y1={startY} x2={endX} y2={startY} stroke="#F5E6D3" strokeWidth={3} strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map(i => (
        <line key={`s${i}`} x1={startX + i * stringSpacing} y1={startY} x2={startX + i * stringSpacing} y2={endY} stroke="#F5E6D3" strokeWidth={0.8} opacity={0.5} />
      ))}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <line key={`f${i}`} x1={startX} y1={startY + i * fretSpacing} x2={endX} y2={startY + i * fretSpacing} stroke="#F5E6D3" strokeWidth={0.6} opacity={0.3} />
      ))}
      {chord.barres.map((b, i) => {
        const x1 = startX + (6 - b.to) * stringSpacing;
        const x2 = startX + (6 - b.from) * stringSpacing;
        return <rect key={`b${i}`} x={x1 - stringSpacing * 0.15} y={startY + (b.fret - 0.5) * fretSpacing - fretSpacing * 0.25}
          width={(x2 - x1) + stringSpacing * 0.3} height={fretSpacing * 0.5} rx={fretSpacing * 0.25} fill="#FF6B35" />;
      })}
      {chord.fingers.map((f, i) => (
        <circle key={`d${i}`} cx={startX + (6 - f[0]) * stringSpacing} cy={startY + (f[1] - 0.5) * fretSpacing} r={size * 0.055} fill="#FF6B35" />
      ))}
      {chord.open && chord.open.map(s => (
        <circle key={`o${s}`} cx={startX + (6 - s) * stringSpacing} cy={startY - size * 0.06} r={size * 0.035} fill="none" stroke="#F5E6D3" strokeWidth={1.2} />
      ))}
      {chord.muted && chord.muted.map(s => (
        <text key={`m${s}`} x={startX + (6 - s) * stringSpacing} y={startY - size * 0.03} textAnchor="middle" fill="#F5E6D3" fontSize={size * 0.1} opacity={0.6}>×</text>
      ))}
    </svg>
  );
}

// כרטיס זמר
function ArtistCard({ artist, onClick, index }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  const songCount = artist.songs.length;

  return (
    <div onClick={onClick} style={{
      background: `linear-gradient(135deg, ${artist.color}18, ${artist.color}08)`,
      border: `1px solid ${artist.color}30`,
      borderRadius: 18,
      padding: "18px 10px",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(15px)",
      textAlign: "center",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.03)"; e.currentTarget.style.borderColor = artist.color + "60"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.borderColor = artist.color + "30"; }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: `linear-gradient(135deg, ${artist.color}, ${artist.color}80)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, margin: "0 auto 10px",
      }}>{artist.image}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#F5E6D3", fontFamily: "'Heebo', sans-serif", marginBottom: 3, direction: "rtl" }}>{artist.name}</div>
      <div style={{ fontSize: 12, color: "#F5E6D3", opacity: 0.4, fontFamily: "'Heebo', sans-serif" }}>
        {songCount} {songCount === 1 ? "שיר" : "שירים"}
      </div>
    </div>
  );
}

// כרטיס שיר
function SongCard({ song, color, onClick, index }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const chords = extractChords(song.lyrics);

  return (
    <div onClick={onClick} style={{
      background: `linear-gradient(135deg, ${color}12, ${color}06)`,
      border: `1px solid ${color}25`,
      borderRadius: 14,
      padding: "16px 20px",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(15px)",
      direction: "rtl",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = color + "50"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = color + "25"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#F5E6D3", fontFamily: "'Heebo', sans-serif", marginBottom: 4 }}>{song.title}</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {chords.slice(0, 5).map(c => (
              <span key={c} style={{
                background: color + "20",
                color: color,
                padding: "2px 8px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'Instrument Serif', serif",
              }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{
            fontSize: 11,
            color: song.difficulty === "קל" ? "#4ECDC4" : "#FFB74D",
            background: song.difficulty === "קל" ? "#4ECDC420" : "#FFB74D20",
            padding: "2px 10px",
            borderRadius: 20,
            fontFamily: "'Heebo', sans-serif",
          }}>{song.difficulty}</span>
        </div>
      </div>
    </div>
  );
}

// תצוגת שיר - מילים עם אקורדים
function SongView({ song, artist, onBack }) {
  const [hoveredChord, setHoveredChord] = useState(null);
  const chords = extractChords(song.lyrics);
  const lines = song.lyrics.trim().split("\n");

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: "#F5E6D3", opacity: 0.6,
        cursor: "pointer", fontSize: 15, fontFamily: "'Heebo', sans-serif",
        display: "flex", alignItems: "center", gap: 6, marginBottom: 20, padding: 0,
      }}>
        → חזרה
      </button>

      {/* כותרת */}
      <div style={{ textAlign: "center", direction: "rtl", marginBottom: 30 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: `linear-gradient(135deg, ${artist.color}, ${artist.color}80)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px", fontSize: 26,
        }}>{artist.image}</div>
        <h2 style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", fontSize: 24, margin: 0, fontWeight: 700 }}>{song.title}</h2>
        <p style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", opacity: 0.5, margin: "4px 0 0", fontSize: 15 }}>{artist.name}</p>
        <span style={{
          fontSize: 11, marginTop: 8, display: "inline-block",
          color: song.difficulty === "קל" ? "#4ECDC4" : "#FFB74D",
          background: song.difficulty === "קל" ? "#4ECDC420" : "#FFB74D20",
          padding: "2px 12px", borderRadius: 20, fontFamily: "'Heebo', sans-serif",
        }}>{song.difficulty}</span>
      </div>

      {/* מילים + אקורדים */}
      <div style={{
        background: "#ffffff06", borderRadius: 18, padding: "24px 20px",
        border: "1px solid #ffffff0a", direction: "rtl",
      }}>
        {lines.map((line, i) => {
          if (line.trim() === "") {
            return <div key={i} style={{ height: 20 }} />;
          }
          const parts = parseLine(line);
          const hasChords = parts.some(p => p.chord);
          return (
            <div key={i} style={{ marginBottom: hasChords ? 6 : 4 }}>
              {hasChords ? (
                <div style={{ display: "inline" }}>
                  {parts.map((part, j) => (
                    <span key={j} style={{ display: "inline-block", verticalAlign: "top", position: "relative" }}>
                      <span style={{
                        display: "block",
                        height: 22,
                        color: artist.color,
                        fontFamily: "'Instrument Serif', serif",
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: part.chord ? "pointer" : "default",
                        visibility: part.chord ? "visible" : "hidden",
                        padding: "0 2px",
                        borderRadius: 4,
                        background: part.chord && hoveredChord === part.chord ? artist.color + "25" : "transparent",
                        transition: "background 0.2s ease",
                      }}
                        onMouseEnter={part.chord ? () => setHoveredChord(part.chord) : undefined}
                        onMouseLeave={part.chord ? () => setHoveredChord(null) : undefined}
                      >{part.chord || "\u00A0"}
                      {part.chord && hoveredChord === part.chord && (
                        <div style={{
                          position: "absolute",
                          bottom: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 100,
                          background: "#1e1e3a",
                          borderRadius: 14,
                          padding: 12,
                          border: `1.5px solid ${artist.color}40`,
                          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                          animation: "fadeIn 0.15s ease",
                          pointerEvents: "none",
                        }}>
                          <ChordDiagram name={part.chord} size={110} />
                        </div>
                      )}
                      </span>
                      <span style={{
                        display: "block",
                        color: "#F5E6D3",
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: 16,
                        fontWeight: 400,
                        whiteSpace: "pre-wrap",
                      }}>{part.text || "\u00A0"}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{
                  color: "#F5E6D3",
                  fontFamily: "'Heebo', sans-serif",
                  fontSize: 16,
                  fontWeight: 400,
                  lineHeight: 1.8,
                }}>{line}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* כל הדיאגרמות */}
      <div style={{ marginTop: 28 }}>
        <p style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", opacity: 0.4, fontSize: 13, textAlign: "center", marginBottom: 14, direction: "rtl" }}>כל האקורדים בשיר</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {chords.map(c => (
            <div key={c} style={{
              opacity: 0.8,
              transition: "all 0.25s ease",
            }}>
              <ChordDiagram name={c} size={90} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== אפליקציה ראשית =====

export default function App() {
  const [view, setView] = useState("artists"); // artists | songs | song | chords
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const goToArtist = (artist) => {
    setSelectedArtist(artist);
    setView("songs");
    setSearchQuery("");
  };

  const goToSong = (song) => {
    setSelectedSong(song);
    setView("song");
  };

  const goBack = () => {
    if (view === "song") {
      setSelectedSong(null);
      setView("songs");
    } else if (view === "songs") {
      setSelectedArtist(null);
      setView("artists");
      setSearchQuery("");
    } else if (view === "chords") {
      setView("artists");
      setSearchQuery("");
    }
  };

  // חיפוש על זמרים ושירים
  const filteredArtists = artists.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (a.name.includes(searchQuery)) return true;
    return a.songs.some(s =>
      s.title.includes(searchQuery) ||
      extractChords(s.lyrics).some(c => c.toLowerCase().includes(q))
    );
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

      {/* רקע */}
      <div style={{
        position: "fixed", top: -100, right: -100, width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, #FF6B3508, transparent)",
        animation: "pulse 6s ease infinite", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: -150, left: -100, width: 500, height: 500,
        borderRadius: "50%", background: "radial-gradient(circle, #4ECDC408, transparent)",
        animation: "pulse 8s ease infinite 2s", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ paddingTop: 50, paddingBottom: 24, textAlign: "center" }}>
          <div onClick={() => { setView("artists"); setSelectedArtist(null); setSelectedSong(null); setSearchQuery(""); }} style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 14px",
            background: "linear-gradient(135deg, #FF6B35, #FF8F60)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px #FF6B3540",
            animation: "float 6s ease-in-out infinite",
            cursor: "pointer",
          }}>
            <span style={{ fontSize: 32 }}>🎸</span>
          </div>
          <h1 onClick={() => { setView("artists"); setSelectedArtist(null); setSelectedSong(null); setSearchQuery(""); }} style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 30, color: "#F5E6D3", fontWeight: 400, letterSpacing: -0.5,
            marginBottom: 4, cursor: "pointer",
          }}>
            mor<span style={{ color: "#FF6B35" }}>.</span>chords
          </h1>
          <p style={{
            fontSize: 13, color: "#F5E6D3", opacity: 0.4, fontWeight: 300,
            letterSpacing: 2, textTransform: "uppercase",
          }}>@morbenbasat</p>
        </div>

        {/* === מסך זמרים === */}
        {view === "artists" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <p style={{
              fontSize: 14, color: "#F5E6D3", opacity: 0.5, marginBottom: 16,
              lineHeight: 1.6, direction: "rtl", textAlign: "center",
            }}>בחרו זמר ומצאו אקורדים לשירים 🎶</p>

            {/* חיפוש */}
            <div style={{ marginBottom: 20 }}>
              <input
                type="text"
                placeholder="🔍 חיפוש זמר או שיר..."
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

            {/* כפתור מילון אקורדים */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <button onClick={() => { setSearchQuery(""); setView("chords"); }} style={{
                background: "linear-gradient(135deg, #FF6B3518, #FF6B3508)",
                border: "1px solid #FF6B3530",
                borderRadius: 14, padding: "12px 24px",
                cursor: "pointer", color: "#FF6B35",
                fontSize: 15, fontFamily: "'Heebo', sans-serif", fontWeight: 600,
                transition: "all 0.25s ease", direction: "rtl",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, #FF6B3528, #FF6B3518)"; e.currentTarget.style.borderColor = "#FF6B3560"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, #FF6B3518, #FF6B3508)"; e.currentTarget.style.borderColor = "#FF6B3530"; }}
              >
                🎸 מילון אקורדים
              </button>
            </div>

            {/* רשימת זמרים */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, paddingBottom: 30 }}>
              {filteredArtists.map((artist, i) => (
                <ArtistCard key={artist.id} artist={artist} index={i} onClick={() => goToArtist(artist)} />
              ))}
              {filteredArtists.length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: "#F5E6D3", opacity: 0.3, direction: "rtl" }}>
                  <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>🎵</span>
                  לא נמצאו זמרים
                </div>
              )}
            </div>
          </div>
        )}

        {/* === מסך שירים של זמר === */}
        {view === "songs" && selectedArtist && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <button onClick={goBack} style={{
              background: "none", border: "none", color: "#F5E6D3", opacity: 0.6,
              cursor: "pointer", fontSize: 15, fontFamily: "'Heebo', sans-serif",
              display: "flex", alignItems: "center", gap: 6, marginBottom: 20, padding: 0,
            }}>
              → חזרה לזמרים
            </button>

            <div style={{ textAlign: "center", direction: "rtl", marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: `linear-gradient(135deg, ${selectedArtist.color}, ${selectedArtist.color}80)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px", fontSize: 30,
              }}>{selectedArtist.image}</div>
              <h2 style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", fontSize: 22, fontWeight: 700, margin: 0 }}>{selectedArtist.name}</h2>
              <p style={{ fontSize: 13, color: "#F5E6D3", opacity: 0.4, marginTop: 4 }}>
                {selectedArtist.songs.length} {selectedArtist.songs.length === 1 ? "שיר" : "שירים"}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 30 }}>
              {selectedArtist.songs.map((song, i) => (
                <SongCard key={song.id} song={song} color={selectedArtist.color} index={i} onClick={() => goToSong(song)} />
              ))}
            </div>
          </div>
        )}

        {/* === מסך שיר === */}
        {view === "song" && selectedSong && selectedArtist && (
          <SongView song={selectedSong} artist={selectedArtist} onBack={goBack} />
        )}

        {/* === מסך מילון אקורדים === */}
        {view === "chords" && (() => {
          const allChords = Object.keys(CHORD_DB);
          const filtered = searchQuery
            ? allChords.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
            : allChords;
          return (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <button onClick={goBack} style={{
              background: "none", border: "none", color: "#F5E6D3", opacity: 0.6,
              cursor: "pointer", fontSize: 15, fontFamily: "'Heebo', sans-serif",
              display: "flex", alignItems: "center", gap: 6, marginBottom: 20, padding: 0,
            }}>
              → חזרה לזמרים
            </button>

            <div style={{ textAlign: "center", direction: "rtl", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", fontSize: 22, fontWeight: 700, margin: 0 }}>מילון אקורדים</h2>
              <p style={{ fontSize: 13, color: "#F5E6D3", opacity: 0.4, marginTop: 6 }}>
                {allChords.length} אקורדים
              </p>
            </div>

            <div style={{ marginBottom: 18 }}>
              <input
                type="text"
                placeholder="🔍 חיפוש אקורד... (Am, G7, Dm...)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 14,
                  border: "1px solid #ffffff12", background: "#ffffff08",
                  color: "#F5E6D3", fontSize: 15, fontFamily: "'Instrument Serif', serif",
                  direction: "ltr", outline: "none", textAlign: "center",
                  transition: "border-color 0.25s ease",
                }}
                onFocus={e => e.target.style.borderColor = "#FF6B3540"}
                onBlur={e => e.target.style.borderColor = "#ffffff12"}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, paddingBottom: 30 }}>
              {filtered.map((name, i) => (
                <div key={name} style={{
                  background: "#ffffff06", borderRadius: 16, padding: "12px 4px",
                  border: "1px solid #ffffff0a", textAlign: "center",
                  transition: "all 0.3s ease",
                  animation: `fadeIn 0.4s ease ${i * 30}ms both`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#ffffff0c"; e.currentTarget.style.borderColor = "#FF6B3530"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#ffffff06"; e.currentTarget.style.borderColor = "#ffffff0a"; }}
                >
                  <ChordDiagram name={name} size={95} />
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "#F5E6D3", opacity: 0.3 }}>
                  <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>🎸</span>
                  לא נמצא אקורד
                </div>
              )}
            </div>
          </div>
          );
        })()}

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
