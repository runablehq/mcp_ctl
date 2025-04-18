import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { serve } from '@hono/node-server';
import { db } from "../db";
import { packages } from "../db/schema";
require('dotenv').config();
const app = new Hono();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

app.get('/', (c) => c.json({ status: 'healthy' }));

app.get('/packages/:id', async (c) => {
  const id = c.req.param('id');
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ package: data });
});

app.get('/get-package', async (c) => {
  const { package_name, hard_search } = c.req.query();
  
  try {
    // let query = supabase.from('packages');
    const allUsers = await db.select().from(packages);
    
    
    return c.json({ packages: allUsers});
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export { app, supabase };