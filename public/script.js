async function shortenUrl() {
  const input = document.getElementById("urlInput").value.trim();
  const result = document.getElementById("result");

  if (!input) {
    result.innerText = "Please enter a valid URL";
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

    if (data.shortUrl) {
      result.innerHTML = `
        Short URL:
        <a href="${data.shortUrl}" target="_blank">
          ${data.shortUrl}
        </a>
      `;
    } else {
      result.innerText = "Unable to generate short URL";
    }
  } catch (error) {
    result.innerText = "Server error. Please try again.";
  }
}
