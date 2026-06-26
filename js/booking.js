const ticketForm = document.getElementById("ticketForm");
const confirmationMessage = document.getElementById("confirmationMessage");
const yearElement = document.getElementById("currentYear");

function generateTicketNumber() {
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `AP-${Date.now()}-${randomPart}`;
}

if (ticketForm) {
  ticketForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(ticketForm);
    const name = (formData.get("name") || "Guest").toString().trim();
    const tickets = Number(formData.get("tickets"));
    const ticketNumber = generateTicketNumber();

    confirmationMessage.textContent = `Thank you, ${name}. Your booking for ${tickets} ticket(s) is confirmed. Ticket Number: ${ticketNumber}`;
    ticketForm.reset();
  });
}

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}
