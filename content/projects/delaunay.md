---
title: "Delaunay Triangulator"
date: 2012-01-01
draft: false
summary: "An interactive canvas app for computing and visualising Delaunay triangulations and Voronoi diagrams."
tags: ["JavaScript", "algorithms", "geometry"]
showToc: false
---

An interactive tool for computing [Delaunay triangulations](https://en.wikipedia.org/wiki/Delaunay_triangulation) and their dual [Voronoi diagrams](https://en.wikipedia.org/wiki/Voronoi_diagram) in the browser. Click anywhere on the canvas to place points; the triangulation updates in real time.

---

{{< rawhtml >}}
<style>
.delaunay-wrap {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
  margin: 1.5rem 0;
}
#delaunay-canvas {
  display: block;
  background: #f8f8f8;
  border: 2px solid #555;
  border-radius: 4px;
  cursor: crosshair;
  max-width: 100%;
  flex-shrink: 0;
}
.delaunay-panel {
  min-width: 160px;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.delaunay-panel h4 {
  margin: 0 0 0.4rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.5;
}
.delaunay-panel label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-bottom: 0.25rem;
}
.delaunay-coord-row {
  font-family: monospace;
  font-size: 0.8rem;
  opacity: 0.65;
  margin-bottom: 0.15rem;
}
.delaunay-field-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.35rem;
}
.delaunay-field-row input {
  width: 64px;
  padding: 0.2rem 0.4rem;
  background: rgba(255,255,255,0.07);
  border: 1px solid #555;
  border-radius: 3px;
  color: inherit;
  font-size: 0.85rem;
}
.delaunay-btn {
  padding: 0.3rem 0.7rem;
  border: 1px solid #555;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 0.82rem;
  transition: background 0.15s;
}
.delaunay-btn:hover { background: rgba(255,255,255,0.09); }
.delaunay-btn-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.delaunay-sep { border: none; border-top: 1px solid #444; margin: 0; }
.delaunay-hint { opacity: 0.45; font-size: 0.76rem; line-height: 1.6; }
</style>

<div class="delaunay-wrap">
  <canvas id="delaunay-canvas" width="620" height="440"></canvas>
  <div class="delaunay-panel">
    <div>
      <h4>Coordinates</h4>
      <div class="delaunay-coord-row">x = <span id="delaunay-xcoord">-</span></div>
      <div class="delaunay-coord-row">y = <span id="delaunay-ycoord">-</span></div>
    </div>
    <hr class="delaunay-sep">
    <div>
      <h4>Display</h4>
      <label><input type="checkbox" id="delaunay-show" checked> Delaunay</label>
      <label><input type="checkbox" id="delaunay-voronoi"> Voronoi</label>
      <label><input type="checkbox" id="delaunay-circumsphere"> Circumcircles</label>
    </div>
    <hr class="delaunay-sep">
    <div>
      <h4>Insert point</h4>
      <div class="delaunay-field-row"><span>x =</span><input type="number" id="delaunay-inputx" value="100"></div>
      <div class="delaunay-field-row"><span>y =</span><input type="number" id="delaunay-inputy" value="100"></div>
      <button class="delaunay-btn" id="delaunay-input-btn">Add point</button>
    </div>
    <hr class="delaunay-sep">
    <div class="delaunay-btn-row">
      <button class="delaunay-btn" id="delaunay-save">Save PNG</button>
      <button class="delaunay-btn" id="delaunay-reset">Clear</button>
    </div>
    <div class="delaunay-hint"><b>Left click</b>: add point<br><b>Right click</b>: remove point</div>
  </div>
</div>

<script src="/js/delaunayCanvas.js"></script>
<script>initDelaunay();</script>
{{< /rawhtml >}}

---

The algorithm is a brute-force O(n⁴) implementation of the [Bowyer–Watson](https://en.wikipedia.org/wiki/Bowyer%E2%80%93Watson_algorithm) criterion: for every triple of points, a circumcircle is constructed and validated (no other point may lie inside it). Shared edges are tracked to derive the dual Voronoi diagram without a separate pass.

Written in vanilla JavaScript against the HTML5 Canvas API, circa 2012.
