export const initialSeriesDatabase = [
  {
    id: "juego-de-tronos",
    title: "Juego de Tronos",
    originalTitle: "Game of Thrones",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
    genre: "Fantasía Épica / Drama Político",
    seasons: 8,
    episodes: 73,
    network: "HBO",
    tagline: "El invierno se acerca y en el juego de tronos o ganas o mueres.",
    description: "Casas nobles luchan por el Trono de Hierro mientras una antigua amenaza helada acecha desde el Norte.",
    characters: [
      {
        id: "jon-snow",
        name: "Jon Nieve (Aegon Targaryen)",
        aliases: ["Jon Snow", "Aegon Targaryen", "Jon Targaryen"],
        zona: "El Muro & Invernalia",
        edad: "24 - 32 años",
        actor: "Kit Harington",
        house: "Casa Stark / Casa Targaryen",
        role: "Lord Comandante & Rey en el Norte",
        status: "Exiliado al Norte del Muro con el Pueblo Libre",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        quote: "No sabes nada, Jon Nieve.",
        summary: "El supuesto bastardo de Ned Stark que lideró la defensa de la humanidad contra el Rey de la Noche y reclamó su verdadero linaje.",
        events: [
          {
            id: "got-jon-1",
            season: 1,
            episode: "T1E1: El invierno se acerca",
            title: "Juramento en la Guardia de la Noche",
            image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
            summary: "Jon abandona Invernalia junto a Benjen Stark para vestir el negro.",
            details: "Jon marcha al Castillo Negro buscando labrarse un honor propio lejos del estigma de bastardo.",
            impact: "Entra al servicio defensivo frente a los salvajes."
          },
          {
            id: "got-jon-2",
            season: 3,
            episode: "T3E9: Las lluvias de Castamere",
            title: "Infiltración con los Salvajes & Ygritte",
            image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
            summary: "Se enamora de Ygritte y escala el Muro con el pueblo libre.",
            details: "Jon rompe sus votos con Ygritte pero se niega a matar a un granjero inocente, escapando hacia el Castillo Negro.",
            impact: "Consigue advertir a la Guardia a tiempo."
          },
          {
            id: "got-jon-3",
            season: 5,
            episode: "T5E8: Casa Austera",
            title: "La Masacre de Casa Austera",
            image: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
            summary: "Enfrentamiento directo contra el Rey de la Noche y destrucción de un Caminante Blanco.",
            details: "Jon usa su espada Garra para matar a un Caminante Blanco y evacua a miles de salvajes.",
            impact: "Demuestra la eficacia del acero valyrio."
          },
          {
            id: "got-jon-4",
            season: 6,
            episode: "T6E9: La Batalla de los Bastardos",
            title: "Reconquista de Invernalia",
            image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
            summary: "Derrota militar a Ramsay Bolton y restitución del estandarte del Lobo.",
            details: "Jon lidera la carga salvaje contra los Bolton y es aclamado 'Rey en el Norte'.",
            impact: "Unifica el Norte para la Gran Guerra."
          },
          {
            id: "got-jon-5",
            season: 8,
            episode: "T8E6: El Trono de Hierro",
            title: "Asesinato de Daenerys & Exilio Eterno",
            isFinalFate: true,
            image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80",
            summary: "Jon clava una daga en Daenerys para salvar Poniente y es desterrado al Muro.",
            details: "Tras la devastación de la capital, Jon toma la trágica decisión de apuñalar a Daenerys frente al Trono de Hierro. Es desterrado por el nuevo Rey Bran el Tullido y parte cabalgando hacia el Norte profundo con Tormund y Fantasma.",
            impact: "Jon vive libre en las tierras heladas del Norte con el Pueblo Libre."
          }
        ]
      },
      {
        id: "daenerys-targaryen",
        name: "Daenerys Targaryen",
        zona: "Rocadragón & Essos",
        edad: "24 - 32 años",
        actor: "Emilia Clarke",
        house: "Casa Targaryen",
        role: "Madre de Dragones & Rompedora de Cadenas",
        status: "Fallecida (Apuñalada por Jon Nieve)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        quote: "No soy una reina común. Romperé la rueda.",
        summary: "Exiliada que resurgió con tres dragones y conquistó Essos antes de sucumbir a la tiranía en Desembarco del Rey.",
        events: [
          {
            id: "got-dany-1",
            season: 1,
            episode: "T1E10: Fuego y Sangre",
            title: "Nacimiento de los Dragones",
            image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
            summary: "Emerge ilesa de la pira funeraria con Drogon, Rhaegal y Viserion.",
            details: "Entra a las llamas con los tres huevos fosilizados y renace la magia en el mundo.",
            impact: "Es coronada Madre de Dragones."
          },
          {
            id: "got-dany-2",
            season: 3,
            episode: "T3E4: Y ahora su guardia ha terminado",
            title: "Liberación de los Inmaculados",
            image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
            summary: "Ordena 'Dracarys' en Astapor y libera a 8.000 soldados esclavos.",
            details: "Engaña a los amos de Astapor quemándolos con Drogon y recluta el ejército más disciplinado.",
            impact: "Inicia su cruzada antiesclavista."
          },
          {
            id: "got-dany-3",
            season: 8,
            episode: "T8E6: El Trono de Hierro",
            title: "Trágica Muerte frente al Trono de Hierro",
            isFinalFate: true,
            image: "https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=800&q=80",
            summary: "Apuñalada en el pecho por su amado Jon Nieve tras calcinar la capital.",
            details: "Consumida por el afán absolutista tras reducir Desembarco del Rey a cenizas, Daenerys abraza a Jon frente al Trono de Hierro. Él la apuñala en el corazón. Drogon derrite el Trono de Hierro con su aliento de fuego y se lleva su cuerpo volando hacia Essos.",
            impact: "Finaliza la dinastía Targaryen y se elige la monarquía electiva en Poniente."
          }
        ]
      },
      {
        id: "arya-stark",
        name: "Arya Stark",
        zona: "Invernalia & Braavos",
        edad: "14 - 22 años",
        actor: "Maisie Williams",
        house: "Casa Stark",
        role: "Asesina de los Hombres sin Rostro",
        status: "Explorando los mares al Oeste de Poniente",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        quote: "Hoy no.",
        summary: "Superviviente que aprendió el arte de cambiar rostros en Braavos y salvó la humanidad eliminando al Rey de la Noche.",
        events: [
          {
            id: "got-arya-1",
            season: 6,
            episode: "T6E8: Nadie",
            title: "Graduación como Asesina sin Rostro",
            image: "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=800&q=80",
            summary: "Derrota a la Niña Abandonada y reclama su nombre Arya Stark.",
            details: "Se niega a olvidar su identidad y anuncia a Jaqen H'ghar que regresa a su hogar en Invernalia.",
            impact: "Domina el cambio de rostros."
          },
          {
            id: "got-arya-2",
            season: 8,
            episode: "T8E3: La Larga Noche",
            title: "Eliminación del Rey de la Noche",
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
            summary: "Mata al Rey de la Noche con la daga de acero valyrio.",
            details: "Se lanza en el Bosque de los Dioses y le clava la daga en el pecho desintegrando a todos los espectros.",
            impact: "Salva a la humanidad de la extinción."
          },
          {
            id: "got-arya-3",
            season: 8,
            episode: "T8E6: El Trono de Hierro",
            title: "Zarpe hacia lo Desconocido (Oeste de Poniente)",
            isFinalFate: true,
            image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
            summary: "Zarpa en un navío Stark a explorar lo que hay al oeste de los mapas conocidos.",
            details: "Rechaza el matrimonio y los títulos nobiliarios, equipa su propio barco con el lobo huargo en las velas y emprende una expedición hacia el océano desconocido al oeste de Poniente.",
            impact: "Arya se convierte en la mayor exploradora de su tiempo."
          }
        ]
      },
      {
        id: "tyrion-lannister",
        name: "Tyrion Lannister",
        zona: "Desembarco del Rey & Roca Casterly",
        edad: "41 - 50 años",
        actor: "Peter Dinklage",
        house: "Casa Lannister",
        role: "Mano del Rey",
        status: "Mano del Rey Bran el Tullido",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        quote: "Bebo y sé cosas.",
        summary: "Estratega político perspicaz que sirvió como Mano del Rey a múltiples gobernantes y reconstruyó el reino.",
        events: [
          {
            id: "got-tyrion-1",
            season: 2,
            episode: "T2E9: Aguasnegras",
            title: "Victoria con Fuego Valyrio",
            image: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
            summary: "Destruye la flota de Stannis Baratheon en la Bahía del Aguasnegras.",
            details: "Diseña la trampa con fuego valyrio verde y lidera la contraofensiva de la capital.",
            impact: "Salva la capital de caer conquistada."
          },
          {
            id: "got-tyrion-2",
            season: 8,
            episode: "T8E6: El Trono de Hierro",
            title: "Designación como Mano del Rey Bran el Tullido",
            isFinalFate: true,
            image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
            summary: "Propone a Bran como Rey y es nombrado Mano para reconstruir Poniente.",
            details: "En el Gran Consejo de los Señores, Tyrion pronuncia su célebre discurso sobre las historias que unen a la gente y propone a Bran el Tullido como Monarca. Es nombrado Mano del Rey como penitencia para dedicarse al bienestar del pueblo.",
            impact: "Tyrion lidera el Consejo Pequeño para restaurar la paz en los Siete Reinos."
          }
        ]
      }
    ]
  },
  {
    id: "breaking-bad",
    title: "Breaking Bad",
    originalTitle: "Breaking Bad",
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
    genre: "Drama Criminal / Thriller",
    seasons: 5,
    episodes: 62,
    network: "AMC",
    tagline: "Un profesor de química desahuciado reinventado en señor del crimen.",
    description: "Walter White se asocia con su exalumno Jesse Pinkman para cocinar metanfetamina de máxima pureza azul.",
    characters: [
      {
        id: "walter-white",
        name: "Walter White (Heisenberg)",
        zona: "Albuquerque, Nuevo México",
        edad: "52 - 57 años",
        actor: "Bryan Cranston",
        house: "Imperio del Cristal Azul",
        role: "Señor de la Droga & Químico",
        status: "Fallecido (Desangrado en el laboratorio)",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
        quote: "Yo no estoy en peligro, Skyler. ¡Yo soy el peligro!",
        summary: "Profesor de química que se transformó en el temido capo del crimen organizado conocido como Heisenberg.",
        events: [
          {
            id: "bb-walt-1",
            season: 1,
            episode: "T1E1: Piloto",
            title: "Diagnóstico & Primera Hornada en la RV",
            image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
            summary: "Descubre su cáncer terminal y empieza a cocinar cristal con Jesse.",
            details: "Buscando dinero rápido para su familia, sintetiza su primera metanfetamina azul.",
            impact: "Nace la leyenda de Heisenberg."
          },
          {
            id: "bb-walt-2",
            season: 4,
            episode: "T4E13: Face Off",
            title: "Eliminación de Gustavo Fring",
            image: "https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=800&q=80",
            summary: "Bomba en la residencia con Héctor Salamanca para matar a Gus Fring.",
            details: "Pacta con Héctor y destruye a Fring tomándole el relevo absoluto.",
            impact: "Walt toma el monopolio del metanfetamina."
          },
          {
            id: "bb-walt-3",
            season: 5,
            episode: "T5E16: Felina",
            title: "Rescate de Jesse & Muerte en el Laboratorio",
            isFinalFate: true,
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
            summary: "Utiliza una torreta automática para liberar a Jesse y fallece satisfecho.",
            details: "Walt acude al recinto de los neonazis, activa su metralleta robotizada en el maletero salvando a Jesse y muere desangrado acariciando un tanque de su querido laboratorio justo cuando entra la policía.",
            impact: "Garantiza la fortuna para sus hijos y da cierre a su imperio."
          }
        ]
      },
      {
        id: "jesse-pinkman",
        name: "Jesse Pinkman",
        zona: "Albuquerque & Alaska",
        edad: "28 - 33 años",
        actor: "Aaron Paul",
        house: "Asociados de Heisenberg",
        role: "Cocinero de Cristal",
        status: "Libre en Alaska (El Camino)",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
        quote: "¡Sí, ciencia, perra!",
        summary: "Joven atrapado en el torbellino de ambición de Heisenberg que finalmente logra su libertad.",
        events: [
          {
            id: "bb-jesse-1",
            season: 5,
            episode: "T5E16: Felina",
            title: "Huida en el Chevrolet El Camino",
            isFinalFate: true,
            image: "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=800&q=80",
            summary: "Asesina a Todd Alquist, se despide de Walt y huye gritando de alegría hacia una nueva vida.",
            details: "Tras ser rescatado por Walt, Jesse ahoga a Todd, rechaza dispararle a Walt y escapa conduciendo el coche El Camino entre lágrimas de alivio, dirigiéndose hacia Alaska con identidad falsa como Mr. Driscoll.",
            impact: "Jesse inicia una vida pacífica en Alaska libre del crimen."
          }
        ]
      }
    ]
  },
  {
    id: "stranger-things",
    title: "Stranger Things",
    originalTitle: "Stranger Things",
    poster: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
    genre: "Ciencia Ficción / Terror 80s",
    seasons: 4,
    episodes: 34,
    network: "Netflix",
    tagline: "El Mundo del Revés acecha bajo Hawkins.",
    description: "Experimentos secretos y criaturas de otra dimensión irrumpen en la vida de un pueblo de Indiana.",
    characters: [
      {
        id: "eleven",
        name: "Once (Eleven / Jane Hopper)",
        aliases: ["Eleven", "Jane Hopper", "Once", "El", "Jane Ives"],
        zona: "Hawkins, Indiana",
        edad: "12 - 18 años",
        actor: "Millie Bobby Brown",
        house: "Laboratorio de Hawkins",
        role: "Joven con Telequinesis",
        status: "Luchando en la batalla final de Hawkins",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
        quote: "Los amigos no mienten.",
        summary: "Niña con poderes psicoquinéticos excepcionales que protege a Hawkins de las fuerzas oscuras de Vecna.",
        events: [
          {
            id: "st-el-1",
            season: 1,
            episode: "T1E8: El del Revés",
            title: "Pulverización del Demogorgon",
            image: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
            summary: "Utiliza su poder al máximo para desintegrar al monstruo en la escuela.",
            details: "Salva a Mike, Dustin y Lucas consumiendo sus fuerzas y desapareciendo en el Mundo del Revés.",
            impact: "Salva la vida de sus amigos."
          },
          {
            id: "st-el-2",
            season: 4,
            episode: "T4E9: El plan",
            title: "Combate Psíquico contra Vecna & Resurrección de Max",
            isFinalFate: true,
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
            summary: "Proyecta su mente para frenar a Vecna y reinicia el corazón de Max.",
            details: "Once viaja astralmente a la mente de Max para luchar contra Henry Creel (Vecna). Aunque Vecna abre las grietas en Hawkins, Once logra salvar a Max de la muerte permanente reiniciando su corazón con telequinesis.",
            impact: "Se prepara con la pandilla para la guerra definitiva contra el Mundo del Revés."
          }
        ]
      }
    ]
  }
];

// Helper to get series database with localStorage persistence
export function getStoredSeriesDatabase() {
  const local = localStorage.getItem('y_que_paso_series_db');
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      console.error("Error reading localStorage", e);
    }
  }
  return initialSeriesDatabase;
}

export function saveStoredSeriesDatabase(data) {
  localStorage.setItem('y_que_paso_series_db', JSON.stringify(data));
}
