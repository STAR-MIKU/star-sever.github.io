// 桌宠系统实现
class DesktopPet {
    constructor(options = {}) {
        // 从本地存储加载配置
    const savedConfig = localStorage.getItem('desktopPetConfig');
    const defaultConfig = {
            width: 60,
            height: 60,
            speed: 2,
            color: '#FF6B6B',
            shape: 'circle', // circle, square, triangle
            eyeColor: 'black',
            mouthColor: 'black',
            showFeedback: true,
            interactionDistance: 100,
            expression: 'normal',
            size: 'medium',
            opacity: 1.0,
            customTexts: [], // 数组存储多个自定义文本（气泡用）
            signText: '', // 举牌文本
            signImage: '', // 举牌图片URL
            showSign: false, // 是否显示举牌
            signWidth: 80, // 举牌宽度
            signHeight: 50 // 举牌高度
        }

        // 确保generateSvg方法在调用前已定义
        this.generateSvg = function() {
            const { width, height, color, shape, eyeColor, mouthColor, expression, size, opacity, customText } = this.config;
            const sizeMultiplier = size === 'small' ? 0.8 : size === 'large' ? 1.2 : 1;
            const actualSize = Math.min(width, height) * sizeMultiplier;
            const center = actualSize / 2;
            const eyeSize = actualSize / 10;
            const eyeOffsetX = actualSize / 6;
            const eyeOffsetY = -actualSize / 6;

            // 根据表情确定嘴巴路径
            let mouthPath = '';
            switch(expression) {
                case 'happy':
                    mouthPath = 'M30 65 Q50 85 70 65';
                    break;
                case 'sad':
                    mouthPath = 'M30 75 Q50 55 70 75';
                    break;
                case 'angry':
                    mouthPath = 'M30 65 L50 60 L70 65';
                    break;
                case 'surprised':
                    mouthPath = 'M40 65 Q50 85 60 65';
                    break;
                default:
                    mouthPath = 'M30 65 L70 65';
            }

            switch(shape) {
                case 'square':
                    return `
                        <svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                            <rect x="5" y="5" width="90" height="90" rx="15" fill="${color}" opacity="${opacity}" />
                            <circle cx="35" cy="35" r="${eyeSize}" fill="white" />
                            <circle cx="65" cy="35" r="${eyeSize}" fill="white" />
                            <circle cx="35" cy="35" r="${eyeSize/2}" fill="${eyeColor}" />
                            <circle cx="65" cy="35" r="${eyeSize/2}" fill="${eyeColor}" />
                            <path d="${mouthPath}" stroke="${mouthColor}" stroke-width="3" fill="none" />

                        </svg>
                    `;
                case 'triangle':
                    return `
                        <svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                            <polygon points="50,10 10,90 90,90" fill="${color}" opacity="${opacity}" />
                            <circle cx="35" cy="40" r="${eyeSize}" fill="white" />
                            <circle cx="65" cy="40" r="${eyeSize}" fill="white" />
                            <circle cx="35" cy="40" r="${eyeSize/2}" fill="${eyeColor}" />
                            <circle cx="65" cy="40" r="${eyeSize/2}" fill="${eyeColor}" />
                            <path d="${mouthPath}" stroke="${mouthColor}" stroke-width="3" fill="none" />

                        </svg>
                    `;
                case 'circle':
                default:
                    return `
                        <svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="45" fill="${color}" opacity="${opacity}" />
                            <circle cx="35" cy="35" r="${eyeSize}" fill="white" />
                            <circle cx="65" cy="35" r="${eyeSize}" fill="white" />
                            <circle cx="35" cy="35" r="${eyeSize/2}" fill="${eyeColor}" />
                            <circle cx="65" cy="35" r="${eyeSize/2}" fill="${eyeColor}" />
                            <path d="${mouthPath}" stroke="${mouthColor}" stroke-width="3" fill="none" />
                            ${customText ? `<g transform="translate(50, 85)"><rect x="-35" y="-15" width="70" height="30" rx="5" ry="5" fill="white" stroke="black" stroke-width="1" /><text x="0" y="8" font-family="Arial, sans-serif" font-size="12" fill="black" text-anchor="middle">${customText}</text></g>` : ''}
                            ${this.config.showSign ? this.generateSign() : ''}
                        </svg>
                    `;
            }
        };

        // 合并默认配置、保存的配置和传入的选项
        this.config = {
            ...defaultConfig,
            ...(savedConfig ? JSON.parse(savedConfig) : {}),
            ...options
        };

        // 保存配置
        this.saveConfig();
        
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
        this.rotationAngle = 0; // 旋转角度
        this.isSpinning = false; // 是否正在旋转
        this.spinSpeed = 1; // 旋转速度
        
        this.init();
    }
    
    // 生成SVG图形（已在构造函数中定义）
    generateSvg() {
        // 根据表情确定嘴巴路径
        let mouthPath = '';
        switch(this.config.expression) {
            case 'happy':
                mouthPath = 'M8,15 Q12,18 16,15';
                break;
            case 'sad':
                mouthPath = 'M8,18 Q12,15 16,18';
                break;
            case 'angry':
                mouthPath = 'M8,16 L12,14 L16,16';
                break;
            case 'surprised':
                mouthPath = 'M12,15 Q14,15 14,17 Q12,19 10,17 Q10,15 12,15';
                break;
            default:
                mouthPath = 'M8,16 L16,16';
        }

        // 根据大小调整比例
        let sizeMultiplier = 1;
        switch(this.config.size) {
            case 'small':
                sizeMultiplier = 0.8;
                break;
            case 'large':
                sizeMultiplier = 1.2;
                break;
            default:
                sizeMultiplier = 1;
        }
        // 这个方法的实现已经在构造函数中通过函数表达式定义
        // 这里保留方法声明以确保接口一致性
    }

    // 保存配置到本地存储
    saveConfig() {
        localStorage.setItem('desktopPetConfig', JSON.stringify(this.config));
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
        this.element.innerHTML = this.generateSvg();
        
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
        
        // 启动整点报时检查
        this.startTimeCheck();
    }
    
    // 启动时间检查定时器
    startTimeCheck() {
        // 立即检查一次
        this.checkTime();
        
        // 每分钟检查一次
        setInterval(() => {
            this.checkTime();
        }, 60000);
    }
    
    // 检查当前时间是否是整点
    checkTime() {
        const now = new Date();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // 在整点前5秒准备，避免时间偏差
        if (minutes === 0 && seconds >= 55) {
            // 显示整点报时
            this.showTime();
        }
    }
    
    // 显示当前时间
    showTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // 使用举牌显示时间
        this.setSignContent({
            text: `现在是${timeString}`,
            image: ''
        });
        
        // 5秒后自动隐藏举牌
        setTimeout(() => {
            this.config.showSign = false;
            this.element.innerHTML = this.generateSvg();
        }, 5000);
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
    
    // 旋转角度属性
    rotationAngle = 0;

    // 设置旋转角度
    setRotation(angle) {
        this.rotationAngle = angle % 360; // 确保角度在0-359之间
        this.updatePosition();
    }

    // 随机旋转
    randomRotation() {
        const angle = Math.random() * 360;
        this.setRotation(angle);
    }

    updatePosition() {
        this.element.style.left = `${this.currentX}px`;
        this.element.style.top = `${this.currentY}px`;
        
        // 应用旋转角度
        if (this.isMoving) {
            const dx = this.targetX - this.currentX;
            const dy = this.targetY - this.currentY;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            this.rotationAngle = angle;
        } else if (this.isFollowing) {
            // 跟随模式下，根据鼠标位置调整角度
            const dx = this.mouseX - this.currentX - this.config.width / 2;
            const dy = this.mouseY - this.currentY - this.config.height / 2;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            this.rotationAngle = angle;
        }
        
        this.element.style.transform = `rotate(${this.rotationAngle}deg)`;
    }
    
    // 持续旋转动画
    startSpinning(speed = 1) {
        if (this.isSpinning) return;
        this.isSpinning = true;
        this.spinSpeed = speed;
        
        const spin = () => {
            if (!this.isSpinning) return;
            this.rotationAngle = (this.rotationAngle + this.spinSpeed) % 360;
            this.updatePosition();
            requestAnimationFrame(spin);
        };
        
        spin();
    }
    
    // 停止旋转
    stopSpinning() {
        if (!this.isSpinning) return;
        this.isSpinning = false;
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
    
    // 获取一言
    getHitokoto() {
        return fetch('https://v1.hitokoto.cn/')
            .then(response => response.json())
            .then(data => data.hitokoto)
            .catch(() => '未能获取一言，请稍后再试');
    }
    
    interact() {
        this.lastInteractionTime = Date.now();
        this.mood = 'excited';
        
        // 互动时的动画效果
        // 互动时随机旋转一个角度
        this.randomRotation();
        this.element.style.transform = `scale(1.2) rotate(${this.rotationAngle}deg)`;
        setTimeout(() => {
            this.element.style.transform = `scale(1) rotate(${this.rotationAngle}deg)`;
        }, 300);
        
        // 从自定义文本数组中随机选择一个显示
        if (this.config.customTexts && this.config.customTexts.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.config.customTexts.length);
            this.showFeedback(this.config.customTexts[randomIndex]);
        } else {
            // 获取并显示一言
            this.getHitokoto().then(hitokoto => {
                this.showFeedback(hitokoto);
            });
        }
        
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

    // 更新桌宠外观
    updateAppearance(config) {
        this.config = {...this.config, ...config};
        this.saveConfig();
        // 如果更改了大小，需要调整元素大小
        if (config.size) {
            let sizeMultiplier = 1;
            switch(config.size) {
                case 'small':
                    sizeMultiplier = 0.8;
                    break;
                case 'large':
                    sizeMultiplier = 1.2;
                    break;
            }
            this.element.style.width = `${this.config.width * sizeMultiplier}px`;
            this.element.style.height = `${this.config.height * sizeMultiplier}px`;
        }
        // 如果更改了透明度
        if (config.opacity !== undefined) {
            // 透明度在SVG中设置，这里不需要额外设置
        }
        this.element.innerHTML = this.generateSvg();
        this.showFeedback('外观已更新！');
    }

    // 生成举牌SVG
    generateSign() {
            const { signText, signImage, signWidth, signHeight } = this.config;
            const signY = 95; // 位于桌宠下方，调整位置避免被截断

            let signContent = '';
            let calculatedWidth = signWidth;
            if (signImage && signImage.trim() !== '') {
            // 图片举牌
            const signX = 50 - calculatedWidth/2;
            signContent = `<image x="${signX}" y="${signY}" width="${calculatedWidth}" height="${signHeight}" xlink:href="${signImage}" />`;
        } else if (signText && signText.trim() !== '') {
            // 文字举牌：根据文字长度动态计算宽度
            // 假设每个字符宽度约为14px，加上20px边距（增加字符宽度以解决牌子过短问题）
            calculatedWidth = Math.max(signText.length * 14 + 20, signWidth);
            const signX = 50 - calculatedWidth/2;
            signContent = `<rect x="${signX}" y="${signY}" width="${calculatedWidth}" height="${signHeight}" rx="5" ry="5" fill="white" stroke="black" stroke-width="2" />
                            <text x="50" y="${signY + signHeight/2 + 5}" font-family="Arial, sans-serif" font-size="14" fill="black" text-anchor="middle">${signText}</text>`;
        } else {
            // 空举牌
            const signX = 50 - calculatedWidth/2;
            signContent = `<rect x="${signX}" y="${signY}" width="${calculatedWidth}" height="${signHeight}" rx="5" ry="5" fill="white" stroke="black" stroke-width="2" />`;
        }

        return `<g transform="scale(0.8)">
                    ${signContent}
                </g>`;
    }

    // 设置举牌内容
    setSignContent(options = {}) {
        this.config.signText = options.text || '';
        this.config.signImage = options.image || '';
        this.config.showSign = true;
        this.saveConfig();
        this.element.innerHTML = this.generateSvg();
        // 确保举牌显示的额外检查
        if (!this.element.innerHTML.includes('g transform="scale(0.8)"')) {
            console.log('举牌未正确生成，强制更新SVG');
            setTimeout(() => {
                this.element.innerHTML = this.generateSvg();
            }, 100);
        }
        this.showFeedback('举牌内容已更新');
    }

    // 隐藏举牌
    hideSign() {
        this.config.showSign = false;
        this.saveConfig();
        this.element.innerHTML = this.generateSvg();
        this.showFeedback('已隐藏举牌');
    }

    // 更新自定义文本
    // 添加自定义文本
    addCustomText(text) {
        if (!text || text.trim() === '') return;
        const limitedText = text.substring(0, 10); // 限制字符长度
        
        // 避免重复添加
        if (!this.config.customTexts.includes(limitedText)) {
            this.config.customTexts.push(limitedText);
            this.saveConfig();
            this.showFeedback(`已添加文本: ${limitedText}`);
        } else {
            this.showFeedback(`文本已存在: ${limitedText}`);
        }
    }

    // 移除自定义文本
    removeCustomText(index) {
        if (index >= 0 && index < this.config.customTexts.length) {
            const removedText = this.config.customTexts.splice(index, 1);
            this.saveConfig();
            this.showFeedback(`已移除文本: ${removedText[0]}`);
        }
    }

    // 清空所有自定义文本
    clearCustomTexts() {
        this.config.customTexts = [];
        this.saveConfig();
        this.showFeedback('已清空所有自定义文本');
    }

    // 更新表情
    updateExpression(expression) {
        this.config.expression = expression;
        this.saveConfig();
        this.element.innerHTML = this.generateSvg();
        this.showFeedback(`表情已设置为${expression}`);
    }

    // 更新移动速度
    updateSpeed(speed) {
        this.config.speed = speed;
        this.saveConfig();
        this.showFeedback(`速度已设置为 ${speed}`);
    }

    // 更新举牌大小
    updateSignSize(width, height) {
        this.config.signWidth = width;
        this.config.signHeight = height;
        this.saveConfig();
        this.element.innerHTML = this.generateSvg();
        this.showFeedback(`举牌大小已设置为 ${width}x${height}`);
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
                
                // 计算子菜单位置，确保不超出屏幕
                let left = rect.right;
                let top = rect.top;
                
                // 获取屏幕尺寸
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;
                
                // 先显示子菜单以获取其尺寸
                petSubMenu.style.left = `${left}px`;
                petSubMenu.style.top = `${top}px`;
                petSubMenu.style.display = 'block';
                
                // 获取子菜单尺寸
                const subMenuRect = petSubMenu.getBoundingClientRect();
                
                // 检查是否超出右边界
                if (subMenuRect.right > screenWidth) {
                    left = rect.left - subMenuRect.width;
                }
                
                // 检查是否超出下边界
                if (subMenuRect.bottom > screenHeight) {
                    top = rect.top - subMenuRect.height;
                }
                
                // 确保不小于0
                left = Math.max(0, left);
                top = Math.max(0, top);
                
                // 设置最终位置
                petSubMenu.style.left = `${left}px`;
                petSubMenu.style.top = `${top}px`;
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

            // 优化：预创建所有子菜单
            // 外观设置子菜单
            const appearanceSubMenu = document.createElement('div');
            appearanceSubMenu.className = 'custom-context-menu submenu';
            appearanceSubMenu.style.position = 'absolute';
            appearanceSubMenu.style.display = 'none';
            document.body.appendChild(appearanceSubMenu);

            // 外观设置菜单项
            const appearanceItem = document.createElement('div');
            appearanceItem.className = 'context-menu-item';
            appearanceItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="2" width="9" height="7" rx="2" ry="2"></rect><circle cx="16.5" cy="13" r="1.5"></circle><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>外观设置';
            petSubMenu.appendChild(appearanceItem);

            // 优化：使用事件委托和更高效的显示/隐藏机制
            // 显示外观子菜单
                appearanceItem.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    const rect = appearanceItem.getBoundingClientRect();
                    
                    // 计算子菜单位置，确保不超出屏幕
                    let left = rect.right;
                    let top = rect.top;
                    
                    // 获取屏幕尺寸
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;
                    
                    // 先显示子菜单以获取其尺寸
                    appearanceSubMenu.style.left = `${left}px`;
                    appearanceSubMenu.style.top = `${top}px`;
                    appearanceSubMenu.style.display = 'block';
                    
                    // 获取子菜单尺寸
                    const subMenuRect = appearanceSubMenu.getBoundingClientRect();
                    
                    // 检查是否超出右边界
                    if (subMenuRect.right > screenWidth) {
                        left = rect.left - subMenuRect.width;
                    }
                    
                    // 检查是否超出下边界
                    if (subMenuRect.bottom > screenHeight) {
                        top = rect.top - subMenuRect.height;
                    }
                    
                    // 确保不小于0
                    left = Math.max(0, left);
                    top = Math.max(0, top);
                    
                    // 设置最终位置
                    appearanceSubMenu.style.left = `${left}px`;
                    appearanceSubMenu.style.top = `${top}px`;
                });

            // 隐藏外观子菜单
            let appearanceSubMenuTimeout;
            appearanceItem.addEventListener('mouseleave', () => {
                appearanceSubMenuTimeout = setTimeout(() => {
                    if (!appearanceSubMenu.matches(':hover')) {
                        appearanceSubMenu.style.display = 'none';
                    }
                }, 200); // 优化：减少延迟时间
            });

            // 鼠标进入子菜单时清除隐藏计时器
            appearanceSubMenu.addEventListener('mouseenter', () => {
                clearTimeout(appearanceSubMenuTimeout);
            });

            // 鼠标离开子菜单时隐藏
            appearanceSubMenu.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    appearanceSubMenu.style.display = 'none';
                }, 200);
            });

            // 表情设置子菜单
            const expressionSubMenu = document.createElement('div');
            expressionSubMenu.className = 'custom-context-menu submenu';
            expressionSubMenu.style.position = 'absolute';
            expressionSubMenu.style.display = 'none';
            document.body.appendChild(expressionSubMenu);

            // 表情设置菜单项
            const expressionItem = document.createElement('div');
            expressionItem.className = 'context-menu-item';
            expressionItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>表情设置';
            petSubMenu.appendChild(expressionItem);

            // 显示表情子菜单
                expressionItem.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    const rect = expressionItem.getBoundingClientRect();
                    
                    // 计算子菜单位置，确保不超出屏幕
                    let left = rect.right;
                    let top = rect.top;
                    
                    // 获取屏幕尺寸
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;
                    
                    // 先显示子菜单以获取其尺寸
                    expressionSubMenu.style.left = `${left}px`;
                    expressionSubMenu.style.top = `${top}px`;
                    expressionSubMenu.style.display = 'block';
                    
                    // 获取子菜单尺寸
                    const subMenuRect = expressionSubMenu.getBoundingClientRect();
                    
                    // 检查是否超出右边界
                    if (subMenuRect.right > screenWidth) {
                        left = rect.left - subMenuRect.width;
                    }
                    
                    // 检查是否超出下边界
                    if (subMenuRect.bottom > screenHeight) {
                        top = rect.top - subMenuRect.height;
                    }
                    
                    // 确保不小于0
                    left = Math.max(0, left);
                    top = Math.max(0, top);
                    
                    // 设置最终位置
                    expressionSubMenu.style.left = `${left}px`;
                    expressionSubMenu.style.top = `${top}px`;
                });

            // 隐藏表情子菜单
            let expressionSubMenuTimeout;
            expressionItem.addEventListener('mouseleave', () => {
                expressionSubMenuTimeout = setTimeout(() => {
                    if (!expressionSubMenu.matches(':hover')) {
                        expressionSubMenu.style.display = 'none';
                    }
                }, 200);
            });

            // 鼠标进入子菜单时清除隐藏计时器
            expressionSubMenu.addEventListener('mouseenter', () => {
                clearTimeout(expressionSubMenuTimeout);
            });

            // 鼠标离开子菜单时隐藏
            expressionSubMenu.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    expressionSubMenu.style.display = 'none';
                }, 200);
            });

            // 添加表情选项
            const expressionNormalItem = document.createElement('div');
            expressionNormalItem.className = 'context-menu-item';
            expressionNormalItem.innerHTML = '正常';
            expressionNormalItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateExpression('normal');
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                expressionSubMenu.style.display = 'none';
            });
            expressionSubMenu.appendChild(expressionNormalItem);

            const expressionHappyItem = document.createElement('div');
            expressionHappyItem.className = 'context-menu-item';
            expressionHappyItem.innerHTML = '开心';
            expressionHappyItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateExpression('happy');
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                expressionSubMenu.style.display = 'none';
            });
            expressionSubMenu.appendChild(expressionHappyItem);

            const expressionSadItem = document.createElement('div');
            expressionSadItem.className = 'context-menu-item';
            expressionSadItem.innerHTML = '难过';
            expressionSadItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateExpression('sad');
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                expressionSubMenu.style.display = 'none';
            });
            expressionSubMenu.appendChild(expressionSadItem);

            const expressionAngryItem = document.createElement('div');
            expressionAngryItem.className = 'context-menu-item';
            expressionAngryItem.innerHTML = '生气';
            expressionAngryItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateExpression('angry');
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                expressionSubMenu.style.display = 'none';
            });
            expressionSubMenu.appendChild(expressionAngryItem);

            const expressionSurprisedItem = document.createElement('div');
            expressionSurprisedItem.className = 'context-menu-item';
            expressionSurprisedItem.innerHTML = '惊讶';
            expressionSurprisedItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateExpression('surprised');
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                expressionSubMenu.style.display = 'none';
            });
            expressionSubMenu.appendChild(expressionSurprisedItem);

            // 透明度设置子菜单
            const opacitySubMenu = document.createElement('div');
            opacitySubMenu.className = 'custom-context-menu submenu';
            opacitySubMenu.style.position = 'absolute';
            opacitySubMenu.style.display = 'none';
            document.body.appendChild(opacitySubMenu);

            // 透明度设置菜单项
            const opacityItem = document.createElement('div');
            opacityItem.className = 'context-menu-item';
            opacityItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><line x1="16" y1="8" x2="8" y2="8"></line><line x1="16" y1="16" x2="8" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>透明度设置';
            petSubMenu.appendChild(opacityItem);

            // 显示透明度子菜单
                opacityItem.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    const rect = opacityItem.getBoundingClientRect();
                    
                    // 计算子菜单位置，确保不超出屏幕
                    let left = rect.right;
                    let top = rect.top;
                    
                    // 获取屏幕尺寸
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;
                    
                    // 先显示子菜单以获取其尺寸
                    opacitySubMenu.style.left = `${left}px`;
                    opacitySubMenu.style.top = `${top}px`;
                    opacitySubMenu.style.display = 'block';
                    
                    // 获取子菜单尺寸
                    const subMenuRect = opacitySubMenu.getBoundingClientRect();
                    
                    // 检查是否超出右边界
                    if (subMenuRect.right > screenWidth) {
                        left = rect.left - subMenuRect.width;
                    }
                    
                    // 检查是否超出下边界
                    if (subMenuRect.bottom > screenHeight) {
                        top = rect.top - subMenuRect.height;
                    }
                    
                    // 确保不小于0
                    left = Math.max(0, left);
                    top = Math.max(0, top);
                    
                    // 设置最终位置
                    opacitySubMenu.style.left = `${left}px`;
                    opacitySubMenu.style.top = `${top}px`;
                });

            // 隐藏透明度子菜单
            let opacitySubMenuTimeout;
            opacityItem.addEventListener('mouseleave', () => {
                opacitySubMenuTimeout = setTimeout(() => {
                    if (!opacitySubMenu.matches(':hover')) {
                        opacitySubMenu.style.display = 'none';
                    }
                }, 200);
            });

            // 鼠标进入子菜单时清除隐藏计时器
            opacitySubMenu.addEventListener('mouseenter', () => {
                clearTimeout(opacitySubMenuTimeout);
            });

            // 鼠标离开子菜单时隐藏
            opacitySubMenu.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    opacitySubMenu.style.display = 'none';
                }, 200);
            });

            // 添加透明度选项
            const opacity100Item = document.createElement('div');
            opacity100Item.className = 'context-menu-item';
            opacity100Item.innerHTML = '完全不透明';
            opacity100Item.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateAppearance({ opacity: 1.0 });
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                opacitySubMenu.style.display = 'none';
            });
            opacitySubMenu.appendChild(opacity100Item);

            const opacity75Item = document.createElement('div');
            opacity75Item.className = 'context-menu-item';
            opacity75Item.innerHTML = '75% 透明';
            opacity75Item.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateAppearance({ opacity: 0.75 });
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                opacitySubMenu.style.display = 'none';
            });
            opacitySubMenu.appendChild(opacity75Item);

            const opacity50Item = document.createElement('div');
            opacity50Item.className = 'context-menu-item';
            opacity50Item.innerHTML = '50% 透明';
            opacity50Item.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateAppearance({ opacity: 0.5 });
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                opacitySubMenu.style.display = 'none';
            });
            opacitySubMenu.appendChild(opacity50Item);

            const opacity25Item = document.createElement('div');
            opacity25Item.className = 'context-menu-item';
            opacity25Item.innerHTML = '25% 透明';
            opacity25Item.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateAppearance({ opacity: 0.25 });
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                opacitySubMenu.style.display = 'none';
            });
            opacitySubMenu.appendChild(opacity25Item);

            // 自定义文本管理子菜单
            const customTextSubMenu = document.createElement('div');
            customTextSubMenu.className = 'custom-context-menu submenu';
            customTextSubMenu.style.position = 'absolute';
            customTextSubMenu.style.display = 'none';
            document.body.appendChild(customTextSubMenu);

            // 自定义文本菜单项
            const customTextItem = document.createElement('div');
            customTextItem.className = 'context-menu-item';
            customTextItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"></path><path d="M9 20h6"></path><path d="M12 4v16"></path></svg>自定义文本';
            petSubMenu.appendChild(customTextItem);

            // 优化：缓存自定义文本列表，只在需要时更新
            function updateCustomTextSubMenu() {
                // 动态生成当前自定义文本列表
                while (customTextSubMenu.firstChild) {
                    customTextSubMenu.removeChild(customTextSubMenu.firstChild);
                }

                // 添加新文本菜单项
                const addTextItem = document.createElement('div');
                addTextItem.className = 'context-menu-item';
                addTextItem.innerHTML = '添加新文本';
                addTextItem.addEventListener('click', () => {
                    const text = prompt('请输入自定义文本 (最多10个字符):', '');
                    if (text !== null) {
                        if (window.desktopPet) {
                            window.desktopPet.addCustomText(text);
                            updateCustomTextSubMenu(); // 添加后更新菜单
                        }
                    }
                    contextMenu.style.display = 'none';
                    petSubMenu.style.display = 'none';
                    customTextSubMenu.style.display = 'none';
                });
                customTextSubMenu.appendChild(addTextItem);

                // 添加分隔线
                const divider = document.createElement('div');
                divider.className = 'context-menu-divider';
                customTextSubMenu.appendChild(divider);

                // 显示当前文本列表
                if (window.desktopPet && window.desktopPet.config.customTexts.length > 0) {
                    window.desktopPet.config.customTexts.forEach((text, index) => {
                        const textItem = document.createElement('div');
                        textItem.className = 'context-menu-item';
                        textItem.innerHTML = `${index + 1}. ${text} <span style="color: #999; margin-left: 10px;">点击删除</span>`;
                        textItem.addEventListener('click', () => {
                            if (window.desktopPet) {
                                window.desktopPet.removeCustomText(index);
                                updateCustomTextSubMenu(); // 删除后更新菜单
                            }
                            contextMenu.style.display = 'none';
                            petSubMenu.style.display = 'none';
                            customTextSubMenu.style.display = 'none';
                        });
                        customTextSubMenu.appendChild(textItem);
                    });

                    // 添加清空按钮
                    const clearDivider = document.createElement('div');
                    clearDivider.className = 'context-menu-divider';
                    customTextSubMenu.appendChild(clearDivider);

                    const clearItem = document.createElement('div');
                    clearItem.className = 'context-menu-item';
                    clearItem.innerHTML = '清空所有文本';
                    clearItem.addEventListener('click', () => {
                        if (window.desktopPet) {
                            window.desktopPet.clearCustomTexts();
                            updateCustomTextSubMenu(); // 清空后更新菜单
                        }
                        contextMenu.style.display = 'none';
                        petSubMenu.style.display = 'none';
                        customTextSubMenu.style.display = 'none';
                    });
                    customTextSubMenu.appendChild(clearItem);
                } else {
                    const noTextItem = document.createElement('div');
                    noTextItem.className = 'context-menu-item';
                    noTextItem.innerHTML = '暂无自定义文本';
                    noTextItem.style.color = '#999';
                    customTextSubMenu.appendChild(noTextItem);
                }
            }

            // 优化：只在第一次显示时生成菜单内容
            let customTextSubMenuInitialized = false;

            // 显示自定义文本子菜单
            customTextItem.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                const rect = customTextItem.getBoundingClientRect();
                
                // 计算子菜单位置，确保不超出屏幕
                let left = rect.right;
                let top = rect.top;
                
                // 获取屏幕尺寸
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;
                
                // 先显示子菜单以获取其尺寸
                customTextSubMenu.style.left = `${left}px`;
                customTextSubMenu.style.top = `${top}px`;
                customTextSubMenu.style.display = 'block';
                
                // 获取子菜单尺寸
                const subMenuRect = customTextSubMenu.getBoundingClientRect();
                
                // 检查是否超出右边界
                if (subMenuRect.right > screenWidth) {
                    left = rect.left - subMenuRect.width;
                }
                
                // 检查是否超出下边界
                if (subMenuRect.bottom > screenHeight) {
                    top = rect.top - subMenuRect.height;
                }
                
                // 确保不小于0
                left = Math.max(0, left);
                top = Math.max(0, top);
                
                // 设置最终位置
                customTextSubMenu.style.left = `${left}px`;
                customTextSubMenu.style.top = `${top}px`;

                // 优化：只在第一次显示或文本列表变化时更新
                if (!customTextSubMenuInitialized) {
                    updateCustomTextSubMenu();
                    customTextSubMenuInitialized = true;
                }
            });

            // 隐藏自定义文本子菜单
            let customTextSubMenuTimeout;
            customTextItem.addEventListener('mouseleave', () => {
                customTextSubMenuTimeout = setTimeout(() => {
                    if (!customTextSubMenu.matches(':hover')) {
                        customTextSubMenu.style.display = 'none';
                    }
                }, 200);
            });

            // 鼠标进入子菜单时清除隐藏计时器
            customTextSubMenu.addEventListener('mouseenter', () => {
                clearTimeout(customTextSubMenuTimeout);
            });

            // 鼠标离开子菜单时隐藏
            customTextSubMenu.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    customTextSubMenu.style.display = 'none';
                }, 200);
            });

            // 大小设置子菜单
            const sizeSubMenu = document.createElement('div');
            sizeSubMenu.className = 'custom-context-menu submenu';
            sizeSubMenu.style.position = 'absolute';
            sizeSubMenu.style.display = 'none';
            document.body.appendChild(sizeSubMenu);

            // 大小设置菜单项
            const sizeItem = document.createElement('div');
            sizeItem.className = 'context-menu-item';
            sizeItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><line x1="16" y1="8" x2="8" y2="8"></line><line x1="16" y1="16" x2="8" y2="16"></line></svg>大小设置';
            petSubMenu.appendChild(sizeItem);

            // 显示大小子菜单
                sizeItem.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    const rect = sizeItem.getBoundingClientRect();
                    
                    // 计算子菜单位置，确保不超出屏幕
                    let left = rect.right;
                    let top = rect.top;
                    
                    // 获取屏幕尺寸
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;
                    
                    // 先显示子菜单以获取其尺寸
                    sizeSubMenu.style.left = `${left}px`;
                    sizeSubMenu.style.top = `${top}px`;
                    sizeSubMenu.style.display = 'block';
                    
                    // 获取子菜单尺寸
                    const subMenuRect = sizeSubMenu.getBoundingClientRect();
                    
                    // 检查是否超出右边界
                    if (subMenuRect.right > screenWidth) {
                        left = rect.left - subMenuRect.width;
                    }
                    
                    // 检查是否超出下边界
                    if (subMenuRect.bottom > screenHeight) {
                        top = rect.top - subMenuRect.height;
                    }
                    
                    // 确保不小于0
                    left = Math.max(0, left);
                    top = Math.max(0, top);
                    
                    // 设置最终位置
                    sizeSubMenu.style.left = `${left}px`;
                    sizeSubMenu.style.top = `${top}px`;
                });

            // 隐藏大小子菜单
            let sizeSubMenuTimeout;
            sizeItem.addEventListener('mouseleave', () => {
                sizeSubMenuTimeout = setTimeout(() => {
                    if (!sizeSubMenu.matches(':hover')) {
                        sizeSubMenu.style.display = 'none';
                    }
                }, 200);
            });

            // 鼠标进入子菜单时清除隐藏计时器
            sizeSubMenu.addEventListener('mouseenter', () => {
                clearTimeout(sizeSubMenuTimeout);
            });

            // 鼠标离开子菜单时隐藏
            sizeSubMenu.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    sizeSubMenu.style.display = 'none';
                }, 200);
            });

            // 添加大小选项
            const sizeSmallItem = document.createElement('div');
            sizeSmallItem.className = 'context-menu-item';
            sizeSmallItem.innerHTML = '小';
            sizeSmallItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateAppearance({ size: 'small' });
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                sizeSubMenu.style.display = 'none';
            });
            sizeSubMenu.appendChild(sizeSmallItem);

            const sizeMediumItem = document.createElement('div');
            sizeMediumItem.className = 'context-menu-item';
            sizeMediumItem.innerHTML = '中';
            sizeMediumItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateAppearance({ size: 'medium' });
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                sizeSubMenu.style.display = 'none';
            });
            sizeSubMenu.appendChild(sizeMediumItem);

            const sizeLargeItem = document.createElement('div');
            sizeLargeItem.className = 'context-menu-item';
            sizeLargeItem.innerHTML = '大';
            sizeLargeItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateAppearance({ size: 'large' });
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                sizeSubMenu.style.display = 'none';
            });
            sizeSubMenu.appendChild(sizeLargeItem);

            // 添加形状选项
            const shapeCircleItem = document.createElement('div');
            shapeCircleItem.className = 'context-menu-item';
            shapeCircleItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>圆形';
            shapeCircleItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateAppearance({ shape: 'circle' });
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                appearanceSubMenu.style.display = 'none';
            });
            appearanceSubMenu.appendChild(shapeCircleItem);

            const shapeSquareItem = document.createElement('div');
            shapeSquareItem.className = 'context-menu-item';
            shapeSquareItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>方形';
            shapeSquareItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateAppearance({ shape: 'square' });
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                appearanceSubMenu.style.display = 'none';
            });
            appearanceSubMenu.appendChild(shapeSquareItem);

            const shapeTriangleItem = document.createElement('div');
            shapeTriangleItem.className = 'context-menu-item';
            shapeTriangleItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>三角形';
            shapeTriangleItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateAppearance({ shape: 'triangle' });
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                appearanceSubMenu.style.display = 'none';
            });
            appearanceSubMenu.appendChild(shapeTriangleItem);

            // 添加颜色选项
            const colorRedItem = document.createElement('div');
            colorRedItem.className = 'context-menu-item';
            colorRedItem.innerHTML = '<div style="width: 15px; height: 15px; background-color: #FF6B6B; display: inline-block; margin-right: 8px; border-radius: 50%;"></div>红色';
            colorRedItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateAppearance({ color: '#FF6B6B' });
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                appearanceSubMenu.style.display = 'none';
            });
            appearanceSubMenu.appendChild(colorRedItem);

            const colorBlueItem = document.createElement('div');
            colorBlueItem.className = 'context-menu-item';
            colorBlueItem.innerHTML = '<div style="width: 15px; height: 15px; background-color: #4ECDC4; display: inline-block; margin-right: 8px; border-radius: 50%;"></div>蓝色';
            colorBlueItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateAppearance({ color: '#4ECDC4' });
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                appearanceSubMenu.appendChild(colorBlueItem);
            });
            appearanceSubMenu.appendChild(colorBlueItem);

            const colorGreenItem = document.createElement('div');
            colorGreenItem.className = 'context-menu-item';
            colorGreenItem.innerHTML = '<div style="width: 15px; height: 15px; background-color: #4CAF50; display: inline-block; margin-right: 8px; border-radius: 50%;"></div>绿色';
            colorGreenItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateAppearance({ color: '#4CAF50' });
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                appearanceSubMenu.style.display = 'none';
            });
            appearanceSubMenu.appendChild(colorGreenItem);

            // 添加速度设置子菜单
            const speedSubMenu = document.createElement('div');
            speedSubMenu.className = 'custom-context-menu submenu';
            speedSubMenu.style.position = 'absolute';
            speedSubMenu.style.display = 'none';
            document.body.appendChild(speedSubMenu);

            // 速度设置菜单项
            const speedItem = document.createElement('div');
            speedItem.className = 'context-menu-item';
            speedItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 10 19 4 19 10"></polygon><polygon points="1 20 7 14 1 14"></polygon><path d="M19 14v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6"></path><line x1="7" y1="10" x2="1" y2="4"></line><line x1="13" y1="20" x2="19" y2="14"></line><line x1="7" y1="10" x2="13" y2="20"></line><line x1="7" y1="14" x2="13" y2="14"></line></svg>速度设置';
            petSubMenu.appendChild(speedItem);

            // 显示速度子菜单
                speedItem.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    const rect = speedItem.getBoundingClientRect();
                    
                    // 计算子菜单位置，确保不超出屏幕
                    let left = rect.right;
                    let top = rect.top;
                    
                    // 获取屏幕尺寸
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;
                    
                    // 先显示子菜单以获取其尺寸
                    speedSubMenu.style.left = `${left}px`;
                    speedSubMenu.style.top = `${top}px`;
                    speedSubMenu.style.display = 'block';
                    
                    // 获取子菜单尺寸
                    const subMenuRect = speedSubMenu.getBoundingClientRect();
                    
                    // 检查是否超出右边界
                    if (subMenuRect.right > screenWidth) {
                        left = rect.left - subMenuRect.width;
                    }
                    
                    // 检查是否超出下边界
                    if (subMenuRect.bottom > screenHeight) {
                        top = rect.top - subMenuRect.height;
                    }
                    
                    // 确保不小于0
                    left = Math.max(0, left);
                    top = Math.max(0, top);
                    
                    // 设置最终位置
                    speedSubMenu.style.left = `${left}px`;
                    speedSubMenu.style.top = `${top}px`;
                });

            // 隐藏速度子菜单
            // 隐藏速度子菜单
            let speedSubMenuTimeout;
            speedItem.addEventListener('mouseleave', () => {
                speedSubMenuTimeout = setTimeout(() => {
                    if (!speedSubMenu.matches(':hover')) {
                        speedSubMenu.style.display = 'none';
                    }
                }, 200); // 统一延迟时间为200ms
            });

            // 鼠标进入子菜单时清除隐藏计时器
            speedSubMenu.addEventListener('mouseenter', () => {
                clearTimeout(speedSubMenuTimeout);
            });

            // 鼠标离开子菜单时隐藏
            speedSubMenu.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    speedSubMenu.style.display = 'none';
                }, 200);
            });

            // 添加速度选项
            const speedSlowItem = document.createElement('div');
            speedSlowItem.className = 'context-menu-item';
            speedSlowItem.innerHTML = '慢速';
            speedSlowItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateSpeed(1);
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                speedSubMenu.style.display = 'none';
            });
            speedSubMenu.appendChild(speedSlowItem);

            const speedNormalItem = document.createElement('div');
            speedNormalItem.className = 'context-menu-item';
            speedNormalItem.innerHTML = '正常';
            speedNormalItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateSpeed(2);
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                speedSubMenu.style.display = 'none';
            });
            speedSubMenu.appendChild(speedNormalItem);

            const speedFastItem = document.createElement('div');
            speedFastItem.className = 'context-menu-item';
            speedFastItem.innerHTML = '快速';
            speedFastItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateSpeed(4);
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                speedSubMenu.style.display = 'none';
            });
            speedSubMenu.appendChild(speedFastItem);

            // 添加重置菜单项
            const resetItem = document.createElement('div');
            resetItem.className = 'context-menu-item';
            resetItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v6h6"></path><path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path><path d="M21 22v-6h-6"></path><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path></svg>重置';
            resetItem.addEventListener('click', () => {
                localStorage.removeItem('desktopPetConfig');
                if (window.desktopPet) {
                    window.desktopPet.destroy();
                }
                window.desktopPet = new DesktopPet();
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
            });
            // 添加举牌设置子菜单
            const signSubMenu = document.createElement('div');
            signSubMenu.className = 'custom-context-menu submenu';
            signSubMenu.style.position = 'absolute';
            signSubMenu.style.display = 'none';
            document.body.appendChild(signSubMenu);

            // 举牌设置菜单项
            const signItem = document.createElement('div');
            signItem.className = 'context-menu-item';
            signItem.innerHTML = '<svg class="context-menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>举牌设置';
            petSubMenu.appendChild(signItem);

            // 显示举牌子菜单
                signItem.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    const rect = signItem.getBoundingClientRect();
                    
                    // 计算子菜单位置，确保不超出屏幕
                    let left = rect.right;
                    let top = rect.top;
                    
                    // 获取屏幕尺寸
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;
                    
                    // 先显示子菜单以获取其尺寸
                    signSubMenu.style.left = `${left}px`;
                    signSubMenu.style.top = `${top}px`;
                    signSubMenu.style.display = 'block';
                    
                    // 获取子菜单尺寸
                    const subMenuRect = signSubMenu.getBoundingClientRect();
                    
                    // 检查是否超出右边界
                    if (subMenuRect.right > screenWidth) {
                        left = rect.left - subMenuRect.width;
                    }
                    
                    // 检查是否超出下边界
                    if (subMenuRect.bottom > screenHeight) {
                        top = rect.top - subMenuRect.height;
                    }
                    
                    // 确保不小于0
                    left = Math.max(0, left);
                    top = Math.max(0, top);
                    
                    // 设置最终位置
                    signSubMenu.style.left = `${left}px`;
                    signSubMenu.style.top = `${top}px`;
                });

            // 隐藏举牌子菜单
            let signSubMenuTimeout;
            signItem.addEventListener('mouseleave', () => {
                signSubMenuTimeout = setTimeout(() => {
                    if (!signSubMenu.matches(':hover')) {
                        signSubMenu.style.display = 'none';
                    }
                }, 200);
            });

            // 鼠标进入子菜单时清除隐藏计时器
            signSubMenu.addEventListener('mouseenter', () => {
                clearTimeout(signSubMenuTimeout);
            });

            // 鼠标离开子菜单时隐藏
            signSubMenu.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    signSubMenu.style.display = 'none';
                }, 200);
            });

            // 添加文字举牌菜单项
            const textSignItem = document.createElement('div');
            textSignItem.className = 'context-menu-item';
            textSignItem.innerHTML = '文字举牌';
            textSignItem.addEventListener('click', () => {
                const text = prompt('请输入举牌文字:', '');
                if (text !== null) {
                    if (window.desktopPet) {
                        window.desktopPet.setSignContent({ text });
                    }
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                signSubMenu.style.display = 'none';
            });
            signSubMenu.appendChild(textSignItem);

            // 添加图片举牌菜单项
            const imageSignItem = document.createElement('div');
            imageSignItem.className = 'context-menu-item';
            imageSignItem.innerHTML = '图片举牌';
            imageSignItem.addEventListener('click', () => {
                // 创建隐藏的文件输入元素
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);

                // 监听文件选择
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            if (window.desktopPet) {
                                window.desktopPet.setSignContent({ image: event.target.result });
                            }
                            document.body.removeChild(fileInput);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        document.body.removeChild(fileInput);
                    }
                });

                // 触发文件选择对话框
                fileInput.click();

                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                signSubMenu.style.display = 'none';
            });
            signSubMenu.appendChild(imageSignItem);

            // 添加举牌大小子菜单
            const signSizeSubMenu = document.createElement('div');
            signSizeSubMenu.className = 'custom-context-menu submenu';
            signSizeSubMenu.style.position = 'absolute';
            signSizeSubMenu.style.display = 'none';
            document.body.appendChild(signSizeSubMenu);

            // 举牌大小菜单项
            const signSizeItem = document.createElement('div');
            signSizeItem.className = 'context-menu-item';
            signSizeItem.innerHTML = '举牌大小';
            signSubMenu.appendChild(signSizeItem);

            // 显示举牌大小子菜单
                signSizeItem.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();
                    const rect = signSizeItem.getBoundingClientRect();
                    
                    // 计算子菜单位置，确保不超出屏幕
                    let left = rect.right;
                    let top = rect.top;
                    
                    // 获取屏幕尺寸
                    const screenWidth = window.innerWidth;
                    const screenHeight = window.innerHeight;
                    
                    // 先显示子菜单以获取其尺寸
                    signSizeSubMenu.style.left = `${left}px`;
                    signSizeSubMenu.style.top = `${top}px`;
                    signSizeSubMenu.style.display = 'block';
                    
                    // 获取子菜单尺寸
                    const subMenuRect = signSizeSubMenu.getBoundingClientRect();
                    
                    // 检查是否超出右边界
                    if (subMenuRect.right > screenWidth) {
                        left = rect.left - subMenuRect.width;
                    }
                    
                    // 检查是否超出下边界
                    if (subMenuRect.bottom > screenHeight) {
                        top = rect.top - subMenuRect.height;
                    }
                    
                    // 确保不小于0
                    left = Math.max(0, left);
                    top = Math.max(0, top);
                    
                    // 设置最终位置
                    signSizeSubMenu.style.left = `${left}px`;
                    signSizeSubMenu.style.top = `${top}px`;
                });

            // 隐藏举牌大小子菜单
            let signSizeSubMenuTimeout;
            signSizeItem.addEventListener('mouseleave', () => {
                signSizeSubMenuTimeout = setTimeout(() => {
                    if (!signSizeSubMenu.matches(':hover')) {
                        signSizeSubMenu.style.display = 'none';
                    }
                }, 200);
            });

            // 鼠标进入子菜单时清除隐藏计时器
            signSizeSubMenu.addEventListener('mouseenter', () => {
                clearTimeout(signSizeSubMenuTimeout);
            });

            // 鼠标离开子菜单时隐藏
            signSizeSubMenu.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    signSizeSubMenu.style.display = 'none';
                }, 200);
            });

            // 小尺寸举牌
            const smallSignItem = document.createElement('div');
            smallSignItem.className = 'context-menu-item';
            smallSignItem.innerHTML = '小 (60x35)';
            smallSignItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateSignSize(60, 35);
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                signSubMenu.style.display = 'none';
                signSizeSubMenu.style.display = 'none';
            });
            signSizeSubMenu.appendChild(smallSignItem);

            // 中尺寸举牌 (默认)
            const mediumSignItem = document.createElement('div');
            mediumSignItem.className = 'context-menu-item';
            mediumSignItem.innerHTML = '中 (80x50)';
            mediumSignItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateSignSize(80, 50);
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                signSubMenu.style.display = 'none';
                signSizeSubMenu.style.display = 'none';
            });
            signSizeSubMenu.appendChild(mediumSignItem);

            // 大尺寸举牌
            const largeSignItem = document.createElement('div');
            largeSignItem.className = 'context-menu-item';
            largeSignItem.innerHTML = '大 (100x65)';
            largeSignItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.updateSignSize(100, 65);
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                signSubMenu.style.display = 'none';
                signSizeSubMenu.style.display = 'none';
            });
            signSizeSubMenu.appendChild(largeSignItem);

            // 添加分隔线
            const signDivider = document.createElement('div');
            signDivider.className = 'context-menu-divider';
            signSubMenu.appendChild(signDivider);

            // 添加隐藏举牌菜单项
            const hideSignItem = document.createElement('div');
            hideSignItem.className = 'context-menu-item';
            hideSignItem.innerHTML = '隐藏举牌';
            hideSignItem.addEventListener('click', () => {
                if (window.desktopPet) {
                    window.desktopPet.hideSign();
                }
                contextMenu.style.display = 'none';
                petSubMenu.style.display = 'none';
                signSubMenu.style.display = 'none';
            });
            signSubMenu.appendChild(hideSignItem);

            petSubMenu.appendChild(resetItem);
        }
    }, 1000);
}

// 当文档加载完成后初始化桌宠
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDesktopPet);
} else {
    initDesktopPet();
}