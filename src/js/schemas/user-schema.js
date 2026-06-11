import {UserModel} from '../models/user-model.js';

export class UserSchema {
    constructor(){
        this.id = {
            display: false,
            type: 'text',
            editable: false
        };
      
        this.createdAt = {
            display: false,
            type: 'datetime-local',
            editable: false
        };
      
        this.username = {
            display: true,
            type: 'text',
            editable: true
        };
      
        this.password = {
            display: true,
            type: 'password',
            editable: true
        };
      
        this.active = {
            display: true,
            type: 'checkbox',
            editable: false
        };
      
        this.document = {
            display: true,
            type: 'text',
            editable: true
        };
      
        this.documentType = {
            display: true,
            type: 'select',
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
