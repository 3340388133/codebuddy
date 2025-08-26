// 全局变量
let linksData = [];
let linkCounter = 1;

// DOM元素
const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const resultSection = document.getElementById('resultSection');
const shortLinkElement = document.getElementById('shortLink');
const copyBtn = document.getElementById('copyBtn');
const qrBtn = document.getElementById('qrBtn');
const qrModal = document.getElementById('qrModal');
const closeQrModal = document.getElementById('closeQrModal');
const qrCanvas = document.getElementById('qrCanvas');
const toast = document.getElementById('toast');
const linksTableBody = document.getElementById('linksTableBody');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadLinksFromStorage();
    renderLinksTable();
    setupEventListeners();
    
    // 自动粘贴功能
    setupAutoPaste();
});

// 设置事件监听器
function setupEventListeners() {
    shortenBtn.addEventListener('click', handleShortenUrl);
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleShortenUrl();
        }
    });
    
    copyBtn.addEventListener('click', function() {
        copyToClipboard(shortLinkElement.textContent);
    });
    
    qrBtn.addEventListener('click', function() {
        generateQRCode(shortLinkElement.textContent);
        showModal(qrModal);
    });
    
    closeQrModal.addEventListener('click', function() {
        hideModal(qrModal);
    });
    
    // 点击模态框背景关闭
    qrModal.addEventListener('click', function(e) {
        if (e.target === qrModal) {
            hideModal(qrModal);
        }
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideModal(qrModal);
        }
    });
}

// URL验证
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// 生成短链接
function generateShortLink() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `https://linkly.com/${result}`;
}

// 处理URL缩短
function handleShortenUrl() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showToast('请输入一个URL', 'error');
        return;
    }
    
    if (!isValidUrl(url)) {
        showToast('请输入一个有效的URL', 'error');
        return;
    }
    
    // 显示加载状态
    shortenBtn.innerHTML = '<svg class="loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> 缩短中...';
    shortenBtn.disabled = true;
    
    // 模拟API调用延迟
    setTimeout(() => {
        const shortLink = generateShortLink();
        const linkData = {
            id: Date.now(),
            originalUrl: url,
            shortUrl: shortLink,
            clicks: 0,
            status: 'Active',
            userId: currentUser ? currentUser.id : null,
            createdAt: new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '-')
        };
        
        // 添加到数据数组
        linksData.unshift(linkData);
        saveLinksToStorage();
        
        // 显示结果
        shortLinkElement.textContent = shortLink;
        resultSection.style.display = 'block';
        
        // 重新渲染表格
        renderLinksTable();
        
        // 清空输入框
        urlInput.value = '';
        
        // 恢复按钮状态
        shortenBtn.innerHTML = 'Shorten Now!';
        shortenBtn.disabled = false;
        
        showToast('链接缩短成功！', 'success');
        
        // 滚动到结果区域
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }, 1000);
}

// 复制到剪贴板
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('链接已复制到剪贴板！', 'success');
    } catch (err) {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('链接已复制到剪贴板！', 'success');
    }
}

// 生成QR码
function generateQRCode(text) {
    const canvas = qrCanvas;
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 使用QRCode.js生成QR码
    if (typeof QRCode !== 'undefined') {
        QRCode.toCanvas(canvas, text, {
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        }, function (error) {
            if (error) {
                console.error('QR码生成失败:', error);
                // 降级方案：绘制简单的占位符
                drawQRPlaceholder(ctx, canvas.width, canvas.height);
            }
        });
    } else {
        // 如果QRCode库未加载，绘制占位符
        drawQRPlaceholder(ctx, canvas.width, canvas.height);
    }
}

// 绘制QR码占位符
function drawQRPlaceholder(ctx, width, height) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#000000';
    const cellSize = width / 21; // 21x21网格
    
    // 绘制简单的QR码模式
    for (let i = 0; i < 21; i++) {
        for (let j = 0; j < 21; j++) {
            if ((i + j) % 3 === 0 || (i < 7 && j < 7) || (i < 7 && j > 13) || (i > 13 && j < 7)) {
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
}

// 显示模态框
function showModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// 隐藏模态框
function hideModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 显示Toast通知
function showToast(message, type = 'success') {
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    
    // 设置图标和颜色
    if (type === 'error') {
        toast.querySelector('.toast-content').style.background = 'rgba(239, 68, 68, 0.9)';
        toastIcon.innerHTML = '<path d="M18 6L6 18"/><path d="M6 6l12 12"/>';
    } else {
        toast.querySelector('.toast-content').style.background = 'rgba(34, 197, 94, 0.9)';
        toastIcon.innerHTML = '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>';
    }
    
    toast.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// 渲染链接表格
function renderLinksTable() {
    // 如果用户已登录，只显示该用户的链接
    let displayLinks = linksData;
    if (currentUser) {
        displayLinks = linksData.filter(link => link.userId === currentUser.id);
    }
    
    if (displayLinks.length === 0) {
        linksTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #64748b;">
                    ${currentUser ? '您还没有创建任何短链接' : '暂无缩短链接记录'}
                </td>
            </tr>
        `;
        return;
    }
    
    linksTableBody.innerHTML = displayLinks.map(link => `
        <tr>
            <td>
                <div class="short-link">
                    <input type="checkbox" class="link-checkbox" data-link-id="${link.id}" 
                           onchange="toggleLinkSelection(${link.id}, this)" style="margin-right: 0.5rem;">
                    <span>${link.shortUrl}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${link.shortUrl}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                    </button>
                </div>
            </td>
            <td>
                <div class="original-link" title="${link.originalUrl}">
                    ${link.originalUrl}
                </div>
            </td>
            <td>
                <button class="qr-code-btn" onclick="showQRModal('${link.shortUrl}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="5" height="5"/>
                        <rect x="16" y="3" width="5" height="5"/>
                        <rect x="3" y="16" width="5" height="5"/>
                        <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
                        <path d="M21 21v.01"/>
                        <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
                        <path d="M3 12h.01"/>
                        <path d="M12 3h.01"/>
                        <path d="M12 16v.01"/>
                        <path d="M16 12h1"/>
                        <path d="M21 12v.01"/>
                        <path d="M12 21v-1"/>
                    </svg>
                </button>
            </td>
            <td>
                <span class="clicks-count">${link.clicks}</span>
            </td>
            <td>
                <div class="status-badge ${link.status === 'Active' ? 'status-active' : 'status-inactive'}">
                    <div class="status-dot"></div>
                    ${link.status}
                </div>
            </td>
            <td>
                <span class="date-text">${link.createdAt}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editLink(${link.id})" title="编辑">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteLink(${link.id})" title="删除">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 显示QR码模态框
function showQRModal(url) {
    generateQRCode(url);
    showModal(qrModal);
}

// 自动粘贴功能
async function setupAutoPaste() {
    try {
        // 检查剪贴板权限
        const permission = await navigator.permissions.query({ name: 'clipboard-read' });
        
        if (permission.state === 'granted' || permission.state === 'prompt') {
            urlInput.addEventListener('focus', async function() {
                try {
                    const text = await navigator.clipboard.readText();
                    if (text && isValidUrl(text) && !urlInput.value) {
                        urlInput.value = text;
                        showToast('已自动粘贴剪贴板中的URL', 'success');
                    }
                } catch (err) {
                    // 静默处理错误
                    console.log('无法读取剪贴板内容');
                }
            });
        }
    } catch (err) {
        console.log('剪贴板API不支持');
    }
}

// 本地存储
function saveLinksToStorage() {
    try {
        localStorage.setItem('linklyData', JSON.stringify(linksData));
    } catch (err) {
        console.error('保存数据失败:', err);
    }
}

function loadLinksFromStorage() {
    try {
        const stored = localStorage.getItem('linklyData');
        if (stored) {
            linksData = JSON.parse(stored);
        } else {
            // 初始化示例数据
            linksData = [
                {
                    id: 1,
                    originalUrl: 'https://www.twitter.com/tweets/8erelCoihu/',
                    shortUrl: 'https://linkly.com/Bn41qCOlnq',
                    clicks: 1313,
                    status: 'Active',
                    createdAt: '2023-10-10'
                },
                {
                    id: 2,
                    originalUrl: 'https://www.youtube.com/watch?v=8J7ZmH0lXuk',
                    shortUrl: 'https://linkly.com/Bn41qCOlnq',
                    clicks: 4313,
                    status: 'Inactive',
                    createdAt: '2023-10-08'
                },
                {
                    id: 3,
                    originalUrl: 'https://www.adventuresinwanderlust.com/',
                    shortUrl: 'https://linkly.com/Bn41qCOlnq',
                    clicks: 1013,
                    status: 'Active',
                    createdAt: '2023-10-01'
                },
                {
                    id: 4,
                    originalUrl: 'https://vimeo.com/625257654',
                    shortUrl: 'https://linkly.com/Bn41qCOlnq',
                    clicks: 1313,
                    status: 'Active',
                    createdAt: '2023-09-20'
                },
                {
                    id: 5,
                    originalUrl: 'https://unsplash.com/photos/2KjNwOzFfVQ',
                    shortUrl: 'https://linkly.com/Bn41qCOlnq',
                    clicks: 1423,
                    status: 'Active',
                    createdAt: '2023-09-18'
                }
            ];
        }
    } catch (err) {
        console.error('加载数据失败:', err);
        linksData = [];
    }
}

// 主题切换功能
document.getElementById('themeBtn')?.addEventListener('click', function() {
    // 这里可以添加主题切换逻辑
    showToast('主题切换功能开发中...', 'success');
});

// 设置按钮
document.getElementById('settingsBtn')?.addEventListener('click', function() {
    showToast('设置功能开发中...', 'success');
});

// 登录按钮
document.getElementById('loginBtn')?.addEventListener('click', function() {
    showToast('登录功能开发中...', 'success');
});

// 注册按钮
document.getElementById('registerBtn')?.addEventListener('click', function() {
    showToast('注册功能开发中...', 'success');
});

// 注册链接
document.getElementById('registerLink')?.addEventListener('click', function(e) {
    e.preventDefault();
    showToast('注册功能开发中...', 'success');
});

document.getElementById('registerPrompt')?.addEventListener('click', function(e) {
    e.preventDefault();
    showToast('注册功能开发中...', 'success');
});

// 点击统计模拟
function simulateClick(linkId) {
    const link = linksData.find(l => l.id === linkId);
    if (link) {
        link.clicks++;
        saveLinksToStorage();
        renderLinksTable();
    }
}

// 定期模拟点击增长
setInterval(() => {
    if (linksData.length > 0 && Math.random() > 0.7) {
        const randomLink = linksData[Math.floor(Math.random() * linksData.length)];
        if (randomLink.status === 'Active') {
            randomLink.clicks++;
            saveLinksToStorage();
            renderLinksTable();
        }
    }
}, 10000); // 每10秒随机增加点击数