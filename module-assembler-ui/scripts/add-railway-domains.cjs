/**
 * Add custom domains to Railway project services
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
const PROJECT_ID = '071ffd4d-46ec-45a5-9f7a-2748e1df474b';
const ENVIRONMENT_ID = '0e94e346-46ad-49e2-83a2-bac10be51935'; // From deploy response

// Domains to add
const DOMAIN_MAPPINGS = [
  { serviceName: 'frontend', domain: 'aurelius-steakhouse.be1st.io' },
  { serviceName: 'backend', domain: 'api.aurelius-steakhouse.be1st.io' },
  { serviceName: 'admin', domain: 'admin.aurelius-steakhouse.be1st.io' }
];

async function graphqlRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
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
    req.write(JSON.stringify({ query, variables }));
    req.end();
  });
}

async function getServiceIds() {
  const query = `
    query {
      project(id: "${PROJECT_ID}") {
        services {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  `;

  const result = await graphqlRequest(query);
  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'Failed to get services');
  }

  const services = result.data?.project?.services?.edges || [];
  return services.reduce((acc, s) => {
    acc[s.node.name] = s.node.id;
    return acc;
  }, {});
}

async function addCustomDomain(serviceId, domain) {
  const mutation = `
    mutation($serviceId: String!, $domain: String!, $environmentId: String!, $projectId: String!) {
      customDomainCreate(input: {
        serviceId: $serviceId
        domain: $domain
        environmentId: $environmentId
        projectId: $projectId
      }) {
        id
        domain
        status {
          dnsRecords {
            hostlabel
            requiredValue
            currentValue
            status
          }
        }
      }
    }
  `;

  return await graphqlRequest(mutation, {
    serviceId,
    domain,
    environmentId: ENVIRONMENT_ID,
    projectId: PROJECT_ID
  });
}

async function main() {
  console.log('=== ADDING CUSTOM DOMAINS TO RAILWAY PROJECT ===\n');
  console.log('Project ID:', PROJECT_ID);
  console.log('Environment ID:', ENVIRONMENT_ID);
  console.log('');

  // Get service IDs
  console.log('Getting service IDs...');
  const serviceIds = await getServiceIds();
  console.log('Services found:', Object.keys(serviceIds).join(', '));
  console.log('');

  // Add domains
  for (const mapping of DOMAIN_MAPPINGS) {
    const serviceId = serviceIds[mapping.serviceName];
    if (!serviceId) {
      console.log(`❌ Service not found: ${mapping.serviceName}`);
      continue;
    }

    console.log(`Adding domain: ${mapping.domain} -> ${mapping.serviceName}`);
    console.log(`  Service ID: ${serviceId}`);

    try {
      const result = await addCustomDomain(serviceId, mapping.domain);

      if (result.errors) {
        console.log(`  ❌ Error: ${result.errors[0]?.message || 'Unknown error'}`);
        // Check if domain already exists
        if (result.errors[0]?.message?.includes('already exists')) {
          console.log('  (Domain may already be configured)');
        }
      } else if (result.data?.customDomainCreate) {
        console.log(`  ✅ Domain added: ${result.data.customDomainCreate.domain}`);
        const dnsStatus = result.data.customDomainCreate.status?.dnsRecords?.[0];
        if (dnsStatus) {
          console.log(`  DNS Status: ${dnsStatus.status}`);
        }
      } else {
        console.log('  ⚠️ Unexpected response:', JSON.stringify(result.data));
      }
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
    }

    console.log('');
  }

  console.log('='.repeat(50));
  console.log('DONE - Check site in a few moments');
  console.log('='.repeat(50));
}

main().catch(e => {
  console.log('Fatal error:', e.message);
  process.exit(1);
});
