// Route Express.js để phân tích CSS không dùng qua Puppeteer
const express = require('express');
const puppeteer = require('puppeteer'); // Cần cài: npm install puppeteer
const path = require('path');

const router = express.Router();

router.get('/analyze-css', async (req, res) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Truy cập trang web của bạn
        await page.goto('http://localhost:3000/trangchu', { waitUntil: 'networkidle0' });
        
        // Chạy script phân tích CSS trong browser context
        const result = await page.evaluate(() => {
            const usedSelectors = new Set();
            const allSelectors = [];
            
            // Lấy tất cả CSS rules
            for (let styleSheet of document.styleSheets) {
                try {
                    for (let rule of styleSheet.cssRules) {
                        if (rule.type === CSSRule.STYLE_RULE) {
                            const selector = rule.selectorText;
                            allSelectors.push(selector);
                            
                            try {
                                if (document.querySelector(selector)) {
                                    usedSelectors.add(selector);
                                }
                            } catch (e) {
                                usedSelectors.add(selector);
                            }
                        }
                    }
                } catch (e) {
                    // Ignore CORS errors from external stylesheets
                }
            }
            
            const unusedSelectors = allSelectors.filter(selector => !usedSelectors.has(selector));
            
            return {
                total: allSelectors.length,
                used: Array.from(usedSelectors),
                unused: unusedSelectors,
                summary: {
                    totalSelectors: allSelectors.length,
                    usedSelectors: usedSelectors.size,
                    unusedSelectors: unusedSelectors.length
                }
            };
        });
        
        await browser.close();
        
        // Trả về kết quả dưới dạng JSON hoặc HTML
        res.json(result);
        
    } catch (error) {
        console.error('Lỗi phân tích CSS:', error);
        res.status(500).json({ error: 'Không thể phân tích CSS' });
    }
});

module.exports = router;