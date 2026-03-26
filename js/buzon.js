
<section id = "buzon">
    <h2>Sugerencias De Buzon</h2>
    <from id ="form-sugerencia">
        <label for="sugerencia">Describe cual es tu sugerencia</label> <br></br>
            <textarea name="sugerencia" id="sugerencia" cols="30" rows="10"></textarea>
                <br></br>
        <button type="submit">Enviar Sugerencia</button>
    </from>
    <div id="lista-sugerencias">
        <h2>¡Gracias, Recibimos tu sugerencia!</h2>
        <ul id="sugerencias-lista"></ul>
    </div>
    </section>

const formSugerencia = document.getElementById('form-sugerencia');
const inmputSugerencia = document.getElementById('sugerencia');
const listaSugerencias = document.getElementById('lista-sugerencias');

formSugerencia.addEventListener("submit", (event) => {
    event.preventDefault();
    const texto = inmputSugerencia.value.trim();

    if (texto) {
        const li = document.createElement('li');
        li.textContent = texto;
        listaSugerencias.appendChild(li);
        inmputSugerencia.value = '';
    }
});
