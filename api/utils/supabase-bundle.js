// Bundle simplificado do Supabase para resolver problemas de dependência no Vercel

// Função para fazer requisições HTTP
function makeRequest(url, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
    };

    return fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });
}

// Cliente Supabase simplificado
class SimpleSupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
    }

    from(table) {
        return new SupabaseTable(this.url, this.key, table);
    }
}

// Classe para operações de tabela
class SupabaseTable {
    constructor(url, key, table) {
        this.url = url;
        this.key = key;
        this.table = table;
        this.baseUrl = `${url}/rest/v1/${table}`;
        this.queryParams = [];
    }

    select(columns = '*') {
        this.selectColumns = columns;
        return this;
    }

    eq(column, value) {
        this.queryParams.push(`${column}=eq.${encodeURIComponent(value)}`);
        return this;
    }

    order(column, options = {}) {
        const direction = options.ascending === false ? 'desc' : 'asc';
        this.queryParams.push(`order=${column}.${direction}`);
        return this;
    }

    limit(count) {
        this.queryParams.push(`limit=${count}`);
        return this;
    }

    // Método then para fazer a classe funcionar como uma Promise
    then(onFulfilled, onRejected) {
        return this.execute().then(onFulfilled, onRejected);
    }

    catch(onRejected) {
        return this.execute().catch(onRejected);
    }

    async execute() {
        // Se é uma operação de insert, usar executeInsert
        if (this.isInsert) {
            return this.executeInsert();
        }
        
        // Se é uma operação de update, usar executeUpdate
        if (this.isUpdate) {
            return this.executeUpdate();
        }
        
        try {
            let url = this.baseUrl;
            if (this.selectColumns) {
                url += `?select=${this.selectColumns}`;
            }
            if (this.queryParams.length > 0) {
                const separator = this.selectColumns ? '&' : '?';
                url += separator + this.queryParams.join('&');
            }
            
            const response = await makeRequest(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    insert(data) {
        this.insertData = data;
        this.isInsert = true;
        return this;
    }

    async executeInsert() {
        try {
            let url = this.baseUrl;
            if (this.selectColumns) {
                url += `?select=${this.selectColumns}`;
            }
            
            const response = await makeRequest(url, {
                method: 'POST',
                body: JSON.stringify(this.insertData),
                headers: {
                    'Prefer': 'return=representation'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return { data: result, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    update(data) {
        this.updateData = data;
        this.isUpdate = true;
        return this;
    }

    async executeUpdate() {
        try {
            let url = this.baseUrl;
            if (this.queryParams.length > 0) {
                url += '?' + this.queryParams.join('&');
            }
            
            const headers = {
                'Prefer': 'return=representation'
            };
            if (this.selectColumns) {
                headers['Prefer'] += `,select=${this.selectColumns}`;
            }
            
            const response = await makeRequest(url, {
                method: 'PATCH',
                body: JSON.stringify(this.updateData),
                headers
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return { data: result, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }

    async delete() {
        try {
            let url = this.baseUrl;
            if (this.queryParams.length > 0) {
                url += '?' + this.queryParams.join('&');
            }
            
            const response = await makeRequest(url, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return { error: null };
        } catch (error) {
            return { error };
        }
    }
}

// Função para criar cliente
function createClient(url, key) {
    return new SimpleSupabaseClient(url, key);
}

module.exports = { createClient };