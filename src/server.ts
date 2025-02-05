import { Handler, isReadyRequest, isRequest, Message, Messagable, isMessegable, MessageHandler } from "./types";

//const debug=console.log.bind(console);
const debug=((...args:any[])=>false);
export class Server {
    isReady=false;
    paths:{[key:string]:Handler}={};
    target: Messagable;
    channel:string;
    allowOrigin:string[];
    handler: MessageHandler;
    constructor(target: Messagable, 
        channel:string,
        allowOrigin:string[]);
    constructor(
        channel:string,
        allowOrigin:string[]);
    constructor(...a:any[]) {
        this.target=(isMessegable(a[0])?
            a.shift():
            globalThis as unknown as Messagable
        );
        this.channel=(typeof a[0]==="string"?a.shift():"default");
        this.allowOrigin=a.shift();
        const channel=this.channel, allowOrigin=this.allowOrigin;
        this.handler=(e:MessageEvent<Message>)=>{
            const d=e.data;
            const id=d.id;
            const respond=(m:Message)=>{
                if (e.source) {
                    // Iframe
                    e.source.postMessage(m,{
                        targetOrigin: e.origin,
                    });    
                } else {
                    // Worker
                    debug("Worker respond", m );
                    this.target.postMessage(m,undefined);
                }
            };
            const context={id,channel};
            debug("EVT",e, d.channel, channel);
            if (d.channel!==channel) return; 
            if (e.origin && !allowOrigin.includes(e.origin)) {
                console.error("Invalid origin", e.origin);
                sendError(new Error(`Invalid origin: ${e.origin}`));
                return;
            }
            if (isReadyRequest(d)) {
                debug("READY",d);
                respond({id:"READY" ,channel, status:"ready"});
                return;
            }
            if (!isRequest(d)) throw new Error("Invalid message");
            try {
                const f=this.paths[d.path];
                if (!f) return sendError(new Error("No such method: "+d.path));
                Promise.resolve( f(d.params,context) ).then((r)=>{
                    respond({
                        ...context, result:r, status:"ok"
                    });
                },sendError);
            } catch (ex) {
                sendError(ex);
            }
            function sendError(_err:any) {
                let err:any=Object.assign({name:_err.name, message:_err.message, stack:_err.stack},_err||{});
                try {
                    const j=JSON.stringify(err);
                    err=JSON.parse(j);
                } catch(je) {
                    err=err ? err.message || e+"" : "unknown";
                    debug("rpc:service", je, err);
                }
                respond({
                    ...context, error:err as Error, status:"error"
                });
            }
        }
        this.target.addEventListener("message", this.handler);
        this.ready();
    }
    dispose(){
        this.target.removeEventListener("message",this.handler);
    }
    install(path:string, func:Handler) {
        this.paths[path]=func;
    }
    serv(path:string ,func:Handler) {
        this.install(path,func);
    }
    ready() {
        this.isReady=true;
    }
};