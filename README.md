# 🍳 RecipeMaster — Full-Stack Recipe Application

A modern, responsive full-stack culinary application built with **React (Vite)**, **Vanilla CSS Design System**, **Express.js**, and **MongoDB (Mongoose)** with instant in-memory fallback.

> 📖 **[Read the Full Project Documentation (System Architecture, ER Diagrams, MVC & Case Study)](./DOCUMENTATION.md)**  
> 🎥 **[Watch the Project Demo Video](https://drive.google.com/file/d/1sqVaimjlWNR3BNE3gP2JIIA6eGEMWjmX/view?usp=drive_link)**  
> 🌐 **Live Website**: [https://recipemaster-ten.vercel.app](https://recipemaster-ten.vercel.app)

---

## ✨ Features

- **🍽️ Gourmet Recipe Discovery**:
  - Curated dishes with high-resolution imagery, prep/cook times, calories, and difficulty ratings.
  - Multi-criteria real-time filtering: search by title, ingredient, category (Breakfast, Lunch, Dinner, Dessert), cuisine (Italian, Mexican, Indian, Mediterranean, French, Asian), cook time, and dietary tags.
  - Sorting options: Fastest, Highest Rated, Lowest Calories, and Alphabetical.

- **⚖️ Dynamic Servings Scaler**:
  - Dynamically recalculates all ingredient measurements in real time based on party size (e.g., scale from 2 to 4 to 8 servings).

- **📝 Interactive Kitchen Prepping & Checklist**:
  - Check off ingredients as you prepare or shop.
  - One-click **Copy Shopping List** to clipboard.

- **⏱️ Integrated Kitchen Cooking Timers**:
  - Per-step countdown timers with minutes and seconds.
  - Persistent **Floating Kitchen Timer** widget with Web Audio chime when cooking time elapses.

- **📅 Weekly Meal Planner**:
  - 7-day schedule (Monday to Sunday) for Breakfast, Lunch, and Dinner.
  - Daily calorie calculation.
  - **Auto-Aggregated Grocery Shopping List** combining all ingredients across your week's meals.

- **❤️ Bookmarks & Favorites**:
  - Save and organize your favorite recipes with one-click toggles and local persistence.

- **✏️ Complete Recipe CRUD**:
  - Add, edit, and delete custom recipes with dynamic ingredient and instruction row builders.
  - Gourmet image preset shortcuts.

- **🍃 Resilient MongoDB Integration**:
  - Seamlessly connects to MongoDB or MongoDB Atlas via `MONGODB_URI`.
  - Automatically falls back to an in-memory seed store if local MongoDB is not running, so the app works immediately out of the box without setup blockers!

---

## 🚀 Quick Start Guide

### 1. Start the Backend API (Port 5000)

```powershell
# From the project root
cd server
npm install
npm start
```
*The backend API will run at `http://localhost:5000`.*

### 2. Start the Frontend Dev Server (Port 5173)

```powershell
# In another terminal at the project root
npm install
npm run dev
```
*The React client will launch at `http://localhost:5173/` and proxies `/api` requests to port 5000.*

---

## ⚙️ MongoDB Configuration

To connect to your local MongoDB or a MongoDB Atlas Cloud cluster:

1. Create a `.env` file in the `server` directory (or copy from `server/.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/recipemaster
   ```
2. For MongoDB Atlas:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/recipemaster?retryWrites=true&w=majority
   ```
3. Restart the server. The live status indicator in the top navbar will update to **MongoDB**.

---

## 🎨 Typography & Aesthetics

- **Headings**: Google Fonts *Bitter* (Warm editorial serif)
- **Body & Controls**: Google Fonts *Figtree* (Clean geometric sans-serif)
- **Themes**: Switch between Dark Mode and Warm Light Mode with the toggle in the navbar.
