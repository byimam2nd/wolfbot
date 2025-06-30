# Wolfbet Bot - Next.js Dashboard

## Overview

This project is a full-stack web application built with Next.js that provides a user-friendly dashboard for controlling and monitoring an automated betting bot for the Dice game on the wolf.bet platform. It is a complete refactor from the original Python script, offering a modern UI and a more robust, structured backend.

## Tech Stack

*   **Framework:** Next.js
*   **Language:** TypeScript
*   **UI:** React
*   **Styling:** Tailwind CSS
*   **Package Manager:** pnpm

## Project Structure

*   `wolfbet/src/app/page.tsx`: The main entry point and user interface for the bot dashboard.
*   `wolfbet/src/app/lib/wolfbet.ts`: Contains the core logic of the betting bot, translated from the original Python code.
*   `wolfbet/src/app/lib/botManager.ts`: Manages the state and lifecycle (start, stop, status) of the bot process on the server.
*   `wolfbet/src/app/api/wolfbet/`: Contains the API routes (`start`, `stop`, `status`) that the frontend uses to communicate with and control the bot.

## Getting Started

1.  **Install Dependencies:**
    Navigate to the `wolfbet` directory and run the following command to install the necessary packages.
    ```bash
    pnpm install
    ```

2.  **Run the Development Server:**
    Once the dependencies are installed, start the Next.js development server.
    ```bash
    pnpm run dev
    ```

3.  **Open the Dashboard:**
    Open your web browser and navigate to `http://localhost:3000`.

## How to Use

1.  Enter your `wolf.bet` **Access Token** in the designated input field.
2.  Adjust the bot's **Configuration** settings as needed (e.g., currency, amount, strategy).
3.  Click the **Start** button to begin the bot's operation.
4.  Monitor the bot's performance using the **Live Stats** panel.
5.  Click the **Stop** button to halt the bot at any time.
