// Simulación de la base de datos de productos

class Producto {
    // Agregamos 'opciones' al constructor (por defecto es un array vacío)
    constructor(id, nombre, categoria, precio, descripcionCorta, imagen, opciones = []) {
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.descripcionCorta = descripcionCorta;
        this.imagen = imagen;
        this.opciones = opciones; // Guardamos las opciones aquí
    }
}

const productos = [
    new Producto(
        1, 
        "Tarjeta Gráfica RTX 4070", 
        "GPU", 
        650.99, 
        "Rendimiento de gama alta para 1440p.", 
        "Tarjeta Gráfica RTX 4070.png",
        // Opción exclusiva para la GPU
        [
            {
                titulo: "Garantía Extendida",
                valores: [
                    { nombre: "Estándar (1 año)", precio: 0 },
                    { nombre: "Extendida (+1 año)", precio: 45.00 },
                    { nombre: "Premium (+3 años)", precio: 80.00 }
                ]
            }
        ]
    ),
    new Producto(
        2, 
        "Procesador AMD Ryzen 7 7700X", 
        "CPU", 
        359.50, 
        "8 núcleos potentes para gaming y creación.", 
        "Procesador AMD Ryzen 7 7700X.jpg",
        // El CPU no tiene opciones extra (array vacío implícito o explícito)
        [] 
    ),
    new Producto(
        3, 
        "Memoria RAM DDR5 32GB (2x16GB)", 
        "RAM", 
        125.00, 
        "Velocidad de 6000MHz para alto rendimiento.", 
        "Memoria RAM DDR5 32GB (2x16GB).png",
        // Opción estética para la RAM
        [
            {
                titulo: "Color del Disipador",
                valores: [
                    { nombre: "Negro Clásico", precio: 0 },
                    { nombre: "Blanco Artic", precio: 10.00 },
                    { nombre: "Edición RGB", precio: 15.00 }
                ]
            }
        ]
    ),
    new Producto(
        4, 
        "Gabinete Mid Tower Premium", 
        "Gabinete", 
        95.75, 
        "Excelente flujo de aire y panel lateral de vidrio.", 
        "Gabinete Mid Tower Premium.png",
        // Opción de refrigeración para el Gabinete
        [
            {
                titulo: "Ventiladores Adicionales",
                valores: [
                    { nombre: "Solo Gabinete", precio: 0 },
                    { nombre: "Kit 3 Fans RGB", precio: 35.00 },
                    { nombre: "Kit 6 Fans RGB + Controladora", precio: 60.00 }
                ]
            }
        ]
    )
];

// Simulamos el carrito 
let carrito = [];