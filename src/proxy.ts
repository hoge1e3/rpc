import { Client } from "./client";
import { Server } from "./server";
import { isMessegable, Messagable } from "./types";

type Methods={[key:string]:Function};
export function server(
    target: Messagable, 
    channel:string,
    allowOrigin:string[],
    methods:Methods,
):Server;
export function server(
    channel:string,
    allowOrigin:string[],
    methods:Methods,
):Server;
export function server(...a:any[]):Server {
    const target:Messagable=(isMessegable(a[0])?
        a.shift():
        globalThis as unknown as Messagable
    );
    const channel:string=a.shift();
    const allowOrigin:string[]=a.shift();
    const methods:Methods=a.shift();
    const s=new Server(target, channel, allowOrigin);
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
