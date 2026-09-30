import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Recipe } from './models/Recipe.js';

dotenv.config();

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Aisle lookup keywords
const AISLE_KEYWORDS = {
  'Produce': [
    'onion', 'garlic', 'tomato', 'potato', 'carrot', 'lemon', 'lime', 'apple', 'banana',
    'ginger', 'pepper', 'spinach', 'cilantro', 'parsley', 'basil', 'coriander', 'herb',
    'mushroom', 'lettuce', 'cabbage', 'avocado', 'celery', 'chili', 'chilli', 'broccoli',
    'cauliflower', 'cucumber', 'vegetable', 'pea', 'scallion', 'shallot', 'zucchini',
    'mint', 'berry', 'fruit', 'bell pepper', 'asparagus', 'eggplant', 'aubergine', 'leek'
  ],
  'Dairy & eggs': [
    'milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'paneer', 'cheddar', 'mozzarella',
    'parmesan', 'ricotta', 'ghee', 'curd', 'mayonnaise', 'sour cream', 'custard'
  ],
  'Meat & seafood': [
    'chicken', 'beef', 'pork', 'bacon', 'turkey', 'lamb', 'mutton', 'fish', 'salmon',
    'shrimp', 'prawn', 'tuna', 'crab', 'lobster', 'meat', 'steak', 'ham', 'sausage',
    'duck', 'squid', 'cod', 'anchov', 'clam', 'oyster', 'mussel', 'veal', 'venison'
  ],
  'Grains & pasta': [
    'rice', 'pasta', 'noodle', 'flour', 'bread', 'spaghetti', 'macaroni', 'penne',
    'oats', 'tortilla', 'quinoa', 'couscous', 'cereal', 'dough', 'pastry', 'yeast',
    'vermicelli', 'linguine', 'fusilli', 'lasagne'
  ],
  'Spices & pantry': [
    'salt', 'sugar', 'olive oil', 'vegetable oil', 'oil', 'vinegar', 'soy sauce',
    'sauce', 'honey', 'syrup', 'cinnamon', 'cumin', 'turmeric', 'paprika', 'oregano',
    'bay leaf', 'baking powder', 'baking soda', 'cornstarch', 'vanilla', 'mustard',
    'broth', 'stock', 'paste', 'coconut milk', 'curry', 'powder', 'clove', 'cardamom',
    'seed', 'bean', 'lentil', 'chickpea', 'nut', 'peanut', 'almond', 'walnut',
    'chocolate', 'cocoa', 'sesame', 'coriander powder', 'garam masala'
  ]
};

function determineAisle(ingredientName) {
  const lower = (ingredientName || '').toLowerCase();
  for (const [aisle, keywords] of Object.entries(AISLE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return aisle;
    }
  }
  return 'Other';
}

/**
 * Parses numeric quantity and unit string if the measure clearly starts with a number.
 * Supports whole numbers, fractions (e.g. 1/2, 3/4), mixed numbers (e.g. 1 1/2), and decimals (e.g. 2.5).
 */
function parseQuantityAndUnit(measureStr) {
  if (!measureStr || typeof measureStr !== 'string') {
    return { quantity: undefined, unit: '' };
  }
  const trimmed = measureStr.trim();
  const match = trimmed.match(/^(\d+(?:\s+\d+\/\d+|\/\d+|\.\d+)?)\s*(.*)$/);
  if (!match) {
    return { quantity: undefined, unit: '' };
  }
  const rawNum = match[1];
  const rest = match[2]?.trim() || '';

  let quantity;
  try {
    if (rawNum.includes(' ')) {
      const [whole, frac] = rawNum.split(/\s+/);
      const [n, d] = frac.split('/');
      quantity = parseFloat(whole) + (parseFloat(n) / parseFloat(d));
    } else if (rawNum.includes('/')) {
      const [n, d] = rawNum.split('/');
      quantity = parseFloat(n) / parseFloat(d);
    } else {
      quantity = parseFloat(rawNum);
    }
    if (isNaN(quantity)) quantity = undefined;
    else quantity = Math.round(quantity * 100) / 100;
  } catch {
    quantity = undefined;
  }

  return { quantity, unit: rest };
}

/**
 * DIET CLASSIFICATION RULE:
 * Mark "Vegetarian" only if:
 * 1. The category is "Vegetarian" or "Vegan", OR
 * 2. None of the ingredient names match meat, poultry, seafood, or fish keywords.
 * Otherwise, the recipe is marked as "Non-vegetarian".
 */
function determineDiet(category, ingredients) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('vegetarian') || cat.includes('vegan')) {
    return 'Vegetarian';
  }

  const meatKeywords = [
    'chicken', 'beef', 'pork', 'bacon', 'turkey', 'lamb', 'mutton',
    'fish', 'salmon', 'shrimp', 'prawn', 'tuna', 'crab', 'lobster',
    'meat', 'steak', 'ham', 'sausage', 'duck', 'squid', 'cod', 'anchov',
    'clam', 'oyster', 'mussel', 'prosciutto', 'pancetta', 'veal', 'venison',
    'gelatin', 'lard'
  ];

  const hasMeat = ingredients.some((ing) => {
    const name = (ing.name || '').toLowerCase();
    return meatKeywords.some((kw) => name.includes(kw));
  });

  return hasMeat ? 'Non-vegetarian' : 'Vegetarian';
}

function parseInstructions(raw) {
  if (!raw || typeof raw !== 'string') return [];
  const lines = raw.split(/\r?\n+/);
  const steps = [];

  for (const line of lines) {
    // Split sentences inside a line if they end with . ! ? followed by space and capital letter or number
    const sentenceParts = line.split(/(?<=[.!?])\s+(?=[A-Z0-9])/);
    for (const part of sentenceParts) {
      let cleaned = part
        .replace(/^step\s*\d+[:.\-\)]\s*/i, '')
        .replace(/^\d+[\.\-\)]\s*/, '')
        .replace(/^\*+\s*/, '')
        .trim();

      // Filter out empty steps, pure numbers, or headers
      if (cleaned && cleaned.length > 3 && !/^\d+$/.test(cleaned)) {
        steps.push(cleaned);
      }
    }
  }

  return steps.length > 0 ? steps : [raw.trim()];
}

function parseIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const rawName = meal[`strIngredient${i}`];
    const rawMeasure = meal[`strMeasure${i}`];

    if (!rawName || typeof rawName !== 'string') continue;
    const name = rawName.trim().toLowerCase();
    if (!name || name === 'null') continue;

    const measure = (rawMeasure && typeof rawMeasure === 'string') ? rawMeasure.trim() : '';
    const { quantity, unit } = parseQuantityAndUnit(measure);
    const aisle = determineAisle(name);

    ingredients.push({
      name,
      measure,
      quantity,
      unit,
      aisle
    });
  }
  return ingredients;
}

async function fetchFromApi(endpoint) {
  const url = `${BASE_URL}/${endpoint}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}`);
  }
  return await res.json();
}

async function importRecipes() {
  console.log('🚀 Starting TheMealDB Recipe Import Script...');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recipemaster';

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB Atlas successfully.');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  const mealMap = new Map(); // idMeal -> meal object

  // 1. Fetch meals by letters a to z
  console.log('\n📖 Step 1: Fetching meals by letters a to z...');
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  for (const letter of letters) {
    try {
      const data = await fetchFromApi(`search.php?f=${letter}`);
      if (data && Array.isArray(data.meals)) {
        for (const meal of data.meals) {
          if (meal && meal.idMeal) {
            mealMap.set(meal.idMeal, meal);
          }
        }
        process.stdout.write(` ${letter}(${data.meals.length})`);
      } else {
        process.stdout.write(` ${letter}(0)`);
      }
    } catch (err) {
      console.warn(`\n⚠️ Letter '${letter}' fetch error: ${err.message}`);
    }
    await sleep(300);
  }
  console.log(`\nCollected ${mealMap.size} unique meals from letters.`);

  // 2. Fetch specific cuisines: Indian (and India), Italian, Chinese, Mexican, Thai
  console.log('\n🌍 Step 2: Fetching specific cuisines (Indian, Italian, Chinese, Mexican, Thai)...');
  const targetAreas = ['Indian', 'India', 'Italian', 'Chinese', 'Mexican', 'Thai'];
  const mealIdsToLookup = new Set();

  for (const area of targetAreas) {
    try {
      const data = await fetchFromApi(`filter.php?a=${area}`);
      if (data && Array.isArray(data.meals)) {
        console.log(`- Cuisine filter '${area}': found ${data.meals.length} dishes.`);
        for (const m of data.meals) {
          if (m && m.idMeal && !mealMap.has(m.idMeal)) {
            mealIdsToLookup.add(m.idMeal);
          }
        }
      } else {
        console.log(`- Cuisine filter '${area}': 0 dishes found.`);
      }
    } catch (err) {
      console.warn(`⚠️ Area '${area}' filter error: ${err.message}`);
    }
    await sleep(300);
  }

  // Lookup full details for any extra dishes from cuisine filters
  if (mealIdsToLookup.size > 0) {
    console.log(`🔍 Looking up ${mealIdsToLookup.size} additional meal details...`);
    let lookedUp = 0;
    for (const id of mealIdsToLookup) {
      try {
        const data = await fetchFromApi(`lookup.php?i=${id}`);
        if (data && Array.isArray(data.meals) && data.meals[0]) {
          mealMap.set(id, data.meals[0]);
          lookedUp++;
        }
      } catch (err) {
        console.warn(`⚠️ Lookup failed for ID ${id}: ${err.message}`);
      }
      await sleep(300);
    }
    console.log(`Successfully retrieved ${lookedUp} extra meal details.`);
  }

  console.log(`\n🍲 Total unique recipes to process: ${mealMap.size}`);

  // 3. Map and save recipes to MongoDB
  let addedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  console.log('\n💾 Step 3: Saving recipes to MongoDB with duplicate protection...');
  for (const meal of mealMap.values()) {
    try {
      const existing = await Recipe.findOne({ externalId: meal.idMeal });
      if (existing) {
        skippedCount++;
        continue;
      }

      const ingredients = parseIngredients(meal);
      const instructions = parseInstructions(meal.strInstructions);
      const diet = determineDiet(meal.strCategory, ingredients);
      const tags = meal.strTags
        ? meal.strTags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      // Cuisine fallback: if area is missing, use country or 'International'
      const cuisine = meal.strArea || meal.strCountry || 'International';

      const recipeDoc = new Recipe({
        title: meal.strMeal ? meal.strMeal.trim() : 'Untitled Recipe',
        description: `${meal.strMeal} is a delicious ${cuisine} ${meal.strCategory || 'dish'}.`,
        category: meal.strCategory ? meal.strCategory.trim() : 'Other',
        cuisine: cuisine.trim(),
        diet,
        ingredients,
        instructions,
        image: meal.strMealThumb || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
        tags,
        source: 'TheMealDB',
        sourceUrl: meal.strSource ? meal.strSource.trim() : undefined,
        youtubeUrl: meal.strYoutube ? meal.strYoutube.trim() : undefined,
        externalId: meal.idMeal,
        isSample: false
        // cookingTime, preparationTime, servings, nutrition left empty as requested
      });

      await recipeDoc.save();
      addedCount++;
    } catch (err) {
      console.error(`❌ Failed to save "${meal.strMeal}": ${err.message}`);
      failedCount++;
    }
  }

  // 4. Check existing seeded recipes without externalId for invalid data
  console.log('\n🔍 Step 4: Checking old seeded recipes for validity...');
  const flaggedOldRecipes = [];
  try {
    const oldRecipes = await Recipe.find({ externalId: { $exists: false } });
    for (const r of oldRecipes) {
      const hasInvalidIngredients = !r.ingredients || r.ingredients.length === 0 || r.ingredients.some((i) => !i.name || !i.name.trim());
      const hasInvalidInstructions = !r.instructions || r.instructions.length === 0 || r.instructions.some((s) => !s || typeof s !== 'string' || !s.trim());

      if (hasInvalidIngredients || hasInvalidInstructions) {
        r.isSample = true;
        await r.save();
        flaggedOldRecipes.push(r.title);
      }
    }
  } catch (err) {
    console.warn(`Could not check old recipes: ${err.message}`);
  }

  // 5. Final Summary Output
  console.log('\n=============================================');
  console.log('📊 THEMEALDB IMPORT COMPLETE');
  console.log('=============================================');
  console.log(`✅ Newly Added Recipes : ${addedCount}`);
  console.log(`⏭️  Skipped (Existing)  : ${skippedCount}`);
  console.log(`❌ Failed              : ${failedCount}`);
  console.log(`📦 Total in Catalog    : ${await Recipe.countDocuments()}`);

  if (flaggedOldRecipes.length > 0) {
    console.log(`\n⚠️ Old seeded recipes flagged as 'isSample: true' due to invalid ingredients/steps:`);
    flaggedOldRecipes.forEach((title) => console.log(`   - ${title}`));
  } else {
    console.log(`\nℹ️ No old seeded recipes had invalid ingredients or steps.`);
  }
  console.log('=============================================\n');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

importRecipes().catch((err) => {
  console.error('Fatal import error:', err);
  process.exit(1);
});
