var maths = (function(){
		
		function trigonometry(whichIsIt, xOrY, radius, angle){

			if(whichIsIt == "X"){
				var trigonometryX = xOrY + (radius*Math.cos(angle*(Math.PI/180)));
				return trigonometryX;
			} else if(whichIsIt == "Y"){
				var trigonometryY = xOrY + (radius*Math.sin(angle*(Math.PI/180)));
				return trigonometryY;
			}
		}

		//Code modified from:
		//http://beradrian.wordpress.com/2009/03/23/calculating-the-angle-between-two-points-on-a-circle/

		/* Takes input as:
			
			{
				x : VALUE,
				y : VALUE
			}

		*/

		function angle(center, p0, p1) {

		    return (2 * Math.atan2(p1.y - p0.y, p1.x - p0.x)) * 180 / Math.PI;
		
		}

		//Code modified from:
		//http://gamedev.michaeljameswilliams.com/2009/05/08/pythagorean-distance-between-two-points/

		function distance(p0, p1){

			return Math.sqrt( ( p0.x - p1.x ) * ( p0.x - p1.x ) + ( p0.y - p1.y ) * ( p0.y - p1.y ) );

		}

		function zDistance (vertex1, vertex2) {

		    var xfactor = vertex2.x - vertex1.x;
		    var yfactor = vertex2.y - vertex1.y;
		    var zfactor = vertex2.z - vertex1.z;

		    return Math.sqrt( (xfactor*xfactor) + (yfactor*yfactor) + (zfactor*zfactor) );

		}

		//Returns the equivalent radian value for the degrees passed;
		function degrees(angle){
			radians = angle * (Math.PI / 180);
			return radians;
		}

	return{
		trig : trigonometry,
		angle : angle,
		distance : distance,
		zDistance : zDistance,
		degrees : degrees
	};

})();