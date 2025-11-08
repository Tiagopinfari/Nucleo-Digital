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
            <button class="btn-detalles">Ver Detalles</button>
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
    
    // 4. En cualquier página, actualizamos el contador del carrito en el header
    actualizarContadorCarrito();
});