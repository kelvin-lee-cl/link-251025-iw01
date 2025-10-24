# 🎭 AI Storytelling Workshop - LINK IW01

A comprehensive web application that combines AI-powered image generation and story creation for educational storytelling workshops.

## 🌟 Features

### 🎨 AI Art Studio
- **Image Generation**: Create stunning images using Recraft AI
- **Custom Prompts**: Input your own descriptions or use guided options
- **Multiple Styles**: Vector illustrations, realistic images, and more
- **Image Management**: Save, edit, rotate, and delete generated images

### 📚 Story Generator
- **AI-Powered Stories**: Generate engaging stories using DeepSeek AI
- **Story Elements**: Who, When, Where, What, Why, How input system
- **Multiple Styles**: Adventure, Fantasy, Mystery, Comedy, Drama, Sci-Fi
- **Story Lengths**: Short, Medium, Long options
- **Firebase Integration**: Save stories to Firestore database

### 👨‍🏫 Teacher Dashboard
- **Mixed Gallery**: View both images and stories in one place
- **User Management**: Filter content by user ID (1-20)
- **Voting System**: Students can vote on each other's content
- **Content Management**: Edit, delete, and organize student work
- **Real-time Updates**: Live content synchronization

### 🔐 User Authentication
- **Simple Login**: User IDs 1-20 with passcodes 001-020
- **Session Management**: Persistent login
- **User-specific Content**: Each user sees their own content

## 🚀 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
- **Backend**: Node.js, Express.js
- **AI Services**: 
  - Recraft AI (Image Generation)
  - DeepSeek AI (Text Generation)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Deployment**: GitHub

## 📦 Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone git@github.com:kelvin-lee-cl/link-251025-iw01.git
   cd link-251025-iw01
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `env.template` to `.env`
   - Fill in your API keys and Firebase credentials
   ```bash
   cp env.template .env
   # Edit .env with your actual values
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Open `http://localhost:3000` in your browser

### 🚀 Render.com Deployment

1. **Fork the repository** to your GitHub account

2. **Create a Render account** at [render.com](https://render.com)

3. **Create a new Web Service**:
   - Connect your GitHub repository
   - Use the following settings:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: `Node`

4. **Configure Environment Variables** in Render dashboard:
   ```
   NODE_ENV=production
   PORT=3000
   DEEPSEEK_API_KEY=your_deepseek_api_key
   RECRAFT_API_KEY=your_recraft_api_key
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

5. **Deploy**: Render will automatically build and deploy your application

6. **Access your live application** at the provided Render URL

## 🔧 Configuration

### API Keys
- **Recraft AI**: Set your API key in `server.js`
- **DeepSeek AI**: Set your API key in `server.js` or environment variable

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore Database
3. Enable Storage
4. Update Firebase configuration in all HTML files

### User Management
- Users: 1-20
- Passcodes: 001-020
- Modify in `public/static/script.js`

## 📁 Project Structure

```
├── public/
│   ├── static/           # Main application pages
│   │   ├── index.html    # Homepage
│   │   ├── text-gen.html # Story Generator
│   │   ├── teacherdashboard.html # Teacher Dashboard
│   │   └── script.js     # Authentication & utilities
│   ├── img-gen/          # AI Art Studio
│   │   ├── img_gen.html  # Image generation interface
│   │   └── img_gen.js    # Image generation logic
│   └── images/           # Static assets
├── server.js             # Node.js server
├── package.json          # Dependencies
└── README.md             # This file
```

## 🎯 Usage

### For Students
1. **Login**: Use your assigned user ID and passcode
2. **Create Images**: Go to AI Art Studio to generate images
3. **Create Stories**: Use Story Generator to create AI-powered stories
4. **Vote**: Vote on other students' content (3 votes per user)

### For Teachers
1. **Access Dashboard**: Go to Teacher Dashboard
2. **View Content**: See all student images and stories
3. **Filter & Sort**: Filter by user or sort by date/votes
4. **Manage Content**: Edit, delete, or organize student work

## 🔥 Firebase Integration

### Firestore Collections
- **stories**: Stores generated stories with metadata
- **images**: References to generated images in Storage

### Storage Buckets
- **ai_generated**: Stores AI-generated images
- **gallery**: Additional image storage

## 🎨 API Endpoints

- `POST /api/generate-image`: Generate images using Recraft AI
- `POST /api/generate-text`: Generate stories using DeepSeek AI

## 🛠️ Development

### Adding New Features
1. Update the relevant HTML/JS files
2. Test locally with `npm start`
3. Commit changes to Git
4. Push to GitHub

### Firebase Security Rules
Ensure proper security rules are set for:
- Firestore: Allow read/write for authenticated users
- Storage: Allow public read/write for ai_generated folder

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎓 Educational Use

This application is designed for:
- Creative writing workshops
- Digital storytelling classes
- AI literacy education
- Collaborative learning environments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes as part of the LINK IW01 workshop.

## 🆘 Support

For issues or questions:
1. Check the browser console for errors
2. Verify Firebase configuration
3. Ensure API keys are correctly set
4. Check network connectivity

## 🎉 Acknowledgments

- Recraft AI for image generation
- DeepSeek for text generation
- Firebase for backend services
- Bootstrap for UI framework

---

**Happy Storytelling! 📚✨**
