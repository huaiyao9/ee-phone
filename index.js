// 确保在ST完全加载后执行
function initEEPhone() {
  // 1. 添加悬浮按钮
  const floatBtn = document.createElement('div');
  floatBtn.id = 'ee-phone-float-btn';
  floatBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path fill="#ffffff" d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z"/>
    </svg>
  `;
  
  // 2. 动态加载样式
  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = 'extensions/third-party/ee-phone/styles.css'; // 关键路径
  
  // 3. 注入手机界面容器
  const phoneContainer = document.createElement('div');
  phoneContainer.id = 'ee-phone-container';
  phoneContainer.innerHTML = `
    <iframe src="about:blank" id="ee-phone-iframe"></iframe>
    <button class="close-btn">×</button>
  `;

  // 添加到DOM
  document.head.appendChild(styleLink);
  document.body.appendChild(floatBtn);
  document.body.appendChild(phoneContainer);

  // 4. 加载HTML内容
  fetch('extensions/third-party/ee-phone/phone.html') // 关键路径
    .then(res => res.text())
    .then(html => {
      const iframe = document.getElementById('ee-phone-iframe');
      iframe.srcdoc = html;
    });
}

// 启动初始化
if (window.sillytavern) {
  initEEPhone();
} else {
  window.addEventListener('sillytavern-loaded', initEEPhone);
}