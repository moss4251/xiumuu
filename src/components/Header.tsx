import React from 'react';
import { ExternalLink, HelpCircle, RefreshCw, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  onReset: () => void;
  hasContent: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide, onReset, hasContent }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                秀米排版中转站
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                135 / 公众号 → 秀米
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              解决135与推文排版复制进秀米格式错乱、样式丢失问题，转出原生高保真可编辑富文本
            </p>
          </div>
        </div>

        {/* Action buttons & External Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://xiumi.us/#/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-colors"
            title="新标签页打开秀米编辑器官网"
          >
            <span>打开秀米</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href="https://www.135editor.com/beautify_editor.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-colors"
            title="新标签页打开135编辑器"
          >
            <span>打开135</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>转换原理与指南</span>
          </button>

          {hasContent && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="清空当前内容"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">清空重置</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
