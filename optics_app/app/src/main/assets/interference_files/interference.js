function startTutorial() {
    var _ampSldrA = new OlySlider("ampSldrA"),
        _waveSldrA = new OlySlider("waveSldrA"),
        _phaseSldrA = new OlySlider("phaseSldrA"),
        _ampSldrB = new OlySlider("ampSldrB"),
        _waveSldrB = new OlySlider("waveSldrB"),
        _phaseSldrB = new OlySlider("phaseSldrB");
    var _imagePaths = [];
    var _splash = OlySplash(initialize, _imagePaths),
        _ampSldrALbl = document.getElementById("ampSldrALbl"),
        _waveSldrALbl = document.getElementById("waveSldrALbl"),
        _phaseSldrALbl = document.getElementById("phaseSldrALbl"),
        _ampSldrBLbl = document.getElementById("ampSldrBLbl"),
        _waveSldrBLbl = document.getElementById("waveSldrBLbl"),
        _phaseSldrBLbl = document.getElementById("phaseSldrBLbl"),
        _waveACan = MEUtil.upscaleCanvas("waveACan"),
        _waveACtx = _waveACan.getContext("2d"),
        _waveDim = new Dim(_waveACan.offsetWidth, _waveACan.offsetHeight),
        _waveBCan = MEUtil.upscaleCanvas("waveBCan"),
        _waveBCtx = _waveBCan.getContext("2d"),
        _resultWaveCan = MEUtil.upscaleCanvas("resultWaveCan"),
        _resultWaveCtx = _resultWaveCan.getContext("2d"),
        _resultWaveDim = new Dim(_resultWaveCan.offsetWidth, _resultWaveCan.offsetHeight),
        _wl1f = 0,
        _wl2f = 0,
        _wl1 = 0,
        _wl2 = 0,
        _amp1 = 0,
        _amp2 = 0,
        _phase1 = 0,
        _phase2 = 0,
        _c1 = 0,
        _c2 = 0,
        _alpha1 = 0,
        _alpha2 = 0,
        _waveAVal = 0,
        _waveBVal = 0,
        _waveASldrHandle = getSldrHandle("waveSldrA"),
        _waveBSldrHandle = getSldrHandle("waveSldrB"),
        _colorPix = new Array(81),
        _PI = Math.PI,
        _shouldUpdate = false;

    function initialize() {
        addListeners();
        initControls();

        initCans();
        initColorPix();

        getSldrTrack("waveSldrA");
        getSldrTrack("waveSldrB");

    	MEUtil.raf(enterFrameHandler);
        _splash.fadeOut();
    }

    function addListeners() {
    }

    function initControls() {
        _ampSldrA.setPosition(0.625);
        _waveSldrA.setPosition(1);
        _phaseSldrA.setPosition(1);
        _ampSldrB.setPosition(0.625);
        _waveSldrB.setPosition(1);
        _phaseSldrB.setPosition(0.65);
    }

    function initCans() {
        _waveACtx.lineWidth = 2;
        _waveBCtx.lineWidth = 2;
        _resultWaveCtx.lineWidth = 2;
    }

    function initColorPix() {
        var rgb = [];

        for (var i = 0; i < 61; i++) {
            rgb = HSVtoRGB(i / 68, 1.0, 1.0);

            _colorPix[60 - i] = [rgb.r, rgb.g, rgb.b];
        }

        for (var i = 61; i < 81; i++) {
            _colorPix[i] = [255, 0, 0];
        }
    }

    function enterFrameHandler(timeStamp) {
        if (_ampSldrA.hasChanged) {
            _shouldUpdate = true;
            _ampSldrA.hasChanged = false;
        }

        if (_waveSldrA.hasChanged) {
            var pos = _waveSldrA.getPosition();
            _waveAVal = (pos * 80) | 0;

            updateSldrHandle(_waveASldrHandle, _waveAVal);

            _shouldUpdate = true;
            _waveSldrA.hasChanged = false;
        }

        if (_phaseSldrA.hasChanged) {
            _shouldUpdate = true;
            _phaseSldrA.hasChanged = false;
        }

        if (_ampSldrB.hasChanged) {
            _shouldUpdate = true;
            _ampSldrB.hasChanged = false;
        }

        if (_waveSldrB.hasChanged) {
            var pos = _waveSldrB.getPosition();
            _waveBVal = (pos * 80) | 0;

            updateSldrHandle(_waveBSldrHandle, _waveBVal);

            _shouldUpdate = true;
            _waveSldrB.hasChanged = false;
        }

        if (_phaseSldrB.hasChanged) {
            _shouldUpdate = true;
            _phaseSldrB.hasChanged = false;
        }

        if (_shouldUpdate) {
            var ampSldrAVal = (_ampSldrA.getPosition() * 80) | 0,
                phaseSldrAVal = (_phaseSldrA.getPosition() * 80) | 0,
                ampSldrBVal = (_ampSldrB.getPosition() * 80) | 0,
                phaseSldrBVal = (_phaseSldrB.getPosition() * 80) | 0,
                pct1 = pct2 = 0;

            calculate(ampSldrAVal, _waveAVal, phaseSldrAVal, ampSldrBVal, _waveBVal, phaseSldrBVal)
            updateCtrLbls();
            // updateSpecHandles();

            _waveACtx.strokeStyle = "rgb(" + _c1[0] + ", " + _c1[1] + ", " + _c1[2] + ")";
            _waveBCtx.strokeStyle = "rgb(" + _c2[0] + ", " + _c2[1] + ", " + _c2[2] + ")";

            if (_amp1 == 0) {
                pct1 = 0;
                pct2 = 1;
            }else if (_amp2 == 0) {
                pct1 = 1;
                pct2 = 0;
            }else {
                pct1 = _amp1 / (_amp1 + _amp2);
                pct2 = _amp2 / (_amp1 + _amp2);
            }

            rgb = colorMixRGB(_c1, _c2, pct1, pct2);
            _resultWaveCtx.strokeStyle = "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
            
            _shouldUpdate = false;
        }

        drawWaves();

        MEUtil.raf(enterFrameHandler); // DO NOT MOVE; LEAVE AS LAST STATEMENT
    }

    function calculate(ampSldrAVal, waveSldrAVal, phaseSldrAVal, ampSldrBVal, waveSldrBVal, phaseSldrBVal) {
        _wl1f = waveSldrAVal / 80;
        _wl2f = waveSldrBVal / 80;
        _wl1 = 400 + ((300 * _wl1f) | 0);
        _wl2 = 400 + ((300 * _wl2f) | 0);
        _amp1 = ampSldrAVal / 80;
        _amp2 = ampSldrBVal / 80;
        _phase1 = (((phaseSldrAVal * 360) | 0) / 80) | 0;
        _phase2 = (((phaseSldrBVal * 360) | 0) / 80) | 0;
        _c1 = _colorPix[waveSldrAVal];
        _c2 = _colorPix[waveSldrBVal];
    }

    function updateCtrLbls() {
        _ampSldrALbl.innerHTML = "Amplitude: " + ((_amp1 * 100) | 0) + " candela";
        _ampSldrBLbl.innerHTML = "Amplitude: " + ((_amp2 * 100) | 0) + " candela";

        _waveSldrALbl.innerHTML = "Wavelength: " + _wl1 + " nm";
        _waveSldrBLbl.innerHTML = "Wavelength: " + _wl2 + " nm";

        _phaseSldrALbl.innerHTML = "Phase Shift: " + _phase1 + "&deg;";
        _phaseSldrBLbl.innerHTML = "Phase Shift: " + _phase2 + "&deg;";
    }

    function drawWaves() {
        _alpha1 = (_alpha1 - 5 + 360) % 360;
        _alpha2 = (_alpha2 - 5 + 360) % 360;

        var _y = 0.0, _y1 = 0.0, _y2 = 0.0,
            alpha1 = _alpha1 * 700.0 / _wl1,
            alpha2 = _alpha2 * 700.0 / _wl2,
            stX = 170,
            stY = 98,
            amp1 = (_amp1 * 80 / 2) | 0,
            amp2 = (_amp2 * 80 / 2) | 0;

        alpha1 = (alpha1 + _phase1) / 180.0 * _PI;
        alpha2 = (alpha2 + _phase2) / 180.0 * _PI;

        var k1 = _PI / (_wl1 * 60.0 / 1000 + 5);
            k2 = _PI / (_wl2 * 60.0 / 1000 + 5),
            y1 = 0,
            y2 = 0,
            y = 0,
            pt1 = {},
            pt2 = {};

        _waveACtx.clearRect(0, 0, _waveDim.w, _waveDim.h);
        _waveBCtx.clearRect(0, 0, _waveDim.w, _waveDim.h);
        _resultWaveCtx.clearRect(0, 0, _resultWaveDim.w, _resultWaveDim.h);
        
        for (var i = 0; i < stX; i++) {
            y1 = Math.sin(i * k1 + alpha1) * amp1;
            y2 = Math.sin(i * k2 + alpha2) * amp2;
            y = y1 + y2;

            if (i != 0) {
                pt1 = new Pt(i - 1, (_y1 + stY / 2) | 0);
                pt2 = new Pt(i, (y1 + stY / 2) | 0);
                drawLine(_waveACtx, pt1, pt2);

                pt1 = new Pt(i - 1, (_y + stY | 0));
                pt2 = new Pt(i, (y + stY | 0));
                drawLine(_resultWaveCtx, pt1, pt2);

                if (i % 5 == 0) {
                    pt1 = new Pt(i, (_y1 + stY / 2) | 0);
                    pt2 = new Pt(i, stY / 2);
                    drawLine(_waveACtx, pt1, pt2);

                    pt1 = new Pt(i, (_y + stY) | 0);
                    pt2 = new Pt(i, stY);
                    drawLine(_resultWaveCtx, pt1, pt2);
                }

                pt1 = new Pt(i - 1, (_y2 + stY / 2) | 0);
                pt2 = new Pt(i, (y2 + stY / 2) | 0);
                drawLine(_waveBCtx, pt1, pt2);

                if (i % 5 == 0) {
                    pt1 = new Pt(i, (_y2 + stY / 2) | 0);
                    pt2 = new Pt(i, stY / 2);
                    drawLine(_waveBCtx, pt1, pt2);
                }
            }

            _y = y;
            _y1 = y1;
            _y2 = y2;
        }
    }

    function getSldrTrack(sldrName) {
        var sldr = document.getElementById(sldrName),
            trackSibling = sldr.getElementsByClassName("sliderTrackThresh")[0],
            dim = new Dim(trackSibling.offsetWidth, trackSibling.offsetHeight),
            rgb = "",
            track = document.createElement("canvas"),
            trackCtx = track.getContext("2d");

        //set props of new track
        track.style.position = "absolute";
        setElementProps(track, new Pt(0, 0), dim);

        //make gradient
        for (var i = 0; i < dim.w; i++) {
            trackCtx.fillStyle = "rgb(" + _colorPix[(i / dim.w * 80) | 0] + ")";
            trackCtx.fillRect(i, 0, 1, dim.h);
        }

        trackSibling.parentNode.appendChild(track);
    }

    function setElementProps(elm, pt, dim) {
        elm.style.left = pt.x + "px";
        elm.style.top = pt.y + "px";
        
        elm.width = dim.w;
        elm.style.width = dim.w + "px";
        elm.height = dim.h;
        elm.style.height = dim.h + "px";
    }

    function getSldrHandle(sldrName) {
        var sldr = document.getElementById(sldrName),
            handle = sldr.children[1].children[0];

        return handle;
    }

    function updateSldrHandle(handle, val) {
        var rgb = _colorPix[val];

        handle.style.background = "rgb(" + rgb.join(", ") + ")";
    }

    function drawLine(ctx, pt1, pt2) {
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();
    }

    function getColor(nm) {
        if (nm < 380) {
            if (nm < 130) {
                nm = 130;
            }

            var prct = (nm - 130) / 250;

            var r = ((-130 * prct * prct) + (385 * prct)) | 0;
            var g = 0;
            var b = ((-142 * prct * prct) + (371 * prct)) | 0;

            return 0xff000000 | (r << 16) | (g << 8) | b;
        }else if (nm < 630) {
            var prct = (nm - 380) / (630 - 380);
            var hue = prct * (1 - 0.15) + 0.15;
            hue = 1 - hue;
            var rgb = HSVtoRGB(hue, 1, 1);

            return [rgb.r, rgb.g, rgb.b];
        }else if (nm < 700) {
            return [255, 0, 0];
        }

        if (nm > 1500) {
            nm = 1500;
        }

        var prct = (nm - 700) / 800;
        var r = (255 * (1 - prct)) | 0;
        var g = ((0.5 - Math.abs(prct - 0.5)) * 2 * 50) | 0;
        var b = 0;

        return [r, g, b];
    }

    function colorMixRGB(rgb1, rgb2, p, pinv) {
        var r = rgb1[0] * p + rgb2[0] * pinv;
            g = rgb1[1] * p + rgb2[1] * pinv;
            b = rgb1[2] * p + rgb2[2] * pinv;

        return [(r) | 0, (g) | 0, (b) | 0];
    }

    /* hsv converter
     * accepts parameters
     * h  Object = {h:x, s:y, v:z}
     * OR w
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

    function Pt(x, y) {
        return {x: x, y: y};
    }

    function Dim(w, h) {
        return {w: w, h: h};
    }
}

// \/ NO TOUCHY \/
$(document).ready(startTutorial);