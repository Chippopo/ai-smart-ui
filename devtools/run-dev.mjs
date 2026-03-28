import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const isWin = process.platform === "win32";
const root = process.cwd();
const finalProjectDir = path.join(root, "final_year_project");
const colorVenvPython = path.join(finalProjectDir, ".venv", "Scripts", "python.exe");
const backendDir = path.join(root, "backend");
const backendVenvPython = path.join(backendDir, ".venv", "Scripts", "python.exe");
const dryRun = process.argv.includes("--dry-run");

const children = [];
let shuttingDown = false;

function log(msg) {
  process.stdout.write(`[dev-runner] ${msg}\n`);
}

async function isHttpRunning(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

function spawnProc(command, args, options = {}) {
  log(`Starting: ${command} ${args.join(" ")}`);
  if (dryRun) return null;

  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
    windowsHide: false,
    ...options,
  });

  children.push(child);
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const c of children) {
    if (c && !c.killed) {
      try {
        c.kill("SIGTERM");
      } catch {
        // ignore kill errors
      }
    }
  }

  setTimeout(() => process.exit(code), 400);
}

function hookChild(child, name) {
  if (!child) return;

  child.on("error", (err) => {
    if (shuttingDown) return;
    log(`${name} failed to start: ${err?.message || err}`);
    shutdown(1);
  });

  child.on("exit", (code) => {
    if (shuttingDown) return;
    log(`${name} exited with code ${code ?? "null"}`);
    shutdown(code ?? 1);
  });
}

async function main() {
  if (!fs.existsSync(finalProjectDir)) {
    log(`Warning: final_year_project folder not found at ${finalProjectDir}`);
  }
  if (!fs.existsSync(backendDir)) {
    log(`Warning: backend folder not found at ${backendDir}`);
  }

  const layoutApiAlreadyUp = await isHttpRunning("http://127.0.0.1:5000/");
  if (layoutApiAlreadyUp) {
    log("Layout API already running on 127.0.0.1:5000. Skipping backend startup.");
  } else if (fs.existsSync(backendDir)) {
    let layoutCmd;
    let layoutArgs;

    if (isWin && fs.existsSync(backendVenvPython)) {
      layoutCmd = backendVenvPython;
      layoutArgs = ["app.py"];
    } else {
      log("Backend .venv not found. Using global Python 3.10. Install backend deps if missing.");
      layoutCmd = isWin ? "py" : "python3";
      layoutArgs = isWin ? ["-3.10", "app.py"] : ["app.py"];
    }

    const layoutApi = spawnProc(layoutCmd, layoutArgs, { cwd: backendDir });
    hookChild(layoutApi, "Layout API");
  }

  const colorApiAlreadyUp = await isHttpRunning("http://127.0.0.1:8000/");
  if (colorApiAlreadyUp) {
    log("Color API already running on 127.0.0.1:8000. Skipping color startup.");
  } else if (fs.existsSync(finalProjectDir)) {
    let colorCmd;
    let colorArgs;

    if (isWin && fs.existsSync(colorVenvPython)) {
      colorCmd = colorVenvPython;
      colorArgs = ["-m", "uvicorn", "api_server:app", "--host", "127.0.0.1", "--port", "8000"];
    } else {
      colorCmd = isWin ? "py" : "python3";
      colorArgs = isWin
        ? ["-3.10", "-m", "uvicorn", "api_server:app", "--host", "127.0.0.1", "--port", "8000"]
        : ["-m", "uvicorn", "api_server:app", "--host", "127.0.0.1", "--port", "8000"];
    }

    const colorApi = spawnProc(colorCmd, colorArgs, { cwd: finalProjectDir });
    hookChild(colorApi, "Color API");
  }

  const viteEntry = path.join(root, "node_modules", "vite", "bin", "vite.js");
  const viteCmd = process.execPath;
  const viteArgs = [viteEntry];
  const vite = spawnProc(viteCmd, viteArgs, { cwd: root });
  hookChild(vite, "Vite");

  if (dryRun) {
    log("Dry run complete.");
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

main().catch((err) => {
  log(`Fatal error: ${err?.message || err}`);
  process.exit(1);
});
