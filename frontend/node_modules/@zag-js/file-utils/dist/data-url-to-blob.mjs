// src/data-url-to-blob.ts
function dataURItoBlob(uri) {
  const binary = atob(uri.split(",")[1]);
  const mimeString = uri.split(",")[0].split(":")[1].split(";")[0];
  const buffer = new ArrayBuffer(binary.length);
  const intArray = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    intArray[i] = binary.charCodeAt(i);
  }
  return new Blob([buffer], { type: mimeString });
}
export {
  dataURItoBlob
};
