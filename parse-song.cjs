const https = require('https');
const url = process.argv[2];
if (!url) { console.error('Usage: node parse-song.cjs <tab4u-url>'); process.exit(1); }

https.get(url, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = [];

    // Find the main song content area (SongContentArea or the relevant div)
    const songAreaMatch = data.match(/id="TextArea"[\s\S]*?$/);
    const html = songAreaMatch ? songAreaMatch[0] : data;

    // Find all tables in the song area
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/g;
    let tableMatch;
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      const tableHtml = tableMatch[1];
      const rows = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];

      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];

        // Check for section header (פתיחה, פזמון, מעבר, סיום, בית, etc.)
        const sectionMatch = row.match(/Spacer_before_section[\s\S]*?<\/span>\s*(.*?)\s*<\/td>/);
        if (sectionMatch) {
          const sectionText = sectionMatch[1].replace(/<[^>]+>/g, '').trim();
          if (sectionText) lines.push(''); // empty line before section
          continue;
        }

        // Check for chord row
        const chordCellMatch = row.match(/<td class="chords">([\s\S]*?)<\/td>/);
        if (chordCellMatch) {
          const chordHtml = chordCellMatch[1];
          // Check if next row is lyrics
          const nextRow = r + 1 < rows.length ? rows[r + 1] : '';
          const lyricMatch = nextRow.match(/<td[^>]*>([\s\S]*?)<\/td>/);

          // Check if next row has actual lyrics (not another chord row or empty)
          const lyricText = lyricMatch
            ? lyricMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().replace(/\s+/g, ' ')
            : '';
          // Detect if "lyrics" is actually chord names (solo/instrumental sections)
          const isChordOnlyLyrics = lyricText && /^[A-Ga-g#bmMsudimaj7\/\s]+$/.test(lyricText);

          if (lyricMatch && !lyricMatch[1].includes('class="chords"') && !isChordOnlyLyrics && lyricText.length > 0) {
            // === Parse chord positions using &nbsp; counting ===
            const chords = [];
            let totalChordChars = 0;
            const parts = chordHtml.split(/(<span[^>]*>.*?<\/span>)/);
            for (const part of parts) {
              const spanMatch = part.match(/<span[^>]*>(.*?)<\/span>/);
              if (spanMatch) {
                const chordName = spanMatch[1].trim();
                chords.push({ name: chordName, rawPos: totalChordChars });
                totalChordChars += chordName.length;
              } else {
                // Count &nbsp; as spacing characters
                const nbspCount = (part.match(/&nbsp;/g) || []).length;
                totalChordChars += nbspCount;
                // Also count any plain text/spaces
                const plainText = part.replace(/&nbsp;/g, '').replace(/<[^>]+>/g, '');
                totalChordChars += plainText.length;
              }
            }

            // === Parse lyrics text ===
            let lyrics = lyricMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
            // Collapse multiple spaces into single space
            lyrics = lyrics.replace(/\s+/g, ' ');

            if (lyrics && chords.length > 0) {
              // === Proportional mapping ===
              // Map chord position from chord-line space to lyrics-line space
              const lyricsLen = lyrics.length;

              // Find word boundaries in lyrics (positions where words start)
              const wordStarts = [0]; // First word always starts at 0
              for (let i = 1; i < lyrics.length; i++) {
                if (lyrics[i - 1] === ' ' && lyrics[i] !== ' ') {
                  wordStarts.push(i);
                }
              }

              // Map each chord to proportional position, then snap to nearest word start
              const mappedChords = chords.map(c => {
                // Proportional mapping: rawPos / totalChordChars * lyricsLen
                let mappedPos = totalChordChars > 0
                  ? Math.round(c.rawPos / totalChordChars * lyricsLen)
                  : 0;

                // Clamp to valid range
                mappedPos = Math.max(0, Math.min(mappedPos, lyricsLen));

                // Snap to nearest word boundary
                let bestWordStart = 0;
                let bestDist = Infinity;
                for (const ws of wordStarts) {
                  const dist = Math.abs(mappedPos - ws);
                  if (dist < bestDist) {
                    bestDist = dist;
                    bestWordStart = ws;
                  }
                }

                // Only snap if reasonably close (within ~3 chars), otherwise use exact position
                // This handles mid-word chord placement too
                const snapThreshold = 3;
                const finalPos = bestDist <= snapThreshold ? bestWordStart : mappedPos;

                return { name: c.name, pos: finalPos };
              });

              // Build ChordPro string - insert chords at mapped positions
              // Process in reverse to keep positions valid
              let chordPro = lyrics;
              for (let i = mappedChords.length - 1; i >= 0; i--) {
                const c = mappedChords[i];
                const insertPos = Math.min(c.pos, lyrics.length);
                chordPro = chordPro.slice(0, insertPos) + '[' + c.name + ']' + chordPro.slice(insertPos);
              }
              lines.push(chordPro);
              r++; // skip the lyric row since we consumed it
            } else if (chords.length > 0 && !lyrics) {
              // Chord-only line (like intro)
              lines.push(chords.map(c => '[' + c.name + ']').join(' '));
            }
          } else {
            // Chord row without corresponding lyrics row
            // Parse chords and output as chord-only line
            const chords = [];
            const parts = chordHtml.split(/(<span[^>]*>.*?<\/span>)/);
            for (const part of parts) {
              const spanMatch = part.match(/<span[^>]*>(.*?)<\/span>/);
              if (spanMatch) {
                chords.push(spanMatch[1].trim());
              }
            }
            if (chords.length > 0) {
              lines.push(chords.map(c => '[' + c + ']').join(' '));
            }
          }
        }
      }
    }

    // Clean up: remove leading empty lines, collapse multiple empty lines
    let output = lines.join('\n');
    output = output.replace(/^\n+/, '');
    output = output.replace(/\n{3,}/g, '\n\n');

    // Output
    console.log(output);

    // Also extract unique chord names
    const allChords = new Set();
    for (const line of lines) {
      const matches = line.match(/\[([A-Za-z0-9#\/]+)\]/g);
      if (matches) matches.forEach(m => allChords.add(m.slice(1, -1)));
    }
    console.log('\n--- CHORDS USED ---');
    console.log([...allChords].join(', '));
  });
});
