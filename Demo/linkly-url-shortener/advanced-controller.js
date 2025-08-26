// 高级功能控制器

// 显示分组管理器
function showGroupsManager() {
    const modal = document.getElementById('groupsModal');
    if (modal) {
        renderGroupsList();
        showModal(modal);
    } else {
        showToast('分组管理功能正在加载中...', 'success');
    }
}

// 显示分析面板
function showAnalyticsDashboard() {
    const modal = document.getElementById('statsModal');
    if (modal) {
        renderAnalyticsDashboard();
        showModal(modal);
    } else {
        showToast('分析面板功能正在加载中...', 'success');
    }
}

// 渲染分组列表
function renderGroupsList() {
    const groupsList = document.getElementById('groupsList');
    if (!groupsList || !window.LinklyAdvanced) return;
    
    const groups = window.LinklyAdvanced.linkGroups.getAllGroups();
    
    groupsList.innerHTML = groups.map(group => `
        <div class="group-item">
            <div class="group-color" style="background-color: ${group.color}"></div>
            <div class="group-info">
                <div class="group-name">${group.name}</div>
                <div class="group-description">${group.description || '无描述'}</div>
            </div>
            <div class="group-actions">
                <button class="group-action-btn" onclick="editGroup(${group.id})" title="编辑">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                ${group.id !== 1 ? `
                <button class="group-action-btn delete" onclick="deleteGroup(${group.id})" title="删除">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                    </svg>
                </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// 渲染分析面板
function renderAnalyticsDashboard() {
    if (!window.LinklyAdvanced) return;
    
    const analytics = window.LinklyAdvanced.analytics;
    let totalClicks = 0;
    let todayClicks = 0;
    const deviceStats = {};
    const browserStats = {};
    const dailyStats = {};
    
    // 计算总体统计
    linksData.forEach(link => {
        totalClicks += link.clicks;
        const linkStats = analytics.getLinkStats(link.id);
        
        // 合并设备统计
        Object.entries(linkStats.deviceStats).forEach(([device, count]) => {
            deviceStats[device] = (deviceStats[device] || 0) + count;
        });
        
        // 合并浏览器统计
        Object.entries(linkStats.browserStats).forEach(([browser, count]) => {
            browserStats[browser] = (browserStats[browser] || 0) + count;
        });
        
        // 合并每日统计
        Object.entries(linkStats.dailyStats).forEach(([date, count]) => {
            dailyStats[date] = (dailyStats[date] || 0) + count;
        });
        
        todayClicks += linkStats.todayClicks;
    });
    
    // 更新统计数字
    document.getElementById('totalClicks').textContent = totalClicks;
    document.getElementById('todayClicks').textContent = todayClicks;
    
    const days = Object.keys(dailyStats).length;
    const avgDaily = days > 0 ? Math.round(totalClicks / days) : 0;
    document.getElementById('avgDaily').textContent = avgDaily;
    
    // 渲染设备统计
    renderStatsBar('deviceStats', deviceStats);
    
    // 渲染浏览器统计
    renderStatsBar('browserStats', browserStats);
    
    // 渲染每日图表
    renderDailyChart('dailyChart', dailyStats);
}

// 渲染统计条形图
function renderStatsBar(containerId, stats) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    container.innerHTML = Object.entries(stats).map(([label, count]) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return `
            <div class="stat-bar">
                <div class="stat-label">${label}</div>
                <div class="stat-progress">
                    <div class="stat-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="stat-value">${count}</div>
            </div>
        `;
    }).join('');
}

// 渲染每日图表
function renderDailyChart(containerId, dailyStats) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const sortedDays = Object.entries(dailyStats)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-7); // 只显示最近7天
    
    const maxCount = Math.max(...sortedDays.map(([, count]) => count), 1);
    
    container.innerHTML = sortedDays.map(([date, count]) => {
        const height = (count / maxCount) * 100;
        const shortDate = new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
        return `
            <div class="daily-bar" 
                 style="height: ${height}%" 
                 data-value="${count} - ${shortDate}"
                 title="${shortDate}: ${count} 次点击">
            </div>
        `;
    }).join('');
}

// 创建分组
function createGroup(name, color, description) {
    if (!window.LinklyAdvanced) return;
    
    const newGroup = window.LinklyAdvanced.linkGroups.createGroup(name, color, description);
    renderGroupsList();
    showToast('分组创建成功！', 'success');
    return newGroup;
}

// 删除分组
function deleteGroup(groupId) {
    if (!window.LinklyAdvanced) return;
    
    if (confirm('确定要删除这个分组吗？分组内的链接将移动到默认分组。')) {
        window.LinklyAdvanced.linkGroups.deleteGroup(groupId);
        renderGroupsList();
        renderLinksTable(); // 重新渲染表格
        showToast('分组已删除', 'success');
    }
}

// 编辑分组
function editGroup(groupId) {
    showToast('分组编辑功能开发中...', 'success');
}

// 显示链接统计
function showLinkStats(linkId) {
    if (!window.LinklyAdvanced) return;
    
    const stats = window.LinklyAdvanced.analytics.getLinkStats(linkId);
    const link = linksData.find(l => l.id === linkId);
    
    if (!link) return;
    
    // 这里可以显示单个链接的详细统计
    showToast(`${link.shortUrl} 总点击数: ${stats.totalClicks}`, 'success');
}

// 设置链接密码
function setLinkPassword(linkId) {
    const password = prompt('请输入链接访问密码:');
    if (password && window.LinklyAdvanced) {
        window.LinklyAdvanced.linkPassword.setPassword(linkId, password);
        showToast('密码保护已设置', 'success');
        renderLinksTable();
    }
}

// 设置链接过期时间
function setLinkExpiration(linkId) {
    const days = prompt('请输入过期天数 (输入0表示永不过期):');
    if (days !== null && window.LinklyAdvanced) {
        const daysNum = parseInt(days);
        if (daysNum === 0) {
            // 移除过期时间
            const link = linksData.find(l => l.id === linkId);
            if (link) {
                delete link.expirationDate;
                saveLinksToStorage();
                showToast('已移除过期时间', 'success');
            }
        } else if (daysNum > 0) {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + daysNum);
            window.LinklyAdvanced.linkExpiration.setExpiration(linkId, expirationDate.toISOString());
            showToast(`链接将在 ${daysNum} 天后过期`, 'success');
        }
        renderLinksTable();
    }
}

// 批量设置分组
function bulkSetGroup() {
    if (selectedLinks.size === 0) {
        showToast('请先选择要分组的链接', 'error');
        return;
    }
    
    if (!window.LinklyAdvanced) return;
    
    const groups = window.LinklyAdvanced.linkGroups.getAllGroups();
    const groupOptions = groups.map(g => `${g.id}:${g.name}`).join('\n');
    const groupId = prompt(`选择分组:\n${groupOptions}\n\n请输入分组ID:`);
    
    if (groupId) {
        const groupIdNum = parseInt(groupId);
        const group = groups.find(g => g.id === groupIdNum);
        
        if (group) {
            selectedLinks.forEach(linkId => {
                const link = linksData.find(l => l.id === linkId);
                if (link) {
                    link.groupId = groupIdNum;
                }
            });
            
            selectedLinks.clear();
            saveLinksToStorage();
            renderLinksTable();
            updateBulkActions();
            showToast(`已将链接移动到 "${group.name}" 分组`, 'success');
        }
    }
}

// 初始化高级功能事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 分组表单提交
    const createGroupForm = document.getElementById('createGroupForm');
    if (createGroupForm) {
        createGroupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('groupName').value;
            const color = document.getElementById('groupColor').value;
            const description = document.getElementById('groupDescription').value;
            
            createGroup(name, color, description);
            
            // 清空表单
            this.reset();
        });
    }
    
    // 模态框关闭事件
    const closeStatsModal = document.getElementById('closeStatsModal');
    const closeGroupsModal = document.getElementById('closeGroupsModal');
    
    if (closeStatsModal) {
        closeStatsModal.addEventListener('click', () => {
            hideModal(document.getElementById('statsModal'));
        });
    }
    
    if (closeGroupsModal) {
        closeGroupsModal.addEventListener('click', () => {
            hideModal(document.getElementById('groupsModal'));
        });
    }
});

// 模拟链接点击用于测试
function simulateLinkClick(linkId) {
    if (window.LinklyAdvanced) {
        window.LinklyAdvanced.analytics.recordClick(linkId);
        renderLinksTable();
        showToast('模拟点击已记录', 'success');
    }
}

// 获取链接预览
async function showLinkPreview(url) {
    if (!window.LinklyAdvanced) return;
    
    try {
        const preview = await window.LinklyAdvanced.linkPreview.getPreview(url);
        
        // 这里可以显示预览模态框
        showToast(`预览: ${preview.title}`, 'success');
    } catch (error) {
        showToast('获取预览失败', 'error');
    }
}