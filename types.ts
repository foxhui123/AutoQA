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

// Represents a node in the D3 tree visualization
export interface MindMapNode {
  name: string;
  type: 'root' | 'scenario' | 'detail';
  data?: TestCaseScenario;
  children?: MindMapNode[];
}
