import React from 'react';
import { X, CheckCircle, AlertTriangle, ArrowRight, ExternalLink, Lightbulb, Copy, Sparkles } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-200" />
            <h3 className="text-base font-bold">135 转秀米：原理剖析与保姆级操作指南</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm text-slate-700 leading-relaxed">
          {/* Question 1: Why does direct pasting fail? */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">1</span>
              为什么 135 编辑器的内容直接复制到秀米会失效或格式错乱？
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-600">
              <p>
                <strong>引擎与解析器差异：</strong>135 编辑器使用了一套私有的 HTML 封装规范，在其排版外层大量注入了：
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>专有类名与标签：<code>class="_135editor"</code>、<code>data-tools="135编辑器"</code>、<code>data-id="..."</code></li>
                <li>复杂的边框包装：<code>&lt;fieldset&gt;</code> 与 <code>&lt;legend&gt;</code> 标签</li>
                <li>外部 CSS 依赖：部分弹性布局仅依赖 135 网站全局 CSS，离开 135 后样式丢失</li>
                <li>微信图片防盗链：推文图片带有 <code>data-src</code> 和微信鉴权防盗链，直接粘贴显示为破损裂图</li>
              </ul>
              <p>
                当把这些内容直接粘入<strong>秀米 (xiumi.us)</strong> 时，秀米的富文本清洗器会把 135 的专有标记当做未知非法标签进行强制剥离，导致卡片结构被压平、留白丢失、无法选中文字单项编辑。
              </p>
            </div>
          </div>

          {/* Question 2: How this Bridge solves it */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">2</span>
              秀米排版中转站是如何进行无损转换的？
            </h4>
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
              <p>
                本中转站内置了深度解析管道，在内存中完成 4 步无损重构：
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <strong className="text-emerald-800">① 专有标记脱敏：</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">彻底剥离 <code>_135editor</code> 等干扰属性，防止秀米触发安全拦截。</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <strong className="text-emerald-800">② 结构语义化重塑：</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">将易崩坏的 fieldset 转换为秀米最喜爱的标准 section 内联卡片。</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <strong className="text-emerald-800">③ 图片防盗链修复：</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">将微信懒加载 <code>data-src</code> 激活为 <code>src</code>，注入 <code>no-referrer</code>。</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <strong className="text-emerald-800">④ 原生剪贴板桥接：</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">使用 <code>text/html</code> 标准通道直接写入剪贴板，秀米 Ctrl+V 即来即用。</p>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
              3 步极速使用流程
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  <strong className="text-slate-800">提取或粘贴内容：</strong>
                  <p className="text-slate-500 mt-0.5">
                    在 135 编辑器里全选排版按 Ctrl+C，或直接输入微信推文链接（例如 <code>https://mp.weixin.qq.com/s/...</code>），中转站将自动提取完整图文排版。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  <strong className="text-slate-800">点击「一键复制给秀米」：</strong>
                  <p className="text-slate-500 mt-0.5">
                    中转站会自动完成清洗、格式重构与两端对齐，并一键写入系统富文本剪贴板。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                  3
                </div>
                <div>
                  <strong className="text-slate-800">打开秀米，直接粘贴 (Ctrl + V)：</strong>
                  <p className="text-slate-500 mt-0.5">
                    在秀米编辑器（<a href="https://xiumi.us/#/" target="_blank" rel="noreferrer" className="text-emerald-700 underline">xiumi.us</a>）新建图文，在正文区域直接按键盘 <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-[11px]">Ctrl + V</kbd>，即可看到原汁原味的精美排版，并能随意编辑文字与替换图片！
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            支持 Chrome, Edge, Safari, Firefox 等现代浏览器
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            我知道了，开始使用
          </button>
        </div>
      </div>
    </div>
  );
};
