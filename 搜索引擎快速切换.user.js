// ==UserScript==
// @name         搜索引擎切换
// @namespace    https://github.com/Ilyfalt/tampermonkey-search-switcher/raw/master/搜索引擎快速切换.user.js
// @version      1.0.14
// @description  Material Design 底部抽屉式搜索引擎切换，支持自定义引擎
// @author       Xtne
// @license       MIT
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // SVG 图标
    const ICONS = {
        search: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
        chevronUp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>',
        lightMode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>',
        darkMode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z"/></svg>',
        add: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
        delete: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
        dragHandle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 9H4v2h16V9zM4 15h16v-2H4v2z"/></svg>',
        edit: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>'
    };

    // 默认搜索引擎配置
    const DEFAULT_ENGINES = [
        { name: 'Google', abbr: 'G', url: 'https://www.google.com/search?q=', match: 'google.com/search', param: 'q' },
        { name: 'Bing', abbr: 'B', url: 'https://www.bing.com/search?q=', match: 'bing.com/search', param: 'q' },
        { name: 'DuckDuckGo', abbr: 'D', url: 'https://duckduckgo.com/?q=', match: 'duckduckgo.com', param: 'q' },
        { name: 'Yahoo', abbr: 'Y', url: 'https://search.yahoo.com/search?p=', match: 'yahoo.com/search', param: 'p' },
        { name: '百度', abbr: '百', url: 'https://www.baidu.com/s?wd=', match: 'baidu.com/s', param: 'wd' },
        { name: 'Sogou', abbr: '搜', url: 'https://www.sogou.com/web?query=', match: 'sogou.com/web', param: 'query' },
        { name: 'Yandex', abbr: 'Я', url: 'https://yandex.com/search/?text=', match: 'yandex.com/search', param: 'text' }
    ];

    // 配置
    const CONFIG = {
        theme: GM_getValue('theme', 'light'),
        engines: GM_getValue('engines', DEFAULT_ENGINES)
    };

    // 检查是否在搜索引擎页面
    function isSearchPage() {
        const url = window.location.href;
        return CONFIG.engines.some(engine => url.includes(engine.match));
    }

    // 注册菜单命令（必须在 return 之前，否则非搜索页看不到）
    GM_registerMenuCommand('设置', openSettings);

    // 如果不在搜索引擎页面，不加载脚本
    if (!isSearchPage()) {
        return;
    }

    // 提取搜索关键词
    function getSearchQuery() {
        const params = new URLSearchParams(window.location.search);
        const url = window.location.href;
        
        for (const engine of CONFIG.engines) {
            if (url.includes(engine.match)) {
                return params.get(engine.param) || '';
            }
        }
        
        return '';
    }

    // 创建样式
    function createStyles() {
        const isDark = CONFIG.theme === 'dark';
        const bgColor = isDark ? '#000' : '#fff';
        const textColor = isDark ? '#fff' : '#000';
        const secondaryBg = isDark ? '#1a1a1a' : '#f5f5f5';
        const borderColor = isDark ? '#333' : '#e0e0e0';
        
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

            * {
                outline: none !important;
                -webkit-tap-highlight-color: transparent !important;
            }

            /* Via 风格底部胶囊栏 */
            .se-pill-bar {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: auto;
                background: transparent;
                z-index: 999999;
                display: flex;
                align-items: center;
                padding: 6px 10px;
                padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
                gap: 0;
                font-family: 'Roboto', -apple-system, sans-serif;
                user-select: none;
                box-sizing: border-box;
                pointer-events: none;
            }

            .se-pill-scroll, .se-pill-settings {
                pointer-events: auto;
            }

            /* 引擎胶囊滚动区 */
            .se-pill-scroll {
                display: flex;
                align-items: center;
                gap: 8px;
                overflow-x: auto;
                flex: 1;
                padding: 8px 0;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .se-pill-scroll::-webkit-scrollbar {
                display: none;
            }

            /* 单个引擎胶囊 */
            .se-pill {
                flex-shrink: 0;
                height: 28px;
                padding: 0 12px;
                border-radius: 14px;
                border: 1.5px solid ${isDark ? '#444' : '#ddd'};
                background: ${secondaryBg};
                color: ${textColor};
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                white-space: nowrap;
                transition: all 0.15s ease;
                letter-spacing: 0.2px;
            }

            .se-pill:hover {
                border-color: ${textColor};
                background: ${isDark ? '#222' : '#e8e8e8'};
            }

            .se-pill:active {
                transform: scale(0.95);
                background: ${textColor};
                color: ${bgColor};
            }

            .se-pill.current {
                background: ${textColor};
                color: ${bgColor};
                border-color: ${textColor};
            }

            /* 设置按钮 */
            .se-pill-settings {
                flex-shrink: 0;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: none;
                background: transparent;
                color: ${isDark ? '#666' : '#bbb'};
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 4px;
                transition: color 0.15s, background 0.15s;
            }

            .se-pill-settings:hover {
                color: ${textColor};
                background: ${secondaryBg};
            }

            .se-pill-settings svg {
                width: 20px;
                height: 20px;
            }

            /* 设置对话框 */
            .se-settings-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, ${isDark ? '0.85' : '0.65'});
                z-index: 10000000;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 20px;
                animation: fadeIn 0.2s;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .se-settings-dialog.active {
                display: flex;
            }

            .se-settings-box {
                background: ${bgColor};
                border: 2px solid ${textColor};
                border-radius: 16px;
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            @keyframes slideUp {
                from {
                    transform: translateY(50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .se-settings-header {
                padding: 24px;
                border-bottom: 1px solid ${borderColor};
            }

            .se-settings-header h3 {
                color: ${textColor};
                font-size: 24px;
                margin: 0;
                font-weight: 500;
            }

            .se-settings-body {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }

            .se-setting-section {
                margin-bottom: 32px;
            }

            .se-setting-section:last-child {
                margin-bottom: 0;
            }

            .se-section-title {
                color: ${textColor};
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .se-setting-item {
                margin-bottom: 20px;
            }

            .se-setting-label {
                color: ${textColor};
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
                display: block;
            }

            .se-setting-desc {
                color: ${isDark ? '#999' : '#666'};
                font-size: 12px;
                margin-bottom: 12px;
            }

            .se-theme-options {
                display: flex;
                gap: 12px;
            }

            .se-theme-btn {
                flex: 1;
                padding: 12px;
                background: ${secondaryBg};
                border: 2px solid ${borderColor};
                border-radius: 8px;
                color: ${textColor};
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s;
            }

            .se-theme-btn svg {
                width: 20px;
                height: 20px;
            }

            .se-theme-btn:hover {
                background: ${isDark ? '#2a2a2a' : '#e8e8e8'};
            }

            .se-theme-btn.active {
                background: ${textColor};
                color: ${bgColor};
                border-color: ${textColor};
            }

            /* 自定义引擎列表 */
            .se-engines-manage {
                border: 1px solid ${borderColor};
                border-radius: 8px;
                overflow: hidden;
            }

            .se-engine-row {
                padding: 16px;
                border-bottom: 1px solid ${borderColor};
                display: flex;
                align-items: center;
                gap: 12px;
                background: ${bgColor};
                transition: background 0.2s;
            }

            .se-engine-row:last-child {
                border-bottom: none;
            }

            .se-engine-row:hover {
                background: ${secondaryBg};
            }

            .se-engine-row.dragging {
                opacity: 0.5;
            }

            .se-drag-handle {
                width: 24px;
                height: 24px;
                color: ${isDark ? '#666' : '#999'};
                cursor: grab;
                flex-shrink: 0;
            }

            .se-drag-handle:active {
                cursor: grabbing;
            }

            .se-engine-row-info {
                flex: 1;
                min-width: 0;
            }

            .se-engine-row-name {
                color: ${textColor};
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 4px;
            }

            .se-engine-row-url {
                color: ${isDark ? '#888' : '#666'};
                font-size: 12px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .se-engine-actions {
                display: flex;
                gap: 8px;
            }

            .se-icon-btn {
                width: 40px;
                height: 40px;
                border: 1.5px solid ${borderColor};
                background: ${bgColor};
                color: ${textColor};
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                transition: background 0.2s;
                -webkit-tap-highlight-color: transparent;
                padding: 0;
                flex-shrink: 0;
            }

            .se-icon-btn svg {
                width: 20px;
                height: 20px;
            }

            .se-icon-btn:active {
                background: ${secondaryBg};
            }

            .se-icon-btn:disabled {
                opacity: 0.2;
                pointer-events: none;
            }

            .se-icon-btn.del-btn {
                border-color: #ffcdd2;
                color: #e53935;
            }

            .se-add-engine-btn {
                width: 100%;
                padding: 12px;
                margin-top: 12px;
                background: ${textColor};
                color: ${bgColor};
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: opacity 0.2s;
            }

            .se-add-engine-btn svg {
                width: 20px;
                height: 20px;
            }

            .se-add-engine-btn:hover {
                opacity: 0.9;
            }

            /* 引擎编辑表单 */
            .se-engine-form {
                display: none;
                padding: 16px;
                background: ${secondaryBg};
                border: 1px solid ${borderColor};
                border-radius: 8px;
                margin-top: 12px;
            }

            .se-engine-form.active {
                display: block;
            }

            .se-form-group {
                margin-bottom: 16px;
            }

            .se-form-group:last-child {
                margin-bottom: 0;
            }

            .se-form-label {
                color: ${textColor};
                font-size: 13px;
                font-weight: 500;
                margin-bottom: 8px;
                display: block;
            }

            .se-form-input {
                width: 100%;
                padding: 10px 12px;
                background: ${bgColor};
                border: 1px solid ${borderColor};
                border-radius: 6px;
                color: ${textColor};
                font-size: 14px;
                font-family: inherit;
            }

            .se-form-input:focus {
                border-color: ${textColor};
            }

            .se-form-actions {
                display: flex;
                gap: 8px;
                margin-top: 16px;
            }

            .se-form-btn {
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: opacity 0.2s;
            }

            .se-form-btn-primary {
                background: ${textColor};
                color: ${bgColor};
            }

            .se-form-btn-secondary {
                background: ${secondaryBg};
                color: ${textColor};
                border: 1px solid ${borderColor};
            }

            .se-form-btn:hover {
                opacity: 0.9;
            }

            .se-settings-footer {
                padding: 20px 24px;
                border-top: 1px solid ${borderColor};
            }

            .se-close-settings {
                width: 100%;
                padding: 12px;
                background: ${textColor};
                color: ${bgColor};
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: opacity 0.2s;
            }

            .se-close-settings:hover {
                opacity: 0.9;
            }

            @media (max-width: 768px) {
                .se-drawer-content {
                    padding: 20px 16px;
                }

                .se-engine-item {
                    padding: 14px 20px;
                }

                .se-settings-box {
                    max-width: 100%;
                    max-height: 95vh;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 创建主界面（Via 风格胶囊栏）
    function createUI() {
        const query = getSearchQuery();

        // 检测当前引擎
        const currentUrl = window.location.href;
        const currentEngine = CONFIG.engines.find(e => currentUrl.includes(e.match));

        // 底部胶囊栏
        const pillBar = document.createElement('div');
        pillBar.className = 'se-pill-bar';

        // 滚动区（放胶囊）
        const pillScroll = document.createElement('div');
        pillScroll.className = 'se-pill-scroll';

        CONFIG.engines.forEach(engine => {
            const pill = document.createElement('div');
            pill.className = 'se-pill';
            if (currentEngine && engine.match === currentEngine.match) {
                pill.classList.add('current');
            }
            pill.textContent = engine.name;

            pill.addEventListener('click', () => {
                if (query) {
                    window.open(engine.url + encodeURIComponent(query), '_blank');
                }
            });

            pillScroll.appendChild(pill);
        });

        pillBar.appendChild(pillScroll);
        document.body.appendChild(pillBar);

        createSettingsDialog();
    }

    // 创建设置对话框
    function createSettingsDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'se-settings-dialog';
        dialog.id = 'se-settings-dialog';
        
        const box = document.createElement('div');
        box.className = 'se-settings-box';
        
        const header = document.createElement('div');
        header.className = 'se-settings-header';
        header.innerHTML = '<h3>设置</h3>';
        
        const body = document.createElement('div');
        body.className = 'se-settings-body';
        
        // 主题设置
        const themeSection = document.createElement('div');
        themeSection.className = 'se-setting-section';
        themeSection.innerHTML = `
            <div class="se-section-title">外观</div>
            <div class="se-setting-item">
                <label class="se-setting-label">主题模式</label>
                <div class="se-theme-options">
                    <button class="se-theme-btn ${CONFIG.theme === 'light' ? 'active' : ''}" data-theme="light">
                        ${ICONS.lightMode} 浅色
                    </button>
                    <button class="se-theme-btn ${CONFIG.theme === 'dark' ? 'active' : ''}" data-theme="dark">
                        ${ICONS.darkMode} 深色
                    </button>
                </div>
            </div>
        `;
        
        // 搜索引擎管理
        const enginesSection = document.createElement('div');
        enginesSection.className = 'se-setting-section';
        enginesSection.innerHTML = `
            <div class="se-section-title">搜索引擎管理</div>
            <div class="se-setting-item">
                <div class="se-engines-manage" id="se-engines-list"></div>
                <button class="se-add-engine-btn" id="se-add-engine">
                    ${ICONS.add} 添加搜索引擎
                </button>
                <div class="se-engine-form" id="se-engine-form">
                    <div class="se-form-group">
                        <label class="se-form-label" id="se-form-title-label">添加搜索引擎</label>
                    </div>
                    <div class="se-form-group">
                        <label class="se-form-label">名称</label>
                        <input type="text" class="se-form-input" id="engine-name" placeholder="例如：Bing" autocomplete="off">
                    </div>
                    <div class="se-form-group">
                        <label class="se-form-label">搜索URL（用 {query} 代表搜索词）</label>
                        <input type="text" class="se-form-input" id="engine-url" placeholder="例如：https://www.bing.com/search?q={query}" autocomplete="off">
                    </div>
                    <div class="se-form-actions">
                        <button class="se-form-btn se-form-btn-secondary" id="cancel-engine">取消</button>
                        <button class="se-form-btn se-form-btn-primary" id="save-engine">保存</button>
                    </div>
                </div>
            </div>
        `;
        
        body.appendChild(themeSection);
        body.appendChild(enginesSection);

        // 数据导入导出
        const dataSection = document.createElement('div');
        dataSection.className = 'se-setting-section';
        dataSection.innerHTML = `
            <div class="se-section-title">数据</div>
            <div class="se-setting-item">
                <div class="se-theme-options">
                    <button class="se-form-btn se-form-btn-secondary" id="se-export-btn">导出配置</button>
                    <button class="se-form-btn se-form-btn-secondary" id="se-import-btn">导入配置</button>
                </div>
            </div>
        `;
        body.appendChild(dataSection);
        
        const footer = document.createElement('div');
        footer.className = 'se-settings-footer';
        footer.innerHTML = '<button class="se-close-settings">完成</button>';
        
        box.appendChild(header);
        box.appendChild(body);
        box.appendChild(footer);
        dialog.appendChild(box);
        document.body.appendChild(dialog);
        
        // 事件监听
        setupSettingsEvents(dialog);
        renderEnginesList();
    }

    // 设置事件
    function setupSettingsEvents(dialog) {
        // 主题切换
        dialog.querySelectorAll('.se-theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                CONFIG.theme = btn.dataset.theme;
                GM_setValue('theme', CONFIG.theme);
                location.reload();
            });
        });
        
        // 添加引擎
        dialog.querySelector('#se-add-engine').addEventListener('click', () => {
            dialog.querySelector('#se-engine-form').classList.add('active');
        });
        
        // 取消添加
        dialog.querySelector('#cancel-engine').addEventListener('click', () => {
            dialog.querySelector('#se-engine-form').classList.remove('active');
            clearEngineForm(dialog);
        });
        
        // 保存引擎
        dialog.querySelector('#save-engine').addEventListener('click', () => {
            const name = dialog.querySelector('#engine-name').value.trim();
            const urlTemplate = dialog.querySelector('#engine-url').value.trim();

            if (!name || !urlTemplate) {
                alert('请填写名称和搜索URL');
                return;
            }
            if (!urlTemplate.includes('{query}')) {
                alert('URL 中必须包含 {query}');
                return;
            }

            // 从 URL 自动推断 match 和 param
            let match = '', param = '', url = '';
            try {
                const dummy = urlTemplate.replace('{query}', 'ZZPLACEHOLDER');
                const u = new URL(dummy);
                match = u.hostname + u.pathname.replace(/\/$/, '');
                u.searchParams.forEach((v, k) => { if (v === 'ZZPLACEHOLDER') param = k; });
                url = urlTemplate.replace('{query}', '');
            } catch(_) {
                url = urlTemplate.replace('{query}', '');
            }
            const abbr = name.slice(0, 2);

            const editIdx = dialog.querySelector('#save-engine').dataset.editIdx;
            if (editIdx !== undefined && editIdx !== '') {
                CONFIG.engines[parseInt(editIdx)] = { name, abbr, url, match, param };
                dialog.querySelector('#save-engine').dataset.editIdx = '';
                dialog.querySelector('#se-form-title-label').textContent = '添加搜索引擎';
            } else {
                CONFIG.engines.push({ name, abbr, url, match, param });
            }
            GM_setValue('engines', CONFIG.engines);

            dialog.querySelector('#se-engine-form').classList.remove('active');
            clearEngineForm(dialog);
            renderEnginesList();
        });
        
        // 关闭设置
        dialog.querySelector('.se-close-settings').addEventListener('click', () => {
            dialog.classList.remove('active');
            location.reload();
        });
        
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.classList.remove('active');
                location.reload();
            }
        });

        // 导出：直接触发下载
        dialog.querySelector('#se-export-btn').addEventListener('click', () => {
            const data = JSON.stringify({ theme: CONFIG.theme, engines: CONFIG.engines }, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'search-engines.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        });

        // 导入：文件选择器
        dialog.querySelector('#se-import-btn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';
            input.addEventListener('change', () => {
                const file = input.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const parsed = JSON.parse(e.target.result);
                        if (parsed.engines && Array.isArray(parsed.engines) && parsed.engines.length) {
                            CONFIG.engines = parsed.engines;
                            GM_setValue('engines', CONFIG.engines);
                        }
                        if (parsed.theme === 'light' || parsed.theme === 'dark') {
                            GM_setValue('theme', parsed.theme);
                        }
                        alert('导入成功，即将刷新');
                        location.reload();
                    } catch(_) {
                        alert('文件格式错误，请选择正确的配置文件');
                    }
                };
                reader.readAsText(file);
            });
            input.click();
        });
    }

    // 清空表单
    function clearEngineForm(dialog) {
        dialog.querySelector('#engine-name').value = '';
        dialog.querySelector('#engine-url').value = '';
    }

    // 渲染引擎列表
    function renderEnginesList() {
        const list = document.querySelector('#se-engines-list');
        if (!list) return;

        list.innerHTML = '';

        CONFIG.engines.forEach((engine, index) => {
            const row = document.createElement('div');
            row.className = 'se-engine-row';

            row.innerHTML = `
                <div class="se-engine-row-info">
                    <div class="se-engine-row-name">${engine.name}</div>
                    <div class="se-engine-row-url">${engine.url}{query}</div>
                </div>
                <div class="se-engine-actions">
                    <button class="se-icon-btn up-btn" data-index="${index}" ${index === 0 ? 'disabled' : ''}>
                        ${ICONS.chevronUp}
                    </button>
                    <button class="se-icon-btn dn-btn" data-index="${index}" ${index === CONFIG.engines.length - 1 ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
                    </button>
                    <button class="se-icon-btn edit-btn" data-index="${index}">
                        ${ICONS.edit}
                    </button>
                    <button class="se-icon-btn del-btn" data-index="${index}">
                        ${ICONS.delete}
                    </button>
                </div>
            `;

            list.appendChild(row);
        });

        // 上移
        list.querySelectorAll('.up-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const i = parseInt(e.currentTarget.dataset.index);
                if (i === 0) return;
                [CONFIG.engines[i - 1], CONFIG.engines[i]] = [CONFIG.engines[i], CONFIG.engines[i - 1]];
                GM_setValue('engines', CONFIG.engines);
                renderEnginesList();
            });
        });

        // 下移
        list.querySelectorAll('.dn-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const i = parseInt(e.currentTarget.dataset.index);
                if (i === CONFIG.engines.length - 1) return;
                [CONFIG.engines[i], CONFIG.engines[i + 1]] = [CONFIG.engines[i + 1], CONFIG.engines[i]];
                GM_setValue('engines', CONFIG.engines);
                renderEnginesList();
            });
        });

        // 编辑
        list.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const i = parseInt(e.currentTarget.dataset.index);
                const eng = CONFIG.engines[i];
                const dialog = document.getElementById('se-settings-dialog');
                dialog.querySelector('#se-form-title-label').textContent = '编辑搜索引擎';
                dialog.querySelector('#engine-name').value = eng.name;
                dialog.querySelector('#engine-url').value = eng.url + '{query}';
                dialog.querySelector('#save-engine').dataset.editIdx = String(i);
                dialog.querySelector('#se-engine-form').classList.add('active');
                dialog.querySelector('#engine-name').focus();
            });
        });

        // 删除
        list.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const i = parseInt(e.currentTarget.dataset.index);
                if (confirm(`确定删除 ${CONFIG.engines[i].name}？`)) {
                    CONFIG.engines.splice(i, 1);
                    GM_setValue('engines', CONFIG.engines);
                    renderEnginesList();
                }
            });
        });
    }

    // 打开设置（任何页面都可用）
    function openSettings() {
        let dialog = document.getElementById('se-settings-dialog');
        if (!dialog) {
            // 非搜索页：按需创建样式和对话框
            createStyles();
            createSettingsDialog();
            dialog = document.getElementById('se-settings-dialog');
        }
        if (dialog) dialog.classList.add('active');
    }

    // 初始化
    function init() {
        createStyles();
        createUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
