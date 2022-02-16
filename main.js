window.onload = () => {
    generateTicketList();
}
var openedTicket

const ticketOpen = document.getElementsByClassName('no-ticket-img')[0]
const ticketContent = document.getElementsByClassName('ticket-content')[0]


async function openTicket(id){
    const ticket = await getTicketById(id);
    const logs = await getLogs(ticket.id);
    const person = await getPerson(ticket.personId);
    const ticketType = await getTicketType(ticket.ticketTypeId);
    const lastLog = await formatLogText(logs[0])

    const fields = {
        "last-log": lastLog,
        "ticket-id": "#"+ticket.id,
        "type-name": ticketType.typeName,
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

    await generateTimeline(logs);
    await addStatusNameModal();
    
    openedTicket = id
    ticketOpen.classList.add("hidden");
    ticketContent.classList.remove("hidden");
}

async function generateTicketList(){
    const tickets = await getTickets()

    const ticketList = document.getElementsByClassName('list-tickets')[0]
                                .getElementsByTagName("aside")[0]
                                
    ticketList.innerHTML = '';

    for(let ticket of tickets) {   
        const person = await getPerson(ticket.personId)
        const logs = await getLogs(ticket.id)
        const dateCreated = formatDate(ticket.dateCreated)
        const personName = formatName(person.fullName)
        const lastLog = await formatLogText(logs[0])

        let content = ` 
            <a>
                <br>
                <p> ${lastLog} <b>#${ticket.id}</b></p>
                <p><b>${personName}:</b> <span>${ticket.title}</span></p>
                <h6><i class="lighter-text">Criado no dia ${dateCreated}</i></h6>
                <br>
            </a>
        `
        let article = document.createElement('article')
        
        article.innerHTML = content  
        article.setAttribute('class', 'elements-list')
        article.setAttribute('onclick', `openTicket(${ticket.id})`)               

        ticketList.appendChild(article)
    }
}

async function generateTimeline(logs){
    const timelineContent = document.getElementById("timeline-content"); 
    timelineContent.innerHTML = `<ul class="timeline"></ul>`

    const timeline = document.getElementsByClassName("timeline")[0];

    for(let log of logs){
        const logContent = await formatLogText(log);
        const logDate = formatDateTimeline(log.date);

        let content = `<h3>${logContent}</h3><p><i>${logDate}</i><br><span class="text-break">${log.description}</span></p>`;

        let ticketEvent = document.createElement('article');
        ticketEvent.innerHTML = content;
        ticketEvent.setAttribute('class', 'event');

        timeline.appendChild(ticketEvent);
    }
}

async function escalateTicket(){
    const ticket = openedTicket;
    const description = document.getElementById("description-escalated").value;

    const data = {
        ticketId: ticket,
        statusChanged: false,
        ticketStatusId: null,
        description: description,
        commented: false, 
        escalated: true,
        created: false,
        closed: false
    }

    const response = await insertLog(data);

    if(response){
        let modalEscalated = document.getElementById('modal-escalated');
        let modal = bootstrap.Modal.getInstance(modalEscalated);
        modal.hide();
        
        await generateTicketList();
        await openTicket(ticket);
    }
}

async function addCommentTicket(){
    const ticket = openedTicket;
    const comment = document.getElementById("comment-text").value;

    const data = {
        ticketId: ticket,
        statusChanged: false,
        ticketStatusId: null,
        description: comment,
        commented: true, 
        escalated: false,
        created: false,
        closed: false
    }

    const response = await insertLog(data);

    if(response){
        let modalComment = document.getElementById('modal-comment');
        let modal = bootstrap.Modal.getInstance(modalComment);
        modal.hide();
        
        await generateTicketList();
        await openTicket(ticket);
    }
}

async function updateStatusTicket(){
    const ticket = openedTicket;
    const select = document.getElementById("status-name");
    const status = select.options[select.selectedIndex].value;

    const description = document.getElementById("description-text").value;

    const data = {
        ticketId: ticket,
        statusChanged: true,
        ticketStatusId: status,
        description: description,
        commented: false, 
        escalated: false,
        created: false,
        closed: false
    }

    const response = await insertLog(data);

    if(response){
        let modalStatus = document.getElementById('modal-change-status');
        let modal = bootstrap.Modal.getInstance(modalStatus);
        modal.hide();
        
        await generateTicketList();
        await openTicket(ticket);
    }
}

async function insertLog(data){
    const options = {
        url: "http://127.0.0.1:8081/ticket-logs",
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

async function addStatusNameModal(){
    const statusList = await getTicketStatus();
    const select = document.getElementById("status-name");

    select.innerHTML = "";
    
    for(let status of statusList){
        let statusOption = document.createElement('option');
        statusOption.setAttribute('value', `${status.id}`);
        statusOption.innerText = status.statusName;       
        
        if(status.id === statusList[0].id){
            statusOption.setAttribute('selected',"");
        }
        
        select.appendChild(statusOption);
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

async function getStatus(id){
    const options = {
        url: "http://127.0.0.1:8081/ticket-status/"+id,
        method: "GET"
    };

    const response = await fetch(options.url);
    return await response.json();
}

async function getTicketStatus(){
    const options = {
        url: "http://127.0.0.1:8081/ticket-status",
        method: "GET"
    };

    const response = await fetch(options.url);
    const status = await response.json();

    return status;
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

async function formatLogText(log){
    let icon = '';
    let text = '';
        
    if(log.created){
        icon = getLogIcon("created");
        text = `${icon} Criado`;
    }

    if(log.statusChanged){
        const status = await getStatus(log.ticketStatusId);
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
    
    icons.set('created', '<img src="img/created.svg" alt="criado">')
         .set('statusChanged', '<img src="img/changed.svg" alt="criado">')
         .set('commented', '<img src="img/commented.svg" alt="criado">')
         .set('escalated', '<img src="img/escalated.svg" alt="criado">')
         .set('closed', '<img src="img/closed.svg" alt="criado">');
    
    return icons.get(logName)         
}

function getMonthName(month){
    const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];            

    return months[month];
}

function formatDate(oldDate){
    const date = new Date(oldDate);
    
    let newDate = '';            
    newDate += `${date.getDate()} de `;
    newDate += `${getMonthName(date.getMonth())} de `;
    newDate += `${date.getFullYear()}, às `;
    newDate += `${date.getHours()}:`;
    newDate += `${date.getMinutes()} hrs`;

    return newDate;
}

function formatDateTimeline(oldDate){
    const date = new Date(oldDate);

    let day = ('0' + date.getDate()).slice(-2);
    let month = ('0' + (date.getMonth()+1)).slice(-2);
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = ('0' + date.getMinutes()).slice(-2);
    
    let newDate = `${day}/${month}/${year} ${hours}:${minutes}`;            

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


 