
import { GoogleGenAI, Type } from "@google/genai";
import { TestSuite } from "../types";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const testCaseSchema = {
  type: Type.OBJECT,
  properties: {
    featureName: { type: Type.STRING, description: "被测试的功能名称" },
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

// 专门为本地模型设计的调用函数 (适配 Ollama/LM Studio 等 OpenAI 兼容接口)
const callLocalCustomModel = async (prompt: string): Promise<string> => {
  const url = localStorage.getItem('local_model_url') || 'http://localhost:11434/v1/chat/completions';
  const modelName = localStorage.getItem('local_model_name') || 'deepseek-r1';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: '你是一位资深软件测试工程师。请务必只输出纯 JSON 格式数据，不要包含任何思考过程(thinking)或Markdown标记。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`本地服务响应异常: ${response.status}。请确保 ${url} 已启动。`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    throw new Error(`连接本地模型失败: ${error.message}。请检查本地模型服务是否开启并允许 CORS 跨域请求。`);
  }
};

export const generateTestCases = async (requirements: string, modelId: string = 'gemini-3-flash-preview'): Promise<TestSuite> => {
  if (!requirements.trim()) {
    throw new Error("请输入需求描述。");
  }

  const promptText = `
    作为资深QA，请分析此需求并生成测试用例。
    需求描述: "${requirements}"
    
    输出要求：
    1. 必须是严格的 JSON 格式。
    2. featureName 为功能名。
    3. scenarios 数组包含用例细节（id, scenarioName, dataPreparation, steps, executionAction, expectedResult）。
    4. 语言使用中文。
  `;

  try {
    if (modelId === 'local-custom') {
      const rawResponse = await callLocalCustomModel(promptText);
      // 处理本地模型可能带有的思考标签或Markdown格式
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("本地模型未返回有效的 JSON 数据。内容: " + rawResponse.substring(0, 50));
      return JSON.parse(jsonMatch[0]) as TestSuite;
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: modelId === 'local-nano' ? 'gemini-3-flash-preview' : modelId, // Nano 降级或走专门 Nano 逻辑
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: testCaseSchema,
      },
    });

    return JSON.parse(response.text!) as TestSuite;
  } catch (error: any) {
    console.error("Generate Error:", error);
    throw error;
  }
};

export const generateTestCasesFromImage = async (imageFile: File, additionalText: string = "", modelId: string = 'gemini-3-flash-preview'): Promise<TestSuite> => {
  if (modelId === 'local-custom') throw new Error("自定义本地模型暂不支持图像识别。");
  
  const ai = getAiClient();
  const reader = new FileReader();
  const base64Data = await new Promise<string>((resolve) => {
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(imageFile);
  });

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: imageFile.type } },
        { text: `分析流程图并生成测试用例。${additionalText}` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: testCaseSchema,
    },
  });

  return JSON.parse(response.text!) as TestSuite;
};
