/**
 * Railway Status Routes
 * Provides live deployment status from Railway API
 */

const express = require('express');
const router = express.Router();
const https = require('https');

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;

/**
 * Make Railway GraphQL API request
 */
async function railwayQuery(query, variables = {}) {
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
          const result = JSON.parse(body);
          if (result.errors) {
            reject(new Error(result.errors[0]?.message || 'GraphQL error'));
          } else {
            resolve(result.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Get deployment status for a Railway project
 */
async function getProjectStatus(projectId) {
  const query = `
    query GetProjectStatus($projectId: String!) {
      project(id: $projectId) {
        id
        name
        updatedAt
        environments {
          edges {
            node {
              id
              name
              deployments(first: 1) {
                edges {
                  node {
                    id
                    status
                    createdAt
                    updatedAt
                  }
                }
              }
              serviceInstances {
                edges {
                  node {
                    serviceId
                    serviceName
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

  const data = await railwayQuery(query, { projectId });
  return data.project;
}

/**
 * Get status for a specific service
 */
async function getServiceStatus(projectId, serviceId) {
  const query = `
    query GetServiceStatus($projectId: String!, $serviceId: String!) {
      project(id: $projectId) {
        id
        name
        services {
          edges {
            node {
              id
              name
              deployments(first: 1) {
                edges {
                  node {
                    id
                    status
                    createdAt
                    updatedAt
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await railwayQuery(query, { projectId, serviceId });

  // Find the specific service
  const services = data.project?.services?.edges || [];
  const service = services.find(s => s.node.id === serviceId);

  return service?.node || null;
}

/**
 * Map Railway status to simplified status
 */
function mapStatus(railwayStatus) {
  const statusMap = {
    'SUCCESS': { status: 'healthy', icon: '🟢', label: 'Healthy' },
    'DEPLOYING': { status: 'building', icon: '🟡', label: 'Building' },
    'BUILDING': { status: 'building', icon: '🟡', label: 'Building' },
    'INITIALIZING': { status: 'building', icon: '🟡', label: 'Initializing' },
    'WAITING': { status: 'building', icon: '🟡', label: 'Waiting' },
    'FAILED': { status: 'down', icon: '🔴', label: 'Failed' },
    'CRASHED': { status: 'down', icon: '🔴', label: 'Crashed' },
    'REMOVED': { status: 'removed', icon: '⚫', label: 'Removed' },
    'SLEEPING': { status: 'sleeping', icon: '😴', label: 'Sleeping' }
  };

  return statusMap[railwayStatus] || { status: 'unknown', icon: '⚪', label: railwayStatus || 'Unknown' };
}

/**
 * GET /api/railway/status/:projectId
 * Get status for a Railway project
 */
router.get('/status/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!RAILWAY_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'Railway API not configured'
      });
    }

    const project = await getProjectStatus(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Extract service statuses
    const services = [];
    const environments = project.environments?.edges || [];

    for (const env of environments) {
      const instances = env.node.serviceInstances?.edges || [];
      for (const instance of instances) {
        const deployment = instance.node.latestDeployment;
        const statusInfo = mapStatus(deployment?.status);

        services.push({
          id: instance.node.serviceId,
          name: instance.node.serviceName,
          ...statusInfo,
          lastDeployed: deployment?.createdAt || null
        });
      }
    }

    // Overall status is worst status of all services
    const overallStatus = services.some(s => s.status === 'down') ? 'down' :
                         services.some(s => s.status === 'building') ? 'building' :
                         services.every(s => s.status === 'healthy') ? 'healthy' : 'unknown';

    res.json({
      success: true,
      projectId,
      projectName: project.name,
      overallStatus: mapStatus(overallStatus === 'healthy' ? 'SUCCESS' :
                               overallStatus === 'building' ? 'BUILDING' :
                               overallStatus === 'down' ? 'FAILED' : null),
      services,
      lastUpdated: project.updatedAt,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Railway status check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/railway/status/batch
 * Get status for multiple Railway projects at once
 */
router.post('/status/batch', async (req, res) => {
  try {
    const { projectIds } = req.body;

    if (!RAILWAY_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'Railway API not configured'
      });
    }

    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'projectIds array is required'
      });
    }

    // Limit to 20 projects per batch to avoid rate limits
    const limitedIds = projectIds.slice(0, 20);

    const results = {};
    const errors = {};

    // Fetch in parallel with some concurrency control
    await Promise.all(limitedIds.map(async (projectId) => {
      try {
        const project = await getProjectStatus(projectId);

        if (project) {
          const services = [];
          const environments = project.environments?.edges || [];

          for (const env of environments) {
            const instances = env.node.serviceInstances?.edges || [];
            for (const instance of instances) {
              const deployment = instance.node.latestDeployment;
              services.push({
                name: instance.node.serviceName,
                ...mapStatus(deployment?.status)
              });
            }
          }

          const overallStatus = services.some(s => s.status === 'down') ? 'down' :
                               services.some(s => s.status === 'building') ? 'building' :
                               services.every(s => s.status === 'healthy') ? 'healthy' : 'unknown';

          results[projectId] = {
            projectName: project.name,
            ...mapStatus(overallStatus === 'healthy' ? 'SUCCESS' :
                         overallStatus === 'building' ? 'BUILDING' :
                         overallStatus === 'down' ? 'FAILED' : null),
            services: services.length
          };
        } else {
          errors[projectId] = 'Project not found';
        }
      } catch (e) {
        errors[projectId] = e.message;
      }
    }));

    res.json({
      success: true,
      results,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Railway batch status check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/railway/redeploy/:projectId
 * Trigger a redeploy for a Railway project
 */
router.post('/redeploy/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { serviceId } = req.body;

    if (!RAILWAY_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'Railway API not configured'
      });
    }

    // First get the project to find the environment and service
    const project = await getProjectStatus(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Find the production environment
    const environments = project.environments?.edges || [];
    const prodEnv = environments.find(e => e.node.name === 'production') || environments[0];

    if (!prodEnv) {
      return res.status(404).json({
        success: false,
        error: 'No environment found'
      });
    }

    // Trigger redeploy using the deploymentRedeploy mutation
    const instances = prodEnv.node.serviceInstances?.edges || [];
    const targetInstance = serviceId
      ? instances.find(i => i.node.serviceId === serviceId)
      : instances[0];

    if (!targetInstance?.node.latestDeployment?.id) {
      return res.status(404).json({
        success: false,
        error: 'No deployment found to redeploy'
      });
    }

    const mutation = `
      mutation RedeployDeployment($deploymentId: String!) {
        deploymentRedeploy(id: $deploymentId) {
          id
          status
        }
      }
    `;

    const result = await railwayQuery(mutation, {
      deploymentId: targetInstance.node.latestDeployment.id
    });

    res.json({
      success: true,
      deployment: result.deploymentRedeploy,
      message: 'Redeploy triggered successfully'
    });

  } catch (error) {
    console.error('Railway redeploy failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
