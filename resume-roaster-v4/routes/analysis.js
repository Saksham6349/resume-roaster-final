const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse').default || require('pdf-parse');
const auth = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const { runAnalysisPipeline, compareResumes } = require('../services/ai');

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/analysis/roast  — requires auth
router.post('/roast', auth, upload.single('resume'), async (req, res) => {
  try {
    let resumeText = '';
    const filename = req.file?.originalname || 'Pasted Text';
    const jdText = req.body.jd || '';

    if (req.file) {
      const parsed = await pdfParse(req.file.buffer);
      resumeText = parsed.text;
      if (!resumeText?.trim() || resumeText.trim().length < 50)
        return res.status(400).json({ error: 'Could not extract text from PDF. Please use Paste Text instead.' });
    } else if (req.body.text) {
      resumeText = req.body.text;
    } else {
      return res.status(400).json({ error: 'No resume content provided.' });
    }

    const result = await runAnalysisPipeline(resumeText, jdText);

    const saved = await Analysis.create({
      userId: req.user._id,
      filename,
      ...result
    });

    res.json({ ...result, _id: saved._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analysis/compare  — requires auth
router.post('/compare', auth, upload.fields([
  { name: 'resume1', maxCount: 1 },
  { name: 'resume2', maxCount: 1 }
]), async (req, res) => {
  try {
    let text1 = '', text2 = '';

    if (req.files?.resume1?.[0]) { const p = await pdfParse(req.files.resume1[0].buffer); text1 = p.text; }
    else if (req.body.text1) text1 = req.body.text1;
    else return res.status(400).json({ error: 'Resume 1 is required.' });

    if (req.files?.resume2?.[0]) { const p = await pdfParse(req.files.resume2[0].buffer); text2 = p.text; }
    else if (req.body.text2) text2 = req.body.text2;
    else return res.status(400).json({ error: 'Resume 2 is required.' });

    const result = await compareResumes(text1, text2);
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analysis/history  — requires auth
router.get('/history', auth, async (req, res) => {
  try {
    const items = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-extracted');
    res.json({ available: true, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/analysis/history/:id  — requires auth
router.delete('/history/:id', auth, async (req, res) => {
  try {
    const item = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ error: 'Not found.' });
    await item.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
