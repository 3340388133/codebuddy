// 高级功能模块

// 链接分析和统计
class LinkAnalytics {
    constructor() {
        this.clickHistory = JSON.parse(localStorage.getItem('linklyClickHistory') || '{}');
    }

    // 记录点击事件
    recordClick(linkId, userAgent = '', referrer = '') {
        const now = new Date();
        const clickData = {
            timestamp: now.toISOString(),
            date: now.toDateString(),
            userAgent: userAgent || navigator.userAgent,
            referrer: referrer || document.referrer,
            device: this.getDeviceType(userAgent || navigator.userAgent),
            browser: this.getBrowserInfo(userAgent || navigator.userAgent)
        };

        if (!this.clickHistory[linkId]) {
            this.clickHistory[linkId] = [];
        }
        
        this.clickHistory[linkId].push(clickData);
        this.saveClickHistory();
        
        // 更新链接点击数
        const link = linksData.find(l => l.id === linkId);
        if (link) {
            link.clicks++;
            saveLinksToStorage();
        }
    }

    // 获取设备类型
    getDeviceType(userAgent) {
        if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
            return 'Mobile';
        } else if (/Tablet/.test(userAgent)) {
            return 'Tablet';
        }
        return 'Desktop';
    }

    // 获取浏览器信息
    getBrowserInfo(userAgent) {
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Other';
    }

    // 获取链接统计
    getLinkStats(linkId) {
        const clicks = this.clickHistory[linkId] || [];
        const today = new Date().toDateString();
        
        return {
            totalClicks: clicks.length,
            todayClicks: clicks.filter(c => c.date === today).length,
            deviceStats: this.getDeviceStats(clicks),
            browserStats: this.getBrowserStats(clicks),
            dailyStats: this.getDailyStats(clicks)
        };
    }

    // 设备统计
    getDeviceStats(clicks) {
        const stats = {};
        clicks.forEach(click => {
            stats[click.device] = (stats[click.device] || 0) + 1;
        });
        return stats;
    }

    // 浏览器统计
    getBrowserStats(clicks) {
        const stats = {};
        clicks.forEach(click => {
            stats[click.browser] = (stats[click.browser] || 0) + 1;
        });
        return stats;
    }

    // 每日统计
    getDailyStats(clicks) {
        const stats = {};
        clicks.forEach(click => {
            stats[click.date] = (stats[click.date] || 0) + 1;
        });
        return stats;
    }

    // 保存点击历史
    saveClickHistory() {
        localStorage.setItem('linklyClickHistory', JSON.stringify(this.clickHistory));
    }
}

// 链接预览功能
class LinkPreview {
    constructor() {
        this.cache = new Map();
    }

    // 获取链接预览信息
    async getPreview(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            // 模拟获取网页元数据
            const preview = await this.fetchMetadata(url);
            this.cache.set(url, preview);
            return preview;
        } catch (error) {
            console.error('获取预览失败:', error);
            return this.getDefaultPreview(url);
        }
    }

    // 模拟获取元数据
    async fetchMetadata(url) {
        // 在实际应用中，这里会调用后端API获取网页元数据
        // 现在我们模拟一些数据
        const domain = new URL(url).hostname;
        
        return {
            title: `${domain} - 网页标题`,
            description: '这是一个网页的描述信息...',
            image: '/placeholder.svg?height=200&width=400',
            domain: domain,
            favicon: `https://www.google.com/s2/favicons?domain=${domain}`
        };
    }

    // 默认预览信息
    getDefaultPreview(url) {
        const domain = new URL(url).hostname;
        return {
            title: domain,
            description: '无法获取网页预览',
            image: '/placeholder.svg?height=200&width=400',
            domain: domain,
            favicon: `https://www.google.com/s2/favicons?domain=${domain}`
        };
    }
}

// 链接分组管理
class LinkGroups {
    constructor() {
        this.groups = JSON.parse(localStorage.getItem('linklyGroups') || '[]');
        this.initDefaultGroups();
    }

    // 初始化默认分组
    initDefaultGroups() {
        if (this.groups.length === 0) {
            this.groups = [
                { id: 1, name: '默认', color: '#3b82f6', description: '默认分组' },
                { id: 2, name: '工作', color: '#10b981', description: '工作相关链接' },
                { id: 3, name: '个人', color: '#f59e0b', description: '个人链接' },
                { id: 4, name: '社交媒体', color: '#ef4444', description: '社交媒体链接' }
            ];
            this.saveGroups();
        }
    }

    // 创建新分组
    createGroup(name, color = '#3b82f6', description = '') {
        const newGroup = {
            id: Date.now(),
            name,
            color,
            description,
            createdAt: new Date().toISOString()
        };
        
        this.groups.push(newGroup);
        this.saveGroups();
        return newGroup;
    }

    // 删除分组
    deleteGroup(groupId) {
        // 将该分组的链接移动到默认分组
        linksData.forEach(link => {
            if (link.groupId === groupId) {
                link.groupId = 1; // 默认分组
            }
        });
        
        this.groups = this.groups.filter(g => g.id !== groupId);
        this.saveGroups();
        saveLinksToStorage();
    }

    // 获取分组
    getGroup(groupId) {
        return this.groups.find(g => g.id === groupId);
    }

    // 获取所有分组
    getAllGroups() {
        return this.groups;
    }

    // 保存分组
    saveGroups() {
        localStorage.setItem('linklyGroups', JSON.stringify(this.groups));
    }
}

// 链接过期管理
class LinkExpiration {
    constructor() {
        this.checkExpiredLinks();
        // 每小时检查一次过期链接
        setInterval(() => this.checkExpiredLinks(), 3600000);
    }

    // 设置链接过期时间
    setExpiration(linkId, expirationDate) {
        const link = linksData.find(l => l.id === linkId);
        if (link) {
            link.expirationDate = expirationDate;
            saveLinksToStorage();
        }
    }

    // 检查过期链接
    checkExpiredLinks() {
        const now = new Date();
        let expiredCount = 0;
        
        linksData.forEach(link => {
            if (link.expirationDate && new Date(link.expirationDate) < now && link.status === 'Active') {
                link.status = 'Expired';
                expiredCount++;
            }
        });
        
        if (expiredCount > 0) {
            saveLinksToStorage();
            if (typeof renderLinksTable === 'function') {
                renderLinksTable();
            }
        }
    }

    // 获取即将过期的链接
    getExpiringLinks(days = 7) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        
        return linksData.filter(link => 
            link.expirationDate && 
            new Date(link.expirationDate) <= futureDate && 
            new Date(link.expirationDate) > new Date() &&
            link.status === 'Active'
        );
    }
}

// 链接密码保护
class LinkPassword {
    constructor() {
        this.passwords = JSON.parse(localStorage.getItem('linklyPasswords') || '{}');
    }

    // 设置链接密码
    setPassword(linkId, password) {
        this.passwords[linkId] = this.hashPassword(password);
        this.savePasswords();
    }

    // 验证密码
    verifyPassword(linkId, password) {
        const hashedPassword = this.passwords[linkId];
        return hashedPassword && hashedPassword === this.hashPassword(password);
    }

    // 简单的密码哈希（实际应用中应使用更安全的方法）
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash.toString();
    }

    // 移除密码保护
    removePassword(linkId) {
        delete this.passwords[linkId];
        this.savePasswords();
    }

    // 检查链接是否有密码保护
    hasPassword(linkId) {
        return !!this.passwords[linkId];
    }

    // 保存密码
    savePasswords() {
        localStorage.setItem('linklyPasswords', JSON.stringify(this.passwords));
    }
}

// 初始化高级功能
const analytics = new LinkAnalytics();
const linkPreview = new LinkPreview();
const linkGroups = new LinkGroups();
const linkExpiration = new LinkExpiration();
const linkPassword = new LinkPassword();

// 导出功能供其他模块使用
window.LinklyAdvanced = {
    analytics,
    linkPreview,
    linkGroups,
    linkExpiration,
    linkPassword
};

// 扩展现有功能
document.addEventListener('DOMContentLoaded', function() {
    // 添加高级功能的事件监听器
    setupAdvancedFeatures();
});

function setupAdvancedFeatures() {
    // 模拟链接点击
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('short-link-click')) {
            const linkId = parseInt(e.target.dataset.linkId);
            analytics.recordClick(linkId);
        }
    });
}

// 生成链接统计报告
function generateLinkReport(linkId) {
    const stats = analytics.getLinkStats(linkId);
    const link = linksData.find(l => l.id === linkId);
    
    if (!link) return null;
    
    return {
        link: link,
        stats: stats,
        generatedAt: new Date().toISOString()
    };
}

// 导出所有数据
function exportAllData() {
    const exportData = {
        links: linksData,
        groups: linkGroups.getAllGroups(),
        clickHistory: analytics.clickHistory,
        users: JSON.parse(localStorage.getItem('linklyUsers') || '[]'),
        exportedAt: new Date().toISOString(),
        version: '2.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `linkly-full-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showToast('完整数据导出成功！', 'success');
}