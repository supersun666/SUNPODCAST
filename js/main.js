// 博客数据
const blogs = [
    {
        id: 1,
        title: "设计师需要学习 AI Coding 吗？",
        audioUrl: "./audio/v1.MP3",
        coverImage: "./images/cover1.jpg"
    },
    {
        id: 2,
        title: "AI 会替代设计师吗？",
        audioUrl: "./audio/v2.mp3",
        coverImage: "./images/cover2.jpg"
    },
    {
        id: 3,
        title: "AI 搜索能否替代传统搜索？",
        audioUrl: "./audio/v3.mp3",
        coverImage: "./images/cover3.jpg"
    },
    {
        id: 4,
        title: "高领设计师的出路",
        audioUrl: "./audio/v4.mp3",
        coverImage: "./images/cover4.jpg"
    }
];

// 全局变量
let currentAudio = null;
let isPlaying = false;
let isDragging = false;

// 星星效果
function createStar() {
    const star = document.createElement('div');
    star.className = 'star';
    
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    
    const size = Math.random() * 2 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    
    const duration = Math.random() * 4 + 3;
    star.style.animation = `twinkle ${duration}s infinite`;
    
    return star;
}

function initStars() {
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 100; i++) {
        starsContainer.appendChild(createStar());
    }
}

// 卡片透视效果
function initCardEffects() {
    const cards = document.querySelectorAll('.blog-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
        card.addEventListener('mousedown', handleMouseDown);
        card.addEventListener('mouseup', handleMouseUp);
    });
}

function handleMouseMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    
    const rotateY = deltaX * 15;
    const rotateX = -deltaY * 15;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function handleMouseLeave(e) {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
}

function handleMouseDown(e) {
    const card = e.currentTarget;
    card.style.transform += ' scale(0.98)';
}

function handleMouseUp(e) {
    const card = e.currentTarget;
    card.style.transform = card.style.transform.replace(' scale(0.98)', '');
}

// 播放博客函数
function playBlog(blog) {
    const playerContainer = document.getElementById('playerContainer');
    const playIcon = document.getElementById('playIcon');
    const nowPlaying = document.getElementById('nowPlaying');
    const progressBar = document.getElementById('progressBar');
    const timeInfo = document.getElementById('timeInfo');

    // 如果已经有正在播放的音频，先停止它
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
        isPlaying = false;
    }

    // 创建新的音频实例
    currentAudio = new Audio(blog.audioUrl);
    nowPlaying.textContent = `正在播放: ${blog.title}`;
    playerContainer.classList.add('active');

    // 添加音频加载完成事件监听
    currentAudio.addEventListener('loadedmetadata', () => {
        timeInfo.textContent = `0:00 / ${formatTime(currentAudio.duration)}`;
    });

    // 添加进度更新事件监听
    currentAudio.addEventListener('timeupdate', () => {
        if (!isDragging) {
            const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
            progressBar.style.width = `${progress}%`;
            timeInfo.textContent = `${formatTime(currentAudio.currentTime)} / ${formatTime(currentAudio.duration)}`;
        }
    });

    // 自动开始播放
    currentAudio.play().then(() => {
        isPlaying = true;
        playIcon.className = 'fas fa-pause';
    }).catch(error => {
        console.error('播放失败:', error);
        isPlaying = false;
        playIcon.className = 'fas fa-play';
    });
}

// 创建博客卡片
function createBlogCards() {
    const blogList = document.getElementById('blogList');
    if (!blogList) return;

    blogList.innerHTML = '';

    blogs.forEach(blog => {
        const card = document.createElement('div');
        card.className = 'blog-card';
        card.innerHTML = `
            <img src="${blog.coverImage}" alt="" class="blog-cover">
            <div class="blog-content">
                <div class="blog-title">${blog.title}</div>
            </div>
        `;
        // 直接使用 blog 对象
        card.addEventListener('click', () => playBlog(blog));
        blogList.appendChild(card);
    });
}

// 进度条控制
function initProgressBar() {
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const timeInfo = document.getElementById('timeInfo');

    // 点击进度条跳转
    progressContainer.addEventListener('click', (e) => {
        if (!currentAudio) return;
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        currentAudio.currentTime = pos * currentAudio.duration;
        progressBar.style.width = `${pos * 100}%`;
        timeInfo.textContent = `${formatTime(currentAudio.currentTime)} / ${formatTime(currentAudio.duration)}`;
    });

    // 拖动进度条
    progressContainer.addEventListener('mousedown', (e) => {
        if (!currentAudio) return;
        isDragging = true;
        updateProgress(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateProgress(e);
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function updateProgress(e) {
    if (!currentAudio) return;
    
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const timeInfo = document.getElementById('timeInfo');
    
    const rect = progressContainer.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    
    progressBar.style.width = `${pos * 100}%`;
    currentAudio.currentTime = pos * currentAudio.duration;
    timeInfo.textContent = `${formatTime(currentAudio.currentTime)} / ${formatTime(currentAudio.duration)}`;
}

// 格式化时间
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 初始化函数
function init() {
    createBlogCards();
    initStars();
    initCardEffects();
    initProgressBar();
    
    // 添加播放按钮事件监听
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 点击空白处暂停播放
document.addEventListener('click', (e) => {
    const playerContainer = document.getElementById('playerContainer');
    const blogList = document.getElementById('blogList');
    const logoContainer = document.querySelector('.logo-container');
    
    if (!playerContainer.contains(e.target) && 
        !blogList.contains(e.target) && 
        !logoContainer.contains(e.target)) {
        
        if (currentAudio && isPlaying) {
            togglePlay();
        }
        playerContainer.classList.remove('active');
    }
});

// 键盘快捷键控制
document.addEventListener('keydown', (e) => {
    if (!currentAudio) return;

    switch(e.code) {
        case 'ArrowLeft':  // 后退 5 秒
            currentAudio.currentTime = Math.max(0, currentAudio.currentTime - 5);
            break;
        case 'ArrowRight':  // 前进 5 秒
            currentAudio.currentTime = Math.min(currentAudio.duration, currentAudio.currentTime + 5);
            break;
        case 'Space':  // 空格键播放/暂停
            e.preventDefault();
            togglePlay();
            break;
    }
}); 

// 切换播放/暂停
function togglePlay() {
    if (!currentAudio) return;

    const playIcon = document.getElementById('playIcon');
    
    if (isPlaying) {
        currentAudio.pause();
        playIcon.className = 'fas fa-play';
        isPlaying = false;
    } else {
        currentAudio.play().then(() => {
            playIcon.className = 'fas fa-pause';
            isPlaying = true;
        }).catch(error => console.error('播放失败:', error));
    }
} 