import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TestSuite } from "../types";

// Helper function to get the AI client with dynamic key
const getAiClient = () => {
  // Prioritize the key from LocalStorage (User Settings), fallback to env variable
  const localKey = localStorage.getItem('gemini_api_key');
  const apiKey = localKey || process.env.API_KEY || '';
  
  if (!apiKey) {
    throw new Error("未检测到 API Key。请点击右上角设置按钮，输入您的 Google Gemini API Key。");
  }
  
  return new GoogleGenAI({ apiKey });
};

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
    // Get a fresh instance with the current key
    const ai = getAiClient();
    
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
        3. Data Preparation (测试数据准备 - 如果不需要特殊数据，请填"无"。**如果有多项准备工作，必须使用序号列表（1. 2.）并分行显示**)
        4. Steps (操作步骤 - **必须**使用序号列表（1. 2.）分行描述每一步操作，例如：\n1. 输入用户名\n2. 点击登录)
        5. Execution Action (执行动作 - 触发测试的关键动作，如有多个动作请按序号分行)
        6. Expected Result (预期结果 - **必须**包含所有验证点，按序号列表（1. 2.）分行显示，例如：\n1. 提示登录成功\n2. 跳转至首页)
        
        确保测试用例覆盖正常路径（Happy Path）、异常路径（Edge Cases）以及错误处理场景。
        文本中的换行请使用 standard newline character (\\n).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: testCaseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini 未返回任何内容。");
    
    return JSON.parse(text) as TestSuite;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Enhance error message for 429
    if (error.toString().includes("429") || (error.status === 429)) {
        throw new Error("API 调用配额已耗尽 (429)。请点击右上角设置图标，更换一个新的 API Key。");
    }
    throw error;
  }
};

const fileToGenerativePart = async (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateTestCasesFromImage = async (imageFile: File, additionalText: string = ""): Promise<TestSuite> => {
  try {
    // Get a fresh instance with the current key
    const ai = getAiClient();
    
    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = `
      你是一位精通**路径覆盖测试 (Path Coverage Testing)**的资深测试专家。请仔细分析这张业务流程图图片。
      
      **核心任务：**
      识别流程图中的所有逻辑路径，并为每一条从“开始”到“结束”的独立路径生成一个对应的测试用例。
      
      **分析步骤：**
      1. **节点识别**：识别流程图中的处理节点（矩形）、判定节点（菱形/判断框）、开始/结束节点。
      2. **路径遍历**：针对每一个判定节点（Decision Node），必须分别覆盖其所有分支（例如：“是/Yes”路径 和 “否/No”路径）。
      3. **条件推导**：根据路径走向，反推所需的测试数据。例如：若路径走的是“金额>1000”的分支，则测试数据准备中应包含“申请金额为 1001”。
      
      ${additionalText ? `补充业务背景说明: "${additionalText}"` : ""}
      
      **输出要求：**
      请输出 JSON 格式，内容必须使用**中文**。
      每个测试用例（Scenario）对应流程图中的一条完整路径，格式要求如下：

      1. **Feature Name**: (功能名称 - 提取流程图的主标题)
      2. **Scenario ID**: (场景编号 - 例如 TC_FLOW_001)
      3. **Scenario Name**: (场景名称 - 简要描述该路径的业务含义，例如 "审批流程-金额超限被拒绝")
      4. **Data Preparation**: (测试数据准备 - **必须使用序号列表 1. 2. 并换行**。根据该路径经过的判断条件，列出具体的前置数据。)
      5. **Steps**: (操作步骤 - **必须使用序号列表 1. 2. 分行**。严格按照流程图该路径上的节点顺序描述步骤。)
      6. **Execution Action**: (执行动作 - 触发流程流转或提交的关键操作)
      7. **Expected Result**: (预期结果 - **必须使用序号列表 1. 2. 分行**。描述该路径终点的状态或中间的关键系统反馈。)
      
      文本中的换行请使用 standard newline character (\\n).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          imagePart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: testCaseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini 未返回任何内容。");
    
    return JSON.parse(text) as TestSuite;

  } catch (error: any) {
    console.error("Gemini Vision API Error:", error);
    if (error.toString().includes("429") || (error.status === 429)) {
        throw new Error("API 调用配额已耗尽 (429)。请点击右上角设置图标，更换一个新的 API Key。");
    }
    throw error;
  }
};
