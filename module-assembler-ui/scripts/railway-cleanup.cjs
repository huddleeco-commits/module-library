/**
 * Railway Cleanup Script
 * Lists and deletes test projects
 */
const https = require('https');
require('dotenv').config();

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;

function railwayQuery(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });

    const req = https.request({
      hostname: 'backboard.railway.app',
      path: '/graphql/v2',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RAILWAY_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Invalid JSON: ' + body));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function listProjects() {
  const teamId = process.env.RAILWAY_TEAM_ID;

  // Try projects query with teamId
  const query = teamId
    ? `query { projects(teamId: "${teamId}") { edges { node { id name createdAt } } } }`
    : `query { projects { edges { node { id name createdAt } } } }`;

  console.log('Querying with teamId:', teamId || 'none');

  const result = await railwayQuery(query);

  // Debug: show raw response
  if (!result.data?.projects?.edges) {
    console.log('Raw API response:', JSON.stringify(result, null, 2));
  }

  if (result.data?.projects?.edges) {
    return result.data.projects.edges.map(e => e.node);
  }

  return [];
}

async function deleteProject(projectId, projectName) {
  const query = `mutation { projectDelete(id: "${projectId}") }`;
  const result = await railwayQuery(query);

  if (result.data?.projectDelete) {
    console.log(`   ✅ Deleted: ${projectName}`);
    return true;
  } else {
    console.log(`   ❌ Failed to delete ${projectName}:`, result.errors?.[0]?.message || 'Unknown error');
    return false;
  }
}

async function main() {
  console.log('🚂 Railway Project Cleanup\n');

  const projects = await listProjects();
  console.log(`Found ${projects.length} total projects\n`);

  // Find test-mozart projects
  const testProjects = projects.filter(p =>
    p.name.includes('test-mozart') ||
    p.name.includes('mozart-bakery')
  );

  if (testProjects.length === 0) {
    console.log('No test-mozart projects found to clean up.');

    // Show all projects for reference
    console.log('\nAll projects:');
    projects.forEach(p => console.log(`  - ${p.name} (${p.id})`));
    return;
  }

  console.log(`Found ${testProjects.length} test-mozart projects to delete:\n`);
  testProjects.forEach(p => console.log(`  - ${p.name} (${p.id})`));

  console.log('\nDeleting...\n');

  for (const project of testProjects) {
    await deleteProject(project.id, project.name);
  }

  console.log('\n✅ Cleanup complete!');
}

main().catch(console.error);
