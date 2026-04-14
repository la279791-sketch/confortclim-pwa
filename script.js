// Lista de itens para checklist
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
  canvas.addEventListener('touchstart', iniciar, { passive: false });
  canvas.addEventListener('mousemove', desenhar, { passive: false });
  canvas.addEventListener('touchmove', desenhar, { passive: false });
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
// 🔥 PDF CORRIGIDO PARA CELULAR
// ===============================
async function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const elemento = document.querySelector("main");

  // Alerta de processamento para o usuário não clicar várias vezes
  const btnOriginalText = document.querySelector(".btn-pdf")?.innerText;
  if(document.querySelector(".btn-pdf")) document.querySelector(".btn-pdf").innerText = "Gerando...";

  try {
    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      windowWidth: elemento.scrollWidth,
      windowHeight: elemento.scrollHeight
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.7); // Usando JPEG para reduzir peso no mobile
    const pdf = new jsPDF("p", "mm", "a4");
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    
    // Nome do arquivo com timestamp para evitar conflitos de cache
    const nomeArquivo = `OS-${new Date().getTime()}.pdf`;
    pdf.save(nomeArquivo);

  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    alert("Erro ao gerar o PDF. Tente novamente.");
  } finally {
    if(document.querySelector(".btn-pdf")) document.querySelector(".btn-pdf").innerText = btnOriginalText;
  }
}

// Função para gerar OS e imprimir
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

  // Capturar imagens das assinaturas
  const assCliente = document.getElementById('assinaturaCliente').toDataURL();
  const assTecnico = document.getElementById('assinaturaTecnico').toDataURL();

  const osHtml = `
  <div style="width:100%; font-family:Arial; padding:10px;">
    <style>
      @page { size: A4; margin: 10mm; }
      table { width:100%; border-collapse: collapse; margin-bottom: 10px; }
      td, th { border:1px solid #ccc; padding:8px; font-size:13px; }
      .header-table td { border:none; }
      .bg-blue { background:#0a4e8a; color:#fff; text-align:left; }
    </style>

    <table class="header-table">
      <tr>
        <td style="width:60%;">
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="./logo.png" style="height:50px;" onerror="this.style.display='none'">
            <div>
              <strong style="font-size:16px;">CONFORTCLIM</strong><br>
              <small>Climatização & Serviços<br>
              Tel: (86) 99512-2772</small>
            </div>
          </div>
        </td>
        <td style="text-align:right;">
          <strong style="font-size:16px;">ORDEM DE SERVIÇO</strong><br>
          Data: ${dataServico || '-'}<br>
          Tipo: ${tipoServico}
        </td>
      </tr>
    </table>

    <table>
      <tr><th colspan="4" class="bg-blue">DADOS DO CLIENTE</th></tr>
      <tr>
        <td><strong>Nome</strong></td><td>${clienteNome}</td>
        <td><strong>Tel</strong></td><td>${clienteTelefone || '-'}</td>
      </tr>
      <tr>
        <td><strong>Endereço</strong></td><td colspan="3">${clienteEndereco || '-'}</td>
      </tr>
    </table>

    <table>
      <tr><th class="bg-blue">DESCRIÇÃO DO SERVIÇO</th></tr>
      <tr><td>${descricao || 'Sem descrição'}</td></tr>
    </table>

    <table>
      <tr><th class="bg-blue">CHECKLIST EXECUTADO</th></tr>
      <tr><td>${checklistHtml}</td></tr>
    </table>

    <table>
      <tr>
        <th class="bg-blue">VALOR TOTAL</th>
        <th class="bg-blue">PAGAMENTO</th>
      </tr>
      <tr>
        <td style="font-size:18px; font-weight:bold;">R$ ${valor || '0,00'}</td>
        <td>${pagamento || '-'}</td>
      </tr>
    </table>

    <table style="margin-top:20px;" class="header-table">
      <tr>
        <td style="text-align:center;">
          <img src="${assCliente}" style="width:150px; display:block; margin:auto;">
          <div style="border-top:1px solid #000; width:180px; margin:auto;"></div>
          Cliente
        </td>
        <td style="text-align:center;">
          <img src="${assTecnico}" style="width:150px; display:block; margin:auto;">
          <div style="border-top:1px solid #000; width:180px; margin:auto;"></div>
          Técnico
        </td>
      </tr>
    </table>
  </div>
`;

  const printWindow = window.open('', '', 'width=900,height=700');
  printWindow.document.write(`<html><head><title>Imprimir OS</title></head><body>${osHtml}</body></html>`);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
    setTimeout(() => { printWindow.close(); }, 500);
  };
});
