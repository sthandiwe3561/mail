document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document
    .querySelector("#compose")
    .addEventListener("click", () => compose_email());

  const form = document.querySelector("#compose-form");

  form.addEventListener("submit", button);
  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email(
  recipient = "",
  subject = "",
  timestamp = "",
  body = ""
) {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#email-viewing").style.display = "none";

  // Clear out composition fields
  const recipient_input = document.querySelector("#compose-recipients");
  const subject_input = document.querySelector("#compose-subject");
  const body_input = document.querySelector("#compose-body");

  // Set pre-filled values if replying
  recipient_input.value = recipient;

  // Add "Re:" only if it’s not already there
  if (subject.startsWith("Re:")) {
    subject_input.value = subject;
  } else {
    subject_input.value = `Re: ${subject}`;
  }

  // Pre-fill body with quoted original message
  if (body) {
    body_input.value = `\n\nOn ${timestamp}, ${recipient} wrote:\n${body}`;
  } else {
    body_input.value = "";
  }
}

function isArchive(mail_id, isArchive, event) {
  event.stopPropagation(); // Prevent click from propagating to the parent div

  fetch(`/emails/${mail_id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: isArchive, // Update the archived status on the server
    }),
  }).then(() => load_mailbox("inbox")); // Refresh the inbox after archiving
}

function load_mailbox(mailbox) {
  const mail = document.querySelector("#emails-view");
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-viewing").style.display = "none";

  // Show the mailbox name
  mail.innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  fetch(`emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((email) => {
        //create a dive for every email
        const emailDiv = document.createElement("div");
        emailDiv.setAttribute(
          "style",
          "border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 5px; background-color: #f9f9f9; cursor: pointer;"
        );

        // Set background color based on email read status
        if (mailbox != "sent") {
          if (email.read) {
            emailDiv.style.backgroundColor = "#d3d3d3"; // Light gray for read emails
          } else {
            emailDiv.style.backgroundColor = "#ffffff"; // White for unread emails
          }
        }

        emailDiv.innerHTML = `<strong>${email.sender}</strong>
           <div style="display: flex; justify-content: space-between; width: 100%;">
           <p style="margin: 0;">${email.subject}</p>
           <span style="margin-left: auto;">${email.timestamp}</span>
            ${
              mailbox === "inbox"
                ? `<button style="margin-left: 20px;" onclick="isArchive(${email.id},true, event)">Archive</button>`
                : ""
            }
             ${
               mailbox === "archive"
                 ? `<button style="margin-left: 20px;" onclick="isArchive(${email.id},false, event)">Unarchive</button>`
                 : ""
             }
           </div>
           `;
        emailDiv.addEventListener("click", function () {
          email.read = true;
          view_mail(email.id, mailbox);
        });
        mail.appendChild(emailDiv);
      });
    });
}

function view_mail(mail_id, mailbox) {
  const view = document.querySelector("#email-viewing");
  // Show the mailbox and hide other views
  document.querySelector("#email-viewing").style.display = "block";
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";

  fetch(`/emails/${mail_id}`)
    .then((response) => response.json())
    .then((email) => {
      view.innerHTML = `<h3>${email.subject}</h3>
        <p><strong>From:</strong> ${email.sender}</p>
        <p><strong>To:</strong> ${email.recipients.join(", ")}</p>
        <p><strong>Timestamp:</strong> ${email.timestamp}</p>
        <p><strong>Subject:</strong> ${email.subject}</p>
        <hr>
        <p>${email.body}</p>
        <button style="margin-left: 20px;" onclick="load_mailbox(${mailbox})">Back</button>
        <button style="margin-left: 20px;" onclick="compose_email( '${
          email.sender
        }', 
  '${email.subject}', 
  '${email.timestamp}', 
  '${email.body}')">Reply</button>
      `;
    });
}

function button(event) {
  // preventing form to reload
  event.preventDefault();

  // fething data from the form inputs
  const recipient = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  //send the data to database through the api
  //making network request that i am about to send something to the database/api
  //fetch has two arguments in it the routes you are sending to and  the data you are going to send
  // data put it in {like dictionary}
  fetch("/emails", {
    // use POST because i am sending the data
    method: "POST",
    // Tell server we are sending JSON
    headers: { "content-type": "application/json" },
    //JSON.stringify({...}) to convert a JavaScript object into a JSON string
    body: JSON.stringify({
      recipients: recipient,
      subject: subject,
      body: body,
    }),
  })
    //The .then(response => response.json()) part:
    //response is the server's response to our request.
    //.json() converts the response from JSON format into a JavaScript object.
    .then((response) => {
      // check if the response is ok before calling .json()
      if (!response.ok) {
        throw new Error("HTTP error! Status: " + response.status);
      }
      return response.json();
    })
    .then((result) => {
      console.log(result);
    });

  console.log(recipient);
  console.log(subject);
  console.log(body);
  alert("form submited");
  load_mailbox("sent");
}
