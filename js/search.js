// 搜索记录
let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

let currentSearchEngine = localStorage.getItem('currentSearchEngine') || 'baidu';

function getBaiduSuggestions(keyword, callback) {
    if (!keyword) return callback([]);
    const cbName = 'baidu_sug_' + Math.random().toString(36).slice(2);
    window[cbName] = function (data) {
        let result = [];
        if (data && data.s) result = data.s;
        callback(result);
        setTimeout(() => { delete window[cbName]; }, 100);
    };
    const script = document.createElement('script');
    script.src = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(keyword)}&json=1&p=3&cb=${cbName}`;
    script.onload = function () { setTimeout(() => { script.remove(); }, 100); };
    document.body.appendChild(script);
}

// 搜索建议
function getSuggestions(keyword, callback) {
    getBaiduSuggestions(keyword, callback);
}

const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('search-suggestions');

// 保存搜索历史
function saveSearchHistory(keyword) {
    if (!keyword) return;
    // 去重
    searchHistory = searchHistory.filter(h => h !== keyword);
    // 添加到历史记录
    searchHistory.unshift(keyword);
    // 只保留最近10条
    searchHistory = searchHistory.slice(0, 10);
    // 保存到localStorage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

// 执行搜索功能
function performSearch() {
    const keyword = searchInput.value.trim();
    if (!keyword) return;

    // 保存搜索历史
    saveSearchHistory(keyword);

    // 打开搜索结果
    window.open(searchUrl, '_blank');
}

// 更新搜索建议框的位置和尺寸
function updateSuggestionsPosition() {
    const searchContainer = document.querySelector('.search-container');
    const searchRect = searchContainer.getBoundingClientRect();

    suggestionsBox.style.left = searchRect.left + 'px';
    suggestionsBox.style.top = searchRect.bottom + 'px';
    suggestionsBox.style.width = searchRect.width + 'px';
}

// 展示建议和历史
function showSuggestions() {
    // 更新搜索建议框的位置和尺寸
    updateSuggestionsPosition();

    const val = searchInput.value.trim();

    // 获取搜索建议和历史记录
    getSuggestions(val, function (suggestions) {
        let history = searchHistory.filter(h => h.includes(val)).slice(-5).reverse();
        let html = '';
        if (suggestions.length) {
            html += '<div class="suggestion-title">搜索建议</div>';
            suggestions.forEach(s => {
                html += `<div class="suggestion-item">${s}</div>`;
            });
        }
        if (history.length) {
            html += '<div class="history-title">历史记录</div>';

            // 添加历史记录项
            history.forEach(h => {
                html += `<div class="history-item" data-search="${h}">${h}</div>`;
            });
        }
        suggestionsBox.innerHTML = html;

        // 为搜索建议项和历史记录项添加动画
        function animateItems() {
            const suggestionItems = document.querySelectorAll('.suggestion-item');
            const historyItems = document.querySelectorAll('.history-item');
            const allItems = [...suggestionItems, ...historyItems];

            allItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('show');
                }, 50 * index); // 每个项延迟50ms显示，创建依次出现的效果
            });
        }

        // 调用动画函数
        animateItems();

        // 更新历史记录项的点击事件
        const historyItems = document.querySelectorAll('.history-item[data-search]');
        historyItems.forEach(item => {
            item.addEventListener('click', function () {
                const keyword = this.getAttribute('data-search');
                if (keyword) {
                    searchInput.value = keyword;
                    performSearch();
                    suggestionsBox.classList.remove('show');
                    setTimeout(() => { suggestionsBox.style.display = 'none'; }, 350);
                }
            });
        });

        // 更新建议项的点击事件
        const suggestionItems = document.querySelectorAll('.suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('click', function () {
                const keyword = this.textContent;
                if (keyword) {
                    searchInput.value = keyword;
                    performSearch();
                    suggestionsBox.classList.remove('show');
                    setTimeout(() => { suggestionsBox.style.display = 'none'; }, 350);
                }
            });
        });

        if (html) {
            suggestionsBox.style.display = 'block';
            setTimeout(() => {
                suggestionsBox.classList.add('show');
            }, 10);
        } else {
            suggestionsBox.classList.remove('show');
            setTimeout(() => { suggestionsBox.style.display = 'none'; }, 350);
        }
    });
}

// 搜索框点击时显示建议
searchInput.addEventListener('click', showSuggestions);

// 搜索框输入时显示建议
searchInput.addEventListener('input', function (e) {
    // 检查是否是用户实际输入触发的事件，排除代码手动触发的情况
    if (e.isTrusted) {
        showSuggestions();
    }
});

// 搜索框失去焦点时隐藏建议
searchInput.addEventListener('blur', function () {
    suggestionsBox.classList.remove('show');
    setTimeout(() => { suggestionsBox.style.display = 'none'; }, 350);
});

// 回车搜索
searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// 添加窗口大小变化监听事件
window.addEventListener('resize', () => {
    if (suggestionsBox.classList.contains('show')) {
        updateSuggestionsPosition();
    }
});

// 添加滚动事件监听
window.addEventListener('scroll', () => {
    if (suggestionsBox.classList.contains('show')) {
        updateSuggestionsPosition();
    }
});

// 壁纸功能实现
let db;

// 1. 初始化IndexedDB
function initDB() {
    const request = indexedDB.open('WallpaperDB', 1);
    request.onupgradeneeded = function (e) {
        db = e.target.result;
        if (!db.objectStoreNames.contains('wallpapers')) {
            db.createObjectStore('wallpapers', { keyPath: 'fileName' });
        }
    };
    request.onsuccess = function (e) {
        db = e.target.result;
        restoreWallpaper(); // 页面加载时恢复背景
    };
    request.onerror = function (e) {
        console.error('IndexedDB初始化失败:', e.target.error);
    };
}

// 2. 保存壁纸并设置为背景
function saveWallpaper() {
    console.log('saveWallpaper函数开始执行');
    // 首先尝试获取隐藏的文件输入
    let fileInput = document.getElementById('hiddenWallpaperUpload');
    // 如果没有隐藏的文件输入，尝试获取原来的文件输入
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        fileInput = document.getElementById('wallpaperUpload');
    }
    console.log('fileInput:', fileInput);
    const file = fileInput.files[0];
    console.log('选择的文件:', file);
    if (!file) {
        setTimeout(() => {
        window.notificationSystem.info('个性设置', '还没给我壁纸文件喵');
    }, 1000);
        return;
    }

    const reader = new FileReader();
    console.log('FileReader创建成功');
    
    reader.onerror = function(e) {
        console.error('FileReader读取失败:', e.target.error);
        setTimeout(() => {
        window.notificationSystem.info('个性设置', '读取失败，还是做不到吗喵');
    }, 1000);
        return;
    };
    
    if (file.type.startsWith('image/')) {
        // 图片处理：Base64存localStorage
        reader.onload = function (e) {
            console.log('图片文件读取成功');
            const wallpaperData = {
                type: 'image',
                fileName: file.name,
                data: e.target.result
            };
            try {
                localStorage.setItem('savedWallpaper', JSON.stringify(wallpaperData));
                console.log('图片数据保存到localStorage成功');
                setWallpaperAsBackground(wallpaperData); // 设置为背景
                showWallpaperPreview(wallpaperData); // 预览
                setTimeout(() => {
                    window.notificationSystem.info('个性设置', '设置成功喵');
                }, 1000);
            } catch (error) {
                console.error('localStorage保存失败:', error);
                setTimeout(() => {
                    window.notificationSystem.info('个性设置', '设置失败请重试喵');
                }, 1000);
            }
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
        // 视频处理：二进制存IndexedDB，元信息存localStorage
        reader.onload = function (e) {
            console.log('视频文件读取成功');
            // 存元信息
            const wallpaperMeta = {
                type: 'video',
                fileName: file.name,
                mimeType: file.type
            };
            try {
                localStorage.setItem('savedWallpaper', JSON.stringify(wallpaperMeta));
                console.log('视频元数据保存到localStorage成功');
            } catch (error) {
                console.error('localStorage保存失败:', error);
                setTimeout(() => {
                    window.notificationSystem.info('个性设置', '设置失败请重试喵');
                }, 1000);
                return;
            }

            try {
                // 检查db是否已初始化
                if (!db) {
                    console.error('IndexedDB未初始化');
                    // 尝试重新初始化
                    initDB();
                    setTimeout(() => {
                        window.notificationSystem.info('个性设置', '设置失败请重试喵');
                    }, 1000);
                    return;
                }
                
                // 存二进制数据到IndexedDB
                const transaction = db.transaction('wallpapers', 'readwrite');
                const store = transaction.objectStore('wallpapers');
                store.put({
                    fileName: file.name,
                    data: e.target.result,
                    mimeType: file.type
                });

                transaction.oncomplete = function () {
                    console.log('视频数据保存到IndexedDB成功');
                    // 设置为背景
                    setWallpaperAsBackground({
                        type: 'video',
                        fileName: file.name,
                        mimeType: file.type,
                        data: e.target.result
                    });
                    showWallpaperPreview({
                        type: 'video',
                        fileName: file.name,
                        mimeType: file.type,
                        data: e.target.result
                    });
                    setTimeout(() => {
                        window.notificationSystem.info('个性设置', '设置成功喵');
                    }, 1000);
                };
                transaction.onerror = function (e) {
                    console.error('视频存储失败:', e.target.error);
                    setTimeout(() => {
                        window.notificationSystem.info('个性设置', '出了点问题，请重试喵');
                    }, 1000);
                };
            } catch (error) {
                console.error('IndexedDB操作失败:', error);
                setTimeout(() => {
                    window.notificationSystem.info('个性设置', '操作失败请重试喵');
                }, 1000);
            }
        };
        reader.readAsArrayBuffer(file);
    } else {
        setTimeout(() => {
            window.notificationSystem.info('个性设置', '不支持这个喵');
        }, 1000);
    }
}

// 3. 仅展示预览（原有预览逻辑）
function showWallpaperPreview(wallpaperData) {
    const previewContainer = document.getElementById('wallpaperPreview');
    if (!previewContainer) return;
    previewContainer.innerHTML = '';

    // 创建相对定位的容器
    const contentContainer = document.createElement('div');
    contentContainer.style.position = 'relative';
    contentContainer.style.width = '100%';
    contentContainer.style.height = '100%';
    contentContainer.style.display = 'flex';
    contentContainer.style.alignItems = 'center';
    contentContainer.style.justifyContent = 'center';
    
    // 添加预览内容
    if (wallpaperData.type === 'image') {
        const img = document.createElement('img');
        img.src = wallpaperData.data;
        img.alt = '壁纸预览';
        contentContainer.appendChild(img);
    } else if (wallpaperData.type === 'video') {
        // 检查是否已经有data数据
        if (wallpaperData.data) {
            // 已有数据，直接创建视频预览
            const video = document.createElement('video');
            video.controls = false;
            video.autoplay = true;
            const blob = new Blob([wallpaperData.data], { type: wallpaperData.mimeType });
            video.src = URL.createObjectURL(blob);
            contentContainer.appendChild(video);
        } else {
            // 没有数据，从IndexedDB获取
            if (db) {
                const transaction = db.transaction('wallpapers', 'readonly');
                const store = transaction.objectStore('wallpapers');
                const request = store.get(wallpaperData.fileName);
                request.onsuccess = function (e) {
                    const videoData = e.target.result;
                    if (videoData) {
                        const video = document.createElement('video');
                        video.controls = false;
                        video.autoplay = true;
                        const blob = new Blob([videoData.data], { type: videoData.mimeType });
                        video.src = URL.createObjectURL(blob);
                        contentContainer.appendChild(video);
                    }
                };
            }
        }
    }
    
    // 创建SVG图标
    const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgIcon.setAttribute('class', 'icon');
    svgIcon.setAttribute('viewBox', '0 0 1024 1024');
    svgIcon.setAttribute('width', '60');
    svgIcon.setAttribute('height', '60');
    svgIcon.style.position = 'absolute';
    svgIcon.style.top = '50%';
    svgIcon.style.left = '50%';
    svgIcon.style.transform = 'translate(-50%, -50%)';
    svgIcon.style.zIndex = '10';
    svgIcon.style.cursor = 'pointer';
    
    // 为SVG图标添加点击事件，触发文件选择
    svgIcon.addEventListener('click', function() {
        // 检查是否已有隐藏的文件输入
        let hiddenFileInput = document.getElementById('hiddenWallpaperUpload');
        if (!hiddenFileInput) {
            // 创建隐藏的文件输入元素
            hiddenFileInput = document.createElement('input');
            hiddenFileInput.type = 'file';
            hiddenFileInput.id = 'hiddenWallpaperUpload';
            hiddenFileInput.accept = 'image/*,video/*';
            hiddenFileInput.style.display = 'none';
            
            // 添加文件选择事件监听
            hiddenFileInput.addEventListener('change', function() {
                // 当文件选择后，自动保存壁纸
                if (this.files && this.files.length > 0) {
                    // 调用saveWallpaper函数
                    saveWallpaper();
                }
            });
            
            // 将隐藏的文件输入添加到body
            document.body.appendChild(hiddenFileInput);
        }
        
        // 触发文件选择对话框
        hiddenFileInput.click();
    });
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M576 631.466667V725.333333h170.666667c59.733333-8.533333 106.666667-64 106.666666-128 0-72.533333-55.466667-128-128-128-17.066667 0-29.866667 4.266667-42.666666 8.533334V469.333333c0-93.866667-76.8-170.666667-170.666667-170.666666s-170.666667 76.8-170.666667 170.666666c0 17.066667 4.266667 29.866667 4.266667 46.933334-8.533333-4.266667-17.066667-4.266667-25.6-4.266667C260.266667 512 213.333333 558.933333 213.333333 618.666667S260.266667 725.333333 320 725.333333h170.666667v-93.866666l-46.933334 46.933333L384 618.666667l149.333333-149.333334 149.333334 149.333334-59.733334 59.733333-46.933333-46.933333z m0 93.866666v85.333334h-85.333333v-85.333334h-42.666667v85.333334h-128C213.333333 810.666667 128 725.333333 128 618.666667c0-85.333333 55.466667-157.866667 128-183.466667C273.066667 311.466667 379.733333 213.333333 512 213.333333c110.933333 0 209.066667 72.533333 243.2 170.666667 102.4 12.8 183.466667 102.4 183.466667 213.333333s-85.333333 200.533333-192 213.333334h-128v-85.333334h-42.666667z');
    path.setAttribute('fill', '#ffffff');
    path.setAttribute('p-id', '24480');
    
    svgIcon.appendChild(path);
    contentContainer.appendChild(svgIcon);
    
    previewContainer.appendChild(contentContainer);
}

// 4. 核心：将壁纸设置为网页背景
function setWallpaperAsBackground(wallpaperData) {
    const bgContainer = document.querySelector('.background-container');
    bgContainer.innerHTML = ''; // 清空原有背景

    if (wallpaperData.type === 'image') {
        // 图片背景：用img标签实现全屏覆盖
        const img = document.createElement('img');
        img.src = wallpaperData.data;
        img.alt = '网页背景';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        bgContainer.appendChild(img);

        // 更新壁纸预览
        const currentPreview = document.querySelector('.wallpaper-preview.current');
        if (currentPreview) {
            currentPreview.style.backgroundImage = `url(${wallpaperData.data})`;
        }
    } else if (wallpaperData.type === 'video') {
        // 视频背景：全屏、循环、静音、自动播放
        const video = document.createElement('video');
        video.loop = true; // 循环播放
        video.muted = true; // 静音（浏览器要求自动播放必须静音）
        video.autoplay = true; // 自动播放
        video.playsInline = true; // 移动端内联播放
        const blob = new Blob([wallpaperData.data], { type: wallpaperData.mimeType });
        video.src = URL.createObjectURL(blob);
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        bgContainer.appendChild(video);

        // 视频背景的预览使用视频的第一帧或占位图
        const currentPreview = document.querySelector('.wallpaper-preview.current');
        if (currentPreview) {
            // 对于视频，我们可以使用一个默认的预览图或尝试从视频中提取帧
            currentPreview.style.backgroundImage = `url(wallpaper.png)`;
        }
    }
}

// 5. 设置默认壁纸
function setDefaultWallpaper(imagePath) {
    const wallpaperData = {
        type: 'image',
        fileName: 'default-wallpaper.png',
        data: imagePath
    };
    localStorage.setItem('savedWallpaper', JSON.stringify(wallpaperData));
    setWallpaperAsBackground(wallpaperData);
    showWallpaperPreview(wallpaperData);
    setTimeout(() => {
        window.notificationSystem.info('个性设置', '嗯~又回来了喵');
    }, 1000);
}

// 6. 获取并显示必应壁纸
function loadBingWallpapers() {
    // 必应壁纸API URL（UHD超高清原图）
    const bingApiUrl = 'https://bing.img.run/uhd.php';

    // 创建单个壁纸卡片
    const bingWallpapersContainer = document.querySelector('.bing-wallpapers-container');
    if (!bingWallpapersContainer) return;

    // 保存默认壁纸
    const defaultWallpaper = bingWallpapersContainer.querySelector('.wallpaper-card');

    // 清空容器
    bingWallpapersContainer.innerHTML = '';

    // 重新添加默认壁纸
    if (defaultWallpaper) {
        bingWallpapersContainer.appendChild(defaultWallpaper);
    }

    const wallpaperCard = document.createElement('div');
    wallpaperCard.className = 'wallpaper-card';

    const img = document.createElement('img');
    img.className = 'wallpaper-thumbnail';
    img.src = bingApiUrl; // 使用缩略图URL
    img.alt = 'Bing每日壁纸UHD超高清原图';

    const title = document.createElement('div');
    title.className = 'wallpaper-title';
    title.textContent = 'Bing每日壁纸';

    // 添加点击事件
    wallpaperCard.addEventListener('click', () => {
        // 使用高清URL
        const wallpaperData = {
            type: 'image',
            fileName: 'bing-wallpaper.jpg',
            data: bingApiUrl
        };
        localStorage.setItem('savedWallpaper', JSON.stringify(wallpaperData));
        setWallpaperAsBackground(wallpaperData);
        showWallpaperPreview(wallpaperData);
        setTimeout(() => {
            window.notificationSystem.info('个性设置', '棒棒卡邦，必应喵');
        }, 1000);
    });

    wallpaperCard.appendChild(img);
    wallpaperCard.appendChild(title);
    bingWallpapersContainer.appendChild(wallpaperCard);
}

// 7. 页面刷新后恢复背景
function restoreWallpaper() {
    const savedWallpaperStr = localStorage.getItem('savedWallpaper');
    if (!savedWallpaperStr) return;

    const wallpaperData = JSON.parse(savedWallpaperStr);
    if (wallpaperData.type === 'image') {
        // 图片直接恢复背景+预览
        setWallpaperAsBackground(wallpaperData);
    } else if (wallpaperData.type === 'video') {
        // 视频从IndexedDB读取后恢复
        const transaction = db.transaction('wallpapers', 'readonly');
        const store = transaction.objectStore('wallpapers');
        const request = store.get(wallpaperData.fileName);

        request.onsuccess = function (e) {
            const videoData = e.target.result;
            if (videoData) {
                const fullVideoData = {
                    type: 'video',
                    fileName: wallpaperData.fileName,
                    mimeType: wallpaperData.mimeType,
                    data: videoData.data
                };
                setWallpaperAsBackground(fullVideoData); // 恢复背景
                showWallpaperPreview(fullVideoData); // 同时更新预览面板
            }
        };
        request.onerror = function (e) {
            console.error('视频读取失败:', e.target.error);
        };
    }
}

// 将壁纸功能初始化添加到DOMContentLoaded事件中
document.addEventListener('DOMContentLoaded', function () {
    initDB();
});