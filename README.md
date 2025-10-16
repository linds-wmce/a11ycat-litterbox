# 🐱 a11ycat-litterbox

A lightweight accessibility auditing API that fetches web pages and runs [axe-core](https://github.com/dequelabs/axe-core) accessibility tests on them.

## What It Does

This service provides a simple REST API endpoint that:
1. Fetches any publicly accessible web page
2. Loads it into a virtual DOM (jsdom)
3. Runs comprehensive accessibility checks using axe-core
4. Returns detailed accessibility violations, passes, and recommendations

## Installation

```bash
npm install
```

## Usage

Start the server:

```bash
npm start
```

The server will run on `http://localhost:4000`

## API Endpoint

### POST `/audit`

Audit a web page for accessibility issues.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Success Response (200):**
```json
{
  "violations": [...],
  "passes": [...],
  "incomplete": [...],
  "inapplicable": [...],
  "url": "https://example.com",
  "timestamp": "..."
}
```

**Error Response (500):**
```json
{
  "id": "1729123456789-abc123def",
  "error": "Audit failed",
  "details": "Error message"
}
```

## Example Usage

### Using cURL

```bash
curl -X POST http://localhost:4000/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Using JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:4000/audit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});

const results = await response.json();
console.log('Accessibility violations:', results.violations);
```

## Dependencies

- **express** - Web server framework
- **cors** - Enable CORS for API access
- **node-fetch** - Fetch web pages
- **jsdom** - Virtual DOM for running axe-core
- **axe-core** - Accessibility testing engine
- **canvas** - Required by jsdom for canvas element support

## Deployment

To make this API publicly accessible, you'll need to deploy it to a hosting service. Here are some popular options:

### Option 1: Railway (Recommended)

1. Sign up at [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Railway will auto-detect Node.js and deploy
4. Your API will be available at `https://your-app.railway.app`

### Option 2: Render

1. Sign up at [Render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Your API will be available at `https://your-app.onrender.com`

### Option 3: Fly.io

1. Install Fly CLI: `brew install flyctl` (Mac) or see [Fly.io docs](https://fly.io/docs/hands-on/install-flyctl/)
2. Run `fly launch` in your project directory
3. Run `fly deploy`
4. Your API will be available at `https://your-app.fly.dev`

### Environment Variables

For production, you may want to set:
- `PORT` - The port to run on (defaults to 4000)
- Add any CORS origins you want to whitelist

## Development

The server uses ES modules, so make sure your `package.json` includes:
```json
{
  "type": "module"
}
```

## Error Tracking

All errors include a unique ID for easy tracking and debugging in your logs.

## License

ISC

