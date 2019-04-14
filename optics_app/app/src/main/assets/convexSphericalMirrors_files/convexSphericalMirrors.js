function startTutorial() {
    var _slider = new OlySlider("slider"),
        _imagePaths = [],
        _splash = OlySplash(initialize, _imagePaths),
        _drawLines = MEUtil.upscaleCanvas("drawLines"),
        _largeArrow = document.getElementById("largeArrowContainer"),
        _smallArrow = document.getElementById("smallArrowContainer"),
        _smallArrowBody = document.getElementById("smallArrowBody"),
        _objectText = document.getElementById("objectText"),
        _virtualText = document.getElementById("virtualText");

    function initialize() {
        _slider.setPosition(0.5);

        MEUtil.raf(enterFrameHandler);
        _splash.fadeOut();
    }

    function drawLines() {
        var ctx = _drawLines.getContext("2d"),
            startPointX = _slider.getPosition(1, 131),
            changePointX = _slider.getPosition(162, 167),
            changePointY = _slider.getPosition(40, 16),
            color1 = "#3333CC",
            color2 = "#FF6666"

        ctx.lineWidth = 2;
        ctx.strokeStyle = color1;
        ctx.clearRect(0, 0, _drawLines.width, _drawLines.height);

        ctx.beginPath();
        ctx.moveTo(startPointX, 1);
        ctx.lineTo(171, 1);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.strokeStyle = color2;
        ctx.moveTo(171, 1);
        ctx.lineTo(235, 76);
        ctx.stroke();
        ctx.closePath();


        ctx.beginPath();
        ctx.strokeStyle = color1;
        ctx.moveTo(startPointX, 1);
        ctx.lineTo(changePointX, changePointY);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.strokeStyle = color2;
        ctx.moveTo(changePointX, changePointY);
        ctx.lineTo(304, 77);
        ctx.stroke();
        ctx.closePath();
    }

    function enterFrameHandler(timeStamp) {
        if (_slider.hasChanged) {
            _slider.hasChanged = false;

            drawLines();

            _largeArrow.style.left = _slider.getPosition(4, 134) + "px";

            _smallArrow.style.top = _slider.getPosition(140, 114) + "px";
            _smallArrow.style.left = _slider.getPosition(227, 205) + "px";
            _smallArrowBody.style.height = _slider.getPosition(18, 44) + "px";

            _virtualText.style.top = _slider.getPosition(114, 89) + "px";
            _virtualText.style.left = _slider.getPosition(228, 207) + "px";

            if (_slider.getPosition(0, 10) < 7.7) {
                _objectText.style.left = _slider.getPosition(19, 149) + "px";
            }

            else {
                _objectText.style.left = _slider.getPosition(-29, 101) + "px";
            }
        }

        MEUtil.raf(enterFrameHandler); // DO NOT MOVE; LEAVE AS LAST STATEMENT
    }
}

// \/ NO TOUCHY \/
$(document).ready(startTutorial);
