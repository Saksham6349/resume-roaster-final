// Multi-step AI pipeline — 3 chained calls instead of one
// Step 1: Extract structured info from resume
// Step 2: Deep ATS analysis using extracted data
// Step 3 (optional): JD match using extracted skills vs JD requirements

async function callGroq(messages, maxTokens = 1000) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set in .env');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: maxTokens,
      messages
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Groq API error');

  const raw = data.choices[0]?.message?.content || '';
  const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(clean);
}

// ── Step 1: Extract structured resume data ─────────────────────────────────
async function extractResumeData(resumeText) {
  return callGroq([
    {
      role: 'system',
      content: `You are a resume parser. Extract structured data from the resume. Return ONLY valid JSON, no markdown, no explanation:
{
  "name": "<full name or 'Unknown'>",
  "email": "<email or null>",
  "phone": "<phone or null>",
  "skills": ["<skill1>", "<skill2>", "..."],
  "experience_years": <number or 0>,
  "job_titles": ["<title1>", "..."],
  "companies": ["<company1>", "..."],
  "education": "<highest degree + institution>",
  "has_projects": <true|false>,
  "has_links": <true|false>,
  "word_count": <integer>,
  "has_quantified_achievements": <true|false>
}`
    },
    { role: 'user', content: `Parse this resume:\n\n${resumeText}` }
  ], 600);
}

// ── Step 2: Deep ATS analysis using extracted data ─────────────────────────
async function analyzeResume(resumeText, extracted) {
  return callGroq([
    {
      role: 'system',
      content: `You are a brutally honest ATS expert and senior tech recruiter with 15+ years of experience. 
You have already parsed the candidate's data: ${JSON.stringify(extracted)}
Now perform a deep ATS analysis. Return ONLY valid JSON, no markdown, no explanation:
{
  "ats_score": <integer 0-100>,
  "categories": {
    "contact_info":    { "score": <0-100>, "comment": "<specific one sentence>" },
    "work_experience": { "score": <0-100>, "comment": "<specific one sentence>" },
    "skills":          { "score": <0-100>, "comment": "<specific one sentence>" },
    "education":       { "score": <0-100>, "comment": "<specific one sentence>" },
    "keywords":        { "score": <0-100>, "comment": "<specific one sentence>" },
    "formatting":      { "score": <0-100>, "comment": "<specific one sentence>" }
  },
  "roast": "<3-4 sentences brutally honest, reference actual content from the resume, goal is to help them get hired>",
  "fixes": ["<fix1>","<fix2>","<fix3>","<fix4>","<fix5>"],
  "strengths": ["<strength1>","<strength2>","<strength3>"]
}`
    },
    { role: 'user', content: `Analyze this resume:\n\n${resumeText}` }
  ], 1200);
}

// ── Step 3: JD match using extracted skills ────────────────────────────────
async function matchJD(extracted, jdText) {
  return callGroq([
    {
      role: 'system',
      content: `You are an expert at matching resumes to job descriptions using keyword extraction and semantic analysis.
The candidate has these skills: ${JSON.stringify(extracted.skills)}
Their experience: ${extracted.experience_years} years, roles: ${JSON.stringify(extracted.job_titles)}
Return ONLY valid JSON, no markdown:
{
  "score": <integer 0-100>,
  "matched_keywords": ["<kw1>","<kw2>","<kw3>","<kw4>","<kw5>"],
  "missing_keywords": ["<kw1>","<kw2>","<kw3>","<kw4>","<kw5>"],
  "semantic_gaps": ["<gap1>","<gap2>","<gap3>"],
  "verdict": "<2 sentences: fit assessment and specific advice to close the gap>"
}`
    },
    { role: 'user', content: `Job Description:\n\n${jdText}` }
  ], 600);
}

// ── Compare two resumes ────────────────────────────────────────────────────
async function compareResumes(text1, text2) {
  return callGroq([
    {
      role: 'system',
      content: `You are a senior tech recruiter comparing two resumes side by side. Return ONLY valid JSON, no markdown:
{
  "winner": "<'resume1'|'resume2'|'tie'>",
  "resume1": { "name": "<name>", "ats_score": <0-100>, "strengths": ["<s1>","<s2>","<s3>"], "weaknesses": ["<w1>","<w2>"] },
  "resume2": { "name": "<name>", "ats_score": <0-100>, "strengths": ["<s1>","<s2>","<s3>"], "weaknesses": ["<w1>","<w2>"] },
  "verdict": "<2-3 sentences explaining the winner with specific reasons>",
  "tips": ["<tip1>","<tip2>","<tip3>"]
}`
    },
    { role: 'user', content: `RESUME 1:\n${text1}\n\n---\n\nRESUME 2:\n${text2}` }
  ], 1200);
}

// ── Main pipeline ──────────────────────────────────────────────────────────
async function runAnalysisPipeline(resumeText, jdText = '') {
  // Step 1 + 2 run in parallel for speed
  const [extracted, analysis] = await Promise.all([
    extractResumeData(resumeText),
    analyzeResume(resumeText, {})
  ]);

  // Step 3 only if JD provided
  let jd_match = null;
  if (jdText.trim().length > 30) {
    jd_match = await matchJD(extracted, jdText);
  }

  return { extracted, ...analysis, jd_match };
}

module.exports = { runAnalysisPipeline, compareResumes };
