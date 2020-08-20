document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', () => send_mail());

  // By default, load the inbox
  load_mailbox('inbox');
});

function send_mail() {
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: document.querySelector('#compose-recipients').value,
            subject: document.querySelector('#compose-subject').value,
            body: document.querySelector('#compose-body').value
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log("Mail Sent");
    });

    load_mailbox('sent');
}

function load_mail(mailbox) {
    fetch('/emails/' + mailbox)
    .then(response => response.json())
    .then(emails => {
        for (let i = 0; i < emails.length; i ++){
            console.log(emails[i])
            let newDiv = document.createElement('div');
            let newSender = document.createElement('h1');
            let newSubject = document.createElement('h2');
            let newTimestamp = document.createElement('h3');

            //Determine 'sender' based on mailbox
            if (mailbox === 'sent'){
                console.log(emails[i].recipients)
                newSender = emails[i].recipients;

            } else {
                newSender = emails[i].sender;
            }

            newTimestamp = emails[i].timestamp;
            newSubject = emails[i].subject;
            newDiv.innerHTML = newSender + " - " + newSubject + " - " + newTimestamp;

            document.querySelector("#emails-view").appendChild(newDiv);

        }
    });
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (mailbox === 'inbox') {
      load_mail('inbox');
  }
  else if (mailbox === 'sent') {
      load_mail('sent');
  }
  else if (mailbox === 'archive') {
      load_mail('archive');
  }
}
