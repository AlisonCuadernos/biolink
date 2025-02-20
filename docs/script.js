//Proximos eventos
function showEventInfo(eventCard) {
    let image = eventCard.querySelector("img");
    let info = eventCard.querySelector(".event-info");

    // Si la imagen está visible, ocultarla y mostrar la info
    if (image.style.display !== "none") {
        image.style.display = "none";
        info.style.display = "block";
    }
}

function hideEventInfo(event, closeButton) {
    event.stopPropagation(); // Evita que el click en la "X" vuelva a abrir la info
    let eventCard = closeButton.closest(".event-card");
    let image = eventCard.querySelector("img");
    let info = eventCard.querySelector(".event-info");

    // Volver a mostrar la imagen y ocultar la info
    image.style.display = "block";
    info.style.display = "none";
}

//Preguntas frecuentes
fetch('preguntas-frecuentes.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('faq-content').innerHTML = data;
            })
            .catch(error => console.error('Error al cargar las preguntas frecuentes:', error));

function toggleFAQ(element) {
    let answer = element.nextElementSibling;
    let arrow = element.querySelector('.arrow');

    if (answer.style.display === "block") {
        answer.style.display = "none";
        arrow.classList.remove('rotate');
    } else {
        answer.style.display = "block";
        arrow.classList.add('rotate');
    }
}