function startTutorial() {
    var _angleSldr = new OlySlider("angleSlider"),
        _waveSldr =(function(){
                var options = {isSpectrumSlider: true, spectrumRange: {min: 400, max: 700}};
                return new OlySlider("wavelengthSlider", options);
            })(),
        _canvas = MEUtil.upscaleCanvas("waveCanvas"),
        _ctx = _canvas.getContext("2d"),
        _W = _canvas.width / MEUtil.PIXEL_RATIO, _H = _canvas.height / MEUtil.PIXEL_RATIO,
        _equationReadOut = document.getElementById("equationReadOut"),
        _waveReadOut = document.getElementById("wavelengthReadOut"),
        _angleReadOut = document.getElementById("angleReadOut"),
        _angleSldrRef = document.getElementById("angleSlider"),
        _incidentAngleReadout = document.getElementById("incidentAngle"),
        _refelctedAngleReadout = document.getElementById("reflectedAngle"),
        _normalToSurfaceReadout = document.getElementById("normalToSurface"),
        _angleSldrBG =  _angleSldrRef.firstChild,
        _animate = true,
        _angle = 30,
        _rangle = 180 - _angle,
        _wavelength = 700,
        _alpha = 360,
        _stX = 340/2,
        _stY = 280 - 80,
        _color,
        _MATH_PI = Math.PI,
        _imagePaths = ["./reflectionangles_files/halfmirror.jpg", "./reflectionangles_files/mirror.jpg"],
        _splash = OlySplash(initialize , _imagePaths);

    function initialize() {
        _waveSldr.setPosition(1);
        _angleSldr.setPosition(.37);
    	MEUtil.raf(enterFrameHandler);
        _splash.fadeOut();
    }

    function waveSldrHandler(){
        _wavelength = Math.round(_waveSldr.getPosition(400, 700));
        _waveReadOut.innerHTML = "Wavelength: " + _wavelength + " nm";
        var colorValue = _waveSldr.getSpectrumRGB(_waveSldr.getPosition(0,1));
        _color = "rgb("+colorValue[0]+","+colorValue[1]+","+colorValue[2]+")";
        _angleSldrBG.style.background = _color;

    }
    function angleSldrHandler(){
        _angle = Math.round(_angleSldr.getPosition(80,0));
        _angleReadOut.innerHTML = "Incident Angle: " + _angle + "&deg;";
        _equationReadOut.innerHTML = "n sin &#920(i) = n sin &#920(r) </BR>n sin " + _angle + "&deg;"
        + " = n sin &#920(r)</BR>sin " + _angle + "&deg; = sin &#920(r) </BR>" + _angle + "&deg; = &#920(r)";
    }

    function animate(){

        _ctx.clearRect(0,0,_W,_H);
        //variables
        var x1 = 0, y1 = 0;

        var alpha = _alpha * Math.PI / 180;

       _ctx.strokeStyle = _color;

        _rangle = 180 - _angle;//	<= Reflection!!!

        var k = _wavelength * 30.0 / 700;

        var c = Math.cos((_angle-90) / 180.0 * Math.PI);
        var s = Math.sin((_angle-90) / 180.0 * Math.PI);

        //for(int i=-stY-60; i<stY+60; i++)
        for(var i=-180; i<180; i++)
        {
            if(i == 0)
            {
                c = Math.cos((_rangle-90) / 180.0 * Math.PI);
                s = Math.sin((_rangle-90) / 180.0 * Math.PI);
            }

            var y = (Math.sin(i*Math.PI/k+alpha)*30);

            var x2 = (i*c + y*s);
            var y2 = (y*c - i*s);

            if(i==-1) { x2=0; y2=0; }
            if(i== 1) { x1=0; y1=0; }


            if( i != -180 && y1+_stY<=280 && y2+_stY<=280 && i!=0 )
            {
               
                _ctx.beginPath();
                _ctx.moveTo(x1+_stX, y1+_stY);
                _ctx.lineTo(x2+_stX, y2+_stY);
                _ctx.stroke();
                _ctx.beginPath();
                _ctx.moveTo(x1+_stX+1, y1+_stY);
                _ctx.lineTo(x2+_stX+1, y2+_stY);
                _ctx.stroke();
                if(i%5 == 0){
                _ctx.beginPath();
                _ctx.moveTo(x1+_stX, y1+_stY);
                _ctx.lineTo((i*c)+_stX, (-i*s)+_stY);
                _ctx.stroke();
                }
            }

            x1 = x2; y1 = y2;
        }

        //solid black lines
        ////////////////////
        //bottom line along mirror
        _ctx.strokeStyle = "black";
        _ctx.lineWidth=1;
        _ctx.beginPath();
        _ctx.moveTo(75, _stY+0.5);
        _ctx.lineTo(270, _stY+0.5);
        _ctx.stroke();

        //vertical line
        _ctx.beginPath();
        _ctx.moveTo(_stX-0.5, 0);
        _ctx.lineTo(_stX-0.5, _stY+10);
        _ctx.stroke();

        _ctx.beginPath();
        _ctx.moveTo(_stX-0.5, _stY);
        _ctx.lineTo(_stX-0.5 - (180*Math.sin(_angle * _MATH_PI / 180)), _stY - (180 * Math.cos(_angle * _MATH_PI / 180)));
        _ctx.stroke();

        _ctx.beginPath();
        _ctx.moveTo(_stX-0.5, _stY);
        _ctx.lineTo(_stX-0.5 + (180*Math.sin(_angle * _MATH_PI / 180)), _stY - (180 * Math.cos(_angle * _MATH_PI / 180)));
        _ctx.stroke();

        if(_angle != 0) {
            _ctx.beginPath();
            _ctx.arc(_stX, _stY, 30, degreesToRadians(_angle)-_MATH_PI/2, degreesToRadians(_rangle-180)-_MATH_PI/2, true);
            _ctx.stroke();
        } else {
            _ctx.strokeRect(_stX - 10.5, _stY - 9.5, 20, 10);
        }

        //moving labels
        //incident angles
        _incidentAngleReadout.innerHTML= "Incident</BR>Angle = " + _angle + "&deg;";
        _refelctedAngleReadout.innerHTML= "Reflected</BR>Angle = " + _angle + "&deg;";

        if (_angle < 61) {
            _incidentAngleReadout.style.top = (110 +_angle) + "px";
            _refelctedAngleReadout.style.top = (110 +_angle) + "px";
        } else  {
            _incidentAngleReadout.style.top = (_angle) + "px";
            _refelctedAngleReadout.style.top = (_angle) + "px";
        }
        //normal to surface
        if (_angle == 0) {
            _normalToSurfaceReadout.style.visibility = "visible";
            _normalToSurfaceReadout.style.left = (65 - 2 * _angle) + "px";
            _normalToSurfaceReadout.style.top = (35 + 2 * _angle) + "px";

        }
        else if (_angle<27){
            _normalToSurfaceReadout.style.visibility = "hidden";
        }else{
            _normalToSurfaceReadout.style.visibility = "visible";
            _normalToSurfaceReadout.style.left = "105px";
            _normalToSurfaceReadout.style.top = "10px";
            //gr.drawString(a = labels[22], (width - fm.stringWidth(a))/2 - 30, 15);
            //gr.drawString(a = labels[23], (width - fm.stringWidth(a))/2 - 30, 28);
        }
    }

    function degreesToRadians(degrees){
        return degrees * (_MATH_PI / 180);

    }
    function enterFrameHandler() {

        if(_waveSldr.hasChanged) {
            waveSldrHandler();
            _waveSldr.hasChanged = false;
        }

        if(_angleSldr.hasChanged) {
            angleSldrHandler();
            _angleSldr.hasChanged = false;
        }

        if(_animate){
            animate();
            _alpha = (_alpha - 30) % 360;
        }
        MEUtil.raf(enterFrameHandler);
    }

}$(document).ready(startTutorial);

//Override previous spectrum slider RGB calculation
OlySlider.prototype.getSpectrumRGB = function(percent) {
    var diff = this._spectrum.max - this._spectrum.min;
    var nm = this._spectrum.min + percent*diff;
    return this.getColor(Math.round(nm));
};

OlySlider.prototype.colorMixRGB = function(color, percent, mixArr_){
    var rgb = color;
    var mixArr = mixArr_ || [255, 255, 255];

    for(var i = 0; i < rgb.length; i++){
        var diffVal = mixArr[i] - rgb[i];
        rgb[i] += Math.round(diffVal * percent);
    }

    return rgb;
};

OlySlider.prototype.getColor = function(nm){
    var prct;
    if(nm < 380){
        prct = (nm - this._spectrum.min) / 180;

        return this.colorMixRGB(this.getColor(380), 1 - prct);
    }
    else if(nm < 650){
        prct = (nm - 380) / (650 - 380);
        var hue = prct * (1 - 0.15) + 0.15;
        hue = 1 - hue;

        return this.HSVtoRGB(hue, 1, 1);
    }
    else if(nm < 700){
        return [255, 0, 0];
    }

    if (nm > 1300){
        nm = 1300;
    }


    prct = (nm - 700) / 600;
    var r = Math.floor(255 * (1 - prct));
    var g = Math.floor((0.5 - Math.abs(prct - 0.5)) * 2 * 50);
    var b = 0;

    return [r, g, b];
};

OlySlider.prototype.HSVtoRGB = function(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (h && s === undefined && v === undefined) {
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
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
};
