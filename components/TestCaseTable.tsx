import React, { useState } from 'react';
import { TestSuite } from '../types';
import { FileDown, Copy, Loader2 } from 'lucide-react';
import JSZip from 'jszip';

interface TestCaseTableProps {
  data: TestSuite;
}

export const TestCaseTable: React.FC<TestCaseTableProps> = ({ data }) => {
  const [exporting, setExporting] = useState(false);

  const copyToClipboard = () => {
    let md = `# ${data.featureName}\n\n`;
    data.scenarios.forEach(s => {
      md += `## ${s.id}: ${s.scenarioName}\n`;
      md += `- **测试数据准备**:\n${s.dataPreparation}\n`;
      md += `- **操作步骤**:\n${s.steps}\n`;
      md += `- **执行动作**:\n${s.executionAction}\n`;
      md += `- **预期结果**:\n${s.expectedResult}\n\n`;
    });
    navigator.clipboard.writeText(md).then(() => {
        alert("Markdown 内容已复制到剪贴板！");
    });
  };

  const exportToXMind = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();

      // 1. Construct content.json structure for XMind
      const rootTopicId = `root-${Date.now()}`;
      
      const xmindContent = [
        {
          "id": "root-sheet",
          "title": "画布 1",
          "rootTopic": {
            "id": rootTopicId,
            "title": data.featureName,
            "structureClass": "org.xmind.ui.logic.right",
            "children": {
              "attached": data.scenarios.map((s, idx) => ({
                "id": `scenario-${s.id}-${idx}`,
                "title": `[${s.id}] ${s.scenarioName}`,
                "children": {
                  "attached": [
                    {
                      "id": `data-${s.id}`,
                      "title": `数据准备:\n${s.dataPreparation}`,
                      "children": {
                        "attached": [
                          {
                            "id": `steps-${s.id}`,
                            "title": `操作步骤:\n${s.steps}`,
                            "children": {
                              "attached": [
                                {
                                  "id": `action-${s.id}`,
                                  "title": `执行动作:\n${s.executionAction}`,
                                  "children": {
                                    "attached": [
                                      {
                                        "id": `result-${s.id}`,
                                        "title": `预期结果:\n${s.expectedResult}`,
                                        "style": {
                                           "properties": {
                                             "shape-class": "org.xmind.topicShape.roundedRect",
                                             "fill": "#E8F5E9",
                                             "border-line-color": "#4CAF50"
                                           }
                                        }
                                      }
                                    ]
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              }))
            }
          }
        }
      ];

      // 2. Add manifest.json
      const manifest = {
        "file-entries": {
          "content.json": {},
          "metadata.json": {}
        }
      };

      // 3. Add metadata.json (basic)
      const metadata = {
        "creator": { "name": "AutoQA Agent" }
      };

      zip.file("content.json", JSON.stringify(xmindContent));
      zip.file("manifest.json", JSON.stringify(manifest));
      zip.file("metadata.json", JSON.stringify(metadata));

      // 4. Generate zip blob
      const blob = await zip.generateAsync({ type: "blob" });
      
      // 5. Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.featureName.replace(/\s+/g, '_')}_测试用例.xmind`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (e) {
      console.error("XMind export failed", e);
      alert("导出 XMind 失败，请重试。");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-lg">
        <h3 className="font-semibold text-slate-800">测试用例详情列表</h3>
        <div className="flex gap-2">
            <button onClick={copyToClipboard} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors">
                <Copy size={14} /> 复制 Markdown
            </button>
            <button 
              onClick={exportToXMind} 
              disabled={exporting}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
            >
                {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                下载 .xmind
            </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <table className="w-full text-sm text-left text-slate-600 border-separate border-spacing-0">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-3 border-b border-slate-200 bg-slate-50">编号</th>
              <th scope="col" className="px-4 py-3 border-b border-slate-200 bg-slate-50">场景名称</th>
              <th scope="col" className="px-4 py-3 border-b border-slate-200 bg-slate-50 min-w-[150px]">数据准备</th>
              <th scope="col" className="px-4 py-3 border-b border-slate-200 bg-slate-50 min-w-[200px]">操作步骤</th>
              <th scope="col" className="px-4 py-3 border-b border-slate-200 bg-slate-50 min-w-[150px]">执行动作</th>
              <th scope="col" className="px-4 py-3 border-b border-slate-200 bg-slate-50 min-w-[150px]">预期结果</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.scenarios.map((scenario) => (
              <tr key={scenario.id} className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap align-top">{scenario.id}</td>
                <td className="px-4 py-3 align-top font-medium">{scenario.scenarioName}</td>
                <td className="px-4 py-3 align-top whitespace-pre-line text-slate-500">{scenario.dataPreparation}</td>
                <td className="px-4 py-3 align-top max-w-xs truncate" title={scenario.steps}>
                    <span className="block truncate">{scenario.steps}</span>
                </td>
                <td className="px-4 py-3 align-top whitespace-pre-line">{scenario.executionAction}</td>
                <td className="px-4 py-3 align-top text-green-700 font-medium whitespace-pre-line">{scenario.expectedResult}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};