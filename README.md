# dopa-stats
Inspiration from mrdoob/stats.js, rewritten with dopa(canvas)

# install

1. `<script src="https://cdn.jsdelivr.net/npm/dopa-stats"></script>`
2. `npm install dopa-stats --save`

# usage

```html
<div id="stats" style="position: fixed;left: 0;top: 0;width: 80px;height: 48px;opacity: 0.9;"></div>

<script>
  let stats = createStats('#stats');
  // stats.addPanel('TEST1', '#ffff88', '#222211');
  // stats.addPanel('TEST2', '#ff88ff', '#221122');
  // stats.showPanel('TEST1');
  // stats.updatePanel('TEST1', value, maxValue);
  // stats.removePanel('TEST1');
</script>
```

# dependency

[dopa](https://github.com/JarenChow/dopa)

# page

[dopa-stats](https://JarenChow.github.io/dopa-stats)
