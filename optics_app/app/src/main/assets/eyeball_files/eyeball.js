function startTutorial() {
    var _slider = new OlySlider("slider");
    var _imagePaths = [];
    var _splash = OlySplash(initialize, _imagePaths);
    var _butterfly = document.getElementById("butterfly");
    var _butterflyInverse = document.getElementById("invButterfly"); 
    var _objectText = document.getElementById("objectText");
    var _lens = document.getElementById("lens");
    var _slidingDiv = document.getElementById("slidingDiv");
    var _canvas = MEUtil.upscaleCanvas("lineCanvas");
    var _ctx = _canvas.getContext("2d");
    var _canvasWidth = _canvas.width;
    var _canvasHeight = _canvas.height;
    var _diagCanvas = MEUtil.upscaleCanvas("diagramLineCanvas");
    var _diaCtx = _diagCanvas.getContext("2d");
    var _diaCanvasWidth = _diagCanvas.width;
    var _diaCanvasHeight = _diagCanvas.height;
    var IS_TOUCH_DEVICE = MEUtil.IS_TOUCH_DEVICE;
    var _eventTypesArr = MEUtil.IS_TOUCH_DEVICE ? ["touchstart", "touchmove", "touchend"] :
                            ["mousedown", "mousemove", "mouseup"];
    var _eventPositionX = MEUtil.IS_TOUCH_DEVICE ? "e.changedTouches[0].clientX" : "e.clientX";

    function initialize() {
        _slider.setPosition(0.5);
        _ctx.lineWidth = 2;
        moveButterfly(75);
        _slidingDiv.addEventListener(_eventTypesArr[0], eventHandler, false);
    	MEUtil.raf(enterFrameHandler);
        _splash.fadeOut();
    }

    function enterFrameHandler(timeStamp) {
        if (_slider.hasChanged) {
            _slider.hasChanged = false;
            moveButterfly(_slider.getPosition(0,140));
            scaleButterflyInverse(_slider.getPosition(0.9, 1.3));
            scaleLens(_slider.getPosition(.66, 1));
            drawMovLines(_slider.getPosition(0,140));
            drawDiagLines()
        }

       MEUtil.raf(enterFrameHandler); // DO NOT MOVE; LEAVE AS LAST STATEMENT
    }

    function eventHandler(e){
        e.preventDefault();
        var flyInitOffsetX = 75;
        var translateValue = eval(_eventPositionX) - flyInitOffsetX;

        if(translateValue < 0){
            translateValue = 0;
        }

        if(translateValue > 140){
            translateValue = 140;
        }

        switch (e.type) {
            case _eventTypesArr[0]:
                document.addEventListener(_eventTypesArr[1], eventHandler, false);
                document.addEventListener(_eventTypesArr[2], eventHandler, false);
                _slidingDiv.removeEventListener(_eventTypesArr[0], eventHandler, false);
            case _eventTypesArr[1]:
                _slider.setPosition(translateValue / 140);
            break;
            case _eventTypesArr[2]:
                document.removeEventListener(_eventTypesArr[1], eventHandler, false);
                document.removeEventListener(_eventTypesArr[2], eventHandler, false);
                _slidingDiv.addEventListener(_eventTypesArr[0], eventHandler, false);
            break;
        }
    }

    function moveButterfly(x) {
        _butterfly.style[MEUtil.getPrefixedProp("transform")] = "translate(" + x + "px,0px)";
        _objectText.style[MEUtil.getPrefixedProp("transform")] = "translate(" + x + "px,0px)";
    }

    function scaleButterflyInverse(val) {
        _butterflyInverse.style[MEUtil.getPrefixedProp("transform")] = "scale(1," + val + ")";
    }

    function scaleLens(val) {
        _lens.style[MEUtil.getPrefixedProp("transform")] = "scale(" + val + ",1)";
    }

    function drawMovLines(sliderValue) {
        var topPoint = {
            x: 185,
            y: 22
        };

        var bottomPoint = {
            x: 185,
            y: 60
        };

        var sliderPosition = _slider.getPosition();

        _ctx.clearRect(0,0,_canvasWidth, _canvasHeight);
        _ctx.beginPath();      // Begin Top-Left to Bottom-Right Line
        _ctx.moveTo(6 + sliderValue,12);
        _ctx.lineTo(topPoint.x,topPoint.y);
        _ctx.lineTo(topPoint.x + 128 - 4 * sliderPosition,topPoint.y + 45 + 10 * sliderPosition);

        _ctx.moveTo(6 + sliderValue,68);    // Begin Bottom-Left to Top-Right Line
        _ctx.lineTo(bottomPoint.x,bottomPoint.y);
        _ctx.lineTo(bottomPoint.x + 128 - 7 * sliderPosition,bottomPoint.y - 45 - 10 * sliderPosition);
        _ctx.globalAlpha = 0.6;
        _ctx.stroke();
    }

    function drawDiagLines() {
        var gradient1 = _diaCtx.createLinearGradient(20,10,38,40);
        gradient1.addColorStop(0.32, "black");
        gradient1.addColorStop(0.33, "white");

        var gradient2 = _diaCtx.createLinearGradient(6,115,36,75);
        gradient2.addColorStop(0.45, "black");
        gradient2.addColorStop(0.46, "white");

        _diaCtx.clearRect(0,0,_diaCanvasWidth, _diaCanvasHeight);
        _diaCtx.beginPath();    // Begin "Suspensory Ligament" Diagram Line
        _diaCtx.moveTo(20,10);
        _diaCtx.lineTo(38,40);
        _diaCtx.strokeStyle = gradient1;
        _diaCtx.lineWidth = 2;    
        _diaCtx.stroke();   // End "Suspensory Ligament" Diagram Line
                
        _diaCtx.beginPath();    // Begin "Lens" Diagram Line
        _diaCtx.moveTo(6,115);
        _diaCtx.lineTo(36,75);
        _diaCtx.strokeStyle = gradient2;
        _diaCtx.lineWidth = 2;    
        _diaCtx.stroke();   // End "Lens" Diagram Line
    }
}

// \/ NO TOUCHY \/
$(document).ready(startTutorial);