import {ServiceSupabase} from './service-supabase.js';

export const ServiceQuery = {
    makeFilter: function (expression) {
        if (!expression) return null;

        // Caso 1: Filtro simples "property_name:value"
        if (!expression.startsWith('{') && !expression.endsWith('}')) {
            const [prop, val] = expression.split(':');
            return {
                type: 'simple',
                property: prop.trim(),
                value: val.trim()
            };
        }

        // Caso 2: Múltiplas propriedades "{pn1:v1[logic_operator]pn2:v2}"
        // Remove as chaves externas
        const innerExpression = expression.slice(1, -1);

        // Identifica o operador lógico. Ex: [AND] ou [OR]
        const operatorMatch = innerExpression.match(/\[(.*?)\]/);

        if (!operatorMatch) {
            // Se não houver operador explícito dentro das chaves, tratamos como um único filtro interno
            const [prop, val] = innerExpression.split(':');
            return {
                type: 'simple',
                property: prop.trim(),
                value: val.trim()
            };
        }

        const operator = operatorMatch[1].toUpperCase(); // 'AND' ou 'OR'
        // Divide as expressões baseando-se no operador, ex: "[AND]" ou "[OR]"
        const rawParts = innerExpression.split(`[${operatorMatch[1]}]`);

        const rules = rawParts.map(part => {
            const [prop, val] = part.split(':');
            return {
                property: prop.trim(),
                value: val.trim()
            };
        });

        return {
            type: 'complex',
            operator: operator, // AND ou OR
            rules: rules
        };
    },
  
    fetch: async function (table, expression) {
        try {
            if(!table || table === null) return null;
            if(!expression || expression === null) return null;
          
            const client = ServiceSupabase.client();
            let query = client.from(table).select();

            // Gera o objeto de filtro a partir da expressão string
            const filter = this.makeFilter(expression);

            if (filter) {
                query = await this.applyFilter(query, filter);
            }

            // Executa a query trazendo a lista de resultados (ou use .maybeSingle() se esperar sempre um)
            const {
                data,
                error
            } = await query;

            if (error) throw error;

            return data; // Retorna um array de resultados que batem com o filtro
        } catch (err) {
            if(err.stack) {
                alert(`${err.stack}: ${err.message}`);
            } else {
                alert('ServiceQuery.fetch: ' + err.message);
            }
          
            console.error('ServiceQuery.fetch: ', err);
          
            return null;
        }
    },
  
    applyFilter: async function(query, filter) {
        let error = null;
        switch(filter.type) {
            case 'simple':
                query = query.eq(filter.property, filter.value);
                break;
            case 'complex':
                query = await this.applyOperator(query, filter);
                break;
            default:
                error = { stack: 'ServiceQuery.applyFilter', message: 'Invalid filter.' };
                break;
        }

        return { data: query, error: error};
    },
  
    applyOperator: async function(query, filter) {
       const data = query;
        switch(filter) {
            case 'AND':
                // No Supabase, encadear .eq() funciona como AND
                filter.rules.forEach(rule => {
                    data = data.eq(rule.property, rule.value);
                });
            
                break;
            case 'OR':
                // Formato do Supabase para OR: 'col1.eq.val1,col2.eq.val2'
                const orString = filter.rules.map(
                    rule => `${rule.property}.eq.${rule.value}`
                ).join(',');

                data = data.or(orString);
            
                break;
            default:
               throw { stack: 'ServiceQuery.applyOperator', message: 'Invalid operator.' };
        }

        return data;
    },
}
