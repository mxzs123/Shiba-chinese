export interface MonitoringConfig {
  serviceName: string;
  dsn?: string;
  logEndpoint?: string;
  environment?: string;
  release?: string;
  enabled: boolean;
}

export interface CaptureContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

interface InitOptions {
  serviceName?: string;
  environment?: string;
  release?: string;
}

let initialized = false;
let config: MonitoringConfig | undefined;

function readEnv(name: string) {
  return process.env[name]?.trim() || undefined;
}

function resolveConfig(options?: InitOptions): MonitoringConfig {
  const dsn =
    readEnv("DISTRIBUTOR_SENTRY_DSN") ||
    readEnv("SENTRY_DSN") ||
    readEnv("NEXT_PUBLIC_SENTRY_DSN");

  const logEndpoint =
    readEnv("DISTRIBUTOR_LOG_ENDPOINT") || readEnv("LOG_ENDPOINT");

  const environment =
    options?.environment ||
    readEnv("DISTRIBUTOR_ENVIRONMENT") ||
    readEnv("NODE_ENV") ||
    "development";

  const serviceName =
    options?.serviceName ||
    readEnv("DISTRIBUTOR_SERVICE_NAME") ||
    "distributor-app";

  const release = options?.release || readEnv("APP_RELEASE");

  const enabled = Boolean(dsn || logEndpoint);

  return {
    serviceName,
    dsn,
    logEndpoint,
    environment,
    release,
    enabled,
  };
}

export function initMonitoring(options?: InitOptions): MonitoringConfig {
  if (!initialized) {
    config = resolveConfig(options);
    initialized = true;

    if (config.enabled) {
      console.info(
        `[monitoring] initialized for ${config.serviceName} (env=${config.environment})`,
      );
    } else {
      console.info(
        `[monitoring] disabled (no DSN or log endpoint configured for ${config.serviceName})`,
      );
    }
  }

  return config!;
}

function ensureConfig() {
  if (!initialized) {
    initMonitoring();
  }

  return config!;
}

export function monitoringEnabled() {
  return ensureConfig().enabled;
}

export function captureException(error: unknown, context?: CaptureContext) {
  const { enabled, serviceName } = ensureConfig();

  if (!enabled) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[monitoring]", serviceName, error, context);
    }
    return;
  }

  console.error("[monitoring] captureException", {
    serviceName,
    error,
    context,
  });
}

export function captureMessage(message: string, context?: CaptureContext) {
  const { enabled, serviceName } = ensureConfig();

  if (!enabled) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[monitoring]", serviceName, message, context);
    }
    return;
  }

  console.warn("[monitoring] captureMessage", {
    serviceName,
    message,
    context,
  });
}
