/**
 * Routes Index
 * Re-exports all route factory functions
 */

const { createAuthRoutes } = require('./auth.cjs');
const { createConfigRoutes } = require('./config.cjs');
const { createUtilityRoutes } = require('./utility.cjs');
const { createDeployRoutes, autoDeployProject } = require('./deploy.cjs');
const { createOrchestratorRoutes } = require('./orchestrator.cjs');
const { createStudioRoutes } = require('./studio.cjs');
const { createContentGeneratorRoutes } = require('./content-generator.cjs');
const { createContentSchedulerRoutes } = require('./content-scheduler.cjs');
const { createPlatformPublisherRoutes } = require('./platform-publisher.cjs');
const { createSocialMediaRoutes } = require('./social-media.cjs');

module.exports = {
  createAuthRoutes,
  createConfigRoutes,
  createUtilityRoutes,
  createDeployRoutes,
  autoDeployProject,
  createOrchestratorRoutes,
  createStudioRoutes,
  createContentGeneratorRoutes,
  createContentSchedulerRoutes,
  createPlatformPublisherRoutes,
  createSocialMediaRoutes
};
