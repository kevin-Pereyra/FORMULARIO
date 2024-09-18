// URL del archivo CSV en GitHub
const dataUrl = 'https://raw.githubusercontent.com/kevin-Pereyra/FORMULARIO/main/BD.csv';

// Función para obtener y procesar los datos del archivo CSV
async function getData() {
  try {
    const response = await fetch(dataUrl);
    const csvData = await response.text();
    // Procesar el CSV para convertirlo en un array de objetos
    const data = csvToArray(csvData);
    return data;
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}
// Función para convertir CSV en un array de objetos
function csvToArray(csv) {
  const lines = csv.split('\n');
  const result = [];
  const headers = lines[0].split(',').map(header => header.trim()); // Asegurarse de que no haya espacios en blanco

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      if (currentLine[j] !== undefined) {
        // Convertir fotocheck a número y los demás campos a texto
        if (headers[j] === "FOTOCHECK") {
          obj[headers[j]] = currentLine[j] ? parseInt(currentLine[j].trim(), 10) : null; // Convertir a número
        } else {
          obj[headers[j]] = currentLine[j] ? currentLine[j].trim() : ''; // Mantener los valores como texto
        }
      }
    }
    result.push(obj);
  }
  return result;
}
// Función para buscar el fotocheck y rellenar los campos
async function searchFotocheck(fotocheckInput) {
  const data = await getData();
  const fotocheckNumber = parseInt(fotocheckInput.trim(), 10); // Convertir input a número
  const result = data.find(item => item.FOTOCHECK === fotocheckNumber);
  if (result) {
    // Si se encuentra el fotocheck, rellenar los campos
    document.getElementById("nombre").value = result.NOMBRE;
    document.getElementById("area").value = result.AREA;
    document.getElementById("empresa").value = result.EMPRESA;
  } else {
    // Si no se encuentra, limpiar los campos
    document.getElementById("nombre").value = '';
    document.getElementById("area").value = '';
    document.getElementById("empresa").value = '';
  }
}
// Evento que se dispara cuando se ingresa un fotocheck
document.getElementById("fotocheck").addEventListener("input", function() {
  const fotocheckInput = this.value;
  if (fotocheckInput.length > 1) {
    searchFotocheck(fotocheckInput);
  } else {
    // Limpiar los campos si el fotocheck está vacío
    document.getElementById("nombre").value = '';
    document.getElementById("area").value = '';
    document.getElementById("empresa").value = '';
  }
});
// Función para actualizar el archivo en Google Sheets
const script_do_google = 'https://script.google.com/macros/s/AKfycbz3NjdMfgvr3g5BMbg1Q4BsONZh5Eg4z5Dq3ADLkhM7LHihQqcT3k4f5_9pI1VPjRrmQw/exec';
const dados_do_formulario = document.forms['formulario']; // Asegúrate de que el nombre coincida

dados_do_formulario.addEventListener('submit', function(e) {
    e.preventDefault();
    // Mostrar barra de progreso antes de enviar los datos
    Swal.fire({
        title: 'Enviando datos...',
        html: 'Por favor espera, esto puede tardar unos segundos.<br><b></b>',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading(); // Muestra el ícono de cargando
        }
    });

    fetch(script_do_google, {
        method: 'POST',
        body: new FormData(dados_do_formulario)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text(); // Cambia a .text() si no esperas JSON
    })
    .then(data => {
        // Cerrar el modal de cargando
        Swal.close();
        // Mostrar el mensaje de éxito
        Swal.fire('Datos enviados con éxito: ' + data);
        dados_do_formulario.reset();
    })
    .catch(error => {
        // Cerrar el modal de cargando
        Swal.close();
        // Mostrar el mensaje de error
        Swal.fire('Ocurrió un error al enviar los datos: ' + error.message);
    });
});

 // Función para mostrar el formulario con animación
 document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  const formGroups = document.querySelectorAll('.form-group');

  // Hacer que el contenedor del formulario sea visible
  container.classList.add('show');

  // Hacer que cada campo del formulario se muestre uno por uno
  formGroups.forEach((group, index) => {
      setTimeout(() => {
          group.classList.add('show');
      }, index * 150); // Retraso de 150ms entre cada campo
  });
});
