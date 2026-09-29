import fs from 'fs';
import { seedRecipes } from './server/data/seedRecipes.js';
import mongoose from 'mongoose';

const mockUserId = new mongoose.Types.ObjectId().toString();

const newSeeds = seedRecipes.map(recipe => {
  return {
    title: recipe.title,
    description: recipe.description,
    category: recipe.category,
    ingredients: recipe.ingredients.map(ing => ({
      name: ing.name,
      quantity: ing.amount,
      unit: ing.unit
    })),
    instructions: recipe.instructions.map(inst => inst.instruction),
    cookingTime: recipe.cookTime,
    preparationTime: recipe.prepTime,
    difficulty: recipe.difficulty,
    servings: recipe.servings,
    image: recipe.image,
    tags: recipe.tags,
    createdBy: mockUserId
  };
});

const fileContent = `import mongoose from 'mongoose';\n\nconst mockUserId = new mongoose.Types.ObjectId('${mockUserId}');\n\nexport const seedRecipes = ${JSON.stringify(newSeeds, null, 2).replace(/"createdBy": "([^"]+)"/g, '"createdBy": mockUserId')};\n`;

fs.writeFileSync('./server/data/seedRecipes.js', fileContent);
console.log('Successfully transformed seedRecipes.js!');
