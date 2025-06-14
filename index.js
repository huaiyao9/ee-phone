// index.js

// 彻底移除所有 import 语句，因为它们可能导致脚本在某些环境中无法解析或执行。
// 对于一个主要操作DOM和显示HTML的插件，通常不需要这些。

// --- 核心插件逻辑开始 ---
(function() {
    // 确保 PLUGIN_ID 与您的 Git 导入后的实际文件夹名称一致
    const PLUGIN_ID = 'ee-phone'; // *** 确认：与 third_party 文件夹下的 'ee-phone' 匹配 ***
    const PLUGIN_NAME = 'EPhone 消息查看器';
    const PLUGIN_VERSION = '1.0.0';

    console.log(`[${PLUGIN_NAME}] 插件脚本开始执行...`);

    // 优先检查jQuery，但我们的点击事件现在不依赖它
    function getJQuery() {
        if (window.jQuery) {
            return window.jQuery;
        }
        console.warn(`[${PLUGIN_NAME}] jQuery (window.jQuery) is not immediately available. Some jQuery-dependent features might not work.`);
        return null;
    }

    let $ = getJQuery(); // 仍然获取jQuery以用于DOM操作，但点击事件独立

    // 在DOM内容完全加载后执行UI操作，确保Silly Tavern的基础结构已准备好
    // 使用 document.readyState 检查以应对不同加载时机
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPluginUI);
    } else {
        initPluginUI();
    }

    async function initPluginUI() {
        $ = getJQuery(); // 再次尝试获取jQuery
        if (!$) {
            console.error(`[${PLUGIN_NAME}] DOMContentLoaded: jQuery is still not available. Some plugin features might be limited.`);
            // 我们会继续尝试创建按钮，因为原生事件可以工作
        }
        console.log(`[${PLUGIN_NAME}] DOMContentLoaded: DOM 已就绪。开始创建插件UI.`);

        try {
            createEPhoneButton();
            console.log(`[${PLUGIN_NAME}] createEPhoneButton 函数已调用.`);
        } catch (e) {
            console.error(`[${PLUGIN_NAME}] createEPhoneButton 函数执行时发生错误:`, e);
        }

        try {
            createEPhoneModal();
            console.log(`[${PLUGIN_NAME}] createEPhoneModal 函数已调用.`);
        } catch (e) {
            console.error(`[${PLUGIN_NAME}] createEPhoneModal 函数执行时发生错误:`, e);
        }

        // --- 核心修改：使用原生 JavaScript 事件监听器 ---
        // 查找按钮元素
        const buttonElement = document.getElementById('eephone-launcher-button');
        if (buttonElement) {
            buttonElement.addEventListener('click', function() {
                console.log(`[${PLUGIN_NAME}] EPhone 按钮被点击 (原生事件)。尝试打开模态窗口...`);
                try {
                    openEPhoneModal();
                } catch (e) {
                    console.error(`[${PLUGIN_NAME}] openEPhoneModal 函数执行时发生错误:`, e);
                }
            });
            console.log(`[${PLUGIN_NAME}] 原生点击事件监听器已附加到 #eephone-launcher-button。`);
        } else {
            console.error(`[${PLUGIN_NAME}] 错误: 无法找到 #eephone-launcher-button 元素以附加原生事件监听器。`);
        }

        console.log(`[${PLUGIN_NAME}] 插件UI初始化流程完成。`);
    }


    /**
     * 创建并添加EPhone按钮到Silly Tavern的界面
     */
    function createEPhoneButton() {
        // 由于我们切换到原生事件，这里我们创建原生DOM元素，或者继续使用jQuery创建再转换为原生
        // 为了兼容性，我们仍然使用jQuery来操作DOM，但事件绑定使用原生JS
        const eephoneButtonHtml = `
            <div id="eephone-launcher-button" class="menu_button fa-solid fa-mobile-screen-button" title="打开EPhone">
                EPhone
            </div>
        `;

        const leftSendForm = $('#leftSendForm');
        if (leftSendForm.length) {
            leftSendForm.append(eephoneButtonHtml); // 仍使用jQuery append
            console.log(`[${PLUGIN_NAME}] EPhone按钮已成功添加到 #leftSendForm.`);
        } else {
            console.warn(`[${PLUGIN_NAME}] 无法找到 #leftSendForm 元素，尝试添加到 body 作为备用。`);
            $('body').append(eephoneButtonHtml);
        }
        console.log(`[${PLUGIN_NAME}] EPhone按钮 DOM 元素已创建。`);
        // 注意：事件监听器现在在 initPluginUI 中通过原生 addEventListener 附加。
    }

    /**
     * 创建用于显示eePhone.html内容的模态窗口的DOM结构
     */
    function createEPhoneModal() {
        if ($('#eephone-modal-overlay').length > 0) {
            console.log(`[${PLUGIN_NAME}] 模态框已存在，跳过创建。`);
            return;
        }

        const modalHtml = `
            <div id="eephone-modal-overlay" class="eephone-modal-overlay">
                <div id="eephone-modal-content" class="eephone-modal-content">
                    <div class="eephone-modal-header">
                        <span>EPhone</span>
                        <button id="eephone-close-modal-btn" class="eephone-close-modal-btn">&times;</button>
                    </div>
                    <iframe id="eephone-iframe" class="eephone-iframe" allow="autoplay; encrypted-media"></iframe>
                </div>
            </div>
        `;
        $('body').append(modalHtml);

        if ($('#eephone-modal-overlay').length === 0 || $('#eephone-iframe').length === 0) {
            console.error(`[${PLUGIN_NAME}] 错误: 模态框或iframe元素未成功添加到DOM中。`);
        }

        // 关闭按钮依然使用jQuery方便
        $('#eephone-close-modal-btn').on('click', closeEPhoneModal);
        $('#eephone-modal-overlay').on('click', (event) => {
            if ($(event.target).is('#eephone-modal-overlay')) {
                closeEPhoneModal();
            }
        });
        console.log(`[${PLUGIN_NAME}] EPhone模态窗口容器已创建并绑定事件。`);
    }

    /**
     * 打开EPhone模态窗口并加载HTML内容
     */
    async function openEPhoneModal() {
        console.log(`[${PLUGIN_NAME}] openEPhoneModal 函数被调用，开始显示模态窗口并加载HTML.`);
        const modalOverlay = $('#eephone-modal-overlay');
        const eephoneIframe = $('#eephone-iframe');

        if (modalOverlay.length && eephoneIframe.length) {
            modalOverlay.css('display', 'flex'); // 显示模态窗口
            console.log(`[${PLUGIN_NAME}] 模态窗口显示属性已设置为 'flex'.`);

            try {
                const PLUGIN_FOLDER_NAME = PLUGIN_ID; // 'ee-phone'
                const eephoneHtmlPath = `./third_party/${PLUGIN_FOLDER_NAME}/eePhone.html`;
                console.log(`[${PLUGIN_NAME}] 尝试从路径: ${eephoneHtmlPath} 加载 eePhone.html`);

                const response = await fetch(eephoneHtmlPath);

                if (!response.ok) {
                    let errorMessage = `无法加载 EPhone 页面。HTTP 错误状态码: ${response.status}.`;
                    if (response.status === 404) {
                        errorMessage += ` 文件可能不存在于路径: ${eephoneHtmlPath}。请检查文件位置和命名。`;
                    } else if (response.status === 403) {
                        errorMessage += ` 访问被拒绝。可能是权限问题。`;
                    }
                    throw new Error(errorMessage);
                }

                const htmlContent = await response.text();
                console.log(`[${PLUGIN_NAME}] eePhone.html 内容已成功获取 (大小: ${htmlContent.length} 字节).`);

                eephoneIframe.attr('srcdoc', htmlContent);
                console.log(`[${PLUGIN_NAME}] eePhone.html 内容已通过 srcdoc 写入iframe。`);

                eephoneIframe.on('load', () => {
                    console.log(`[${PLUGIN_NAME}] iframe 内容加载完成事件触发.`);
                    try {
                        eephoneIframe[0].contentWindow.console.log('[EPhone] Iframe loaded from Silly Tavern plugin.');
                    } catch (e) {
                        console.warn(`[${PLUGIN_NAME}] 无法访问iframe的contentWindow.console:`, e);
                    }
                });

            } catch (error) {
                console.error(`[${PLUGIN_NAME}] 加载 eePhone.html 过程中发生错误:`, error);
                const iframeDoc = eephoneIframe[0].contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(`
                    <div style="padding: 20px; color: red; font-family: sans-serif; background-color: #444; border-radius: 5px; text-align: center;">
                        <h1 style="color: #ff6347;">加载 EPhone 失败</h1>
                        <p style="color: #ccc;">请检查插件文件是否完整且路径正确。</p>
                        <p style="font-size: 0.9em; word-break: break-all;"><strong>错误详情:</strong> ${error.message || error}</p>
                        <p style="font-size: 0.8em; color: #aaa;">请查看Silly Tavern的命令行/Termux窗口获取更多调试信息。</p>
                        <p style="font-size: 0.8em; color: #aaa;">插件文件夹名是否是 'ee-phone' ?</p>
                    </div>
                `);
                iframeDoc.close();
            }
        } else {
            console.error(`[${PLUGIN_NAME}] 错误: 无法找到模态窗口的overlay或iframe元素。这可能发生在 'createEPhoneModal' 函数失败时。`);
        }
    }

    /**
     * 关闭EPhone模态窗口
     */
    function closeEPhoneModal() {
        console.log(`[${PLUGIN_NAME}] closeEPhoneModal 函数被调用，关闭模态窗口.`);
        const modalOverlay = $('#eephone-modal-overlay');
        if (modalOverlay.length) {
            modalOverlay.css('display', 'none'); // 隐藏模态窗口
            const eephoneIframe = $('#eephone-iframe');
            if (eephoneIframe.length) {
                eephoneIframe.attr('srcdoc', ''); // 清空iframe内容
                console.log(`[${PLUGIN_NAME}] iframe 内容已清空。`);
            }
            console.log(`[${PLUGIN_NAME}] EPhone模态窗口已成功关闭。`);
        }
    }
})();
