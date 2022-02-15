window.onload = () => {
    generateTicketList();
}

const ticketOpen = document.getElementsByClassName('no-ticket-img')[0]
const ticketContent = document.getElementsByClassName('ticket-content')[0]
ticketOpen.classList.add("hidden")
ticketContent.classList.remove("hidden")

async function openTicket(id){
    const ticket = await getTicketById(id);
    const logs = await getLogs(ticket.id);
    const person = await getPerson(ticket.personId);
    const ticketType = await getTicketType(ticket.ticketTypeId);

    const fields = {
        "last-log": formatLogText(logs[0]),
        "ticket-title": ticket.title,
        "person-name": person.fullName,
        "person-phone": person.phone,
        "person-email": person.email,
        "ticket-description": ticket.description,
    }

    for(let field in fields){
        const idField = document.getElementById(field);
        idField.innerHTML = fields[field];
    }
}

async function generateTicketList(){
    const tickets = await getTickets()

    const ticketList = document.getElementsByClassName('list-tickets')[0]
                                .getElementsByTagName("aside")[0]

    for(let ticket of tickets) {   
        const person = await getPerson(ticket.personId)
        const logs = await getLogs(ticket.id)
        const dateCreated = formatDate(ticket.dateCreated)
        const personName = formatName(person.fullName)

        let content = ` 
            <a>
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
        
        article.innerHTML = content  
        article.setAttribute('class', 'elements-list')
        article.setAttribute('onclick', `openTicket(${ticket.id})`)               

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

async function getTicketById(id){
    const options = {
        url: "http://127.0.0.1:8081/tickets/"+id,
        method: "GET"
    };

    const response = await fetch(options.url);
    const ticket = await response.json();

    return ticket
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

async function getTicketType(id){
    const options = {
        url: "http://127.0.0.1:8081/ticket-types/"+id,
        method: "GET"
    };

    const response = await fetch(options.url);
    const type = await response.json();

    return type
}

function formatLogText(log){
    console.log(log)
    let icon = '';
    let text = '';
        
    if(log.created){
        icon = getLogIcon("created");
        text = `${icon} Criado`;
    }

    if(log.statusChanged){
        const status = getStatus(log.statusId);

        icon = getLogIcon("statusChanged");
        text = `${icon} Status modificado para ${status.statusName}`;
    }

    if(log.commented){
        icon = getLogIcon("commented");
        text = `${icon} Comentado`;
    }

    if(log.escalated){
        icon = getLogIcon("escalated");
        text = `${icon} Escalado`;
    }
    
    if(log.closed){
        icon = getLogIcon("closed");
        text = `${icon} Encerrado`;
    } 
    
    
    return text
}

function getLogIcon(logName){
    const icons = new Map();
    
    icons.set('created', '<i class="gg-math-plus color-created"></i>')
         .set('statusChanged', '<i class="gg-arrows-exchange color-changed"></i>')
         .set('commented', '<i class="gg-comment color-commented"></i>')
         .set('escalated', '<i class="gg-chevron-double-up-o color-escalated"></i>')
         .set('closed', '<i class="gg-close-o color-closed"></i>');
    
    return icons.get(logName)         
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


 