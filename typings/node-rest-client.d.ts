declare module "node-rest-client" {
    interface IRequestOptions {
        data?: any; // data passed to REST method (only useful in POST, PUT or PATCH methods)
        path?: { [key: string]: any }, // path substitution var
        parameters?: { [key: string]: any }, // query parameter substitution vars
        headers?: { [key: string]: string } // request headers
    }

    interface IRequest  {
        on(eventName: string, handler: Function): void
    }

    class Client {
        get(url: string, args: IRequestOptions, callback: (data: any, response: any) => void): IRequest;
        post(url: string, args: IRequestOptions, callback: (data: any, response: any) => void): IRequest;
    }
}