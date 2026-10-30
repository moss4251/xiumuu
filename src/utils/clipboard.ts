/**
 * 剪贴板工具类：
 * 将转换后的 HTML 作为 text/html 写入系统剪贴板，
 * 使得用户在秀米编辑器（xiumi.us）中直接按 Ctrl+V / Cmd+V 即可粘贴高保真排版。
 */

export async function copyRichHtmlToClipboard(htmlContent: string): Promise<{ success: boolean; error?: string }> {
  if (!htmlContent) {
    return { success: false, error: '排版内容为空，无法复制' };
  }

  // Generate plain text summary for applications that do not support rich text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const plainText = tempDiv.textContent || tempDiv.innerText || '';

  // Standard WeChat wrapper for Xiumi rich clipboard intake
  const wrappedHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; }
</style>
</head>
<body>
<div style="box-sizing: border-box; max-width: 677px; margin: 0 auto; line-height: 1.8; letter-spacing: 1.5px; font-size: 15px; color: #333;">
${htmlContent}
</div>
</body>
</html>`;

  // Method 1: Modern Clipboard API with ClipboardItem
  if (navigator.clipboard && window.ClipboardItem) {
    try {
      const blobHtml = new Blob([wrappedHtml], { type: 'text/html' });
      const blobText = new Blob([plainText], { type: 'text/plain' });
      const clipboardItem = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      });
      await navigator.clipboard.write([clipboardItem]);
      return { success: true };
    } catch (err: any) {
      console.warn('Modern ClipboardItem failed, falling back to selection copy:', err);
    }
  }

  // Method 2: Fallback using hidden contenteditable element & execCommand
  try {
    const container = document.createElement('div');
    container.contentEditable = 'true';
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      const successful = document.execCommand('copy');
      selection.removeAllRanges();
      document.body.removeChild(container);

      if (successful) {
        return { success: true };
      }
    }
    document.body.removeChild(container);
  } catch (fallbackErr: any) {
    console.error('Fallback execCommand failed:', fallbackErr);
  }

  // Method 3: Text only fallback
  try {
    await navigator.clipboard.writeText(wrappedHtml);
    return { success: true, error: '已复制HTML源码至剪贴板（如遇浏览器限制富文本，可直接粘贴源码）' };
  } catch (err: any) {
    return { success: false, error: '复制失败，请手动全选复制：' + (err.message || '权限受限') };
  }
}

/**
 * 复制纯文本或源码
 */
export async function copyPlainTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}
