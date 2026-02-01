/**
 * Screens Index
 * Re-exports all screen components
 */

// Flow screens
export { ChoosePathStep } from './ChoosePathStep.jsx';
export { QuickStep } from './QuickStep.jsx';
export { OrchestratorStep } from './OrchestratorStep.jsx';
export { RebuildStep } from './RebuildStep.jsx';
export { UploadAssetsStep } from './UploadAssetsStep.jsx';
export { ReferenceStep } from './ReferenceStep.jsx';
export { CustomizeStep, customizeStyles, p1Styles, layoutStyles } from './CustomizeStep.jsx';

// Error screens
export { ErrorStep } from './ErrorStep.jsx';
export { DeployErrorStep } from './DeployErrorStep.jsx';

// Progress screens
export { GeneratingStep } from './GeneratingStep.jsx';
export { DeployingStep } from './DeployingStep.jsx';
export { DeployCompleteStep } from './DeployCompleteStep.jsx';
export { CompanionDeployCompleteStep } from './CompanionDeployCompleteStep.jsx';

// Dashboard screens
export { MyDeploymentsPage } from './MyDeploymentsPage.jsx';

// Preview screen
export { PreviewStep } from './PreviewStep.jsx';

// Complete screens
export { CompleteStep } from './CompleteStep.jsx';
export { ToolCompleteScreen } from './ToolCompleteScreen.jsx';

// Choice and customization screens
export { ChoiceScreen } from './ChoiceScreen.jsx';
export { SiteCustomizationScreen } from './SiteCustomizationScreen.jsx';
export { ToolCustomizationScreen } from './ToolCustomizationScreen.jsx';

// Tools screens
export { RecommendedToolsScreen } from './RecommendedToolsScreen.jsx';
export { ToolSuiteBuilderScreen } from './ToolSuiteBuilderScreen.jsx';
export { SuiteCompleteScreen } from './SuiteCompleteScreen.jsx';

// Tool Suite Flow (new)
export { ToolSuiteGuidedStep } from './ToolSuiteGuidedStep.jsx';
export { ToolSuiteInstantStep } from './ToolSuiteInstantStep.jsx';
export { ToolSuiteCustomStep } from './ToolSuiteCustomStep.jsx';

// App Flow (new)
export { AppGuidedStep } from './AppGuidedStep.jsx';
export { AppAIBuilderStep } from './AppAIBuilderStep.jsx';
export { AppAdvancedStep } from './AppAdvancedStep.jsx';
export { CompanionAppStep } from './CompanionAppStep.jsx';

// Full Control Mode
export { FullControlFlow } from './FullControlFlow.jsx';

// CardFlow Setup Wizard
export { CardFlowSetupWizard } from './CardFlowSetupWizard.jsx';

// Demo Mode (Investor)
export { DemoBatchStep } from './DemoBatchStep.jsx';

// Landing Page
export { default as LandingPage } from './LandingPage.jsx';

// Admin Tools
export { StylePreviewAdmin } from './StylePreviewAdmin.jsx';

// Studio Mode (Full Visual Control)
export { default as StudioMode } from './StudioMode.jsx';

// Generation Studio (New Unified Interface)
export { default as StudioPage } from './StudioPage.jsx';
