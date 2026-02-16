import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// ===== פונקציות עזר =====

// שליפת כל האקורדים מתוך טקסט מילים
function extractChords(lyrics) {
  const matches = lyrics.match(/\[([A-Za-z0-9#\/]+)\]/g);
  if (!matches) return [];
  const unique = [...new Set(matches.map(m => m.slice(1, -1)))];
  return unique;
}

// פירוק שורת מילים לחלקים של אקורד+טקסט
function parseLine(line) {
  const parts = [];
  const regex = /\[([A-Za-z0-9#\/]+)\]/g;
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

// פירוק ChordPro לשורות של מילים עם אקורדים (לעורך)
function lyricsToWordLines(lyrics) {
  return lyrics.trim().split("\n").map(line => {
    if (line.trim() === "") return [];
    const words = [];
    const regex = /\[([A-Za-z0-9#\/]+)\]/g;
    let clean = "";
    let chordPositions = [];
    let lastIdx = 0;
    let m;
    while ((m = regex.exec(line)) !== null) {
      clean += line.slice(lastIdx, m.index);
      chordPositions.push({ pos: clean.length, chord: m[1] });
      lastIdx = m.index + m[0].length;
    }
    clean += line.slice(lastIdx);
    const splitWords = clean.split(/(\s+)/);
    let charIdx = 0;
    for (const seg of splitWords) {
      if (seg.match(/^\s+$/)) { charIdx += seg.length; continue; }
      if (seg === "") continue;
      const chord = chordPositions.find(cp => cp.pos >= charIdx && cp.pos <= charIdx + seg.length);
      words.push({ word: seg, chord: chord ? chord.chord : null });
      charIdx += seg.length + 1;
    }
    return words;
  });
}

// בנייה חזרה ל-ChordPro מאובייקט מילים
function wordLinesToLyrics(lines) {
  return lines.map(words => {
    if (words.length === 0) return "";
    return words.map(w => (w.chord ? `[${w.chord}]` : "") + w.word).join(" ");
  }).join("\n");
}

const ADMIN_PASSWORD = "mor2024";

// ===== קומפוננטות =====

function ChordDiagram({ name, size = 120, chordDB = {} }) {
  const chord = chordDB[name];
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
      <text x={w / 2} y={h * 0.1} textAnchor="middle" fill="#F5E6D3" fontSize={size * 0.16} fontFamily="'Instrument Serif', serif" fontWeight="400" direction="ltr">{name}</text>
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
function SongView({ song, artist, onBack, isAdmin, onEdit, chordDB = {} }) {
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
        {isAdmin && (
          <button onClick={onEdit} style={{
            display: "block", margin: "12px auto 0", background: "#FF6B3520",
            border: "1px solid #FF6B3540", borderRadius: 10, padding: "6px 20px",
            color: "#FF6B35", fontSize: 13, fontFamily: "'Heebo', sans-serif",
            fontWeight: 600, cursor: "pointer",
          }}>עריכת אקורדים</button>
        )}
      </div>

      {/* פרטי קשר */}
      <a href="tel:0542550950" style={{
        display: "block", marginBottom: 20, padding: "18px 22px",
        background: "linear-gradient(135deg, #FF6B3518, #FF6B3508)",
        border: "1px solid #FF6B3535",
        borderRadius: 16, textDecoration: "none",
        direction: "rtl", textAlign: "center",
        transition: "all 0.3s ease",
      }}
        onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, #FF6B3525, #FF6B3512)"; e.currentTarget.style.borderColor = "#FF6B3550"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, #FF6B3518, #FF6B3508)"; e.currentTarget.style.borderColor = "#FF6B3535"; }}
      >
        <p style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", fontSize: 16, fontWeight: 800, margin: "0 0 6px" }}>
          🎸 מור בן בסט — שיעורי גיטרה
        </p>
        <span style={{
          display: "inline-block", background: "#FF6B35", color: "#1A1A2E",
          borderRadius: 10, padding: "6px 20px", fontSize: 15,
          fontFamily: "'Heebo', sans-serif", fontWeight: 700,
          direction: "ltr",
        }}>054-255-0950</span>
        <p style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", opacity: 0.35, fontSize: 11, margin: "6px 0 0", direction: "ltr" }}>morbb1231@gmail.com</p>
      </a>

      {/* מילים + אקורדים */}
      <div style={{
        background: "#ffffff06", borderRadius: 18, padding: "24px 20px",
        border: "1px solid #ffffff0a", direction: "rtl", textAlign: "right",
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
                    <span key={j} style={{ display: "inline-block", verticalAlign: "top", position: "relative" }}
                      onMouseEnter={part.chord ? () => setHoveredChord(`${i}-${j}`) : undefined}
                      onMouseLeave={part.chord ? () => setHoveredChord(null) : undefined}
                    >
                      {part.chord && hoveredChord === `${i}-${j}` && (
                        <div style={{
                          position: "absolute",
                          bottom: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          marginBottom: 4,
                          zIndex: 100,
                          background: "#1e1e3a",
                          borderRadius: 14,
                          padding: 12,
                          border: `1.5px solid ${artist.color}40`,
                          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                          pointerEvents: "none",
                        }}>
                          <ChordDiagram name={part.chord} size={110} chordDB={chordDB} />
                        </div>
                      )}
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
                        direction: "ltr",
                        background: part.chord && hoveredChord === `${i}-${j}` ? artist.color + "25" : "transparent",
                        transition: "background 0.2s ease",
                      }}>{part.chord || "\u00A0"}</span>
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
              <ChordDiagram name={c} size={90} chordDB={chordDB} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// עורך שיר - גרירת אקורדים למילים
function SongEditor({ song, artist, onSave, onCancel, chordDB = {} }) {
  const [editLines, setEditLines] = useState(() => lyricsToWordLines(song.lyrics));
  const [draggedChord, setDraggedChord] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null);
  const allChords = Object.keys(chordDB);

  const handleDrop = (lineIdx, wordIdx) => {
    if (!draggedChord) return;
    setEditLines(prev => {
      const next = prev.map(l => l.map(w => ({ ...w })));
      next[lineIdx][wordIdx].chord = draggedChord;
      return next;
    });
    setDraggedChord(null);
    setDragOverTarget(null);
  };

  const removeChord = (lineIdx, wordIdx) => {
    setEditLines(prev => {
      const next = prev.map(l => l.map(w => ({ ...w })));
      next[lineIdx][wordIdx].chord = null;
      return next;
    });
  };

  const handleSave = () => {
    onSave(wordLinesToLyrics(editLines));
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onCancel} style={{
          background: "none", border: "none", color: "#F5E6D3", opacity: 0.6,
          cursor: "pointer", fontSize: 15, fontFamily: "'Heebo', sans-serif", padding: 0,
        }}>→ ביטול</button>
        <button onClick={handleSave} style={{
          background: "#FF6B35", border: "none", borderRadius: 10,
          padding: "8px 24px", color: "#1A1A2E", fontSize: 14,
          fontFamily: "'Heebo', sans-serif", fontWeight: 700, cursor: "pointer",
        }}>שמור שינויים</button>
      </div>

      <div style={{ textAlign: "center", direction: "rtl", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", fontSize: 20, margin: 0, fontWeight: 700 }}>
          עריכה: {song.title}
        </h2>
        <p style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", opacity: 0.4, fontSize: 13, marginTop: 4 }}>
          גרור אקורד מהפלטה למעל מילה | לחץ על אקורד כתום למחיקה
        </p>
      </div>

      {/* פלטת אקורדים */}
      <div style={{
        background: "#ffffff06", borderRadius: 14, padding: "12px 14px",
        border: "1px solid #ffffff0a", marginBottom: 20,
        display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center",
      }}>
        {allChords.map(c => (
          <div
            key={c}
            draggable="true"
            onDragStart={() => setDraggedChord(c)}
            onDragEnd={() => { setDraggedChord(null); setDragOverTarget(null); }}
            style={{
              background: artist.color + "20", color: artist.color,
              border: `1px solid ${artist.color}40`,
              borderRadius: 8, padding: "4px 12px", fontSize: 14,
              fontWeight: 600, fontFamily: "'Instrument Serif', serif",
              cursor: "grab", userSelect: "none",
              transition: "all 0.15s ease",
              direction: "ltr",
            }}
          >{c}</div>
        ))}
      </div>

      {/* שורות מילים */}
      <div style={{
        background: "#ffffff06", borderRadius: 18, padding: "24px 20px",
        border: "1px solid #ffffff0a", direction: "rtl",
      }}>
        {editLines.map((words, lineIdx) => {
          if (words.length === 0) return <div key={lineIdx} style={{ height: 20 }} />;
          return (
            <div key={lineIdx} style={{ marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
              {words.map((w, wordIdx) => {
                const isOver = dragOverTarget === `${lineIdx}-${wordIdx}`;
                return (
                  <div
                    key={wordIdx}
                    onDragOver={e => { e.preventDefault(); setDragOverTarget(`${lineIdx}-${wordIdx}`); }}
                    onDragLeave={() => setDragOverTarget(null)}
                    onDrop={e => { e.preventDefault(); handleDrop(lineIdx, wordIdx); }}
                    style={{
                      display: "inline-flex", flexDirection: "column", alignItems: "center",
                      padding: "2px 4px", borderRadius: 6,
                      background: isOver ? artist.color + "25" : "transparent",
                      border: isOver ? `1.5px dashed ${artist.color}` : "1.5px dashed transparent",
                      transition: "all 0.15s ease",
                      minWidth: 30,
                    }}
                  >
                    <span
                      draggable={!!w.chord}
                      onDragStart={w.chord ? () => { setDraggedChord(w.chord); removeChord(lineIdx, wordIdx); } : undefined}
                      onClick={w.chord ? () => removeChord(lineIdx, wordIdx) : undefined}
                      style={{
                        fontSize: 13, fontWeight: 700, height: 20,
                        color: w.chord ? artist.color : "transparent",
                        fontFamily: "'Instrument Serif', serif",
                        cursor: w.chord ? "grab" : "default",
                        userSelect: "none",
                        direction: "ltr",
                      }}
                    >{w.chord || "\u00A0"}</span>
                    <span style={{
                      color: "#F5E6D3", fontSize: 15,
                      fontFamily: "'Heebo', sans-serif",
                    }}>{w.word}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* כפתורים תחתונים */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
        <button onClick={handleSave} style={{
          background: "#FF6B35", border: "none", borderRadius: 12,
          padding: "12px 32px", color: "#1A1A2E", fontSize: 15,
          fontFamily: "'Heebo', sans-serif", fontWeight: 700, cursor: "pointer",
        }}>שמור שינויים</button>
        <button onClick={onCancel} style={{
          background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 12,
          padding: "12px 24px", color: "#F5E6D3", fontSize: 15,
          fontFamily: "'Heebo', sans-serif", fontWeight: 500, cursor: "pointer",
        }}>ביטול</button>
        <button onClick={() => setEditLines(lyricsToWordLines(song.lyrics))} style={{
          background: "none", border: "1px solid #ff444430", borderRadius: 12,
          padding: "12px 20px", color: "#ff6666", fontSize: 13,
          fontFamily: "'Heebo', sans-serif", fontWeight: 500, cursor: "pointer",
        }}>איפוס למקור</button>
      </div>
    </div>
  );
}

// ===== אפליקציה ראשית =====

export default function App() {
  const [view, setView] = useState("artists"); // artists | songs | song | chords | edit-song | easy-songs
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("morchords-admin") === "true");
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [selectedChord, setSelectedChord] = useState(null);

  // Data from Supabase
  const [artists, setArtists] = useState([]);
  const [CHORD_DB, setChordDB] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [artistsRes, songsRes, chordsRes] = await Promise.all([
        supabase.from("artists").select("*").order("created_at"),
        supabase.from("songs").select("*"),
        supabase.from("chords").select("*"),
      ]);

      // Build artists with nested songs
      const artistsList = (artistsRes.data || []).map(a => ({
        ...a,
        songs: (songsRes.data || []).filter(s => s.artist_id === a.id),
      }));
      setArtists(artistsList);

      // Build chord DB as object keyed by name
      const chordMap = {};
      for (const c of chordsRes.data || []) {
        chordMap[c.name] = { fingers: c.fingers, barres: c.barres, muted: c.muted, open: c.open };
      }
      setChordDB(chordMap);
      setLoading(false);
    }
    loadData();
  }, []);

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
    if (view === "edit-song") {
      setView("song");
    } else if (view === "song") {
      setSelectedSong(null);
      setView("songs");
    } else if (view === "songs") {
      setSelectedArtist(null);
      setView("artists");
      setSearchQuery("");
    } else if (view === "chords" || view === "easy-songs") {
      setView("artists");
      setSearchQuery("");
    }
  };

  const handleAdminLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem("morchords-admin", "true");
      setShowPasswordPopup(false);
      setPasswordInput("");
    } else {
      setPasswordInput("");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("morchords-admin");
  };

  const handleLogoClick = () => {
    if (isAdmin) {
      setView("artists"); setSelectedArtist(null); setSelectedSong(null); setSearchQuery("");
    } else {
      setShowPasswordPopup(true);
    }
  };

  // קבלת מילים לשיר
  const getSongLyrics = (song) => {
    return song.lyrics;
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

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 16 }}>
          <span style={{ fontSize: 48, animation: "float 2s ease-in-out infinite" }}>🎸</span>
          <p style={{ color: "#F5E6D3", opacity: 0.5, fontFamily: "'Heebo', sans-serif", fontSize: 14 }}>טוען...</p>
        </div>
      ) : (
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
          <h1 onClick={handleLogoClick} style={{
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
          {isAdmin && (
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 11, color: "#4ECDC4", background: "#4ECDC415", padding: "2px 10px", borderRadius: 10, fontFamily: "'Heebo', sans-serif" }}>מצב עריכה</span>
              <button onClick={handleAdminLogout} style={{
                background: "none", border: "none", color: "#ff6666", fontSize: 11,
                cursor: "pointer", fontFamily: "'Heebo', sans-serif", marginRight: 8, opacity: 0.6,
              }}>יציאה</button>
            </div>
          )}
        </div>

        {/* פופאפ סיסמה */}
        {showPasswordPopup && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.7)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
          }} onClick={() => { setShowPasswordPopup(false); setPasswordInput(""); }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: "#1e1e3a", borderRadius: 18, padding: "30px 28px",
              border: "1px solid #ffffff15", width: 300, textAlign: "center",
            }}>
              <p style={{ color: "#F5E6D3", fontFamily: "'Heebo', sans-serif", fontSize: 16, fontWeight: 600, marginBottom: 16, direction: "rtl" }}>כניסת מנהל</p>
              <input
                type="password"
                placeholder="סיסמה..."
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                autoFocus
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10,
                  border: "1px solid #ffffff15", background: "#ffffff08",
                  color: "#F5E6D3", fontSize: 15, fontFamily: "'Heebo', sans-serif",
                  direction: "rtl", outline: "none", textAlign: "center", marginBottom: 12,
                }}
              />
              <button onClick={handleAdminLogin} style={{
                width: "100%", background: "#FF6B35", border: "none", borderRadius: 10,
                padding: "10px", color: "#1A1A2E", fontSize: 14,
                fontFamily: "'Heebo', sans-serif", fontWeight: 700, cursor: "pointer",
              }}>כניסה</button>
            </div>
          </div>
        )}

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

            {/* שיעורי גיטרה */}
            <div style={{
              background: "linear-gradient(135deg, #FF6B3514, #FF6B3508)",
              border: "1px solid #FF6B3530",
              borderRadius: 18, padding: "20px 22px", marginBottom: 16,
              direction: "rtl", display: "flex", alignItems: "center", gap: 18,
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: "'Heebo', sans-serif", color: "#F5E6D3",
                  fontSize: 19, fontWeight: 800, margin: "0 0 4px",
                }}>שיעורי גיטרה למתחילים</h3>
                <p style={{
                  fontFamily: "'Heebo', sans-serif", color: "#F5E6D3",
                  opacity: 0.55, fontSize: 13, margin: "0 0 12px",
                }}>למדו לנגן את השירים האהובים עליכם מאפס!</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a href="tel:0542550950" style={{
                    background: "#FF6B35", color: "#1A1A2E", textDecoration: "none",
                    borderRadius: 10, padding: "8px 16px", fontSize: 14,
                    fontFamily: "'Heebo', sans-serif", fontWeight: 700,
                    direction: "ltr", display: "inline-block",
                  }}>054-255-0950</a>
                  <a href="mailto:morbb1231@gmail.com" style={{
                    background: "#FF6B3520", color: "#FF6B35", textDecoration: "none",
                    borderRadius: 10, padding: "8px 16px", fontSize: 13,
                    fontFamily: "'Instrument Serif', serif", border: "1px solid #FF6B3540",
                    display: "inline-block",
                  }}>morbb1231@gmail.com</a>
                </div>
              </div>
              <div style={{
                fontSize: 42, width: 70, textAlign: "center", flexShrink: 0,
              }}>🎸</div>
            </div>

            {/* כפתור מילון אקורדים */}
            <button onClick={() => { setSearchQuery(""); setView("chords"); }} style={{
              width: "100%", background: "#ffffff06", border: "1px solid #ffffff0a",
              borderRadius: 14, padding: "16px", cursor: "pointer", marginBottom: 16,
              color: "#F5E6D3", fontFamily: "'Heebo', sans-serif", fontSize: 16,
              fontWeight: 600, transition: "all 0.25s ease", textAlign: "center",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ffffff0c"; e.currentTarget.style.borderColor = "#FF6B3530"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ffffff06"; e.currentTarget.style.borderColor = "#ffffff0a"; }}
            >🎸 מילון אקורדים</button>

            {/* כפתור שירים קלים */}
            <button onClick={() => { setSearchQuery(""); setView("easy-songs"); }} style={{
              width: "100%", background: "#4ECDC410", border: "1px solid #4ECDC425",
              borderRadius: 14, padding: "16px", cursor: "pointer", marginBottom: 16,
              color: "#4ECDC4", fontFamily: "'Heebo', sans-serif", fontSize: 16,
              fontWeight: 600, transition: "all 0.25s ease", textAlign: "center",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#4ECDC420"; e.currentTarget.style.borderColor = "#4ECDC440"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#4ECDC410"; e.currentTarget.style.borderColor = "#4ECDC425"; }}
            >🎵 שירים קלים</button>

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

        {/* === מסך שירים קלים === */}
        {view === "easy-songs" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <button onClick={goBack} style={{
              background: "none", border: "none", color: "#F5E6D3", opacity: 0.6,
              cursor: "pointer", fontSize: 15, fontFamily: "'Heebo', sans-serif",
              display: "flex", alignItems: "center", gap: 6, marginBottom: 20, padding: 0,
            }}>
              → חזרה
            </button>

            <div style={{ textAlign: "center", direction: "rtl", marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: "linear-gradient(135deg, #4ECDC4, #4ECDC480)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px", fontSize: 30,
              }}>🎵</div>
              <h2 style={{ fontFamily: "'Heebo', sans-serif", color: "#F5E6D3", fontSize: 22, fontWeight: 700, margin: 0 }}>שירים קלים</h2>
              <p style={{ fontSize: 13, color: "#F5E6D3", opacity: 0.4, marginTop: 4 }}>שירים מומלצים למתחילים</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 30 }}>
              {artists.flatMap(a => a.songs.filter(s => s.difficulty === "קל").map(song => {
                const artist = a;
                return (
                  <div key={`${artist.id}-${song.id}`} onClick={() => { setSelectedArtist(artist); goToSong(song); }} style={{
                    background: `linear-gradient(135deg, ${artist.color}12, ${artist.color}06)`,
                    border: `1px solid ${artist.color}25`,
                    borderRadius: 14, padding: "16px 20px", cursor: "pointer",
                    transition: "all 0.3s ease", direction: "rtl",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = artist.color + "50"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = artist.color + "25"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#F5E6D3", fontFamily: "'Heebo', sans-serif", marginBottom: 4 }}>{song.title}</div>
                        <div style={{ fontSize: 13, color: "#F5E6D3", opacity: 0.5, fontFamily: "'Heebo', sans-serif" }}>{artist.name}</div>
                      </div>
                      <span style={{
                        fontSize: 11, color: "#4ECDC4", background: "#4ECDC420",
                        padding: "2px 10px", borderRadius: 20, fontFamily: "'Heebo', sans-serif",
                      }}>קל</span>
                    </div>
                  </div>
                );
              }))}
              {artists.flatMap(a => a.songs.filter(s => s.difficulty === "קל")).length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: "#F5E6D3", opacity: 0.3, direction: "rtl" }}>
                  <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>🎵</span>
                  אין שירים קלים עדיין
                </div>
              )}
            </div>
          </div>
        )}

        {/* === מסך שיר === */}
        {view === "song" && selectedSong && selectedArtist && (
          <SongView
            song={{ ...selectedSong, lyrics: getSongLyrics(selectedSong) }}
            artist={selectedArtist}
            onBack={goBack}
            isAdmin={isAdmin}
            onEdit={() => setView("edit-song")}
            chordDB={CHORD_DB}
          />
        )}

        {/* === מסך עריכת שיר === */}
        {view === "edit-song" && selectedSong && selectedArtist && (
          <SongEditor
            song={{ ...selectedSong, lyrics: getSongLyrics(selectedSong) }}
            artist={selectedArtist}
            onSave={async (newLyrics) => {
              await supabase.from("songs").update({ lyrics: newLyrics }).eq("artist_id", selectedArtist.id).eq("id", selectedSong.id);
              setSelectedSong({ ...selectedSong, lyrics: newLyrics });
              // Update local artists state
              setArtists(prev => prev.map(a => a.id === selectedArtist.id ? { ...a, songs: a.songs.map(s => s.id === selectedSong.id ? { ...s, lyrics: newLyrics } : s) } : a));
              setView("song");
            }}
            onCancel={() => setView("song")}
            chordDB={CHORD_DB}
          />
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
                <div key={name} onClick={() => setSelectedChord(name)} style={{
                  background: "#ffffff06", borderRadius: 16, padding: "12px 4px",
                  border: "1px solid #ffffff0a", textAlign: "center",
                  transition: "all 0.3s ease",
                  animation: `fadeIn 0.4s ease ${i * 30}ms both`,
                  position: "relative",
                  cursor: "pointer",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#ffffff0c"; e.currentTarget.style.borderColor = "#FF6B3530"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#ffffff06"; e.currentTarget.style.borderColor = "#ffffff0a"; }}
                >
                  <ChordDiagram name={name} size={95} chordDB={CHORD_DB} />
                  {isAdmin && (
                    <button onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm(`למחוק את ${name}?`)) return;
                      await supabase.from("chords").delete().eq("name", name);
                      setChordDB(prev => { const next = { ...prev }; delete next[name]; return next; });
                    }} style={{
                      position: "absolute", top: 4, right: 4,
                      background: "#ff444430", border: "none", borderRadius: "50%",
                      width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#ff6666", fontSize: 12, cursor: "pointer", padding: 0, lineHeight: 1,
                    }}>×</button>
                  )}
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

        {/* פופאפ אקורד */}
        {selectedChord && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.75)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.25s ease",
          }} onClick={() => setSelectedChord(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: "linear-gradient(135deg, #1e1e3a, #1A1A2E)",
              borderRadius: 24, padding: "32px 28px 28px",
              border: "1px solid #FF6B3530", width: 300, textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              position: "relative",
            }}>
              <button onClick={() => setSelectedChord(null)} style={{
                position: "absolute", top: 12, left: 12,
                background: "none", border: "none", color: "#F5E6D3",
                opacity: 0.4, fontSize: 20, cursor: "pointer", lineHeight: 1,
              }}>×</button>
              <ChordDiagram name={selectedChord} size={200} chordDB={CHORD_DB} />
              <div style={{
                marginTop: 20, paddingTop: 18,
                borderTop: "1px solid #ffffff10",
              }}>
                <p style={{
                  fontFamily: "'Heebo', sans-serif", color: "#F5E6D3",
                  fontSize: 15, fontWeight: 600, direction: "rtl", margin: "0 0 4px",
                }}>מחפש שיעורי גיטרה?</p>
                <p style={{
                  fontFamily: "'Heebo', sans-serif", color: "#FF6B35",
                  fontSize: 14, fontWeight: 700, margin: "0 0 12px", direction: "rtl",
                }}>מור — בסיס ומעלה</p>
                <a href="tel:0542550950" style={{
                  display: "inline-block", background: "#FF6B35", color: "#1A1A2E",
                  textDecoration: "none", borderRadius: 12, padding: "10px 24px",
                  fontSize: 16, fontFamily: "'Heebo', sans-serif", fontWeight: 700,
                  direction: "ltr",
                }}>054-255-0950</a>
              </div>
            </div>
          </div>
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
      )}
    </div>
  );
}
