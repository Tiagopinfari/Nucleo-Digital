// Referencia al contenedor en el HTML
const contenedorProductos = document.getElementById('contenedor-productos');
const contadorCarrito = document.getElementById('contador-carrito');

// 0. FUNCIONES DE PERSISTENCIA

/**
 * Carga el contenido del carrito desde localStorage al array 'carrito'.
 */
function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carritoNucleoDigital');
    if (carritoGuardado) {
        // Reemplazamos el array 'carrito' con lo que hay guardado
        carrito = JSON.parse(carritoGuardado);
    }
}

/**
 * Guarda el contenido actual del array 'carrito' en localStorage.
 */
function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carritoNucleoDigital', JSON.stringify(carrito));
}

// 1. Muestra todos los productos en la página del catálogo.

function renderizarProductos() {
    productos.forEach(producto => {
        // Elemento div que será la tarjeta del producto
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta-producto');
        
        // El contenido de la tarjeta
        tarjeta.innerHTML = `
            <img src="../assets/img/${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcionCorta}</p>
            <p class="precio">$${producto.precio.toFixed(2)}</p>
            
            <button class="btn-detalles" onclick="window.location.href='detalleProducto.html?id=${producto.id}'">Ver Detalles</button>
            
            <button class="btn-agregar" data-id="${producto.id}">Añadir al Carrito</button>
        `;

        // event listener al botón de añadir
        const botonAgregar = tarjeta.querySelector('.btn-agregar');
        botonAgregar.addEventListener('click', () => agregarAlCarrito(producto.id));

        // Agregar la tarjeta al contenedor principal
        contenedorProductos.appendChild(tarjeta);
    });
}

// 2. Agregar un producto al carrito de compras

function agregarAlCarrito(productoId) {
    const productoAñadir = productos.find(p => p.id === productoId);

    // Verifica si el producto ya está en el carrito
    const itemEnCarrito = carrito.find(item => item.id === productoId);

    if (itemEnCarrito) {
        // Si ya existe, solo incrementamos la cantidad
        itemEnCarrito.cantidad++;
    } else {
        // Si no existe, lo agregamos con cantidad 1
        carrito.push({ ...productoAñadir, cantidad: 1 });
    }

    // Guardar el carrito después de cada cambio
    guardarCarritoEnLocalStorage(); 

    // Actualizamos el contador visual y guardamos el carrito
    actualizarContadorCarrito();
    console.log(`Producto añadido: ${productoAñadir.nombre}. Carrito actual:`, carrito); 
}

// 3. Actualizar el número de ítems mostrados en el encabezado.

function actualizarContadorCarrito() {
    const contadorCarrito = document.getElementById('contador-carrito');
    if (contadorCarrito) { // Verifica si el elemento existe en la página actual
        // Sumamos las cantidades de todos los ítems en el carrito (del array 'carrito' en data.js)
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
        contadorCarrito.textContent = totalItems;
    }
}

const contenedorItems = document.getElementById('contenedor-items-carrito');
const mensajeVacio = document.getElementById('carrito-vacio-mensaje');
const subtotalElemento = document.getElementById('subtotal-carrito');
const totalElemento = document.getElementById('total-carrito');
const COSTO_ENVIO = 15.00; // Constante para el costo de envío simulado

/**
 * 4. Dibuja el contenido del carrito en la página carrito.html.
 */
function renderizarCarrito() {
    contenedorItems.innerHTML = ''; // Limpiar la lista antes de dibujar

    if (carrito.length === 0) {
        contenedorItems.appendChild(mensajeVacio);
        mensajeVacio.style.display = 'block';
        document.getElementById('resumen-compra');
    } else {
        mensajeVacio.style.display = 'none';
        document.getElementById('resumen-compra').style.display = 'block';
    }

    carrito.forEach(item => {
        const itemHTML = document.createElement('div');
        itemHTML.classList.add('item-carrito');
        itemHTML.innerHTML = `
            <img src="../assets/img/${item.imagen}" alt="${item.nombre}">
            <div class="info-item">
                <h4>${item.nombre}</h4>
                <p>Precio Unitario: $${item.precio.toFixed(2)}</p>
                <p>Subtotal: <strong>$${(item.precio * item.cantidad).toFixed(2)}</strong></p>
            </div>
            <div class="controles-item">
                <button class="btn-cantidad" data-id="${item.id}" data-accion="restar">-</button>
                <span class="cantidad">${item.cantidad}</span>
                <button class="btn-cantidad" data-id="${item.id}" data-accion="sumar">+</button>
                <button class="btn-eliminar" data-id="${item.id}">🗑️ Eliminar</button>
            </div>
        `;

        contenedorItems.appendChild(itemHTML);
    });

    // Agregar listeners a los botones generados
    document.querySelectorAll('.btn-cantidad').forEach(button => {
        button.addEventListener('click', manejarCantidad);
    });
    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', eliminarDelCarrito);
    });

    actualizarTotales();
}


/**
 * 5. Calcula y actualiza el subtotal, envío y total de la compra.
 */
function actualizarTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // El envío solo se cobra si hay algo en el carrito
    const costoFinalEnvio = subtotal > 0 ? COSTO_ENVIO : 0.00; 
    const total = subtotal + costoFinalEnvio;

    subtotalElemento.textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('costo-envio').textContent = `$${costoFinalEnvio.toFixed(2)}`;
    totalElemento.textContent = `$${total.toFixed(2)}`;

    const btnFinalizar = document.getElementById('btn-finalizar-compra');
    btnFinalizar.disabled = subtotal === 0;
    btnFinalizar.textContent = subtotal === 0 ? "Añade productos para pagar" : "Finalizar Compra";
}


/**
 * 6. Manejar el cambio de cantidad de un producto.
 */
function manejarCantidad(event) {
    const id = parseInt(event.target.dataset.id);
    const accion = event.target.dataset.accion;
    const item = carrito.find(i => i.id === id);

    if (!item) return;

    if (accion === 'sumar') {
        item.cantidad++;
    } else if (accion === 'restar' && item.cantidad > 1) {
        item.cantidad--;
    } else if (accion === 'restar' && item.cantidad === 1) {
        // Si la cantidad es 1 y se quiere restar, eliminamos el producto
        eliminarItemPorId(id);
        return; // Salir para no renderizar dos veces
    }
    
    guardarCarritoEnLocalStorage();
    renderizarCarrito(); // Redibujar la lista para ver los cambios
    actualizarContadorCarrito();
}

/**
 * 7. Eliminar un producto del carrito.
 */
function eliminarDelCarrito(event) {
    const id = parseInt(event.target.dataset.id);
    eliminarItemPorId(id);
    
    guardarCarritoEnLocalStorage();
    renderizarCarrito();
    actualizarContadorCarrito();
}

/**
 * 8. Función utilitaria para eliminar un ítem del array.
 */
function eliminarItemPorId(id) {
    const indice = carrito.findIndex(i => i.id === id);
    if (indice !== -1) {
        carrito.splice(indice, 1);
    }
}

// --- LÓGICA DE AUTENTICACIÓN ---

let usuarios = [];
const KEY_USUARIOS = 'nucleoDigitalUsuarios';
const KEY_SESION = 'nucleoDigitalSesion';

// 1. Cargar Usuarios Guardados
function cargarUsuarios() {
    const usuariosGuardados = localStorage.getItem(KEY_USUARIOS);
    if (usuariosGuardados) {
        usuarios = JSON.parse(usuariosGuardados);
    }
}

// 2. Guardar nuevo usuario
function manejarRegistro(event) {
    event.preventDefault(); // Evita que se recargue la página

    const nombre = document.getElementById('registro-nombre').value.trim();
    const email = document.getElementById('registro-email').value.trim();
    const password = document.getElementById('registro-password').value;
    const mensaje = document.getElementById('auth-mensaje');
    
    // Validaciones simples
    if (password.length < 6) {
        mensaje.textContent = '❌ La contraseña debe tener al menos 6 caracteres.';
        mensaje.style.color = 'red';
        return;
    }
    
    // Verificar si el email ya existe
    if (usuarios.some(u => u.email === email)) {
        mensaje.textContent = '❌ Este correo ya está registrado.';
        mensaje.style.color = 'red';
        return;
    }

    // Crear y guardar
    const nuevoUsuario = { nombre, email, password };
    usuarios.push(nuevoUsuario);
    localStorage.setItem(KEY_USUARIOS, JSON.stringify(usuarios));
    
    mensaje.textContent = '✅ ¡Registro exitoso! Ahora inicia sesión.';
    mensaje.style.color = 'green';
    
    document.getElementById('form-registro').reset();
    
    // Cambiar automáticamente a la pestaña de login después de 1.5 seg
    setTimeout(() => {
        document.getElementById('tab-login').click();
        mensaje.textContent = '';
    }, 1500);
}

// 3. Manejar Inicio de Sesión
function manejarLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const mensaje = document.getElementById('auth-mensaje');

    const usuarioEncontrado = usuarios.find(u => u.email === email && u.password === password);

    if (usuarioEncontrado) {
        // Guardamos la sesión activa
        localStorage.setItem(KEY_SESION, JSON.stringify(usuarioEncontrado));
        
        mensaje.textContent = `👋 ¡Bienvenido, ${usuarioEncontrado.nombre}!`;
        mensaje.style.color = '#007bff';
        
        // Redirigir al Inicio (index.html)
        setTimeout(() => {
            window.location.href = '../index.html'; 
        }, 1000);
    } else {
        mensaje.textContent = '❌ Credenciales incorrectas.';
        mensaje.style.color = 'red';
    }
}

// 4. Configurar el cambio de pestañas (Tabs)
function configurarTabs() {
    const tabLogin = document.getElementById('tab-login');
    const tabRegistro = document.getElementById('tab-registro');
    const formLogin = document.getElementById('form-login');
    const formRegistro = document.getElementById('form-registro');
    const mensaje = document.getElementById('auth-mensaje');

    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegistro.classList.remove('active');
        formLogin.classList.remove('hidden-form');
        formRegistro.classList.add('hidden-form');
        mensaje.textContent = '';
    });

    tabRegistro.addEventListener('click', () => {
        tabRegistro.classList.add('active');
        tabLogin.classList.remove('active');
        formRegistro.classList.remove('hidden-form');
        formLogin.classList.add('hidden-form');
        mensaje.textContent = '';
    });
}

// --- LÓGICA DE DETALLE DE PRODUCTO ---

let productoActual = null; // Variable para guardar el producto que estamos viendo

function renderizarDetalleProducto() {
    const contenedorDetalle = document.getElementById('contenedor-detalle-producto');
    
    // 1. Leer el ID de la URL (ej: ?id=2)
    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = parseInt(urlParams.get('id'));

    // 2. Buscar el producto en la base de datos
    productoActual = productos.find(p => p.id === idProducto);

    if (!productoActual) {
        contenedorDetalle.innerHTML = '<h3>Producto no encontrado 😢</h3><a href="productos.html">Volver al catálogo</a>';
        return;
    }

    // 3. Generar el HTML
    // Simulamos opciones de personalización (esto podría venir de data.js en el futuro)
    const opcionesHTML = `
        <div class="grupo-opcion">
            <h4>Garantía Extendida</h4>
            <select id="select-garantia" onchange="actualizarPrecioDetalle()">
                <option value="0">Garantía Estándar (Gratis)</option>
                <option value="25">Garantía +1 Año (+$25.00)</option>
                <option value="45">Garantía +2 Años (+$45.00)</option>
            </select>
        </div>
    `;

    contenedorDetalle.innerHTML = `
        <div class="detalle-imagen">
            <img src="../assets/img/${productoActual.imagen}" alt="${productoActual.nombre}">
        </div>
        <div class="detalle-info">
            <h2>${productoActual.nombre}</h2>
            <p class="descripcion-larga">${productoActual.descripcionCorta} Ideal para entusiastas que buscan el mejor rendimiento por su dinero.</p>
            
            ${opcionesHTML}

            <span class="precio-final" id="precio-detalle">$${productoActual.precio.toFixed(2)}</span>

            <button class="btn-agregar-grande" onclick="agregarDesdeDetalle()">
                Añadir al Carrito 🛒
            </button>
        </div>
    `;
}

// Actualiza el precio mostrado cuando cambias el select
function actualizarPrecioDetalle() {
    const selectGarantia = document.getElementById('select-garantia');
    const costoExtra = parseFloat(selectGarantia.value);
    const precioTotal = productoActual.precio + costoExtra;
    
    document.getElementById('precio-detalle').textContent = `$${precioTotal.toFixed(2)}`;
}

// Añade el producto al carrito con el precio modificado
function agregarDesdeDetalle() {
    const selectGarantia = document.getElementById('select-garantia');
    const costoExtra = parseFloat(selectGarantia.value);
    
    // Creamos un objeto especial para el carrito
    const itemParaCarrito = {
        ...productoActual,
        precio: productoActual.precio + costoExtra, // Precio base + extra
        nombre: productoActual.nombre + (costoExtra > 0 ? " (Con Garantía)" : ""), // Modificamos nombre si hay extra
        cantidad: 1
    };

    // Usamos una lógica similar a agregarAlCarrito pero manual
    // Para simplificar, lo añadimos como un item nuevo si tiene garantía
    const itemExistente = carrito.find(i => i.id === itemParaCarrito.id && i.precio === itemParaCarrito.precio);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        // Truco: si tiene precio distinto, le cambiamos el ID temporalmente para que no se mezcle
        if (costoExtra > 0) itemParaCarrito.id = itemParaCarrito.id + "-extra"; 
        carrito.push(itemParaCarrito);
    }

    guardarCarritoEnLocalStorage();
    actualizarContadorCarrito();
    
    alert("¡Producto añadido al carrito!");
}

// INICIO DE LA APLICACIÓN

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargamos el carrito guardado para que los datos persistan
    cargarCarritoDesdeLocalStorage();
    
    // 2. Si estamos en la página de productos, renderizamos el catálogo
    if (document.getElementById('contenedor-productos')) {
         renderizarProductos();
    }
    
    // 3. Si estamos en la página del carrito, renderizamos su contenido
    if (document.getElementById('contenedor-items-carrito')) {
        renderizarCarrito();
    }
    
    if (document.getElementById('contenedor-detalle-producto')) {
        renderizarDetalleProducto();
    }
    
    // 4. Lógica para Autenticación 
    if (document.getElementById('contenedor-auth')) {
        cargarUsuarios(); // Carga usuarios de localStorage
        configurarTabs(); // Activa las pestañas
        
        document.getElementById('form-registro').addEventListener('submit', manejarRegistro);
        document.getElementById('form-login').addEventListener('submit', manejarLogin);
        
        // Simulación Google
        document.getElementById('btn-google').addEventListener('click', () => {
            alert('Funcionalidad de Google Login (Requiere Backend/Firebase).');
        });
    }

    // 5. Verificar si hay usuario logueado para cambiar el menú
    const sesionActiva = JSON.parse(localStorage.getItem(KEY_SESION));
    const linkUsuario = document.getElementById('link-usuario'); // ¡Ahora buscamos por ID!
    
    if (sesionActiva && linkUsuario) {
        // Si hay sesión y el botón existe, cambiamos el texto
        linkUsuario.textContent = `👤 ${sesionActiva.nombre}`;
        
        // Opcional: Si quieres que al hacer clic vaya al perfil en lugar del login
        // Verificamos si estamos en la raíz o en una subcarpeta para poner la ruta bien
        if (window.location.pathname.includes('/pages/')) {
            linkUsuario.href = "perfil.html";
        } else {
            linkUsuario.href = "./pages/perfil.html";
        }
        
        // También podrías agregar un evento para cerrar sesión aquí si quisieras
    }

    // 6. En cualquier página, actualizamos el contador del carrito en el header
    actualizarContadorCarrito();
});