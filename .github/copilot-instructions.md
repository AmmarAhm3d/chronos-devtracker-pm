# GitHub Copilot Instructions

## Project Overview

This is a GitHub Codespaces development environment configured with multiple MCP (Model Context Protocol) servers for enhanced AI capabilities. The workspace integrates web scraping, browser automation, GitHub integration, and library documentation tools.

## Architecture

### MCP Server Configuration

All MCP servers are configured in `.vscode/mcp.json`:

1. **Upstash Context7** (`io.github.upstash/context7`) - Library documentation access
2. **GitHub MCP** (`io.github.github/github-mcp-server`) - GitHub API integration
3. **Playwright MCP** (`microsoft/playwright-mcp`) - Browser automation & testing
4. **Chrome DevTools MCP** (`io.github.ChromeDevTools/chrome-devtools-mcp`) - Browser inspection & debugging
5. **Firecrawl MCP** (`firecrawl/firecrawl-mcp-server`) - Web scraping & crawling

### Server Types

- **HTTP servers**: GitHub MCP (API-based)
- **stdio servers**: All others (npx-based, executed on demand)

## Development Environment

### Container Setup

- **OS**: Ubuntu 24.04.3 LTS (dev container)
- **Shell**: bash
- **Browser**: Use `"$BROWSER" <url>` to open URLs in host browser

### Available CLI Tools

Package management: `apt`, `dpkg`  
Containers: `docker`, `kubectl`  
Version control: `git`, `gh`  
Network: `curl`, `wget`, `ssh`, `scp`, `rsync`  
Utilities: `tree`, `find`, `grep`, `zip`, `tar`, `gzip`

## MCP Server Usage Patterns

### Context7 (Library Documentation)

```bash
# Access library docs using format: /org/project or /org/project/version
# Examples: /vercel/next.js, /facebook/react, /vercel/next.js/v14.3.0
```

**Usage**: Get up-to-date documentation for popular libraries before implementing features.

### GitHub MCP

**Authentication**: Requires PAT or App token in Authorization header.

**Common workflows**:
- Create/update issues and PRs programmatically
- Search repositories and code
- Manage branches, commits, and releases
- Review pull requests

### Playwright MCP

**Purpose**: Automate browser testing, form filling, navigation.

**Key capabilities**:
- Run Playwright code snippets directly
- Execute browser automation scripts
- Test web application functionality
- Simulate user interactions

### Chrome DevTools MCP

**Purpose**: Browser inspection, performance analysis, debugging.

**Key capabilities**:
- Evaluate JavaScript in browser context
- Capture screenshots and performance traces
- Monitor network requests and console messages
- Analyze Core Web Vitals

### Firecrawl MCP

**Purpose**: Web scraping and content extraction.

**Tools**:
- `firecrawl_search`: Search web with scraping (use without formats first, then scrape specific pages)
- `firecrawl_scrape`: Extract content from single URLs (most reliable for known pages)
- `firecrawl_crawl`: Multi-page crawling (watch depth limits)
- `firecrawl_map`: List all URLs on a site
- `firecrawl_extract`: LLM-based structured data extraction

**Best practices**:
1. Search first without formats to find relevant pages
2. Use scrape on specific URLs for detailed content
3. Keep crawl limits low (5 or fewer) to avoid timeouts

## API Key Management

All MCP servers requiring authentication use VS Code input prompts (defined in `mcp.json`):

- `CONTEXT7_API_KEY`: Upstash Context7 authentication
- `Authorization`: GitHub PAT/App token
- `api_key`: Firecrawl API key

Keys are requested on first use and stored in VS Code settings.

## Common Workflows

### Research & Documentation

1. Use Context7 to fetch library docs: `/vercel/next.js`
2. Use Firecrawl search for broader web research
3. Use GitHub MCP to search code examples

### Browser Testing

1. Use Playwright MCP for functional testing
2. Use Chrome DevTools MCP for debugging and performance analysis
3. Combine both for comprehensive testing workflows

### Content Extraction

1. Use Firecrawl search to find relevant pages
2. Use Firecrawl scrape for detailed content extraction
3. Use Firecrawl extract for structured data with JSON schema

## Project Conventions

- MCP servers are version-pinned in `mcp.json` (except Playwright and Firecrawl using `@latest`)
- All stdio servers use `npx` for zero-install execution
- Firecrawl uses `-y` flag for automatic yes to prompts
- Sensitive data (API keys) never hardcoded - use VS Code input prompts

## Integration Points

- **VS Code**: MCP server lifecycle managed by editor
- **GitHub Copilot**: Enhanced with MCP server capabilities
- **Node.js/npx**: Required for stdio server execution
- **External APIs**: Upstash, GitHub, Firecrawl services
