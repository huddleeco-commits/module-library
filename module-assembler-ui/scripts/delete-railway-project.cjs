/**
 * Delete a Railway project
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;

// Project to DELETE (older one that DNS doesn't point to)
const PROJECT_TO_DELETE = '24b345b6-39ed-4abe-886a-a415d93ec5fd';

// Safety check - project to KEEP
const PROJECT_TO_KEEP = '071ffd4d-46ec-45a5-9f7a-2748e1df474b';

if (!RAILWAY_TOKEN) {
  console.log('ERROR: RAILWAY_TOKEN not found');
  process.exit(1);
}

async function deleteProject(projectId) {
  return new Promise((resolve, reject) => {
    const mutation = `
      mutation {
        projectDelete(id: "${projectId}")
      }
    `;

    const options = {
      hostname: 'backboard.railway.app',
      path: '/graphql/v2',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + RAILWAY_TOKEN
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query: mutation }));
    req.end();
  });
}

async function verifyProject(projectId) {
  return new Promise((resolve, reject) => {
    const query = `
      query {
        project(id: "${projectId}") {
          id
          name
        }
      }
    `;

    const options = {
      hostname: 'backboard.railway.app',
      path: '/graphql/v2',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + RAILWAY_TOKEN
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query }));
    req.end();
  });
}

async function main() {
  console.log('=== RAILWAY PROJECT DELETION ===\n');
  console.log('Project to DELETE:', PROJECT_TO_DELETE);
  console.log('Project to KEEP:  ', PROJECT_TO_KEEP);
  console.log('');

  // Safety check: Verify the project to keep still exists
  console.log('Safety check: Verifying project to KEEP exists...');
  const keepResult = await verifyProject(PROJECT_TO_KEEP);
  if (!keepResult.data?.project) {
    console.log('❌ ERROR: Project to KEEP not found! Aborting deletion.');
    process.exit(1);
  }
  console.log('✅ Project to KEEP exists:', keepResult.data.project.name);

  // Verify the project to delete exists
  console.log('\nVerifying project to DELETE exists...');
  const deleteResult = await verifyProject(PROJECT_TO_DELETE);
  if (!deleteResult.data?.project) {
    console.log('✅ Project to DELETE already gone or not found. Nothing to do.');
    process.exit(0);
  }
  console.log('Found project to DELETE:', deleteResult.data.project.name);

  // Perform deletion
  console.log('\n' + '─'.repeat(50));
  console.log('DELETING PROJECT:', PROJECT_TO_DELETE);
  console.log('─'.repeat(50));

  try {
    const result = await deleteProject(PROJECT_TO_DELETE);

    if (result.errors) {
      console.log('❌ Deletion failed:', result.errors[0]?.message || 'Unknown error');
      process.exit(1);
    }

    if (result.data?.projectDelete === true) {
      console.log('✅ Project deleted successfully!');
    } else {
      console.log('⚠️  Unexpected response:', JSON.stringify(result.data));
    }
  } catch (e) {
    console.log('❌ Error:', e.message);
    process.exit(1);
  }

  // Verify deletion
  console.log('\nVerifying deletion...');
  const verifyDelete = await verifyProject(PROJECT_TO_DELETE);
  if (!verifyDelete.data?.project) {
    console.log('✅ Confirmed: Project has been deleted');
  } else {
    console.log('⚠️  Project may still exist');
  }

  // Final verification that kept project is still there
  console.log('\nFinal check: Verifying KEPT project still exists...');
  const finalCheck = await verifyProject(PROJECT_TO_KEEP);
  if (finalCheck.data?.project) {
    console.log('✅ Project to KEEP is still active:', finalCheck.data.project.name);
  } else {
    console.log('❌ WARNING: Project to KEEP not found!');
  }

  console.log('\n' + '='.repeat(50));
  console.log('CLEANUP COMPLETE');
  console.log('='.repeat(50));
}

main().catch(e => {
  console.log('Fatal error:', e.message);
  process.exit(1);
});
