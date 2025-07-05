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

## ESLint and TypeScript Error Resolution

During Vercel deployments, several ESLint and TypeScript errors were encountered, preventing successful builds. These issues have been addressed as follows:

-   **`no-unused-vars`:**
    -   Removed unused `request` parameters from `src/app/api/wolfbet/status/route.ts` and `src/app/api/wolfbet/stop/route.ts`.
        -   Replaced unused variables in `catch` blocks (e.g., `_e`, `_err`) with `_: unknown` to explicitly mark them as intentionally unused and provide type safety, resolving warnings in `src/app/lib/wolfbet.ts` and `src/app/page.tsx`.

-   **`ban-ts-comment`:**
    -   Replaced `@ts-ignore` with `@ts-expect-error` in `src/app/page.tsx` and added a descriptive comment to explain the expected error, improving code clarity and maintainability.

-   **`no-explicit-any`:**
    -   Introduced specific interfaces (`BotConfig`, `FileManager`, `DataFileJson`) in `src/app/lib/botManager.ts` and `src/app/lib/wolfbet.ts` to replace generic `any` types, enhancing type safety and code readability.
    -   Updated variable types (e.g., `botRunning`, `currentStats`, `config`) in `src/app/lib/botManager.ts` to use the newly defined interfaces.

## TypeScript Build Error Resolution

During local development, several TypeScript build errors were encountered, preventing successful compilation. These issues have been addressed as follows:

-   **`await` keyword missing:**
    -   Added `await` to the `startBot` function call in `src/app/api/wolfbet/start/route.ts` to correctly handle the Promise return type.

-   **Type `string | undefined` not assignable to type `string`:**
    -   Used the nullish coalescing operator (`?? "0"`) with `parseFloat()` for `this.bet.amount` and `this.dataPlaceSetBetUser.amount` in `src/app/lib/wolfbet.ts` to ensure that these values are always treated as strings for calculations, preventing `undefined` from causing type errors.
    -   Ensured that numerical results assigned to string properties (e.g., `fileManager.dataFileJson['Play Game']['Amount']`, `fileManager.dataFileJson['Play Game']['Chance to Win']['Chance On']`, `this.bet.amount`) are converted to strings using `toFixed()` where necessary.

## User Data Fetching

To make the application production-ready by fetching user balance and other information, a new API route and corresponding frontend logic have been implemented:

-   **New API Route:** `src/app/api/wolfbet/user/route.ts`
    -   This route handles `GET` requests to a hypothetical Wolf.bet user information endpoint (`https://wolf.bet/api/v1/user`).
    -   It requires an `accessToken` as a query parameter for authentication.
    -   It returns the fetched user data or an error message.

-   **Frontend Integration:** `src/app/page.tsx`
    -   A new `userData` state variable has been added to store the fetched user information.
    -   A `fetchUserData` function has been implemented to call the new `/api/wolfbet/user` route.
    -   This function is triggered by changes in the `accessToken` state using a `useEffect` hook.
    -   The fetched user data (username, balance, currency) is now displayed on the dashboard.
    -   A `UserData` interface was defined to ensure type safety for the user data.

## Access Token Persistence

To improve user experience, the access token is now persisted in the browser's `localStorage`:

-   The `accessToken` state in `src/app/page.tsx` is initialized by attempting to retrieve the token from `localStorage`.
-   Whenever the `accessToken` changes, it is saved to `localStorage`.
-   If the `accessToken` is cleared, it is also removed from `localStorage`.

## File Transfer to VM via SSH

This section documents the process of transferring files to a Virtual Machine (VM) using SSH, including common troubleshooting steps.

**Initial Attempt (using alias 'gs'):**
An attempt was made to transfer the `.gemini` directory using an SSH alias `gs`.
```bash
scp -r /data/data/com.termux/files/home/.gemini gs:~
```
This failed because the alias `gs` was not resolved, indicating it was not configured in the local SSH client's configuration.

**Second Attempt (using IP address):**
The transfer was re-attempted using the public IP address `35.212.221.253`.
```bash
scp -r /data/data/com.termux/files/home/.gemini 35.212.221.253:~
```
This attempt failed with a "Permission denied (publickey)" error, indicating that the SSH client was unable to authenticate with the VM using available keys.

**Successful Transfer (using SSH key and username):**
The transfer was successful after specifying the SSH private key (`google_compute_engine`) and the username (`byimam2nd`) for authentication.
```bash
scp -i /data/data/com.termux/files/home/.ssh/google_compute_engine -r /data/data/com.termux/files/home/.gemini byimam2nd@35.212.221.253:~
```
The `.gemini` directory was successfully transferred to the home directory of the `byimam2nd` user on the VM, located at `/home/byimam2nd/.gemini` on the VM.