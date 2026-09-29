import mongoose from 'mongoose';

const mockUserId = new mongoose.Types.ObjectId('6abbf15ef411c6535febdea1');

export const seedRecipes = [
  {
    "title": "Tuscan Garlic Herb Butter Salmon",
    "description": "Pan-seared crisp wild salmon fillets bathed in a creamy garlic, sun-dried tomato, and baby spinach cream sauce.",
    "category": "Dinner",
    "ingredients": [
      {
        "name": "Wild Alaskan Salmon Fillets",
        "quantity": 4,
        "unit": "fillets (6 oz each)"
      },
      {
        "name": "Extra Virgin Olive Oil",
        "quantity": 2,
        "unit": "tbsp"
      },
      {
        "name": "Unsalted Butter",
        "quantity": 2,
        "unit": "tbsp"
      },
      {
        "name": "Fresh Garlic",
        "quantity": 5,
        "unit": "cloves"
      },
      {
        "name": "Sun-Dried Tomatoes",
        "quantity": 0.5,
        "unit": "cup"
      },
      {
        "name": "Heavy Cream",
        "quantity": 1,
        "unit": "cup"
      },
      {
        "name": "Fresh Baby Spinach",
        "quantity": 3,
        "unit": "cups"
      },
      {
        "name": "Grated Parmesan Reggiano",
        "quantity": 0.5,
        "unit": "cup"
      },
      {
        "name": "Fresh Basil",
        "quantity": 0.25,
        "unit": "cup"
      },
      {
        "name": "Flaky Sea Salt & Cracked Black Pepper",
        "quantity": 1,
        "unit": "tsp"
      }
    ],
    "instructions": [
      "Season salmon fillets generously on both flesh sides with flaky sea salt and freshly cracked black pepper.",
      "Heat olive oil in a large cast-iron skillet over medium-high heat. Sear salmon flesh side down for 5 minutes without disturbing to form a golden crust. Flip and cook skin side for 4 more minutes until cooked through. Transfer to a warm plate.",
      "Melt butter in the same pan over medium heat. Add minced garlic and julienned sun-dried tomatoes. Sauté for 1 minute until fragrant.",
      "Reduce heat to low-medium. Pour in heavy cream and bring to a gentle simmer. Whisk in grated Parmesan until smooth and lightly thickened.",
      "Add baby spinach and fresh basil. Stir until spinach wilts into the velvety cream sauce (about 2 minutes).",
      "Return seared salmon fillets into the skillet, spooning luscious Tuscan sauce over the tops. Garnish with basil ribbons and serve immediately."
    ],
    "cookingTime": 20,
    "preparationTime": 15,
    "difficulty": "Medium",
    "servings": 4,
    "image": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "High-Protein",
      "Keto-Friendly",
      "Gluten-Free",
      "Chef's Special"
    ],
    "createdBy": mockUserId
  },
  {
    "title": "Artisanal Truffle Wild Mushroom Risotto",
    "description": "Creamy Arborio rice slowly simmered in rich vegetable-shallot broth with sautéed wild chanterelles, porcini, thyme, and black truffle oil.",
    "category": "Dinner",
    "ingredients": [
      {
        "name": "Arborio Rice",
        "quantity": 1.5,
        "unit": "cups"
      },
      {
        "name": "Assorted Wild Mushrooms",
        "quantity": 12,
        "unit": "oz"
      },
      {
        "name": "Dry Porcini Mushrooms",
        "quantity": 0.5,
        "unit": "oz"
      },
      {
        "name": "Vegetable or Mushroom Stock",
        "quantity": 5,
        "unit": "cups"
      },
      {
        "name": "Dry White Wine",
        "quantity": 0.75,
        "unit": "cup"
      },
      {
        "name": "Shallots",
        "quantity": 2,
        "unit": "medium"
      },
      {
        "name": "Garlic Cloves",
        "quantity": 3,
        "unit": "cloves"
      },
      {
        "name": "Unsalted Butter",
        "quantity": 3,
        "unit": "tbsp"
      },
      {
        "name": "Parmigiano Reggiano",
        "quantity": 0.75,
        "unit": "cup"
      },
      {
        "name": "Truffle Oil",
        "quantity": 1,
        "unit": "tbsp"
      },
      {
        "name": "Fresh Thyme Leaves",
        "quantity": 1,
        "unit": "tbsp"
      }
    ],
    "instructions": [
      "Heat 1 tbsp butter in a broad heavy pot over medium heat. Sauté wild mushrooms and thyme with a pinch of salt until caramelized and golden, about 7 minutes. Transfer half out for garnish.",
      "Add another tbsp butter and diced shallots into the pot. Sauté until translucent, about 3 minutes. Stir in garlic and cook 1 minute.",
      "Pour in Arborio rice, stirring briskly to toast the grains until edges become pearlescent, approximately 2 minutes.",
      "Deglaze the pot with white wine, stirring constantly until fully absorbed by the rice.",
      "Begin ladling hot broth 1 ladle at a time, stirring gently and allowing liquid to absorb before adding the next ladle. Continue for 18-20 minutes until rice is creamy and al dente.",
      "Remove pot from heat. Fold in remaining butter, grated Parmigiano, and reserved porcini liquid. Drizzle with truffle oil, top with reserved sautéed mushrooms, and serve warm."
    ],
    "cookingTime": 35,
    "preparationTime": 20,
    "difficulty": "Medium",
    "servings": 4,
    "image": "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "Vegetarian",
      "Gluten-Free",
      "Comfort Food"
    ],
    "createdBy": mockUserId
  },
  {
    "title": "Smoky Chipotle Street Tacos with Lime Crema",
    "description": "Charred street tacos stuffed with spiced tender chicken thighs, pickled red onions, crumbled cotija, and zesty cilantro-lime crema.",
    "category": "Lunch",
    "ingredients": [
      {
        "name": "Boneless Skinless Chicken Thighs",
        "quantity": 1.5,
        "unit": "lbs"
      },
      {
        "name": "Chipotle Peppers in Adobo Sauce",
        "quantity": 2,
        "unit": "tbsp"
      },
      {
        "name": "Ground Cumin & Smoked Paprika",
        "quantity": 1,
        "unit": "tbsp"
      },
      {
        "name": "Fresh Limes",
        "quantity": 3,
        "unit": "whole"
      },
      {
        "name": "Mini White Corn Tortillas",
        "quantity": 12,
        "unit": "pieces"
      },
      {
        "name": "Sour Cream or Mexican Crema",
        "quantity": 0.5,
        "unit": "cup"
      },
      {
        "name": "Pickled Red Onions",
        "quantity": 0.5,
        "unit": "cup"
      },
      {
        "name": "Cotija Cheese",
        "quantity": 0.5,
        "unit": "cup"
      },
      {
        "name": "Fresh Cilantro",
        "quantity": 0.5,
        "unit": "cup"
      },
      {
        "name": "Avocado",
        "quantity": 1,
        "unit": "large"
      }
    ],
    "instructions": [
      "In a bowl, mix minced chipotle in adobo, olive oil, lime juice, cumin, smoked paprika, garlic, and 1 tsp salt. Toss chicken thighs to coat evenly.",
      "Preheat a cast-iron skillet or grill to medium-high. Sear chicken thighs for 6 minutes per side until charred and internal temp reaches 165°F (74°C). Rest 5 minutes then dice into bite-size pieces.",
      "Whisk crema with lime juice, lime zest, and a pinch of salt until drizzling consistency.",
      "Warm corn tortillas directly over a gas flame or dry skillet for 30 seconds per side until lightly blistered.",
      "Assemble tacos: layer double tortillas, spoonfuls of juicy chipotle chicken, pickled red onions, avocado cubes, cotija cheese, cilantro, and generous streaks of lime crema."
    ],
    "cookingTime": 15,
    "preparationTime": 20,
    "difficulty": "Easy",
    "servings": 4,
    "image": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "Quick & Easy",
      "High-Protein",
      "Street Food"
    ],
    "createdBy": mockUserId
  },
  {
    "title": "Golden Turmeric Ginger Coconut Curry",
    "description": "A warming fragrant curry made with roasted chickpeas, sweet potatoes, baby spinach, turmeric, ginger, and silky coconut milk.",
    "category": "Dinner",
    "ingredients": [
      {
        "name": "Cooked Chickpeas",
        "quantity": 2,
        "unit": "cans (15 oz)"
      },
      {
        "name": "Sweet Potato",
        "quantity": 2,
        "unit": "medium"
      },
      {
        "name": "Full-Fat Coconut Milk",
        "quantity": 1,
        "unit": "can (14 oz)"
      },
      {
        "name": "Fresh Ginger",
        "quantity": 2,
        "unit": "tbsp"
      },
      {
        "name": "Turmeric Powder",
        "quantity": 1.5,
        "unit": "tsp"
      },
      {
        "name": "Garam Masala",
        "quantity": 1,
        "unit": "tbsp"
      },
      {
        "name": "Ground Coriander & Cumin",
        "quantity": 1,
        "unit": "tsp each"
      },
      {
        "name": "Crushed Tomatoes",
        "quantity": 1,
        "unit": "cup"
      },
      {
        "name": "Baby Spinach",
        "quantity": 3,
        "unit": "cups"
      },
      {
        "name": "Basmati Rice",
        "quantity": 2,
        "unit": "cups cooked"
      }
    ],
    "instructions": [
      "Heat coconut oil in a deep Dutch oven over medium heat. Sauté diced onions for 4 minutes until golden, then add grated ginger and garlic for 1 minute.",
      "Add turmeric, garam masala, cumin, coriander, and chili flakes. Bloom spices in oil for 45 seconds until intensely aromatic.",
      "Pour in crushed tomatoes and sweet potato cubes. Stir well, cover with lid, and simmer on medium-low for 12 minutes until sweet potatoes are tender.",
      "Pour in full-fat coconut milk and drained chickpeas. Simmer uncovered for 8 minutes to allow flavors to meld and sauce to thicken slightly.",
      "Fold in baby spinach until wilted. Squeeze fresh lime juice over top, season with sea salt, and serve with fluffy basmati rice and warm naan."
    ],
    "cookingTime": 25,
    "preparationTime": 15,
    "difficulty": "Easy",
    "servings": 4,
    "image": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "Vegan",
      "Gluten-Free",
      "Anti-Inflammatory",
      "Healthy"
    ],
    "createdBy": mockUserId
  },
  {
    "title": "Classic Shakshuka with Feta & Sourdough",
    "description": "North African poached eggs nestled in a spiced, simmering bell pepper, tomato, and onion sauce, topped with crumbled Greek feta and fresh herbs.",
    "category": "Breakfast",
    "ingredients": [
      {
        "name": "Large Eggs",
        "quantity": 6,
        "unit": "eggs"
      },
      {
        "name": "Whole Peeled Plum Tomatoes",
        "quantity": 1,
        "unit": "can (28 oz)"
      },
      {
        "name": "Red Bell Pepper",
        "quantity": 1,
        "unit": "large"
      },
      {
        "name": "Yellow Onion",
        "quantity": 1,
        "unit": "medium"
      },
      {
        "name": "Garlic Cloves",
        "quantity": 4,
        "unit": "cloves"
      },
      {
        "name": "Smoked Paprika & Ground Cumin",
        "quantity": 1,
        "unit": "tsp each"
      },
      {
        "name": "Authentic Sheep's Milk Feta",
        "quantity": 0.5,
        "unit": "cup"
      },
      {
        "name": "Fresh Cilantro & Parsley",
        "quantity": 0.25,
        "unit": "cup"
      },
      {
        "name": "Crusty Artisan Sourdough",
        "quantity": 4,
        "unit": "thick slices"
      }
    ],
    "instructions": [
      "Heat 2 tbsp olive oil in a heavy 10-12 inch cast-iron skillet over medium heat. Sauté onion and red bell pepper for 6 minutes until soft and caramelized.",
      "Add sliced garlic, cumin, smoked paprika, and a pinch of cayenne. Stir for 1 minute until fragrant.",
      "Pour in crushed tomatoes with juices. Season with sea salt and cracked pepper. Simmer over medium-low heat for 10 minutes until sauce thickens.",
      "Use a wooden spoon to create 5-6 small wells in the sauce. Crack an egg into each well.",
      "Cover skillet with a lid and cook on low for 5-7 minutes until egg whites are set but yolks remain gloriously runny.",
      "Scatter crumbled feta, fresh cilantro, and parsley over top. Serve straight from the skillet alongside toasted sourdough slices."
    ],
    "cookingTime": 20,
    "preparationTime": 10,
    "difficulty": "Easy",
    "servings": 3,
    "image": "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "Vegetarian",
      "Quick & Easy",
      "Brunch Classic"
    ],
    "createdBy": mockUserId
  },
  {
    "title": "Matcha Chia Seed Pudding with Berries",
    "description": "Creamy overnight chia seed pudding infused with ceremonial Japanese matcha, vanilla bean, almond milk, and layered with fresh organic berries.",
    "category": "Breakfast",
    "ingredients": [
      {
        "name": "Black Chia Seeds",
        "quantity": 0.5,
        "unit": "cup"
      },
      {
        "name": "Unsweetened Almond Milk",
        "quantity": 1.5,
        "unit": "cups"
      },
      {
        "name": "Ceremonial Grade Matcha Powder",
        "quantity": 1.5,
        "unit": "tsp"
      },
      {
        "name": "Pure Maple Syrup",
        "quantity": 2,
        "unit": "tbsp"
      },
      {
        "name": "Vanilla Bean Extract",
        "quantity": 1,
        "unit": "tsp"
      },
      {
        "name": "Fresh Raspberries & Blueberries",
        "quantity": 1,
        "unit": "cup"
      },
      {
        "name": "Toasted Coconut Flakes",
        "quantity": 2,
        "unit": "tbsp"
      }
    ],
    "instructions": [
      "In a mixing bowl, whisk matcha powder with 2 tablespoons of warm water until smooth and lump-free.",
      "Pour in almond milk, maple syrup, and vanilla extract. Whisk thoroughly until uniform green color.",
      "Add chia seeds and whisk vigorously for 2 minutes to prevent seeds from clumping at the bottom.",
      "Cover and refrigerate for at least 3 hours or overnight until thick and pudding-like.",
      "Spoon into glasses, top with fresh vibrant berries and toasted coconut flakes, and enjoy cool."
    ],
    "cookingTime": 0,
    "preparationTime": 10,
    "difficulty": "Easy",
    "servings": 2,
    "image": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "Vegan",
      "Gluten-Free",
      "No-Cook",
      "Superfood"
    ],
    "createdBy": mockUserId
  },
  {
    "title": "Dark Chocolate Lava Cakes with Sea Salt",
    "description": "Decadent individual molten chocolate lava cakes with a rich oozing center, dusted with Dutch cocoa and flakes of Maldon sea salt.",
    "category": "Dessert",
    "ingredients": [
      {
        "name": "70% Bittersweet Dark Chocolate",
        "quantity": 6,
        "unit": "oz"
      },
      {
        "name": "Unsalted Butter",
        "quantity": 0.5,
        "unit": "cup (1 stick)"
      },
      {
        "name": "Powdered Confectioners Sugar",
        "quantity": 0.5,
        "unit": "cup"
      },
      {
        "name": "Large Eggs + Egg Yolks",
        "quantity": 2,
        "unit": "whole eggs + 2 yolks"
      },
      {
        "name": "All-Purpose Flour",
        "quantity": 6,
        "unit": "tbsp"
      },
      {
        "name": "Pure Vanilla Extract",
        "quantity": 1,
        "unit": "tsp"
      },
      {
        "name": "Instant Espresso Powder",
        "quantity": 0.5,
        "unit": "tsp"
      },
      {
        "name": "Maldon Flaky Sea Salt",
        "quantity": 0.5,
        "unit": "tsp"
      },
      {
        "name": "Vanilla Bean Ice Cream",
        "quantity": 4,
        "unit": "scoops"
      }
    ],
    "instructions": [
      "Preheat oven to 425°F (218°C). Butter four 6-ounce ramekins generously and dust with cocoa powder, tapping out excess.",
      "Place chopped dark chocolate and cubed butter in a heatproof bowl set over a pot of barely simmering water (double boiler). Stir gently until smooth and glossy. Remove from heat.",
      "Whisk in powdered sugar until blended. Add 2 whole eggs, 2 egg yolks, and vanilla extract. Whisk vigorously until smooth.",
      "Gently fold in sifted flour and espresso powder with a rubber spatula just until combined (do not overmix).",
      "Divide batter evenly between prepared ramekins. Place on a baking sheet and bake for exactly 12 minutes until sides are firm but centers are soft.",
      "Let cool for 1 minute. Run a thin knife around edges, invert onto dessert plates, dust with cocoa powder, sprinkle with flaky sea salt, and serve immediately with vanilla bean ice cream."
    ],
    "cookingTime": 12,
    "preparationTime": 15,
    "difficulty": "Medium",
    "servings": 4,
    "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "Baking",
      "Gourmet",
      "Vegetarian",
      "Indulgent"
    ],
    "createdBy": mockUserId
  },
  {
    "title": "Mediterranean Lemon Herb Grilled Chicken Bowl",
    "description": "Marinated oregano-lemon chicken skewers over warm pearl couscous, cucumber-tomato salad, kalamata olives, and creamy tzatziki.",
    "category": "Lunch",
    "ingredients": [
      {
        "name": "Chicken Breast",
        "quantity": 1.5,
        "unit": "lbs"
      },
      {
        "name": "Extra Virgin Olive Oil",
        "quantity": 3,
        "unit": "tbsp"
      },
      {
        "name": "Fresh Lemon Juice & Zest",
        "quantity": 2,
        "unit": "lemons"
      },
      {
        "name": "Dried Oregano & Garlic Powder",
        "quantity": 1,
        "unit": "tbsp each"
      },
      {
        "name": "Pearl Israeli Couscous",
        "quantity": 1.5,
        "unit": "cups"
      },
      {
        "name": "English Cucumber",
        "quantity": 1,
        "unit": "diced"
      },
      {
        "name": "Cherry Tomatoes",
        "quantity": 1,
        "unit": "cup"
      },
      {
        "name": "Kalamata Olives",
        "quantity": 0.5,
        "unit": "cup"
      },
      {
        "name": "Tzatziki Sauce",
        "quantity": 0.75,
        "unit": "cup"
      },
      {
        "name": "Fresh Dill & Mint",
        "quantity": 0.25,
        "unit": "cup"
      }
    ],
    "instructions": [
      "In a bowl, combine 2 tbsp olive oil, lemon juice, lemon zest, oregano, minced garlic, 1 tsp salt, and pepper. Add chicken cubes and marinate for 15 minutes.",
      "Cook pearl couscous in simmering broth according to package directions (about 10 minutes) until tender and fluffy. Fluff with fork and stir in chopped dill.",
      "Thread chicken onto skewers. Grill on a smoking hot grill pan over medium-high heat for 4 minutes per side until charred and juicy (internal temp 165°F).",
      "Toss diced cucumber, cherry tomatoes, and kalamata olives with 1 tbsp olive oil and a splash of lemon juice.",
      "Assemble bowls: bed of herb couscous, grilled chicken skewers, fresh Mediterranean salad, dollop of cold tzatziki, and fresh mint leaves."
    ],
    "cookingTime": 15,
    "preparationTime": 20,
    "difficulty": "Easy",
    "servings": 4,
    "image": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "High-Protein",
      "Meal Prep",
      "Healthy",
      "Quick & Easy"
    ],
    "createdBy": mockUserId
  }
];
