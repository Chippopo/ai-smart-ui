// export async function requestCnnPalette({
//   formInput,
//   imageFile,
//   endpoint = "http://127.0.0.1:8000/generate-cnn",
// }) {
//   if (!imageFile) {
//     throw new Error("Please upload a UI screenshot/image for CNN inference.");
//   }

//   const form = new FormData();
//   form.append("image", imageFile);
//   form.append("layout_target", formInput?.layout_target || "website");
//   form.append("layout_style", formInput?.layout_style || "z-shape");
//   form.append("industry", formInput?.industry || "fintech");
//   form.append("emotion", formInput?.emotion || "professional");

//   const res = await fetch(endpoint, {
//     method: "POST",
//     body: form,
//   });

//   if (!res.ok) {
//     let detail = "CNN request failed.";
//     try {
//       const json = await res.json();
//       detail = json?.detail || detail;
//     } catch {
//       // ignore json parsing error
//     }
//     throw new Error(detail);
//   }

//   const data = await res.json();
//   const palette = Array.isArray(data?.palette) ? data.palette : [];
//   if (!palette.length) {
//     throw new Error("CNN API returned an empty palette.");
//   }
//   return palette;
// }
