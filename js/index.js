import { rgbToHex, showNotification, copyToClipboard, addColorToPalette } from './main.js';

// =========================
// HOME PAGE - RAINBOW COLOR PICKER
// =========================

export function initRainbowPicker() {
    const canvas = document.getElementById('colorCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const crosshair = document.getElementById('crosshair');
    const colorPreview = document.getElementById('colorPreview');
    const hexValue = document.getElementById('hexValue');
    const rgbValue = document.getElementById('rgbValue');
    
    let currentColor = { r: 123, g: 97, b: 255 }; // Default color
    
    // Draw rainbow gradient on canvas
    function drawRainbowGradient() {
        // Create horizontal rainbow gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(0.17, '#FF00FF');
        gradient.addColorStop(0.34, '#0000FF');
        gradient.addColorStop(0.51, '#00FFFF');
        gradient.addColorStop(0.68, '#00FF00');
        gradient.addColorStop(0.85, '#FFFF00');
        gradient.addColorStop(1, '#FF0000');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add white-to-black vertical gradient overlay
        const verticalGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        verticalGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        verticalGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        verticalGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        verticalGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        
        ctx.fillStyle = verticalGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Update color display
    function updateColorDisplay(r, g, b) {
        currentColor = { r, g, b };
        const hex = rgbToHex(r, g, b);
        const rgb = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
        
        colorPreview.style.background = hex;
        hexValue.value = hex;
        rgbValue.value = rgb;
    }
    
    // Handle color picking on canvas
    function pickColor(event) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.max(0, Math.min(event.clientX - rect.left, canvas.width - 1));
        const y = Math.max(0, Math.min(event.clientY - rect.top, canvas.height - 1));
        
        // Get pixel data at clicked position
        const imageData = ctx.getImageData(x, y, 1, 1);
        const pixel = imageData.data;
        
        updateColorDisplay(pixel[0], pixel[1], pixel[2]);
        
        // Position crosshair
        crosshair.style.left = x + 'px';
        crosshair.style.top = y + 'px';
        crosshair.classList.add('visible');
    }
    
    // Dragging support for rainbow picker
    let isDragging = false;
    
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        pickColor(e);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            pickColor(e);
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });
    
    // Touch support for mobile
    canvas.addEventListener('touchstart', (e) => {
        isDragging = true;
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        pickColor(mouseEvent);
        e.preventDefault();
    });
    
    canvas.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            pickColor(mouseEvent);
        }
        e.preventDefault();
    });
    
    canvas.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // Initialize
    drawRainbowGradient();
    updateColorDisplay(currentColor.r, currentColor.g, currentColor.b);
    
    // Separate copy buttons for HEX and RGB
    const copyHexBtn = document.getElementById('copyHexBtn');
    if (copyHexBtn) {
        copyHexBtn.addEventListener('click', () => {
            const hex = hexValue.value;
            copyToClipboard(hex, `Copied HEX: ${hex}`);
        });
    }
    
    const copyRgbBtn = document.getElementById('copyRgbBtn');
    if (copyRgbBtn) {
        copyRgbBtn.addEventListener('click', () => {
            const rgb = rgbValue.value;
            copyToClipboard(rgb, `Copied RGB: ${rgb}`);
        });
    }
    
    // Add to palette button
    const addBtn = document.getElementById('addToPaletteBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const hex = hexValue.value;
            addColorToPalette(hex);
            showNotification(`Added ${hex} to palette`);
        });
    }
}

// =========================
// HOME PAGE - IMAGE EYEDROPPER
// =========================

export function initImageEyedropper() {
    const imageUpload = document.getElementById('imageUpload');
    const imageCanvas = document.getElementById('imageCanvas');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    
    if (!imageUpload || !imageCanvas) return;
    
    const ctx = imageCanvas.getContext('2d');
    let uploadedImage = null;
    
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                uploadedImage = img;
                
                // Calculate scaled dimensions while preserving aspect ratio.
                // Make the uploaded image as large as reasonably possible within the page
                // by using the content container width and a viewport-based max height.
                const container = document.querySelector('.container');
                const containerWidth = container ? container.clientWidth : 900;
                const maxDisplayWidth = Math.min(containerWidth, 820); // cap width
                const maxDisplayHeight = Math.max(Math.round(window.innerHeight * 0.7), 420);

                // Compute scale that preserves aspect ratio. Allow enlargement up to 2x so
                // portrait / small images become larger and easier to see, but cap it.
                let scale = Math.min(maxDisplayWidth / img.width, maxDisplayHeight / img.height);
                if (!isFinite(scale) || scale <= 0) scale = 1;
                scale = Math.min(scale, 2); // cap to avoid extreme upscaling

                const width = Math.round(img.width * scale);
                const height = Math.round(img.height * scale);
                
                // Set canvas size and draw image
                imageCanvas.width = width;
                imageCanvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Show preview container
                imagePreviewContainer.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    // Extract color on canvas click with floating tooltip
    const tooltip = document.getElementById('eyedropperTooltip');
    let tooltipTimeout;
    
    imageCanvas.addEventListener('click', (event) => {
        if (!uploadedImage) return;
        
        const rect = imageCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Scale coordinates to actual canvas size
        const scaleX = imageCanvas.width / rect.width;
        const scaleY = imageCanvas.height / rect.height;
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;
        
        // Get pixel data
        const imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
        const pixel = imageData.data;
        
        // Update color values
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
        const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        
        // Update main color preview
        const colorPreview = document.getElementById('colorPreview');
        const hexValue = document.getElementById('hexValue');
        const rgbValue = document.getElementById('rgbValue');
        
        if (colorPreview) colorPreview.style.background = hex;
        if (hexValue) hexValue.value = hex;
        if (rgbValue) rgbValue.value = rgb;
        
        // Show floating tooltip
        if (tooltip) {
            // Position tooltip near cursor
            tooltip.style.left = event.clientX + 'px';
            tooltip.style.top = event.clientY + 'px';
            
            // Update tooltip content
            document.getElementById('tooltipColorPreview').style.background = hex;
            document.getElementById('tooltipHex').textContent = hex;
            document.getElementById('tooltipRgb').textContent = rgb;
            
            // Show tooltip
            tooltip.classList.add('show');
            
            // Clear previous timeout
            if (tooltipTimeout) clearTimeout(tooltipTimeout);
            
            // Auto-hide after 3 seconds
            tooltipTimeout = setTimeout(() => {
                tooltip.classList.remove('show');
            }, 3000);
        }
    });
    
    // Tooltip button handlers
    const tooltipCopyHex = document.getElementById('tooltipCopyHex');
    const tooltipCopyRgb = document.getElementById('tooltipCopyRgb');
    const tooltipAddPalette = document.getElementById('tooltipAddPalette');
    
    if (tooltipCopyHex) {
        tooltipCopyHex.addEventListener('click', () => {
            const hex = document.getElementById('tooltipHex').textContent;
            copyToClipboard(hex, `Copied HEX: ${hex}`);
        });
    }
    
    if (tooltipCopyRgb) {
        tooltipCopyRgb.addEventListener('click', () => {
            const rgb = document.getElementById('tooltipRgb').textContent;
            copyToClipboard(rgb, `Copied RGB: ${rgb}`);
        });
    }
    
    if (tooltipAddPalette) {
        tooltipAddPalette.addEventListener('click', () => {
            const hex = document.getElementById('tooltipHex').textContent;
            addColorToPalette(hex);
            showNotification(`Added ${hex} to palette`);
            tooltip.classList.remove('show');
        });
    }
}