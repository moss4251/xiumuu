import React from 'react';
import { Sliders, CheckSquare, Palette, Type, ShieldCheck, Sparkles } from 'lucide-react';
import { ConvertOptions, ConversionStats } from '../types';

interface OptionsPanelProps {
  options: ConvertOptions;
  onChange: (options: ConvertOptions) => void;
  stats: ConversionStats;
}

const COLOR_PRESETS = [
  { label: '保留原色', value: 'default', color: 'transparent' },
  { label: '微信官方绿', value: '#07c160', color: '#07c160' },
  { label: '经典中国红', value: '#e53935', color: '#e53935' },
  { label: '活力暖橙', value: '#ff5a5f', color: '#ff5a5f' },
  { label: '科技深蓝', value: '#2563eb', color: '#2563eb' },
  { label: '优雅紫罗兰', value: '#7c3aed', color: '#7c3aed' },
  { label: '高级雅墨黑', value: '#1e293b', color: '#1e293b' },
];

export const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, onChange, stats }) => {
  const toggleOption = (key: keyof ConvertOptions) => {
    onChange({
      ...options,
      [key]: !options[key],
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            秀米引擎适配与清洗选项
          </h2>
        </div>

        {/* Real stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>已清洗 135 标记: <strong className="text-emerald-700">{stats.removed135Tags}</strong> 处</span>
          <span>·</span>
          <span>已处理图片: <strong className="text-emerald-700">{stats.processedImages}</strong> 张</span>
          <span>·</span>
          <span>字数: <strong className="text-slate-800">{stats.wordCount}</strong></span>
        </div>
      </div>

      {/* Grid of Cleaners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Cleaner 1 */}
        <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={options.clean135Tags}
            onChange={() => toggleOption('clean135Tags')}
            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <div>
            <div className="text-xs font-semibold text-slate-800">移除 135 专属类名与属性</div>
            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
              消除 <code className="text-emerald-700">_135editor</code> 和 <code className="text-emerald-700">data-tools</code>，防止秀米编辑器拦截或将模块锁定
            </div>
          </div>
        </label>

        {/* Cleaner 2 */}
        <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={options.cleanFieldsets}
            onChange={() => toggleOption('cleanFieldsets')}
            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <div>
            <div className="text-xs font-semibold text-slate-800">将 fieldset 规整为标准 section</div>
            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
              修复 135 常见的边框标题卡片，转换后在秀米中光标定位更精准、不易错乱
            </div>
          </div>
        </label>

        {/* Cleaner 3 */}
        <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={options.normalizeImages}
            onChange={() => toggleOption('normalizeImages')}
            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <div>
            <div className="text-xs font-semibold text-slate-800">修复微信图片防盗链</div>
            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
              自动将 <code className="text-emerald-700">data-src</code> 转换为直接呈现的 <code className="text-emerald-700">src</code> 并添加 no-referrer
            </div>
          </div>
        </label>

        {/* Cleaner 4 */}
        <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={options.removeExternalLinks}
            onChange={() => toggleOption('removeExternalLinks')}
            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <div>
            <div className="text-xs font-semibold text-slate-800">过滤非微信外链</div>
            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
              清理普通外链，避免复制到微信公众平台发布时被系统提示非法外链
            </div>
          </div>
        </label>

        {/* Cleaner 5 */}
        <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={options.removeHeaderFooterNotice}
            onChange={() => toggleOption('removeHeaderFooterNotice')}
            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <div>
            <div className="text-xs font-semibold text-slate-800">智能移除头尾引导与二维码</div>
            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
              自动识别并去除原作者的关注按钮、文末二维码和版权提示
            </div>
          </div>
        </label>

        {/* Cleaner 6 */}
        <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={options.justifyText}
            onChange={() => toggleOption('justifyText')}
            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <div>
            <div className="text-xs font-semibold text-slate-800">正文两端对齐 (推荐)</div>
            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
              符合中文排版美学，保持微信手机端左右阅读边缘平齐整洁
            </div>
          </div>
        </label>
      </div>

      {/* Typography & Brand Color Controls */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        {/* Typography Selectors */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Type className="w-3.5 h-3.5" />
            <span>正文字号:</span>
            <select
              value={options.fontSize}
              onChange={(e) => onChange({ ...options, fontSize: e.target.value as any })}
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-white font-normal"
            >
              <option value="default">保持原文大小</option>
              <option value="14px">14px (小巧精致)</option>
              <option value="15px">15px (推荐/公众号主流)</option>
              <option value="16px">16px (清晰舒适)</option>
              <option value="17px">17px (宽松易读)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span>行间距:</span>
            <select
              value={options.lineHeight}
              onChange={(e) => onChange({ ...options, lineHeight: e.target.value as any })}
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-white font-normal"
            >
              <option value="default">保持原文行高</option>
              <option value="1.6">1.6 倍 (紧凑)</option>
              <option value="1.75">1.75 倍 (标准)</option>
              <option value="1.8">1.8 倍 (推荐/呼吸感)</option>
              <option value="2.0">2.0 倍 (宽松留白)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span>字间距:</span>
            <select
              value={options.letterSpacing}
              onChange={(e) => onChange({ ...options, letterSpacing: e.target.value as any })}
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-white font-normal"
            >
              <option value="default">保持原文字距</option>
              <option value="1px">1px</option>
              <option value="1.5px">1.5px (推荐)</option>
              <option value="2px">2px</option>
            </select>
          </div>
        </div>

        {/* Color Palette Mapping */}
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-xs text-slate-600 font-medium">主题色映射:</span>
          <div className="flex items-center gap-1.5">
            {COLOR_PRESETS.map((preset) => {
              const isSelected =
                (preset.value === 'default' && !options.replaceColors) ||
                (options.replaceColors && options.primaryColor === preset.value);

              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    if (preset.value === 'default') {
                      onChange({ ...options, replaceColors: false, primaryColor: 'default' });
                    } else {
                      onChange({ ...options, replaceColors: true, primaryColor: preset.value });
                    }
                  }}
                  title={preset.label}
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                    isSelected ? 'ring-2 ring-emerald-500 scale-110 shadow-xs' : 'opacity-80 hover:opacity-100 hover:scale-105'
                  } ${preset.value === 'default' ? 'border border-slate-300 bg-slate-100 text-[10px] text-slate-600 font-bold' : ''}`}
                  style={{ backgroundColor: preset.value === 'default' ? undefined : preset.color }}
                >
                  {preset.value === 'default' ? '原' : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
