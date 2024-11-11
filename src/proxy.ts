import { Client } from "./client";
import { Server } from "./server";
import { Messagable } from "./types";

export function server(
    channel="default",
    allowOrigin=[] as string[], 
    methods:{[key:string]:Function},
) {
    const s=new Server(channel, allowOrigin);
    for (let k in methods) {
        s.serv(k,(params)=>methods[k](...params.args));
    }
    return s;
}
export function client(     
    target: Messagable, 
    channel="default",
    origin=undefined as (string|undefined),
    manualProbe=false, 
) {
    const c=new Client(target, channel, origin, manualProbe);
    return new Proxy(c,{
        get(target,p) {
            if (typeof p==="symbol" || p==="then" || p==="toString") {
                return Reflect.get(target, p);
            }
            return (...args:any[])=>c.run(p,{args});
        }
    })
}
