/**
 * Query specific Railway projects by ID
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;

// Known project IDs
const PROJECT_IDS = [
  '24b345b6-39ed-4abe-886a-a415d93ec5fd',  // Original
  '071ffd4d-46ec-45a5-9f7a-2748e1df474b'   // New (from recent deploy)
];

if (!RAILWAY_TOKEN) {
  console.log('ERROR: RAILWAY_TOKEN not found in .env');
  process.exit(1);
}

async function queryProject(projectId) {
  return new Promise((resolve, reject) => {
    const query = `
      query {
        project(id: "${projectId}") {
          id
          name
          createdAt
          updatedAt
          services {
            edges {
              node {
                id
                name
                serviceInstances {
                  edges {
                    node {
                      id
                      domains {
                        customDomains {
                          id
                          domain
                        }
                      }
                      latestDeployment {
                        id
                        status
                        createdAt
                      }
                    }
                  }
                }
              }
            }
          }
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
          const result = JSON.parse(data);
          resolve(result);
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
  console.log('=== RAILWAY PROJECT COMPARISON ===\n');
  console.log('Checking', PROJECT_IDS.length, 'known project IDs...\n');

  const projects = [];

  for (const id of PROJECT_IDS) {
    console.log('Querying:', id);
    try {
      const result = await queryProject(id);

      if (result.errors) {
        console.log('  Error:', result.errors[0]?.message || 'Unknown error');
        continue;
      }

      if (!result.data?.project) {
        console.log('  Project not found or deleted');
        continue;
      }

      const proj = result.data.project;
      projects.push(proj);
      console.log('  Found:', proj.name);
    } catch (e) {
      console.log('  Request error:', e.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('PROJECT DETAILS');
  console.log('='.repeat(70));

  // Sort by creation date
  projects.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  projects.forEach((proj, i) => {
    const services = proj.services?.edges || [];
    const created = new Date(proj.createdAt);
    const updated = new Date(proj.updatedAt);
    const isOlder = i === 0 && projects.length > 1;
    const isNewer = i === projects.length - 1 && projects.length > 1;

    console.log('\n' + '─'.repeat(70));
    console.log('Project ' + (i+1) + (isOlder ? ' <<< OLDER (candidate for deletion)' : isNewer ? ' <<< NEWER (keep this one)' : '') + ':');
    console.log('─'.repeat(70));
    console.log('  ID:       ', proj.id);
    console.log('  Name:     ', proj.name);
    console.log('  Created:  ', created.toISOString());
    console.log('  Updated:  ', updated.toISOString());
    console.log('  Services: ', services.length);

    services.forEach(s => {
      const svc = s.node;
      const instances = svc.serviceInstances?.edges || [];
      const deployment = instances[0]?.node?.latestDeployment;
      const domains = instances[0]?.node?.domains?.customDomains || [];

      console.log('\n    Service:', svc.name);
      if (deployment) {
        console.log('      Status:', deployment.status);
        console.log('      Deploy:', new Date(deployment.createdAt).toISOString());
      }
      if (domains.length > 0) {
        console.log('      Domains:', domains.map(d => d.domain).join(', '));
      }
    });
  });

  if (projects.length >= 2) {
    const older = projects[0];
    const newer = projects[projects.length - 1];

    console.log('\n' + '='.repeat(70));
    console.log('RECOMMENDATION');
    console.log('='.repeat(70));
    console.log('\nSAFE TO DELETE (older):');
    console.log('  ID:   ', older.id);
    console.log('  Name: ', older.name);
    console.log('  Age:  ', Math.round((Date.now() - new Date(older.createdAt)) / (1000*60*60)), 'hours old');

    console.log('\nKEEP (newer):');
    console.log('  ID:   ', newer.id);
    console.log('  Name: ', newer.name);
    console.log('  Age:  ', Math.round((Date.now() - new Date(newer.createdAt)) / (1000*60*60)), 'hours old');

    // Check if newer has all services healthy
    const newerServices = newer.services?.edges || [];
    const healthyServices = newerServices.filter(s => {
      const deployment = s.node.serviceInstances?.edges?.[0]?.node?.latestDeployment;
      return deployment?.status === 'SUCCESS';
    });

    console.log('\nNewer project health:');
    console.log('  Total services:', newerServices.length);
    console.log('  Healthy (SUCCESS):', healthyServices.length);

    if (healthyServices.length === newerServices.length && newerServices.length >= 3) {
      console.log('\n✅ SAFE TO PROCEED - Newer project is healthy');
    } else {
      console.log('\n⚠️  WARNING - Newer project may not be fully healthy');
    }
  } else if (projects.length === 1) {
    console.log('\n✅ Only 1 project exists - nothing to clean up');
  } else {
    console.log('\n❌ No projects found');
  }
}

main().catch(e => console.log('Error:', e.message));
