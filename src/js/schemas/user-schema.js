export class UserSchema {
    constructor(){
        this.id = {
            display: false,
            type: 'text',
            default: null,
            editable: false
        };
      
        this.createdAt = {
            display: false,
            type: 'datetime-local',
            default: null,
            editable: false
        };
      
        this.username = {
            display: true,
            type: 'text',
            default: null,
            editable: true
        };
      
        this.password = {
            display: true,
            type: 'password',
            default: null,
            editable: true
        };
      
        this.active = {
            display: true,
            type: 'checkbox',
            default: true,
            editable: false
        };
      
        this.document = {
            display: true,
            type: 'text',
            default: null,
            editable: true
        };
      
        this.documentType = {
            display: true,
            type: 'select',
            default: null,
            options: [
                {
                  text:'CPF',
                  value:'CPF'
                },
                {
                  text:'CNPJ',
                  value:'CNPJ'
                }
            ],
            editable: true
        };
      
        this.role = {
            display: true,
            type: 'select',
            default: null,
            options: [
                {
                    text: 'DEFAULT',
                    value: 'DEFAULT'
                },
                {
                    text: 'ADMIN',
                    value: 'ADMIN'
                }
            ],
            editable: true
        };
    }
}
