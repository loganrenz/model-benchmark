# Thumbnail Generator Worker

This Cloudflare Worker uses the Browser Rendering API to generate thumbnails for submission HTML content.

## Features

- **On-demand generation**: Generate thumbnails for specific submissions via API
- **Batch processing**: Generate thumbnails for multiple submissions at once
- **Automatic scheduling**: Cron job runs every 6 hours to generate missing thumbnails
- **Direct D1 integration**: Updates thumbnails directly in the database

## Setup

### 1. Enable Browser Rendering

Browser Rendering is a paid add-on for Cloudflare Workers. You need to:

1. Go to your Cloudflare dashboard
2. Navigate to Workers & Pages → Plans
3. Enable Browser Rendering (costs ~$5/month + usage)

### 2. Install Dependencies

```bash
cd workers/thumbnail-generator
npm install
```

### 3. Deploy

```bash
npm run deploy
```

## Usage

### Generate Single Thumbnail

```bash
curl "https://thumbnail-generator.<your-subdomain>.workers.dev/generate?id=<submission-id>"
```

### Generate Batch

```bash
curl "https://thumbnail-generator.<your-subdomain>.workers.dev/generate-batch?limit=20"
```

### Automatic Generation

The worker runs automatically every 6 hours via cron trigger to generate thumbnails for:
- Submissions with no thumbnail
- Submissions with placeholder SVG thumbnails

## Integration with Main App

You can call this worker from your Pages app to generate thumbnails on-demand:

```typescript
// In your submission approval endpoint
await fetch(`https://thumbnail-generator.<your-subdomain>.workers.dev/generate?id=${submissionId}`)
```

## Cost Considerations

- Browser Rendering: ~$5/month base + $0.50 per 1000 requests
- Each thumbnail generation is one browser session
- Optimize by:
  - Only generating when needed (on approval)
  - Caching thumbnails in D1
  - Using batch processing during off-peak hours

## Alternative: Simpler Approach

If you don't want to use Browser Rendering, you can:

1. **Use a third-party service**: Like Screenshotone, Urlbox, or ApiFlash
2. **Generate client-side**: Use html2canvas in the browser before submission
3. **Use Pages Functions with Playwright**: Deploy Playwright to a separate service

## Troubleshooting

### Browser Rendering not available

Make sure you've enabled Browser Rendering in your Cloudflare account settings.

### Timeouts

Increase the timeout in `page.setContent()` or reduce the wait time for complex animations.

### Large thumbnails

Reduce the JPEG quality or viewport size to decrease data URL size.


