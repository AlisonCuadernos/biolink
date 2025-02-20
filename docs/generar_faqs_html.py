import faqs_store

def generar_html():
    html_content = """
    <div class="faq-container">
        <h2>Preguntas Frecuentes</h2>
    """

    for faq in faqs_store.faqs:
        html_content += f"""
        <div class="faq-item" onclick="toggleFAQ(this)">
            <h3>{faq['pregunta']}</h3><span class="arrow">▼</span>
        </div>
        <div class="faq-answer">
            <p>{faq['respuesta'].replace('\\n', '<br>')}</p>
        </div>
        """

    html_content += "</div>"

    with open("preguntas-frecuentes.html", "w", encoding="utf-8") as file:
        file.write(html_content)

    print("Archivo 'preguntas-frecuentes.html' generado exitosamente.")

# Ejecutar la función
if __name__ == "__main__":
    generar_html()
