// index.js

// 确保jQuery可用，Silly Tavern通常会全局暴露jQuery
// 检查 window.jQuery 和 window.$
const $ = (window.jQuery || window.$);

if (!$) {
    console.error('[EPhone Plugin] jQuery is not available. Plugin cannot initialize. Please ensure jQuery is loaded by Silly Tavern.');
    // 如果jQuery不可用，直接返回，防止后续报错
    return;
}

(async function() {
    const PLUGIN_ID = 'eephone-plugin'; // 确保这个ID与你的 manifest.json 中的插件文件夹名一致
    const PLUGIN_NAME = 'EPhone 消息查看器';
    const PLUGIN_VERSION = '1.0.0';

    console.log(`[${PLUGIN_NAME}] 插件开始初始化...`);

    // 等待DOM完全加载，并且Silly Tavern的UI元素可用
    $(document).ready(async function() {
        console.log(`[${PLUGIN_NAME}] DOM就绪回调执行，准备创建UI元素.`);

        try {
            createEPhoneButton();
            console.log(`[${PLUGIN_NAME}] createEPhoneButton 函数已成功调用.`);
        } catch (e) {
            console.error(`[${PLUGIN_NAME}] createEPhoneButton 函数执行时发生错误:`, e);
        }

        try {
            createEPhoneModal();
            console.log(`[${PLUGIN_NAME}] createEPhoneModal 函数已成功调用.`);
        } catch (e) {
            console.error(`[${PLUGIN_NAME}] createEPhoneModal 函数执行时发生错误:`, e);
        }

        console.log(`[${PLUGIN_NAME}] 插件初始化完成。`);
    });


    /**
     * 创建并添加EPhone按钮到Silly Tavern的界面
     */
    function createEPhoneButton() {
        const eephoneButton = $(`
            <div id="eephone-launcher-button" class="menu_button fa-solid fa-mobile-screen-button" title="打开EPhone">
                EPhone
            </div>
        `);

        const leftSendForm = $('#leftSendForm');
        if (leftSendForm.length) {
            leftSendForm.append(eephoneButton);
            console.log(`[${PLUGIN_NAME}] EPhone按钮已成功添加到 #leftSendForm. 按钮在DOM中是否存在: ${$('#eephone-launcher-button').length > 0}`);
        } else {
            console.warn(`[${PLUGIN_NAME}] 无法找到 #leftSendForm 元素，EPhone按钮可能无法显示。请检查Silly Tavern的DOM结构。`);
        }

        // 添加点击事件监听器
        eephoneButton.on('click', function() {
            console.log(`[${PLUGIN_NAME}] EPhone按钮被点击。尝试打开模态窗口...`);
            openEPhoneModal();
        });
    }

    /**
     * 创建用于显示eePhone.html内容的模态窗口的DOM结构
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

        // 调试：确认模态框元素是否已添加到DOM
        if ($('#eephone-modal-overlay').length === 0 || $('#eephone-iframe').length === 0) {
            console.error(`[${PLUGIN_NAME}] 警告: 模态框或iframe元素未成功添加到DOM中。`);
        }

        // 添加关闭按钮事件监听器
        $('#eephone-close-modal-btn').on('click', closeEPhoneModal);
        $('#eephone-modal-overlay').on('click', (event) => {
            // 如果点击的是 overlay 本身，而不是 modal-content 内部的任何元素
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
                // *** 核心修改：根据 Git 导入的 'third_party' 路径调整 ***
                // 确保 PLUGIN_ID 与您的插件文件夹名称一致
                const PLUGIN_FOLDER_NAME = PLUGIN_ID; // 例如 'eephone-plugin'
                // 构建相对于 Silly Tavern Web 服务器根目录的路径
                const eephoneHtmlPath = `./third_party/${PLUGIN_FOLDER_NAME}/eePhone.html`;
                console.log(`[${PLUGIN_NAME}] 尝试从路径: ${eephoneHtmlPath} 加载 eePhone.html`);

                const response = await fetch(eephoneHtmlPath);

                if (!response.ok) {
                    // 如果HTTP响应状态码不是2xx，则抛出错误
                    let errorMessage = `无法加载 EPhone 页面。HTTP 错误状态码: ${response.status}`;
                    if (response.status === 404) {
                        errorMessage += `. 文件可能不存在于路径: ${eephoneHtmlPath}`;
                    }
                    throw new Error(errorMessage);
                }

                const htmlContent = await response.text();
                console.log(`[${PLUGIN_NAME}] eePhone.html 内容已成功获取 (大小: ${htmlContent.length} 字节).`);

                const iframeDoc = eephoneIframe[0].contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(htmlContent);
                iframeDoc.close();
                console.log(`[${PLUGIN_NAME}] eePhone.html 内容已成功写入iframe。`);

                // 可以监听iframe的load事件，以确保其内容完全加载并执行
                eephoneIframe.on('load', () => {
                    console.log(`[${PLUGIN_NAME}] iframe 内容加载完成事件触发.`);
                    // 尝试从iframe内部的控制台打印，这在桌面浏览器调试有用
                    try {
                        eephoneIframe[0].contentWindow.console.log('[EPhone] Iframe loaded from Silly Tavern plugin.');
                    } catch (e) {
                        console.warn(`[${PLUGIN_NAME}] 无法访问iframe的contentWindow.console:`, e);
                    }
                });

            } catch (error) {
                console.error(`[${PLUGIN_NAME}] 加载 eePhone.html 过程中发生错误:`, error);
                // 在模态窗口内部显示详细的错误信息，便于手机端查看
                const iframeDoc = eephoneIframe[0].contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(`
                    <div style="padding: 20px; color: red; font-family: sans-serif; background-color: #444; border-radius: 5px; text-align: center;">
                        <h1 style="color: #ff6347;">加载 EPhone 失败</h1>
                        <p style="color: #ccc;">请检查插件文件是否完整且路径正确。</p>
                        <p style="font-size: 0.9em; word-break: break-all;"><strong>错误详情:</strong> ${error.message || error}</p>
                        <p style="font-size: 0.8em; color: #aaa;">请查看Silly Tavern的命令行/终端窗口获取更多调试信息。</p>
                    </div>
                `);
                iframeDoc.close();
            }
        } else {
            console.error(`[${PLUGIN_NAME}] 错误: 无法找到模态窗口的overlay或iframe元素。`);
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
                // 清空iframe内容，防止下次打开时显示旧内容，并释放资源
                eephoneIframe[0].srcdoc = '';
                console.log(`[${PLUGIN_NAME}] iframe 内容已清空。`);
            }
            console.log(`[${PLUGIN_NAME}] EPhone模态窗口已成功关闭。`);
        }
    }
})();
