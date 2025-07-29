# Korean Input Keyboard

[中文文档](README-CN.md)

A web-based Korean input tool that allows users to type in Korean using an English keyboard without switching system input methods. This project features real-time character conversion, a virtual keyboard display, and a multi-language interface.

## Live Demo

You can try the live version here: [https://korean-keyboard.1tlt1.com/](https://korean-keyboard.1tlt1.com/)


![Korean Keyboard Screenshot](doc/images/snapshot-1.png)


## Core Features

### 1. Korean Input Conversion System
-   **Real-time Conversion**: Automatically converts English keystrokes to Korean characters.
-   **Intelligent Composition**: Supports automatic composition rules for Choseong (initial consonant), Jungseong (medial vowel), and Jongseong (final consonant).
-   **Double Character Support**: The Shift key supports double consonants (ㅃ, ㅉ, ㄸ, ㄲ, ㅆ) and compound vowels (ㅒ, ㅖ).
-   **Smart Backspace**: Deletes by Korean character components, supporting character decomposition.

### 2. Multi-language Interface
-   🇺🇸 English
-   🇹🇼 Traditional Chinese
-   🇰🇷 Korean
-   🇨🇳 Simplified Chinese
-   Language preference is automatically saved to `localStorage`.

### 3. Virtual Keyboard
-   **Full QWERTY Layout**: Displays the letter key area.
-   **Dual-layer Display**: Shows English letters (top) and Korean letters (bottom).
-   **Shift Mode Toggle**: Supports switching between normal and Shift states.
-   **Real-time Highlighting**: Corresponding virtual keys light up when physical keys are pressed.
-   **Click-to-Type**: Supports input by clicking virtual keys with the mouse.

### 4. User Functions
-   **Copy Function**: One-click copy of Korean content to the clipboard.
-   **Clear Function**: Quickly clear all input content.
-   **Responsive Design**: Adapts to both desktop and mobile devices.

## How to Run Locally

This project is a pure front-end application and requires no special server setup. You can run it by simply opening the `index.html` file in your browser.

For a more standard development setup, you can use a simple local server.

1.  **Clone the repository** (assuming you have Git installed):
    ```bash
    # Replace with your actual repository URL
    git clone https://github.com/nonsensejoke/korean-keyboard.git
    cd korean-keyboard
    ```

2.  **Serve the files**:
    If you have Python installed, you can run a simple web server from the project directory:
    
    *For Python 3:*
    ```bash
    python -m http.server
    ```
    
    *For Python 2:*
    ```bash
    python -m SimpleHTTPServer
    ```
    
    Alternatively, you can use other tools like `npx serve`.

3.  **Open in browser**:
    Navigate to `http://localhost:8000` (or the port specified by your server) in your web browser.

## Technical Architecture

### File Structure
```
korean-keyboard/
├── index.html          # Main page file
├── korean-input.js     # Core logic for Korean input
├── virtual-keyboard.js # Virtual keyboard module
├── i18n.js             # Multi-language configuration
├── style.css           # Stylesheet
└── README.md           # Project documentation
```

## Browser Compatibility
-   ✅ Chrome 80+
-   ✅ Firefox 75+
-   ✅ Safari 13+
-   ✅ Edge 80+
