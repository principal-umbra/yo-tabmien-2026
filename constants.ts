
import { Chapter } from './types';

// Helper to generate placeholder chapters
const generateChapter = (id: number): Chapter => ({
  id,
  title: `Vida ${id}`,
  subtitle: "El Eco del Tiempo",
  era: "Era Desconocida",
  story: "La memoria es borrosa aquí... Las arenas del tiempo han cubierto los detalles, pero el sentimiento permanece.",
  riddle: {
    question: "¿Qué es lo que siempre viene pero nunca llega?",
    answer: "mañana",
    hintPrompt: "Un enigma sobre el tiempo y la esperanza.",
  },
  image: "https://picsum.photos/800/600",
  fragmentCode: `X${id}9`,
  rewardBadge: "Espíritu Errante"
});

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "Capítulo Uno",
    subtitle: "El Temblor de las Manos",
    era: "Río Volkhov, 980 d.C.", 
    story: `Tú no querías venir...`, // (Contenido abreviado para constants, el full está en DB)
    riddle: {
      question: "¿Qué es lo único que tiembla en el guerrero cuando sostiene lo que ama?",
      answer: "manos",
      hintPrompt: "Es una parte del cuerpo. Rurik dice que tiemblan cuando le importa algo.",
    },
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAchYEd22enp6JiSqPFtpYsm5J9IXAJ6d0mU3ks4EpqyUNRcfDM1J6shLUNizyuKIQ2R3TDzB9Tlg_btOVx89H_nxb0yjhos9BIiGr2Daepgzmi4TcJBNSKD7QJbSXahlPDxaEo6Wr7mzXSXSy2X1jeaFygmA0fbjRtparo9flREdE1de4ir3gCBCSvPEBuP-BkHb6CDqdQSxzotjuNWxtZxq-v2digmCOx2WizrafoO6MsXJkHdBNewZnITbGNst06xb5WWJPhl_1c", 
    fragmentCode: "RURIK-980", 
    rewardBadge: "Guardián del Río",
    profile: {
        characterName: "Rurik",
        archetype: "EL GUERRERO",
        element: "Hielo",
        description: "En las frías tierras del norte, donde la fuerza es la única ley, Rurik existía como una contradicción viviente. Un hombre construido para la guerra, con manos capaces de partir leña y huesos, pero habitado por una ternura secreta que solo tú pudiste desenterrar. Su silencio no era vacío, sino un refugio que construyó para protegerte del mundo brutal que os rodeaba.",
        roleDescription: "Protector silencioso. Enseñó que la verdadera fuerza no reside en no tener miedo, sino en actuar a pesar de él. Su alma está marcada por la lealtad absoluta.",
        timeTogether: "42 Inviernos",
        bondType: "Compañero Destinado"
    }
  },
  {
    id: 2,
    title: "Capítulo Dos",
    subtitle: "La Última Luz",
    era: "Pompeya, 79 d.C.",
    story: `Pompeya olía a pan y a ceniza...`,
    riddle: {
      question: "Tengo cuerpo de barro y sangre de aceite. Cuando todo se apaga, yo permanezco. ¿Qué soy?",
      answer: "lampara",
      hintPrompt: "Es el objeto que Elio coleccionaba. Necesita mecha y fuego.",
    },
    image: "https://picsum.photos/id/1040/800/600",
    fragmentCode: "ELIO-79",
    rewardBadge: "Custodio de la Llama",
    profile: {
        characterName: "Elio",
        archetype: "EL CUSTODIO",
        element: "Fuego",
        description: "Entre el polvo de Pompeya y el olor a aceite de oliva, Elio encontró belleza en lo cotidiano. No buscaba gloria ni riqueza, solo preservar la pequeña luz que cada lámpara albergaba. Su amor fue como esa llama: constante, cálida y capaz de desafiar la oscuridad más absoluta, incluso cuando el cielo se volvió negro.",
        roleDescription: "Guardator de la esperanza. Su propósito fue enseñarte que incluso cuando el mundo se desmorona, la luz interior no puede ser extinguida si hay alguien que la cuide.",
        timeTogether: "Una vida y un final",
        bondType: "Llama Gemela"
    }
  },
  {
    id: 3,
    title: "Capítulo Tres",
    subtitle: "El Hombre de los Sueños",
    era: "Montañas Qinling, 618 d.C.",
    story: `En las montañas sagradas...`,
    riddle: {
      question: "¿Qué construimos cada noche sin manos y perdemos cada mañana sin ladrones?",
      answer: "sueño",
      hintPrompt: "Lian decía que hasta los muertos lo hacen.",
    },
    image: "https://picsum.photos/id/16/800/600",
    fragmentCode: "LIAN-618",
    rewardBadge: "Tejedor de Niebla",
    profile: {
        characterName: "Lian",
        archetype: "EL SANADOR",
        element: "Niebla",
        description: "En la soledad de las cumbres, Lian comprendió que la realidad y el sueño son dos caras de la misma moneda. Su medicina no eran solo hierbas, sino presencia. Te enseñó que el amor trasciende la vigilia y que dos almas pueden encontrarse en el plano onírico mucho antes de que sus cuerpos coincidan.",
        roleDescription: "Guía espiritual. Su conexión contigo rompió las barreras de lo físico, demostrando que la espera no es una pérdida de tiempo, sino una preparación.",
        timeTogether: "Eterno Retorno",
        bondType: "Alma Espejo"
    }
  },
  {
    id: 4,
    title: "Capítulo Cuatro",
    subtitle: "El Peso del Hielo",
    era: "Islas Lofoten, 1850",
    story: `En las islas donde el mar es gris...`,
    riddle: {
      question: "Tengo brazos pero no abrazo, tengo peso pero no vida. Si me tiras, me quedo; si me levas, me voy. ¿Qué soy?",
      answer: "ancla",
      hintPrompt: "Es de hierro, vive en los barcos y sirve para detenerse.",
    },
    image: "https://picsum.photos/id/305/800/600",
    fragmentCode: "LARS-1850",
    rewardBadge: "Espalda de Hierro",
    profile: {
        characterName: "Lars",
        archetype: "EL ANCLA",
        element: "Mar",
        description: "Curtido por la sal y el viento helado, Lars era un hombre que creía que su propósito era cargar con el dolor ajeno. Su amor no fue de palabras dulces, sino de actos silenciosos: leña en la puerta, redes reparadas, una mano firme en la tormenta. Te enseñó la dignidad del sacrificio.",
        roleDescription: "Sostén inquebrantable. Su rol fue demostrar que amar también es dejarse cuidar, y que incluso el hierro más fuerte necesita calor para no quebrarse.",
        timeTogether: "15 Años de Mareas",
        bondType: "Vínculo Kármico"
    }
  },
  {
    id: 5,
    title: "Capítulo Cinco",
    subtitle: "El Cartero de la Frontera",
    era: "Frontera Finlandia-Rusia, 1939",
    story: `En la frontera helada...`,
    riddle: {
      question: "Atravieso fronteras sin piernas, hablo sin boca y guardo secretos bajo un sello. ¿Qué soy?",
      answer: "carta",
      hintPrompt: "Es el objeto que Semyon llevaba en su mochila.",
    },
    image: "https://picsum.photos/id/903/800/600",
    fragmentCode: "SEMYON-39",
    rewardBadge: "Mensajero de Nieve",
    profile: {
        characterName: "Semyon",
        archetype: "EL MENSAJERO",
        element: "Viento",
        description: "Un fantasma que cruzaba líneas enemigas armado solo con papel y tinta. Semyon entendía que una carta puede pesar más que una bala. Su amor fue fugaz y peligroso, hecho de encuentros furtivos y despedidas al amanecer, pero sostuvo la esperanza de cientos de almas.",
        roleDescription: "Conector de mundos. Te enseñó que las palabras son hilos invisibles que mantienen unidos a quienes la guerra intenta separar.",
        timeTogether: "Instantes Robados",
        bondType: "Amor Trágico"
    }
  },
  {
    id: 6,
    title: "Capítulo Seis",
    subtitle: "El Remendón de Matera",
    era: "Matera, 1948",
    story: `En las cuevas de piedra...`,
    riddle: {
      question: "Tengo lengua y no hablo, tengo alma y no siento, te protejo del suelo pero sin ti no me muevo. ¿Qué soy?",
      answer: "zapato",
      hintPrompt: "Lo que Dino reparaba en su cueva.",
    },
    image: "https://picsum.photos/id/406/800/600",
    fragmentCode: "DINO-1948",
    rewardBadge: "Caminante de Piedra",
    profile: {
        characterName: "Dino",
        archetype: "EL ARTESANO",
        element: "Piedra",
        description: "En la pobreza de los Sassi, Dino encontraba dignidad en lo roto. Con sus manos y su silencio, reparaba lo que otros desechaban. Su amor fue una lección de reconstrucción: no importa cuán gastada esté el alma, con paciencia y cuidado, siempre se puede volver a caminar.",
        roleDescription: "Restaurador. Su misión fue curar las heridas del pasado, demostrando que las cicatrices son solo costuras que nos hacen más fuertes.",
        timeTogether: "30 Años de Pasos",
        bondType: "Alma Compañera"
    }
  }
];

// Fill the rest programmatically for the demo
for (let i = 7; i <= 14; i++) {
  CHAPTERS.push({
    ...generateChapter(i),
    image: `https://picsum.photos/id/${i * 10}/800/600`,
    fragmentCode: String.fromCharCode(64 + i) + i
  });
}
