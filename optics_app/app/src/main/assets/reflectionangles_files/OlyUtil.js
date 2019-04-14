var MEUtil = MEUtil || {};

/*---------- Public Properties ----------*/
MEUtil.vendorPrefix = {};

MEUtil.IS_TOUCH_DEVICE = (function (userAgent) {
    if (userAgent.match(/Android/i) ||
        userAgent.match(/webOS/i) ||
        userAgent.match(/iPhone/i) ||
        userAgent.match(/iPad/i) ||
        userAgent.match(/iPod/i) ||
        userAgent.match(/BlackBerry/) ||
        userAgent.match(/Windows Phone/i) ||
        userAgent.match(/ZuneWP7/i)) {                
        return true;
    }
    else { return false; }
})(navigator.userAgent);

MEUtil.PIXEL_RATIO = (function () {
    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    return Math.max(dpr / bsr, 1);
})();

MEUtil.PREFIXES = ["webkit", "moz", "o", "ms"];

/*---------- Public Methods ----------*/
MEUtil.addClass = function(elm, className) {
    elm.className += " " + className;
};

MEUtil.removeClass = function(elm, className) {
    elm.className = elm.className.replace(
        new RegExp("(?:^|\s)" + className + "(?!\S)", "g") , '' );
};

MEUtil.hasClass = function(elm, className) {
    return elm.className.match( new RegExp("(?:^|\s)" + className + "(?!\S)") );
};

MEUtil.appendChildren = function(parent, children) {
    if (parent.substring) { parent = document.getElementById(parent); }
    for (var i = 0, l = children.length; i < l; i++) {
        parent.appendChild(children[i]);
    }
};

MEUtil.createCanvas = function(w, h, ratio) {
    if (!ratio) { ratio = MEUtil.PIXEL_RATIO; }
    var can = document.createElement("canvas");
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    if (ratio !== 1) {
        can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    return can;
};

MEUtil.formatWithComma = function(str) {
    return str.toString().replace(/(\d)(?=(\d{3})+$)/, "$1,");
};

MEUtil.getGlobalX = function(o) {
    var x = 0;
    do { x += o.offsetLeft; } while (o = o.offsetParent);
    return x;
};

MEUtil.getGlobalY = function(o) {
    var y = 0;
    do { y += o.offsetTop; } while (o = o.offsetParent);
    return y;
};

MEUtil.getGlobalPoint = function(o) {
    return {
        x: this.getGlobalX(o),
        y: this.getGlobalY(o)
    };
};

MEUtil.makeSuper = function(Man, SuperMan) {
    function F() {}
    F.prototype = SuperMan.prototype;

    var prototype = new F();
    prototype.constructor = Man;
    Man.prototype = prototype;
};

MEUtil.on = function(element, types, callback) {
    var typesArr = types.split(" ");
    for (var i = 0, l = typesArr.length; i < l; i++) {
        element.addEventListener(typesArr[i], callback, false);
    }
};

MEUtil.off = function(element, types, callback) {
    var typesArr = types.split(" ");
    for (var i = 0, l = typesArr.length; i < l; i++) {
        element.removeEventListener(typesArr[i], callback, false);
    }
};

MEUtil.upscaleCanvas = function(can, ratio) {
    if (can.substring) { can = document.getElementById(can); }
    if (!ratio) { ratio = MEUtil.PIXEL_RATIO; }
    var w = can.clientWidth || can.width,
        h = can.clientHeight || can.height,
        ctx = can.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
};

MEUtil.loadFromDataSrc = function(assets, options) {
    var count = assets.length;

    for (var i = 0, l = count; i < l; i++) {
        var item = assets[i];
        if (typeof item != "string") {
            loadAssetFromDataSrc(item);
        }else {
            loadAssetFromPath(item);
        }        
    }

    function loadAssetFromDataSrc(asset) {
        var path = asset.getAttribute("data-src");

        asset.removeAttribute("data-src");

        var img = new Image();
        img.onload = getImgLoadedFunction(asset);
        img.src = path;
    }

    function loadAssetFromPath(path) {
        var img = new Image();
        img.onload = getImgLoadedFunction();
        img.src = path;
    }

    function getImgLoadedFunction(el) {
        return function() {
            count--;

            // Re-attach the loaded asset, if available.
            if (el) {
                switch (el.tagName.toLowerCase()) {
                case "img":
                    el.src = this.src;
                    break;
                case "div":
                    el.style.backgroundImage = "url(" + this.src + ")";
                    break;
                case "object":
                    el.data = this.src;
                    break;
                case "canvas":
                    var ctx = el.getContext("2d");
                    ctx.drawImage(this, 0, 0);
                }
            }

            // Update loading events, if available.
            if (options) {
                if (options.onProgress) { 
                    options.onProgress({
                        type: "progress",
                        response: el, 
                        progress: 1 - count / l
                    });
                }

                if (!count && options.onComplete) { 
                    options.onComplete({
                        type: "complete",
                        response: assets
                    }); 
                }
            }
        };
    }
};

MEUtil.ImageStackr = function(spriteContainer) {
    var _animSpeed = 0,
        _animTime = 0,
        _canvas = null,
        _canvasCtx = null,
        _cols = 0,
        _currentFrame = 0,
        _frames = [],
        _imageCount = 0,
        _frameHeight = 0,
        _frameWidth = 0,
        _progressFlag = false,
        _spriteContainer = document.getElementById(spriteContainer),
        _spriteId = spriteContainer,
        _sprites = null,
        _stackrCanvas = null,
        _stackrCanvasCtx = null,
        _stackrFrame = 0,
        
        //Public Methods
        getAnimationSpeed = function() {
            return _animSpeed;
        },

        getCanvas = function() {
            return _canvas;
        },

        getContext = function() {
            return _canvasCtx;
        },

        getCurrentFrame = function() {
            return _currentFrame;
        },

        getElement = function() {
            return _spriteContainer;
        },

        getFrame = function() {
            return _currentFrame;
        },

        getId = function() {
            return _spriteId;
        },

        //In place for use with TweenLite.
        getProgress = function() {
            return ((_currentFrame - 1) / (_imageCount - 1));
        },

        gotoFrame = function(newFrame) {
            newFrame = (newFrame + 0.5) >> 0;
            if (newFrame != _currentFrame) {
                if (newFrame >= 1 && newFrame <= _imageCount) {
                    var canvasWidth = _canvas.width,
                        canvasHeight = _canvas.height,
                        frame = _frames[newFrame - 1];

                    _currentFrame = newFrame;
                    _canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
                    _canvasCtx.drawImage(_sprites[frame.spriteIndex], 
                                         frame.x, frame.y, _frameWidth, _frameHeight, 
                                         0, 0, canvasWidth, canvasHeight);
                    _stackrCanvas.style.opacity = 0;
                }
            }
        },

        //loadSpriteSheet: passing your spritesheets into this method will
        //  generate a sprite in your imagestackr object with animation controls.
        //  The first two params are mandatory.
        //img: may be a single instance or an array of img elements (Image()) if
        //  your sprite requires multiple spritesheets.
        //count: the amount of frames - variable may be a number or array of numbers
        //  if you are also passing an array of images in the first parameter.
        //width/height: optional parameters, use if you do net set in css.
        //initFrame: use if the initial image of your spritesheet(s) is not the initial
        //  frame of your sprite.
        loadSpriteSheet = function(img, count, width, height, initFrame) { 
            var i = 0,
                hasMultipleSprites, hasMultipleCounts;

            if (width === undefined) {
                width = $(_spriteContainer).width();
                height = $(_spriteContainer).height();
            }
            if (initFrame === undefined) initFrame = 1;

            _frames = [];
            _imageCount = 0;
            _sprites = null;
            try {
                var w = img[0].width;
                hasMultipleSprites = true;
                try {
                    var countIsArray = count[0];
                    for (i = 0; i < count.length; i++) {
                        _imageCount += count[i];
                    }
                    hasMultipleCounts = true;
                } catch(e) {
                    _imageCount = count;
                    hasMultipleCounts = false
                }
            } catch(e) {
                _imageCount = count;
                hasMultipleSprites = false;
            }

            //Remove items if method was used previously.
            if (_canvas !== null) {
                $(_canvas).remove();
                $(_stackrCanvas).remove();
            }

            _canvas = document.createElement("canvas");
            _stackrCanvas = document.createElement("canvas");
            _sprites = bufferCanvas(img, hasMultipleSprites);
            
            _frameWidth = _canvas.width = _stackrCanvas.width = width;
            _frameHeight = _canvas.height = _stackrCanvas.height = height;
            _canvas.style.width = _stackrCanvas.style.width = 
                _spriteContainer.clientWidth ? _spriteContainer.clientWidth + "px" : 
                _frameWidth + "px";
            _canvas.style.height = _stackrCanvas.style.height = 
                _spriteContainer.clientHeight ? _spriteContainer.clientHeight + "px" : 
                _frameHeight + "px";

            _canvasCtx = _canvas.getContext("2d");
            _stackrCanvasCtx = _stackrCanvas.getContext("2d");

            //Setup _frames array
            var frame = {},
                tempFrames = [];
            if (hasMultipleSprites) {
                var numImgs = 0,
                    cols = 0;
                for (i = 0; i < img.length; i++) {
                    numImgs = (hasMultipleCounts) ? count[i] : count;
                    cols = (img[i].width / width) >> 0; //Truncate decimal.
                    for (var k = 0; k < numImgs; k++) {
                        frame = {};
                        frame.spriteIndex = i;
                        frame.x = (k % cols) * _frameWidth;
                        frame.y = ((k / cols) >> 0) * _frameHeight;
                        tempFrames.push(frame);
                    }
                }
            }else {
                cols = (img.width / _frameWidth) >> 0; //Truncate decimal.
                for (i = 0; i < count; i++) {
                    frame = {};
                    frame.spriteIndex = 0;
                    frame.x = (i % cols) * _frameWidth;
                    frame.y = ((i / cols) >> 0) * _frameHeight;
                    tempFrames.push(frame);
                }
            }

            if(initFrame === 1) {
                _frames = tempFrames;
            }else {
                for (i = initFrame - 1; i < tempFrames.length; i++) {
                    _frames.push(tempFrames[i]);
                }
                for (i = 0; i < initFrame - 1; i++) {
                    _frames.push(tempFrames[i]);
                }
            }

            $(_stackrCanvas).css({"position": "absolute", "left": 0, "top": 0});

            $("#" + _spriteId).append(_canvas, _stackrCanvas);

            gotoFrame(1);
        },

        //Animation frame methods are still in a beta state, use at your own risk
        nextAnimationFrame = function() {
            if (_animSpeed !== 0) {
                var currentTime = new Date().getTime(),
                    deltaTime = currentTime - _animTime,
                    imageInc = ((deltaTime / _animSpeed) + 0.5) >> 0,
                    newImgNum = _currentFrame + (imageInc < 6 ? imageInc : 5);
                
                if (_animSpeed <= deltaTime + 2) { //add about a 2ms margin for timer variances
                    _animTime = currentTime;
                    _currentFrame = newImgNum <= _imageCount ? newImgNum : newImgNum - _imageCount;
                    gotoFrame(_currentFrame);
                }
            }else {
                nextFrame();
            }
        },

        nextFrame = function() {
            gotoFrame(_currentFrame < _imageCount ? _currentFrame + 1 : 1);
        },

        previousAnimationFrame = function() {
            if (_animSpeed != 0) {
                var currentTime = new Date().getTime(),
                    deltaTime = currentTime - _animTime,
                    imageInc = ((deltaTime / _animSpeed) + 0.5) >> 0,
                    newImgNum = _currentFrame + (imageInc < 6 ? imageInc : 5);

                if (_animSpeed <= deltaTime + 2) { //add about a 2ms margin for timer variances
                    _animTime = currentTime;
                    _currentFrame = newImgNum > 0 ? newImgNum : newImgNum + _imageCount;
                    gotoFrame(_currentFrame);
                }
            }else {
                previousFrame();
            }
        },

        previousFrame = function() {
            gotoFrame(_currentFrame > 1 ? _currentFrame - 1 : _imageCount);
        },

        progress = function(val) {
            var newImgNum = (val * (_imageCount - 1)) >> 0,
                imageNum2 = (newImgNum === (_imageCount - 1)) ? newImgNum : newImgNum + 1,
                frame = _frames[newImgNum],
                stackrFrame = _frames[imageNum2],
                canvasWidth = _canvas.width,
                canvasHeight = _canvas.height,
                subProg = (val * (_imageCount - 1)) - newImgNum;

            if (_currentFrame !== newImgNum + 1 || _progressFlag === false) {
                _progressFlag = true;
                _currentFrame = newImgNum + 1;
                _canvasCtx.drawImage(_sprites[frame.spriteIndex], 
                                     frame.x, frame.y, 
                                     _frameWidth, _frameHeight, 
                                     0, 0, canvasWidth, canvasHeight);
                _stackrCanvasCtx.drawImage(_sprites[stackrFrame.spriteIndex], 
                                           stackrFrame.x, stackrFrame.y, 
                                           _frameWidth, _frameHeight, 
                                           0, 0, canvasWidth, canvasHeight);
            }
            _stackrCanvas.style.opacity = subProg;
        },

        //Animation speed accessors are tied to animationFrame methods, you should not
        //  be using these.
        setAnimationSpeed = function(val) {
            _animSpeed = val;
            _animTime = new Date().getTime();
        },

        setFrame = function(newFrame) {
            gotoFrame(newFrame);
        },

        setProgress = function(val) {
            progress(val);
        },

        setSize = function(width, height) {
            _canvas.style.width = _stackrCanvas.style.width = width + "px";
            _canvas.style.height = _stackrCanvas.style.height = height + "px";
            gotoFrame(_currentFrame);
        },

        //Private Methods
        bufferCanvas = function(img, isImgArray) {
            var canvasArray = [];
            if (isImgArray) {
                for (var i = 0; i < img.length; i++) {
                    var buffCanvas = document.createElement("canvas"),
                        buffCtx = buffCanvas.getContext("2d"),
                        w = img[i].width,
                        h = img[i].height;

                    buffCanvas.width = w;
                    buffCanvas.height = h;
                    buffCtx.drawImage(img[i], 0, 0);
                    canvasArray.push(buffCanvas);
                }
            }else {
                var buffCanvas = document.createElement("canvas"),
                    buffCtx = buffCanvas.getContext("2d"),
                    w = img.width,
                    h = img.height;

                buffCanvas.width = w;
                buffCanvas.height = h;
                buffCtx.drawImage(img, 0, 0);
                canvasArray.push(buffCanvas);
            }
            return canvasArray;
        };

    return {
        getAnimationSpeed: getAnimationSpeed,
        getCanvas: getCanvas,
        getContext: getContext,
        getCurrentFrame: getCurrentFrame,
        getElement: getElement,
        getFrame: getFrame,
        getId: getId,
        getProgress: getProgress,
        gotoFrame: gotoFrame,
        loadSpriteSheet: loadSpriteSheet,
        nextAnimationFrame: nextAnimationFrame,
        nextFrame: nextFrame,
        previousFrame: previousFrame,
        previousAnimationFrame: previousAnimationFrame,
        progress: progress,
        setAnimationSpeed: setAnimationSpeed,
        setFrame: setFrame,
        setProgress: setProgress,
        setSize: setSize
    };
};

MEUtil.raf = (function() {
    var requestAnimationFrame = 
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };

    return function(callback) {
        requestAnimationFrame(callback);
    };
})();

MEUtil.setPrefixedEvent = function(el, evtType, callback) {
    var prefixes = MEUtil.PREFIXES;
    for (var i = 0, l = prefixes.length; i < l; i++) {
        el.addEventListener(prefixes[i] + evtType, callback, false);
    }
    el.addEventListener(evtType.toLowerCase(), callback, false);
};

MEUtil.removePrefixedEvent = function(el, evtType, callback) {
    var prefixes = MEUtil.PREFIXES;
    for (var i = 0, l = prefixes.length; i < l; i++) {
        el.removeEventListener(prefixes[i] + evtType, callback, false);
    }
    el.removeEventListener(evtType.toLowerCase(), callback, false);
};

MEUtil.getPrefixedProp = function(prop) {
    if (!MEUtil.vendorPrefix[prop]) {
        var prefixes = MEUtil.PREFIXES,
            el = document.createElement("div"),
            lowerCaseProp = prop.charAt(0).toLowerCase() + prop.slice(1),
            upperCaseProp = prop.charAt(0).toUpperCase() + prop.slice(1),
            prefixedProp = "",
            propFound = false;

        for (var i = 0, l = prefixes.length; i < l; i++) {
            prefixedProp = prefixes[i] + upperCaseProp;
            if (prefixedProp in el.style) {
                MEUtil.vendorPrefix[prop] = prefixedProp;
                propFound = true;
                break;
            }
        }

        if (!propFound && lowerCaseProp in el.style) {
            MEUtil.vendorPrefix[prop] = lowerCaseProp;
        }else {
            return lowerCaseProp;
        }
    }

    return MEUtil.vendorPrefix[prop];
};

MEUtil.setRuleProperty = function(selector, prop, val) {
    var sheets = document.styleSheets,
        rules = null,
        ii = 0, l = 0;

    for (var i = sheets.length - 1; i > -1; i--) {
        rules = sheets[i].cssRules;
        l = rules.length;
        for (ii = 0; ii < l; ii++) {
            if (rules[ii].selectorText === selector) {
                rules[ii].style.setProperty(prop, val, null);
                i = -1;
                break;
            }
        }
    }
};

/*----------- Class definition for Olympus Event ----------*/
/*This custom event object is incredibly basic because
that is all it needs to be.  Normal Javascript Events 
have a lot of unnecessary information that does not apply
to our needs.*/
function OlyEvent(type_, target_) {
    return {
        target: target_,
        timeStamp: Date.now(),
        type: type_
    };
}

/*----------- Class definition for Olympus Splash ----------*/
function OlySplash(callback, assets) {
    if (!(this instanceof OlySplash)) {
        return new OlySplash(callback, assets);
    }

    //Tutorial title in canvas.
    (function(){
        if(document.getElementById("tutorialTitle")) {
            var yPad = 4;
            var fontSize = 22;
            var can = document.getElementById("tutorialTitle");
            var titleText = can.innerHTML;
            var lines = titleText.match(/<br>/g) ? titleText.match(/<br>/g).length + 1 : 1;
            var titleTextArr = titleText.split("<br>");
            can.style.width = "100%";
            can.style.height = fontSize*lines+yPad+"px";
            can.style.margin = "13px auto";
            can.style.display = "block";
            var ctx = MEUtil.upscaleCanvas("tutorialTitle").getContext("2d");
            var gradient = ctx.createLinearGradient(0, 0, 0, can.height);

            for(var i = 0; i < lines; i++){
                gradient.addColorStop(i/MEUtil.PIXEL_RATIO/lines, "#ffffff");
                gradient.addColorStop((0.5 + i)/MEUtil.PIXEL_RATIO/lines, "#fdeb7a");
                gradient.addColorStop((1 + i)/MEUtil.PIXEL_RATIO/lines,   "#faad18");
            }

            ctx.font = "bold "+fontSize+"px Arial";
            ctx.fillStyle = gradient;
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";

            for(var i = 0; i < titleTextArr.length; i++){
                ctx.fillText(titleTextArr[i].trim(), can.width/(2*MEUtil.PIXEL_RATIO),
                    can.height/(2*MEUtil.PIXEL_RATIO) + fontSize*i - fontSize/2*(titleTextArr.length-1));
            }
        }
    })();

    var container = document.getElementById("splashContainer"),
        animationContainer = document.createElement("div"),
        loading = {
            border: document.createElement("div"),
            bar: document.createElement("div"),
            text: document.createElement("div"),
            progress: 0
        },
        logoW = document.querySelector(".mainscene").clientWidth,
        logoH = 100,
        logo = {
            can: MEUtil.createCanvas(logoW, logoH),
            img: new Image(),
            imgW: 300,
            imgH: 63,
            segs: new Array(9)
        },
        totalAssets = 0;

    init();

    return {
        fadeOut: fadeSplash
    };

    function init() {
        animationContainer.className = "splashAnimationContainer";
        loading.border.className = "splashLoadingBarBorder";
        loading.bar.className = "splashLoadingBar";
        loading.text.className = "splashLoadingText";
        logo.img.className = "splashLogoImage";

        logo.img.style.left = ((logoW - logo.imgW) * 0.5) + "px";
        loading.text.innerHTML = "Loaded: 0%";

        loading.border.appendChild(loading.bar);
        MEUtil.appendChildren(animationContainer,
            [logo.can, logo.img, loading.border, loading.text]);
        container.appendChild(animationContainer);

        logo.img.onload = startAnimation;
        logo.img.src = "./reflectionangles_files/tutorial-logo.png";
    }

    function startAnimation() {
        var ctx = logo.can.getContext("2d");

        ctx.fillStyle = "#003366";

        for (var i = 0, l = logo.segs.length; i < l; i++) {
            logo.segs[i] = {
                progress: 0
            };
            TweenLite.to(logo.segs[i], 0.25, {progress: 1, delay: 0.016 + i * 0.05,
                ease: Cubic.easeOut});
        }
        setTimeout(showOlympusLogo, 400);
        MEUtil.raf(updateLogoCanvas);
    }

    function updateLogoCanvas() {
        var ctx = logo.can.getContext("2d"),
            segs = logo.segs,
            numSegs = segs.length,
            h = 0,
            rW = 0,
            w = Math.round(logoW / numSegs);

        if (segs[numSegs - 1].progress < 1) {
            MEUtil.raf(updateLogoCanvas);
        }

        ctx.beginPath();
        for (var i = 0; i < numSegs; i++) {
            h = segs[i].progress * logoH;
            rW = i < numSegs - 1 ? w : logoW - (w * (numSegs - 1));
            ctx.rect(w * i, logoH - h, rW, h);
        }
        ctx.fill();
    }

    function showOlympusLogo() {
        var logoTween = (function(){
            var percent = 0,
                halfH = logo.imgH / 2;
            
            return {
                setVisible: function(p) {
                    var c = Math.round(p * halfH);
                    percent = p;
                    logo.img.style.opacity = p;
                    logo.img.style.clip = "rect(" + (halfH - c) + "px, " + logo.imgW + "px, " +
                        (halfH + c) + "px, 0)";
                },
                getVisible: function() {
                    return percent;
                }
            };
        })();

        TweenLite.to(logoTween, 0.5, {setVisible: 1, ease: Cubic.easeInOut,
            onComplete: displayLoader});
    }

    function displayLoader() {
        TweenLite.to([loading.border, loading.bar, loading.text], 0.25, {css:{opacity: 1},
            onComplete: preloadAssets});
    }

    function preloadAssets() {
        var allAssets = [];

        // Compile all assets to load.
        (function() {
            var pathElements = document.querySelectorAll("[data-src]");
            for (var i = 0, l = pathElements.length; i < l; i++) {
                allAssets.push(pathElements[i]);
            }
            if (assets) {
                l = assets.length
                for (i = 0; i < l; i++) {
                    allAssets.push(assets[i]);
                }
            }
        })();

        // Begin the loading bar animation loop.
        MEUtil.raf(updateLoadingBar);

        // If there are assets to load, load them.  Otherwise, set load bar to max.
        if (allAssets.length) {
            MEUtil.loadFromDataSrc(allAssets, {
                onProgress: function(e) {
                    loading.progress = e.progress;
                }
            });
        }else { 
            loading.progress = 1;
        }
    }

    function updateLoadingBar() {
        var prog = Math.round(loading.progress * 100) + "%";

        loading.bar.style.width = prog;
        loading.text.innerHTML = "Loaded: " + prog;

        if (loading.progress < 1) {
            MEUtil.raf(updateLoadingBar);
        }else {
            MEUtil.raf(function() {
                if (callback) {
                    callback();
                }
            });
        }
    }

    function fadeSplash() {
        TweenLite.to(container, 0.5, {css:{autoAlpha: 0}, delay: 0.5});        
    }
}

/*----------- Class definition for Olympus Component ----------*/
function OlyComponent(id) {
    if (id) {
        this._container = typeof id === "string" ?
            document.getElementById(id) : id;
        this._isEnabled = true;
        
        if (MEUtil.IS_TOUCH_DEVICE) {
            this._container.addEventListener("touchstart", function(e) {
                /*Prevent any default actions from the browser when a user
                interacts with the component*/
                e.preventDefault();
            }, false);
        }
    }else {
        console.error(id + " is not a valid id string or HTMLElement.");
    }
}

OlyComponent.prototype.addEventListener = function(type, listener) {
    type = "on" + type;
    var handlers = this[type];
    if (handlers) {
        if (typeof handlers === "function") {
            this[type] = [handlers, listener];
        }else {
            this[type].push(listener);
        }
    }else {
        this[type] = [listener];
    }
};

OlyComponent.prototype.getElement = function() {
    return this._container;
};

OlyComponent.prototype.getEnabled = function() {
    return this._isEnabled;
};

OlyComponent.prototype.setEnabled = function(isEnabled) {
    if (isEnabled != this._isEnabled) {
        if (isEnabled) {
            this._enable();
        }else {
            this._disable();
        }
    }
};

OlyComponent.prototype._enable = function() {
    var style = this._container.style;
    var funcWrapper = (function(that) {
        function transEndListener(event) {
            var style = event.currentTarget.style;
            MEUtil.removePrefixedEvent(this._container, "TransitionEnd", funcWrapper);
            style.cursor = "pointer";
            this._isEnabled = true;
        }
        return transEndListener.bind(that);
    })(this);
    MEUtil.setPrefixedEvent(this._container, "TransitionEnd", funcWrapper);
    style.opacity = "1";
};

OlyComponent.prototype._disable = function() {
    var style = this._container.style;
    this._isEnabled = false;
    style.cursor = "default";
    style.opacity = 0.5;
};

OlyComponent.prototype._dispatchEvent = function(type) {
    var handlers = this["on" + type];
    if (typeof handlers === "function") {
        handlers.call(this, new OlyEvent(type, this));
    }else if (handlers) {
        for (var i = 0, l = handlers.length; i < l; i++) {
            handlers[i].call(this, new OlyEvent(type, this));
        }
    }
};

/*----------- Class definition for Olympus Slider ----------*/
function OlySlider(id, options) {
    //Kills the need for 'new' operator.
    if (!(this instanceof arguments.callee)) {
        return new arguments.callee(id, options);
    }

    OlyComponent.call(this, id);

    var that = this;

    options = options || {};

    /*---------- Public Properties ----------*/
    this.hasChanged = false;
    this.onchange = null;
    this.ontouchstart = null;
    this.ontouchend = null;
    this.tickCount = options.tickCount != undefined ? options.tickCount : 0;

    /*---------- Private Properties (DO NOT USE) ----------*/
    this._config = {
        CSS: {
            container: "slider",
            handle: {
                border: {
                    node: "sliderHandleBorder"
                },
                fill: {
                    node: "sliderHandleFill",
                    down: "sliderHandleFillDown",
                    hover: "sliderHandleFillHover",
                    up: "sliderHandleFillUp"
                }
            },
            track: {
                node: "sliderTrack",
                thresh: "sliderTrackThresh"
            },
            vertical: "verticalSlider"
        }
    };
    this._bounds = {
        left: 0,
        height: 0,
        width: 0
    };
    this._eventFlags = {
        start: false,
        move: false,
        end: false
    };
    this._eventListener = MEUtil.IS_TOUCH_DEVICE ?
        this._touchHandler.bind(this) : this._mouseHandler.bind(this);
    this._handle = {
        border: document.createElement("div"),
        fill: document.createElement("div"),
        height: 0,
        innerHeight: 0,
        innerWidth: 0,
        spectrumCan: null,
        position: 0,
        width: 0,
        x: 0
    };
    this._isActive = false;
    this._isSpectrum = options.isSpectrumSlider;
    this._orient = (function() {
        if (!options.orientation || options.orientation.toLowerCase() == "horizontal") {
            return "width";
        }
        return "height";
    })();
    this._spectrum = {
        index: 0,
        max: 0,
        min: 0
    };
    this._thresh = {
        updating: false,
        element: document.createElement("div"),
        min: 0,
        max: 1
    },
    this._track = {
        height: 0,
        spectrumCan: null,
        node: document.createElement("div"),
        width: 0
    };
    this._tween = false;

    /*---------- Init OlySlider ----------*/
    // Style
    this._attachClasses();

    // Attach nodes
    this._track.node.appendChild(this._thresh.element);
    this._handle.border.appendChild(this._handle.fill);
    MEUtil.appendChildren(this._container, [this._track.node, this._handle.border]);

    // Initialize
    this._handle.height = this._handle.border.offsetHeight;
    this._handle.width = this._handle.border.offsetWidth;
    this._handle.innerHeight = this._handle.fill.offsetHeight;
    this._handle.innerWidth = this._handle.fill.offsetWidth;
    this._bounds.height = this._container.clientHeight - this._handle.height;
    this._bounds.width = this._container.clientWidth - this._handle.width;
    this._track.width = this._thresh.element.offsetWidth;
    this._track.height = this._thresh.element.offsetHeight;

    // Check if spectrum slider
    if (this._isSpectrum) {
        this._initSpectrum(options);
    }

    this._container.addEventListener(MEUtil.IS_TOUCH_DEVICE ?
        "touchstart" : "mousedown", this._eventListener, false);

    this.setPosition(options.position != undefined ? options.position : 0);
}

MEUtil.makeSuper(OlySlider, OlyComponent);

OlySlider.prototype.Orientations = {
    HORIZONTAL: "horizontal",
    VERTICAL: "vertical"
};

OlySlider.prototype.getMinThreshold = function() {
    return this._thresh.max;
};

OlySlider.prototype.getMaxThreshold = function() {
    return this._thresh.min;
};

OlySlider.prototype.getPosition = function(min, max) {
    var pos = this._handle.position;
    if (arguments.length) {
        if (max === undefined) {
            return pos * min;
        }
        return min + pos * (max - min);
    }
    return pos;
};

OlySlider.prototype.getSpectrumIndex = function(percent) {
    var min = this._spectrum.min,
        max = this._spectrum.max,
        p = percent == undefined ? this._handle.position : percent;
        
    return Math.round(min + ((max - min) * p));
};

OlySlider.prototype.getSpectrumRGB = function(percent) {
    var index = this.getSpectrumIndex(percent),
        c = [];

    if (index <= 420) {
        c[0] = 100 + (Math.sin(((index - 380) / 40) * Math.PI) * 31);
        c[2] = 100 + (((index - 380) / 40) * 155);
    }else if (index <= 440) {
        c[0] = 100 - (((index - 420) / 20) * 100);
        c[1] = (index - 440) / 50;
        c[2] = 255;
    }else if (index <= 490) {
        c[1] = ((index - 440) / 50) * 255;
        c[2] = 255;
    }else if (index <= 510) {
        c[1] = 255;
        c[2] = (1 - ((index - 490) / 20)) * 255;
    }else if (index <= 580) {
        c[0] = ((index - 510) / 70) * 255;
        c[1] = 255;
    }else if (index <= 645) {
        c[0] = 255;
        c[1] = (1 - ((index - 580) / 65)) * 255;
    }else if (index <= 700) {
        c[0] = 255;
    }else {
        c[0] = 255 - (((index - 700) / 80) * 155);
    }

    c[0] = (c[0] + 0.5) >> 0;
    c[1] = (c[1] + 0.5) >> 0;
    c[2] = (c[2] + 0.5) >> 0;

    return c;
};

OlySlider.prototype.getSpectrumHex = function(percent) {
    var rgb = this.getSpectrumRGB(percent),
        hexArr = [];
        hex = "#",
        i;

    for (i = 0; i < 10; i++) {
        hexArr[i] = i;
    }
    hexArr = hexArr.concat(["a", "b", "c", "d", "e", "f"]);

    for (var i = 0; i < rgb.length; i++) {
        hex += hexArr[Math.floor(rgb[i] / 16)] + "" + hexArr[(rgb[i] % 16)];
    }

    return hex;
};

OlySlider.prototype.setMinThreshold = function(min) {
    var thresh = this._thresh;
    if (!isNaN(min)) {
        if (min < 0) { min = 0; }

        if (min !== thresh.min && min < thresh.max) {
            thresh.min = min;
            this._updateThreshold();
        }else {
            console.error("Cannot set the min threshold to be less than the max.");
        }
    }else {
        console.error("The min must be a valid number.");
    }
};

OlySlider.prototype.setMaxThreshold = function(max) {
    var thresh = this._thresh;
    if (!isNaN(max)) {
        if (max > 1) { max = 1; }

        if (max !== thresh.max && max > thresh.min) {
            thresh.max = max;
            this._updateThreshold();
        }else {
            console.error("Cannot set the max threshold to be greater than the min.");
        }
    }else {
        console.error("The max must be a valid number.");
    }
};

OlySlider.prototype.setPosition = function(newPos, shouldTween) {
    if (typeof newPos === "number") {
        newPos = newPos < 0 ? 0 : newPos > 1 ? 1 : newPos;
        if (shouldTween) {
            this._setTween(true);
        }
        this._prepareHandleTranslation(newPos);
    }else {
        console.error(typeof newPos + "(" + newPos + ") is not a valid argument for " +
            this._container.id + ".setPosition()");
    }
};

OlySlider.prototype.setSpectrumRange = function(min, max) {
    this._setSpectrumRange(min, max);
    this._updateSpectrumTrack();
    this._updateSpectrumHandle();
};

/* Private Properties */
OlySlider.prototype._pointerOffset = function() {
        return MEUtil.IS_TOUCH_DEVICE ? -5 : -this._handle[this._orient] / 2;
};

/* Private Methods */
OlySlider.prototype._attachClasses = function() {
    var css = this._config.CSS;
    $(this._container).addClass(css.container);
    if (this._orient == "height") {
        $(this._container).addClass(css.vertical);
    }
    $(this._track.node).addClass(css.track.node + " webkitMaskOverflowFix");
    $(this._thresh.element).addClass(css.track.thresh);
    $(this._handle.border).addClass(css.handle.border.node);
    $(this._handle.fill).addClass(css.handle.fill.node + " " + css.handle.fill.up);
};

OlySlider.prototype._constrainPosition = function(pos) {
    var thresh = this._thresh;

    // Constrain pos to threshold
    pos = pos < thresh.min ? thresh.min :
        pos > thresh.max ? thresh.max : pos;

    // Constrain pos to nearest tick
    if (this.tickCount > 1) {
        var n = this.tickCount - 1;
        pos = ((0.5 + (pos * n)) | 0) / n;
    }

    return pos;
};

OlySlider.prototype._containerPt = function() {
    if (this._orient == "height") {
        return MEUtil.getGlobalY(this._container) - this._pointerOffset();
    }else {
        return MEUtil.getGlobalX(this._container) - this._pointerOffset();
    }
};

OlySlider.prototype._containerX = function() {
    return MEUtil.getGlobalX(this._container) - this._pointerOffset();
};

OlySlider.prototype._containerY = function() {
    return MEUtil.getGlobalY(this._container) - this._pointerOffset();
};

OlySlider.prototype._createSpectrumCanvii = function() {
    this._handle.spectrumCan = MEUtil.createCanvas(
        this._handle.innerWidth, this._handle.innerHeight);
    this._track.spectrumCan = MEUtil.createCanvas(this._track.width, this._track.height);

    this._handle.spectrumCan.className = "sliderHandleFill sliderHandleSpectrumCanvas";
    this._track.spectrumCan.className = "sliderTrackThresh";

    this._handle.border.appendChild(this._handle.spectrumCan);
    this._track.node.appendChild(this._track.spectrumCan);
};

OlySlider.prototype._displayLoop = function() {
    if (this._isActive) { MEUtil.raf(this._displayLoop.bind(this)); }

    var flags = this._eventFlags;

    if (flags.start) {
        flags.start = false;
        this._setHandleStyleDown();
    }

    if (flags.move) {
        flags.move = false;
        this._moveHandle();
    }

    if (flags.end) {
        flags.end = false;
        this._setHandleStyleUp();
    }

    if (this._isSpectrum) {
        this._updateSpectrumHandle();
    }
};

OlySlider.prototype._getLocal = function(touchPt) {
    return touchPt - this._containerPt();
};

OlySlider.prototype._getLocalX = function(touchPt) {
    return touchPt - this._containerX();
};

OlySlider.prototype._getLocalY = function(touchPt) {
    return touchPt - this._containerY();
};

OlySlider.prototype._getThreshMinPercent = function(val) {
    return val / (this._track[this._orient] - this._handle[this._orient]);
};

OlySlider.prototype._getThreshMaxPercent = function(threshMax) {
    var iw = this._handle[this._orient];
    return (threshMax - iw) / (this._track[this._orient] - iw);
};

OlySlider.prototype._getThreshMinX = function(min) {
    return min * this._track[this._orient];
};

OlySlider.prototype._getThreshMaxX = function(max) {
    return max * this._track[this._orient];
};

OlySlider.prototype._handleTouchStart = function(touchPt) {
    if (!this._tween) {
        this._setTween(true);
    }
    this._isActive = true;
    this._eventFlags.start = true;
    this._setPosition(this._pxToPos(this._getLocal(touchPt)));

    MEUtil.raf(this._displayLoop.bind(this));

    this._dispatchEvent("touchstart");
};

OlySlider.prototype._handleTouchMove = function(touchPt) {
    if (this._tween && this.tickCount < 2) {
        this._setTween(false);
    }
    this._setPosition(this._pxToPos(this._getLocal(touchPt)));
};

OlySlider.prototype._handleTouchEnd = function() {
    this._eventFlags.end = true;
    this._isActive = false;
    this._dispatchEvent("touchend");
};

OlySlider.prototype._initSpectrum = function(options) {
    var min = 400, max = 700;

    if (options.spectrumRange) {
        min = options.spectrumRange.min ? options.spectrumRange.min : min;
        max = options.spectrumRange.max ? options.spectrumRange.max : max;
    }

    this._createSpectrumCanvii();
    this._setSpectrumRange(min, max);
    this._updateSpectrumTrack();
    this._updateSpectrumHandle();
};

OlySlider.prototype._moveHandle = function() {
    if (this._orient == "height") {
        this._handle.border.style[MEUtil.getPrefixedProp("Transform")] = 
            "translateY(" + this._handle.y + "px)";
    }else {
        this._handle.border.style[MEUtil.getPrefixedProp("Transform")] = 
            "translateX(" + this._handle.x + "px)";
    }
};

OlySlider.prototype._posToPx = function(dec) {
    return (0.5 + dec * this._bounds[this._orient]) | 0;
};

OlySlider.prototype._pxToPos = function(px) {
    return px / this._bounds[this._orient];
};

OlySlider.prototype._prepareHandleTranslation = function(pos) {
    this._handle.position = pos;
    if (this._orient == "height") {
        this._handle.y = this._posToPx(pos);
    }else {
        this._handle.x = this._posToPx(pos);
    }

    this._eventFlags.move = true;
    this.hasChanged = true;

    if (!this._isActive) {
        MEUtil.raf(this._displayLoop.bind(this));
    }

    this._dispatchEvent("change");
};

OlySlider.prototype._setHandleStyleDown = function() {
    var handleCSS = this._config.CSS.handle;
    $(this._handle.border).addClass(handleCSS.border.down);
    $(this._handle.fill).addClass(handleCSS.fill.down);
};

OlySlider.prototype._setHandleStyleUp = function() {
    var handleCSS = this._config.CSS.handle;
    $(this._handle.border).removeClass(handleCSS.border.down);
    $(this._handle.fill).removeClass(handleCSS.fill.down);
};

OlySlider.prototype._setPosition = function(newPos, shouldTween) {
    newPos = this._constrainPosition(newPos);

    if (newPos != this._handle.position) {
        this.setPosition(newPos);
    }
};

OlySlider.prototype._setSpectrumRange = function(min, max) {
    this._spectrum.min = min;
    this._spectrum.max = max;
};

OlySlider.prototype._setTween = function(shouldTween) {
    if (this._tween !== shouldTween) {        
        $(this._handle.border)[shouldTween ?
            "addClass" : "removeClass"]("sliderHandleTween");
        this._tween = shouldTween;
    }
};

OlySlider.prototype._mouseHandler = function(event) {
    event.stopPropagation();
    event.preventDefault();

    var clientPt = this._orient == "height" ? "clientY" : "clientX";

    switch (event.type) {
    case "mousemove":
        this._handleTouchMove(event[clientPt]);
        break;
    case "mousedown":
        if (event.which === 1 && this._isEnabled) {
            this._container.removeEventListener("mousedown",
                this._eventListener);
            MEUtil.on(document, "mousemove mouseup mouseout",
                this._eventListener);

            this._handleTouchStart(event[clientPt]);
        }
        break;
    case "mouseout": // Fall-through (if on body)
        var style = document.defaultView.getComputedStyle(document.querySelector("body"),
            "").getPropertyValue("outline-style");
        if (style === "dashed") {
            break;
        }
    case "mouseup":
        MEUtil.off(document, "mousemove mouseup mouseout", this._eventListener);
        this._container.addEventListener("mousedown",
            this._eventListener);

        this._handleTouchEnd();
    }
};

OlySlider.prototype._touchHandler = function(event) {
    var touchPt = this._orient == "height" ? "pageY" : "pageX";
    switch (event.type) {
    case "touchmove":        
        var touches = event.changedTouches;
        for (var i = 0, l = touches.length; i < l; i++) {
            if (this._touch.identifier === touches[i].identifier) {
                this._handleTouchMove(touches[i][touchPt]);
                break;
            }
        }
        break;
    case "touchstart":
        if (this._isEnabled) {
            this._container.removeEventListener("touchstart",
                this._eventListener);
            MEUtil.on(document, "touchmove touchend touchcancel",
                this._eventListener);

            var touch = event.changedTouches[0];
            this._touch = touch;
            this._handleTouchStart(touch[touchPt]);
        }
        break;
    case "touchcancel": //Fall-through
    case "touchend":
        var touches = event.changedTouches;
        for (var i = 0, l = touches.length; i < l; i++) {
            if (this._touch.identifier === touches[i].identifier) {
                MEUtil.off(document, "touchmove touchend touchcancel",
                    this._eventListener);
                this._container.addEventListener("touchstart",
                    this._eventListener);

                this._handleTouchEnd();
                break;
            }
        }
    }
};

OlySlider.prototype._updateSpectrumHandle = function() {
    var ctx = this._handle.spectrumCan.getContext("2d"),
        pix = this.getSpectrumRGB(this._handle.position);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this._handle.innerWidth, this._handle.innerHeight);
    ctx.fillStyle = "rgb(" + pix.join(",") + ")";
    ctx.fillRect(1, 1, this._handle.innerWidth - 2, this._handle.innerHeight - 2);   
};

OlySlider.prototype._updateSpectrumTrack = function() {
    var ctx = this._track.spectrumCan.getContext("2d"),
        pix = [],
        w = this._track.width,
        h = this._track.height;

    ctx.clearRect(0, 0, w, h);

    if (this._orient == "height") {
        for (var i = 0; i < h; i++) {
            pix = this.getSpectrumRGB(i / h);
            ctx.fillStyle = "rgb(" + pix.join(",") + ")";
            ctx.fillRect(0, i, w, 1);
        }
    }else {
        for (var i = 0; i < w; i++) {
            pix = this.getSpectrumRGB(i / w);
            ctx.fillStyle = "rgb(" + pix.join(",") + ")";
            ctx.fillRect(i, 0, 1, h);
        }
    }
};

OlySlider.prototype._updateThreshold = function() {
    if (!this._thresh.updating) {
        this._thresh.updating = true;

        var update = function() {
            var thresh = this._thresh;

            if (this._orient == "height") {
                /** OLD CODE
                thresh.element.style.clip = "rect(" + Math.round(this._getThreshMaxX(thresh.max)) +
                    "px 0 " + Math.round(this._getThreshMinX(thresh.min)) + "px "
                    + thresh.element.clientWidth + "px)";
                */

                /* modified to work correctly */
                thresh.element.style.clip = "rect(" + Math.round(this._getThreshMinX(thresh.min)) +
                    "px " + thresh.element.clientWidth + "px " + Math.round(this._getThreshMaxX(thresh.max)) + "px "
                    + "0px)";
            }else {
                thresh.element.style.clip = "rect(0 " + Math.round(this._getThreshMaxX(thresh.max)) +
                    "px " + thresh.element.clientHeight + "px " +
                    Math.round(this._getThreshMinX(thresh.min)) + "px)";
            }
            thresh.updating = false;

            this._setPosition(this.getPosition());
        };

        MEUtil.raf(update.bind(this));
    }  
};

/* ---------- Olympus Button ------------ */

function OlyButton(id, isToggle) {
    //Kills the need for 'new' operator.
    if (!(this instanceof arguments.callee)) {
        return new arguments.callee(id, isToggle);
    }

    OlyComponent.call(this, id);

    /*---------- Public Properties ----------*/
    this.text = document.createElement("div");
    this.toggleText = null;
    this.ontouch = null;
    this.ontouchstart = null;

    /*---------- Private Properties (DO NOT USE) ----------*/
    this._face = document.createElement("div");
    this._isEnabled = true;
    this._isToggle = isToggle;
    this._isToggledOn = false;
    this._config = {
        CSS: {
            bg: "button",
            face: "buttonFace",
            down: "buttonFaceDown",
            text: "buttonText",
            crater: "buttonCrater",
            light: "buttonLight"
        }
    };

    /*---------- Private Methods (DO NOT USE) ----------*/
    this._eventListener = MEUtil.IS_TOUCH_DEVICE ?
        this._touchHandler.bind(this) : this._mouseHandler.bind(this);

    /*---------- Init OlyButton ----------*/
    var css = this._config.CSS;        

    $(this._container).addClass(css.bg);
    $(this._face).addClass(css.face);

    this.text.className = css.text;
    this.text.innerHTML = this._container.innerHTML;

    this._container.innerHTML = "";

    if (isToggle) {
        var crater = document.createElement("div"),
            w = this._container.clientWidth,
            h = this._container.clientHeight;

        this.text.style.left = "19px";
        this.text.style.width = (w - 19) + "px";

        crater.className = css.crater;
        crater.style.left = "5px";
        crater.style.top = ((h - 14) / 2) + "px";

        this._light = document.createElement("div");
        this._light.className = css.light;

        crater.appendChild(this._light);
        this._face.appendChild(crater);
    }

    this._face.appendChild(this.text);
    this._container.appendChild(this._face);

    // Attach initial handlers
    this._container.addEventListener(MEUtil.IS_TOUCH_DEVICE ?
        "touchstart" : "mousedown", this._eventListener);
}

MEUtil.makeSuper(OlyButton, OlyComponent);

OlyButton.prototype.getToggleState = function() {
    return this._isToggledOn;
};

OlyButton.prototype.setToggleState = function(isToggledOn, shouldCallEvent) {
    this._setToggle(isToggledOn);

    if (shouldCallEvent && this.ontouch) {

        MEUtil.raf(this.ontouch.bind(this)); 
    }
};

/*---------- Private Properties (DO NOT USE) ----------*/
OlyButton.prototype._mouseHandler = function(event) {
    event.stopPropagation();
    event.preventDefault();

    var container = this._container;

    switch (event.type) {
    case "mousedown":
        if (event.which === 1 && this._isEnabled) {

            container.removeEventListener("mousedown",
                this._eventListener);
            MEUtil.on(container, "mouseup mouseout", this._eventListener);

            this._setStateDown();
        }
        break;
    case "mouseout":
    case "mouseup":
        MEUtil.off(container, "mouseup mouseout", this._eventListener);
        container.addEventListener("mousedown", this._eventListener);

        this._setStateUp();
    }
};

OlyButton.prototype._touchHandler = function(event) {
    var container = this._container;

    switch (event.type) {
    case "touchstart":
        if (this._isEnabled) {
            this._touch = event.changedTouches[0];

            container.removeEventListener("touchstart", this._eventListener);
            MEUtil.on(container, "touchend touchcancel", this._eventListener);

            this._setStateDown();
        }
        break;
    case "touchcancel": //Fall-through
    case "touchend":
        var touches = event.changedTouches;
        for (var i = 0, l = touches.length; i < l; i++) {
            if (this._touch.identifier === touches[i].identifier) {

                MEUtil.off(container, "touchend touchcancel",
                    this._eventListener);
                container.addEventListener("touchstart", this._eventListener);

                this._setStateUp();
                break;
            }
        }
    }
};

OlyButton.prototype._setToggle = function(newState) {
    this._isToggledOn = newState;
    this._light.style.opacity = newState ? 1 : 0;

    if (this.toggleText) {

        if (this.toggleText.length > 1) {
            this.text.innerHTML = this.toggleText[+newState];
        }else {
            this.text.innerHTML = this.toggleText[0];
        }
    }
};

OlyButton.prototype._setStateUp = function() {
    $(this._face).removeClass(this._config.CSS.down);

    if (this._isToggle) {
        this._setToggle(!this._isToggledOn);
    }
    this._dispatchEvent("touch");
};

OlyButton.prototype._setStateDown = function() {
    $(this._face).addClass(this._config.CSS.down);

    this._dispatchEvent("touchstart");
};

//Class Definition for Olympus Segment Button
function OlyRadioGroup(id, options) {
    //Kills the need for 'new' operator.
    if (!(this instanceof arguments.callee)) {
        return new arguments.callee(id, options);
    }

    OlyComponent.call(this, id);

    options = options || {};

    /*---------- Public Events ----------*/
    this.onchange = null;
    this.ontouchstart = null;

    /*---------- Private Properties ----------*/
    this._config = {
        CSS: {
            group: "radioGroup",
            button: "radioButton",
            horizontal: "horizontalRadioGroup",
            vertical: "verticalRadioGroup",
            selected: "radioButtonSelected"
        }
    };  
    this._borderRadius = options.borderRadius || "3px";
    this._btns = this._createButtonArray(this._container.children);
    this._eventListener = MEUtil.IS_TOUCH_DEVICE ?
        this._touchHandler.bind(this) : this._mouseHandler.bind(this);
    this._gutterSize = "1px";
    this._orientation = options.orientation &&
        options.orientation.toLowerCase() || "horizontal"; 
    this._selectedBtn = null;
    this._touches = null;

    /*---------- Initial Setup ----------*/
    this._container.classList.add("webkitMaskOverflowFix");
    this._addClass(this._container, "group");
    this._updateButtons();
    this._attachHandlers();
}

MEUtil.makeSuper(OlyRadioGroup, OlyComponent);

OlyRadioGroup.prototype.getButtonAtIndex = function(index) {
    return this._btns[index] || null;
};

OlyRadioGroup.prototype.getLength = function() {
    return this._btns.length;
};

OlyRadioGroup.prototype.getSelectedButton = function() {
    return this._selectedBtn || null;
};

OlyRadioGroup.prototype.getSelectedIndex = function() {
    return this._selectedBtn ? this._selectedBtn.olyRadioIndex : null;
};

OlyRadioGroup.prototype.setBorderRadius = function(newRad, backRad) {
    if (!isNaN(newRad)) {
        backRad = isNaN(backRad) ? newRad + 2 : backRad;

        var css = this._config.CSS;
        MEUtil.setRuleProperty("." + css.horizontal + ":first-child",
            "border-radius", newRad + "px 0 0 " + newRad + "px");
        MEUtil.setRuleProperty("." + css.horizontal + ":last-child",
            "border-radius", "0 " + newRad + "px " + newRad + "px 0");
        MEUtil.setRuleProperty("." + css.vertical + ":first-child",
            "border-radius", newRad + "px " + newRad + "px 0 0");
        MEUtil.setRuleProperty("." + css.vertical + ":last-child",
            "border-radius", "0 0 " + newRad + "px " + newRad + "px");
        MEUtil.setRuleProperty("." + css.group, "border-radius", backRad + "px");
    }
};

OlyRadioGroup.prototype.setButtonStyleProperty = function(propName, valArr) {
    var btns = this._btns,
        l = btns.length,
        btn = null;
    if (typeof propName === "string" && typeof valArr === "object" &&
            valArr.length && valArr.length === l) {
        for (var i = 0; i < l; i++) {
            btns[i].style.setProperty(propName, valArr[i], null);
        }
    }else {
        console.error("Style property: " + propName +
            " was unable to be added with the values: " + valArr);
    }
};

OlyRadioGroup.prototype.setButtonTitle = function(index, title) {
    var btns = this._btns;
    if (typeof index === "number" && title !== undefined) {
        if (index >= 0 && index < btns.length) {
            btns[parseInt(index, 10)].children[0].innerHTML = title;
        }
    }else {
        console.error(index + " and " + title +
            " are not valid arguments.  Pass a number and string.");
    }
};

OlyRadioGroup.prototype.setCSSConfiguration = function(cssConfig) {
    var rules = this._config.CSS;
    for (var prop in cssConfig) {
        if (rules[prop]) {
            rules[prop] = cssConfig[prop];
        }else {
            console.error(prop + " is not a configuration property.");
        }
    }
    this._updateButtons();
};

OlyRadioGroup.prototype.setCustomProperty = function(propName, valArr) {
    var btns = this._btns,
        l = btns.length;
    if (typeof propName === "string" && typeof valArr === "object" &&
            valArr.length && valArr.length === l) {
        for (var i = 0; i < l; i++) {
            btns[i][propName] = valArr[i];
        }
    }else {
        console.error("Custom property: " + propName +
            " was unable to be added with the values: " + valArr);
    }
};

OlyRadioGroup.prototype.setGutterSize = function(newSize) {
    newSize = typeof newSize === "number" ? newSize + "px" : newSize;

    MEUtil.setRuleProperty("." + this._config.CSS.vertical + ":nth-child(n+2)",
        "margin", newSize + " 0 0 0");
    MEUtil.setRuleProperty("." + this._config.CSS.horizontal + ":nth-child(n+2)",
        "margin", "0 0 0 " + newSize);
};

OlyRadioGroup.prototype.setOrientation = function(newOrient) {
    newOrient = newOrient.toLowerCase() || this._orientation;
    if (newOrient === "horizontal" || newOrient === "vertical") {
        if (this._orientation !== newOrient) {
            this._orientation = newOrient;
            this._updateButtons();
        }
    }
};

OlyRadioGroup.prototype.setSelectedIndex = function(newSelection, shouldDispatch) {
    if (isNaN(newSelection)) {
        this._unselect(this._selectedBtn);
        this._selectedBtn = null;
    }else {
        if (!this._selectedBtn || newSelection !== this._selectedBtn.olyRadioIndex) {
            var btns = this._btns,
                btn = btns[newSelection < -1 ? 0 :
                newSelection >= btns.length ? btns.length - 1 :
                parseInt(newSelection, 10)];

            shouldDispatch = shouldDispatch === undefined ? true : shouldDispatch;

            this._handleBtnPressed(btn);
            this._handleBtnReleased(btn, shouldDispatch);
        }
    }
};

OlyRadioGroup.prototype.setTitles = function(newTitles) {
    if (newTitles && newTitles.length) {
        var btns = this._btns;
        for (var i = 0, l = btns.length; i < l; i++) {
            btns[i].children[0].innerHTML = newTitles[i] ||
                btns[i].children[0].innerHTML;
        }
    }else {
        console.error("setTitles: " + newTitles +
            " - value passed was not a valid array.");
    }
};

OlyRadioGroup.prototype._addClass = function(element, className) {
    element.classList.add(this._config.CSS[className]);
};

OlyRadioGroup.prototype._addTouchListener = function(btn) {
    var eType = MEUtil.IS_TOUCH_DEVICE ? "touchstart" : "mousedown";

    btn.addEventListener(eType, this._eventListener);
};

OlyRadioGroup.prototype._addTouchEndListener = function(btn) {
    var onTypes = MEUtil.IS_TOUCH_DEVICE ?
            "touchend touchcancel" : "mouseup mouseout",
        offType = MEUtil.IS_TOUCH_DEVICE ? "touchstart" : "mousedown";

    btn.removeEventListener(offType, this._eventListener);

    MEUtil.on(btn, onTypes, this._eventListener);
};

OlyRadioGroup.prototype._attachHandlers = function() {
    var btns = this._btns,
        btn = null;

    for (var i = 0, l = btns.length; i < l; i++) {
        btn = btns[i];
        this._addTouchListener(btn);
    }
};

OlyRadioGroup.prototype._createButtonArray = function(srcArr) {
    var btns = [];
    for (var i = 0, l = srcArr.length; i < l; i++) {
        var btn = document.createElement("div");
        btn.appendChild(srcArr[i].cloneNode(true));
        if (srcArr[i].className) {
            btn.userClassName = srcArr[i].className;
        }
        btns[i] = btn;
    }
    return btns;
};

OlyRadioGroup.prototype._handleBtnPressed = function(btn, shouldDispatch) {
    this._addClass(btn, "selected");

    this._addTouchEndListener(btn);

    if (shouldDispatch) {
        this._dispatchEvent("touchstart");
    }
};

OlyRadioGroup.prototype._handleBtnReleased = function(btn, shouldDispatch) {
    var selectedBtn = this._selectedBtn;
    if (btn) {
        this._removeTouchEndListener(btn);

        if (this._touches && this._touches.length) {
            /*If there are multiple touches*/
            this._unselect(btn);
        }else {
            if (selectedBtn) {
                this._unselect(selectedBtn);
            }
            this._selectedBtn = btn;
            if (shouldDispatch) {
                this._dispatchEvent("change");
            }
        }
    }
};

OlyRadioGroup.prototype._mouseHandler = function(event) {
    event.preventDefault();
    var btn = event.currentTarget;
    switch (event.type) {
    case "mousedown":
        if (event.which === 1 && this._isEnabled) {
            this._handleBtnPressed(btn, true);
        }
        break;
    case "mouseout": //Fall-through
    case "mouseup":
        this._handleBtnReleased(btn, true);
    }
};

OlyRadioGroup.prototype._removeClass = function(element, className) {
    element.classList.remove(this._config.CSS[className]);
};

OlyRadioGroup.prototype._removeTouchEndListener = function(btn) {
    var eTypes = MEUtil.IS_TOUCH_DEVICE ?
        "touchend touchcancel" : "mouseup mouseout";

    MEUtil.off(btn, eTypes, this._eventListener);
};

OlyRadioGroup.prototype._touchHandler = function(event) {
    var btn = event.currentTarget;
    this._touches = event.touches;
    switch (event.type) {
    case "touchstart":
        if (this._isEnabled) {
            this._handleBtnPressed(btn, true);
        }
        break;
    case "touchcancel": //Fall-through
    case "touchend":
        this._handleBtnReleased(btn, true);
    }
};

OlyRadioGroup.prototype._unselect = function(btn) {
    if (btn) {
        this._removeClass(btn, "selected");
        this._addTouchListener(btn);
    }
};

OlyRadioGroup.prototype._updateButtons = function() {
    var btns = this._btns,
        btn = null;

    this._container.innerHTML = "";

    for (var i = 0, l = btns.length; i < l; i++) {
        btn = btns[i];
        btn.olyRadioIndex = i;
        btn.style.className = btn.userClassName || "";
        this._addClass(btn, "button");
        this._addClass(btn, this._orientation);
    }

    MEUtil.appendChildren(this._container, btns);
};

function TouchBox(box, options) {    
    //Kills the need for 'new' operator.
    if (!(this instanceof arguments.callee)){
        return new arguments.callee(box, options);
    }

    OlyComponent.call(this, box);

    options = options || {};

    this.height = this._container.clientHeight;
    this.width = this._container.clientWidth;

    this.hasChanged = false;
    this.onchange = null;
    this.ontouchstart = null;
    this.ontouchend = null;

    this._bounds = {
        left: 0,
        width: 0
    };
    this._eventFlags = {
        start: false,
        move: false,
        end: false
    };
    this._isActive = false;
    this._eventListener = MEUtil.IS_TOUCH_DEVICE ?
        this._touchHandler.bind(this) : this._mouseHandler.bind(this);
    this._point = {
        x: 0,
        y: 0
    };
    this._lastPoint = this.point;
    this._touch = null;

    this._container.addEventListener(MEUtil.IS_TOUCH_DEVICE ?
        "touchstart" : "mousedown", this._eventListener, false);
}

MEUtil.makeSuper(TouchBox, OlyComponent);

TouchBox.prototype.getPoint = function() {
    return this._point;
};

TouchBox.prototype.setPoint = function(x_, y_) {
    this._setPoint({x: x_, y: y_});
    this._dispatchEvent("change");
};

TouchBox.prototype._containerX = function() {
    return this._getGlobalPoint().x - this._pointerOffset;
};

TouchBox.prototype._getGlobalX = function() {
    var o = this._container;
    var x = 0;
    do { 
        x += o.offsetLeft;
    } while (o = o.offsetParent);

    return x;
};

TouchBox.prototype._getGlobalPoint = function() {
    var offset = $(this._container).offset();
    return {
        x: offset.left,
        y: offset.top
    };
};

TouchBox.prototype._containerPoint = function() {
    var p = this._getGlobalPoint();
    return  {
        x: p.x - this._pointerOffsetX,
        y: p.y - this._pointerOffsetY
    };
};

TouchBox.prototype._pointerOffsetX = MEUtil.IS_TOUCH_DEVICE ? 0 : 0;

TouchBox.prototype._pointerOffsetY = MEUtil.IS_TOUCH_DEVICE ? 0 : 0;

TouchBox.prototype._getLocalPoint = function(touchX, touchY) {
    var p = this._containerPoint();
    return  {
        x: touchX - p.x,
        y: touchY - p.y
    };
};

TouchBox.prototype._setPoint = function(p) {
    if (p.x < 0) {
        this._point.x = 0;
    }else if (p.x > this.width) {
        this._point.x = this.width;
    }else {
        this._point.x = p.x;
    }

    if (p.y < 0) {
        this._point.y = 0;
    }else if (p.y > this.height) {
        this._point.y = this.height;
    }else {
        this._point.y = p.y;
    }
};

TouchBox.prototype._setStateUp = function() {
    if (this._isToggle) {
        this._setToggle(!this._isToggledOn);
    }
    this._dispatchEvent("touch");
};

TouchBox.prototype._setStateDown = function() {
    $(this._face).addClass(this._config.CSS.down);

    this._dispatchEvent("touchstart");
};

TouchBox.prototype._handleTouchStart = function(touchX, touchY) {
    this._isActive = true;
    this._eventFlags.start = true;
    this._setPoint(this._getLocalPoint(touchX, touchY));
    this._dispatchEvent("touchstart");
    this._dispatchEvent("change");
};

TouchBox.prototype._handleTouchMove = function(touchX, touchY) {
    this._setPoint(this._getLocalPoint(touchX, touchY));
    this._dispatchEvent("change");
};

TouchBox.prototype._handleTouchEnd = function() {
    this._eventFlags.end = true;
    this._isActive = false;
    this._dispatchEvent("touchend");
};

TouchBox.prototype._mouseHandler = function(event) {
    event.stopPropagation();
    event.preventDefault();

    switch (event.type) {
    case "mousemove":
        this._handleTouchMove(event.clientX, event.clientY);
        break;
    case "mousedown":
        if (event.which === 1 && this._isEnabled) {

            this._container.removeEventListener("mousedown",
                this._eventListener);

            MEUtil.on(document, "mousemove mouseup mouseout",
                this._eventListener);

            this._handleTouchStart(event.clientX, event.clientY);
        }
        break;
    case "mouseout": // Fall-through (if on body)
        var style = document.defaultView.getComputedStyle(document.querySelector("body"),
            "").getPropertyValue("outline-style");

        if (style === "dashed") {
            break;
        }
    case "mouseup":
        MEUtil.off(document, "mousemove mouseup mouseout", this._eventListener);

        this._container.addEventListener("mousedown",
            this._eventListener);

        this._handleTouchEnd();
    }

    this._hasChanged = true;
};

TouchBox.prototype._touchHandler = function(event) {
    switch (event.type) {
    case "touchmove":        
        var touches = event.changedTouches;
        for (var i = 0, l = touches.length; i < l; i++) {

            if (this._touch.identifier === touches[i].identifier) {

                this._handleTouchMove(touches[i].pageX, touches[i].pageY);
                break;
            }
        }
        break;
    case "touchstart":
        if (this._isEnabled) {

            this._container.removeEventListener("touchstart",
                this._eventListener);

            MEUtil.on(document, "touchmove touchend touchcancel",
                this._eventListener);

            var touch = event.changedTouches[0];
            this._touch = touch;
            this._handleTouchStart(touch.pageX, touch.pageY);
        }
        break;
    case "touchcancel": //Fall-through
    case "touchend":
        var touches = event.changedTouches;
        for (var i = 0, l = touches.length; i < l; i++) {

            if (this._touch.identifier === touches[i].identifier) {

                MEUtil.off(document, "touchmove touchend touchcancel",
                    this._eventListener);

                this._container.addEventListener("touchstart",
                    this._eventListener);

                this._handleTouchEnd();
                break;
            }
        }
    }

    this._hasChanged = true;
};
