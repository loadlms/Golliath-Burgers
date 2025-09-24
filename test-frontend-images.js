const puppeteer = require('puppeteer');
const fs = require('fs');

async function testFrontendImages() {
    let browser;
    try {
        console.log('🚀 Iniciando teste de imagens no frontend...');
        
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        
        // Interceptar requests de imagens para verificar se estão sendo carregadas
        const imageRequests = [];
        const failedImages = [];
        
        page.on('response', response => {
            const url = response.url();
            if (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg')) {
                imageRequests.push({
                    url: url,
                    status: response.status(),
                    success: response.ok()
                });
                
                if (!response.ok()) {
                    failedImages.push({
                        url: url,
                        status: response.status()
                    });
                }
            }
        });
        
        console.log('📱 Navegando para o site...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
        
        // Aguardar o cardápio carregar
        console.log('⏳ Aguardando cardápio carregar...');
        await page.waitForSelector('.menu-grid', { timeout: 10000 });
        
        // Aguardar um pouco mais para garantir que as imagens sejam carregadas
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar se há itens no cardápio
        const menuItems = await page.$$('.menu-item');
        console.log(`📋 Encontrados ${menuItems.length} itens no cardápio`);
        
        // Verificar cada imagem
        for (let i = 0; i < menuItems.length; i++) {
            const item = menuItems[i];
            
            // Obter informações do item
            const itemName = await item.$eval('h3', el => el.textContent);
            const imgElement = await item.$('img');
            
            if (imgElement) {
                const imgSrc = await imgElement.evaluate(img => img.src);
                const imgNaturalWidth = await imgElement.evaluate(img => img.naturalWidth);
                const imgNaturalHeight = await imgElement.evaluate(img => img.naturalHeight);
                const imgComplete = await imgElement.evaluate(img => img.complete);
                
                console.log(`\n--- Item ${i + 1}: ${itemName} ---`);
                console.log(`Src: ${imgSrc}`);
                console.log(`Dimensões naturais: ${imgNaturalWidth}x${imgNaturalHeight}`);
                console.log(`Carregada: ${imgComplete}`);
                console.log(`Válida: ${imgNaturalWidth > 0 && imgNaturalHeight > 0}`);
                
                if (imgNaturalWidth === 0 || imgNaturalHeight === 0) {
                    console.log('❌ Imagem não carregou corretamente!');
                }
            } else {
                console.log(`\n--- Item ${i + 1}: ${itemName} ---`);
                console.log('❌ Elemento de imagem não encontrado!');
            }
        }
        
        console.log('\n📊 Resumo das requisições de imagens:');
        console.log(`Total de requisições: ${imageRequests.length}`);
        console.log(`Sucessos: ${imageRequests.filter(r => r.success).length}`);
        console.log(`Falhas: ${failedImages.length}`);
        
        if (failedImages.length > 0) {
            console.log('\n❌ Imagens que falharam:');
            failedImages.forEach(img => {
                console.log(`- ${img.url} (Status: ${img.status})`);
            });
        }
        
        // Fazer screenshot da seção do cardápio
        const menuSection = await page.$('#menu');
        if (menuSection) {
            await menuSection.screenshot({ path: 'cardapio-screenshot.png' });
            console.log('\n📸 Screenshot salvo como cardapio-screenshot.png');
        }
        
        console.log('\n✅ Teste concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Verificar se o servidor está rodando
const http = require('http');
const checkServer = () => {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000', (res) => {
            resolve(true);
        });
        req.on('error', (err) => {
            reject(err);
        });
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
};

checkServer()
    .then(() => {
        console.log('✅ Servidor está rodando');
        testFrontendImages();
    })
    .catch((err) => {
        console.error('❌ Servidor não está rodando:', err.message);
        console.log('💡 Certifique-se de que o servidor está rodando em http://localhost:3000');
    });