/**
 * TargetCursor - 自定义光标效果库
 * 
 * 用法:
 * import TargetCursor from './TargetCursor';
 * const customCursor = new TargetCursor({ spinDuration: 2, hideDefaultCursor: true });
 */

// 检查GSAP是否已加载
if (typeof gsap === 'undefined') {
    console.error('GSAP库未加载，请先引入GSAP库');
}

class TargetCursor {
    constructor(options = {}) {
        // 默认配置
        this.config = {
            targetSelector: '.cursor-target',
            spinDuration: 2,
            hideDefaultCursor: true,
            ...options
        };

        // DOM元素引用
        this.cursor = null;
        this.corners = null;
        this.dot = null;

        // 动画相关
        this.spinTimeline = null;
        this.activeTarget = null;
        this.currentTargetMove = null;
        this.currentLeaveHandler = null;
        this.isAnimatingToTarget = false;
        this.resumeTimeout = null;
        this.moveThrottle = null;
        this.originalCursor = null;

        // 常量配置
        this.constants = {
            borderWidth: 3,
            cornerSize: 12,
            parallaxStrength: 0.00005
        };

        // 初始化
        this.init();
    }

    init() {
        // 创建DOM元素
        this.createDOM();

        // 保存原始光标样式
        this.originalCursor = document.body.style.cursor;
        if (this.config.hideDefaultCursor) {
            document.body.style.cursor = 'none';
        }

        // 设置初始位置
        gsap.set(this.cursor, {
            xPercent: -50,
            yPercent: -50,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        });

        // 创建旋转动画
        this.createSpinTimeline();

        // 添加事件监听器
        this.addEventListeners();
    }

    createDOM() {
        // 创建光标包装器
        this.cursor = document.createElement('div');
        this.cursor.className = 'target-cursor-wrapper';

        // 创建中心点
        this.dot = document.createElement('div');
        this.dot.className = 'target-cursor-dot';
        this.cursor.appendChild(this.dot);

        // 创建四个角
        const cornerClasses = ['corner-tl', 'corner-tr', 'corner-br', 'corner-bl'];
        cornerClasses.forEach(cls => {
            const corner = document.createElement('div');
            corner.className = `target-cursor-corner ${cls}`;
            this.cursor.appendChild(corner);
        });

        // 保存角元素引用
        this.corners = this.cursor.querySelectorAll('.target-cursor-corner');

        // 添加到文档中
        document.body.appendChild(this.cursor);
    }

    createSpinTimeline() {
        if (this.spinTimeline) {
            this.spinTimeline.kill();
        }
        this.spinTimeline = gsap
            .timeline({ repeat: -1 })
            .to(this.cursor, { rotation: '+=360', duration: this.config.spinDuration, ease: 'none' });
    }

    moveCursor(x, y) {
        if (!this.cursor) return;
        gsap.to(this.cursor, {
            x,
            y,
            duration: 0.1,
            ease: 'power3.out'
        });
    }

    cleanupTarget(target) {
        if (this.currentTargetMove) {
            target.removeEventListener('mousemove', this.currentTargetMove);
        }
        if (this.currentLeaveHandler) {
            target.removeEventListener('mouseleave', this.currentLeaveHandler);
        }
        this.currentTargetMove = null;
        this.currentLeaveHandler = null;
    }

    updateCorners(mouseX, mouseY) {
        if (!this.activeTarget || !this.cursor || !this.corners) return;

        const rect = this.activeTarget.getBoundingClientRect();
        const cursorRect = this.cursor.getBoundingClientRect();

        const cursorCenterX = cursorRect.left + cursorRect.width / 2;
        const cursorCenterY = cursorRect.top + cursorRect.height / 2;

        const [tlc, trc, brc, blc] = Array.from(this.corners);

        const { borderWidth, cornerSize, parallaxStrength } = this.constants;

        let tlOffset = {
            x: rect.left - cursorCenterX - borderWidth,
            y: rect.top - cursorCenterY - borderWidth
        };
        let trOffset = {
            x: rect.right - cursorCenterX + borderWidth - cornerSize,
            y: rect.top - cursorCenterY - borderWidth
        };
        let brOffset = {
            x: rect.right - cursorCenterX + borderWidth - cornerSize,
            y: rect.bottom - cursorCenterY + borderWidth - cornerSize
        };
        let blOffset = {
            x: rect.left - cursorCenterX - borderWidth,
            y: rect.bottom - cursorCenterY + borderWidth - cornerSize
        };

        if (mouseX !== undefined && mouseY !== undefined) {
            const targetCenterX = rect.left + rect.width / 2;
            const targetCenterY = rect.top + rect.height / 2;
            const mouseOffsetX = (mouseX - targetCenterX) * parallaxStrength;
            const mouseOffsetY = (mouseY - targetCenterY) * parallaxStrength;

            tlOffset.x += mouseOffsetX;
            tlOffset.y += mouseOffsetY;
            trOffset.x += mouseOffsetX;
            trOffset.y += mouseOffsetY;
            brOffset.x += mouseOffsetX;
            brOffset.y += mouseOffsetY;
            blOffset.x += mouseOffsetX;
            blOffset.y += mouseOffsetY;
        }

        const tl = gsap.timeline();
        const corners = [tlc, trc, brc, blc];
        const offsets = [tlOffset, trOffset, brOffset, blOffset];

        corners.forEach((corner, index) => {
            tl.to(
                corner,
                {
                    x: offsets[index].x,
                    y: offsets[index].y,
                    duration: 0.2,
                    ease: 'power2.out'
                },
                0
            );
        });
    }

    addEventListeners() {
        // 鼠标移动事件
        const moveHandler = e => this.moveCursor(e.clientX, e.clientY);
        window.addEventListener('mousemove', moveHandler);

        // 鼠标按下事件 - 缩小效果
        const mouseDownHandler = () => {
            if (!this.dot || !this.cursor) return;
            gsap.to(this.dot, { scale: 0.7, duration: 0.3 });
            gsap.to(this.cursor, { scale: 0.9, duration: 0.2 });
        };
        window.addEventListener('mousedown', mouseDownHandler);

        // 鼠标释放事件 - 恢复原始大小
        const mouseUpHandler = () => {
            if (!this.dot || !this.cursor) return;
            gsap.to(this.dot, { scale: 1, duration: 0.3 });
            gsap.to(this.cursor, { scale: 1, duration: 0.2 });
        };
        window.addEventListener('mouseup', mouseUpHandler);

        // 鼠标悬停事件 - 跟踪目标元素
        const enterHandler = e => {
            const directTarget = e.target;

            const allTargets = [];
            let current = directTarget;
            while (current && current !== document.body) {
                if (current.matches(this.config.targetSelector)) {
                    allTargets.push(current);
                }
                current = current.parentElement;
            }

            const target = allTargets[0] || null;
            if (!target || !this.cursor || !this.corners) return;

            if (this.activeTarget === target) return;

            if (this.activeTarget) {
                this.cleanupTarget(this.activeTarget);
            }

            if (this.resumeTimeout) {
                clearTimeout(this.resumeTimeout);
                this.resumeTimeout = null;
            }

            this.activeTarget = target;
            Array.from(this.corners).forEach(corner => {
                gsap.killTweensOf(corner);
            });

            gsap.killTweensOf(this.cursor, 'rotation');
            this.spinTimeline?.pause();

            gsap.set(this.cursor, { rotation: 0 });

            this.isAnimatingToTarget = true;
            this.updateCorners();

            setTimeout(() => {
                this.isAnimatingToTarget = false;
            }, 1);

            const targetMove = ev => {
                if (this.moveThrottle || this.isAnimatingToTarget) return;
                this.moveThrottle = requestAnimationFrame(() => {
                    this.updateCorners(ev.clientX, ev.clientY);
                    this.moveThrottle = null;
                });
            };

            const leaveHandler = () => {
                this.activeTarget = null;
                this.isAnimatingToTarget = false;

                if (this.corners) {
                    const corners = Array.from(this.corners);
                    gsap.killTweensOf(corners);

                    const { cornerSize } = this.constants;
                    const positions = [
                        { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
                        { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
                        { x: cornerSize * 0.5, y: cornerSize * 0.5 },
                        { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
                    ];

                    const tl = gsap.timeline();
                    corners.forEach((corner, index) => {
                        tl.to(
                            corner,
                            {
                                x: positions[index].x,
                                y: positions[index].y,
                                duration: 0.3,
                                ease: 'power3.out'
                            },
                            0
                        );
                    });
                }

                this.resumeTimeout = setTimeout(() => {
                    if (!this.activeTarget && this.cursor && this.spinTimeline) {
                        const currentRotation = gsap.getProperty(this.cursor, 'rotation');
                        const normalizedRotation = currentRotation % 360;

                        this.spinTimeline.kill();
                        this.spinTimeline = gsap
                            .timeline({ repeat: -1 })
                            .to(this.cursor, { rotation: '+=360', duration: this.config.spinDuration, ease: 'none' });

                        gsap.to(this.cursor, {
                            rotation: normalizedRotation + 360,
                            duration: this.config.spinDuration * (1 - normalizedRotation / 360),
                            ease: 'none',
                            onComplete: () => {
                                this.spinTimeline?.restart();
                            }
                        });
                    }
                    this.resumeTimeout = null;
                }, 50);

                this.cleanupTarget(target);
            };

            this.currentTargetMove = targetMove;
            this.currentLeaveHandler = leaveHandler;

            target.addEventListener('mousemove', targetMove);
            target.addEventListener('mouseleave', leaveHandler);
        };

        window.addEventListener('mouseover', enterHandler, { passive: true });

        // 滚动事件
        const scrollHandler = () => {
            if (!this.activeTarget || !this.cursor) return;

            const mouseX = gsap.getProperty(this.cursor, 'x');
            const mouseY = gsap.getProperty(this.cursor, 'y');

            const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
            const isStillOverTarget = 
                elementUnderMouse && 
                (elementUnderMouse === this.activeTarget || elementUnderMouse.closest(this.config.targetSelector) === this.activeTarget);

            if (!isStillOverTarget && this.currentLeaveHandler) {
                this.currentLeaveHandler();
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });

        // 保存事件处理程序，便于后续清理
        this.eventHandlers = {
            moveHandler,
            mouseDownHandler,
            mouseUpHandler,
            enterHandler,
            scrollHandler
        };
    }

    // 更新旋转持续时间
    updateSpinDuration(duration) {
        if (typeof duration === 'number' && duration > 0) {
            this.config.spinDuration = duration;
            if (this.spinTimeline && this.spinTimeline.isActive()) {
                this.spinTimeline.kill();
                this.createSpinTimeline();
            }
        }
    }

    // 销毁光标实例，清理资源
    destroy() {
        if (!this.cursor) return;

        // 移除事件监听器
        if (this.eventHandlers) {
            window.removeEventListener('mousemove', this.eventHandlers.moveHandler);
            window.removeEventListener('mousedown', this.eventHandlers.mouseDownHandler);
            window.removeEventListener('mouseup', this.eventHandlers.mouseUpHandler);
            window.removeEventListener('mouseover', this.eventHandlers.enterHandler);
            window.removeEventListener('scroll', this.eventHandlers.scrollHandler);
        }

        // 清理活跃目标
        if (this.activeTarget) {
            this.cleanupTarget(this.activeTarget);
        }

        // 清理动画
        if (this.spinTimeline) {
            this.spinTimeline.kill();
        }
        if (this.resumeTimeout) {
            clearTimeout(this.resumeTimeout);
        }
        if (this.moveThrottle) {
            cancelAnimationFrame(this.moveThrottle);
        }

        // 恢复原始光标样式
        document.body.style.cursor = this.originalCursor;

        // 移除DOM元素
        if (this.cursor && this.cursor.parentNode === document.body) {
            document.body.removeChild(this.cursor);
        }

        // 重置状态
        this.cursor = null;
        this.corners = null;
        this.dot = null;
        this.spinTimeline = null;
        this.activeTarget = null;
        this.eventHandlers = null;

        console.log('TargetCursor instance destroyed');
    }
}

// 导出模块
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = TargetCursor;
} else if (typeof window !== 'undefined') {
    window.TargetCursor = TargetCursor;
}

// ES模块导出
if (typeof define === 'function' && define.amd) {
    define([], function() { return TargetCursor; });
}

// 确保全局可用
if (typeof window !== 'undefined') {
    window.TargetCursor = TargetCursor;
}