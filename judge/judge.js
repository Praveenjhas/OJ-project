// judge/judge.js
import express from "express";
import { runUserCode } from "./executor";
const app = express();
app.use(express.json());

app.post("/run", async (req, res) => {
  const { language, code, input, timeLimit } = req.body;
  // Validate language here
  if (!["java"].includes(language)) {
    return res.status(400).json({ error: "Unsupported language" });
  }
  const result = await runUserCode({ code, language, input, timeLimit });
  res.json(result);
});

app.listen(process.env.PORT || 5000);
