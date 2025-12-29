document.addEventListener('DOMContentLoaded', function () {
    const dockItems = document.querySelectorAll('.dock-item');
    const dock = document.querySelector('.dock');
    const separator = document.querySelector('.dock-separator');
    let draggedItem = null;
    let separatorIndex = Array.from(dock.children).indexOf(separator);
    let isLongPress = false;
    let longPressTimer = null;
    let folderTimer = null;
    // 首次打开面板标志
    let isFirstOpen = true;

    // 创建一个隐藏的测量元素，用于测量文本宽度
    const textMeasurer = document.createElement('div');
    textMeasurer.style.cssText = `
                position: absolute;
                visibility: hidden;
                white-space: pre;
                font-size: var(--search-text-size, 16px);
                font-family: inherit;
                padding: 0 var(--search-padding, 20px);
                gap: var(--search-gap, 15px);
            `;
    document.body.appendChild(textMeasurer);

    // 动态计算dock栏缩放比例的函数
    function calculateDockScale() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // 基于屏幕尺寸计算基础缩放比例
        // 使用较小的屏幕尺寸作为基准，确保dock在各种屏幕比例下都合适
        const baseScale = Math.min(screenWidth, screenHeight) / 1200;

        // 设置最小和最大缩放限制
        return Math.max(0.6, Math.min(1.5, baseScale));
    }

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 应用dock栏和Sidebar缩放的函数
    function applyDockScale() {
        const scale = calculateDockScale();
        const dock = document.querySelector('.dock');
        const dockItems = document.querySelectorAll('.dock-item');
        const separator = document.querySelector('.dock-separator');
        const firstItemOuterShape = document.querySelector('.dock-item:first-child .outer-shape');
        const firstItemInnerShape = document.querySelector('.dock-item:first-child .inner-shape');
        const sidebar = document.querySelector('.sidebar');
        const sidebarItems = document.querySelectorAll('.sidebar-item');

        if (!dock) return;

        // 设置CSS变量，用于伪元素的缩放
        document.documentElement.style.setProperty('--dock-scale', scale);

        // 保持当前的transform状态，只调整translateX（确保居中）
        // 不重置transform，以保留动画效果
        dock.style.transform = `translateX(-50%)`;

        // 计算并应用所有元素的尺寸和圆角，确保比例一致
        // dock本身的尺寸会自动适应内容

        // 调整dock的圆角比例、padding和gap
        dock.style.borderRadius = `${18 * scale}px`;
        dock.style.padding = `${7 * scale}px ${9 * scale}px`;
        dock.style.gap = `${8 * scale}px`;

        // 调整dock-item的尺寸和圆角
        dockItems.forEach(item => {
            item.style.width = `${40 * scale}px`;
            item.style.height = `${40 * scale}px`;
            item.style.borderRadius = `${10 * scale}px`;
        });

        // 调整separator的尺寸和圆角
        if (separator) {
            separator.style.width = `${3 * scale}px`;
            separator.style.height = `${16 * scale}px`;
            separator.style.borderRadius = `${20 * scale}px`;
        }

        // 调整first item的特殊样式
        if (firstItemOuterShape) {
            firstItemOuterShape.style.width = `${16 * scale}px`;
            firstItemOuterShape.style.height = `${29 * scale}px`;
            firstItemOuterShape.style.borderRadius = `${4 * scale}px`;
        }

        if (firstItemInnerShape) {
            firstItemInnerShape.style.width = `${13 * scale}px`;
            firstItemInnerShape.style.height = `${27 * scale}px`;
            firstItemInnerShape.style.borderRadius = `${3 * scale}px`;
        }

        // 调整Sidebar的尺寸（使用CSS变量，不覆盖hover状态）
        if (sidebar) {
            // 设置CSS变量来控制初始宽度和内边距，减小基础宽度至40px
            sidebar.style.setProperty('--sidebar-width', `${40 * scale}px`);
            // 减小上下边距至6px
            sidebar.style.setProperty('--sidebar-padding', `${6 * scale}px 0`);
            // 进一步减小gap
            sidebar.style.gap = `${4 * scale}px`;
        }

        // 调整Sidebar内部图标的尺寸（使用CSS变量，不覆盖hover状态）
        sidebarItems.forEach(item => {
            // 减小图标容器尺寸至32px
            item.style.setProperty('--sidebar-item-width', `${32 * scale}px`);
            item.style.setProperty('--sidebar-item-height', `${32 * scale}px`);
        });

        // 调整Sidebar图标尺寸，根据缩放比例动态计算
        const itemIcons = document.querySelectorAll('.item-icon');
        itemIcons.forEach(icon => {
            // 减小图标尺寸至28px
            icon.style.setProperty('--item-icon-size', `${28 * scale}px`);
        });

        // 调整搜索框尺寸
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            // 设置基础宽度（基于放大后的288px宽度）
            const baseWidth = 288 * scale;
            searchContainer.style.setProperty('--search-width', `${baseWidth}px`);

            // 新宽高比：180:33，根据基础宽度计算等比例高度
            const aspectRatio = 33 / 180;
            const proportionalHeight = baseWidth * aspectRatio;

            // 设置等比例的高度和其他属性
            searchContainer.style.setProperty('--search-height', `${proportionalHeight}px`);
            searchContainer.style.setProperty('--search-border-radius', `${18 * scale}px`);
            searchContainer.style.setProperty('--search-padding', `${20 * scale}px`);
            searchContainer.style.setProperty('--search-gap', `${15 * scale}px`);
            searchContainer.style.setProperty('--search-icon-size', `${28 * scale}px`);
            searchContainer.style.setProperty('--search-icon-stroke', `${30 * scale}px`);
            searchContainer.style.setProperty('--search-text-size', `${16 * scale}px`);

            // 动态设置最小宽度和最小高度，确保宽高比一致
            const minWidth = 200 * scale;
            const minHeight = minWidth * aspectRatio;
            searchContainer.style.setProperty('--search-min-width', `${minWidth}px`);
            searchContainer.style.setProperty('--search-min-height', `${minHeight}px`);
        }

        // 调整设置面板圆角和边距
        const settingsPanel = document.querySelector('.settings-panel');
        if (settingsPanel) {
            // 根据缩放比例动态调整设置面板的圆角
            document.documentElement.style.setProperty('--settings-border-radius', `${30 * scale}px`);
            // 根据缩放比例动态调整设置面板内部元素的边距
            document.documentElement.style.setProperty('--settings-panel-margin', `${10 * scale}px`);
            // 根据缩放比例动态调整左侧圆角div的圆角
            document.documentElement.style.setProperty('--settings-border-radius-inner', `${24 * scale}px`);
            // 根据缩放比例动态调整左侧圆角div的内边距
            document.documentElement.style.setProperty('--settings-panel-left-padding', `${7.5 * scale}px`);
        }

        // 调整个人资料头像尺寸和圆角
        document.documentElement.style.setProperty('--profile-avatar-size', `${50 * scale}px`);
        document.documentElement.style.setProperty('--profile-avatar-radius', `${12.5 * scale}px`);
        document.documentElement.style.setProperty('--profile-avatar-margin-right', `${10 * scale}px`);

        // 调整用户名和签名的字体大小
        document.documentElement.style.setProperty('--profile-name-size', `${18 * scale}px`);
        document.documentElement.style.setProperty('--profile-signature-size', `${10 * scale}px`);
        document.documentElement.style.setProperty('--profile-name-margin-bottom', `${3 * scale}px`);

        // 调整菜单选项的边距和字体大小
        document.documentElement.style.setProperty('--settings-menu-gap', `${6 * scale}px`);
        document.documentElement.style.setProperty('--settings-menu-padding', `${6 * scale}px`);
        document.documentElement.style.setProperty('--settings-menu-item-padding', `${12 * scale}px ${12 * scale}px`);
        document.documentElement.style.setProperty('--settings-menu-item-font-size', `${14 * scale}px`);
        document.documentElement.style.setProperty('--settings-menu-item-gap', `${10 * scale}px`);
        document.documentElement.style.setProperty('--settings-menu-item-icon-size', `${24 * scale}px`);

        // 调整个人资料信息的边距
        document.documentElement.style.setProperty('--profile-info-padding', `${8 * scale}px`);
        document.documentElement.style.setProperty('--profile-info-margin-bottom', `${15 * scale}px`);

        // 调整右侧面板样式
        document.documentElement.style.setProperty('--settings-panel-right-padding', `${20 * scale}px`);
        document.documentElement.style.setProperty('--settings-content-title-size', `${24 * scale}px`);
        document.documentElement.style.setProperty('--settings-content-title-margin-bottom', `${10 * scale}px`);
        document.documentElement.style.setProperty('--settings-content-text-size', `${14 * scale}px`);
        document.documentElement.style.setProperty('--settings-content-text-margin-bottom', `${15 * scale}px`);
        document.documentElement.style.setProperty('--settings-content-text-line-height', `${1.6}`);
        document.documentElement.style.setProperty('--settings-content-option-margin-bottom', `${15 * scale}px`);
        document.documentElement.style.setProperty('--settings-content-option-padding', `${12 * scale}px`);
        document.documentElement.style.setProperty('--settings-content-option-border-radius', `${12 * scale}px`);
        document.documentElement.style.setProperty('--settings-content-option-label-size', `${14 * scale}px`);
        document.documentElement.style.setProperty('--settings-content-option-label-margin-bottom', `${8 * scale}px`);
        document.documentElement.style.setProperty('--settings-content-input-padding', `${10 * scale}px ${12 * scale}px`);
        document.documentElement.style.setProperty('--settings-content-input-border-radius', `${8 * scale}px`);
        document.documentElement.style.setProperty('--settings-content-input-font-size', `${14 * scale}px`);
        document.documentElement.style.setProperty('--settings-toggle-width', `${48 * scale}px`);
        document.documentElement.style.setProperty('--settings-toggle-height', `${24 * scale}px`);
        document.documentElement.style.setProperty('--settings-toggle-border-radius', `${12 * scale}px`);
        document.documentElement.style.setProperty('--settings-toggle-handle-size', `${20 * scale}px`);
        document.documentElement.style.setProperty('--settings-toggle-handle-top', `${2 * scale}px`);
        document.documentElement.style.setProperty('--settings-toggle-handle-left', `${2 * scale}px`);
        document.documentElement.style.setProperty('--settings-toggle-handle-translate', `${24 * scale}px`);

        // 滚动条相关变量
        document.documentElement.style.setProperty('--settings-scrollbar-width', `${8 * scale}px`);
        document.documentElement.style.setProperty('--settings-scrollbar-right-offset', `${10 * scale}px`);
        document.documentElement.style.setProperty('--settings-scrollbar-border-radius', `${6 * scale}px`);
        document.documentElement.style.setProperty('--settings-scrollbar-thumb-min-height', `${30 * scale}px`);

    }

    // 长按拖动逻辑
    dockItems.forEach(item => {
        if (item.draggable) {
            item.addEventListener('mousedown', function () {
                longPressTimer = setTimeout(() => {
                    isLongPress = true;
                }, 300);
            });

            item.addEventListener('mouseup', function () {
                clearTimeout(longPressTimer);
                isLongPress = false;
            });

            item.addEventListener('touchstart', function () {
                longPressTimer = setTimeout(() => {
                    isLongPress = true;
                }, 300);
            });

            item.addEventListener('touchend', function () {
                clearTimeout(longPressTimer);
                isLongPress = false;
            });
        }
    });

    // 首个item点击弹出右侧面板
    const firstItem = document.querySelector('.dock-item:first-child');

    // 点击事件
    // 为所有dock-item添加点击时激活状态的处理
    dockItems.forEach(item => {
        item.addEventListener('click', function (e) {
            // 如果是第一个item，不处理激活状态（因为它有特殊的面板弹出逻辑）
            if (this === firstItem) return;

            // 切换当前点击的dock-item的激活状态（独立控制）
            this.classList.toggle('active');
        });
    });
    const rightPanel = document.createElement('div');
    rightPanel.className = 'right-panel';
    document.body.appendChild(rightPanel);

    // 打开主页功能
    function openHomepage() {
        // 获取用户设置的主页
        const savedHomepageUrl = localStorage.getItem('homepageUrl');
        const useNewTab = localStorage.getItem('useNewTab') === 'true';

        // 确定要打开的URL
        let targetUrl = 'chrome://newtab'; // 默认使用新标签页

        if (!useNewTab && savedHomepageUrl) {
            targetUrl = savedHomepageUrl;
        }

        // 检查是否在扩展环境中
        if (chrome && chrome.tabs) {
            // 扩展环境：打开新标签页，使用用户设置的主页
            chrome.tabs.create({ url: targetUrl });
        } else {
            // 普通网页环境：只在有主页设置且不使用新标签页时跳转，避免页面刷新
            if (!useNewTab && savedHomepageUrl) {
                window.location.href = savedHomepageUrl;
            }
            // 否则不执行任何操作，避免页面刷新
        }
    }

    // Create inner panel
    const innerPanel = document.createElement('div');
    innerPanel.className = 'inner-panel';
    rightPanel.appendChild(innerPanel);

    // 创建scrcpy iframe的函数
    function createScrcpyIframe() {
        const scrcpyIframe = document.createElement('iframe');
        scrcpyIframe.src = 'scrcpy/dist/index.html';
        scrcpyIframe.style.width = '100%';
        scrcpyIframe.style.height = '100%';
        scrcpyIframe.style.border = 'none';
        scrcpyIframe.style.backgroundColor = 'transparent';
        return scrcpyIframe;
    }

    // 初始化时创建iframe
    let scrcpyIframe = createScrcpyIframe();
    innerPanel.appendChild(scrcpyIframe);

    firstItem.addEventListener('click', function () {
        const innerShape = this.querySelector('.inner-shape');
        if (!innerShape) return;

        // 检查面板当前状态
        const isPanelOpen = rightPanel.classList.contains('show');

        if (isPanelOpen) {
            // 面板已打开，关闭面板
            // 向iframe发送消息，通知关闭连接
            if (scrcpyIframe.contentWindow) {
                scrcpyIframe.contentWindow.postMessage({ action: 'stop-scrcpy' }, '*');
            }
            // 移除iframe，确保资源正确清理
            innerPanel.removeChild(scrcpyIframe);
            scrcpyIframe = null;
            rightPanel.classList.remove('show');
            this.classList.remove('active');
        } else {
            // 面板已关闭，打开面板
            this.classList.add('active');

            if (isFirstOpen) {
                // 首次打开，显示加载动画
                innerShape.classList.add('loading');

                // 延迟弹出面板（保留原有的加载动画）
                setTimeout(() => {
                    innerShape.classList.remove('loading');
                    rightPanel.classList.add('show');
                    // 标记为非首次打开
                    isFirstOpen = false;
                }, 1000);
            } else {
                // 非首次打开，直接显示面板
                rightPanel.classList.add('show');
            }

            // 创建新的iframe
            if (!scrcpyIframe) {
                scrcpyIframe = createScrcpyIframe();
                innerPanel.appendChild(scrcpyIframe);
            }
        }
    });

    // 获取当前壁纸URL
    function getCurrentWallpaperURL() {
        // 检查是否有背景图片元素
        const bgImage = document.querySelector('.background-container img');
        if (bgImage) {
            return bgImage.src;
        }

        // 检查是否有背景视频元素
        const bgVideo = document.querySelector('.background-container video');
        if (bgVideo) {
            // 对于视频，我们可以返回默认预览图或视频源
            return 'image/wallpaper.png';
        }

        // 回退到原始的背景图层方法
        const currentLayer = document.querySelector('.background-layer.current');
        if (currentLayer) {
            const backgroundImage = currentLayer.style.backgroundImage;
            return backgroundImage.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
        }

        return '';
    }

    // 同步预览容器与当前壁纸
    function syncWallpaperPreview() {
        const wallpaperURL = getCurrentWallpaperURL();
        const currentPreview = document.querySelector('.wallpaper-preview.current');
        if (currentPreview && wallpaperURL) {
            currentPreview.style.backgroundImage = `url(${wallpaperURL})`;
        }
    }

    // 初始化壁纸预览
    syncWallpaperPreview();

    // 初始化dock栏缩放
    applyDockScale();

    // 添加窗口大小改变事件监听器
    // 使用防抖函数优化窗口调整事件
    const debouncedApplyDockScale = debounce(applyDockScale, 100);
    window.addEventListener('resize', debouncedApplyDockScale);

    // 为窗口大小变化添加滚动条更新
    window.addEventListener('resize', debounce(updateCustomScrollbar, 100));
    // 监听窗口尺寸变化，重置搜索框宽度
    window.addEventListener('resize', debounce(() => {
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            // 重置搜索框宽度为基于缩放比例计算的宽度
            const scale = calculateDockScale();
            const baseWidth = 288 * scale;
            searchContainer.style.width = `${baseWidth}px`;
        }
    }, 100));

    // 添加页面进入动画
    const sidebar = document.querySelector('.sidebar');

    // 添加延迟以增强动画效果
    setTimeout(() => {
        dock.classList.add('animate');
        sidebar.classList.add('animate');
        // 添加搜索框动画
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.classList.add('animate');
        }
    }, 100);

    // 创建设置面板
    const settingsPanel = document.createElement('div');
    settingsPanel.className = 'settings-panel';

    // 添加左侧25%区域的圆角div
    const leftRoundedDiv = document.createElement('div');
    leftRoundedDiv.className = 'settings-panel-left-div';

    // 添加个人信息栏
    const profileInfo = document.createElement('div');
    profileInfo.className = 'profile-info';

    // 头像
    const profileAvatar = document.createElement('div');
    profileAvatar.className = 'profile-avatar';

    // 个人详情
    const profileDetails = document.createElement('div');
    profileDetails.className = 'profile-details';

    // 通知系统功能
    class NotificationSystem {
        constructor() {
            this.container = document.querySelector('.notification-container');
            if (!this.container) {
                console.error('通知容器未找到');
                return;
            }
            this.notifications = [];
            this.maxNotifications = 5;
        }

        // 创建通知
        createNotification(type = 'info', title, message) {
            // 如果超过最大通知数量，移除最旧的
            if (this.notifications.length >= this.maxNotifications) {
                const oldestNotification = this.notifications.shift();
                oldestNotification.remove();
            }

            // 创建通知元素
            const notification = document.createElement('div');
            notification.className = 'notification-item';

            // 创建图标
            const icon = document.createElement('div');
            icon.className = 'notification-icon';
            icon.innerHTML = this.getIconHTML(type);

            // 创建内容
            const content = document.createElement('div');
            content.className = 'notification-content';

            const notificationTitle = document.createElement('div');
            notificationTitle.className = 'notification-title';
            notificationTitle.textContent = title;

            const notificationMessage = document.createElement('div');
            notificationMessage.className = 'notification-message';
            notificationMessage.textContent = message;

            // 组装内容
            content.appendChild(notificationTitle);
            content.appendChild(notificationMessage);

            // 组装通知
            notification.appendChild(icon);
            notification.appendChild(content);

            // 添加到容器
            this.container.appendChild(notification);
            this.notifications.push(notification);

            // 添加进入动画
            setTimeout(() => {
                notification.style.animation = 'notificationSlideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
            }, 10);

            // 设置自动关闭
            setTimeout(() => {
                this.removeNotification(notification);
            }, 5000);

            return notification;
        }

        // 获取不同类型通知的图标HTML
        getIconHTML(type) {
            const icons = {
                info: `
                    <svg t="1767024625477" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16396" data-spm-anchor-id="a313x.search_index.0.i13.30353a81LHomnR" width="200" height="200"><path d="M761.514667 464.554667l106.154666-106.496c21.504-21.504 21.504-55.637333 0-77.141334l-104.106666-104.106666c-21.162667-21.504-55.637333-21.504-77.141334 0l-106.154666 105.813333L303.104 559.786667l-41.301333 41.301333c-10.922667 10.922667-19.114667 24.917333-24.234667 39.594667l-44.714667 163.84c-6.144 19.456 4.778667 40.277333 24.576 46.762666 7.168 2.389333 15.018667 2.389333 22.186667 0l163.84-44.714666c15.018667-4.778667 28.672-12.629333 39.936-24.234667l40.96-40.96 277.162667-276.821333z" fill="#06CC76" opacity=".6" p-id="16397" data-spm-anchor-id="a313x.search_index.0.i11.30353a81LHomnR" class=""></path><path d="M866.645333 737.28l-98.986666 98.986667c-23.210667 22.869333-60.757333 22.869333-84.309334-0.341334l-20.48-20.48c-12.288-12.288-12.288-32.085333 0-44.032l62.805334-62.805333c11.605333-11.605333 11.605333-30.72 0-42.666667-11.605333-11.605333-30.72-11.605333-42.666667 0l-62.805333 62.805334c-12.288 12.288-32.085333 12.288-44.032 0-12.288-12.288-12.288-32.085333 0-44.032l11.946666-11.946667c11.605333-11.605333 11.605333-30.72 0-42.666667-11.605333-11.605333-30.72-11.605333-42.666666 0l-12.288 12.288c-12.288 12.288-32.085333 12.288-44.032 0-12.288-12.288-12.288-32.085333 0-44.032l62.805333-62.805333c11.605333-11.605333 11.605333-30.72 0-42.666667-11.605333-11.605333-30.72-11.605333-42.666667 0l-62.805333 62.805334c-12.288 12.288-32.085333 12.288-44.032 0-12.288-12.288-12.288-32.085333 0-44.032l12.288-12.288c11.605333-11.605333 11.605333-30.72 0-42.666667-11.605333-11.605333-30.72-11.605333-42.666667 0l-12.288 12.288c-12.288 12.288-32.085333 12.288-44.032 0-12.288-12.288-12.288-32.085333 0-44.032l62.805334-62.805333c11.605333-11.605333 11.605333-30.72 0-42.666667-11.605333-11.605333-30.72-11.605333-42.666667 0L273.066667 382.293333c-12.288 12.288-32.085333 12.288-44.373334 0l-20.48-20.821333c-23.210667-23.210667-23.210667-61.098667 0-84.309333l98.645334-98.645334c23.210667-23.210667 61.44-23.210667 84.309333 0l475.477333 475.136c23.210667 22.528 23.210667 60.074667 0 83.626667z" fill="#ffffff" opacity=".6" p-id="16398" data-spm-anchor-id="a313x.search_index.0.i12.30353a81LHomnR" class=""></path></svg>
                `,
                success: `
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 24L18 32L38 12" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M38 24C38 31.732 31.732 38 24 38C16.268 38 10 31.732 10 24C10 16.268 16.268 10 24 10C31.732 10 38 16.268 38 24Z" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `,
                error: `
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 10V18" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M24 30V38" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M38 24C38 31.732 31.732 38 24 38C16.268 38 10 31.732 10 24C10 16.268 16.268 10 24 10C31.732 10 38 16.268 38 24Z" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `,
                warning: `
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 10V18" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M24 30V38" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M38 24C38 31.732 31.732 38 24 38C16.268 38 10 31.732 10 24C10 16.268 16.268 10 24 10C31.732 10 38 16.268 38 24Z" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `
            };
            return icons[type] || icons.info;
        }

        // 移除通知
        removeNotification(notification) {
            if (notification) {
                // 添加退出动画
                notification.style.animation = 'notificationSlideOut 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
                setTimeout(() => {
                    notification.remove();
                    // 从数组中移除
                    const index = this.notifications.indexOf(notification);
                    if (index > -1) {
                        this.notifications.splice(index, 1);
                    }
                }, 300);
            }
        }

        // 显示不同类型的通知
        info(title, message) {
            return this.createNotification('info', title, message);
        }

        success(title, message) {
            return this.createNotification('success', title, message);
        }

        error(title, message) {
            return this.createNotification('error', title, message);
        }

        warning(title, message) {
            return this.createNotification('warning', title, message);
        }
    }

    // 初始化通知系统
    window.notificationSystem = new NotificationSystem();

    // 为通知系统添加动态缩放功能
    (function() {
        // 计算并应用缩放比例
        function applyNotificationScale() {
            const container = document.querySelector('.notification-container');
            if (!container) return;
            
            const windowWidth = window.innerWidth;
            let scale = 1;
            
            // 根据窗口宽度调整缩放比例
            if (windowWidth < 1920) {
                scale = 0.9;
            }
            if (windowWidth < 1280) {
                scale = 0.6;
            }
            if (windowWidth < 1024) {
                scale = 0.8;
            }
            if (windowWidth < 768) {
                scale = 0.5;
            }
            if (windowWidth < 480) {
                scale = 0.4;
            }
            
            container.style.transform = `scale(${scale})`;
            container.style.transformOrigin = 'top right';
        }
        
        // 监听窗口大小变化
        window.addEventListener('resize', applyNotificationScale);
        
        // 页面加载时应用初始缩放
        window.addEventListener('load', applyNotificationScale);
        
        // 立即应用一次缩放
        applyNotificationScale();
    })();

    //样例
    //setTimeout(() => {
    //    window.notificationSystem.info('个性设置', '哇唔~新壁纸喵');
    //}, 1000);

    // 添加退出动画CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes notificationSlideOut {
            0% {
                transform: translateX(0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translateX(100%) scale(0.8);
                opacity: 0;
            }
        }
        
        /* 通知容器的过渡效果 */
        .notification-container {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
    `;
    document.head.appendChild(style);

    // 名称
    const profileName = document.createElement('div');
    profileName.className = 'profile-name';
    profileName.textContent = '你好喵';

    // 签名
    const profileSignature = document.createElement('div');
    profileSignature.className = 'profile-signature';
    profileSignature.textContent = '这里是签名喵';

    // 组装个人信息栏
    profileDetails.appendChild(profileName);
    profileDetails.appendChild(profileSignature);
    profileInfo.appendChild(profileAvatar);
    profileInfo.appendChild(profileDetails);

    // 更新个人信息显示的函数
    function updateProfileInfo() {
        const savedName = localStorage.getItem('userName');
        const savedSignature = localStorage.getItem('userSignature');
        const savedAvatar = localStorage.getItem('userAvatar');

        if (profileName && savedName) {
            profileName.textContent = savedName;
        }

        if (profileSignature && savedSignature) {
            profileSignature.textContent = savedSignature;
        }

        if (profileAvatar && savedAvatar) {
            profileAvatar.style.backgroundImage = `url('${savedAvatar}')`;
        }
    }

    // 初始化时更新个人信息
    updateProfileInfo();



    // 添加设置一级菜单列表
    const settingsMenu = document.createElement('div');
    settingsMenu.className = 'settings-menu';

    // 菜单项列表（包含图标）
    const menuItems = [
        { text: '账户信息', icon: 'account' },
        { text: '常规设置', icon: 'general' },
        { text: '搜索设置', icon: 'search' },
        { text: '个性设置', icon: 'personalized' },
        { text: '重置设置', icon: 'reset' },
        { text: '关于我们', icon: 'about' }
    ];

    // 定义保存壁纸的点击处理函数
    function handleSaveWallpaperClick() {
        // 调用search.js中定义的saveWallpaper函数
        if (typeof saveWallpaper === 'function') {
            saveWallpaper();
        } else {
            console.error('saveWallpaper函数未定义，请确保search.js文件已正确加载');
            setTimeout(() => {
                window.notificationSystem.info('个性设置', '保存出了问题，这种情况一般刷新就能好喵');
            }, 1000);
        }
    }

    // SVG图标映射
    const icons = {
        account: '<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="12" r="8" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 44C42 34.0589 33.9411 26 24 26C14.0589 26 6 34.0589 6 44" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        general: '<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M41.5 10H35.5" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M27.5 6V14" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M27.5 10L5.5 10" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 24H5.5" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.5 20V28" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M43.5 24H21.5" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M41.5 38H35.5" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M27.5 34V42" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M27.5 38H5.5" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        search: '<svg t="1766450759918" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8289" width="200" height="200"><path d="M741.4 704.7c49.7-58.2 77.8-132 77.8-209.8 0-178.8-145-323.8-323.8-323.8S171.7 316.1 171.7 495c0 178.8 145 323.8 323.8 323.8 32.4 0 64.2-4.8 94.6-14 13.5-4.1 21.1-18.4 17-32-4.1-13.5-18.4-21.1-32-17-25.6 7.8-52.3 11.8-79.6 11.8-150.6 0-272.6-122-272.6-272.6 0-150.6 122-272.6 272.6-272.6 150.5 0 272.6 122 272.6 272.6 0 71.4-28.3 138.9-77.7 189.9-11.3 11.6-11.1 30.1 0.3 41.5l120 120c10 10 26.2 10 36.2 0 10-10 10-26.2 0-36.2L741.4 704.7z m0 0" p-id="8290" fill="#ffffff" stroke="#ffffff" stroke-width="var(--search-icon-stroke, 30)"></path></svg>',
        personalized: '<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="none" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/><path d="M24 36C30.6274 36 36 30.6274 36 24" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        reset: '<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M36.7279 36.7279C33.4706 39.9853 28.9706 42 24 42C14.0589 42 6 33.9411 6 24C6 14.0589 14.0589 6 24 6C28.9706 6 33.4706 8.01472 36.7279 11.2721C38.3859 12.9301 42 17 42 17" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 8V17H33" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        about: '<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.9986 5L17.8856 17.4776L4 19.4911L14.0589 29.3251L11.6544 43L23.9986 36.4192L36.3454 43L33.9586 29.3251L44 19.4911L30.1913 17.4776L23.9986 5Z" fill="none" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/></svg>'
    };

    // 定义不同设置内容的HTML模板
    const settingsContentTemplates = {
        '账户信息': `
                    <div class="settings-header">
                        <h2 class="settings-content-title">账户信息</h2>
                    </div>
                    <div class="settings-options">
                        <p> </p>
                        <div class="settings-content-option">
                            <div class="settings-content-option-title">头像</div>
                            <div class="avatar-upload-container">
                                <div class="avatar-preview" id="avatarPreview"></div>
                                <label for="avatarUpload" class="avatar-upload-label">
                                    <span>上传头像</span>
                                    <input type="file" id="avatarUpload" accept="image/*" style="display: none;">
                                </label>
                            </div>
                        </div>
                        <div class="settings-content-option">
                            <div class="settings-content-option-title">用户名</div>
                            <div class="settings-content-input-group">
                                <input type="text" class="settings-content-input" id="userNameInput" value="你好喵">
                                <button class="settings-modify-button" id="modifyUserName">修改</button>
                            </div>
                        </div>
                        <div class="settings-content-option">
                            <div class="settings-content-option-title">签名</div>
                            <div class="settings-content-input-group">
                                <input type="text" class="settings-content-input" id="userSignatureInput" value="这里是签名喵">
                                <button class="settings-modify-button" id="modifySignature">修改</button>
                            </div>
                        </div>
                        <p> </p>
                        <p> </p>
                        <p> </p>
                    </div>
                `,
        '常规设置': `
                    <div class="settings-header">
                        <h2 class="settings-content-title">常规设置</h2>
                    </div>
                    <div class="settings-options">
                        <p> </p>
                        <div class="settings-content-option">
                            <div class="settings-content-option-title">主页设置</div>
                            <div class="settings-content-input-group">
                                <input type="text" class="settings-content-input" id="homepageUrlInput" placeholder="请输入主页URL">
                                <button class="settings-modify-button" id="saveHomepageUrl">保存</button>
                            </div>
                        </div>
                        <div class="settings-content-option">
                            <div class="settings-content-option-title">使用新标签页作为主页</div>
                            <div class="settings-toggle" id="useNewTabToggle"></div>
                        </div>
                    </div>
                `,
        '搜索设置': `
                    <div class="settings-header">
                        <h2 class="settings-content-title">搜索设置</h2>
                    </div>
                    <div class="settings-options">
                        <p> </p>
                        <div class="settings-content-option">
                            <div class="settings-content-option-title">默认搜索引擎</div>
                            <select class="settings-select" id="searchEngineSelect">
                                <option value="bing">Bing</option>
                                <option value="google">Google</option>
                                <option value="baidu">百度</option>
                            </select>
                        </div>
                        <div class="settings-content-option">
                            <div class="settings-content-option-title">默认翻译引擎</div>
                            <select class="settings-select" id="translateEngineSelect">
                                <option value="microsoft">Microsoft翻译</option>
                                <option value="google">Google翻译</option>
                                <option value="baidu">百度翻译</option>
                            </select>
                        </div>
                        <p> </p>
                    </div>
                `,
        '个性设置': `
                    <div class="settings-header">
                        <h2 class="settings-content-title">个性设置</h2>
                    </div>
                    <div class="settings-options">
                        <p> </p>
                        <div class="settings-content-section">
                            <div class="settings-content-option-title">壁纸预览</div>
                            <div class="wallpaper-preview-container" id="wallpaperPreview">
                            </div>
                        </div>
                        <div class="settings-content-section">
                            <div class="settings-content-option-title">更多壁纸</div>
                            <div class="bing-wallpapers-container">
                                <div class="wallpaper-card" onclick="setDefaultWallpaper('image/wallpaper.png')">
                                    <img src="image/wallpaper.png" alt="默认壁纸" class="wallpaper-thumbnail">
                                    <div class="wallpaper-title">默认壁纸</div>
                                </div>
                            </div>
                        </div>
                        <p> </p>
                        <p> </p>
                        <p> </p>
                    </div>
                `,
        '重置设置': `
                    <div class="settings-header">
                        <h2 class="settings-content-title">重置设置</h2>
                    </div>
                    <div class="settings-options">
                        <p> </p>
                        </div>
                    </div>
                `,
        '关于我们': `
                    <div class="settings-header">
                        <h2 class="settings-content-title">关于我们</h2>
                    </div>
                    <div class="settings-options">
                        <p> </p>
                    </div>
                `
    };

    // 创建菜单项
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'settings-menu-item';

        // 创建图标元素
        const iconDiv = document.createElement('div');
        iconDiv.className = 'menu-item-icon';
        iconDiv.innerHTML = icons[item.icon];

        // 创建文本元素
        const textDiv = document.createElement('div');
        textDiv.className = 'menu-item-text';
        textDiv.textContent = item.text;

        // 创建右侧箭头图标
        const arrowDiv = document.createElement('div');
        arrowDiv.className = 'menu-item-arrow';
        arrowDiv.innerHTML = `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12L31 24L19 36" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        // 组合图标、文本和箭头
        menuItem.appendChild(iconDiv);
        menuItem.appendChild(textDiv);
        menuItem.appendChild(arrowDiv);

        // 添加点击事件处理函数
        menuItem.addEventListener('click', function () {
            // 移除所有菜单项的active状态
            document.querySelectorAll('.settings-menu-item').forEach(item => {
                item.classList.remove('active');
            });

            // 为当前菜单项添加active状态
            this.classList.add('active');

            // 更新右侧内容
            const settingsContent = document.getElementById('settings-content');
            if (settingsContent) {
                settingsContent.innerHTML = settingsContentTemplates[item.text] || '';

                // 为新添加的开关按钮添加点击事件
                const toggles = settingsContent.querySelectorAll('.settings-toggle');
                toggles.forEach(toggle => {
                    toggle.addEventListener('click', function () {
                        this.classList.toggle('active');
                    });
                });

                // 处理个性设置功能
                if (item.text === '个性设置') {
                    // 加载必应壁纸
                    loadBingWallpapers();

                    // 初始化当前壁纸预览
                    const savedWallpaperStr = localStorage.getItem('savedWallpaper');
                    if (savedWallpaperStr) {
                        const wallpaperData = JSON.parse(savedWallpaperStr);
                        showWallpaperPreview(wallpaperData);
                    }

                    // 为保存壁纸按钮添加点击事件监听器
                    const saveWallpaperBtn = settingsContent.querySelector('#saveWallpaperBtn');
                    if (saveWallpaperBtn) {
                        // 移除可能存在的旧事件监听器
                        saveWallpaperBtn.removeEventListener('click', handleSaveWallpaperClick);
                        // 添加新的事件监听器
                        saveWallpaperBtn.addEventListener('click', handleSaveWallpaperClick);
                    }
                }

                // 处理常规设置功能
                if (item.text === '常规设置') {
                    // 加载保存的主页设置
                    const homepageUrlInput = settingsContent.querySelector('#homepageUrlInput');
                    const useNewTabToggle = settingsContent.querySelector('#useNewTabToggle');
                    const saveHomepageUrlBtn = settingsContent.querySelector('#saveHomepageUrl');

                    // 加载保存的设置
                    const savedHomepageUrl = localStorage.getItem('homepageUrl');
                    const useNewTab = localStorage.getItem('useNewTab') === 'true';

                    if (homepageUrlInput) {
                        homepageUrlInput.value = savedHomepageUrl || '';
                    }

                    if (useNewTabToggle) {
                        if (useNewTab) {
                            useNewTabToggle.classList.add('active');
                        }

                        // 添加切换事件
                        useNewTabToggle.addEventListener('click', function () {
                            this.classList.toggle('active');
                            localStorage.setItem('useNewTab', this.classList.contains('active'));
                        });
                    }

                    // 处理保存主页URL
                    if (saveHomepageUrlBtn && homepageUrlInput) {
                        saveHomepageUrlBtn.addEventListener('click', function () {
                            const homepageUrl = homepageUrlInput.value.trim();
                            if (homepageUrl) {
                                localStorage.setItem('homepageUrl', homepageUrl);
                                console.log('主页URL已保存:', homepageUrl);
                            }
                        });
                    }
                }

                // 处理搜索设置功能
                if (item.text === '搜索设置') {
                    // 加载保存的搜索引擎设置
                    const searchEngineSelect = settingsContent.querySelector('#searchEngineSelect');
                    const translateEngineSelect = settingsContent.querySelector('#translateEngineSelect');

                    if (searchEngineSelect) {
                        const savedSearchEngine = localStorage.getItem('searchEngine') || 'bing';
                        searchEngineSelect.value = savedSearchEngine;

                        // 添加change事件监听器，保存选择的搜索引擎
                        searchEngineSelect.addEventListener('change', function () {
                            localStorage.setItem('searchEngine', this.value);
                            console.log('搜索设置已保存:', this.value);
                        });
                    }

                    if (translateEngineSelect) {
                        const savedTranslateEngine = localStorage.getItem('translateEngine') || 'microsoft';
                        translateEngineSelect.value = savedTranslateEngine;

                        // 添加change事件监听器，保存选择的翻译引擎
                        translateEngineSelect.addEventListener('change', function () {
                            localStorage.setItem('translateEngine', this.value);
                            console.log('翻译设置已保存:', this.value);
                        });
                    }
                }

                // 处理头像上传功能
                const avatarUpload = settingsContent.querySelector('#avatarUpload');
                const avatarPreview = settingsContent.querySelector('#avatarPreview');
                const userNameInput = settingsContent.querySelector('#userNameInput');
                const userSignatureInput = settingsContent.querySelector('#userSignatureInput');
                const modifyUserNameBtn = settingsContent.querySelector('#modifyUserName');
                const modifySignatureBtn = settingsContent.querySelector('#modifySignature');

                if (avatarUpload && avatarPreview) {
                    avatarUpload.addEventListener('change', function (e) {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = function (event) {
                                avatarPreview.style.backgroundImage = `url('${event.target.result}')`;
                                // 自动保存头像到本地存储
                                const avatarUrl = event.target.result;
                                localStorage.setItem('userAvatar', avatarUrl);
                                // 更新左侧面板显示
                                updateProfileInfo();
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                }

                // 保存用户信息函数
                function saveUserInfo(field, value) {
                    localStorage.setItem(field, value);
                    updateProfileInfo();
                    console.log(`${field} 已保存: ${value}`);
                }

                // 处理修改用户名
                if (modifyUserNameBtn && userNameInput) {
                    modifyUserNameBtn.addEventListener('click', function () {
                        saveUserInfo('userName', userNameInput.value);
                    });
                }

                // 处理修改签名
                if (modifySignatureBtn && userSignatureInput) {
                    modifySignatureBtn.addEventListener('click', function () {
                        saveUserInfo('userSignature', userSignatureInput.value);
                    });
                }

                // 处理Enter键保存
                if (userNameInput) {
                    userNameInput.addEventListener('keypress', function (e) {
                        if (e.key === 'Enter') {
                            saveUserInfo('userName', userNameInput.value);
                        }
                    });
                }

                if (userSignatureInput) {
                    userSignatureInput.addEventListener('keypress', function (e) {
                        if (e.key === 'Enter') {
                            saveUserInfo('userSignature', userSignatureInput.value);
                        }
                    });
                }

                // 初始化用户信息
                function initUserInfo() {
                    const savedName = localStorage.getItem('userName');
                    const savedSignature = localStorage.getItem('userSignature');
                    const savedAvatar = localStorage.getItem('userAvatar');

                    if (userNameInput && savedName) {
                        userNameInput.value = savedName;
                    }

                    if (userSignatureInput && savedSignature) {
                        userSignatureInput.value = savedSignature;
                    }

                    if (avatarPreview && savedAvatar) {
                        avatarPreview.style.backgroundImage = `url('${savedAvatar}')`;
                    }
                }

                // 初始化当前用户信息
                initUserInfo();

                // 更新自定义滚动条
                updateCustomScrollbar();
            }
        });

        settingsMenu.appendChild(menuItem);
    });

    // 设置默认选中第一个菜单项
    const firstMenuItem = document.querySelector('.settings-menu-item');
    if (firstMenuItem) {
        firstMenuItem.classList.add('active');
    }

    // 将所有元素添加到左侧面板
    leftRoundedDiv.appendChild(profileInfo);
    leftRoundedDiv.appendChild(settingsMenu);

    // 创建右侧内容面板
    const rightContentPanel = document.createElement('div');
    rightContentPanel.className = 'settings-panel-right-div';

    // 创建设置内容容器
    const settingsContent = document.createElement('div');
    settingsContent.id = 'settings-content';

    // 创建自定义滚动条
    const scrollbarContainer = document.createElement('div');
    scrollbarContainer.className = 'custom-scrollbar-container';

    const scrollbarTrack = document.createElement('div');
    scrollbarTrack.className = 'custom-scrollbar-track';

    const scrollbarThumb = document.createElement('div');
    scrollbarThumb.className = 'custom-scrollbar-thumb';

    scrollbarContainer.appendChild(scrollbarTrack);
    scrollbarContainer.appendChild(scrollbarThumb);

    // 初始显示账号设置内容
    settingsContent.innerHTML = settingsContentTemplates['账户信息'] || '';

    // 为初始加载的内容添加相同的事件处理和初始化
    // 处理头像上传功能
    const avatarUpload = settingsContent.querySelector('#avatarUpload');
    const avatarPreview = settingsContent.querySelector('#avatarPreview');
    const userNameInput = settingsContent.querySelector('#userNameInput');
    const userSignatureInput = settingsContent.querySelector('#userSignatureInput');
    const modifyUserNameBtn = settingsContent.querySelector('#modifyUserName');
    const modifySignatureBtn = settingsContent.querySelector('#modifySignature');

    if (avatarUpload && avatarPreview) {
        avatarUpload.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    avatarPreview.style.backgroundImage = `url('${event.target.result}')`;
                    // 自动保存头像到本地存储
                    const avatarUrl = event.target.result;
                    localStorage.setItem('userAvatar', avatarUrl);
                    // 更新左侧面板显示
                    updateProfileInfo();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 保存用户信息函数
    function saveUserInfo(field, value) {
        localStorage.setItem(field, value);
        updateProfileInfo();
        console.log(`${field} 已保存: ${value}`);
    }

    // 处理修改用户名
    if (modifyUserNameBtn && userNameInput) {
        modifyUserNameBtn.addEventListener('click', function () {
            saveUserInfo('userName', userNameInput.value);
        });
    }

    // 处理修改签名
    if (modifySignatureBtn && userSignatureInput) {
        modifySignatureBtn.addEventListener('click', function () {
            saveUserInfo('userSignature', userSignatureInput.value);
        });
    }

    // 处理Enter键保存
    if (userNameInput) {
        userNameInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                saveUserInfo('userName', userNameInput.value);
            }
        });
    }

    if (userSignatureInput) {
        userSignatureInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                saveUserInfo('userSignature', userSignatureInput.value);
            }
        });
    }

    // 初始化用户信息
    function initUserInfo() {
        const savedName = localStorage.getItem('userName');
        const savedSignature = localStorage.getItem('userSignature');
        const savedAvatar = localStorage.getItem('userAvatar');

        if (userNameInput && savedName) {
            userNameInput.value = savedName;
        }

        if (userSignatureInput && savedSignature) {
            userSignatureInput.value = savedSignature;
        }

        if (avatarPreview && savedAvatar) {
            avatarPreview.style.backgroundImage = `url('${savedAvatar}')`;
        }
    }

    // 初始化当前用户信息
    initUserInfo();

    rightContentPanel.appendChild(settingsContent);

    settingsPanel.appendChild(leftRoundedDiv);
    settingsPanel.appendChild(rightContentPanel);
    settingsPanel.appendChild(scrollbarContainer);

    document.body.appendChild(settingsPanel);

    // 创建设置面板后再次调用applyDockScale，确保CSS变量被正确设置
    applyDockScale();

    // 添加滚动事件监听，实现滚动边缘透明度过渡效果
    rightContentPanel.addEventListener('scroll', function () {
        const container = this;
        const options = container.querySelectorAll('.settings-content-option, .settings-content-section');
        const containerHeight = container.clientHeight;

        options.forEach(option => {
            const rect = option.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            // 计算元素相对于容器的位置
            const top = rect.top - containerRect.top;
            const bottom = containerRect.bottom - rect.bottom;

            // 定义过渡的区域高度
            const fadeArea = 100;

            let opacity = 1;
            let scale = 1;

            // 顶部边缘过渡
            if (top < fadeArea) {
                opacity = top / fadeArea;
                scale = 0.9 + (0.1 * opacity); // 0.9到1.0的缩放范围
            }
            // 底部边缘过渡
            else if (bottom < fadeArea) {
                opacity = bottom / fadeArea;
                scale = 0.9 + (0.1 * opacity); // 0.9到1.0的缩放范围
            }

            // 应用透明度和缩放
            option.style.opacity = opacity;
            option.style.transform = `scale(${scale})`;
        });
    });

    // 初始加载时触发一次滚动事件，确保透明度正确设置
    rightContentPanel.dispatchEvent(new Event('scroll'));

    // 自定义滚动条逻辑
    function updateCustomScrollbar() {
        const scrollHeight = rightContentPanel.scrollHeight;
        const clientHeight = rightContentPanel.clientHeight;
        const scrollTop = rightContentPanel.scrollTop;
        const containerHeight = scrollbarContainer.clientHeight;
        const trackHeight = scrollbarTrack.clientHeight;

        // 检查是否需要显示滚动条
        if (scrollHeight <= clientHeight) {
            // 内容不需要滚动，隐藏滚动条
            scrollbarContainer.style.display = 'none';
        } else {
            // 内容需要滚动，显示滚动条
            scrollbarContainer.style.display = 'flex';

            // 计算滑块高度
            const thumbHeight = Math.max(30, (clientHeight / scrollHeight) * trackHeight);
            scrollbarThumb.style.height = `${thumbHeight}px`;

            // 计算滑块位置
            const scrollRatio = scrollTop / (scrollHeight - clientHeight);
            const thumbTop = scrollRatio * (trackHeight - thumbHeight);
            scrollbarThumb.style.top = `${thumbTop}px`;
        }
    }

    // 滚动时更新自定义滚动条
    rightContentPanel.addEventListener('scroll', updateCustomScrollbar);

    // 拖动滚动条功能
    let isDragging = false;

    scrollbarThumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const trackRect = scrollbarTrack.getBoundingClientRect();
        const containerRect = rightContentPanel.getBoundingClientRect();
        const scrollHeight = rightContentPanel.scrollHeight;
        const clientHeight = rightContentPanel.clientHeight;
        const trackHeight = scrollbarTrack.clientHeight;

        // 计算鼠标在轨道上的位置
        const mouseY = e.clientY - trackRect.top;
        const thumbHeight = scrollbarThumb.clientHeight;
        const maxThumbTop = trackHeight - thumbHeight;
        const thumbTop = Math.max(0, Math.min(maxThumbTop, mouseY - thumbHeight / 2));

        // 更新滑块位置
        scrollbarThumb.style.top = `${thumbTop}px`;

        // 更新内容滚动位置
        const scrollRatio = thumbTop / maxThumbTop;
        const scrollTop = scrollRatio * (scrollHeight - clientHeight);
        rightContentPanel.scrollTop = scrollTop;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // 初始化自定义滚动条
    updateCustomScrollbar();

    // 获取设置按钮
    const settingsButton = document.querySelector('.sidebar-item[data-category="settings"]');

    // 为设置按钮添加点击事件监听器
    if (settingsButton) {
        settingsButton.addEventListener('click', function () {
            settingsPanel.classList.toggle('show');
            // 确保设置面板显示时，滚动条的位置和尺寸能被正确更新
            applyDockScale();
            updateCustomScrollbar();
        });
    }

    // 侧边栏分组点击事件 - 控制快捷方式过滤
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const searchContainer = document.querySelector('.search-container');
    const shortcutItems = document.querySelectorAll('.shortcut-item');

    // 动画控制变量
    let animationTimer = null;
    let currentAnimationDirection = null; // 跟踪当前动画方向: 'toTop' 或 'toCenter'

    // 为所有侧边栏分组添加点击事件
    sidebarItems.forEach((item, index) => {
        item.addEventListener('click', function () {
            // 切换分类时关闭设置面板（排除点击设置按钮本身的情况）
            if (settingsPanel && settingsPanel.classList.contains('show') && this.dataset.category !== 'settings') {
                settingsPanel.classList.remove('show');
            }

            // 清除之前可能存在的定时器
            if (animationTimer) {
                clearTimeout(animationTimer);

                // 中断动画时，立即清除当前动画并应用最终状态
                searchContainer.style.animation = '';

                // 根据当前动画方向设置正确的位置
                if (currentAnimationDirection === 'toTop') {
                    searchContainer.style.transform = 'translateX(-50%) translateY(0)';
                    searchContainer.classList.add('top');
                } else if (currentAnimationDirection === 'toCenter' && !this.classList.contains('active')) {
                    // 如果正在向下移动，但点击了其他分类按钮，保持在顶部
                    searchContainer.style.transform = 'translateX(-50%) translateY(0)';
                    searchContainer.classList.add('top');
                } else if (currentAnimationDirection === 'toCenter' && this.classList.contains('active')) {
                    // 如果正在向下移动且点击的是当前激活按钮，恢复到中心位置
                    searchContainer.style.transform = 'translate(-50%, -50%)';
                    searchContainer.classList.remove('top');
                }

                // 重置过渡效果
                searchContainer.style.transition = 'all 0.4s cubic-bezier(0.2, 0, 0.1, 1)';
                currentAnimationDirection = null;
            }

            // 如果搜索框已经在顶部，切换分类时不移动搜索框
            if (!searchContainer.classList.contains('top')) {
                // 使用requestAnimationFrame确保样式更新和动画应用在同一帧
                requestAnimationFrame(() => {
                    // 移除现有的过渡效果和动画
                    searchContainer.style.transition = 'none';
                    searchContainer.style.animation = '';

                    // 强制重排，确保transition: none生效
                    void searchContainer.offsetWidth;

                    // 从中心移动到顶部
                    currentAnimationDirection = 'toTop';
                    searchContainer.style.animation = 'moveToTop 0.4s cubic-bezier(0.2, 0, 0.1, 1) forwards';
                    animationTimer = setTimeout(() => {
                        searchContainer.classList.add('top');
                        searchContainer.style.animation = '';
                        searchContainer.style.transition = 'all 0.4s cubic-bezier(0.2, 0, 0.1, 1)';
                        currentAnimationDirection = null;

                        // 重新定位搜索建议框
                        if (suggestionsBox.classList.contains('show')) {
                            updateSuggestionsPosition();
                        }
                    }, 400);
                });
            } else if (this.classList.contains('active')) {
                // 使用requestAnimationFrame确保样式更新和动画应用在同一帧
                requestAnimationFrame(() => {
                    // 移除现有的过渡效果和动画
                    searchContainer.style.transition = 'none';
                    searchContainer.style.animation = '';

                    // 强制重排，确保transition: none生效
                    void searchContainer.offsetWidth;

                    // 从顶部移动回中心
                    currentAnimationDirection = 'toCenter';
                    searchContainer.style.animation = 'moveToCenter 0.4s cubic-bezier(0.2, 0, 0.1, 1) forwards';
                    animationTimer = setTimeout(() => {
                        searchContainer.classList.remove('top');
                        searchContainer.style.animation = '';
                        searchContainer.style.transition = 'all 0.4s cubic-bezier(0.2, 0, 0.1, 1)';
                        currentAnimationDirection = null;

                        // 重新定位搜索建议框
                        if (suggestionsBox.classList.contains('show')) {
                            updateSuggestionsPosition();
                        }
                    }, 400);
                });
            }
            // 如果搜索框已经在顶部且点击的是其他分类按钮，不移动搜索框

            // 切换按钮的active状态
            sidebarItems.forEach(sidebarItem => {
                sidebarItem.classList.remove('active');
            });
            this.classList.add('active');

            // 实现分组过滤功能
            const category = this.dataset.category;
            if (category === 'all') {
                // 常用按钮：隐藏所有快捷方式
                shortcutItems.forEach(shortcut => {
                    shortcut.style.opacity = '0';
                    shortcut.style.transform = 'scale(0.8)';
                    shortcut.style.pointerEvents = 'none';
                    // 使用setTimeout在过渡结束后设置display: none
                    setTimeout(() => {
                        shortcut.style.display = 'none';
                    }, 300);
                });
            } else {
                // 其他分类按钮：正常过滤显示/隐藏快捷方式
                shortcutItems.forEach(shortcut => {
                    if (shortcut.classList.contains(`shortcut-${category}`)) {
                        // 显示快捷方式，先设置display，然后触发过渡动画
                        shortcut.style.display = 'flex';
                        // 强制重排，确保过渡效果生效
                        void shortcut.offsetWidth;
                        shortcut.style.opacity = '1';
                        shortcut.style.transform = 'scale(1)';
                        shortcut.style.pointerEvents = 'auto';
                    } else {
                        // 隐藏快捷方式，先触发过渡动画，然后设置display
                        shortcut.style.opacity = '0';
                        shortcut.style.transform = 'scale(0.8)';
                        shortcut.style.pointerEvents = 'none';
                        // 使用setTimeout在过渡结束后设置display: none
                        setTimeout(() => {
                            if (!shortcut.classList.contains(`shortcut-${category}`)) {
                                shortcut.style.display = 'none';
                            }
                        }, 300);
                    }
                });
            }
        });
    });

    // 搜索框动态宽度调整功能
    const searchInput = document.querySelector('.search-input');
    const searchIconContainer = document.querySelector('.search-icon');
    if (searchContainer && searchInput && searchIconContainer) {
        // 获取搜索框的基础宽度和最大宽度
        const baseWidth = parseFloat(getComputedStyle(searchContainer).getPropertyValue('--search-width') || '288');
        const maxWidth = parseFloat(getComputedStyle(searchContainer).maxWidth);

        // 监听搜索框输入事件
        searchInput.addEventListener('input', function () {
            // 设置测量元素的文本内容为输入值
            textMeasurer.textContent = this.value || this.placeholder;

            // 获取测量的文本宽度
            const textWidth = textMeasurer.offsetWidth;

            // 计算新的搜索框宽度
            const newWidth = Math.max(baseWidth, textWidth);

            // 获取当前字体大小，计算15个中文的宽度阈值
            const computedStyle = window.getComputedStyle(searchInput);
            const fontSize = parseFloat(computedStyle.fontSize);
            // 中文字符宽度约等于字体大小，15个中文宽度 = 15 * 字体大小
            const chinese15Width = 15 * fontSize;

            // 检查是否达到15个中文宽度
            if (textWidth >= chinese15Width) {
                // 设置搜索框宽度为计算出的新宽度
                searchContainer.style.width = `${newWidth}px`;
                // 添加左侧边缘模糊效果
                searchInput.style.cssText = `
                            flex: 1;
                            background: transparent;
                            border: none;
                            outline: none;
                            color: white;
                            font-size: var(--search-text-size, 16px);
                            font-family: inherit;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            mask-image: linear-gradient(to right, transparent, white 10%);
                            -webkit-mask-image: linear-gradient(to right, transparent, white 10%);
                        `;
            } else {
                searchContainer.style.width = `${newWidth}px`;
                // 恢复正常样式
                searchInput.style.cssText = `
                            flex: 1;
                            background: transparent;
                            border: none;
                            outline: none;
                            color: white;
                            font-size: var(--search-text-size, 16px);
                            font-family: inherit;
                        `;
            }
        });

        // 获取搜索引擎URL的函数
        function getSearchEngineUrl(query, engine) {
            switch (engine) {
                case 'google':
                    return `https://www.google.com/search?q=${query}`;
                case 'baidu':
                    return `https://www.baidu.com/s?wd=${query}`;
                default: // bing
                    return `https://www.bing.com/search?q=${query}`;
            }
        }

        // 获取翻译引擎URL的函数
        function getTranslateEngineUrl(query, engine) {
            switch (engine) {
                case 'google':
                    return `https://translate.google.com/?sl=auto&tl=auto&text=${query}`;
                case 'baidu':
                    return `https://fanyi.baidu.com/mtpe-individual/transText?query=${query}`;
                default: // microsoft
                    return `https://www.bing.com/translator/?from=auto&to=auto&text=${query}`;
            }
        }

        // 添加回车搜索/翻译功能
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                const searchQuery = encodeURIComponent(this.value.trim());
                let targetUrl = '';

                // 获取用户选择的引擎
                const selectedSearchEngine = localStorage.getItem('searchEngine') || 'bing';
                const selectedTranslateEngine = localStorage.getItem('translateEngine') || 'microsoft';

                console.log('当前搜索引擎:', selectedSearchEngine);
                console.log('当前翻译引擎:', selectedTranslateEngine);

                // 根据当前图标状态执行不同操作
                switch (iconIndex) {
                    case 0: // 聚焦搜索 - 使用用户选择的搜索引擎
                        targetUrl = getSearchEngineUrl(searchQuery, selectedSearchEngine);
                        console.log('生成搜索URL:', targetUrl);
                        break;
                    case 1: // 聚焦翻译 - 使用用户选择的翻译引擎
                        targetUrl = getTranslateEngineUrl(searchQuery, selectedTranslateEngine);
                        console.log('生成翻译URL:', targetUrl);
                        break;
                    case 2: // 想知道什么都能问 - 使用Bing AI搜索
                        targetUrl = `https://www.bing.com/search?q=${searchQuery}&showconv=1`;
                        break;
                }

                window.open(targetUrl, '_blank');
            }
        });

        // 搜索图标切换功能
        const searchIcon1 = `
                    <svg t="1766450759918" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        p-id="8289" width="200" height="200">
                        <path
                            d="M741.4 704.7c49.7-58.2 77.8-132 77.8-209.8 0-178.8-145-323.8-323.8-323.8S171.7 316.1 171.7 495c0 178.8 145 323.8 323.8 323.8 32.4 0 64.2-4.8 94.6-14 13.5-4.1 21.1-18.4 17-32-4.1-13.5-18.4-21.1-32-17-25.6 7.8-52.3 11.8-79.6 11.8-150.6 0-272.6-122-272.6-272.6 0-150.6 122-272.6 272.6-272.6 150.5 0 272.6 122 272.6 272.6 0 71.4-28.3 138.9-77.7 189.9-11.3 11.6-11.1 30.1 0.3 41.5l120 120c10 10 26.2 10 36.2 0 10-10 10-26.2 0-36.2L741.4 704.7z m0 0"
                            p-id="8290" fill="#ffffff" stroke="#ffffff" stroke-width="var(--search-icon-stroke, 30)"></path>
                    </svg>
                `;
        const searchIcon2 = `
                    <?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M28.2857 37H39.7143M42 42L39.7143 37L42 42ZM26 42L28.2857 37L26 42ZM28.2857 37L34 24L39.7143 37H28.2857Z" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 6L17 9" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 11H28" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 16C10 16 11.7895 22.2609 16.2632 25.7391C20.7368 29.2174 28 32 28 32" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 11C24 11 22.2105 19.2174 17.7368 23.7826C13.2632 28.3478 6 32 6 32" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                `;
        const searchIcon3 = `
                    <svg t="1766702521048" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12719" width="200" height="200"><path d="M700.562286 387.657143q-47.469714-16.091429-63.780572-63.341714l-69.485714-201.728q-17.554286-51.273143-56.685714-51.2-39.058286 0.073143-56.466286 51.419428l-67.876571 200.045714q-16.091429 47.323429-63.488 63.414858L124.342857 453.778286q-51.2 17.481143-51.419428 56.539428-0.146286 39.131429 50.980571 56.905143l197.412571 68.754286q47.469714 16.530286 63.780572 64l68.900571 200.265143q17.627429 51.2 56.685715 51.2 39.058286-0.146286 56.393142-51.565715l67.291429-199.314285q15.945143-47.396571 63.268571-63.634286l201.654858-69.046857q51.346286-17.554286 51.2-56.612572 0-39.058286-51.419429-56.466285L700.562286 387.657143zM567.588571 348.16q27.940571 81.188571 109.421715 108.836571l161.133714 54.491429-164.352 56.32q-81.408 27.794286-108.909714 109.348571l-54.637715 162.084572-56.100571-163.035429Q426.276571 595.090286 345.234286 566.857143l-161.206857-56.100572 162.377142-55.222857q81.408-27.721143 109.129143-109.202285l55.369143-163.108572 56.758857 164.864z" p-id="12720" fill="#ffffff"></path><path d="M883.638857 111.542857c-3.510857-10.093714-9.142857-10.093714-12.580571 0l-19.382857 57.197714a44.617143 44.617143 0 0 1-24.649143 24.649143l-56.758857 19.309715c-10.093714 3.437714-10.093714 9.142857 0 12.653714l56.32 19.602286c10.166857 3.510857 21.211429 14.628571 24.722285 24.868571l19.675429 57.124571c3.510857 10.093714 9.142857 10.093714 12.507428 0l19.236572-57.051428a44.617143 44.617143 0 0 1 24.576-24.649143l57.636571-19.748571c10.093714-3.437714 10.093714-9.069714 0-12.507429l-56.685714-19.163429a44.836571 44.836571 0 0 1-24.795429-24.649142l-19.821714-57.636572z" p-id="12721" fill="#ffffff"></path></svg>
                `;
        let iconIndex = 0; // 0: searchIcon1, 1: searchIcon2, 2: searchIcon3

        // 添加点击切换图标事件
        searchIconContainer.addEventListener('click', function () {
            // 循环切换图标索引
            iconIndex = (iconIndex + 1) % 3;

            // 根据当前图标索引设置对应图标和占位文本
            switch (iconIndex) {
                case 0:
                    searchIconContainer.innerHTML = searchIcon1;
                    searchInput.placeholder = '聚焦搜索';
                    break;
                case 1:
                    searchIconContainer.innerHTML = searchIcon2;
                    searchInput.placeholder = '聚焦翻译';
                    break;
                case 2:
                    searchIconContainer.innerHTML = searchIcon3;
                    searchInput.placeholder = '想知道什么都能问';
                    break;
            }
        });

        // 初始触发一次，确保宽度正确
        searchInput.dispatchEvent(new Event('input'));
    }








    // 拖放事件
    dockItems.forEach(item => {
        if (item.draggable) {
            item.addEventListener('dragstart', function (e) {
                draggedItem = this;
                this.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', function () {
                this.classList.remove('dragging');
                this.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 300);
                draggedItem = null;
                dockItems.forEach(i => i.classList.remove('drag-over'));
            });

            item.addEventListener('dragover', function (e) {
                e.preventDefault();
                if (this !== draggedItem) {
                    // 计算距离
                    const draggedRect = draggedItem.getBoundingClientRect();
                    const targetRect = this.getBoundingClientRect();
                    const distance = Math.sqrt(
                        Math.pow((draggedRect.left + draggedRect.width / 2) - (targetRect.left + targetRect.width / 2), 2) +
                        Math.pow((draggedRect.top + draggedRect.height / 2) - (targetRect.top + targetRect.height / 2), 2)
                    );

                    // 执行避让逻辑
                    this.classList.add('drag-over');

                    const draggedIndex = Array.from(dock.children).indexOf(draggedItem);
                    const targetIndex = Array.from(dock.children).indexOf(this);
                    const draggedSide = draggedIndex < separatorIndex ? 'left' : 'right';
                    const targetSide = targetIndex < separatorIndex ? 'left' : 'right';

                    if (draggedSide === targetSide && draggedIndex !== targetIndex && isLongPress) {
                        const parent = dock;
                        const children = Array.from(parent.children);

                        // 计算移动方向
                        const direction = draggedIndex < targetIndex ? 1 : -1;

                        // 移动所有中间的item
                        if (direction === 1) {
                            // 向右移动
                            parent.insertBefore(draggedItem, this.nextSibling);
                        } else {
                            // 向左移动
                            parent.insertBefore(draggedItem, this);
                        }
                    }
                }
            });

            item.addEventListener('dragleave', function () {
                this.classList.remove('drag-over');
            });

            item.addEventListener('drop', function (e) {
                e.preventDefault();
                this.classList.remove('drag-over');

                // 更新分隔符索引
                separatorIndex = Array.from(dock.children).indexOf(separator);
            });
        }
    });


});