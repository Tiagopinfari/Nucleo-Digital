// Referencia al contenedor en el HTML
const contenedorProductos = document.getElementById('contenedor-productos');
const contadorCarrito = document.getElementById('contador-carrito');

// VARIABLES GLOBALES 
let productos = []; 
let carrito = [];

// SISTEMA DE NOTIFICACIONES CON SWEETALERT2

function mostrarNotificacion(mensaje, tipo = 'info') {
    let icono = 'info'; 
    if (tipo === 'exito') icono = 'success';
    if (tipo === 'error') icono = 'error';
    if (tipo === 'warning') icono = 'warning';

    const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end', 
        showConfirmButton: false,
        timer: 3000,            
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

    
    Toast.fire({
        icon: icono,
        title: mensaje
    });
}

// CARGA DE DATOS

async function cargarProductos() {
    try {
        const respuesta = await fetch('../assets/data/productos.json');
        
        if (!respuesta.ok) {
            throw new Error('No se pudo cargar desde ../assets, intentando ./assets');
        }

        const datos = await respuesta.json();
        productos = datos; 
        console.log("Productos cargados exitosamente:", productos);
    } catch (error) {
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

// LÓGICA DE PÁGINA DE INICIO (OFERTAS)

function renderizarOfertasDestacadas() {
    const contenedorOfertas = document.getElementById('ofertas-destacadas');
    const productosOferta = productos.filter(p => p.precio < 400); 

    contenedorOfertas.innerHTML = ''; 

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

        const botonAgregar = tarjeta.querySelector('.btn-agregar');
        botonAgregar.addEventListener('click', () => agregarAlCarrito(producto.id));

        contenedorOfertas.appendChild(tarjeta);
    });
}

// FUNCIONES DE PERSISTENCIA

function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carritoNucleoDigital');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
}

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

    inputBusqueda.addEventListener('input', (e) => {
        const texto = e.target.value.toLowerCase();
        
        const productosFiltrados = productos.filter(p => 
            p.nombre.toLowerCase().includes(texto) || 
            p.categoria.toLowerCase().includes(texto)
        );
        
        renderizarProductos(productosFiltrados);
    });

    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', () => {
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

    const urlParams = new URLSearchParams(window.location.search);
    const categoriaUrl = urlParams.get('categoria');

    if (categoriaUrl) {
        const botonCorrespondiente = document.querySelector(`.btn-filtro[data-categoria="${categoriaUrl}"]`);
        if (botonCorrespondiente) {
            botonCorrespondiente.click();
        } else {
            const filtrados = productos.filter(p => p.categoria === categoriaUrl);
            renderizarProductos(filtrados);
        }
    } else {
        renderizarProductos(); 
    }
}

// 2. Agregar un producto al carrito de compras

function agregarAlCarrito(productoId) {
    const productoAñadir = productos.find(p => p.id === productoId);

    const itemEnCarrito = carrito.find(item => item.id === productoId);

    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...productoAñadir, cantidad: 1 });
    }

    guardarCarritoEnLocalStorage(); 
    actualizarContadorCarrito();
    mostrarNotificacion("¡Producto añadido al carrito!", "exito");
}

// 3. Actualizar el número de ítems mostrados en el encabezado.

function actualizarContadorCarrito() {
    const contadorCarrito = document.getElementById('contador-carrito');
    if (contadorCarrito) { 
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
        contadorCarrito.textContent = totalItems;
    }
}

const contenedorItems = document.getElementById('contenedor-items-carrito');
const mensajeVacio = document.getElementById('carrito-vacio-mensaje');
const subtotalElemento = document.getElementById('subtotal-carrito');
const totalElemento = document.getElementById('total-carrito');
const COSTO_ENVIO = 15.00; 

// 4. Dibuja el contenido del carrito en la página carrito.html.

function renderizarCarrito() {
    contenedorItems.innerHTML = ''; 

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

    document.querySelectorAll('.btn-cantidad').forEach(button => {
        button.addEventListener('click', manejarCantidad);
    });
    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', eliminarDelCarrito);
    });

    actualizarTotales();
}


// 5. Calcula y actualiza el subtotal, envío y total de la compra.

function actualizarTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    const costoFinalEnvio = subtotal > 0 ? COSTO_ENVIO : 0.00; 
    const total = subtotal + costoFinalEnvio;

    subtotalElemento.textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('costo-envio').textContent = `$${costoFinalEnvio.toFixed(2)}`;
    totalElemento.textContent = `$${total.toFixed(2)}`;

    const btnFinalizar = document.getElementById('btn-finalizar-compra');
    btnFinalizar.disabled = subtotal === 0;
    btnFinalizar.textContent = subtotal === 0 ? "Añade productos para pagar" : "Finalizar Compra";
}


// 6. Manejar el cambio de cantidad de un producto.

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
        eliminarItemPorId(id);
        return; 
    }
    
    guardarCarritoEnLocalStorage();
    renderizarCarrito(); 
    actualizarContadorCarrito();
}

// 7. Eliminar un producto del carrito.

function eliminarDelCarrito(event) {
    const id = parseInt(event.target.dataset.id);
    eliminarItemPorId(id);
    
    guardarCarritoEnLocalStorage();
    renderizarCarrito();
    actualizarContadorCarrito();
}

// 8. Función utilitaria para eliminar un ítem del array.

function eliminarItemPorId(id) {
    const indice = carrito.findIndex(i => i.id === id);
    if (indice !== -1) {
        carrito.splice(indice, 1);
        mostrarNotificacion("Producto eliminado del carrito.", "warning");
    }
}

// LÓGICA DE AUTENTICACIÓN

let usuarios = [];
const KEY_USUARIOS = 'nucleoDigitalUsuarios';
const KEY_SESION = 'nucleoDigitalSesion';

function cargarUsuarios() {
    const usuariosGuardados = localStorage.getItem(KEY_USUARIOS);
    if (usuariosGuardados) {
        usuarios = JSON.parse(usuariosGuardados);
    }
}

function manejarRegistro(event) {
    event.preventDefault(); 

    const nombre = document.getElementById('registro-nombre').value.trim();
    const email = document.getElementById('registro-email').value.trim();
    const password = document.getElementById('registro-password').value;
    const mensaje = document.getElementById('auth-mensaje');
    
    if (password.length < 6) {
        mostrarNotificacion("La contraseña es muy corta", "error");
        mensaje.style.color = 'red';
        return;
    }
    
    if (usuarios.some(u => u.email === email)) {
        mensaje.textContent = 'Este correo ya está registrado.';
        mensaje.style.color = 'red';
        return;
    }

    const nuevoUsuario = { nombre, email, password };
    usuarios.push(nuevoUsuario);
    localStorage.setItem(KEY_USUARIOS, JSON.stringify(usuarios));
    
    mostrarNotificacion("¡Registro exitoso!", "exito");
    mensaje.style.color = 'green';
    
    document.getElementById('form-registro').reset();
    
    setTimeout(() => {
        document.getElementById('tab-login').click();
        mensaje.textContent = '';
    }, 1500);
}

function manejarLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const mensaje = document.getElementById('auth-mensaje');

    const usuarioEncontrado = usuarios.find(u => u.email === email && u.password === password);

    if (usuarioEncontrado) {
        localStorage.setItem(KEY_SESION, JSON.stringify(usuarioEncontrado));
        
        mostrarNotificacion(`¡Bienvenido, ${usuarioEncontrado.nombre}!`, "exito");
        mensaje.style.color = '#007bff';
        
        setTimeout(() => {
            window.location.href = '../index.html'; 
        }, 1000);
    } else {
        mostrarNotificacion("Credenciales incorrectas", "error");
        mensaje.style.color = 'red';
    }
}

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

// LÓGICA DE DETALLE DE PRODUCTO

let productoActual = null; 

function renderizarDetalleProducto() {
    const contenedorDetalle = document.getElementById('contenedor-detalle-producto');
    
    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = parseInt(urlParams.get('id'));

    productoActual = productos.find(p => p.id === idProducto);

    if (!productoActual) {
        contenedorDetalle.innerHTML = '<h3>Producto no encontrado 😢</h3><a href="productos.html">Volver al catálogo</a>';
        return;
    }

    let opcionesHTML = '';
    
    if (productoActual.opciones && productoActual.opciones.length > 0) {
        
        productoActual.opciones.forEach((opcion, index) => {
            let valoresHTML = '';
            opcion.valores.forEach((valor, vIndex) => {
                const precioExtraTexto = valor.precio > 0 ? `(+$${valor.precio.toFixed(2)})` : '';
                valoresHTML += `<option value="${valor.precio}" data-nombre="${valor.nombre}">${valor.nombre} ${precioExtraTexto}</option>`;
            });

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

function actualizarPrecioDetalle() {
    let costoExtraTotal = 0;
    
    const selectores = document.querySelectorAll('.selector-dinamico');
    
    selectores.forEach(select => {
        costoExtraTotal += parseFloat(select.value);
    });

    const precioTotal = productoActual.precio + costoExtraTotal;
    document.getElementById('precio-detalle').textContent = `$${precioTotal.toFixed(2)}`;
}

function agregarDesdeDetalle() {
    let costoExtraTotal = 0;
    let descripcionVariantes = []; 

    const selectores = document.querySelectorAll('.selector-dinamico');
    
    selectores.forEach(select => {
        const precio = parseFloat(select.value);
        const opcionNombre = select.options[select.selectedIndex].dataset.nombre; 
        const tituloOpcion = select.dataset.titulo;

        costoExtraTotal += precio;
        
        descripcionVariantes.push(`${tituloOpcion}: ${opcionNombre}`);
    });

    let nombreFinal = productoActual.nombre;
    if (descripcionVariantes.length > 0) {
        nombreFinal += ` (${descripcionVariantes.join(', ')})`;
    }

    const itemParaCarrito = {
        ...productoActual,
        id: productoActual.id + "-" + descripcionVariantes.join('-').replace(/\s+/g, ''), 
        precio: productoActual.precio + costoExtraTotal,
        nombre: nombreFinal,
        cantidad: 1
    };

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

// LÓGICA DE PERFIL Y CHECKOUT

const KEY_PEDIDOS = 'nucleoDigitalPedidos';

function finalizarCompra() {
    const sesionActiva = JSON.parse(localStorage.getItem(KEY_SESION));
    
    if (!sesionActiva) {
        mostrarNotificacion("Debes iniciar sesión para comprar.", "error");
        setTimeout(() => {
            window.location.href = "loginRegistro.html";
        }, 2000);
        return;
    }

    if (carrito.length === 0) return;

    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const total = subtotal + 15; 

    const nuevoPedido = {
        id: Date.now(), 
        fecha: new Date().toLocaleDateString(),
        usuarioEmail: sesionActiva.email, 
        items: [...carrito], 
        total: total
    };

    let historialPedidos = JSON.parse(localStorage.getItem(KEY_PEDIDOS)) || [];
    historialPedidos.push(nuevoPedido);
    localStorage.setItem(KEY_PEDIDOS, JSON.stringify(historialPedidos));

    carrito = [];
    guardarCarritoEnLocalStorage();
    
    mostrarNotificacion("¡Compra realizada con éxito!", "exito");
    
    setTimeout(() => {
        window.location.href = "perfil.html";
    }, 2000);
}

function renderizarPerfil() {
    const sesionActiva = JSON.parse(localStorage.getItem(KEY_SESION));

    if (!sesionActiva) {
        window.location.href = "loginRegistro.html";
        return;
    }

    document.getElementById('mensaje-bienvenida').textContent = `Hola, ${sesionActiva.nombre} 👋`;

    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem(KEY_SESION); 
        window.location.href = "../index.html"; 
    });

    const todosLosPedidos = JSON.parse(localStorage.getItem(KEY_PEDIDOS)) || [];
    const misPedidos = todosLosPedidos.filter(p => p.usuarioEmail === sesionActiva.email);
    const contenedorPedidos = document.getElementById('lista-pedidos');

    if (misPedidos.length === 0) {
        contenedorPedidos.innerHTML = '<p>Aún no has realizado ninguna compra.</p>';
        return;
    }

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
    cargarCarritoDesdeLocalStorage();
    await cargarProductos(); 

    if (document.getElementById('contenedor-productos')) {
         configurarFiltros();
    }
    
    if (document.getElementById('contenedor-items-carrito')) {
        renderizarCarrito();
        const btnFinalizar = document.getElementById('btn-finalizar-compra');
        if(btnFinalizar) {
            btnFinalizar.addEventListener('click', finalizarCompra);
        }
    }
    
    if (document.getElementById('contenedor-detalle-producto')) {
        renderizarDetalleProducto();
    }
    
    if (document.getElementById('contenedor-perfil')) {
        renderizarPerfil();
    }

    if (document.getElementById('contenedor-auth')) {
        cargarUsuarios(); 
        configurarTabs(); 
        
        document.getElementById('form-registro').addEventListener('submit', manejarRegistro);
        document.getElementById('form-login').addEventListener('submit', manejarLogin);
        
        document.getElementById('btn-google').addEventListener('click', () => {
            mostrarNotificacion("Función no disponible en este momento.", "info");
        });
    }

    if (document.getElementById('ofertas-destacadas')) {
        renderizarOfertasDestacadas();
    }

    const sesionActiva = JSON.parse(localStorage.getItem(KEY_SESION));
    const linkUsuario = document.getElementById('link-usuario'); 
    
    if (sesionActiva && linkUsuario) {
        linkUsuario.textContent = `👤 ${sesionActiva.nombre}`;
        
        const rutaPerfil = window.location.pathname.includes('/pages/') ? "perfil.html" : "./pages/perfil.html";
        linkUsuario.href = rutaPerfil;
    }

    actualizarContadorCarrito();
});