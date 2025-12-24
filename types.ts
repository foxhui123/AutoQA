
export interface TestCaseScenario {
  id: string;
  scenarioName: string;
  dataPreparation: string;
  steps: string;
  executionAction: string;
  expectedResult: string;
}

export interface TestSuite {
  featureName: string;
  scenarios: TestCaseScenario[];
}

export interface MindMapNode {
  name: string;
  type: 'root' | 'scenario' | 'detail';
  data?: TestCaseScenario;
  children?: MindMapNode[];
}

export type ModelProvider = 'gemini-api' | 'local-nano' | 'local-custom';

export interface ModelOption {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
}
