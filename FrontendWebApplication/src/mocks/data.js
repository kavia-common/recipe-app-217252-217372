import { selectCategoryImagePath } from "./imageUtil";
/**
 * Representative mock datasets for recipes and categories used in mock mode.
 * Uses deterministic LOCAL food assets for reliable preview images.
 * No external image hosts are referenced. Local assets are not cache-busted.
 */

// PUBLIC_INTERFACE
export const mockCategories = [
  { id: "cat-breakfast", name: "Breakfast" },
  { id: "cat-lunch", name: "Lunch" },
  { id: "cat-dinner", name: "Dinner" },
  { id: "cat-dessert", name: "Dessert" },
  { id: "cat-vegetarian", name: "Vegetarian" },
  { id: "cat-vegan", name: "Vegan" },
  { id: "cat-quick", name: "Quick & Easy" },
  { id: "cat-soup", name: "Soup" },
  { id: "cat-snack", name: "Snack" },
  { id: "cat-salad", name: "Salad" },
];

// Helper: recent date generator for "newest" sort
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// Base recipes (IDs are stable). Do not include remote imageUrl; it will be assigned via local selection.
const baseRecipesRaw = [
  {
    id: "r-1",
    title: "Classic Pancakes",
    description: "Fluffy pancakes perfect for a cozy morning.",
    category: "Breakfast",
    cuisine: "American",
    difficulty: "easy",
    prepTime: 10,
    cookTime: 15,
    isFeatured: true,
    trendingScore: 98,
    createdAt: daysAgo(20),
    ingredients: [
      "2 cups all-purpose flour",
      "2 tbsp sugar",
      "1 tbsp baking powder",
      "1/2 tsp salt",
      "2 large eggs",
      "1 1/2 cups milk",
      "2 tbsp melted butter",
    ],
    steps: [
      "Whisk flour, sugar, baking powder, and salt.",
      "Beat eggs with milk and butter; combine with dry ingredients.",
      "Heat a lightly oiled skillet over medium heat; pour 1/4 cup batter, cook until bubbles form, flip and cook until golden.",
    ],
  },
  {
    id: "r-2",
    title: "Spaghetti Aglio e Olio",
    description: "Garlicky olive oil pasta finished with parsley and chili flakes.",
    category: "Dinner",
    cuisine: "Italian",
    difficulty: "easy",
    prepTime: 10,
    cookTime: 15,
    isFeatured: true,
    trendingScore: 92,
    createdAt: daysAgo(15),
    ingredients: [
      "200 g spaghetti",
      "4 cloves garlic, thinly sliced",
      "4 tbsp extra-virgin olive oil",
      "1/2 tsp red pepper flakes",
      "2 tbsp chopped parsley",
      "Salt",
    ],
    steps: [
      "Boil spaghetti in salted water until al dente; reserve 1/4 cup pasta water.",
      "Gently sauté garlic in olive oil until fragrant; add chili flakes.",
      "Toss spaghetti with oil mixture and a splash of pasta water; finish with parsley.",
    ],
  },
  {
    id: "r-3",
    title: "Vegan Buddha Bowl",
    description: "Colorful bowl with quinoa, roasted veggies, and tahini-lemon dressing.",
    category: "Vegan",
    cuisine: "Fusion",
    difficulty: "medium",
    prepTime: 20,
    cookTime: 25,
    isFeatured: false,
    trendingScore: 70,
    createdAt: daysAgo(27),
    ingredients: [
      "1 cup quinoa, rinsed",
      "1 large sweet potato, cubed",
      "1 cup chickpeas, drained",
      "2 cups baby spinach",
      "2 tbsp tahini",
      "1 lemon (juice)",
      "1 tbsp olive oil",
      "Salt & pepper",
    ],
    steps: [
      "Roast sweet potato at 425°F (220°C) for 20–25 minutes.",
      "Cook quinoa per package; fluff with fork.",
      "Whisk tahini with lemon juice and water for dressing.",
      "Assemble with spinach, quinoa, roasted sweet potato, chickpeas; drizzle dressing.",
    ],
  },
  {
    id: "r-4",
    title: "Chicken Tikka Masala",
    description: "Creamy tomato-based curry with marinated chicken.",
    category: "Dinner",
    cuisine: "Indian",
    difficulty: "hard",
    prepTime: 30,
    cookTime: 40,
    isFeatured: false,
    trendingScore: 85,
    createdAt: daysAgo(35),
    ingredients: [
      "500 g chicken thighs, cubed",
      "1 cup yogurt",
      "2 tbsp tikka masala spice",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "400 g crushed tomatoes",
      "1/2 cup cream",
      "Cilantro",
      "Salt & oil",
    ],
    steps: [
      "Marinate chicken in yogurt and spices for at least 1 hour.",
      "Brown chicken; remove. Sauté onion and garlic.",
      "Add tomatoes; simmer. Return chicken; finish with cream and cilantro.",
    ],
  },
  {
    id: "r-5",
    title: "Avocado Toast",
    description: "Quick breakfast with creamy avocado and crunchy toast.",
    category: "Breakfast",
    cuisine: "Modern",
    difficulty: "easy",
    prepTime: 5,
    cookTime: 5,
    isFeatured: true,
    trendingScore: 95,
    createdAt: daysAgo(10),
    ingredients: [
      "2 slices sourdough",
      "1 ripe avocado",
      "1 tsp lemon juice",
      "Chili flakes",
      "Salt & pepper",
      "Olive oil",
    ],
    steps: [
      "Toast bread to desired doneness.",
      "Mash avocado with lemon, salt, pepper.",
      "Spread on toast; sprinkle chili flakes and drizzle olive oil.",
    ],
  },
  {
    id: "r-6",
    title: "Chocolate Brownies",
    description: "Rich, fudgy brownies with a crackly top.",
    category: "Dessert",
    cuisine: "American",
    difficulty: "medium",
    prepTime: 15,
    cookTime: 30,
    isFeatured: false,
    trendingScore: 80,
    createdAt: daysAgo(40),
    ingredients: [
      "1/2 cup butter",
      "1 cup sugar",
      "1/3 cup cocoa powder",
      "2 eggs",
      "1/2 cup flour",
      "1 tsp vanilla",
      "Pinch salt",
    ],
    steps: [
      "Melt butter; whisk in sugar and cocoa.",
      "Beat in eggs and vanilla; fold in flour and salt.",
      "Bake at 350°F (175°C) for 25–30 minutes.",
    ],
  },
  {
    id: "r-7",
    title: "Greek Salad",
    description: "Crisp cucumbers, tomatoes, olives, and feta with lemon-oregano dressing.",
    category: "Salad",
    cuisine: "Greek",
    difficulty: "easy",
    prepTime: 15,
    cookTime: 0,
    isFeatured: false,
    trendingScore: 76,
    createdAt: daysAgo(7),
    ingredients: [
      "1 cucumber, chopped",
      "2 tomatoes, chopped",
      "1/2 red onion, thinly sliced",
      "1/2 cup Kalamata olives",
      "100 g feta, cubed",
      "2 tbsp olive oil",
      "1 tbsp lemon juice",
      "1/2 tsp dried oregano",
      "Salt & pepper",
    ],
    steps: [
      "Combine cucumber, tomatoes, onion, olives, and feta.",
      "Whisk olive oil, lemon, oregano, salt, and pepper; toss to coat.",
    ],
  },
  {
    id: "r-8",
    title: "Tom Yum Soup",
    description: "Hot and sour Thai soup with shrimp and fragrant herbs.",
    category: "Soup",
    cuisine: "Thai",
    difficulty: "medium",
    prepTime: 20,
    cookTime: 20,
    isFeatured: false,
    trendingScore: 82,
    createdAt: daysAgo(9),
    ingredients: [
      "4 cups chicken stock",
      "2 stalks lemongrass",
      "4 kaffir lime leaves",
      "3 slices galangal",
      "200 g shrimp",
      "1 cup mushrooms",
      "2 tbsp fish sauce",
      "1–2 tbsp lime juice",
      "Chilies",
      "Cilantro",
    ],
    steps: [
      "Simmer stock with lemongrass, lime leaves, and galangal for 10 minutes.",
      "Add mushrooms and shrimp; cook until pink.",
      "Season with fish sauce, lime juice, and chilies; garnish with cilantro.",
    ],
  },
  {
    id: "r-9",
    title: "Sushi Bowl",
    description: "Deconstructed sushi with rice, salmon, avocado, and nori.",
    category: "Lunch",
    cuisine: "Japanese",
    difficulty: "medium",
    prepTime: 25,
    cookTime: 15,
    isFeatured: false,
    trendingScore: 78,
    createdAt: daysAgo(18),
    ingredients: [
      "2 cups cooked sushi rice",
      "200 g salmon (sashimi-grade) or smoked",
      "1 avocado, sliced",
      "1 cucumber, matchsticks",
      "Nori strips",
      "Soy sauce",
      "Sesame seeds",
      "Pickled ginger",
    ],
    steps: [
      "Prepare rice and season as desired.",
      "Arrange rice with salmon, avocado, cucumber, nori.",
      "Top with sesame seeds; serve with soy and pickled ginger.",
    ],
  },
  {
    id: "r-10",
    title: "Beef Tacos",
    description: "Weeknight-friendly tacos with spiced beef and fresh toppings.",
    category: "Dinner",
    cuisine: "Mexican",
    difficulty: "easy",
    prepTime: 15,
    cookTime: 15,
    isFeatured: true,
    trendingScore: 97,
    createdAt: daysAgo(5),
    ingredients: [
      "8 small tortillas",
      "400 g ground beef",
      "1 tbsp taco seasoning",
      "1 cup shredded lettuce",
      "1 tomato, diced",
      "1/2 cup shredded cheese",
      "Salsa & sour cream",
    ],
    steps: [
      "Brown beef; add taco seasoning and a splash of water.",
      "Warm tortillas; assemble with beef and toppings.",
    ],
  },
  {
    id: "r-11",
    title: "Miso Ramen",
    description: "Comforting ramen with miso broth and soft-boiled egg.",
    category: "Dinner",
    cuisine: "Japanese",
    difficulty: "hard",
    prepTime: 25,
    cookTime: 45,
    isFeatured: false,
    trendingScore: 81,
    createdAt: daysAgo(50),
    ingredients: [
      "4 cups chicken/vegetable stock",
      "2 tbsp miso paste",
      "2 packs ramen noodles",
      "1 egg per serving",
      "Scallions",
      "Corn",
      "Nori",
    ],
    steps: [
      "Simmer stock; whisk in miso.",
      "Cook ramen; soft-boil eggs; assemble bowls with toppings.",
    ],
  },
  {
    id: "r-12",
    title: "Falafel Wrap",
    description: "Crispy falafel with tahini sauce and fresh veggies.",
    category: "Lunch",
    cuisine: "Middle Eastern",
    difficulty: "medium",
    prepTime: 30,
    cookTime: 20,
    isFeatured: false,
    trendingScore: 74,
    createdAt: daysAgo(22),
    ingredients: [
      "2 cups soaked chickpeas",
      "1 onion",
      "2 cloves garlic",
      "1 cup parsley",
      "1 tsp cumin",
      "Salt & pepper",
      "Pita or wraps",
      "Tahini sauce",
    ],
    steps: [
      "Blend chickpeas with aromatics and spices; form balls.",
      "Fry/bake until crispy; serve in wraps with tahini and salad.",
    ],
  },
  {
    id: "r-13",
    title: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella, and basil.",
    category: "Dinner",
    cuisine: "Italian",
    difficulty: "medium",
    prepTime: 20,
    cookTime: 15,
    isFeatured: true,
    trendingScore: 93,
    createdAt: daysAgo(8),
    ingredients: [
      "Pizza dough",
      "Tomato sauce",
      "Fresh mozzarella",
      "Fresh basil",
      "Olive oil",
      "Salt",
    ],
    steps: [
      "Stretch dough; spread sauce; add mozzarella.",
      "Bake at highest oven temp until bubbly; finish with basil and oil.",
    ],
  },
  {
    id: "r-14",
    title: "Pad Thai",
    description: "Stir-fried rice noodles with tamarind, egg, and peanuts.",
    category: "Dinner",
    cuisine: "Thai",
    difficulty: "medium",
    prepTime: 20,
    cookTime: 15,
    isFeatured: false,
    trendingScore: 88,
    createdAt: daysAgo(28),
    ingredients: [
      "Rice noodles",
      "2 eggs",
      "Bean sprouts",
      "Chives",
      "Tamarind paste",
      "Fish sauce",
      "Palm sugar",
      "Crushed peanuts",
      "Lime",
    ],
    steps: [
      "Soak noodles; make sauce with tamarind, fish sauce, sugar.",
      "Stir-fry noodles with egg and sauce; add sprouts and chives; top with peanuts and lime.",
    ],
  },
  {
    id: "r-15",
    title: "Blueberry Muffins",
    description: "Tender muffins bursting with blueberries.",
    category: "Dessert",
    cuisine: "American",
    difficulty: "easy",
    prepTime: 15,
    cookTime: 20,
    isFeatured: false,
    trendingScore: 69,
    createdAt: daysAgo(17),
    ingredients: [
      "1 1/2 cups flour",
      "3/4 cup sugar",
      "2 tsp baking powder",
      "1/2 tsp salt",
      "1 egg",
      "1/2 cup milk",
      "1/3 cup oil",
      "1 cup blueberries",
    ],
    steps: [
      "Combine dry; whisk wet; fold together with blueberries.",
      "Bake at 375°F (190°C) for 18–22 minutes.",
    ],
  },
  {
    id: "r-16",
    title: "Shakshuka",
    description: "Eggs poached in spicy tomato-pepper sauce.",
    category: "Breakfast",
    cuisine: "Middle Eastern",
    difficulty: "easy",
    prepTime: 10,
    cookTime: 20,
    isFeatured: false,
    trendingScore: 83,
    createdAt: daysAgo(6),
    ingredients: [
      "1 onion, sliced",
      "1 red pepper, sliced",
      "2 cups crushed tomatoes",
      "4 eggs",
      "1 tsp cumin",
      "1/2 tsp paprika",
      "Olive oil, salt, pepper",
      "Parsley",
    ],
    steps: [
      "Sauté onion and pepper; add spices and tomatoes; simmer.",
      "Make wells; crack eggs; cover until whites set. Garnish with parsley.",
    ],
  },
  {
    id: "r-17",
    title: "Caprese Sandwich",
    description: "Fresh mozzarella, tomato, and basil on ciabatta.",
    category: "Lunch",
    cuisine: "Italian",
    difficulty: "easy",
    prepTime: 10,
    cookTime: 0,
    isFeatured: false,
    trendingScore: 65,
    createdAt: daysAgo(3),
    ingredients: [
      "Ciabatta roll",
      "Fresh mozzarella",
      "Tomato slices",
      "Fresh basil",
      "Balsamic glaze",
      "Olive oil, salt, pepper",
    ],
    steps: [
      "Split bread; layer mozzarella, tomato, and basil.",
      "Drizzle with oil and balsamic; season with salt and pepper.",
    ],
  },
  {
    id: "r-18",
    title: "César Salad",
    description: "Crisp romaine, creamy dressing, croutons, and parmesan.",
    category: "Salad",
    cuisine: "American",
    difficulty: "easy",
    prepTime: 15,
    cookTime: 0,
    isFeatured: false,
    trendingScore: 60,
    createdAt: daysAgo(11),
    ingredients: [
      "Romaine lettuce",
      "Croutons",
      "Parmesan",
      "César dressing",
      "Lemon",
      "Pepper",
    ],
    steps: [
      "Toss lettuce with dressing; top with croutons and parmesan.",
      "Finish with a squeeze of lemon and pepper.",
    ],
  },
  {
    id: "r-19",
    title: "Butter Chicken",
    description: "Silky tomato-butter sauce with tender chicken.",
    category: "Dinner",
    cuisine: "Indian",
    difficulty: "medium",
    prepTime: 25,
    cookTime: 30,
    isFeatured: true,
    trendingScore: 90,
    createdAt: daysAgo(4),
    ingredients: [
      "500 g chicken",
      "2 tbsp butter",
      "1 onion",
      "2 cloves garlic",
      "1 tsp ginger",
      "400 g tomatoes",
      "Cream",
      "Garam masala",
      "Kasuri methi",
      "Salt",
    ],
    steps: [
      "Sauté onion, garlic, ginger; add spices and tomatoes.",
      "Add chicken; simmer until tender. Finish with butter, cream, and kasuri methi.",
    ],
  },
  {
    id: "r-20",
    title: "Tiramisu",
    description: "Espresso-soaked ladyfingers layered with mascarpone cream.",
    category: "Dessert",
    cuisine: "Italian",
    difficulty: "medium",
    prepTime: 30,
    cookTime: 0,
    isFeatured: false,
    trendingScore: 72,
    createdAt: daysAgo(2),
    ingredients: [
      "Ladyfingers",
      "250 g mascarpone",
      "2 eggs",
      "1/3 cup sugar",
      "1 cup espresso",
      "Cocoa powder",
    ],
    steps: [
      "Whisk yolks with sugar; fold in mascarpone; fold in whipped whites.",
      "Dip ladyfingers in espresso; layer with cream. Chill and dust with cocoa.",
    ],
  },
  {
    id: "r-21",
    title: "Guacamole",
    description: "Chunky, zesty guacamole for chips or tacos.",
    category: "Snack",
    cuisine: "Mexican",
    difficulty: "easy",
    prepTime: 10,
    cookTime: 0,
    isFeatured: false,
    trendingScore: 79,
    createdAt: daysAgo(1),
    ingredients: [
      "3 ripe avocados",
      "1/4 cup red onion, minced",
      "1 tomato, diced",
      "1 jalapeño, minced",
      "Lime juice",
      "Cilantro",
      "Salt",
    ],
    steps: [
      "Mash avocados; fold in onion, tomato, jalapeño, lime, cilantro, and salt.",
    ],
  },
  {
    id: "r-22",
    title: "French Onion Soup",
    description: "Deeply caramelized onions in rich broth with Gruyère toasts.",
    category: "Soup",
    cuisine: "French",
    difficulty: "hard",
    prepTime: 20,
    cookTime: 60,
    isFeatured: false,
    trendingScore: 68,
    createdAt: daysAgo(16),
    ingredients: [
      "4 large onions, thinly sliced",
      "2 tbsp butter",
      "1 tbsp olive oil",
      "1/2 cup white wine",
      "4 cups beef stock",
      "Baguette slices",
      "Gruyère, grated",
      "Salt & pepper",
    ],
    steps: [
      "Slowly caramelize onions in butter and oil until deeply golden.",
      "Deglaze with wine; add stock and simmer.",
      "Top bowls with toasts and Gruyère; broil until melted.",
    ],
  },
  {
    id: "r-23",
    title: "Hummus",
    description: "Creamy hummus with tahini, lemon, and olive oil.",
    category: "Snack",
    cuisine: "Middle Eastern",
    difficulty: "easy",
    prepTime: 10,
    cookTime: 0,
    isFeatured: false,
    trendingScore: 62,
    createdAt: daysAgo(13),
    ingredients: [
      "1 can chickpeas, drained",
      "2 tbsp tahini",
      "2 tbsp lemon juice",
      "1 clove garlic",
      "2 tbsp olive oil",
      "Salt",
      "Water as needed",
    ],
    steps: [
      "Blend chickpeas, tahini, lemon, garlic; stream oil and water until smooth; season with salt.",
    ],
  },
  {
    id: "r-24",
    title: "Pho Ga (Chicken Pho)",
    description: "Delicate Vietnamese chicken noodle soup with aromatics.",
    category: "Dinner",
    cuisine: "Vietnamese",
    difficulty: "medium",
    prepTime: 25,
    cookTime: 90,
    isFeatured: false,
    trendingScore: 84,
    createdAt: daysAgo(12),
    ingredients: [
      "Whole chicken or parts",
      "Onion and ginger (charred)",
      "Star anise, cloves, cinnamon",
      "Fish sauce",
      "Rice noodles",
      "Scallions, cilantro",
      "Lime, chilies",
    ],
    steps: [
      "Simmer chicken with charred onion/ginger and spices to make broth.",
      "Shred chicken; cook rice noodles; assemble bowls with herbs and lime.",
    ],
  },
];

// Compute final image URLs using category-aware local selector for all recipes
const baseRecipes = baseRecipesRaw.map((r, idx) => ({
  ...r,
  imageUrl: selectCategoryImagePath(r) || selectCategoryImagePath({ ...r, id: `${r.id}-${idx}` }),
}));

/**
 * PUBLIC_INTERFACE
 * Returns filtered/sorted array of recipes. Supports sort: featured, trending, newest.
 * Accepts optional pagination (page, pageSize) so callers can request chunks.
 */
export function getMockRecipes({
  sort = "",
  category = "",
  cuisine = "",
  difficulty = "",
  page,
  pageSize,
} = {}) {
  let out = [...baseRecipes];

  if (category) {
    out = out.filter(
      (r) => (r.category || "").toLowerCase() === String(category).toLowerCase()
    );
  }
  if (cuisine) {
    out = out.filter((r) =>
      (r.cuisine || "").toLowerCase().includes(String(cuisine).toLowerCase())
    );
  }
  if (difficulty) {
    out = out.filter(
      (r) => (r.difficulty || "").toLowerCase() === String(difficulty).toLowerCase()
    );
  }

  if (sort === "featured") {
    out = out.filter((r) => !!r.isFeatured);
    // Keep deterministic by newest among featured
    out.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  } else if (sort === "trending") {
    // Sort by trendingScore desc, then newest
    out.sort((a, b) => {
      const s = (b.trendingScore || 0) - (a.trendingScore || 0);
      if (s !== 0) return s;
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
  } else if (sort === "newest") {
    out.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  // Optional pagination (used by mockApi if needed)
  if (page != null && pageSize != null && page > 0 && pageSize > 0) {
    const start = (page - 1) * pageSize;
    out = out.slice(start, start + pageSize);
  }

  return out;
}

// PUBLIC_INTERFACE
export function getMockRecipeById(id) {
  /** Returns a single recipe by id or null. */
  return baseRecipes.find((r) => r.id === String(id)) || null;
}

// PUBLIC_INTERFACE
export function getAllMockRecipes() {
  /** Returns the full dataset (unfiltered) — useful for total counts in diagnostics if ever needed. */
  return [...baseRecipes];
}
