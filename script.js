document.addEventListener("DOMContentLoaded", () => {

/* ===============================
 CHECKLIST POR TIPO DE SERVIÇO
 =============================== */
 const checklistData = {
 "Instalação": [
 "Verificar local de instalação",
 "Confirmar capacidade do equipamento",
 "Checar tensão elétrica",
 "Instalar unidade interna",
 "Instalar unidade externa",
 "Executar vácuo",
 "Testar funcionamento"
 ],
 "Manutenção Preventiva": [
 "Limpar filtros",
 "Limpar serpentina",
 "Verificar pressão",
 "Checar dreno",
 "Orientar cliente"
 ],
 "Manutenção Corretiva": [
 "Identificar defeito",
 "Substituir peça",
 "Testar equipamento"
 ],
 "Outros": [
 "Avaliação técnica",
 "Visita",
 "Orçamento",
 "Serviço personalizado"
 ]
 };

 const tipoServico = document.getElementById("tipoServico");
 const checklist = document.getElementById("checklist");

 checklist.style.display = "none";

 tipoServico.addEventListener("change", () => {
 checklist.innerHTML = "";

 const itens = checklistData[tipoServico.value];
 if (!itens) {
 checklist.style.display = "none";
 return;
 }

 checklist.style.display = "flex";

 itens.forEach(texto => {
 const item = document.createElement("label");
 item.className = "check-item";
 item.innerHTML = `
 <input type="checkbox">
 <span>${texto}</span>
 `;
 checklist.appendChild(item);
 });
 });

/* ===============================
 ASSINATURA (CLIENTE / TÉCNICO)
 =============================== */
 function habilitarAssinatura(id) {
 const canvas = document.getElementById(id);
 const ctx = canvas.getContext("2d");

 canvas.width = canvas.offsetWidth;
 canvas.height = canvas.offsetHeight;

 ctx.lineWidth = 2;
 ctx.lineCap = "round";

 let desenhando = false;

 const posicao = (e) => {
 const rect = canvas.getBoundingClientRect();
 const point = e.touches ? e.touches[0] : e;
 return {
 x: point.clientX - rect.left,
 y: point.clientY - rect.top
 };
 };

 const iniciar = (e) => {
 e.preventDefault();
 desenhando = true;
 const p = posicao(e);
 ctx.beginPath();
 ctx.moveTo(p.x, p.y);
 };

 const mover = (e) => {
 if (!desenhando) return;
 e.preventDefault();
 const p = posicao(e);
 ctx.lineTo(p.x, p.y);
 ctx.stroke();
 };

 const parar = () => desenhando = false;

 canvas.addEventListener("mousedown", iniciar);
 canvas.addEventListener("mousemove", mover);
 canvas.addEventListener("mouseup", parar);
 canvas.addEventListener("mouseleave", parar);

 canvas.addEventListener("touchstart", iniciar);
 canvas.addEventListener("touchmove", mover);
 canvas.addEventListener("touchend", parar);
 }

 habilitarAssinatura("assinaturaCliente");
 habilitarAssinatura("assinaturaTecnico");
});

/* ===============================
 LIMPAR ASSINATURA
 =============================== */
function limparCanvas(id) {
 const canvas = document.getElementById(id);
 canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

/* ===============================
 GERAR PDF PROFISSIONAL
 =============================== */
document.getElementById("osForm").addEventListener("submit", function (e) {
 e.preventDefault();

 const { jsPDF } = window.jspdf;
 const doc = new jsPDF();

 let y = 20;

/* ===== CABEÇALHO ===== */
 doc.setFillColor(10, 78, 138);
 doc.rect(0, 0, 210, 28, "F");

 doc.setTextColor(255, 255, 255);
 doc.setFont("helvetica", "bold");
 doc.setFontSize(16);
 doc.text("CONFORTCLIM - ORDEM DE SERVIÇO", 105, 18, { align: "center" });

 doc.setTextColor(0);
 y = 40;

 doc.setFontSize(10);

 const campo = (label, valor) => {
 doc.setFont(undefined, "bold");
 doc.text(label, 14, y);
 doc.setFont(undefined, "normal");
 doc.text(valor || "-", 70, y);
 y += 7;
 };

/* ===== DADOS ===== */
 campo("Cliente:", clienteNome.value);
 campo("Telefone:", clienteTelefone.value);
 campo("Endereço:", clienteEndereco.value);

 y += 2;
 campo("Serviço:", tipoServico.value);
 campo("Data do Serviço:", formatarData(dataServico.value));
 campo("Validade:", formatarData(validadeServico.value));

 y += 2;
 campo(
 "Equipamento:",
 `${marca.value} / ${modelo.value} / ${capacidade.value} BTUs`
 );

/* ===== CHECKLIST ===== */
 y += 6;
 doc.setFont(undefined, "bold");
 doc.text("Checklist do Serviço", 14, y);
 y += 6;

 doc.setFont(undefined, "normal");
 document.querySelectorAll("#checklist .check-item").forEach((item, index) => {
 const marcado = item.querySelector("input").checked ? "✔" : "✘";
 doc.text(
 `${index + 1}. [${marcado}] ${item.innerText}`,
 18,
 y
 );
 y += 6;
 });

/* ===== ASSINATURAS ===== */
 y += 12;
 doc.setFont(undefined, "bold");
 doc.text("Assinatura do Cliente", 30, y);
 doc.text("Assinatura do Técnico", 130, y);

 y += 4;
 doc.addImage(
 assinaturaCliente.toDataURL("image/png"),
 "PNG",
 14,
 y,
 70,
 26
 );
 doc.addImage(
 assinaturaTecnico.toDataURL("image/png"),
 "PNG",
 120,
 y,
 70,
 26
 );

 doc.save("OS_ConfortClim.pdf");
});

/* ===============================
 FORMATA DATA (DD/MM/AAAA)
 =============================== */
function formatarData(data) {
 if (!data) return "-";
 const [ano, mes, dia] = data.split("-");
 return `${dia}/${mes}/${ano}`;
}
