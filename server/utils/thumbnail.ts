interface ThumbnailOptions {
  htmlContent: string
  label?: string
  projectId?: string
  apiKey?: string
}

/**
 * Generate a thumbnail from HTML content using Screenshotone API
 * Falls back to placeholder if API key not configured or request fails
 */
export async function generateThumbnail(options: ThumbnailOptions): Promise<string | null> {
  const { htmlContent, label, projectId, apiKey } = options
  
  if (!apiKey || !htmlContent) {
    return generatePlaceholderThumbnail(label || 'Submission', projectId)
  }

  try {
    const screenshot = await captureScreenshotFromHtml(htmlContent, apiKey)
    return screenshot
  } catch (error) {
    console.error('Screenshot generation failed, using placeholder:', error)
    return generatePlaceholderThumbnail(label || 'Submission', projectId)
  }
}

/**
 * Capture a screenshot from HTML content using Screenshotone API
 */
async function captureScreenshotFromHtml(htmlContent: string, apiKey: string): Promise<string> {
  // Screenshotone supports rendering HTML directly via the html parameter
  const params = new URLSearchParams({
    access_key: apiKey,
    html: htmlContent,
    viewport_width: '800',
    viewport_height: '600',
    format: 'jpeg',
    image_quality: '80',
    delay: '1', // Wait 1 second for animations to start
    block_ads: 'true',
    block_cookie_banners: 'true',
    response_type: 'base64'
  })

  const response = await fetch(`https://api.screenshotone.com/take?${params.toString()}`)
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Screenshotone API error: ${response.status} - ${errorText}`)
  }

  const base64 = await response.text()
  return `data:image/jpeg;base64,${base64}`
}

/**
 * Generate an enhanced placeholder thumbnail with visual information
 * Works in both dev and production - no dependencies required
 */
export function generatePlaceholderThumbnail(label: string, projectId?: string): string {
  // Get project-specific colors and patterns
  const projectConfig = getProjectConfig(projectId)
  
  // Create an enhanced SVG placeholder with gradient, pattern, and label
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${projectConfig.color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${projectConfig.color2};stop-opacity:1" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#grad)"/>
      <rect width="800" height="600" fill="url(#grid)"/>
      
      <!-- Decorative circles -->
      <circle cx="150" cy="150" r="80" fill="rgba(255,255,255,0.1)"/>
      <circle cx="650" cy="450" r="100" fill="rgba(255,255,255,0.08)"/>
      
      <!-- Main label -->
      <text x="400" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${escapeXml(label)}
      </text>
      
      <!-- Project type indicator -->
      ${projectId ? `
      <text x="400" y="330" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="rgba(255,255,255,0.8)" text-anchor="middle" dominant-baseline="middle">
        ${escapeXml(projectConfig.label)}
      </text>
      ` : ''}
      
      <!-- Preview indicator -->
      <text x="400" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="rgba(255,255,255,0.6)" text-anchor="middle" dominant-baseline="middle">
        Click to view full implementation
      </text>
    </svg>
  `
  
  // Convert SVG to base64 (works in both Node and browser environments)
  const base64 = typeof Buffer !== 'undefined' 
    ? Buffer.from(svg.trim()).toString('base64')
    : btoa(unescape(encodeURIComponent(svg.trim())))
  return `data:image/svg+xml;base64,${base64}`
}

/**
 * Get project-specific configuration for thumbnails
 */
function getProjectConfig(projectId?: string): { color1: string; color2: string; label: string } {
  const configs: Record<string, { color1: string; color2: string; label: string }> = {
    'traffic-simulation': {
      color1: '#ef4444',
      color2: '#f59e0b',
      label: 'Traffic Simulation'
    },
    'particle-gravity': {
      color1: '#3b82f6',
      color2: '#8b5cf6',
      label: 'Particle Physics'
    },
    'wave-patterns': {
      color1: '#06b6d4',
      color2: '#3b82f6',
      label: 'Wave Patterns'
    },
    'conways-game-of-life': {
      color1: '#10b981',
      color2: '#059669',
      label: "Conway's Game of Life"
    },
    'pathfinding-visualizer': {
      color1: '#6366f1',
      color2: '#8b5cf6',
      label: 'Pathfinding'
    }
  }
  
  return configs[projectId || ''] || {
    color1: '#6366f1',
    color2: '#8b5cf6',
    label: 'Project'
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
