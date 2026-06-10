export class UserModel {
  constructor() {
    this.id = null;
    this.createdAt = null; // Convertido para camelCase (padrão JS)
    this.username = null;
    this.password = null;
    this.active = null;
    this.document = null;
    this.documentType = null; // Convertido para camelCase
    this.role = null;
  }
}
