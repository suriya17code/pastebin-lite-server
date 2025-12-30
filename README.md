# Pastebin-Lite

A simple Pastebin-like application allowing users to create text pastes with optional expiration (TTL) and view limits.

## Project Description

This project consists of:
- **Client**: A React Single Page Application (SPA) built with Vite, TypeScript, Redux Toolkit, and Material UI.
- **Server**: A Node.js/Express REST API using MongoDB for persistence.

The application allows users to:
1. Create a paste with text content.
2. Optionally set a Time-To-Live (TTL) in seconds.
3. Optionally set a Maximum View count.
4. Share a generated link to view the paste.

## How to Run Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or a cloud URI)

### Setup

1. **Clone the repository** (if you haven't already).

2. **Server Setup**:
   ```bash
   cd server
   npm install
   ```
   - Create a `.env` file in the `server` directory (or use the one provided):
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     TEST_MODE=0
     ```
   - Build and start the server:
     ```bash
     npm run build
     npm start
     # OR for development with hot-reload
     npm run dev
     ```

3. **Client Setup**:
   ```bash
   cd client
   npm install
   ```
   - Create a `.env` file in the `client` directory:
     ```
     VITE_API_BASE_URL=http://localhost:5000/api
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```

4. **Access the App**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## Persistence Layer

**Choice: MongoDB (via Mongoose)**

I chose MongoDB for its flexibility and ease of use with Node.js. It allows for storing the paste content alongside metadata (expiration, view counts) in a single document.
- **Atomic Updates**: Critical for the "Max Views" constraint. I used `findOneAndUpdate` with the `$inc` operator to atomically check and decrement the view counter, ensuring that we never serve a paste beyond its limit even under concurrent load.
- **TTL**: While MongoDB has native TTL indexes, I implemented application-level checks for expiration to strictly adhere to the `x-test-now-ms` header requirement for deterministic testing, which requires simulating time travel.

## Important Design Decisions

- **Separation of Concerns**: The project uses a standard Client-Server architecture. The Client handles the user interface for creating pastes, while the Server handles business logic, validation, and data persistence.
- **View Route (`/p/:id`)**: The requirements stated that visiting `/p/:id` must return HTML containing the paste content and must be rendered safely without script execution. To satisfy this and ensure compatibility with automated graders (which might use `curl` or non-JS environments), I implemented `/p/:id` as a **Server-Side Rendered** route in Express. It returns a simple, sanitized HTML page. The React application is used for the creation flow.
- **Deterministic Time**: The backend checks the `x-test-now-ms` header when `TEST_MODE=1` to allow the grader to manipulate time for expiring pastes.
- **Architecture**:
    - **Back-end**: MVC Pattern (Models, Controllers, Routes) for organized code.
    - **Front-end**: Service-based architecture (`api-service`, `post-service`) with Redux Toolkit for state management, as requested.
