# MeetingMind

MeetingMind is an AI-powered meeting assistant that helps you capture, analyze, and act on your meeting insights effortlessly. This project is built with Next.js and uses advanced AI technologies to transform your meetings.

## Features

- Audio recording and file upload
- AI-powered transcription
- Automatic extraction of key information:
  - Tasks
  - Decisions
  - Questions
  - Insights
  - Deadlines
  - Attendees
  - Follow-ups
  - Risks
  - Agenda

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn
- A LangFlow server running locally


### Caution

⚠️ **Important:** Groq Whisper used for transcription and analysis, currently supports files up to 25 MB only. If your audio file is larger than 25 MB, you will need to compress it before uploading. This limitation may affect the processing of longer meetings or high-quality audio recordings.

To compress your audio files, you can use tools like:
- Online audio compressors 
- FFmpeg (command-line tool for audio/video processing)

Ensure your compressed audio maintains sufficient quality for accurate transcription while staying under the 25 MB limit.



### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/meetingmind.git
   cd meetingmind
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run Langflow backend and upload the flow provided in the repo in the folder at utils/langflow_flow/Meeting Mind.json

4. Create a `.env.local` file in the root directory and add the LangFlow URL:
   ```
   LANGFLOW_FLOW_URL="http://127.0.0.1:7860/api/v1/run/5781a690-e689-4b26-b636-45da76a91915"
   ```
   Replace the URL with your actual LangFlow server URL if different.

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Navigate to the dashboard page.
2. Upload an audio file.
3. Wait for the AI to process and analyze the meeting.
4. Review the extracted information in the Dashboard.

## Project Structure

- `app/`: Contains the main application code
  - `components/`: Reusable React components
  - `api/`: API routes for server-side functionality
  - `dashboard/`: Dashboard page component
  - `page.tsx`: Home page component
- `public/`: Static assets

## Technologies Used

- Langflow
- Next.js
- React
- Tailwind CSS
- Framer Motion
- Axios
- React-Mic


## Screenshots

### Landing Page
![Landing Page](public/landing-page.png)

### Dashboard
![Dashboard](public/dashboard.png)

These screenshots provide a visual representation of the application's main interfaces. The landing page showcases the initial user experience, while the dashboard displays the core functionality where users can upload audio files and view the AI-processed meeting information.


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
