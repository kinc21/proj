function Wavelet(number, position) {
	this.number = number;
	this.position1 = position;
	this.position2 = position;
}

Wavelet.prototype.shift = function(steps1, steps2) {
	this.position1 += steps1;
	this.position2 += steps2;
};

// float, float, int, int, float, float, vector
function Wave(aoi, aor, centerx, centery, v1, v2, waveVector) {
	this.spawned = false;
	this.reflected = false;
	this.height = 300;
	this.width = 300;
	this.arcbuffer = []; // Array of ints

	this.wavelets = [];
	this.aoi = aoi;
	this.aor = aor;
	this.cx = centerx;
	this.cy = centery;
	this.v2 = v2 / v1;
	this.v = waveVector;
	this.si = Math.sin(this.aoi);
	this.ci = Math.cos(this.aoi);
	this.sr = Math.sin(this.aor);
	this.cr = Math.cos(this.aor);
	this.aoid = round(this.aoi * 180 /Math.PI);
	this.aord = round(this.aor * 180 / Math.PI);
	this.xoffset = this.SPACING / Math.cos(this.aoi);
	this.poffset = this.xoffset * Math.sin(this.aoi);

	var lp = new Point(this.cx - round(100 * Math.sin(this.aoi)),
		this.cy - round(100 * Math.cos(this.aoi)));
	var p1 = getIntersectionPoint(new Point(this.cx, this.cy), new Point(lp.x, lp.y),
		new Point(0, 0), new Point(0, this.cy));
	var p2 = getIntersectionPoint(new Point(this.cx, this.cy), new Point(lp.x, lp.y),
		new Point(0, 0), new Point(this.cx, 0));

	if (p1 == null) p1 = p2;
	else if (p2 == null) p2 = p1;

	// Ints
	var d1 = Math.round((this.cx - p1.x) * (this.cx - p1.x) + 
		(this.cy - p1.y) * (this.cy - p1.y));
	var d2 = Math.round((this.cx - p2.x) * (this.cx - p2.x) + 
		(this.cy - p2.y) * (this.cy - p2.y));

	var number = 0;
	var poff = 0.0;
	var position = -Math.sqrt(Math.min(d1, d2));

	for (var i = 0; i < this.COUNT; i++) {
		number = i - (this.COUNT - 1)/2;
		poff = this.poffset * number;
		this.wavelets[i] = new Wavelet(number, position + poff);
	}
}

Wave.prototype.RADIUS = 10;
Wave.prototype.SPACING = 5;
Wave.prototype.COUNT = 15;

Wave.prototype.shift = function(steps) {
	if (!arguments.length) {
		this.shift(5);
		return;
	}

	var needtospawn = false;
	var needtodie = true;
	var stopBigArcs = true;

	for (var i = 0, l = this.wavelets.length; i < l; i++) {
		if (this.wavelets[i].position1 < 0) {
			this.wavelets[i].shift(steps, steps);
			needtodie = stopBigArcs = false;
		}else {
			this.wavelets[i].shift(steps, steps * this.v2); // ? Why second param ?
			needtospawn = true;
			if (this.wavelets[i].position1 < this.cx << 2 && 
				this.wavelets[i].position2 < this.cx << 2)
				needtodie = false;				
		}
	}

	if (needtospawn && !this.spawned) {
		this.v.push(new Wave(this.aoi, this.aor, this.cx,
			this.cy, 1, this.v2, this.v));
		this.spawned = true;
	}

	if (needtodie) {
		this.v.splice(this.v.indexOf(this), 1);
	}

	if (stopBigArcs) this.reflected = true;
};

// All arguments are Graphics objects, now converted to ctx.
Wave.prototype.drawWave = function(grCan, grtopCan, grbottomCan) {
	var RADIUS = this.RADIUS;
	var BIGRADIUS = Math.round(RADIUS * this.cr / this.ci);
	var PI = Math.PI;
	var dx = 0;
	var dy = 0;
	var alpha = 0.0;
	// Wavelets
	var w = null;
	var wstart = null;
	var wend = null;
	var gr = grCan.getContext("2d");
	var grtop = grtopCan.getContext("2d");
	var grbottom = grbottomCan.getContext("2d");
	var wavelets = this.wavelets;
	var xoffset = this.xoffset;
	var aoi = this.aoi;
	var aor = this.aor;
	var aord = this.aord;
	var v2 = this.v2;
	var si = this.si;
	var sr = this.sr;
	var cx = this.cx;
	var cy = this.cy;
	var ci = this.ci;
	var cr = this.cr;
	var reflected = this.reflected;
	var startAngle = toRad(-this.aoid + 180);
	var endAngle = toRad(180);
	var width = 2 * RADIUS;
	var height = 2 * RADIUS;
	var x, y;

	gr.strokeStyle = "#ff0000";
	grtop.strokeStyle = "#ff0000";
	grbottom.strokeStyle = "#0000ff";


	for (var i = 0, l = wavelets.length; i < l; i++) {
		alpha = PI / 2 - aoi;
		dx = round(Math.cos(alpha) * RADIUS);
		dy = round(Math.sin(alpha) * RADIUS);
		wstart = wavelets[0];
		wend = wavelets[wavelets.length - 1];

		w = wavelets[i];
		x = round(cx + si * w.position1 - (w.number * xoffset) - RADIUS) - dx;
		y = round(cy + ci * w.position1 - RADIUS) - dy;
		if (w.position1 < 0) {
			grtop.beginPath();
			grtop.arc(x + RADIUS, y + RADIUS, RADIUS, startAngle, startAngle - endAngle, true);
			grtop.stroke();
		}
		else {
			if (v2 == 1) {
				gr.strokeStyle = "red";
				gr.beginPath();
				gr.arc(x + RADIUS, y + RADIUS, RADIUS, startAngle, startAngle - endAngle, true);
				gr.stroke();
			}
			else {
				if (reflected) {					
					grtop.beginPath();
					grtop.arc(x + RADIUS, round(cy - ci * w.position1 - RADIUS) + dy + RADIUS,
						RADIUS, -startAngle, -startAngle + endAngle, false);
					grtop.stroke();
				}
				else {					
					grtop.beginPath();
					grtop.arc(round(cx - xoffset * w.number - w.position1) + round(w.position1), 
						round(cy - w.position1) + round(w.position1),
						round(w.position1), toRad(180), 0, false);
					grtop.stroke();
				}

				if (aor == aor) {
					if (reflected) {
						alpha = PI / 2 - aor;
						dx = round(Math.cos(alpha) * BIGRADIUS);
						dy = round(Math.sin(alpha) * BIGRADIUS);			
						grbottom.beginPath();
						grbottom.arc(
							round(cx + sr * w.position2 - (w.number * xoffset) - BIGRADIUS) - dx + BIGRADIUS, 
							round(cy + cr * w.position2 - BIGRADIUS) - dy + BIGRADIUS,
							BIGRADIUS, toRad(-aord + 180), 
							toRad(-aord + 180) - endAngle, true);
						grbottom.stroke();
					}
					if (!reflected) {			
						grbottom.beginPath();
						grbottom.arc(
							round(cx - xoffset * w.number - w.position2) + round(w.position2),
							round(cy - w.position2) + round(w.position2),
							round(w.position2), 0, 
							0 - endAngle, false);
						grbottom.stroke();
					}
				}
			}
		}
	}


	alpha = PI / 2 - aoi;
	dx = round(Math.cos(alpha) * RADIUS);
	dy = round(Math.sin(alpha) * RADIUS);
	wstart = wavelets[0];
	wend = wavelets[wavelets.length - 1];
	var x1 = round(cx + si * wstart.position1 - (wstart.number * xoffset));
	var y1 = round(cy + ci * wstart.position1);
	var x2 = round(cx + si * wend.position1 - (wend.number * xoffset));
	var y2 = round(cy + ci * wend.position1);

	if ((wstart.position1 < 0 && wend.position1 < 0)) {
		strokeLine(grtop, x1, y1, x2, y2);
	}else {
		if (v2 == 1) {
			gr.strokeStyle = "#FF0000";
			strokeLine(gr, x1, y1, x2, y2);
		}else {	// reflection
			if (reflected) {
				y1 = round(cy - ci * wstart.position1);
				y2 = round(cy - ci * wend.position1);

				strokeLine(grtop, x1, y1, x2, y2);

				if (aor == aor) {	// refraction
					alpha = PI / 2 - aor;
					dx = round(Math.cos(alpha) * BIGRADIUS);
					dy = round(Math.sin(alpha) * BIGRADIUS);
					x1 = cx + sr * wstart.position2 - wstart.number * xoffset;
					y1 = round(cy + cr * wstart.position2);
					x2 = round(cx + sr * wend.position2 - wend.number * xoffset);
					y2 = round(cy + cr * wend.position2);

					strokeLine(grbottom, x1, y1, x2, y2);
				}
			}
		}
	}
};

function Point(x, y) {
	this.x = x;
	this.y = y;
}

function Vector() {
	return [];
}

function toRad(deg) {
	return deg * Math.PI / 180;
}

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
}

function strokeLine(ctx, x1, y1, x2, y2) {
	ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function getIntersectionPoint(p1, p2, p3, p4) {
    var dx21 = p2.x - p1.x;
    var dx43 = p4.x - p3.x;
    var mx1, my1, mx2, my2, c1, c2;
    if (dx21 != 0) {
        var m0 = (p2.y - p1.y) / dx21;
        mx1 = -m0;
        my1 = 1;
        c1 = p1.y - (p1.x * m0);
    } else {
        mx1 = 1;
        my1 = 0;
        c1 = p1.x;
    } if (dx43 != 0) {
        var m1 = (p4.y - p3.y) / dx43;
        mx2 = -m1;
        my2 = 1;
        c2 = p3.y - (p3.x * m1);
    } else {
        mx2 = 1;
        my2 = 0;
        c2 = p3.x;
    }
    var determinant = (mx1 * my2) - (mx2 * my1);
    if (determinant != 0) {
        var xi = Math.floor(((my2 * c1) - (my1 * c2)) / determinant);
        var yi = Math.floor(((mx1 * c2) - (mx2 * c1)) / determinant);
        return new Point(xi, yi);
    }
    return null;
}

function round(val) {
	return val < 0 ? -round(-val) : val - (val | 0) < 0.5 ? (val | 0) : (val | 0) + 1;
}