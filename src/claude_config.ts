import path from "node:path";
import os from "node:os";
import fs from "fs/promises";

// Config file management
export function getClaudeConfigDir(): string {
  switch (os.platform()) {
    case "darwin":
      return path.join(
        os.homedir(),
        "Library",
        "Application Support",
        "Claude"
      );
    case "win32":
      if (!process.env.APPDATA) {
        throw new Error("APPDATA environment variable is not set");
      }
      return path.join(process.env.APPDATA, "Claude");
    case "linux":
      return path.join(os.homedir(), ".config", "claude");
    default:
      throw new Error(
        `Unsupported operating system for Claude configuration: ${os.platform()}`
      );
  }
}

export async function readClaudeConfig() {
  const configDir = getClaudeConfigDir();
  const configFile = path.join(configDir, "claude_desktop_config.json");

  try {
    const rawConfig = await fs.readFile(configFile, "utf-8");
    return JSON.parse(rawConfig);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      // File doesn't exist, create initial config
      const initialConfig = { mcpServers: {} };
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(configFile, JSON.stringify(initialConfig, null, 2));
      return initialConfig;
    }
    throw err;
  }
}

export async function writeClaudeConfig(config: any) {
  const configDir = getClaudeConfigDir();
  const configFile = path.join(configDir, "claude_desktop_config.json");
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(configFile, JSON.stringify(config, null, 2));
}

async function updateClaudeConfig({
  name,
  command,
  args,
  env,
}: {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}) {
  try {
    const config = await readClaudeConfig();

    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    if (config.mcpServers[name]) {
      const { replace } = await inquirer.prompt([
        {
          type: "confirm",
          name: "replace",
          message: `An MCP server named "${name}" is already configured. Do you want to replace it?`,
          default: false,
        },
      ]);

      if (!replace) {
        console.log(
          term.yellow(
            `⚠️ Skipped replacing config for existing MCP server "${name}"`
          )
        );
        return;
      }
    }

    config.mcpServers[name] = {
      command,
      args,
      env,
    };

    await writeClaudeConfig(config);
    console.log(
      term.green("✅ Successfully added MCP server to Claude configuration")
    );
  } catch (error) {
    console.error(term.red("⚠️ Failed to update Claude configuration"), error);
  }
}
