import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Replicate from 'replicate';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (works whether running from backend/ or project root)
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = 3001;

// Initialize Gemini AI (validate key exists)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  console.warn('⚠️  GEMINI_API_KEY missing or placeholder. Set it in the root .env file.');
}
const genAI = new GoogleGenerativeAI(apiKey || '');

// Initialize Replicate for Imagen 4 image generation
const replicateToken = process.env.REPLICATE_API_TOKEN;
const replicate = replicateToken ? new Replicate({ auth: replicateToken }) : null;
if (!replicateToken) {
  console.warn('⚠️  REPLICATE_API_TOKEN missing. Add it to the root .env file for image generation.');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to convert file to base64
function fileToBase64(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
}

// Helper function to build photography prompt
function buildPhotographyPrompt(params) {
  const { iso, aperture, shutterSpeed, lensType, lighting, subject } = params;

  const lensDescriptions = {
    'wide-angle': 'wide-angle lens (14-35mm) with expanded field of view and slight edge distortion',
    'standard': 'standard lens (35-70mm) with natural perspective matching human vision',
    'telephoto': 'telephoto lens (70-300mm) with compressed perspective and shallow depth of field',
    'macro': 'macro lens with extreme close-up detail and minimal depth of field'
  };

  const lightingDescriptions = {
    'natural': 'natural daylight with soft shadows and balanced color temperature',
    'studio': 'professional studio lighting with controlled key, fill, and rim lights',
    'golden-hour': 'golden hour lighting with warm tones and long dramatic shadows',
    'dramatic': 'dramatic high-contrast lighting with deep shadows and bright highlights'
  };

  const prompt = `Create a professional, ultra-realistic photograph with the following exact camera specifications:

CAMERA SETTINGS:
- ISO: ${iso} (grain and noise characteristics matching this ISO level)
- Aperture: f/${aperture} (depth of field corresponding to this f-stop)
- Shutter Speed: 1/${shutterSpeed}s (motion blur characteristics for this speed)

LENS & PERSPECTIVE:
- ${lensDescriptions[lensType]}

LIGHTING:
- ${lightingDescriptions[lighting]}

SUBJECT:
${subject}

CRITICAL REQUIREMENTS:
- The image MUST look like it was taken with a real camera, not AI-generated
- Apply authentic camera sensor characteristics and color science
- Include natural lens aberrations, chromatic aberration where appropriate
- Realistic depth of field based on aperture setting
- Natural grain/noise pattern matching the ISO setting
- Authentic dynamic range and highlight/shadow rolloff
- Professional composition and framing
- Sharp focus on the main subject with appropriate bokeh
- Natural color grading matching professional photography

The final result should be indistinguishable from a photograph taken by a professional photographer with the specified equipment and settings.`;

  return prompt;
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Lens API is running' });
});

// Upload image endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      path: req.file.path,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Generate image with Gemini
app.post('/api/generate', async (req, res) => {
  try {
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(503).json({
        error: 'Gemini API key not configured',
        details: 'Add your GEMINI_API_KEY to the .env file in the project root. Get a key at https://aistudio.google.com/apikey'
      });
    }

    const { iso, aperture, shutterSpeed, lensType, lighting, subjectDescription, uploadedImage } = req.body;

    // Validate required parameters
    if (!iso || !aperture || !shutterSpeed || !lensType || !lighting) {
      return res.status(400).json({ error: 'Missing required camera parameters' });
    }

    // Build the photography prompt
    const photographyPrompt = buildPhotographyPrompt({
      iso,
      aperture,
      shutterSpeed,
      lensType,
      lighting,
      subject: subjectDescription || 'the uploaded subject'
    });

    console.log('Generating image with prompt:', photographyPrompt);

    // Use Gemini 2.5 Flash - the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let result;

    if (uploadedImage) {
      // If there's an uploaded image, include it in the prompt for context
      const imagePath = path.join(uploadsDir, uploadedImage);

      if (fs.existsSync(imagePath)) {
        const imageData = fileToBase64(imagePath);
        const imagePart = {
          inlineData: {
            data: imageData,
            mimeType: 'image/jpeg'
          }
        };

        result = await model.generateContent([
          photographyPrompt + "\n\nUse this reference image as the subject and apply the specified camera settings to recreate it with professional photography quality:",
          imagePart
        ]);
      } else {
        result = await model.generateContent(photographyPrompt);
      }
    } else {
      result = await model.generateContent(photographyPrompt);
    }

    const response = await result.response;

    // Safely get text (response.text() can throw if blocked, empty, or multi-part)
    let generatedText = '';
    try {
      generatedText = response.text() || '';
    } catch (textError) {
      console.error('Gemini response.text() error:', textError);
      const feedback = response.promptFeedback || {};
      if (feedback.blockReason) {
        generatedText = `[Content not returned: ${feedback.blockReason}. Try a different subject or description.]`;
      } else {
        const candidate = response.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        generatedText = parts.map(p => p.text).filter(Boolean).join('\n') ||
          'Unable to get text from model. The prompt may have been blocked or returned no text.';
      }
    }

    // Generate actual image with Google Imagen 4 via Replicate
    let imageUrl = null;
    if (replicate) {
      try {
        // Build Imagen prompt - include reference image description if available
        let imagenPrompt = `The photo: ${photographyPrompt}`;
        let imagenInput = {
          prompt: imagenPrompt,
          aspect_ratio: '16:9',
          safety_filter_level: 'block_medium_and_above'
        };

        // If there's an uploaded reference image, include it
        if (uploadedImage) {
          const imagePath = path.join(uploadsDir, uploadedImage);
          if (fs.existsSync(imagePath)) {
            console.log('Including reference image in Imagen 4 generation...');
            try {
              // Read image as Buffer
              const imageBuffer = fs.readFileSync(imagePath);
              
              // First, try uploading to Replicate to get a URL for the prompt
              const fileExtension = path.extname(uploadedImage).toLowerCase();
              const contentType = fileExtension === '.png' ? 'image/png' : 
                                 fileExtension === '.jpg' || fileExtension === '.jpeg' ? 'image/jpeg' : 
                                 'image/jpeg';
              
              const uploadedFile = await replicate.files.create(imageBuffer, {
                content_type: contentType
              });
              const referenceImageUrl = uploadedFile.urls.get;
              
              console.log('✓ Reference image uploaded to Replicate:', referenceImageUrl);
              
              // Enhance prompt with reference image URL
              imagenPrompt = `The photo: ${photographyPrompt}\n\nIMPORTANT: Use the reference image at ${referenceImageUrl} as the subject. Apply the specified camera settings (ISO ${iso}, f/${aperture}, 1/${shutterSpeed}s), ${lensType} lens characteristics, and ${lighting} lighting to recreate this subject with professional photography quality. Match the composition and subject from the reference image while applying the new camera settings.`;
              
              // Try passing image buffer directly AND URL in prompt (covers both possibilities)
              imagenInput = {
                prompt: imagenPrompt,
                image: imageBuffer, // Pass buffer - Replicate will auto-upload if model accepts it
                aspect_ratio: '16:9',
                safety_filter_level: 'block_medium_and_above'
              };
            } catch (uploadError) {
              console.warn('⚠️ Failed to upload reference image to Replicate:', uploadError.message);
              // Fallback: enhance prompt without URL
              imagenPrompt = `The photo: ${photographyPrompt}\n\nUse the uploaded reference image as the subject and apply the specified camera settings, lighting, and lens characteristics to recreate it with professional photography quality.`;
              imagenInput.prompt = imagenPrompt;
            }
          }
        }

        console.log('Generating image with Imagen 4 via Replicate...');
        const output = await replicate.run('google/imagen-4', { input: imagenInput });
        
        // Handle different output formats from Replicate
        // Output can be: string URL, FileOutput object, or array
        if (typeof output === 'string') {
          imageUrl = output;
        } else if (output && typeof output.url === 'function') {
          // FileOutput object
          imageUrl = output.url().toString();
        } else if (Array.isArray(output) && output.length > 0) {
          // Array of outputs - take first one
          const first = output[0];
          if (typeof first === 'string') {
            imageUrl = first;
          } else if (first && typeof first.url === 'function') {
            imageUrl = first.url().toString();
          } else if (first?.url) {
            imageUrl = typeof first.url === 'string' ? first.url : first.url.toString();
          }
        } else if (output?.url) {
          // Object with url property
          imageUrl = typeof output.url === 'string' ? output.url : output.url.toString();
        }
        
        if (imageUrl) {
          console.log('✓ Imagen 4 image generated successfully:', imageUrl);
        } else {
          console.warn('⚠️ Imagen 4 returned output but couldn\'t extract URL:', output);
        }
      } catch (imagenError) {
        console.error('✗ Imagen 4 generation error:', imagenError.message || imagenError);
        // Still return success with analysis; imageUrl stays null
      }
    } else {
      console.warn('⚠️ Replicate not initialized - skipping image generation');
    }

    res.json({
      success: true,
      prompt: photographyPrompt,
      analysis: generatedText,
      imageUrl: imageUrl || undefined,
      message: imageUrl ? 'Photo generated successfully' : 'Photography specifications generated successfully.',
      note: imageUrl ? undefined : 'Image generation requires REPLICATE_API_TOKEN in .env for Imagen 4.'
    });

  } catch (error) {
    console.error('Generation error:', error);
    const details = error.message || '';
    const isAuthError = !apiKey || details.includes('API key') || details.includes('403') || details.includes('401');
    const isModelError = details.includes('404') || details.includes('not found') || details.includes('not supported');
    
    let errorMessage = 'Failed to generate image';
    if (isAuthError) {
      errorMessage = 'Invalid or missing Gemini API key. Add GEMINI_API_KEY to the root .env file.';
    } else if (isModelError) {
      errorMessage = 'Model not available. The Gemini API model name may have changed. Please check Google AI Studio for available models.';
    }
    
    res.status(500).json({
      error: errorMessage,
      details: error.message
    });
  }
});

// Clean up old uploads (run periodically)
function cleanupOldFiles() {
  const files = fs.readdirSync(uploadsDir);
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour

  files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    if (now - stats.mtimeMs > maxAge) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up old file: ${file}`);
    }
  });
}

// Run cleanup every 30 minutes
setInterval(cleanupOldFiles, 30 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Lens Backend running on http://localhost:${PORT}`);
  console.log(`📸 Ready to generate professional photography!`);
});