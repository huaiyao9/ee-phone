// 创建手机界面容器
const createPhoneContainer = () => {
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
    box-shadow: 0 20px 60px rgba(0,0,0,0.3), inset 0 0 10px rgba(0,0,0,0.1);
    overflow: hidden;
    display: none;
  `;
  
  // 添加关闭按钮
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
  closeBtn.onclick = () => {
    container.style.display = 'none';
  };
  
  // 添加iframe显示HTML内容
  const iframe = document.createElement('iframe');
  iframe.id = 'ee-phone-iframe';
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 30px;
  `;
  
  // 加载HTML内容（内联方式）
  iframe.srcdoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <base href="https://sharkpan.xyz/">
      <style>
        /* 这里放置你HTML中的所有CSS */
        ${document.querySelector('style').innerText}
      </style>
    </head>
    <body>
      <!-- 这里放置你HTML的主体内容 -->
      ${document.querySelector('#phone-frame').outerHTML}
      <script>
        // 这里放置你HTML中的所有JS
        ${document.querySelector('script').innerText}
        
        // 添加额外的关闭按钮处理
        document.addEventListener('click', (e) => {
          if (e.target.id === 'home-screen-btn') {
            window.parent.postMessage('closePhone', '*');
          }
        });
      </script>
    </body>
    </html>
  `;
  
  container.appendChild(iframe);
  container.appendChild(closeBtn);
  document.body.appendChild(container);
  
  // 监听来自iframe的消息
  window.addEventListener('message', (e) => {
    if (e.data === 'closePhone') {
      container.style.display = 'none';
    }
  });
  
  return container;
};

// 添加工具栏按钮
const addToolbarButton = () => {
  const toolbar = document.getElementById('toolbar');
  if (!toolbar) return;
  
  const button = document.createElement('button');
  button.id = 'ee-phone-btn';
  button.title = '打开ee的小手机';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z"/>
    </svg>
  `;
  
  button.style.cssText = `
    background: #add5ff;
    border: none;
    border-radius: 8px;
    padding: 6px;
    margin: 0 5px;
    cursor: pointer;
    transition: all 0.3s;
  `;
  
  button.onclick = () => {
    const container = document.getElementById('ee-phone-container') || createPhoneContainer();
    container.style.display = 'block';
    
    // 添加返回主页按钮到手机界面
    setTimeout(() => {
      const iframe = document.getElementById('ee-phone-iframe');
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      if (!iframeDoc.getElementById('home-screen-btn')) {
        const homeBtn = document.createElement('button');
        homeBtn.id = 'home-screen-btn';
        homeBtn.innerHTML = '‹ 返回';
        homeBtn.style.cssText = `
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(255,255,255,0.8);
          border: none;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 16px;
          z-index: 100;
          cursor: pointer;
        `;
        iframeDoc.body.appendChild(homeBtn);
      }
    }, 500);
  };
  
  toolbar.appendChild(button);
};

// 初始化插件
const initializePlugin = () => {
  // 确保只加载一次
  if (window.eePhonePluginLoaded) return;
  window.eePhonePluginLoaded = true;
  
  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    #ee-phone-container iframe {
      transition: all 0.5s ease;
    }
    
    #ee-phone-btn:hover {
      transform: scale(1.1);
      background: #8ac0ff;
    }
  `;
  document.head.appendChild(style);
  
  // 添加按钮
  addToolbarButton();
};

// 确保在ST完全加载后初始化
if (document.readyState === 'complete') {
  initializePlugin();
} else {
  window.addEventListener('load', initializePlugin);
}