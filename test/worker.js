/* global rpc */
importScripts("../dist/index.umd.js");
const r=new rpc.Server("test");
r.serv("test",({x})=>{
    return x*100;
});
const p=rpc.proxy.server("proxy",[],{
    test(x){
        return x*100;
    }
});

