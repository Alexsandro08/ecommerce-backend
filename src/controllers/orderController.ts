import { Request, Response } from 'express';
import { OrderService } from '../services/orderService.js';

export class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const orderData = req.body;
      
      // VALIDAÇÕES COMPLETAS DO BODY
      if (!orderData) {
        return res.status(400).json({ error: 'Request body is required' });
      }

      if (!orderData.client_id) {
        return res.status(400).json({ error: 'client_id is required' });
      }

      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(400).json({ error: 'items array with at least one item is required' });
      }

      // Validar cada item do array
      for (const item of orderData.items) {
        if (!item.product_id || !item.quantity) {
          return res.status(400).json({ 
            error: 'Each item must have product_id and quantity' 
          });
        }
        if (item.quantity <= 0) {
          return res.status(400).json({ 
            error: 'Quantity must be greater than 0' 
          });
        }
      }

      if (!orderData.shipping_address) {
        return res.status(400).json({ error: 'shipping_address is required' });
      }

      const newOrder = await OrderService.createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getClientOrders(req: Request, res: Response) {
    try {
      const { client_id } = req.query;
      
      if (!client_id || typeof client_id !== 'string') {
        return res.status(400).json({ error: 'client_id parameter is required' });
      }

      const orders = await OrderService.getClientOrders(client_id);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }

      await OrderService.updateOrderStatus(id, status);
      res.json({ message: 'Order status updated successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await OrderService.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}