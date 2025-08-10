// src/app/submitBooking.js
import { validateBooking } from "../domain/booking.js";

export function makeSubmitBooking(form){
  async function handleSubmit(e){
    e.preventDefault();

    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name")||""),
      phone: String(fd.get("phone")||""),
      email: String(fd.get("email")||""),
      checkin: String(fd.get("checkin")||""),
      checkout: String(fd.get("checkout")||""),
      guests: Number(fd.get("guests")||0),
      message: String(fd.get("message")||"")
    };

    const { ok, errors } = validateBooking(payload);
    if(!ok) throw { type:"validation", errors };

    // ⛔ Gate: only submit if availability checker said OK
    if (form.dataset.availability !== "ok") {
      throw { type:"availability", message: "Please pick available dates." };
    }

    form.submit();
  }
  return { handleSubmit };
}
