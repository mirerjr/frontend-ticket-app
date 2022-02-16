window.onload = () => {
    showTicketTypes();
}


async function addTicket(){
    let ticketType =  document.getElementById('tipo-ticket');
    let typeId = ticketType.options[ticketType.selectedIndex].value;

    let pessoa = { 
        fullName: document.getElementById('nome-pessoa').value,
        phone: document.getElementById('telefone-pessoa').value,
        email: document.getElementById('email-pessoa').value,
    }
    let ticket = {
        title: document.getElementById('topico-ticket').value,
        ticketTypeId: typeId,
        description: document.getElementById('description').value,
        important: false,
        person: pessoa,
    }

    const response = await insertTicket(ticket);

    if(response){
        location.href = '../index.html'
    }
}

async function insertTicket(data){
    const options = {
        url: "http://127.0.0.1:8081/tickets",
        method: "POST",
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    };

    const response = await fetch(options.url, {
        method: options.method,
        body: options.body,
        headers: options.headers
    });
    
    return response;
}

async function showTicketTypes(){
    const types = await getTicketTypes();
    const select = document.getElementById("tipo-ticket");

    select.innerHTML = "";
    
    for(let type of types){
        let typeOption = document.createElement('option');
        typeOption.setAttribute('value', `${type.id}`);
        typeOption.innerText = type.typeName;       
        
        if(type.id === types[0].id){
            typeOption.setAttribute('selected',"");
        }
        
        select.appendChild(typeOption);
    }    
}

async function getTicketTypes(){
    const options = {
        url: "http://127.0.0.1:8081/ticket-types/",
        method: "GET"
    };

    const response = await fetch(options.url);
    const types = await response.json();

    return types
}
