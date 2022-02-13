window.onload = generateTicketList();

async function generateTicketList(){
    const tickets = await getTickets()

    const ticketList = document.getElementsByClassName('list-tickets')[0]
                                .getElementsByTagName("aside")[0]

    for(ticket of tickets) {   
        const person = await getPerson(ticket.personId)
        const logs = await getLogs(ticket.id)
        const dateCreated = formatDate(ticket.dateCreated)
        const personName = formatName(person.fullName)

        let teste = ` 
            <a href="">
                <br>
                <p> ${logs[0].description} <b>#${ticket.id}</b></p>
                <br>
                <p><b>${personName}</b> ${ticket.title}</p>
                <br>
                <h6>Criado em: ${dateCreated}</h6>
                <p>______________________________________________________</p>
            </a>
        `
        let article = document.createElement('article')
        
        article.setAttribute('class', 'elements-list')
        article.innerHTML = teste 

        ticketList.appendChild(article)
    }
}

async function getTickets(){
    const options = {
        url: "http://127.0.0.1:8081/tickets",
        method: "GET"
    };

    const response = await fetch(options.url);
    const tickets = await response.json();

    return tickets;
}

async function getPerson(id){
    const options = {
        url: "http://127.0.0.1:8081/persons/"+id,
        method: "GET"
    };

    const response = await fetch(options.url);
    const person = await response.json();

    return person;
}

async function getLogs(id){
    const options = {
        url: "http://127.0.0.1:8081/tickets/"+id+"/logs",
        method: "GET"
    };

    const response = await fetch(options.url);
    const logs = await response.json();
    
    return logs;
}

function getMonthName(month){
    const months = [
        'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 
        'jul', 'ago', 'set', 'out', 'nov', 'dez'
    ];            

    return months[month];
}

function formatDate(oldDate){
    const date = new Date(oldDate);
    
    let newDate = '';            
    newDate += `${getMonthName(date.getMonth())} `;
    newDate += `${date.getDate()}, `;
    newDate += `${date.getFullYear()} `;
    newDate += `${date.getHours()}:`;
    newDate += `${date.getMinutes()}`;

    return newDate;
}

function formatName(personName){
    const names = personName.split(' ');
    const firstName = names[0];
    const lastName = names[names.length - 1];

    const fullName = [firstName];

    if(lastName != firstName){
        fullName.push(lastName);
    }

    return fullName.join(" ");
}


 