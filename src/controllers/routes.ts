import secretRouter from "./secret/route";

export const routes = [secretRouter];

export type AppRoute = (typeof routes)[number];
