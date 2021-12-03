import dopa from 'dopa';

export default function createStats(container) {
  let stats = new dopa.Canvas({
    container: container,
    duration: Infinity
  });

  const WIDTH = 80, HEIGHT = 48,
    TEXT_X = 3, TEXT_Y = 2,
    GRAPH_X = 3, GRAPH_Y = 15,
    GRAPH_WIDTH = 74, GRAPH_HEIGHT = 30;

  let background = stats.create('rect', {
    width: WIDTH,
    height: HEIGHT
  });
  let topBack = stats.create('rect', {
    width: WIDTH,
    height: GRAPH_Y
  });
  let text = stats.create('text', {
    startX: TEXT_X,
    startY: TEXT_Y,
    font: 'bold 9px Helvetica,Arial,sans-serif',
    align: 'left',
    baseline: 'top'
  });
  let graph = stats.create('rect', {
    startX: GRAPH_X,
    startY: GRAPH_Y,
    width: GRAPH_WIDTH,
    height: GRAPH_HEIGHT
  });
  let graphAlpha = stats.create('rect', graph, {alpha: 230 / 255});
  let right = stats.create('rect', {
    startX: GRAPH_X + GRAPH_WIDTH - 1,
    startY: GRAPH_Y,
    width: 1,
    height: GRAPH_HEIGHT
  });
  let rightAlpha = stats.create('rect', right, {alpha: 230 / 255});
  let image = stats.create('image', {
    startX: GRAPH_X,
    startY: GRAPH_Y,
    image: stats.canvas,
    width: GRAPH_WIDTH - 1,
    height: GRAPH_HEIGHT,
    cropX: GRAPH_X + 1,
    cropY: GRAPH_Y,
    cropWidth: GRAPH_WIDTH - 1,
    cropHeight: GRAPH_HEIGHT
  });

  function renderBackground() {
    background.fill();
    text.fill();
    graph.fill();
    graphAlpha.fill();
  }

  function render() {
    topBack.fill();
    text.fill();
    image.draw();
    right.fill();
    rightAlpha.fill();
  }

  let panels = [], map = {}, panel, mode;
  stats.addPanel = (name, fg, bg) => {
    let pan = {name: name, fg: fg, bg: bg, min: Infinity, max: 0};
    map[name] = pan;
    panels.push(pan);
  };
  stats.removePanel = (name) => { // 可以为 undefined
    if (panels.length <= 1) return;
    let pan = map[name], cur = pan === panel;
    if (!pan) {
      if (name) return;
      else pan = panel, cur = true;
    }
    let idx = panels.indexOf(pan);
    panels.splice(idx, 1), delete map[pan.name];
    if (cur) stats.showPanel(panels[idx < panels.length ? idx : idx - 1].name);
  };
  stats.showPanel = (name) => {
    if (!map[name]) return;
    panel = map[name];
    mode = panels.indexOf(panel);
    text.text = panel.name;
    text.fillStyle = graph.fillStyle = right.fillStyle = panel.fg;
    background.fillStyle = topBack.fillStyle =
      graphAlpha.fillStyle = rightAlpha.fillStyle = panel.bg;
    renderBackground();
  };
  stats.updatePanel = (name, value, maxValue) => {
    if (panel.name === name) {
      if (value < panel.min) panel.min = value;
      if (value > panel.max) panel.max = value;
      text.text = Math.round(value * 10) / 10 + ' ' + panel.name +
        ' (' + Math.floor(panel.min) + '-' + Math.ceil(panel.max) + ')';
      rightAlpha.height = Math.round((1 - (value / maxValue)) * GRAPH_HEIGHT);
      render();
    }
  };

  let pointer = null, cursor;
  stats.on('resize', renderBackground);
  stats.on('pointerdown', (ev) => {
    if (pointer) ev.stop(), stats.showPanel(panels[++mode % panels.length].name);
  });
  stats.on('pointermove', (ev) => {
    if (pointer) ev.stop();
    let mousein = background.isQuickInPath(ev.x, ev.y),
      xor = mousein ^ (pointer !== null);
    if (xor) {
      pointer = mousein ? background : null;
      if (pointer) cursor = stats.cursor, stats.cursor = 'pointer';
      else stats.cursor = cursor;
    }
  });

  stats.addPanel('FPS', '#00ffff', '#000022');
  stats.addPanel('MS', '#00ff00', '#002200');
  if (performance && performance.memory) stats.addPanel('MB', '#ff0088', '#220011');
  stats.showPanel('FPS');
  let frames = [];
  stats.on('update', (ratio, timestamp, interval) => {
    switch (panel.name) {
      case 'FPS': // 如果不 pause，timestamp 中会有一段空窗期
        let i;
        frames.push(timestamp); // 这个空窗期会致使 fps 维持一个中间值不变
        for (i = 0; i < frames.length; i++) {
          if (timestamp - frames[i] < 1000) break;
        }
        frames.splice(0, i);
        stats.updatePanel('FPS', frames.length - 1, 100);
        break;
      case 'MS':
        if (interval) stats.updatePanel('MS', interval, 50);
        break;
      case 'MB':
        let memory = performance.memory;
        stats.updatePanel('MB', memory.usedJSHeapSize / 1048576,
          memory.totalJSHeapSize / 1048576);
        break;
    }
  });
  stats.on('visibilitychange', (visible) => {
    visible ? stats.render() : stats.pause();
  });
  return stats;
}
