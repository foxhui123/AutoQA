import React, { useState, useCallback } from 'react';
import { generateTestCases } from '../services/geminiService';
import { TestSuite, TestCaseScenario } from '../types';
import { MindMap } from './MindMap';
import { TestCaseTable } from './TestCaseTable';
import { Sparkles, LayoutList, Network, ArrowRight, Loader2, ClipboardList } from 'lucide-react';

export const TestGenerator: React.FC = () => {
  const [requirements, setRequirements] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [selectedScenario, setSelectedScenario] = useState<TestCaseScenario | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!requirements.trim()) return;
    setLoading(true);
    setError(null);
    setTestSuite(null);
    setSelectedScenario(null);
    try {
      const result = await generateTestCases(requirements);
      setTestSuite(result);
    } catch (err: any) {
      setError(err.message || "生成测试用例时发生错误，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioSelect = useCallback((scenario: TestCaseScenario) => {
    setSelectedScenario(scenario);
  }, []);

  return (
    <div className="flex gap-6 h-full p-6 overflow-hidden">
        {/* Left Panel: Input */}
        <div className="w-1/3 flex flex-col gap-4 min-w-[350px]">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-full">
            <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <ClipboardList size={18} className="text-blue-500"/>
              需求描述
            </label>
            <textarea
              className="flex-1 w-full p-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-400 text-sm leading-relaxed"
              placeholder="在此粘贴您的软件需求说明... (例如：'一个用户登录界面，允许输入邮箱和密码。需要验证邮箱格式，密码错误时提示错误信息，验证成功后跳转至仪表盘。')"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              disabled={loading}
            />
            
            <div className="mt-4 flex flex-col gap-3">
               <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="font-semibold text-slate-600">提示:</span> 需求描述越具体（包含验证规则、错误状态等），生成的测试用例覆盖率越高。
               </div>
              <button
                onClick={handleGenerate}
                disabled={loading || !requirements.trim()}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 ${
                  loading || !requirements.trim()
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> 正在分析需求...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} /> 生成测试用例
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Output */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
           {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm mb-4">
                <strong>错误:</strong> {error}
              </div>
           )}

           {!testSuite && !loading && !error && (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <Network size={32} />
                </div>
                <p className="font-medium text-lg">准备就绪</p>
                <p className="text-sm mt-1">在左侧输入需求描述以开始生成测试场景。</p>
             </div>
           )}

           {testSuite && (
             <div className="flex-1 flex flex-col h-full gap-4 overflow-hidden">
                {/* Result Toolbar */}
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                   <h2 className="font-semibold text-slate-700 px-2">{testSuite.featureName}</h2>
                   <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200">
                    <button
                      onClick={() => setViewMode('map')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Network size={16} /> 思维导图
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <LayoutList size={16} /> 表格视图
                    </button>
                  </div>
                </div>

                {viewMode === 'map' ? (
                  <div className="flex-1 flex gap-4 h-full overflow-hidden relative">
                    <div className="flex-1 h-full shadow-sm">
                       <MindMap data={testSuite} onSelectScenario={handleScenarioSelect} />
                    </div>
                    {/* Detail Panel for Map View */}
                    <div className={`w-80 bg-white border-l border-slate-200 shadow-xl absolute right-0 top-0 bottom-0 transform transition-transform duration-300 z-40 flex flex-col ${selectedScenario ? 'translate-x-0' : 'translate-x-full'}`}>
                        {selectedScenario && (
                          <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-slate-800 text-lg leading-tight">{selectedScenario.scenarioName}</h3>
                                <span className="text-xs font-mono text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded mt-2 inline-block">
                                  {selectedScenario.id}
                                </span>
                              </div>
                              <button onClick={() => setSelectedScenario(null)} className="text-slate-400 hover:text-slate-600">
                                <ArrowRight size={20} />
                              </button>
                            </div>
                            <div className="p-5 flex-1 overflow-y-auto space-y-5">
                              <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">测试数据准备</h4>
                                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-line leading-relaxed">{selectedScenario.dataPreparation}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">操作步骤</h4>
                                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{selectedScenario.steps}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">执行动作</h4>
                                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{selectedScenario.executionAction}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">预期结果</h4>
                                <div className="text-sm text-green-800 bg-green-50 p-3 rounded-lg border border-green-100 whitespace-pre-line leading-relaxed">
                                  {selectedScenario.expectedResult}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  <TestCaseTable data={testSuite} />
                )}
             </div>
           )}
        </div>
    </div>
  );
};
