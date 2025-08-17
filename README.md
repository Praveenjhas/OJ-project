#  CodeZone — Online Judge Platform

An interactive and customizable **Online Judge (OJ)** platform where users can practice coding problems filtered by **difficulty** and **topics**, submit solutions, and receive verdicts like **AC, Compilation Error, Runtime Error, TLE, MLE**.

---

##  Features

- **Problem List**: Browse coding questions filtered by topics and difficulty (Easy, Medium, Hard).
- **Search & Filter**: Instantly find problems with topic-based filters and sorting.
- **Problem Details**: View problem statements with description, constraints, and examples.
- **Code Execution & Verdicts**: Judge supports:
  - Accepted (AC)  
  - Compilation Error (CE)  
  - Runtime Error (RE)  
  - Time Limit Exceeded (TLE)  
  - Memory Limit Exceeded (MLE)  
-  **Responsive UI**: Mobile-first design using Tailwind CSS.
-  **Authentication**: Secure user signup/login with JWT.
-  **Submissions Tracking**: User can view past submissions and their verdicts.
-  **Discussion Forum**: Threads and replies for community interaction.
-  **Navigation**: Clean SPA routing using React Router.

---

## 🛠 Tech Stack

| Layer         | Technology                                |
|---------------|-------------------------------------------|
| **Frontend**  | React (Vite), Tailwind CSS, React Router  |
| **Backend**   | Node.js, Express, Mongoose                |
| **Database**  | MongoDB                                   |
| **Judge**     | Docker-based sandbox with C++, Python, Java, etc. |
| **Deployment**| Docker, GCP  Virtual Machine         |

---

## 📂 Project Structure
```
oj/
├── frontend/ # React + Vite frontend
│ ├── src/
│ │ ├── components/ # Navbar, Filters, ProblemTable, etc.
│ │ ├── pages/ # HomePage, ProblemsPage, ProblemDetailsPage
│ │ ├── services/ # API services
│ │ ├── App.jsx
│ │ └── main.jsx
│ └── package.json
│
├── server/ # Node.js + Express backend
│ ├── models/ # User, Problem, Submission, Thread
│ ├── controllers/ # Auth, Problem, Submission, Discussion
│ ├── routes/ # API routes
│ ├── utils/ # Judge execution utils
│ └── server.js
│
├── judge/ # Judge container (compilers, runner, sandbox)
│ └── Dockerfile
│
├── docker-compose.yaml # Local multi-service setup
└── README.md
```

---

---

##  Local Development

### Prerequisites
- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### Run with Docker Compose

```bash
docker-compose up --build
---



