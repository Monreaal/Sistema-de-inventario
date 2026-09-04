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
    <div>Imagen: ${producto.image_url ? `<img src="${producto.image_url}" alt="${producto.product}" width="100">` : `${producto.product}`}</div>
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
  
  // 1. Obtener el archivo de imagen del input de tipo file
  const file = document.getElementById("imagen-producto").files[0]; // Obtener el archivo de imagen
  let imageUrl = null; // Inicializamos la variable para almacenar la URL de la imagen

  // 2. Si se seleccionó una imagen, la subimos a Supabase Storage
  if (file) {
    // Generamos un nombre único para evitar sobrescribir archivos con el mismo nombre
    const fileExt = file.name.split('.').pop(); // Obtener la extensión del archivo
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`; // Generar un nombre único usando timestamp y un string aleatorio
    const filePath = `items/${fileName}`; // Ruta dentro del bucket donde se guardará la imagen, obtiene la carpeta "items" y el nombre del archivo generado

    // Subir el archivo al bucket "productos"
    const { data: uploadData, error: uploadError } = await db.storage
      .from('productos') // Nombre de tu bucket
      .upload(filePath, file); // filePath es la ruta donde se guardará el archivo y file es el archivo que queremos subir

    if (uploadError) {
      console.error("Error al subir la imagen:", uploadError.message);
      alert("Error al subir la imagen");
      return;
    }

    // Obtener la URL pública del archivo subido, publicUrlData.publicUrl es la URL pública del archivo subido, que se puede usar para mostrar la imagen en la aplicación
    const { data: publicUrlData } = db.storage 
      .from('productos')
      .getPublicUrl(filePath);

    imageUrl = publicUrlData.publicUrl;
  }

  if (!producto) return;
  const { error } = await db.from("inventory").insert({
    product: producto,
    brand: marca,
    price: precio,
    stock: cantidad,
    image_url: imageUrl, // Guardar la URL de la imagen en la base de datos
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