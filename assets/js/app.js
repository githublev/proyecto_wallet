// Alke Wallet - Aplicación de Billetera Digital

// Variables globales
let saldo = 100000;
let transacciones = [];

// Usuario de prueba
const usuario = {
    email: 'admin@alkewallet.com',
    password: 'admin123',
    nombre: 'Son Goku'
};

// Función para formatear moneda
function formatearMoneda(monto) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(monto);
}

// ========== LOGIN ==========
function validarLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email === usuario.email && password === usuario.password) {
        localStorage.setItem('usuarioLogueado', 'true');
        localStorage.setItem('saldo', saldo);
        window.location.href = 'index.html';
    } else {
        alert('Credenciales incorrectas');
    }
}

// Verificar si hay usuario logueado
function verificarSesion() {
    const logueado = localStorage.getItem('usuarioLogueado');
    if (!logueado && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// ========== MENÚ PRINCIPAL ==========
function mostrarSaldo() {
    const saldoGuardado = localStorage.getItem('saldo');
    if (saldoGuardado) {
        saldo = parseFloat(saldoGuardado);
    }
    
    const balanceDisplay = document.getElementById('balanceDisplay');
    if (balanceDisplay) {
        balanceDisplay.innerHTML = `
            <div class="balance-card">
                <div class="balance-label">Saldo Disponible</div>
                <div class="balance-amount">${formatearMoneda(saldo)}</div>
            </div>
        `;
    }
}

// ========== DEPÓSITO ==========
function realizarDeposito() {
    const monto = parseFloat(document.getElementById('monto-depositar').value);
    
    if (monto && monto > 0) {
        saldo += monto;
        localStorage.setItem('saldo', saldo);
        
        // Agregar transacción
        const nuevaTransaccion = {
            fecha: new Date().toLocaleDateString('es-ES'),
            descripcion: 'Depósito',
            tipo: 'Ingreso',
            monto: monto
        };
        
        transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');
        transacciones.unshift(nuevaTransaccion);
        localStorage.setItem('transacciones', JSON.stringify(transacciones));
        
        alert('Depósito realizado exitosamente');
        document.getElementById('monto-depositar').value = '';
        window.location.href = 'index.html';
    } else {
        alert('Por favor ingresa un monto válido');
    }
}

// ========== ENVÍO DE DINERO ==========
function enviarDinero() {
    const monto = parseFloat(document.getElementById('monto-enviar').value);
    const destinatario = document.getElementById('destinatario').value;
    
    if (!monto || monto <= 0) {
        alert('Por favor ingresa un monto válido');
        return;
    }
    
    if (monto > saldo) {
        alert('Saldo insuficiente');
        return;
    }
    
    if (!destinatario || destinatario === 'Seleccione contacto') {
        alert('Por favor selecciona un destinatario');
        return;
    }
    
    saldo -= monto;
    localStorage.setItem('saldo', saldo);
    
    // Agregar transacción
    const nuevaTransaccion = {
        fecha: new Date().toLocaleDateString('es-ES'),
        descripcion: `Envío a ${destinatario}`,
        tipo: 'Egreso',
        monto: monto
    };
    
    transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');
    transacciones.unshift(nuevaTransaccion);
    localStorage.setItem('transacciones', JSON.stringify(transacciones));
    
    alert(`Transferencia de ${formatearMoneda(monto)} a ${destinatario} realizada exitosamente`);
    document.getElementById('monto-enviar').value = '';
    document.getElementById('destinatario').value = 'Seleccione contacto';
    window.location.href = 'index.html';
}

// Autocompletar con jQuery
function inicializarAutocompletar() {
    if (typeof $ !== 'undefined') {
        const contactos = ['Juan Perez', 'Maria Gonzales', 'César Astorga'];
        
        $('#destinatario').autocomplete({
            source: contactos,
            minLength: 1
        });
    }
}

// ========== TRANSACCIONES ==========
function mostrarTransacciones() {
    transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');
    const tbody = document.querySelector('.table tbody');
    
    if (!tbody) return;
    
    if (transacciones.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    No hay transacciones registradas
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = transacciones.map(trans => {
        const esIngreso = trans.tipo === 'Ingreso';
        const signo = esIngreso ? '+' : '-';
        const claseColor = esIngreso ? 'text-success' : 'text-danger';
        
        return `
            <tr>
                <td>${trans.fecha}</td>
                <td>${trans.descripcion}</td>
                <td class="${claseColor}">${trans.tipo}</td>
                <td class="${claseColor} text-end">${signo}${formatearMoneda(trans.monto)}</td>
            </tr>
        `;
    }).join('');
}

// ========== LOGOUT ==========
function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('usuarioLogueado');
        window.location.href = 'login.html';
    }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    verificarSesion();
    
    // Inicializar según la página
    const path = window.location.pathname;
    
    if (path.includes('login.html')) {
        // Evento de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                validarLogin();
            });
        }
    } else if (path.includes('index.html') || path.endsWith('/')) {
        mostrarSaldo();
    } else if (path.includes('deposit.html')) {
        mostrarSaldo();
        const btnDepositar = document.querySelector('button[type="button"]');
        if (btnDepositar) {
            btnDepositar.addEventListener('click', realizarDeposito);
        }
    } else if (path.includes('sendmoney.html')) {
        mostrarSaldo();
        inicializarAutocompletar();
        const btnEnviar = document.querySelector('button[type="button"]');
        if (btnEnviar) {
            btnEnviar.addEventListener('click', enviarDinero);
        }
    } else if (path.includes('transactions.html')) {
        mostrarTransacciones();
    }
    
    // Botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarSesion();
        });
    }
});
