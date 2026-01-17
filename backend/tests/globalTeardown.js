/**
 * Global Teardown for Jest Tests
 *
 * Runs once after all test files complete.
 * Cleans up any global resources.
 */

module.exports = async () => {
  console.log('\n🧹 Cleaning up test environment...');

  // Note: In a real teardown, you might:
  // - Stop test database container
  // - Clean up temp files
  // - Close connections
  //
  // For now, we're using mocks so no cleanup needed

  console.log('✅ Test cleanup complete\n');
};
