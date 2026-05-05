const Product = require('./product.model');

const slugify = (text) => text.toString().toLowerCase()
  .replace(/\s+/g, '-')           // Replace spaces with -
  .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
  .replace(/\-\-+/g, '-')         // Replace multiple - with single -
  .replace(/^-+/, '')             // Trim - from start of text
  .replace(/-+$/, '');            // Trim - from end of text

exports.getAll = async (req, res) => {
  try {
    const result = await Product.getProducts(req.query);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { 
      name, product_type, description, price, sale_price, stock_qty, 
      categoryId, brandId, branchId, is_active, images,
      bikeDetail, partDetail
    } = req.body;

    const data = {
      name,
      slug: slugify(name) + '-' + Date.now().toString().slice(-4),
      product_type,
      description,
      price: parseFloat(price),
      sale_price: sale_price ? parseFloat(sale_price) : null,
      stock_qty: parseInt(stock_qty) || 0,
      categoryId: categoryId || null,
      brandId: brandId || null,
      branchId: Number(branchId),
      is_active: is_active !== undefined ? is_active : true,
      images: {
        create: (images || []).map(img => ({
          url: img.url,
          is_primary: img.is_primary || false,
          sort_order: img.sort_order || 0
        }))
      }
    };

    if (product_type === 'bike' && bikeDetail) {
      data.bikeDetail = { create: bikeDetail };
    } else if (product_type === 'part' && partDetail) {
      data.partDetail = { create: partDetail };
    }

    const product = await Product.createProduct(data);
    res.status(201).json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { 
      name, description, price, sale_price, stock_qty, 
      categoryId, brandId, is_active, images,
      bikeDetail, partDetail
    } = req.body;

    const data = {
      ...(name && { name, slug: slugify(name) + '-' + Date.now().toString().slice(-4) }),
      description,
      price: price ? parseFloat(price) : undefined,
      sale_price: sale_price ? parseFloat(sale_price) : null,
      stock_qty: stock_qty !== undefined ? parseInt(stock_qty) : undefined,
      categoryId: categoryId || null,
      brandId: brandId || null,
      is_active: is_active !== undefined ? is_active : true,
    };

    if (images) {
      data.images = {
        deleteMany: {},
        create: images.map(img => ({
          url: img.url,
          is_primary: img.is_primary || false,
          sort_order: img.sort_order || 0
        }))
      };
    }

    if (bikeDetail) {
      data.bikeDetail = {
        upsert: {
          create: bikeDetail,
          update: bikeDetail
        }
      };
    }

    if (partDetail) {
      data.partDetail = {
        upsert: {
          create: partDetail,
          update: partDetail
        }
      };
    }

    const product = await Product.updateProduct(req.params.id, data);
    res.json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Product.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
