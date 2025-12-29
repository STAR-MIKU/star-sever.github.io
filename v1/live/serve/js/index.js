// 按钮点击功能
 document.addEventListener('DOMContentLoaded', function() {
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