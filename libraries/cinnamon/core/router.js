class Router {
    constructor(routes){
        this.routes = [];
        this.start(routes);
    }
    
    start(routes){
        for(const [key, route] of Object.entries(routes)){
            this.routes[key] = (typeof route === 'function') ? route : route.handle.bind(route);
        }
    }

    registerRoute(method,callback){
        this.routes[method] = callback;
    }

    route(method){
        if(!this.routes[method]) throw new Error('Method not found');
        return (...params) => this.routes[method](...params);
    }

}

module.exports = Router;