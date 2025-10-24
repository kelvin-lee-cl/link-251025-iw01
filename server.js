const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const multer = require('multer');
const FormData = require('form-data');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyADT4rh94tIthBV32YkFToUaX9preqWwE4",
    authDomain: "link-aka-251025.firebaseapp.com",
    projectId: "link-aka-251025",
    storageBucket: "link-aka-251025.firebasestorage.app",
    messagingSenderId: "431182649515",
    appId: "1:431182649515:web:171eae8973d3c863607fee",
    measurementId: "G-RMDK7NNMBQ"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// Configure multer for better iPad compatibility
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 8 * 1024 * 1024, // 8MB limit (reduced from 15MB for efficiency)
        files: 1
    },
    fileFilter: (req, file, cb) => {
        // Accept all image types including HEIC
        if (file.mimetype.startsWith('image/') ||
            file.originalname.toLowerCase().endsWith('.heic') ||
            file.originalname.toLowerCase().endsWith('.heif')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

const app = express();

// Memory optimization: Limit JSON payload size
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Enable CORS for all routes
app.use(cors());

// Serve static files from the public directory
app.use(express.static('public'));
// Serve static files from the public/static directory at root
app.use('/', express.static('public/static'));

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// In-memory storage for generated images (in production, use a database)
const generatedImages = [];
let imageCounter = 0;

// Test endpoint to verify API key
app.post('/api/verify-key', async (req, res) => {
    console.log('Received API key verification request');

    if (!req.body.apiKey) {
        console.error('No API key provided');
        return res.status(400).json({
            status: 'error',
            message: 'No API key provided'
        });
    }

    try {
        console.log('Testing API key...');

        const response = await fetch('https://external.api.recraft.ai/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${req.body.apiKey}`
            },
            body: JSON.stringify({
                prompt: 'test',
                style: 'digital_illustration'
            })
        });

        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', response.headers);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Key Test Error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response Data:', data);

        // Transform the response to match the expected format
        const transformedData = {
            imageUrl: data.data[0].url
        };

        // Track the generated image
        const newImage = {
            id: `img_${++imageCounter}`,
            url: data.data[0].url,
            prompt: req.body.prompt,
            userId: req.body.userId || 'unknown',
            timestamp: new Date().toISOString(),
            inGallery: false, // Default to not in gallery
            size: 1024 * 1024 // Approximate size for 1024x1024 image
        };
        generatedImages.push(newImage);

        res.json({
            status: 'success',
            message: 'API key is valid'
        });
    } catch (error) {
        console.error('API Key Test Error:', error);
        res.status(401).json({
            status: 'error',
            message: 'Invalid API key',
            details: error.message
        });
    }
});

// Proxy endpoint for text-to-image generation
app.post('/api/generate-image', async (req, res) => {
    try {
        const aiType = req.body.aiType || 'recraft_ai';
        const requestBody = {
            prompt: req.body.prompt,
            style: req.body.style,
            size: req.body.size
        };

        let apiUrl, headers, body;

        if (aiType === 'recraft_ai') {
            apiUrl = 'https://external.api.recraft.ai/v1/images/generations';
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${req.body.apiKey}`
            };
            body = JSON.stringify(requestBody);
        } else if (aiType === 'playground_ai') {
            // Playground AI configuration
            apiUrl = 'https://api.playgroundai.com/v1/images/generations';
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${req.body.apiKey}`
            };
            // Transform request for Playground AI format
            const playgroundBody = {
                prompt: req.body.prompt,
                model: 'playground-v2.5',
                width: parseInt(req.body.size.split('x')[0]),
                height: parseInt(req.body.size.split('x')[1]),
                samples: 1
            };
            body = JSON.stringify(playgroundBody);
        } else {
            throw new Error(`Unsupported AI type: ${aiType}`);
        }

        console.log(`Sending request to ${aiType}:`, {
            url: apiUrl,
            method: 'POST',
            headers: headers,
            body: body
        });

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`${aiType} API Error:`, {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
                url: response.url
            });
            throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`${aiType} API Response:`, data);

        // Transform the response to match the expected format
        let transformedData;
        if (aiType === 'recraft_ai') {
            transformedData = {
                imageUrl: data.data[0].url
            };
        } else if (aiType === 'playground_ai') {
            transformedData = {
                imageUrl: data.data[0].url
            };
        }

        // Track the generated image
        const newImage = {
            id: `img_${++imageCounter}`,
            url: data.data[0].url,
            prompt: req.body.prompt,
            userId: req.body.userId || 'unknown',
            timestamp: new Date().toISOString(),
            inGallery: false, // Default to not in gallery
            size: 1024 * 1024 // Approximate size for 1024x1024 image
        };
        generatedImages.push(newImage);

        res.json(transformedData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: error.message || 'Failed to generate image',
            details: error.message
        });
    }
});

// Proxy endpoint for image-to-image generation
app.post('/api/generate-from-image', upload.single('image'), async (req, res) => {
    try {
        console.log('Received image-to-image request');
        console.log('Request headers:', req.headers);
        console.log('Request body:', req.body);
        console.log('Request file:', req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            size: req.file.size,
            buffer: req.file.buffer ? `Buffer of ${req.file.buffer.length} bytes` : 'No buffer'
        } : 'No file');

        if (!req.file) {
            throw new Error('No image file provided');
        }

        // Validate file size
        if (req.file.size > 8 * 1024 * 1024) {
            throw new Error('File size too large. Maximum size is 8MB. Please compress your image before uploading.');
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
        const fileName = req.file.originalname.toLowerCase();
        const isHEIC = fileName.endsWith('.heic') || fileName.endsWith('.heif');

        if (!validTypes.includes(req.file.mimetype) && !isHEIC) {
            throw new Error(`Unsupported file type: ${req.file.mimetype}. Supported types: JPEG, PNG, GIF, WebP, HEIC`);
        }

        // Create a new FormData instance
        const formData = new FormData();

        // Create a readable stream from the buffer
        const { Readable } = require('stream');
        const stream = Readable.from(req.file.buffer);

        // Append the stream to formData
        formData.append('image', stream, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Append other fields
        formData.append('prompt', req.body.prompt);
        formData.append('style', req.body.style);
        formData.append('strength', req.body.strength);

        // Debug FormData contents using Node.js form-data methods
        console.log('FormData contents being sent to Recraft:');
        console.log('- image: Stream with filename:', req.file.originalname);
        console.log('- prompt:', req.body.prompt);
        console.log('- style:', req.body.style);
        console.log('- strength:', req.body.strength);

        const aiType = req.body.aiType || 'recraft_ai';

        let apiUrl, headers;

        if (aiType === 'recraft_ai') {
            apiUrl = 'https://external.api.recraft.ai/v1/images/imageToImage';
            headers = {
                'Authorization': `Bearer ${req.body.apiKey}`
            };
        } else if (aiType === 'playground_ai') {
            // Playground AI image-to-image endpoint
            apiUrl = 'https://api.playgroundai.com/v1/images/image-to-image';
            headers = {
                'Authorization': `Bearer ${req.body.apiKey}`
            };
            // Transform formData for Playground AI if needed
            formData.append('model', 'playground-v2.5');
            formData.append('samples', '1');
        } else {
            throw new Error(`Unsupported AI type for image-to-image: ${aiType}`);
        }

        console.log(`Sending image-to-image request to ${aiType}:`, {
            url: apiUrl,
            method: 'POST',
            headers: headers,
            hasImage: true,
            prompt: req.body.prompt,
            style: req.body.style,
            strength: req.body.strength
        });

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        console.log(`${aiType} API Response Status:`, response.status);
        console.log(`${aiType} API Response Headers:`, Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log(`${aiType} API Raw Response:`, responseText);

        if (!response.ok) {
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                errorData = { error: responseText };
            }
            console.error(`${aiType} API Error:`, {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
                url: response.url
            });
            throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error(`Failed to parse ${aiType} API response as JSON:`, e);
            throw new Error(`Invalid JSON response from ${aiType} API`);
        }

        console.log(`${aiType} API Response Data:`, data);

        // Transform the response to match the expected format
        let transformedData;
        if (aiType === 'recraft_ai') {
            transformedData = {
                imageUrl: data.data[0].url
            };
        } else if (aiType === 'playground_ai') {
            transformedData = {
                imageUrl: data.data[0].url
            };
        }

        // Track the generated image
        const newImage = {
            id: `img_${++imageCounter}`,
            url: data.data[0].url,
            prompt: req.body.prompt,
            userId: req.body.userId || 'unknown',
            timestamp: new Date().toISOString(),
            inGallery: false, // Default to not in gallery
            size: 1024 * 1024 // Approximate size for 1024x1024 image
        };
        generatedImages.push(newImage);

        res.json(transformedData);
    } catch (error) {
        console.error('Image-to-Image Generation Error:', error);
        res.status(500).json({
            error: error.message || 'Failed to generate image from uploaded image',
            details: error.message
        });
    }
});

// Admin endpoints
app.get('/api/admin/images', (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayImages = generatedImages.filter(img => {
            const imgDate = new Date(img.timestamp);
            imgDate.setHours(0, 0, 0, 0);
            return imgDate.getTime() === today.getTime();
        });

        const inGallery = generatedImages.filter(img => img.inGallery).length;
        const totalSizeMB = Math.round(generatedImages.reduce((sum, img) => sum + (img.size || 0), 0) / (1024 * 1024) * 100) / 100;

        res.json({
            total: generatedImages.length,
            inGallery,
            today: todayImages.length,
            totalSizeMB,
            images: generatedImages.map(img => ({
                id: img.id,
                url: img.url,
                prompt: img.prompt,
                userId: img.userId,
                timestamp: img.timestamp,
                inGallery: img.inGallery,
                size: img.size
            }))
        });
    } catch (error) {
        console.error('Error fetching admin images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

app.delete('/api/admin/images/:id', (req, res) => {
    try {
        const id = req.params.id;
        const index = generatedImages.findIndex(img => img.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Image not found' });
        }

        generatedImages.splice(index, 1);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

app.patch('/api/admin/images/:id/gallery', (req, res) => {
    try {
        const id = req.params.id;
        const { inGallery } = req.body;

        const image = generatedImages.find(img => img.id === id);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        image.inGallery = inGallery;
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating gallery status:', error);
        res.status(500).json({ error: 'Failed to update gallery status' });
    }
});

app.post('/api/admin/images/bulk-approve', (req, res) => {
    try {
        const pendingImages = generatedImages.filter(img => !img.inGallery);
        pendingImages.forEach(img => img.inGallery = true);

        res.json({
            success: true,
            approvedCount: pendingImages.length
        });
    } catch (error) {
        console.error('Error bulk approving images:', error);
        res.status(500).json({ error: 'Failed to approve images' });
    }
});

// Gallery endpoint for teacher dashboard
app.get('/api/gallery', (req, res) => {
    try {
        const galleryImages = generatedImages
            .filter(img => img.inGallery)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(img => ({
                id: img.id,
                url: img.url,
                prompt: img.prompt,
                userId: img.userId,
                timestamp: img.timestamp
            }));

        res.json({ images: galleryImages });
    } catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({ error: 'Failed to fetch gallery' });
    }
});

// Upload to gallery endpoint
app.post('/api/upload-to-gallery', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const { aiType, prompt, userId } = req.body;

        if (!aiType) {
            return res.status(400).json({ error: 'AI type is required' });
        }

        console.log('Upload to gallery request:', {
            fileName: req.file.originalname,
            fileSize: req.file.size,
            aiType: aiType,
            prompt: prompt,
            userId: userId
        });

        // Validate file size
        if (req.file.size > 8 * 1024 * 1024) {
            throw new Error('File size too large. Maximum size is 8MB.');
        }

        // Create filename in the format expected by the Gallery page
        // Format: userId_timestamp_aiType_encodedPrompt.png
        const timestamp = Date.now();
        const encodedPrompt = encodeURIComponent(prompt || '').replace(/%20/g, '_');
        const filename = `${userId || 'unknown'}_${timestamp}_${aiType}_${encodedPrompt}.png`;

        // Upload to Firebase Storage
        const storageRef = ref(storage, `ai_generated/${filename}`);
        const imageBuffer = req.file.buffer;

        console.log('Uploading to Firebase Storage:', {
            filename: filename,
            size: imageBuffer.length,
            path: `ai_generated/${filename}`
        });

        await uploadBytes(storageRef, imageBuffer, {
            contentType: req.file.mimetype
        });

        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);

        console.log('Firebase upload successful:', {
            filename: filename,
            downloadURL: downloadURL,
            timestamp: timestamp,
            userId: userId || 'unknown',
            aiType: aiType,
            prompt: prompt || ''
        });

        // Also store in memory for backward compatibility
        const newImage = {
            id: `img_${++imageCounter}`,
            url: downloadURL,
            prompt: prompt || '',
            userId: userId || 'unknown',
            timestamp: new Date().toISOString(),
            inGallery: true, // Direct upload to gallery
            size: req.file.size,
            aiType: aiType
        };

        generatedImages.push(newImage);

        console.log('Image uploaded to gallery successfully:', {
            id: newImage.id,
            aiType: aiType,
            prompt: prompt,
            userId: userId
        });

        res.json({
            success: true,
            message: 'Image uploaded to gallery successfully',
            imageId: newImage.id
        });

    } catch (error) {
        console.error('Upload to gallery error:', error);
        res.status(500).json({
            error: error.message || 'Failed to upload to gallery',
            details: error.message
        });
    }
});

// DeepSeek Text Generation API
app.post('/api/generate-text', async (req, res) => {
    try {
        const { prompt, style, length, additionalContext } = req.body;

        if (!prompt) {
            return res.status(400).json({
                error: 'Prompt is required',
                details: 'Please provide a text generation prompt'
            });
        }

        console.log('Received text generation request:', {
            prompt: prompt.substring(0, 100) + '...',
            style,
            length,
            hasAdditionalContext: !!additionalContext
        });

        // DeepSeek API configuration
        const deepseekApiKey = process.env.DEEPSEEK_API_KEY || 'sk-78b94743efdc4c2b9894399cd27126ce';
        const deepseekUrl = 'https://api.deepseek.com/v1/chat/completions';

        // Build the system prompt based on style and length
        let systemPrompt = `You are a creative AI storyteller that generates engaging and well-structured stories. `;

        switch (style) {
            case 'adventure':
                systemPrompt += `Write an exciting adventure story with action, suspense, and thrilling moments. `;
                break;
            case 'fantasy':
                systemPrompt += `Write a magical fantasy story with mystical elements, magical creatures, and enchanting settings. `;
                break;
            case 'mystery':
                systemPrompt += `Write a mysterious story with puzzles, clues, and intriguing plot twists. `;
                break;
            case 'comedy':
                systemPrompt += `Write a funny, light-hearted story with humor and amusing situations. `;
                break;
            case 'drama':
                systemPrompt += `Write a dramatic story with emotional depth, character development, and meaningful themes. `;
                break;
            case 'sci-fi':
                systemPrompt += `Write a science fiction story with futuristic technology, space exploration, or scientific concepts. `;
                break;
            case 'creative':
                systemPrompt += `Write in a creative and imaginative style. `;
                break;
            case 'formal':
                systemPrompt += `Write in a formal, professional tone. `;
                break;
            case 'casual':
                systemPrompt += `Write in a casual, conversational tone. `;
                break;
            case 'academic':
                systemPrompt += `Write in an academic, scholarly tone with proper citations and analysis. `;
                break;
            case 'storytelling':
                systemPrompt += `Write as a storyteller, focusing on narrative, character development, and engaging plot. `;
                break;
            case 'poetic':
                systemPrompt += `Write in a poetic, lyrical style with rich imagery and rhythm. `;
                break;
        }

        switch (length) {
            case 'short':
                systemPrompt += `Keep the response concise (1-2 paragraphs). `;
                break;
            case 'medium':
                systemPrompt += `Provide a medium-length response (3-5 paragraphs). `;
                break;
            case 'long':
                systemPrompt += `Provide a detailed, comprehensive response (6+ paragraphs). `;
                break;
        }

        if (additionalContext) {
            systemPrompt += `Additional context: ${additionalContext}`;
        }

        const requestBody = {
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: length === 'long' ? 2000 : length === 'medium' ? 1000 : 500,
            temperature: 0.7,
            stream: false
        };

        console.log('Sending request to DeepSeek:', {
            url: deepseekUrl,
            model: requestBody.model,
            max_tokens: requestBody.max_tokens
        });

        const response = await fetch(deepseekUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepseekApiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log('DeepSeek API Response Status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('DeepSeek API Error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });

            return res.status(response.status).json({
                error: 'DeepSeek API Error',
                details: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
                status: response.status
            });
        }

        const data = await response.json();
        console.log('DeepSeek API Response:', {
            usage: data.usage,
            choices: data.choices?.length || 0
        });

        if (!data.choices || data.choices.length === 0) {
            return res.status(500).json({
                error: 'No text generated',
                details: 'DeepSeek API returned no content'
            });
        }

        const generatedText = data.choices[0].message.content;

        console.log('Text generated successfully:', {
            length: generatedText.length,
            preview: generatedText.substring(0, 100) + '...'
        });

        res.json({
            success: true,
            text: generatedText,
            usage: data.usage,
            model: 'deepseek-chat'
        });

    } catch (error) {
        console.error('Text generation error:', error);
        res.status(500).json({
            error: 'Text generation failed',
            details: error.message || 'An unexpected error occurred'
        });
    }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        console.error('Multer Error:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                details: 'The uploaded file exceeds the maximum size limit of 8MB. Images are automatically compressed to 5MB or less.'
            });
        } else if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Too many files',
                details: 'Only one image file can be uploaded at a time.'
            });
        } else {
            return res.status(400).json({
                error: 'File upload error',
                details: error.message
            });
        }
    }
    next(error);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test the API key at: http://localhost:${PORT}/img-gen/img_gen.html`);

    // Memory optimization: Force garbage collection periodically
    setInterval(() => {
        if (global.gc) {
            global.gc();
            const memUsage = process.memoryUsage();
            console.log(`Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
        }
    }, 30000); // Every 30 seconds
}); 