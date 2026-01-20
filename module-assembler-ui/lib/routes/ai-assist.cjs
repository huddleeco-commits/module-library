/**
 * AI Assist Routes
 * Backend API for AI-powered debugging assistance in Platform Health Test Center
 *
 * Endpoints:
 * - POST /analyze - Analyze error and suggest fix
 * - POST /apply - Apply suggested fix with backup
 * - POST /rollback - Restore original content
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// In-memory storage for rollback (session-scoped)
const backupStore = new Map();

// Security configuration
const ALLOWED_EXTENSIONS = ['.js', '.cjs', '.jsx', '.ts', '.tsx', '.json', '.css'];
const SENSITIVE_FILES = ['.env', 'credentials', 'secrets', 'password', 'token', 'key', '.pem', '.key'];
const ALLOWED_DIRECTORIES = ['module-assembler-ui', 'backend', 'frontend', 'templates', 'lib'];

/**
 * Security validation for file paths
 * Handles both absolute paths and relative paths from health check
 */
function validateFilePath(filePath, baseDir) {
  // Normalize the path
  const normalizedPath = path.normalize(filePath);

  // Check for path traversal
  if (normalizedPath.includes('..')) {
    return { valid: false, error: 'Path traversal not allowed' };
  }

  let resolvedPath;

  // If it's an absolute path, use it directly
  if (path.isAbsolute(normalizedPath)) {
    resolvedPath = normalizedPath;
  } else {
    // Try to resolve relative path - check multiple possible base directories
    const possibleBases = [
      baseDir,                                          // module-library root
      path.join(baseDir, 'module-assembler-ui'),        // module-assembler-ui
      path.join(baseDir, 'module-assembler-ui', 'lib'), // lib folder
      path.join(baseDir, 'backend'),                    // backend
      path.join(baseDir, 'frontend'),                   // frontend
    ];

    for (const base of possibleBases) {
      const candidate = path.resolve(base, normalizedPath);
      if (fs.existsSync(candidate)) {
        resolvedPath = candidate;
        break;
      }
    }

    // If still not found, default to baseDir
    if (!resolvedPath) {
      resolvedPath = path.resolve(baseDir, normalizedPath);
    }
  }

  // Verify the resolved path is within the allowed project structure
  const relativeToBase = path.relative(baseDir, resolvedPath);

  // Must be within the project (not escaping via ..)
  if (relativeToBase.startsWith('..')) {
    return { valid: false, error: 'Path must be within the project directory' };
  }

  // Check if within allowed directories
  const topDir = relativeToBase.split(path.sep)[0];
  if (!ALLOWED_DIRECTORIES.some(dir => relativeToBase.startsWith(dir) || topDir === dir)) {
    return { valid: false, error: `File must be in allowed directories: ${ALLOWED_DIRECTORIES.join(', ')}` };
  }

  // Check extension
  const ext = path.extname(resolvedPath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `File extension not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` };
  }

  // Check for sensitive files
  const fileName = path.basename(resolvedPath).toLowerCase();
  if (SENSITIVE_FILES.some(sensitive => fileName.includes(sensitive))) {
    return { valid: false, error: 'Cannot modify sensitive files' };
  }

  return { valid: true, resolvedPath };
}

/**
 * Create git backup before modifying files
 */
function createGitBackup(filePath) {
  try {
    const dir = path.dirname(filePath);
    // Check if we're in a git repo
    execSync('git rev-parse --is-inside-work-tree', { cwd: dir, stdio: 'pipe' });

    // Stage the current file state
    execSync(`git add "${filePath}"`, { cwd: dir, stdio: 'pipe' });

    // Create a stash point (optional - for extra safety)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    execSync(`git stash push -m "ai-assist-backup-${timestamp}" -- "${filePath}"`, { cwd: dir, stdio: 'pipe' });
    execSync('git stash pop', { cwd: dir, stdio: 'pipe' });

    return { success: true };
  } catch (error) {
    // Git backup is optional - proceed without it
    console.warn('Git backup skipped:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * POST /analyze
 * Analyze a file with error context and suggest a fix using Claude
 */
router.post('/analyze', async (req, res) => {
  const { filePath, errorMessage, stackTrace, exports: moduleExports } = req.body;

  if (!filePath) {
    return res.status(400).json({ success: false, error: 'filePath is required' });
  }

  const startTime = Date.now();

  // Determine base directory (module-library root)
  const baseDir = path.resolve(__dirname, '..', '..', '..');

  // Validate file path
  const validation = validateFilePath(filePath, baseDir);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  const fullPath = validation.resolvedPath;

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  try {
    // Read file content
    const originalContent = fs.readFileSync(fullPath, 'utf-8');

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'AI service not configured (missing API key)' });
    }

    // Build context for Claude
    const fileExtension = path.extname(fullPath);
    const fileName = path.basename(fullPath);
    const relativePath = path.relative(baseDir, fullPath);

    const prompt = `You are a Node.js/React debugging expert. Analyze this file that has an error and provide a fix.

## File Information
- **Path**: ${relativePath}
- **Name**: ${fileName}
- **Extension**: ${fileExtension}
${moduleExports ? `- **Expected Exports**: ${JSON.stringify(moduleExports)}` : ''}

## Error Details
**Error Message**: ${errorMessage || 'Unknown error during module load'}
${stackTrace ? `**Stack Trace**:\n\`\`\`\n${stackTrace}\n\`\`\`` : ''}

## Current File Content
\`\`\`${fileExtension.replace('.', '')}
${originalContent}
\`\`\`

## Your Task
1. Analyze the error and identify the root cause
2. Provide a clear explanation of what's wrong
3. Provide the COMPLETE fixed file content (not just the changed parts)

## Response Format
Respond with a JSON object (no markdown code blocks around it):
{
  "analysis": "Clear explanation of what's wrong and why",
  "rootCause": "The specific issue causing the error",
  "suggestedFix": "The COMPLETE fixed file content - include ALL code, not just changes",
  "explanation": "Step-by-step explanation of the changes made:\\n1. First change...\\n2. Second change...",
  "confidence": "high|medium|low",
  "additionalNotes": "Any warnings or additional context"
}

IMPORTANT: The "suggestedFix" field must contain the ENTIRE file content that would replace the current file. Do not use placeholders or "rest of file" comments.`;

    // Call Claude API
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = response.content[0].text;

    // Parse the JSON response
    let analysisResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI response',
        rawResponse: responseText.substring(0, 500)
      });
    }

    // Store original content for rollback
    const backupId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    backupStore.set(backupId, {
      filePath: fullPath,
      originalContent,
      timestamp: new Date().toISOString()
    });

    // Clean up old backups (keep last 50)
    if (backupStore.size > 50) {
      const oldestKey = backupStore.keys().next().value;
      backupStore.delete(oldestKey);
    }

    const durationMs = Date.now() - startTime;

    res.json({
      success: true,
      analysis: analysisResult.analysis,
      rootCause: analysisResult.rootCause,
      suggestedFix: analysisResult.suggestedFix,
      explanation: analysisResult.explanation,
      confidence: analysisResult.confidence || 'medium',
      additionalNotes: analysisResult.additionalNotes,
      originalContent,
      filePath: fullPath,
      relativePath,
      backupId,
      usage: {
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
        durationMs
      }
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      error: `Analysis failed: ${error.message}`
    });
  }
});

/**
 * POST /apply
 * Apply the suggested fix to the file
 */
router.post('/apply', async (req, res) => {
  const { filePath, suggestedFix, backupId } = req.body;

  if (!filePath || !suggestedFix) {
    return res.status(400).json({ success: false, error: 'filePath and suggestedFix are required' });
  }

  // Determine base directory
  const baseDir = path.resolve(__dirname, '..', '..', '..');

  // Validate file path
  const validation = validateFilePath(filePath, baseDir);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  const fullPath = validation.resolvedPath;

  try {
    // Read current content for backup
    let originalContent = '';
    if (fs.existsSync(fullPath)) {
      originalContent = fs.readFileSync(fullPath, 'utf-8');
    }

    // Store backup if not already stored
    let effectiveBackupId = backupId;
    if (!backupId || !backupStore.has(backupId)) {
      effectiveBackupId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      backupStore.set(effectiveBackupId, {
        filePath: fullPath,
        originalContent,
        timestamp: new Date().toISOString()
      });
    }

    // Create git backup (optional)
    createGitBackup(fullPath);

    // Write the fix
    fs.writeFileSync(fullPath, suggestedFix, 'utf-8');

    console.log(`AI Assist: Applied fix to ${fullPath}`);

    res.json({
      success: true,
      message: 'Fix applied successfully',
      filePath: fullPath,
      backupId: effectiveBackupId,
      canRollback: true
    });

  } catch (error) {
    console.error('Apply fix error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to apply fix: ${error.message}`
    });
  }
});

/**
 * POST /rollback
 * Restore original content from backup
 */
router.post('/rollback', async (req, res) => {
  const { backupId, filePath } = req.body;

  if (!backupId) {
    return res.status(400).json({ success: false, error: 'backupId is required' });
  }

  const backup = backupStore.get(backupId);

  if (!backup) {
    return res.status(404).json({ success: false, error: 'Backup not found or expired' });
  }

  // Verify file path matches if provided
  if (filePath && backup.filePath !== filePath) {
    return res.status(400).json({ success: false, error: 'File path does not match backup' });
  }

  try {
    // Restore original content
    fs.writeFileSync(backup.filePath, backup.originalContent, 'utf-8');

    // Remove backup after successful rollback
    backupStore.delete(backupId);

    console.log(`AI Assist: Rolled back ${backup.filePath}`);

    res.json({
      success: true,
      message: 'Rollback successful',
      filePath: backup.filePath,
      restoredAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Rollback error:', error);
    res.status(500).json({
      success: false,
      error: `Rollback failed: ${error.message}`
    });
  }
});

/**
 * GET /backups
 * List available backups (for debugging)
 */
router.get('/backups', (req, res) => {
  const backups = [];
  for (const [id, backup] of backupStore.entries()) {
    backups.push({
      id,
      filePath: backup.filePath,
      timestamp: backup.timestamp,
      contentLength: backup.originalContent.length
    });
  }
  res.json({ success: true, backups });
});

module.exports = router;
