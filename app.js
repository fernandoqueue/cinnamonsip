class App {

    constructor(cinnamon)
    {
        this.app = cinnamon;
        this.stdin = null;
    }

    async start(options){
        this.app = await new this.app(options);
        this.stdin = process.openStdin(); 
        return this;
    }

    read(){
        this.stdin.addListener('data', this.app.command.bind(this.app));
    }
}



module.exports = App;