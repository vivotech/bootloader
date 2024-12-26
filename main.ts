#!/usr/bin/env -S deno run --allow-run
import { listen } from "./api/api.ts";
import { Services } from "./service/services.ts";

if (import.meta.main) {
  const services = new Services();
  listen(services);
}
