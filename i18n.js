// 多语言配置文件
const i18n = {
    // 美国英语
    'en-US': {
        title: 'Korean Input Test',
        placeholder: 'Type in English and it will convert to Korean...',
        copyBtn: 'Copy',
        clearBtn: 'Clear',
        copiedMsg: 'Copied!',
        infoText1: 'Type with English keyboard and it will automatically convert to Korean.',
        infoText2: 'Hold Shift to input more Korean characters.',
        virtualKeyboardTitle: 'Virtual Keyboard',
        shiftLabel: 'Shift',
        keyboardModeText: 'Virtual Keyboard Mode',
        spaceKeyLabel: 'Space'
    },
    
    // 中文简体
    'zh-CN': {
        title: '韩文输入测试',
        placeholder: '用英文输入，自动转换为韩文...',
        copyBtn: '复制',
        clearBtn: '清空',
        copiedMsg: '已复制!',
        infoText1: '使用英文键盘输入，将自动转换为韩文。',
        infoText2: '按住Shift键可以输入更多韩文字符。',
        virtualKeyboardTitle: '虚拟键盘',
        shiftLabel: 'Shift',
        keyboardModeText: '虚拟键盘模式',
        spaceKeyLabel: '空格'
    },
    
    // 中文繁体
    'zh-TW': {
        title: '韓文輸入測試',
        placeholder: '用英文輸入，自動轉換為韓文...',
        copyBtn: '複製',
        clearBtn: '清空',
        copiedMsg: '已複製!',
        infoText1: '使用英文鍵盤輸入，將自動轉換為韓文。',
        infoText2: '按住Shift鍵可以輸入更多韓文字符。',
        virtualKeyboardTitle: '虛擬鍵盤',
        shiftLabel: 'Shift',
        keyboardModeText: '虛擬鍵盤模式',
        spaceKeyLabel: '空格'
    },
    
    // 韩文
    'ko-KR': {
        title: '한글 입력 테스트',
        placeholder: '영문으로 타이핑하면 한글로 변환됩니다...',
        copyBtn: '복사',
        clearBtn: '지우기',
        copiedMsg: '복사됨!',
        infoText1: '영문 키보드로 타이핑하면 자동으로 한글로 변환됩니다.',
        infoText2: 'Shift를 눌러 더 많은 한글 문자를 입력할 수 있습니다.',
        virtualKeyboardTitle: '가상 키보드',
        shiftLabel: 'Shift',
        keyboardModeText: '가상 키보드 모드',
        spaceKeyLabel: '스페이스'
    }
};

// 多语言管理器
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en-US';
        this.supportedLanguages = [
            { code: 'en-US', name: 'English', flag: '🇺🇸' },
            { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
            { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
            { code: 'ko-KR', name: '한국어', flag: '🇰🇷' }
        ];
    }

    // 获取当前语言的文本
    getText(key) {
        return i18n[this.currentLanguage][key] || i18n['en-US'][key] || key;
    }

    // 切换语言
    setLanguage(languageCode) {
        if (i18n[languageCode]) {
            this.currentLanguage = languageCode;
            localStorage.setItem('selectedLanguage', languageCode);
            this.updateUI();
        }
    }

    // 更新界面文本
    updateUI() {
        // 更新标题
        const titleElement = document.querySelector('h1');
        if (titleElement) {
            titleElement.textContent = this.getText('title');
        }

        // 更新输入框placeholder
        const inputElement = document.getElementById('koreanInput');
        if (inputElement) {
            inputElement.placeholder = this.getText('placeholder');
        }

        // 更新按钮文本
        const copyBtn = document.getElementById('copyBtn');
        const clearBtn = document.getElementById('clearBtn');
        if (copyBtn) copyBtn.textContent = this.getText('copyBtn');
        if (clearBtn) clearBtn.textContent = this.getText('clearBtn');

        // 更新信息文本
        const infoText1 = document.querySelector('.info p:first-child');
        const infoText2 = document.querySelector('.info p:last-child');
        if (infoText1) infoText1.textContent = this.getText('infoText1');
        if (infoText2) infoText2.textContent = this.getText('infoText2');

        // 更新虚拟键盘标题
        const keyboardTitle = document.querySelector('.keyboard-title');
        if (keyboardTitle) {
            keyboardTitle.textContent = this.getText('virtualKeyboardTitle');
        }

        // 更新Shift标签
        const shiftLabels = document.querySelectorAll('.shift-label');
        shiftLabels.forEach(label => {
            label.textContent = this.getText('shiftLabel');
        });
    }

    // 获取支持的语言列表
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    // 获取当前语言代码
    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// 导出语言管理器实例
window.languageManager = new LanguageManager();