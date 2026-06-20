import { proxy } from "./proxy";
import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  return proxy(req);
}

export { config } from "./proxy";
