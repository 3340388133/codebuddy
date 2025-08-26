document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializePage();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 启动动画
    startAnimations();
});

function initializePage() {
    // 设置初始状态
    console.log('Spotify登录页面已加载');
    
    // 检查设备类型
    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');
    }
    
    // 设置时间显示
    updateTime();
    setInterval(updateTime, 1000);
    
    // 设置电池状态
    updateBatteryStatus();
}

function bindEventListeners() {
    // 注册按钮
    const signupBtn = document.querySelector('.signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignup);
        signupBtn.addEventListener('mouseenter', addHoverEffect);
        signupBtn.addEventListener('mouseleave', removeHoverEffect);
    }
    
    // 社交登录按钮
    const socialBtns = document.querySelectorAll('.social-btn');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', handleSocialLogin);
        btn.addEventListener('mouseenter', addHoverEffect);
        btn.addEventListener('mouseleave', removeHoverEffect);
    });
    
    // 登录链接
    const loginLink = document.querySelector('.login-link');
    if (loginLink) {
        loginLink.addEventListener('click', handleLogin);
    }
    
    // 触摸事件支持
    if ('ontouchstart' in window) {
        addTouchSupport();
    }
    
    // 键盘导航支持
    document.addEventListener('keydown', handleKeyboardNavigation);
}

function handleSignup(event) {
    event.preventDefault();
    console.log('注册按钮被点击');
    
    // 添加点击动画
    const btn = event.target;
    btn.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
        // 这里可以添加实际的注册逻辑
        showMessage('正在跳转到注册页面...', 'success');
    }, 150);
}

function handleSocialLogin(event) {
    event.preventDefault();
    const btn = event.target.closest('.social-btn');
    const provider = getProviderFromButton(btn);
    
    console.log(`${provider}登录按钮被点击`);
    
    // 添加点击动画
    btn.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
        // 这里可以添加实际的社交登录逻辑
        showMessage(`正在使用${provider}登录...`, 'info');
    }, 150);
}

function handleLogin(event) {
    event.preventDefault();
    console.log('登录链接被点击');
    
    // 这里可以添加实际的登录逻辑
    showMessage('正在跳转到登录页面...', 'info');
}

function getProviderFromButton(btn) {
    if (btn.classList.contains('google-btn')) return 'Google';
    if (btn.classList.contains('facebook-btn')) return 'Facebook';
    if (btn.classList.contains('apple-btn')) return 'Apple';
    return '未知';
}

function addHoverEffect(event) {
    const btn = event.target;
    btn.style.boxShadow = '0 4px 12px rgba(29, 185, 84, 0.3)';
}

function removeHoverEffect(event) {
    const btn = event.target;
    btn.style.boxShadow = 'none';
}

function addTouchSupport() {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    });
}

function handleKeyboardNavigation(event) {
    // Enter键激活按钮
    if (event.key === 'Enter') {
        const focusedElement = document.activeElement;
        if (focusedElement.tagName === 'BUTTON') {
            focusedElement.click();
        }
    }
    
    // Tab键导航
    if (event.key === 'Tab') {
        // 确保焦点可见
        document.body.classList.add('keyboard-navigation');
    }
}

function updateTime() {
    const timeElement = document.querySelector('.time');
    if (timeElement) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;
    }
}

function updateBatteryStatus() {
    // 模拟电池状态更新
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            const batteryLevel = document.querySelector('.battery-level');
            if (batteryLevel) {
                const level = Math.round(battery.level * 100);
                batteryLevel.style.width = `${level}%`;
                
                // 低电量警告
                if (level < 20) {
                    batteryLevel.style.background = '#ff4444';
                }
            }
        });
    }
}

function startAnimations() {
    // 页面加载动画
    const container = document.querySelector('.container');
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        container.style.transition = 'all 0.8s ease-out';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 100);
    
    // 按钮依次出现动画
    const buttons = document.querySelectorAll('.signup-btn, .social-btn');
    buttons.forEach((btn, index) => {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            btn.style.transition = 'all 0.6s ease-out';
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
        }, 300 + (index * 100));
    });
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function showMessage(text, type = 'info') {
    // 创建消息提示
    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#1DB954' : type === 'error' ? '#ff4444' : '#333'};
        color: white;
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    // 显示动画
    setTimeout(() => {
        message.style.opacity = '1';
        message.style.transform = 'translateX(-50%) translateY(10px)';
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transform = 'translateX(-50%) translateY(-10px)';
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 3000);
}

// 页面可见性API - 当页面重新获得焦点时刷新
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updateTime();
        updateBatteryStatus();
    }
});

// 窗口大小改变时的响应
window.addEventListener('resize', debounce(function() {
    // 重新计算布局
    console.log('窗口大小已改变');
}, 250));

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 错误处理
window.addEventListener('error', function(event) {
    console.error('页面错误:', event.error);
});

// 性能监控
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`页面加载完成，耗时: ${Math.round(loadTime)}ms`);
});