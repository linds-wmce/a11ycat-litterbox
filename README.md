# 🐱 a11ycat-litterbox

Backend API for **a11ycat** - A lightweight accessibility auditing service that fetches web pages and runs [axe-core](https://github.com/dequelabs/axe-core) accessibility tests on them.

**Live API:** `https://a11ycat-litterbox-production.up.railway.app`

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

## API Endpoint

### POST `https://a11ycat-litterbox-production.up.railway.app/audit`

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
curl -X POST https://a11ycat-litterbox-production.up.railway.app/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Using JavaScript (fetch)

```javascript
const response = await fetch('https://a11ycat-litterbox-production.up.railway.app/audit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});

const results = await response.json();
console.log('Accessibility violations:', results.violations);
```

## Local Development

To run locally:

```bash
npm install
npm start
```

The server will run on `http://localhost:4000`

## Dependencies

- **express** - Web server framework
- **cors** - Enable CORS for API access
- **node-fetch** - Fetch web pages
- **jsdom** - Virtual DOM for running axe-core
- **axe-core** - Accessibility testing engine

## Deployment

This API is currently deployed on **Railway** at:
`https://a11ycat-litterbox-production.up.railway.app`

### Updating the Deployment

The app automatically redeploys when you push to the `main` branch on GitHub.

To manually deploy updates:

```bash
# Make your changes, then commit and push
git add .
git commit -m "Your update message"
git push origin main
```

Or deploy directly using Railway CLI:

```bash
railway up
```

### Railway CLI Setup

If you need to set up Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to existing project (in this directory)
railway link

# Deploy
railway up
```

### Environment Variables

The following environment variables are automatically configured on Railway:
- `PORT` - Automatically set by Railway (defaults to 4000 locally)

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

