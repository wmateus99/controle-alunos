// Função para carregar alunos do localStorage
function carregarAlunos(termoPesquisa = '') {
    const alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    const alunosLista = document.getElementById('alunos-lista');
    
    alunosLista.innerHTML = '';
    
    // Filtrar alunos com base no termo de pesquisa
    const alunosFiltrados = termoPesquisa 
        ? alunos.filter(aluno => 
            aluno.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) || 
            (aluno.codigo && aluno.codigo.toLowerCase().includes(termoPesquisa.toLowerCase()))
          )
        : alunos;
    
    if (alunosFiltrados.length === 0) {
        alunosLista.innerHTML = '<p class="sem-alunos">Nenhum aluno encontrado.</p>';
        return;
    }
    
    alunosFiltrados.forEach((aluno, index) => {
        const tempoRestante = calcularTempoRestante(aluno.previsao);
        
        const alunoCard = document.createElement('div');
        alunoCard.classList.add('aluno-card');
        alunoCard.innerHTML = `
            <button class="btn-delete" data-index="${alunos.indexOf(aluno)}">
                <i class="fas fa-trash"></i>
            </button>
            <h3>${aluno.nome}</h3>
            <div class="aluno-info">
                <p><i class="icon-i fas fa-id-card"></i> Código: <span>${aluno.codigo || 'N/A'}</span></p>
                <p><i class="icon-i fas fa-book"></i> Curso: <span>${aluno.curso}</span></p>
                <p><i class="icon-i fas fa-calendar-check"></i> Previsão de Término: <span>${formatarData(aluno.previsao)}</span></p>
            </div>
            <div class="tempo-restante">
                <p><strong>Tempo Restante:</strong></p>
                <p><i class="fas fa-calendar-alt"></i> Total em meses: ${tempoRestante.meses} meses</p>
                <p><i class="fas fa-calendar-week"></i> Total em semanas: ${tempoRestante.semanas} semanas</p>
                <p><i class="fas fa-calendar-day"></i> Total em dias: ${tempoRestante.dias} dias</p>
            </div>
            <button class="btn-calc-dias" data-previsao="${aluno.previsao}">
                <i class="fas fa-calculator"></i> Calcular dias específicos
            </button>
            <div class="dias-especificos-resultado" id="resultado-${alunos.indexOf(aluno)}"></div>
        `;
        
        alunosLista.appendChild(alunoCard);
    });
    
    // Adicionar event listeners para os botões de exclusão
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            excluirAluno(index);
        });
    });
}

// Função para adicionar um novo aluno
// Função para adicionar um novo aluno
function adicionarAluno(codigo, nome, curso, previsao) {
    const alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    
    alunos.push({
        codigo,
        nome,
        curso,
        previsao
    });
    
    localStorage.setItem('alunos', JSON.stringify(alunos));
    carregarAlunos();
}

// Função para excluir um aluno
function excluirAluno(index) {
    const alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
        alunos.splice(index, 1);
        localStorage.setItem('alunos', JSON.stringify(alunos));
        carregarAlunos();
    }
}

// Função para calcular o tempo restante até a previsão de término
function calcularTempoRestante(dataPrevisao) {
    const hoje = new Date();
    const dataFinal = new Date(dataPrevisao);
    
    // Se a data já passou, retorna zero
    if (dataFinal < hoje) {
        return { meses: 0, semanas: 0, dias: 0 };
    }
    
    // Diferença em milissegundos
    const diferencaMs = dataFinal - hoje;
    
    // Converter para dias
    const diasTotais = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
    
    // Calcular tempo total em diferentes unidades
    const meses = Math.floor(diasTotais / 30);
    const semanas = Math.floor(diasTotais / 7);
    const dias = diasTotais;
    
    return { meses, semanas, dias };
}

// Função para formatar a data no padrão brasileiro
function formatarData(data) {
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
}

// Event listener para o formulário de adição de aluno
document.getElementById('aluno-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const codigo = document.getElementById('codigo').value;
    const nome = document.getElementById('nome').value;
    const curso = document.getElementById('curso').value;
    const previsao = document.getElementById('previsao').value;
    
    adicionarAluno(codigo, nome, curso, previsao);
    
    // Limpar o formulário e escondê-lo
    this.reset();
    document.getElementById('form-container').style.display = 'none';
});

// Função para exportar dados
function exportarDados() {
    const alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    
    if (alunos.length === 0) {
        alert('Não há alunos para exportar.');
        return;
    }
    
    const dadosJSON = JSON.stringify(alunos, null, 2);
    const blob = new Blob([dadosJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alunos_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

// Função para importar dados
function importarDados(arquivo) {
    const leitor = new FileReader();
    
    leitor.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            if (!Array.isArray(dados)) {
                throw new Error('Formato de arquivo inválido.');
            }
            
            if (confirm(`Deseja importar ${dados.length} alunos? Isso substituirá os dados atuais.`)) {
                localStorage.setItem('alunos', JSON.stringify(dados));
                carregarAlunos();
                alert('Dados importados com sucesso!');
            }
        } catch (erro) {
            alert('Erro ao importar dados: ' + erro.message);
        }
    };
    
    leitor.readAsText(arquivo);
}

// Carregar alunos ao iniciar a página e configurar event listeners
document.addEventListener('DOMContentLoaded', function() {
    carregarAlunos();
    
    // Event listener para pesquisa
    const inputPesquisa = document.getElementById('pesquisa');
    const btnPesquisa = document.getElementById('btn-pesquisa');
    
    inputPesquisa.addEventListener('input', function() {
        carregarAlunos(this.value);
    });
    
    btnPesquisa.addEventListener('click', function() {
        carregarAlunos(inputPesquisa.value);
    });
    
    // Event listener para mostrar/esconder formulário
    document.getElementById('btn-toggle-form').addEventListener('click', function() {
        const formContainer = document.getElementById('form-container');
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
    });
    
    // Event listener para cancelar adição
    document.getElementById('btn-cancel').addEventListener('click', function() {
        document.getElementById('aluno-form').reset();
        document.getElementById('form-container').style.display = 'none';
    });
    
    // Event listener para exportar dados
    document.getElementById('btn-export').addEventListener('click', exportarDados);
    
    // Event listener para importar dados
    document.getElementById('btn-import').addEventListener('click', function() {
        document.getElementById('import-file').click();
    });
    
    document.getElementById('import-file').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            importarDados(e.target.files[0]);
            // Limpar o input para permitir selecionar o mesmo arquivo novamente
            e.target.value = '';
        }
    });
});

// Adicionar função para calcular dias específicos
function calcularDiasEspecificos(dataPrevisao, diasSelecionados) {
    const hoje = new Date();
    const dataFinal = new Date(dataPrevisao);
    
    // Se a data já passou, retorna zero
    if (dataFinal < hoje) {
        return 0;
    }
    
    let contador = 0;
    const dataAtual = new Date(hoje);
    
    // Definir hora para evitar problemas com horário de verão
    dataAtual.setHours(12, 0, 0, 0);
    
    while (dataAtual <= dataFinal) {
        // Dias da semana: 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
        const diaDaSemana = dataAtual.getDay();
        
        // Verificar se o dia atual está nos dias selecionados
        // Ajuste: Domingo = 0 no JavaScript, mas 7 na nossa interface
        const diaAjustado = diaDaSemana === 0 ? 7 : diaDaSemana;
        
        if (diasSelecionados.includes(diaAjustado)) {
            contador++;
        }
        
        // Avançar para o próximo dia
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    return contador;
}

// Adicionar event listeners para os botões de cálculo de dias específicos
document.addEventListener('DOMContentLoaded', function() {
    // Criar modal para seleção de dias
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>Selecione os dias da semana</h3>
            <div class="dias-semana">
                <label><input type="checkbox" value="1"> Segunda-feira</label>
                <label><input type="checkbox" value="2"> Terça-feira</label>
                <label><input type="checkbox" value="3"> Quarta-feira</label>
                <label><input type="checkbox" value="4"> Quinta-feira</label>
                <label><input type="checkbox" value="5"> Sexta-feira</label>
                <label><input type="checkbox" value="6"> Sábado</label>
                <label><input type="checkbox" value="7"> Domingo</label>
            </div>
            <button id="calcular-dias-btn" class="btn-add">Calcular</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Variáveis para armazenar dados temporários
    let dataPrevisaoAtual = '';
    let elementoResultadoAtual = null;
    
    // Event listener para abrir modal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-calc-dias') || 
            e.target.parentElement.classList.contains('btn-calc-dias')) {
            
            const btn = e.target.classList.contains('btn-calc-dias') ? 
                e.target : e.target.parentElement;
                
            dataPrevisaoAtual = btn.getAttribute('data-previsao');
            const index = btn.parentElement.querySelector('.btn-delete').getAttribute('data-index');
            elementoResultadoAtual = document.getElementById(`resultado-${index}`);
            
            // Limpar seleções anteriores
            modal.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            
            modal.style.display = 'flex';
        }
    });
    
    // Event listener para fechar modal
    document.querySelector('.close-modal').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Event listener para clicar fora do modal
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Event listener para botão calcular
    document.getElementById('calcular-dias-btn').addEventListener('click', function() {
        const diasSelecionados = Array.from(
            modal.querySelectorAll('input[type="checkbox"]:checked')
        ).map(cb => parseInt(cb.value));
        
        if (diasSelecionados.length === 0) {
            alert('Por favor, selecione pelo menos um dia da semana.');
            return;
        }
        
        const totalDias = calcularDiasEspecificos(dataPrevisaoAtual, diasSelecionados);
        
        // Mostrar resultado
        elementoResultadoAtual.innerHTML = `
            <div class="dias-especificos-box">
                <p><strong>Dias específicos restantes:</strong> ${totalDias} dias</p>
                <p class="dias-selecionados">Considerando apenas: ${obterNomesDias(diasSelecionados)}</p>
            </div>
        `;
        
        modal.style.display = 'none';
    });
});

// Função para obter nomes dos dias selecionados
function obterNomesDias(diasSelecionados) {
    const nomesDias = {
        1: 'Segunda-feira',
        2: 'Terça-feira',
        3: 'Quarta-feira',
        4: 'Quinta-feira',
        5: 'Sexta-feira',
        6: 'Sábado',
        7: 'Domingo'
    };
    
    return diasSelecionados.map(dia => nomesDias[dia]).join(', ');
}

// Function to sort students by remaining time in months
function sortAlunos(order) {
    const alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    const sortedAlunos = alunos.sort((a, b) => {
        const timeA = calcularTempoRestante(a.previsao).meses;
        const timeB = calcularTempoRestante(b.previsao).meses;
        return order === 'asc' ? timeA - timeB : timeB - timeA;
    });
    localStorage.setItem('alunos', JSON.stringify(sortedAlunos));
    carregarAlunos();
}

// Event listeners for sorting buttons
document.getElementById('sort-asc').addEventListener('click', function() {
    sortAlunos('asc');
});

document.getElementById('sort-desc').addEventListener('click', function() {
    sortAlunos('desc');
});

// Function to sort students alphabetically by name
function sortAlunosAlphabetically() {
    const alunos = JSON.parse(localStorage.getItem('alunos')) || [];
    const sortedAlunos = alunos.sort((a, b) => a.nome.localeCompare(b.nome));
    localStorage.setItem('alunos', JSON.stringify(sortedAlunos));
    carregarAlunos();
}

// Event listener for alphabetical sorting button
document.getElementById('sort-alpha').addEventListener('click', function() {
    sortAlunosAlphabetically();
});
