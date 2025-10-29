const Storage = (function () {
    function saveToLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function loadFromLocalStorage(key) {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    }

    function exportToJSFile(state, filename = 'mydumbbell_data.js') {
        const data = {
            usuariosRegistrados: state.usuariosRegistrados || [],
            exercicios: state.exercicios || [],
            treinos: state.treinos || []
        };
        const content = `/* MyDumbbell backup (JS) */\nwindow.MYDUMBBELL_DATA = ${JSON.stringify(data, null, 2)};`;
        const blob = new Blob([content], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const txt = reader.result;
                try {
                    // Tenta extrair JSON após '=' (formato: window.MYDUMBBELL_DATA = {...};)
                    const assignIndex = txt.indexOf('=');
                    if (assignIndex !== -1) {
                        let jsonText = txt.substring(assignIndex + 1).trim();
                        if (jsonText.endsWith(';')) jsonText = jsonText.slice(0, -1);
                        const obj = JSON.parse(jsonText);
                        resolve(obj);
                    } else {
                        // se for arquivo JSON puro
                        resolve(JSON.parse(txt));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    return {
        saveToLocalStorage,
        loadFromLocalStorage,
        exportToJSFile,
        importFromFile
    };
})();

window.Storage = Storage;