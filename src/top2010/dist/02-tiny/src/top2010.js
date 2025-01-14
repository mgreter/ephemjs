/* autogenerated by webmerge (join context) */
;
var top2010 = {};
(function(top2010) {;
//***********************************************************
// (c) 2016-2021 by Marcel Greter
// AstroJS VSOP87 utility lib
// https://github.com/mgreter/ephem.js
//***********************************************************
(function(exports) {

	var mat3; // allocate when needed

	// update vsop elements in elems at offset and return elems array
	function vsop(solver, theory, jy2k, elems, addGM, addEpoch, off)
	{
		off = off || 0;
		jy2k = jy2k || 0;
		elems = elems || [];
		// call main theory to fill elements
		solver(theory, jy2k, elems, addGM, addEpoch, off);
		// check if theory gives mean motion
		if (theory.givesMeanMotion) {
			// assume that mean motion is in days, convert to years
			var fact = elems[off+0] * theory.givesMeanMotion;
			// convert mean motion to semi-major axis via gravitational parameter
			elems[off+0] = Math.cbrt(theory.GM / fact / fact);
		}
		// a bit expensive to get as we need to
		// convert into cartesian to apply rotation
		// we then reconstruct the kepler elements
		// ToDo: can this be implemented directly?
		// Note: doesn't seem to be too obvious!?
		if (toVSOP = theory.toVSOP) {
			// translate via cartesian coords
			// there might be an easier way?
			// do we really need to convert?
			var orbit = new Orbit({
				a: elems[off+0],
				L: elems[off+1],
				k: elems[off+2],
				h: elems[off+3],
				q: elems[off+4],
				p: elems[off+5],
				GM: theory.GM,
				epoch: jy2k
			});
			// get state vectors
			var state = orbit.state(jy2k);
			// check for dynamic rotations
			if (typeof toVSOP == "function") {
				// create only once needed
				mat3 = mat3 || new THREE.Matrix3();
				// get dynamic matrix
				toVSOP(jy2k, mat3);
				toVSOP = mat3;
			}
			// rotate cartesian vectors
			state.r.applyMatrix3(toVSOP);
			state.v.applyMatrix3(toVSOP);
			// create via rotated state
			orbit = new Orbit(state);
			// update state elements
			elems[off++] = orbit._a;
			elems[off++] = orbit.L();
			elems[off++] = orbit.k();
			elems[off++] = orbit.h();
			elems[off++] = orbit.q();
			elems[off++] = orbit.p();
		}
		// return state object
		return elems;
	}
	// EO vsop

	// Return an orbital object suitable to create new Orbit
	function orbital(solver, theory, jy2k, elems, addGM, addEpoch, off)
	{
		off = off || 0;
		jy2k = jy2k || 0;
		elems = elems || [];
		// call main theory to fill elements
		vsop(solver, theory, jy2k, elems, addGM, addEpoch, off);
		// return orbital object
		return {
			a: elems[off++],
			L: elems[off++],
			k: elems[off++],
			h: elems[off++],
			q: elems[off++],
			p: elems[off++],
			GM: theory.GM,
			epoch: jy2k
		};
	}
	// EO orbital

	// update state elements in elems at offset and return array
	function state(solver, theory, jy2k, elems, addGM, addEpoch, off)
	{
		off = off || 0;
		jy2k = jy2k || 0;
		elems = elems || [];
		// call main theory to fill elements
		vsop(solver, theory, jy2k, elems, addGM, addEpoch, off);
		// create orbit object from vsop array
		var orbit = new Orbit({
			a: elems[off+0],
			L: elems[off+1],
			k: elems[off+2],
			h: elems[off+3],
			q: elems[off+4],
			p: elems[off+5],
			GM: theory.GM,
			epoch: jy2k
		});
		// calculate state vector
		var state = orbit.state(jy2k);
		// update state elements
		elems[off++] = state.r.x;
		elems[off++] = state.r.y;
		elems[off++] = state.r.z;
		elems[off++] = state.v.x;
		elems[off++] = state.v.y;
		elems[off++] = state.v.z;
		// return state object
		return elems;
	}
	// EO state

	// update state elements in elems at offset and return state object
	function position(solver, theory, jy2k, elems, addGM, addEpoch, off)
	{
		off = off || 0;
		jy2k = jy2k || 0;
		elems = elems || [];
		// call main theory to fill elements
		state(solver, theory, jy2k, elems, addGM, addEpoch, off);
		// return state object
		return {
			x: elems[off++],
			y: elems[off++],
			z: elems[off++],
			vx: elems[off++],
			vy: elems[off++],
			vz: elems[off++],
			GM: theory.GM,
			epoch: jy2k
		};
	}
	// EO position

	// Export the main exporter function
	// Call this function for every theory
	exports.VSOP = exports.VSOP || function VSOP(solver, name, GM, coeffs, toVSOP, givesMeanMotion)
	{
		var theory = {};
		// update raw elements in elems at offset and return elems array
		theory.raw = function vsop_raw(jy2k, elems, addGM, addEpoch, off) {
			return solver(theory, jy2k, elems, addGM, addEpoch, off);
		}
		// update vsop elements in elems at offset and return elems array
		theory.vsop = function vsop_theory(jy2k, elems, addGM, addEpoch, off) {
			return vsop(solver, theory, jy2k, elems, addGM, addEpoch, off);
		}
		// update state elements in elems at offset and return elems array
		theory.state = function vsop_state(jy2k, elems, addGM, addEpoch, off) {
			return state(solver, theory, jy2k, elems, addGM, addEpoch, off);
		}
		// update state elements in elems at offset and return state object
		theory.position = function vsop_position(jy2k, elems, addGM, addEpoch, off) {
			return position(solver, theory, jy2k, elems, addGM, addEpoch, off);
		}
		// update vsop elements in elems at offset and return orbital object
		theory.orbital = function vsop_orbital(jy2k, elems, addGM, addEpoch, off) {
			return orbital(solver, theory, jy2k, elems, addGM, addEpoch, off);
		}
		// update vsop elements in elems at offset and return orbit object
		theory.orbit = function vsop_orbit(jy2k, elems, addGM, addEpoch, off) {
			return new Orbit(orbital(solver, theory, jy2k, elems, addGM, addEpoch, off));
		}
		// Attach static properties
		theory.givesMeanMotion = givesMeanMotion;
		theory.toVSOP = toVSOP;
		theory.coeffs = coeffs;
		theory.GM = GM;
		// short name only
		theory.name = name;
		// Return theory
		return theory;
	}
	// EO exports.VSOP

})(this);;
//***********************************************************
// (c) 2016-2021 by Marcel Greter
// AstroJS TOP2010/13 utility lib
// https://github.com/mgreter/ephem.js
//***********************************************************
(function(exports) {

	// Re-use array
	var time = [];

	// generic top2010/2013 solver (pass coefficients and time)
	// time is julian years from j2000 (delta JD2451545.0 in JY)
	function top2k_theory(theory, jy2k, elems, addGM, addEpoch, off)
	{
		off = off || 0;
		jy2k = jy2k || 0;
		elems = elems || [];

		var jm2k = jy2k/1000;
		var dmu = theory.dmu;
		var freq = theory.freq;

		time[0] = 1.0;
		for (var i = 1; i <= 12; i += 1) {
			time[i] = time[i-1] * jm2k;
		}
		
		for (var iv = 0; iv < 6; iv += 1) {
			elems[off+iv] = 0;
			var coeffss = theory.coeffs[iv];
			for (var it = 0; it < coeffss.length; it += 1) {
				var coeffs = coeffss[it];
				for (var nt = 0; nt < coeffs.length; nt += 4) {
					var arg = coeffs[nt+0] * dmu * time[1];
					if (iv == 1 && it == 1 && coeffs[nt+0] == 0) continue;
					elems[off+iv] += time[it] * (coeffs[nt+1]*Math.cos(arg)+coeffs[nt+2]*Math.sin(arg))
				}
			}
		}
		
		var ipla = theory.ipla - 4;
		var xl=elems[off+1]+freq[ipla]*time[1];
		xl = xl % (Math.PI * 2);
		if (xl < 0) xl += Math.PI * 2;
		elems[off+1]=xl;
	
		off += 6;
		// update optional elements
		if (addGM) elems[off++] = theory.GM;
		if (addEpoch) elems[off++] = jy2k;
		// return array
		return elems;
	}
	// EO top2k_theory

	// Export the main export function
	// Call this function for each theory
	exports.TOP2K = exports.TOP2K || function(name, GM, coeffs, ipla, freq)
	{
		// export generic VSOP theory with solver attached
		var theory = exports.VSOP(top2k_theory, name, GM, coeffs);
		theory.dmu = (freq[0]-freq[1])/880;
		theory.ipla = ipla;
		theory.freq = freq;
		return theory;
	}
	// EO exports.TOP2K

})(this);;
// generated by top2010.pl
var freq = [0.5296909690160131e+03, 0.2132990807324141e+03, 0.7478165810226641e+02, 0.3813292747646720e+02, 0.2533634111740826e+02];
top2010.jup = TOP2K('jup', 39.5146186724739, [[[0,0.520260315638856e1,0e0,0,1760,0.586641456034175e-3,0.364806423522274e-3,9.929435,287,-0.105511658898769e-3,-0.30504403397924e-3,60.891308],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.599544777075232e0,0e0,0,19,0.725468428544764e-3,-0.569009543368848e-2,919.779232,287,-0.599442586582093e-3,0.170405315907146e-3,60.891308],[0,0.529690969016013e3,0e0,0],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.469858518877442e-1,0e0,0,287,0.271590119291578e-3,0.593821253709725e-3,60.891308,19,-0.170933349042158e-3,-0.339539957795892e-3,919.779232],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.120037094419817e-1,0e0,0,287,0.592322119676944e-3,-0.249926224633899e-3,60.891308,19,0.336250921151627e-3,-0.170408136939817e-3,919.779232],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,-0.20656234695132e-2,0e0,0,19,-0.434666049158409e-5,-0.738537473145839e-5,919.779232,306,-0.219849430852193e-5,-0.188967266448274e-6,57.110475],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.111838943563071e-1,0e0,0,19,0.773339789059606e-5,-0.356898651406571e-5,919.779232,306,0.499152137221835e-6,-0.212947898986921e-5,57.110475],[],[],[],[],[],[],[],[],[],[],[],[]]], 5 - 1, freq);
;
// generated by top2010.pl
var freq = [0.5296909690160131e+03, 0.2132990807324141e+03, 0.7478165810226641e+02, 0.3813292747646720e+02, 0.2533634111740826e+02];
top2010.sat = TOP2K('sat', 39.4882123211967, [[[0,0.95549104275264e1,0e0,0,880,0.323849582368627e-1,0.908335210479047e-2,19.85887,287,0.316316571039414e-2,0.160030987290715e-2,60.891308],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.874020825085824e0,0e0,0,19,-0.178575786613471e-2,0.140036006128432e-1,919.779232,880,-0.715347881261168e-3,0.249743009594471e-2,19.85887],[0,0.213299080732414e3,0e0,0],[],[],[],[],[],[],[],[],[],[],[]],[[0,-0.295996634195742e-2,0e0,0,1473,0.163239868253344e-2,-0.110761779004759e-2,11.864091,19,0.677955439223015e-3,0.139752889168957e-2,919.779232],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.554294861070399e-1,0e0,0,1473,0.111642286289914e-2,0.162176397580229e-2,11.864091,19,-0.138972780567662e-2,0.676312014925831e-3,919.779232],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,-0.871736202610537e-2,0e0,0,19,0.102384498786702e-4,0.178534961886773e-4,919.779232,880,0.674578627732983e-5,-0.275220982836907e-5,19.85887],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.19891374881662e-1,0e0,0,19,-0.184431723688019e-4,0.924496742351514e-5,919.779232,880,-0.644365883209675e-5,-0.545634535012992e-5,19.85887],[],[],[],[],[],[],[],[],[],[],[],[]]], 6 - 1, freq);
;
// generated by top2010.pl
var freq = [0.5296909690160131e+03, 0.2132990807324141e+03, 0.7478165810226641e+02, 0.3813292747646720e+02, 0.2533634111740826e+02];
top2010.ura = TOP2K('ura', 39.4786500803214, [[[0,0.192184388920653e2,0e0,0,1265,0.135322099141521e-1,-0.791569014561726e-1,13.814866,385,-0.217928369338022e-2,-0.205721943010264e-1,45.391702],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.548122286997796e1,0e0,0,4,-0.132367592328301e-1,0.698739760992207e-2,4368.95135,1265,0.336169031558225e-2,0.574791057108582e-3,13.814866],[0,0.747816581022664e2,0e0,0],[],[],[],[],[],[],[],[],[],[],[]],[[0,-0.45953267381099e-1,0e0,0,1473,0.226643771357374e-2,-0.154924856360778e-2,11.864091,4,-0.866300304706399e-3,-0.189726041017872e-2,4368.95135],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.564803698427309e-2,0e0,0,1473,0.154958144167566e-2,0.226794718063015e-2,11.864091,4,0.190522958241855e-2,-0.8680469389827e-3,4368.95135],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.185921032222469e-2,0e0,0,31,-0.482943962087658e-5,0.455876069662383e-5,563.735658,1265,0.411031374596878e-5,0.485670165919568e-5,13.814866],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.648607268500384e-2,0e0,0,31,-0.475175482956412e-5,-0.451664359837834e-5,563.735658,1265,0.483283199693218e-5,-0.414864095802094e-5,13.814866],[],[],[],[],[],[],[],[],[],[],[],[]]], 7 - 1, freq);
;
// generated by top2010.pl
var freq = [0.5296909690160131e+03, 0.2132990807324141e+03, 0.7478165810226641e+02, 0.3813292747646720e+02, 0.2533634111740826e+02];
top2010.nep = TOP2K('nep', 39.4789600314263, [[[0,0.301104395516027e2,0e0,0,1367,-0.371975202328818e-4,-0.148182999949502e0,12.784057,487,-0.976044825636528e-2,-0.346297828683226e-1,35.884611],[1367,-0.106681899649969e-1,0.135696182486019e-4,12.784057],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.531189638939209e1,0e0,0,4,0.898665898468591e-2,-0.474801156915255e-2,4368.95135,1367,0.441713467976433e-2,-0.870059290779926e-6,12.784057],[0,0.381329274764672e2,0e0,0],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.599844482180871e-2,0e0,0,1473,0.283781814899206e-2,-0.194100843921986e-2,11.864091,106,0.76867046667744e-3,0.112470930724756e-2,164.866089],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.669091011705925e-2,0e0,0,1473,0.194150226798589e-2,0.284019909725598e-2,11.864091,106,-0.112514100839317e-2,0.768854572955754e-3,164.866089],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,-0.10291528166877e-1,0e0,0,1367,-0.413325325716793e-6,-0.100923351053132e-4,12.784057,1579,0.826656137848219e-5,0.284138355751835e-5,11.067641],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.115168988794452e-1,0e0,0,1367,-0.100852283417524e-4,0.410959546353933e-6,12.784057,1579,-0.283917753577422e-5,0.826708451568585e-5,11.067641],[],[],[],[],[],[],[],[],[],[],[],[]]], 8 - 1, freq);
;
// generated by top2010.pl
var freq = [0.5296909690160131e+03, 0.2132990807324141e+03, 0.7478165810226641e+02, 0.3813292747646720e+02, 0.2533634111740826e+02];
top2010.plu = TOP2K('plu', 39.4769267133621, [[[0,0.3954470599359e2,0e0,0,1402,-0.188856887968998e0,-0.853871348201155e-1,12.464911,1331,-0.414526604237341e-1,-0.334407179334043e-1,13.129831,522,-0.484978885372198e-1,-0.73788773702726e-2,33.478554,71,0.280976664834542e-1,-0.535961817372672e-2,246.138104,1261,-0.913663936136193e-2,-0.123263783658494e-1,13.858688,452,-0.121954072119394e-1,-0.526781366320596e-2,38.663286],[1402,-0.245188221694707e-1,0.53676522241001e-1,12.464911,0,0.378904808510013e-1,0e0,0,1331,-0.15961060108816e-1,0.195474173149917e-1,13.129831,522,-0.217190934339332e-2,0.138167288060952e-1,33.478554],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.4166144186927e1,0e0,0,1402,0.206416206323593e-2,-0.456583327646248e-2,12.464911,4,0.282526966742194e-2,0.219275180301368e-2,4368.95135],[0,0.253363411174083e2,0e0,0],[0,-0.182807024038974e-1,0e0,0],[],[],[],[],[],[],[],[],[],[]],[[0,-0.1787246950685e0,0e0,0,1473,0.316298912578306e-2,-0.209858994701332e-2,11.864091,71,-0.681136951235402e-3,0.111179681573192e-2,246.138104],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,-0.1734154998938e0,0e0,0,1473,0.212348584672692e-2,0.30130079923837e-2,11.864091,71,-0.105093327613335e-2,-0.707800891750754e-3,246.138104],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,-0.517028337448404e-1,0e0,0,1402,-0.133061378669859e-3,0.135147039182862e-3,12.464911,1543,0.163047844135352e-3,0.558152705651425e-4,11.325862],[],[],[],[],[],[],[],[],[],[],[],[]],[[0,0.139779560579086e0,0e0,0,1402,0.128742494031123e-3,0.13480122930835e-3,12.464911,1543,-0.498695225339238e-4,0.16184522556001e-3,11.325862],[],[],[],[],[],[],[],[],[],[],[],[]]], 9 - 1, freq);
;
})(top2010)
/* crc: DA99E91A79AC678ADB90B25211EC13C4 */
