import { IncomingMessage } from 'http';

export class AppRequest extends IncomingMessage {

  public metadata: AppRequestMetadata;
  public headers: { [key: string]: string };
  public accepted: any[];
  public protocol: string;
  public secure: boolean;
  public ip: string;
  public ips: string[];
  public subdomains: string[];
  public path: string;
  public hostname: string;
  public fresh: boolean;
  public stale: boolean;
  public xhr: boolean;
  public body: any;
  public cookies: any;
  public method: string;
  public params: any;
  public query: any;
  public route: any;
  public signedCookies: any;
  public originalUrl: string;
  public url: string;
  public baseUrl: string;

}

export class AppRequestMetadata {

  public clientIp?: string;
  public serverIp?: string;
  public userAgent?: string;
  public jwtPayload?: any;

}
