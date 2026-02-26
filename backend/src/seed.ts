import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { getMetaDB, getTenantDB } from '@/modules/database/tenantConnection';
import { getModelByTenant } from '@/modules/database/modelFactory';
import { UserSchema, IUser } from '@/modules/platform/models/user.schema';
import { TenantSchema, ITenant } from '@/modules/platform/models/tenant.schema';
import { ProductSchema, IProduct } from '@/modules/products/models/product.schema';
import { CategorySchema, ICategory } from '@/modules/categories/models/category.schema';
import { OrderSchema, IOrder } from '@/modules/orders/models/order.schema';

const CATEGORIES = [
  { name: 'Electrónica', slug: 'electronica' },
  { name: 'Ropa', slug: 'ropa' },
  { name: 'Hogar', slug: 'hogar' },
  { name: 'Deportes', slug: 'deportes' },
];

const PRODUCT_NAMES = [
  'Auriculares Bluetooth', 'Teclado Mecánico', 'Mouse Inalámbrico', 'Monitor 24"',
  'Webcam HD', 'Parlante Portátil', 'Cargador USB-C', 'Hub USB 4 puertos',
  'Funda para Notebook', 'Soporte para Monitor', 'Mousepad XL', 'Cable HDMI 2m',
  'Lámpara LED Escritorio', 'Organizador de Cables', 'Adaptador WiFi USB',
  'Remera Básica', 'Jean Clásico', 'Zapatillas Running', 'Campera Impermeable',
  'Gorra Deportiva', 'Medias Pack x3', 'Mochila Urbana', 'Riñonera Deportiva',
  'Termo 1L', 'Mate de Cerámica', 'Botella Térmica 750ml', 'Toalla Microfibra',
  'Pelota de Fútbol', 'Soga para Saltar', 'Banda Elástica Set',
];

const PROVINCIAS = [
  'Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'Córdoba', 'Santa Fe',
  'Mendoza', 'Tucumán', 'Entre Ríos', 'Salta',
];

const CIUDADES = [
  'La Plata', 'Mar del Plata', 'Rosario', 'Córdoba Capital',
  'Mendoza Capital', 'San Miguel de Tucumán', 'Paraná', 'Salta Capital',
];

const NOMBRES = [
  'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez',
  'Pedro Sánchez', 'Laura Fernández', 'Diego Torres', 'Lucía Rodríguez',
  'Martín Gómez', 'Valentina Díaz', 'Santiago Romero', 'Camila Ruiz',
];

const EMAILS_BUYERS = [
  'juan.perez@gmail.com', 'maria.garcia@outlook.com', 'carlos.lopez@yahoo.com',
  'ana.martinez@gmail.com', 'pedro.sanchez@hotmail.com', 'laura.fernandez@gmail.com',
  'diego.torres@outlook.com', 'lucia.rodriguez@gmail.com', 'martin.gomez@yahoo.com',
  'valentina.diaz@gmail.com', 'santiago.romero@hotmail.com', 'camila.ruiz@gmail.com',
];

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];
const pickN = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

export async function runSeed() {

  const metaConnection = getMetaDB();
  const UserModel = getModelByTenant<IUser>(metaConnection, 'User', UserSchema);
  const TenantModel = getModelByTenant<ITenant>(metaConnection, 'Tenant', TenantSchema);

  const existingUser = await UserModel.findOne({ email: 'raphanicaise@gmail.com' });
  if (existingUser) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('123456', salt);

  const user1 = new UserModel({
    name: 'Rapha Nicaise',
    email: 'raphanicaise@gmail.com',
    passwordHash,
    isConfirmed: true,
    associatedStores: [],
  });
  await user1.save();

  const user2 = new UserModel({
    name: 'Rapha Nicaise Alt',
    email: 'raphanicaise1@gmail.com',
    passwordHash,
    isConfirmed: true,
    associatedStores: [],
  });
  await user2.save();

  console.log('  ✓ Usuarios creados');

  const tenant = new TenantModel({
    slug: 'test',
    dbName: 'db_test',
    storeName: 'Tienda Test',
    ownerEmail: 'raphanicaise@gmail.com',
    location: 'Buenos Aires, Argentina',
    description: 'Tienda de prueba con productos variados',
    members: [{ userId: user1._id as Types.ObjectId, role: 'owner' }],
    isActive: true,
  });
  await tenant.save();

  await UserModel.findByIdAndUpdate(user1._id, {
    $push: {
      associatedStores: {
        tenantId: tenant._id,
        slug: 'test',
        storeName: 'Tienda Test',
        role: 'owner',
      },
    },
  });


  const tenantConnection = getTenantDB('db_test');
  const CategoryModel = getModelByTenant<ICategory>(tenantConnection, 'Category', CategorySchema);
  const ProductModel = getModelByTenant<IProduct>(tenantConnection, 'Product', ProductSchema);
  const OrderModel = getModelByTenant<IOrder>(tenantConnection, 'Order', OrderSchema);

  const createdCategories = [];
  for (const cat of CATEGORIES) {
    const newCat = new CategoryModel({ name: cat.name, slug: cat.slug });
    await newCat.save();
    createdCategories.push(newCat);
  }


  const createdProducts = [];
  for (let i = 0; i < 30; i++) {
    const name = PRODUCT_NAMES[i];
    const price = rand(500, 50000);
    const stock = rand(0, 200);
    const assignedCats = pickN(createdCategories, rand(1, 2)).map(c => c._id as Types.ObjectId);

    let status: 'Disponible' | 'No disponible' | 'Agotado';
    if (stock === 0) {
      status = 'Agotado';
    } else if (rand(1, 10) <= 8) {
      status = 'Disponible';
    } else {
      status = 'No disponible';
    }

    const product = new ProductModel({
      name,
      description: `Descripción del producto ${name}`,
      price,
      stock,
      status,
      imageUrl: null,
      categories: assignedCats,
      promotion: null,
    });
    await product.save();
    createdProducts.push(product);
  }


  const availableProducts = createdProducts.filter(p => p.stock > 0);

  for (let i = 0; i < 20; i++) {
    const buyerIdx = rand(0, NOMBRES.length - 1);
    const provIdx = rand(0, PROVINCIAS.length - 1);

    const numProducts = rand(1, 4);
    const selectedProducts = pickN(availableProducts, Math.min(numProducts, availableProducts.length));

    const orderProducts = selectedProducts.map(p => ({
      productId: p._id as Types.ObjectId,
      name: p.name,
      price: p.price,
      quantity: rand(1, 3),
      description: p.description,
    }));

    const subtotal = orderProducts.reduce((sum, op) => sum + op.price * op.quantity, 0);
    const shippingCost = rand(800, 3000);
    const total = subtotal + shippingCost;

    const statuses: Array<'Pendiente' | 'Confirmado' | 'Enviado' | 'Cancelado'> = ['Pendiente', 'Confirmado', 'Enviado', 'Cancelado'];
    const status = pick(statuses);

    const order = new OrderModel({
      buyer: {
        name: NOMBRES[buyerIdx],
        email: EMAILS_BUYERS[buyerIdx],
        phone: `+54 9 11 ${rand(1000, 9999)}-${rand(1000, 9999)}`,
        address: `Calle ${rand(100, 9999)}`,
        streetNumber: `${rand(1, 5000)}`,
        city: CIUDADES[provIdx],
        province: PROVINCIAS[provIdx],
        postalCode: `${rand(1000, 9999)}`,
        notes: rand(1, 3) === 1 ? 'Dejar en portería' : undefined,
      },
      products: orderProducts,
      shipping: {
        cost: shippingCost,
        estimatedDays: rand(2, 8),
        method: 'Envío Estándar',
      },
      payment: {
        method: 'Tarjeta',
        cardLastFour: `${rand(1000, 9999)}`,
        cardHolder: NOMBRES[buyerIdx],
        status: 'Aprobado' as const,
      },
      total,
      status,
    });
    await order.save();
  }

}
