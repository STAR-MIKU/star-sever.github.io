class SimpleSplitText {
  constructor(element, options = {}) {
    this.element = element;
    this.options = { ...SimpleSplitText.defaults, ...options };
    this.animationCompleted = false;
    this.init();
  }

  static defaults = {
    splitType: 'chars',
    delay: 50,
    duration: 0.6,
    ease: 'power3.out',
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    onComplete: null
  };

  init() {
    // 确保GSAP已加载
    if (!window.gsap) {
      console.error('GSAP is required for SimpleSplitText');
      return;
    }

    // 检查字体是否已加载
    const checkFontsLoaded = () => {
      if (document.fonts && document.fonts.status !== 'loaded') {
        document.fonts.ready.then(() => this.splitText());
      } else {
        this.splitText();
      }
    };

    checkFontsLoaded();
  }

  splitText() {
    // 保存原始内容
    this.originalContent = this.element.textContent;
    this.element.textContent = '';

    // 根据splitType拆分文本
    let targets = [];
    if (this.options.splitType.includes('chars')) {
      // 按字符拆分
      const chars = this.originalContent.split('');
      chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'split-char';
        span.textContent = char === ' ' ? '\u00A0' : char; // 替换空格为非换行空格
        span.style.display = 'inline-block';
        this.element.appendChild(span);
        targets.push(span);
      });
    } else if (this.options.splitType.includes('words')) {
      // 按单词拆分
      const words = this.originalContent.split(/\s+/);
      words.forEach((word, index) => {
        if (index > 0) {
          const space = document.createElement('span');
          space.textContent = ' ';
          this.element.appendChild(space);
        }
        const span = document.createElement('span');
        span.className = 'split-word';
        span.textContent = word;
        span.style.display = 'inline-block';
        this.element.appendChild(span);
        targets.push(span);
      });
    } else {
      // 默认按字符拆分
      const chars = this.originalContent.split('');
      chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'split-char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        this.element.appendChild(span);
        targets.push(span);
      });
    }

    // 应用初始状态
    window.gsap.set(targets, this.options.from);

    // 创建动画
    this.animation = window.gsap.to(targets, {
      ...this.options.to,
      duration: this.options.duration,
      ease: this.options.ease,
      stagger: this.options.delay / 1000,
      onComplete: () => {
        this.animationCompleted = true;
        if (typeof this.options.onComplete === 'function') {
          this.options.onComplete();
        }
      },
      willChange: 'transform, opacity',
      force3D: true
    });
  }

  // 恢复原始内容
  revert() {
    this.element.textContent = this.originalContent;
  }

  // 重新启动动画
  restart() {
    this.revert();
    this.splitText();
  }
}

// 导出到全局作用域
window.SimpleSplitText = SimpleSplitText;