// Store current short URL
let currentShortUrl = null;
let currentShortId = null;

// Dark Mode Toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// Load saved theme preference
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
});

// Validate URL format
function validateUrl(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (_) {
    return false;
  }
}

// Handle Enter key press
function handleEnter(event) {
  if (event.key === "Enter") {
    shortenUrl();
  }
}

// Real-time URL validation
document.getElementById("urlInput").addEventListener("input", (e) => {
  const feedback = document.getElementById("validationFeedback");
  const url = e.target.value.trim();

  if (url === "") {
    feedback.textContent = "";
    feedback.className = "validation-feedback";
    return;
  }

  if (validateUrl(url)) {
    feedback.textContent = "✓ Valid URL";
    feedback.className = "validation-feedback valid";
  } else {
    feedback.textContent = "✗ Invalid URL format";
    feedback.className = "validation-feedback invalid";
  }
});

// Main shorten URL function
async function shortenUrl() {
  const input = document.getElementById("urlInput").value.trim();
  const result = document.getElementById("result");

  if (!input) {
    showNotification("Please enter a valid URL", "error");
    return;
  }

  if (!validateUrl(input)) {
    showNotification("Please enter a valid URL format", "error");
    return;
  }

  try {
    const response = await fetch("/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ originalUrl: input })
    });

    const data = await response.json();

    if (data.shortUrl && data.shortId) {
      currentShortUrl = data.shortUrl;
      currentShortId = data.shortId;

      // Display result
      result.innerHTML = `
        <strong>Short URL created:</strong><br>
        <a href="${data.shortUrl}" target="_blank">
          ${data.shortUrl}
        </a>
      `;
      result.classList.add("show");

      // Load URL info (clicks, creation date)
      loadUrlInfo(data.shortId);

      // Generate QR code
      generateQRCode(data.shortUrl);

      // Show action buttons
      document.getElementById("actionButtons").style.display = "flex";

      showNotification("URL shortened successfully!", "success");
      document.getElementById("urlInput").value = "";
      document.getElementById("validationFeedback").textContent = "";
    } else {
      showNotification("Unable to generate short URL", "error");
    }
  } catch (error) {
    showNotification("Server error. Please try again.", "error");
  }
}

// Load URL info (clicks and creation date)
async function loadUrlInfo(shortId) {
  try {
    const response = await fetch(`/api/url/${shortId}`);
    const data = await response.json();

    if (data.clicks !== undefined) {
      document.getElementById("clickCount").textContent = data.clicks;
      document.getElementById("createdDate").textContent = new Date(data.createdAt).toLocaleDateString();
      document.getElementById("urlInfo").style.display = "block";
    }
  } catch (error) {
    console.error("Error loading URL info:", error);
  }
}

// Generate QR Code
function generateQRCode(url) {
  const qrCodeDiv = document.getElementById("qrCode");
  qrCodeDiv.innerHTML = ""; // Clear previous QR code

  new QRCode(qrCodeDiv, {
    text: url,
    width: 150,
    height: 150,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  document.getElementById("qrCodeSection").style.display = "block";
}

// Copy to Clipboard
function copyToClipboard() {
  if (!currentShortUrl) {
    showNotification("No URL to copy", "error");
    return;
  }

  navigator.clipboard.writeText(currentShortUrl).then(() => {
    showNotification("Link copied to clipboard!", "success");
  }).catch(() => {
    showNotification("Failed to copy link", "error");
  });
}

// Delete URL
async function deleteUrl() {
  if (!currentShortId) {
    showNotification("No URL selected", "error");
    return;
  }

  if (!confirm("Are you sure you want to delete this URL?")) {
    return;
  }

  try {
    const response = await fetch(`/api/url/${currentShortId}`, {
      method: "DELETE"
    });

    if (response.ok) {
      showNotification("URL deleted successfully!", "success");
      resetForm();
    } else {
      showNotification("Failed to delete URL", "error");
    }
  } catch (error) {
    showNotification("Error deleting URL", "error");
  }
}

// Reset form
function resetForm() {
  document.getElementById("urlInput").value = "";
  document.getElementById("validationFeedback").textContent = "";
  document.getElementById("result").innerHTML = "";
  document.getElementById("result").classList.remove("show");
  document.getElementById("urlInfo").style.display = "none";
  document.getElementById("qrCodeSection").style.display = "none";
  document.getElementById("actionButtons").style.display = "none";
  currentShortUrl = null;
  currentShortId = null;
}

// Show notification
function showNotification(message, type) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification show ${type}`;

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}
