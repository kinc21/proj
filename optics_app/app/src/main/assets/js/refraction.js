function startTutorial() {
    var _waveSldr = new MicSlider("waveSldr", {isSpectrumSlider: true}),
        _angleSldr = new MicSlider("angleSldr"),
        _lightSeg = new MicRadioGroup("lightSeg"),
        _mediumCB = document.getElementById("mediumCB"),
        _imagePaths = [],
        _splash = MicSplash(initialize, _imagePaths),
        _labelElement = document.getElementsByClassName("labelText")[0],
        _materialBack = document.getElementById("materialBack"),
        _topWaveContainer = document.getElementById("topWaveContainer"),
        _waveCan = MEUtil.upscaleCanvas("waveCan"),
        _waveCtx = _waveCan.getContext("2d"),
        _bottomWaveCan = MEUtil.upscaleCanvas("bottomWaveCan"),
        _bottomWaveCtx = _bottomWaveCan.getContext("2d"),
        _waveSldrVal = 0,
        _angleSldrVal = 0,
        _waveSldrLbl = document.getElementById("waveSldrLbl"),
        _angleSldrLbl = document.getElementById("angleSldrLbl"),
        _wavelength = 550,
        _indexArry = [0.9999, 1.0002, 1.3090, 1.3290, 1.3330, 1.4700,
                1.5200, 1.9200, 2.4170, 3.9120],
        _theta = 0,
        _angle = 0,
        _rAngle = 0,
        _rIndex = 1,
        _farIndex = 0,
        _farAngle = 0,
        _fakeAngle = 0,
        _cbIndex = 6,
        _continuousFlag = false,
        _saveFlag = false,
        _globalTheta = 0,
        _drawwl = 0,
        _ptArry = [[]],
        _offset = 0,
        _centerPt = new Pt(_waveCan.offsetWidth / 2, _waveCan.offsetHeight / 2 - 10),
        _drawWidth = 290,
        _color = [],
        _colorMapArry = new Array(81),
        _PI = Math.PI,
        _incidentThetaLbl = document.getElementById("incidentThetaLbl"),
        _refractThetaLbl = document.getElementById("refractThetaLbl"),
        _refractDegLbl = document.getElementById("refractDegLbl"),
        _shouldUpdate = false,
        _end = 0;

    function initialize() {
        addListeners();
        initControls();

        //init cans
        _waveCtx.lineWidth = 2;
        _bottomWaveCtx.lineWidth = 2;

        getColor();

        //inits material back
        adjustMaterialBack(_cbIndex);

        initSldrTrack();

        MEUtil.raf(enterFrameHandler);
        _splash.fadeOut();
    }

    function addListeners() {
        _lightSeg.onchange = function() {
            var enabled = this.getSelectedIndex() == 1;

            _waveSldr.setEnabled(enabled);
            _shouldUpdate = true;
        }

        _mediumCB.onchange = function() {
            _cbIndex = this.selectedIndex;

            _shouldUpdate = true;
            adjustMaterialBack(_cbIndex);
        }
    }

    function initControls() {
        _waveSldr.setPosition(0.5);
        _angleSldr.setPosition(0.275);
        _lightSeg.setSelectedIndex(0);
        _mediumCB.selectedIndex = 6;
    }

    function initSldrTrack() {
        var sldrTrack = document.getElementsByClassName("sliderTrackThresh")[1];
        sldrTrack.style.position = "relative";
        sldrTrack.style.top = "-14px";
    }

    function getColor() {
        for (var i = 0; i < 81; i++) {
            _colorMapArry[i] = _waveSldr.getSpectrumRGB(i / 81);
        }
    }

    function adjustMaterialBack(index) {
        var color = 255 - ((72 * (index / 9)) | 0);

        _materialBack.style.backgroundColor = "rgba(" + color + ", " + color + ", " + color + ", 1)";
    }

    function enterFrameHandler(timeStamp) {
        if (_waveSldr.hasChanged) {
            _waveSldrVal = _waveSldr.getPosition();

            _shouldUpdate = true;
            _waveSldr.hasChanged = false;
        }

        if (_angleSldr.hasChanged) {
            _angleSldrVal = _angleSldr.getPosition();

            _shouldUpdate = true;
            _angleSldr.hasChanged = false;
        }

        if (_shouldUpdate) {
            if (_lightSeg.getSelectedIndex() == 1) {
                _color = _colorMapArry[(_waveSldrVal * 80) | 0];
            }else {
                _color = [255, 255, 0];
            }
            _shouldUpdate = false;
        }

        update(timeStamp);

        MEUtil.raf(enterFrameHandler);
    }

    function update(timeStamp) {
        calculateVars();
        updateLbls();
        moveLbls();
        
        if (timeStamp >= _end + 35) {
            _offset -= (40 - 15 * (_waveSldrVal * 80) / 80);
            _offset %= 360;

            _waveCtx.clearRect(0, 0, _waveCan.offsetWidth, _waveCan.offsetHeight);
            _bottomWaveCtx.clearRect(_centerPt.x - 20, 0, _bottomWaveCan.offsetWidth, _bottomWaveCan.offsetHeight);
            drawIncident();
            drawRefracted();
            drawArcs();

            _end = timeStamp;
        }
    }

    function updateLbls() {
        _theta = Math.round(_angle * 180 / _PI);
        _waveSldrLbl.innerHTML = "Wavelength: " + (_wavelength) + " nm";
        _angleSldrLbl.innerHTML = "Incident Angle - &theta;(i): " + _theta + "&deg;";

        var rAngleStr = (_rAngle * 180 / _PI).toString(),
            farAngleStr = (_farAngle * 180 / _PI).toString(),
            rLen = rAngleStr.length,
            fLen = farAngleStr.length;

        if (rLen > 5) {
            rAngleStr = rAngleStr.substring(0, 5);
        }

        if (fLen > 5) {
            farAngleStr = farAngleStr.substring(0, 5);
        }

        if (_lightSeg.getSelectedIndex() == 1 || (_angle == 0 && _lightSeg.getSelectedIndex() == 0) || _cbIndex <= 1) {
            if (_theta == 0) {
                rAngleStr = rAngleStr + ".0";
            }

            if (parseFloat(rAngleStr) > 80) {
                rAngleStr = "80.0";
            }

            _refractDegLbl.innerHTML = rAngleStr + "&deg;";
        }else {
            _refractDegLbl.innerHTML = "Varies from</BR>" + rAngleStr + "&deg; To "
                + farAngleStr + "&deg;";
        }
    }

    function moveLbls() {
        var x = 124,
            y = 0,
            visibility = "",
            r = (_rAngle * 180 / _PI) | 0;

        if (_theta < 35) {
            x = 131 + (_incidentThetaLbl.offsetWidth - 2) + (35 - _theta) / 2;
            y = 16;
        }

        x = x | 0;

        _incidentThetaLbl.style.left = x + "px";
        _incidentThetaLbl.style.top = y + "px";

        if (_lightSeg.getSelectedIndex() == 1 || _cbIndex <= 1 || _theta == 0) {
            visibility = "visible";
        }else {
            visibility = "hidden";
        }

        if (r >= 35) {
            x = 150;
            y = 132;
        }else {
            x = 137 - (_incidentThetaLbl.offsetWidth - 2) - (35 - r) / 2;
            y = 115;
        }

        x = x | 0;

        _refractThetaLbl.style.visibility = visibility;
        _refractThetaLbl.style.left = x + "px";
        _refractThetaLbl.style.top = y + "px";
    }

    function calculateVars() {
        _rIndex = _indexArry[_cbIndex];
        _angle = Math.round(80 - (_angleSldrVal * 80)) * _PI / 180;

        if (_lightSeg.getSelectedIndex() == 1) {
            _wavelength = (400 + 300 * (_waveSldrVal * 80) / 80) | 0;
            _rIndex += (_rIndex - 1) * (700 - _wavelength) / 7500;
            _rAngle = Math.asin(Math.sin(_angle) / _rIndex);
        }else {
            _farIndex = _rIndex;
            _rIndex += (_rIndex - 1) * 300 / 7500;
            _farAngle = Math.asin(Math.sin(_angle) / _farIndex);
            _rAngle = Math.asin(Math.sin(_angle) / _rIndex);
            _fakeAngle = _farAngle + (_rIndex * 0.06) + (_angle * 0.04);
        }
    }

    function drawIncident() {
        if (_angle == 0 || _cbIndex <= 1) {
            _topWaveContainer.style.height = "280px";
            drawContinuous();
        }else {
            _topWaveContainer.style.height = "130px";
            _continuousFlag = false;
        }

        var x1 = 0,
            y1 = 0,
            x2 = 0,
            y2 = 0;

        if (_lightSeg.getSelectedIndex() == 0) {
            _drawwl = 30;
        }else {
            _drawwl = (_waveSldrVal * 80) / 4 + 20;
        }

        x2 = _centerPt.x;
        y2 = _centerPt.y;
        y1 = 30;
        x1 = _centerPt.x - (((_centerPt.y - 30) * Math.tan(_angle)) | 0);

        if (x1 < 30) {
            x1 = 30;
            y1 = _centerPt.y - (((_centerPt.x - 30) / Math.tan(_angle)) | 0);
        }

        _ptArry[0][0] = new Pt(x1, y1);
        _ptArry[0][1] = new Pt(x2, y2);

        _waveCtx.beginPath();
        drawLine(_waveCtx, _ptArry[0][0], _ptArry[0][1]);
        _waveCtx.strokeStyle = "black";
        _waveCtx.stroke();

        _globalTheta = 0;
        _saveFlag = true;
        drawSin(_waveCtx, _ptArry, _color, 15, _drawwl, 2.5);
        _waveCtx.stroke();
    }

    function drawContinuous() {
        _continuousFlag = true;

        var x1 = 0,
            y1 = 0,
            x2 = 0,
            y2 = 0,
            x3 = 0,
            y3 = 0;

        if (_lightSeg.getSelectedIndex() == 0) {
            drawwl = 30;
        }else {
            drawwl = 20 + (_waveSldrVal * 80) / 4;
        }

        x2 = _centerPt.x;
        y2 = _centerPt.y;
        y1 = 30;
        x1 = _centerPt.x - (((_centerPt.y - 30) * Math.tan(_angle)) | 0);

        if (x1 < 30) {
            x1 = 30;
            y1 = _centerPt.y - (((_centerPt.x - 30) / Math.tan(_angle)) | 0);
        }

        y3 = 280;
        x3 = _centerPt.x + (((y3 - y2) * Math.tan(_rAngle)) | 0);

        if (x3 >= _drawWidth) {
            x3 = _drawWidth - 1;
            y3 = _centerPt.y + (((x3 - x2) / Math.tan(_rAngle)) | 0);
        }

        _waveCtx.beginPath();
        _ptArry[0][0] = new Pt(x1, y1);
        _ptArry[0][1] = new Pt(x3, y3);
        drawLine(_waveCtx, _ptArry[0][0], _ptArry[0][1]);
        _waveCtx.stroke();
        _globalTheta = 0;
        _saveFlag = false;
        drawSin(_waveCtx, _ptArry, _color, 15, drawwl, 2.5);
        _waveCtx.stroke();
    }

    function drawArcs() {
        var r = (_rAngle * 180 / _PI) | 0;

        drawAATransArc(_waveCtx, _centerPt.x, _centerPt.y, 50, 90, 80 - (_angleSldrVal * 80));

        if (_lightSeg.getSelectedIndex() == 1) {
            drawAATransArc(_bottomWaveCtx, _centerPt.x + 1, _centerPt.y - 131, 50, 270, r);
            drawAATransArc(_bottomWaveCtx, _centerPt.x + 1, _centerPt.y - 131, 60, 270, r);
        }else if (_continuousFlag) {
            drawAATransArc(_bottomWaveCtx, _centerPt.x + 1, _centerPt.y - 131, 50, 270, r);
            drawAATransArc(_bottomWaveCtx, _centerPt.x + 1, _centerPt.y - 131, 60, 270, r);
        }
    }

    function drawRefracted() {
        if (!_continuousFlag) {
            if (_lightSeg.getSelectedIndex() == 0 && _angle != 0 && _cbIndex >= 2) {
                drawRefractedWhite();
            }else {
                drawRefractedColor();
            }
        }
    }

    function drawRefractedWhite() {
        var x1 = _centerPt.x + 1,
            y1 = _centerPt.y + 1,
            x2 = 0,
            y2 = 0,
            x3 = 0,
            y3 = 0,
            pixdiff = 0,
            wl = 0,
            wlinc = 0;

        y2 = 280;
        x2 = _centerPt.x + (((y2 - y1) * Math.tan(_rAngle)) | 0);

        _saveFlag = false;

        if (x2 >= _drawWidth) {
            x2 = _drawWidth - 1;
            y2 = _centerPt.y + (((x2 - x1) / Math.tan(_rAngle)) | 0);
            x3 = _drawWidth - 1;
            y3 = _centerPt.y + (((x3 - x1) / Math.tan(_fakeAngle)) | 0);
            pixdiff = y2 - y3;
            wlinc = pixdiff == 0 ? 0 : (80 / pixdiff);

            
            for (var i = y2; i >= y3; i--) {
                _ptArry[0][0] = new Pt(x1, y1 - 130);
                _ptArry[0][1] = new Pt(x2, i - 130);
                _drawwl = 20 + ((wl / 4) | 0);

                //draw the rainbow of waves
                drawSin(_bottomWaveCtx, _ptArry, _colorMapArry[wl | 0], 15, _drawwl, 0.4);
                _bottomWaveCtx.stroke();

                wl += wlinc;
            }
        }else {
            y3 = 280;
            x3 = _centerPt.x + (((y3 - y1) * Math.tan(_fakeAngle)) | 0);
            pixdiff = x3 - x2;
            wlinc = pixdiff == 0 ? 0 : (80 / pixdiff);

            for (var i = x2; i <= x3; i++) {
                _ptArry[0][0] = new Pt(x1, y1 - 130);
                _ptArry[0][1] = new Pt(i, y2 - 130);
                _drawwl = 20 + ((wl / 4) | 0);

                //draws the rainbow of waves
                drawSin(_bottomWaveCtx, _ptArry, _colorMapArry[wl | 0], 15, _drawwl, 0.4);
                _bottomWaveCtx.stroke();

                wl += wlinc;
            }
        }
    }

    function drawRefractedColor() {
        var x1 = _centerPt.x,
            y1 = _centerPt.y,
            x2 = 0,
            y2 = 0;

        y2 = 280;
        x2 = _centerPt.x + (((y2 - y1) * Math.tan(_rAngle)) | 0);

        if (x2 >= _drawWidth) {
            x2 = _drawWidth - 1;
            y2 = _centerPt.y + (((x2 - x1) / Math.tan(_rAngle)) | 0);
        }

        _ptArry[0][0] = new Pt(x1, y1 - 131);
        _ptArry[0][1] = new Pt(x2, y2 - 131);

        _drawwl = (_waveSldrVal * 80) / 4 + 20;

        _bottomWaveCtx.beginPath();
        _bottomWaveCtx.strokeStyle = "black";
        drawLine(_bottomWaveCtx, _ptArry[0][0], _ptArry[0][1]);
        _bottomWaveCtx.stroke();

        _saveFlag = false;
        drawSin(_bottomWaveCtx, _ptArry, _color, 15, _drawwl, 2.5);
        _bottomWaveCtx.stroke();
    }

    function Pt(x, y) {
        return {x: x, y: y};
    }

    function drawLine(ctx, pt1, pt2) {
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
    }

    function drawPoly(ctx, pts, color, alpha) {
        ctx.beginPath();
        var len = pts.length,
            pt1 = null,
            pt2 = null;

        if (alpha != 1) {
            for (var i = 0; i < len; i++) {
                pt1 = pts[i][0];
                pt2 = pts[i][1];
                ctx.moveTo(pt1.x, pt1.y);
                ctx.lineTo(pt2.x, pt2.y);
            }
        }else {
            ctx.moveTo(pts[0].x, pts[0].y);

            for (var i = 1; i < len; i++) {
                pt1 = pts[i];
                ctx.lineTo(pt1.x, pt1.y);
            }
        }

        ctx.strokeStyle = "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", " + alpha + ")";
    }

    function drawAATransArc(ctx, centerx, centery, radius, startangle, arcangle) {
        if (arcangle != 0) {
            var arcinc = arcangle / Math.abs(arcangle),
                fangle = (startangle * _PI / 180),
                iangle = fangle + (arcangle * _PI / 180),
                farcinc = (arcinc * _PI / 20),
                stopangle = arcangle / 9,
                v = new Array(),
                p = new Array();

            for (var i = 0; (arcangle > 0) ? i <= stopangle : i >= stopangle; i += arcinc) {
                if (i == 0) {
                    v.push(new Pt(centerx + ((radius * Math.cos(fangle)) | 0), centery - ((radius * Math.sin(fangle)) | 0)));
                }

                fangle += farcinc;

                if (farcinc > 0) {
                    if (fangle  > iangle) {
                        fangle = iangle;
                    }
                }else {
                    if (fangle < iangle) {
                        fangle = iangle;
                    }
                }
                v.push(new Pt(centerx + ((radius * Math.cos(fangle)) | 0), centery - ((radius * Math.sin(fangle)) | 0)));
            }

            p = new Array(v.length);
            for (var i = 0, l = p.length; i < l; i++) {
                p[i] = v[i];
            }

            drawPoly(ctx, p, [0, 0, 0], 1);
            ctx.stroke();
        }
    }

    function drawSin(ctx, p, col, amp, wl, opacity) {
        var i = 0,
            x = 0,
            y = 0,
            x1 = p[0][0].x,
            x2 = p[0][1].x,
            y1 = p[0][0].y,
            y2 = p[0][1].y,
            d = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)),
            theta = 0,
            c = Math.cos(theta),
            s = Math.sin(theta),
            fy = 0,
            winc = ((_PI * 2) / wl),
            roffset = 0;

        if (d == 0) {
            return null;
        }else {
            theta = Math.asin((y2 - y1) / d);
        }

        c = Math.cos(theta);
        s = Math.sin(theta);
        winc = ((_PI * 2) / wl);

        if (_globalTheta != 0) {
            roffset = _globalTheta;
        }else {
            roffset = (_PI * _offset / 180);
        }

        spts = new Array(Math.round(d));
        var len = spts.length;

        for (var k = 0; k < len; k++) {
            spts[k] = new Array(2);
        }

        for (i = 0; i < len; i++) {
            fy = (Math.sin(i * winc + roffset) * amp);

            x = x1 + ((i * c - fy * s) | 0);
            y = y1 + ((fy * c + i * s) | 0);

            spts[i][1] = new Pt(x,y);

            if (i == 0) {
                spts[i][0] = new Pt(x1, y1);
            }else {
                spts[i][0] = spts[i - 1][1];
            }
        }

        spts[len - 1][1] = new Pt(x2, y2);

        if (_saveFlag) {
            _globalTheta = len * winc + roffset;
        }

        drawPoly(ctx, spts, col, opacity);
    }
}

$(document).ready(startTutorial);