import React, { useState } from 'react';
import { Bot, FileText, History, Workflow } from 'lucide-react';
import { TestGenerator } from './components/TestGenerator';
import { FlowchartGenerator } from './components/FlowchartGenerator';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'old' | 'flowchart'>('new');

  return (
    <div className="h-screen bg-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-600/20">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">AutoQA 智能测试助手</h1>
            <p className="text-xs text-slate-500 font-medium">基于 AI 驱动的测试用例生成器</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 flex-shrink-0">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 py-3 px-1 text-sm border-b-2 transition-colors ${
              activeTab === 'new'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <FileText size={16} />
            新需求
          </button>
          <button
            onClick={() => setActiveTab('old')}
            className={`flex items-center gap-2 py-3 px-1 text-sm border-b-2 transition-colors ${
              activeTab === 'old'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <History size={16} />
            老需求
          </button>
          <button
            onClick={() => setActiveTab('flowchart')}
            className={`flex items-center gap-2 py-3 px-1 text-sm border-b-2 transition-colors ${
              activeTab === 'flowchart'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <Workflow size={16} />
            流程图
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {/* Render instances to preserve state, use style to toggle visibility */}
        <div style={{ display: activeTab === 'new' ? 'block' : 'none' }} className="h-full w-full">
          <TestGenerator />
        </div>
        <div style={{ display: activeTab === 'old' ? 'block' : 'none' }} className="h-full w-full">
           <TestGenerator />
        </div>
        <div style={{ display: activeTab === 'flowchart' ? 'block' : 'none' }} className="h-full w-full">
           <FlowchartGenerator />
        </div>
      </main>
    </div>
  );
};

export default App;