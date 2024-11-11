export type Messagable={
    addEventListener:(type:"message", handler:(e:MessageEvent<Message>)=>void)=>boolean,
    postMessage:(data:Message, origin:string|undefined)=>void,
};
export type Message=(Request|Success|Fail|ReadyRequest|ReadyResponse);
export type Request=Context&{
    path: string,
    params: any,
};
export function isRequest(m:Message):m is Request{
    return (m as any).path && (m as any).params;
}
export type Fail=Context&{
    status:"error",
    error: Error,
};
export function isFail(m:Message):m is Fail{
    return (m as any).status==="error";
}
export type Success=Context&{
    result:any,
    status:"ok",
};
export function isSuccess(m:Message):m is Success{
    return (m as any).status==="ok";
}
export type Handler=(params:any, context:Context)=>any;
type Context={id:string, channel:string};

export type ReadyRequest=Context&{
    id:"READY",
};
export function isReadyRequest(m:Message):m is ReadyRequest{
    return (m as any).id=="READY";
}
export const readyRequest=(channel:string)=>({id:"READY",channel} as ReadyRequest);
export type ReadyResponse=Context&{
    id:"READY",
    status:"ready",
};
export function isReadyResponse(m:Message):m is ReadyResponse{
    return (m as any).id=="READY" && (m as any).status==="ready";
}