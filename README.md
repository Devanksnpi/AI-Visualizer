# AI Visualizer - Chat-to-Visualization App

A real-time application that explains scientific concepts with both text explanations and interactive visualizations. Users can ask questions and receive AI-generated responses with animated visualizations rendered on a canvas.

## Features

- 🤖 **AI-Powered Explanations**: Uses OpenAI GPT-4 to generate clear, educational explanations
- 🎨 **Interactive Visualizations**: Renders animated visualizations using HTML5 Canvas
- ⚡ **Real-time Communication**: Server-Sent Events (SSE) for live updates
- 🎮 **Playback Controls**: Play, pause, and restart visualizations
- 📱 **Responsive Design**: Modern, clean UI that works on all devices
- 🔄 **Live Chat**: Real-time chat interface with question history

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Styled Components** - CSS-in-JS styling
- **HTML5 Canvas** - Custom visualization renderer
- **Server-Sent Events** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **OpenAI API** - LLM integration
- **Server-Sent Events** - Real-time broadcasting

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (optional - mock responses available)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd AI_Visualizer
   npm run install-all
   ```

2. **Set up environment variables:**
   ```bash
   cd backend
   cp env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

3. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:3000`

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## API Endpoints

### Questions
- `POST /api/questions` - Submit a new question
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get specific question

### Answers
- `GET /api/answers/:id` - Get answer with visualization
- `GET /api/answers` - Get all answers

### Real-time
- `GET /api/stream` - SSE endpoint for live updates

### Health
- `GET /api/health` - Server health check

## Example Questions

Try asking these questions to see the app in action:

1. **"Explain Newton's First Law of Motion"**
   - Shows animated balls demonstrating inertia

2. **"How does the Solar System work?"**
   - Displays planets orbiting the sun

3. **"What is photosynthesis?"**
   - Visualizes the process with animated arrows

## Visualization Format

Visualizations are defined using a JSON specification:

```json
{
  "id": "unique_id",
  "duration": 4000,
  "fps": 30,
  "layers": [
    {
      "id": "element_id",
      "type": "circle|rectangle|arrow|line|text",
      "props": { /* element properties */ },
      "animations": [
        {
          "property": "x|y|r|width|height|orbit",
          "from": start_value,
          "to": end_value,
          "start": start_time_ms,
          "end": end_time_ms
        }
      ]
    }
  ]
}
```

## Development

### Project Structure
```
AI_Visualizer/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   └── App.js      # Main app component
│   └── package.json
├── backend/            # Node.js server
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── data/           # Data storage
│   └── server.js       # Server entry point
└── package.json        # Root package.json
```

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run client` - Start only the frontend
- `npm run server` - Start only the backend
- `npm run build` - Build the frontend for production
- `npm run install-all` - Install dependencies for all packages

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Without OpenAI API Key

The app works without an API key using mock responses for:
- Newton's First Law of Motion
- Solar System
- Photosynthesis
- Default demo visualization

## Deployment

### Frontend (React)
```bash
cd frontend
npm run build
# Deploy the 'build' folder to your hosting service
```

### Backend (Node.js)
```bash
cd backend
npm start
# Deploy to your Node.js hosting service
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please open an issue on GitHub or contact the development team.
