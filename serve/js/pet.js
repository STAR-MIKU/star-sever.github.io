// 桌宠系统实现
class DesktopPet {
    constructor(options = {}) {
        // 默认配置
        this.config = {
            width: 60,
            height: 60,
            speed: 2,
            // 使用简单的SVG作为桌宠图形
            svgContent: `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="#FF6B6B" />
                    <circle cx="35" cy="35" r="10" fill="white" />
                    <circle cx="65" cy="35" r="10" fill="white" />
                    <circle cx="35" cy="35" r="5" fill="black" />
                    <circle cx="65" cy="35" r="5" fill="black" />
                    <path d="M30 65 Q50 85 70 65" stroke="black" stroke-width="3" fill="none" />
                </svg>
            `,
            ...options
        };
        
        this.element = null;
        this.targetX = 0;
        this.targetY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isMoving = false;
        this.isFollowing = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastInteractionTime = 0;
        this.mood = 'happy'; // 心情状态：happy, bored, excited
        
        this.init();
    }
    
    init() {
        // 创建桌宠元素
        this.element = document.createElement('div');
        this.element.className = 'desktop-pet';
        this.element.style.position = 'fixed';
        this.element.style.width = `${this.config.width}px`;
        this.element.style.height = `${this.config.height}px`;
        this.element.style.zIndex = '50'; // 确保在窗口下方但在背景上方
        this.element.style.pointerEvents = 'auto';
        this.element.style.cursor = 'grab';
        this.element.style.transition = 'transform 0.2s ease';
        this.element.innerHTML = this.config.svgContent;
        
        // 添加到文档中
        document.body.appendChild(this.element);
        
        // 初始位置随机
        this.setRandomPosition();
        
        // 初始化事件监听
        this.initEvents();
        
        // 启动动画循环
        this.animate();
        
        // 定期改变目标位置
        this.startRandomMovement();
    }
    
    initEvents() {
        // 鼠标点击事件
        this.element.addEventListener('click', (e) => {
            e.preventDefault();
            this.interact();
        });
        
        // 鼠标跟随事件
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // 拖动功能
        let isDragging = false;
        let dragStartX, dragStartY;
        
        this.element.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            dragStartX = e.clientX - this.currentX;
            dragStartY = e.clientY - this.currentY;
            this.element.style.cursor = 'grabbing';
            this.isFollowing = false;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                this.currentX = e.clientX - dragStartX;
                this.currentY = e.clientY - dragStartY;
                this.updatePosition();
                this.isMoving = false;
                this.lastInteractionTime = Date.now();
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.element.style.cursor = 'grab';
                // 拖动结束后，设置新的随机目标
                setTimeout(() => {
                    this.setRandomTarget();
                }, 2000);
            }
        });
        
        // 双击进入跟随模式
        this.element.addEventListener('dblclick', () => {
            this.toggleFollowMode();
        });
    }
    
    setRandomPosition() {
        const screenWidth = window.innerWidth - this.config.width;
        const screenHeight = window.innerHeight - this.config.height;
        
        this.currentX = Math.random() * screenWidth;
        this.currentY = Math.random() * screenHeight;
        
        this.updatePosition();
        this.setRandomTarget();
    }
    
    setRandomTarget() {
        if (this.isFollowing) return;
        
        const screenWidth = window.innerWidth - this.config.width;
        const screenHeight = window.innerHeight - this.config.height;
        
        this.targetX = Math.random() * screenWidth;
        this.targetY = Math.random() * screenHeight;
        this.isMoving = true;
    }
    
    updatePosition() {
        this.element.style.left = `${this.currentX}px`;
        this.element.style.top = `${this.currentY}px`;
        
        // 根据移动方向旋转桌宠
        if (this.isMoving) {
            const dx = this.targetX - this.currentX;
            const angle = Math.atan2(0, dx) * (180 / Math.PI);
            this.element.style.transform = `rotate(${angle}deg)`;
        } else {
            this.element.style.transform = 'rotate(0deg)';
        }
    }
    
    animate() {
        requestAnimationFrame(() => {
            this.animate();
        });
        
        // 更新心情状态
        this.updateMood();
        
        // 移动到目标位置
        if (this.isMoving && !this.isFollowing) {
            const dx = this.targetX - this.currentX;
            const dy = this.targetY - this.currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > this.config.speed) {
                this.currentX += (dx / distance) * this.config.speed;
                this.currentY += (dy / distance) * this.config.speed;
                this.updatePosition();
            } else {
                this.currentX = this.targetX;
                this.currentY = this.targetY;
                this.updatePosition();
                this.isMoving = false;
                
                // 到达目标后，等待一段时间再设置新目标
                setTimeout(() => {
                    if (!this.isFollowing) {
                        this.setRandomTarget();
                    }
                }, 3000 + Math.random() * 5000);
            }
        }
        
        // 跟随鼠标模式
        if (this.isFollowing) {
            const dx = this.mouseX - this.currentX - this.config.width / 2;
            const dy = this.mouseY - this.currentY - this.config.height / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 保持一定距离跟随
            if (distance > 100) {
                this.currentX += (dx / distance) * (this.config.speed * 1.5);
                this.currentY += (dy / distance) * (this.config.speed * 1.5);
                this.updatePosition();
            }
        }
    }
    
    startRandomMovement() {
        setInterval(() => {
            // 如果长时间没有互动，可能会开始随机移动
            if (!this.isMoving && !this.isFollowing && 
                Date.now() - this.lastInteractionTime > 30000) {
                this.setRandomTarget();
            }
        }, 5000);
    }
    
    interact() {
        this.lastInteractionTime = Date.now();
        this.mood = 'excited';
        
        // 互动时的动画效果
        this.element.style.transform = 'scale(1.2) rotate(5deg)';
        setTimeout(() => {
            this.element.style.transform = 'scale(1) rotate(0deg)';
        }, 300);
        
        // 显示简单的反馈
        this.showFeedback('你好！');
        
        // 重置心情
        setTimeout(() => {
            this.mood = 'happy';
        }, 5000);
    }
    
    toggleFollowMode() {
        this.isFollowing = !this.isFollowing;
        this.isMoving = false;
        this.lastInteractionTime = Date.now();
        
        if (this.isFollowing) {
            this.showFeedback('我会跟着你！');
            this.mood = 'excited';
        } else {
            this.showFeedback('再见！');
            this.mood = 'happy';
            this.setRandomTarget();
        }
    }
    
    showFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'pet-feedback';
        feedback.textContent = message;
        feedback.style.position = 'fixed';
        feedback.style.left = `${this.currentX + this.config.width}px`;
        feedback.style.top = `${this.currentY - 20}px`;
        feedback.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        feedback.style.color = '#333';
        feedback.style.padding = '5px 10px';
        feedback.style.borderRadius = '10px';
        feedback.style.fontSize = '14px';
        feedback.style.zIndex = '10000';
        feedback.style.pointerEvents = 'none';
        feedback.style.opacity = '0';
        feedback.style.transition = 'opacity 0.3s ease, transform 0.5s ease';
        
        document.body.appendChild(feedback);
        
        // 显示动画
        setTimeout(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(-10px)';
        }, 10);
        
        // 隐藏动画
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 2000);
    }
    
    updateMood() {
        // 根据时间更新心情
        const now = Date.now();
        if (now - this.lastInteractionTime > 60000) {
            this.mood = 'bored';
        } else if (now - this.lastInteractionTime > 30000) {
            // 随机小动画表示无聊
            if (Math.random() < 0.005) {
                this.element.style.transform = 'rotate(' + (Math.random() * 10 - 5) + 'deg)';
                setTimeout(() => {
                    this.element.style.transform = 'rotate(0deg)';
                }, 500);
            }
        }
    }
    
    // 销毁桌宠
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// 初始化桌宠系统
function initDesktopPet() {
    // 创建桌宠实例
    const pet = new DesktopPet();
    
    // 保存到window对象以便全局访问
    window.desktopPet = pet;
    
    // 添加到右键菜单
    setTimeout(() => {
        const contextMenu = document.getElementById('custom-context-menu');
        if (contextMenu) {
            // 添加桌宠控制菜单项
            const petMenuItem = document.createElement('div');
            petMenuItem.className = 'context-menu-item';
            petMenuItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>桌宠设置';

            // 尝试找到"新建"菜单项
            let newItem = null;
            const menuItems = contextMenu.querySelectorAll('.context-menu-item');
            menuItems.forEach(item => {
                if (item.textContent.includes('新建')) {
                    newItem = item;
                }
            });

            // 如果找到了"新建"菜单项，则插入到其后面
            if (newItem && newItem.nextSibling) {
                contextMenu.insertBefore(petMenuItem, newItem.nextSibling);
            } else {
                // 否则添加分割线并追加到菜单末尾
                const divider = document.createElement('div');
                divider.className = 'context-menu-divider';
                contextMenu.appendChild(divider);
                contextMenu.appendChild(petMenuItem);
            }

            // 创建桌宠设置子菜单
            const petSubMenu = document.createElement('div');
            petSubMenu.className = 'custom-context-menu submenu';
            petSubMenu.style.position = 'absolute';
            petSubMenu.style.display = 'none';
            document.body.appendChild(petSubMenu);
            
            // 显示子菜单
            petMenuItem.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                const rect = petMenuItem.getBoundingClientRect();
                petSubMenu.style.left = `${rect.right}px`;
                petSubMenu.style.top = `${rect.top}px`;
                petSubMenu.style.display = 'block';
            });
            
            // 隐藏子菜单
            petMenuItem.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    if (!petSubMenu.matches(':hover')) {
                        petSubMenu.style.display = 'none';
                    }
                }, 300);
            });
            
            // 添加跟随模式菜单项
            const followItem = document.createElement('div');
            followItem.className = 'context-menu-item';
            followItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 12-4 4-7-7-3 3"></path><path d="M16 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-9"></path><path d="M12 17h8"></path></svg>跟随模式';
            followItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.toggleFollowMode();
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
            });
            petSubMenu.appendChild(followItem);
            
            // 添加移动菜单项
            const moveItem = document.createElement('div');
            moveItem.className = 'context-menu-item';
            moveItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="15 19 12 22 9 19"></polyline><polyline points="19 9 22 12 19 15"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>随机移动';
            moveItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.setRandomTarget();
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
            });
            petSubMenu.appendChild(moveItem);
        }
    }, 1000);
}

// 当文档加载完成后初始化桌宠
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDesktopPet);
} else {
    initDesktopPet();
}