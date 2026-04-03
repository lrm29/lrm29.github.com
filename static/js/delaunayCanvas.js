function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.distance = function (otherPoint) {
    return Math.sqrt(this.distanceSqr(otherPoint));
};

Point.prototype.distanceSqr = function (otherPoint) {
    var dx = this.x - otherPoint.x;
    var dy = this.y - otherPoint.y;
    return dx * dx + dy * dy;
};

Point.prototype.draw = function (context) {
    context.beginPath();
    context.arc(this.x, this.y, 5, 0, 2 * Math.PI, true);
    context.fill();
};

function Edge(start, end) {
    this.start = start;
    this.end = end;
    this.ownerPoint = new Point(0, 0);
    this.neighbourPoint = new Point(0, 0);
}

Edge.prototype.equals = function (otherEdge) {
    return (
        (this.start.x === otherEdge.start.x && this.start.y === otherEdge.start.y &&
         this.end.x === otherEdge.end.x && this.end.y === otherEdge.end.y) ||
        (this.start.x === otherEdge.end.x && this.start.y === otherEdge.end.y &&
         this.end.x === otherEdge.start.x && this.end.y === otherEdge.start.y)
    );
};

Edge.prototype.draw = function (context) {
    context.beginPath();
    context.moveTo(this.start.x, this.start.y);
    context.lineTo(this.end.x, this.end.y);
    context.stroke();
};

function Circle(centre, radius) {
    this.centre = centre;
    this.radius = radius;
}

Circle.prototype.contains = function (point) {
    return point.distanceSqr(this.centre) < (this.radius * this.radius);
};

Circle.prototype.construct = function (p1, p2, p3) {
    var u1 = p2.x - p1.x, v1 = p2.y - p1.y;
    var u2 = p3.x - p1.x, v2 = p3.y - p1.y;
    var crossProduct = u1 * v2 - v1 * u2;

    var p1Sq = p1.x * p1.x + p1.y * p1.y;
    var p2Sq = p2.x * p2.x + p2.y * p2.y;
    var p3Sq = p3.x * p3.x + p3.y * p3.y;

    var x = (p1Sq * (p2.y - p3.y) + p2Sq * (p3.y - p1.y) + p3Sq * (p1.y - p2.y)) / (2 * crossProduct);
    var y = (p1Sq * (p3.x - p2.x) + p2Sq * (p1.x - p3.x) + p3Sq * (p2.x - p1.x)) / (2 * crossProduct);

    this.centre = new Point(x, y);
    this.radius = this.centre.distance(p1);
};

Circle.prototype.draw = function (context) {
    context.beginPath();
    context.arc(this.centre.x, this.centre.y, this.radius, 0, 2 * Math.PI);
    context.strokeStyle = "#e05252";
    context.lineWidth = 1;
    context.stroke();
};

function addTriangle(points, edges, centre, i, j, k) {
    var e1 = new Edge(new Point(points[i].x, points[i].y), new Point(points[j].x, points[j].y));
    var e2 = new Edge(new Point(points[j].x, points[j].y), new Point(points[k].x, points[k].y));
    var e3 = new Edge(new Point(points[k].x, points[k].y), new Point(points[i].x, points[i].y));

    var d1 = false, d2 = false, d3 = false;

    for (var m = 0; m < edges.length; ++m) {
        if (e1.equals(edges[m])) { d1 = true; edges[m].neighbourPoint = centre; }
        else if (e2.equals(edges[m])) { d2 = true; edges[m].neighbourPoint = centre; }
        else if (e3.equals(edges[m])) { d3 = true; edges[m].neighbourPoint = centre; }
    }

    if (!d1) { e1.ownerPoint = centre; edges.push(e1); }
    if (!d2) { e2.ownerPoint = centre; edges.push(e2); }
    if (!d3) { e3.ownerPoint = centre; edges.push(e3); }
}

function reallySlowAlgorithm(points, edges, context, circumsphereChecked) {
    var trianglesAdded = [];

    for (var i = 0; i < points.length - 2; ++i) {
        for (var j = i + 1; j < points.length - 1; ++j) {
            for (var k = j + 1; k < points.length; ++k) {
                var c = new Circle();
                c.construct(points[i], points[j], points[k]);

                var valid = true;
                for (var m = 0; m < points.length; ++m) {
                    if (m !== i && m !== j && m !== k && c.contains(points[m])) {
                        valid = false;
                        break;
                    }
                }

                if (valid) {
                    if (circumsphereChecked) c.draw(context);

                    var alreadyAdded = false;
                    for (var t = 0; t < trianglesAdded.length; ++t) {
                        if (trianglesAdded[t].x === c.centre.x && trianglesAdded[t].y === c.centre.y) {
                            alreadyAdded = true;
                            break;
                        }
                    }
                    if (!alreadyAdded) {
                        trianglesAdded.push(c.centre);
                        addTriangle(points, edges, c.centre, i, j, k);
                    }
                }
            }
        }
    }
}

function initDelaunay() {
    var points = [];
    var edges = [];

    var canvas = document.getElementById("delaunay-canvas");
    var context = canvas.getContext("2d");

    var circumsphereEl = document.getElementById("delaunay-circumsphere");
    var showDelaunayEl = document.getElementById("delaunay-show");
    var showVoronoiEl  = document.getElementById("delaunay-voronoi");
    var xcoordEl       = document.getElementById("delaunay-xcoord");
    var ycoordEl       = document.getElementById("delaunay-ycoord");

    function getMouse(e) {
        var rect = canvas.getBoundingClientRect();
        var mx = Math.round(e.clientX - rect.left);
        var my = Math.round(e.clientY - rect.top);
        xcoordEl.textContent = mx;
        ycoordEl.textContent = my;
        return { x: mx, y: my };
    }

    function delaunay() {
        reallySlowAlgorithm(points, edges, context, circumsphereEl.checked);

        context.fillStyle = "#222";
        for (var i = 0; i < points.length; ++i) points[i].draw(context);

        if (showDelaunayEl.checked) {
            context.strokeStyle = "#333";
            context.lineWidth = 1.5;
            for (var i = 0; i < edges.length; ++i) edges[i].draw(context);
        }

        if (showVoronoiEl.checked) {
            context.fillStyle = "#2563eb";
            context.strokeStyle = "#2563eb";
            context.lineWidth = 2;
            for (var i = 0; i < edges.length; ++i) {
                var p1 = new Point(edges[i].ownerPoint.x, edges[i].ownerPoint.y);
                p1.draw(context);
                var p2 = new Point(edges[i].neighbourPoint.x, edges[i].neighbourPoint.y);
                p2.draw(context);
                new Edge(edges[i].ownerPoint, edges[i].neighbourPoint).draw(context);
            }
            context.lineWidth = 1;
            context.strokeStyle = "#333";
            context.fillStyle = "#222";
        }
    }

    function redraw() {
        edges = [];
        context.clearRect(0, 0, canvas.width, canvas.height);
        delaunay();
    }

    canvas.addEventListener("mousemove", function (e) { getMouse(e); });

    canvas.addEventListener("mouseup", function (e) {
        var mouse = getMouse(e);
        if (e.which === 1 || e.button === 0) {
            points.push(new Point(mouse.x, mouse.y));
        } else if (e.which === 3 || e.button === 2) {
            points = points.filter(function (p) {
                return !(Math.abs(p.x - mouse.x) <= 10 && Math.abs(p.y - mouse.y) <= 10);
            });
        }
        redraw();
    });

    canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });

    circumsphereEl.addEventListener("change", redraw);
    showDelaunayEl.addEventListener("change", redraw);
    showVoronoiEl.addEventListener("change", redraw);

    document.getElementById("delaunay-input-btn").addEventListener("click", function () {
        var x = parseFloat(document.getElementById("delaunay-inputx").value);
        var y = parseFloat(document.getElementById("delaunay-inputy").value);
        if (!isNaN(x) && !isNaN(y)) {
            points.push(new Point(x, y));
            redraw();
        }
    });

    document.getElementById("delaunay-save").addEventListener("click", function () {
        var link = document.createElement("a");
        link.download = "delaunay.png";
        link.href = canvas.toDataURL();
        link.click();
    });

    document.getElementById("delaunay-reset").addEventListener("click", function () {
        points = [];
        edges = [];
        context.clearRect(0, 0, canvas.width, canvas.height);
        xcoordEl.textContent = "-";
        ycoordEl.textContent = "-";
    });
}
