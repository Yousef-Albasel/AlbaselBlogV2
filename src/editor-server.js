require('dotenv').config();
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const OpenAI = require('openai');

function createEditorApp(projectDir = process.cwd()) {
const app = express();

// Initialize OpenAI client (will be null if no API key)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ========== MIDDLEWARE (ORDER MATTERS!) ==========

// 2. CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// 3. Body parsing
app.use(express.json());

// Get the project directory (where the server is running from)
const PROJECT_DIR = path.resolve(projectDir);
const CONTENT_DIR = path.join(PROJECT_DIR, 'content');
const IMAGES_DIR = path.join(PROJECT_DIR, 'static', 'images');

// 4. Static files
app.use('/images', express.static(IMAGES_DIR));
console.log(`Serving images from: ${IMAGES_DIR}`);

// Ensure content directory exists
async function ensureDirectories() {
  await fs.ensureDir(CONTENT_DIR);
  await fs.ensureDir(IMAGES_DIR);
}

app.use(async (req, res, next) => {
  try { await directoriesReady; next(); } catch (error) { next(error); }
});

const directoriesReady = ensureDirectories();

// ========== MULTER SETUP ==========
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and BMP are allowed.'));
    }
  }
});

// ========== ROUTES (SPECIFIC BEFORE GENERAL!) ==========

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    projectDir: PROJECT_DIR,
    contentDir: CONTENT_DIR,
    imagesDir: IMAGES_DIR,
    aiEnabled: !!openai,
    timestamp: new Date().toISOString()
  });
});

// ========== AI ENDPOINTS (BEFORE /api/file catch-all) ==========

app.post('/api/ai/suggest', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ 
        error: 'AI not configured. Please add OPENAI_API_KEY to your .env file.' 
      });
    }

    const { content, selection, mode = 'improve' } = req.body;
    
    if (!content && !selection) {
      return res.status(400).json({ error: 'Content or selection is required' });
    }

    const textToAnalyze = selection || content;
    const isFullDocument = !selection;

    const systemPrompt = isFullDocument 
      ? `You are an expert markdown editor and writing assistant. Analyze the entire document and provide improved version with:
- Better structure and formatting
- Clearer language and flow
- Fixed grammar and spelling
- Enhanced markdown formatting
Return ONLY the improved markdown content, no explanations.`
      : `You are an expert writing assistant. Improve the selected text while:
- Keeping the same meaning and intent
- Improving clarity and readability
- Fixing any grammar or spelling issues
- Maintaining consistent style
Return ONLY the improved text, no explanations.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: textToAnalyze }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const suggestion = completion.choices[0]?.message?.content || '';

    res.json({ 
      success: true,
      original: textToAnalyze,
      suggestion,
      isFullDocument
    });

  } catch (error) {
    console.error('AI suggest error:', {
      message: error.message,
      status: error.status,
      type: error.type
    });
    res.status(500).json({ 
      error: `AI request failed: ${error.message}`,
      details: error.status ? `Status: ${error.status}` : undefined
    });
  }
});

// AI Rewrite - Rewrite content with specific instructions
app.post('/api/ai/rewrite', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ 
        error: 'AI not configured. Please add OPENAI_API_KEY to your .env file.' 
      });
    }

    const { content, instructions } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const systemPrompt = `You are an expert markdown editor. Rewrite the provided content following the user's instructions.
Return ONLY the rewritten markdown content, no explanations or preamble.`;

    const userMessage = instructions 
      ? `Instructions: ${instructions}\n\nContent to rewrite:\n${content}`
      : `Improve this content:\n${content}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const rewritten = completion.choices[0]?.message?.content || '';

    res.json({ 
      success: true,
      original: content,
      rewritten
    });

  } catch (error) {
    console.error('AI rewrite error:', {
      message: error.message,
      status: error.status,
      type: error.type
    });
    res.status(500).json({ 
      error: `AI request failed: ${error.message}`,
      details: error.status ? `Status: ${error.status}` : undefined
    });
  }
});

// ========== IMAGE ENDPOINTS ==========

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    
    let ext = path.extname(req.file.originalname);
    if (!ext) {
      const mimeToExt = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/bmp': '.bmp'
      };
      ext = mimeToExt[req.file.mimetype] || '.png';
    }
    
    const filename = `paste-${timestamp}-${randomString}${ext}`;

    const imagePath = path.join(IMAGES_DIR, filename);
    await fs.writeFile(imagePath, req.file.buffer);
    const markdownPath = `/images/${filename}`;

    console.log(`Uploaded image: ${filename} (${(req.file.size / 1024).toFixed(2)} KB)`);

    res.json({
      success: true,
      filename: filename,
      path: markdownPath,
      size: req.file.size,
      fullPath: imagePath
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: `Failed to upload image: ${error.message}` });
  }
});

// List all uploaded images
app.get('/api/images', async (req, res) => {
  try {
    if (!await fs.pathExists(IMAGES_DIR)) {
      return res.json({ images: [] });
    }

    const files = await fs.readdir(IMAGES_DIR);
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file))
      .map(file => ({
        filename: file,
        path: `/images/${file}`,
        fullPath: path.join(IMAGES_DIR, file)
      }));

    res.json({ images });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

app.use('/api', require('./content-router')(PROJECT_DIR));
return app;
}

if (require.main === module) {
  const port = process.env.PORT || 3001;
  const server = createEditorApp().listen(port, '127.0.0.1', () => {
    console.log(`Vertex Editor API Server running at http://localhost:${port}`);
  });
  const shutdown = () => server.close();
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = createEditorApp;
