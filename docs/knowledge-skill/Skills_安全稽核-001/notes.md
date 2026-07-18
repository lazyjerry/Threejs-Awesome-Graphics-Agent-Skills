# 筆記：Skills 安全稽核


---  2026-07-18  第 1 次更新筆記 ---
## 任務摘要
掃描 `skills/` 全部檔案、repo 內所有 Markdown、安裝 CLI、套件腳本與依賴。
輸出固定掃描腳本、原始證據與人工複核報告，不修改既有產品內容。

## 來源

### 來源 1：audit-ai-tools
- URL：本機 skill `/Users/lazyjerry/.ai-global/skills/audit-ai-tools/`
- 重點：
  - 採用 A–F：提示注入、指令注入、資料外洩、權限蔓延、社交工程、遙測追蹤。
  - 所有自動命中都需人工複核，避免把 Shader 或一般技術詞彙誤判為安全問題。

## 綜合發現

### 初始狀態
- `README.md` 已有使用者修改，另有未追蹤的 `scripts/translate-readme-zh-tw.sh`。
- 稽核不得覆寫上述內容。
- 公用知識庫索引沒有直接匹配本次安全稽核的項目。
---
