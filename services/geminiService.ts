import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TestSuite } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

const testCaseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    featureName: {
      type: Type.STRING,
      description: "被测试的功能名称",
    },
    scenarios: {
      type: Type.ARRAY,
      description: "基于需求分析出的测试场景列表",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "场景编号 (例如: TC_001)" },
          scenarioName: { type: Type.STRING, description: "场景名称简述" },
          dataPreparation: { type: Type.STRING, description: "测试数据准备" },
          steps: { type: Type.STRING, description: "操作步骤" },
          executionAction: { type: Type.STRING, description: "执行动作" },
          expectedResult: { type: Type.STRING, description: "预期结果" },
        },
        required: ["id", "scenarioName", "dataPreparation", "steps", "executionAction", "expectedResult"],
      },
    },
  },
  required: ["featureName", "scenarios"],
};

export const generateTestCases = async (requirements: string): Promise<TestSuite> => {
  if (!requirements.trim()) {
    throw new Error("请输入需求描述。");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        你是一位资深软件测试工程师（QA）。你的任务是分析以下软件需求描述，并生成一套完整的测试用例。
        
        需求描述:
        "${requirements}"
        
        请输出 JSON 格式，内容必须使用**中文**。
        每个测试用例必须严格遵循以下格式要求：

        1. Feature Name (功能名称)
        2. Scenario ID (场景编号)
        3. Data Preparation (测试数据准备 - 如果不需要特殊数据，请填"无"。**如果有多项准备工作，必须使用数字序号（1., 2.）并强制换行(\\n)显示**)
        4. Steps (操作步骤 - **必须**使用数字序号（1., 2.）描述每一步操作，每一步之间**必须**使用换行符(\\n)分隔。)
        5. Execution Action (执行动作 - 触发测试的关键动作，如有多个动作请按序号分行(\\n)显示)
        6. Expected Result (预期结果 - **必须**包含所有验证点，按数字序号（1., 2.）分行(\\n)显示)
        
        确保测试用例覆盖正常路径（Happy Path）、异常路径（Edge Cases）以及错误处理场景。
        请确保在 JSON 字符串中正确转义换行符 (例如使用 \\n)。
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: testCaseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini 未返回任何内容。");
    
    return JSON.parse(text) as TestSuite;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};