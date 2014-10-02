/*** The Double Slider Block model ***/

/** Define variables **/

var n, nn, nt, p, pp;
var alpha, beta, phi, y1, y2, z1, z2, ybar1, ybar2, h, alphaold;
var y1old, y2old, z1old, z2old, dy1dt, dy2dt, dz1dt, dz2dt;
var lslip1, lslip2;

// Set value of stiffness parameter alpha
alpha = 3.49; // Chaotic
//alpha = 3.0; // Simple

// Set value of beta, F_s1/F_s2
beta = 2.25; // Chaotic
//beta = 1.0; // Simple

// Set value of phi, F_s/F_d
phi = 1.25;

// Initial value of Y_1
//y1 = 0.765; // Simple
y1 = 1.0; // Chaotic

// Initial value of Y_2
//y2 = 0.820; // Simple
y2 = 1.075;// Chaotic 

pp = 70;

// Number of slip events to simulate
//nn = 4; //simple
nn=100; // Chaotic

// Display initial conditions
document.write('<h4 style="margin-bottom:0;">Initial Conditions</h4>');
document.write('alpha = '+alpha+'&nbsp;&nbsp;&nbsp;beta = '+beta+'&nbsp;&nbsp;&nbsp;phi = '+phi+'<br>');
document.write('Number of slip events to simulate: '+nn+'<br>');
//Slip lines meet at (ybar1,ybar2)
ybar1 = (1+alpha*(1+beta))/(1+2*alpha);
ybar2 = ((1+alpha)/alpha)*((1+alpha*(1+beta))/(1+2*alpha))-1/alpha;
document.write('(ybar1,ybar2) = ('+ybar1+', '+ybar2+')<br>');

// Set logical variables to false initailly
lslip1 = false;
lslip2 = false;

// Set fixed time step for now
h = 0.01;

// Setup functions
function get_dz1() {
	// Calculate RHS of equation for Y1 motion
	if (lslip1) {
		dz1dt = -(1+alpha)*y1+(1/phi)+alpha*y2;
	} else {
		dz1dt = 0;
	}
	//document.write('dz1dt = '+dz1dt+'<br>');
}

function get_dy1() {
	if (lslip1) {
		dy1dt = z1;
		
	} else {
		dy1dt = 0;
	}
	//document.write('dy1dt = '+dy1dt+'<br>');
}

function get_dz2() {
	if (lslip2) {
		dz2dt = -(1+alpha)*y2+alpha*y1+(beta/phi);
	} else {
		dz2dt = 0;
	}
	//document.write('dz2dt = '+dz2dt+'<br>')
}
function get_dy2() {
	if (lslip2) {
		dy2dt = z2;
	} else {
		dy2dt = 0;
	}
	//document.write('dy2dt = '+dy2dt+'<br>')
}
var lineData=[];

// Log initial values of (y1,y2)
document.write('<p><b>Initial values of (y1,y2)</b><br>');
document.write('y1 = ' + y1 + ', y2 = ' + y2+'</p>');
lineData.push({'x':y1,'y':y2});

// Main loop for stretch slip events
function mainStretchSlipLoop () {
	for (n=0;n<nn;n++) {
		y1old = y1;
		y2old = y2;
		document.write('<h2>Slip event ('+(n+1)+')</h2>');

		// Calculate where next slip will occur
		if (y2 > y1 + (ybar2-ybar1)) {
			lslip2 = true;
			y1 = beta-(1+alpha)*(y2old-y1old);
			y2 = beta-alpha*(y2old-y1old);
			document.write('Block 2 is slipping first<br>');
		} else {
			lslip1 = true;
			y1 = 1+alpha*(y2old-y1old);
			y2 = 1+(alpha+1)*(y2old-y1old);
			document.write('Block 1 is slipping first<br>');
		}

		// Write (y1,y2) for start of slip
		document.write('<p><b>Start of slip</b><br>')
		document.write('y1 = ' + y1 + ', y2 = ' + y2+'</p>');
		lineData.push({'x':y1,'y':y2});

		// Time step until blocks come to rest
		z1 = 0;
		z2 = 0;

		nt = 0;

		do {
			y1old = y1;
			y2old = y2;
			z1old = z1;
			z2old = z2;
			//get_dy1(dy1dt, z1old, lslip1);
			//get_dz1(dz1dt, y1old, y2old, alpha, phi, lslip1);
			//get_dy2(dy2dt, z2, lslip2);
			//get_dz2(dz2dt, y1, y2, alpha, beta, phi, lslip2);
			get_dy1();
			get_dz1();
			get_dy2();
			get_dz2();
			z1 = z1old + h*dz1dt;
			//document.write('z1 = '+z1+'<br>');
			y1 = y1old + h*dy1dt;
			//document.write('y1 = '+y1+'<br>');
			z2 = z2old + h*dz2dt;
			//document.write('z2 = '+z2+'<br>');
			y2 = y2old + h*dy2dt;
			//document.write('y2 = '+y2+'<br>');
			nt++;
			//document.write('nt = '+nt+'<br>');

			// Write out y1,y2 during slip
			document.write('y1 = ' + y1 + ', y2 = ' + y2+'<br>');
			lineData.push({'x':y1,'y':y2});

			// Check that block one hasn't stopped slipping
			if (z1 >= 0) {
				lslip1 = false;
			}

			// Check that block two hasn't stopped slipping
			if (z2 >= 0) {
				lslip2 = false;
			}

			// Check that block one hasn't started slipping 
			if (!lslip1) {
				if (y2 <= (1+alpha)/alpha*y1-1/alpha){
					lslip1 = true;
				}
			}
			
			// Check that block two hasn't started slipping
			if (!lslip2) {
				if (y2 >= alpha/(1+alpha)*y1+beta/(1+alpha)) {
					lslip2 = true;
				}
			}
		} while (lslip1 || lslip2);

		// Write y1,y2 at end of slip 
		document.write('End of slip '+(n+1)+': y1 = ' + y1 + ', y2 = ' + y2+'<br>');
		lineData.push({'x':y1,'y':y2});
	}
}

// Start d3 chart initiation
InitChart();

function InitChart() {

  mainStretchSlipLoop();

  var vis = d3.select("#visualisation"),
    WIDTH = 500,
    HEIGHT = 500,
    MARGINS = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 50
    },
    xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(lineData, function (d) {
        return d.x;
      }),
      d3.max(lineData, function (d) {
        return d.x;
      })
    ]),

    yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(lineData, function (d) {
        return d.y;
      }),
      d3.max(lineData, function (d) {
        return d.y;
      })
    ]),

    xAxis = d3.svg.axis()
      .scale(xRange)
      .tickSize(5)
      .tickSubdivide(true),

    yAxis = d3.svg.axis()
      .scale(yRange)
      .tickSize(5)
      .orient("left")
      .tickSubdivide(true);


  vis.append("svg:g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
    .call(xAxis);

  vis.append("svg:g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (MARGINS.left) + ",0)")
    .call(yAxis);

  var lineFunc = d3.svg.line()
  .x(function (d) {
    return xRange(d.x);
  })
  .y(function (d) {
    return yRange(d.y);
  })
  .interpolate('linear');

vis.append("svg:path")
  .attr("d", lineFunc(lineData))
  .attr("stroke", "blue")
  .attr("stroke-width", 1)
  .attr("fill", "none");

}
