# Wolfbot: A Full-Stack Next.js Betting Bot Dashboard

## Repository

This project is hosted on GitHub: [https://github.com/byimam2nd/wolfbot](https://github.com/byimam2nd/wolfbot)

## Overview

This project is a full-stack web application built with Next.js that provides a user-friendly dashboard for controlling and monitoring an automated betting bot for the Dice game on the wolf.bet platform.

## Refactoring Summary

This application is a complete refactor of an original Python-based script. The migration to a full-stack Next.js application provides several key advantages:
- **Modern User Interface:** A web-based dashboard built with React and Tailwind CSS for easy control and monitoring.
- **Structured Backend:** A robust backend with API routes to manage the bot's lifecycle and configuration.
- **Improved Efficiency:** Type safety with TypeScript and efficient client-server communication.
- **Enhanced User Experience:** Users can now manage the bot from any device with a web browser.

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

## Vercel Deployment Error Troubleshooting

**Problem:** The project failed to deploy on Vercel with an error related to `lightningcss.android-arm64.node` not being found. This occurred because the `pnpm-lock.yaml` file was generated on an Android environment (Termux), which included platform-specific binaries incompatible with Vercel's Linux (x64) deployment environment.

**Solution:** The core issue was the mismatch between the local development environment's `pnpm-lock.yaml` and the Vercel deployment environment. To resolve this, the `pnpm-lock.yaml` needs to be generated on a Linux (x64) environment.

**Steps to Resolve (to be performed by the user):**

1.  **Clean Local Environment:** Delete the existing `pnpm-lock.yaml` file and the `node_modules` directory in your local `wolfbet` project folder.
    ```bash
    rm -rf pnpm-lock.yaml node_modules
    ```

2.  **Generate Lockfile on Linux (x64):** On a Linux (x64) environment (e.g., using Docker, Windows Subsystem for Linux (WSL), or a native Linux machine), navigate to your `wolfbet` project directory and run `pnpm install`.
    ```bash
    pnpm install
    ```
    This command will generate a new `pnpm-lock.yaml` file that is compatible with Linux (x64).

3.  **Commit and Deploy:** Commit the newly generated `pnpm-lock.yaml` to your Git repository and then deploy your project to Vercel. The build process on Vercel should now succeed as the dependencies will be correctly resolved for the Linux environment.