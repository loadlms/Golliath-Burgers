// Script de teste para login administrativo
// Cole este código no console do navegador (F12) na página de admin

console.log('=== TESTE DE LOGIN ADMINISTRATIVO ===');

// Verificar se os elementos existem
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.querySelector('button[type="submit"]');

console.log('Elementos encontrados:');
console.log('- loginForm:', !!loginForm);
console.log('- emailInput:', !!emailInput);
console.log('- passwordInput:', !!passwordInput);
console.log('- submitBtn:', !!submitBtn);

if (loginForm && emailInput && passwordInput) {
    // Preencher campos automaticamente
    emailInput.value = 'admin@golliath.com';
    passwordInput.value = 'admin2023';
    
    console.log('Campos preenchidos automaticamente');
    console.log('Email:', emailInput.value);
    console.log('Password:', passwordInput.value ? 'preenchido' : 'vazio');
    
    // Testar submit programático
    console.log('Testando submit programático...');
    
    // Criar evento de submit
    const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
    });
    
    // Disparar evento
    loginForm.dispatchEvent(submitEvent);
    
    console.log('Evento de submit disparado');
    
} else {
    console.error('Alguns elementos não foram encontrados!');
    console.error('Verifique se você está na página correta (/admin)');
}

// Testar API diretamente
console.log('\n=== TESTE DIRETO DA API ===');

fetch('/api/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'admin@golliath.com',
        password: 'admin2023'
    })
})
.then(response => {
    console.log('Response status:', response.status);
    return response.json();
})
.then(data => {
    console.log('Response data:', data);
    if (data.success) {
        console.log('✅ API funcionando corretamente!');
        console.log('Token:', data.token);
    } else {
        console.log('❌ Erro na API:', data.message);
    }
})
.catch(error => {
    console.error('❌ Erro na requisição:', error);
});

console.log('=== FIM DO TESTE ===');