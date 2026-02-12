# 🎸 mor.chords - מדריך העלאה לאוויר

## מה צריך לפני שמתחילים?

1. **מחשב** (Windows / Mac / Linux)
2. **חשבון GitHub** (בחינם) - https://github.com/signup
3. **Node.js** (בחינם) - https://nodejs.org (תוריד את הגרסה LTS)

---

## שלב 1: התקנת Node.js

1. לך ל https://nodejs.org
2. לחץ על הכפתור הירוק **LTS**
3. התקן (Next → Next → Next → Finish)
4. פתח **Terminal** (Mac) או **PowerShell** (Windows)
5. כתוב: `node --version` ותוודא שזה מראה מספר גרסה

---

## שלב 2: פתיחת הפרויקט

1. פרוס את קובץ ה-ZIP שהורדת לתיקייה
2. פתח Terminal / PowerShell
3. נווט לתיקייה:

```bash
cd path/to/mor-chords
```

(ב-Windows אפשר גם ללחוץ ימני בתוך התיקייה → "Open in Terminal")

---

## שלב 3: התקנה והרצה מקומית

כתוב את הפקודות הבאות אחת אחרי השנייה:

```bash
npm install
npm run dev
```

אחרי `npm run dev` תראה משהו כזה:

```
Local: http://localhost:5173/
```

**פתח את הלינק בדפדפן** - זה האתר שלך! 🎉

---

## שלב 4: העלאה ל-GitHub

### 4.1 צור חשבון GitHub
1. לך ל https://github.com/signup
2. הירשם (בחינם)

### 4.2 צור Repository חדש
1. לחץ על **+** בפינה הימנית למעלה → **New repository**
2. שם: `mor-chords`
3. תסמן **Public**
4. **אל** תסמן "Add a README"
5. לחץ **Create repository**

### 4.3 העלה את הקוד
חזור ל-Terminal וכתוב (שורה אחרי שורה):

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mor-chords.git
git push -u origin main
```

⚠️ תחליף `YOUR_USERNAME` בשם המשתמש שלך ב-GitHub!

---

## שלב 5: העלאה לאוויר עם Vercel (בחינם!)

1. לך ל https://vercel.com
2. לחץ **Sign Up** → בחר **Continue with GitHub**
3. לחץ **Add New Project**
4. תראה את `mor-chords` ברשימה - לחץ **Import**
5. הכל מוגדר אוטומטית! פשוט לחץ **Deploy**
6. חכה דקה...
7. **מזל טוב! האתר באוויר!** 🚀

Vercel יתן לך כתובת כמו: `mor-chords.vercel.app`

---

## שלב 6: כתובת מותאמת (אופציונלי)

### אופציה A: שנה את השם ב-Vercel (בחינם)
1. ב-Vercel לך ל **Settings** → **Domains**
2. שנה ל: `morchords.vercel.app` (או כל שם אחר)

### אופציה B: קנה דומיין משלך (כ-40-50 ש"ח לשנה)
1. קנה דומיין באתר כמו Namecheap או GoDaddy
   - למשל: `morchords.co.il` או `morchords.com`
2. ב-Vercel לך ל **Settings** → **Domains** → **Add**
3. כתוב את הדומיין שקנית
4. Vercel ייתן לך הוראות להגדרת DNS - פשוט תעקוב אחריהן

---

## שלב 7: קישור מטיקטוק

1. פתח טיקטוק → פרופיל → **Edit Profile**
2. בשדה **Website** שים את הלינק: `https://morchords.vercel.app`
3. שמור

עכשיו כל מי שנכנס לפרופיל שלך יכול ללחוץ ולהגיע ישר לאפליקציה! 🔗

---

## איך מעדכנים את האתר?

כל פעם שאתה רוצה לעדכן (להוסיף שירים, לשנות עיצוב):

1. ערוך את הקבצים במחשב
2. בדוק מקומית עם `npm run dev`
3. כשהכל טוב:

```bash
git add .
git commit -m "הוספתי שירים חדשים"
git push
```

**Vercel יעדכן אוטומטית תוך דקה!** ✨

---

## בעיות נפוצות

| בעיה | פתרון |
|------|-------|
| `npm: command not found` | התקן Node.js מחדש ופתח Terminal חדש |
| `git: command not found` | התקן Git: https://git-scm.com/downloads |
| Vercel לא מזהה את הפרויקט | וודא שהקוד עלה ל-GitHub בהצלחה |
| האתר לא נטען | בדוק שיש קובץ `index.html` בתיקייה הראשית |
