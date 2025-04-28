// authMiddleware.ts
import { HTTPException } from 'hono/http-exception';

export const authMiddleware = (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const expectedToken = process.env.AUTH_SECRET;
  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }
  
  return next();
};
