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
- A LangFlow server running locally or remotely

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

3. Create a `.env.local` file in the root directory and add the LangFlow URL:
   ```
   LANGFLOW_FLOW_URL="http://127.0.0.1:7860/api/v1/run/5781a690-e689-4b26-b636-45da76a91915"
   ```
   Replace the URL with your actual LangFlow server URL if different.

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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

- Next.js
- React
- Tailwind CSS
- Framer Motion
- Axios
- React-Mic

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
