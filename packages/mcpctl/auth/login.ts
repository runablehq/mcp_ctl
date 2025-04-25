import { execSync } from 'child_process';
import http from 'http';
import open from 'open';
import { randomBytes } from 'crypto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
require('dotenv').config();
interface AuthProvider {
  name: string;
  authorizeUrl: string;
  tokenUrl: string;
  clientId: string;
  scope: string[];
  configKey: string;
}

const providers: Record<string, AuthProvider> = {
  github: {
    name: 'GitHub',
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    clientId: process.env.GITHUB_CLIENT_ID || 'your_github_client_id',
    scope: [
        'repo',              // Full control of private repositories
        'write:org',         // Write access to organization
        'workflow',          // Update GitHub Action workflows
        'write:packages',    // Write access to packages
        'delete:packages',   // Delete access to packages    // Access notifications
      ],
    configKey: 'github_token'
  }
  // Add more providers here
};

export async function handleLogin(provider: string): Promise<void> {
  const authProvider = providers[provider.toLowerCase()];
  console.log('Auth provider', authProvider);
  if (!authProvider) {
    throw new Error(`Unsupported login provider: ${provider}`);
  }

  const state = randomBytes(16).toString('hex');
  const port = 3333;
  console.log(`port`, port);
  
  // Create local server to handle OAuth callback
  const server = http.createServer(async (req, res) => {
    if (!req.url?.includes('/oauth/callback')) {
      res.writeHead(404);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://localhost:${port}`);
    console.log('url', url);
    const code = url.searchParams.get('code');
    console.log('code', code);
    const returnedState = url.searchParams.get('state');
    console.log('returnedState', returnedState);

    if (returnedState !== state) {
      res.writeHead(400);
      res.end('Invalid state parameter');
      return;
    }

    if (code) {
      try {
        const token = await exchangeCodeForToken(authProvider, code);
        saveToken(authProvider.configKey, token);
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Authentication successful!</h1><p>You can close this window and return to the CLI.</p>');
        
        server.close();
      } catch (error) {
        res.writeHead(500);
        res.end('Authentication failed');
        server.close();
      }
    }
  });

  server.listen(port);

  const authUrl = new URL(authProvider.authorizeUrl);
  console.log('authUrl', authUrl);
  authUrl.searchParams.append('client_id', authProvider.clientId);
  authUrl.searchParams.append('scope', authProvider.scope.join(' '));
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('redirect_uri', `http://localhost:${port}/oauth/callback`);
  console.log('authUrl', authUrl.toString());

  console.log(`Opening ${authProvider.name} login page...`);
  await open(authUrl.toString());
}

async function exchangeCodeForToken(provider: AuthProvider, code: string): Promise<string> {
  const response = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: provider.clientId,
      client_secret: process.env[`${provider.name.toUpperCase()}_CLIENT_SECRET`],
      code,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

function saveToken(key: string, token: string): void {
  const configDir = path.join(homedir(), '.config', 'mcpctl');
  const configFile = path.join(configDir, 'auth.json');

  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  let config = {};
  try {
    config = require(configFile);
  } catch {
    // File doesn't exist yet
  }

  writeFileSync(
    configFile,
    JSON.stringify({
      ...config,
      [key]: token
    }, null, 2)
  );
  console.log(`Token saved at: ${configFile}`);
}