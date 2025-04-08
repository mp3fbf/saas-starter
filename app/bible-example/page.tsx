// app/bible-example/page.tsx

// Define o tipo de dados que esperamos receber da API para um versículo
// Isso ajuda o TypeScript a verificar nosso código e previne erros.
interface BibleVerse {
  book: {
    abbrev: { pt: string; en: string };
    name: string;
    author: string;
    group: string;
    version: string;
  };
  chapter: number;
  number: number;
  text: string;
}

// Função assíncrona para buscar o versículo da API
// 'async' permite usar 'await' para esperar a resposta da rede
async function fetchVerse(version: string, abbrev: string, chapter: number, verseNum: number): Promise<BibleVerse | null> {
  // Constrói a URL da API com os parâmetros recebidos
  const apiUrl = `https://www.abibliadigital.com.br/api/verses/${version}/${abbrev}/${chapter}/${verseNum}`;

  try {
    // Faz a requisição GET para a API usando 'fetch'
    // 'await' pausa a execução aqui até a resposta chegar
    const response = await fetch(apiUrl, {
        // 'next: { revalidate: 3600 }' diz ao Next.js para guardar o resultado (cache) por 1 hora (3600 segundos)
        // Isso evita buscar o mesmo versículo repetidamente e economiza chamadas à API.
        next: { revalidate: 3600 }
    });

    // Verifica se a resposta da API foi bem-sucedida (código HTTP 2xx)
    if (!response.ok) {
      // Se não foi ok, registra um erro no console do servidor
      console.error(`Erro ao buscar versículo: ${response.statusText}`);
      // Retorna null para indicar que a busca falhou
      return null;
    }

    // Converte a resposta da API (que está em formato JSON) para um objeto JavaScript
    // 'await' espera a conversão terminar
    // Especificamos o tipo <BibleVerse> para o TypeScript saber o que esperar
    const data: BibleVerse = await response.json();

    // Retorna os dados do versículo
    return data;

  } catch (error) {
    // Se ocorrer qualquer outro erro durante a busca (ex: problema de rede)
    // Registra o erro no console do servidor
    console.error("Erro na requisição fetch:", error);
    // Retorna null para indicar falha
    return null;
  }
}

// Este é o componente da página (Server Component por padrão no App Router)
// Ele também é 'async' porque precisa chamar a função 'fetchVerse' que usa 'await'
export default async function BibleExamplePage() {
  // Chama a função para buscar Gênesis 1:1 na versão 'nvi' (era jo, 3, 16)
  const verseData = await fetchVerse('nvi', 'gn', 1, 1);

  // Renderiza o conteúdo da página
  return (
    <div>
      <h1>Exemplo de Versículo da Bíblia</h1>
      {/* Verifica se 'verseData' não é null (ou seja, a busca foi bem-sucedida) */}
      {verseData ? (
        // Se temos os dados, exibe as informações
        <div>
          {/* Exibe a referência: Livro Capítulo:Versículo */}
          <h2>{verseData.book.name} {verseData.chapter}:{verseData.number} ({verseData.book.version.toUpperCase()})</h2>
          {/* Exibe o texto do versículo */}
          <p>{verseData.text}</p>
        </div>
      ) : (
        // Se 'verseData' for null, exibe uma mensagem de erro
        <p>Não foi possível carregar o versículo.</p>
      )}
    </div>
  );
}
