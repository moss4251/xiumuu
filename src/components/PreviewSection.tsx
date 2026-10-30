import React, { useState } from 'react';
import { Smartphone, Monitor, Layers, Code, Copy, Check, Download, ExternalLink, Sparkles, FileCheck, ArrowUpRight } from 'lucide-react';
import { LayoutCard, ConversionStats } from '../types';
import { copyRichHtmlToClipboard, copyPlainTextToClipboard } from '../utils/clipboard';

interface PreviewSectionProps {
  convertedHtml: string;
  cards: LayoutCard[];
  stats: ConversionStats;
  articleTitle?: string;
  articleAuthor?: string;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  convertedHtml,
  cards,
  stats,
  articleTitle = '极致排版的美学密码',
  articleAuthor = '秀米排版实验室',
}) => {
  const [viewMode, setViewMode] = useState<'mobile' | 'xiumi' | 'cards' | 'source'>('mobile');
  const [copySuccessToast, setCopySuccessToast] = useState<string | null>(null);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setCopySuccessToast(msg);
    setTimeout(() => setCopySuccessToast(null), 3500);
  };

  // Copy all content to Xiumi
  const handleCopyAllToXiumi = async () => {
    if (!convertedHtml) return;
    const res = await copyRichHtmlToClipboard(convertedHtml);
    if (res.success) {
      showToast('🎉 已复制给秀米！请前往秀米编辑器按 Ctrl+V / Cmd+V 粘贴即可直接编辑！');
    } else {
      showToast(res.error || '复制失败，请重试');
    }
  };

  // Copy single card to Xiumi
  const handleCopyCard = async (card: LayoutCard) => {
    setCopiedCardId(card.id);
    const res = await copyRichHtmlToClipboard(card.html);
    if (res.success) {
      showToast(`已复制「${card.title}」模块！去秀米直接 Ctrl+V 粘贴即可`);
    }
    setTimeout(() => setCopiedCardId(null), 2000);
  };

  // Copy raw HTML source
  const handleCopySource = async () => {
    if (!convertedHtml) return;
    const ok = await copyPlainTextToClipboard(convertedHtml);
    if (ok) {
      showToast('已复制纯净 HTML 源代码至剪贴板！');
    }
  };

  // Download HTML file
  const handleDownloadHtml = () => {
    if (!convertedHtml) return;
    const blob = new Blob([convertedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${articleTitle || '秀米转换排版'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已下载排版 HTML 文件！');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      {/* Top action & mode switcher bar */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-3 flex flex-wrap items-center justify-between gap-3">
        {/* View mode segmented controls */}
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>微信手机视图</span>
          </button>

          <button
            onClick={() => setViewMode('xiumi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'xiumi'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>秀米画布视图 (677px)</span>
          </button>

          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>秀米模块拆解 ({cards.length})</span>
          </button>

          <button
            onClick={() => setViewMode('source')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'source'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>源码与分析</span>
          </button>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAllToXiumi}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg shadow-sm shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>一键复制给秀米 (直接Ctrl+V)</span>
          </button>

          <button
            onClick={handleCopySource}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="复制处理后的纯净 HTML 代码"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>复制源码</span>
          </button>

          <button
            onClick={handleDownloadHtml}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="下载为本地 HTML 网页文件"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>导出</span>
          </button>
        </div>
      </div>

      {/* Floating Success Toast Banner */}
      {copySuccessToast && (
        <div className="bg-emerald-600 text-white text-xs sm:text-sm font-medium py-2.5 px-4 text-center flex items-center justify-center gap-2 shadow-inner animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 shrink-0" />
          <span>{copySuccessToast}</span>
          <a
            href="https://xiumi.us/#/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 underline font-bold flex items-center gap-0.5 hover:text-emerald-100"
          >
            立即前往秀米 <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Main Preview Container */}
      <div className="p-4 sm:p-6 bg-slate-100/70 min-h-[500px] flex justify-center items-start overflow-y-auto max-h-[780px]">
        {/* VIEW 1: WeChat Mobile View */}
        {viewMode === 'mobile' && (
          <div className="w-full max-w-[390px] bg-white rounded-[38px] shadow-xl border-4 border-slate-800 overflow-hidden flex flex-col my-2">
            {/* Phone Notch */}
            <div className="h-6 bg-slate-800 flex items-center justify-center relative">
              <div className="w-20 h-4 bg-slate-900 rounded-full" />
            </div>

            {/* WeChat Header Bar */}
            <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center justify-between text-xs text-slate-700">
              <span className="font-semibold text-slate-800 text-[11px]">9:41</span>
              <div className="text-[11px] font-medium text-slate-500">公众号正文</div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>···</span>
              </div>
            </div>

            {/* Article Content Body */}
            <div className="p-4 overflow-y-auto max-h-[620px] bg-white">
              {/* Article Header */}
              <div className="mb-4">
                <h1 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                  {articleTitle}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="text-emerald-700 font-medium">{articleAuthor}</span>
                  <span>·</span>
                  <span>微信排版</span>
                  <span>·</span>
                  <span>已适配秀米</span>
                </div>
              </div>

              {/* Rendered Converted HTML */}
              {convertedHtml ? (
                <div
                  dangerouslySetInnerHTML={{ __html: convertedHtml }}
                  className="wechat-preview-body text-slate-800 text-sm leading-relaxed"
                  style={{
                    wordBreak: 'break-word',
                  }}
                />
              ) : (
                <div className="py-16 text-center text-xs text-slate-400">
                  暂无排版内容，请在上方粘贴 135 内容或输入微信推文链接
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Xiumi Editor Canvas View (677px standard) */}
        {viewMode === 'xiumi' && (
          <div className="w-full max-w-[677px] bg-white rounded-lg shadow-sm border border-slate-300 p-6 sm:p-8 my-2">
            <div className="mb-4 pb-3 border-b border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-400">
              <span>秀米标准编辑视口 (宽 677px)</span>
              <span>全部 135 标签已清洗，可直接按模块编辑</span>
            </div>

            {convertedHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: convertedHtml }}
                className="xiumi-canvas-body"
                style={{
                  boxSizing: 'border-box',
                  wordBreak: 'break-word',
                }}
              />
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                暂无排版内容，请在上方粘贴 135 内容或输入微信推文链接
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Modular Cards Breakdown */}
        {viewMode === 'cards' && (
          <div className="w-full max-w-4xl space-y-4">
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-center justify-between">
              <div>
                <strong>模块化拆分提取：</strong>已将长图文自动拆解为{' '}
                <span className="font-bold">{cards.length}</span> 个秀米可用组件卡片。你可以点击单独卡片上的「复制此模块到秀米」，在秀米中像搭积木一样自由组合或存入你的秀米模板库！
              </div>
              <button
                onClick={handleCopyAllToXiumi}
                className="ml-3 shrink-0 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition-colors"
              >
                全部复制
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 p-4 shadow-xs transition-all relative group"
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{card.title}</span>
                    </div>

                    <button
                      onClick={() => handleCopyCard(card)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        copiedCardId === card.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {copiedCardId === card.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>已复制此模块</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>复制此模块到秀米</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card visual render */}
                  <div
                    dangerouslySetInnerHTML={{ __html: card.html }}
                    className="p-3 bg-slate-50/50 rounded-lg overflow-x-auto text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: Source Code and Cleaner Diagnostics */}
        {viewMode === 'source' && (
          <div className="w-full max-w-4xl space-y-4">
            {/* Diagnostics Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500">移除 135 专有类与标记</div>
                <div className="text-lg font-bold text-emerald-600 mt-1">
                  {stats.removed135Tags} <span className="text-xs font-normal text-slate-400">处</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500">修复微信防盗链图片</div>
                <div className="text-lg font-bold text-emerald-600 mt-1">
                  {stats.processedImages} <span className="text-xs font-normal text-slate-400">张</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500">规整 fieldset 边框卡片</div>
                <div className="text-lg font-bold text-emerald-600 mt-1">
                  {stats.fixedFieldsets} <span className="text-xs font-normal text-slate-400">处</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                <div className="text-xs text-slate-500">代码体积精简比</div>
                <div className="text-lg font-bold text-slate-800 mt-1">
                  {stats.originalSize > 0
                    ? `${Math.round((stats.convertedSize / stats.originalSize) * 100)}%`
                    : '100%'}
                </div>
              </div>
            </div>

            {/* Code Box */}
            <div className="bg-slate-900 rounded-xl p-4 text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                <span>转换后秀米专用 HTML 源码</span>
                <button
                  onClick={handleCopySource}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-sans"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制源码</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap">{convertedHtml}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
