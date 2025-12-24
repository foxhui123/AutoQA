import React, { useState, useEffect } from 'react';
import { X, Cpu, Server, Globe, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StepProps {
  num: number;
  title: string;
  children: React.ReactNode;
}

// Fixed: Defined Step component before usage in SettingsModal and used React.FC for correct child prop handling
const Step: React.FC<StepProps> = ({ num, title, children }) => (
  <div className="flex gap-4">
    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{num}</div>
    <div>
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <div className="text-xs text-slate-500 mt-1 leading-relaxed">{children}</div>
    </div>
  </div>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'local-setup' | 'local-server'>('local-setup');
  const [localUrl, setLocalUrl] = useState('http://localhost:11434/v1/chat/completions');
  const [localModelName, setLocalModelName] = useState('deepseek-r1');

  useEffect(() => {
    if (isOpen) {
      setLocalUrl(localStorage.getItem('local_model_url') || 'http://localhost:11434/v1/chat/completions');
      setLocalModelName(localStorage.getItem('local_model_name') || 'deepseek-r1');
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('local_model_url', localUrl);
    localStorage.setItem('local_model_name', localModelName);
    onClose();
    alert("本地模型配置已保存！");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Server size={18} className="text-blue-600" />
            本地模型与服务配置
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full"><X size={20} /></button>
        </div>

        <div className="flex border-b border-slate-100">
          <button onClick={() => setActiveTab('local-setup')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'local-setup' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>
            激活 Gemini Nano (内置)
          </button>
          <button onClick={() => setActiveTab('local-server')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'local-server' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>
            外部本地服务 (DeepSeek)
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {activeTab === 'local-setup' ? (
            <div className="space-y-4">
               <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-800 mb-4">
                 这是 Chrome 浏览器内置的本地模型，无需安装第三方软件。
               </div>
               <Step num={1} title="开启实验性标志">访问 chrome://flags，开启 #optimization-guide-on-device-model 和 #prompt-api-for-gemini-nano。</Step>
               <Step num={2} title="重启浏览器">点击 Relaunch 重启。</Step>
               <Step num={3} title="确认下载">在 chrome://components 中确认 Optimization Guide 已下载。</Step>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 rounded-lg text-xs text-indigo-800 mb-4 flex gap-2">
                <Globe size={14} className="flex-shrink-0" />
                <p>支持通过 Ollama, LM Studio 等工具运行的 DeepSeek 模型。请确保已允许跨域 (CORS) 访问。</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">本地 API 服务地址</label>
                  <input 
                    type="text" 
                    value={localUrl} 
                    onChange={e => setLocalUrl(e.target.value)}
                    placeholder="http://localhost:11434/v1/chat/completions"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Ollama 默认: http://localhost:11434/v1/chat/completions</p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">模型名称 (Model Identifier)</label>
                  <input 
                    type="text" 
                    value={localModelName} 
                    onChange={e => setLocalModelName(e.target.value)}
                    placeholder="deepseek-r1"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">请填入您在本地下载的模型别名，如 deepseek-v3, llama3 等。</p>
                </div>

                <div className="mt-4 p-3 border border-slate-100 rounded-lg">
                   <h5 className="text-xs font-bold text-slate-700 mb-2">Ollama 用户提示：</h5>
                   <p className="text-[11px] text-slate-500 leading-relaxed">
                     运行 Ollama 时需设置环境变量 <code>OLLAMA_ORIGINS="*"</code> 才能允许网页端直接调用。
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">关闭</button>
          <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
            <Save size={16} /> 保存配置
          </button>
        </div>
      </div>
    </div>
  );
};
