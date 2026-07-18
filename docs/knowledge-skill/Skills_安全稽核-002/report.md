# Skills 安全稽核報告

## 掃描資訊

- 日期：2026-07-18
- 範圍：`skills/` 全部檔案、repo 內 Markdown、`bin/` 安裝 CLI、`package.json`／lockfile／依賴
- 工具：`scripts/security-audit.sh`、`audit-ai-tools` 規則 A–F、`npm audit`
- 覆蓋：`skills/` 418 個檔案、55 個 Markdown；repo 68 個 Markdown（排除 `.git`／`node_modules`，含本次任務文件）；symlink 0

## 風險摘要

| 嚴重性 | 確認數量 |
|---|---:|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 1 |

## 詳細發現

### [Medium] 依賴 peer range 不相容

- 位置：`package.json` 的 `three`／`postprocessing` devDependencies
- 證據：`postprocessing@6.37.4` 宣告 `three >=0.157.0 <0.178.0`，專案使用 `three@0.184.0`。
- 影響：一般 `npm ci` 會因 ERESOLVE 失敗；使用 `--legacy-peer-deps` 會繞過相容性檢查，可能在測試或使用範例時產生執行期問題。
- 建議：升級支援 three 0.184 的 postprocessing，或將 three 固定至相容範圍；不要把 `legacy-peer-deps` 當成正式相容性修正。
- 性質：供應鏈／可用性風險，非已確認惡意套件。

### [Low] 範例可向固定第三方 URL 載入資產

- 位置：`skills/threejs-atmosphere-aerial-perspective/examples/lut-aerial-perspective/source/atmosphere/constants.ts`、同類 `threejs-volumetric-clouds` 常數
- 證據：固定 commit 的 `media.githubusercontent.com` URL；loader 會傳遞呼叫端設定的 `requestHeader` 與 `withCredentials`。
- 影響：使用範例時會產生第三方網路請求；若呼叫端自行設定 credentials 或敏感 header，瀏覽器環境可能將其帶入請求。
- 緩解：URL 已固定到 commit，程式未讀取本機憑證、cookie 或環境變數，也未將本機內容 POST 至外部端點。
- 建議：在對外文件標明外部資產來源；對不受信任 URL 或敏感 header 採 allowlist／預設關閉 credentials。

## 已排除項目

- 無提示注入、身份偽冒、隱藏零寬指令或觸發後門命中。
- 無 `sudo`、`curl | bash`、未受限 `eval`／`exec`、敏感憑證檔案讀取或遙測追蹤 ID。
- 安裝 CLI 的 `--force`／解除安裝只作用於 manifest 追蹤的 skill 目錄，未發現任意 shell 命令執行。
- `npm audit`（以 lockfile）回報 0 vulnerabilities。

## 驗證與限制

- `npm run validate`：通過，輸出 `Validated 24 expert graphics skills.`
- 首次驗證因缺少本地 `yaml` 依賴失敗；`npm ci --ignore-scripts` 遇到已知 peer conflict，改用 `npm ci --ignore-scripts --legacy-peer-deps` 後驗證通過。
- 掃描為靜態檢查，未執行 skills 範例、未下載第三方資產，無法取代動態沙箱、惡意資產鑑識或完整軟體供應鏈審查。
- `scripts/security-audit.sh` 會匹配自身的規則字串；本報告已人工排除該誤報。

## 結論

目前沒有需要立即停用的 Critical／High 風險。使用前應先處理 `three`／`postprocessing` peer dependency 不相容，並評估範例第三方資產請求與 credentials 傳遞邊界。
