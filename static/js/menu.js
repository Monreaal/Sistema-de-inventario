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
  // Limpiar el campo de archivo por si tenía una selección previa
  menuFlotante.querySelector("#imagen-editar").value = ""; 
  // Mostrar la previsualización de la imagen del produto
  menuFlotante.querySelector("#imagen-editar-preview").innerHTML = producto.image_url ? `<img src="${producto.image_url}" alt="${producto.product}" width="100">` : `<p>Sin imagen asignada</p>`;
  
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

  // 1. Obtener el archivo de imagen del input de tipo file
  const file = document.getElementById("imagen-editar").files[0]; // Obtener el archivo de imagen
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

  const { error } = await db.from("inventory").update({
    product: producto,
    brand: marca,
    price: precio,
    stock: cantidad,
    image_url: imageUrl
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