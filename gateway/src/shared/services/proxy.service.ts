import { Injectable, Logger } from '@nestjs/common';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

@Injectable()
export class ProxyService {
  private logger = new Logger(ProxyService.name);

  /* eslint-disable */
  public createProxy(
    target: string,
    pathRewriteRules: { [key: string]: string },
  ) {
    const proxyOptions: Options = {
      target: target,
      changeOrigin: true,
      pathRewrite: pathRewriteRules,
      on: {
        proxyReq: (proxyReq, req, res) => {
          this.logger.log(`Proxying request to ${target}${req.url}`);
        },
        error: (err, req, res) => {
          this.logger.error(err);
        },
      },
    };

    return createProxyMiddleware(proxyOptions);
  }
}
