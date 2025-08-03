class KoreanInput {
    constructor() {
        // 字体大小管理
        this.fontSize = 18;  // 默认字体大小
        
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

        // 完整的韩文组合引擎数据结构（从参考项目移植）
        this.initial = [12593, 12594, 12596, 12599, 12600, 12601, 12609, 12610, 12611, 12613, 12614, 12615, 12616, 12617, 12618, 12619, 12620, 12621, 12622];
        this.finale = [0, 12593, 12594, 12595, 12596, 12597, 12598, 12599, 12601, 12602, 12603, 12604, 12605, 12606, 12607, 12608, 12609, 12610, 12612, 12613, 12614, 12615, 12616, 12618, 12619, 12620, 12621, 12622];
        this.dMedial = [0, 0, 0, 0, 0, 0, 0, 0, 0, 800, 801, 820, 0, 0, 1304, 1305, 1320, 0, 0, 1820];
        this.dFinale = [0, 0, 0, 119, 0, 422, 427, 0, 0, 801, 816, 817, 819, 825, 826, 827, 0, 0, 1719, 0, 1919];
        
        // Unicode常量
        this.SBase = 44032;
        this.LBase = 4352;
        this.VBase = 12623;
        this.TBase = 4519;
        this.LCount = 19;
        this.VCount = 21;
        this.TCount = 28;
        this.NCount = 588;
        this.SCount = 11172;

        // 当前正在组合的字符状态
        this.currentChosung = '';
        this.currentJungsung = '';
        this.currentJongsung = '';
        this.buffer = '';
    }

    // 查找数组中元素的索引（工具函数）
    indexOf(array, value) {
        for (let i = 0; i < array.length; i++) {
            if (array[i] === value) {
                return i;
            }
        }
        return -1;
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

    // 完整的韩文组合算法（从参考项目移植并优化）
    composeHangul(inputString) {
        const length = inputString.length;
        if (length === 0) {
            return "";
        }
        
        let currentCharCode = inputString.charCodeAt(0);
        let result = String.fromCharCode(currentCharCode);
        
        for (let i = 1; i < length; i++) {
            const nextCharCode = inputString.charCodeAt(i);
            
            const initialIndex = this.indexOf(this.initial, currentCharCode);
            
            // 初声 + 中声 → 音节
            if (initialIndex !== -1) {
                const vowelOffset = nextCharCode - this.VBase;
                if (0 <= vowelOffset && vowelOffset < this.VCount) {
                    currentCharCode = this.SBase + (initialIndex * this.VCount + vowelOffset) * this.TCount;
                    result = result.slice(0, result.length - 1) + String.fromCharCode(currentCharCode);
                    continue;
                }
            }
            
            // 元音 + 元音 → 复合元音
            const currentVowelOffset = currentCharCode - this.VBase;
            const nextVowelOffset = nextCharCode - this.VBase;
            if (0 <= currentVowelOffset && currentVowelOffset < this.VCount && 
                0 <= nextVowelOffset && nextVowelOffset < this.VCount) {
                const dMedialIndex = this.indexOf(this.dMedial, (currentVowelOffset * 100) + nextVowelOffset);
                if (dMedialIndex > 0) {
                    currentCharCode = this.VBase + dMedialIndex;
                    result = result.slice(0, result.length - 1) + String.fromCharCode(currentCharCode);
                    continue;
                }
            }
            
            const syllableOffset = currentCharCode - this.SBase;
            
            // 音节 + 终声 → 完整音节
            if (0 <= syllableOffset && syllableOffset < 11145 && (syllableOffset % this.TCount) === 0) {
                const finaleIndex = this.indexOf(this.finale, nextCharCode);
                if (finaleIndex !== -1) {
                    currentCharCode += finaleIndex;
                    result = result.slice(0, result.length - 1) + String.fromCharCode(currentCharCode);
                    continue;
                }
                
                // 处理复合中声
                const vowelIndex = Math.floor((syllableOffset % this.NCount) / this.TCount);
                const dMedialIndex = this.indexOf(this.dMedial, (vowelIndex * 100) + (nextCharCode - this.VBase));
                if (dMedialIndex > 0) {
                    currentCharCode += (dMedialIndex - vowelIndex) * this.TCount;
                    result = result.slice(0, result.length - 1) + String.fromCharCode(currentCharCode);
                    continue;
                }
            }
            
            // 完整音节 + 元音 → 终声分离 + 新音节 (关键修复!)
            if (0 <= syllableOffset && syllableOffset < 11172 && (syllableOffset % this.TCount) !== 0) {
                const finaleIndex = syllableOffset % this.TCount;
                const vowelOffset = nextCharCode - this.VBase;
                
                if (0 <= vowelOffset && vowelOffset < this.VCount) {
                    const newInitialIndex = this.indexOf(this.initial, this.finale[finaleIndex]);
                    if (0 <= newInitialIndex && newInitialIndex < this.LCount) {
                        // 移除终声，创建新音节
                        result = result.slice(0, result.length - 1) + String.fromCharCode(currentCharCode - finaleIndex);
                        currentCharCode = this.SBase + (newInitialIndex * this.VCount + vowelOffset) * this.TCount;
                        result = result + String.fromCharCode(currentCharCode);
                        continue;
                    }
                    
                    // 处理复合终声分解
                    if (finaleIndex < this.dFinale.length && this.dFinale[finaleIndex] !== 0) {
                        result = result.slice(0, result.length - 1) + String.fromCharCode(currentCharCode - finaleIndex + Math.floor(this.dFinale[finaleIndex] / 100));
                        currentCharCode = this.SBase + (this.indexOf(this.initial, this.finale[(this.dFinale[finaleIndex] % 100)]) * this.VCount + vowelOffset) * this.TCount;
                        result = result + String.fromCharCode(currentCharCode);
                        continue;
                    }
                }
                
                // 处理复合终声
                const dFinaleIndex = this.indexOf(this.dFinale, (finaleIndex * 100) + this.indexOf(this.finale, nextCharCode));
                if (dFinaleIndex > 0) {
                    currentCharCode = currentCharCode + dFinaleIndex - finaleIndex;
                    result = result.slice(0, result.length - 1) + String.fromCharCode(currentCharCode);
                    continue;
                }
            }
            
            // 无法组合，添加新字符
            currentCharCode = nextCharCode;
            result = result + String.fromCharCode(nextCharCode);
        }
        
        return result;
    }

    // 分解韩文字符（按照参考项目实现）
    decomposeHangul(inputString) {
        const length = inputString.length;
        let result = "";
        
        for (let i = 0; i < length; i++) {
            const charCode = inputString.charCodeAt(i);
            const syllableOffset = charCode - this.SBase;
            
            // 检查是否为韩文音节
            if (syllableOffset < 0 || syllableOffset >= this.SCount) {
                result += String.fromCharCode(charCode);
                continue;
            }
            
            // 分解音节
            const initialIndex = Math.floor(syllableOffset / this.NCount);
            const vowelCode = this.VBase + Math.floor((syllableOffset % this.NCount) / this.TCount);
            const finaleCode = this.finale[syllableOffset % this.TCount];
            
            result += String.fromCharCode(this.initial[initialIndex], vowelCode);
            if (finaleCode !== 0) {
                result += String.fromCharCode(finaleCode);
            }
        }
        
        return result;
    }

    // 处理输入 - 简化版本，直接返回字符用于smartInsert处理
    processInput(char) {
        // 简化：直接返回字符，让smartInsert处理所有组合逻辑
        return char;
    }

    // 检测韩文字符是否完成（用于历史保存时机判断）
    isHangulCharComplete(char) {
        if (!char) return false;
        
        const charCode = char.charCodeAt(0);
        const syllableOffset = charCode - this.SBase;
        
        // 检查是否为完整的韩文音节（不是单独的字母组件）
        if (0 <= syllableOffset && syllableOffset < this.SCount) {
            return true; // 是完整的韩文音节
        }
        
        return false; // 不是完整的韩文音节或不是韩文字符
    }
    
    // 检测从旧文本到新文本是否有韩文字符完成
    detectHangulCompletion(oldText, newText, cursorPosition) {
        // 检查光标位置附近是否有新完成的韩文字符
        if (cursorPosition <= 0) return false;
        
        const newChar = newText[cursorPosition - 1];
        const oldChar = oldText[cursorPosition - 1] || '';
        
        // 如果新字符是完整韩文字符，而旧字符不是，则表示有字符完成
        if (this.isHangulCharComplete(newChar) && !this.isHangulCharComplete(oldChar)) {
            return true;
        }
        
        // 检查是否有韩文字符从不完整变为完整
        if (newChar !== oldChar && this.isHangulCharComplete(newChar)) {
            return true;
        }
        
        return false;
    }

    // 智能插入函数 - 改进版本，更好地处理韩文组合，增加完成检测
    smartInsert(currentText, cursorStart, cursorEnd, newChar) {
        // 1. 构建新文本：插入新字符
        const textBefore = currentText.substring(0, cursorStart);
        const textAfter = currentText.substring(cursorEnd);
        const tempText = textBefore + newChar + textAfter;
        const tempCursorPos = cursorStart + newChar.length;
        
        // 2. 韩文组合处理：尝试不同长度的字符序列
        for (let testLength = Math.min(4, tempCursorPos); testLength >= 2; testLength--) {
            const testChars = tempText.substring(tempCursorPos - testLength, tempCursorPos);
            const composed = this.composeHangul(testChars);
            
            // 3. 如果组合成功（长度减少，或者内容有意义变化），则替换
            if (composed.length < testChars.length || composed !== testChars) {
                const newText = tempText.substring(0, tempCursorPos - testLength) + composed + tempText.substring(tempCursorPos);
                const newCursorPos = tempCursorPos - testLength + composed.length;
                
                // 4. 检测韩文字符是否完成（用于历史保存）
                const hangulCompleted = this.detectHangulCompletion(currentText, newText, newCursorPos);
                
                return {
                    text: newText,
                    cursorPosition: newCursorPos,
                    hangulCompleted: hangulCompleted
                };
            }
        }
        
        // 5. 无法组合，返回临时文本，检查是否有韩文完成
        const hangulCompleted = this.detectHangulCompletion(currentText, tempText, tempCursorPos);
        
        return {
            text: tempText,
            cursorPosition: tempCursorPos,
            hangulCompleted: hangulCompleted
        };
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

    // 从单个韩文字符恢复输入状态
    restoreStateFromCharacter(char) {
        if (!char) {
            this.reset();
            return;
        }
        
        const decomposed = this.decomposeHangul(char);
        if (decomposed) {
            // 是完整的韩文字符，恢复组合状态
            this.currentChosung = decomposed.chosung;
            this.currentJungsung = decomposed.jungsung;
            this.currentJongsung = decomposed.jongsung;
        } else if (this.isConsonant(char)) {
            // 是单独的辅音，设置为初声
            this.currentChosung = char;
            this.currentJungsung = '';
            this.currentJongsung = '';
        } else if (this.isVowel(char)) {
            // 是单独的元音，这种情况不应该出现在正常的韩文输入中
            // 重置状态
            this.reset();
        } else {
            // 不是韩文字符，重置状态
            this.reset();
        }
    }

    // 处理退格 - 使用新的decomposeHangul实现
    handleBackspace(currentText) {
        if (currentText.length === 0) return '';
        
        const lastChar = currentText[currentText.length - 1];
        const decomposed = this.decomposeHangul(lastChar);
        
        // 检查是否为韩文字符（通过分解结果长度判断）
        if (decomposed.length > 1) {
            // 是韩文字符，按照参考项目的逻辑处理
            const decomposedArray = Array.from(decomposed);
            if (decomposedArray.length > 1) {
                // 删除最后一个字符部件，重新组合
                const remaining = decomposedArray.slice(0, -1).join('');
                const recomposed = this.composeHangul(remaining);
                return currentText.slice(0, -1) + recomposed;
            }
        }
        
        // 不是韩文字符或无法分解，直接删除
        return currentText.slice(0, -1);
    }
    
    // 程序化处理输入（用于移动端虚拟键盘）
    processInputProgrammatically(key, isShift, currentText, cursorPosition) {
        const char = this.getCharacter(key, isShift);
        if (!char) return null;
        
        // 使用smartInsert函数处理输入
        return this.smartInsert(currentText, cursorPosition, cursorPosition, char);
    }
    
    // === 新增功能：保存文本 ===
    
    // 保存文本为文件
    saveTextAsFile(text) {
        if (!text.trim()) {
            alert(window.languageManager ? window.languageManager.getText('noTextToSave') || 'No text to save!' : 'No text to save!');
            return;
        }
        
        try {
            // 创建Blob对象
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // 生成文件名（包含时间戳）
            const now = new Date();
            const timestamp = now.getFullYear() + 
                            String(now.getMonth() + 1).padStart(2, '0') + 
                            String(now.getDate()).padStart(2, '0') + '-' +
                            String(now.getHours()).padStart(2, '0') + 
                            String(now.getMinutes()).padStart(2, '0') + 
                            String(now.getSeconds()).padStart(2, '0');
            
            link.download = `korean-text-${timestamp}.txt`;
            
            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 清理URL对象
            URL.revokeObjectURL(url);
            
        } catch (e) {
            console.error('Failed to save file:', e);
            alert('Failed to save file. Please try again.');
        }
    }
    
    // === 新增功能：字体大小调整 ===
    
    // 简单的设置保存
    saveSettings() {
        try {
            const data = {
                fontSize: this.fontSize
            };
            localStorage.setItem('korean-input-data', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save settings to localStorage:', e);
        }
    }
    
    // 从localStorage加载设置
    loadSettings() {
        const savedData = localStorage.getItem('korean-input-data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                if (data.fontSize) {
                    this.fontSize = data.fontSize;
                }
            } catch (e) {
                console.warn('Failed to load settings from localStorage:', e);
            }
        }
    }
    
    // 获取当前字体大小
    getFontSize() {
        return this.fontSize;
    }
    
    // 设置字体大小
    setFontSize(size) {
        this.fontSize = Math.max(12, Math.min(36, size)); // 限制在12-36px之间
        
        const textarea = document.getElementById('koreanInput');
        if (textarea) {
            textarea.style.fontSize = this.fontSize + 'px';
        }
        
        this.saveSettings(); // 保存字体大小设置
        return this.fontSize;
    }
    
    // 增大字体
    increaseFontSize() {
        return this.setFontSize(this.fontSize + 2);
    }
    
    // 减小字体
    decreaseFontSize() {
        return this.setFontSize(this.fontSize - 2);
    }
    
    // 初始化字体大小
    initializeFontSize() {
        this.loadSettings(); // 加载保存的设置
        const textarea = document.getElementById('koreanInput');
        if (textarea) {
            textarea.style.fontSize = this.fontSize + 'px';
        }
    }
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    const koreanInput = new KoreanInput();
    const textarea = document.getElementById('koreanInput');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const fontSmallerBtn = document.getElementById('fontSmallerBtn');
    const fontLargerBtn = document.getElementById('fontLargerBtn');

    // 初始化字体大小
    koreanInput.initializeFontSize();

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
            
            // 获取光标位置信息
            const cursorStart = this.selectionStart;
            const cursorEnd = this.selectionEnd;
            
            if (cursorStart === cursorEnd) {
                // 普通删除：删除光标前的一个字符
                if (cursorStart > 0) {
                    const textBefore = this.value.substring(0, cursorStart);
                    const textAfter = this.value.substring(cursorStart);
                    
                    // 对光标前的文本应用韩文智能退格逻辑
                    const newTextBefore = koreanInput.handleBackspace(textBefore);
                    const newText = newTextBefore + textAfter;
                    
                    this.value = newText;
                    
                    // 设置新的光标位置
                    const newCursorPos = newTextBefore.length;
                    this.setSelectionRange(newCursorPos, newCursorPos);
                    
                    // 基于光标位置智能恢复韩文输入状态
                    if (newCursorPos > 0) {
                        const charBeforeCursor = newText[newCursorPos - 1];
                        koreanInput.restoreStateFromCharacter(charBeforeCursor);
                    } else {
                        koreanInput.reset();
                    }
                }
            } else {
                // 选区删除：删除选中的文本
                const textBefore = this.value.substring(0, cursorStart);
                const textAfter = this.value.substring(cursorEnd);
                const newText = textBefore + textAfter;
                
                this.value = newText;
                this.setSelectionRange(cursorStart, cursorStart);
                
                // 基于光标位置智能恢复韩文输入状态
                if (cursorStart > 0) {
                    const charBeforeCursor = newText[cursorStart - 1];
                    koreanInput.restoreStateFromCharacter(charBeforeCursor);
                } else {
                    koreanInput.reset();
                }
            }
            
            // 注意：这里不再调用 koreanInput.reset()，因为状态已经在上面智能恢复了
            return;
        }

        if (e.key === ' ') {
            e.preventDefault();
            
            const cursorStart = this.selectionStart;
            const textBefore = this.value.substring(0, cursorStart);
            const textAfter = this.value.substring(this.selectionEnd);
            
            this.value = textBefore + ' ' + textAfter;
            
            // 移动光标到空格之后
            const newCursorPos = cursorStart + 1;
            this.setSelectionRange(newCursorPos, newCursorPos);
            
            // 重置韩文输入状态
            koreanInput.reset();
            
            return;
        }

        // 忽略其他特殊键
        if (e.key.length > 1 && e.key !== 'Shift') return;

        const char = koreanInput.getCharacter(e.key, e.shiftKey);
        if (char) {
            e.preventDefault();
            const result = koreanInput.processInput(char);
            
            // 更新输入框内容
            const cursorPos = this.selectionStart;
            const textBefore = this.value.substring(0, cursorPos);
            const textAfter = this.value.substring(this.selectionEnd);
            
            // 全新的韩文输入逻辑：智能光标插入处理
            const insertResult = koreanInput.smartInsert(this.value, cursorPos, this.selectionEnd, result);
            
            // 更新文本和光标位置
            this.value = insertResult.text;
            this.setSelectionRange(insertResult.cursorPosition, insertResult.cursorPosition);
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

    // 保存文本功能
    saveBtn.addEventListener('click', function() {
        koreanInput.saveTextAsFile(textarea.value);
        textarea.focus();
    });

    // 缩小字体功能
    fontSmallerBtn.addEventListener('click', function() {
        koreanInput.decreaseFontSize();
        textarea.focus();
    });

    // 放大字体功能
    fontLargerBtn.addEventListener('click', function() {
        koreanInput.increaseFontSize();
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