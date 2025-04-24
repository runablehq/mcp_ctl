<div align="center">

# mcp_ctl

### A powerful package manager for MCP (Model Context Protocol) servers ✨

[![Discord](https://img.shields.io/badge/discord-purple.svg)](https://discord.gg/BcWWRCnap6)

https://github.com/user-attachments/assets/eb618219-c638-4546-b2e3-865f46a4c3ab

</div>

## 📦 Installation

```sh
npm install -g mcpctl
```

## 🔧 Usage

```sh
# 🔍 Install a server
mcpctl install playwright # install playwright server

# 🗑️ Remove a server 
mcpctl remove playwright # remove playwright server

# 🔎 Search for servers
mcpctl packages github # search for mcp server with specific name

# 📋 List installed servers
mcpctl list # show existing mcp servers installed on the device
```


## 🛠 Development Setup

1. Clone the repository:
git clone https://github.com/cloudycotton/mcp_ctl.git
cd mcp_ctl


2. Install dependencies:
npm install


4. Run development commands:

# List packages
npm run dev -- packages

# Search for specific package
npm run dev -- search github

# Install a package
npm run dev -- install playwright

# List installed servers
npm run dev -- list

## Adding your own package.

1. Clone the repo
2. Add your package to packages folder
3. Add import from it inside packages.ts


## 🌟 Features

- 🔄 Simple installation and management of MCP servers
- 🔍 Easy discovery of available packages
- 📱 Cross-platform support
- ⚡ Lightweight and fast
- 🧩 Seamless integration with your workflow

## 📄 License

<div align="center">

This project is licensed under the [MIT License](LICENSE) 📝

---

<sub>Made with ❤️ for the MCP community</sub>

</div>
