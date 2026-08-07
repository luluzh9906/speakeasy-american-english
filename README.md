# SpeakEasy 美语口语学习助手（MVP）

一个可直接发布到 GitHub Pages 的离线优先 PWA。它为中文学习者提供每日短练、生活情境、英文朗读、浏览器语音识别和本机学习记录。

## 产品与流程

目标用户是想稳定练习日常美语、但没有固定整块时间的中文学习者。流程为：打开首页 → 进入每日练习或选择情境 → 听句子并跟读 → 完成练习 → 本机保存连续天数、练习及表达。

## 技术与数据

- 纯 HTML / CSS / JavaScript，无构建步骤、无后端。
- `manifest.webmanifest` + `service-worker.js` 支持安装到主屏幕和离线打开。
- `SpeechSynthesis` 朗读；`SpeechRecognition` / `webkitSpeechRecognition`（视浏览器支持）识别跟读。
- 数据保存在浏览器 `localStorage` 的 `speakeasy-progress-v1`：`completed[]`、`phrases[]`、`lastDay`、`streak`。

## 目录

```text
index.html              应用界面
styles.css              移动优先样式
app.js                  内容、交互、语音、本机记录
manifest.webmanifest    PWA 安装信息
service-worker.js       离线缓存
icons/                  应用图标
```

## 发布到 GitHub Pages

1. 新建 GitHub 仓库，把本目录所有文件推送到默认分支。
2. 在仓库 **Settings → Pages** 中，选择 **Deploy from a branch**，分支选 `main` 和根目录。
3. 等待部署完成，访问 Pages 地址；在手机 Safari/Chrome 中使用“添加到主屏幕”。

> 语音识别能力取决于浏览器：Chrome 系通常支持较好；iOS Safari 可朗读，但识别支持可能有限。应用不依赖此功能即可使用。
