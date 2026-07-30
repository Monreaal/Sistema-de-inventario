import { db } from "./db.js";
import { cargarProductos } from "./products.js";

const menuFlotante = document.getElementById("menu-flotante");
const menuTitulo = document.getElementById("menu-titulo");
let productoActivoId = null; // guarda el id del producto que abrió el menú

// ---------- ABRIR MENÚ ----------
export function abrirMenu(e, producto) {
  e.stopPropagation(); // Evita que el clic se propague y cierre el menú inmediatamente

  // Posicionar el menú flotante en la posición del clic
  // menuFlotante.style.left = `${e.clientX}px`;
  // menuFlotante.style.top = `${e.clientY}px`;
  
  productoActivoId = producto.id;
 // Cargar los datos del producto en el menú flotante
  menuTitulo.textContent = producto.product; // <-- aquí cargas el nombre
  menuFlotante.querySelector("#input-editar-nombre").value = producto.product;
  menuFlotante.querySelector("#input-editar-marca").value = producto.brand;
  menuFlotante.querySelector("#input-editar-precio").value = producto.price;
  menuFlotante.querySelector("#input-editar-cantidad").value = producto.stock;
  menuFlotante.querySelector("#input-editar-status").value = producto.status;

  menuFlotante.classList.remove("oculto"); // Mostrar el menú flotante
}
// ---------- CERRAR MENÚ ----------
export function cerrarMenu() {
  menuFlotante.classList.add("oculto");
}

// ---------- GUARDAR CAMBIOS (se registra UNA sola vez) ----------
document.getElementById("form-editar-producto").addEventListener("submit", async (e) => {
  e.preventDefault();

  const producto = document.getElementById("input-editar-nombre").value.trim();
  const marca = document.getElementById("input-editar-marca").value.trim();
  const precio = Number(document.getElementById("input-editar-precio").value);
  const cantidad = parseInt(document.getElementById("input-editar-cantidad").value);

  if (!producto) return;

  const { error } = await db.from("inventory").update({
    product: producto,
    brand: marca,
    price: precio,
    stock: cantidad
  }).eq("id", productoActivoId);

  if (error) {
    console.error("Error editando producto:", error);
    return;
  }

  cargarProductos();
  cerrarMenu();
});

// ---------- BOTÓN CERRAR ----------
document.getElementById("btn-cerrar-menu").addEventListener("click", cerrarMenu);