# Atividade MapReduce

Desenvolvido por [Maurício Bernardo](https://github.com/maueici0) e [Marianna Lopes ](https://github.com/MariLopes1223) para a disciplina de Sistemas Distribuidos.

### 1. Estrutura do Projeto

```
.
├── chunks/                # Arquivos chunk0.txt até chunk9.txt (entrada)
│   ├── chunk0.txt
│   ├── chunk1.txt
│   ├── ...
│   └── chunk9.txt
├── intermediates/         # Saída dos mappers (JSONs com pares palavra: contagem)
├── reducer_inputs/        # Entrada para reducers após shuffle
├── reducer_outputs/       # Saída final de cada reducer
├── final_result.txt       # Arquivo final unificado pelo coordinator
├── mapper.js              # Worker Mapper
├── reducer.js             # Worker Reducer
├── shuffle.js             # Shuffle entre Map e Reduce
├── coordinator.js         # Gerenciador geral
├── util.js                # Funções auxiliares
├── Dockerfile
├── docker-compose.yml
└── package.json
```

> O nome dos arquivos deve seguir exatamente o padrão `chunk0.txt` até `chunk9.txt`


### 2. Como executar

**Pré-requisitos:**
- Docker
- Docker Compose

1. Instale as depências:

```bash
npm install
```
2. Crie os diretórios necessários:

```bash
mkdir -p chunks intermediates reducer_inputs reducer_outputs
```

3. Divida seus dados em 10 partes e salve os arquivos como `chunk0.txt` até `chunk9.txt` dentro da pasta `chunks/`.

4. Execute o ambiente Docker:

```bash
docker-compose up --build
```

A aplicação automaticamente:

- Enfileira tarefas para os mappers  
- Executa a fase de Map
- Aguarda todos os mappers concluírem  
- Executa o Shuffle e distribui os dados para reducers  
- Executa a fase de Reduce
- Junta os resultados finais em `final_result.txt`
