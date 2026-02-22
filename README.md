# AI Lens MVP - Professional Photography Generation System

A React + Node.js application that generates ultra-realistic photography using professional camera controls and Gemini AI.

## 🎨 Features

- **Professional Camera Controls**: ISO, Aperture, Shutter Speed
- **Lens Selection**: Wide-angle, Standard, Telephoto, Macro
- **Lighting Presets**: Natural, Studio, Golden Hour, Dramatic
- **Subject Upload**: Upload reference images
- **AI-Powered Generation**: Gemini 2.0 Flash integration
- **Cinematic UI**: Dark theme with bold geometric design

## 📋 Prerequisites

Before you begin, make sure you have installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)

## 🚀 Setup Instructions

### Step 1: Extract and Open Project

1. Extract the `ai-lens-mvp.zip` file
2. Open VS Code
3. Go to `File > Open Folder...`
4. Select the `ai-lens-mvp` folder

### Step 2: Install Dependencies

Open the **Terminal** in VS Code (`Terminal > New Terminal` or `` Ctrl+` ``) and run:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Configure Environment

The API key is already configured in the `.env` file in the root directory. If you need to change it:

1. Open `.env` file
2. Replace the API key:
   ```
   GEMINI_API_KEY=your_new_api_key_here
   ```

## ▶️ How to Run

You need to run **both** the backend and frontend simultaneously.

### Option 1: Using Two Terminal Windows (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

You should see:
```
🚀 AI Lens Backend running on http://localhost:3001
📸 Ready to generate professional photography!
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

### Option 2: Using VS Code Split Terminal

1. Open Terminal in VS Code
2. Click the **Split Terminal** button (or `Ctrl+Shift+5`)
3. In **Left Terminal**: Run backend
   ```bash
   cd backend && npm start
   ```
4. In **Right Terminal**: Run frontend
   ```bash
   cd frontend && npm run dev
   ```

## 🌐 Access the Application

Once both servers are running:

1. Open your browser
2. Go to: **http://localhost:3000**
3. You should see the AI Lens interface!

## 📖 How to Use

1. **Upload Subject Image** (Optional)
   - Click the upload area
   - Select an image from your computer

2. **Configure Camera Settings**
   - Set ISO (100-6400)
   - Set Aperture (f/1.4 - f/22)
   - Set Shutter Speed (1/8000s - 1/8s)

3. **Select Lens Type**
   - Wide-angle, Standard, Telephoto, or Macro

4. **Choose Lighting**
   - Natural Light, Studio, Golden Hour, or Dramatic

5. **Add Subject Description**
   - Describe what you want to photograph

6. **Generate**
   - Click "GENERATE PHOTO"
   - Wait for AI to process (10-30 seconds)
   - View optimized photography specifications and AI analysis

## 🛠️ Troubleshooting

### Port Already in Use

If you see `Error: listen EADDRINUSE`, a port is already taken:

**Backend (Port 3001):**
```bash
# Kill process on port 3001 (Windows)
npx kill-port 3001

# Kill process on port 3001 (Mac/Linux)
lsof -ti:3001 | xargs kill -9
```

**Frontend (Port 3000):**
```bash
# Kill process on port 3000 (Windows)
npx kill-port 3000

# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9
```

### Module Not Found

If you see module errors:
```bash
# Delete node_modules and reinstall
cd backend
rm -rf node_modules
npm install

cd ../frontend
rm -rf node_modules
npm install
```

### Cannot Connect to Backend

1. Make sure backend is running on port 3001
2. Check terminal for any error messages
3. Verify `.env` file exists in root directory with API key

### Gemini API Errors

1. Check your API key is valid
2. Ensure you have Gemini API access enabled
3. Check API quota/limits in Google AI Studio

## 📁 Project Structure

```
ai-lens-mvp/
├── backend/
│   ├── server.js           # Express server with Gemini integration
│   ├── package.json        # Backend dependencies
│   └── uploads/            # Uploaded images (auto-created)
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── App.css         # Cinematic dark styling
│   │   └── main.jsx        # React entry point
│   ├── index.html          # HTML template
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── .env                    # Environment variables (API key)
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🔧 Development Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start with auto-reload (Node 18+)

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎯 Tech Stack

- **Frontend**: React 18, Vite, Axios
- **Backend**: Node.js, Express, Multer
- **AI**: Google Gemini 2.0 Flash
- **Styling**: Custom CSS with dark cinematic theme

## 📝 Notes

- This is an MVP demonstrating the core workflow
- Currently generates optimized prompts and AI analysis
- Full image generation requires Imagen 3 or similar integration
- Uploaded images are stored temporarily and cleaned up hourly

## 🤝 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Ensure all dependencies are installed
3. Verify both servers are running
4. Check browser console for errors (F12)

## 📄 License

This is an academic project for demonstration purposes.

---

**Made with ⚡ by the AI Lens Team**
