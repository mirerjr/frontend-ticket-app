let tickets = []

const addTicket = (ev)=>{
    ev.preventDefault();
    let ticket = {
        id: Date.now(),
        nome: document.getElementById('nome').value,
        topico: document.getElementById('topico').value,
        tipo: document.getElementById('tipo').value,
        description: document.getElementById('description').value
    }
    tickets.push(ticket)
    document.forms[0].reset();

    console.warn('Adicionado', {tickets});
}

document.addEventListener('DOMContentLoaded', ()=>{
    document.getElementById('btn').addEventListener('click', addTicket)
})