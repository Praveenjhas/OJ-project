import { dir } from "tmp-promise";
import fs from "fs-extra";
import path from "path";
import { spawn } from "child_process";

export async function runUserCode({ code, language, input, timeLimitMs }) {
  if (!["java", "cpp", "python"].includes(language)) {
    return { error: `Language '${language}' not supported` };
  }

  const tempBase = "/tmp/oj-tmp";
  await fs.ensureDir(tempBase);

  // tmp-promise dir must be relative to /tmp, so pass absolute path under /tmp
  const { path: workDir, cleanup } = await dir({
    dir: tempBase,
    unsafeCleanup: true,
  });

  try {
    const ext =
      language === "java" ? "java" : language === "cpp" ? "cpp" : "py";
    const fname = `Main_${Date.now()}.${ext}`;
    const filePath = path.join(workDir, fname);

    await fs.writeFile(filePath, code, "utf8");

    console.log(`[codeExecutor] Writing code to: ${filePath}`);
    console.log(`[codeExecutor] Files in workDir:`, await fs.readdir(workDir));

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

    console.log(
      "[codeExecutor] Running docker:",
      ["docker", ...args].join(" ")
    );

    const child = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });

    if (input) child.stdin.write(input.endsWith("\n") ? input : input + "\n");
    child.stdin.end();

    let stdout = "",
      stderr = "";

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

    console.log(`[codeExecutor] Docker exited with code ${exitCode}`);

    if (exitCode === 137) return { error: "Time Limit Exceeded" };
    if (exitCode !== 0)
      return { error: stderr.trim() || `Exited with code ${exitCode}` };

    return { output: stdout.replace(/\r/g, "").trimEnd() + "\n" };
  } catch (err) {
    console.error("[codeExecutor] Internal Error:", err);
    return { error: `Internal Error: ${err.message}` };
  } finally {
    try {
      await cleanup();
    } catch (_) {}
  }
}
