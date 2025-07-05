# Wolfbot: A Full-Stack Next.js Betting Bot Dashboard

This project is a full-stack web application built with Next.js that provides a user-friendly dashboard for controlling and monitoring an automated betting bot for the Dice game on various platforms.

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Install Dependencies

Navigate to the project root directory and install the necessary packages using pnpm:

```bash
pnpm install
```

### 2. Initialize the Database

Before running the development server, you need to initialize the SQLite database. This will create the necessary tables for settings, strategies, and bet history.

```bash
pnpm dev
# Then, open your browser to http://localhost:3000/api/init
# This will trigger the database initialization.
# You can then close the browser tab for /api/init.
```

Alternatively, you can use `curl` or `wget` to hit the endpoint:

```bash
curl http://localhost:3000/api/init
```

### 3. Run the Development Server

Once the dependencies are installed and the database is initialized, start the Next.js development server:

```bash
pnpm dev
```

### 4. Open the Dashboard

Open your web browser and navigate to `http://localhost:3000` to access the bot dashboard.

## Docker Setup (Optional)

For a consistent development environment, you can use Docker.

### 1. Build and Run Docker Containers

Make sure you have Docker installed and running. Then, from the project root, run:

```bash
docker-compose up --build
```

This will build the Docker image and start the Next.js development server inside a container. The application will be accessible at `http://localhost:3000`.

### 2. Initialize the Database (Docker)

If running with Docker, you can initialize the database by accessing the `/api/init` endpoint in your browser or using `curl` from within the container or your host machine:

```bash
curl http://localhost:3000/api/init
```

### 3. Running CLI Commands (Docker)

To run CLI commands within the Docker container, you can execute commands like this:

```bash
docker-compose exec app pnpm cli status
# Example to start bot:
docker-compose exec app pnpm cli start Primedice mock_primedice_api_key 0.00000001 2 over 49.5
```

## Logging

The application uses a custom logger that outputs logs to the console and to a file. Log files are stored in the `logs/` directory at the project root.

During development (`NODE_ENV=development`), the log file (`bot.log`) is cleared on each startup. In production (`NODE_ENV=production`), logs are appended to the file.

To view the logs, you can use a command like:

```bash
tail -f logs/bot.log
```

## Project Structure

*   `src/app/page.tsx`: The main entry point and user interface for the bot dashboard.
*   `src/app/lib/wolfbet.ts`: Contains the core logic of the betting bot.
*   `src/app/lib/botManager.ts`: Manages the state and lifecycle (start, stop, status) of the bot process on the server.
*   `src/app/api/wolfbet/`: Contains the API routes (`start`, `stop`, `status`, `user`) that the frontend uses to communicate with and control the bot.
*   `src/lib/db.ts`: Database utility for SQLite integration.
*   `src/app/api/init/route.ts`: API route to initialize the database.
*   `src/cli.ts`: Command-line interface entry point.
*   `src/app/lib/logger.ts`: Custom logging utility.

## Tech Stack

*   **Framework:** Next.js
*   **Language:** TypeScript
*   **UI:** React
*   **Styling:** Tailwind CSS
*   **Package Manager:** pnpm
*   **Database:** SQLite (via `better-sqlite3`)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.