# LCP Debugging Snippets

Use these JavaScript snippets with `chrome-devtools-axi eval` to inspect the page.

## 1. Identify LCP Element

Use this snippet to identify the LCP element and get raw timing data from the Performance API.

```javascript
async () => {
  if (!('PerformanceObserver' in window)) {
    return {supported: false, reason: 'PerformanceObserver unavailable'};
  }

  return await new Promise(resolve => {
    let settled = false;
    const finish = result => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      observer.disconnect();
      resolve(result);
    };
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      finish({
        supported: true,
        found: Boolean(last),
        element: last?.element?.tagName,
        id: last?.element?.id,
        className: last?.element?.className,
        url: last?.url,
        startTime: last?.startTime,
        renderTime: last?.renderTime,
        loadTime: last?.loadTime,
        size: last?.size,
      });
    });
    const timeout = setTimeout(
      () => finish({supported: true, found: false, reason: 'No buffered LCP entry found'}),
      1000,
    );
    observer.observe({type: 'largest-contentful-paint', buffered: true});
  });
};
```

## 2. Audit Common Issues

Use this snippet to check for common DOM-based LCP issues (lazy loading, priority).

```javascript
() => {
  const issues = [];
  const isVisible = rect =>
    rect.bottom > 0 &&
    rect.top < window.innerHeight &&
    rect.right > 0 &&
    rect.left < window.innerWidth;

  // Flag lazy-loaded viewport candidates for comparison with the observed LCP element.
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    const rect = img.getBoundingClientRect();
    if (isVisible(rect)) {
      issues.push({
        issue: 'lazy-loaded viewport image candidate',
        element: img.outerHTML.substring(0, 200),
        fix: 'Verify this is the observed LCP element before changing loading or fetch priority; prioritize only the LCP resource.',
      });
    }
  });

  // Flag large viewport candidates for comparison with the observed LCP element.
  document.querySelectorAll('img:not([fetchpriority])').forEach(img => {
    const rect = img.getBoundingClientRect();
    if (isVisible(rect) && rect.width * rect.height > 50000) {
      issues.push({
        issue: 'large viewport image candidate without fetchpriority',
        element: img.outerHTML.substring(0, 200),
        fix: 'Verify this is the observed LCP element before changing loading or fetch priority; prioritize only the LCP resource.',
      });
    }
  });

  // Check for render-blocking scripts in head
  document
    .querySelectorAll(
      'head script:not([async]):not([defer]):not([type="module"])',
    )
    .forEach(script => {
      if (script.src) {
        issues.push({
          issue: 'render-blocking script in head',
          element: script.outerHTML.substring(0, 200),
          fix: 'Add async or defer attribute, or move to end of body',
        });
      }
    });

  return {issueCount: issues.length, issues};
};
```
