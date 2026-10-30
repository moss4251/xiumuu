export interface ArticleMetadata {
  title: string;
  author: string;
  publishDate?: string;
  cover?: string;
  digest?: string;
  url?: string;
}

export interface ConvertOptions {
  clean135Tags: boolean; // 移除 _135editor, data-tools="135编辑器" 等专有属性
  cleanFieldsets: boolean; // 转换 fieldset 边框标签为标准 section
  normalizeImages: boolean; // 修复微信防盗链、转换 data-src 为 src、补充 referrerpolicy
  removeExternalLinks: boolean; // 过滤非微信外部超链接，防止违规
  removeHeaderFooterNotice: boolean; // 智能移除文首关注引导与文末二维码/版权声明
  fontSize: 'default' | '14px' | '15px' | '16px' | '17px';
  lineHeight: 'default' | '1.6' | '1.75' | '1.8' | '2.0';
  letterSpacing: 'default' | '1px' | '1.5px' | '2px';
  primaryColor: string; // 主题色换色，'default' 为保留原色
  replaceColors: boolean; // 是否应用主题色替换
  justifyText: boolean; // 两端对齐
}

export interface ConversionStats {
  removed135Tags: number;
  processedImages: number;
  fixedFieldsets: number;
  removedLinks: number;
  cardsCount: number;
  wordCount: number;
  originalSize: number;
  convertedSize: number;
}

export interface LayoutCard {
  id: string;
  type: 'header' | 'title' | 'quote' | 'image' | 'text' | 'card' | 'footer' | 'svg';
  title: string;
  html: string;
}
