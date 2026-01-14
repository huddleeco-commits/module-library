import React, { useState, useEffect } from 'react';
import StepIndicator from '../components/StepIndicator';
import ProfileStep from '../components/ProfileStep';
import PhoneVerifyStep from '../components/PhoneVerifyStep';
import PayoutSetupStep from '../components/PayoutSetupStep';
import CompletionStep from '../components/CompletionStep';

const OnboardingWizard = ({ 
  apiBase = '/api',
  availableProviders = ['paypal'],
  onComplete,
  initialStep = 'profile'
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [totalRewards, setTotalRewards] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const steps = [
    { id: 'profile', label: 'Profile' },
    { id: 'verify_phone', label: 'Verify' },
    { id: 'payout_setup', label: 'Payout' },
    { id: 'complete', label: 'Done' }
  ];
  
  // Load current progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch(`${apiBase}/onboarding/progress`, {
          credentials: 'include'
        });
        const data = await res.json();
        
        if (data.success && data.progress) {
          const completed = data.progress.steps
            .filter(s => s.completed)
            .map(s => s.name);
          setCompletedSteps(completed);
          setTotalRewards(data.progress.totalRewardsEarned || 0);
          
          // Find next incomplete step
          const nextStep = data.progress.currentStep;
          if (nextStep && nextStep !== 'complete') {
            setCurrentStep(nextStep);
          }
        }
      } catch (err) {
        console.error('Failed to load progress:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProgress();
  }, [apiBase]);
  
  const completeStep = async (stepId, data = {}) => {
    try {
      // Save step-specific data
      if (stepId === 'profile' && Object.keys(data).length > 0) {
        await fetch(`${apiBase}/onboarding/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });
      }
      
      // Mark step complete
      const res = await fetch(`${apiBase}/onboarding/complete/${stepId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const result = await res.json();
      
      if (result.success) {
        setCompletedSteps(prev => [...prev, stepId]);
        if (result.rewardEarned) {
          setTotalRewards(prev => prev + result.rewardEarned);
        }
        
        // Move to next step
        const stepOrder = ['profile', 'verify_phone', 'payout_setup', 'complete'];
        const currentIdx = stepOrder.indexOf(stepId);
        if (currentIdx < stepOrder.length - 1) {
          setCurrentStep(stepOrder[currentIdx + 1]);
        }
      }
    } catch (err) {
      console.error('Failed to complete step:', err);
    }
  };
  
  const handleSkip = () => {
    const stepOrder = ['profile', 'verify_phone', 'payout_setup', 'complete'];
    const currentIdx = stepOrder.indexOf(currentStep);
    if (currentIdx < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIdx + 1]);
    }
  };
  
  const handleFinish = () => {
    if (onComplete) onComplete();
  };
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <style jsx>{`
          .loading { display: flex; justify-content: center; padding: 60px; }
          .spinner { width: 40px; height: 40px; border: 3px solid #e0e0e0; border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }
  
  return (
    <div className="onboarding-wizard">
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />
      
      {currentStep === 'profile' && (
        <ProfileStep
          onComplete={(data) => completeStep('profile', data)}
          onSkip={handleSkip}
        />
      )}
      
      {currentStep === 'verify_phone' && (
        <PhoneVerifyStep
          apiBase={apiBase}
          onComplete={() => completeStep('verify_phone')}
          onSkip={handleSkip}
        />
      )}
      
      {currentStep === 'payout_setup' && (
        <PayoutSetupStep
          apiBase={apiBase}
          availableProviders={availableProviders}
          onComplete={() => completeStep('payout_setup')}
          onSkip={handleSkip}
        />
      )}
      
      {currentStep === 'complete' && (
        <CompletionStep
          totalRewards={totalRewards}
          onFinish={handleFinish}
        />
      )}
      
      <style jsx>{`
        .onboarding-wizard {
          min-height: 100vh;
          background: #fff;
          padding-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default OnboardingWizard;
