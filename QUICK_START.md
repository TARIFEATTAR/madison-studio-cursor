# Quick Start Guide - Viewing Your App in Cursor

## Your Development Server

Your app runs on: **http://localhost:8080**

## How to View in Cursor's Browser

### Method 1: Simple Browser (Recommended)
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: **"Simple Browser"**
3. Select: **"Simple Browser: Show"**
4. In the address bar, enter: `http://localhost:8080`
5. Press Enter

### Method 2: Command Palette URL
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: **"Simple Browser: Navigate"**
3. Enter: `http://localhost:8080`

## Starting the Development Server

If the server isn't running:

```bash
cd asala-studio
npm run dev
```

The server will start on port 8080 (as configured in `vite.config.ts`).

## Checking if Server is Running

```bash
# Check if port 8080 is in use
lsof -i :8080

# Or test the connection
curl http://localhost:8080
```

## Troubleshooting

- **Port already in use?** Check what's using port 8080 and stop it, or change the port in `vite.config.ts`
- **Can't find Simple Browser?** Make sure you're using the latest version of Cursor
- **Server not responding?** Restart the dev server with `npm run dev`

