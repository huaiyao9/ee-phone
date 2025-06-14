// index.js (EPhone 消息查看器插件 - 专注于功能)

// 确认这些 import 路径对您的环境是正确的
// 这是根据您提供的 Quick Persona 插件工作路径确定的
import { animation_duration, eventSource, event_types } from '../../../../script.js';
import { power_user } from '../../../power-user.js';
import { retriggerFirstMessageOnEmptyChat, getUserAvatar, getUserAvatars, setUserAvatar, user_avatar } from '../../../personas.js';

// 确保jQuery可用
const $ = (window.jQuery || window.$);

if (!$) {
    // 如果jQuery不可用，通过 alert 提示，因为 console.log 可能不可见
    alert('EPhone 插件错误：jQuery 未加载。插件无法运行。');
    return;
}

const PLUGIN_ID = 'ee-phone'; // 确保这个ID与您的实际文件夹名称一致
const PLUGIN_NAME = 'EPhone 消息查看器';

// 使用 jQuery 的 ready 函数，确保 DOM 完全加载后再操作 UI
jQuery(() => {
    // 创建并添加 EPhone 按钮
    function createEPhoneButton() {
        const eephoneButton = $(`
            <div id="eephone-launcher-button" class="menu_button fa-solid fa-mobile-screen-button" title="打开EPhone">
                EPhone
            </div>
        `);

        const leftSendForm = $('#leftSendForm');
        if (leftSendForm.length) {
            leftSendForm.append(eephoneButton);
        } else {
            // 备用方案，如果找不到 #leftSendForm，则添加到 body
            $('body').append(eephoneButton);
        }
    }

    // 创建用于显示 eePhone.html 内容的模态窗口的 DOM 结构
    function createEPhoneModal() {
        if ($('#eephone-modal-overlay').length > 0) {
            return; // 模态框已存在，不重复创建
        }

        const modalHtml = `
            <div id="eephone-modal-overlay" class="eephone-modal-overlay">
                <div id="eephone-modal-content" class="eephone-modal-content">
                    <div class="eephone-modal-header">
                        <span>${PLUGIN_NAME}</span>
                        <button id="eephone-close-modal-btn" class="eephone-close-modal-btn">&times;</button>
                    </div>
                    <iframe id="eephone-iframe" class="eephone-iframe" allow="autoplay; encrypted-media"></iframe>
                </div>
            </div>
        `;
        $('body').append(modalHtml);

        // 绑定关闭按钮和点击 overlay 关闭模态框的事件
        $('#eephone-close-modal-btn').on('click', closeEPhoneModal);
        $('#eephone-modal-overlay').on('click', (event) => {
            // 只有点击到 overlay 本身时才关闭，不包括点击 content 内部
            if ($(event.target).is('#eephone-modal-overlay')) {
                closeEPhoneModal();
            }
        });
    }

    // 打开 EPhone 模态窗口并加载 HTML 内容
    async function openEPhoneModal() {
        const modalOverlay = $('#eephone-modal-overlay');
        const eephoneIframe = $('#eephone-iframe');

        if (modalOverlay.length && eephoneIframe.length) {
            modalOverlay.css('display', 'flex'); // 显示模态窗口

            try {
                // EPhone HTML 的加载路径。这是相对于 Silly Tavern 的根 URL。
                // 对应 'public/scripts/extensions/third-party/ee-phone/' 路径
                const eephoneHtmlPath = `./public/scripts/extensions/third-party/${PLUGIN_ID}/eePhone.html`;

                const response = await fetch(eephoneHtmlPath);

                if (!response.ok) {
                    throw new Error(`HTTP 错误状态码: ${response.status}. 无法加载文件: ${eephoneHtmlPath}`);
                }

                const htmlContent = await response.text();
                eephoneIframe.attr('srcdoc', htmlContent); // 使用 srcdoc 加载 HTML 内容

                // 可以在 iframe 加载完成后执行一些内部脚本或调试
                eephoneIframe.on('load', () => {
                    // 尝试在 iframe 内部执行一个 console.log，看浏览器开发者工具里有没有
                    try {
                        eephoneIframe[0].contentWindow.console.log(`[${PLUGIN_NAME} - Iframe] eePhone.html 已成功加载并显示.`);
                    } catch (e) {
                        // 跨域或安全策略可能阻止访问 iframe 内部控制台
                    }
                });

            } catch (error) {
                // 如果加载 HTML 失败，在 iframe 内部显示错误信息
                const iframeDoc = eephoneIframe[0].contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(`
                    <div style="padding: 20px; color: red; font-family: sans-serif; background-color: #444; border-radius: 5px; text-align: center;">
                        <h1 style="color: #ff6347;">加载 EPhone 页面失败</h1>
                        <p style="color: #ccc;">请检查插件文件是否完整且路径正确。</p>
                        <p style="font-size: 0.9em; word-break: break-all;"><strong>错误详情:</strong> ${error.message || error}</p>
                    </div>
                `);
                iframeDoc.close();
            }
        } else {
            alert(`[${PLUGIN_NAME}] 错误: 无法找到模态窗口的overlay或iframe元素。`);
        }
    }

    // 关闭 EPhone 模态窗口
    function closeEPhoneModal() {
        const modalOverlay = $('#eephone-modal-overlay');
        if (modalOverlay.length) {
            modalOverlay.css('display', 'none'); // 隐藏模态窗口
            const eephoneIframe = $('#eephone-iframe');
            if (eephoneIframe.length) {
                eephoneIframe.attr('srcdoc', ''); // 清空 iframe 内容，释放资源
            }
        }
    }

    // ===== 插件初始化流程 =====
    try {
        createEPhoneButton(); // 创建 EPhone 按钮
        createEPhoneModal();  // 创建 EPhone 模态框

        // 绑定 EPhone 按钮的点击事件 (使用 jQuery 的委托)
        $(document).on('click', '#eephone-launcher-button', function(event) {
            event.preventDefault();
            openEPhoneModal();
        });

    } catch (e) {
        // 捕获任何初始化阶段的错误，并弹出警报
        alert(`[${PLUGIN_NAME}] 插件初始化时发生错误: ${e.message || e}`);
    }
});
