// Utilitário para upload e gerenciamento de imagens com ImageKit
const ImageKit = require('imagekit');
const crypto = require('crypto');
const path = require('path');

// Configurar ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

/**
 * Gera um nome único para o arquivo baseado em timestamp e hash
 * @param {string} originalName - Nome original do arquivo
 * @returns {string} Nome único do arquivo
 */
function generateUniqueFilename(originalName = 'image.jpg') {
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(4).toString('hex');
  const extension = path.extname(originalName) || '.jpg';
  return `produto-${timestamp}-${randomHash}${extension}`;
}

/**
 * Converte base64 para buffer
 * @param {string} base64Data - Dados da imagem em base64
 * @returns {Buffer} Buffer da imagem
 */
function base64ToBuffer(base64Data) {
  // Remove o prefixo data:image/...;base64, se presente
  const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  return Buffer.from(base64String, 'base64');
}

/**
 * Salva imagem no ImageKit
 * @param {string} base64Data - Dados da imagem em base64
 * @param {string} filename - Nome do arquivo (opcional)
 * @returns {Promise<Object>} Resultado do upload
 */
async function saveImageToImageKit(base64Data, filename = null) {
  try {
    // Gerar nome único se não fornecido
    const finalFilename = filename || generateUniqueFilename();
    
    // Converter base64 para buffer
    const imageBuffer = base64ToBuffer(base64Data);
    
    // Upload para ImageKit
    const uploadResponse = await imagekit.upload({
      file: imageBuffer,
      fileName: finalFilename,
      folder: '/produtos'
    });
    
    // Retornar informações do arquivo
    return {
      success: true,
      filename: uploadResponse.name,
      path: `/img/${uploadResponse.name}`, // Caminho relativo para compatibilidade
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      size: uploadResponse.size
    };
  } catch (error) {
    console.error('Erro ao salvar imagem no ImageKit:', error);
    throw new Error(`Falha ao salvar imagem: ${error.message}`);
  }
}

/**
 * Deleta imagem do ImageKit
 * @param {string} fileId - ID do arquivo no ImageKit
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function deleteImageFromImageKit(fileId) {
  try {
    await imagekit.deleteFile(fileId);
    return true;
  } catch (error) {
    console.error('Erro ao deletar imagem do ImageKit:', error);
    return false;
  }
}

/**
 * Lista todas as imagens no ImageKit
 * @returns {Promise<Array>} Lista de arquivos de imagem
 */
async function listImageKitImages() {
  try {
    const response = await imagekit.listFiles({
      path: '/produtos'
    });
    
    return response.map(file => ({
      filename: file.name,
      url: file.url,
      fileId: file.fileId,
      size: file.size
    }));
  } catch (error) {
    console.error('Erro ao listar imagens do ImageKit:', error);
    return [];
  }
}


/**
 * Valida se os dados base64 representam uma imagem válida
 * @param {string} base64Data - Dados em base64
 * @returns {boolean} Se é uma imagem válida
 */
function validateImageData(base64Data) {
  if (!base64Data || typeof base64Data !== 'string') {
    return false;
  }
  
  // Verificar se tem o prefixo correto ou é base64 puro
  const isValidBase64 = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(base64Data) ||
                       /^[A-Za-z0-9+\/]+=*$/.test(base64Data.replace(/^data:image\/[a-z]+;base64,/, ''));
  
  return isValidBase64;
}

/**
 * Otimiza o tamanho da imagem (simulação - em produção usar sharp ou similar)
 * @param {Buffer} imageBuffer - Buffer da imagem
 * @returns {Buffer} Buffer otimizado
 */
function optimizeImage(imageBuffer) {
  // Por enquanto, retorna o buffer original
  // Em produção, implementar com sharp ou canvas para redimensionar
  return imageBuffer;
}

module.exports = {
  generateUniqueFilename,
  base64ToBuffer,
  saveImageToImageKit,
  deleteImageFromImageKit,
  listImageKitImages,
  validateImageData,
  optimizeImage
};