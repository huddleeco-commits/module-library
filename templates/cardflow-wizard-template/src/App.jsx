/**
 * CardFlow Wizard Template App
 * Main application entry point
 */

import React from 'react';
import { CardFlowSetupWizard } from './screens/CardFlowSetupWizard';

const appStyles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16162a 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
};

export default function App() {
  const handleComplete = (setupData) => {
    console.log('Setup complete:', setupData);
    // Navigate to your main application or next screen
    alert('Setup complete! You can now integrate this with your main application.');
  };

  const handleSkip = () => {
    console.log('Setup skipped');
    // Navigate to main application with default settings
    alert('Setup skipped. Using default settings.');
  };

  return (
    <div style={appStyles.container}>
      <CardFlowSetupWizard
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </div>
  );
}
