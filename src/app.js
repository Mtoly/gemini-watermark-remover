import { WatermarkEngine } from './core/watermarkEngine.js';
import i18n from './i18n.js';
import { showLoading, hideLoading } from './utils.js';
import mediumZoom from 'medium-zoom';
import { getDomRefs } from './ui/domRefs.js';
import * as appState from './state/appState.js';
import { downloadAll } from './handlers/downloadHandler.js';
import { reset, updateDynamicTexts } from './ui/uiController.js';
import { handleFileSelect, handleFiles } from './handlers/fileHandler.js';
import { processSingle, processQueue } from './handlers/processHandler.js';

// dom elements references
let domRefs = null;

/**
 * initialize the application
 */
async function init() {
    try {
        await i18n.init();
        domRefs = getDomRefs();
        setupLanguageSwitch();
        showLoading(i18n.t('status.loading'));

        const engine = await WatermarkEngine.create();
        appState.setEngine(engine);

        hideLoading();
        setupEventListeners();

        const zoom = mediumZoom('[data-zoomable]', {
            margin: 24,
            scrollOffset: 0,
            background: 'rgba(255, 255, 255, .6)',
        });
        appState.setZoom(zoom);
    } catch (error) {
        hideLoading();
        console.error('初始化错误：', error);
    }
}

/**
 * setup language switch
 */
function setupLanguageSwitch() {
    const btn = domRefs.langSwitch;
    btn.textContent = i18n.locale === 'zh-CN' ? 'EN' : '中文';
    btn.addEventListener('click', async () => {
        const newLocale = i18n.locale === 'zh-CN' ? 'en-US' : 'zh-CN';
        await i18n.switchLocale(newLocale);
        btn.textContent = newLocale === 'zh-CN' ? 'EN' : '中文';
        updateDynamicTexts(domRefs);
    });
}

/**
 * setup event listeners
 */
function setupEventListeners() {
    domRefs.uploadArea.addEventListener('click', () => domRefs.fileInput.click());
    domRefs.fileInput.addEventListener('change', (e) => handleFileSelect(e, domRefs, (item) => processSingle(item, domRefs), () => processQueue(domRefs)));

    domRefs.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        domRefs.uploadArea.classList.add('dragover');
    });

    domRefs.uploadArea.addEventListener('dragleave', () => {
        domRefs.uploadArea.classList.remove('dragover');
    });

    domRefs.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        domRefs.uploadArea.classList.remove('dragover');
        handleFiles(Array.from(e.dataTransfer.files), domRefs, (item) => processSingle(item, domRefs), () => processQueue(domRefs));
    });

    domRefs.downloadAllBtn.addEventListener('click', downloadAll);
    domRefs.resetBtn.addEventListener('click', () => reset(domRefs));
}

init();
