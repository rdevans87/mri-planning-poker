# Planning-Poker

## Overview

The Planning Poker application is a lightweight, real-time collaborative tool designed to assist teams in estimating story points for tasks during sprint planning sessions. The application supports a structured and engaging process for evaluating tasks by allowing team members to join a shared session, submit estimates for tasks, and calculate averages dynamically.

The app leverages real-time communication to ensure that all connected users in a session see updates instantly, making it ideal for distributed teams. It’s designed to be simple, accessible, and fully functional in a browser without requiring login credentials.

## Features

• Real-Time Collaboration:
• Multiple team members can join a session using a shared session ID.
• Updates (such as new issue cards or estimates) are synchronized across all connected users.
• Issue Cards:
• Users can create issue cards, including a title, description, and an optional Jira link for tracking tasks.
• Team members can submit story point estimates for each card.
• Dynamic Calculations:
• Displays team averages (Dev Team and QA Team) for each issue card.
• Calculates the combined total of the averages dynamically.
• Session Management:
• Start a new session to clear all existing data and reset the workspace.
• Persistent session functionality ensures users remain in their session even after refreshing the page.
• Accessible UI:
• Intuitive and clean interface designed with responsive layouts for seamless usage.

## How It Works

1. Joining a Session:
    • Enter a session ID, name, and role (e.g., Dev Team, QA Team, or Project Manager) to join a session.
2. Adding Issue Cards:
    • Users can add issue cards with a title, description, and optional Jira link.
3. Submitting Estimates:
    • Each user can submit story point estimates for Dev Team and QA Team separately.
    • Estimates from all players are displayed along with their names under the issue card.
4. Calculations:
    • Team averages are calculated dynamically based on the submitted estimates.
    • The combined total of team averages is displayed in bold for easy visibility.
5. New Session:
    • Clear all existing data and start fresh with the “New Session” button.

## Technology Stack

• HTML: For structuring the user interface.
• CSS: For styling and layout, including responsive design.
• JavaScript: For client-side functionality and dynamic updates.

## Libraries and Frameworks

• Socket.IO: Enables real-time communication between the server and clients.
• Node.js: Provides the backend server for handling session management and WebSocket connections.
• Express.js: Lightweight framework for serving static files and managing the server.

Other Tools
• Local Storage: Used to persist user session data across page reloads.
• Flexbox: For responsive and modern UI layouts.

## Installation and Usage

Prerequisites
• Node.js (v14 or higher)
• npm (Node Package Manager)

### Installation

1. Clone the repository:

git clone <https://github.com/yourusername/planning-poker.git>
cd planning-poker

1. Install dependencies: npm install

2. Start the server: node server.js

3. Open the application in your browser: <http://localhost:3000>

### Usage

1. Open the application in a browser.
2. Share the session ID with team members to join the same session.
3. Add issue cards, submit estimates, and collaborate in real time.

## Contributing

Contributions are welcome! Please feel free to fork the repository, create a feature branch, and submit a pull request.

## License

This project is licensed under the MIT License.
