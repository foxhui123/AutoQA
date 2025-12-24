
import React, { useState, useCallback, useEffect } from 'react';
import { generateTestCases } from '../services/geminiService';
import { TestSuite, TestCaseScenario, ModelOption } from '../types';
import { MindMap } from './MindMap';
import { TestCaseTable } from './TestCaseTable';
import { Sparkles, LayoutList, Network, ArrowRight, Loader2, Cpu, Cloud, Info, AlertCircle, HelpCircle, Server } from 'lucide-react';

const MODELS: ModelOption[] = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', provider: 'gemini-api', description: '云端高速版：平衡速度与质量' },
  { id: 'local-custom', name: 'DeepSeek (Local Server)', provider: 'local-custom', description: '本地服务版：支持 Ollama/LM Studio 运行的模型' },
  { id: 'local-nano', name: 'Gemini Nano (Local)', provider: 'local-nano', description: '内置离线版：Chrome 实验性内置模型' }
];

export const TestGenerator: React.FC = () => {
  const [requirements, setRequirements] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [selectedScenario, setSelectedScenario] = useState<TestCaseScenario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');
  const [localSupported, setLocalSupported] = useState<boolean>(false);
  const [showLocalTip, setShowLocalTip] = useState(false);

  useEffect(() => {
    const checkLocalAi = async () => {
      // @ts-ignore
      if (window.ai && window.ai.languageModel) {
        try {
          // @ts-ignore
          const capabilities = await window.ai.languageModel.capabilities();
          if (capabilities.available !== 'no') setLocalSupported(true);
        } catch (e) {}
      }
    };
    checkLocalAi();
  }, []);

  const handleGenerate = async () => {
    if (!requirements.trim()) return;
    setLoading(true);
    setError(null);
    setTestSuite(null);
    setSelectedScenario(null);
    try {
      const result = await generateTestCases(requirements, selectedModel);
      setTestSuite(result);
    } catch (err: any) {
      setError(err.message || "生成测试用例时发生错误，请确认本地服务已启动或 API Key 正确。");
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioSelect = useCallback((scenario: TestCaseScenario) => {
    setSelectedScenario(scenario);
  }, []);

  return (
    <div className="flex gap-6 h-full p-6 overflow-hidden">
        <div className="w-1/3 flex flex-col gap-4 min-w-[350px]">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-full overflow-hidden">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-blue-500"/>
              需求分析配置
            </h3>

            <div className="mb-6 space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">选择执行模型</label>
                <div className="relative">
                  <button onMouseEnter={() => setShowLocalTip(true)} onMouseLeave={() => setShowLocalTip(false)} className="text-slate-400 hover:text-blue-500 transition-colors">
                    <HelpCircle size={14} />
                  </button>
                  {showLocalTip && (
                    <div className="absolute right-0 bottom-6 w-56 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2">
                      支持云端 Gemini 或本地运行的模型。点击右上角设置图标可配置本地 DeepSeek 模型。
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {MODELS.map((model) => {
                  const isNano = model.id === 'local-nano';
                  const isCustom = model.provider === 'local-custom';
                  const isDisabled = isNano && !localSupported;
                  const isActive = selectedModel === model.id;

                  return (
                    <button
                      key={model.id}
                      onClick={() => !isDisabled && setSelectedModel(model.id)}
                      disabled={isDisabled}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all group ${
                        isActive ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : isDisabled ? 'border-slate-100 opacity-50 cursor-not-allowed' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {isCustom ? <Server size={18} /> : isNano ? <Cpu size={18} /> : <Cloud size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold truncate ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>{model.name}</span>
                          {isNano && <span className="text-[9px] px-1 bg-slate-200 rounded">{localSupported ? '就绪' : '未激活'}</span>}
                          {isCustom && <span className="text-[9px] px-1 bg-indigo-100 text-indigo-600 rounded">本地</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{model.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">需求描述文字</label>
              <textarea
                className="flex-1 w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder:text-slate-400 shadow-inner"
                placeholder="在此粘贴需求..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>
            
            <div className="mt-5">
              <button
                onClick={handleGenerate}
                disabled={loading || !requirements.trim()}
                className={`w-full py-4 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                  loading || !requirements.trim() ? 'bg-slate-300 shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                }`}
              >
                {loading ? <><Loader2 size={20} className="animate-spin" /> 生成中...</> : <><Sparkles size={20} /> 立即生成测试用例</>}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
           {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm mb-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                   <p className="font-bold">分析失败</p>
                   <p className="mt-1 opacity-90">{error}</p>
                </div>
              </div>
           )}

           {!testSuite && !loading && !error && (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
                    <Network size={40} />
                </div>
                <h4 className="font-bold text-slate-600 text-xl">等待分析需求</h4>
                <p className="text-sm mt-2 max-w-xs text-center leading-relaxed">请输入需求文字并选择模型。本地 DeepSeek 可在设置中配置 Ollama 地址。</p>
             </div>
           )}

           {testSuite && (
             <div className="flex-1 flex flex-col h-full gap-4 overflow-hidden">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                   <div className="flex items-center gap-2 px-2">
                      <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Ready</span>
                      <h2 className="font-bold text-slate-800">{testSuite.featureName}</h2>
                   </div>
                   <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><Network size={16} /> 思维导图</button>
                    <button onClick={() => setViewMode('table')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><LayoutList size={16} /> 表格视图</button>
                  </div>
                </div>

                {viewMode === 'map' ? (
                  <div className="flex-1 flex gap-4 h-full overflow-hidden relative">
                    <MindMap data={testSuite} onSelectScenario={handleScenarioSelect} />
                    <div className={`w-96 bg-white border-l border-slate-200 shadow-2xl absolute right-0 top-0 bottom-0 transform transition-transform duration-500 ease-in-out z-40 flex flex-col ${selectedScenario ? 'translate-x-0' : 'translate-x-full'}`}>
                        {selectedScenario && (
                          <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full mb-2 inline-block">{selectedScenario.id}</span>
                                <h3 className="font-black text-slate-800 text-xl leading-tight">{selectedScenario.scenarioName}</h3>
                              </div>
                              <button onClick={() => setSelectedScenario(null)} className="p-2 text-slate-400 hover:text-slate-600"><ArrowRight size={20} /></button>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto space-y-6">
                              <DetailSection title="测试数据准备" content={selectedScenario.dataPreparation} isHighlight={false} />
                              <DetailSection title="操作步骤" content={selectedScenario.steps} isHighlight={false} />
                              <DetailSection title="预期结果" content={selectedScenario.expectedResult} isHighlight={true} />
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ) : <TestCaseTable data={testSuite} />}
             </div>
           )}
        </div>
    </div>
  );
};

const DetailSection = ({ title, content, isHighlight }: { title: string, content: string, isHighlight: boolean }) => (
  <section>
    <h4 className={`text-[11px] font-black uppercase tracking-[0.1em] mb-2 flex items-center gap-2 ${isHighlight ? 'text-green-600' : 'text-slate-400'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${isHighlight ? 'bg-green-300' : 'bg-slate-300'}`}></div> {title}
    </h4>
    <p className={`text-sm p-4 rounded-xl border whitespace-pre-line leading-relaxed font-medium ${isHighlight ? 'text-green-900 bg-green-50/80 border-green-100 font-bold' : 'text-slate-700 bg-slate-50 border-slate-100 shadow-inner'}`}>
      {content}
    </p>
  </section>
);
