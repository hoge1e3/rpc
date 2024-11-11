import MutablePromise from "mutable-promise";
import { Fail, isFail, isReadyResponse, isSuccess, Messagable, Message, Success, Request, readyRequest } from "./types";

//const debug=console.log.bind(console);
const debug=((...args:any[])=>false);
export class Client {
    idhead=Math.random()+"";
    idseq=1;
    queue={} as {[key:string]:MutablePromise<any>};
    readyPromise=new MutablePromise<any>();
    get isReady() {
        return this.readyPromise.isFulfilled;
    }
    constructor(
        public target: Messagable, 
        public channel="default",
        public origin=undefined as (string|undefined),
        public manualProbe=false,
    ) {
        const t=this;
        t.idseq=1;
        const isWorker=target instanceof Worker;
        const receiver=(isWorker?target:globalThis as unknown as Messagable);
        receiver.addEventListener("message",(e:MessageEvent<Message>)=>{
            debug("CL-RECV",e);
            const d=e.data;
            if (d.channel!==channel) return;
            if (isReadyResponse(d)) {
                if (this.isReady) return;
                debug("Worker is ready!");
                this.readyPromise.resolve(this.isReady);
                return;
            }
            const q=t.queue[d.id];
            if (!q) {
                throw new Error("Missing id "+d.id);
            }
            debug("ID delete",d.id,t.queue );
            delete t.queue[d.id];
            if (isSuccess(d)){
                q.resolve(d.result);
            } else if(isFail(d)) {
                q.reject(d.error);
            } else { 
                debug("Invalid",d);
                throw new Error("Invalid response code");
            }
        });
        if (!manualProbe) this.waitReady();
    }
    async requestReady() {
        this.target.postMessage(readyRequest(this.channel), this.origin);
    }
    async waitReady() {
        for (let i=0;i<30;i++) {
            if (this.isReady) break;
            this.requestReady();
            await new Promise((s)=>setTimeout(s,100));
        }
        if (!this.isReady) {
            throw new Error("Timeout");
        }
    }
    async run(path:string, params={}) {
        const t=this;
        await t.readyPromise;
        const id=t.idhead+(t.idseq++);
        t.queue[id]=new MutablePromise<any>();
        debug("ADD id",id ,t.queue);
        t.target.postMessage({
            id, path, params, 
            channel:t.channel,
        } as Request, t.origin);
        return t.queue[id];
    }
}
