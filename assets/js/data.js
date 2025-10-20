// --- data.js (Simulación de la base de datos de productos) ---

const productos = [
    {
        id: 1,
        nombre: "Tarjeta Gráfica RTX 4070",
        categoria: "GPU",
        precio: 650.99,
        descripcionCorta: "Rendimiento de gama alta para 1440p.",
        imagen: "gpu-rtx4070.jpg" // Nombre de archivo simulado
    },
    {
        id: 2,
        nombre: "Procesador AMD Ryzen 7 7700X",
        categoria: "CPU",
        precio: 359.50,
        descripcionCorta: "8 núcleos potentes para gaming y creación.",
        imagen: "cpu-r77700x.jpg"
    },
    {
        id: 3,
        nombre: "Memoria RAM DDR5 32GB (2x16GB)",
        categoria: "RAM",
        precio: 125.00,
        descripcionCorta: "Velocidad de 6000MHz para alto rendimiento.",
        imagen: "ram-ddr5-32gb.jpg"
    },
    {
        id: 4,
        nombre: "Gabinete Mid Tower Premium",
        categoria: "Gabinete",
        precio: 95.75,
        descripcionCorta: "Excelente flujo de aire y panel lateral de vidrio.",
        imagen: "gabinete-mt.jpg"
    }
];

// Simulamos también el carrito de compras, vacío al inicio
let carrito = [];