# Grok Imagine Image Downloader

Chrome extension for downloading images from grok.com/imagine

Chrome расширение для скачивания изображений с grok.com/imagine

---

## 🇷🇺 Русский

### Описание

Расширение для автоматического скачивания изображений с Grok Imagine. Поддерживает base64 изображения, автоматическую прокрутку страницы и скачивание до 1000 изображений.

Пацаны, сделал автоскачивание изображений с Grok. Делал для себя и решил поделиться с вами, вдруг кому-то понадобится.

Ничего туда не встроил, никаких вирусов. Кто шарит в коде, можете проверить или в специальных сервисах.

Делал для себя, мне хватает.

Некоторые изображения процентов 30-40 некорректно скачиваются, ну и ладно.

### Установка

1. Скачай или клонируй этот репозиторий:
   ```bash
   git clone https://github.com/ТВОЙ_USERNAME/grok-imagine-downloader.git
   ```

2. Открой Chrome и перейди в `chrome://extensions/`

3. Включи "Режим разработчика" (переключатель справа вверху)

4. Нажми "Загрузить распакованное расширение" (Load unpacked)

5. Выбери папку с расширением

6. Готово! Расширение установлено ✅

### Использование

1. Открой https://grok.com/imagine

2. В правом верхнем углу появится кнопка "📥 Скачать изображения"

3. Нажми на кнопку → откроется панель управления

4. Настрой параметры:
   - **Количество изображений** (по умолчанию 100)
   - **Префикс имени файла** (по умолчанию "coloring_page")

5. Выбери действие:
   - **🔍 Найти изображения** — найти все изображения на странице
   - **📥 Скачать все** — скачать все найденные изображения
   - **🚀 Авто-скачивание** — автоматически прокручивать страницу и скачивать до указанного количества

### Функции

- ✅ Автоматический поиск всех изображений на странице (включая base64)
- ✅ Автоматическая прокрутка для загрузки новых изображений
- ✅ Скачивание до 1000 изображений
- ✅ Настраиваемый префикс имени файла
- ✅ Отслеживание прогресса скачивания
- ✅ Предотвращение дубликатов
- ✅ Поддержка base64 изображений
- ✅ Извлечение изображений из canvas элементов

### Важно

- Изображения скачиваются в папку загрузок по умолчанию
- Расширение работает только на странице grok.com/imagine
- Для лучших результатов используй функцию "Авто-скачивание"
- Некоторые изображения могут скачиваться некорректно (30-40%) — это нормально

### Технические детали

Расширение использует Content Scripts для работы на странице Grok. Ищет изображения через различные селекторы:
- `<img>` элементы с атрибутами `src`, `data-src`
- Элементы с `background-image` в стилях
- Canvas элементы
- Base64 изображения в формате `data:image/...`

---

## 🇬🇧 English

### Description

Chrome extension for automatically downloading images from Grok Imagine. Supports base64 images, automatic page scrolling, and downloading up to 1000 images.

Made this for myself and decided to share it with you, in case someone needs it.

No viruses, no tracking, nothing malicious. Feel free to check the code or use security services.

Made for personal use, works for me.

Some images (about 30-40%) may download incorrectly, that's fine.

### Installation

1. Download or clone this repository:
   ```bash
   git clone https://github.com/ТВОЙ_USERNAME/grok-imagine-downloader.git
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable "Developer mode" (toggle in the top right corner)

4. Click "Load unpacked"

5. Select the extension folder

6. Done! Extension is installed ✅

### Usage

1. Open https://grok.com/imagine

2. A button "📥 Скачать изображения" will appear in the top right corner

3. Click the button → control panel will open

4. Configure settings:
   - **Number of images** (default: 100)
   - **File name prefix** (default: "coloring_page")

5. Choose an action:
   - **🔍 Find images** — find all images on the page
   - **📥 Download all** — download all found images
   - **🚀 Auto-download** — automatically scroll the page and download up to the specified number

### Features

- ✅ Automatic search for all images on the page (including base64)
- ✅ Automatic scrolling to load new images
- ✅ Download up to 1000 images
- ✅ Customizable file name prefix
- ✅ Download progress tracking
- ✅ Duplicate prevention
- ✅ Base64 image support
- ✅ Canvas element image extraction

### Important Notes

- Images are downloaded to the default downloads folder
- Extension works only on grok.com/imagine page
- For best results, use the "Auto-download" function
- Some images may download incorrectly (30-40%) — this is normal

### Technical Details

The extension uses Content Scripts to work on the Grok page. Searches for images through various selectors:
- `<img>` elements with `src`, `data-src` attributes
- Elements with `background-image` in styles
- Canvas elements
- Base64 images in `data:image/...` format

---

## 📝 License

Free to use, modify, and distribute.

## 🤝 Contributing

Feel free to submit issues and pull requests.

## ⚠️ Disclaimer

This extension is not affiliated with Grok or X (Twitter). Use at your own risk.
