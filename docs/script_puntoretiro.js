//Puntos de retiro
document.addEventListener('DOMContentLoaded', () => {
    fetch('showroom.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los puntos de retiro: ' + response.status);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('pdr-content').innerHTML = data;
        })
        .catch(error => console.error('Error:', error));
});

function showShowroominfo(eventCard) {
    let image = eventCard.querySelector("img");
    let info = eventCard.querySelector(".event-info");

    // Si la imagen está visible, ocultarla y mostrar la info
    if (image.style.display !== "none") {
        image.style.display = "none";
        info.style.display = "block";
    }
}

function hideShowroominfo(event, closeButton) {
    event.stopPropagation(); // Evita que el click en la "X" vuelva a abrir la info
    let eventCard = closeButton.closest(".event-card");
    let image = eventCard.querySelector("img");
    let info = eventCard.querySelector(".event-info");

    // Volver a mostrar la imagen y ocultar la info
    image.style.display = "block";
    info.style.display = "none";
}
