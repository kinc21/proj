function startTutorial() {
    //swap comments (ctrl + /) on lines (10, 13, 14, 21) to bypass the loader saving ~5sec for each refresh while building your tutorial
    //remove all original comments and restore loader when your tutorial is finished
    //NOTE: bypassing the splash bypasses images from loading with data-src in html
    var  _sldr = new OlySlider("sldr"),
         _lineCanvas = MEUtil.upscaleCanvas("lineCanvas"),
         _lineCtx = _lineCanvas.getContext("2d"),
         _aniCanvas = MEUtil.upscaleCanvas("aniCanvas"),
         _aniCtx = _aniCanvas.getContext("2d"),
         _realImgLbl = document.getElementById("realImgLbl"),
         _virtualImgLbl = document.getElementById("virtualImgLbl"),
         _objLbl = document.getElementById("objectLbl"),
         _canHeight = 222,
         _canWidth = 350,
         _mx = 193, _my = _canHeight/2, // center of the screen handed from the browser
         _sdx, // slider distance or distance arrow 1 is from mirror
         _fdx = -65, // focal distance from mirror, in this case -80 or 80 to the left
         _ccx = 68, // center of curvature
         _arr1 = new Image(),
         _arr2 = new Image(),
         _lp, _rp,
         _arr_height, _arr_width,
         _mir_h = 177, _mir_w = 39, // height and width of mirror and mask
         _mir_x, _mir_y, // tlx and tly of mirror and mask
         _SCALEFACTOR = 0.5,
         _imagePaths = ["images/concave.jpg","images/arr1.gif","images/arr2.gif"],
         _splash = OlySplash(initialize, _imagePaths); //COMMENT OUT THIS LINE TO REMOVE LOADER TEMPORARILY

    // document.getElementsByClassName("mainscene")[0].style.visibility = "visible"; //UNCOMMENT OUT THIS LINE TO REMOVE LOADER TEMPORARILY
    // initialize(); //UNCOMMENT OUT THIS LINE TO REMOVE LOADER TEMPORARILY

    function initialize()
    {
         //init
         _sldr.setPosition(.5);

        //setup images
        _arr1.src = _imagePaths[1];
        _arr2.src = _imagePaths[2];

         //variables
         _mir_x = _mx - _mir_w / 2 - 6;
         _mir_y = _my - _mir_h / 2;
         _sdx =  (0.5 * 1.7) - _mx + 10; //0.5 is slider, TODO check this
         _arr_height = (80 * _SCALEFACTOR); //based on gifs not being used
         _arr_width =  (18 * _SCALEFACTOR);

        //set up lineCanvas
        _lineCtx.translate(0.5,0.5);
        _lineCtx.lineWidth=1;

        //horizontal
        _lineCtx.beginPath();
        _lineCtx.moveTo(0,_my);
        _lineCtx.lineTo(_canWidth,_my);
        _lineCtx.stroke();

        _lineCtx.beginPath();
        _lineCtx.moveTo(130,_my);
        _lineCtx.lineTo(130,40);
        _lineCtx.stroke();

        _lineCtx.beginPath();
        _lineCtx.moveTo(70,_my);
        _lineCtx.lineTo(70,40);
        _lineCtx.stroke();

        _lineCtx.beginPath();
        _lineCtx.arc(70,_my,2,Math.PI*2,0);
        _lineCtx.stroke();
        _lineCtx.fill();

        _lineCtx.beginPath();
        _lineCtx.arc(130,_my,2,Math.PI*2,0);
        _lineCtx.stroke();
        _lineCtx.fill();

        //set up aniCanvas
        _aniCtx.lineWidth = 2;
        _aniCtx.lineJoin = "round"; //ha

        MEUtil.raf(enterFrameHandler);
        _splash.fadeOut(); //COMMENT OUT THIS LINE TO REMOVE LOADER TEMPORARILY
    }

    function update()
    {
        _aniCtx.clearRect(0,0,_canWidth,_canHeight);
        var lessthan = (_sldr.getPosition(0,100)<70);
        if (lessthan)
        {
            drawLeft(); // draws reflection if left of mirror
        }
        else
        {
            drawRight(); // draws reflection if right of mirror
        }

        if (lessthan)
        {
            var x = Math.max(0, _lp.x + 10);
            var y = Math.min(_canHeight - 10, _lp.y - (_lp.y - _my) / 2 -5);
            _virtualImgLbl.style.visibility = "hidden";
            _realImgLbl.style.visibility = "visible";
            _realImgLbl.style.left = x +"px";
            _realImgLbl.style.top = y + "px";
            _aniCtx.drawImage(_arr2, _lp.x - (_arr2.width * _SCALEFACTOR) / 2, _my,  (_arr2.width * _SCALEFACTOR), _lp.y - _my);
        }
        else//THIS IS RIGHT SIDE DRAW ARROW
        {
            _virtualImgLbl.style.visibility = "visible";
            _realImgLbl.style.visibility = "hidden";
            _aniCtx.drawImage(_arr1, (_rp.x - _arr_width / 2), _rp.y, _arr_width, _my - _rp.y);
    
            if (_rp.x < _mx + 84) {
                _virtualImgLbl.innerHTML="Virtual Image";
                _virtualImgLbl.style.left = _rp.x-130 +"px";
                _virtualImgLbl.style.top =  Math.max(12, _my - (_my - _rp.y)+30) + "px";
            }else{
                _virtualImgLbl.innerHTML="Virtual<BR>Image";
                _virtualImgLbl.style.left = Math.min(_canWidth - 195, _rp.x - 50 - 10) +"px";
                _virtualImgLbl.style.top =  Math.max(12, 15 + _my - (_my - _rp.y) / 2) + "px";
            }
        }

        var tempX =  _mx+_sdx-_arr_width/2;
        if (tempX >128) tempX=128;
        _objLbl.style.left = tempX+"px";
        _objLbl.style.top =  54 + "px";
        _aniCtx.drawImage(_arr1, _mx+_sdx-_arr_width/2, _my-_arr_height, _arr_width, _arr_height);

    }

    var Point = function (x,y)
    {
        this.x = x;
        this.y = y;
    };

    function getIntersectionPoint(p1, p2, p3, p4)
    {
        var mx1, my1, mx2, my2, c1, c2;
        var dx21 = p2.x - p1.x;
        var dx43 = p4.x - p3.x;
        if (dx21 != 0)
        {
            var m0 = (p2.y - p1.y) / dx21;
            mx1 = -m0;
            my1 = 1.0;
            c1 =  (p1.y - (p1.x * m0));
        }
        else
        {
            mx1 = 1.0;
            my1 = 0.0;
            c1 = p1.x;
        }
        if (dx43 != 0)
        {
            var m1 = (p4.y - p3.y) / dx43;
            mx2 = -m1;
            my2 = 1.0;
            c2 = (p3.y - (p3.x * m1));
        }
        else
        {
            mx2 = 1.0;
            my2 = 0.0;
            c2 = p3.x;
        }
         var determinant = (mx1 * my2) - (mx2 * my1);
        if (determinant != 0.0)
        {
            var xi =  (((my2 * c1) - (my1 * c2)) / determinant);
            var yi =  (((mx1 * c2) - (mx2 * c1)) / determinant);
            return new Point(xi, yi);
        }
        return null;
    }

    function drawLine(ctx, points, color)
    {
        ctx.strokeStyle = "rgba("+color.r+","+color.g+","+color.b+","+0.5+")";

        if(points.length == 2){ //single line
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[1].x, points[1].y);
            ctx.stroke();
        }else{ //multi-point lines
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for(var c = 1; c < points.length; c++){
                ctx.lineTo(points[c].x, points[c].y)
            }
            ctx.stroke();
        }
    }

    function drawLeft()  
    {
      
        var p1 = new Point(_mx - 6, _my);
        var p2 = new Point(_mx + _sdx, _my - _arr_height);
        var p3 = new Point(_mx - 10, _my - _arr_height);
        var p4 = new Point(_mx + _fdx - 1, _my);
        var p5 = new Point(0,0);

        var slope = (p2.y - p1.y) / (p2.x - p1.x);

        p5.y = p1.y +  (slope * p1.x);
        slope = (p4.y - p3.y) /  (p4.x - p3.x);
        p4.x = 0;
        p4.y = p3.y -  (slope * p3.x);
        _lp = getIntersectionPoint(p1, p5, p3, p4);

        var pb = []; // point array for drawing blue lines
        var pr = []; // point array for drawing red lines

         pb.push(p2);
         pb.push(p3);
         pb.push(new Point(_lp.x, _lp.y));
         
        drawLine(_aniCtx,pb,{r:0,g:0,b:255});

         pr.push(new Point(_lp.x, _lp.y));
         pr.push(p1);
         pr.push(p2);
         
         drawLine(_aniCtx,pr,{r:255,g:0,b:0});
    }

    function drawRight()
    {
       
         var p1 = new Point(_mx - 10, _my - _arr_height);
         var p2 = new Point(_mx + _fdx, _my);
         var p3 = new Point(_ccx, _my);
         var p4 = new Point(_mx + _sdx, _my - _arr_height);
         _rp = getIntersectionPoint(p1, p2, p3, p4);

         var pb = []; // point array for drawing blue lines
         var pr = []; // point array for drawing red lines

         pb[0] = p2;
         pb[1] = p1;
         pb[2] = p4;
         pb[3] = p3;

         pr[0] = p1;
         pr[1] = new Point(_rp.x, _rp.y);
         pr[2] = p4;

         drawLine(_aniCtx, pb, {r:0,g:0,b:255});
         drawLine(_aniCtx, pr, {r:255,g:0,b:0});
    }

    function sldrHandler()
    {
        var x = _sldr.getPosition(0,100);
        _sdx =  (x * 1.7) - _mx + 10;
      
        if(_mx+_sdx<=10)
        {
            _sdx = 10 - _mx;
        }
        else if(_sdx>-31)
        {
            _sdx = -31;
        }
        
    }

    function enterFrameHandler()
    {
        if (_sldr.hasChanged) {
            _sldr.hasChanged = false;
            sldrHandler();
            update();

        }
        MEUtil.raf(enterFrameHandler);
    }
}

$(document).ready(startTutorial);
