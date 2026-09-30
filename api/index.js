import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Recipe, User, Pantry, Favorite, MealPlan, Shopping } from './models/Recipe.js';
import { seedRecipes } from './data/seedRecipes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recipemaster';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-Memory Fallback
let isMongoConnected = false;
let inMemoryRecipes = seedRecipes.map((r, idx) => ({
  ...r,
  _id: new mongoose.Types.ObjectId().toString(),
  createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - idx * 86400000).toISOString()
}));
let inMemoryUsers = [
  {
    _id: "6abc0fa1b42df4aaafbff3f8",
    name: "jaswin",
    email: "jaswin@gmail.com",
    password: "$2b$12$79/MQCHdK2bG3TMwmQc/Su.gytFJfZsgUur6.QzimSArsOcQMiMtK",
    role: "user"
  }
];

// Vercel Serverless MongoDB Connection Middleware
let isSeeding = false;
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(MONGODB_URI, { 
        serverSelectionTimeoutMS: 8000,
        family: 4,
        tls: true
      });
      isMongoConnected = true;
      console.log('[Database] ✅ Successfully connected to MongoDB!');
      
      if (!isSeeding) {
        isSeeding = true;
        const count = await Recipe.countDocuments();
        if (count === 0) {
          console.log('[Database] 🌱 Seeding database with initial gourmet recipes...');
          await Recipe.insertMany(seedRecipes);
          console.log(`[Database] ✅ Seeded ${seedRecipes.length} recipes into MongoDB.`);
        }
      }
    } catch (err) {
      isMongoConnected = false;
      console.warn('[Database] ⚠️ MongoDB not reachable, using in-memory fallback.');
    }
  } else {
    isMongoConnected = true;
  }
  next();
});


// ─── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    
    let existing = null;
    if (isMongoConnected) {
      try { existing = await User.findOne({ email: email.toLowerCase() }); } catch(e) {}
    }
    if (!existing) existing = inMemoryUsers.find(u => u.email === email.toLowerCase());
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });
    
    const hashed = await bcrypt.hash(password, 12);
    let user;
    try {
      user = await User.create({ name: name.trim(), email: email.toLowerCase(), password: hashed });
    } catch(e) {
      user = { _id: new mongoose.Types.ObjectId().toString(), name: name.trim(), email: email.toLowerCase(), password: hashed };
      inMemoryUsers.push(user);
    }
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ error: 'Registration failed', details: err.message }); }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    
    let user;
    if (isMongoConnected) {
      try { user = await User.findOne({ email: email.toLowerCase() }); } catch(e) {}
    }
    if (!user) user = inMemoryUsers.find(u => u.email === email.toLowerCase());
    
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });
    
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ error: 'Login failed', details: err.message }); }
});

// Get profile
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    let user;
    if (isMongoConnected) {
      try { user = await User.findById(req.user.id).select('-password'); } catch(e) {}
    }
    if (!user) user = inMemoryUsers.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update profile
app.put('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const { name, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...(name && { name }), ...(profileImage && { profileImage }) },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── STATUS ───────────────────────────────────────────────────────────────────
app.get('/api/status', async (req, res) => {
  const totalCount = isMongoConnected
    ? await Recipe.countDocuments().catch(() => inMemoryRecipes.length)
    : inMemoryRecipes.length;
  res.json({
    status: 'online',
    appName: 'RecipeMaster API',
    database: isMongoConnected ? 'MongoDB Connected' : 'In-Memory (Active Fallback)',
    isMongoConnected,
    totalRecipes: totalCount,
    timestamp: new Date().toISOString()
  });
});

// ─── CATEGORIES & CUISINES ────────────────────────────────────────────────────
app.get('/api/categories', async (req, res) => {
  try {
    if (isMongoConnected) {
      const categories = await Recipe.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
      return res.json(categories.map(c => ({ name: c._id, count: c.count })));
    }
    const counts = {};
    inMemoryRecipes.forEach(r => { counts[r.category] = (counts[r.category] || 0) + 1; });
    res.json(Object.entries(counts).map(([name, count]) => ({ name, count })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
});

app.get('/api/cuisines', async (req, res) => {
  try {
    if (isMongoConnected) {
      const cuisines = await Recipe.aggregate([{ $group: { _id: '$cuisine', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
      return res.json(cuisines.map(c => ({ name: c._id, count: c.count })));
    }
    const counts = {};
    inMemoryRecipes.forEach(r => { counts[r.cuisine] = (counts[r.cuisine] || 0) + 1; });
    res.json(Object.entries(counts).map(([name, count]) => ({ name, count })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cuisines', details: err.message });
  }
});

// ─── RECIPES ──────────────────────────────────────────────────────────────────
app.get('/api/recipes', async (req, res) => {
  try {
    const { q, category, cuisine, difficulty, diet, maxTime, sort, tag, featured } = req.query;
    if (isMongoConnected) {
      const filter = {};
      if (category && category !== 'All') filter.category = category;
      if (cuisine && cuisine !== 'All') filter.cuisine = cuisine;
      if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;
      if (diet && diet !== 'All') filter.diet = diet;
      if (featured === 'true') filter.featured = true;
      if (tag) filter.tags = tag;
      if (maxTime) {
        const timeLimit = parseInt(maxTime, 10);
        filter.$expr = { $lte: [{ $add: [{ $ifNull: ['$preparationTime', 0] }, { $ifNull: ['$cookingTime', 0] }] }, timeLimit] };
      }
      if (q && q.trim()) {
        const searchRegex = new RegExp(q.trim(), 'i');
        filter.$or = [
          { title: searchRegex }, { description: searchRegex },
          { category: searchRegex }, { cuisine: searchRegex },
          { 'ingredients.name': searchRegex }, { tags: searchRegex }
        ];
      }
      let query = Recipe.find(filter);
      if (sort === 'fastest') query = query.sort({ cookingTime: 1, preparationTime: 1 });
      else if (sort === 'title') query = query.sort({ title: 1 });
      else query = query.sort({ createdAt: -1 });
      return res.json(await query.exec());
    }
    let results = [...inMemoryRecipes];
    if (category && category !== 'All') results = results.filter(r => r.category?.toLowerCase() === category.toLowerCase());
    if (cuisine && cuisine !== 'All') results = results.filter(r => r.cuisine?.toLowerCase() === cuisine.toLowerCase());
    if (diet && diet !== 'All') results = results.filter(r => r.diet?.toLowerCase() === diet.toLowerCase());
    if (difficulty && difficulty !== 'All') results = results.filter(r => r.difficulty?.toLowerCase() === difficulty.toLowerCase());
    if (maxTime) results = results.filter(r => ((r.preparationTime || 0) + (r.cookingTime || 0)) <= parseInt(maxTime, 10));
    if (q && q.trim()) {
      const s = q.trim().toLowerCase();
      results = results.filter(r =>
        r.title?.toLowerCase().includes(s) || r.description?.toLowerCase().includes(s) ||
        r.cuisine?.toLowerCase().includes(s) ||
        r.category?.toLowerCase().includes(s) ||
        r.tags?.some(t => t.toLowerCase().includes(s)) ||
        r.ingredients?.some(i => i.name?.toLowerCase().includes(s))
      );
    }
    if (sort === 'fastest') results.sort((a, b) => ((a.preparationTime || 0) + (a.cookingTime || 0)) - ((b.preparationTime || 0) + (b.cookingTime || 0)));
    else if (sort === 'title') results.sort((a, b) => a.title.localeCompare(b.title));
    else results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipes', details: err.message });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid Recipe ID format' });
      const recipe = await Recipe.findById(id);
      if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
      return res.json(recipe);
    }
    const recipe = inMemoryRecipes.find(r => r._id === id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipe', details: err.message });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const data = req.body;
    if (!data.title || !data.title.trim()) return res.status(400).json({ error: 'Recipe title is required' });
    if (!data.image || !data.image.trim()) data.image = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80';
    if (isMongoConnected) {
      const newRecipe = new Recipe(data);
      return res.status(201).json(await newRecipe.save());
    }
    const newRecipe = { ...data, _id: new mongoose.Types.ObjectId().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    inMemoryRecipes.unshift(newRecipe);
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create recipe', details: err.message });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid Recipe ID' });
      const updated = await Recipe.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ error: 'Recipe not found' });
      return res.json(updated);
    }
    const index = inMemoryRecipes.findIndex(r => r._id === id);
    if (index === -1) return res.status(404).json({ error: 'Recipe not found' });
    inMemoryRecipes[index] = { ...inMemoryRecipes[index], ...updates, _id: id, updatedAt: new Date().toISOString() };
    res.json(inMemoryRecipes[index]);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update recipe', details: err.message });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid Recipe ID' });
      const deleted = await Recipe.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Recipe not found' });
      return res.json({ message: 'Recipe deleted successfully', id });
    }
    const index = inMemoryRecipes.findIndex(r => r._id === id);
    if (index === -1) return res.status(404).json({ error: 'Recipe not found' });
    const removed = inMemoryRecipes.splice(index, 1);
    res.json({ message: 'Recipe deleted successfully', id, recipe: removed[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recipe', details: err.message });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    if (isMongoConnected) {
      await Recipe.deleteMany({});
      const seeded = await Recipe.insertMany(seedRecipes);
      return res.json({ message: 'Database reset and seeded successfully', count: seeded.length });
    }
    inMemoryRecipes = seedRecipes.map((r, idx) => ({
      ...r, _id: new mongoose.Types.ObjectId().toString(),
      createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - idx * 86400000).toISOString()
    }));
    res.json({ message: 'In-memory recipes reset and re-seeded successfully', count: inMemoryRecipes.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed recipes', details: err.message });
  }
});

// ─── FAVORITES ────────────────────────────────────────────────────────────────
app.get('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const favs = await Favorite.find({ userId: req.user.id }).populate('recipeId');
    res.json(favs.map(f => f.recipeId).filter(Boolean));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/favorites/:recipeId', authMiddleware, async (req, res) => {
  try {
    const existing = await Favorite.findOne({ userId: req.user.id, recipeId: req.params.recipeId });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res.json({ favorited: false });
    }
    await Favorite.create({ userId: req.user.id, recipeId: req.params.recipeId });
    res.json({ favorited: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PANTRY ───────────────────────────────────────────────────────────────────
app.get('/api/pantry', authMiddleware, async (req, res) => {
  try {
    const items = await Pantry.find({ userId: req.user.id }).sort({ expiryDate: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/pantry', authMiddleware, async (req, res) => {
  try {
    const { ingredient, quantity, unit, expiryDate, category } = req.body;
    if (!ingredient) return res.status(400).json({ error: 'Ingredient name is required' });
    const item = await Pantry.create({ userId: req.user.id, ingredient, quantity, unit, expiryDate, category: category || 'Other' });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/pantry/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Pantry.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Pantry item not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/pantry/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Pantry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ error: 'Pantry item not found' });
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── MEAL PLAN ────────────────────────────────────────────────────────────────
app.get('/api/mealplan', authMiddleware, async (req, res) => {
  try {
    const plans = await MealPlan.find({ userId: req.user.id }).populate('recipeId');
    res.json(plans);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/mealplan', authMiddleware, async (req, res) => {
  try {
    const { recipeId, date, mealType } = req.body;
    if (!recipeId || !date || !mealType) return res.status(400).json({ error: 'recipeId, date, and mealType are required' });
    // Upsert: one recipe per slot
    const plan = await MealPlan.findOneAndUpdate(
      { userId: req.user.id, date, mealType },
      { recipeId },
      { new: true, upsert: true }
    );
    const populated = await plan.populate('recipeId');
    res.json(populated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/mealplan/:id', authMiddleware, async (req, res) => {
  try {
    await MealPlan.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Meal plan entry deleted', id: req.params.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── SHOPPING LIST ────────────────────────────────────────────────────────────
app.get('/api/shopping', authMiddleware, async (req, res) => {
  try {
    const items = await Shopping.find({ userId: req.user.id }).sort({ aisle: 1, ingredient: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/shopping', authMiddleware, async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    const created = await Shopping.insertMany(items.map(i => ({ ...i, userId: req.user.id })));
    res.status(201).json(created);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/shopping/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Shopping.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/shopping/:id', authMiddleware, async (req, res) => {
  try {
    await Shopping.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/shopping/clear/purchased', authMiddleware, async (req, res) => {
  try {
    await Shopping.deleteMany({ userId: req.user.id, isPurchased: true });
    res.json({ message: 'Cleared purchased items' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.id;
    let totalRecipes=0, pantryCount=0, favoritesCount=0, plannedMeals=0, expiringItems=[], recommended=[], todayMeals=[];
    if (isMongoConnected) {
      try {
        [totalRecipes, pantryCount, favoritesCount, plannedMeals, expiringItems] = await Promise.all([
          Recipe.countDocuments().catch(() => inMemoryRecipes.length),
          Pantry.countDocuments({ userId: uid }).catch(() => 0),
          Favorite.countDocuments({ userId: uid }).catch(() => 0),
          MealPlan.countDocuments({ userId: uid }).catch(() => 0),
          Pantry.find({ userId: uid, expiryDate: { $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) } }).sort({ expiryDate: 1 }).limit(5).catch(() => [])
        ]);
        recommended = await Recipe.find().sort({ createdAt: -1 }).limit(6).catch(() => inMemoryRecipes.slice(0, 6));
        const todayStr = new Date().toISOString().slice(0, 10);
        todayMeals = await MealPlan.find({ userId: uid, date: todayStr }).populate('recipeId').catch(() => []);
      } catch(e) {}
    } else {
      totalRecipes = inMemoryRecipes.length;
      recommended = inMemoryRecipes.slice(0, 6);
    }
    res.json({ totalRecipes, pantryCount, favoritesCount, plannedMeals, expiringItems, recommended, todayMeals });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

if (process.env.NODE_ENV !== 'production' || process.env.PORT) {
  app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🍳 RecipeMaster Backend Server`);
    console.log(`📡 Listening on: http://localhost:${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api/recipes`);
    console.log(`📊 Status: http://localhost:${PORT}/api/status`);
    console.log(`========================================\n`);
  });
}

export default app;
