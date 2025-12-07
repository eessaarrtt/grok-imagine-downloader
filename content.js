// Grok Imagine Image Downloader - Content Script
(function() {
    'use strict';

    let downloadButton = null;
    let downloadPanel = null;
    let isDownloading = false;
    let downloadedCount = 0;
    let targetCount = 100;
    let downloadedUrls = new Set();

    // Создание кнопки загрузки
    function createDownloadButton() {
        if (downloadButton) return;

        downloadButton = document.createElement('button');
        downloadButton.id = 'grok-download-btn';
        downloadButton.innerHTML = '📥 Скачать изображения';
        downloadButton.className = 'grok-download-button';
        
        downloadButton.addEventListener('click', () => {
            toggleDownloadPanel();
        });

        // Добавляем кнопку на страницу
        const container = document.createElement('div');
        container.id = 'grok-download-container';
        container.appendChild(downloadButton);
        document.body.appendChild(container);
    }

    // Создание панели управления
    function createDownloadPanel() {
        if (downloadPanel) return;

        downloadPanel = document.createElement('div');
        downloadPanel.id = 'grok-download-panel';
        downloadPanel.innerHTML = `
            <div class="grok-panel-header">
                <h3>📥 Скачивание изображений</h3>
                <button class="grok-close-btn" id="grok-close-panel">×</button>
            </div>
            <div class="grok-panel-content">
                <div class="grok-input-group">
                    <label>Количество изображений:</label>
                    <input type="number" id="grok-target-count" value="100" min="1" max="1000">
                </div>
                <div class="grok-input-group">
                    <label>Префикс имени файла:</label>
                    <input type="text" id="grok-file-prefix" value="coloring_page" placeholder="coloring_page">
                </div>
                <div class="grok-stats">
                    <div>Найдено: <span id="grok-found-count">0</span></div>
                    <div>Скачано: <span id="grok-downloaded-count">0</span></div>
                </div>
                <div class="grok-buttons">
                    <button id="grok-scan-btn" class="grok-action-btn">🔍 Найти изображения</button>
                    <button id="grok-download-all-btn" class="grok-action-btn">📥 Скачать все</button>
                    <button id="grok-auto-download-btn" class="grok-action-btn">🚀 Авто-скачивание</button>
                </div>
                <div id="grok-status" class="grok-status"></div>
                <div id="grok-progress" class="grok-progress" style="display: none;">
                    <div class="grok-progress-bar">
                        <div class="grok-progress-fill" id="grok-progress-fill"></div>
                    </div>
                    <div class="grok-progress-text" id="grok-progress-text">0%</div>
                </div>
            </div>
        `;

        document.body.appendChild(downloadPanel);

        // Обработчики событий
        document.getElementById('grok-close-panel').addEventListener('click', () => {
            downloadPanel.style.display = 'none';
        });

        document.getElementById('grok-scan-btn').addEventListener('click', scanImages);
        document.getElementById('grok-download-all-btn').addEventListener('click', downloadAllImages);
        document.getElementById('grok-auto-download-btn').addEventListener('click', startAutoDownload);
    }

    // Переключение панели
    function toggleDownloadPanel() {
        if (!downloadPanel) {
            createDownloadPanel();
        }
        downloadPanel.style.display = downloadPanel.style.display === 'none' ? 'block' : 'none';
        if (downloadPanel.style.display === 'block') {
            scanImages();
        }
    }

    // Поиск всех изображений на странице
    function scanImages() {
        const statusEl = document.getElementById('grok-status');
        statusEl.textContent = '🔍 Поиск изображений...';
        statusEl.className = 'grok-status info';

        // Прокрутка страницы для загрузки всех изображений
        scrollToLoadImages().then(() => {
            const images = findAllImages();
            const foundCount = images.length;
            
            document.getElementById('grok-found-count').textContent = foundCount;
            document.getElementById('grok-downloaded-count').textContent = downloadedCount;
            
            statusEl.textContent = `✅ Найдено ${foundCount} изображений`;
            statusEl.className = 'grok-status success';
        });
    }

    // Прокрутка страницы для загрузки изображений
    function scrollToLoadImages() {
        return new Promise((resolve) => {
            let scrollAttempts = 0;
            let lastHeight = document.body.scrollHeight;
            const maxAttempts = 20;

            const scrollInterval = setInterval(() => {
                window.scrollTo(0, document.body.scrollHeight);
                
                setTimeout(() => {
                    const newHeight = document.body.scrollHeight;
                    if (newHeight === lastHeight) {
                        scrollAttempts++;
                        if (scrollAttempts >= 3) {
                            clearInterval(scrollInterval);
                            resolve();
                        }
                    } else {
                        scrollAttempts = 0;
                        lastHeight = newHeight;
                    }
                }, 1000);
            }, 2000);

            setTimeout(() => {
                clearInterval(scrollInterval);
                resolve();
            }, maxAttempts * 2000);
        });
    }

    // Поиск всех изображений (включая base64)
    function findAllImages() {
        const images = [];
        const selectors = [
            'img',
            'picture img',
            'canvas',
            '[style*="background-image"]',
            '[style*="background"]'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(img => {
                // Проверяем разные источники URL
                let url = img.src || 
                         img.getAttribute('data-src') || 
                         img.getAttribute('data-original') ||
                         img.getAttribute('srcset')?.split(',')[0]?.trim().split(' ')[0];
                
                // Для background-image
                if (!url && img.style.backgroundImage) {
                    const match = img.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
                    if (match) url = match[1];
                }

                // Проверяем, является ли это base64 изображением
                if (url && url.startsWith('data:image/')) {
                    // Base64 изображение
                    if (!downloadedUrls.has(url)) {
                        // Определяем расширение из MIME типа
                        const mimeMatch = url.match(/data:image\/([^;]+)/);
                        const extension = mimeMatch ? mimeMatch[1].split('+')[0] : 'png';
                        
                        images.push({
                            url: url,
                            element: img,
                            isBase64: true,
                            extension: extension
                        });
                    }
                }
                // Проверяем обычные HTTP URL
                else if (url && url.startsWith('http') && !downloadedUrls.has(url)) {
                    // Убираем параметры для получения оригинального изображения
                    const cleanUrl = url.split('?')[0];
                    if (cleanUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
                        images.push({
                            url: cleanUrl,
                            element: img,
                            isBase64: false,
                            extension: cleanUrl.match(/\.([^.]+)$/i)?.[1] || 'png'
                        });
                    }
                }
                
                // Также проверяем canvas элементы (могут содержать изображения)
                if (img.tagName === 'CANVAS' && !downloadedUrls.has(`canvas_${img.width}_${img.height}`)) {
                    try {
                        const dataUrl = img.toDataURL('image/png');
                        if (dataUrl && dataUrl.startsWith('data:image/')) {
                            images.push({
                                url: dataUrl,
                                element: img,
                                isBase64: true,
                                extension: 'png'
                            });
                        }
                    } catch (e) {
                        // Canvas может быть tainted (CORS), пропускаем
                    }
                }
            });
        });

        // Убираем дубликаты по URL
        return [...new Map(images.map(img => [img.url, img])).values()];
    }

    // Скачивание всех изображений
    async function downloadAllImages() {
        if (isDownloading) {
            showStatus('⚠️ Скачивание уже выполняется', 'warning');
            return;
        }

        isDownloading = true;
        targetCount = parseInt(document.getElementById('grok-target-count').value) || 100;
        const prefix = document.getElementById('grok-file-prefix').value || 'coloring_page';
        
        showStatus('📥 Начинаю скачивание...', 'info');
        showProgress(true);

        const images = findAllImages();
        const imagesToDownload = images.slice(0, targetCount);
        
        downloadedCount = 0;
        downloadedUrls.clear();

        for (let i = 0; i < imagesToDownload.length; i++) {
            const img = imagesToDownload[i];
            const extension = img.extension || 'png';
            const filename = `${prefix}_${String(i + 1).padStart(3, '0')}.${extension}`;

            try {
                await downloadImage(img.url, filename, img.isBase64);
                downloadedUrls.add(img.url);
                downloadedCount++;
                
                updateProgress((i + 1) / imagesToDownload.length * 100);
                document.getElementById('grok-downloaded-count').textContent = downloadedCount;
                
                // Небольшая задержка между скачиваниями
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Ошибка скачивания ${img.url}:`, error);
            }
        }

        isDownloading = false;
        showStatus(`✅ Скачано ${downloadedCount} изображений!`, 'success');
        showProgress(false);
    }

    // Автоматическое скачивание с прокруткой
    async function startAutoDownload() {
        if (isDownloading) {
            showStatus('⚠️ Скачивание уже выполняется', 'warning');
            return;
        }

        isDownloading = true;
        targetCount = parseInt(document.getElementById('grok-target-count').value) || 100;
        const prefix = document.getElementById('grok-file-prefix').value || 'coloring_page';
        
        showStatus('🚀 Автоматическое скачивание запущено...', 'info');
        showProgress(true);

        downloadedCount = 0;
        downloadedUrls.clear();

        // Прокручиваем и скачиваем до достижения целевого количества
        while (downloadedCount < targetCount) {
            // Прокрутка для загрузки новых изображений
            await scrollToLoadImages();
            
            const images = findAllImages();
            const newImages = images.filter(img => !downloadedUrls.has(img.url));
            
            if (newImages.length === 0) {
                showStatus('⚠️ Новых изображений не найдено. Прокрутите страницу вручную.', 'warning');
                await new Promise(resolve => setTimeout(resolve, 3000));
                continue;
            }

            // Скачиваем новые изображения
            for (let i = 0; i < newImages.length && downloadedCount < targetCount; i++) {
                const img = newImages[i];
                const extension = img.extension || 'png';
                const filename = `${prefix}_${String(downloadedCount + 1).padStart(3, '0')}.${extension}`;

                try {
                    await downloadImage(img.url, filename, img.isBase64);
                    downloadedUrls.add(img.url);
                    downloadedCount++;
                    
                    updateProgress((downloadedCount / targetCount) * 100);
                    document.getElementById('grok-downloaded-count').textContent = downloadedCount;
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error(`Ошибка скачивания ${img.url}:`, error);
                }
            }

            if (downloadedCount >= targetCount) {
                break;
            }
        }

        isDownloading = false;
        showStatus(`✅ Автоматическое скачивание завершено! Скачано ${downloadedCount} изображений.`, 'success');
        showProgress(false);
    }

    // Скачивание одного изображения (поддержка base64 и обычных URL)
    function downloadImage(url, filename, isBase64 = false) {
        return new Promise((resolve, reject) => {
            try {
                if (isBase64 || url.startsWith('data:image/')) {
                    // Base64 изображение
                    const blob = base64ToBlob(url);
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(blobUrl);
                    resolve();
                } else {
                    // Обычный HTTP URL
                    fetch(url)
                        .then(response => {
                            if (!response.ok) throw new Error(`HTTP ${response.status}`);
                            return response.blob();
                        })
                        .then(blob => {
                            const blobUrl = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = blobUrl;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(blobUrl);
                            resolve();
                        })
                        .catch(reject);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // Конвертация base64 в Blob
    function base64ToBlob(base64String) {
        // Убираем префикс data:image/...
        const parts = base64String.split(',');
        if (parts.length !== 2) {
            throw new Error('Invalid base64 string');
        }
        
        const mimeMatch = base64String.match(/data:image\/([^;]+)/);
        const mimeType = mimeMatch ? `image/${mimeMatch[1].split('+')[0]}` : 'image/png';
        
        // Декодируем base64
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        return new Blob([byteArray], { type: mimeType });
    }

    // Показ статуса
    function showStatus(message, type = 'info') {
        const statusEl = document.getElementById('grok-status');
        statusEl.textContent = message;
        statusEl.className = `grok-status ${type}`;
    }

    // Показ прогресса
    function showProgress(show) {
        const progressEl = document.getElementById('grok-progress');
        progressEl.style.display = show ? 'block' : 'none';
    }

    // Обновление прогресса
    function updateProgress(percent) {
        const fillEl = document.getElementById('grok-progress-fill');
        const textEl = document.getElementById('grok-progress-text');
        fillEl.style.width = `${percent}%`;
        textEl.textContent = `${Math.round(percent)}%`;
    }

    // Инициализация при загрузке страницы
    function init() {
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(createDownloadButton, 1000);
            });
        } else {
            setTimeout(createDownloadButton, 1000);
        }
    }

    init();
})();

