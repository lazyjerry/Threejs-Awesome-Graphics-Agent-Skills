# 任務請求：Skills 安全稽核

## 原始請求

請使用 knowledge-skill 進行，並實作已確認的「Skills 安全稽核計畫」：
掃描 `skills/` 全部檔案、repo 內所有 Markdown、安裝 CLI、套件腳本與依賴；
產出可重複執行的掃描腳本、研究紀錄與完整安全報告。

## 期望產出

- [ ] 固定掃描腳本：可重複產生檔案清冊與安全規則候選結果
- [ ] 安全稽核報告：列出風險摘要、證據、限制與修正建議
- [ ] Knowledge Skill 任務紀錄：完整保存計畫、筆記與報告

**產出類型：**
- 文件：`docs/knowledge-skill/Skills_安全稽核-001/report.md`
- 程式碼：`scripts/security-audit.sh`
- 其他：`artifacts/` 下的原始掃描證據

## 參考文件

| 檔案路徑 | 引用範圍描述 |
|----------|--------------|
| `skills/` | 全部檔案 |
| `README.md` 與 repo 內 Markdown | 完整檔案 |
| `bin/threejs-awesome-graphics-agent-skills.mjs` | 安裝與解除安裝流程 |
| `package.json`、`package-lock.json` | 生命週期與依賴 |
