import { db } from "./db.js";
import { abrirMenu } from "./menu.js";
console.log("products.js cargado correctamente");
// ---------- CARGAR PRODUCTOS ----------
export async function cargarProductos() {
  const { data, error } = await db
    .from("inventory")
    .select("*")
    .order("brand", { ascending: true });

  console.log("Productos cargados:", data); // <-- aquí puedes ver los productos en la consola
  
  if (error) {
    console.error("Error cargando productos:", error);
    return;
  }

  // Limpiar columnas
  document.getElementById("col-available").innerHTML = "";
  document.getElementById("col-out-of-stock").innerHTML = "";

  // Pintar cada producto en su columna
  data.forEach(renderTarjeta);
}

// ---------- RENDER DE UNA TARJETA ----------
export function renderTarjeta(producto) {
  const contenedor = document.getElementById(`col-${producto.status}`);
  
  const div = document.createElement("div");
  div.className = "tarjeta";
  div.innerHTML = ` 
    <div>Producto: ${producto.product}</div>
    <div>Marca: ${producto.brand}</div>
    <div>Precio: ${producto.price}</div>
    <div>Cantidad: ${producto.stock}</div>
    <div>Status: ${producto.status}</div>
    <button data-accion="borrar">🗑</button>
    <button data-accion="aumentar">➕</button>
    <button data-accion="disminuir">➖</button>
  `;

  div.querySelector('[data-accion="borrar"]').onclick = () => borrarProducto(producto.id);
  div.querySelector('[data-accion="aumentar"]').onclick = () => aumentarCantidad(producto.id);
  div.querySelector('[data-accion="disminuir"]').onclick = () => disminuirCantidad(producto.id);

  // Un solo listener: abre el menú flotante, pero ignora los clics en los botones existentes
  div.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") return;
    abrirMenu(e, producto);
  });

  contenedor.appendChild(div); // no olvides esta línea al final
}

// ---------- AGREGAR PRODUCTO ----------
document.getElementById("form-nuevo-producto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const producto = document.getElementById("input-nombre").value.trim();
  const marca = document.getElementById("input-marca").value.trim();
  const precio = Number(document.getElementById("input-precio").value);
  const cantidad = parseInt(document.getElementById("input-cantidad").value);

  if (!producto) return;
  const { error } = await db.from("inventory").insert({
    product: producto,
    brand: marca,
    price: precio,
    stock: cantidad
  });

  if (error) {
    console.error("Error agregando producto:", error);
    return;
  }

  e.target.reset(); // Limpiar el formulario
  cargarProductos();
});


// ---------- BORRAR PRODUCTO ----------
export async function borrarProducto(id) {
  const { error } = await db.from("inventory").delete().eq("id", id);

  if (error) {
    console.error("Error borrando producto:", error);
    return;
  }

  cargarProductos();
}

// ---------- AUMENTAR CANTIDAD ----------
export async function aumentarCantidad(id) {
  // 1. Obtener el stock actual del producto, se tiene que hacer un select para obtener el stock del producto con el id que le pasamos como parámetro
  const { data: producto, error: fetchError } = await db
    .from("inventory")
    .select("stock")
    //eq("id", id) se usa para filtrar el producto por su id, es decir, buscar el producto que tenga el id que le pasamos como parámetro
    .eq("id", id)
// single() se usa para obtener un solo registro en lugar de un array de registros, osea quitar 1 en vez de el array completo
    .single();

  if (fetchError) {
    console.error("Error obteniendo producto:", fetchError);
    return;
  }
    
  const { error } = await db.from("inventory").update({ stock: producto.stock + 1 }).eq("id", id);

  if (error) {
    console.error("Error aumentando cantidad del producto:", error);
    return;
  }

  cargarProductos();
}

// ---------- DISMINUIR CANTIDAD ----------
export async function disminuirCantidad(id) {
  // 1. Obtener el stock actual del producto, se tiene que hacer un select para obtener el stock del producto con el id que le pasamos como parámetro
  const { data: producto, error: fetchError } = await db
    .from("inventory")
    .select("stock")
    //eq("id", id) se usa para filtrar el producto por su id, es decir, buscar el producto que tenga el id que le pasamos como parámetro
    .eq("id", id)
// single() se usa para obtener un solo registro en lugar de un array de registros, osea quitar 1 en vez de el array completo
    .single();

  if (fetchError) {
    console.error("Error obteniendo producto:", fetchError);
    return;
  }
    
  const { error } = await db.from("inventory").update({ stock: producto.stock - 1 }).eq("id", id);

  if (error) {
    console.error("Error disminuyendo cantidad del producto:", error);
    return;
  }

  cargarProductos();
}