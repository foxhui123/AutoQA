import React, { useState, useCallback, useRef } from 'react';
import { generateTestCasesFromImage } from '../services/geminiService';
import { TestSuite, TestCaseScenario } from '../types';
import { MindMap } from './MindMap';
import { TestCaseTable } from './TestCaseTable';
import { Sparkles, LayoutList, Network, ArrowRight, Loader2, ImagePlus, X, UploadCloud } from 'lucide-react';

export const FlowchartGenerator: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [selectedScenario, setSelectedScenario] = useState<TestCaseScenario | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [additionalText, setAdditionalText] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    } else {
      setError("请上传有效的图片文件 (JPG, PNG, WebP)。");
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setTestSuite(null);
    setSelectedScenario(null);
    try {
      const result = await generateTestCasesFromImage(imageFile, additionalText);
      setTestSuite(result);
    } catch (err: any) {
      setError(err.message || "分析流程图时发生错误，请重试。");
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-full overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <UploadCloud size={18} className="text-blue-500"/>
              上传流程图
            </h3>

            {/* Upload Area */}
            {!previewUrl ? (
              <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="bg-blue-100 p-3 rounded-full mb-3 text-blue-600">
                  <ImagePlus size={24} />
                </div>
                <p className="text-slate-700 font-medium text-sm">点击或拖拽上传流程图</p>
                <p className="text-slate-400 text-xs mt-1">支持 JPG, PNG, WebP</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                <img src={previewUrl} alt="Preview" className="w-full h-auto object-contain max-h-[300px] bg-slate-50" />
                <button 
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Additional Text Input */}
            <div className="mt-4 flex-1">
              <label className="text-xs font-semibold text-slate-500 mb-2 block">
                辅助说明 (可选)
              </label>
              <textarea
                className="w-full h-[120px] p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder:text-slate-400"
                placeholder="如果流程图中有缩写或特殊逻辑，请在此补充说明..."
                value={additionalText}
                onChange={(e) => setAdditionalText(e.target.value)}
              />
            </div>
            
            <div className="mt-4">
              <button
                onClick={handleGenerate}
                disabled={loading || !imageFile}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 ${
                  loading || !imageFile
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> 正在识别分析...
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
                <p className="font-medium text-lg">等待上传</p>
                <p className="text-sm mt-1">请在左侧上传流程图图片以开始生成。</p>
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