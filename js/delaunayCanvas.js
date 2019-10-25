function Point(x, y)
{
    this.x = x;
    this.y = y;
}

Point.prototype.distance = function (otherPoint)
{
    return Math.sqrt(this.distanceSqr(otherPoint));
}

Point.prototype.distanceSqr = function (otherPoint)
{
    var dx = this.x - otherPoint.x;
    var dy = this.y - otherPoint.y;

    return dx * dx + dy * dy;
}

Point.prototype.draw = function (context)
{
    context.beginPath();
    context.arc(this.x, this.y, 5, 0, 2 * Math.PI, true);
    context.fill();
}

function Edge(start, end)
{
    this.start = start;
    this.end = end;
    this.ownerPoint = new Point;
    this.neighbourPoint = new Point;
}

Edge.prototype.length = function ()
{
    return this.start.distance(this.end);
}

Edge.prototype.equals = function (otherEdge)
{
    if
    (
        (
            this.start.x == otherEdge.start.x
         && this.start.y == otherEdge.start.y
         && this.end.x == otherEdge.end.x
         && this.end.y == otherEdge.end.y
        )
     ||
        (
            this.start.x == otherEdge.end.x
         && this.start.y == otherEdge.end.y
         && this.end.x == otherEdge.start.x
         && this.end.y == otherEdge.start.y
        )
    )
    {
        return true;
    }

    return false;
}

Edge.prototype.draw = function (context)
{
    context.beginPath();
    context.moveTo(this.start.x, this.start.y);
    context.lineTo(this.end.x, this.end.y);
    context.stroke();
}


function Circle(centre, radius)
{
    this.centre = centre;
    this.radius = radius;
}

Circle.prototype.area = function ()
{
    return Math.PI * this.radius * this.radius;
}

Circle.prototype.contains = function (point)
{
    var distSqr = point.distanceSqr(this.centre);

    return distSqr < (this.radius * this.radius);
}

Circle.prototype.construct = function (p1, p2, p3)
{
    u1 = p2.x - p1.x;
    v1 = p2.y - p1.y;
    u2 = p3.x - p1.x;
    v2 = p3.y - p1.y;

    crossProduct = u1 * v2 - v1 * u2;

    p1Squared = p1.x * p1.x + p1.y * p1.y;
    p2Squared = p2.x * p2.x + p2.y * p2.y;
    p3Squared = p3.x * p3.x + p3.y * p3.y;

    num = p1Squared * (p2.y - p3.y)
        + p2Squared * (p3.y - p1.y)
        + p3Squared * (p1.y - p2.y);

    x = num / (2 * crossProduct);

    num = p1Squared * (p3.x - p2.x)
        + p2Squared * (p1.x - p3.x)
        + p3Squared * (p2.x - p1.x);

    y = num / (2 * crossProduct);

    this.centre = new Point(x, y);

    this.radius = this.centre.distance(p1);
}

Circle.prototype.draw = function (context)
{
    context.beginPath();
    context.arc(this.centre.x, this.centre.y, this.radius, 0, 2 * Math.PI);
    context.strokeStyle = "red";
    context.stroke();
}


function addTriangle(points, edges, centre, i, j, k)
{
    var e1 = new Edge
    (
        new Point(points[i].x, points[i].y),
        new Point(points[j].x, points[j].y)
    );

    var e2 = new Edge
    (
        new Point(points[j].x, points[j].y),
        new Point(points[k].x, points[k].y)
    );

    var e3 = new Edge
    (
        new Point(points[k].x, points[k].y),
        new Point(points[i].x, points[i].y)
    );

    var duplicateE1 = false;
    var duplicateE2 = false;
    var duplicateE3 = false;

    for (i = 0; i < edges.length; ++i)
    {
        if (e1.equals(edges[i]))
        {
            duplicateE1 = true;
            edges[i].neighbourPoint = centre;
        }
        else if (e2.equals(edges[i]))
        {
            duplicateE2 = true;
            edges[i].neighbourPoint = centre;
        }
        else if (e3.equals(edges[i]))
        {
            duplicateE3 = true;
            edges[i].neighbourPoint = centre;
        }
    }

    if (!duplicateE1)
    {
        e1.ownerPoint = centre;
        edges.push(e1);
    }

    if (!duplicateE2)
    {
        e2.ownerPoint = centre;
        edges.push(e2);
    }

    if (!duplicateE3)
    {
        e3.ownerPoint = centre;
        edges.push(e3);
    }

}


function reallySlowAlgorithm(points, edges, context)
{
    var i = 0;
    var j = 0;
    var z = [];

    for (i = 0; i < points.length; ++i)
    {
        z[i] = points[i].x * points[i].x + points[i].y * points[i].y;
    }

    var trianglesAdded = [];

    for (i = 0; i < points.length - 2; ++i)
    {
        for (j = i + 1; j < points.length - 1; ++j)
        {
            if (i != j)
            {
                for (k = i + 1; k < points.length; ++k)
                {
                    if (i != k && j != k)
                    {
                        var c = new Circle;
                        c.construct(points[i], points[j], points[k]);

                        var flag = true;
                        var m = 0;
                        for (m = 0; m < points.length; ++m)
                        {
                            if (i != m && j != m && k != m)
                            {
                                if (c.contains(points[m]))
                                {
                                    flag = false;
                                    break;
                                }
                            }
                        }

                        if (flag == true)
                        {
                            if (document.getElementById("circumsphere").checked)
                            {
                                c.draw(context);
                            }

                            var alreadyAdded = false;

                            for (tri = 0; tri < trianglesAdded.length; ++tri)
                            {
                                if
                                (
                                    trianglesAdded[tri].x == c.centre.x
                                 && trianglesAdded[tri].y == c.centre.y
                                 && trianglesAdded[tri].z == c.centre.z
                                )
                                {
                                    alreadyAdded = true;
                                }
                            }

                            if (alreadyAdded == false)
                            {
                                trianglesAdded.push(c.centre);
                                addTriangle(points, edges, c.centre, i, j, k);
                            }
                        }
                    }
                }
            }
        }
    }
}

function initDelaunay()
{
    var points = [];
    var edges = [];

    var canvas = document.getElementById("example");
    var context = canvas.getContext("2d");

    canvas.addEventListener("mousedown", mousedown, false);
    canvas.addEventListener("mousemove", mousemove, false);
    canvas.addEventListener("mouseup", mouseup, false);
    var saveFileButton = document.getElementById("save");
    var clearImageButton = document.getElementById("reset");
    saveFileButton.addEventListener("click", saveFile, false);
    clearImageButton.addEventListener("click", reset, false);

    var circumsphereButton = document.getElementById("circumsphere");
    var showVoronoiButton = document.getElementById("showVoronoi");
    var showDelaunayButton = document.getElementById("showDelaunay");
    circumsphereButton.addEventListener("click", redraw, false);
    showVoronoiButton.addEventListener("click", redraw, false);
    showDelaunayButton.addEventListener("click", redraw, false);

    var inputPointButton = document.getElementById("inputPoint");
    inputPointButton.addEventListener("click", inputPoint, false);

    var drawing = false;

    function getMouse(e)
    {
        var element = canvas, offsetX = 10, offsetY = 10, mx, my;
        if (element.offsetParent !== undefined)
        {
            do
            {
                offsetX += element.offsetLeft;
                offsetY += element.offsetTop;
            } while ((element = element.offsetParent));
        }

        mx = e.pageX - offsetX;
        my = e.pageY - offsetY;

        document.getElementById("xcoord").innerHTML = mx;
        document.getElementById("ycoord").innerHTML = my;

        return {x: mx, y: my};
    }

    function mousemove(e)
    {
        if (drawing)
        {

        }

        var mouse = getMouse(e);
    }

    function mouseup(e)
    {
        drawing = false;

        var mouse = getMouse(e);
        var newPoint = new Point(mouse.x, mouse.y);

        if (e.which == 1)
        {
            points.push(newPoint);
        }
        else if (e.which == 3)
        {
            var i = 0;
            var newpoints = [];
            for (i = 0; i < points.length; ++i)
            {
                if
                (
                    newPoint.x < points[i].x
                 && newPoint.x > points[i].x - 10
                 && newPoint.y < points[i].y
                 && newPoint.y > points[i].y - 10
                )
                {
                    i++;
                }

                if (i == points.length)
                {
                    break;
                }

                newpoints.push(points[i]);
            }

            points = newpoints;
            newpoints = [];
        }

        edges = [];
        context.clearRect(0, 0, canvas.width, canvas.height);
        delaunay();
    }

    function mousedown(e)
    {
        drawing = true;
    }


    function delaunay()
    {
        reallySlowAlgorithm(points, edges, context);

        var i = 0;
        for (i = 0; i < points.length; ++i)
        {
            points[i].draw(context);
        }

        if (document.getElementById("showDelaunay").checked)
        {
            for (i = 0; i < edges.length; ++i)
            {
                context.strokeStyle = "black";
                context.lineWidth = 2;
                edges[i].draw(context);
                context.lineWidth = 1;
                context.strokeStyle = "black";
            }
        }

        if (document.getElementById("showVoronoi").checked)
        {
            for (i = 0; i < edges.length; ++i)
            {
                context.fillStyle = "blue";
                context.strokeStyle = "blue";
                context.lineWidth = 4;

                var p = new Point(edges[i].ownerPoint.x, edges[i].ownerPoint.y);
                p.draw(context);

                var p = new Point(edges[i].neighbourPoint.x, edges[i].neighbourPoint.y);
                p.draw(context);

                var e = new Edge(edges[i].ownerPoint, edges[i].neighbourPoint);
                e.draw(context);

                context.lineWidth = 1;
                context.strokeStyle = "black";
                context.fillStyle = "black";
            }
        }
    }

    document.getElementById("example").addEventListener
    (
        "contextmenu",
        function (e)
        {
            if (e.preventDefault)
            {
                e.preventDefault();
            }
        },
        false
    );

    function saveFile()
    {
        var dataURL = canvas.toDataURL();
        window.open(dataURL);
    }

    function redraw()
    {
        edges = [];
        context.clearRect(0, 0, canvas.width, canvas.height);
        delaunay();
    }

    function inputPoint()
    {
        var x = document.getElementById("inputx").value;
        var y = document.getElementById("inputy").value;

        var newPoint = new Point(x, y);

        points.push(newPoint);

        edges = [];
        context.clearRect(0, 0, canvas.width, canvas.height);
        delaunay();
    }

    function reset()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        points = [];
        edges = [];
        document.getElementById("xcoord").innerHTML = "-";
        document.getElementById("ycoord").innerHTML = "-";
    }
}
