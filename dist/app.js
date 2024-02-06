"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const menuData = require('./menu.json');
const app = (0, express_1.default)();
app.use(express_1.default.json());
//Categories
app.get('/categories', (req, res) => {
    const categories = menuData.map((category) => {
        return {
            id: category.id,
            name: category.name,
        };
    });
    res.json(categories);
});
// Categorie ID 
app.get('/categories/:id', (req, res) => {
    const categoryId = parseInt(req.params.id);
    const category = menuData.find((category) => category.id === categoryId);
    if (!category) {
        res.status(404).json({ error: 'Category not found' });
    }
    else {
        res.json(category);
    }
});
// Keyword of each product 
app.get('/products/search', (req, res) => {
    const keyword = req.query.keyword;
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
app.put('/products/:productId/remove-supplements', (req, res) => {
    const productId = parseInt(req.params.productId);
    const supplementsToRemove = req.body.supplements;
    const product = menuData.flatMap((category) => category.products).find((product) => product.id === productId);
    if (!product) {
        res.status(404).json({ error: 'Product not found' });
    }
    else {
        const updatedSupplements = product.supplements.filter((supplement) => !supplementsToRemove.includes(supplement.id));
        product.supplements = updatedSupplements;
        res.json(product);
    }
});
// Client order request 
app.post('/orders', (req, res) => {
    const order = req.body;
    const products = order.products;
    const happyHourIsActive = order.happyHourIsActive;
    let totalCostBeforeDiscount = 0;
    let totalCostAfterDiscount = 0;
    let discountApplied = false;
    const orderDetails = [];
    for (const productInfo of products) {
        const productId = productInfo.id;
        const supplements = productInfo.supplements;
        const product = menuData.flatMap((category) => category.products).find((product) => product.id === productId);
        if (!product) {
            res.status(400).json({ error: `Product with ID ${productId} not found` });
            return;
        }
        const supplementsInfo = product.supplements.filter((supplement) => supplements.includes(supplement.id));
        const productPrice = happyHourIsActive ? product.happyHourPrice : product.price;
        totalCostBeforeDiscount += productPrice;
        const supplementsCost = supplementsInfo.reduce((total, supplement) => {
            const supplementPrice = happyHourIsActive ? supplement.happyHourPrice : supplement.price;
            return total + supplementPrice;
        }, 0);
        totalCostBeforeDiscount += supplementsCost;
        orderDetails.push({
            product: product.name,
            price: product.price,
            happyHourPrice: product.happyHourPrice,
            supplements: supplementsInfo,
        });
    }
    if (happyHourIsActive) {
        totalCostAfterDiscount = totalCostBeforeDiscount * 0.9;
        discountApplied = true;
    }
    else {
        totalCostAfterDiscount = totalCostBeforeDiscount;
    }
    const response = {
        totalCostBeforeDiscount,
        totalCostAfterDiscount,
        discountApplied,
        orderDetails,
    };
    res.json(response);
});
app.listen(3001, () => {
    console.log('Server running on port 3001');
});
