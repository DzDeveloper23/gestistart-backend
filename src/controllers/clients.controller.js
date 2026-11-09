const ClientService = require('../services/client.service');
const NotificationService = require('../services/notification.service');

class ClientsController {
  // POST /api/clients - Créer un client
  static async createClient(req, res) {
    try {
      const {
        nomContact,
        nomEntreprise,
        email,
        telephone,
        adresse,
        notes,
        status
      } = req.body;

      // ===== VALIDATIONS =====
      if (!nomContact || !nomEntreprise || !email) {
        return res.status(400).json({
          success: false,
          message: 'Nom contact, entreprise et email sont obligatoires'
        });
      }

      // Vérifier le format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email invalide'
        });
      }

      // ===== CRÉER LE CLIENT =====
      const client = await ClientService.createClient({
        nomContact,
        nomEntreprise,
        email,
        telephone,
        adresse,
        notes,
        status: status || 'Prospect'
      });

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Nouveau client créé',
        `Le client ${nomEntreprise} a été créé avec succès`,
        'success',
        client._id,
        'client'
      );

      return res.status(201).json({
        success: true,
        message: 'Client créé avec succès',
        client
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/clients - Récupérer tous les clients
  static async getAllClients(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      if (req.query.status) filters.status = req.query.status;
      if (req.query.search) filters.search = req.query.search;

      const data = await ClientService.getAllClients(filters, page, limit);

      console.log('📊 Data retournée par le service:', data);

      return res.status(200).json({
        success: true,
        ...data
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/clients/:id - Récupérer un client
  static async getClientById(req, res) {
    try {
      const { id } = req.params;

      const data = await ClientService.getClientById(id);

      return res.status(200).json({
        success: true,
        ...data
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/clients/:id - Mettre à jour un client
  static async updateClient(req, res) {
    try {
      const { id } = req.params;

      const client = await ClientService.updateClient(id, req.body);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Client mis à jour',
        `Le client ${client.nomEntreprise} a été modifié`,
        'info',
        client._id,
        'client'
      );

      return res.status(200).json({
        success: true,
        message: 'Client mis à jour avec succès',
        client
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/clients/:id - Supprimer un client
  static async deleteClient(req, res) {
    try {
      const { id } = req.params;

      // Récupérer le client avant suppression pour la notification
      const Client = require('../models/Client');
      const client = await Client.findById(id);
      const clientName = client?.nomEntreprise || 'Client inconnu';

      const result = await ClientService.deleteClient(id);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Client supprimé',
        `Le client ${clientName} a été supprimé`,
        'warning',
        null,
        'client'
      );

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/clients/:id/projects - Projets du client
  static async getClientProjects(req, res) {
    try {
      const { id } = req.params;

      const projects = await ClientService.getClientProjects(id);

      return res.status(200).json({
        success: true,
        projects
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/clients/:id/stats - Stats du client
  static async getClientStats(req, res) {
    try {
      const { id } = req.params;

      const stats = await ClientService.getClientStats(id);

      return res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // PATCH /api/clients/:id/status - Changer le statut
  static async updateClientStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Statut obligatoire'
        });
      }

      const client = await ClientService.updateClientStatus(id, status);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Statut du client changé',
        `Le statut de ${client.nomEntreprise} est maintenant ${status}`,
        'info',
        client._id,
        'client'
      );

      return res.status(200).json({
        success: true,
        message: 'Statut du client mis à jour',
        client
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = ClientsController;