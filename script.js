function sayHello() {
  alert("你好！欢迎来到我的网站！");
}

// 图片轮播自动切换
let currentIndex = 0;
const images = document.getElementsByClassName('carousel-img');
const total = images.length;

function showImage(index) {
  for (let i = 0; i < total; i++) {
    images[i].style.display = i === index ? 'block' : 'none';
  }
}

function nextImage() {
  currentIndex = (currentIndex + 1) % total;
  showImage(currentIndex);
}

setInterval(nextImage, 3000); // 每3秒切换一次
