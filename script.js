// script.js

// Les données PLU_DATA sont chargées depuis data.js
// --- FONCTION POUR CONSTRUIRE LE TABLEAU ---
function construireTableau(data) {
    const tbody = document.getElementById('corpsTableau');
    tbody.innerHTML = ''; // Nettoyer le tableau existant
    
    data.forEach(item => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${item.code}</td>
            <td>${item.nom}</td>
            <td><img src="assets/${item.image}" alt="${item.nom}"></td>
        `;
    });
}

// --- FONCTION DE FILTRAGE (RECHERCHE) ---
function filtrerTableau() {
    var input, filter, table, tr, td, i, txtValueCode, txtValueProduit;
    input = document.getElementById("recherche");
    filter = input.value.toUpperCase();
    table = document.getElementById("tablePLU");
    tbody = table.getElementsByTagName("tbody")[0];
    tr = tbody.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        tdCode = tr[i].getElementsByTagName("td")[0];
        tdProduit = tr[i].getElementsByTagName("td")[1];
        
        if (tdCode && tdProduit) {
            txtValueCode = tdCode.textContent || tdCode.innerText;
            txtValueProduit = tdProduit.textContent || tdProduit.innerText;
            
            if (txtValueCode.toUpperCase().indexOf(filter) > -1 || txtValueProduit.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
}

// --- FONCTION DE TRI PAR COLONNE ---
function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("tablePLU");
    switching = true;
    dir = "asc"; 
    
    while (switching) {
        switching = false;
        rows = table.rows;

        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            
            var xContent = isNaN(x.innerHTML) ? x.innerHTML.toLowerCase() : Number(x.innerHTML);
            var yContent = isNaN(y.innerHTML) ? y.innerHTML.toLowerCase() : Number(y.innerHTML);

            if (dir == "asc") {
                if (xContent > yContent) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (xContent < yContent) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;      
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}


// Lancement au chargement de la page
window.onload = function() {
    // Vérifier si PLU_DATA est disponible et construire le tableau
    if (typeof PLU_DATA !== 'undefined' && document.getElementById('tablePLU')) {
        construireTableau(PLU_DATA);
    }
};
