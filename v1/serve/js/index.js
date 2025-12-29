// 按钮点击功能
 document.addEventListener('DOMContentLoaded', function() {
    // 启动壁纸动画和聚光灯效果
    const wallpaperVideo = document.getElementById('wallpaper-video');
    const spotlightOverlay = document.querySelector('.spotlight-overlay');
    
    // 延迟一小段时间后启动动画，确保页面元素已完全加载
    setTimeout(() => {
        // 启动壁纸缩小动画
        if (wallpaperVideo) {
            wallpaperVideo.classList.add('animate-in');
        }
        
        // 启动聚光灯扩散效果（淡出）
        if (spotlightOverlay) {
            // 先显示聚光灯效果，然后在短暂延迟后淡出
            setTimeout(() => {
                spotlightOverlay.classList.add('fade-out');
            }, 200);
        }
    }, 100);
    // 获取任务栏DOM元素
    const dock = document.getElementById('dock');

    // 初始化任务栏 - 保持可见
    if (dock) {
        // 移除可能的hidden类，确保任务栏始终可见
        dock.classList.remove('hidden');
    }
    // 翻转容器点击功能
    const flipContainers = document.querySelectorAll('.flip-container');
    flipContainers.forEach(container => {
        container.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
        // 添加鼠标悬停效果提示可点击
        container.style.cursor = 'pointer';
      });
      // 页面加载完成后自动聚焦到搜索框
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
          searchInput.focus();
          // 移动端自动弹出键盘
          if (/Mobi|Android|iOS/.test(navigator.userAgent)) {
              // 延迟一下确保元素已完全加载
              setTimeout(() => {
                  searchInput.focus();
                  // 对于iOS设备，可能需要额外的触发
                  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                      const event = new Event('touchstart', { bubbles: true });
                      searchInput.dispatchEvent(event);
                  }
              }, 300);
          }
      }
    // 获取按钮元素
    const wavyGlass = document.querySelector('.wavy-glass');
    const h1 = document.querySelector('h1');

    // 添加点击事件
    if (wavyGlass && h1) {
        wavyGlass.addEventListener('click', function() {
            showNotification('按钮已点击');
            // 可以在这里添加按钮点击后的逻辑
        });
    }

    // 显示通知
    function showNotification(message) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '70px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.background = 'rgba(0,0,0,0.7)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '6px';
        notification.style.zIndex = '999999999999999';
        notification.textContent = message;

        // 添加到页面
        document.body.appendChild(notification);

        // 3秒后移除
        setTimeout(function() {
            notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        setTimeout(function() {
            document.body.removeChild(notification);
        }, 500);
    }, 2000);
}
});