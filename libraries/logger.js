class Logger
{

    constructor()
    {

    }

    success(text){
        console.log("\x1b[34m%s\x1b[0m", text);
    }

}