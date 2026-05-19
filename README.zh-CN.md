# @caijinglong/pdf-compress

一个面向 Node.js 和现代浏览器的 PDF 图片压缩库，专门压缩 PDF 中的位图图片内容，尽量不破坏文本、字体和矢量元素。

## 功能特点

- 尽量保留文本和矢量内容
- 只处理 PDF 内嵌位图图片
- 同时支持 Node.js、浏览器 ESM 和浏览器全局脚本
- 提供单文件浏览器构建 `dist/pdf-compress.global.js`

## 使用限制

- 适合图片较多的 PDF，不是通用 PDF 全量优化器
- 不处理字体子集化、矢量简化、对象重排这类优化
- 遇到不安全或不支持的图片流时会跳过
- 如果压缩后没有更小，会直接返回原始 PDF 数据

## 安装

```bash
/Users/cai/.bun/bin/bun add @caijinglong/pdf-compress
```

## Node 用法

按文件路径压缩：

```ts
import { compressPdfFile } from '@caijinglong/pdf-compress/node';

const result = await compressPdfFile('./assets/samples/sample-images.pdf', {
  quality: 0.83,
  maxWidth: 1800,
  maxHeight: 1800,
});

console.log(result.outputPath);
console.log(result.summary);
```

按二进制压缩：

```ts
import { readFile } from 'node:fs/promises';
import { compressPdf } from '@caijinglong/pdf-compress/node';

const input = await readFile('./assets/samples/sample-images.pdf');
const result = await compressPdf(input, {
  quality: 0.83,
  maxWidth: 1800,
  maxHeight: 1800,
});

console.log(result.summary);
```

## 浏览器 ESM 用法

```ts
import { compressPdf } from '@caijinglong/pdf-compress/browser';

const result = await compressPdf(file, {
  quality: 0.83,
  maxWidth: 1800,
  maxHeight: 1800,
});
```

## 浏览器全局脚本用法

```html
<script src="https://cdn.jsdelivr.net/npm/@caijinglong/pdf-compress/dist/pdf-compress.global.js"></script>
```

```js
const result = await window.PdfCompress.compressPdf(file, {
  quality: 0.83,
  maxWidth: 1800,
  maxHeight: 1800,
});
```

## CDN ESM 用法

```ts
import { compressPdf } from 'https://esm.sh/@caijinglong/pdf-compress/browser';
```

## 示例目录

- 浏览器全局脚本示例：[examples/browser-global/index.html](/Users/cai/code/web/pdf-compress/examples/browser-global/index.html:1)
- 浏览器 ESM 示例：[examples/browser-esm/index.html](/Users/cai/code/web/pdf-compress/examples/browser-esm/index.html:1)
- 公开样例 PDF 和来源说明：[assets/samples/README.md](/Users/cai/code/web/pdf-compress/assets/samples/README.md:1)

本地预览：

```bash
/Users/cai/.bun/bin/bun run build
/Users/cai/.bun/bin/bun run serve
```

访问：

```text
http://127.0.0.1:4884/examples/browser-global/
http://127.0.0.1:4884/examples/browser-esm/
```

## 默认参数

- `quality: 0.83`
- `maxWidth: 2000`
- `maxHeight: 2000`
- `minBytes: 32768`
- `minWidth: 256`
- `minHeight: 256`
- `skipImagesWithAlpha: true`
- `jpegOnly: false`

## 开发命令

```bash
/Users/cai/.bun/bin/bun install
/Users/cai/.bun/bin/bun run build
/Users/cai/.bun/bin/bun test
/Users/cai/.bun/bin/bun run typecheck
```

## 相关文档

- 英文说明：[README.md](/Users/cai/code/web/pdf-compress/README.md:1)
- 开发者文档：[docs/developer-guide.zh-CN.md](/Users/cai/code/web/pdf-compress/docs/developer-guide.zh-CN.md:1)
