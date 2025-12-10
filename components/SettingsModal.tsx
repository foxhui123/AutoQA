import React, { useState, useEffect } from 'react';
import { Key, Save, X, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey) setApiKey(storedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    onClose();
    alert("API Key 已更新，后续请求将使用新 Key。");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Key size={18} className="text-blue-600" />
            设置 API Key
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
            />
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              您的 Key 将仅存储在浏览器的本地缓存 (localStorage) 中，不会发送到任何第三方服务器。
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
             <div className="flex items-start gap-2">
                <ExternalLink size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                   <p className="font-semibold mb-1">如何获取 Key?</p>
                   <p>前往 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Google AI Studio</a> 免费获取。建议使用付费账号以获得更高配额。</p>
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-colors"
            >
              <Save size={16} />
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
