function startTutorial() {
    var _beamSldr = new OlySlider("beamSldr"),
        _angleSldr = new OlySlider("angleSldr"),
        _imagePaths = [],
        _splash = OlySplash(initialize, _imagePaths),
        _beamCan = MEUtil.upscaleCanvas("beamCan"),
        _beamCtx = _beamCan.getContext("2d"),
        _beamDim = new Dim(_beamCan.offsetWidth, _beamCan.offsetHeight),
        _beamGrad = null,
        _PI = Math.PI,
        _rad = _PI / 180,
        _deg = 1 / _rad,
        _PRISMX = 22,
        _PRISMY = 0,
        _SCENEX = 0,
        _SCENEY = 0,
        _MINANGLE = 45,
        _MAXANGLE = 65,
        _MINTHICKNESS = 10,
        _MAXTHICKNESS = 40,
        _RINDEXI = 1.0,
        _RINDEXR = 1.52,
        _NORMAL1 = 150,
        _NORMAL2 = 30,
        _ENTRYX = _PRISMX + 50,
        _ENTRYY = _PRISMY + 90,
        _RIGHTX1 = _PRISMX + 100,
        _RIGHTY1 = _PRISMY + 0,
        _RIGHTX2 = _PRISMX + 200,
        _RIGHTY2 = _PRISMY + 173,
        _RIGHTSLOPE = (_RIGHTY2 - _RIGHTY1) / (_RIGHTX2 - _RIGHTX1),
        _angle = 0,
        _thick = 0,
        _angleVal = 40,
        _thickVal = 40,
        _lx1 = _ly1 = 0,
        _lx2 = _ly2  = 0,
        _rx1 = _ry1 = 0,
        _rx2 = _ry2  = 0,
        _rangle1 = 0,
        _rangle2 = 0,
        _c1 = {},
        _c2 = {},
        _beamSldrLbl = document.getElementById("beamSldrLbl"),
        _angleSldrLbl = document.getElementById("angleSldrLbl"),
        _lbls = document.getElementsByClassName("diagramTextBlack"),
        _shouldUpdate = false;

    function initialize() {
        addListeners();
        initControls();

        _beamCtx.lineWidth = 2;

        MEUtil.raf(enterFrameHandler);
        _splash.fadeOut();
    }

    function addListeners() {
    }

    function initControls() {
        _beamSldr.setPosition(0.5);
        _angleSldr.setPosition(0.5);
    }

    function enterFrameHandler(timeStamp) {
        if (_beamSldr.hasChanged) {
            pos = _beamSldr.getPosition();
            _thickVal = (pos * 80) | 0;
            _shouldUpdate = true;
            _beamSldr.hasChanged = false;
        }

        if (_angleSldr.hasChanged) {
            var pos = _angleSldr.getPosition();
            _angleVal = (pos * 80) | 0;
            _shouldUpdate = true;
            _angleSldr.hasChanged = false;
        }

        if (_shouldUpdate) {
            _beamCtx.clearRect(0, 0, _beamDim.w, _beamDim.h);
            calculate();
            drawWhiteBeam();
            drawCenterBeams();
            drawRightBeams();
            drawLines();
            updateLbls();
            moveLbls();
            _shouldUpdate = false;
        }

        MEUtil.raf(enterFrameHandler);
    }

    function calculate() {
        var d = dx = dy = 0,
            rindex1 = rindex2 = 0,
            tangle1 = tangle2 = 0,
            tx = ty = 0,
            tp = {};

        _angle = _angleVal / 80;
        _angle *= (_MAXANGLE - _MINANGLE);
        _angle += _MINANGLE;
        _angle = roundf(_angle * 10) / 10;

        _thick = _thickVal / 80;
        _thick *= (_MAXTHICKNESS - _MINTHICKNESS);
        _thick += _MINTHICKNESS;
        _thick = roundf(_thick * 10) / 10;

        d = _thick / (2 * myCos(_angle));
        dx = d * myCos(60);
        dy = d * mySin(60);

        _lx1 = roundf(_ENTRYX + dx);
        _ly1 = roundf(_ENTRYY - dy);
        _lx2 = roundf(_ENTRYX - dx);
        _ly2 = roundf(_ENTRYY + dy);

        rindex1 = _RINDEXR;
        rindex2 = _RINDEXR + 0.0208;

        langle1 = _deg * Math.asin(_RINDEXI * mySin(_angle) / rindex1);
        langle2 = _deg * Math.asin(_RINDEXI * mySin(_angle) / rindex2);

        langle1 += 180 + _NORMAL1;
        langle2 += 180 + _NORMAL1;

        d = _beamDim.w;
        // find top right side point
        dx = d * myCos(langle1);
        dy = d * mySin(langle1);

        tx = _lx1 + (dx | 0);
        ty = _ly1 - (dy | 0);
        tp = getIntersectionPoint(new Pt(_lx1, _ly1),
            new Pt(tx, ty),
            new Pt(_RIGHTX1, _RIGHTY1),
            new Pt(_RIGHTX2, _RIGHTY2));
        _rx1 = tp.x;
        _ry1 = tp.y;

        // now find bottom right side point
        dx = d * myCos(langle2);
        dy = d * mySin(langle2);

        tx = _lx2 + (dx | 0);
        ty = _ly2 - (dy | 0);
        tp = getIntersectionPoint(new Pt(_lx2, _ly2),
                new Pt(tx, ty),
                new Pt(_RIGHTX1, _RIGHTY1),
                new Pt(_RIGHTX2, _RIGHTY2));
        _rx2 = tp.x;
        _ry2 = tp.y;

        tangle1 = 360 + _NORMAL2 - langle1;
        tangle2 = 360 + _NORMAL2 - langle2;

        _rangle1 = _deg * Math.asin(rindex1 * mySin(tangle1) / _RINDEXI);
        _rangle2 = _deg * Math.asin(rindex1 * mySin(tangle2) / _RINDEXI);

        _rangle1 -= 30;
        _rangle2 -= 30;
    }

    function getIntersectionPoint(p1, p2, p3, p4) {
        var mx1 = my1 = mx2 = my2 = 0,
            c1 = c2 = 0,
            dx21 = p2.x - p1.x,
            dx43 = p4.x - p3.x,
            m0 = m1 = 0;

        if (dx21 != 0) {
            m0 = (p2.y - p1.y) / dx21;
            mx1 = -m0;
            my1 = 1.0;
            c1 = (p1.y - (p1.x * m0));
        }else {
            mx1 = 1.0;
            my1 = 0.0;
            c1 = p1.x;
        }

        if (dx43 != 0) {
            m1 = (p4.y - p3.y) / dx43;
            mx2 = -m1;
            my2 = 1.0;
            c2 = (p3.y - (p3.x * m1));
        }else {
            mx2 = 1.0;
            my2 = 0.0;
            c2 = p3.x;
        }

        var determinant = (mx1 * my2) - (mx2 * my1),
            xi = yi = 0;

        if (determinant != 0.0) {
            xi = (((my2 * c1) - (my1 * c2)) / determinant) | 0;
            yi = (((mx1 * c2) - (mx2 * c1)) / determinant) | 0;
            return new Pt(xi, yi);
        }
        
        return null;
    }

    function drawWhiteBeam() {
        var npts = 4,
            pts = new Array(npts),
            d = 0,
            dx = dy = 0,
            p1 = {},
            p2 = {},
            ct = myCos(_NORMAL1 + _angle),
            st = mySin(_NORMAL1 + _angle);

        d = _lx1 + 50;
        dx = roundf(ct * d);
        dy = roundf(st * d);

        p1 = getIntersectionPoint(new Pt(_lx1, _ly1), 
                new Pt(_lx1 + dx, _ly1 - dy),
                new Pt(1, 0),
                new Pt(1, _beamDim.h));
        p2 = getIntersectionPoint(new Pt(_lx2, _ly2), 
                new Pt(_lx2 + dx, _ly2 - dy),
                new Pt(1, 0),
                new Pt(1, _beamDim.h));

        pts[0] = p1;
        pts[1] = p2;
        pts[2] = new Pt(_lx2, _ly2);
        pts[3] = new Pt(_lx1, _ly1);

        _beamCtx.fillStyle = "#FFFD63";
        fillPoly(pts);

        var tx = (p1.x + p2.x)/2,
            ty = (p1.y + p2.y)/2;

        drawLine(new Pt(tx, ty), new Pt(_ENTRYX, _ENTRYY));
    }

    function drawCenterBeams() {
        var numlines,
            dr = _ry2 - _ry1,
            dl = _ly2 - _ly1;

        if (dr > dl) {
            numlines = dr;
        }else {
            numlines = dl;
        }

        var lyinc = (_ly2 - _ly1) / numlines,
            ryinc = (_ry2 - _ry1) / numlines,
            lxinc = (_lx2 - _lx1) / numlines,
            rxinc = (_rx2 - _rx1) / numlines,
            lx = _lx1,
            rx = _rx1,
            ly = _ly1,
            ry = _ry1,
            colorinc = (700 - 385) / numlines,
            wl = 700,
            pt1 = {},
            pt2 = {};

        for (var i = 0; i < numlines; i++) {
            pt1 = new Pt(roundf(lx), roundf(ly));
            pt2 = new Pt(roundf(rx), roundf(ry));

            _beamGrad = _beamCtx.createLinearGradient(pt1.x, pt1.y, pt2.x, pt2.y);
            _beamGrad.addColorStop(0, "rgba(255, 255, 102, 0.2)");
            _beamGrad.addColorStop(1, "rgba(" + getColor(roundf(wl)).join(", ") + ", 0.2)");
            _beamCtx.strokeStyle = _beamGrad;
            
            drawLine(pt1, pt2);

            lx += lxinc;
            ly += lyinc;
            rx += rxinc;
            ry += ryinc;
            wl -= colorinc;
        }
    }

    function drawRightBeams() {
        var d = dx = dy = 0,
            p1 = {},
            p2 = {},
            ct = myCos(_rangle1),
            st = mySin(_rangle1),
            numlines = 0;

        d = (_beamDim.w - _rx1) + 50;
        dx = roundf(ct * d);
        dy = roundf(st * d);
        p1 = getIntersectionPoint(new Pt(_rx1, _ry1), 
                new Pt(_rx1 + dx, _ry1 + dy),
                new Pt(_beamDim.w, 0),
                new Pt(_beamDim.w, _beamDim.h));
        ct = myCos(_rangle2 + 15);
        st = mySin(_rangle2 + 15);
        dx = roundf(ct * d);
        dy = roundf(st * d);

        p2 = getIntersectionPoint(new Pt(_rx2, _ry2), 
                new Pt(_rx2 + dx, _ry2 + dy),
                new Pt(_beamDim.w, 0),
                new Pt(_beamDim.w, _beamDim.h));

        var dr = p2.y - p1.y,
            dl = _ry2 - _ry1;

        if (dr > dl)
            numlines = dr;
        else
            numlines = dl;

        var lyinc = (_ry2 - _ry1) / numlines,
            ryinc = (p2.y - p1.y) / numlines,
            lxinc = (_rx2 - _rx1) / numlines,
            rxinc = (p2.x - p1.x) / numlines,
            lx = _rx1,
            rx = p1.x,
            ly = _ry1,
            ry = p1.y,
            colorinc = (700 - 385) / numlines,
            wl = 700;

        for (var i = 0; i < numlines; i++) {
            _beamCtx.strokeStyle = "rgb(" + getColor(roundf(wl)).join(", ") + ")";
            drawLine(new Pt(roundf(lx), roundf(ly)), new Pt(roundf(rx), roundf(ry)));
            
            lx += lxinc;
            ly += lyinc;
            rx += rxinc;
            ry += ryinc;
            wl -= colorinc;
        }

        _beamCtx.strokeStyle = "rgba(0, 0, 0, 0.6)";
        drawLine(new Pt(_rx1, _ry1 - 1), p1);
        drawLine(new Pt(_rx2, _ry2), p2);
    }

    function drawLines() {
        var c = s = 0,
            d = 50,
            dx = dy = 0;
            p1 = {},
            p2 = {},
            p3 = {},
            p4 = {},
            p5 = {},
            p6 = {};

        // draw normals
        c = myCos(_NORMAL1);
        s = mySin(_NORMAL1);
        dx = roundf(d * c);
        dy = roundf(d * s);

        p1 = new Pt(_ENTRYX + dx, _ENTRYY - dy);
        p2 = getIntersectionPoint(new Pt(_ENTRYX, _ENTRYY),
                new Pt(_ENTRYX + dx, _ENTRYY - dy),
                new Pt(_PRISMX + 150, 0),
                new Pt(_PRISMX + 150, _beamDim.h));

        c = myCos(_NORMAL2);
        s = mySin(_NORMAL2);
        dx = roundf(d * c);
        dy = roundf(d * s);

        p3 = new Pt(_rx1 + dx, _ry1 - dy);
        p4 = getIntersectionPoint(new Pt(_rx1, _ry1),
                new Pt(_rx1 + dx, _ry1 - dy),
                new Pt(_PRISMX + 50, 0),
                new Pt(_PRISMX + 50, _beamDim.h));

        p5 = new Pt(_rx2 + dx, _ry2 - dy);
        p6 = getIntersectionPoint(new Pt(_rx2, _ry2),
                new Pt(_rx2 + dx, _ry2 - dy),
                new Pt(_PRISMX + 50, 0),
                new Pt(_PRISMX + 50, _beamDim.h));

        _c1 = getIntersectionPoint(p1, p2, p3, p4);
        _c2 = getIntersectionPoint(p1, p2, p5, p6);

        d = 50 + roundf(Math.sqrt((p3.y - _c1.y) * (p3.y - _c1.y) + (p3.x - _c1.x) * (p3.x - _c1.x)));
        dx = roundf(d * c);
        dy = roundf(d * s);
        p4.x = p3.x - dx;
        p4.y = p3.y + dy;

        d = 50 + roundf(Math.sqrt((p5.y - _c2.y) * (p5.y - _c2.y) + (p5.x - _c2.x) * (p5.x - _c2.x)));
        dx = roundf(d * c);
        dy = roundf(d * s);
        p6.x = p5.x - dx;
        p6.y = p5.y + dy;

        c = myCos(_NORMAL1);
        s = mySin(_NORMAL1);

        d = 50 + roundf(Math.sqrt((p1.y - _c2.y) * (p1.y - _c2.y) + (p1.x - _c2.x) * (p1.x - _c2.x)));
        dx = roundf(d * c);
        dy = roundf(d * s);
        p2.x = p1.x - dx;
        p2.y = p1.y + dy;

        drawLine(p1, p2);
        drawLine(p3, p4);
        drawLine(p5, p6);
        drawLine(new Pt(_rx2 + 13, _ry2), new Pt(_rx2 + 13, _ry2 + 25));

        _beamCtx.fillStyle = "black";
        drawDotArc(_c1, 25, _NORMAL1, 60);
        drawDotArc(_c1, 25, _NORMAL1 + 180, 60);
        drawDotArc(_c2, 25, _NORMAL1, 60);
        drawDotArc(_c2, 25, _NORMAL1 + 180, 60);
        drawDotArc(new Pt(_PRISMX + 100, _PRISMY), 25, 240, 60);

        drawDotArc(new Pt(_ENTRYX, _ENTRYY), 25, _NORMAL1, roundf(_angle) - 5);
        drawDotArc(new Pt(_rx1, _ry1), 25, _NORMAL2, -roundf(_rangle1 + _NORMAL2));
        drawDotArc(new Pt(_rx2, _ry2), 25, _NORMAL2, -roundf(_rangle2 + _NORMAL2 + 15));
    }

    function updateLbls() {
        var thick = _thick + "",
            angle = _angle + "",
            theta1 = (_NORMAL2 + (roundf(_rangle1 * 10) / 10)) + "",
            theta2 = (_NORMAL2 + (roundf(_rangle2 * 10) / 10)) + "";

        thick = modStr(thick, 4);
        angle = modStr(angle, 4);
        theta1 = modStr(theta1, 4);
        theta2 = modStr(theta2, 4);

        _beamSldrLbl.innerHTML = "Beam Thickness: " + thick + " mm";
        _angleSldrLbl.innerHTML = "Incident Angle: " + angle + "&deg;"; 

        _lbls[3].innerHTML = "&Theta;(i) = " + angle + "&deg;";
        _lbls[4].innerHTML = "&Theta;(r)1 = " + theta1 + "&deg;";
        _lbls[5].innerHTML = "&Theta;(r)2 = " + theta2 + "&deg;";
    }

    function moveLbls() {
        //top alphas
        _lbls[6].style.left = (_SCENEX + _c1.x - 201) + "px";
        _lbls[6].style.top =  (_SCENEY + _c1.y - 18) + "px";

        _lbls[7].style.left = (_SCENEX + _c1.x - 179) + "px";
        _lbls[7].style.top = (_SCENEY + _c1.y - 19) + "px";

        //bottom alphas
        _lbls[8].style.left = (_SCENEX + _c2.x - 223) + "px";
        _lbls[8].style.top = (_SCENEY + _c2.y - 18) + "px";

        _lbls[9].style.left = (_SCENEX + _c2.x - 201) + "px";
        _lbls[9].style.top = (_SCENEY + _c2.y - 18) + "px";

        //theta1
        _lbls[10].style.left = (_SCENEX + _rx1 - 68) +  "px";
        _lbls[10].style.top = (_SCENEY + _ry1 - 40) +  "px";

        //theta2
        _lbls[11].style.left = (_SCENEX + _rx2 - 130) + "px";
        _lbls[11].style.top = (_SCENEY + _ry2 - -2) +  "px";
    }

    function modStr(str, len) {
        if (str.indexOf(".") == -1) {
            str += ".";
        }

        while (str.length < len) {
            str += "0";
        }

        return str;
    }

    function drawDotArc(pt, radius, startangle, arcangle) {
        if (arcangle <= 0)
            drawDotArc(pt, radius, startangle + arcangle, -arcangle);
        else {
            var factor = 8,
                stopangle = (arcangle / factor) | 0,
                p = new Array(stopangle + 1),
                fangle = ((startangle + 2) * _rad),
                iangle = fangle + ((arcangle - 2) * _rad),
                farcinc = factor * _rad;
        
            for (var i = 0; i <= stopangle; i++) {
                p[i] = new Pt(pt.x + roundf(radius * Math.cos(fangle)), pt.y - roundf(radius * Math.sin(fangle)));
                fangle += farcinc;
                if (farcinc > 0) {
                    if (fangle  > iangle)
                        fangle = iangle;
                }
            }

            for (var i = 0, l = p.length; i < l; i++) {
                drawDot(p[i]);
            }
        }
    }

    function drawDot(pt) {
        _beamCtx.beginPath();
        _beamCtx.arc(pt.x, pt.y, 1, 0, 2 * _PI);
        _beamCtx.fill();
    } 

    function drawLine(pt1, pt2) {
        _beamCtx.beginPath();
        _beamCtx.moveTo(pt1.x, pt1.y);
        _beamCtx.lineTo(pt2.x, pt2.y);
        _beamCtx.stroke();
    }

    function fillPoly(pts) {
        var pt = pts[0];
        _beamCtx.beginPath();
        _beamCtx.moveTo(pt.x, pt.y);

        for (var i = 1, l = pts.length; i < l; i++) {
            pt = pts[i];
            _beamCtx.lineTo(pt.x, pt.y);
        }

        _beamCtx.closePath();
        _beamCtx.fill();
    }

    function getColor(nm) {
        if (nm < 660) {
            var prct = (nm - 380) / (660 - 380),
                hue = prct * (1 - 0.15) + 0.15,
                rgb = {};
            hue = 1 - hue;

            rgb = HSVtoRGB(hue, 1, 1);

            return [rgb.r, rgb.g, rgb.b];
        }else {
            return [255, 0, 0];
        }
    }

    /* hsv converter
     * accepts parameters
     * h  Object = {h:x, s:y, v:z}
     * OR 
     * h, s, v
    */
    function HSVtoRGB(h, s, v) {
        var r, g, b, i, f, p, q, t;
        if (arguments.length === 1) {
            s = h.s, v = h.v, h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: (r * 255) | 0,
            g: (g * 255) | 0,
            b: (b * 255) | 0
        };
    }

    function mySin(angle) {
        return Math.sin(angle * _rad);
    }

    function myCos(angle) {
        return Math.cos(angle * _rad);
    }

    function roundf(d) {
        if (d < 0) {
            return (d - 0.5) | 0;
        }

        return (d + 0.5) | 0;
    }

    function Pt(x, y) {
        return {x: x, y: y};
    }

    function Dim(w, h) {
        return {w: w, h: h};
    }
}

$(document).ready(startTutorial);
