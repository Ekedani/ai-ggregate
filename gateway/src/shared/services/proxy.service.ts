import { Injectable, Logger } from '@nestjs/common';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

@Injectable()
export class ProxyService {
  private logger = new Logger(ProxyService.name);

  public createProxy(
    target: string,
    pathRewriteRules: { [key: string]: string },
  ) {
    const proxyOptions: Options = {
      target: target,
      changeOrigin: true,
      pathRewrite: pathRewriteRules,
      on: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        proxyReq: (proxyReq, req, res) => {
          const originalUrl = req.url;
          const rewrittenPath = proxyReq.path;
          this.logger.log(
            `Original URL: ${originalUrl} -> Rewritten Path: ${rewrittenPath}`,
          );
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error: (err, req, res) => {
          this.logger.error(err);
        },
      },
    };

    return createProxyMiddleware(proxyOptions);
  }
}
