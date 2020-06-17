const geoip = require('geoip-lite'),
	log = require('not-log')(module),
	config = require('not-config').readerForModule('locate');

/**
* Detect location and set res.locals accordingly
* @param {ExpressRequest} req
* @param {ExpressResponse} res
* @param {function} next return control
*/
let activeMiddleware = (req, res, next)=>{
	log.debug('request from ',req.ip,req.ips);
	let geo = geoip.lookup(req.ip),
		list = config.get('list'),
		def = config.get('default');
	if (geo){
		if (geo.city && list.hasOwnProperty(geo.city)){
			log.debug('location found', geo.city);
			res.locals = Object.assign(res.locals, list[geo.city]);
		}else if(def){
			log.debug('location not found', geo);
			res.locals = Object.assign(res.locals, def);
		}else{
			log.debug('location not found and no default');
		}
		res.locals.location = geo;
	}else if(def){
		log.debug('location default');
		res.locals = Object.assign(res.locals, def);
	}else{
		log.error('no default location');
	}
	next();
};

/**
* Blindly set res.locals.location to locate config section
* @param {ExpressRequest} req
* @param {ExpressResponse} res
* @param {function} next return control
*/
let passiveMiddleware = (req, res, next)=>{
	log.debug('request from ',req.ip,req.ips);
	let locateConfig = config.get();
	res.locals.location = locateConfig;
	next();
};

/**
* Return locate middleware
* @param {object} options middleware options from config:middleware:not-locate
* @return {function} active or passive version of middleware
*/
exports.getMiddleware = (options)=>{
	if (options.active === false){
		log.info('...locate in passive mode');
		return passiveMiddleware;
	}else{
		log.info('...locate in active mode');
		return activeMiddleware;
	}
};
