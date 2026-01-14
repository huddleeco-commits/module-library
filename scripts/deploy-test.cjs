/**
 * Quick deploy script for testing
 */

const { deployProject, checkCredentials } = require('../module-assembler-ui/services/deploy-service.cjs');

const projectPath = 'C:\\Users\\huddl\\OneDrive\\Desktop\\generated-projects\\test-full';
const projectName = 'test-full';

async function main() {
  console.log('Checking credentials...');

  if (!checkCredentials()) {
    console.error('Missing credentials. Make sure .env is configured in module-assembler-ui/');
    process.exit(1);
  }

  console.log('Starting deployment...');

  const result = await deployProject(projectPath, projectName, {
    adminEmail: 'admin@test-full.be1st.io'
  });

  if (result.success) {
    console.log('\n\n========================================');
    console.log('DEPLOYMENT SUCCESSFUL!');
    console.log('========================================');
    console.log('URLs:', JSON.stringify(result.urls, null, 2));
    console.log('Credentials:', JSON.stringify(result.credentials, null, 2));
  } else {
    console.error('Deployment failed:', result.errors);
  }
}

main().catch(console.error);
