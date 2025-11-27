// ============================================
// DATABASE MANAGEMENT SYSTEM
// ============================================

class Database {
  constructor() {
    this.storageKey = 'dentalClinicDB';
    this.init();
  }

  // Initialize database with default data if not exists
  init() {
    if (!localStorage.getItem(this.storageKey)) {
      this.loadDefaultData();
    }
  }

  // Load default data from schema.json
  async loadDefaultData() {
    try {
      const response = await fetch('./database/schema.json');
      const data = await response.json();
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log('Database initialized with default data');
    } catch (error) {
      console.error('Error loading default data:', error);
      // Fallback to empty database
      const emptyDB = {
        patients: [],
        appointments: [],
        inventory: [],
        inventoryMovements: [],
        settings: {
          clinicName: 'Clínica Dental',
          workingHours: { start: '09:00', end: '18:00' },
          appointmentDuration: 30,
          currency: 'MXN'
        }
      };
      localStorage.setItem(this.storageKey, JSON.stringify(emptyDB));
    }
  }

  // Get all data
  getData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  // Save all data
  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // ========== PATIENTS ==========

  getPatients() {
    const data = this.getData();
    return data.patients || [];
  }

  getPatientById(id) {
    const patients = this.getPatients();
    return patients.find(p => p.id === id);
  }

  addPatient(patient) {
    const data = this.getData();
    const newPatient = {
      id: this.generateId('P'),
      ...patient,
      createdAt: new Date().toISOString(),
      lastVisit: null
    };
    data.patients.push(newPatient);
    this.saveData(data);
    return newPatient;
  }

  updatePatient(id, updates) {
    const data = this.getData();
    const index = data.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      data.patients[index] = { ...data.patients[index], ...updates };
      this.saveData(data);
      return data.patients[index];
    }
    return null;
  }

  deletePatient(id) {
    const data = this.getData();
    data.patients = data.patients.filter(p => p.id !== id);
    // Also delete related appointments
    data.appointments = data.appointments.filter(a => a.patientId !== id);
    this.saveData(data);
    return true;
  }

  searchPatients(query) {
    const patients = this.getPatients();
    const lowerQuery = query.toLowerCase();
    return patients.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.email.toLowerCase().includes(lowerQuery) ||
      p.phone.includes(query) ||
      p.id.toLowerCase().includes(lowerQuery) ||
      (p.address && p.address.toLowerCase().includes(lowerQuery)) ||
      (p.bloodType && p.bloodType.toLowerCase().includes(lowerQuery))
    );
  }

  // ========== APPOINTMENTS ==========

  getAppointments() {
    const data = this.getData();
    return data.appointments || [];
  }

  getAppointmentById(id) {
    const appointments = this.getAppointments();
    return appointments.find(a => a.id === id);
  }

  getAppointmentsByDate(date) {
    const appointments = this.getAppointments();
    return appointments.filter(a => a.date === date);
  }

  getAppointmentsByPatient(patientId) {
    const appointments = this.getAppointments();
    return appointments.filter(a => a.patientId === patientId);
  }

  getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointmentsByDate(today);
  }

  addAppointment(appointment) {
    const data = this.getData();
    const newAppointment = {
      id: this.generateId('A'),
      ...appointment,
      status: appointment.status || 'pending',
      createdAt: new Date().toISOString()
    };
    data.appointments.push(newAppointment);

    // Update patient's last visit
    const patientIndex = data.patients.findIndex(p => p.id === appointment.patientId);
    if (patientIndex !== -1) {
      data.patients[patientIndex].lastVisit = new Date().toISOString();
    }

    this.saveData(data);
    return newAppointment;
  }

  updateAppointment(id, updates) {
    const data = this.getData();
    const index = data.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      data.appointments[index] = { ...data.appointments[index], ...updates };
      this.saveData(data);
      return data.appointments[index];
    }
    return null;
  }

  deleteAppointment(id) {
    const data = this.getData();
    data.appointments = data.appointments.filter(a => a.id !== id);
    this.saveData(data);
    return true;
  }

  // Check if time slot is available
  isTimeSlotAvailable(date, time, excludeId = null) {
    const appointments = this.getAppointmentsByDate(date);
    return !appointments.some(a =>
      a.time === time &&
      a.id !== excludeId &&
      a.status !== 'cancelled'
    );
  }

  // ========== INVENTORY ==========

  getInventory() {
    const data = this.getData();
    return data.inventory || [];
  }

  getInventoryById(id) {
    const inventory = this.getInventory();
    return inventory.find(i => i.id === id);
  }

  getLowStockItems() {
    const inventory = this.getInventory();
    return inventory.filter(item => item.quantity <= item.minStock);
  }

  addInventoryItem(item) {
    const data = this.getData();
    const newItem = {
      id: this.generateId('I'),
      ...item,
      lastUpdated: new Date().toISOString()
    };
    data.inventory.push(newItem);
    this.saveData(data);
    return newItem;
  }

  updateInventoryItem(id, updates) {
    const data = this.getData();
    const index = data.inventory.findIndex(i => i.id === id);
    if (index !== -1) {
      data.inventory[index] = {
        ...data.inventory[index],
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      this.saveData(data);
      return data.inventory[index];
    }
    return null;
  }

  deleteInventoryItem(id) {
    const data = this.getData();
    data.inventory = data.inventory.filter(i => i.id !== id);
    this.saveData(data);
    return true;
  }

  searchInventory(query) {
    const inventory = this.getInventory();
    const lowerQuery = query.toLowerCase();
    return inventory.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.supplier.toLowerCase().includes(lowerQuery)
    );
  }

  // ========== INVENTORY MOVEMENTS ==========

  getInventoryMovements() {
    const data = this.getData();
    return data.inventoryMovements || [];
  }

  getInventoryMovementsByItem(inventoryId) {
    const movements = this.getInventoryMovements();
    return movements.filter(m => m.inventoryId === inventoryId).sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  getInventoryMovementsByDateRange(startDate, endDate) {
    const movements = this.getInventoryMovements();
    return movements.filter(m => {
      const movementDate = new Date(m.createdAt);
      return movementDate >= new Date(startDate) && movementDate <= new Date(endDate);
    });
  }

  addInventoryMovement(movement) {
    const data = this.getData();
    if (!data.inventoryMovements) {
      data.inventoryMovements = [];
    }

    const newMovement = {
      id: this.generateId('M'),
      ...movement,
      createdAt: new Date().toISOString()
    };

    data.inventoryMovements.push(newMovement);
    this.saveData(data);
    return newMovement;
  }

  adjustInventoryStock(inventoryId, quantity, reason, type = 'adjustment') {
    const data = this.getData();
    const itemIndex = data.inventory.findIndex(i => i.id === inventoryId);

    if (itemIndex === -1) return null;

    const item = data.inventory[itemIndex];
    const previousStock = item.quantity;
    const newStock = previousStock + quantity;

    // Update inventory quantity
    data.inventory[itemIndex].quantity = newStock;
    data.inventory[itemIndex].lastUpdated = new Date().toISOString();

    // Create movement record
    if (!data.inventoryMovements) {
      data.inventoryMovements = [];
    }

    const movement = {
      id: this.generateId('M'),
      inventoryId: inventoryId,
      type: type,
      quantity: quantity,
      previousStock: previousStock,
      newStock: newStock,
      reason: reason,
      cost: quantity > 0 ? quantity * item.price : 0,
      createdAt: new Date().toISOString()
    };

    data.inventoryMovements.push(movement);
    this.saveData(data);

    return {
      item: data.inventory[itemIndex],
      movement: movement
    };
  }

  getMonthlyConsumption(month, year) {
    const movements = this.getInventoryMovements();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const monthlyMovements = movements.filter(m => {
      const movementDate = new Date(m.createdAt);
      return movementDate >= startDate && movementDate <= endDate;
    });

    const consumption = {};
    monthlyMovements.forEach(m => {
      if (!consumption[m.inventoryId]) {
        const item = this.getInventoryById(m.inventoryId);
        consumption[m.inventoryId] = {
          itemName: item ? item.name : 'Desconocido',
          totalUsed: 0,
          totalPurchased: 0,
          totalCost: 0,
          movements: []
        };
      }

      if (m.quantity < 0) {
        consumption[m.inventoryId].totalUsed += Math.abs(m.quantity);
      } else {
        consumption[m.inventoryId].totalPurchased += m.quantity;
        consumption[m.inventoryId].totalCost += m.cost || 0;
      }

      consumption[m.inventoryId].movements.push(m);
    });

    return consumption;
  }

  getInventoryPredictions(inventoryId) {
    const movements = this.getInventoryMovementsByItem(inventoryId);
    const item = this.getInventoryById(inventoryId);

    if (!item || movements.length < 2) {
      return null;
    }

    // Calculate average monthly usage
    const usageMovements = movements.filter(m => m.quantity < 0);
    if (usageMovements.length === 0) {
      return null;
    }

    const totalUsage = usageMovements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const firstDate = new Date(usageMovements[usageMovements.length - 1].createdAt);
    const lastDate = new Date(usageMovements[0].createdAt);
    const monthsDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 30) || 1;

    const avgMonthlyUsage = totalUsage / monthsDiff;
    const daysUntilReorder = (item.quantity - item.minStock) / (avgMonthlyUsage / 30);
    const suggestedReorderQuantity = Math.ceil(avgMonthlyUsage * 1.5); // 1.5 months supply

    return {
      avgMonthlyUsage: Math.round(avgMonthlyUsage),
      daysUntilReorder: Math.round(daysUntilReorder),
      suggestedReorderQuantity: suggestedReorderQuantity,
      currentStock: item.quantity,
      minStock: item.minStock
    };
  }

  // ========== STATISTICS ==========

  getStats() {
    const patients = this.getPatients();
    const appointments = this.getAppointments();
    const inventory = this.getInventory();
    const today = new Date().toISOString().split('T')[0];

    return {
      totalPatients: patients.length,
      todayAppointments: appointments.filter(a => a.date === today).length,
      pendingAppointments: appointments.filter(a => a.status === 'pending').length,
      lowStockItems: inventory.filter(i => i.quantity <= i.minStock).length,
      totalInventoryValue: inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    };
  }

  // ========== UTILITIES ==========

  generateId(prefix) {
    const data = this.getData();
    let maxNum = 0;

    const collections = {
      'P': data.patients,
      'A': data.appointments,
      'I': data.inventory,
      'M': data.inventoryMovements || []
    };

    const collection = collections[prefix] || [];
    collection.forEach(item => {
      const num = parseInt(item.id.replace(prefix, ''));
      if (num > maxNum) maxNum = num;
    });

    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
  }

  // Export data as JSON
  exportData() {
    const data = this.getData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dental-clinic-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Import data from JSON
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      this.saveData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  clearData() {
    localStorage.removeItem(this.storageKey);
    this.loadDefaultData();
  }
}

// Export database instance
const db = new Database();
export default db;
