// Lista de itens para checklist (exemplo, pode personalizar)
const checklistItems = [
  'Verificar estado do equipamento',
  'Limpeza geral',
  'Teste de funcionamento',
  'Revisar conexões elétricas',
  'Conferir nível de gás',
  'Testar controle remoto',
  'Orientar cliente sobre uso',
];

// Função para criar checklist na div #checklist
function criarChecklist() {
  const checklistDiv = document.getElementById('checklist');
  checklistDiv.innerHTML = '';

  checklistItems.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'check-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `check-${index}`;

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.innerHTML = `<span>${item}</span>`;
    label.style.cursor = 'pointer';

    div.appendChild(checkbox);
    div.appendChild(label);

    checklistDiv.appendChild(div);
  });
}

// Função para limpar canvas por id
function limparCanvas(id) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Função para configurar canvas de assinatura
function configurarCanvas(id) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext('2d');
  let desenhando = false;
  let lastX, lastY;

  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  canvas.style.width = canvas.offsetWidth + 'px';
  canvas.style.height = canvas.offsetHeight + 'px';

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#0a4e8a';

  function iniciar(e) {
    desenhando = true;
    const rect = canvas.getBoundingClientRect();
    lastX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    lastY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  }

  function desenhar(e) {
    if (!desenhando) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
  }

  function parar() {
    desenhando = false;
  }

  canvas.addEventListener('mousedown', iniciar);
  canvas.addEventListener('touchstart', iniciar);
  canvas.addEventListener('mousemove', desenhar);
  canvas.addEventListener('touchmove', desenhar);
  canvas.addEventListener('mouseup', parar);
  canvas.addEventListener('mouseout', parar);
  canvas.addEventListener('touchend', parar);
  canvas.addEventListener('touchcancel', parar);
}

// INICIALIZAÇÃO CORRETA
window.addEventListener('DOMContentLoaded', () => {
  configurarCanvas('assinaturaCliente');
  configurarCanvas('assinaturaTecnico');

  const tipoServico = document.getElementById('tipoServico');
  const checklistCard = document.getElementById('checklistCard');
  const checklistDiv = document.getElementById('checklist');

  checklistCard.style.display = 'none';

  tipoServico.addEventListener('change', () => {
    if (tipoServico.value) {
      checklistCard.style.display = 'block';
      criarChecklist();
    } else {
      checklistCard.style.display = 'none';
      checklistDiv.innerHTML = '';
    }
  });
});

// ===============================
// 🔥 PDF FUNCIONANDO NO CELULAR
// ===============================
async function gerarPDF() {
  const { jsPDF } = window.jspdf;

  const elemento = document.querySelector("main");

  const canvas = await html2canvas(elemento, {
    scale: 2,
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save("ordem-servico.pdf");
}

// Função para gerar OS e imprimir com bordas e logo.png
document.getElementById('osForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const clienteNome = document.getElementById('clienteNome').value.trim();
  const clienteTelefone = document.getElementById('clienteTelefone').value.trim();
  const clienteEndereco = document.getElementById('clienteEndereco').value.trim();
  const dataServico = document.getElementById('dataServico').value;
  const tipoServico = document.getElementById('tipoServico').value;
  const descricao = document.getElementById('descricao').value.trim();
  const valor = document.getElementById('valor').value.trim();
  const pagamento = document.getElementById('pagamento').value.trim();

  if (!clienteNome || !tipoServico) {
    alert('Por favor, preencha os campos obrigatórios.');
    return;
  }

  const checklistDiv = document.getElementById('checklist');
  const itensMarcados = [];

  checklistDiv.querySelectorAll('input[type="checkbox"]').forEach((cb, i) => {
    if (cb.checked) itensMarcados.push(checklistItems[i]);
  });

  const checklistHtml = itensMarcados.length
    ? `<ul>${itensMarcados.map(item => `<li>${item}</li>`).join('')}</ul>`
    : '<p><em>Sem itens marcados</em></p>';

  const osHtml = `
  <div style="width:100%; font-family:Arial;">
    <style>
      @page { size: A4 landscape; margin: 20px; }
      body { margin:0; }
      table { width:100%; border-collapse: collapse; }
      td, th { border:1px solid #ccc; padding:8px; font-size:14px; }
      .sem-borda td { border:none; }
    </style>

    <table class="sem-borda" style="margin-bottom:10px;">
      <tr>
        <td style="width:70%;">
          <div style="display:flex; align-items:center; gap:15px;">
            <img src="./logo.png" style="height:60px;">
            <div>
              <strong style="font-size:18px;">CONFORTCLIM</strong><br>
              Climatização & Serviços<br>
              Tel: (86) 99512-2772<br>
              Email: Confortclim.pi@gmail.com
            </div>
          </div>
        </td>
        <td style="text-align:right;">
          <strong style="font-size:18px;">ORDEM DE SERVIÇO</strong><br>
          Data: ${dataServico || '-'}<br>
          Tipo: ${tipoServico}
        </td>
      </tr>
    </table>

    <table>
      <tr>
        <th colspan="4" style="background:#0a4e8a; color:#fff;">DADOS DO CLIENTE</th>
      </tr>
      <tr>
        <td><strong>Nome</strong></td>
        <td>${clienteNome}</td>
        <td><strong>Telefone</strong></td>
        <td>${clienteTelefone || '-'}</td>
      </tr>
      <tr>
        <td><strong>Endereço</strong></td>
        <td colspan="3">${clienteEndereco || '-'}</td>
      </tr>
    </table>

    <table style="margin-top:10px;">
      <tr>
        <th colspan="4" style="background:#0a4e8a; color:#fff;">DESCRIÇÃO DO SERVIÇO</th>
      </tr>
      <tr>
        <td colspan="4">${descricao || '<em>Sem descrição</em>'}</td>
      </tr>
    </table>

    <table style="margin-top:10px;">
      <tr>
        <th style="background:#0a4e8a; color:#fff;">CHECKLIST EXECUTADO</th>
      </tr>
      <tr>
        <td>${checklistHtml}</td>
      </tr>
    </table>

    <table style="margin-top:10px;">
      <tr>
        <th style="background:#0a4e8a; color:#fff;">VALORES</th>
        <th style="background:#0a4e8a; color:#fff;">PAGAMENTO</th>
      </tr>
      <tr>
        <td style="font-size:22px; font-weight:bold; color:#0a4e8a;">
          R$ ${valor || '0,00'}
        </td>
        <td>${pagamento || '-'}</td>
      </tr>
    </table>

    <table style="margin-top:30px;" class="sem-borda">
      <tr>
        <td style="text-align:center;">
          <div style="border-top:1px solid #000; width:250px; margin:auto;"></div>
          Cliente
        </td>
        <td style="text-align:center;">
          <div style="border-top:1px solid #000; width:250px; margin:auto;"></div>
          Técnico
        </td>
      </tr>
    </table>

    <table style="margin-top:20px;">
      <tr>
        <td style="font-size:12px;">
          Garantia de 90 dias conforme o Código de Defesa do Consumidor.<br>
          Não nos responsabilizamos por serviços realizados por terceiros.
        </td>
      </tr>
    </table>
  </div>
`;

  const printWindow = window.open('', '', 'width=900,height=700');
  printWindow.document.write(`<html><body>${osHtml}</body></html>`);
  printWindow.document.close();
  printWindow.focus();

  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
});
