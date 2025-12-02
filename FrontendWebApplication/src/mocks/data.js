//
// Representative mock datasets for recipes and categories used in mock mode.
//

// PUBLIC_INTERFACE
export const mockCategories = [
  { id: "cat-breakfast", name: "Breakfast" },
  { id: "cat-lunch", name: "Lunch" },
  { id: "cat-dinner", name: "Dinner" },
  { id: "cat-dessert", name: "Dessert" },
  { id: "cat-vegetarian", name: "Vegetarian" },
  { id: "cat-vegan", name: "Vegan" },
  { id: "cat-quick", name: "Quick & Easy" },
];

// Base recipe templates
const baseRecipes = [
  {
    id: "r-1",
    title: "Classic Pancakes",
    description: "Fluffy pancakes perfect for a cozy morning.",
    imageUrl: "https://images.unsplash.com/photo-1587731425230-…?w=800&q=80",
    category: "Breakfast",
    cuisine: "American",
    difficulty: "easy",
    prepTime: 10,
    cookTime: 15,
    isFeatured: true,
    ingredients: ["2 cups flour", "2 eggs", "1 1/2 cups milk", "2 tbsp sugar", "1 tsp baking powder", "Pinch salt"],
    steps: ["Mix all dry ingredients", "Add eggs and milk, whisk until smooth", "Cook on greased skillet until golden on both sides"],
  },
  {
    id: "r-2",
    title: "Spaghetti Aglio e Olio",
    description: "Simple and delicious garlic and olive oil pasta.",
    imageUrl: "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?w=800&q=80",
    category: "Dinner",
    cuisine: "Italian",
    difficulty: "easy",
    prepTime: 10,
    cookTime: 20,
    isFeatured: true,
    ingredients: ["Spaghetti", "Garlic", "Olive oil", "Red pepper flakes", "Parsley", "Salt"],
    steps: ["Boil pasta", "Sauté garlic in olive oil", "Toss with pasta, pepper flakes, and parsley"],
  },
  {
    id: "r-3",
    title: "Vegan Buddha Bowl",
    description: "Colorful bowl of grains, veggies, and tahini dressing.",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    category: "Vegan",
    cuisine: "Fusion",
    difficulty: "medium",
    prepTime: 20,
    cookTime: 25,
    isFeatured: false,
    ingredients: ["Quinoa", "Chickpeas", "Sweet potato", "Spinach", "Tahini", "Lemon"],
    steps: ["Roast sweet potato", "Cook quinoa", "Assemble bowl and drizzle tahini dressing"],
  },
  {
    id: "r-4",
    title: "Chicken Tikka Masala",
    description: "Creamy tomato-based curry with marinated chicken.",
    imageUrl: "https://images.unsplash.com/photo-1604908177077-2755980f3c6f?w=800&q=80",
    category: "Dinner",
    cuisine: "Indian",
    difficulty: "hard",
    prepTime: 30,
    cookTime: 40,
    isFeatured: false,
    ingredients: ["Chicken", "Yogurt", "Tomatoes", "Onion", "Garlic", "Garam masala"],
    steps: ["Marinate chicken", "Cook onions and spices", "Add tomatoes and cream, simmer with chicken"],
  },
  {
    id: "r-5",
    title: "Avocado Toast",
    description: "Quick breakfast with creamy avocado and crunchy toast.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    category: "Breakfast",
    cuisine: "Modern",
    difficulty: "easy",
    prepTime: 5,
    cookTime: 5,
    isFeatured: true,
    ingredients: ["Bread", "Avocado", "Lemon", "Chili flakes", "Salt"],
    steps: ["Toast bread", "Mash avocado with lemon and salt", "Spread and top with chili flakes"],
  },
  {
    id: "r-6",
    title: "Chocolate Brownies",
    description: "Rich, fudgy brownies with a crackly top.",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?w=800&q=80",
    category: "Dessert",
    cuisine: "American",
    difficulty: "medium",
    prepTime: 15,
    cookTime: 30,
    isFeatured: false,
    ingredients: ["Butter", "Sugar", "Cocoa powder", "Flour", "Eggs", "Vanilla"],
    steps: ["Melt butter and mix with cocoa and sugar", "Add eggs and flour", "Bake until set"],
  },
];

// PUBLIC_INTERFACE
export function getMockRecipes({ sort = "", category = "", cuisine = "", difficulty = "" } = {}) {
  /**
   * Returns a filtered/sorted array of recipes.
   * sort accepts: featured, trending, newest (for demo we just shuffle or filter).
   */
  let out = [...baseRecipes];

  if (category) out = out.filter(r => (r.category || "").toLowerCase() === category.toLowerCase());
  if (cuisine) out = out.filter(r => (r.cuisine || "").toLowerCase().includes(cuisine.toLowerCase()));
  if (difficulty) out = out.filter(r => (r.difficulty || "").toLowerCase() === difficulty.toLowerCase());

  if (sort === "featured") {
    out = out.filter(r => r.isFeatured);
  } else if (sort === "trending") {
    // simple: move featured to top and then others
    out = [...out.filter(r => r.isFeatured), ...out.filter(r => !r.isFeatured)];
  } else if (sort === "newest") {
    // pretend newer are by id descending
    out = out.sort((a, b) => (b.id > a.id ? 1 : -1));
  }

  return out;
}

// PUBLIC_INTERFACE
export function getMockRecipeById(id) {
  /** Returns a single recipe by id or null */
  const list = getMockRecipes();
  return list.find(r => r.id === String(id)) || null;
}
