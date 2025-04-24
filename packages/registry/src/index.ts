import { Hono } from "hono";
import { database } from "../db/index.js";
import { Package } from "../db/schema.js";
import { eq, like } from "drizzle-orm";

const app = new Hono();

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
  // return c.json({ "packages": "allUsers" });
});

export { app };
