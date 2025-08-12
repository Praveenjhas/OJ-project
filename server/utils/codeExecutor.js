// server/utils/codeExecutor.js
import { dir } from "tmp-promise";
import fs from "fs-extra";
import path from "path";
import { spawn } from "child_process";
import os from "os"; // <-- new import

export async function runUserCode({ code, language, input, timeLimitMs, memoryLimitMb = 512 }) {
  if (!["java", "cpp", "python"].includes(language)) {
    return { verdict: "Error", error: `Unsupported language '${language}'` };
  }

  const tempBase = "/tmp/oj-tmp";
  await fs.ensureDir(tempBase);

  const { path: workDir, cleanup } = await dir({
    dir: tempBase,
    unsafeCleanup: true,
  });

  try {
    const ext = language === "java" ? "java" : language === "cpp" ? "cpp" : "py";
    const fname = `Main_${Date.now()}.${ext}`;
    const filePath = path.join(workDir, fname);

    const normalizedCode = code.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    await fs.writeFile(filePath, normalizedCode, "utf8");

    const args = [
      "run",
      "--rm",
      "-i",
      "-v",
      `${workDir}:/sandbox:rw`,
      "oj-judge:latest",
      language,
      `${timeLimitMs}`,
      `${memoryLimitMb}`,
    ];

    const child = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });

    if (input) {
      child.stdin.write(input.endsWith("\n") ? input : input + "\n");
    }
    child.stdin.end();

    // Collect docker runtime logs (optional, useful for debugging)
    let dockerStdout = "";
    let dockerStderr = "";
    child.stdout.on("data", (c) => (dockerStdout += c.toString()));
    child.stderr.on("data", (c) => {
      dockerStderr += c.toString();
      console.error(`[codeExecutor][stderr] ${c.toString()}`);
    });

    const exitCode = await new Promise((resolve, reject) => {
      child.on("exit", (code, signal) => {
        // If the process exited normally with a code, return it.
        if (code !== null) return resolve(code);

        // If killed by a signal (signal is a string like 'SIGKILL'), map to 128 + signum.
        if (signal) {
          // os.constants.signals maps names to numbers, e.g. { SIGKILL: 9, ... }
          const signum = os.constants && os.constants.signals && os.constants.signals[signal]
            ? os.constants.signals[signal]
            : null;

          if (typeof signum === "number" && signum > 0) {
            return resolve(128 + signum); // e.g. SIGKILL -> 128 + 9 = 137
          }

          // fallback mapping for common signals if os.constants lookup fails
          const fallback = { SIGKILL: 9, SIGTERM: 15, SIGINT: 2 }[signal] ?? null;
          if (fallback) return resolve(128 + fallback);

          // ultimate fallback: return 1 (generic non-zero)
          return resolve(1);
        }

        // neither code nor signal present (weird) -> generic code 1
        return resolve(1);
      });
      child.on("error", (err) => reject(err));
    });


    // Paths on the host (workDir) — these are created by entrypoint.sh
    const outPath = path.join(workDir, "__out.txt");
    const metaPath = path.join(workDir, "__meta.txt");
    const compileErrPath = path.join(workDir, "compile.err");

    // Read compile.err (if present)
    const compileErrExists = await fs.pathExists(compileErrPath);
    let compileErr = "";
    if (compileErrExists) {
      compileErr = (await fs.readFile(compileErrPath, "utf8")).trim();
    }

    // If compile error exists and non-empty -> compilation verdict
    if (compileErr) {
      return {
        verdict: "Compilation Error",
        output: "",
        error: compileErr,
        resourceStats: null,
        exitCode,
        rawDockerStdout: dockerStdout.trim(),
        rawDockerStderr: dockerStderr.trim(),
      };
    }

    // Read program output
    let programOutput = "";
    try{
      if (await fs.pathExists(outPath)) {
        programOutput = (await fs.readFile(outPath, "utf8")).trim();
      } else {
        // fallback: use docker stdout if file missing
        programOutput = dockerStdout.trim();
      }
    }catch(e){
      console.error("Meta parsing failed. Raw meta content:", await fs.readFile(metaPath, "utf8").catch(() => "<unreadable>"));
      return {
        verdict: "Runtime Error",
        output: programOutput || "",
        error: "Meta parsing failed",
        resourceStats: null,
      };
    }
    // Parse __meta.txt
    let executionTime = null;
    let maxMemoryKB = null;
    if (await fs.pathExists(metaPath)) {
      const metaRaw = (await fs.readFile(metaPath, "utf8")).trim();
      // meta format expected: "<elapsed_seconds> <max_rss_kb>" (per your entrypoint -f "%e %M ")
      // Split by whitespace and parse
      const parts = metaRaw.split(/\s+/).filter(Boolean);
      if (parts.length >= 1) {
        const t = parseFloat(parts[0]);
        if (!Number.isNaN(t)) executionTime = t;
      }
      if (parts.length >= 2) {
        const m = parseInt(parts[1], 10);
        if (!Number.isNaN(m)) maxMemoryKB = m;
      }
    }

    // Map docker/timeout exit codes to verdicts (timeout uses 124)
    let verdict = "Accepted";
    if (exitCode === 124) verdict = "Time Limit Exceeded";
    else if (exitCode === 125) verdict = "Execution Failed (timeout command error)";
    else if (exitCode === 126) verdict = "Command Not Executable";
    else if (exitCode === 127) verdict = "Command Not Found";
    else if (exitCode === 137) verdict = "Memory Limit Exceeded"; // <-- removed trailing dot
    else if (exitCode !== 0) verdict = "Runtime Error";
    console.log(exitCode);
    return {
      verdict,
      output: programOutput,
      error: null,
      resourceStats: {
        userTimeSec: executionTime,
        maxMemoryKB,
      },
      exitCode,
      rawDockerStdout: dockerStdout.trim(),
      rawDockerStderr: dockerStderr.trim(),
    };
  } catch (err) {
    return {
      verdict: "Error",
      error: err.message,
      output: "",
    };
  } finally {
    try {
      await cleanup();
    } catch (_) {}
  }
}
