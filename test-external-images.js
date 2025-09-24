const fs = require('fs');
// Usar fetch nativo do Node.js (disponível a partir da versão 18)

async function testExternalImages() {
    console.log('🔍 Testando carregamento de imagens externas...');
    
    // URLs para testar
    const testUrls = [
        'https://via.placeholder.com/300x200',
        'https://picsum.photos/300/200',
        'https://httpbin.org/image/jpeg'
    ];
    
    for (const url of testUrls) {
        try {
            console.log(`\n📡 Testando: ${url}`);
            
            const response = await fetch(url, {
                method: 'HEAD',
                timeout: 5000
            });
            
            console.log(`Status: ${response.status}`);
            console.log(`Content-Type: ${response.headers.get('content-type')}`);
            console.log(`Content-Length: ${response.headers.get('content-length')}`);
            console.log(`Acessível: ${response.ok ? '✅' : '❌'}`);
            
        } catch (error) {
            console.log(`❌ Erro ao acessar ${url}:`, error.message);
        }
    }
    
    // Testar se o problema é CORS
    console.log('\n🌐 Testando CORS...');
    try {
        const response = await fetch('https://via.placeholder.com/300x200');
        const buffer = await response.buffer();
        console.log(`✅ Imagem baixada com sucesso (${buffer.length} bytes)`);
        
        // Salvar a imagem para verificar
        fs.writeFileSync('test-external-image.jpg', buffer);
        console.log('💾 Imagem salva como test-external-image.jpg');
        
    } catch (error) {
        console.log('❌ Erro ao baixar imagem:', error.message);
    }
}

// Testar também no navegador
async function testInBrowser() {
    const puppeteer = require('puppeteer');
    
    console.log('\n🌐 Testando no navegador...');
    
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        // Criar uma página HTML simples para testar
        const testHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Teste de Imagens</title>
        </head>
        <body>
            <h1>Teste de Carregamento de Imagens</h1>
            <img id="test1" src="https://via.placeholder.com/300x200" alt="Placeholder" onerror="console.log('Erro ao carregar placeholder')">
            <img id="test2" src="https://picsum.photos/300/200" alt="Picsum" onerror="console.log('Erro ao carregar picsum')">
            <img id="test3" src="img/logoGB.PNG" alt="Local" onerror="console.log('Erro ao carregar local')">
        </body>
        </html>
        `;
        
        await page.setContent(testHtml);
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar se as imagens carregaram
        const results = await page.evaluate(() => {
            const images = document.querySelectorAll('img');
            return Array.from(images).map(img => ({
                id: img.id,
                src: img.src,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                complete: img.complete,
                loaded: img.naturalWidth > 0 && img.naturalHeight > 0
            }));
        });
        
        console.log('\n📊 Resultados do teste no navegador:');
        results.forEach(result => {
            console.log(`${result.id}: ${result.loaded ? '✅' : '❌'} (${result.naturalWidth}x${result.naturalHeight})`);
            console.log(`  URL: ${result.src}`);
        });
        
    } catch (error) {
        console.error('❌ Erro no teste do navegador:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function runAllTests() {
    await testExternalImages();
    await testInBrowser();
}

runAllTests().catch(console.error);