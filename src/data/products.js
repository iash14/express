let products = [
  {
    id: 1,
    name: "Ноутбук Dell XPS 13",
    description: "Потужний ультрабук з екраном 13 дюймів",
    price: 45000,
    category: "electronics",
    inStock: true,
    quantity: 15,
    createdBy: 1,
    createdAt: "2024-01-05T09:00:00Z"
  },
  {
    id: 2,
    name: "Смартфон iPhone 15",
    description: "Флагманський смартфон від Apple",
    price: 55000,
    category: "electronics",
    inStock: true,
    quantity: 25,
    createdBy: 2,
    createdAt: "2024-01-06T10:30:00Z"
  },
  {
    id: 3,
    name: "Футболка чорна",
    description: "Бавовняна футболка класичного крою",
    price: 800,
    category: "clothing",
    inStock: true,
    quantity: 50,
    createdBy: 1,
    createdAt: "2024-01-07T11:45:00Z"
  },
  {
    id: 4,
    name: "Книга 'JavaScript для початківців'",
    description: "Повний посібник з JavaScript",
    price: 600,
    category: "books",
    inStock: false,
    quantity: 0,
    createdBy: 3,
    createdAt: "2024-01-08T14:20:00Z"
  }
];

const productModel = {
  getAll: (filters = {}) => {
    let data = [...products];

    if (filters.category)
      data = data.filter(p => p.category === filters.category);

    if (filters.inStock !== undefined)
      data = data.filter(p => p.inStock === (filters.inStock === "true"));

    if (filters.search) {
      const s = filters.search.toLowerCase();
      data = data.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s)
      );
    }

    if (filters.sort === "price_asc")
      data.sort((a, b) => a.price - b.price);
    if (filters.sort === "price_desc")
      data.sort((a, b) => b.price - a.price);

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const start = (page - 1) * limit;

    return {
      products: data.slice(start, start + limit),
      total: data.length,
      page,
      totalPages: Math.ceil(data.length / limit),
      hasNextPage: start + limit < data.length,
      hasPrevPage: start > 0
    };
  },

  findById: (id) =>
    products.find(p => p.id === Number(id)),

  create: (data) => {
    const id = Math.max(...products.map(p => p.id)) + 1;
    const p = { id, ...data, createdAt: new Date().toISOString() };
    products.push(p);
    return p;
  },

  update: (id, data) => {
    const i = products.findIndex(p => p.id === Number(id));
    if (i === -1) return null;
    products[i] = { ...products[i], ...data };
    return products[i];
  },

  delete: (id) => {
    const i = products.findIndex(p => p.id === Number(id));
    if (i === -1) return false;
    products.splice(i, 1);
    return true;
  },

  getByUser: (uid) =>
    products.filter(p => p.createdBy === Number(uid))
};

module.exports = productModel;
