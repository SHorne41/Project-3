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

function archive_email(state, emailID){
    let archived = 'True';
    if (state == "true"){
        archived = 'False';
    }

    //Make PUT request to update email's Archived attribute
    fetch(('/emails/' + emailID), {
        method: "PUT",
        body: JSON.stringify({
            archived: archived,
        })
    });
}

function view_email(emailID, mailbox) {
    fetch('/emails/' + emailID)
    .then(response => response.json())
    .then(email => {
        //Hide the contents of the inbox and open the emails view
        document.querySelector('#view-email').style.display = 'block';
        document.querySelector('#view-email').innerHTML = '';           //Clears any data from previously opened emails
        document.querySelector('#emails-view').style.display = 'none';

        //Create HTML elements to display contents of the email
        let emailSubject = document.createElement('h2');
        let emailHeader = document.createElement('h4');
        let emailSubHeading = document.createElement('h6');
        let emailBody = document.createElement('p');
        let archiveButton = document.createElement('button');

        //Populate HTML elements with email contents
        emailSubject.innerHTML = email.subject;
        emailHeader.innerHTML = "FROM: " + email.sender + ", " + email.timestamp;
        emailSubHeading.innerHTML = "TO: " + email.recipients;
        emailBody.innerHTML = email.body;

        //Check email status to determine contents of button - set contents
        if (String(email.archived) == 'false'){
            archiveButton.innerHTML = "Archive";
        } else {
            archiveButton.innerHTML = "Unarchive";
        }

        //Add event Listener to button
        archiveButton.addEventListener('click', () => archive_email(String(email.archived), emailID));

        //Append HTML elements to parent <div> element
        document.querySelector("#view-email").appendChild(emailSubject);
        document.querySelector("#view-email").appendChild(emailHeader);
        document.querySelector("#view-email").appendChild(emailSubHeading);
        document.querySelector("#view-email").appendChild(emailBody);

        //User should not be able to archive emails in the 'sent' mailbox
        if (mailbox != "sent"){
            document.querySelector("#view-email").appendChild(archiveButton);
        }

        //If email was unread, make PUT request to update email as "READ"
        if (String(email.read) == "false"){
            fetch(('/emails/' + emailID), {
                method: "PUT",
                body: JSON.stringify({
                    read: 'True'
                })
            });
        }
    })
}

function load_mail(mailbox) {
    fetch('/emails/' + mailbox)
    .then(response => response.json())
    .then(emails => {
        for (let i = 0; i < emails.length; i ++){
            //Create new HTML elements to display inbox
            let newDiv = document.createElement('div');
            let newSender = document.createElement('h1');
            let newSubject = document.createElement('h2');
            let newTimestamp = document.createElement('h3');

            //Determine 'sender' based on mailbox
            if (mailbox === 'sent'){
                newSender = emails[i].recipients;

            } else {
                newSender = emails[i].sender;
            }

            //Populate HTML elements with appropriate email components
            newTimestamp = emails[i].timestamp;
            newSubject = emails[i].subject;
            newDiv.innerHTML = newSender + " - " + newSubject + " - " + newTimestamp;

            //Set newDiv CSS properties
            if (emails[i].read == true){
                newDiv.style = "border: 1px solid black; padding: 10px; background-color: lightgray;";
            } else {
                newDiv.style = "border: 1px solid black; padding: 10px;";
            }

            //Append HTML elements to parent <div>
            newDiv.id = "email#" + emails[i].id;
            newDiv.addEventListener('click', () => view_email(emails[i].id, mailbox));
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
  document.querySelector('#view-email').style.display = 'none';

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
