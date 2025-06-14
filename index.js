// index.js

// 假设这些是Silly Tavern内部的模块导入，根据您提供的示例插件
// 实际这些路径可能需要根据您的Silly Tavern版本和安装方式进行微调
// 如果以下导入导致错误，可能需要移除或调整
// import { eventSource, event_types } from '../../../../script.js';
// import { power_user } from '../../../power-user.js';
// import { retriggerFirstMessageOnEmptyChat, getUserAvatar, getUserAvatars, setUserAvatar, user_avatar } from '../../../personas.js';

// 我们不直接使用这些模块，所以为了避免潜在的导入错误，我们先注释掉或简化
// 如果在Silly Tavern启动时，这些导入导致插件加载失败，则需要删除这些行。
// 通常，对于一个简单的UI插件，可能不需要这些复杂的内部模块。

// 确保jQuery可用，Silly Tavern通常会全局暴露jQuery
const $ = (window.jQuery || window.$);

if (!$) {
    console.error('[EPhone Plugin] jQuery is not available. Plugin cannot initialize.');
}


(async function() {
    const PLUGIN_ID = 'eephone-plugin';
    const PLUGIN_NAME = 'EPhone 消息查看器';
    const PLUGIN_VERSION = '1.0.0';

    console.log(`[${PLUGIN_NAME}] 插件开始初始化...`);

    // 等待DOM完全加载，并且Silly Tavern的UI元素可用
    // 这是关键，因为 $('#leftSendForm') 可能在页面加载的早期不可用
    $(document).ready(async function() {
        console.log(`[${PLUGIN_NAME}] DOM就绪，开始创建UI元素.`);

        // 1. 创建EPhone按钮
        createEPhoneButton();

        // 2. 创建模态窗口容器 (用于显示eePhone.html内容)
        createEPhoneModal();

        console.log(`[${PLUGIN_NAME}] 插件初始化完成。`);
    });


    /**
     * 创建并添加EPhone按钮到Silly Tavern的界面
     */
    function createEPhoneButton() {
        // 使用与Silly Tavern其他按钮类似的结构和类
        const eephoneButton = $(`
            <div id="eephone-launcher-button" class="menu_button fa-solid fa-mobile-screen-button" title="打开EPhone">
                EPhone
            </div>
        `);

        // 将按钮添加到 #leftSendForm
        const leftSendForm = $('#leftSendForm');
        if (leftSendForm.length) {
            // 使用append，保持在发送框左侧
            leftSendForm.append(eephoneButton);
            console.log(`[${PLUGIN_NAME}] EPhone按钮已添加到 #leftSendForm.`);
        } else {
            console.warn(`[${PLUGIN_NAME}] 无法找到 #leftSendForm 元素，EPhone按钮可能无法显示。`);
            // 备用位置，如果 #leftSendForm 不存在，可以尝试添加到其他可见区域
            // 例如：$('body').append(eephoneButton);
        }

        // 添加点击事件监听器
        eephoneButton.on('click', openEPhoneModal);
    }

    /**
     * 创建用于显示eePhone.html内容的模态窗口
     */
    function createEPhoneModal() {
        const modalHtml = `
            <div id="eephone-modal-overlay" class="eephone-modal-overlay">
                <div id="eephone-modal-content" class="eephone-modal-content">
                    <div class="eephone-modal-header">
                        <span>EPhone</span>
                        <button id="eephone-close-modal-btn" class="eephone-close-modal-btn">&times;</button>
                    </div>
                    <iframe id="eephone-iframe" class="eephone-iframe"></iframe>
                </div>
            </div>
        `;
        $('body').append(modalHtml);

        // 添加关闭按钮事件监听器
        $('#eephone-close-modal-btn').on('click', closeEPhoneModal);
        $('#eephone-modal-overlay').on('click', (event) => {
            // 如果点击的是 overlay 本身，而不是 modal-content 内部
            if ($(event.target).is('#eephone-modal-overlay')) {
                closeEPhoneModal();
            }
        });

        console.log(`[${PLUGIN_NAME}] EPhone模态窗口容器已创建。`);
    }

    /**
     * 打开EPhone模态窗口并加载HTML内容
     */
    async function openEPhoneModal() {
        const modalOverlay = $('#eephone-modal-overlay');
        const eephoneIframe = $('#eephone-iframe');

        if (modalOverlay.length && eephoneIframe.length) {
            modalOverlay.css('display', 'flex'); // 显示模态窗口

            try {
                // 构建正确的HTML文件路径
                // 根据 manifest.json 机制，插件的文件通常在 `extensions/<plugin_id>/` 目录下
                const eephoneHtmlPath = `./extensions/${PLUGIN_ID}/eePhone.html`;
                console.log(`[${PLUGIN_NAME}] 尝试从 ${eephoneHtmlPath} 加载 eePhone.html`);

                const response = await fetch(eephoneHtmlPath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} from ${eephoneHtmlPath}`);
                }
                const htmlContent = await response.text();

                // 将HTML内容写入iframe的document
                const iframeDoc = eephoneIframe[0].contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(htmlContent);
                iframeDoc.close();

                console.log(`[${PLUGIN_NAME}] eePhone.html 内容已加载到iframe。`);

                // 可以在这里添加iframe加载完成的监听器，用于调试
                // eephoneIframe.on('load', () => {
                //     console.log(`[${PLUGIN_NAME}] iframe DOM loaded.`);
                // });

            } catch (error) {
                console.error(`[${PLUGIN_NAME}] 加载 eePhone.html 失败:`, error);
                // 显示错误信息在模态窗口内
                const iframeDoc = eephoneIframe[0].contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(`
                    <div style="padding: 20px; color: red; font-family: sans-serif; background-color: #444; border-radius: 5px;">
                        <h1>加载 EPhone 失败</h1>
                        <p>无法加载 EPhone 页面。请确保 'eePhone.html' 文件存在于插件目录下。</p>
                        <p>错误信息: ${error.message}</p>
                    </div>
                `);
                iframeDoc.close();
            }
            console.log(`[${PLUGIN_NAME}] EPhone模态窗口已打开。`);
        }
    }

    /**
     * 关闭EPhone模态窗口
     */
    function closeEPhoneModal() {
        const modalOverlay = $('#eephone-modal-overlay');
        if (modalOverlay.length) {
            modalOverlay.css('display', 'none'); // 隐藏模态窗口
            console.log(`[${PLUGIN_NAME}] EPhone模态窗口已关闭。`);
            // 清空iframe内容，防止下次打开时显示旧内容
            const eephoneIframe = $('#eephone-iframe');
            if (eephoneIframe.length) {
                eephoneIframe[0].srcdoc = ''; // 清空iframe内容
            }
        }
    }

})();