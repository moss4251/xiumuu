import React, { useState, useRef } from 'react';
import { Clipboard, Link, Code, Check, ArrowRight, Loader2, Sparkles, FileText, Globe } from 'lucide-react';
import { SAMPLE_135_CONTENT } from '../utils/sampleData';

interface InputSectionProps {
  onContentChange: (rawHtml: string, title?: string, author?: string) => void;
  rawHtml: string;
}

export const InputSection: React.FC<InputSectionProps> = ({ onContentChange, rawHtml }) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'url' | 'code'>('paste');
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlSuccessInfo, setUrlSuccessInfo] = useState<string | null>(null);
  const pasteBoxRef = useRef<HTMLDivElement>(null);

  // Handle rich text paste event
  const handleRichPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');

    if (html && html.trim()) {
      onContentChange(html);
    } else if (text && text.trim()) {
      // Check if user pasted raw HTML code in text
      if (text.includes('<section') || text.includes('<div') || text.includes('<p')) {
        onContentChange(text);
      } else {
        // Plain text to wrapped paragraphs
        const formatted = text
          .split('\n')
          .filter((line) => line.trim())
          .map(
            (line) =>
              `<p style="font-size: 15px; line-height: 1.8; letter-spacing: 1.5px; color: #333; margin-bottom: 14px;">${line}</p>`
          )
          .join('');
        onContentChange(formatted);
      }
    }
  };

  // Fetch WeChat Article via backend proxy
  const handleFetchUrl = async (targetUrl?: string) => {
    const url = (targetUrl || urlInput).trim();
    if (!url) {
      setUrlError('请输入微信公众号推文链接');
      return;
    }

    setIsLoadingUrl(true);
    setUrlError(null);
    setUrlSuccessInfo(null);

    try {
      const res = await fetch('/api/fetch-wechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '抓取文章失败');
      }

      const { title, author, contentHtml } = data.article;
      onContentChange(contentHtml, title, author);
      setUrlSuccessInfo(`已成功抓取《${title}》排版内容！`);
    } catch (err: any) {
      setUrlError(err.message || '获取公众号文章失败，请检查网络或链接是否有效');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Load sample content
  const handleLoadSample = () => {
    onContentChange(SAMPLE_135_CONTENT, '极致排版的美学密码', '排版实验室');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('paste')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeTab === 'paste'
              ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clipboard className="w-4 h-4 text-emerald-600" />
          <span>从 135 / 剪贴板 直接粘贴</span>
        </button>

        <button
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeTab === 'url'
              ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>微信推文链接提取 (类似135)</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            activeTab === 'code'
              ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code className="w-4 h-4 text-slate-500" />
          <span>HTML 源码直接编辑</span>
        </button>

        <div className="ml-auto flex items-center pr-1">
          <button
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-medium px-2 py-1 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>载入135典型排版示例</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Paste Zone */}
      {activeTab === 'paste' && (
        <div className="p-4 sm:p-5">
          <div
            ref={pasteBoxRef}
            contentEditable
            onPaste={handleRichPaste}
            onInput={(e) => {
              const html = (e.target as HTMLDivElement).innerHTML;
              if (html) onContentChange(html);
            }}
            className="w-full min-h-[160px] max-h-[260px] overflow-y-auto p-4 border-2 border-dashed border-emerald-200 hover:border-emerald-400 focus:border-emerald-500 rounded-xl bg-emerald-50/20 focus:bg-white focus:outline-none transition-all text-sm text-slate-700"
          >
            {rawHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: rawHtml }}
                className="pointer-events-none opacity-80"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-400 select-none pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-emerald-100/60 flex items-center justify-center text-emerald-600 mb-3">
                  <Clipboard className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  在 135 编辑器选中排版后 Ctrl+C 复制，然后点击此处直接 <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs shadow-xs font-mono">Ctrl + V</kbd>
                </p>
                <p className="text-xs text-slate-400 max-w-md">
                  支持 135 全部样式卡片、SVG动画组件、长图文与公众号推文排版，中转站将自动捕获富文本并实时无损转成秀米格式
                </p>
              </div>
            )}
          </div>
          {rawHtml && (
            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <Check className="w-3.5 h-3.5" /> 已捕获输入内容，已自动就绪转换
              </span>
              <button
                onClick={() => onContentChange('')}
                className="text-slate-400 hover:text-rose-600 cursor-pointer"
              >
                清除重新粘贴
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: URL Fetcher */}
      {activeTab === 'url' && (
        <div className="p-4 sm:p-5">
          <div className="max-w-3xl">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              输入微信公众号推文链接 (与 135 编辑器提取推文功能完全一致)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Link className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://mp.weixin.qq.com/s/..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFetchUrl();
                  }}
                />
              </div>
              <button
                onClick={() => handleFetchUrl()}
                disabled={isLoadingUrl}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isLoadingUrl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>正在抓取排版...</span>
                  </>
                ) : (
                  <>
                    <span>一键抓取排版</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Error or Success notification */}
            {urlError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {urlError}
              </div>
            )}
            {urlSuccessInfo && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{urlSuccessInfo}</span>
              </div>
            )}

            {/* Hint & Fast test links */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="text-slate-400">快速体验：</span>
              <button
                type="button"
                onClick={() => {
                  setUrlInput('https://mp.weixin.qq.com/s/sample_article_layout_demo');
                  handleLoadSample();
                }}
                className="text-emerald-700 hover:underline cursor-pointer"
              >
                点此直接载入示例推文并进行中转
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Raw Code */}
      {activeTab === 'code' && (
        <div className="p-4 sm:p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                HTML 源代码 (可直接粘贴 135 编辑器的【HTML代码模式】源码)
              </label>
              <span className="text-xs text-slate-400">字符数: {rawHtml.length}</span>
            </div>
            <textarea
              value={rawHtml}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="<section class='_135editor' ...>...</section>"
              rows={7}
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-900 text-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
