// ==UserScript==
// @name        Studydrive Downloader
// @namespace   Violentmonkey Scripts
// @match       https://www.studydrive.net/*/doc/*
// @grant       GM_xmlhttpRequest
// @grant       GM_download
// @version     1.2.3
// @author      steffanossa & abrorkhon02
// @license     MIT
// @description Stellt die Downloadmöglichkeit für Dokumente wieder her.
// @downloadURL https://update.greasyfork.org/scripts/474780/Studydrive%20Downloader.user.js
// @updateURL https://update.greasyfork.org/scripts/474780/Studydrive%20Downloader.meta.js
// ==/UserScript==

(function () {
  let fileURL, fileName, fileData;

  // Use GM_xmlhttpRequest instead of fetch to bypass CORS
  GM_xmlhttpRequest({
    method: "GET",
    url: document.location.href,
    onload: function (response) {
      let pageContent = response.responseText;

      let fileNameMatch = /display_file_name":"(.*?)"/.exec(pageContent);
      let urlMatch = /file_preview":"(.*?)"/.exec(pageContent);

      if (!fileNameMatch || !urlMatch) {
        console.error("Failed to extract file information");
        return;
      }

      fileName = fileNameMatch[1];
      let url = urlMatch[1].replace("\\", "");

      console.log("Extracted URL:", url);
      console.log("Extracted fileName:", fileName);

      // Fetch the actual file
      GM_xmlhttpRequest({
        method: "GET",
        url: url,
        responseType: "arraybuffer",
        onload: function (fileResponse) {
          fileData = fileResponse.response;
          fileURL = URL.createObjectURL(
            new Blob([fileData], { type: "application/pdf" })
          );

          console.log("File data fetched successfully");
          createOverlayButton();
        },
        onerror: function (error) {
          console.error("Error fetching file:", error);
        },
      });
    },
    onerror: function (error) {
      console.error("Error fetching page:", error);
    },
  });

  function createOverlayButton() {
    let newButton = document.createElement("div");
    newButton.innerHTML = "StudyDownloader";
    newButton.id = "studydownloader-btn";

    // Style the button
    newButton.style.position = "fixed";
    newButton.style.bottom = "20px";
    newButton.style.right = "20px";
    newButton.style.padding = "10px 20px";
    newButton.style.background = "linear-gradient(45deg, #38a7fb, #3885fb)";
    newButton.style.color = "white";
    newButton.style.borderRadius = "25px";
    newButton.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    newButton.style.cursor = "pointer";
    newButton.style.fontWeight = "bold";
    newButton.style.zIndex = "9999";
    newButton.style.transition = "all 0.3s ease";
    newButton.onmouseover = function () {
      this.style.transform = "translateY(-2px)";
      this.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.15)";
    };
    newButton.onmouseout = function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    };

    newButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Button clicked");
      if (fileData && fileName) {
        console.log("Attempting download with:", fileName);
        downloadFile();
      } else {
        console.error("File data or name not available");
      }
    });

    document.body.appendChild(newButton);
    console.log("Overlay download button added successfully");
  }

  // Function to trigger file download
  function downloadFile() {
    console.log("downloadFile called");
    // Ensure the filename ends with .pdf
    let finalFileName = fileName.toLowerCase().endsWith(".pdf")
      ? fileName
      : fileName + ".pdf";
    GM_download({
      url: URL.createObjectURL(
        new Blob([fileData], { type: "application/pdf" })
      ),
      name: finalFileName,
      onload: () => console.log("Download completed successfully"),
      onerror: (error) => console.error("Download failed:", error),
    });
  }
})();
