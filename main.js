// main.js

(function() {
    // 检查Silly Tavern的UI是否已准备好
    if (typeof onModuleReady === 'undefined') {
        console.error('[EPhone Plugin] Silly Tavern module system not ready. Please ensure this script is loaded correctly.');
        return;
    }

    const PLUGIN_ID = 'eephone-plugin';
    const PLUGIN_NAME = 'EPhone 消息查看器';
    const PLUGIN_VERSION = '1.0.0';

    // 插件初始化函数
    async function initializePlugin() {
        console.log(`[${PLUGIN_NAME}] 插件开始初始化...`);

        // 1. 创建EPhone按钮
        createEPhoneButton();

        // 2. 创建模态窗口容器 (用于显示eePhone.html内容)
        createEPhoneModal();

        console.log(`[${PLUGIN_NAME}] 插件初始化完成。`);
    }

    /**
     * 创建并添加EPhone按钮到Silly Tavern的界面
     */
    function createEPhoneButton() {
        const eephoneButton = document.createElement('div');
        eephoneButton.id = 'eephone-launcher-button';
        eephoneButton.classList.add('menu_button', 'fa-solid', 'fa-mobile-screen-button'); // 使用fa-mobile-screen-button作为图标
        eephoneButton.title = '打开EPhone';
        eephoneButton.textContent = 'EPhone'; // 按钮文本

        // 将按钮添加到 #leftSendForm
        // 确保 #leftSendForm 元素存在，这是Silly Tavern的发送消息表单区域
        const leftSendForm = document.getElementById('leftSendForm');
        if (leftSendForm) {
            leftSendForm.append(eephoneButton);
            console.log(`[${PLUGIN_NAME}] EPhone按钮已添加到 #leftSendForm.`);
        } else {
            console.warn(`[${PLUGIN_NAME}] 无法找到 #leftSendForm 元素，EPhone按钮可能无法显示。`);
            // 如果 leftSendForm 不存在，可以尝试其他位置，或者延迟添加
            // For now, we'll just log a warning.
        }

        // 添加点击事件监听器
        eephoneButton.addEventListener('click', openEPhoneModal);
    }

    /**
     * 创建用于显示eePhone.html内容的模态窗口
     */
    function createEPhoneModal() {
        const modalHtml = `
            <div id="eephone-modal-overlay" style="
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 10000; /* 确保在Silly Tavern之上 */
                justify-content: center;
                align-items: center;
            ">
                <div id="eephone-modal-content" style="
                    background-color: #333;
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
                    width: 90%;
                    height: 90%;
                    max-width: 800px; /* 最大宽度 */
                    max-height: 600px; /* 最大高度 */
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    position: relative;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 10px 15px;
                        background-color: #222;
                        border-bottom: 1px solid #444;
                        color: white;
                        font-weight: bold;
                    ">
                        <span>EPhone</span>
                        <button id="eephone-close-modal-btn" style="
                            background: none;
                            border: none;
                            color: white;
                            font-size: 1.5em;
                            cursor: pointer;
                            padding: 0 5px;
                        ">&times;</button>
                    </div>
                    <iframe id="eephone-iframe" style="
                        flex-grow: 1;
                        width: 100%;
                        border: none;
                        background-color: white; /* 确保iframe背景色 */
                    "></iframe>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 添加关闭按钮事件监听器
        document.getElementById('eephone-close-modal-btn').addEventListener('click', closeEPhoneModal);
        document.getElementById('eephone-modal-overlay').addEventListener('click', (event) => {
            if (event.target.id === 'eephone-modal-overlay') {
                closeEPhoneModal();
            }
        });

        console.log(`[${PLUGIN_NAME}] EPhone模态窗口容器已创建。`);
    }

    /**
     * 打开EPhone模态窗口并加载HTML内容
     */
    async function openEPhoneModal() {
        const modalOverlay = document.getElementById('eephone-modal-overlay');
        const eephoneIframe = document.getElementById('eephone-iframe');

        if (modalOverlay && eephoneIframe) {
            modalOverlay.style.display = 'flex'; // 显示模态窗口

            try {
                // 通过fetch API加载eePhone.html内容
                // 假设 eePhone.html 与 main.js 在同一目录下，或在 plugin 目录的根目录
                const response = await fetch(`./plugins/${PLUGIN_ID}/eePhone.html`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const htmlContent = await response.text();

                // 将HTML内容写入iframe的document
                eephoneIframe.contentWindow.document.open();
                eephoneIframe.contentWindow.document.write(htmlContent);
                eephoneIframe.contentWindow.document.close();
                console.log(`[${PLUGIN_NAME}] eePhone.html 内容已加载到iframe。`);

                // 调试：确保iframe中的脚本执行
                eephoneIframe.onload = () => {
                    console.log(`[${PLUGIN_NAME}] iframe 加载完成。尝试访问 iframe 的 console:`);
                    try {
                        // 如果 eePhone.html 中有 console.log，这里会显示在主控制台
                        // eephoneIframe.contentWindow.console.log('Test from main plugin into iframe console');
                    } catch (e) {
                        console.warn(`[${PLUGIN_NAME}] 无法访问 iframe console:`, e);
                    }
                };

            } catch (error) {
                console.error(`[${PLUGIN_NAME}] 加载 eePhone.html 失败:`, error);
                // 显示错误信息在模态窗口内
                eephoneIframe.contentWindow.document.open();
                eephoneIframe.contentWindow.document.write(`
                    <div style="padding: 20px; color: red; font-family: sans-serif;">
                        <h1>加载 EPhone 失败</h1>
                        <p>无法加载 EPhone 页面。请确保 'eePhone.html' 文件存在于插件目录下。</p>
                        <p>错误信息: ${error.message}</p>
                    </div>
                `);
                eephoneIframe.contentWindow.document.close();
            }
            console.log(`[${PLUGIN_NAME}] EPhone模态窗口已打开。`);
        }
    }

    /**
     * 关闭EPhone模态窗口
     */
    function closeEPhoneModal() {
        const modalOverlay = document.getElementById('eephone-modal-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none'; // 隐藏模态窗口
            console.log(`[${PLUGIN_NAME}] EPhone模态窗口已关闭。`);
            // 清空iframe内容，防止下次打开时显示旧内容
            const eephoneIframe = document.getElementById('eephone-iframe');
            if (eephoneIframe) {
                eephoneIframe.srcdoc = ''; // 或者设置一个空白页面
            }
        }
    }

    // 注册插件到Silly Tavern的模块系统
    onModuleReady({
        id: PLUGIN_ID,
        name: PLUGIN_NAME,
        description: `插件版本: ${PLUGIN_VERSION}\n${PLUGIN_NAME}可以在独立的弹出窗口中显示您的EPhone应用。`,
        version: PLUGIN_VERSION,
        author: '您的名字/组织', // 替换为您的名字
        license: 'MIT', // 或其他适合您的许可证

        // 插件初始化回调
        init: initializePlugin,

        // 如果需要，可以在这里添加设置面板或UI元素
        // settings: {
        //     'setting_key': {
        //         'label': '设置项',
        //         'type': 'checkbox',
        //         'default': true
        //     }
        // }
    });
})();