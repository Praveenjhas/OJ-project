import { dir } from "tmp-promise";
import fs from "fs-extra";
import path from "path";
import { spawn } from "child_process";

export async function runUserCode({ code, language, input, timeLimitMs }) {
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
    const ext =
      language === "java" ? "java" : language === "cpp" ? "cpp" : "py";
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
    ];

    const child = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });

    if (input) {
      // Ensure input ends with newline
      child.stdin.write(input.endsWith("\n") ? input : input + "\n");
    }
    child.stdin.end();

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      console.error(`[codeExecutor][stderr] ${chunk.toString()}`);
    });

    const exitCode = await new Promise((resolve, reject) => {
      child.on("exit", resolve);
      child.on("error", reject);
    });

    // Parse JSON output produced by entrypoint.sh
    let result;
    try {
      result = JSON.parse(stdout);
    } catch (e) {
      console.error("Judge output parsing failed. Raw stdout:", stdout);
      return {
        verdict: "Runtime Error",
        output: stdout.trim(),
        error: "Judge output parsing failed",
        resourceStats: null,
      };
    }

    return {
      verdict:
        result.verdict || (exitCode === 0 ? "Accepted" : "Runtime Error"),
      output: (result.output || "").trim(),
      error: result.error || null,
      resourceStats: {
        userTimeSec: result.executionTime || null,
        maxMemoryKB: result.memoryUsed || null,
      },
      exitCode,
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
    } catch {}
  }
}
