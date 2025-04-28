import { Hono } from "hono";
import { cors } from 'hono/cors'
import { database } from "../db/index.js";
import { Package } from "../db/schema.js";
import { eq, like } from "drizzle-orm";
import { authMiddleware } from "./authMiddleware.js";

const app = new Hono();

app.use('/*', cors({
  origin: (origin) => origin || '',   
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400,
  credentials: true,
}))


app.get("/", (c) =>
  
  c.json({ message: `Pong! ${Date.now()}`, status: "running" })
);

app.get("/search", async (c) => {
  console.log("Search query:", c.req.query());
  const { package_name, hard_search } = c.req.query();
  try {
    const allUsers = await database
      .select()
      .from(Package)
      .where(
        package_name
          ? hard_search
            ? eq(Package.name, package_name)
            : like(Package.name, `%${package_name}%`)
          : undefined
      );
    return c.json({ packages: allUsers });
  } catch (error: any) {
    return c.json({ error: error?.message || "Unknown error occurred" }, 500);
  }

});
app.get("/packages", async (c) => {
  console.log("Fetching all packages");
  try {
    const packages = await database.select().from(Package);
    return c.json(packages);
  } catch (error: any) {
    return c.json({ error: error?.message || "Unknown error occurred" }, 500);
  }
});

app.post("/packages", authMiddleware , async (c) => {
  try {
    const data = await c.req.json();
    const id = Math.random().toString(36).substring(2, 15);
    console.log("Received data:", data);
    const newPackage = {
      id,
      name: data.name,
      latest_version: data.latest_version,
      description: data.description,
      repository: data.repository,
      maintainer: data.maintainer,
      manifest: data.manifest || {}
    };

    const result = await database.insert(Package).values(newPackage);
    console.log("Insert result:", result);
    return c.json(newPackage, 201);
  } catch (error: any) {
    return c.json({ error: error?.message || "Unknown error occurred" }, 500);
  }
});

export { app };
