# 🚀 快速設置清單

## 5分鐘快速部署

### 步驟 1：建立檔案
```bash
mkdir cocktail-pwa
cd cocktail-pwa
```

創建以下 3 個檔案：
- [ ] `index.html` - 複製完整 HTML 代碼
- [ ] `manifest.json` - 複製 PWA 配置
- [ ] `sw.js` - 複製 Service Worker 代碼

### 步驟 2：本地測試
```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx serve .
```

開啟瀏覽器：`http://localhost:8000`

### 步驟 3：驗證功能
- [ ] 頁面正常載入
- [ ] 可以新增/編輯酒譜
- [ ] 圖片上傳正常
- [ ] 資料匯出入正常
- [ ] 離線模式運作（關閉網路測試）

### 步驟 4：手機測試
- [ ] 手機瀏覽器開啟網址
- [ ] 測試「加入主畫面」功能
- [ ] 驗證離線使用

### 步驟 5：部署上線
選擇其中一種：
- [ ] GitHub Pages（免費）
- [ ] Netlify（拖拽上傳）
- [ ] Vercel（CLI 部署）

## ⚡ 一鍵部署腳本

### GitHub Pages 自動部署
```bash
#!/bin/bash
# deploy.sh

# 初始化 Git
git init
git add .
git commit -m "🍸 雞尾酒譜 PWA 初始版本"

# 推送到 GitHub（需要先建立 repository）
echo "請先在 GitHub 建立 repository，然後執行："
echo "git remote add origin https://github.com/你的用戶名/cocktail-pwa.git"
echo "git push -u origin main"
echo "然後在 GitHub Settings > Pages 啟用部署"
```

### Netlify 拖拽部署
1. 將整個資料夾打包成 ZIP
2. 前往 [netlify.com](https://netlify.com)
3. 拖拽 ZIP 檔案到部署區域
4. 獲得即時可用的 URL

## 🔧 客製化設定

### 修改 App 名稱和顏色
在 `manifest.json` 中：
```json
{
  "name": "你的雞尾酒譜",
  "short_name": "酒譜",
  "theme_color": "#你喜歡的顏色",
  "background_color": "#你喜歡的顏色"
}
```

### 修改主題色彩
在 `index.html` 的 CSS 中找到：
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```
替換為你喜歡的漸變色。

### 新增酒譜分類
在表單的 `<select id="cocktailCategory">` 中新增選項：
```html
<option value="你的分類">你的分類</option>
```

## ⚠️ 重要注意事項

### 瀏覽器支援
- ✅ **完全支援**：Chrome, Edge, Safari 14+, Firefox 85+
- ⚠️ **部分支援**：Safari 13, 舊版 Firefox
- ❌ **不支援**：IE（任何版本）

### 功能限制
1. **儲存空間**：
   - 桌面：通常 1-10GB
   - 手機：通常 50MB-2GB
   - 圖片建議壓縮到 500KB 以下

2. **離線功能**：
   - 需要至少訪問一次才能離線使用
   - 外部 CDN 資源需要網路連線

3. **安全限制**：
   - 正式部署需要 HTTPS
   - localhost 可用 HTTP 測試

### 效能優化建議
1. **圖片優化**：
   ```javascript
   // 在上傳前壓縮圖片
   function compressImage(file, quality = 0.8) {
     return new Promise((resolve) => {
       const canvas = document.createElement('canvas');
       const ctx = canvas.getContext('2d');
       const img = new Image();
       
       img.onload = () => {
         const maxWidth = 800;
         const maxHeight = 600;
         let { width, height } = img;
         
         if (width > height) {
           if (width > maxWidth) {
             height = (height * maxWidth) / width;
             width = maxWidth;
           }
         } else {
           if (height > maxHeight) {
             width = (width * maxHeight) / height;
             height = maxHeight;
           }
         }
         
         canvas.width = width;
         canvas.height = height;
         
         ctx.drawImage(img, 0, 0, width, height);
         canvas.toBlob(resolve, 'image/jpeg', quality);
       };
       
       img.src = URL.createObjectURL(file);
     });
   }
   ```

2. **資料庫清理**：
   ```javascript
   // 定期清理過期資料
   async function cleanupOldImages() {
     const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
     // 實作清理邏輯
   }
   ```

## 🎯 功能測試清單

### 基本功能
- [ ] 新增酒譜（包含所有欄位）
- [ ] 編輯現有酒譜
- [ ] 刪除酒譜
- [ ] 搜尋功能（名稱、標籤、配料）
- [ ] 分類篩選
- [ ] 網格/列表檢視切換

### 進階功能
- [ ] 圖片上傳和顯示
- [ ] CSV 匯出
- [ ] CSV 匯入
- [ ] 離線瀏覽
- [ ] 資料持久化
- [ ] PWA 安裝提示

### 響應式設計
- [ ] 桌面瀏覽器正常顯示
- [ ] 平板裝置適配
- [ ] 手機裝置適配
- [ ] 橫屏/直屏切換

### 效能檢查
- [ ] 初始載入時間 < 3秒
- [ ] 圖片載入不阻塞 UI
- [ ] 大量資料下操作流暢
- [ ] 記憶體使用合理

## 🚨 故障排除快速指南

### 問題：PWA 無法安裝
**檢查項目**：
1. 是否使用 HTTPS 或 localhost
2. manifest.json 格式是否正確
3. Service Worker 是否正常註冊

### 問題：離線功能不工作
**檢查項目**：
1. Service Worker 是否啟用
2. 快取策略是否正確
3. 網路狀態檢測是否正常

### 問題：圖片無法顯示
**檢查項目**：
1. IndexedDB 是否有資料
2. 圖片格式是否支援
3. 檔案大小是否超限

### 問題：資料遺失
**檢查項目**：
1. IndexedDB 是否被清除
2. 瀏覽器是否開啟隱私模式
3. 儲存空間是否不足

## 📞 取得協助

如果遇到問題：
1. **檢查瀏覽器控制台**（F12）
2. **驗證網路連線**
3. **清除瀏覽器快取**
4. **重新載入頁面**

常用調試指令：
```javascript
// 檢查 Service Worker 狀態
navigator.serviceWorker.getRegistration().then(console.log);

// 檢查儲存使用量
navigator.storage.estimate().then(console.log);

// 清除所有資料
app.confirmClearData();
```

---

**準備就緒！** 你的雞尾酒譜 PWA 現在可以：
- 📱 安裝到手機桌面
- 🌐 離線使用
- 💾 本地儲存資料
- 📷 管理酒譜圖片
- 📊 匯出入資料
- 🔍 快速搜尋酒譜