import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const ref = (m) => ({ type: Schema.Types.ObjectId, ref: m, required: true });
const T = { timestamps: true };

export const User = model('User', new Schema({ name: String, email: { type: String, unique: true, lowercase: true }, password: String, role: { type: String, enum: ['user', 'admin'], default: 'user' }, profileImage: String }, T));
export const Recipe = model('Recipe', new Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  cuisine: String,
  diet: String,
  ingredients: [{
    name: String,
    measure: String,
    quantity: Number,
    unit: String,
    aisle: String
  }],
  instructions: [String],
  cookingTime: Number,
  preparationTime: Number,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  servings: Number,
  image: String,
  tags: [String],
  source: String,
  sourceUrl: String,
  youtubeUrl: String,
  externalId: { type: String, index: true, sparse: true },
  isSample: { type: Boolean, default: false },
  nutrition: {
    calories: Number,
    protein: String,
    carbs: String,
    fat: String,
    fiber: String
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false }
}, T));
export const Pantry = model('Pantry', new Schema({ userId: ref('User'), ingredient: { type: String, required: true }, quantity: Number, unit: String, purchaseDate: Date, expiryDate: Date, category: String }, T));
export const Favorite = model('Favorite', new Schema({ userId: ref('User'), recipeId: ref('Recipe') }, T));
export const MealPlan = model('MealPlan', new Schema({ userId: ref('User'), recipeId: ref('Recipe'), date: String, mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'] } }, T));
export const Shopping = model('Shopping', new Schema({ userId: ref('User'), ingredient: String, quantity: Number, unit: String, aisle: { type: String, default: 'Other' }, recipeTitle: String, isPurchased: { type: Boolean, default: false } }, T));
export const Review = model('Review', new Schema({ userId: ref('User'), recipeId: ref('Recipe'), rating: { type: Number, min: 1, max: 5 }, comment: String }, T));
export const Category = model('Category', new Schema({ name: { type: String, unique: true } }));
