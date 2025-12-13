# API Documentation

This document describes all API endpoints available in the Model Benchmark application.

## Base URL

All endpoints are prefixed with `/api`.

## Projects

### GET /api/projects

List all projects.

**Query Parameters:**
- `includePrompts` (boolean, optional): Include prompts for each project
- `includeModels` (boolean, optional, default: true): Include approved submissions as "models"

**Response:**
```json
{
  "projects": [
    {
      "id": "string",
      "label": "string",
      "folder": "string",
      "prompts": [...],  // if includePrompts=true
      "models": [...]    // if includeModels=true
    }
  ],
  "total": number
}
```

### GET /api/projects/:id

Get a single project by ID.

**Query Parameters:**
- `includePrompts` (boolean, optional): Include prompts
- `includeModels` (boolean, optional, default: true): Include approved submissions

**Response:**
```json
{
  "id": "string",
  "label": "string",
  "folder": "string",
  "prompts": [...],  // if includePrompts=true
  "models": [...]    // if includeModels=true
}
```

### GET /api/projects/:id/prompts

Get prompts for a project.

**Query Parameters:**
- `difficulty` (string, optional): Filter by difficulty ('small', 'medium', 'advanced')

**Response:**
```json
{
  "projectId": "string",
  "prompts": [
    {
      "id": "string",
      "projectId": "string",
      "difficulty": "small" | "medium" | "advanced",
      "title": "string",
      "content": "string",
      "createdAt": "ISO string",
      "updatedAt": "ISO string"
    }
  ],
  "total": number
}
```

## Submissions

### GET /api/submissions

List submissions with optional filters.

**Query Parameters:**
- `projectId` (string, optional): Filter by project ID
- `status` (string, optional): Filter by status ('pending', 'approved', 'rejected')
- `limit` (number, optional, default: 50): Number of results
- `offset` (number, optional, default: 0): Pagination offset

**Response:**
```json
{
  "submissions": [
    {
      "id": "string",
      "projectId": "string",
      "agentName": "string",
      "label": "string",
      "filePath": "string",
      "htmlContent": "string",
      "thumbnail": "string | null",
      "status": "pending" | "approved" | "rejected",
      "submittedAt": "ISO string",
      "reviewedAt": "ISO string | null",
      "reviewerNotes": "string | null"
    }
  ],
  "total": number,
  "limit": number,
  "offset": number
}
```

### POST /api/submissions

Create a new submission.

**Request Body:**
```json
{
  "projectId": "string",
  "agentName": "string",
  "label": "string",
  "filePath": "string",  // Must end with /index.html
  "htmlContent": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "projectId": "string",
  "agentName": "string",
  "label": "string",
  "filePath": "string",
  "htmlContent": "string",
  "thumbnail": "string",
  "status": "pending",
  "submittedAt": "ISO string"
}
```

### GET /api/submissions/:id

Get a single submission by ID.

**Response:**
```json
{
  "id": "string",
  "projectId": "string",
  "agentName": "string",
  "label": "string",
  "filePath": "string",
  "htmlContent": "string",
  "thumbnail": "string | null",
  "status": "pending" | "approved" | "rejected",
  "submittedAt": "ISO string",
  "reviewedAt": "ISO string | null",
  "reviewerNotes": "string | null"
}
```

### PUT /api/submissions/:id

Update a submission (typically used for review).

**Request Body:**
```json
{
  "status": "pending" | "approved" | "rejected",  // optional
  "reviewerNotes": "string"  // optional
}
```

**Response:**
Updated submission object (same format as GET /api/submissions/:id)

### DELETE /api/submissions/:id

Delete a submission.

**Response:**
```json
{
  "success": true
}
```

### GET /api/submissions/:id/content

Get HTML content for an approved submission (for display in iframe).

**Response:**
HTML content (text/html)

**Note:** Only approved submissions can be accessed via this endpoint.

## Prompts

### POST /api/prompts

Create or update a prompt (upsert).

**Request Body:**
```json
{
  "projectId": "string",
  "difficulty": "small" | "medium" | "advanced",
  "title": "string",
  "content": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "projectId": "string",
  "difficulty": "small" | "medium" | "advanced",
  "title": "string",
  "content": "string",
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}
```

## Admin Endpoints

### POST /api/admin/projects

Create a new project.

**Request Body:**
```json
{
  "id": "string",  // lowercase, alphanumeric, hyphens only
  "label": "string",
  "folder": "string"
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "string",
    "label": "string",
    "folder": "string"
  }
}
```

### PUT /api/admin/projects/:id

Update a project.

**Request Body:**
```json
{
  "label": "string",
  "folder": "string"
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "string",
    "label": "string",
    "folder": "string"
  }
}
```

### DELETE /api/admin/projects/:id

Delete a project.

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Note:** Cannot delete projects that have submissions. Delete submissions first.

### POST /api/admin/init-projects

Initialize default projects (convenience endpoint for first-time setup).

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "string",
      "status": "created" | "skipped" | "error",
      "message": "string"
    }
  ]
}
```

### POST /api/admin/backfill-thumbnails

Generate thumbnails for submissions that don't have them.

**Query Parameters:**
- `regenerate` (boolean, optional): Regenerate all thumbnails, not just missing ones

**Response:**
```json
{
  "success": true,
  "processed": number,
  "succeeded": number,
  "failed": number,
  "errors": ["string"]  // optional, only if errors occurred
}
```

### POST /api/admin/seed-submissions

Seed database with test submissions (development only).

**Response:**
```json
{
  "success": true,
  "submissionsCreated": number,
  "message": "string"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "statusCode": number,
  "statusMessage": "string"
}
```

Common status codes:
- `400`: Bad Request (validation errors, missing required fields)
- `403`: Forbidden (e.g., trying to access unapproved submission content)
- `404`: Not Found (resource doesn't exist)
- `409`: Conflict (e.g., project ID already exists)
- `500`: Internal Server Error
- `503`: Service Unavailable (database not available)

