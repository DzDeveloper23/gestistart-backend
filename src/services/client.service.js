const Client = require('../models/Client');
const Project = require('../models/Project');

class ClientService {
  // Créer un nouveau client
  static async createClient(clientData) {
    try {
      // Vérifier que l'email n'existe pas
      const clientExiste = await Client.findOne({ email: clientData.email });
      if (clientExiste) {
        throw new Error('Cet email client existe déjà');
      }

      // Créer le client
      const newClient = new Client(clientData);
      await newClient.save();

      return newClient;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer tous les clients
  static async getAllClients(filters = {}, page = 1, limit = 10) {
    try {
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.search) {
        query.$or = [
          { nomEntreprise: { $regex: filters.search, $options: 'i' } },
          { nomContact: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const clients = await Client.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Client.countDocuments(query);

      return {
        data: clients,  // ✅ Changé de "clients" à "data"
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Récupérer un client par ID
  static async getClientById(clientId) {
    try {
      const client = await Client.findById(clientId);

      if (!client) {
        throw new Error('Client non trouvé');
      }

      // Récupérer aussi les projets du client
      const projects = await Project.find({ clientId })
        .select('titre status budget dateDebut dateFin');

      return {
        client,
        projects
      };
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un client
  static async updateClient(clientId, updateData) {
    try {
      const client = await Client.findById(clientId);

      if (!client) {
        throw new Error('Client non trouvé');
      }

      // Si email change, vérifier qu'il n'existe pas
      if (updateData.email && updateData.email !== client.email) {
        const clientExiste = await Client.findOne({ email: updateData.email });
        if (clientExiste) {
          throw new Error('Cet email est déjà utilisé');
        }
      }

      Object.assign(client, updateData);
      await client.save();

      return client;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer un client
  static async deleteClient(clientId) {
    try {
      // Vérifier que le client n'a pas de projets actifs
      const projectsActifs = await Project.countDocuments({
        clientId,
        status: { $ne: 'Terminé' }
      });

      if (projectsActifs > 0) {
        throw new Error(
          'Impossible de supprimer : client a des projets actifs'
        );
      }

      const client = await Client.findByIdAndDelete(clientId);

      if (!client) {
        throw new Error('Client non trouvé');
      }

      return { message: 'Client supprimé avec succès' };
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les projets d'un client
  static async getClientProjects(clientId) {
    try {
      const client = await Client.findById(clientId);

      if (!client) {
        throw new Error('Client non trouvé');
      }

      const projects = await Project.find({ clientId })
        .select('titre status budget montantUtilise dateDebut dateFin priorite');

      return projects;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les statistiques d'un client
  static async getClientStats(clientId) {
    try {
      const client = await Client.findById(clientId);

      if (!client) {
        throw new Error('Client non trouvé');
      }

      const projects = await Project.find({ clientId });

      const totalProjects = projects.length;
      const projectsTermines = projects.filter(
        p => p.status === 'Terminé'
      ).length;
      const projectsEnCours = projects.filter(
        p => p.status === 'En cours'
      ).length;

      const budgetTotal = projects.reduce((sum, p) => sum + p.budget, 0);
      const budgetUtilise = projects.reduce(
        (sum, p) => sum + p.montantUtilise,
        0
      );

      return {
        nomClient: client.nomEntreprise,
        totalProjects,
        projectsTermines,
        projectsEnCours,
        budgetTotal,
        budgetUtilise,
        budgetRestant: budgetTotal - budgetUtilise,
        budgetPercent: budgetTotal > 0 ? 
          ((budgetUtilise / budgetTotal) * 100).toFixed(2) : 0,
        statusClient: client.status
      };
    } catch (error) {
      throw error;
    }
  }

  // Changer le statut d'un client
  static async updateClientStatus(clientId, status) {
    try {
      const validStatus = ['Actif', 'Inactif', 'Prospect'];

      if (!validStatus.includes(status)) {
        throw new Error('Statut invalide');
      }

      const client = await Client.findByIdAndUpdate(
        clientId,
        { status, updatedAt: Date.now() },
        { new: true }
      );

      return client;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ClientService;