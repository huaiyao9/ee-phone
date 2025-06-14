// 创建悬浮按钮
function createFloatingButton() {
  // 避免重复创建
  if (document.getElementById('ee-phone-float-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'ee-phone-float-btn';
  btn.title = '打开小手机';
  btn.innerHTML = '📱';
  btn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #add5ff, #4c79b4);
    color: white;
    font-size: 24px;
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    cursor: pointer;
    z-index: 9998;
    transition: all 0.3s;
  `;

  // 悬停效果
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  });

  // 点击打开手机界面
  btn.addEventListener('click', () => {
    const container = document.getElementById('ee-phone-container') || createPhoneContainer();
    container.style.display = 'block';
  });

  document.body.appendChild(btn);
}

// 创建手机界面容器（和之前相同）
function createPhoneContainer() {
  const container = document.createElement('div');
  container.id = 'ee-phone-container';
  container.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 340px;
    height: 85vh;
    max-height: 700px;
    z-index: 9999;
    background: #f0f0f0;
    border-radius: 30px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    overflow: hidden;
    display: none;
  `;

  // 关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: -35px;
    right: 0;
    background: #ff6b6b;
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    z-index: 10000;
  `;
  closeBtn.addEventListener('click', () => {
    container.style.display = 'none';
  });

  // iframe加载HTML内容
  const iframe = document.createElement('iframe');
  iframe.srcdoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <base href="https://sharkpan.xyz/">
      <style>${document.querySelector('style').innerText}</style>
    </head>
    <body>
      ${document.querySelector('#phone-frame').outerHTML}
      <script>${document.querySelector('script').innerText}</script>
    </body>
    </html>
  `;
  iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:30px;';

  container.appendChild(iframe);
  container.appendChild(closeBtn);
  document.body.appendChild(container);

  return container;
}

// 初始化插件
function initPlugin() {
  createFloatingButton();
  
  // 添加全局样式
  const style = document.createElement('style');
  style.textContent = `
    #ee-phone-float-btn:hover {
      opacity: 0.9;
    }
    #ee-phone-container {
      transition: opacity 0.3s;
    }
  `;
  document.head.appendChild(style);
}

// 确保页面加载完成后执行
if (document.readyState === 'complete') {
  initPlugin();
} else {
  window.addEventListener('load', initPlugin);
}
