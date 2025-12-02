export type Recipe = {
  id: string;
  title: string;
  description: string;
  image: string; // data URL placeholder
  tags: string[];
};

const placeholderImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200' role='img' aria-label='Recipe image placeholder'>
      <rect width='100%' height='100%' fill='#e5e7eb'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6b7280' font-family='Arial, Helvetica, sans-serif' font-size='16'>Recipe Image</text>
    </svg>`
  );

/**
 * PUBLIC_INTERFACE
 * getRecipes returns a list of placeholder recipes for UI scaffolding and local development.
 * No external API calls are made.
 */
export function getRecipes(): Recipe[] {
  return [
    {
      id: "r1",
      title: "Classic Margherita Pizza",
      description: "Crispy crust topped with fresh tomatoes, mozzarella, and basil.",
      image: placeholderImage,
      tags: ["Vegetarian", "Italian", "30 min"],
    },
    {
      id: "r2",
      title: "Spicy Thai Noodles",
      description: "Rice noodles tossed in a zesty, spicy peanut sauce.",
      image: placeholderImage,
      tags: ["Spicy", "Thai", "Quick"],
    },
    {
      id: "r3",
      title: "Avocado Toast Deluxe",
      description: "Sourdough toast with smashed avocado, radish, and chili flakes.",
      image: placeholderImage,
      tags: ["Breakfast", "Vegan", "5 min"],
    },
    {
      id: "r4",
      title: "Grilled Salmon Bowl",
      description: "Perfectly grilled salmon served over brown rice and veggies.",
      image: placeholderImage,
      tags: ["Pescatarian", "High Protein", "Healthy"],
    },
    {
      id: "r5",
      title: "Chicken Tikka Masala",
      description: "Creamy tomato-based curry with marinated chicken pieces.",
      image: placeholderImage,
      tags: ["Indian", "Comfort", "Dinner"],
    },
    {
      id: "r6",
      title: "Mediterranean Quinoa Salad",
      description: "Quinoa with cucumber, tomato, olives, and feta cheese.",
      image: placeholderImage,
      tags: ["Gluten-free", "Salad", "Meal Prep"],
    },
    {
      id: "r7",
      title: "Beef Stir-Fry",
      description: "Sautéed beef and veggies in a savory soy-garlic sauce.",
      image: placeholderImage,
      tags: ["Chinese", "One Pan", "20 min"],
    },
    {
      id: "r8",
      title: "Blueberry Pancakes",
      description: "Fluffy pancakes bursting with fresh blueberries.",
      image: placeholderImage,
      tags: ["Brunch", "Kid-Friendly", "Sweet"],
    },
    // A couple more to demonstrate grid wrapping
    {
      id: "r9",
      title: "Roasted Veggie Tacos",
      description: "Seasonal roasted vegetables with pico de gallo and lime crema.",
      image: placeholderImage,
      tags: ["Tacos", "Vegetarian", "Street Food"],
    },
    {
      id: "r10",
      title: "Creamy Mushroom Risotto",
      description: "Rich and creamy arborio rice with sautéed mushrooms.",
      image: placeholderImage,
      tags: ["Italian", "Comfort", "45 min"],
    },
  ];
}
