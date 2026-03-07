// server/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

import Problem from "./models/Problem.js";
import Blog from "./models/Blog.js";
import BlogBody from "./models/BlogBody.js";
import Comment from "./models/Comment.js";
import Vote from "./models/Vote.js";
import User from "./models/User.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const problemsSeedPath = path.join(__dirname, "fake_problems_seed.json");

const sampleUsers = [
  {
    username: "AaravSharma",
    email: "aarav.sharma@codezone.dev",
    bio: "Backend engineer focused on Node.js, APIs, and system design.",
  },
  {
    username: "PriyaNair",
    email: "priya.nair@codezone.dev",
    bio: "Competitive programmer who likes DP and graph problems.",
  },
  {
    username: "RohanMehta",
    email: "rohan.mehta@codezone.dev",
    bio: "Frontend developer exploring algorithmic problem solving.",
  },
  {
    username: "NehaKapoor",
    email: "neha.kapoor@codezone.dev",
    bio: "SDE interview mentor and DSA content creator.",
  },
  {
    username: "VikramSingh",
    email: "vikram.singh@codezone.dev",
    bio: "Enjoys writing clean code and solving medium-hard arrays.",
  },
  {
    username: "IshitaVerma",
    email: "ishita.verma@codezone.dev",
    bio: "Problem setter interested in graphs, strings, and edge cases.",
  },
];

const samplePosts = [
  {
    author: "NehaKapoor",
    title: "Weekly DSA Roadmap for Beginners (4-Week Plan)",
    likesCount: 38,
    dislikesCount: 1,
    hoursAgo: 36,
    content: `<p>If you are just starting out with DSA, follow this sequence:</p>
<ul>
  <li><strong>Week 1:</strong> Arrays, HashMap, basic sorting.</li>
  <li><strong>Week 2:</strong> Strings, Sliding Window, Two Pointers.</li>
  <li><strong>Week 3:</strong> Recursion basics and Dynamic Programming intro.</li>
  <li><strong>Week 4:</strong> Graph traversals (BFS/DFS) and mixed practice.</li>
</ul>
<p>Try to solve at least 3 problems daily and revise every Sunday.</p>`,
  },
  {
    author: "AaravSharma",
    title: "How I Improved from 1 to 4 Accepted Problems per Day",
    likesCount: 29,
    dislikesCount: 0,
    hoursAgo: 18,
    content: `<p>The biggest change for me was tracking mistakes.</p>
<ol>
  <li>After each failed submission, I wrote one line about the bug.</li>
  <li>I grouped mistakes: boundary, overflow, wrong assumption, complexity.</li>
  <li>I re-solved the same problem after 48 hours without seeing old code.</li>
</ol>
<p>This built consistency much faster than randomly attempting new questions.</p>`,
  },
  {
    author: "PriyaNair",
    title: "DP Pattern Cheat Sheet: 5 Templates You Should Master",
    likesCount: 52,
    dislikesCount: 2,
    hoursAgo: 10,
    content: `<p>When solving DP, first identify the state and transition clearly.</p>
<p>Useful templates:</p>
<ul>
  <li>1D DP (Climbing Stairs, House Robber)</li>
  <li>2D Grid DP (Unique Paths)</li>
  <li>Knapsack-style DP (Coin Change)</li>
  <li>String DP (LCS, Edit Distance)</li>
  <li>Partition DP (Palindrome Partitioning)</li>
</ul>
<p>If you want, I can post starter code for each template.</p>`,
  },
  {
    author: "RohanMehta",
    title: "Best Way to Practice Sliding Window Without Memorizing",
    likesCount: 21,
    dislikesCount: 0,
    hoursAgo: 6,
    content: `<p>I stopped memorizing exact patterns and started using this checklist:</p>
<ul>
  <li>What does the window represent?</li>
  <li>When do I expand?</li>
  <li>When do I shrink?</li>
  <li>What value is updated at each step?</li>
</ul>
<p>This works for longest substring, minimum window, and anagram problems.</p>`,
  },
  {
    author: "IshitaVerma",
    title: "Common Interview Traps in Graph Questions",
    likesCount: 34,
    dislikesCount: 1,
    hoursAgo: 3,
    content: `<p>Graph questions usually test clarity more than code length.</p>
<p>Three common traps:</p>
<ul>
  <li>Forgetting to mark visited before recursive calls.</li>
  <li>Not handling disconnected components.</li>
  <li>Using DFS where BFS shortest path is expected.</li>
</ul>
<p>Always ask if the graph is directed, weighted, and 0-indexed or 1-indexed.</p>`,
  },
  {
    author: "VikramSingh",
    title: "Share Your Favorite Warm-Up Problem Before Contests",
    likesCount: 17,
    dislikesCount: 0,
    hoursAgo: 1,
    content: `<p>Before contests I solve 2 warm-up problems:</p>
<ul>
  <li>One easy Array/String problem for speed.</li>
  <li>One medium problem for logic activation.</li>
</ul>
<p>Drop your favorites below. I want to build a quick warm-up list for everyone.</p>`,
  },
];

const commentSeed = [
  {
    key: "roadmap-q1",
    postTitle: "Weekly DSA Roadmap for Beginners (4-Week Plan)",
    author: "RohanMehta",
    body: "This is great. Do you recommend solving by topic or mixed sets from day one?",
  },
  {
    key: "dp-q1",
    postTitle: "DP Pattern Cheat Sheet: 5 Templates You Should Master",
    author: "AaravSharma",
    body: "Please share a short note on how you decide between memoization and tabulation.",
  },
  {
    key: "graph-q1",
    postTitle: "Common Interview Traps in Graph Questions",
    author: "PriyaNair",
    body: "Agree on BFS vs DFS confusion. This costs people easy marks in interviews.",
  },
  {
    postTitle: "How I Improved from 1 to 4 Accepted Problems per Day",
    author: "NehaKapoor",
    body: "The 48-hour re-solve rule is solid advice. It really improves retention.",
  },
  {
    postTitle: "Share Your Favorite Warm-Up Problem Before Contests",
    author: "IshitaVerma",
    body: "Two Sum and Valid Parentheses are still my go-to warm-up combo.",
  },
];

const replySeed = [
  {
    postTitle: "Weekly DSA Roadmap for Beginners (4-Week Plan)",
    parentKey: "roadmap-q1",
    author: "NehaKapoor",
    body: "Start topic-wise for 2 weeks, then move to mixed sets from week 3.",
  },
  {
    postTitle: "DP Pattern Cheat Sheet: 5 Templates You Should Master",
    parentKey: "dp-q1",
    author: "PriyaNair",
    body: "Memoization is faster to write. Tabulation is usually cleaner to optimize.",
  },
  {
    postTitle: "Common Interview Traps in Graph Questions",
    parentKey: "graph-q1",
    author: "IshitaVerma",
    body: "Exactly. I now ask candidates to justify BFS or DFS before coding.",
  },
];

async function ensureSampleUsers() {
  const userMap = new Map();
  const hash = await bcrypt.hash("CodeZone@123", 10);

  for (const user of sampleUsers) {
    const doc = await User.findOneAndUpdate(
      { username: user.username },
      {
        $setOnInsert: {
          username: user.username,
          email: user.email,
          password: hash,
          bio: user.bio,
          role: "user",
        },
      },
      { new: true, upsert: true },
    );

    userMap.set(user.username, doc);
  }

  return userMap;
}

async function seedProblems() {
  const raw = fs.readFileSync(problemsSeedPath, "utf-8");
  const data = JSON.parse(raw);

  await Problem.deleteMany({});
  const inserted = await Problem.insertMany(data);

  console.log(`Seeded ${data.length} curated problems`);
  return inserted;
}

async function seedLeaderboard(userMap, problems) {
  const plan = [
    { username: "AaravSharma", solved: 16 },
    { username: "PriyaNair", solved: 14 },
    { username: "NehaKapoor", solved: 12 },
    { username: "IshitaVerma", solved: 10 },
    { username: "VikramSingh", solved: 8 },
    { username: "RohanMehta", solved: 6 },
  ];

  const allProblemIds = problems.map((p) => p._id);
  const solvedCounter = new Map(allProblemIds.map((id) => [String(id), 0]));

  await Problem.updateMany({}, { $set: { solvedCount: 0 } });

  for (let i = 0; i < plan.length; i += 1) {
    const row = plan[i];
    const user = userMap.get(row.username);
    if (!user) continue;

    // Rotate the starting index so users don't all solve the same prefix problems.
    const start = (i * 3) % allProblemIds.length;
    const solvedIds = [];

    for (let j = 0; j < row.solved; j += 1) {
      const idx = (start + j) % allProblemIds.length;
      solvedIds.push(allProblemIds[idx]);
      const key = String(allProblemIds[idx]);
      solvedCounter.set(key, (solvedCounter.get(key) || 0) + 1);
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { solvedProblems: solvedIds } },
    );
  }

  const ops = [];
  for (const [id, solvedCount] of solvedCounter.entries()) {
    ops.push({
      updateOne: {
        filter: { _id: id },
        update: { $set: { solvedCount } },
      },
    });
  }

  if (ops.length) {
    await Problem.bulkWrite(ops);
  }

  console.log("Seeded leaderboard solved-count distribution");
}

async function seedDiscussions(userMap) {
  await Vote.deleteMany({});
  await Comment.deleteMany({});
  await BlogBody.deleteMany({});
  await Blog.deleteMany({});

  const now = Date.now();
  const blogDocs = await Blog.insertMany(
    samplePosts.map((post) => ({
      authorId: userMap.get(post.author)._id,
      title: post.title,
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      createdAt: new Date(now - post.hoursAgo * 60 * 60 * 1000),
      updatedAt: new Date(now - post.hoursAgo * 60 * 60 * 1000),
    })),
  );

  await BlogBody.insertMany(
    blogDocs.map((blog, idx) => ({
      blogId: blog._id,
      content: samplePosts[idx].content,
    })),
  );

  const blogByTitle = new Map(blogDocs.map((b) => [b.title, b]));
  const commentByKey = new Map();

  for (const entry of commentSeed) {
    const blog = blogByTitle.get(entry.postTitle);
    const user = userMap.get(entry.author);
    if (!blog || !user) continue;

    const doc = await Comment.create({
      blogId: blog._id,
      userId: user._id,
      body: entry.body,
      parentId: null,
      ancestors: [],
    });

    if (entry.key) commentByKey.set(entry.key, doc);
  }

  for (const reply of replySeed) {
    const blog = blogByTitle.get(reply.postTitle);
    const user = userMap.get(reply.author);
    const parent = commentByKey.get(reply.parentKey);
    if (!blog || !user || !parent) continue;

    await Comment.create({
      blogId: blog._id,
      userId: user._id,
      body: reply.body,
      parentId: parent._id,
      ancestors: [parent._id],
    });
  }

  console.log(`Seeded ${blogDocs.length} curated discussion posts`);
}

async function runSeed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const userMap = await ensureSampleUsers();
    const problems = await seedProblems();
    await seedLeaderboard(userMap, problems);
    await seedDiscussions(userMap);

    console.log("Seed completed successfully");
    console.log("Sample users password: CodeZone@123");
  } catch (err) {
    console.error("Seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

runSeed();
