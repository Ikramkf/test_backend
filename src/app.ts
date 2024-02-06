import express, { Request, Response } from 'express';


const menuData = require('./menu.json');

const app = express();
app.use(express.json());

//Categories
app.get('/categories', (req: Request, res: Response) => {
  const categories = menuData.map((category: any) => {
    return {
      id: category.id,
      name: category.name,
    };
  });
  res.json(categories);
});

// Categorie ID 
app.get('/categories/:id', (req: Request, res: Response) => {
  const categoryId = parseInt(req.params.id);
  const category = menuData.find((category: any) => category.id === categoryId);

  if (!category) {
    res.status(404).json({ error: 'Category not found' });
  } else {
    res.json(category);
  }
});

// Keyword of each product 
app.get('/products/search', (req: Request, res: Response) => {
  const keyword = req.query.keyword as string;
  const matchingProducts = [];

  for (const category of menuData) {
    for (const product of category.products) {
      if (product.name.toLowerCase().includes(keyword.toLowerCase())) {
        matchingProducts.push(product);
      }
    }
  }

  res.json(matchingProducts);
});

// Remove supplements
app.put('/products/:productId/remove-supplements', (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);
  const supplementsToRemove = req.body.supplements as number[];

  const product = menuData.flatMap((category: any) => category.products).find((product: any) => product.id === productId);

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
  } else {
    const updatedSupplements = product.supplements.filter((supplement: any) => !supplementsToRemove.includes(supplement.id));
    product.supplements = updatedSupplements;
    res.json(product);
  }
});


app.listen(3001, () => {
  console.log('Server running on port 3001');
});