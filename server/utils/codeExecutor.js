import { dir } from "tmp-promise";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { spawn } from "child_process";
import path from "path";

/**
 * Writes user code to a temp file, compiles (with a longer timeout),
 * runs it (with the problem’s timeout), and returns { output } or { error }.
 */
export async function runUserCode({ code, language, input, timeLimitMs }) {
  const { path: workDir, cleanup } = await dir({ unsafeCleanup: true });

  try {
    let srcFile, compileCmd, compileArgs, runCmd, runArgs, execCwd;

    if (language === "cpp") {
      const id = uuidv4();
      srcFile = path.join(workDir, `Main_${id}.cpp`);
      const binFile = path.join(workDir, `Main_${id}.out`);
      await fs.writeFile(srcFile, code, "utf8");

      compileCmd = "g++";
      compileArgs = [srcFile, "-O2", "-std=c++17", "-o", binFile];
      runCmd = binFile;
      runArgs = [];
    } else if (language === "java") {
      srcFile = path.join(workDir, "Main.java");
      await fs.writeFile(srcFile, code, "utf8");

      compileCmd = "javac";
      compileArgs = ["Main.java"];
      runCmd = "java";
      runArgs = ["Main"];
      execCwd = workDir;
    } else if (language === "python") {
      srcFile = path.join(workDir, `script_${uuidv4()}.py`);
      await fs.writeFile(srcFile, code, "utf8");

      compileCmd = null;
      runCmd = "python3";
      runArgs = [srcFile];
    } else {
      return { error: "Unsupported language" };
    }

    // 1) Compile with a 5-second timeout
    if (compileCmd) {
      try {
        await execCommand(compileCmd, compileArgs, 5000, "", execCwd);
      } catch (err) {
        return { error: `Compilation Error:\n${err.message}` };
      }
    }

    // 2) Run with the problem’s time limit
    try {
      const output = await execCommand(
        runCmd,
        runArgs,
        timeLimitMs,
        input,
        execCwd
      );
      return { output };
    } catch (err) {
      if (err.message.includes("Time Limit Exceeded")) {
        return { error: "Time Limit Exceeded" };
      }
      return { error: `Runtime Error:\n${err.message}` };
    }
  } catch (err) {
    return { error: `Internal Error:\n${err.message}` };
  } finally {
    // swallow cleanup errors (EBUSY on Windows)
    try {
      await cleanup();
    } catch {
      /* ignore */
    }
  }
}

/**
 * Spawn a process, feed stdinData, enforce timeout.
 * Resolves with stdout or rejects with an Error.
 */
function execCommand(cmd, args = [], timeoutMs, stdinData = "", cwd) {
  return new Promise((resolve, reject) => {
    const opts = { stdio: ["pipe", "pipe", "pipe"] };
    if (cwd) opts.cwd = cwd;

    let child;
    try {
      child = spawn(cmd, args, opts);
    } catch (err) {
      return reject(new Error(`Failed to launch '${cmd}': ${err.message}`));
    }

    let stdout = "",
      stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Time Limit Exceeded"));
    }, timeoutMs);

    if (stdinData) child.stdin.write(stdinData);
    child.stdin.end();

    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));

    child.on("exit", (code, signal) => {
      clearTimeout(timer);
      if (signal === "SIGKILL") return reject(new Error("Time Limit Exceeded"));
      if (code !== 0) return reject(new Error(stderr || `Exited ${code}`));
      resolve(stdout);
    });
  });
}
