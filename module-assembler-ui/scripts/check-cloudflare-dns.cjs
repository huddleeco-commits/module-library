/**
 * Check Cloudflare DNS records for aurelius-steakhouse domains
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');

const CLOUDFLARE_TOKEN = process.env.CLOUDFLARE_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

if (!CLOUDFLARE_TOKEN || !CLOUDFLARE_ZONE_ID) {
  console.log('ERROR: CLOUDFLARE_TOKEN or CLOUDFLARE_ZONE_ID not found');
  process.exit(1);
}

const domains = [
  'aurelius-steakhouse',
  'api.aurelius-steakhouse',
  'admin.aurelius-steakhouse'
];

async function getDnsRecords() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?per_page=100`,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + CLOUDFLARE_TOKEN,
        'Content-Type': 'application/json'
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
    req.end();
  });
}

async function main() {
  console.log('=== CLOUDFLARE DNS RECORDS FOR AURELIUS-STEAKHOUSE ===\n');

  try {
    const result = await getDnsRecords();

    if (!result.success) {
      console.log('API Error:', result.errors);
      return;
    }

    const records = result.result || [];
    const aureliusRecords = records.filter(r =>
      r.name.toLowerCase().includes('aurelius-steakhouse')
    );

    console.log('Found', aureliusRecords.length, 'DNS records for aurelius-steakhouse:\n');

    aureliusRecords.forEach(r => {
      console.log('─'.repeat(60));
      console.log('Name:    ', r.name);
      console.log('Type:    ', r.type);
      console.log('Content: ', r.content);
      console.log('Proxied: ', r.proxied ? 'Yes (orange cloud)' : 'No (DNS only)');
      console.log('ID:      ', r.id);
    });

    console.log('\n' + '='.repeat(60));
    console.log('ANALYSIS');
    console.log('='.repeat(60));

    // Check if any point to Railway
    const railwayRecords = aureliusRecords.filter(r =>
      r.content.includes('railway.app')
    );

    if (railwayRecords.length > 0) {
      console.log('\nDNS records pointing to Railway:');
      railwayRecords.forEach(r => {
        console.log('  ' + r.name + ' -> ' + r.content);
      });

      // Determine which Railway project based on URL pattern
      console.log('\nThese Railway URLs need to be verified against project services.');
    } else {
      console.log('\nNo DNS records pointing directly to Railway found.');
      console.log('Records may be using Railway custom domain feature (CNAME to be1st.io).');
    }

  } catch (e) {
    console.log('Error:', e.message);
  }
}

main();
