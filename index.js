// index.js

// 尝试导入Silly Tavern内部模块。
// 这些导入可能会根据Silly Tavern的版本或配置而有所不同。
// 如果导致插件完全无法加载（例如按钮不显示），可以考虑移除它们。
// 对于这个简单的UI插件，它们很可能不是必需的。
// 如果你在终端看到报错，并且按钮不显示，最先尝试注释掉或移除以下 import 块。
let animation_duration, eventSource, event_types, power_user, retriggerFirstMessageOnEmptyChat, getUserAvatar, getUserAvatars, setUserAvatar, user_avatar;

try {
    // 假设这些路径是正确的，但请注意，如果Silly Tavern版本差异大，可能需要调整
    ({ animation_duration, eventSource, event_types } = await import('../../script.js'));
    ({ power_user } = await import('../../../power-user.js'));
    ({ retriggerFirstMessageOnEmptyChat, getUserAvatar, getUserAvatars, setUserAvatar, user_avatar } = await import('../../../personas.js'));
    console.log('[EPhone Plugin] Optional Silly Tavern modules imported successfully.');
} catch (e) {
    console.warn('[EPhone Plugin] Could not import optional Silly Tavern modules. This might be normal for simple UI plugins, or indicate a compatibility issue. Error:', e);
    // 如果这些导入是导致按钮不显示的原因，可以尝试直接删除整个try-catch块，只保留下面的插件逻辑。
    // 对于按钮不显示的情况，优先尝试删除这个try-catch块，因为 async import 可能会导致脚本执行中断。
}


// --- 核心插件逻辑开始 ---
(function() {
    const PLUGIN_ID = 'ee-phone'; // *** 核心修改点：改为实际的文件夹名称 'ee-phone' ***
    const PLUGIN_NAME = 'EPhone 消息查看器';
    const PLUGIN_VERSION = '1.0.0';

    console.log(`[${PLUGIN_NAME}] 插件脚本开始执行...`);

    // 优先检查jQuery，使用更健壮的方式
    function getJQuery() {
        if (window.jQuery) {
            return window.jQuery;
        }
        console.warn(`[${PLUGIN_NAME}] jQuery (window.jQuery) is not immediately available. Will wait for DOMContentLoaded.`);
        return null;
    }

    let $ = getJQuery();

    // 在DOM内容完全加载后执行UI操作，确保Silly Tavern的基础结构已准备好
    document.addEventListener('DOMContentLoaded', async function() {
        $ = getJQuery(); // 再次尝试获取jQuery
        if (!$) {
            console.error(`[${PLUGIN_NAME}] DOMContentLoaded: jQuery is still not available. Plugin cannot initialize UI. Please check Silly Tavern's jQuery loading.`);
            return; // jQuery不可用，停止执行UI相关代码
        }
        console.log(`[${PLUGIN_NAME}] DOMContentLoaded: jQuery is available. 开始创建插件UI.`);

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

        console.log(`[${PLUGIN_NAME}] 插件UI初始化流程完成。`);
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

        // 尝试找到 #leftSendForm
        const leftSendForm = $('#leftSendForm');
        if (leftSendForm.length) {
            leftSendForm.append(eephoneButton);
            console.log(`[${PLUGIN_NAME}] EPhone按钮已成功添加到 #leftSendForm.`);
        } else {
            // 如果 #leftSendForm 不存在，可能是Silly Tavern版本差异或DOM结构变化
            // 作为备用，可以尝试添加到 body 或其他已知元素
            console.warn(`[${PLUGIN_NAME}] 无法找到 #leftSendForm 元素，尝试添加到 body。`);
            $('body').append(eephoneButton); // 备用方案，可能位置不理想但能显示
        }

        // 添加点击事件监听器
        eephoneButton.on('click', function() {
            console.log(`[${PLUGIN_NAME}] EPhone按钮被点击。尝试打开模态窗口...`);
            openEPhoneModal();
        });
        console.log(`[${PLUGIN_NAME}] EPhone按钮创建和事件绑定完成.`);
    }

    /**
     * 创建用于显示eePhone.html内容的模态窗口的DOM结构
     */
    function createEPhoneModal() {
        // 检查模态框是否已存在，防止重复添加
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

        // 调试：确认模态框元素是否已添加到DOM
        if ($('#eephone-modal-overlay').length === 0 || $('#eephone-iframe').length === 0) {
            console.error(`[${PLUGIN_NAME}] 错误: 模态框或iframe元素未成功添加到DOM中。`);
        }

        // 添加关闭按钮事件监听器
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
                // *** 核心路径：基于 'third_party' 目录，使用正确的文件夹名 'ee-phone' ***
                const PLUGIN_FOLDER_NAME = PLUGIN_ID; // 现在 PLUGIN_ID 已经是 'ee-phone'
                const eephoneHtmlPath = `./third_party/${PLUGIN_FOLDER_NAME}/eePhone.html`;
                console.log(`[${PLUGIN_NAME}] 尝试从路径: ${eephoneHtmlPath} 加载 eePhone.html`);

                const response = await fetch(eephoneHtmlPath);

                if (!response.ok) {
                    // 如果HTTP响应状态码不是2xx，则抛出错误
                    let errorMessage = `无法加载 EPhone 页面。HTTP 错误状态码: ${response.status}`;
                    if (response.status === 404) {
                        errorMessage += `. 文件可能不存在于路径: ${eephoneHtmlPath}。请检查文件位置和命名。`;
                    } else if (response.status === 403) {
                        errorMessage += `. 访问被拒绝。可能是权限问题。`;
                    }
                    throw new Error(errorMessage);
                }

                const htmlContent = await response.text();
                console.log(`[${PLUGIN_NAME}] eePhone.html 内容已成功获取 (大小: ${htmlContent.length} 字节).`);

                // 使用 srcdoc 属性来设置 iframe 的内容
                // 这是一个更安全且通常更有效的方法来加载动态HTML
                eephoneIframe.attr('srcdoc', htmlContent);

                console.log(`[${PLUGIN_NAME}] eePhone.html 内容已通过 srcdoc 写入iframe。`);

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
                // 清空iframe内容，防止下次打开时显示旧内容，并释放资源
                eephoneIframe.attr('srcdoc', ''); // 使用 srcdoc 清空
                console.log(`[${PLUGIN_NAME}] iframe 内容已清空。`);
            }
            console.log(`[${PLUGIN_NAME}] EPhone模态窗口已成功关闭。`);
        }
    }
})();
