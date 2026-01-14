// Referencia al contenedor en el HTML
const contenedorProductos = document.getElementById('contenedor-productos');
const contadorCarrito = document.getElementById('contador-carrito');

// --- VARIABLES GLOBALES ---
let productos = []; // Ahora empieza vacío y se llena con el JSON
let carrito = [];

// --- SISTEMA DE NOTIFICACIONES CON SWEETALERT2 ---

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Mapeamos tus tipos a los iconos de SweetAlert2
    let icono = 'info'; 
    if (tipo === 'exito') icono = 'success';
    if (tipo === 'error') icono = 'error';
    if (tipo === 'warning') icono = 'warning';

    // Configuramos el "Toast" (la notificación pequeña)
    const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end', // Abajo a la derecha
        showConfirmButton: false,
        timer: 3000,            // Dura 3 segundos
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

    // Disparamos la alerta
    Toast.fire({
        icon: icono,
        title: mensaje
    });
}

// --- CARGA DE DATOS (NUEVO CON FETCH) ---

async function cargarProductos() {
    try {
        // Hacemos la petición al archivo JSON
        const respuesta = await fetch('../assets/data/productos.json');
        
        // Verificamos si la ruta es correcta (útil si estás en el index o en pages)
        // Si falla, intentamos con la ruta desde el index
        if (!respuesta.ok) {
            throw new Error('No se pudo cargar desde ../assets, intentando ./assets');
        }

        const datos = await respuesta.json();
        productos = datos; // Guardamos los datos en nuestra variable global
        console.log("Productos cargados exitosamente:", productos);
    } catch (error) {
        // Fallback por si estamos en el index.html (ruta distinta)
        try {
            const respuestaIndex = await fetch('./assets/data/productos.json');
            const datosIndex = await respuestaIndex.json();
            productos = datosIndex;
        } catch (errorFinal) {
            console.error("Error cargando productos:", errorFinal);
            mostrarNotificacion("Error al cargar el catálogo.", "error");
        }
    }
}

// --- LÓGICA DE PÁGINA DE INICIO (OFERTAS) ---

function renderizarOfertasDestacadas() {
    const contenedorOfertas = document.getElementById('ofertas-destacadas');
    
    // Filtramos productos para mostrar en oferta (Ej: los que valgan menos de $400)
    // O podrías simplemente tomar los primeros 3: productos.slice(0, 3);
    const productosOferta = productos.filter(p => p.precio < 400); 

    contenedorOfertas.innerHTML = ''; // Limpiar

    productosOferta.forEach(producto => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta-producto');
        
        tarjeta.innerHTML = `
            <img src="./assets/img/${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="precio">$${producto.precio.toFixed(2)}</p>
            
            <button class="btn-detalles" onclick="window.location.href='./pages/detalleProducto.html?id=${producto.id}'">Ver Detalles</button>
            <button class="btn-agregar" data-id="${producto.id}">Añadir al Carrito</button>
        `;

        // Lógica del botón agregar
        const botonAgregar = tarjeta.querySelector('.btn-agregar');
        botonAgregar.addEventListener('click', () => agregarAlCarrito(producto.id));

        contenedorOfertas.appendChild(tarjeta);
    });
}

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

function renderizarProductos(listaProductos = productos) {
    const contenedorProductos = document.getElementById('contenedor-productos');
    contenedorProductos.innerHTML = ''; // Limpiar antes de mostrar

    if (listaProductos.length === 0) {
        contenedorProductos.innerHTML = '<p class="mensaje-vacio">No se encontraron productos con esos criterios 😔</p>';
        return;
    }

    listaProductos.forEach(producto => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta-producto');
        
        tarjeta.innerHTML = `
            <img src="../assets/img/${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcionCorta}</p>
            <p class="precio">$${producto.precio.toFixed(2)}</p>
            
            <button class="btn-detalles" onclick="window.location.href='detalleProducto.html?id=${producto.id}'">Ver Detalles</button>
            <button class="btn-agregar" data-id="${producto.id}">Añadir al Carrito</button>
        `;

        const botonAgregar = tarjeta.querySelector('.btn-agregar');
        botonAgregar.addEventListener('click', () => agregarAlCarrito(producto.id));

        contenedorProductos.appendChild(tarjeta);
    });
}

// Función para inicializar los filtros
function configurarFiltros() {
    const inputBusqueda = document.getElementById('input-busqueda');
    const botonesFiltro = document.querySelectorAll('.btn-filtro');

    // 1. Filtrado por Búsqueda (Input)
    inputBusqueda.addEventListener('input', (e) => {
        const texto = e.target.value.toLowerCase();
        
        const productosFiltrados = productos.filter(p => 
            p.nombre.toLowerCase().includes(texto) || 
            p.categoria.toLowerCase().includes(texto)
        );
        
        renderizarProductos(productosFiltrados);
    });

    // 2. Filtrado por Botones de Categoría
    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', () => {
            // Quitar clase active de todos y ponerla al actual
            botonesFiltro.forEach(b => b.classList.remove('active'));
            boton.classList.add('active');

            const categoria = boton.dataset.categoria;
            
            if (categoria === 'todos') {
                renderizarProductos(productos);
            } else {
                const filtrados = productos.filter(p => p.categoria === categoria);
                renderizarProductos(filtrados);
            }
        });
    });

    // 3. Filtrado automático desde la URL (ej: productos.html?categoria=CPU)
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaUrl = urlParams.get('categoria');

    if (categoriaUrl) {
        // Buscar el botón correspondiente y simular click
        const botonCorrespondiente = document.querySelector(`.btn-filtro[data-categoria="${categoriaUrl}"]`);
        if (botonCorrespondiente) {
            botonCorrespondiente.click();
        } else {
            // Si la categoría no tiene botón, filtramos manualmente
            const filtrados = productos.filter(p => p.categoria === categoriaUrl);
            renderizarProductos(filtrados);
        }
    } else {
        // Si no hay filtro URL, mostrar todo
        renderizarProductos(); 
    }
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
    mostrarNotificacion("¡Producto añadido al carrito!", "exito");
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

        // --- NUEVO: Notificación de eliminación ---
        // Usamos 'warning' para que salga el icono de advertencia (amarillo)
        mostrarNotificacion("Producto eliminado del carrito.", "warning");
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
        mostrarNotificacion("La contraseña es muy corta", "error");
        mensaje.style.color = 'red';
        return;
    }
    
    // Verificar si el email ya existe
    if (usuarios.some(u => u.email === email)) {
        mensaje.textContent = 'Este correo ya está registrado.';
        mensaje.style.color = 'red';
        return;
    }

    // Crear y guardar
    const nuevoUsuario = { nombre, email, password };
    usuarios.push(nuevoUsuario);
    localStorage.setItem(KEY_USUARIOS, JSON.stringify(usuarios));
    
    mostrarNotificacion("¡Registro exitoso!", "exito");
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
        
        mostrarNotificacion(`¡Bienvenido, ${usuarioEncontrado.nombre}!`, "exito");
        mensaje.style.color = '#007bff';
        
        // Redirigir al Inicio 
        setTimeout(() => {
            window.location.href = '../index.html'; 
        }, 1000);
    } else {
        mostrarNotificacion("Credenciales incorrectas", "error");
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

// --- LÓGICA DE DETALLE DE PRODUCTO (ACTUALIZADA) ---

let productoActual = null; 

function renderizarDetalleProducto() {
    const contenedorDetalle = document.getElementById('contenedor-detalle-producto');
    
    // 1. Leer ID
    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = parseInt(urlParams.get('id'));

    // 2. Buscar producto
    productoActual = productos.find(p => p.id === idProducto);

    if (!productoActual) {
        contenedorDetalle.innerHTML = '<h3>Producto no encontrado 😢</h3><a href="productos.html">Volver al catálogo</a>';
        return;
    }

    // 3. Generar HTML de Opciones Dinámicas
    let opcionesHTML = '';
    
    // Si el producto tiene opciones configuradas en data.js
    if (productoActual.opciones && productoActual.opciones.length > 0) {
        
        productoActual.opciones.forEach((opcion, index) => {
            // Creamos las opciones del <select>
            let valoresHTML = '';
            opcion.valores.forEach((valor, vIndex) => {
                const precioExtraTexto = valor.precio > 0 ? `(+$${valor.precio.toFixed(2)})` : '';
                valoresHTML += `<option value="${valor.precio}" data-nombre="${valor.nombre}">${valor.nombre} ${precioExtraTexto}</option>`;
            });

            // Agregamos el bloque completo del select
            opcionesHTML += `
                <div class="grupo-opcion">
                    <h4>${opcion.titulo}</h4>
                    <select class="selector-dinamico" data-titulo="${opcion.titulo}" onchange="actualizarPrecioDetalle()">
                        ${valoresHTML}
                    </select>
                </div>
            `;
        });
    }

    // 4. Inyectar todo en el DOM
    contenedorDetalle.innerHTML = `
        <div class="detalle-imagen">
            <img src="../assets/img/${productoActual.imagen}" alt="${productoActual.nombre}">
        </div>
        <div class="detalle-info">
            <h2>${productoActual.nombre}</h2>
            <p class="descripcion-larga">${productoActual.descripcionCorta}</p>
            
            ${opcionesHTML}

            <span class="precio-final" id="precio-detalle">$${productoActual.precio.toFixed(2)}</span>

            <button class="btn-agregar-grande" onclick="agregarDesdeDetalle()">
                Añadir al Carrito 🛒
            </button>
        </div>
    `;
}

// Calcula el precio sumando el base + todos los selectores activos
function actualizarPrecioDetalle() {
    let costoExtraTotal = 0;
    
    // Buscamos todos los selects que creamos dinámicamente
    const selectores = document.querySelectorAll('.selector-dinamico');
    
    selectores.forEach(select => {
        costoExtraTotal += parseFloat(select.value);
    });

    const precioTotal = productoActual.precio + costoExtraTotal;
    document.getElementById('precio-detalle').textContent = `$${precioTotal.toFixed(2)}`;
}

// Añade al carrito incluyendo la información de las opciones elegidas
function agregarDesdeDetalle() {
    let costoExtraTotal = 0;
    let descripcionVariantes = []; // Para guardar qué eligió el usuario (ej: "Blanco Artic")

    const selectores = document.querySelectorAll('.selector-dinamico');
    
    selectores.forEach(select => {
        const precio = parseFloat(select.value);
        const opcionNombre = select.options[select.selectedIndex].dataset.nombre; // Leemos el nombre del atributo data
        const tituloOpcion = select.dataset.titulo;

        costoExtraTotal += precio;
        
        // Solo guardamos la descripción si no es la opción por defecto o si tiene costo
        // (Opcional: guardar siempre para ser más claros)
        descripcionVariantes.push(`${tituloOpcion}: ${opcionNombre}`);
    });

    // Creamos el nombre compuesto (ej: "Memoria RAM (Color: Blanco Artic)")
    let nombreFinal = productoActual.nombre;
    if (descripcionVariantes.length > 0) {
        nombreFinal += ` (${descripcionVariantes.join(', ')})`;
    }

    const itemParaCarrito = {
        ...productoActual,
        id: productoActual.id + "-" + descripcionVariantes.join('-').replace(/\s+/g, ''), // ID único para variantes
        precio: productoActual.precio + costoExtraTotal,
        nombre: nombreFinal,
        cantidad: 1
    };

    // Lógica de agregar al carrito
    const itemExistente = carrito.find(i => i.id === itemParaCarrito.id);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push(itemParaCarrito);
    }

    guardarCarritoEnLocalStorage();
    actualizarContadorCarrito();
    
    mostrarNotificacion("¡Producto añadido al carrito con tus opciones!", "exito");
}

// --- LÓGICA DE PERFIL Y CHECKOUT ---

const KEY_PEDIDOS = 'nucleoDigitalPedidos';

// 1. Finalizar Compra (Simulación)
function finalizarCompra() {
    // Verificar si hay usuario logueado
    const sesionActiva = JSON.parse(localStorage.getItem(KEY_SESION));
    
    if (!sesionActiva) {
        mostrarNotificacion("Debes iniciar sesión para comprar.", "error");
        // Opcional: Dar tiempo para leer el error antes de mandar al login
        setTimeout(() => {
            window.location.href = "loginRegistro.html";
        }, 2000);
        return;
    }

    if (carrito.length === 0) return;

    // Calcular total final
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const total = subtotal + 15; // + Envío fijo

    // Crear objeto del pedido
    const nuevoPedido = {
        id: Date.now(), // ID único basado en la fecha
        fecha: new Date().toLocaleDateString(),
        usuarioEmail: sesionActiva.email, // Importante para saber de quién es
        items: [...carrito], // Copia de los items
        total: total
    };

    // Guardar en historial general
    let historialPedidos = JSON.parse(localStorage.getItem(KEY_PEDIDOS)) || [];
    historialPedidos.push(nuevoPedido);
    localStorage.setItem(KEY_PEDIDOS, JSON.stringify(historialPedidos));

    // Vaciar carrito
    carrito = [];
    guardarCarritoEnLocalStorage();
    
    mostrarNotificacion("¡Compra realizada con éxito!", "exito");
    
    // Redirigir al perfil para ver el pedido
    // Esperamos 2000 milisegundos (2 segundos) antes de ir al perfil
    setTimeout(() => {
        window.location.href = "perfil.html";
    }, 2000);
}

// 2. Renderizar Página de Perfil
function renderizarPerfil() {
    const sesionActiva = JSON.parse(localStorage.getItem(KEY_SESION));

    // Seguridad: Si no hay sesión, mandar al login
    if (!sesionActiva) {
        window.location.href = "loginRegistro.html";
        return;
    }

    // Mostrar nombre
    document.getElementById('mensaje-bienvenida').textContent = `Hola, ${sesionActiva.nombre} 👋`;

    // Configurar botón Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem(KEY_SESION); // Borrar sesión
        window.location.href = "../index.html"; // Ir al inicio
    });

    // Cargar y filtrar pedidos de ESTE usuario
    const todosLosPedidos = JSON.parse(localStorage.getItem(KEY_PEDIDOS)) || [];
    const misPedidos = todosLosPedidos.filter(p => p.usuarioEmail === sesionActiva.email);
    const contenedorPedidos = document.getElementById('lista-pedidos');

    if (misPedidos.length === 0) {
        contenedorPedidos.innerHTML = '<p>Aún no has realizado ninguna compra.</p>';
        return;
    }

    // Dibujar pedidos (Ordenados del más reciente al más antiguo)
    contenedorPedidos.innerHTML = '';
    misPedidos.reverse().forEach(pedido => {
        
        let listaItemsHTML = '';
        pedido.items.forEach(item => {
            listaItemsHTML += `<li>• ${item.cantidad}x ${item.nombre}</li>`;
        });

        const pedidoHTML = `
            <div class="pedido-card">
                <div class="pedido-header">
                    <span>Pedido #${pedido.id}</span>
                    <span>📅 ${pedido.fecha}</span>
                </div>
                <div class="pedido-detalle">
                    <ul>${listaItemsHTML}</ul>
                </div>
                <div class="pedido-total">
                    Total: $${pedido.total.toFixed(2)}
                </div>
            </div>
        `;
        contenedorPedidos.innerHTML += pedidoHTML;
    });
}

// INICIO DE LA APLICACIÓN

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Cargamos el carrito guardado para que los datos persistan
    cargarCarritoDesdeLocalStorage();
    await cargarProductos(); // ¡ESPERAMOS A QUE LLEGUEN LOS DATOS!

    // 2. Si estamos en la página de productos, renderizamos el catálogo
    if (document.getElementById('contenedor-productos')) {
         //renderizarProductos();
         configurarFiltros();
    }
    
    // 3. Si estamos en la página del carrito, renderizamos su contenido
    if (document.getElementById('contenedor-items-carrito')) {
        renderizarCarrito();
        // Activar botón de finalizar compra
        const btnFinalizar = document.getElementById('btn-finalizar-compra');
        if(btnFinalizar) {
            btnFinalizar.addEventListener('click', finalizarCompra);
        }
    }
    
    if (document.getElementById('contenedor-detalle-producto')) {
        renderizarDetalleProducto();
    }
    
    // NUEVO: Activar perfil
    if (document.getElementById('contenedor-perfil')) {
        renderizarPerfil();
    }

    // 4. Lógica para Autenticación 
    if (document.getElementById('contenedor-auth')) {
        cargarUsuarios(); // Carga usuarios de localStorage
        configurarTabs(); // Activa las pestañas
        
        document.getElementById('form-registro').addEventListener('submit', manejarRegistro);
        document.getElementById('form-login').addEventListener('submit', manejarLogin);
        
        // Simulación Google
        document.getElementById('btn-google').addEventListener('click', () => {
            mostrarNotificacion("Función no disponible en esta demo.", "info");
        });
    }

    // NUEVO: Lógica para el Home (Index)
    if (document.getElementById('ofertas-destacadas')) {
        renderizarOfertasDestacadas();
    }

    // 5. Verificar si hay usuario logueado para cambiar el menú
    const sesionActiva = JSON.parse(localStorage.getItem(KEY_SESION));
    const linkUsuario = document.getElementById('link-usuario'); 
    
    if (sesionActiva && linkUsuario) {
        // Si hay sesión y el botón existe, cambiamos el texto
        linkUsuario.textContent = `👤 ${sesionActiva.nombre}`;
        
        const rutaPerfil = window.location.pathname.includes('/pages/') ? "perfil.html" : "./pages/perfil.html";
        linkUsuario.href = rutaPerfil;
    }

    // 6. En cualquier página, actualizamos el contador del carrito en el header
    actualizarContadorCarrito();
});