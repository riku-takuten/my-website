// 聊天切换逻辑
const welcome = document.getElementById('welcome');
const bgCanvas = document.getElementById('bg-canvas');
const bottomInput = document.getElementById('bottomInput');
const chatContainer = document.getElementById('chatContainer');
const chatHistory = document.getElementById('chatHistory');
const chatInput = document.getElementById('chatInput');
const bottomChatInput = document.getElementById('bottomChatInput');
const backBtn = document.getElementById('backBtn');
const cleanBtn = document.getElementById('cleanBtn');
let hasChatted = false;
function startChat() {
  const text = bottomChatInput.value.trim();
  if (!text) return;
  // 隐藏欢迎语和底部输入，显示全屏聊天
  welcome.style.display = 'none';
  bgCanvas.style.display = 'none';
  bottomInput.classList.add('hide');
  chatContainer.classList.add('active');
  backBtn.style.display = 'block'; // 显示back按钮
  cleanBtn.style.display = 'block'; // 显示clean按钮
  hasChatted = true;
  appendMessage(text, 'user');
  bottomChatInput.value = ''; // 发送后清空输入框
  setTimeout(() => chatInput.focus(), 100); // 确保输入框聚焦
  sendToBot(text);
}
bottomChatInput.addEventListener('keydown', function(e){
  if(e.key === 'Enter') startChat();
});
// 聊天消息渲染
function appendMessage(text, sender) {
  const msg = document.createElement('div');
  msg.className = 'chat-message ' + sender;
  const avatar = document.createElement('img');
  avatar.className = 'avatar' + (sender === 'bot' ? ' bot' : '');
  avatar.src = sender === 'user'
    ? 'https://api.dicebear.com/7.x/shapes/svg?seed=Riku&backgroundColor=232526,2c5364&radius=50'
    : 'https://api.dicebear.com/7.x/shapes/svg?seed=assistant&backgroundColor=414345,00ffc3&radius=50';
  const msgContent = document.createElement('div');
  msgContent.className = 'msg-content';
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = sender === 'user' ? 'Riku' : 'assistant';
  const textNode = document.createElement('span');
  textNode.textContent = text;
  msgContent.appendChild(name);
  msgContent.appendChild(textNode);
  if(sender === 'user'){
    msg.appendChild(msgContent);
    msg.appendChild(avatar);
  }else{
    msg.appendChild(avatar);
    msg.appendChild(msgContent);
  }
  chatHistory.appendChild(msg);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}
// 聊天输入
function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  appendMessage(text, 'user');
  chatInput.value = '';
  sendToBot(text);
}
chatInput.addEventListener('keydown', function(e){
  if(e.key === 'Enter') sendMessage();
});
// 机器人回复
function sendToBot(text) {
  // 先渲染一个空的bot消息
  const msg = document.createElement('div');
  msg.className = 'chat-message bot';
  const avatar = document.createElement('img');
  avatar.className = 'avatar bot';
  avatar.src = 'https://api.dicebear.com/7.x/shapes/svg?seed=assistant&backgroundColor=414345,00ffc3&radius=50';
  const msgContent = document.createElement('div');
  msgContent.className = 'msg-content';
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = 'assistant';
  const textNode = document.createElement('span');
  textNode.textContent = '';
  msgContent.appendChild(name);
  msgContent.appendChild(textNode);
  msg.appendChild(avatar);
  msg.appendChild(msgContent);
  chatHistory.appendChild(msg);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  fetch('http://localhost:5001/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  })
  .then(res => {
    if (!res.body) throw new Error('No response body');
    const reader = res.body.getReader();
    let decoder = new TextDecoder('utf-8');
    let botText = '';
    function readChunk() {
      return reader.read().then(({ done, value }) => {
        if (done) {
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        botText += chunk;
        textNode.textContent = botText;
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return readChunk();
      });
    }
    return readChunk();
  })
  .catch(() => {
    textNode.textContent = '网络错误或服务器未启动';
  });
}

function goBack() {
  // 返回逻辑，例如隐藏聊天界面，显示欢迎界面
  const chatActive = chatContainer.classList.contains('active');
  if (chatActive) {
    chatContainer.classList.remove('active');
    bottomInput.classList.remove('hide');
    welcome.style.display = 'flex';
    bgCanvas.style.display = 'block';
    backBtn.style.display = 'none'; // 隐藏back按钮
    cleanBtn.style.display = 'none'; // 隐藏clean按钮
  } else {
    window.history.back();
  }
}

// 粒子流体背景动画，确保在页面内容加载后执行
window.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = window.innerWidth;
  let h = window.innerHeight;
  function resizeCanvas() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  // 粒子参数
  const particles = [];
  const PARTICLE_NUM = 80;
  for (let i = 0; i < PARTICLE_NUM; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      r: 1.5 + Math.random() * 2.5,
      color: `hsla(${Math.random()*360},80%,60%,0.7)`
    });
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    // 画粒子
    for (let p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.fill();
    }
    // 画流体连线
    for (let i = 0; i < PARTICLE_NUM; i++) {
      for (let j = i + 1; j < PARTICLE_NUM; j++) {
        const p1 = particles[i], p2 = particles[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0,255,255,${1 - dist / 90})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }
  }
  function update() {
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
  }
  function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
  }
  animate();
});
// 绑定back按钮点击事件
backBtn.addEventListener('click', goBack);
// 绑定clean按钮点击事件
cleanBtn.addEventListener('click', function() {
  chatHistory.innerHTML = '';
});
