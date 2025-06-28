# rpc
Send to/from worker/iframe via postmessage.

## Sample Code
See `test/` folder.

## API Reference
- `new rpc.Server(channel:string, allowOrigin:string[])`
  - Create server in iframe or Worker context.
  - `serv(name:string, (params:any)=>any)`
    - set service with specified name and function.
- `new rpc.Server(target: Window|Worker, channel:string, allowOrigin:string[])`
  - Create "reverse" server in browser context to process request from target
  - use `serv` method as well
- `new rpc.Client(target: Window|Worker, channel:string, origin:string|undefined)`
  - Create client connect to target
  - `run(name, params:any)`
    - send request to service with name. 
    - Return value is a Promise of the result value processed in service.
- `rpc.proxy.server(channel:string, allowOrigin:string[], methods:{[key:string]:Function})`
  - Create proxy-styled server. 
  - `methods` are list of service that can call from client. 
- `rpc.proxy.server(target: Window|Worker, channel:string, allowOrigin:string[], methods:{[key:string]:Function})`
  - Create proxy-styled "reverse" server that receives request from target. 
- `rpc.proxy.client(target: Window|Worker, channel:string, origin:string|undefined)`
  - Create proxy-styled client.
  - This client can call service on server with regular method invocation style. 