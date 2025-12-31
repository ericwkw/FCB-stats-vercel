# PitchPerfect Stats ⚽

PitchPerfect is a modern, responsive web application designed for amateur and semi-pro football teams to track performance, player statistics, and squad synergy.

Built with **React**, **TypeScript**, **Tailwind CSS**, and **Gemini AI**.

## 🚀 Key Features

*   **Weighted Rating System:** Stats are calculated based on match difficulty (Friendly vs. Challenger) and field size (Small, Medium, Large).
*   **Visual Venue Management:** Upload real photos of your pitches and attach Google Maps links for easy verification. Group venues by size for quick selection.
*   **Smart Squad Management:** Organize players by position (GK, DF, MF, FW). Track released players historically without losing data.
*   **Detailed Analytics:** Track Goals, Assists, Clean Sheets, Own Goals, and Win Rates.
*   **Synergy Tracker:** Automatically identifies which player pairs have the highest win rates together.
*   **AI Avatars:** Generate photorealistic pro-style player portraits using Google Gemini AI.
*   **Data Persistence:** Uses **Local Storage** to save your data automatically in the browser. No login required.
*   **Import/Export:** Easily backup your match history to a JSON file or share it with teammates.
*   **Dark Mode:** Fully supported.

## 🛠 Tech Stack

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS
*   **Charts:** Recharts
*   **Icons:** Lucide React
*   **AI:** Google Gemini API (`@google/genai`)
*   **Build Tool:** Vite (implied via ES Modules structure)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/pitchperfect-stats.git
    cd pitchperfect-stats
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    API_KEY=your_google_gemini_api_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 🚀 Deploying to Vercel

This project is structured to be deployed instantly on Vercel.

1.  Push your code to a GitHub repository.
2.  Import the project in Vercel.
3.  Add the `API_KEY` in the Vercel **Settings > Environment Variables** section.
4.  Click **Deploy**.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## ☕ Support

If you find this tool useful for your team, consider supporting the development!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/R6R71PIYM0)
