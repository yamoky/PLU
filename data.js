// data.js
// Fichier complet — remplace ton data.js existant.
// - products : liste des produits (code en string + name compatible avec script.js)
// - questions : quelques questions d'exemple (modifie / supprime / ajoute selon tes besoins)

window.PLU_DATA = (function(){
  const products = [
    // --- Fruits & Légumes (codes 1 à 20) ---
    { code: "1",  name: "Banane",             nom: "Banane",             image: "banane.jpg" },
    { code: "2",  name: "Tomate",             nom: "Tomate",             image: "tomate_grappe.jpg" },
    { code: "3",  name: "Concombre",          nom: "Concombre",          image: "concombre.jpg" },
    { code: "4",  name: "Courgette",          nom: "Courgette",          image: "courgette_vrac.jpg" },
    { code: "5",  name: "Melon",              nom: "Melon",              image: "melon.jpg" },
    { code: "6",  name: "Avocat",             nom: "Avocat",             image: "avocat_vrac.jpg" },
    { code: "7",  name: "Batavia",            nom: "Batavia",            image: "batavia.jpg" },
    { code: "8",  name: "Kiwi Vert",          nom: "Kiwi Vert",          image: "kiwi_vrac.jpg" },
    { code: "9",  name: "Radis Botte",        nom: "Radis Botte",        image: "radis_vrac.jpg" },
    { code: "10", name: "Raisin Blanc",       nom: "Raisin Blanc",       image: "raisin_blanc.jpg" },
    { code: "11", name: "Aubergine",          nom: "Aubergine",          image: "aubergine_vrac.jpg" },
    { code: "12", name: "Chou-fleur",         nom: "Chou-fleur",         image: "chou_fleur.jpg" },
    { code: "13", name: "Poire Verte",        nom: "Poire Verte",        image: "poire_vrac.jpg" },
    { code: "14", name: "Mangue",             nom: "Mangue",             image: "mangue_vrac.jpg" },
    { code: "15", name: "Pomelo",             nom: "Pomelo",             image: "pamplemousse_vrac.jpg" },
    { code: "16", name: "Ananas",             nom: "Ananas",             image: "ananas.jpg" },
    { code: "17", name: "Nectarine",          nom: "Nectarine",          image: "nectarine.jpg" },
    { code: "18", name: "Pomme Bicolore",     nom: "Pomme Bicolore",     image: "pomme_gala.jpg" },
    { code: "19", name: "Pomme Golden",       nom: "Pomme Golden",       image: "pomme_golden.jpg" },
    { code: "20", name: "Patate Douce",       nom: "Patate Douce",       image: "patate_douce_vrac.jpg" },

    // --- Boulangerie (codes 50+) ---
    { code: "50", name: "Pain Chocolat",      nom: "Pain Chocolat",      image: "pain_chocolat_pur_beurre.jpg" },
    { code: "51", name: "Beignet Chocolat",   nom: "Beignet Chocolat",   image: "beignet_chocolat_noisette.jpg" },
    { code: "52", name: "Croissant",          nom: "Croissant",          image: "croissant.jpg" },
    { code: "53", name: "Ciabatta",           nom: "Ciabatta",           image: "ciabatta.jpg" },
    { code: "54", name: "Pain aux Noix",      nom: "Pain aux Noix",      image: "pain_noix.jpg" },
    { code: "55", name: "Pain Céréales",      nom: "Pain Céréales",      image: "pain_multicereales.jpg" },
    { code: "56", name: "Pain Complet",       nom: "Pain Complet",       image: "petit_pain_complet.jpg" },
    { code: "57", name: "Suisse Chocolat",    nom: "Suisse Chocolat",    image: "suisse_chocolat.jpg" },
    { code: "58", name: "Barchetta 4 Fromages", nom: "Barchetta 4 Fromages", image: "barchetta_4_fromages.jpg" },
    { code: "59", name: "Pain aux Raisins",   nom: "Pain aux Raisins",   image: "pain_aux_raisins.jpg" }
  ];

  // Quelques questions d'exemple.
  // Format attendu par quiz.js : { id, productCode (optionnel), question, choices[], answerIndex, explanation }
  // -> Modifie ou ajoute tes propres questions ici.
  const questions = [
    {
      id: "q1",
      productCode: "1",
      question: "Quel est le code PLU pour la Banane ?",
      choices: ["1", "2", "10", "50"],
      answerIndex: 0,
      explanation: "La banane porte le code 1 dans cette liste d'exemple."
    },
    {
      id: "q2",
      productCode: "2",
      question: "Quel code correspond à la Tomate (grappe) ?",
      choices: ["3", "2", "19", "52"],
      answerIndex: 1,
      explanation: "Tomate (grappe) = code 2."
    },
    {
      id: "q3",
      productCode: "52",
      question: "Quel produit a pour code 52 ?",
      choices: ["Croissant", "Pain Chocolat", "Ciabatta", "Pain Complet"],
      // ici on place l'index de la bonne réponse dans choices (0-based)
      answerIndex: 0,
      explanation: "Le croissant est listé avec le code 52."
    },
    {
      id: "q4",
      productCode: "19",
      question: "Quel est le nom du produit 19 ?",
      choices: ["Pomme Golden", "Pomme Bicolore", "Mangue"],
      answerIndex: 0,
      explanation: "Le produit 19 est la Pomme Golden."
    },
    {
      id: "q5",
      productCode: null,
      question: "Lequel de ces produits est une boisson ? (exemple)",
      choices: ["Lait 1L", "Croissant", "Ananas"],
      answerIndex: 0,
      explanation: "Ceci est une question d'exemple — remplace par vos propres questions si besoin."
    }
  ];

  return { products, questions };
})();
