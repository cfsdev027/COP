export function el(tag, classes = [], attrs = {}) {
    const element = document.createElement(tag);
    if (classes.length > 0) {
        classes.forEach(cls => cls && element.classList.add(cls));
    }
  
    for (const [key, val] of Object.entries(attrs)) {
        if (key === 'textContent') element.textContent = val;
        else if (key === 'innerHTML') element.innerHTML = val;
        else element.setAttribute(key, val);
    }
  
    return element;
};
