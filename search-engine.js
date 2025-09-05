// 搜索引擎配置
const searchEngines = {
    baidu: {
        name: '百度',
        url: 'https://www.baidu.com/s?wd='
    },
    google: {
        name: '谷歌',
        url: 'https://www.google.com/search?q='
    },
    bing: {
        name: '必应',
        url: 'https://www.bing.com/search?q='
    },
    sogou: {
        name: '搜狗',
        url: 'https://www.sogou.com/web?query='
    },
    360: {
        name: '360搜索',
        url: 'https://www.so.com/s?q='
    }
};

// 使用index.html中定义的currentSearchEngine变量
// 默认搜索引擎已在index.html中设置为'baidu'

// 搜索历史记录功能
window.saveSearchHistory = function(keyword) {
    if (!keyword) return;
    
    let engineName = currentSearchEngine;
    let searchKeyword = keyword;
    
    // 检查是否符合'用[搜索引擎名称]搜索[内容]'格式
    const match = keyword.match(/^用([\u4e00-\u9fa5\w]+)搜索(.+)$/);
    if (match) {
        const specifiedEngine = match[1].toLowerCase();
        searchKeyword = match[2].trim();
        
        // 查找匹配的搜索引擎
        for (const key in searchEngines) {
            if (searchEngines[key].name.toLowerCase().includes(specifiedEngine) || key === specifiedEngine) {
                engineName = key;
                break;
            }
        }
    }
    
    // 处理搜索表达式，提升搜索效率
    searchKeyword = processSearchExpressions(searchKeyword, engineName);
    
    // 记录历史（使用处理后的搜索关键词）
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    if (!searchHistory.includes(searchKeyword)) {
        searchHistory.push(searchKeyword);
        if (searchHistory.length > 20) searchHistory = searchHistory.slice(-20);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
    
    // 使用指定或当前选择的搜索引擎
    window.open(searchEngines[engineName].url + encodeURIComponent(searchKeyword), '_blank');
};

// 处理搜索表达式的函数
function processSearchExpressions(keyword, engineName) {
    // 1. 处理 '+关键词' 表示必须包含该关键词
    keyword = keyword.replace(/\+([^\s+]+)/g, function(match, p1) {
        // 百度和搜狗使用空格+关键词，谷歌、必应和360使用+关键词
        if (engineName === 'baidu' || engineName === 'sogou') {
            return ' ' + p1;
        } else {
            return match;
        }
    });
    
    // 2. 处理 '-关键词' 表示排除该关键词
    keyword = keyword.replace(/\-([^\s-]+)/g, function(match, p1) {
        // 所有搜索引擎基本都支持-关键词
        return match;
    });
    
    // 3. 处理 '关键词1 | 关键词2' 表示或关系
    keyword = keyword.replace(/([^|]+)\|([^|]+)/g, function(match, p1, p2) {
        // 百度使用 '关键词1 OR 关键词2'
        if (engineName === 'baidu') {
            return p1.trim() + ' OR ' + p2.trim();
        } 
        // 谷歌、必应、360和搜狗使用 '关键词1 | 关键词2'
        else {
            return match;
        }
    });
    
    // 4. 处理 'site:域名 关键词' 表示在指定网站内搜索
    keyword = keyword.replace(/site:\s*([^\s]+)\s+([^]+)/i, function(match, domain, query) {
        // 所有搜索引擎基本都支持site:语法
        return 'site:' + domain + ' ' + query;
    });
    
    // 5. 处理 'filetype:类型 关键词' 表示搜索指定类型的文件
    keyword = keyword.replace(/filetype:\s*([^\s]+)\s+([^]+)/i, function(match, filetype, query) {
        // 百度使用 'filetype:类型 关键词'
        if (engineName === 'baidu') {
            return 'filetype:' + filetype + ' ' + query;
        } 
        // 谷歌使用 '关键词 filetype:类型'
        else if (engineName === 'google') {
            return query + ' filetype:' + filetype;
        } 
        // 必应、360和搜狗使用 'filetype:类型 关键词'
        else {
            return 'filetype:' + filetype + ' ' + query;
        }
    });
    
    return keyword.trim();
}

// 添加搜索提示功能
function showSearchTips() {
    const tips = [
        '提示: 可使用"+关键词"强制包含该词',
        '提示: 可使用"-关键词"排除该词',
        '提示: 可使用"关键词1 | 关键词2"搜索任一关键词',
        '提示: 可使用"site:域名 关键词"在指定网站内搜索',
        '提示: 可使用"filetype:类型 关键词"搜索指定类型文件',
        '提示: 可使用"用[搜索引擎]搜索[内容]"切换搜索引擎'
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    const tipElement = document.createElement('div');
    tipElement.className = 'search-tip';
    tipElement.textContent = randomTip;
    tipElement.style.position = 'fixed';
    tipElement.style.bottom = '20px';
    tipElement.style.left = '50%';
    tipElement.style.transform = 'translateX(-50%)';
    tipElement.style.padding = '8px 16px';
    tipElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    tipElement.style.color = 'white';
    tipElement.style.borderRadius = '4px';
    tipElement.style.zIndex = '99999';
    tipElement.style.transition = 'opacity 0.5s ease';
    
    document.body.appendChild(tipElement);
    
    // 3秒后自动消失
    setTimeout(() => {
        tipElement.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(tipElement);
        }, 500);
    }, 3000);
}