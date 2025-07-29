// 虚拟键盘类
class VirtualKeyboard {
    constructor(koreanInput) {
        this.koreanInput = koreanInput;
        this.isShiftMode = false;
        this.activeKey = null;
        this.highlightTimeout = null;
        
        // 键盘布局（QWERTY字母区域）
        this.keyboardLayout = [
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['z', 'x', 'c', 'v', 'b', 'n', 'm']
        ];
        
        this.init();
    }

    init() {
        this.createKeyboard();
        this.setupEventListeners();
    }

    // 创建键盘布局
    createKeyboard() {
        const keyboardContainer = document.getElementById('virtualKeyboard');
        keyboardContainer.innerHTML = '';

        this.keyboardLayout.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyElement = document.createElement('div');
                keyElement.className = 'keyboard-key';
                keyElement.setAttribute('data-key', key);
                
                // 创建键帽内容
                const keyContent = document.createElement('div');
                keyContent.className = 'key-content';
                
                // 英文字母（上方）
                const englishChar = document.createElement('div');
                englishChar.className = 'english-char';
                englishChar.textContent = key.toUpperCase();
                
                // 韩文字母（下方）
                const koreanChar = document.createElement('div');
                koreanChar.className = 'korean-char';
                koreanChar.textContent = this.getKoreanChar(key, this.isShiftMode);
                
                keyContent.appendChild(englishChar);
                keyContent.appendChild(koreanChar);
                keyElement.appendChild(keyContent);
                
                // 添加点击事件
                keyElement.addEventListener('click', () => {
                    this.simulateKeyPress(key);
                });
                
                rowElement.appendChild(keyElement);
            });
            
            keyboardContainer.appendChild(rowElement);
        });
    }

    // 获取韩文字符
    getKoreanChar(key, isShift) {
        const char = this.koreanInput.getCharacter(key, isShift);
        return char || '';
    }

    // 设置事件监听器
    setupEventListeners() {
        // Shift切换
        const shiftToggle = document.getElementById('shiftToggle');
        if (shiftToggle) {
            shiftToggle.addEventListener('change', (e) => {
                this.isShiftMode = e.target.checked;
                this.updateKeyboardDisplay();
                this.updateShiftState();
            });
        }

        // 监听键盘事件
        document.addEventListener('keydown', (e) => {
            // 特殊处理Shift键
            if (e.key === 'Shift') {
                this.handleShiftPress(true);
            }
            this.highlightKey(e.key.toLowerCase(), e.shiftKey);
        });

        document.addEventListener('keyup', (e) => {
            // 特殊处理Shift键松开
            if (e.key === 'Shift') {
                this.handleShiftPress(false);
            }
            this.removeKeyHighlight();
        });
    }

    // 处理Shift键按下/松开
    handleShiftPress(isPressed) {
        const shiftToggle = document.getElementById('shiftToggle');
        if (shiftToggle && shiftToggle.checked !== isPressed) {
            shiftToggle.checked = isPressed;
            this.isShiftMode = isPressed;
            this.updateKeyboardDisplay();
            this.updateShiftState();
        }
    }

    // 更新键盘显示
    updateKeyboardDisplay() {
        const keys = document.querySelectorAll('.keyboard-key');
        keys.forEach(keyElement => {
            const key = keyElement.getAttribute('data-key');
            const koreanChar = keyElement.querySelector('.korean-char');
            if (koreanChar) {
                koreanChar.textContent = this.getKoreanChar(key, this.isShiftMode);
            }
        });
    }

    // 更新Shift状态视觉效果
    updateShiftState() {
        const keyboard = document.getElementById('virtualKeyboard');
        if (this.isShiftMode) {
            keyboard.classList.add('shift-mode');
        } else {
            keyboard.classList.remove('shift-mode');
        }
    }

    // 高亮按键
    highlightKey(key, isShift) {
        // 移除之前的高亮
        this.removeKeyHighlight();
        
        // 更新Shift状态
        const shiftToggle = document.getElementById('shiftToggle');
        if (shiftToggle && shiftToggle.checked !== isShift) {
            shiftToggle.checked = isShift;
            this.isShiftMode = isShift;
            this.updateKeyboardDisplay();
            this.updateShiftState();
        }
        
        // 高亮对应的键
        const keyElement = document.querySelector(`[data-key="${key}"]`);
        if (keyElement) {
            keyElement.classList.add('key-active');
            this.activeKey = keyElement;
            
            // 设置高亮移除定时器
            if (this.highlightTimeout) {
                clearTimeout(this.highlightTimeout);
            }
            this.highlightTimeout = setTimeout(() => {
                this.removeKeyHighlight();
            }, 200);
        }
    }

    // 移除键盘高亮
    removeKeyHighlight() {
        if (this.activeKey) {
            this.activeKey.classList.remove('key-active');
            this.activeKey = null;
        }
        if (this.highlightTimeout) {
            clearTimeout(this.highlightTimeout);
            this.highlightTimeout = null;
        }
    }

    // 模拟按键
    simulateKeyPress(key) {
        // 创建模拟键盘事件
        const event = new KeyboardEvent('keydown', {
            key: key,
            shiftKey: this.isShiftMode,
            bubbles: true
        });
        
        // 高亮按键
        this.highlightKey(key, this.isShiftMode);
        
        // 触发输入框的键盘事件
        const textarea = document.getElementById('koreanInput');
        if (textarea) {
            textarea.dispatchEvent(event);
            textarea.focus();
        }
    }

    // 重置键盘状态
    reset() {
        this.isShiftMode = false;
        const shiftToggle = document.getElementById('shiftToggle');
        if (shiftToggle) {
            shiftToggle.checked = false;
        }
        this.updateKeyboardDisplay();
        this.updateShiftState();
        this.removeKeyHighlight();
    }
}

// 语言切换器管理
class LanguageSwitcher {
    constructor() {
        this.init();
    }

    init() {
        this.createLanguageButtons();
        this.updateActiveLanguage();
    }

    // 创建语言切换按钮
    createLanguageButtons() {
        const container = document.getElementById('languageButtons');
        if (!container) return;

        container.innerHTML = '';
        
        const languages = window.languageManager.getSupportedLanguages();
        languages.forEach(lang => {
            const button = document.createElement('button');
            button.className = 'language-btn';
            button.setAttribute('data-lang', lang.code);
            button.innerHTML = `${lang.flag} ${lang.name}`;
            button.title = lang.name;
            
            button.addEventListener('click', () => {
                this.switchLanguage(lang.code);
            });
            
            container.appendChild(button);
        });
    }

    // 切换语言
    switchLanguage(languageCode) {
        window.languageManager.setLanguage(languageCode);
        this.updateActiveLanguage();
        
        // 更新键盘显示
        if (window.virtualKeyboard) {
            window.virtualKeyboard.updateKeyboardDisplay();
        }
    }

    // 更新激活的语言按钮
    updateActiveLanguage() {
        const buttons = document.querySelectorAll('.language-btn');
        const currentLang = window.languageManager.getCurrentLanguage();
        
        buttons.forEach(btn => {
            if (btn.getAttribute('data-lang') === currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// 全局变量，供其他模块使用
window.VirtualKeyboard = VirtualKeyboard;
window.LanguageSwitcher = LanguageSwitcher;