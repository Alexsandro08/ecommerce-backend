import { supabase } from '../utils/supabaseClient.js';
import { Order, CreateOrderRequest } from '../types/ecommerce.js';

export class OrderService {
  static async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      // Primeiro validar todos os produtos e estoque
      for (const item of orderData.items) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('price, stock_quantity, name')
          .eq('id', item.product_id)
          .single();

        if (productError || !product) {
          throw new Error(`Product ${item.product_id} not found: ${productError?.message}`);
        }

        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`);
        }
      }

      // Criar o pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          client_id: orderData.client_id,
          shipping_address: orderData.shipping_address,
          payment_method: orderData.payment_method,
          status: 'pending',
          payment_status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar itens do pedido e atualizar estoque
      for (const item of orderData.items) {
        // Buscar preço atual do produto
        const { data: product } = await supabase
          .from('products')
          .select('price, stock_quantity')
          .eq('id', item.product_id)
          .single();

        if (!product) {
          throw new Error(`Product ${item.product_id} not found during order creation`);
        }

        // Criar item do pedido
        const { error: itemError } = await supabase
          .from('order_items')
          .insert([{
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: product.price
          }]);

        if (itemError) throw itemError;

        // Atualizar estoque
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            stock_quantity: product.stock_quantity - item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.product_id);

        if (stockError) throw stockError;
      }

      // Retornar pedido completo
      const finalOrder = await this.getOrderById(order.id);
      if (!finalOrder) throw new Error('Failed to retrieve created order');
      
      return finalOrder;

    } catch (error: any) {
      throw new Error(`Order creation failed: ${error.message}`);
    }
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*,
          products (*)
        ),
        clients (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getClientOrders(clientId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*,
          products (*)
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateOrderStatus(id: string, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .rpc('update_order_status', {
        p_order_id: id,
        p_status: status
      });

    if (error) throw error;
  }

  static async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*,
          products (*)
        ),
        clients (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}