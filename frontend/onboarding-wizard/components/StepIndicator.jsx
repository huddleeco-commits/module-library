import React from 'react';

const StepIndicator = ({ steps, currentStep, completedSteps }) => {
  return (
    <div className="step-indicator">
      {steps.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        
        return (
          <div key={step.id} className="step-item">
            <div className={`step-circle ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              {isCompleted ? '✓' : idx + 1}
            </div>
            <span className={`step-label ${isCurrent ? 'current' : ''}`}>{step.label}</span>
            {idx < steps.length - 1 && <div className={`step-line ${isCompleted ? 'completed' : ''}`} />}
          </div>
        );
      })}
      
      <style jsx>{`
        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          margin-bottom: 30px;
        }
        
        .step-item {
          display: flex;
          align-items: center;
          position: relative;
        }
        
        .step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e0e0e0;
          color: #888;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s;
        }
        
        .step-circle.current {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: scale(1.1);
        }
        
        .step-circle.completed {
          background: #22c55e;
          color: white;
        }
        
        .step-label {
          position: absolute;
          top: 45px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: #888;
          white-space: nowrap;
        }
        
        .step-label.current {
          color: #667eea;
          font-weight: 600;
        }
        
        .step-line {
          width: 60px;
          height: 3px;
          background: #e0e0e0;
          margin: 0 8px;
        }
        
        .step-line.completed {
          background: #22c55e;
        }
        
        @media (max-width: 500px) {
          .step-label {
            display: none;
          }
          .step-line {
            width: 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default StepIndicator;
