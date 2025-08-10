// src/ui/bookingForm.js
import { makeSubmitBooking as makeSubmit } from "../app/submitBooking.js";

const form = document.getElementById("booking-form");
const checkin = document.getElementById("checkin");
const checkout = document.getElementById("checkout");

// Ensure date inputs exist before wiring up
if (checkin && checkout) {
  // Disallow past dates
  const today = new Date().toISOString().split("T")[0];
  checkin.min = today;
  checkout.min = today;

  // When check-in changes, push checkout.min to be at least check-in (UI-level)
  checkin.addEventListener("change", () => {
    checkout.min = checkin.value || today;
    if (checkout.value && checkout.value < checkout.min) {
      checkout.value = checkout.min;
    }
  });
}

// Submit handler from your booking logic
const { handleSubmit } = makeSubmit(form);

// Helper: render field validation errors under inputs
function showFieldErrors(errors) {
  // Remove any previous error messages
  form.querySelectorAll(".error-msg").forEach((el) => el.remove());

  // Insert fresh errors
  Object.entries(errors).forEach(([name, message]) => {
    const input = form.querySelector(`[name="${name}"]`);
    if (!input) return;
    const div = document.createElement("div");
    div.className = "error-msg";
    div.textContent = message;
    input.insertAdjacentElement("afterend", div);
  });
}

// Submission flow: check availability -> block if not ok -> submit
form.addEventListener("submit", async (evt) => {
  try {
    // 1) Always run the live availability check right before submit (if exposed)
    if (typeof window.validateAvailability === "function") {
      const ok = await window.validateAvailability();
      if (!ok) {
        evt.preventDefault();
        // The inline script already shows the message; this alert is a safety net.
        alert("Please pick available dates before submitting.");
        return;
      }
    }

    // 2) Extra safety: require the dataset flag set by the checker
    if (form?.dataset?.availability !== "ok") {
      evt.preventDefault();
      alert("Please pick available dates before submitting.");
      return;
    }

    // 3) Proceed with your original submit logic
    await handleSubmit(evt);
  } catch (err) {
    evt.preventDefault();
    if (err?.type === "validation") {
      // Show per-field validation errors, focus first error field
      showFieldErrors(err.errors);
      const firstKey = Object.keys(err.errors)[0];
      form.querySelector(`[name="${firstKey}"]`)?.focus();
    } else {
      alert("Something went wrong. Please try again.");
      console.error(err);
    }
  }
});
