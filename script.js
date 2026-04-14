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
    div.appendChild(checkbox);
    div.appendChild(label);
    checklistDiv.appendChild(div);
  });
}

function limparCanvas(id) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function configurarCanvas(id) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext('2d');
  let desenhando = false;
  let lastX, lastY;

  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000';

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function iniciar(e) {
    desenhando = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
  }

  function desenhar(e) {
    if (!desenhando) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
  }

  function parar() { desenhando = false; }

  canvas.addEventListener('mousedown', iniciar);
  canvas.addEventListener('touchstart', iniciar, { passive: false });
  canvas.addEventListener('mousemove', desenhar, { passive: false });
  canvas.addEventListener('touchmove', desenhar, { passive: false });
  window.addEventListener('mouseup', parar);
  window.addEventListener('touchend', parar);
}

window.addEventListener('DOMContentLoaded', () => {
  configurarCanvas('assinaturaCliente');
  configurarCanvas('assinaturaTecnico');
  const tipoServico = document.getElementById('tipoServico');
  const checklistCard = document.getElementById('checklistCard');
  
  tipoServico.addEventListener('change', () => {
    if (tipoServico.value) {
      checklistCard.style.display = 'block';
      criarChecklist();
    } else {
      checklistCard.style.display = 'none';
    }
  });
});

// 🔥 FUNÇÃO GERAR PDF CORRIGIDA (ESTILO DA IMAGEM)
async function gerarPDF() {
  const { jsPDF } = window.jspdf;
  
  // Pegar os dados do formulário
  const clienteNome = document.getElementById('clienteNome').value || '';
  const clienteTelefone = document.getElementById('clienteTelefone').value || '';
  const clienteEndereco = document.getElementById('clienteEndereco').value || '';
  const dataInput = document.getElementById('dataServico').value;
  const dataFormatada = dataInput ? dataInput.split('-').reverse().join('-') : new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  const tipoServico = document.getElementById('tipoServico').value || '';
  const descricao = document.getElementById('descricao').value || '';
  const valor = document.getElementById('valor').value || '0,00';
  const pagamento = document.getElementById('pagamento').value || '';

  const itensMarcados = [];
  document.querySelectorAll('#checklist input[type="checkbox"]:checked').forEach((cb) => {
    itensMarcados.push(cb.nextSibling.innerText);
  });

  const assCliente = document.getElementById('assinaturaCliente').toDataURL("image/png");
  const assTecnico = document.getElementById('assinaturaTecnico').toDataURL("image/png");

  // Criar elemento temporário para o PDF com o estilo exato da imagem
  const tempDiv = document.createElement('div');
  tempDiv.style.width = '800px';
  tempDiv.style.padding = '20px';
  tempDiv.style.background = '#fff';
  tempDiv.style.fontFamily = 'Arial, sans-serif';

  tempDiv.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <img src="./logo.png" style="height:50px;">
        <div style="font-size:12px;">
          <strong style="font-size:16px;">CONFORTCLIM</strong><br>
          Climatização & Serviços<br>
          Tel: (86) 99512-2772<br>
          Email: Confortclim.pi@gmail.com
        </div>
      </div>
      <div style="text-align:right; font-size:14px;">
        <strong style="font-size:18px;">ORDEM DE SERVIÇO</strong><br>
        Data: ${dataFormatada}<br>
        Tipo: ${tipoServico}
      </div>
    </div>

    <table style="width:100%; border-collapse:collapse; margin-bottom:10px; border:1px solid #ccc;">
      <tr><th colspan="4" style="background:#f4f4f4; color:#999; padding:5px; font-size:12px; border:1px solid #ccc;">DADOS DO CLIENTE</th></tr>
      <tr>
        <td style="border:1px solid #ccc; padding:8px; width:15%;"><strong>Nome</strong></td>
        <td style="border:1px solid #ccc; padding:8px; width:45%;">${clienteNome}</td>
        <td style="border:1px solid #ccc; padding:8px; width:15%;"><strong>Telefone</strong></td>
        <td style="border:1px solid #ccc; padding:8px;">${clienteTelefone}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ccc; padding:8px;"><strong>Endereço</strong></td>
        <td colspan="3" style="border:1px solid #ccc; padding:8px;">${clienteEndereco}</td>
      </tr>
    </table>

    <table style="width:100%; border-collapse:collapse; margin-bottom:10px; border:1px solid #ccc;">
      <tr><th style="background:#f4f4f4; color:#999; padding:5px; font-size:12px; border:1px solid #ccc;">DESCRIÇÃO DO SERVIÇO</th></tr>
      <tr><td style="border:1px solid #ccc; padding:15px; min-height:50px;">${descricao}</td></tr>
    </table>

    <table style="width:100%; border-collapse:collapse; margin-bottom:10px; border:1px solid #ccc;">
      <tr><th style="background:#f4f4f4; color:#999; padding:5px; font-size:12px; border:1px solid #ccc;">CHECKLIST EXECUTADO</th></tr>
      <tr>
        <td style="border:1px solid #ccc; padding:10px;">
          <ul style="margin:0; padding-left:20px; font-size:13px;">
            ${itensMarcados.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </td>
      </tr>
    </table>

    <table style="width:100%; border-collapse:collapse; margin-bottom:30px; border:1px solid #ccc;">
      <tr>
        <th style="background:#f4f4f4; color:#999; padding:5px; font-size:12px; border:1px solid #ccc; width:50%;">VALORES</th>
        <th style="background:#f4f4f4; color:#999; padding:5px; font-size:12px; border:1px solid #ccc;">PAGAMENTO</th>
      </tr>
      <tr>
        <td style="border:1px solid #ccc; padding:15px; font-size:22px; color:#0a4e8a; font-weight:bold;">R$ ${valor}</td>
        <td style="border:1px solid #ccc; padding:15px; font-size:14px;">${pagamento}</td>
      </tr>
    </table>

    <div style="display:flex; justify-content:space-around; margin-top:50px; text-align:center;">
      <div style="width:250px;">
        <img src="${assCliente}" style="width:200px; height:60px; object-fit:contain;">
        <div style="border-top:1px solid #000; margin-top:5px;"></div>
        <span style="font-size:12px;">Cliente</span>
      </div>
      <div style="width:250px;">
        <img src="${assTecnico}" style="width:200px; height:60px; object-fit:contain;">
        <div style="border-top:1px solid #000; margin-top:5px;"></div>
        <span style="font-size:12px;">Técnico</span>
      </div>
    </div>

    <div style="margin-top:40px; border:1px solid #ccc; padding:10px; font-size:11px; color:#333;">
      Garantia de 90 dias conforme o Código de Defesa do Consumidor.<br>
      Não nos responsabilizamos por serviços realizados por terceiros.
    </div>
  `;

  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`OS-${clienteNome || 'servico'}.pdf`);
  } catch (e) {
    alert("Erro ao gerar PDF");
  } finally {
    document.body.removeChild(tempDiv);
  }
}

// Manter a função de envio para imprimir se necessário
document.getElementById('osForm').addEventListener('submit', (e) => {
  e.preventDefault();
  gerarPDF();
});
