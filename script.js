document.addEventListener("DOMContentLoaded", () => {

  /* ===== CHECKLIST POR TIPO ===== */
  const checklistData = {
    instalacao: [
      "Verificar local de instalação",
      "Confirmar capacidade do equipamento",
      "Checar tensão elétrica",
      "Instalar unidade interna",
      "Instalar unidade externa",
      "Executar vácuo",
      "Testar funcionamento"
    ],
    preventiva: [
      "Limpar filtros",
      "Limpar serpentina",
      "Verificar pressão",
      "Checar dreno",
      "Orientar cliente"
    ],
    corretiva: [
      "Identificar defeito",
      "Substituir peça",
      "Testar equipamento"
    ],
    outros: [
      "Avaliação técnica",
      "Visita",
      "Orçamento",
      "Serviço personalizado"
    ]
  };

  const tipoServico = document.getElementById("tipoServico");
  const checklist = document.getElementById("checklist");

  tipoServico.addEventListener("change", () => {
    checklist.innerHTML = "";
    (checklistData[tipoServico.value] || []).forEach(texto => {
      const div = document.createElement("div");
      div.className = "check-item";
      div.innerHTML = `<input type="checkbox"><span>${texto}</span>`;
      checklist.appendChild(div);
    });
  });

  /* ===== ASSINATURA ===== */
  function habilitarAssinatura(id) {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext("2d");
    let desenhando = false;

    canvas.onmousedown = () => desenhando = true;
    canvas.onmouseup = () => {
      desenhando = false;
      ctx.beginPath();
    };
    canvas.onmousemove = e => {
      if (!desenhando) return;
      ctx.lineWidth = 2;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };
  }

  habilitarAssinatura("assinaturaCliente");
  habilitarAssinatura("assinaturaTecnico");

});

/* ===== LIMPAR ASSINATURA ===== */
function limparCanvas(id) {
  const c = document.getElementById(id);
  c.getContext("2d").clearRect(0, 0, c.width, c.height);
}

/* ===== GERAR PDF (PROFISSIONAL) ===== */
document.getElementById("osForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CONFORTCLIM - CLIMATIZAÇÃO", 105, y, { align: "center" });

  y += 8;
  doc.setFontSize(12);
  doc.text("ORDEM DE SERVIÇO", 105, y, { align: "center" });

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  function campo(label, valor) {
    doc.text(label, 14, y);
    doc.text(valor || "-", 70, y);
    y += 6;
  }

  campo("Cliente:", clienteNome.value);
  campo("Telefone:", clienteTelefone.value);
  campo("Endereço:", clienteEndereco.value);

  y += 4;
  campo("Serviço:", tipoServico.options[tipoServico.selectedIndex].text);

  y += 4;
  campo("Equipamento:", `${marca.value} / ${modelo.value} / ${capacidade.value} BTUs`);

  y += 6;
  doc.text("Checklist:", 14, y);
  y += 6;

  document.querySelectorAll("#checklist .check-item").forEach((i, idx) => {
    const ok = i.querySelector("input").checked ? "✔" : "✖";
    doc.text(`${idx+1}. [${ok}] ${i.innerText}`, 18, y);
    y += 5;
  });

  doc.save("OS_ConfortClim.pdf");
});