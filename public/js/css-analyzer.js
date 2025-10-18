// Auto CSS Analyzer - Phân tích CSS từ file cụ thể
(function() {
    'use strict';
    
    // Cấu hình: Những file CSS nào cần kiểm tra (relative path)
    const TARGET_CSS_FILES = [
        'TrangChu.css',
        'header.css',
        'footer.css',
        'book-carousel.css',
        'theloai.css',
        'product-detail.css'
        // Thêm file CSS khác nếu cần
    ];
    
    // Những file CSS bỏ qua (external, framework)
    const IGNORE_CSS_PATTERNS = [
        'bootstrap',
        'font-awesome',
        'googleapis.com',
        'unpkg.com',
        'cdnjs.cloudflare.com'
    ];
    
    // Chờ DOM và resources tải xong
    window.addEventListener('load', function() {
        setTimeout(analyzeCSSUsage, 2000);
    });
    
    function analyzeCSSUsage() {
        console.log('🔍 Bắt đầu phân tích CSS usage từ project files...');
        
        const results = {};
        
        // Duyệt qua từng file CSS được chỉ định
        for (let targetFile of TARGET_CSS_FILES) {
            const fileResult = analyzeSpecificCSSFile(targetFile);
            if (fileResult) {
                results[targetFile] = fileResult;
            }
        }
        
        displayResults(results);
    }
    
    function analyzeSpecificCSSFile(fileName) {
        console.log(`📝 Kiểm tra file: ${fileName}`);
        
        const usedSelectors = new Set();
        const allSelectors = [];
        let targetStyleSheet = null;
        
        // Tìm stylesheet tương ứng với file name
        for (let styleSheet of document.styleSheets) {
            try {
                const href = styleSheet.href;
                if (href && href.includes(fileName)) {
                    targetStyleSheet = styleSheet;
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!targetStyleSheet) {
            console.log(`⚠️ Không tìm thấy stylesheet cho ${fileName}`);
            return null;
        }
        
        // Phân tích rules từ file CSS này
        try {
            for (let rule of targetStyleSheet.cssRules) {
                if (rule.type === CSSRule.STYLE_RULE) {
                    const selector = rule.selectorText;
                    allSelectors.push(selector);
                    
                    // Auto-approve một số selector đặc biệt
                    if (isSpecialSelector(selector)) {
                        usedSelectors.add(selector);
                        continue;
                    }
                    
                    // Kiểm tra selector có được dùng trong DOM
                    try {
                        if (document.querySelector(selector)) {
                            usedSelectors.add(selector);
                        }
                    } catch (e) {
                        // Invalid selector - assume used để tránh false positive
                        usedSelectors.add(selector);
                    }
                }
            }
        } catch (e) {
            console.log(`❌ Lỗi đọc CSS rules của ${fileName}:`, e.message);
            return null;
        }
        
        const unusedSelectors = allSelectors.filter(selector => !usedSelectors.has(selector));
        
        return {
            fileName: fileName,
            total: allSelectors.length,
            used: usedSelectors.size,
            unused: unusedSelectors,
            percentage: Math.round((unusedSelectors.length / allSelectors.length) * 100)
        };
    }
    
    function isSpecialSelector(selector) {
        // Auto-approve những selector có thể không detect được
        const specialPatterns = [
            ':hover', ':active', ':focus', ':visited',
            ':before', ':after', ':first-child', ':last-child',
            ':nth-child', ':not(', '::',
            '.active', '.show', '.hide', '.visible', '.invisible'
        ];
        
        return specialPatterns.some(pattern => selector.includes(pattern));
    }
    
    function displayResults(results) {
        console.log('📊 === KẾT QUẢ PHÂN TÍCH CSS PROJECT ===');
        
        let totalUnused = 0;
        let totalSelectors = 0;
        
        for (let [fileName, result] of Object.entries(results)) {
            console.log(`\n📁 File: ${fileName}`);
            console.log(`  📝 Tổng selectors: ${result.total}`);
            console.log(`  ✅ Đã sử dụng: ${result.used}`);
            console.log(`  ❌ Không sử dụng: ${result.unused.length} (${result.percentage}%)`);
            
            if (result.unused.length > 0) {
                console.log(`  🗑️ Unused selectors:`);
                result.unused.forEach(selector => {
                    console.log(`    - ${selector}`);
                });
            }
            
            totalUnused += result.unused.length;
            totalSelectors += result.total;
        }
        
        const overallPercentage = Math.round((totalUnused / totalSelectors) * 100);
        console.log(`\n🎯 TỔNG KẾT:`);
        console.log(`  📊 Tổng selectors project: ${totalSelectors}`);
        console.log(`  ❌ Tổng unused: ${totalUnused} (${overallPercentage}%)`);
        
        // Tạo visual report
        createVisualReport(results, { totalUnused, totalSelectors, overallPercentage });
    }
    
    function createVisualReport(results, summary) {
        // Remove existing report
        const existingReport = document.getElementById('css-analysis-report');
        if (existingReport) existingReport.remove();
        
        const reportBox = document.createElement('div');
        reportBox.id = 'css-analysis-report';
        reportBox.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            max-height: 500px;
            background: #1e1e1e;
            color: #ffffff;
            border: 2px solid #007acc;
            border-radius: 8px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            overflow-y: auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        let fileReports = '';
        for (let [fileName, result] of Object.entries(results)) {
            fileReports += `
                <div style="margin-bottom: 15px; border: 1px solid #333; padding: 8px; border-radius: 4px;">
                    <div style="color: #007acc; font-weight: bold;">${fileName}</div>
                    <div>Total: ${result.total} | Used: ${result.used} | Unused: ${result.unused.length} (${result.percentage}%)</div>
                    ${result.unused.length > 0 ? `
                        <details style="margin-top: 5px;">
                            <summary style="cursor: pointer; color: #ff4444;">Unused Selectors (${result.unused.length})</summary>
                            <div style="margin-top: 5px; padding-left: 10px; max-height: 100px; overflow-y: auto;">
                                ${result.unused.map(selector => `<div>• ${selector}</div>`).join('')}
                            </div>
                        </details>
                    ` : '<div style="color: #4CAF50;">✅ All selectors used!</div>'}
                </div>
            `;
        }
        
        reportBox.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #007acc;">Project CSS Analysis</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background: #ff4444; color: white; border: none; border-radius: 3px; padding: 3px 8px; cursor: pointer;">×</button>
            </div>
            <div style="background: #2d2d2d; padding: 8px; border-radius: 4px; margin-bottom: 10px;">
                <div style="color: #4CAF50;">📊 Overall: ${summary.totalSelectors} selectors</div>
                <div style="color: #ff4444;">❌ Unused: ${summary.totalUnused} (${summary.overallPercentage}%)</div>
            </div>
            <div style="max-height: 300px; overflow-y: auto;">
                ${fileReports}
            </div>
            <div style="margin-top: 10px; text-align: center;">
                <button onclick="window.showCSSConfig()" style="background: #007acc; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px;">
                    Config
                </button>
                <button onclick="window.analyzeCSSUsage()" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                    Re-analyze
                </button>
            </div>
        `;
        
        document.body.appendChild(reportBox);
    }
    
    // Export functions để có thể gọi từ console
    window.analyzeCSSUsage = analyzeCSSUsage;
    window.showCSSConfig = function() {
        console.log('🔧 CSS Analysis Configuration:');
        console.log('Target CSS files:', TARGET_CSS_FILES);
        console.log('Ignored patterns:', IGNORE_CSS_PATTERNS);
        console.log('\nĐể thay đổi cấu hình, edit file css-analyzer.js');
    };
    
})();