class KoreanInput {
    constructor() {
        // 普通状态的键盘映射
        this.normalMap = {
            // 辅音 (초성/종성)
            'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ',
            'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ',
            'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ',
            
            // 元音 (중성)
            'y': 'ㅛ', 'u': 'ㅕ', 'l': 'ㅣ', 'o': 'ㅐ', 'p': 'ㅔ',
            'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'i': 'ㅑ',
            'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ'
        };

        // Shift状态的键盘映射
        this.shiftMap = {
            // 双辅音
            'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ',
            
            // 复合元音
            'O': 'ㅒ', 'P': 'ㅖ',
            
            // 其他按键保持原映射（小写转大写）
            'q': 'ㅃ', 'w': 'ㅉ', 'e': 'ㄸ', 'r': 'ㄲ', 't': 'ㅆ',
            'o': 'ㅒ', 'p': 'ㅖ'
        };

        // 韩文字符范围常量
        this.HANGUL_BASE = 0xAC00;
        this.CHOSUNG_BASE = 0x1100;
        this.JUNGSUNG_BASE = 0x1161;
        this.JONGSUNG_BASE = 0x11A7;
        
        // 初声 (19个)
        this.chosungList = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        
        // 中声 (21个)
        this.jungsungList = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
        
        // 终声 (28个，包含空字符)
        this.jongsungList = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

        // 当前正在组合的字符状态
        this.currentChosung = '';
        this.currentJungsung = '';
        this.currentJongsung = '';
        this.buffer = '';
    }

    // 获取字符映射
    getCharacter(key, isShift) {
        if (isShift && this.shiftMap[key]) {
            return this.shiftMap[key];
        }
        return this.normalMap[key.toLowerCase()] || null;
    }

    // 判断是否为辅音
    isConsonant(char) {
        return this.chosungList.includes(char) || this.jongsungList.includes(char);
    }

    // 判断是否为元音
    isVowel(char) {
        return this.jungsungList.includes(char);
    }

    // 组合韩文字符
    combineHangul(chosung, jungsung, jongsung = '') {
        const chosungIndex = this.chosungList.indexOf(chosung);
        const jungsungIndex = this.jungsungList.indexOf(jungsung);
        const jongsungIndex = this.jongsungList.indexOf(jongsung);

        if (chosungIndex === -1 || jungsungIndex === -1 || jongsungIndex === -1) {
            return null;
        }

        const unicode = this.HANGUL_BASE + (chosungIndex * 21 * 28) + (jungsungIndex * 28) + jongsungIndex;
        return String.fromCharCode(unicode);
    }

    // 分解韩文字符
    decomposeHangul(char) {
        const unicode = char.charCodeAt(0);
        if (unicode < this.HANGUL_BASE || unicode > this.HANGUL_BASE + (19 * 21 * 28)) {
            return null;
        }

        const index = unicode - this.HANGUL_BASE;
        const chosungIndex = Math.floor(index / (21 * 28));
        const jungsungIndex = Math.floor((index % (21 * 28)) / 28);
        const jongsungIndex = index % 28;

        return {
            chosung: this.chosungList[chosungIndex],
            jungsung: this.jungsungList[jungsungIndex],
            jongsung: this.jongsungList[jongsungIndex]
        };
    }

    // 处理输入
    processInput(char) {
        if (this.isConsonant(char)) {
            return this.processConsonant(char);
        } else if (this.isVowel(char)) {
            return this.processVowel(char);
        }
        return char;
    }

    // 处理辅音输入
    processConsonant(consonant) {
        if (!this.currentChosung) {
            // 开始新的音节
            this.currentChosung = consonant;
            this.currentJungsung = '';
            this.currentJongsung = '';
            return consonant;
        } else if (this.currentJungsung && !this.currentJongsung) {
            // 添加终声
            this.currentJongsung = consonant;
            return this.combineHangul(this.currentChosung, this.currentJungsung, this.currentJongsung);
        } else {
            // 开始新的音节
            const result = this.finalizeCurrent() + consonant;
            this.currentChosung = consonant;
            this.currentJungsung = '';
            this.currentJongsung = '';
            return result;
        }
    }

    // 处理元音输入
    processVowel(vowel) {
        if (this.currentChosung && !this.currentJungsung) {
            // 添加中声
            this.currentJungsung = vowel;
            return this.combineHangul(this.currentChosung, this.currentJungsung);
        } else if (this.currentChosung && this.currentJungsung && this.currentJongsung) {
            // 终声变成新音节的初声
            const result = this.combineHangul(this.currentChosung, this.currentJungsung) + 
                          this.combineHangul(this.currentJongsung, vowel);
            this.currentChosung = this.currentJongsung;
            this.currentJungsung = vowel;
            this.currentJongsung = '';
            return result;
        } else {
            // 处理其他情况
            const result = this.finalizeCurrent() + vowel;
            this.reset();
            return result;
        }
    }

    // 完成当前字符组合
    finalizeCurrent() {
        if (this.currentChosung && this.currentJungsung) {
            return this.combineHangul(this.currentChosung, this.currentJungsung, this.currentJongsung);
        } else if (this.currentChosung) {
            return this.currentChosung;
        }
        return '';
    }

    // 重置状态
    reset() {
        this.currentChosung = '';
        this.currentJungsung = '';
        this.currentJongsung = '';
    }

    // 处理退格
    handleBackspace(currentText) {
        if (currentText.length === 0) return '';
        
        const lastChar = currentText[currentText.length - 1];
        const decomposed = this.decomposeHangul(lastChar);
        
        if (decomposed) {
            // 是完整的韩文字符，进行分解
            if (decomposed.jongsung) {
                // 有终声，删除终声
                return currentText.slice(0, -1) + this.combineHangul(decomposed.chosung, decomposed.jungsung);
            } else {
                // 没有终声，删除中声
                return currentText.slice(0, -1) + decomposed.chosung;
            }
        } else {
            // 不是完整韩文字符，直接删除
            return currentText.slice(0, -1);
        }
    }
    
    // 程序化处理输入（用于移动端虚拟键盘）
    processInputProgrammatically(key, isShift, currentText, cursorPosition) {
        const char = this.getCharacter(key, isShift);
        if (!char) return null;
        
        const result = this.processInput(char);
        
        const textBefore = currentText.substring(0, cursorPosition);
        const textAfter = currentText.substring(cursorPosition);
        
        // 检查是否需要替换最后一个字符（韩文组合逻辑）
        let newText;
        let replacedLastChar = false;
        
        if (textBefore.length > 0) {
            const lastChar = textBefore[textBefore.length - 1];
            const decomposed = this.decomposeHangul(lastChar);
            if (decomposed || this.isConsonant(lastChar) || this.isVowel(lastChar)) {
                newText = textBefore.slice(0, -1) + result + textAfter;
                replacedLastChar = true;
            } else {
                newText = textBefore + result + textAfter;
            }
        } else {
            newText = result + textAfter;
        }
        
        // 计算新的光标位置
        const newCursorPos = cursorPosition + result.length - (replacedLastChar ? 1 : 0);
        
        return {
            text: newText,
            cursorPosition: newCursorPos
        };
    }
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    const koreanInput = new KoreanInput();
    const textarea = document.getElementById('koreanInput');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');

    // 初始化虚拟键盘和语言切换器
    window.virtualKeyboard = new VirtualKeyboard(koreanInput);
    window.languageSwitcher = new LanguageSwitcher();
    
    // 初始化界面语言
    window.languageManager.updateUI();
    
    // 修复初始化时序问题：确保虚拟键盘的多语言文字正确显示
    if (window.virtualKeyboard) {
        // 更新功能键文字（修复空格键显示问题）
        window.virtualKeyboard.updateFunctionKeysText();
        
        // 如果是移动设备且当前处于虚拟键盘模式，更新状态指示器
        if (window.virtualKeyboard.isMobileDevice && window.virtualKeyboard.isVirtualKeyboardMode) {
            window.virtualKeyboard.updateKeyboardStateIndicator(false);
        }
    }

    // 键盘事件监听
    textarea.addEventListener('keydown', function(e) {
        // 检查输入来源，如果是虚拟键盘输入且在移动设备上，则忽略
        if (window.virtualKeyboard && window.virtualKeyboard.inputSource === 'virtual' && window.virtualKeyboard.isMobileDevice) {
            return;
        }
        
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newText = koreanInput.handleBackspace(this.value);
            this.value = newText;
            koreanInput.reset();
            return;
        }

        // 忽略特殊键
        if (e.key.length > 1 && e.key !== 'Shift') return;

        const char = koreanInput.getCharacter(e.key, e.shiftKey);
        if (char) {
            e.preventDefault();
            const result = koreanInput.processInput(char);
            
            // 更新输入框内容
            const cursorPos = this.selectionStart;
            const textBefore = this.value.substring(0, cursorPos);
            const textAfter = this.value.substring(this.selectionEnd);
            
            // 如果当前位置有未完成的字符，替换它
            let newText;
            if (textBefore.length > 0) {
                const lastChar = textBefore[textBefore.length - 1];
                const decomposed = koreanInput.decomposeHangul(lastChar);
                if (decomposed || koreanInput.isConsonant(lastChar) || koreanInput.isVowel(lastChar)) {
                    newText = textBefore.slice(0, -1) + result + textAfter;
                } else {
                    newText = textBefore + result + textAfter;
                }
            } else {
                newText = result + textAfter;
            }
            
            this.value = newText;
            this.setSelectionRange(cursorPos + result.length, cursorPos + result.length);
        }
    });
    
    // 添加触摸和焦点事件监听，区分输入来源
    textarea.addEventListener('touchstart', function(e) {
        if (window.virtualKeyboard) {
            window.virtualKeyboard.inputSource = 'touch';
            // 同步虚拟光标位置
            setTimeout(() => {
                window.virtualKeyboard.syncVirtualCursor();
            }, 50);
        }
    });
    
    textarea.addEventListener('mousedown', function(e) {
        if (window.virtualKeyboard) {
            window.virtualKeyboard.inputSource = 'mouse';
            // 同步虚拟光标位置
            setTimeout(() => {
                window.virtualKeyboard.syncVirtualCursor();
            }, 50);
        }
    });
    
    textarea.addEventListener('focus', function(e) {
        if (window.virtualKeyboard) {
            // 如果是虚拟键盘操作导致的焦点，立即失焦
            if (window.virtualKeyboard.isMobileDevice && window.virtualKeyboard.isVirtualKeyboardMode) {
                e.preventDefault();
                this.blur();
                return false;
            }
            
            // 如果是移动设备且输入源不是虚拟键盘，允许系统键盘弹出
            if (window.virtualKeyboard.isMobileDevice && 
                window.virtualKeyboard.inputSource !== 'virtual') {
                // 正常的焦点行为，允许系统键盘弹出
                window.virtualKeyboard.syncVirtualCursor();
            }
        }
        koreanInput.reset();
    });
    
    // 监听自定义虚拟输入事件
    textarea.addEventListener('virtualinput', function(e) {
        // 处理虚拟输入事件，这里可以添加额外的处理逻辑
        // 例如更新其他UI元素等
    });
    
    // 监听光标位置变化（selectionchange事件）
    document.addEventListener('selectionchange', function() {
        if (window.virtualKeyboard && document.activeElement === textarea) {
            // 用户直接在textarea中移动了光标，同步虚拟光标
            if (!window.virtualKeyboard.isVirtualKeyboardMode) {
                window.virtualKeyboard.syncVirtualCursor();
            }
        }
    });
    
    // 监听文本选择变化（兼容性更好的方式）
    textarea.addEventListener('selectionchange', function() {
        if (window.virtualKeyboard && !window.virtualKeyboard.isVirtualKeyboardMode) {
            window.virtualKeyboard.syncVirtualCursor();
        }
    });
    
    // 监听键盘事件同步光标（用户直接使用物理键盘时）
    textarea.addEventListener('keyup', function(e) {
        if (window.virtualKeyboard && !window.virtualKeyboard.isVirtualKeyboardMode) {
            window.virtualKeyboard.syncVirtualCursor();
        }
    });

    // 复制功能
    copyBtn.addEventListener('click', function() {
        textarea.select();
        document.execCommand('copy');
        
        // 显示复制成功提示（多语言支持）
        const originalText = this.textContent;
        this.textContent = window.languageManager.getText('copiedMsg');
        setTimeout(() => {
            this.textContent = originalText;
        }, 1000);
    });

    // 清空功能
    clearBtn.addEventListener('click', function() {
        textarea.value = '';
        koreanInput.reset();
        window.virtualKeyboard.reset();
        textarea.focus();
    });

    // 点击事件重置状态和同步光标
    textarea.addEventListener('click', function() {
        koreanInput.reset();
        // 设置输入源为直接输入
        if (window.virtualKeyboard) {
            window.virtualKeyboard.inputSource = 'direct';
            // 同步虚拟光标位置
            window.virtualKeyboard.syncVirtualCursor();
        }
    });
});