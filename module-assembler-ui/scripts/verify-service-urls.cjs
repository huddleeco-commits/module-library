/**
 * Verify which Railway project owns the service URLs that DNS points to
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;

// DNS points to these URLs
const TARGET_URLS = [
  'frontend-production-a256.up.railway.app',
  'backend-production-1e6e.up.railway.app',
  'admin-production-99b7.up.railway.app'
];

const PROJECT_IDS = [
  { id: '24b345b6-39ed-4abe-886a-a415d93ec5fd', label: 'OLDER' },
  { id: '071ffd4d-46ec-45a5-9f7a-2748e1df474b', label: 'NEWER' }
];

async function queryProject(projectId) {
  return new Promise((resolve, reject) => {
    const query = `
      query {
        project(id: "${projectId}") {
          id
          name
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
                        serviceDomains {
                          domain
                        }
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
  console.log('=== VERIFYING SERVICE URL OWNERSHIP ===\n');
  console.log('DNS currently points to:');
  TARGET_URLS.forEach(url => console.log('  - ' + url));
  console.log('');

  for (const project of PROJECT_IDS) {
    console.log('─'.repeat(60));
    console.log('Checking project: ' + project.label + ' (' + project.id.substring(0, 8) + '...)');
    console.log('─'.repeat(60));

    try {
      const result = await queryProject(project.id);

      if (result.errors || !result.data?.project) {
        console.log('  Error or not found');
        continue;
      }

      const proj = result.data.project;
      const services = proj.services?.edges || [];

      let matchCount = 0;
      services.forEach(s => {
        const svc = s.node;
        const instances = svc.serviceInstances?.edges || [];
        const serviceDomains = instances[0]?.node?.domains?.serviceDomains || [];

        serviceDomains.forEach(d => {
          const matches = TARGET_URLS.some(t => t === d.domain);
          if (matches) {
            console.log('  ✅ MATCH: ' + svc.name + ' -> ' + d.domain);
            matchCount++;
          } else {
            console.log('     ' + svc.name + ' -> ' + d.domain);
          }
        });
      });

      if (matchCount === TARGET_URLS.length) {
        console.log('\n  >>> THIS PROJECT OWNS ALL DNS TARGET URLs <<<');
      } else if (matchCount > 0) {
        console.log('\n  Partial match: ' + matchCount + '/' + TARGET_URLS.length);
      } else {
        console.log('\n  No matching URLs - DNS does NOT point to this project');
      }

    } catch (e) {
      console.log('  Error:', e.message);
    }

    console.log('');
  }

  console.log('='.repeat(60));
  console.log('CONCLUSION');
  console.log('='.repeat(60));
  console.log('');
  console.log('The project whose service URLs match the DNS CNAME records');
  console.log('is the one currently serving traffic. The other can be deleted.');
}

main();
