import React, { useState, useRef } from "react";
import Data from "../../Data";
import Button from "../Utility/Button";
import Input from "../Utility/Input";

function ContactForm() {
  const [status, setStatus] = useState("");
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(formRef.current);

    const response = await fetch(Data.contact.formspree, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      setStatus("Message sent successfully!");
      formRef.current.reset();
    } else {
      setStatus("Oops! Something went wrong.");
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <Input autoComplete="off" label="Name" name="name" />
      <Input autoComplete="off" label="Email" type="email" name="email" />
      <Input autoComplete="off" label="Message" textArea name="message" />
      <Button right submit text="Send Message" />
      {status && <p>{status}</p>}
    </form>
  );
}

export default ContactForm;
