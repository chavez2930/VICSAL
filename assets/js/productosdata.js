/* ======================================================================
   DATOS DEL CATÁLOGO (assets/js/productosdata.js)
   Aquí se AGREGAN, EDITAN o QUITAN productos. catalogo.js lee window.VICSAL_CATALOGO (este archivo debe
   cargarse antes) y arma el buscador, los filtros y las tarjetas de productos.html.

   categorias[]  cada una: { id, nombre, corto, linea, icono, tinte }
       id      identificador (se usa en la URL productos.html?cat=ID y en cada producto)
       nombre  nombre completo  |  corto: versión breve para las etiquetas de las tarjetas
       linea   "uniformes", "calzado" o "epp" (pestañas del catálogo)
       icono   ícono de Material Symbols que se dibuja cuando un producto no tiene foto
       tinte   0 a 4: color de fondo de las tarjetas sin foto

   productos[]   cada uno: { id, cat, nombre, desc?, specs, f, img? }
       id      único (por ejemplo "camisolas-01")
       cat     id de una categoría que exista arriba
       nombre / desc   título y descripción (la descripción es opcional)
       specs   pares [etiqueta, valor] para la ficha técnica de la vista previa
       f       valores de los filtros, cada uno un arreglo (vacío = no aplica): tipo, genero, color, material, tela,
               reflejante, manga; el calzado también usa proteccion, proceso y talla ([mínima, máxima])
       img     ruta de la foto (opcional; si falta se muestra el ícono de la categoría)
       modelo  (opcional, calzado) también entra en la búsqueda
   ====================================================================== */
window.VICSAL_CATALOGO = {
  // Categorías del catálogo (las vacías aparecen en el menú y en los filtros, pero sin productos)
  categorias: [
    {"id":"chalecos-seguridad","nombre":"Chalecos de seguridad","corto":"Chalecos","linea":"epp","icono":"visibility","tinte":0},
    {"id":"camisolas","nombre":"Camisolas","corto":"Camisolas","linea":"uniformes","icono":"checkroom","tinte":1},
    {"id":"playeras-cuello-redondo","nombre":"Playeras cuello redondo","corto":"Playeras","linea":"uniformes","icono":"checkroom","tinte":2},
    {"id":"playeras-polo","nombre":"Playeras tipo polo","corto":"Polos","linea":"uniformes","icono":"checkroom","tinte":3},
    {"id":"pantalones","nombre":"Pantalones","corto":"Pantalones","linea":"uniformes","icono":"checkroom","tinte":4},
    {"id":"uniformes-industriales","nombre":"Uniformes industriales","corto":"Industrial","linea":"uniformes","icono":"engineering","tinte":0},
    {"id":"uniformes-restaurante","nombre":"Uniformes para restaurante","corto":"Restaurante","linea":"uniformes","icono":"restaurant","tinte":1},
    {"id":"uniformes-seguridad-privada","nombre":"Uniformes de seguridad privada","corto":"Seguridad privada","linea":"uniformes","icono":"security","tinte":2},
    {"id":"prendas-vestir-dama","nombre":"Prendas de vestir dama","corto":"Dama","linea":"uniformes","icono":"woman","tinte":3},
    {"id":"camisas-blusas-manga-larga","nombre":"Blusas y camisas manga larga","corto":"Manga larga","linea":"uniformes","icono":"checkroom","tinte":4},
    {"id":"camisas-blusas-manga-corta","nombre":"Blusas y camisas manga corta","corto":"Manga corta","linea":"uniformes","icono":"checkroom","tinte":0},
    {"id":"calzado-con-casco","nombre":"Calzado con casco de policarbonato","corto":"Con casco","linea":"calzado","icono":"footprint","tinte":1},
    {"id":"calzado-sin-casco","nombre":"Calzado sin casco","corto":"Sin casco","linea":"calzado","icono":"footprint","tinte":2},
    {"id":"calzado-soldador","nombre":"Botas para soldador","corto":"Soldador","linea":"calzado","icono":"local_fire_department","tinte":3},
    {"id":"chalecos-vestir","nombre":"Chalecos de vestir","corto":"Chalecos vestir","linea":"uniformes","icono":"checkroom","tinte":0},
    {"id":"chamarras","nombre":"Chamarras","corto":"Chamarras","linea":"uniformes","icono":"checkroom","tinte":1},
    {"id":"sudaderas","nombre":"Sudaderas","corto":"Sudaderas","linea":"uniformes","icono":"checkroom","tinte":2},
  ],
  // Productos, agrupados por categoría (cada grupo empieza con un comentario // ---- Nombre ----)
  productos: [   

    // ---- Chalecos de seguridad ----
    {"id":"chalecos-seguridad-01","cat":"chalecos-seguridad","nombre":"Chaleco tipo brigadista de gabardina","desc":"Chaleco tipo brigadista de gabardina, unitalla, con reflejante textil y ajustadores a los lados.","specs":[["Tela","Gabardina"],["Estilo","Tipo brigadista"],["Talla","Unitalla"],["Reflejante","Textil"],["Ajuste","Ajustadores a los lados"]],"f":{"tipo":["Chalecos"],"material":["Gabardina"],"reflejante":["Con reflejante"]},"img":"assets/img/productos/chalecos_seguridad/Chaleco_Seguridad_Gabardina.png"},
    {"id":"chalecos-seguridad-02","cat":"chalecos-seguridad","nombre":"Chaleco de tela Grand Bay","desc":"Chaleco de tela Grand Bay con forro calado y reflejante textil.","specs":[["Tela","Grand Bay"],["Forro","Calado"],["Reflejante","Textil"]],"f":{"tipo":["Chalecos"],"material":["Grand Bay"],"reflejante":["Con reflejante"]},"img":"assets/img/productos/chalecos_seguridad/Chaleco_Seguridad_Gabardina_V2.png"},

    // ---- Camisolas ----
    {"id":"camisolas-01","cat":"camisolas","nombre":"Camisola de mezclilla sin reflejantes","specs":[["Tela","Mezclilla"],["Reflejante","No"]],"f":{"tipo":["Camisolas"],"genero":[],"color":[],"material":["Mezclilla"],"tela":[],"reflejante":["Sin reflejante"],"manga":[]},"img":"assets/img/productos/Camisolas/Camisola_Mezclilla_14oz_sinReflejantes.png"},

    // ---- Playeras cuello redondo ----
    {"id":"playeras-cuello-redondo-01","cat":"playeras-cuello-redondo","nombre":"Playera manga corta cuello redondo caballero","specs":[["Composición","100% algodón"],["Cuello","Redondo"],["Manga","Corta"],["Corte","Caballero"]],"f":{"tipo":["Playeras"],"genero":["Caballero"],"color":["De color"],"material":["Algodón 100%"],"tela":[],"reflejante":[],"manga":["Manga corta"]},"img":"assets/img/productos/Playeras_Cuello_Redondo/Playera_Credondo_Caballero.png"},
    {"id":"playeras-cuello-redondo-02","cat":"playeras-cuello-redondo","nombre":"Playera manga corta cuello redondo dama","specs":[["Composición","100% algodón"],["Cuello","Redondo"],["Manga","Corta"],["Corte","Dama"]],"f":{"tipo":["Playeras"],"genero":["Dama"],"color":["Blanco"],"material":["Algodón 100%"],"tela":[],"reflejante":[],"manga":["Manga corta"]},"img":"assets/img/productos/Playeras_Cuello_Redondo/Playera_Credondo_Dama.png"},

    // ---- Playeras tipo polo ----
    {"id":"playeras-polo-01","cat":"playeras-polo","nombre":"Playera dama manga corta tipo polo pike","specs":[["Composición","100% algodón"],["Tejido","Pike"],["Cuello","Tipo polo"],["Manga","Corta"],["Corte","Dama"]],"f":{"tipo":["Playeras"],"genero":["Dama"],"color":["Blanco"],"material":["Algodón 100%"],"tela":[],"reflejante":[],"manga":["Manga corta"]},"img":"assets/img/productos/Playera_Polo/Playera_Polo_Mcorta_Dama.png"},
    {"id":"playeras-polo-02","cat":"playeras-polo","nombre":"Playera caballero manga corta tipo polo pike","specs":[["Composición","100% algodón"],["Tejido","Pike"],["Cuello","Tipo polo"],["Manga","Corta"],["Corte","Caballero"]],"f":{"tipo":["Playeras"],"genero":["Caballero"],"color":["De color"],"material":["Algodón 100%"],"tela":[],"reflejante":[],"manga":["Manga corta"]},"img":"assets/img/productos/Playera_Polo/Playera_Polo_Mcorta_Caballero.png"},
    {"id":"playeras-polo-03","cat":"playeras-polo","nombre":"Playera caballero manga larga tipo polo pike","specs":[["Composición","100% algodón"],["Tejido","Pike"],["Cuello","Tipo polo"],["Manga","Larga"],["Corte","Caballero"]],"f":{"tipo":["Playeras"],"genero":["Caballero"],"color":["Blanco"],"material":["Algodón 100%"],"tela":[],"reflejante":[],"manga":["Manga larga"]},"img":"assets/img/productos/Playera_Polo/Playera_Polo_MLarga_caballero.png"},
    {"id":"playeras-polo-04","cat":"playeras-polo","nombre":"Playera dama manga larga tipo polo pike","specs":[["Composición","100% algodón"],["Tejido","Pike"],["Cuello","Tipo polo"],["Manga","Larga"],["Corte","Dama"]],"f":{"tipo":["Playeras"],"genero":["Dama"],"color":["De color"],"material":["Algodón 100%"],"tela":[],"reflejante":[],"manga":["Manga larga"]},"img":"assets/img/productos/Playera_Polo/Playera_Polo_MLarga_Dama.png"},

    // ---- Pantalones ----
    {"id":"pantalones-01","cat":"pantalones","nombre":"Pantalón de gabardina tipo cargo caballero","specs":[["Tela","Gabardina"],["Estilo","Tipo cargo"]],"f":{"tipo":["Pantalones"],"genero":["Caballero"],"color":[],"material":["Gabardina"],"tela":[],"reflejante":[],"manga":[]},"img":"assets/img/productos/Pantalones/Pantalon_Cargo_Gabardina_Caballero.png"},
    {"id":"pantalones-02","cat":"pantalones","nombre":"Pantalón de mezclilla dama","specs":[["Tela","Mezclilla"],["Corte","Dama"]],"f":{"tipo":["Pantalones"],"genero":["Dama"],"color":[],"material":["Mezclilla"],"tela":[],"reflejante":[],"manga":[]},"img":"assets/img/productos/Pantalones/Pantalon_Mezclilla_Dama.png"},
    {"id":"pantalones-03","cat":"pantalones","nombre":"Pantalón de mezclilla caballero","specs":[["Tela","Mezclilla"],["Corte","Caballero"]],"f":{"tipo":["Pantalones"],"genero":["Caballero"],"color":[],"material":["Mezclilla"],"tela":[],"reflejante":[],"manga":[]},"img":"assets/img/productos/Pantalones/Pantalon_Mezclilla_Caballero.png"},
    {"id":"pantalones-04","cat":"pantalones","nombre":"Pantalón de mezclilla stretch dama","specs":[["Tela","Mezclilla stretch"],["Corte","Dama"]],"f":{"tipo":["Pantalones"],"genero":["Dama"],"color":[],"material":["Mezclilla"],"tela":["Mezclilla stretch"],"reflejante":[],"manga":[]},"img":"assets/img/productos/Pantalones/Pantalon_Mezclilla_Stretch_Dama.png"},

    // ---- Uniformes industriales ----
    {"id":"uniformes-industriales-01","cat":"uniformes-industriales","nombre":"Camisa de mezclilla sin reflejantes caballero","specs":[["Tela","Mezclilla"],["Reflejante","No"],["Corte","Caballero"]],"f":{"tipo":["Camisas y blusas"],"genero":["Caballero"],"color":[],"material":["Mezclilla"],"tela":[],"reflejante":["Sin reflejante"],"manga":[]},"img":"assets/img/productos/Industriales/Camisa_Mezclilla_Caballero.png"},
    {"id":"uniformes-industriales-02","cat":"uniformes-industriales","nombre":"Camisa de mezclilla con reflejantes caballero","specs":[["Tela","Mezclilla"],["Reflejante","Sí"],["Corte","Caballero"]],"f":{"tipo":["Camisas y blusas"],"genero":["Caballero"],"color":[],"material":["Mezclilla"],"tela":[],"reflejante":["Con reflejante"],"manga":[]},"img":"assets/img/productos/Industriales/Camisa_Mezclilla_14oz_Reflejante_Caballero.png"},
    {"id":"uniformes-industriales-12","cat":"uniformes-industriales","nombre":"Camisa de mezclilla dama","specs":[["Tela","Mezclilla"],["Corte","Dama"]],"f":{"tipo":["Camisas y blusas"],"genero":["Dama"],"color":[],"material":["Mezclilla"],"tela":[],"reflejante":[],"manga":[]},"img":"assets/img/productos/Industriales/Camisa_Mezclilla_Dama.png"},

    // ---- Uniformes para restaurante ----
    

    // ---- Uniformes de seguridad privada ----
    

    // ---- Prendas de vestir dama ----
    

    // ---- Blusas y camisas manga larga ----
    {"id":"camisas-blusas-manga-larga-01","cat":"camisas-blusas-manga-larga","nombre":"Camisa Manga Larga Caballero","specs":[["Manga","Larga"],["Corte","Caballero"]],"f":{"tipo":["Camisas y blusas"],"genero":["Caballero"],"color":[],"material":[],"tela":[],"reflejante":[],"manga":["Manga larga"]},"img":"assets/img/productos/Blusa_Camisa_Mlarga/Camisa_Caballero.png"},
    {"id":"camisas-blusas-manga-larga-02","cat":"camisas-blusas-manga-larga","nombre":"Camisa Manga Larga Dama","specs":[["Manga","Larga"],["Corte","Dama"]],"f":{"tipo":["Camisas y blusas"],"genero":["Dama"],"color":[],"material":[],"tela":[],"reflejante":[],"manga":["Manga larga"]},"img":"assets/img/productos/Blusa_Camisa_Mlarga/Camisa_Dama.png"},
    

    

    // ---- Calzado con casco de policarbonato ----
    {"id":"calzado-con-casco-01","cat":"calzado-con-casco","nombre":"Borceguí negro K-02","modelo":"K-02","desc":"Borceguí negro de piel napa, con inyección directa al corte en PU/TPU y casco de policarbonato. Tallas 22 al 31.","specs":[["Modelo","K-02"],["Color","Negro"],["Piel","Napa"],["Proceso","Inyección directa al corte"],["Suela","PU/TPU"],["Casco","Policarbonato"],["Tallas","22 al 31"]],"f":{"color":["Negro"],"material":["Piel"],"proteccion":["Con casco de policarbonato"],"proceso":["Inyección directa al corte"],"talla":[22,31],"tipo":["Borceguíes"]},"img":"assets/img/productos/Calzado_Casco/Kaizer_K-02.png"},
    {"id":"calzado-con-casco-03","cat":"calzado-con-casco","nombre":"Borceguí café K-140","modelo":"K-140","desc":"Borceguí dieléctrico café de piel napa, con inyección directa al corte en PU monodensidad y casco de policarbonato. Tallas 22 al 31.","specs":[["Modelo","K-140"],["Color","Café"],["Piel","Napa"],["Suela","PU monodensidad"],["Casco","Policarbonato"],["Protección","Dieléctrico"],["Horma","EEE"],["Altura","15 cm"],["Tallas","22 al 31"]],"f":{"color":["Café"],"material":["Piel"],"proteccion":["Con casco de policarbonato","Dieléctrico"],"proceso":["Inyección directa al corte"],"talla":[22,31],"tipo":["Borceguíes"]},"img":"assets/img/productos/Calzado_Casco/Kaizer_K-140.png"},
    {"id":"calzado-con-casco-04","cat":"calzado-con-casco","nombre":"Borceguí negro CL","modelo":"CL","desc":"Borceguí negro de piel napa, con inyección directa al corte en PU/TPU y casco de policarbonato. Tallas 22 al 31.","specs":[["Modelo","CL"],["Color","Negro"],["Piel","Napa"],["Proceso","Inyección directa al corte"],["Suela","PU/TPU"],["Casco","Policarbonato"],["Tallas","22 al 31"]],"f":{"color":["Negro"],"material":["Piel"],"proteccion":["Con casco de policarbonato"],"proceso":["Inyección directa al corte"],"talla":[22,31],"tipo":["Borceguíes"]},"img":"assets/img/productos/Calzado_Casco/Kaizer_CL.png"},
    {"id":"calzado-con-casco-05","cat":"calzado-con-casco","nombre":"Calzado de seguridad M7","modelo":"M7","desc":"Calzado de seguridad con inyección directa al corte, doble densidad PU/TPU, casco de policarbonato y planta antiperforación. Tallas 22 al 31.","specs":[["Modelo","M7"],["Proceso","Inyección directa al corte"],["Suela","Doble densidad PU/TPU"],["Casco","Policarbonato"],["Protección","Planta antiperforación"],["Tallas","22 al 31"]],"f":{"proteccion":["Con casco de policarbonato","Planta antiperforación"],"proceso":["Inyección directa al corte"],"talla":[22,31],"tipo":["Calzado de seguridad"]},"img":"assets/img/productos/Calzado_Casco/Kaizer_M7.png"},
    {"id":"calzado-con-casco-07","cat":"calzado-con-casco","nombre":"Calzado de seguridad K-HUNTER","modelo":"K-HUNTER","desc":"Calzado de seguridad modelo K-HUNTER, con casco de policarbonato y planta antiperforación.","specs":[["Modelo","K-HUNTER"],["Casco","Policarbonato"],["Protección","Planta antiperforación"]],"f":{"proteccion":["Con casco de policarbonato","Planta antiperforación"],"tipo":["Calzado de seguridad"]},"img":"assets/img/productos/Calzado_Casco/K-Hunter.png"},
    {"id":"calzado-con-casco-08","cat":"calzado-con-casco","nombre":"Borceguí negro K-03","modelo":"K-03","desc":"Borceguí dieléctrico negro de piel napa, con suela rosa de TPU en doble densidad y casco de policarbonato. Tallas 22 al 27.","specs":[["Modelo","K-03"],["Color","Negro"],["Piel","Napa"],["Suela","TPU doble densidad"],["Casco","Policarbonato"],["Protección","Dieléctrico"],["Horma","EEE"],["Altura","14 cm"],["Tallas","22 al 27"]],"f":{"color":["Negro"],"material":["Piel"],"proteccion":["Con casco de policarbonato","Dieléctrico"],"proceso":["Inyección directa al corte"],"talla":[22,27],"tipo":["Borceguíes"]},"img":"assets/img/productos/Calzado_Casco/Calzado_Negro_Suela_Rosa.jpg"},

    // ---- Calzado sin casco ----
    {"id":"calzado-sin-casco-01","cat":"calzado-sin-casco","nombre":"Bota Viborera","modelo":"Viborera","desc":"Bota viborera de piel Krazy Bronce, sin casco, con proceso welt. Tallas 25 al 30.","specs":[["Modelo","Viborera"],["Color","Krazy Bronce"],["Piel","Krazy Bronce"],["Proceso","Welt"],["Casco","Sin casco"],["Tallas","25 al 30"]],"f":{"color":["Bronce"],"material":["Piel"],"proteccion":["Sin casco"],"proceso":["Welt"],"talla":[25,30],"tipo":["Botas"]},"img":"assets/img/productos/Calzado_Sin_Casco/Bota_Viborera.png"},
    {"id":"calzado-sin-casco-02","cat":"calzado-sin-casco","nombre":"Bota Mod-050 Uso Rudo Artesanal","modelo":"Mod-050","desc":"Bota de trabajo de uso rudo, de fabricación artesanal, en piel vacuno napa. Disponible en negro, miel, shedron, ocre y hueso. Tallas 15 al 31.","specs":[["Modelo","Mod-050"],["Colores","Negro, miel, shedron, ocre y hueso"],["Piel","Vacuno napa"],["Altura","20 cm"],["Construcción","Montado, cementado y cosido 360°"],["Suela","Hule virgen antiderrapante"],["Tallas","15 al 31"]],"f":{"material":["Piel"],"proteccion":["Sin casco"],"proceso":["Pegado y cosido"],"talla":[15,31],"tipo":["Botas"]},"img":"assets/img/productos/Calzado_Sin_Casco/Kaizer_050.png"},
    {"id":"calzado-sin-casco-03","cat":"calzado-sin-casco","nombre":"Bota café caña alta","desc":"Bota de piel color café de caña alta, sin casco.","specs":[["Color","Café"],["Estilo","Caña alta"],["Casco","Sin casco"]],"f":{"color":["Café"],"material":["Piel"],"proteccion":["Sin casco"],"tipo":["Botas"]},"img":"assets/img/productos/Calzado_Sin_Casco/Bota_Cafe_CanaAlta.jpg"},
    {"id":"calzado-sin-casco-04","cat":"calzado-sin-casco","nombre":"Bota miel moc toe","desc":"Bota de piel color miel con puntera moc toe, sin casco.","specs":[["Color","Miel"],["Estilo","Moc toe"],["Casco","Sin casco"]],"f":{"color":["Miel"],"material":["Piel"],"proteccion":["Sin casco"],"tipo":["Botas"]},"img":"assets/img/productos/Calzado_Sin_Casco/Bota_Miel_MocToe.jpg"},
    // ---- Botas para soldador ----
    {"id":"calzado-soldador-01","cat":"calzado-soldador","nombre":"Bota para soldador Kaizer 342 · Inyección directa","modelo":"Kaizer 342","desc":"Bota roper para soldador con puntera de protección de policarbonato y dieléctrico, de piel 100% vacuno de primera calidad. Inyección directa al corte, de uso semi rudo. Tallas 22 al 32, números medios.","specs":[["Modelo","Kaizer 342"],["Estilo","Roper"],["Piel","100% vacuno de primera calidad"],["Proceso","Inyección directa al corte"],["Puntera","Policarbonato"],["Protección","Dieléctrico"],["Uso","Semi rudo"],["Tallas","22 al 32 (números medios)"]],"f":{"material":["Piel"],"proteccion":["Con casco de policarbonato","Dieléctrico"],"proceso":["Inyección directa al corte"],"talla":[22,32],"tipo":["Botas para soldador"]},"img":"assets/img/productos/Calzado_Casco/Kaizer_342.png"},

    // ---- Chalecos de vestir ----
    {"id":"chalecos-vestir-01","cat":"chalecos-vestir","nombre":"Chaleco Capitonado Caballero","specs":[["Corte","Caballero"]],"f":{"tipo":["Chalecos"],"genero":["Caballero"]},"img":"assets/img/productos/chalecos-vestir/Chaleco_Capitonado_Caballero.png"},
    {"id":"chalecos-vestir-02","cat":"chalecos-vestir","nombre":"Chaleco Capitonado Dama","specs":[["Corte","Dama"]],"f":{"tipo":["Chalecos"],"genero":["Dama"]},"img":"assets/img/productos/chalecos-vestir/Chaleco_Capitonado_Dama.png"},

    // ---- Chamarras ----
    {"id":"chamarras-01","cat":"chamarras","nombre":"Chamarra Caballero M1","specs":[["Corte","Caballero"]],"f":{"tipo":["Chamarras"],"genero":["Caballero"]},"img":"assets/img/productos/chamarras/Chamarra_Caballero_M1.png"},
    {"id":"chamarras-02","cat":"chamarras","nombre":"Chamarra Caballero M2","specs":[["Corte","Caballero"]],"f":{"tipo":["Chamarras"],"genero":["Caballero"]},"img":"assets/img/productos/chamarras/Chamarra_Caballero_M2.png"},
    {"id":"chamarras-03","cat":"chamarras","nombre":"Chamarra Capitonada Caballero","specs":[["Corte","Caballero"]],"f":{"tipo":["Chamarras"],"genero":["Caballero"]},"img":"assets/img/productos/chamarras/Chamarra_Capitonada_Caballero.png"},
    {"id":"chamarras-04","cat":"chamarras","nombre":"Chamarra Capitonada Dama","specs":[["Corte","Dama"]],"f":{"tipo":["Chamarras"],"genero":["Dama"]},"img":"assets/img/productos/chamarras/Chamarra_Capitonada_Dama.png"},
    {"id":"chamarras-05","cat":"chamarras","nombre":"Chamarra Repelente Afelpada","specs":[["Detalle","Repelente y Afelpado"]],"f":{"tipo":["Chamarras"]},"img":"assets/img/productos/chamarras/Chamarra_Repelente_FAfelpado_DC.png"},
    {"id":"chamarras-06","cat":"chamarras","nombre":"Chamarra Térmica Caballero","specs":[["Corte","Caballero"]],"f":{"tipo":["Chamarras"],"genero":["Caballero"]},"img":"assets/img/productos/chamarras/Chamarra_Termica_Caballero.png"},
    {"id":"chamarras-07","cat":"chamarras","nombre":"Chamarra Térmica Dama","specs":[["Corte","Dama"]],"f":{"tipo":["Chamarras"],"genero":["Dama"]},"img":"assets/img/productos/chamarras/Chamarra_Termica_Dama.png"},
    {"id":"chamarras-08","cat":"chamarras","nombre":"Chamarra Universitaria Forro Capitonado","specs":[["Detalle","Universitaria"]],"f":{"tipo":["Chamarras"]},"img":"assets/img/productos/chamarras/Chamarra_Universitaria_Forro_Capitonado_DC.png"},

    // ---- Sudaderas ----
    {"id":"sudaderas-01","cat":"sudaderas","nombre":"Sudadera Felpa Capucha Caballero","specs":[["Corte","Caballero"],["Detalle","Con Capucha"]],"f":{"tipo":["Sudaderas"],"genero":["Caballero"]},"img":"assets/img/productos/sudaderas/Sudadera_Felpa_Capucha_Caballero.png"},
    {"id":"sudaderas-02","cat":"sudaderas","nombre":"Sudadera Felpa Capucha Dama","specs":[["Corte","Dama"],["Detalle","Con Capucha"]],"f":{"tipo":["Sudaderas"],"genero":["Dama"]},"img":"assets/img/productos/sudaderas/Sudadera_Felpa_Capucha_Dama.png"},
    {"id":"sudaderas-03","cat":"sudaderas","nombre":"Sudadera Felpa Cuello Redondo Caballero","specs":[["Corte","Caballero"],["Cuello","Redondo"]],"f":{"tipo":["Sudaderas"],"genero":["Caballero"]},"img":"assets/img/productos/sudaderas/Sudadera_Felpa_Cuello_redondo_Caballero.png"},
    {"id":"sudaderas-04","cat":"sudaderas","nombre":"Sudadera Felpa Cuello Redondo Dama","specs":[["Corte","Dama"],["Cuello","Redondo"]],"f":{"tipo":["Sudaderas"],"genero":["Dama"]},"img":"assets/img/productos/sudaderas/Sudadera_Felpa_Cuello_redondo_dama.png"}
  ],
};