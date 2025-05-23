//################################## Parte 1 – Listado inicial y alta básica ##################################
const URL_API = "https://utnfra-api-pinturas.onrender.com/pinturas";
let pinturasGlobal = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarPinturas();
    document.getElementById("btnAgregar").addEventListener("click", agregarPintura);
    document.getElementById("btnModificar").addEventListener("click", modificarPintura);

    document.getElementById("btnFiltrarMarca").addEventListener("click", filtrarPinturasPorMarca);

    document.getElementById("btnPromedio").addEventListener("click", mostrarPrecioPromedio);

    document.getElementById("btnMostrarEstadisticas").addEventListener("click", () => {
        mostrarEstadisticas(pinturasGlobal);
    });

    document.getElementById('btnExportCSV').addEventListener('click', exportarCSV);
});
//1. Obtener y mostrar listado de pinturas
async function cargarPinturas() {
    mostrarSpinner();
    try {
        const response = await fetch(URL_API);
        if (!response.ok) {
            throw new Error(`Error al cargar pinturas. Status: ${response.status}`);
        }
        const data = await response.json();
        pinturasGlobal = data;          // Guardás TODAS las pinturas en pinturasGlobal
        renderizarTabla(pinturasGlobal); // Mostrás todo al inicio
    } catch (error) {
        console.error("Error al cargar pinturas:", error);
        mostrarError("No se pudieron cargar las pinturas.");
    } finally {
        ocultarSpinner();
    }
}



//2. Renderizar tabla
function renderizarTabla(pinturas) {
    let html = `
    <table class="table table-striped table-bordered">
        <thead class="table-dark">
            <tr>
                <th>ID</th><th>MARCA</th><th>PRECIO</th><th>COLOR</th><th>CANTIDAD</th><th>ACCIONES</th>
            </tr>
        </thead>
        <tbody>`;

    pinturas.forEach(p => {
        html += `
        <tr>
            <td>${p.id}</td>
            <td>${p.marca}</td>
            <td>${p.precio}</td>
            <td><input type="color" value="${p.color}" disabled></td>
            <td>${p.cantidad}</td>
            <td>
                <button class="btn btn-sm btn-success me-2" onclick="seleccionarPintura(${p.id})">
                    <i class="bi bi-pencil-square"></i>
                </button>

                <button class="btn btn-sm btn-danger" onclick="eliminarPintura(${p.id})">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    document.getElementById("divListado").innerHTML = html;
}

//3.Agregar nueva pintura (POST) - corregido con console.log para debug y control mejorado
async function agregarPintura() {
    // Opcional: preventDefault si fuera evento submit, pero acá es button click
    // Obtener valores
    const marca = document.getElementById("inputMarca").value.trim();
    const precio = parseFloat(document.getElementById("inputPrecio").value);
    const color = document.getElementById("inputColor").value;
    const cantidad = parseInt(document.getElementById("inputCantidad").value);

    // Validar campos básicos
    if (!validarFormulario()) return;

    const nuevaPintura = { marca, precio, color, cantidad };

    try {
        const res = await fetch("https://utnfra-api-pinturas.onrender.com/pinturas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaPintura),
        });

        console.log("Status:", res.status);

        if (!res.ok) {
            const textoError = await res.text();
            throw new Error(`Error: ${res.status} - ${textoError}`);
        }

        const data = await res.json();
        console.log("Pintura agregada:", data);

        alert("Pintura agregada correctamente.");

        // Limpiar form
        document.getElementById("frmFormulario").reset();

        // Recargar listado
        cargarPinturas();

    } catch (error) {
        console.error(error);
        alert("Error al agregar pintura: " + error.message);
    }
}



//################################## Parte 2 – Acciones de selección, modificación y eliminación ##################################
function seleccionarPintura(id) {
    // Convertir el id recibido a string para evitar problemas de tipo
    const idStr = String(id);
    document.getElementById("btnModificar").disabled = false;
    // Buscar la pintura comparando el id convertido a string
    const p = pinturasGlobal.find(pintura => String(pintura.id) === idStr);

    if (!p) {
        mostrarMensaje("No se encontró la pintura seleccionada.", "danger");
        return;
    }

    // Limpiar formulario y validaciones antes de cargar nueva pintura
    document.getElementById("frmFormulario").reset();
    limpiarValidaciones();

    // Cargar datos de pintura en el formulario
    document.getElementById("inputID").value = p.id ?? "";
    document.getElementById("inputMarca").value = p.marca ?? "";
    document.getElementById("inputPrecio").value = p.precio ?? "";
    document.getElementById("inputColor").value = p.color ?? "#000000";
    document.getElementById("inputCantidad").value = p.cantidad ?? "";
}
window.seleccionarPintura = seleccionarPintura;

async function eliminarPintura(id) {
    console.log("Intentando eliminar pintura con id:", id);

    if (!id) {
        alert("ID inválido para eliminar.");
        return;
    }

    if (!confirm("¿Estás seguro que querés eliminar esta pintura?")) {
        console.log("Eliminación cancelada por el usuario.");
        return;
    }

    mostrarSpinner();

    try {
        const res = await fetch(`${URL_API}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("Respuesta DELETE status:", res.status);

        let respuestaTexto;
        try {
            respuestaTexto = await res.text();
            console.log("Respuesta textual del DELETE:", respuestaTexto);
        } catch (e) {
            console.warn("No se pudo obtener texto de la respuesta");
        }

        if (!res.ok) {
            throw new Error(`Error al eliminar pintura. Status: ${res.status} - ${respuestaTexto || ''}`);
        }

        // Luego de borrar, para estar seguros cargamos el listado y verificamos que ya no exista la pintura
        await cargarPinturas();

        const existe = pinturasGlobal.some(p => p.id == id);
        if (existe) {
            mostrarError("La pintura NO fue eliminada realmente.");
            console.error("La pintura sigue existiendo en el listado después del DELETE");
        } else {
            mostrarMensaje("Pintura eliminada correctamente.", "success");
            console.log("Pintura eliminada y confirmada.");
        }

    } catch (error) {
        console.error("Error al eliminar pintura:", error);
        mostrarError("No se pudo eliminar la pintura: " + error.message);
    } finally {
        ocultarSpinner();
    }
}
window.eliminarPintura = eliminarPintura;








async function modificarPintura() {
    const id = document.getElementById("inputID").value;
    if (!id) {
        mostrarMensaje("Seleccioná una pintura para modificar.", "warning");
        return;
    }

    if (!validarFormulario()) return;

    const pintura = obtenerDatosFormulario();

    mostrarSpinner();

    try {
        const res = await fetch(`${URL_API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pintura)
        });

        if (!res.ok) {
            const textoError = await res.text();
            throw new Error(`Error al modificar pintura: ${res.status} - ${textoError}`);
        }

        mostrarMensaje("Pintura modificada con éxito.", "success");

        // Limpiar formulario (incluye inputID si está dentro)
        document.getElementById("frmFormulario").reset();

        // Limpiar validaciones
        limpiarValidaciones();

        // Deshabilitar botón modificar
        document.getElementById("btnModificar").disabled = true;

        // Actualizar la lista sin recargar página
        await cargarPinturas();

    } catch (error) {
        mostrarMensaje(error.message || "Error desconocido", "danger");
    } finally {
        ocultarSpinner();
    }
}





//################################## Parte 3 – Validaciones con Bootstrap y JS ##################################
function validarFormulario() {
    // Obtener formulario y campos
    const form = document.getElementById("frmFormulario");
    const inputMarca = document.getElementById("inputMarca");
    const inputPrecio = document.getElementById("inputPrecio");
    const inputColor = document.getElementById("inputColor");
    const inputCantidad = document.getElementById("inputCantidad");

    const inputs = [inputMarca, inputPrecio, inputColor, inputCantidad];

    // Limpiar validaciones previas y ocultar mensajes
    inputs.forEach(input => {
    input.classList.remove("is-invalid", "is-valid");
    const sibling = input.nextElementSibling;
    if (sibling && sibling.classList.contains("invalid-feedback")) {
        sibling.textContent = "";
        sibling.style.display = "none";
    }
});

    let valido = true;

    // Validar Marca (obligatorio)
    if (!inputMarca.value.trim()) {
        marcarError(inputMarca, "La marca es obligatoria.");
        valido = false;
    } else {
        marcarExito(inputMarca);
    }

    // Validar Precio (obligatorio, entre 50 y 500)
    const precio = Number(inputPrecio.value);
    if (!inputPrecio.value || precio < 50 || precio > 500) {
        marcarError(inputPrecio, "El precio debe estar entre 50 y 500.");
        valido = false;
    } else {
        marcarExito(inputPrecio);
    }

    // Validar Color (obligatorio)
    if (!inputColor.value) {
        marcarError(inputColor, "El color es obligatorio.");
        valido = false;
    } else {
        marcarExito(inputColor);
    }

    // Validar Cantidad (obligatorio, entre 1 y 400)
    const cantidad = Number(inputCantidad.value);
    if (!inputCantidad.value || cantidad < 1 || cantidad > 400) {
        marcarError(inputCantidad, "La cantidad debe estar entre 1 y 400.");
        valido = false;
    } else {
        marcarExito(inputCantidad);
    }

    return valido;
}
function marcarError(input, mensaje) {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");

    const feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains("invalid-feedback")) {
        feedback.textContent = mensaje;
        feedback.style.display = "block";  // Mostrar mensaje
    }
}

function marcarExito(input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");

    const feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains("invalid-feedback")) {
        feedback.textContent = "";
        feedback.style.display = "none";  // Ocultar mensaje
    }
}
function limpiarValidaciones() {
    const inputs = [
        document.getElementById("inputMarca"),
        document.getElementById("inputPrecio"),
        document.getElementById("inputColor"),
        document.getElementById("inputCantidad"),
        document.getElementById("inputID") // si usás este input para la ID
    ];

    inputs.forEach(input => {
        input.classList.remove("is-valid", "is-invalid");
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains("invalid-feedback")) {
            feedback.textContent = "";
            feedback.style.display = "none";
        }
    });
}
//################################## Parte 4 – UX mejorado y filtros ##################################
function filtrarPinturasPorMarca() {
    const inputFiltro = document.getElementById("inputFiltroMarca");
    const filtro = inputFiltro.value.trim().toLowerCase();

    if (filtro === "") {
        // Si no se ingresó nada, mostrar todas las pinturas
        renderizarTabla(pinturasGlobal);
        mostrarMensaje("Mostrando todas las pinturas.", "info");
        return;
    }

    const filtradas = pinturasGlobal.filter(p => 
        typeof p.marca === "string" && 
        p.marca.trim().toLowerCase() === filtro
    );

    console.log("Filtro aplicado:", filtro);
    console.log("Coincidencias encontradas:", filtradas.length);

    if (filtradas.length === 0) {
        mostrarMensaje("No se encontraron pinturas con esa marca.", "info");
        renderizarTabla([]); // tabla vacía si no hay coincidencias
        return;
    }

    renderizarTabla(filtradas);
}





function mostrarPrecioPromedio() {
    if (!Array.isArray(pinturasGlobal) || pinturasGlobal.length === 0) {
        alert("No hay pinturas para calcular el promedio.");
        return;
    }

    // Convertimos cada precio a Number en caso de que venga como string.
    const precios = pinturasGlobal
        .map(p => Number(p.precio))
        .filter(n => !isNaN(n));   // descartamos valores que no se conviertan a número

    if (precios.length === 0) {
        alert("No hay precios válidos para calcular el promedio.");
        return;
    }

    const suma = precios.reduce((acc, curr) => acc + curr, 0);
    const promedio = suma / precios.length;

    alert(`El precio promedio de las pinturas es: $${promedio.toFixed(2)}`);
}
//################################## Parte 6 – Funcionalidades estadísticas y exportación ##################################
//1. Agregar botón: Mostrar estadísticas (nuevo div o modal que muestre):
function mostrarEstadisticas() {
  if (!pinturasGlobal || pinturasGlobal.length === 0) {
    alert("No hay pinturas cargadas para mostrar estadísticas.");
    return;
  }

  const totalPinturas = pinturasGlobal.length;

  // Contar marcas
  const marcasCount = {};
  pinturasGlobal.forEach(p => {
    const marca = (typeof p.marca === "string" && p.marca.trim() !== "") ? p.marca.trim() : "Sin Marca";
    marcasCount[marca] = (marcasCount[marca] || 0) + 1;
  });

  // Marca más común
  let marcaMasComun = "";
  let maxCount = 0;
  for (const marca in marcasCount) {
    if (marcasCount[marca] > maxCount) {
      maxCount = marcasCount[marca];
      marcaMasComun = marca;
    }
  }

  // Pintura con mayor precio - Ignorar precios inválidos
  let pinturaMayorPrecio = null;
  pinturasGlobal.forEach(p => {
    let precioNum = Number(p.precio);
    if (p.precio !== undefined && !isNaN(precioNum)) {
      if (!pinturaMayorPrecio || precioNum > Number(pinturaMayorPrecio.precio)) {
        pinturaMayorPrecio = p;
      }
    }
  });

  // Precio promedio general - solo válidos
  let sumaPrecios = 0;
  let cantPreciosValidos = 0;
  pinturasGlobal.forEach(p => {
    let precioNum = Number(p.precio);
    if (p.precio !== undefined && !isNaN(precioNum)) {
      sumaPrecios += precioNum;
      cantPreciosValidos++;
    }
  });
  const promedioGeneral = cantPreciosValidos > 0 ? (sumaPrecios / cantPreciosValidos).toFixed(2) : "0.00";

  // Precio promedio por marca
  const preciosPorMarca = {};
  pinturasGlobal.forEach(p => {
    const marca = (typeof p.marca === "string" && p.marca.trim() !== "") ? p.marca.trim() : "Sin Marca";
    let precioNum = Number(p.precio);
    if (p.precio !== undefined && !isNaN(precioNum)) {
      if (!preciosPorMarca[marca]) {
        preciosPorMarca[marca] = [];
      }
      preciosPorMarca[marca].push(precioNum);
    }
  });

  // Ordenar marcas alfabéticamente
  const marcasOrdenadas = Object.keys(preciosPorMarca).sort((a, b) => a.localeCompare(b));

  let promedioPorMarcaHTML = "";
  marcasOrdenadas.forEach(marca => {
    const precios = preciosPorMarca[marca];
    const suma = precios.reduce((a, b) => a + b, 0);
    const promedio = (suma / precios.length).toFixed(2);
    promedioPorMarcaHTML += `<li><strong>${marca}</strong>: $${promedio}</li>`;
  });

  // Mostrar resultados
  const divEstadisticas = document.getElementById("divEstadisticas");
  if (divEstadisticas) {
    divEstadisticas.style.display = "block";
    divEstadisticas.innerHTML = `
      <style>
        #divEstadisticas ul {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ccc;
          padding: 10px;
          list-style-type: none;
          margin: 0;
        }
        #divEstadisticas ul li {
          padding: 4px 0;
          border-bottom: 1px solid #eee;
        }
        #divEstadisticas ul li:last-child {
          border-bottom: none;
        }
      </style>

      <p><strong>Total de pinturas cargadas:</strong> ${totalPinturas}</p>
      <p><strong>Marca más común:</strong> ${marcaMasComun}</p>
      <p><strong>Pintura con mayor precio:</strong> ${
        pinturaMayorPrecio ? `${pinturaMayorPrecio.marca} - $${Number(pinturaMayorPrecio.precio).toFixed(2)}` : "No disponible"
      }</p>
      <p><strong>Precio promedio general:</strong> $${promedioGeneral}</p>
      <p><strong>Precio promedio por marca:</strong></p>
      <ul>${promedioPorMarcaHTML}</ul>
    `;
  }
}


function exportarCSV() {
    if (!pinturasGlobal || pinturasGlobal.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // Encabezados CSV
    const encabezados = ["ID", "Marca", "Precio", "Color", "Cantidad"];
    const filas = pinturasGlobal.map(p => [
        p.id,
        p.marca,
        p.precio,
        p.color,
        p.cantidad
    ]);

    // Construir CSV como string
    let csvContent = encabezados.join(",") + "\n";
    filas.forEach(fila => {
        // Escapar comas y caracteres especiales en strings, y envolver en comillas dobles si es necesario
        const filaEscapada = fila.map(celda => {
            if (typeof celda === "string" && (celda.includes(",") || celda.includes('"'))) {
                return `"${celda.replace(/"/g, '""')}"`; // Reemplaza " por ""
            }
            return celda;
        });
        csvContent += filaEscapada.join(",") + "\n";
    });

    // Crear Blob y descargar archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pinturas_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}



/////////////////////////////////////////////////7
document.addEventListener("DOMContentLoaded", () => {
  const btnToggle = document.getElementById("theme-toggle");
  const body = document.body;
  const icon = btnToggle.querySelector("i");
  
  // Cargar preferencia guardada
  const modoGuardado = localStorage.getItem("modoOscuro");
  if (modoGuardado === "true") {
    body.classList.add("dark-mode");
    icon.classList.replace("bi-moon-fill", "bi-sun-fill");
    btnToggle.innerHTML = '<i class="bi bi-sun-fill"></i> Modo Claro';
  }
  
  btnToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const modoActivo = body.classList.contains("dark-mode");
    
    if (modoActivo) {
      icon.classList.replace("bi-moon-fill", "bi-sun-fill");
      btnToggle.innerHTML = '<i class="bi bi-sun-fill"></i> Modo Claro';
    } else {
      icon.classList.replace("bi-sun-fill", "bi-moon-fill");
      btnToggle.innerHTML = '<i class="bi bi-moon-fill"></i> Modo Oscuro';
    }
    
    // Guardar preferencia
    localStorage.setItem("modoOscuro", modoActivo);
  });
});


















































//OBTENER DATOS
function obtenerDatosFormulario() {
    return {
        marca: document.getElementById("inputMarca").value.trim(),
        precio: parseFloat(document.getElementById("inputPrecio").value),
        color: document.getElementById("inputColor").value,
        cantidad: parseInt(document.getElementById("inputCantidad").value)
    };
}
function mostrarSpinner() {
    document.getElementById("spinner").style.display = "block";
}

function ocultarSpinner() {
    document.getElementById("spinner").style.display = "none";
}
