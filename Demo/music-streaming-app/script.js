// 音乐播放器应用JavaScript

class MusicPlayer {
    constructor() {
        this.isPlaying = false;
        this.currentTrack = null;
        this.volume = 0.7;
        this.progress = 0.35;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        // 播放控制按钮
        const playBtn = document.querySelector('.control-btn.play-btn');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        if (playBtn) {
            playBtn.addEventListener('click', () => this.togglePlay());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousTrack());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextTrack());
        }

        // 专辑播放按钮
        const albumPlayBtns = document.querySelectorAll('.album-play-btn');
        albumPlayBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playAlbum(btn);
            });
        });

        // 整卡点击（专辑/播放列表）
        const albumCards = document.querySelectorAll('.album-card');
        albumCards.forEach(card => {
            card.addEventListener('click', () => this.playFromCard(card));
        });
        const playlistCards = document.querySelectorAll('.playlist-card');
        playlistCards.forEach(card => {
            card.addEventListener('click', () => this.playFromCard(card));
        });

        // 精选播放列表播放按钮
        const featuredPlayBtn = document.querySelector('.play-button');
        if (featuredPlayBtn) {
            featuredPlayBtn.addEventListener('click', () => this.playFeaturedPlaylist());
        }

        // 排行榜项目点击
        const chartItems = document.querySelectorAll('.chart-item');
        chartItems.forEach(item => {
            item.addEventListener('click', () => this.playChartItem(item));
        });

        // 喜欢按钮
        const likeBtns = document.querySelectorAll('.like-btn');
        likeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLike(btn);
            });
        });

        // 进度条
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => this.setProgress(e));
        }

        // 音量控制
        const volumeBar = document.querySelector('.volume-bar');
        if (volumeBar) {
            volumeBar.addEventListener('click', (e) => this.setVolume(e));
        }

        // 搜索功能
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // 导航链接 - 移除阻止默认行为，让链接正常跳转
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // 不阻止默认行为，让链接正常跳转
                this.handleNavigation(link);
            });
        });

        // 创建播放列表按钮
        const createPlaylistBtn = document.querySelector('.create-playlist-btn');
        if (createPlaylistBtn) {
            createPlaylistBtn.addEventListener('click', () => this.createPlaylist());
        }

        // 事件委托：点击任意可播放卡片时更新底部播放栏
        document.addEventListener('click', (e) => {
            const playable = e.target.closest('.chart-item, .album-card, .playlist-card, .album, .music-card');
            if (!playable) return;

            // 排行榜项走原有逻辑
            if (playable.classList.contains('chart-item')) {
                this.playChartItem(playable);
                return;
            }

            // 其他类型统一读取并播放
            this.playFromCard(playable);
        });
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        this.updatePlayButton();
        
        if (this.isPlaying) {
            this.showNotification('开始播放');
        } else {
            this.showNotification('暂停播放');
        }
    }

    updatePlayButton() {
        const playBtn = document.querySelector('.control-btn.play-btn');
        if (playBtn) {
            const svg = playBtn.querySelector('svg');
            if (this.isPlaying) {
                // 暂停图标
                svg.innerHTML = `
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                `;
            } else {
                // 播放图标
                svg.innerHTML = `
                    <polygon points="5,3 19,12 5,21"/>
                `;
            }
        }
    }

    playAlbum(btn) {
        const albumCard = btn.closest('.album-card');
        const albumTitle = albumCard.querySelector('.album-title').textContent;
        const albumArtist = albumCard.querySelector('.album-artist').textContent;
        const albumImage = albumCard.querySelector('img').src;
        
        this.currentTrack = {
            title: albumTitle,
            artist: albumArtist,
            image: albumImage
        };
        
        this.isPlaying = true;
        this.updatePlayButton();
        this.updateNowPlaying();
        this.showNotification(`正在播放: ${albumTitle} - ${albumArtist}`);
        
        // 添加播放动画
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 200);
    }

    playFromCard(card) {
        const titleEl = card.querySelector('.album-title, .playlist-title, .card-title, .title');
        const artistEl = card.querySelector('.album-artist, .playlist-artist, .track-artist, .artist-name, .card-subtitle');
        const imgEl = card.querySelector('img');

        const title = titleEl ? titleEl.textContent : 'Unknown Track';
        const artist = artistEl ? artistEl.textContent : 'Unknown Artist';
        const image = imgEl ? imgEl.src : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop';

        this.currentTrack = { title, artist, image };
        this.isPlaying = true;
        this.updatePlayButton();
        this.updateNowPlaying();
        this.showNotification(`正在播放: ${title} - ${artist}`);
    }

    playFeaturedPlaylist() {
        const featuredImage = document.querySelector('.cover-image');
        
        this.currentTrack = {
            title: 'R & B Hits',
            artist: 'Various Artists',
            image: featuredImage ? featuredImage.src : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop'
        };
        
        this.isPlaying = true;
        this.updatePlayButton();
        this.updateNowPlaying();
        this.showNotification('正在播放精选播放列表: R & B Hits');
    }

    playChartItem(item) {
        const songTitle = item.querySelector('.chart-song').textContent;
        const artistName = item.querySelector('.chart-artist').textContent;
        const songImage = item.querySelector('img').src;
        
        this.currentTrack = {
            title: songTitle,
            artist: artistName,
            image: songImage
        };
        
        this.isPlaying = true;
        this.updatePlayButton();
        this.updateNowPlaying();
        this.showNotification(`正在播放: ${songTitle} - ${artistName}`);
        
        // 高亮当前播放项
        document.querySelectorAll('.chart-item').forEach(i => i.classList.remove('playing'));
        item.classList.add('playing');
    }

    updateNowPlaying() {
        if (this.currentTrack) {
            // 兼容不同页面结构
            const trackTitle =
                document.getElementById('current-song') ||
                document.querySelector('.track-title') ||
                document.querySelector('.song-title');

            const trackArtist =
                document.getElementById('current-artist') ||
                document.querySelector('.track-artist') ||
                document.querySelector('.artist-name');

            const currentImage =
                document.querySelector('.current-song-image') ||
                document.querySelector('.now-playing .track-cover img') ||
                document.querySelector('.now-playing img');

            if (trackTitle) trackTitle.textContent = this.currentTrack.title;
            if (trackArtist) trackArtist.textContent = this.currentTrack.artist;
            if (currentImage && this.currentTrack.image) {
                currentImage.src = this.currentTrack.image;
            }
        }
    }

    previousTrack() {
        this.showNotification('上一首');
    }

    nextTrack() {
        this.showNotification('下一首');
    }

    toggleLike(btn) {
        const isLiked = btn.classList.contains('liked');
        
        if (isLiked) {
            btn.classList.remove('liked');
            btn.style.color = 'rgba(239, 238, 224, 0.6)';
            this.showNotification('已取消喜欢');
        } else {
            btn.classList.add('liked');
            btn.style.color = '#ff6b6b';
            this.showNotification('已添加到喜欢');
        }
    }

    setProgress(e) {
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        
        this.progress = Math.max(0, Math.min(1, percent));
        this.updateProgressBar();
    }

    updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${this.progress * 100}%`;
        }
    }

    setVolume(e) {
        const volumeBar = e.currentTarget;
        const rect = volumeBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        
        this.volume = Math.max(0, Math.min(1, percent));
        this.updateVolumeBar();
    }

    updateVolumeBar() {
        const volumeFill = document.querySelector('.volume-fill');
        if (volumeFill) {
            volumeFill.style.width = `${this.volume * 100}%`;
        }
    }

    handleSearch(query) {
        if (query.length > 0) {
            this.showNotification(`搜索: ${query}`);
        }
    }

    handleNavigation(link) {
        // 只更新视觉状态，不阻止页面跳转
        const navText = link.querySelector('span').textContent;
        this.showNotification(`切换到: ${navText}`);
        
        // 延迟更新active状态，让页面有时间跳转
        setTimeout(() => {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            link.closest('.nav-item').classList.add('active');
        }, 100);
    }

    createPlaylist() {
        const playlistName = prompt('请输入播放列表名称:');
        if (playlistName && playlistName.trim()) {
            this.addPlaylistToSidebar(playlistName.trim());
            this.showNotification(`已创建播放列表: ${playlistName}`);
        }
    }

    addPlaylistToSidebar(name) {
        const playlistList = document.querySelector('.playlist-list');
        if (playlistList) {
            const listItem = document.createElement('li');
            listItem.className = 'playlist-item';
            listItem.innerHTML = `<a href="#" class="playlist-link">${name}</a>`;
            playlistList.appendChild(listItem);
            
            const newLink = listItem.querySelector('.playlist-link');
            newLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification(`打开播放列表: ${name}`);
            });
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(26, 30, 31, 0.95);
            color: #EFEEE0;
            padding: 12px 20px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(250, 205, 102, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    updateUI() {
        this.updateProgressBar();
        this.updateVolumeBar();
        this.updatePlayButton();
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const player = new MusicPlayer();
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .chart-item.playing {
            background: rgba(250, 205, 102, 0.1);
            border-color: rgba(250, 205, 102, 0.3);
        }
        
        .chart-item.playing .chart-song {
            color: #FACD66;
        }
    `;
    document.head.appendChild(style);
});