// 键盘状态检测工具类
class KeyboardStateDetector {
    constructor() {
        this.initialViewportHeight = window.innerHeight;
        this.currentViewportHeight = window.innerHeight;
        this.isKeyboardVisible = false;
        this.callbacks = [];
        
        // 监听视口高度变化（通常表示键盘弹出/收起）
        window.addEventListener('resize', () => {
            this.checkKeyboardState();
        });
        
        // 监听视觉视口变化（更精确的键盘检测）
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                this.checkKeyboardState();
            });
        }
    }
    
    checkKeyboardState() {
        const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const heightDifference = this.initialViewportHeight - currentHeight;
        
        // 如果高度减少超过150px，认为键盘弹出
        const wasKeyboardVisible = this.isKeyboardVisible;
        this.isKeyboardVisible = heightDifference > 150;
        
        if (wasKeyboardVisible !== this.isKeyboardVisible) {
            this.notifyCallbacks(this.isKeyboardVisible);
        }
        
        this.currentViewportHeight = currentHeight;
    }
    
    onKeyboardToggle(callback) {
        this.callbacks.push(callback);
    }
    
    notifyCallbacks(isVisible) {
        this.callbacks.forEach(callback => callback(isVisible));
    }
    
    getKeyboardState() {
        return this.isKeyboardVisible;
    }
}

// 设备检测工具类
class DeviceDetector {
    static isMobile() {
        // 检测用户代理字符串
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
        
        // 检测触控支持
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
        
        // 检测屏幕尺寸和像素密度
        const isSmallScreen = window.innerWidth < 768;
        const isHighDensity = window.devicePixelRatio > 1;
        
        // 检测方向支持
        const hasOrientation = typeof window.orientation !== 'undefined';
        
        // 检测移动端特有API
        const hasMobileFeatures = 'ondevicemotion' in window || 'ondeviceorientation' in window;
        
        // 综合判断
        const isUserAgentMobile = mobileRegex.test(userAgent);
        const isTouchSmallScreen = hasTouch && isSmallScreen;
        const hasMobileCharacteristics = hasOrientation || hasMobileFeatures;
        
        return isUserAgentMobile || isTouchSmallScreen || hasMobileCharacteristics;
    }
    
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }
    
    static isDesktop() {
        return !this.isMobile();
    }
    
    static getDeviceInfo() {
        return {
            isMobile: this.isMobile(),
            isTouch: this.isTouchDevice(),
            userAgent: navigator.userAgent,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio,
            hasOrientation: typeof window.orientation !== 'undefined'
        };
    }
    
    // 检测是否为问题浏览器（容易触发键盘的浏览器）
    static isProblemBrowser() {
        const userAgent = navigator.userAgent.toLowerCase();
        // iOS Safari, Chrome移动版等容易意外触发键盘
        return userAgent.includes('safari/') && userAgent.includes('mobile/') ||
               userAgent.includes('chrome') && this.isMobile() ||
               userAgent.includes('samsung');
    }
}

// 虚拟键盘类
class VirtualKeyboard {
    constructor(koreanInput) {
        this.koreanInput = koreanInput;
        this.isShiftMode = false;
        this.activeKey = null;
        this.highlightTimeout = null;
        this.isMobileDevice = DeviceDetector.isMobile();
        this.isProblemBrowser = DeviceDetector.isProblemBrowser();
        this.inputSource = 'keyboard'; // 'keyboard' | 'virtual' | 'touch' | 'direct'
        this.virtualCursorPosition = 0; // 虚拟光标位置
        this.isVirtualKeyboardMode = false; // 虚拟键盘模式标志
        
        // 初始化键盘状态检测器
        if (this.isMobileDevice) {
            this.keyboardDetector = new KeyboardStateDetector();
            this.keyboardDetector.onKeyboardToggle((isVisible) => {
                this.handleSystemKeyboardToggle(isVisible);
            });
        }
        
        // 键盘布局（QWERTY字母区域 + 功能键）
        this.keyboardLayout = [
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
        ];
        
        // 功能键行
        this.functionKeysLayout = ['arrowleft', 'space', 'arrowright'];
        
        this.init();
    }

    init() {
        this.createKeyboard();
        this.setupEventListeners();
        
        // 移动端调试信息
        if (this.isMobileDevice) {
            console.log('移动设备检测结果:', DeviceDetector.getDeviceInfo());
            console.log('问题浏览器检测:', this.isProblemBrowser);
        }
    }

    // 创建键盘布局
    createKeyboard() {
        const keyboardContainer = document.getElementById('virtualKeyboard');
        keyboardContainer.innerHTML = '';
        
        // 创建键盘包装器
        const keyboardWrapper = document.createElement('div');
        keyboardWrapper.className = 'keyboard-wrapper';
        
        // 创建字母键区域
        this.keyboardLayout.forEach((row, rowIndex) => {
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';
            
            // 如果是第三行（Z行），在开头添加Shift控制
            if (rowIndex === 2) {
                const shiftControl = this.createShiftControl();
                rowElement.appendChild(shiftControl);
            }
            
            row.forEach(key => {
                const keyElement = this.createKeyElement(key);
                rowElement.appendChild(keyElement);
            });
            
            keyboardWrapper.appendChild(rowElement);
        });
        
        // 创建功能键行
        const functionRowElement = document.createElement('div');
        functionRowElement.className = 'keyboard-row function-row';
        
        this.functionKeysLayout.forEach(key => {
            const keyElement = this.createKeyElement(key);
            functionRowElement.appendChild(keyElement);
        });
        
        keyboardWrapper.appendChild(functionRowElement);
        
        // 创建右下角标题
        const keyboardTitle = document.createElement('div');
        keyboardTitle.className = 'embedded-keyboard-title';
        keyboardTitle.textContent = window.languageManager ? window.languageManager.getText('virtualKeyboardTitle') : 'Virtual Keyboard';
        
        // 将元素添加到容器
        keyboardContainer.appendChild(keyboardWrapper);
        keyboardContainer.appendChild(keyboardTitle);
    }
    
    // 创建Shift控制
    createShiftControl() {
        const shiftWrapper = document.createElement('div');
        shiftWrapper.className = 'embedded-shift-control';
        
        const shiftLabel = document.createElement('label');
        shiftLabel.className = 'shift-toggle';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'shiftToggle';
        
        const labelText = document.createElement('span');
        labelText.className = 'shift-label';
        labelText.textContent = window.languageManager ? window.languageManager.getText('shiftLabel') : 'Shift';
        
        shiftLabel.appendChild(checkbox);
        shiftLabel.appendChild(labelText);
        shiftWrapper.appendChild(shiftLabel);
        
        return shiftWrapper;
    }
    
    // 创建单个按键元素
    createKeyElement(key) {
        const keyElement = document.createElement('div');
        keyElement.className = this.getKeyClassName(key);
        keyElement.setAttribute('data-key', key);
        
        // 创建键帽内容
        const keyContent = document.createElement('div');
        keyContent.className = 'key-content';
        
        if (this.isFunctionKey(key)) {
            // 功能键内容
            keyContent.appendChild(this.createFunctionKeyContent(key));
        } else {
            // 普通字母键内容
            const englishChar = document.createElement('div');
            englishChar.className = 'english-char';
            englishChar.textContent = key.toUpperCase();
            
            const koreanChar = document.createElement('div');
            koreanChar.className = 'korean-char';
            koreanChar.textContent = this.getKoreanChar(key, this.isShiftMode);
            
            keyContent.appendChild(englishChar);
            keyContent.appendChild(koreanChar);
        }
        
        keyElement.appendChild(keyContent);
        
        // 添加点击事件
        keyElement.addEventListener('click', () => {
            this.handleKeyPress(key);
        });
        
        return keyElement;
    }
    
    // 获取按键的CSS类名
    getKeyClassName(key) {
        let className = 'keyboard-key';
        
        if (this.isFunctionKey(key)) {
            className += ' function-key';
            
            if (key === 'space') {
                className += ' space-key';
            } else if (key === 'backspace') {
                className += ' backspace-key';
            } else if (key.startsWith('arrow')) {
                className += ' arrow-key';
            }
        }
        
        return className;
    }
    
    // 判断是否为功能键
    isFunctionKey(key) {
        return ['backspace', 'arrowleft', 'arrowright', 'space'].includes(key);
    }
    
    // 创建功能键内容
    createFunctionKeyContent(key) {
        const content = document.createElement('div');
        content.className = 'function-key-content';
        
        switch (key) {
            case 'backspace':
                content.innerHTML = '⌫';
                content.title = '删除';
                break;
            case 'arrowleft':
                content.innerHTML = '←';
                content.title = '左移光标';
                break;
            case 'arrowright':
                content.innerHTML = '→';
                content.title = '右移光标';
                break;
            case 'space':
                content.innerHTML = window.languageManager ? window.languageManager.getText('spaceKeyLabel') : '空格';
                content.title = window.languageManager ? window.languageManager.getText('spaceKeyLabel') : '空格';
                break;
        }
        
        return content;
    }
    
    // 处理按键（统一入口）
    handleKeyPress(key) {
        if (this.isFunctionKey(key)) {
            this.handleFunctionKey(key);
        } else {
            this.simulateKeyPress(key);
        }
    }
    
    // 处理功能键
    handleFunctionKey(key) {
        this.inputSource = 'virtual';
        this.isVirtualKeyboardMode = true;
        
        // 高亮按键
        this.highlightKey(key, false);
        
        const textarea = document.getElementById('koreanInput');
        if (!textarea) return;
        
        if (this.isMobileDevice) {
            // 移动端：使用安全的处理方式
            this.handleMobileFunctionKey(key, textarea);
        } else {
            // 桌面端：直接处理
            this.handleDesktopFunctionKey(key, textarea);
        }
        
        // 重置输入源标识
        setTimeout(() => {
            this.inputSource = 'keyboard';
            this.isVirtualKeyboardMode = false;
        }, 200);
    }
    
    // 移动端功能键处理
    handleMobileFunctionKey(key, textarea) {
        const wasReadonly = textarea.readOnly;
        textarea.readOnly = true;
        
        try {
            switch (key) {
                case 'backspace':
                    this.handleBackspaceKey(textarea);
                    break;
                case 'arrowleft':
                    this.handleArrowLeftKey();
                    break;
                case 'arrowright':
                    this.handleArrowRightKey();
                    break;
                case 'space':
                    this.handleSpaceKey(textarea);
                    break;
            }
        } finally {
            setTimeout(() => {
                textarea.readOnly = wasReadonly;
            }, 50);
        }
        
        // 更新光标显示
        this.updateVirtualCursorDisplay();
    }
    
    // 桌面端功能键处理
    handleDesktopFunctionKey(key, textarea) {
        switch (key) {
            case 'backspace':
                // 桌面端可以直接触发键盘事件
                const backspaceEvent = new KeyboardEvent('keydown', {
                    key: 'Backspace',
                    bubbles: true
                });
                textarea.dispatchEvent(backspaceEvent);
                break;
            case 'arrowleft':
                this.handleArrowLeftKey();
                // 同步到真实光标
                textarea.setSelectionRange(this.virtualCursorPosition, this.virtualCursorPosition);
                break;
            case 'arrowright':
                this.handleArrowRightKey();
                // 同步到真实光标
                textarea.setSelectionRange(this.virtualCursorPosition, this.virtualCursorPosition);
                break;
            case 'space':
                this.handleSpaceKey(textarea);
                break;
        }
    }
    
    // 处理退格键
    handleBackspaceKey(textarea) {
        if (this.virtualCursorPosition > 0) {
            const currentText = textarea.value;
            
            // 使用韩文智能退格逻辑
            const newText = this.koreanInput.handleBackspace(currentText.substring(0, this.virtualCursorPosition)) + 
                           currentText.substring(this.virtualCursorPosition);
            
            // 计算新的光标位置
            const deletedLength = currentText.length - newText.length;
            this.virtualCursorPosition = Math.max(0, this.virtualCursorPosition - deletedLength);
            
            // 更新文本
            textarea.value = newText;
            
            // 基于虚拟光标位置智能恢复韩文输入状态
            if (this.virtualCursorPosition > 0) {
                const charBeforeCursor = newText[this.virtualCursorPosition - 1];
                this.koreanInput.restoreStateFromCharacter(charBeforeCursor);
            } else {
                this.koreanInput.reset();
            }
        }
    }
    
    // 处理左箭头键
    handleArrowLeftKey() {
        if (this.virtualCursorPosition > 0) {
            this.virtualCursorPosition--;
        }
    }
    
    // 处理右箭头键
    handleArrowRightKey() {
        const textarea = document.getElementById('koreanInput');
        if (textarea && this.virtualCursorPosition < textarea.value.length) {
            this.virtualCursorPosition++;
        }
    }
    
    // 处理空格键
    handleSpaceKey(textarea) {
        const currentText = textarea.value;
        const textBefore = currentText.substring(0, this.virtualCursorPosition);
        const textAfter = currentText.substring(this.virtualCursorPosition);
        
        // 插入空格
        const newText = textBefore + ' ' + textAfter;
        textarea.value = newText;
        this.virtualCursorPosition++;
        
        // 重置韩文输入状态
        this.koreanInput.reset();
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
        // 更新普通字母键的韩文字符
        const keys = document.querySelectorAll('.keyboard-key:not(.function-key)');
        keys.forEach(keyElement => {
            const key = keyElement.getAttribute('data-key');
            if (key && !this.isFunctionKey(key)) {
                const koreanChar = keyElement.querySelector('.korean-char');
                if (koreanChar) {
                    koreanChar.textContent = this.getKoreanChar(key, this.isShiftMode);
                }
            }
        });
        
        // 更新功能键的多语言文字
        this.updateFunctionKeysText();
    }
    
    // 更新功能键的多语言文字
    updateFunctionKeysText() {
        const functionKeys = document.querySelectorAll('.keyboard-key.function-key');
        functionKeys.forEach(keyElement => {
            const key = keyElement.getAttribute('data-key');
            const functionContent = keyElement.querySelector('.function-key-content');
            if (key && functionContent) {
                this.updateFunctionKeyContent(key, functionContent);
            }
        });
    }
    
    // 更新单个功能键的内容
    updateFunctionKeyContent(key, content) {
        switch (key) {
            case 'backspace':
                content.innerHTML = '⌫';
                content.title = '删除';
                break;
            case 'arrowleft':
                content.innerHTML = '←';
                content.title = '左移光标';
                break;
            case 'arrowright':
                content.innerHTML = '→';
                content.title = '右移光标';
                break;
            case 'space':
                const spaceLabel = window.languageManager ? window.languageManager.getText('spaceKeyLabel') : '空格';
                content.innerHTML = spaceLabel;
                content.title = spaceLabel;
                break;
        }
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
            
            // 添加触觉反馈（移动设备）
            this.provideTactileFeedback();
            
            // 设置高亮移除定时器
            if (this.highlightTimeout) {
                clearTimeout(this.highlightTimeout);
            }
            this.highlightTimeout = setTimeout(() => {
                this.removeKeyHighlight();
            }, 200);
        }
    }
    
    // 提供触觉反馈
    provideTactileFeedback() {
        if (this.isMobileDevice && 'vibrate' in navigator) {
            // 轻微振动反馈
            navigator.vibrate(10);
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
        this.inputSource = 'virtual';
        this.isVirtualKeyboardMode = true;
        
        // 高亮按键
        this.highlightKey(key, this.isShiftMode);
        
        const textarea = document.getElementById('koreanInput');
        if (!textarea) return;
        
        if (this.isMobileDevice) {
            // 移动端：使用完全无焦点输入模式
            this.handleMobileVirtualInputSafe(key, textarea);
        } else {
            // 桌面端：保持原有行为
            const event = new KeyboardEvent('keydown', {
                key: key,
                shiftKey: this.isShiftMode,
                bubbles: true
            });
            textarea.dispatchEvent(event);
            textarea.focus();
        }
        
        // 重置输入源标识
        setTimeout(() => {
            this.inputSource = 'keyboard';
            this.isVirtualKeyboardMode = false;
        }, 200);
    }
    
    // 安全的移动端虚拟键盘输入（完全避免焦点）
    handleMobileVirtualInputSafe(key, textarea) {
        // 确保textarea处于只读状态，防止意外焦点
        const wasReadonly = textarea.readOnly;
        textarea.readOnly = true;
        
        // 更新键盘状态指示器
        this.updateKeyboardStateIndicator(false);
        
        try {
            // 获取当前文本，使用虚拟光标位置而非真实光标位置
            const currentText = textarea.value;
            this.virtualCursorPosition = Math.min(this.virtualCursorPosition, currentText.length);
            
            // 使用KoreanInput的程序化处理方法
            const result = this.koreanInput.processInputProgrammatically(
                key, 
                this.isShiftMode, 
                currentText, 
                this.virtualCursorPosition
            );
            
            if (!result) return;
            
            // 更新文本内容（避免任何可能触发焦点的操作）
            textarea.value = result.text;
            
            // 更新虚拟光标位置
            this.virtualCursorPosition = result.cursorPosition;
            
            // 不触发input事件，避免潜在的焦点问题
            // 改为触发自定义事件
            const customEvent = new CustomEvent('virtualinput', { 
                detail: { 
                    value: result.text,
                    cursorPosition: this.virtualCursorPosition
                },
                bubbles: false 
            });
            textarea.dispatchEvent(customEvent);
            
        } finally {
            // 恢复原来的readonly状态，但添加延迟
            setTimeout(() => {
                textarea.readOnly = wasReadonly;
            }, 50);
        }
        
        // 更新虚拟光标显示
        this.updateVirtualCursorDisplay();
    }
    
    // 更新虚拟光标显示
    updateVirtualCursorDisplay() {
        const textarea = document.getElementById('koreanInput');
        if (!textarea || !this.isMobileDevice) return;
        
        // 创建或获取光标指示器
        let cursorIndicator = document.getElementById('virtual-cursor-indicator');
        if (!cursorIndicator) {
            cursorIndicator = document.createElement('div');
            cursorIndicator.id = 'virtual-cursor-indicator';
            cursorIndicator.className = 'virtual-cursor-indicator';
            textarea.parentNode.style.position = 'relative';
            textarea.parentNode.appendChild(cursorIndicator);
        }
        
        if (this.isVirtualKeyboardMode) {
            // 计算光标的精确位置
            const cursorPosition = this.calculateCursorPosition(textarea, this.virtualCursorPosition);
            
            // 设置光标位置和样式
            cursorIndicator.style.display = 'block';
            cursorIndicator.style.left = cursorPosition.x + 'px';
            cursorIndicator.style.top = cursorPosition.y + 'px';
            cursorIndicator.style.height = cursorPosition.height + 'px';
            
            // 添加闪烁动画
            cursorIndicator.classList.add('blinking');
        } else {
            cursorIndicator.style.display = 'none';
            cursorIndicator.classList.remove('blinking');
        }
    }
    
    // 计算光标在textarea中的精确位置
    calculateCursorPosition(textarea, position) {
        // 创建隐藏的测量元素
        const measurer = this.createTextMeasurer(textarea);
        
        // 获取光标位置前的文本
        const textBeforeCursor = textarea.value.substring(0, position);
        measurer.textContent = textBeforeCursor;
        
        // 获取文本尺寸
        const textRect = measurer.getBoundingClientRect();
        const textareaRect = textarea.getBoundingClientRect();
        
        // 计算相对于textarea的位置
        const computedStyle = window.getComputedStyle(textarea);
        const paddingLeft = parseFloat(computedStyle.paddingLeft);
        const paddingTop = parseFloat(computedStyle.paddingTop);
        const borderLeft = parseFloat(computedStyle.borderLeftWidth);
        const borderTop = parseFloat(computedStyle.borderTopWidth);
        const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.2;
        
        // 处理多行文本
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length - 1;
        const lastLineText = lines[lines.length - 1];
        
        // 设置测量器为最后一行文本
        measurer.textContent = lastLineText;
        const lastLineWidth = measurer.getBoundingClientRect().width;
        
        // 清理测量器
        document.body.removeChild(measurer);
        
        return {
            x: paddingLeft + lastLineWidth,
            y: paddingTop + (currentLine * lineHeight),
            height: lineHeight
        };
    }
    
    // 创建文本测量器
    createTextMeasurer(textarea) {
        const measurer = document.createElement('span');
        const computedStyle = window.getComputedStyle(textarea);
        
        // 复制textarea的字体样式
        measurer.style.position = 'absolute';
        measurer.style.visibility = 'hidden';
        measurer.style.height = 'auto';
        measurer.style.width = 'auto';
        measurer.style.whiteSpace = 'pre';
        measurer.style.font = computedStyle.font;
        measurer.style.fontSize = computedStyle.fontSize;
        measurer.style.fontFamily = computedStyle.fontFamily;
        measurer.style.fontWeight = computedStyle.fontWeight;
        measurer.style.fontStyle = computedStyle.fontStyle;
        measurer.style.letterSpacing = computedStyle.letterSpacing;
        measurer.style.textTransform = computedStyle.textTransform;
        
        document.body.appendChild(measurer);
        return measurer;
    }
    // 重置键盘状态
    reset() {
        this.isShiftMode = false;
        this.virtualCursorPosition = 0;
        this.isVirtualKeyboardMode = false;
        
        const shiftToggle = document.getElementById('shiftToggle');
        if (shiftToggle) {
            shiftToggle.checked = false;
        }
        this.updateKeyboardDisplay();
        this.updateShiftState();
        this.removeKeyHighlight();
        this.updateVirtualCursorDisplay();
    }
    
    // 处理系统键盘弹出/收起
    handleSystemKeyboardToggle(isVisible) {
        if (isVisible && this.isVirtualKeyboardMode) {
            // 系统键盘意外弹出，尝试隐藏
            console.warn('系统键盘意外弹出，尝试关闭...');
            this.forceCloseSystemKeyboard();
        }
        
        // 更新UI状态
        this.updateKeyboardStateIndicator(isVisible);
    }
    
    // 强制关闭系统键盘
    forceCloseSystemKeyboard() {
        const textarea = document.getElementById('koreanInput');
        if (textarea) {
            textarea.blur();
            textarea.readOnly = true;
            
            // 短暂延迟后恢复
            setTimeout(() => {
                textarea.readOnly = false;
            }, 100);
        }
    }
    
    // 更新键盘状态指示器
    updateKeyboardStateIndicator(isSystemKeyboardVisible) {
        let indicator = document.getElementById('keyboard-state-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'keyboard-state-indicator';
            indicator.className = 'keyboard-state-indicator';
            document.body.appendChild(indicator);
        }
        
        if (this.isMobileDevice) {
            const keyboardModeText = window.languageManager ? window.languageManager.getText('keyboardModeText') : '虚拟键盘模式';
            
            if (isSystemKeyboardVisible && this.isVirtualKeyboardMode) {
                indicator.textContent = '⚠️ 系统键盘已弹出';
                indicator.className = 'keyboard-state-indicator warning';
            } else if (this.isVirtualKeyboardMode) {
                indicator.textContent = '📱 ' + keyboardModeText;
                indicator.className = 'keyboard-state-indicator active';
            } else {
                indicator.textContent = '';
                indicator.className = 'keyboard-state-indicator';
            }
        }
    }
    
    // 同步虚拟光标到真实光标位置（用户直接点击时）
    syncVirtualCursor() {
        const textarea = document.getElementById('koreanInput');
        if (textarea && !this.isVirtualKeyboardMode) {
            const newPosition = textarea.selectionStart || 0;
            
            // 只有位置确实改变时才更新
            if (this.virtualCursorPosition !== newPosition) {
                this.virtualCursorPosition = newPosition;
                
                // 如果在移动设备上，立即更新光标显示
                if (this.isMobileDevice) {
                    this.updateVirtualCursorDisplay();
                }
            }
        }
    }
    
    // 设置虚拟光标位置（内部方法）
    setVirtualCursorPosition(position) {
        const textarea = document.getElementById('koreanInput');
        if (!textarea) return;
        
        const maxPosition = textarea.value.length;
        this.virtualCursorPosition = Math.max(0, Math.min(position, maxPosition));
        
        // 更新显示
        this.updateVirtualCursorDisplay();
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
            // 重建键盘以更新内嵌的多语言文本
            window.virtualKeyboard.createKeyboard();
            // 重新设置事件监听器
            window.virtualKeyboard.setupEventListeners();
            
            // 更新移动端键盘状态指示器文字
            if (window.virtualKeyboard.isMobileDevice && window.virtualKeyboard.isVirtualKeyboardMode) {
                window.virtualKeyboard.updateKeyboardStateIndicator(false);
            }
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