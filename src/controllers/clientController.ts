import { Request, Response } from 'express';
import { ClientService } from '../services/clientService.js';

export class ClientController {
  static async getClient(req: Request, res: Response) {
    try {
      const { username } = req.query;
      
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username parameter is required' });
      }

      const client = await ClientService.getClientByUsername(username);
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      res.json(client);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
}

static async getClientByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;
      
      const client = await ClientService.getClientByUsername(username);
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      res.json(client);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createClient(req: Request, res: Response) {
    try {
      const clientData = req.body;
      const newClient = await ClientService.createClient(clientData);
      res.status(201).json(newClient);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedClient = await ClientService.updateClient(id, updates);
      res.json(updatedClient);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}