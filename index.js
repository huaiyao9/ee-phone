// index.js

// 修正后的导入 Silly Tavern 内部模块的路径。
// 这些路径是基于插件位于 'third_party/ee-phone/' 目录的假设来修正的。
import { animation_duration, eventSource, event_types } from '../../script.js';     // 修正路径
import { power_user } from '../../power-user.js';                                 // 修正路径
import { retriggerFirstMessageOnEmptyChat, getUserAvatar, getUserAvatars, setUserAvatar, user_avatar } from '../../personas.js'; // 修正路径

// 确保jQuery可用，Silly Tavern通常会全局暴露jQuery
const $ = (window.jQuery || window.$);

if (!$) {
    console.error('[EPhone Plugin] jQuery is not available. Plugin cannot initialize.');
    alert('EPhone 插件错误：jQuery 未加载。插件无法运行。');
    return;
}


(async function() {
    const PLUGIN_ID = 'ee-phone'; // 确保这个ID与您的 Git 导入后的实际文件夹名称一致
    const PLUGIN_NAME = 'EPhone 消息查看器';
    const PLUGIN_VERSION = '1.0.0';

    console.log(`[${PLUGIN_NAME}] 插件脚本开始执行，尝试初始化...`);

    $(function() { // 等同于 $(document).ready(function() { ... });
        console.log(`[${PLUGIN_NAME}] DOM就绪。开始创建插件UI.`);

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

        // 使用 jQuery 的事件委托，绑定到 document
        $(document).on('click', '#eephone-launcher-button', function(event) {
            event.preventDefault();
            console.log(`[${PLUGIN_NAME}] EPhone 按钮被点击 (jQuery Document 委托)。尝试打开模态窗口...`);
            try {
                openEPhoneModal();
            } catch (e) {
                console.error(`[${PLUGIN_NAME}] openEPhoneModal 函数执行时发生错误:`, e);
            }
        });
        console.log(`[${PLUGIN_NAME}] jQuery document 委托点击事件监听器已附加。`);

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

        const leftSendForm = $('#leftSendForm');
        if (leftSendForm.length) {
            leftSendForm.append(eephoneButton);
            console.log(`[${PLUGIN_NAME}] EPhone按钮已成功添加到 #leftSendForm.`);
        } else {
            console.warn(`[${PLUGIN_NAME}] 无法找到 #leftSendForm 元素，尝试添加到 body 作为备用。`);
            $('body').append(eephoneButton);
        }
        console.log(`[${PLUGIN_NAME}] EPhone按钮 DOM 元素已创建。`);
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
                        eephoneIframe[0].contentWindow.eval("console.log('EPhone: iframe内部脚本执行成功');");
                    } catch (e) {
                        console.warn(`[${PLUGIN_NAME}] 无法访问iframe的contentWindow.console 或执行内部脚本:`, e);
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
