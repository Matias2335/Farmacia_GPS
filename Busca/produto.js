import { useState, useEffect } from 'react';
import { supabase } from '../Config/supabase';
import { MEDICAMENTOS_CONTROLADOS } from '../components/controlados';

// ─── MEDICAMENTOS ─────────────────────────────────────────────────────────────
import {
  GENERICOS,
  ANALGESICOS,
  ANTI_HIPERTENSIVOS,
  ANTIDIABETICOS,
  ANTI_CONCEPCIONAIS,
  ENXAGUANTE_BUCAL as ENXAGUANTE_BUCAL_MED,
} from '../components/Medicamentos';

// ─── MAMÃE & BEBÊ ─────────────────────────────────────────────────────────────
import {
  FRALDA,
  LENCO_UMIDECIDO,
  POMADA_DE_ASSADURA,
  FORMULA_INFANTIL_LEITE,
  SHAMPOO_CONDICIONADOR_INFANTIL,
  SABONETE_INFANTIL,
  HIDRATANTE_INFANTIL,
  MAMADEIRA_AMAMENTACAO,
} from '../components/Mamae_Bebe';

// ─── HIGIENE PESSOAL ──────────────────────────────────────────────────────────
// Higiene_1.js não exporta os arrays — replicados aqui com caminhos corretos.

const SABONETES = [
  { nome: 'Granado Enxofre',   preco: 'R$ 8,00',  img: require('../components/Higiene_Pessoal/Sabonete/SaboneteEnxofre.webp')  },
  { nome: 'Dove Original',     preco: 'R$ 4,99',  img: require('../components/Higiene_Pessoal/Sabonete/Dove_Original.webp')    },
  { nome: 'Protex Vitamina E', preco: 'R$ 4,19',  img: require('../components/Higiene_Pessoal/Sabonete/sabonete_protex.webp')  },
  { nome: 'Dove Baby',         preco: 'R$ 4,39',  img: require('../components/Higiene_Pessoal/Sabonete/sabonetedovebaby.webp') },
  { nome: 'Johnsons Baby',     preco: 'R$ 4,39',  img: require('../components/Higiene_Pessoal/Sabonete/johnsonsbaby.webp')     },
  { nome: 'Íntimo Kronel',     preco: 'R$ 27,90', img: require('../components/Higiene_Pessoal/Sabonete/saboneteKronel.webp')   },
  { nome: 'Líquido Nivea',     preco: 'R$ 18,99', img: require('../components/Higiene_Pessoal/Sabonete/sabonetenivea.jpg')     },
  { nome: 'Protex Baby',       preco: 'R$ 5,49',  img: require('../components/Higiene_Pessoal/Sabonete/sabonete_protex.webp')  },
];

const DESODORANTES = [
  { nome: 'Rexona Men Clinical',  preco: 'R$ 23,90', img: require('../components/Higiene_Pessoal/Desodorante/Desodorante_Rexona_Men_Clinical_Clean.webp') },
  { nome: 'Dove Men+Care',        preco: 'R$ 29,79', img: require('../components/Higiene_Pessoal/Desodorante/DesodoranteDoveMenCare.webp')                },
  { nome: 'Dove Original',        preco: 'R$ 15,50', img: require('../components/Higiene_Pessoal/Desodorante/Desodorante_Dove_Original.webp')             },
  { nome: 'Nivea Black & White',  preco: 'R$ 15,50', img: require('../components/Higiene_Pessoal/Desodorante/desodoranteblackwhite.webp')                 },
  { nome: 'Rexona Women Powder',  preco: 'R$ 19,49', img: require('../components/Higiene_Pessoal/Desodorante/Desodorante_Women_Power.webp')               },
  { nome: 'Dove Sem Perfume',     preco: 'R$ 16,90', img: require('../components/Higiene_Pessoal/Desodorante/Desodorante_Dove_SemPerfume.webp')           },
  { nome: 'Nivea Sensitive',      preco: 'R$ 23,84', img: require('../components/Higiene_Pessoal/Desodorante/Desodorante_Sensitive.webp')                 },
  { nome: 'Rexona Bamboo',        preco: 'R$ 14,90', img: require('../components/Higiene_Pessoal/Desodorante/Desodorante_Bamboo.webp')                    },
];

const PASTA_DE_DENTE = [
  { nome: 'Boni Natural',  preco: 'R$ 19,99', img: require('../components/Higiene_Pessoal/Pasta_de_Dente/Pasta_Boni.webp')       },
  { nome: 'Close Up',      preco: 'R$ 6,49',  img: require('../components/Higiene_Pessoal/Pasta_de_Dente/Pasta_Closeup.webp')    },
  { nome: 'Colgate',       preco: 'R$ 6,89',  img: require('../components/Higiene_Pessoal/Pasta_de_Dente/Pasta_Colgate.webp')    },
  { nome: 'Curaprox',      preco: 'R$ 41,99', img: require('../components/Higiene_Pessoal/Pasta_de_Dente/Pasta_Curaprox.webp')   },
  { nome: 'Elmex',         preco: 'R$ 26,39', img: require('../components/Higiene_Pessoal/Pasta_de_Dente/Pasta_Elmex.webp')      },
  { nome: 'Oral-B',        preco: 'R$ 7,64',  img: require('../components/Higiene_Pessoal/Pasta_de_Dente/Pasta_OralB.webp')     },
  { nome: 'Parodontax',    preco: 'R$ 23,90', img: require('../components/Higiene_Pessoal/Pasta_de_Dente/Pasta_Paradontax.webp') },
  { nome: 'Sensodyne',     preco: 'R$ 31,99', img: require('../components/Higiene_Pessoal/Pasta_de_Dente/Pasta_Sensodyne.webp')  },
];

const ABSORVENTES = [
  { nome: 'Always Suave',           preco: 'R$ 12,90', img: require('../components/Higiene_Pessoal/Absorvente/Absorvente_Always_Suave.webp') },
  { nome: 'Always Noturno',         preco: 'R$ 14,90', img: require('../components/Higiene_Pessoal/Absorvente/Always_noturno.webp')           },
  { nome: 'Intimus Gel',            preco: 'R$ 11,50', img: require('../components/Higiene_Pessoal/Absorvente/Intimus_Gel.webp')               },
  { nome: 'Intimus Protetor',       preco: 'R$ 9,90',  img: require('../components/Higiene_Pessoal/Absorvente/Intimus_Protetor.webp')          },
  { nome: 'Sempre Livre Noturno',   preco: 'R$ 13,90', img: require('../components/Higiene_Pessoal/Absorvente/Sempre_Livre_Noturno.webp')      },
  { nome: 'Sempre Livre Suave',     preco: 'R$ 10,90', img: require('../components/Higiene_Pessoal/Absorvente/Sempre_Livre_Suave.webp')        },
  { nome: 'Carefree Original',      preco: 'R$ 7,90',  img: require('../components/Higiene_Pessoal/Absorvente/Carrefree.webp')                 },
  { nome: 'Always Protetor Diário', preco: 'R$ 8,90',  img: require('../components/Higiene_Pessoal/Absorvente/Always_Protetor_Diario.webp')   },
];

const ESCOVAS = [
  { nome: 'Oral-B Series 1',    preco: 'R$ 239,90', img: require('../components/Higiene_Pessoal/Escovas/Escova_Oral_Pro.webp')     },
  { nome: 'Oral-B Pro-Saúde',   preco: 'R$ 27,19',  img: require('../components/Higiene_Pessoal/Escovas/Escova_Oral_B.webp')       },
  { nome: 'Sensodyne Sensitive', preco: 'R$ 11,90',  img: require('../components/Higiene_Pessoal/Escovas/Escova_Sensodyne.webp')   },
  { nome: 'Philips Sonicare',    preco: 'R$ 160,45', img: require('../components/Higiene_Pessoal/Escovas/Escova_Sonicare.webp')    },
  { nome: 'Oral-B Ultrafino',    preco: 'R$ 17,99',  img: require('../components/Higiene_Pessoal/Escovas/Escova_Ultrafino.webp')   },
  { nome: 'Colgate Extra Clean', preco: 'R$ 19,90',  img: require('../components/Higiene_Pessoal/Escovas/Escova_Extra_Clean.webp') },
  { nome: 'Reach Advanced',      preco: 'R$ 138,60', img: require('../components/Higiene_Pessoal/Escovas/Escova_Reach.webp')       },
  { nome: 'Oral-B Kids',         preco: 'R$ 11,90',  img: require('../components/Higiene_Pessoal/Escovas/Escova_Kids.webp')        },
];

const ENXAGUANTE_BUCAL_HIG = [
  { nome: 'Listerine Cool Mint',  preco: 'R$ 24,39', img: require('../components/Higiene_Pessoal/Enxaguante_Bucal/Listerine_Cool_Mint.webp')  },
  { nome: 'Colgate Plax Fresh',   preco: 'R$ 19,99', img: require('../components/Higiene_Pessoal/Enxaguante_Bucal/Colgate_Plax_Fresh.webp')   },
  { nome: 'Oral-B Complete',      preco: 'R$ 16,90', img: require('../components/Higiene_Pessoal/Enxaguante_Bucal/Oral_B_Complete.webp')      },
  { nome: 'CloseUp Fresh',        preco: 'R$ 8,45',  img: require('../components/Higiene_Pessoal/Enxaguante_Bucal/CloseUp_Fresh.webp')        },
  { nome: 'Scope Fresh Mint',     preco: 'R$ 51,73', img: require('../components/Higiene_Pessoal/Enxaguante_Bucal/Scope_Fresh_Mint.webp')     },
  { nome: 'Cepacol Ice',          preco: 'R$ 8,13',  img: require('../components/Higiene_Pessoal/Enxaguante_Bucal/Cepacol_Ice.webp')          },
  { nome: 'Periogard Clean',      preco: 'R$ 25,70', img: require('../components/Higiene_Pessoal/Enxaguante_Bucal/Periogard_Clean.webp')      },
  { nome: 'Colgate Total Fresh',  preco: 'R$ 13,49', img: require('../components/Higiene_Pessoal/Enxaguante_Bucal/Colgate_Total_Fresh.webp')  },
];

// ─── CABELOS ──────────────────────────────────────────────────────────────────
// Cabelos.js não exporta os arrays — replicados aqui com caminhos corretos.

const SHAMPOO = [
  { nome: 'Shampoo FreshClean', preco: 'R$ 109,90', img: require('../components/Cabelos/Shampoo/Fresh_Clean.jpg')  },
  { nome: 'Shampoo VitaHair',   preco: 'R$ 37,90',  img: require('../components/Cabelos/Shampoo/Vita_Hair.webp')  },
  { nome: 'Shampoo HydraPlus',  preco: 'R$ 59,12',  img: require('../components/Cabelos/Shampoo/Hydra_Plus.webp') },
  { nome: 'Shampoo PureCare',   preco: 'R$ 43,90',  img: require('../components/Cabelos/Shampoo/Pure_Care.webp')  },
];


// ─── SET DE CONTROLADOS ───────────────────────────────────────────────────────
// Mesma lógica do Medicamentos.js: Set para lookup O(1).
const REQUER_RECEITA = new Set(MEDICAMENTOS_CONTROLADOS);


// ─── HOOK: RECEITAS APROVADAS ─────────────────────────────────────────────────
/**
 * Consulta o Supabase e retorna apenas os medicamentos com receita APROVADA
 * para o usuário logado. Idêntico ao useReceitasAprovadas() de Medicamentos.js.
 *
 * Use este hook na tela de busca para alimentar isBloqueado().
 *
 * Exemplo de uso na tela:
 *   const { medicamentosLiberados, recarregar } = useReceitasAprovadas();
 *   const bloqueado = isBloqueado(produto.nome, medicamentosLiberados);
 */
export function useReceitasAprovadas() {
  const [medicamentosLiberados, setMedicamentosLiberados] = useState([]);

  async function carregar() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMedicamentosLiberados([]);
        return;
      }

      const { data, error } = await supabase
        .from('receitas')
        .select('medicamento')
        .eq('user_id', user.id)
        .eq('status', 'aprovado'); // 🔒 pendente e rejeitado NÃO desbloqueiam

      if (error) {
        console.log(error);
        return;
      }

      setMedicamentosLiberados(data.map(item => item.medicamento));
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return { medicamentosLiberados, recarregar: carregar };
}


// ─── HELPER: PRODUTO ESTÁ BLOQUEADO? ─────────────────────────────────────────
/**
 * Retorna true se o produto requer receita E o usuário ainda não tem aprovação.
 * Passe medicamentosLiberados vindo do hook useReceitasAprovadas().
 *
 * Na tela de busca, use assim no CardProduto:
 *   receitaAprovada={!isBloqueado(produto.nome, medicamentosLiberados)}
 */
export function isBloqueado(nomeProduto, medicamentosLiberados) {
  return REQUER_RECEITA.has(nomeProduto) && !medicamentosLiberados.includes(nomeProduto);
}


// ─── FUNÇÃO PARA PADRONIZAR OS PRODUTOS ──────────────────────────────────────
function normalizar(lista, tela) {
  return lista.map(p => ({
    nome: p.nome,
    preco: p.preco,
    imagem: p.img,
    tela: tela,
  }));
}


// ─── LISTA COMPLETA DE PRODUTOS ───────────────────────────────────────────────
export const TODOS_PRODUTOS = [
  // Medicamentos
  ...normalizar(GENERICOS,            'Genéricos'),
  ...normalizar(ANALGESICOS,          'Analgésicos'),
  ...normalizar(ANTI_HIPERTENSIVOS,   'Anti-Hipertensivos'),
  ...normalizar(ANTIDIABETICOS,       'Antidiabeticos'),
  ...normalizar(ANTI_CONCEPCIONAIS,   'Anti-Concepcionais'),
  ...normalizar(ENXAGUANTE_BUCAL_MED, 'Medicamentos'),

  // Higiene Pessoal
  ...normalizar(SABONETES,            'Higienes'),
  ...normalizar(DESODORANTES,         'Higienes'),
  ...normalizar(PASTA_DE_DENTE,       'Higienes'),
  ...normalizar(ABSORVENTES,          'Higienes'),
  ...normalizar(ESCOVAS,              'Higienes'),
  ...normalizar(ENXAGUANTE_BUCAL_HIG, 'Higienes'),

  // Cabelos
  ...normalizar(SHAMPOO,              'Cabelos'),

  // Mamãe & Bebê
  ...normalizar(FRALDA,                        'Mamae'),
  ...normalizar(LENCO_UMIDECIDO,               'Mamae'),
  ...normalizar(POMADA_DE_ASSADURA,            'Mamae'),
  ...normalizar(FORMULA_INFANTIL_LEITE,        'Mamae'),
  ...normalizar(SHAMPOO_CONDICIONADOR_INFANTIL,'Mamae'),
  ...normalizar(SABONETE_INFANTIL,             'Mamae'),
  ...normalizar(HIDRATANTE_INFANTIL,           'Mamae'),
  ...normalizar(MAMADEIRA_AMAMENTACAO,         'Mamae'),
];


// ─── FUNÇÃO DE BUSCA ──────────────────────────────────────────────────────────
export function buscarProdutos(texto) {
  if (!texto || texto.trim() === '') return [];

  const termo = texto.toLowerCase().trim();

  return TODOS_PRODUTOS.filter(p =>
    p.nome.toLowerCase().includes(termo)
  );
}