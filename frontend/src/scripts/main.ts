// Upload Button
const upload = document.getElementById("upload-button") as HTMLButtonElement;
const fileInput = document.getElementById("ifc-upload") as HTMLInputElement;

upload.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    console.log(fileInput.files);
    if (file) {
        const formData = new FormData();
        formData.append("file", file);

        console.log("FormData file:", formData.get("file"));

        try {
            const uploadResponse = await fetch(
                `http://localhost:3000/api/ifc/uploads`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!uploadResponse.ok) {
                throw new Error("Upload failed: " + uploadResponse.statusText);
            }

            const uploadResult = await uploadResponse.json();
            console.log("Upload result:", uploadResult);
            console.log(uploadResult.filename);
            const fileName = uploadResult.filename;

            console.log(fileName);

            // const fileURL = `${import.meta.env.VITE_BASE_URL}/src/views/viewer.html?filename=${fileName}`;
            const fileURL = `http://localhost:5173/src/views/viewer.html?filename=${fileName}`;
            console.log("File URL: ", fileURL);

            const ifcLink = document.getElementById(
                "ifc-link"
            ) as HTMLAnchorElement;
            const ifcIframe = document.getElementById(
                "ifc-iframe"
            ) as HTMLIFrameElement;
            const ifcTextarea = document.getElementById(
                "ifc-textarea"
            ) as HTMLTextAreaElement;

            if (fileURL) {
                ifcLink.href = fileURL;
                ifcLink.style.display = "block";
                ifcLink.innerText = fileURL;

                ifcIframe.src = fileURL; // Jika Anda ingin menampilkan file di iframe, pastikan file tersebut dapat ditampilkan
                ifcIframe.style.display = "block";

                ifcTextarea.value = `<iframe id="ifc-iframe" src="${fileURL}" style="width: 600px; height: 400px; border: 1px solid #ccc;"></iframe>`;
                ifcTextarea.style.display = "block";
            }
        } catch (error) {
            console.error("File upload failed:", error);
        }
    }
});
