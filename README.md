# Project Tracker (React + Firebase)

A company internal project tracking system built using **React** and **Firebase** to manage **projects, tasks, pending status, and progress tracking**.

This application helps teams monitor project workflow, task assignments, deadlines, and completion progress in real time.

---

## 🚀 Features

### ✅ Authentication
- Firebase Authentication (Email/Password)
- Role-based access (Admin / Member)

### ✅ Project Management
- Add new projects
- Update project status (Pending / In Progress / On Hold / Completed)
- Assign projects to users
- Set deadlines and priority
- Project progress tracking

### ✅ Task Management
- Create tasks under projects
- Assign tasks to team members
- Update task status (Pending / In Progress / Review / Done)
- Track task progress (0–100%)

### ✅ Dashboard
- Total projects count
- Pending projects list
- In-progress projects list
- Completed projects list
- Overdue projects tracking

### ✅ Firestore Database
- Real-time updates
- Secure access rules

---

## 🛠 Tech Stack

- **React (Vite)**
- **Firebase Authentication**
- **Firebase Firestore**
- **Firebase Storage** (optional for attachments)
- **React Router**
- **Tailwind CSS / Bootstrap** (optional UI)

---

## 📁 Project Folder Structure

src/
├── components/
│ ├── Navbar.jsx
│ ├── Sidebar.jsx
│ ├── ProjectCard.jsx
│ ├── TaskTable.jsx
│ ├── ProgressBar.jsx
│ ├── StatusBadge.jsx
│ ├── AddProjectModal.jsx
│ ├── AddTaskModal.jsx
│
├── pages/
│ ├── Login.jsx
│ ├── Dashboard.jsx
│ ├── Projects.jsx
│ ├── ProjectDetails.jsx
│ ├── Team.jsx
│ ├── Reports.jsx
│
├── firebase/
│ ├── firebaseConfig.js
│ ├── auth.js
│ ├── firestore.js
│
├── context/
│ ├── AuthContext.jsx
│
├── hooks/
│ ├── useAuth.js
│ ├── useProjects.js
│
├── utils/
│ ├── calculateProgress.js
│ ├── formatDate.js
│
├── App.jsx
└── main.jsx


---

## 🔥 Firebase Setup

### Step 1: Create Firebase Project
1. Go to Firebase Console: https://console.firebase.google.com
2. Click **Add Project**
3. Enable Firestore Database
4. Enable Authentication (Email/Password)

---

### Step 2: Create Firestore Database
Go to:
**Build > Firestore Database > Create Database**

Use **test mode** for development (later set security rules).

---

### Step 3: Enable Authentication
Go to:
**Build > Authentication > Sign-in method**
Enable:
- Email/Password

---

### Step 4: Get Firebase Config Keys
Go to:
**Project Settings > General > Your Apps**
Copy Firebase config and paste into:

📌 `src/firebase/firebaseConfig.js`

Example:

```js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);

## 👥 Roles & Privileges (RBAC)

This application follows **Role-Based Access Control (RBAC)** to manage user permissions.

### 🔑 User Roles
There are 3 main roles:

- **Admin**
- **Project Manager**
- **Team Member**

---

## ✅ Role Permissions Table

| Feature / Action                         | Admin | Project Manager | Team Member |
|------------------------------------------|:-----:|:---------------:|:-----------:|
| Login / Logout                           |  ✅   |       ✅        |     ✅      |
| View Dashboard                           |  ✅   |       ✅        |     ✅      |
| Create Project                           |  ✅   |       ✅        |     ❌      |
| Update Project Details                   |  ✅   |       ✅        |     ❌      |
| Delete Project                           |  ✅   |       ❌        |     ❌      |
| Assign Project to Users                  |  ✅   |       ✅        |     ❌      |
| Change Project Status                    |  ✅   |       ✅        |     ❌      |
| View Assigned Projects                   |  ✅   |       ✅        |     ✅      |
| View All Projects                        |  ✅   |       ✅        |     ❌      |
| Create Task in Project                   |  ✅   |       ✅        |     ❌      |
| Assign Task to Team Member               |  ✅   |       ✅        |     ❌      |
| Update Task Status / Progress            |  ✅   |       ✅        |     ✅      |
| Update Only Own Assigned Tasks           |  ✅   |       ✅        |     ✅      |
| Delete Task                              |  ✅   |       ✅        |     ❌      |
| Add Comments / Updates                   |  ✅   |       ✅        |     ✅      |
| View Reports                             |  ✅   |       ✅        |     ❌      |
| Manage Users (Add / Update / Remove)     |  ✅   |       ❌        |     ❌      |
| View Team Workload                       |  ✅   |       ✅        |     ❌      |
| Access Settings Panel                    |  ✅   |       ❌        |     ❌      |

---

## 📌 Role Definitions

### 🛡 Admin
Admin has full access to the application including:
- User management
- Full project access
- Full task access
- Reports & analytics

---

### 📂 Project Manager
Project Manager can:
- Create and manage projects
- Assign tasks to members
- Track project progress
- View team workload

They cannot delete projects or manage users.

---

### 👷 Team Member
Team Member can:
- View assigned projects
- View assigned tasks
- Update task status & progress
- Add comments

They cannot create/delete projects or assign tasks.

---

## 🗃 Firestore Role Storage

User roles are stored in Firestore under the `users` collection.

Example:

```json

Collection: users
users/
  userId/
    name: "Rahul"
    email: "rahul@gmail.com"
    role: "admin"
    createdAt: timestamp

Collection: projects
projects/
  projectId/
    title: "Website Development"
    description: "Client website build"
    status: "Pending"
    progress: 40
    priority: "High"
    startDate: timestamp
    deadline: timestamp
    assignedUsers: [userId1, userId2]
    createdBy: userId
    createdAt: timestamp

Subcollection: tasks
projects/projectId/tasks/taskId/
    title: "Design homepage"
    description: "UI design"
    status: "In Progress"
    assignedTo: userId
    progress: 50
    createdAt: timestamp
    updatedAt: timestamp

Subcollection: comments
projects/projectId/tasks/taskId/comments/commentId/
    text: "Need manager approval"
    userId: userId
    createdAt: timestamp


import csv file headings:
Title,Description,Status,Priority,Deadline