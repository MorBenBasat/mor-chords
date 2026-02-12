// ===== מאגר זמרים ושירים =====
// להוספת שיר: פשוט מוסיפים אובייקט חדש ל-songs של הזמר
// פורמט מילים: [Am]מילים [G]עוד מילים - האקורד בסוגריים מרובעים לפני המילים
// שורה ריקה = רווח בין בתים

export const artists = [
  {
    id: "omer-adam",
    name: "עומר אדם",
    image: "🎤",
    color: "#FF6B35",
    songs: [
      {
        id: "tagidi-mila",
        title: "תגידי מילה",
        difficulty: "קל",
        lyrics: `[D]תגידי מילה אחת [Em]תני לי סימן
[C]שאת רוצה אותי [D]שאני לא לבד

[D]כל הלילה חושב [Em]עלייך בלי סוף
[C]מחכה שתגידי [D]שזה גם מה שאת

[D]תגידי מילה [Em]מילה אחת
[C]תגידי שאת [D]רוצה אותי
[D]תגידי מילה [Em]רק אחת
[C]ואני שלך [D]לתמיד`
      },
      {
        id: "ahavtiha",
        title: "אהבתיה",
        difficulty: "קל",
        lyrics: `[Am]אהבתיה מהרגע [Dm]הראשון שראיתי
[G]את העיניים שלה [C]ידעתי

[Am]שהיא זו שחיכיתי [Dm]לה כל החיים
[G]ושאין עוד [C]כמוה

[Am]אהבתיה [Dm]אהבתיה
[G]מהרגע הראשון [C]ידעתי
[Am]שהיא הכל [Dm]שלי
[G]ואני שלה [C]לנצח`
      },
    ]
  },
  {
    id: "eyal-golan",
    name: "אייל גולן",
    image: "🎵",
    color: "#FF4081",
    songs: [
      {
        id: "yesh-bi-ahava",
        title: "יש בי אהבה",
        difficulty: "בינוני",
        lyrics: `[Am]יש בי אהבה [F]שלא נגמרת
[C]יש בי געגוע [G]שלא נרגע

[Am]כל יום שעובר [F]אני חושב עלייך
[C]ומרגיש שאת [G]עדיין כאן

[Am]יש בי אהבה [F]יש בי אהבה
[C]שלא נגמרת [G]לעולם
[Am]יש בי אהבה [F]כמו אש
[C]שדולקת [G]בלי סוף`
      },
      {
        id: "shuv-halev",
        title: "שוב הלב שלי",
        difficulty: "בינוני",
        lyrics: `[Am]שוב הלב שלי [E]נשבר לרסיסים
[F]שוב אני לבד [G]בלילות

[Am]חשבתי שהפעם [E]זה יהיה שונה
[F]שהפעם זה [G]אמיתי

[Am]שוב הלב [E]שלי
[F]נופל [G]ונשבר
[Am]שוב אני [E]לבד
[F]מחכה [G]לאור`
      },
    ]
  },
  {
    id: "idan-raichel",
    name: "עידן רפאל חביב",
    image: "🎶",
    color: "#7C4DFF",
    songs: [
      {
        id: "ba-li",
        title: "בא לי",
        difficulty: "קל",
        lyrics: `[Em]בא לי לברוח [C]מהכל
[G]לשכוח את [D]העולם

[Em]בא לי להיות [C]איתך
[G]במקום [D]אחר

[Em]בא לי [C]בא לי
[G]רק אני [D]ואת
[Em]בא לי [C]בא לי
[G]לשכוח את [D]הכל`
      },
      {
        id: "melech-haolam",
        title: "מלך העולם",
        difficulty: "קל",
        lyrics: `[G]מלך העולם [D]תן לי כוח
[Em]לעבור את [C]הלילה

[G]מלך העולם [D]שמור עליי
[Em]ותן לי [C]תקווה

[G]אני מבקש [D]ממך
[Em]רק דבר [C]אחד
[G]תן לי [D]אהבה
[Em]תן לי [C]שלום`
      },
    ]
  },
  {
    id: "stifeld",
    name: "שטיפלד",
    image: "🎸",
    color: "#4ECDC4",
    songs: [
      {
        id: "mishehi",
        title: "מישהי",
        difficulty: "קל",
        lyrics: `[G]מישהי שתאהב [Em]אותי כמו שאני
[C]מישהי שתהיה [D]שם בשבילי

[G]לא צריך הרבה [Em]רק מישהי
[C]שתחזיק לי [D]את היד

[G]מישהי [Em]מישהי
[C]שתאהב [D]אותי
[G]כמו [Em]שאני
[C]בלי [D]תנאים`
      },
    ]
  },
  {
    id: "noa-kirel",
    name: "נועה קירל",
    image: "💃",
    color: "#FF5252",
    songs: [
      {
        id: "tiruf",
        title: "טירוף",
        difficulty: "קל",
        lyrics: `[Am]זה טירוף מה [F]שאת עושה לי
[C]לא יכולה [G]להפסיק

[Am]כל פעם שאני [F]רואה אותך
[C]הלב שלי [G]עוצר

[Am]טירוף [F]טירוף
[C]מה שאתה [G]עושה לי
[Am]טירוף [F]טירוף
[C]אני לא [G]יכולה`
      },
    ]
  },
];
