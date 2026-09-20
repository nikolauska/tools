# Accessibility Debugging Snippets

Use these JavaScript snippets with `chrome-devtools-axi eval`.

## 1. Find Orphaned Form Inputs

Finds form inputs that lack an associated label (no `label[for]`, `aria-label`, `aria-labelledby`, or wrapping `<label>`).

```js
() =>
  Array.from(document.querySelectorAll('input, select, textarea'))
    .filter(i => {
      const hasLabel = i.labels?.length > 0;
      const hasAria =
        i.getAttribute('aria-label') || i.getAttribute('aria-labelledby');
      return !hasLabel && !hasAria && !i.closest('label');
    })
    .map(i => ({
      tag: i.tagName,
      id: i.id,
      name: i.name,
      placeholder: i.placeholder,
    }));
```

## 2. Measure Tap Target Size

Returns the bounding box dimensions of the first element matching `SELECTOR`. Replace `SELECTOR` with a CSS selector before running it.

```js
() => {
  const el = document.querySelector('SELECTOR');
  if (!el) return {error: 'Element not found'};
  const rect = el.getBoundingClientRect();
  return {width: rect.width, height: rect.height};
};
```

## 3. Check Color Contrast

Approximates the contrast ratio between an element's text color and its nearest opaque ancestor background. Replace `SELECTOR` with a CSS selector before running it.

**Note**: This still cannot model gradients, images, shadows, or semi-transparent overlays precisely. Treat it as a debugging aid, not a compliance verdict.

```js
() => {
  const el = document.querySelector('SELECTOR');
  if (!el) return {error: 'Element not found'};
  function getRGB(colorStr) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match
      ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
      : [255, 255, 255];
  }
  function luminance(r, g, b) {
    const a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function alpha(colorStr) {
    const match = colorStr.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([^)]+)\)/);
    return match ? parseFloat(match[1]) : 1;
  }
  function findBackground(node) {
    let current = node;
    while (current) {
      const color = window.getComputedStyle(current).backgroundColor;
      if (color && color !== 'transparent' && alpha(color) > 0) return color;
      current = current.parentElement;
    }
    return 'rgb(255, 255, 255)';
  }

  const style = window.getComputedStyle(el);
  const fg = getRGB(style.color);
  const bgColor = findBackground(el);
  const bg = getRGB(bgColor);

  const l1 = luminance(fg[0], fg[1], fg[2]);
  const l2 = luminance(bg[0], bg[1], bg[2]);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    color: style.color,
    bg: bgColor,
    contrastRatio: ratio.toFixed(2),
  };
};
```

## 4. Global Page Checks

Checks document-level accessibility settings often missed in component testing.

```js
() => ({
  lang:
    document.documentElement.lang ||
    'MISSING - Screen readers need this for pronunciation',
  title: document.title || 'MISSING - Required for context',
  viewport:
    document.querySelector('meta[name="viewport"]')?.content ||
    'MISSING - Check for user-scalable=no (bad practice)',
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'Enabled'
    : 'Disabled',
});
```
