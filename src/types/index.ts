export type UserRole = 'admin' | 'cajero';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  businessName: string;
  ownerId: string;
}

export interface Product {
  id: string;
  ownerId: string;
  nombre: string;
  codigo: string;
  categoriaId: string;
  marca: string;
  descripcion?: string;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  unidad: string; // pza, caja, kg, m, etc.
  activo: boolean;
  createdAt: any;
}

export interface Category {
  id: string;
  ownerId: string;
  name: string;
  active: boolean;
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  discount: number;
}

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'credito';
export type SaleStatus = 'completada' | 'cancelada';

export interface Sale {
  id: string;
  ownerId: string;
  folio: string;
  date: any;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  userId: string;
  userEmail: string;
  status: SaleStatus;
  cancelledAt?: any;
  cancelledByUserId?: string;
  cancelledByUserEmail?: string;
  cancelReason?: string;
  createdAt: any;
}

export type InventoryMovementType = 'entrada' | 'salida' | 'ajuste' | 'venta' | 'cancelacion';

export interface InventoryMovement {
  id: string;
  ownerId: string;
  productId: string;
  productName: string;
  type: InventoryMovementType;
  quantity: number;
  reason: string;
  date: any;
  userId: string;
}

export interface CashRegisterSession {
  id: string;
  ownerId: string;
  openDate: any;
  closeDate?: any;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  salesByMethod: Record<PaymentMethod, number>;
  status: 'open' | 'closed';
  userId: string;
  observations?: string;
}

export interface BusinessSettings {
  ownerId: string;
  businessName: string;
  phone: string;
  address: string;
  logoUrl?: string;
  ticketMessage: string;
  nextFolio: number;
  taxRate: number;
  currency: string;
}
