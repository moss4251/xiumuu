import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { OptionsPanel } from './components/OptionsPanel';
import { PreviewSection } from './components/PreviewSection';
import { GuideModal } from './components/GuideModal';
import { ConvertOptions } from './types';
import { convertToXiumiFormat } from './utils/converter';
import { SAMPLE_135_CONTENT } from './utils/sampleData';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

const DEFAULT_OPTIONS: ConvertOptions = {
  clean135Tags: true,
  cleanFieldsets: true,
  normalizeImages: true,
  removeExternalLinks: true,
  removeHeaderFooterNotice: false,
  fontSize: 'default',
  lineHeight: 'default',
  letterSpacing: 'default',
  primaryColor: 'default',
  replaceColors: false,
  justifyText: true,
};

export default function App() {
  const [rawHtml, setRawHtml] = useState<string>(SAMPLE_135_CONTENT);
  const [articleTitle, setArticleTitle] = useState<string>('01 / 极致排版的美学密码');
  const [articleAuthor, setArticleAuthor] = useState<string>('排版实验室');
  const [options, setOptions] = useState<ConvertOptions>(DEFAULT_OPTIONS);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Core conversion execution
  const conversionResult = useMemo(() => {
    return convertToXiumiFormat(rawHtml, options);
  }, [rawHtml, options]);

  const handleContentChange = (newHtml: string, title?: string, author?: string) => {
    setRawHtml(newHtml);
    if (title) setArticleTitle(title);
    if (author) setArticleAuthor(author);
  };

  const handleReset = () => {
    setRawHtml('');
    setArticleTitle('新图文排版');
    setArticleAuthor('公众号创作者');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Top Navigation */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onReset={handleReset}
        hasContent={Boolean(rawHtml.trim())}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Workflow Overview Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>135编辑器 · 微信推文 ⇌ 秀米排版专线转换中转站</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              把 135 抓取或制作的排版，一键无损导入秀米继续编辑
            </h2>
            <p className="text-sm text-emerald-100/80 leading-relaxed mb-4">
              因 135 与秀米采用不同的排版解析引擎，直接复制会导致标签过滤、样式剥离或排版锁死。本中转站自动为您清洗专属类名、修复防盗链图片、标准化布局结构，并在剪贴板中生成秀米专属高保真富文本。
            </p>

            {/* Quick 3-Step Pill Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-emerald-100/90">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-2 rounded-lg border border-white/10">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-900 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                <span>粘贴 135 排版 或 输入推文链接</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-2 rounded-lg border border-white/10">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-900 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                <span>中转站智能重构与清洗适配</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-2 rounded-lg border border-white/10">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-900 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                <span>复制后去秀米按 Ctrl+V 畅快编辑</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section (Paste or URL Fetcher) */}
        <InputSection
          rawHtml={rawHtml}
          onContentChange={handleContentChange}
        />

        {/* Conversion & Styling Options Panel */}
        <OptionsPanel
          options={options}
          onChange={setOptions}
          stats={conversionResult.stats}
        />

        {/* Real-time Preview & Output Actions */}
        <PreviewSection
          convertedHtml={conversionResult.html}
          cards={conversionResult.cards}
          stats={conversionResult.stats}
          articleTitle={articleTitle}
          articleAuthor={articleAuthor}
        />
      </main>

      {/* Guide Dialog */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>
            秀米排版中转站 · 专为公众号新媒体运营与排版设计师提供的高效排版转接工具
          </p>
          <p className="text-slate-400">
            支持 135 编辑器、新媒体管家、微信官方公众号推文格式互通 · 纯本地无损清洗与极速富文本剪贴板通道
          </p>
        </div>
      </footer>
    </div>
  );
}
