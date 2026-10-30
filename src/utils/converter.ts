import { ConvertOptions, ConversionStats, LayoutCard } from '../types';

/**
 * 核心转换引擎：
 * 将 135 编辑器 / 微信推文的 HTML 转换为 秀米 编辑器完美兼容的高保真富文本
 * 内置全量异常防护，杜绝任何特殊标签或缺失属性引起的白屏崩溃
 */
export function convertToXiumiFormat(
  rawHtml: string,
  options: ConvertOptions
): {
  html: string;
  stats: ConversionStats;
  cards: LayoutCard[];
} {
  const originalSize = rawHtml ? rawHtml.length : 0;
  let removed135Tags = 0;
  let processedImages = 0;
  let fixedFieldsets = 0;
  let removedLinks = 0;

  if (!rawHtml || !rawHtml.trim()) {
    return {
      html: '',
      stats: {
        removed135Tags: 0,
        processedImages: 0,
        fixedFieldsets: 0,
        removedLinks: 0,
        cardsCount: 0,
        wordCount: 0,
        originalSize: 0,
        convertedSize: 0,
      },
      cards: [],
    };
  }

  try {
    // Use DOMParser for precise DOM manipulation
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${rawHtml}</div>`, 'text/html');
    const container = doc.body.firstElementChild as HTMLElement;

    if (!container) {
      return {
        html: rawHtml,
        stats: {
          removed135Tags: 0,
          processedImages: 0,
          fixedFieldsets: 0,
          removedLinks: 0,
          cardsCount: 0,
          wordCount: 0,
          originalSize,
          convertedSize: originalSize,
        },
        cards: [],
      };
    }

    // 0. Remove potentially hazardous or executable tags immediately
    const dangerousTags = container.querySelectorAll('script, style, iframe, frame, object, embed');
    dangerousTags.forEach((node) => {
      try {
        node.remove();
      } catch (e) {
        // ignore
      }
    });

    // Remove HTML comments (e.g. <!--135editor-->)
    try {
      const walker = doc.createTreeWalker(container, NodeFilter.SHOW_COMMENT, null);
      const commentsToRemove: Node[] = [];
      while (walker.nextNode()) {
        commentsToRemove.push(walker.currentNode);
      }
      commentsToRemove.forEach((c) => c.parentNode?.removeChild(c));
    } catch (commentErr) {
      console.warn('Comment strip error:', commentErr);
    }

    // 1. Process 135 proprietary attributes and classes
    if (options.clean135Tags) {
      const allElements = container.querySelectorAll('*');
      allElements.forEach((el) => {
        try {
          if (
            el.classList?.contains('_135editor') ||
            el.hasAttribute?.('data-tools') ||
            el.hasAttribute?.('data-id')
          ) {
            removed135Tags++;
          }

          // Remove classes
          el.classList?.remove('_135editor');
          if (el.className && typeof el.className === 'string' && el.className.trim() === '') {
            el.removeAttribute('class');
          }

          // Remove 135 specific dataset attributes
          const attrsToRemove = [
            'data-tools',
            'data-id',
            'data-color',
            'data-custom',
            'data-role',
            'data-style',
            'data-width',
            'data-ratio',
            'data-w',
            'data-croporisrc',
            'data-gallery-id',
            'hm_tpos',
            'hm_tid',
            '_135editor_custom',
            'data-interactive-type',
            'data-wx-signature',
          ];
          attrsToRemove.forEach((attr) => {
            if (el.hasAttribute?.(attr)) {
              el.removeAttribute(attr);
            }
          });
        } catch (elErr) {
          // ignore single element failure
        }
      });
    }

    // 2. Convert <fieldset> to 秀米-friendly <section>
    if (options.cleanFieldsets) {
      const fieldsets = Array.from(container.querySelectorAll('fieldset'));
      fieldsets.forEach((fs) => {
        try {
          fixedFieldsets++;
          const section = doc.createElement('section');

          // Copy inline style
          const originalStyle = fs.getAttribute('style') || '';
          section.setAttribute('style', `box-sizing: border-box; ${originalStyle}`);

          // Handle <legend> inside fieldset
          const legend = fs.querySelector('legend');
          if (legend) {
            const legendDiv = doc.createElement('section');
            const legendStyle = legend.getAttribute('style') || '';
            legendDiv.setAttribute(
              'style',
              `box-sizing: border-box; display: table; margin: -25px auto 10px auto; padding: 0 10px; ${legendStyle}`
            );
            legendDiv.innerHTML = legend.innerHTML;
            section.appendChild(legendDiv);
            legend.remove();
          }

          // Move children
          while (fs.firstChild) {
            section.appendChild(fs.firstChild);
          }

          fs.parentNode?.replaceChild(section, fs);
        } catch (fsErr) {
          console.warn('Fieldset transform err:', fsErr);
        }
      });
    }

    // 3. Process Images (WeChat anti-hotlink & lazy-loading data-src)
    const images = Array.from(container.querySelectorAll('img'));
    images.forEach((img) => {
      try {
        processedImages++;
        const dataSrc = img.getAttribute('data-src');
        const src = img.getAttribute('src');
        const targetSrc = dataSrc || src || '';

        if (targetSrc) {
          let cleanSrc = targetSrc.trim();
          if (cleanSrc.startsWith('//')) {
            cleanSrc = 'https:' + cleanSrc;
          }
          img.setAttribute('src', cleanSrc);
        }

        img.removeAttribute('data-src');
        img.removeAttribute('data-croporisrc');
        img.removeAttribute('data-gallery-id');

        if (options.normalizeImages) {
          img.setAttribute('referrerpolicy', 'no-referrer');
          img.setAttribute('crossorigin', 'anonymous');
          img.setAttribute('loading', 'lazy');

          const currentStyle = img.getAttribute('style') || '';
          img.setAttribute(
            'style',
            `max-width: 100%; height: auto !important; display: block; margin: 0 auto; box-sizing: border-box; ${currentStyle}`
          );
        }
      } catch (imgErr) {
        // ignore
      }
    });

    // 4. External link filtering
    if (options.removeExternalLinks) {
      const links = Array.from(container.querySelectorAll('a'));
      links.forEach((a) => {
        try {
          const href = a.getAttribute('href') || '';
          if (!href.includes('mp.weixin.qq.com')) {
            removedLinks++;
            const span = doc.createElement('span');
            span.innerHTML = a.innerHTML;
            const style = a.getAttribute('style') || '';
            span.setAttribute('style', `${style} cursor: default;`);
            a.parentNode?.replaceChild(span, a);
          }
        } catch (linkErr) {
          // ignore
        }
      });
    }

    // 5. Remove header follow prompt or footer QR codes if option enabled
    if (options.removeHeaderFooterNotice) {
      const keywords = ['关注我们', '长按识别二维码', '长按二维码', '点击蓝字', '点个在看', '分享到朋友圈'];
      const sections = Array.from(container.children);

      sections.forEach((sec, idx) => {
        try {
          if (idx < 2 || idx >= sections.length - 2) {
            const text = sec.textContent || '';
            if (keywords.some((kw) => text.includes(kw))) {
              sec.remove();
            }
          }
        } catch (secErr) {
          // ignore
        }
      });
    }

    // 6. SVG validation & styling fix for Xiumi
    const svgs = Array.from(container.querySelectorAll('svg'));
    svgs.forEach((svg) => {
      try {
        if (!svg.getAttribute('xmlns')) {
          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        }
        const currentStyle = svg.getAttribute('style') || '';
        if (!currentStyle.includes('display:')) {
          svg.setAttribute('style', `display: block; ${currentStyle}`);
        }
      } catch (svgErr) {
        // ignore
      }
    });

    // 7. Typography overrides (Font size, line height, letter spacing, text alignment)
    if (
      options.fontSize !== 'default' ||
      options.lineHeight !== 'default' ||
      options.letterSpacing !== 'default' ||
      options.justifyText
    ) {
      const textEls = Array.from(container.querySelectorAll('p, span, section'));
      textEls.forEach((el) => {
        try {
          if (el.tagName === 'P' || el.tagName === 'SPAN') {
            let style = el.getAttribute('style') || '';

            if (options.fontSize !== 'default') {
              style = style.replace(/font-size:[^;]+;?/gi, '');
              style += ` font-size: ${options.fontSize};`;
            }

            if (options.lineHeight !== 'default') {
              style = style.replace(/line-height:[^;]+;?/gi, '');
              style += ` line-height: ${options.lineHeight};`;
            }

            if (options.letterSpacing !== 'default') {
              style = style.replace(/letter-spacing:[^;]+;?/gi, '');
              style += ` letter-spacing: ${options.letterSpacing};`;
            }

            if (options.justifyText) {
              if (!style.includes('text-align: center')) {
                style = style.replace(/text-align:[^;]+;?/gi, '');
                style += ` text-align: justify;`;
              }
            }

            el.setAttribute('style', style.trim());
          }
        } catch (typeErr) {
          // ignore
        }
      });
    }

    // 8. Primary Color replacement if enabled
    if (options.replaceColors && options.primaryColor && options.primaryColor !== 'default') {
      const targetColor = options.primaryColor;
      const allStyledEls = Array.from(container.querySelectorAll('*'));
      const colorHexRegex = /#([a-f0-9]{6}|[a-f0-9]{3})\b/gi;
      const isNeutralColor = (hex: string) => {
        const h = hex.toLowerCase().replace('#', '');
        const fullHex = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
        return ['ffffff', '000000', '333333', '666666', '999999', 'f5f5f5', 'eeeeee', 'cccccc', '222222', '111111', '888888'].includes(fullHex);
      };

      allStyledEls.forEach((el) => {
        try {
          const style = el.getAttribute('style');
          if (style) {
            const newStyle = style.replace(colorHexRegex, (match) => {
              if (isNeutralColor(match)) {
                return match;
              }
              return targetColor;
            });
            if (newStyle !== style) {
              el.setAttribute('style', newStyle);
            }
          }

          if (el.hasAttribute?.('fill')) {
            const fill = el.getAttribute('fill') || '';
            if (fill.startsWith('#') && !isNeutralColor(fill)) {
              el.setAttribute('fill', targetColor);
            }
          }
          if (el.hasAttribute?.('stroke')) {
            const stroke = el.getAttribute('stroke') || '';
            if (stroke.startsWith('#') && !isNeutralColor(stroke)) {
              el.setAttribute('stroke', targetColor);
            }
          }
        } catch (colorErr) {
          // ignore
        }
      });
    }

    // 9. Extract Modular Cards for Xiumi's Template Library
    const cards: LayoutCard[] = [];
    const topLevelChildren = Array.from(container.children);

    topLevelChildren.forEach((child, index) => {
      try {
        const el = child as HTMLElement;
        const text = el.textContent?.trim() || '';
        const hasImg = el.querySelector ? el.querySelector('img') !== null : false;
        const hasSvg = el.querySelector ? el.querySelector('svg') !== null : false;

        let type: LayoutCard['type'] = 'card';
        let cardTitle = `模块 #${index + 1}`;

        if (hasSvg) {
          type = 'svg';
          cardTitle = `交互/装饰模块 ${index + 1}`;
        } else if (hasImg && text.length < 30) {
          type = 'image';
          cardTitle = `配图卡片 ${index + 1}`;
        } else if (
          text.length > 0 &&
          text.length < 35 &&
          (el.querySelector?.('strong') ||
            (el.style && el.style.fontWeight === 'bold') ||
            (el.style && (el.style.borderBottom || el.style.borderLeft)))
        ) {
          type = 'title';
          cardTitle = `标题组件: ${text.slice(0, 16)}`;
        } else if (
          (el.style && (el.style.backgroundColor || el.style.border)) ||
          (el.querySelector && el.querySelector('fieldset, blockquote'))
        ) {
          type = 'quote';
          cardTitle = `引用框/重点卡片 ${index + 1}`;
        } else {
          type = 'text';
          cardTitle = `正文段落 ${index + 1}`;
        }

        cards.push({
          id: `card-${index}`,
          type,
          title: cardTitle,
          html: el.outerHTML || '',
        });
      } catch (cardErr) {
        // Fallback for single card
        cards.push({
          id: `card-${index}`,
          type: 'card',
          title: `模块 #${index + 1}`,
          html: (child as HTMLElement).outerHTML || '',
        });
      }
    });

    const convertedHtml = container.innerHTML || '';
    const convertedSize = convertedHtml.length;
    const wordCount = (container.textContent || '').replace(/\s+/g, '').length;

    return {
      html: convertedHtml,
      stats: {
        removed135Tags,
        processedImages,
        fixedFieldsets,
        removedLinks,
        cardsCount: cards.length,
        wordCount,
        originalSize,
        convertedSize,
      },
      cards,
    };
  } catch (globalErr: any) {
    console.error('Fatal converter error, using fallback:', globalErr);
    return {
      html: rawHtml,
      stats: {
        removed135Tags: 0,
        processedImages: 0,
        fixedFieldsets: 0,
        removedLinks: 0,
        cardsCount: 1,
        wordCount: rawHtml.length,
        originalSize,
        convertedSize: originalSize,
      },
      cards: [
        {
          id: 'card-fallback',
          type: 'card',
          title: '完整图文内容',
          html: rawHtml,
        },
      ],
    };
  }
}
