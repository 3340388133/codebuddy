// 用户系统和链接管理功能

// 用户状态管理
let currentUser = null;
let selectedLinks = new Set();

// 初始化用户系统
function initUserSystem() {
    loadUserFromStorage();
    updateUserInterface();
    setupUserEventListeners();
}

// 设置用户系统事件监听器
function setupUserEventListeners() {
    // 登录模态框
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const editLinkModal = document.getElementById('editLinkModal');
    
    // 登录按钮
    document.getElementById('loginBtn').addEventListener('click', function() {
        if (currentUser) {
            // 如果已登录，显示用户菜单
            showUserMenu();
        } else {
            showModal(loginModal);
        }
    });
    
    // 注册按钮
    document.getElementById('registerBtn').addEventListener('click', function() {
        if (!currentUser) {
            showModal(registerModal);
        }
    });
    
    // 模态框关闭按钮
    document.getElementById('closeLoginModal').addEventListener('click', () => hideModal(loginModal));
    document.getElementById('closeRegisterModal').addEventListener('click', () => hideModal(registerModal));
    document.getElementById('closeEditModal').addEventListener('click', () => hideModal(editLinkModal));
    
    // 切换登录/注册
    document.getElementById('switchToRegister').addEventListener('click', function(e) {
        e.preventDefault();
        hideModal(loginModal);
        showModal(registerModal);
    });
    
    document.getElementById('switchToLogin').addEventListener('click', function(e) {
        e.preventDefault();
        hideModal(registerModal);
        showModal(loginModal);
    });
    
    // 表单提交
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('editLinkForm').addEventListener('submit', handleEditLink);
    
    // 取消编辑
    document.getElementById('cancelEdit').addEventListener('click', function() {
        hideModal(editLinkModal);
    });
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // 模拟登录验证
    const users = JSON.parse(localStorage.getItem('linklyUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        saveUserToStorage();
        updateUserInterface();
        hideModal(document.getElementById('loginModal'));
        showToast('登录成功！', 'success');
        
        // 重新渲染表格以显示用户的链接
        renderLinksTable();
    } else {
        showToast('邮箱或密码错误', 'error');
    }
}

// 处理注册
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 验证密码
    if (password !== confirmPassword) {
        showToast('两次输入的密码不一致', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('密码长度至少6位', 'error');
        return;
    }
    
    // 检查邮箱是否已存在
    const users = JSON.parse(localStorage.getItem('linklyUsers') || '[]');
    if (users.find(u => u.email === email)) {
        showToast('该邮箱已被注册', 'error');
        return;
    }
    
    // 创建新用户
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        createdAt: new Date().toISOString(),
        plan: 'free'
    };
    
    users.push(newUser);
    localStorage.setItem('linklyUsers', JSON.stringify(users));
    
    currentUser = newUser;
    saveUserToStorage();
    updateUserInterface();
    hideModal(document.getElementById('registerModal'));
    showToast('注册成功！', 'success');
    
    // 重新渲染表格
    renderLinksTable();
}

// 更新用户界面
function updateUserInterface() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    if (currentUser) {
        // 已登录状态
        loginBtn.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
                <span class="user-name">${currentUser.name}</span>
            </div>
        `;
        registerBtn.innerHTML = `
            <button class="logout-btn" onclick="handleLogout()">退出登录</button>
        `;
        registerBtn.style.background = 'transparent';
        registerBtn.style.border = 'none';
        registerBtn.style.padding = '0';
    } else {
        // 未登录状态
        loginBtn.innerHTML = `
            <span>Login</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10,17 15,12 10,7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
        `;
        registerBtn.innerHTML = 'Register Now';
        registerBtn.style.background = '#144EE3';
        registerBtn.style.border = '1px solid #144EE3';
        registerBtn.style.padding = '0.75rem 1.5rem';
    }
}

// 处理退出登录
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('linklyCurrentUser');
    updateUserInterface();
    showToast('已退出登录', 'success');
    
    // 重新渲染表格
    renderLinksTable();
}

// 保存用户到本地存储
function saveUserToStorage() {
    if (currentUser) {
        localStorage.setItem('linklyCurrentUser', JSON.stringify(currentUser));
    }
}

// 从本地存储加载用户
function loadUserFromStorage() {
    const stored = localStorage.getItem('linklyCurrentUser');
    if (stored) {
        currentUser = JSON.parse(stored);
    }
}

// 编辑链接
function editLink(linkId) {
    const link = linksData.find(l => l.id === linkId);
    if (!link) return;
    
    // 填充编辑表单
    document.getElementById('editOriginalUrl').value = link.originalUrl;
    document.getElementById('editCustomAlias').value = link.customAlias || '';
    document.getElementById('editStatus').value = link.status;
    
    // 保存当前编辑的链接ID
    document.getElementById('editLinkForm').dataset.linkId = linkId;
    
    showModal(document.getElementById('editLinkModal'));
}

// 处理链接编辑
function handleEditLink(e) {
    e.preventDefault();
    
    const linkId = parseInt(e.target.dataset.linkId);
    const originalUrl = document.getElementById('editOriginalUrl').value;
    const customAlias = document.getElementById('editCustomAlias').value;
    const status = document.getElementById('editStatus').value;
    
    const linkIndex = linksData.findIndex(l => l.id === linkId);
    if (linkIndex === -1) return;
    
    // 更新链接数据
    linksData[linkIndex].originalUrl = originalUrl;
    linksData[linkIndex].status = status;
    
    // 如果有自定义别名，更新短链接
    if (customAlias && customAlias !== linksData[linkIndex].customAlias) {
        linksData[linkIndex].customAlias = customAlias;
        linksData[linkIndex].shortUrl = `https://linkly.com/${customAlias}`;
    }
    
    saveLinksToStorage();
    renderLinksTable();
    hideModal(document.getElementById('editLinkModal'));
    showToast('链接更新成功！', 'success');
}

// 删除链接
function deleteLink(linkId) {
    if (confirm('确定要删除这个链接吗？此操作不可撤销。')) {
        linksData = linksData.filter(l => l.id !== linkId);
        saveLinksToStorage();
        renderLinksTable();
        showToast('链接已删除', 'success');
    }
}

// 批量删除链接
function bulkDeleteLinks() {
    if (selectedLinks.size === 0) {
        showToast('请先选择要删除的链接', 'error');
        return;
    }
    
    if (confirm(`确定要删除选中的 ${selectedLinks.size} 个链接吗？此操作不可撤销。`)) {
        linksData = linksData.filter(l => !selectedLinks.has(l.id));
        selectedLinks.clear();
        saveLinksToStorage();
        renderLinksTable();
        showToast(`已删除 ${selectedLinks.size} 个链接`, 'success');
    }
}

// 切换链接选择
function toggleLinkSelection(linkId, checkbox) {
    if (checkbox.checked) {
        selectedLinks.add(linkId);
    } else {
        selectedLinks.delete(linkId);
    }
    updateBulkActions();
}

// 全选/取消全选
function toggleSelectAll(checkbox) {
    const linkCheckboxes = document.querySelectorAll('.link-checkbox');
    linkCheckboxes.forEach(cb => {
        cb.checked = checkbox.checked;
        const linkId = parseInt(cb.dataset.linkId);
        if (checkbox.checked) {
            selectedLinks.add(linkId);
        } else {
            selectedLinks.delete(linkId);
        }
    });
    updateBulkActions();
}

// 更新批量操作按钮状态
function updateBulkActions() {
    const bulkActions = document.querySelector('.bulk-actions');
    const selectedCount = document.querySelector('.selected-count');
    
    if (bulkActions) {
        bulkActions.style.display = selectedLinks.size > 0 ? 'flex' : 'none';
    }
    
    if (selectedCount) {
        selectedCount.textContent = `已选择 ${selectedLinks.size} 个链接`;
    }
}

// 导出链接数据
function exportLinks() {
    const dataToExport = linksData.map(link => ({
        originalUrl: link.originalUrl,
        shortUrl: link.shortUrl,
        clicks: link.clicks,
        status: link.status,
        createdAt: link.createdAt
    }));
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `linkly-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showToast('数据导出成功！', 'success');
}

// 搜索链接
function searchLinks(query) {
    const filteredLinks = linksData.filter(link => 
        link.originalUrl.toLowerCase().includes(query.toLowerCase()) ||
        link.shortUrl.toLowerCase().includes(query.toLowerCase())
    );
    renderFilteredLinks(filteredLinks);
}

// 过滤链接
function filterLinks(status) {
    let filteredLinks = linksData;
    
    if (status !== 'all') {
        filteredLinks = linksData.filter(link => link.status === status);
    }
    
    renderFilteredLinks(filteredLinks);
}

// 渲染过滤后的链接
function renderFilteredLinks(links) {
    // 临时替换linksData进行渲染
    const originalData = linksData;
    linksData = links;
    renderLinksTable();
    linksData = originalData;
}

// 获取用户统计数据
function getUserStats() {
    if (!currentUser) return null;
    
    const userLinks = linksData.filter(link => link.userId === currentUser.id);
    const totalClicks = userLinks.reduce((sum, link) => sum + link.clicks, 0);
    const activeLinks = userLinks.filter(link => link.status === 'Active').length;
    
    return {
        totalLinks: userLinks.length,
        totalClicks,
        activeLinks,
        inactiveLinks: userLinks.length - activeLinks
    };
}

// 批量激活链接
function bulkActivateLinks() {
    if (selectedLinks.size === 0) {
        showToast('请先选择要激活的链接', 'error');
        return;
    }
    
    const count = selectedLinks.size;
    selectedLinks.forEach(linkId => {
        const link = linksData.find(l => l.id === linkId);
        if (link) {
            link.status = 'Active';
        }
    });
    
    selectedLinks.clear();
    saveLinksToStorage();
    renderLinksTable();
    updateBulkActions();
    showToast(`已激活 ${count} 个链接`, 'success');
}

// 批量停用链接
function bulkDeactivateLinks() {
    if (selectedLinks.size === 0) {
        showToast('请先选择要停用的链接', 'error');
        return;
    }
    
    const count = selectedLinks.size;
    selectedLinks.forEach(linkId => {
        const link = linksData.find(l => l.id === linkId);
        if (link) {
            link.status = 'Inactive';
        }
    });
    
    selectedLinks.clear();
    saveLinksToStorage();
    renderLinksTable();
    updateBulkActions();
    showToast(`已停用 ${count} 个链接`, 'success');
}

// 显示用户菜单
function showUserMenu() {
    // 这里可以添加用户菜单的显示逻辑
    showToast('用户菜单功能开发中...', 'success');
}

// 初始化用户系统
document.addEventListener('DOMContentLoaded', function() {
    initUserSystem();
});
