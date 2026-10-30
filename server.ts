import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// WeChat Mobile User Agent
const WECHAT_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.48(0x18003028) NetType/WIFI Language/zh_CN';

// Helper: Normalize WeChat Image URL
function normalizeWechatImgUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (url.startsWith('//')) {
    url = 'https:' + url;
  }
  return url;
}

// API: Fetch WeChat Article by URL
app.post('/api/fetch-wechat', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: '请提供有效的微信公众号推文链接' });
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl.includes('mp.weixin.qq.com') && !trimmedUrl.startsWith('http')) {
      return res.status(400).json({ success: false, error: '链接格式有误，请输入以 https://mp.weixin.qq.com 开头的公众号文章链接' });
    }

    const response = await fetch(trimmedUrl, {
      headers: {
        'User-Agent': WECHAT_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        Referer: 'https://mp.weixin.qq.com/',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `获取推文失败 (状态码: ${response.status})，请检查链接是否公开或已被删除`,
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract Metadata
    const title =
      $('h1#activity-name').text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      '未命名推文';

    const author =
      $('#js_name').text().trim() ||
      $('.rich_media_meta_text').first().text().trim() ||
      $('meta[name="author"]').attr('content') ||
      '公众号作者';

    const publishDate =
      $('#publish_time').text().trim() ||
      $('.rich_media_meta_text').last().text().trim() ||
      '';

    const cover =
      $('meta[property="og:image"]').attr('content') ||
      '';

    const digest =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    // Extract core content container
    const contentEl = $('#js_content');
    if (!contentEl.length) {
      return res.status(404).json({
        success: false,
        error: '未能解析到推文正文，可能是因为该文章需要微信客户端内授权或已被发布者删除',
      });
    }

    // Process images in content: ensure data-src becomes src
    contentEl.find('img').each((_, el) => {
      const $img = $(el);
      const dataSrc = $img.attr('data-src');
      const src = $img.attr('src');
      const realSrc = normalizeWechatImgUrl(dataSrc || src || '');

      if (realSrc) {
        $img.attr('src', realSrc);
      }
      $img.removeAttr('data-src');
      $img.removeAttr('data-croporisrc');
      $img.removeAttr('data-gallery-id');
      $img.attr('referrerpolicy', 'no-referrer');
      $img.attr('loading', 'lazy');
    });

    // Remove unwanted scripts and WeChat platform clutter
    contentEl.find('script, noscript, style').remove();
    contentEl.find('#js_sponsor_ad_area, .rich_media_area_extra, .reward_area').remove();

    // WeChat visibility style fix
    contentEl.removeAttr('style'); // remove visibility:hidden on #js_content
    const contentHtml = contentEl.html() || '';

    return res.json({
      success: true,
      article: {
        title,
        author,
        publishDate,
        cover,
        digest,
        contentHtml,
        url: trimmedUrl,
      },
    });
  } catch (err: any) {
    console.error('Fetch WeChat Error:', err);
    return res.status(500).json({
      success: false,
      error: `抓取失败: ${err.message || '网络连接超时或目标服务不可达'}`,
    });
  }
});

// API: Proxy WeChat Images (To prevent anti-hotlinking 403 in canvas/preview)
app.get('/api/proxy-image', async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).send('Missing url param');
    }

    const targetUrl = decodeURIComponent(rawUrl);
    const imgRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': WECHAT_UA,
        Referer: 'https://mp.weixin.qq.com/',
      },
    });

    if (!imgRes.ok) {
      return res.status(imgRes.status).send('Failed to fetch image');
    }

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const arrayBuffer = await imgRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    return res.status(500).send('Image proxy error: ' + err.message);
  }
});

// Setup Vite or Serve Static Files
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Server] WeChat Layout Bridge & Proxy listening on port ${port}`);
  });
}

startServer();
