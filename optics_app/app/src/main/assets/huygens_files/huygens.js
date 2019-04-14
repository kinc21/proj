function startTutorial() {
    var _waveCans = {
        bg: MEUtil.upscaleCanvas("waveCanBG"),
        top: MEUtil.upscaleCanvas("waveCanTop"),
        bottom: MEUtil.upscaleCanvas("waveCanBottom"),
        gr: MEUtil.upscaleCanvas("gr"),
        clearAll: function() {
            this.top.getContext("2d").clearRect(0, 0, this.top.width, this.top.height);
            this.bottom.getContext("2d").clearRect(0, 0, this.bottom.width, this.bottom.height);
            this.gr.getContext("2d").clearRect(0, 0, this.gr.width, this.gr.height);
        }
    };

    var _draw = false;

    // Floats
    var _rind1, _rind2, _aoi, _aoid, _aor, _aord, _c1, _c2, _v1, _v2;
    // Ints
    var cx, cy, speed;

    // Vectors
    var waves = [];
    var wavelets = [];

    // Image
    var lastimage = null;

    var _sliders = {
        index1: new OlySlider("sldrIndex1"),
        index2: new OlySlider("sldrIndex2"),
        angle: new OlySlider("sldrAngle"),
        speed: new OlySlider("sldrSpeed")
    };
    var _imagePaths = [];
    var _splash = OlySplash(initialize, _imagePaths);
    var _updateThrottle = (function() {
        var lt = 0;

        return function(callback) {
            var spd = _sliders.speed.getPosition(55, 5);
            var now = Date.now();
            if (now - lt >= spd) {
                callback();
                lt = now;
            }
        }
    })();

    var PI = Math.PI;
    var SCENEWIDTH = 300;
    var SCENEHEIGHT = 300;
    var STEPS = 3;

    var _refIndLbl1 = document.getElementById("refIndLbl1"),
        _refIndLbl2 = document.getElementById("refIndLbl2"),
        _refAngLbl = document.getElementById("refAngLbl");

    function initialize() {
        addListeners();
        initControls();

        run();

    	MEUtil.raf(enterFrameHandler);
        _splash.fadeOut();
    }

    function addListeners() {

    }

    function initControls() {
        _sliders.index1.setPosition(0);
        _sliders.index2.setPosition(0.5125);
        _sliders.angle.setPosition(0.75);
        _sliders.speed.setPosition(0.5);
    }

    function enterFrameHandler(timeStamp) {
        if (_draw == false) {
            _draw = true;

            handleSlidersChanged();

            _updateThrottle(update);

            _draw = false;
        }

        MEUtil.raf(enterFrameHandler);
    }

    function handleSlidersChanged() {
        var shouldReset = false;

        if (_sliders.index1.hasChanged) {
            _sliders.index1.hasChanged = false;

            var refInd = _sliders.index1.getPosition(1, 2).toFixed(2);

            $("#lblIndex1").html("Refractive Index<br />(Medium 1): " + refInd);
            _refIndLbl1.innerHTML = "RI = " + refInd;

            shouldReset = true;
        }

        if (_sliders.index2.hasChanged) {
            _sliders.index2.hasChanged = false;

            var refInd = _sliders.index2.getPosition(1, 2).toFixed(2);

            $("#lblIndex2").html("Refractive Index<br />(Medium 2): " + refInd);
            _refIndLbl2.innerHTML = "RI = " + refInd;

            shouldReset = true;
        }

        if (_sliders.angle.hasChanged) {
            _sliders.angle.hasChanged = false;

            $("#lblAngle").html("Incident Angle:<br />" + 
                Math.round(_sliders.angle.getPosition(0, 60)) + "&deg;");

            shouldReset = true;
        }

        if (_sliders.speed.hasChanged) {
            _sliders.speed.hasChanged = false;

            $("#lblSpeed").html("Applet Speed:<br />" + 
                Math.round(_sliders.speed.getPosition(0, 100)) + "%");
        }

        if (shouldReset) {
            reset();
        }
    }

    function run() {
        var ctx;

        cx = SCENEWIDTH/2;
        cy = SCENEHEIGHT/2;

        ctx = _waveCans.bg.getContext("2d");
        ctx.lineWidth = 2;

        ctx = _waveCans.top.getContext("2d");
        ctx.beginPath();
        ctx.rect(0, 0, SCENEWIDTH, cy);
        ctx.clip();
        ctx = _waveCans.bottom.getContext("2d");
        ctx.beginPath();
        ctx.rect(0, cy, SCENEWIDTH, cy);
        ctx.clip();

        // Draw grid lines
        ctx = MEUtil.upscaleCanvas("grid").getContext("2d");
        ctx.beginPath();
        drawLine(ctx, cx, 0, cx, SCENEHEIGHT);
        drawLine(ctx, 0, cy, SCENEWIDTH, cy);
        ctx.lineWidth = 2;
        ctx.stroke();

        reset();

        // thread sleeps between the range of 5 - 55;
    }

    function update() {
        if (lastimage == null) {
            prepScene();
        }

        moveWaves(waves);

        speed = Math.floor(_sliders.speed.getPosition(0, 100));
    }

    // Vector
    function moveWaves(waveV) {
        var w;
        _waveCans.clearAll();
        for (var i = 0, l = waveV.length; i < waveV.length; i++) {
            w = waveV[i];
            w.shift(STEPS);
            w.drawWave(_waveCans.gr, _waveCans.top, _waveCans.bottom);
        }
    }

    function reset() {
        waves = [];

        calculate();

        waves.push(new Wave(_aoi, _aor, cx, cy, _v1, _v2, waves));

        lastimage = null;
    }

    function calculate() {
        _c1 = ((_sliders.index1.getPosition() * 80) | 0) / 80;
        _c2 = ((_sliders.index2.getPosition() * 80) | 0) / 80;
        _rind1 = 1 + _c1;
        _rind2 = 1 + _c2;
        _aoi = 60 * ((_sliders.angle.getPosition() * 80) | 0) / 80;
        _aoid = round(_aoi);
        _aoi *= PI / 180;
        _aoi = setDecimalPlaces(_aoi, 8);
        _aor = Math.asin(Math.sin(_aoi) * _rind1 / _rind2);
        _aord = round(100 * setDecimalPlaces(_aor, 8) * 180 / PI) / 100;
        _v1 = 1 / _rind1;
        _v2 = 1 / _rind2;
        speed = Math.floor(_sliders.speed.getPosition(0, 100));

        _refAngLbl.innerHTML = "Angle of</BR>Refraction</BR>" + round(_aord) + "&deg;";
    }

    function setDecimalPlaces(val, decNum) {
        var pwr = Math.pow(10, decNum);

        return (((val  * pwr) | 0) / pwr);
    }

    function prepScene() {
        var ctx = _waveCans.bg.getContext("2d");
        var rgb;

        ctx.clearRect(0, 0, _waveCans.bg.width, _waveCans.bg.height);
        // fill top and bottom halves according to rind
        rgb = round(255 - (128 * _c1));
        ctx.fillStyle = "rgb(" + rgb + ", " + rgb + ", " + rgb + ")";
        ctx.fillRect(0, 0, SCENEWIDTH, cy);
        rgb = round(255 - (128 * _c2));
        ctx.fillStyle = "rgb(" + rgb + ", " + rgb + ", " + rgb + ")";
        ctx.fillRect(0, cy, SCENEWIDTH, cy);

        var lp = new Point(cx - round(SCENEWIDTH * Math.sin(_aoi)), 
            cy - round(SCENEHEIGHT * Math.cos(_aoi)));
        var rp = new Point(cx + round(SCENEWIDTH * Math.sin(_aoi)), 
            cy - round(SCENEHEIGHT * Math.cos(_aoi)));
        var bp = new Point(cx + round(SCENEWIDTH * Math.sin(_aor)), 
            cy + round(SCENEHEIGHT * Math.cos(_aor)));
        var w = waves[0];
        // Ints
        var d = (w.COUNT - 1) * w.SPACING / 2 + w.RADIUS; 
        var dx = round(d / Math.cos(_aoi));
        var xpts, ypts;

        // Draw Left Polygons
        var color = "rgba(255, 255, 0, 0.7)";
        var opacity = 0.7;
        var BUFFER = 1;
        var t1 = getIntersectionPoint(
            new Point(cx - dx, cy), new Point(lp.x - dx, lp.y), 
            new Point(BUFFER, BUFFER), new Point(BUFFER, cy));
        var t2 = getIntersectionPoint(
            new Point(cx - dx, cy), new Point(lp.x - dx, lp.y), 
            new Point(BUFFER, BUFFER), new Point(cx, BUFFER));

        var l1;
        if (t1 == null || t1.x < BUFFER || t1.y < BUFFER) {
            l1 = t2;
        } else if (t2 == null || t2.x < BUFFER || t2.y < BUFFER) {
            l1 = t1;
        } else {
            l1 = (cx - t1.x) * (cx - t1.x) + (cy - t1.y) * (cy - t1.y) < 
                    (cx - t2.x) * (cx - t2.x) + (cy-t2.y) * (cy-t2.y) ? 
                    t1 : t2;
        }
        t1 = getIntersectionPoint(
            new Point(cx, cy), new Point(lp.x, lp.y), 
            new Point(BUFFER, BUFFER), new Point(BUFFER, cy));
        t2 = getIntersectionPoint(
            new Point(cx, cy), new Point(lp.x, lp.y), 
            new Point(BUFFER, BUFFER), new Point(cx, BUFFER));

        var l2;
        if (t1 == null || t1.x < BUFFER || t1.y < BUFFER) {
            l2 = t2;
        } else if (t2 == null || t2.x < BUFFER || t2.y < BUFFER) {
            l2 = t1;
        } else {
            l2 = (cx - t1.x) * (cx - t1.x) + (cy - t1.y) * (cy - t1.y) <
                (cx - t2.x) * (cx - t2.x) + (cy - t2.y) * (cy - t2.y) ?
                new Point(t1.x, t1.y) : new Point(t2.x, t2.y);
        }
        t1 = getIntersectionPoint(
            new Point(cx + dx + 1, cy), new Point(lp.x + dx + 1, lp.y), 
            new Point(BUFFER, BUFFER), new Point(BUFFER, cy));
        t2 = getIntersectionPoint(
            new Point(cx + dx + 1, cy), new Point(lp.x + dx + 1, lp.y), 
            new Point(BUFFER, BUFFER), new Point(cx, BUFFER));

        var l3;
        if (t1 == null || t1.x < BUFFER || t1.y < BUFFER) {
            l3 = t2;
        } else if (t2 == null || t2.x < BUFFER || t2.y < BUFFER) {
            l3 = t1;
        } else {
            l3=(cx-t1.x)*(cx-t1.x)+(cy-t1.y)*(cy-t1.y)<
            (cx-t2.x)*(cx-t2.x)+(cy-t2.y)*(cy-t2.y) ?
            new Point(t1.x, t1.y) : new Point(t2.x, t2.y);
        }

        if (l1.x < l2.x) {
            xpts = [cx - dx, l1.x, BUFFER, l2.x, l3.x, cx + dx + 1];
            ypts = [cy, l1.y, BUFFER, l2.y, l3.y, cy];
        } else if (l3.x > l2.x) {
            xpts = [cx - dx, l1.x, l2.x, BUFFER, l3.x, cx + dx + 1];
            ypts = [cy, l1.y, l2.y, BUFFER, l3.y, cy];
        } else {
            xpts = [cx - dx, l1.x, l2.x, l3.x, cx + dx + 1];
            ypts = [cy, l1.y, l2.y, l3.y, cy];
        }

        fillPolygon(xpts, ypts, color);

        // Draw reflected polygon (if necessary)
        if (_rind1 != _rind2) {
            t1 = getIntersectionPoint(new Point(cx - dx, cy), new Point(rp.x - dx, rp.y), 
                new Point(SCENEWIDTH - BUFFER - 1, BUFFER), new Point(SCENEWIDTH - BUFFER - 1, cy));
            t2 = getIntersectionPoint(new Point(cx - dx, cy), new Point(rp.x - dx, rp.y), 
                new Point(SCENEWIDTH - BUFFER - 1, BUFFER), new Point(cx, BUFFER));
            var r1;
            if (t1 == null || t1.x > SCENEWIDTH - BUFFER - 1 || t1.y < BUFFER) {
                r1 = t2;
            } else if (t2 == null || t2.x > SCENEWIDTH - BUFFER - 1 || t2.y < BUFFER) {
                r1 = t1;
            } else {
                r1=(cx-t1.x)*(cx-t1.x)+(cy-t1.y)*(cy-t1.y)<
                (cx-t2.x)*(cx-t2.x)+(cy-t2.y)*(cy-t2.y) ?
                t1 : t2;
            }
                
            t1 = getIntersectionPoint(new Point(cx, cy), new Point(rp.x, rp.y), 
                new Point(SCENEWIDTH - BUFFER - 1, BUFFER), new Point(SCENEWIDTH - BUFFER - 1, cy));
            t2 = getIntersectionPoint(new Point(cx, cy), new Point(rp.x, rp.y), 
                new Point(SCENEWIDTH - BUFFER - 1, BUFFER), new Point(cx, BUFFER));
            var r2;
            if (t1 == null || t1.x > SCENEWIDTH - BUFFER - 1 || t1.y < BUFFER) {
                r2 = t2;
            } else if (t2 == null || t2.x > SCENEWIDTH - BUFFER - 1 || t2.y < BUFFER) {
                r2 = t1;
            } else {
                r2=(cx-t1.x)*(cx-t1.x)+(cy-t1.y)*(cy-t1.y)<
                (cx-t2.x)*(cx-t2.x)+(cy-t2.y)*(cy-t2.y) ?
                new Point(t1.x, t1.y) : new Point(t2.x, t2.y);
            }

            t1 = getIntersectionPoint(
                new Point(cx + dx + 1, cy), new Point(rp.x + dx + 1, rp.y), 
                new Point(SCENEWIDTH - BUFFER - 1, BUFFER), new Point(SCENEWIDTH - BUFFER - 1, cy));
            t2 = getIntersectionPoint(
                new Point(cx + dx + 1, cy), new Point(rp.x + dx + 1, rp.y), 
                new Point(SCENEWIDTH - BUFFER - 1, BUFFER), new Point(cx, BUFFER));
            var r3;
            if (t1 == null || t1.x > SCENEWIDTH - BUFFER - 1 || t1.y < BUFFER) {
                r3 = t2;
            } else if (t2 == null || t2.x > SCENEWIDTH - BUFFER - 1 || t2.y < BUFFER) {
                r3 = t1;
            } else {
                r3=(cx-t1.x)*(cx-t1.x)+(cy-t1.y)*(cy-t1.y)<
                (cx-t2.x)*(cx-t2.x)+(cy-t2.y)*(cy-t2.y) ?
                new Point(t1.x, t1.y) : new Point(t2.x, t2.y);
            }

            if (r1.y < r2.y) {
                xpts = [cx - dx, r1.x, SCENEWIDTH - BUFFER - 1, r2.x, r3.x, cx + dx + 1];
                ypts = [cy, r1.y, BUFFER, r2.y, r3.y, cy];
            }
            else if (r3.y > r2.y) {
                xpts = [cx - dx, r1.x, r2.x, SCENEWIDTH - BUFFER - 1, r3.x, cx + dx + 1];
                ypts = [cy, r1.y, r2.y, BUFFER, r3.y, cy];
            }
            else {
                xpts = [cx - dx, r1.x, r2.x, r3.x, cx + dx + 1];
                ypts = [cy, r1.y, r2.y, r3.y, cy];
            }

            fillPolygon(xpts, ypts, color);
        }

        // Draw refracted polygon (if necessary)
        if (_aor == _aor) {
            t1 = getIntersectionPoint(new Point(cx - dx, cy), new Point(bp.x - dx, bp.y), 
                new Point(SCENEWIDTH - BUFFER - 1, SCENEHEIGHT - BUFFER - 1), 
                new Point(SCENEWIDTH - BUFFER - 1, cy));
            t2 = getIntersectionPoint(new Point(cx - dx, cy), new Point(bp.x - dx, bp.y), 
                new Point(SCENEWIDTH - BUFFER - 1, SCENEHEIGHT - BUFFER - 1), 
                new Point(cx, SCENEHEIGHT - BUFFER - 1));
            var b1;
            if (t1 == null || t1.x > SCENEWIDTH - BUFFER - 1 || 
                    t1.y > SCENEHEIGHT - BUFFER - 1) {
                b1 = t2;
            } else if (t2 == null || t2.x > SCENEWIDTH - BUFFER - 1 || 
                    t2.y > SCENEHEIGHT - BUFFER - 1) {
                b1 = t1;
            } else {
                b1=(cx-t1.x)*(cx-t1.x)+(cy-t1.y)*(cy-t1.y) <
                (cx-t2.x)*(cx-t2.x)+(cy-t2.y)*(cy-t2.y) ?
                t1:t2;
            }
                
            t1 = getIntersectionPoint(new Point(cx, cy), new Point(bp.x, bp.y), 
                new Point(SCENEWIDTH - BUFFER - 1, SCENEHEIGHT - BUFFER - 1), 
                new Point(SCENEWIDTH - BUFFER - 1, cy));
            t2 = getIntersectionPoint(new Point(cx, cy), new Point(bp.x, bp.y), 
                new Point(SCENEWIDTH - BUFFER - 1, SCENEHEIGHT - BUFFER - 1), 
                new Point(cx, SCENEHEIGHT - BUFFER - 1));
            var b2;
            if (t1 == null || t1.x > SCENEWIDTH - BUFFER - 1 || t1.y > SCENEHEIGHT - BUFFER - 1) {
                b2 = t2;
            } else if (t2 == null || t2.x > SCENEWIDTH - BUFFER - 1 || t2.y > SCENEHEIGHT - BUFFER - 1) {
                b2 = t1;
            } else {
                b2=(cx-t1.x)*(cx-t1.x)+(cy-t1.y)*(cy-t1.y) <
                (cx-t2.x)*(cx-t2.x)+(cy-t2.y)*(cy-t2.y) ?
                new Point(t1.x, t1.y):new Point(t2.x, t2.y);
            }

            t1 = getIntersectionPoint(
                new Point(cx + dx + 1, cy), new Point(bp.x + dx + 1, bp.y), 
                new Point(SCENEWIDTH - BUFFER - 1, SCENEHEIGHT - BUFFER - 1), 
                new Point(SCENEWIDTH - BUFFER - 1, cy));
            t2 = getIntersectionPoint(
                new Point(cx + dx + 1, cy), new Point(bp.x + dx + 1, bp.y), 
                new Point(SCENEWIDTH - BUFFER - 1, SCENEHEIGHT - BUFFER - 1), 
                new Point(cx, SCENEHEIGHT - BUFFER - 1));
            var b3;
            if (t1 == null || t1.x > SCENEWIDTH - BUFFER - 1 || t1.y > SCENEHEIGHT - BUFFER - 1) {
                b3 = t2;
            }
            else if (t2 == null || t2.x > SCENEWIDTH - BUFFER - 1 || t2.y > SCENEHEIGHT - BUFFER - 1) {
                b3 = t1;
            }
            else {
                b3=(cx-t1.x)*(cx-t1.x)+(cy-t1.y)*(cy-t1.y) <
                (cx-t2.x)*(cx-t2.x)+(cy-t2.y)*(cy-t2.y) ?
                new Point(t1.x, t1.y):new Point(t2.x, t2.y);
            }

            if (b1.y > b2.y) {
                xpts = [cx - dx, b1.x, SCENEWIDTH - BUFFER - 1, b2.x, b3.x, cx + dx + 1];
                ypts = [cy, b1.y, SCENEHEIGHT - BUFFER - 1, b2.y, b3.y, cy];
            }
            else if (b3.x > b2.x) {
                xpts = [cx - dx, b1.x, b2.x, SCENEWIDTH - BUFFER - 1, b3.x, cx + dx + 1];
                ypts = [cy, b1.y, b2.y, SCENEHEIGHT - BUFFER - 1, b3.y, cy];
            }
            else {
                xpts = [cx - dx, b1.x, b2.x, b3.x, cx + dx + 1];
                ypts = [cy, b1.y, b2.y, b3.y, cy];
            }

            fillPolygon(xpts, ypts, color);
        }

        var red = "rgba(255, 0, 0, 0.5);"
        var blue = "rgba(0, 0, 255, 0.5);"
        // draw border lines
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        drawLine(ctx, cx - dx - 1, cy, lp.x - dx - 1, lp.y);
        drawLine(ctx, cx + dx + 2, cy, lp.x + dx + 2, lp.y);
        ctx.stroke();

        if (_aor == _aor) {
            ctx.beginPath();
            drawLine(ctx, cx - dx - 1, cy, bp.x - dx - 1, bp.y);
            drawLine(ctx, cx + dx + 2, cy, bp.x + dx + 2, bp.y);
            ctx.stroke();
        }

        ctx.strokeStyle = red;            
        if (_rind1 != _rind2) {
            ctx.beginPath();
            drawLine(ctx, cx, cy, rp.x, rp.y);
            ctx.stroke();
        }
        ctx.beginPath();
        drawLine(ctx, cx, cy, lp.x, lp.y);
        ctx.stroke();

        if (_aor == _aor) {   // i.e., _aor is a number, and NOT NaN
            ctx.strokeStyle = (_rind1 == _rind2) ? 
                red : 
                blue;
            ctx.beginPath();
            drawLine(ctx, cx, cy, bp.x, bp.y);
            ctx.stroke();
        }

        lastimage = {};
    }

    function fillPolygon(xpts, ypts, color) {
        var ctx = _waveCans.bg.getContext("2d");

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(xpts[0], ypts[0]);
        for (var i = 1, l = xpts.length; i < l; i++) {
            ctx.lineTo(xpts[i], ypts[i]);
        }
        ctx.closePath();
        ctx.fill();
    }

    function colorCanvas(can, color) {
        var ctx = can.getContext("2d");

        ctx.fillColor = color;
        ctx.fillRect()
    }

    function round(d) {
        return d < 0 ? ((d - 0.5) | 0) : ((d + 0.5) | 0);
    }
}

// \/ NO TOUCHY \/
$(document).ready(startTutorial);