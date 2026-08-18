"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export function SwaggerViewer() {
  return <SwaggerUI url="/api/openapi" persistAuthorization displayRequestDuration tryItOutEnabled />;
}
