console.log('Color+ loaded');

if (typeof chroma === 'undefined') {
  console.error('Chroma.js failed to load. Check your internet connection.');
  document.body.innerHTML += '<p style="color: red; text-align: center; margin-top: 50px;">❌ Error: Color library failed to load. Check your internet connection.</p>';
} else {
  console.log('Chroma.js is available');
  
  document.addEventListener('DOMContentLoaded', function() {
    setupNav();
    initializeContrastFix();
    initializeComplementFinder();
  });
}

function setupNav() {
  console.log('Setting up navigation...');
  
  const navBoxes = document.querySelectorAll('.nav-box');
  const toolSections = document.querySelectorAll('.tool-section');

  navBoxes.forEach((box) => {
    box.addEventListener('click', function() {
      const toolName = this.getAttribute('data-tool');
      
      navBoxes.forEach(b => b.classList.remove('active'));
      toolSections.forEach(s => s.classList.remove('active'));
      
      this.classList.add('active');
      document.getElementById(toolName + '-tool').classList.add('active');
    });
  });
}

// HELPER FUNCTIONS
function isInputFocused(target) {
  return target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA';
}

function showShortcutFeedback(message) {
  const feedback = document.createElement('div');
  feedback.className = 'keyboard-feedback';
  feedback.textContent = message;
  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 1500);
}

function copyToClipboard(text, message) {
  navigator.clipboard.writeText(text).then(() => {
    showShortcutFeedback(message);
  }).catch((err) => {
    console.error('Copy failed:', err);
  });
}

function validateHexColor(value) {
  const hex = value.trim();
  if (hex === '') return { valid: false, message: 'Color required' };
  if (!chroma.valid(hex)) {
    return { valid: false, message: 'Invalid format. Use #RRGGBB' };
  }
  return { valid: true, message: '' };
}

function updateColorValidation(input, errorElement) {
  const validation = validateHexColor(input.value);
  
  input.classList.remove('invalid', 'valid');
  errorElement.classList.remove('show');

  if (input.value.trim() !== '') {
    if (validation.valid) {
      input.classList.add('valid');
    } else {
      input.classList.add('invalid');
      errorElement.textContent = '⚠️ ' + validation.message;
      errorElement.classList.add('show');
    }
  }
}

function copyHexToClipboard(button, hex) {
  navigator.clipboard.writeText(hex).then(() => {
    const originalText = button.textContent;
    button.textContent = '✓ Copied!';
    button.classList.add('copied');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);
  }).catch((err) => {
    console.error('Failed to copy:', err);
  });
}