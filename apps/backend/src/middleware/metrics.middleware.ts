import { Request, Response, NextFunction } from "express";
import onFinished from "on-finished";
import { httpRequestDuration } from "../utils/metrics";

function getRouteLabel(req: Request): string {
  if (req.baseUrl && req.route?.path) {
    return `${req.baseUrl}${req.route.path}`;
  }
  if (req.route?.path) {
    return req.route.path;
  }
  return req.path;
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  onFinished(res, () => {
    const durationNs = Number(process.hrtime.bigint() - start);
    const durationSeconds = durationNs / 1e9;
    const routeLabel = getRouteLabel(req);

    httpRequestDuration.observe(
      {
        method: req.method,
        route: routeLabel,
        status: res.statusCode.toString(),
      },
      durationSeconds
    );
  });

  next();
}
