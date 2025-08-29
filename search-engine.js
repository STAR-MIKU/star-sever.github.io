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
    
    // 记录历史
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    if (!searchHistory.includes(keyword)) {
        searchHistory.push(keyword);
        if (searchHistory.length > 20) searchHistory = searchHistory.slice(-20);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
    
    // 使用当前选择的搜索引擎
        window.open(searchEngines[currentSearchEngine].url + encodeURIComponent(keyword), '_blank');
};

// 初始化
window.addEventListener('load', function() {
    // 确保DOM中的所有元素都已加载
    setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            // 添加搜索按钮点击事件
            const searchIconContainer = document.getElementById('searchEngineSelector');
            if (searchIconContainer) {
                searchIconContainer.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const keyword = searchInput.value.trim();
                    if (keyword) {
                        window.saveSearchHistory(keyword);
                    }
                });
            }
        }
    }, 100);
});