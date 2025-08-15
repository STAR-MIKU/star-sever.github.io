// 窗口管理器
class WindowManager {
    constructor() {
        this.windows = [];
        this.activeWindowId = null;
        this.taskbarAppContainer = document.getElementById('apps');
    }



    addWindow(window) {
        this.windows.push(window);
        this.createTaskbarIcon(window);
        this.setActiveWindow(window.id);
    }

    removeWindow(windowId) {
        this.windows = this.windows.filter(w => w.id !== windowId);
        const icon = document.querySelector(`.taskbar-icon[data-window-id="${windowId}"]`);
        if (icon) {
            icon.remove();
        }
        // 如果关闭的是活动窗口，则激活最后一个打开的窗口
        if (this.activeWindowId === windowId && this.windows.length > 0) {
            this.setActiveWindow(this.windows[this.windows.length - 1].id);
        } else if (this.windows.length === 0) {
            this.activeWindowId = null;
        }
    }

    setActiveWindow(windowId) {
        // 取消当前活动窗口的激活状态
        if (this.activeWindowId) {
            const currentActiveWindow = this.windows.find(w => w.id === this.activeWindowId);
            if (currentActiveWindow) {
                currentActiveWindow.windowElement.classList.remove('active');
                currentActiveWindow.windowElement.style.zIndex = '100';
            }
            const currentActiveIcon = document.querySelector(`.taskbar-icon[data-window-id="${this.activeWindowId}"]`);
            if (currentActiveIcon) {
                currentActiveIcon.classList.remove('active');
            }
        }

        // 设置新的活动窗口
        this.activeWindowId = windowId;
        const newActiveWindow = this.windows.find(w => w.id === windowId);
        if (newActiveWindow) {
            newActiveWindow.windowElement.classList.add('active');
            newActiveWindow.windowElement.style.zIndex = '1000';
            // 如果窗口被最小化，则恢复它
            if (newActiveWindow.isMinimized) {
                newActiveWindow.restore();
            }
        }
        const newActiveIcon = document.querySelector(`.taskbar-icon[data-window-id="${windowId}"]`);
        if (newActiveIcon) {
            newActiveIcon.classList.add('active');
        }
    }

    createTaskbarIcon(window) {
        const icon = document.createElement('div');
        icon.className = 'taskbar-icon';
        icon.dataset.windowId = window.id;
        
        // 添加标题
        const titleSpan = document.createElement('span');
        titleSpan.textContent = window.title;
        icon.appendChild(titleSpan);
        
        icon.style.padding = '5px 10px';
        icon.style.margin = '0 5px';
        icon.style.borderRadius = '4px';
        icon.style.cursor = 'pointer';
        icon.style.whiteSpace = 'nowrap';
        icon.style.overflow = 'hidden';
        icon.style.textOverflow = 'ellipsis';
        icon.style.maxWidth = '120px';
        icon.style.color = 'white';
        icon.style.fontSize = '14px';
        icon.style.transition = 'all 0.2s';

        icon.addEventListener('click', () => {
            if (window.isMinimized) {
                // 如果窗口被最小化，则恢复它
                this.setActiveWindow(window.id);
            } else if (this.activeWindowId === window.id) {
                // 如果点击的是当前活动窗口，则最小化
                window.minimize();
            } else {
                // 否则激活该窗口
                this.setActiveWindow(window.id);
            }
        });

        this.taskbarAppContainer.appendChild(icon);
    }
}

// 定义RoundedWindow类
class RoundedWindow {
    constructor(options) {
        console.log('开始创建窗口:', options);
        this.options = options || {};
        this.title = this.options.title || '窗口';
        this.url = this.options.url || 'about:blank';
        this.content = this.options.content || null;
        this.width = this.options.width || 350;
        this.height = this.options.height || 570;
        this.x = this.options.x || 100;
        this.y = this.options.y || 100;
        this.id = 'window-' + Date.now();
        this.isCustom = this.options.isCustom || false; // 是否为用户自定义窗口
        // 拖动相关属性
        this.isDragging = false;
        this.isAnimating = false; // 标记窗口是否正在动画中
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.touchStartX = 0;
        this.touchStartY = 0;

        this.windowElement = null;
        this.headerElement = null;
        this.resizeHandle = null;
        this.isResizing = false;
        this.resizeStartX = 0;
        this.resizeStartY = 0;
        this.startWidth = 0;
        this.startHeight = 0;
        this.screenWidth = window.innerWidth;
        // 获取任务栏高度
        this.dockHeight = document.getElementById('dock')?.offsetHeight || 0;
        console.log('任务栏高度:', this.dockHeight);
        // 屏幕高度减去任务栏高度
        this.screenHeight = window.innerHeight - this.dockHeight;
        this.isMinimized = false; // 窗口是否被最小化
        this.normalState = { width: this.width, height: this.height, x: this.x, y: this.y }; // 保存正常状态
        this.hasUploaded = false; // 标记窗口是否已上传过文件

        try {
            this.init();

            // 将窗口添加到管理器
            if (window.windowManager) {
                window.windowManager.addWindow(this);
                console.log('窗口创建成功，ID:', this.id);
            } else {
                console.error('windowManager 不存在');
            }
        } catch (e) {
            console.error('窗口初始化失败:', e);
        }
    }

    init() {
        console.log('初始化窗口:', this.id);
        // 创建窗口元素
        this.windowElement = document.createElement('div');
        this.windowElement.className = 'rounded-window';
        this.windowElement.id = this.id;
        this.windowElement.style.width = this.width + 'px';
        this.windowElement.style.height = this.height + 'px';
        this.windowElement.style.left = this.x + 'px';
        // 初始位置在屏幕底部
        this.windowElement.style.top = this.screenHeight + 'px';
        this.windowElement.style.transition = 'top 0.5s ease-out, opacity 0.5s ease-out';
        this.windowElement.style.opacity = '0';
        console.log('窗口样式:', this.windowElement.style);

        // 创建窗口头部
        this.headerElement = document.createElement('div');
        this.headerElement.className = 'window-header';

        // 创建窗口标题
        const titleElement = document.createElement('div');
        titleElement.className = 'window-title';
        titleElement.textContent = this.title;
        this.titleElement = titleElement; // 保存标题元素引用

        // 创建窗口控制按钮
        const controlsElement = document.createElement('div');
        controlsElement.className = 'window-controls';

        const minimizeBtn = document.createElement('div');
        minimizeBtn.className = 'window-control';
        minimizeBtn.style.background = 'rgba(255, 208, 0, 0.7)';
        minimizeBtn.addEventListener('click', () => this.minimize());

        const maximizeBtn = document.createElement('div');
        maximizeBtn.className = 'window-control';
        maximizeBtn.style.background = 'rgba(0, 198, 6, 0.7)';
        maximizeBtn.addEventListener('click', () => this.toggleMaximize());

        const closeBtn = document.createElement('div');
        closeBtn.className = 'window-control';
        closeBtn.style.background = 'rgba(255, 59, 48, 0.7)';
        closeBtn.addEventListener('click', () => this.close());

        controlsElement.appendChild(minimizeBtn);
        controlsElement.appendChild(maximizeBtn);
        controlsElement.appendChild(closeBtn);

        this.headerElement.appendChild(titleElement);
        this.headerElement.appendChild(controlsElement);

        // 创建窗口内容
        const contentElement = document.createElement('div');
        contentElement.className = 'window-content';

        // 创建iframe
        const iframeElement = document.createElement('iframe');
        this.iframeElement = iframeElement; // 保存iframe引用
        if (this.content) {
            console.log('使用srcdoc加载内容');
            iframeElement.srcdoc = this.content;
        } else {
            console.log('使用src加载URL:', this.url);
            iframeElement.src = this.url;
        }
        iframeElement.allowFullscreen = true;

        // 添加iframe加载完成事件监听，以获取网页标题
        iframeElement.addEventListener('load', () => {
            try {
                // 获取iframe中的文档标题
                const iframeTitle = iframeElement.contentDocument.title;
                if (iframeTitle) {
                    this.updateWindowTitle(iframeTitle);
                }
            } catch (e) {
                console.error('获取iframe标题失败:', e);
            }
        });

        contentElement.appendChild(iframeElement);

        // 如果是空白窗口(about:blank)，添加上传功能
        if (this.url === 'about:blank' && !this.content) {
            this.addUploadFunctionality(contentElement);
        }

        // 创建调整大小手柄
        this.resizeHandle = document.createElement('div');
        this.resizeHandle.className = 'resize-handle';

        // 组装窗口
        this.windowElement.appendChild(this.headerElement);
        this.windowElement.appendChild(contentElement);
        this.windowElement.appendChild(this.resizeHandle);

        // 添加到文档
        try {
            document.body.appendChild(this.windowElement);
            console.log('窗口已添加到文档');
            // 触发底部飞入动画
            setTimeout(() => {
                this.windowElement.style.top = this.y + 'px';
                this.windowElement.style.opacity = '1';
            }, 10);
        } catch (e) {
            console.error('添加窗口到文档失败:', e);
        }

        // 绑定事件
        this.bindEvents();

        // 点击窗口时激活它
        this.windowElement.addEventListener('mousedown', () => {
            if (window.windowManager) {
                window.windowManager.setActiveWindow(this.id);
            } else {
                console.error('windowManager 不存在');
            }
        });
    }

    bindEvents() {
        // 调整大小事件
        this.resizeHandle.addEventListener('mousedown', (e) => this.startResize(e));
        document.addEventListener('mousemove', (e) => this.resize(e));
        document.addEventListener('mouseup', () => this.stopResize());

        // 拖动事件 - 鼠标
        this.headerElement.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());

        // 拖动事件 - 触摸
        this.headerElement.addEventListener('touchstart', (e) => this.startTouchDrag(e));
        document.addEventListener('touchmove', (e) => this.touchDrag(e));
        document.addEventListener('touchend', () => this.stopDrag());
    }

    // 鼠标拖动开始
    startDrag(e) {
        // 检查是否在窗口管理器区域10px范围内
        const headerRect = this.headerElement.getBoundingClientRect();
        // 假设窗口管理器按钮在右上角，宽度约为100px
        const managerAreaWidth = 100;
        // 计算点击位置相对于窗口头部的X坐标
        const clickX = e.clientX - headerRect.left;
        // 如果点击位置在窗口管理器区域10px范围内，不启动拖动
        if (clickX > headerRect.width - managerAreaWidth - 10) {
            return;
        }

        this.isDragging = true;
        // 记录鼠标在窗口头部的相对位置
        const rect = this.windowElement.getBoundingClientRect();
        this.dragStartX = e.clientX - rect.left;
        this.dragStartY = e.clientY - rect.top;
        // 添加过渡效果使移动更平滑
        this.windowElement.style.transition = 'transform 0.05s ease-out';
        this.windowElement.style.zIndex = '1000'; // 拖动时提升层级
        e.preventDefault(); // 防止选中文本
    }

    // 鼠标拖动
    drag(e) {
        if (!this.isDragging) return;

        let newX = e.clientX - this.dragStartX;
        let newY = e.clientY - this.dragStartY;

        // 限制窗口不超出屏幕边界
        newX = Math.max(0, Math.min(newX, this.screenWidth - this.windowElement.offsetWidth));
        newY = Math.max(0, Math.min(newY, this.screenHeight - this.windowElement.offsetHeight));

        // 应用新位置（使用transform提高性能）
        this.windowElement.style.transform = `translate(${newX}px, ${newY}px)`;
    }

    // 触摸拖动开始
    startTouchDrag(e) {
        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        // 检查是否在窗口管理器区域10px范围内
        const headerRect = this.headerElement.getBoundingClientRect();
        // 假设窗口管理器按钮在右上角，宽度约为100px
        const managerAreaWidth = 100;
        const touchX = touch.clientX - headerRect.left;
        
        // 如果触摸位置在窗口管理器区域10px范围内，不启动拖动
        if (touchX > headerRect.width - managerAreaWidth - 10) {
            return;
        }

        this.isDragging = true;
        const rect = this.windowElement.getBoundingClientRect();
        // 记录触摸点在窗口头部的相对位置
        this.touchStartX = touch.clientX - rect.left;
        this.touchStartY = touch.clientY - rect.top;
        // 添加过渡效果使移动更平滑
        this.windowElement.style.transition = 'transform 0.05s ease-out';
        this.windowElement.style.zIndex = '1000'; // 拖动时提升层级
        e.preventDefault(); // 防止页面滚动
    }

    // 触摸拖动
    touchDrag(e) {
        if (!this.isDragging || e.touches.length !== 1) return;

        const touch = e.touches[0];
        let newX = touch.clientX - this.touchStartX;
        let newY = touch.clientY - this.touchStartY;

        // 限制窗口不超出屏幕边界
        newX = Math.max(0, Math.min(newX, this.screenWidth - this.windowElement.offsetWidth));
        newY = Math.max(0, Math.min(newY, this.screenHeight - this.windowElement.offsetHeight));

        // 应用新位置（使用transform提高性能）
        this.windowElement.style.transform = `translate(${newX}px, ${newY}px)`;
        e.preventDefault(); // 防止页面滚动
    }

    // 停止拖动
    stopDrag() {
        if (!this.isDragging) return;

        this.isDragging = false;
        // 移除过渡效果
        this.windowElement.style.transition = '';
        // 获取当前transform值并应用到left和top
        const transform = this.windowElement.style.transform;
        if (transform) {
            const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
            if (match) {
                this.windowElement.style.left = match[1] + 'px';
                this.windowElement.style.top = match[2] + 'px';
                this.windowElement.style.transform = '';
            }
        }
        this.windowElement.style.zIndex = '100'; // 拖动结束后恢复层级
    }

    startResize(e) {
        this.isResizing = true;
        this.resizeStartX = e.clientX;
        this.resizeStartY = e.clientY;
        this.startWidth = this.windowElement.offsetWidth;
        this.startHeight = this.windowElement.offsetHeight;
        this.windowElement.style.zIndex = '1000'; // 调整大小时提升层级
        e.preventDefault(); // 防止选中文本
    }

    resize(e) {
        if (!this.isResizing) return;

        const deltaX = e.clientX - this.resizeStartX;
        const deltaY = e.clientY - this.resizeStartY;

        let newWidth = this.startWidth + deltaX;
        let newHeight = this.startHeight + deltaY;

        // 限制最小尺寸
        newWidth = Math.max(newWidth, 300);
        newHeight = Math.max(newHeight, 200);

        // 限制最大尺寸不超过屏幕大小
        newWidth = Math.min(newWidth, this.screenWidth);
        newHeight = Math.min(newHeight, this.screenHeight);

        this.windowElement.style.width = newWidth + 'px';
        this.windowElement.style.height = newHeight + 'px';
    }

    stopResize() {
        this.isResizing = false;
        this.windowElement.style.zIndex = '100'; // 调整大小结束后恢复层级
    }

    toggleMaximize() {
        const dock = document.getElementById('dock');
        if (this.windowElement.classList.contains('maximized')) {
            this.windowElement.classList.remove('maximized');
            this.windowElement.style.width = this.width + 'px';
            this.windowElement.style.height = this.height + 'px';
            this.windowElement.style.left = this.x + 'px';
            this.windowElement.style.top = this.y + 'px';
            // 恢复任务栏显示
            if (dock) {
                dock.classList.remove('hidden');
            }
        } else {
            // 保存当前状态以便恢复
            this.width = this.windowElement.offsetWidth;
            this.height = this.windowElement.offsetHeight;
            this.x = this.windowElement.getBoundingClientRect().left;
            this.y = this.windowElement.getBoundingClientRect().top;

            this.windowElement.classList.add('maximized');
            this.windowElement.style.left = '0';
            this.windowElement.style.top = '0';
            this.windowElement.style.width = '100%';
            this.windowElement.style.height = '100%';
            // 隐藏任务栏
            if (dock) {
                dock.classList.add('hidden');
            }
        }
    }

    minimize() {
        // 如果正在动画中，不执行新的操作
        if (this.isAnimating) return;

        // 检查是否是最大化状态，如果是，则恢复任务栏显示
        const dock = document.getElementById('dock');
        if (this.windowElement.classList.contains('maximized')) {
            if (dock) {
                dock.classList.remove('hidden');
            }
            // 移除最大化类
            this.windowElement.classList.remove('maximized');
        }

        // 重置窗口大小为初始大小
        this.windowElement.style.width = this.normalState.width + 'px';
        this.windowElement.style.height = this.normalState.height + 'px';

        // 最小化窗口（优化的回收动画）
        this.isMinimized = true;
        this.isAnimating = true;
        // 设置更全面的过渡效果
        this.windowElement.style.transition = 'top 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, height 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.1s';
        // 先设置宽度和高度为0
        this.windowElement.style.width = '0';
        this.windowElement.style.height = '0';
        this.windowElement.style.left = this.normalState.x + 'px';
        this.windowElement.style.opacity = '0';
        // 稍延迟后移动到底部，形成收缩后下落的效果
        setTimeout(() => {
            this.windowElement.style.top = this.screenHeight + 'px';
            // 动画结束后重置标志
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        }, 100);
    }

    restore() {
        // 如果正在动画中，不执行新的操作
        if (this.isAnimating) return;

        // 恢复窗口（从底部飞入的动画）
        this.isMinimized = false;
        this.isAnimating = true;
        this.windowElement.style.width = this.normalState.width + 'px';
        this.windowElement.style.height = this.normalState.height + 'px';
        this.windowElement.style.left = this.normalState.x + 'px';
        this.windowElement.style.top = this.screenHeight + 'px';
        this.windowElement.style.opacity = '0';
        // 触发动画
        setTimeout(() => {
            this.windowElement.style.top = this.normalState.y + 'px';
            this.windowElement.style.opacity = '1';
            
            // 检查是否需要隐藏任务栏
            const dock = document.getElementById('dock');
            if (this.windowElement.classList.contains('maximized')) {
                if (dock) {
                    dock.classList.add('hidden');
                }
            } else {
                if (dock) {
                    dock.classList.remove('hidden');
                }
            }
            
            // 动画结束后重置标志
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        }, 10);
    }

    // 添加上传HTML文件功能
    addUploadFunctionality(contentElement) {
        // 创建上传容器
        const uploadContainer = document.createElement('div');
        uploadContainer.className = 'upload-container';
        uploadContainer.style.position = 'absolute';
        uploadContainer.style.top = '0';
        uploadContainer.style.left = '0';
        uploadContainer.style.width = '100%';
        uploadContainer.style.height = '100%';
        uploadContainer.style.display = 'flex';
        uploadContainer.style.flexDirection = 'column';
        uploadContainer.style.alignItems = 'center';
        uploadContainer.style.justifyContent = 'center';
        uploadContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        uploadContainer.style.color = 'white';
        uploadContainer.style.zIndex = '10';

        // 创建上传提示
        const uploadPrompt = document.createElement('div');
        uploadPrompt.textContent = '上传HTML文件或粘贴HTML代码';
        uploadPrompt.style.fontSize = '18px';
        uploadPrompt.style.marginBottom = '20px';

        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.marginBottom = '20px';

        // 创建上传按钮
        const uploadButton = document.createElement('button');
        uploadButton.textContent = '选择文件';
        uploadButton.style.padding = '10px 20px';
        uploadButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        uploadButton.style.color = 'white';
        uploadButton.style.border = '1px solid white';
        uploadButton.style.borderRadius = '4px';
        uploadButton.style.cursor = 'pointer';
        uploadButton.style.transition = 'all 0.2s';

        // 创建粘贴按钮
        const pasteButton = document.createElement('button');
        pasteButton.textContent = '粘贴HTML代码';
        pasteButton.style.padding = '10px 20px';
        pasteButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        pasteButton.style.color = 'white';
        pasteButton.style.border = '1px solid white';
        pasteButton.style.borderRadius = '4px';
        pasteButton.style.cursor = 'pointer';
        pasteButton.style.transition = 'all 0.2s';

        // 创建隐藏的文件输入
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.html';
        fileInput.style.display = 'none';

        // 点击按钮触发文件选择
        uploadButton.addEventListener('click', () => {
            if (!this.hasUploaded) {
                fileInput.click();
            } else {
                alert('每个窗口只能上传一次HTML文件');
            }
        });

        // 处理文件选择
        fileInput.addEventListener('change', (e) => {
            if (this.hasUploaded) return;

            const file = e.target.files[0];
            if (file && file.type === 'text/html') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        // 在iframe中加载HTML内容
                        this.iframeElement.srcdoc = event.target.result;
                        this.hasUploaded = true;
                        uploadContainer.style.display = 'none';
                        console.log('HTML文件上传成功');
                    } catch (error) {
                        console.error('加载HTML文件失败:', error);
                        alert('加载HTML文件失败，请重试');
                    }
                };
                reader.readAsText(file);
            } else {
                alert('请选择有效的HTML文件');
            }
        });

        // 处理粘贴HTML代码
        pasteButton.addEventListener('click', async () => {
            if (this.hasUploaded) {
                alert('每个窗口只能上传/粘贴一次HTML内容');
                return;
            }

            try {
                // 请求剪贴板权限并获取内容
                const text = await navigator.clipboard.readText();
                if (text) {
                    // 在iframe中加载HTML内容
                    this.iframeElement.srcdoc = text;
                    this.hasUploaded = true;
                    uploadContainer.style.display = 'none';
                    console.log('HTML代码粘贴成功');
                } else {
                    alert('剪贴板为空');
                }
            } catch (error) {
                console.error('读取剪贴板失败:', error);
                alert('读取剪贴板失败，请手动粘贴');
            }
        });

        uploadContainer.appendChild(uploadPrompt);
        buttonContainer.appendChild(uploadButton);
        buttonContainer.appendChild(pasteButton);
        uploadContainer.appendChild(buttonContainer);
        uploadContainer.appendChild(fileInput);

        contentElement.appendChild(uploadContainer);
    }

    // 更新窗口标题
    updateWindowTitle(newTitle) {
        this.title = newTitle;
        // 更新窗口头部标题
        if (this.titleElement) {
            this.titleElement.textContent = newTitle;
        }
        // 更新任务栏图标标题
        const taskbarIcon = document.querySelector(`.taskbar-icon[data-window-id="${this.id}"]`);
        if (taskbarIcon) {
            const titleSpan = taskbarIcon.querySelector('span');
            if (titleSpan) {
                titleSpan.textContent = newTitle;
            }
        }
    }

    close() {
        // 检查是否是最大化状态，如果是，则恢复任务栏显示
        const dock = document.getElementById('dock');
        if (this.windowElement.classList.contains('maximized')) {
            if (dock) {
                dock.classList.remove('hidden');
            }
        }

        // 添加回收到底部的动画
        this.windowElement.style.top = this.screenHeight + 'px';
        this.windowElement.style.opacity = '0';
        // 动画完成后移除窗口
        setTimeout(() => {
            this.windowElement.remove();
            window.windowManager.removeWindow(this.id);
        }, 500);
    }
}

// 导出类
window.RoundedWindow = RoundedWindow;
window.WindowManager = WindowManager;

// 创建窗口管理器实例
window.windowManager = new WindowManager();