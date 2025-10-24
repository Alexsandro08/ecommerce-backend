import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ClientController } from './controllers/clientController.js';
import { ProductController } from './controllers/productController.js';
import { OrderController } from './controllers/orderController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== ROTAS OTIMIZADAS ====================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    project: 'Ecommerce API - Escribo'
  });
});

// CLIENTES
app.get('/clients', ClientController.getClient);    
app.post('/clients', ClientController.createClient);
app.put('/clients/:id', ClientController.updateClient);

// PRODUTOS
app.get('/products', ProductController.getAllProducts);
app.get('/products/:id', ProductController.getProduct);

// Página inicial 
app.get('/', (req, res) => {
  res.json({ 
    message: '🏪 Ecommerce API - Escribo',
    version: '1.0.0',
    documentation: {
      health: '/health',
      clients: {
        get: 'GET /clients?username=username',
        create: 'POST /clients',
        update: 'PUT /clients/:id'
      },
      products: {
        list: 'GET /products',
        get: 'GET /products/:id'
      }
    }
  });
});

// ORDERS
app.post('/orders', OrderController.createOrder);
app.get('/orders/:id', OrderController.getOrder);
app.get('/orders', OrderController.getClientOrders); // ?client_id=UUID
app.put('/orders/:id/status', OrderController.updateOrderStatus);
app.get('/admin/orders', OrderController.getAllOrders); // Todos pedidos (admin)

// Atualizar documentação
app.get('/', (req, res) => {
  res.json({ 
    message: '🏪 Ecommerce API - Escribo',
    version: '1.0.0',
    documentation: {
      health: '/health',
      clients: {
        get: 'GET /clients?username=username',
        create: 'POST /clients',
        update: 'PUT /clients/:id'
      },
      products: {
        list: 'GET /products',
        get: 'GET /products/:id'
      },
      orders: {
        create: 'POST /orders',
        get: 'GET /orders/:id',
        list_client: 'GET /orders?client_id=UUID',
        update_status: 'PUT /orders/:id/status',
        list_all: 'GET /admin/orders'
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta 🚀 ${PORT}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL}`);
});