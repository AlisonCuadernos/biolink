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