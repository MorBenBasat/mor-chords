// מאגר אקורדים - להוספת אקורד חדש פשוט מוסיפים אובייקט
// fingers: [מיתר, מיקום] | barres: [{from, to, fret}] | muted: [מיתרים מושתקים] | open: [מיתרים פתוחים]

export const CHORD_DB = {
  // Major
  C:  { fingers: [[1,0],[2,1],[3,0],[4,2],[5,3]], barres: [], muted: [6], open: [1,3] },
  D:  { fingers: [[1,2],[2,3],[3,2]], barres: [], muted: [5,6], open: [4] },
  E:  { fingers: [[3,1],[4,2],[5,2]], barres: [], muted: [], open: [1,2,6] },
  F:  { fingers: [[2,1],[3,2],[4,3]], barres: [{from:1,to:6,fret:1}], muted: [], open: [] },
  G:  { fingers: [[1,3],[5,2],[6,3]], barres: [], muted: [], open: [2,3,4] },
  A:  { fingers: [[2,2],[3,2],[4,2]], barres: [], muted: [6], open: [1,5] },
  B:  { fingers: [[2,4],[3,4],[4,4]], barres: [{from:1,to:5,fret:2}], muted: [6], open: [] },

  // Minor
  Am: { fingers: [[2,1],[3,2],[4,2]], barres: [], muted: [6], open: [1,5] },
  Bm: { fingers: [[3,4],[4,4],[5,3]], barres: [{from:1,to:5,fret:2}], muted: [6], open: [] },
  Cm: { fingers: [[2,4],[3,5],[4,5]], barres: [{from:1,to:5,fret:3}], muted: [6], open: [] },
  Dm: { fingers: [[1,1],[2,3],[3,2]], barres: [], muted: [5,6], open: [4] },
  Em: { fingers: [[4,2],[5,2]], barres: [], muted: [], open: [1,2,3,6] },
  Fm: { fingers: [[2,1],[3,1],[4,2]], barres: [{from:1,to:6,fret:1}], muted: [], open: [] },
  Gm: { fingers: [[2,3],[3,3],[4,4]], barres: [{from:1,to:6,fret:3}], muted: [], open: [] },

  // 7th
  C7:  { fingers: [[1,0],[2,1],[3,3],[4,2],[5,3]], barres: [], muted: [6], open: [] },
  D7:  { fingers: [[1,2],[2,1],[3,2]], barres: [], muted: [5,6], open: [4] },
  E7:  { fingers: [[3,1],[5,2]], barres: [], muted: [], open: [1,2,4,6] },
  G7:  { fingers: [[1,1],[5,2],[6,3]], barres: [], muted: [], open: [2,3,4] },
  A7:  { fingers: [[2,2],[4,2]], barres: [], muted: [6], open: [1,3,5] },
  B7:  { fingers: [[1,2],[3,2],[4,1],[5,2]], barres: [], muted: [6], open: [2] },

  // Minor 7th
  Am7: { fingers: [[2,1],[3,2]], barres: [], muted: [6], open: [1,4,5] },
  Dm7: { fingers: [[1,1],[2,1],[3,2]], barres: [], muted: [5,6], open: [4] },
  Em7: { fingers: [[4,2]], barres: [], muted: [], open: [1,2,3,5,6] },

  // Sus
  Dsus4: { fingers: [[1,3],[2,3],[3,2]], barres: [], muted: [5,6], open: [4] },
  Asus4: { fingers: [[2,2],[3,3],[4,2]], barres: [], muted: [6], open: [1,5] },
  Esus4: { fingers: [[3,2],[4,2],[5,2]], barres: [], muted: [], open: [1,2,6] },
};
