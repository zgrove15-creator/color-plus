// Color Modifier Tool

function initializeColorModifier() {
  console.log('Initializing Color Modifier tool...');

  const modifierColorInput = document.getElementById('modifier-color');
  const modifierColorPicker = document.getElementById('modifier-color-picker');
  const modifierColorPreview = document.getElementById('modifier-color-preview');
  const modifierColorError = document.getElementById('modifier-color-error');
  const resetBtn = document.getElementById('reset-modifier');

  let originalColor = '#F0813E';
  let adjustments = {
    lightness: 0,
    saturation: 0,
    hue: 0,
    opacity: 100
  };

  let draggedScale = null;

  // Initial setup
  updateColorPreview();
  updateModified();

  // ===== INPUT HANDLING =====
  modifierColorInput.addEventListener('input', function() {
    let value = this.value.trim().toUpperCase();
    if (!value.startsWith('#')) {
      value = '#' + value;
    }

    if (isValidHex(value)) {
      modifierColorInput.classList.remove('invalid');
      modifierColorInput.classList.add('valid');
      modifierColorError.classList.remove('show');
      originalColor = value;
      modifierColorPicker.value = value;
      modifierColorPreview.style.backgroundColor = value;
      adjustments = { lightness: 0, saturation: 0, hue: 0, opacity: 100 };
      updateDisplayValues();
      updateModified();
    } else if (value.length >= 7) {
      modifierColorInput.classList.remove('valid');
      modifierColorInput.classList.add('invalid');
      modifierColorError.textContent = '⚠️ Invalid format. Use #RRGGBB';
      modifierColorError.classList.add('show');
    }
  });

  modifierColorPreview.addEventListener('click', () => {
    modifierColorPicker.click();
  });

  modifierColorPicker.addEventListener('change', function() {
    originalColor = this.value.toUpperCase();
    modifierColorInput.value = originalColor;
    modifierColorInput.classList.remove('invalid');
    modifierColorInput.classList.add('valid');
    modifierColorError.classList.remove('show');
    modifierColorPreview.style.backgroundColor = originalColor;
    adjustments = { lightness: 0, saturation: 0, hue: 0, opacity: 100 };
    updateDisplayValues();
    updateModified();
  });

  // ===== ADJUSTMENT BUTTONS =====
  document.querySelectorAll('.adj-btn').forEach((btn) => {
    btn.addEventListener('click', function() {
      const adjust = this.getAttribute('data-adjust');
      const amount = parseInt(this.getAttribute('data-amount'));
      adjustments[adjust] += amount;

      // Clamp values
      if (adjust === 'lightness') {
        adjustments.lightness = Math.max(-100, Math.min(100, adjustments.lightness));
      } else if (adjust === 'saturation') {
        adjustments.saturation = Math.max(-100, Math.min(100, adjustments.saturation));
      } else if (adjust === 'hue') {
        adjustments.hue = (adjustments.hue % 360 + 360) % 360;
      } else if (adjust === 'opacity') {
        adjustments.opacity = Math.max(0, Math.min(100, adjustments.opacity));
      }

      updateDisplayValues();
      updateModified();
    });
  });

  // ===== SCALE DRAGGING =====
  function getAdjustmentType(scaleElement) {
    if (scaleElement.id === 'lightness-scale') return 'lightness';
    if (scaleElement.id === 'saturation-scale') return 'saturation';
    if (scaleElement.id === 'hue-scale') return 'hue';
    if (scaleElement.id === 'opacity-scale') return 'opacity';
    return null;
  }

  function handleScaleInteraction(scale, clientX) {
    const rect = scale.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const adjustType = getAdjustmentType(scale);

    if (adjustType === 'lightness') {
      adjustments.lightness = Math.round((percent * 200) - 100);
    } else if (adjustType === 'saturation') {
      adjustments.saturation = Math.round((percent * 200) - 100);
    } else if (adjustType === 'hue') {
      adjustments.hue = Math.round(percent * 360) % 360;
    } else if (adjustType === 'opacity') {
      adjustments.opacity = Math.round(percent * 100);
    }

    updateDisplayValues();
    updateModified();
  }

  // ===== CLICK AND DRAG SETUP =====
  document.querySelectorAll('.adjustment-scale').forEach((scale) => {
    // Click on scale to update
    scale.addEventListener('click', function(e) {
      if (e.target.classList.contains('scale-indicator')) return; // Don't double-fire
      handleScaleInteraction(scale, e.clientX);
    });

    // Start drag on indicator
    const indicator = scale.querySelector('.scale-indicator');
    indicator.addEventListener('mousedown', function(e) {
      e.preventDefault();
      draggedScale = scale;
    });

    // Touch support
    indicator.addEventListener('touchstart', function(e) {
      draggedScale = scale;
      const touch = e.touches[0];
      handleScaleInteraction(scale, touch.clientX);
    });
  });

  // Global mousemove for dragging
  document.addEventListener('mousemove', function(e) {
    if (draggedScale) {
      handleScaleInteraction(draggedScale, e.clientX);
    }
  });

  // End drag
  document.addEventListener('mouseup', function() {
    draggedScale = null;
  });

  // Touch move
  document.addEventListener('touchmove', function(e) {
    if (draggedScale) {
      e.preventDefault();
      const touch = e.touches[0];
      handleScaleInteraction(draggedScale, touch.clientX);
    }
  });

  // Touch end
  document.addEventListener('touchend', function() {
    draggedScale = null;
  });

  // ===== RESET BUTTON =====
  resetBtn.addEventListener('click', function() {
    adjustments = { lightness: 0, saturation: 0, hue: 0, opacity: 100 };
    updateDisplayValues();
    updateModified();
  });

  // ===== UPDATE FUNCTIONS =====
  function updateDisplayValues() {
    document.getElementById('lightness-display').textContent = adjustments.lightness;
    document.getElementById('saturation-display').textContent = adjustments.saturation;
    document.getElementById('hue-display').textContent = adjustments.hue + '°';
    document.getElementById('opacity-display').textContent = adjustments.opacity + '%';

    updateScaleIndicators();
  }

  function updateScaleIndicators() {
    // Lightness: -100 to +100 → 0% to 100%
    const lightnessPercent = ((adjustments.lightness + 100) / 200) * 100;
    document.getElementById('lightness-indicator').style.left = lightnessPercent + '%';

    // Saturation: -100 to +100 → 0% to 100%
    const saturationPercent = ((adjustments.saturation + 100) / 200) * 100;
    document.getElementById('saturation-indicator').style.left = saturationPercent + '%';

    // Hue: 0 to 360 → 0% to 100%
    const huePercent = (adjustments.hue / 360) * 100;
    document.getElementById('hue-indicator').style.left = huePercent + '%';

    // Opacity: 0 to 100 → 0% to 100%
    const opacityPercent = adjustments.opacity;
    document.getElementById('opacity-indicator').style.left = opacityPercent + '%';
  }

  function updateColorPreview() {
    modifierColorPreview.style.backgroundColor = originalColor;
    modifierColorPicker.value = originalColor;
  }

  function updateModified() {
    // Convert original to HSL
    const [h, s, l] = hexToHsl(originalColor);

    // Apply adjustments
    let newH = (h + adjustments.hue) % 360;
    if (newH < 0) newH += 360;

    let newS = Math.max(0, Math.min(100, s + adjustments.saturation));
    let newL = Math.max(0, Math.min(100, l + adjustments.lightness));

    // Convert back to hex
    const modifiedHex = hslToHex(newH, newS, newL);
    const opacity = adjustments.opacity / 100;

    // Update original preview
    document.getElementById('original-swatch').style.backgroundColor = originalColor;
    updateColorCodes('original', originalColor, null);

    // Update modified preview
    const modifiedColor = opacity === 1 
      ? modifiedHex 
      : `rgba(${hexToRgb(modifiedHex).r}, ${hexToRgb(modifiedHex).g}, ${hexToRgb(modifiedHex).b}, ${opacity})`;
    
    document.getElementById('modified-swatch').style.backgroundColor = modifiedColor;
    updateColorCodes('modified', modifiedHex, opacity);
  }

  function updateColorCodes(type, hex, opacity) {
    const container = document.getElementById(`${type}-codes`);
    const rgb = hexToRgb(hex);
    
    let html = `
      <button class="modifier-code-btn" data-hex="${hex}" title="Click to copy">
        ${hex}
      </button>
      <button class="modifier-code-btn" data-hex="rgb(${rgb.r}, ${rgb.g}, ${rgb.b})" title="Click to copy">
        rgb(${rgb.r}, ${rgb.g}, ${rgb.b})
      </button>
    `;

    if (opacity !== null && opacity !== 1) {
      const opacityDec = opacity.toFixed(2);
      html += `
        <button class="modifier-code-btn" data-hex="rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacityDec})" title="Click to copy">
          rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacityDec})
        </button>
      `;
    }

    container.innerHTML = html;

    // Add copy listeners
    container.querySelectorAll('.modifier-code-btn').forEach((btn) => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const code = this.getAttribute('data-hex');
        copyHexToClipboard(this, code);
      });
    });
  }
}

// ===== COLOR CONVERSION HELPERS =====

function hexToHsl(hex) {
  let r = parseInt(hex.substring(1, 3), 16) / 255;
  let g = parseInt(hex.substring(3, 5), 16) / 255;
  let b = parseInt(hex.substring(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (n) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return '#' + (toHex(r) + toHex(g) + toHex(b)).toUpperCase();
}

function hexToRgb(hex) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return { r, g, b };
}

function isValidHex(hex) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
  initializeColorModifier();
});