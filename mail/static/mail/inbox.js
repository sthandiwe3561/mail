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
  document.querySelector("#compose").addEventListener("click", compose_email);

  const form = document.querySelector("#compose-form");

  form.addEventListener("submit", button);
  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  const mail = document.querySelector("#emails-view");
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  mail.innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  if (mailbox === "sent") {
    fetch("emails/sent")
      .then((response) => response.json())
      .then((emails) => {
        emails.forEach((email) => {
          //create a dive for every email
          const emailDiv = document.createElement("div");

          emailDiv.innerHTML = `<strong>${email.sender}</strong>
           <div style="display: flex; justify-content: space-between; width: 100%;">
           <p style="margin: 0;">${email.subject}</p>
           <span style="margin-left: auto;">${email.timestamp}</span>
           </div>`;
          mail.appendChild(emailDiv);
        });
      });
  }
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
