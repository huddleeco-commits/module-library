/**
 * Blink Agents Index
 *
 * Centralized access to all agent modules.
 * These are ADDITIVE - they don't modify existing pipeline code.
 *
 * Usage:
 *   const { RalphWiggumAgent, TestRunnerAgent, MasterAgent, ScoutAgent } = require('./lib/agents');
 */

const { RalphWiggumAgent } = require('./ralph-wiggum-agent.cjs');
const { TestRunnerAgent } = require('./test-runner-agent.cjs');
const { MasterAgent } = require('./master-agent.cjs');
const { ScoutAgent } = require('./scout-agent.cjs');

module.exports = {
  RalphWiggumAgent,
  TestRunnerAgent,
  MasterAgent,
  ScoutAgent
};
