require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const pdfParse = require('pdf-parse').default || require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

app.use(express.json({ limit: '10mb' }));
app.use(session({ secret: process.env.JWT_SECRET || 'dev', resave: false, saveUninitialized: false }));

const passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✓ MongoDB connected'))
    .catch(err => console.log('✗ MongoDB:', err.message));
}

const Analysis = require('./models/Analysis');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRoutes);

// Robust JSON extractor — handles markdown fences and preamble text
function extractJSON(raw) {
  if (!raw) throw new Error('Empty response from AI');
  // Try direct parse first
  try { return JSON.parse(raw.trim()); } catch {}
  // Strip markdown fences
  let clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  try { return JSON.parse(clean); } catch {}
  // Find first { ... } block
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(clean.slice(start, end + 1)); } catch {}
  }
  throw new Error('AI returned invalid JSON. Try again — this happens occasionally with Llama.');
}

async function callGroq(system, user, maxTokens) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not set');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: maxTokens || 1200,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ? data.error.message : 'Groq API error');
  return extractJSON(data.choices[0].message.content);
}

const S1 = 'You are a resume parser. Respond ONLY with a raw JSON object, no text before or after, no markdown fences:\n{"name":"<n>","email":"<e or null>","skills":["<s>"],"experience_years":<n>,"job_titles":["<t>"],"education":"<d>","has_quantified_impact":<bool>,"sections_present":["<s>"],"word_count":<n>}';

function S2(e) {
  return 'You are a brutally honest ATS expert. Parsed resume: ' + JSON.stringify(e) + '. Respond ONLY with a raw JSON object, no text before or after, no markdown fences:\n{"ats_score":<0-100>,"categories":{"contact_info":{"score":<n>,"comment":"<s>"},"work_experience":{"score":<n>,"comment":"<s>"},"skills":{"score":<n>,"comment":"<s>"},"education":{"score":<n>,"comment":"<s>"},"keywords":{"score":<n>,"comment":"<s>"},"formatting":{"score":<n>,"comment":"<s>"}},"roast":"<3-4 brutal sentences>","fixes":["<f1>","<f2>","<f3>","<f4>","<f5>"],"strengths":["<s1>","<s2>","<s3>"]}';
}

const S3 = 'You are a semantic resume-JD matcher. Respond ONLY with a raw JSON object, no text before or after, no markdown fences:\n{"score":<0-100>,"matched_keywords":["<k>","<k>","<k>"],"missing_keywords":["<k>","<k>","<k>","<k>","<k>"],"skill_gaps":["<g1>","<g2>"],"verdict":"<2 sentences>"}';
const SC = 'You are a senior recruiter comparing two resumes. Respond ONLY with a raw JSON object, no text before or after, no markdown fences:\n{"winner":"<resume1|resume2|tie>","resume1":{"name":"<n>","ats_score":<n>,"strengths":["<s>","<s>","<s>"],"weaknesses":["<w>","<w>"]},"resume2":{"name":"<n>","ats_score":<n>,"strengths":["<s>","<s>","<s>"],"weaknesses":["<w>","<w>"]},"verdict":"<2-3 sentences>","tips":["<t1>","<t2>","<t3>"]}';

app.post('/api/roast', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    let resumeText = '';
    const jd = req.body.jd || '';
    const filename = req.file ? req.file.originalname : 'Pasted Text';
    if (req.file) {
      const p = await pdfParse(req.file.buffer);
      resumeText = p.text;
      if (!resumeText || resumeText.trim().length < 50)
        return res.status(400).json({ error: 'Could not read PDF. Use Paste Text tab.' });
    } else if (req.body.text) {
      resumeText = req.body.text;
    } else {
      return res.status(400).json({ error: 'No resume provided.' });
    }
    const extracted = await callGroq(S1, 'RESUME:\n' + resumeText, 600);
    const analysis  = await callGroq(S2(extracted), 'RESUME:\n' + resumeText, 1200);
    let jd_match = null;
    if (jd.trim().length > 30) {
      jd_match = await callGroq(S3, 'PARSED:' + JSON.stringify(extracted) + '\nRESUME:\n' + resumeText + '\nJD:\n' + jd, 800);
    }
    const result = Object.assign({}, analysis, { jd_match, ai_steps: { extracted } });
    if (mongoose.connection.readyState === 1) {
      await Analysis.create(Object.assign({ user: req.user._id, filename }, result));
    }
    res.json(result);
  } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

app.post('/api/compare', authMiddleware, upload.fields([{ name:'resume1',maxCount:1 },{ name:'resume2',maxCount:1 }]), async (req, res) => {
  try {
    let t1='', t2='';
    if (req.files && req.files.resume1) { t1 = (await pdfParse(req.files.resume1[0].buffer)).text; }
    else if (req.body.text1) t1 = req.body.text1;
    else return res.status(400).json({ error: 'Resume 1 required.' });
    if (req.files && req.files.resume2) { t2 = (await pdfParse(req.files.resume2[0].buffer)).text; }
    else if (req.body.text2) t2 = req.body.text2;
    else return res.status(400).json({ error: 'Resume 2 required.' });
    const result = await callGroq(SC, 'RESUME 1:\n' + t1 + '\n\n---\n\nRESUME 2:\n' + t2, 1200);
    res.json(result);
  } catch (err) { console.error(err.message); res.status(500).json({ error: err.message }); }
});

app.get('/api/history', authMiddleware, async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ available: false, items: [] });
  try {
    const items = await Analysis.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ available: true, items });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/history/:id', authMiddleware, async (req, res) => {
  try {
    await Analysis.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html')));

const server = app.listen(PORT, () => console.log('\n🔥 Resume Roaster v4 at http://localhost:' + PORT + '\n'));
module.exports = { app, server };
