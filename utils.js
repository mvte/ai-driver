/**
 * linear interpolation, calculates a value between two numbers that
 * is the offset by some ratio from the first value
 * @param {*} A start value
 * @param {*} B end value
 * @param {*} t interpolation value (0,1)
 * @returns value between start and end corresponding to interpolation offset
 */
function lerp(A,B,t) {
    return A+(B-A)*t;
}

/**
 * finds the intersection point of two line segments in two dimensions
 * @param {Number, Number} p1 start of segment 1
 * @param {Number, Number} p2 end of segment 1
 * @param {Number, Number} q1 start of segment 2
 * @param {Number, Number} q2 end of segment 2
 * @returns
 */
function getIntersection(p1, p2, q1, q2) {
    /*
    if an intersection exists between two segments, then there exists an
    interpolation factor for each segment that interpolates from the
    segment's start to the intersection.

    therefore, the x value of the intersection (i.x) must satisfy
    i.x = p1.x + (p2.x - p1.x)t = q1.x + (q2.x - q1.x)u
        (an interpolation on the x components of the segments)

    similarly, the y value (i.y) must satisfy
    i.y = p1.y + (p2.y - p1.y)t = q1.y+ (q2.x - q1.y)u

    this gives us a system of equations
    for our purposes, we only need the interpolation value of the first segment

    solving for t:
    from the first equation
    p1.x - q1.x + (p2.x - p1.x)t = (q2.x - q1.x)u

    from the second equation
    p1.y - q1.y + (p2.y - p1.y)t = (q2.y - q1.y)u | multiply by (q2.x - q1.x)
    (p1.y - q1.y)(q2.x - q1.x) + (p2.y - p1.y)(q2.x - q1.x)t = (q2.y - q1.y)(q2.x - q1.x)u
    
    now plug in the first equation to the rhs
    (p1.y - q1.y)(q2.x - q1.x) + (p2.y - p1.y)(q2.x - q1.x)t = (q2.y - q1.y)(p1.x - q1.x) + (q2.y - q1.y)(p2.x - p1.x)t
    (p2.y - p1.y)(q2.x - q1.x)t - (q2.y - q1.y)(p2.x - p1.x)t = (q2.y - q1.y)(p1.x - q1.x) - (p1.y - q1.y)(q2.x - q1.x)
    t((p2.y - p1.y)(q2.x - q1.x) - (q2.y - q1.y)(p2.x - p1.x)) = (q2.y - q1.y)(p1.x - q1.x) - (p1.y - q1.y)(q2.x - q1.x)

    therefore, we have
    t = 
        (q2.y - q1.y)(p1.x - q1.x) - (p1.y - q1.y)(q2.x - q1.x) /
        (p2.y - p1.y)(q2.x - q1.x) - (q2.y - q1.y)(p2.x - p1.x)

    the same calculation can be done for u
        which coincidentally yields the same denominator
        
    note that division by 0 occurs when the lines are parallel
    */
   
    const tNum = (q2.y - q1.y)*(p1.x - q1.x) - (p1.y - q1.y)*(q2.x - q1.x);
    const uNum = (q1.x - p1.x)*(p1.y - p2.y) - (q1.y - p1.y)*(p1.x - p2.x);
    const den = (p2.y - p1.y)*(q2.x - q1.x) - (q2.y - q1.y)*(p2.x - p1.x);

    if(den != 0) {
        const t = tNum/den;
        const u = uNum/den;

        if(t>= 0 && t<=1 && u>=0 && u<=1)
            return {
                x: lerp(p1.x, p2.x, t),
                y: lerp(p1.y, p2.y, t),
                offset: t
            };
    }
}

/**
 * determines whether or not two polygons in 2d space intersect
 * @param {*} poly1 collection of points that form a polygon
 * @param {*} poly2 collection of points that form another polygon
 * @returns true if the two polygons intersect, false otherwise
 */
function polysIntersect(poly1, poly2) {
    for(let i=0; i<poly1.length; i++) {
        for(let j=0; j<poly2.length; j++) {
            const p1 = poly1[i];
            const p2 = poly1[(i+1)%poly1.length];
            const q1 = poly2[j];
            const q2 = poly2[(j+1)%poly2.length];

            if(getIntersection(p1, p2, q1, q2))
                return true;
        }
    }
    return false;
}

function alphaToHex(value) {
    const hex = Math.round(value*255).toString(16);
    return hex.length == 1 ? '0'+hex : hex;
}

/**
 * returns a hex color with an alpha value depending on the value.
 * the color is either red or blue depending on the sign of the value,
 * and the alpha value is the absolute value of the value.
 * @param {Number} value -1 to 1
 * @returns a hexa string
 */
function getHEXA(value) {
    const alpha = Math.abs(value);
    const color = value > 0 ? '#AEC6CF' : '#FF6961';

    return color + alphaToHex(alpha);
}