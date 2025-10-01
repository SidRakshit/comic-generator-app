import { collectDefaultMetrics, Histogram, Registry } from "prom-client";

const register = new Registry();

collectDefaultMetrics({ register });

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

register.registerMetric(httpRequestDuration);

export function getMetricsRegistry(): Registry {
  return register;
}
