import React, { useState, useRef } from 'react';
import { Clipboard, Link, Code, Check, ArrowRight, Loader2, Sparkles, RefreshCw, Eye, ShieldCheck, Globe } from 'lucide-react';
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
  const [isReadingClipboard, setIsReadingClipboard] = useState(false);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  // Handle rich text paste cleanly without contentEditable DOM mutation
  const handleRichPaste = (e: React.ClipboardEvent<HTMLDivElement | HTMLTextAreaElement>) => {
    e.preventDefault();
    try {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const html = clipboardData.getData('text/html');
      const text = clipboardData.getData('text/plain');

      if (html && html.trim()) {
        onContentChange(html);
        setPasteNotice(`已成功捕获 135/网页富文本排版 (${html.length} 字符)`);
        setTimeout(() => setPasteNotice(null), 3000);
      } else if (text && text.trim()) {
        if (text.includes('<section') || text.includes('<div') || text.includes('<p')) {
          onContentChange(text);
          setPasteNotice(`已成功读取 HTML 源码 (${text.length} 字符)`);
        } else {
          const formatted = text
            .split('\n')
            .filter((line) => line.trim())
            .map(
              (line) =>
                `<p style="font-size: 15px; line-height: 1.8; letter-spacing: 1.5px; color: #333; margin-bottom: 14px;">${line}</p>`
            )
            .join('');
          onContentChange(formatted);
          setPasteNotice(`已将纯文本转换为标准公众号段落`);
        }
        setTimeout(() => setPasteNotice(null), 3000);
      }
    } catch (err) {
      console.error('Paste error:', err);
    }
  };

  // One-click read clipboard API
  const handleReadClipboardApi = async () => {
    setIsReadingClipboard(true);
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          if (item.types.includes('text/html')) {
            const blob = await item.getType('text/html');
            const html = await blob.text();
            if (html.trim()) {
              onContentChange(html);
              setPasteNotice(`已从剪贴板读取富文本排版 (${html.length} 字符)`);
              setTimeout(() => setPasteNotice(null), 3000);
              setIsReadingClipboard(false);
              return;
            }
          }
        }
      }

      // Fallback to readText
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          if (text.includes('<section') || text.includes('<div') || text.includes('<p')) {
            onContentChange(text);
          } else {
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
          setPasteNotice(`已从系统剪贴板读取内容 (${text.length} 字符)`);
          setTimeout(() => setPasteNotice(null), 3000);
        }
      }
    } catch (err: any) {
      console.warn('Clipboard read failed (permission or not supported):', err);
      setPasteNotice('请点击输入框后直接按键盘 Ctrl + V 粘贴');
      setTimeout(() => setPasteNotice(null), 4000);
    } finally {
      setIsReadingClipboard(false);
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
    setPasteNotice('已载入 135 典型排版示例');
    setTimeout(() => setPasteNotice(null), 3000);
  };

  const hasContent = Boolean(rawHtml && rawHtml.trim());

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

      {/* Tab 1: Direct Paste Zone */}
      {activeTab === 'paste' && (
        <div className="p-4 sm:p-5">
          {hasContent ? (
            /* Content successfully captured status card */
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      已就绪！当前排版内容已成功接入中转站
                    </h3>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                      {rawHtml.length} 字符
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    排版已自动清洗 135 专属标记与 fieldset 边框，可在下方「秀米画布」实时预览或点击「一键复制给秀米」。
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleReadClipboardApi}
                  disabled={isReadingClipboard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReadingClipboard ? 'animate-spin' : ''}`} />
                  <span>读取新剪贴板</span>
                </button>
                <button
                  onClick={() => onContentChange('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <span>清空重选</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty paste catcher zone */
            <div
              tabIndex={0}
              onPaste={handleRichPaste}
              className="w-full min-h-[180px] p-6 border-2 border-dashed border-emerald-300 hover:border-emerald-500 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 rounded-xl bg-emerald-50/20 focus:bg-white focus:outline-none transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
                <Clipboard className="w-6 h-6" />
              </div>

              <div className="text-sm font-bold text-slate-800 mb-1">
                点击此处，然后直接按键盘 <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-mono text-xs">Ctrl + V</kbd> / <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-mono text-xs">Cmd + V</kbd> 粘贴
              </div>

              <p className="text-xs text-slate-500 max-w-md mb-4">
                在 135 编辑器或任意公众号文章中选中排版复制，点击此处直接粘贴。系统将安全捕获富文本并自动重构为秀米原生格式。
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReadClipboardApi();
                }}
                disabled={isReadingClipboard}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>{isReadingClipboard ? '正在读取剪贴板...' : '一键从剪贴板读取 (快捷通道)'}</span>
              </button>
            </div>
          )}

          {pasteNotice && (
            <div className="mt-2.5 text-xs text-emerald-700 font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
              <Check className="w-3.5 h-3.5" />
              <span>{pasteNotice}</span>
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

      {/* Tab 3: Raw Code Textarea (Safe, never crashes) */}
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
              rows={8}
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-900 text-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
