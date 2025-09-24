const fs = require('fs');
const path = require('path');

// Caminho para o arquivo de dados
const DATA_FILE = path.join(process.cwd(), 'data', 'cardapio.json');

// Dados de fallback caso o arquivo não exista
const FALLBACK_DATA = [
  {
    id: 1,
    nome: "X BACON DE GOLIATH",
    descricao: "Burger de 90g, com American Cheese, 2 fatias de bacon, molho especial de Golliath no pão brioche tostado na manteiga.",
    preco: 24.90,
    categoria: "hamburguers",
    imagem: "https://ik.imagekit.io/golliathburgers/produtos/x-bacon-goliath.jpg",
    disponivel: true,
    destaque: true,
    ordem: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    nome: "GOLLIATH TRIPLO P.C.Q",
    descricao: "3x mais carne, 3x mais queijo. Com 3 Burguers de 90g totalizando 270g de carne, e com fatias de American Cheese, no pão brioche tostado na manteiga.",
    preco: 32.90,
    categoria: "hamburguers",
    imagem: "https://ik.imagekit.io/golliathburgers/produtos/triplo-pcq.jpg",
    disponivel: true,
    destaque: true,
    ordem: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    nome: "GOLLIATH TRIPLO BACON",
    descricao: "3x mais carne, 3x mais queijo e 3x mais bacon. Com 3 Burguers de 90g totalizando 270g de carne, com fatias de American Cheese, 2 fatias de bacon por andar, e molho especial de Golliath no pão brioche tostado na manteiga.",
    preco: 39.90,
    categoria: "hamburguers",
    imagem: "https://ik.imagekit.io/golliathburgers/produtos/triplo-bacon.jpg",
    disponivel: true,
    destaque: true,
    ordem: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    nome: "GOLLIATH OKLAHOMA",
    descricao: "4 burguers de 90g ao estilo Oklahoma, totalizando 360g de blend, com 4 fatias de queijo cheddar, no pão brioche selado na manteiga.",
    preco: 49.90,
    categoria: "hamburguers",
    imagem: "https://ik.imagekit.io/golliathburgers/produtos/oklahoma.jpg",
    disponivel: true,
    destaque: true,
    ordem: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Função para ler dados do arquivo
function readCardapioData() {
  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(DATA_FILE)) {
      console.log('Arquivo de dados não encontrado, criando com dados padrão...');
      writeCardapioData(FALLBACK_DATA);
      return FALLBACK_DATA;
    }

    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler arquivo de dados:', error);
    return FALLBACK_DATA;
  }
}

// Função para escrever dados no arquivo
function writeCardapioData(data) {
  try {
    // Garantir que o diretório existe
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('Dados salvos com sucesso em:', DATA_FILE);
    return true;
  } catch (error) {
    console.error('Erro ao salvar arquivo de dados:', error);
    return false;
  }
}

// Função para atualizar um item específico
function updateCardapioItem(id, updates) {
  try {
    const data = readCardapioData();
    const itemIndex = data.findIndex(item => item.id == id);
    
    if (itemIndex === -1) {
      return { success: false, message: 'Item não encontrado' };
    }

    // Atualizar o item
    data[itemIndex] = {
      ...data[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Salvar os dados
    const saved = writeCardapioData(data);
    
    if (saved) {
      return { success: true, item: data[itemIndex] };
    } else {
      return { success: false, message: 'Erro ao salvar dados' };
    }
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return { success: false, message: 'Erro interno' };
  }
}

// Função para adicionar um novo item
function addCardapioItem(itemData) {
  try {
    const data = readCardapioData();
    
    // Gerar novo ID
    const maxId = Math.max(...data.map(item => item.id), 0);
    const newItem = {
      ...itemData,
      id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.push(newItem);
    
    const saved = writeCardapioData(data);
    
    if (saved) {
      return { success: true, item: newItem };
    } else {
      return { success: false, message: 'Erro ao salvar dados' };
    }
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    return { success: false, message: 'Erro interno' };
  }
}

// Função para remover um item
function removeCardapioItem(id, permanent = false) {
  try {
    const data = readCardapioData();
    const itemIndex = data.findIndex(item => item.id == id);
    
    if (itemIndex === -1) {
      return { success: false, message: 'Item não encontrado' };
    }

    if (permanent) {
      // Remover permanentemente
      data.splice(itemIndex, 1);
    } else {
      // Apenas desativar
      data[itemIndex] = {
        ...data[itemIndex],
        isActive: false,
        disponivel: false,
        updatedAt: new Date().toISOString()
      };
    }

    const saved = writeCardapioData(data);
    
    if (saved) {
      return { success: true, message: permanent ? 'Item removido permanentemente' : 'Item desativado' };
    } else {
      return { success: false, message: 'Erro ao salvar dados' };
    }
  } catch (error) {
    console.error('Erro ao remover item:', error);
    return { success: false, message: 'Erro interno' };
  }
}

module.exports = {
  readCardapioData,
  writeCardapioData,
  updateCardapioItem,
  addCardapioItem,
  removeCardapioItem
};