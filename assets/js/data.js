// Simulación de la base de datos de productos

class Producto {
    constructor(id, nombre, categoria, precio, descripcionCorta, imagen) {
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.descripcionCorta = descripcionCorta;
        this.imagen = imagen;
    }
}

const productos = [
    new Producto(
        1, 
        "Tarjeta Gráfica RTX 4070", 
        "GPU", 
        650.99, 
        "Rendimiento de gama alta para 1440p.", 
        "Tarjeta Gráfica RTX 4070.png"
    ),
    new Producto(
        2, 
        "Procesador AMD Ryzen 7 7700X", 
        "CPU", 
        359.50, 
        "8 núcleos potentes para gaming y creación.", 
        "Procesador AMD Ryzen 7 7700X.jpg"
    ),
    new Producto(
        3, 
        "Memoria RAM DDR5 32GB (2x16GB)", 
        "RAM", 
        125.00, 
        "Velocidad de 6000MHz para alto rendimiento.", 
        "Memoria RAM DDR5 32GB (2x16GB).png"
    ),
    new Producto(
        4, 
        "Gabinete Mid Tower Premium", 
        "Gabinete", 
        95.75, 
        "Excelente flujo de aire y panel lateral de vidrio.", 
        "Gabinete Mid Tower Premium.png"
    )
];

// Simulamos el carrito 
let carrito = [];