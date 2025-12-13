/**
 * Thumbnail Generator Worker
 * Uses Cloudflare Browser Rendering API to generate thumbnails for submissions
 */

import puppeteer from '@cloudflare/puppeteer'

interface Env {
  BROWSER: Fetcher
  DB: D1Database
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    
    // Handle thumbnail generation request
    if (url.pathname === '/generate') {
      const submissionId = url.searchParams.get('id')
      if (!submissionId) {
        return new Response('Missing submission ID', { status: 400 })
      }
      
      try {
        const thumbnail = await generateThumbnail(submissionId, env)
        return new Response(JSON.stringify({ success: true, thumbnail }), {
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
    
    // Handle batch generation
    if (url.pathname === '/generate-batch') {
      const limit = parseInt(url.searchParams.get('limit') || '10')
      try {
        const result = await generateBatchThumbnails(env, limit)
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
    
    return new Response('Thumbnail Generator Worker\n\nEndpoints:\n- /generate?id=<submission_id>\n- /generate-batch?limit=10')
  },
  
  // Cron trigger for automatic batch generation
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(generateBatchThumbnails(env, 20))
  }
}

async function generateThumbnail(submissionId: string, env: Env): Promise<string> {
  // Get submission HTML content
  const submission = await env.DB.prepare(
    'SELECT html_content FROM submissions WHERE id = ?'
  ).bind(submissionId).first<{ html_content: string }>()
  
  if (!submission) {
    throw new Error('Submission not found')
  }
  
  // Launch browser using Cloudflare's Browser Rendering API
  const browser = await puppeteer.launch(env.BROWSER)
  const page = await browser.newPage()
  
  try {
    // Set viewport for thumbnail
    await page.setViewport({ width: 800, height: 600 })
    
    // Load the HTML content
    await page.setContent(submission.html_content, {
      waitUntil: 'networkidle0',
      timeout: 10000
    })
    
    // Wait a bit for animations to start
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 85,
      encoding: 'base64'
    }) as string
    
    const thumbnailDataUrl = `data:image/jpeg;base64,${screenshot}`
    
    // Update database with thumbnail
    await env.DB.prepare(
      'UPDATE submissions SET thumbnail = ? WHERE id = ?'
    ).bind(thumbnailDataUrl, submissionId).run()
    
    return thumbnailDataUrl
  } finally {
    await browser.close()
  }
}

async function generateBatchThumbnails(env: Env, limit: number): Promise<{ success: boolean; generated: number; errors: number }> {
  // Get submissions without thumbnails or with placeholder thumbnails
  const submissions = await env.DB.prepare(
    `SELECT id FROM submissions 
     WHERE thumbnail IS NULL 
        OR thumbnail LIKE 'data:image/svg%'
     LIMIT ?`
  ).bind(limit).all<{ id: string }>()
  
  let generated = 0
  let errors = 0
  
  for (const submission of submissions.results) {
    try {
      await generateThumbnail(submission.id, env)
      generated++
    } catch (error) {
      console.error(`Failed to generate thumbnail for ${submission.id}:`, error)
      errors++
    }
  }
  
  return { success: true, generated, errors }
}

